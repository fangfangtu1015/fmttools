/**
 * Base64 engine implementing RFC 4648 §4 (standard) and §5 (URL and filename
 * safe alphabet), with canonical-form checks, magic-byte sniffing, JWT and
 * data: URI awareness. All work is done on Uint8Array in the browser.
 */

const STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

export type Base64Variant = 'standard' | 'url'

export type EncodeOptions = {
  variant?: Base64Variant
  padding?: boolean
  lineLength?: number
  input?: 'utf8' | 'latin1' | 'hex'
}

export type EncodedResult = {
  ok: boolean
  output: string
  bytes: number
  characters: number
  overheadPercent: number
  groups: number
  paddedChars: number
  warnings: string[]
}

export type DecodeIssue = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  hint?: string
  position?: number
}

export type DecodedResult = {
  ok: boolean
  bytes: Uint8Array | null
  text: string | null
  isText: boolean
  hexPreview: string
  issues: DecodeIssue[]
  variant: Base64Variant
  decodedSize: number
  encodedSize: number
  overheadPercent: number
  roundTrips: boolean
  mime: { extension: string; label: string; mime: string } | null
  jwt: JwtDecoded | null
  dataUri: DataUriDecoded | null
  pem: { label: string; derBytes: number } | null
}

const SIGNATURES: { hex: string; mime: string; extension: string; label: string }[] = [
  { hex: '89504e47', mime: 'image/png', extension: 'png', label: 'PNG image' },
  { hex: 'ffd8ff', mime: 'image/jpeg', extension: 'jpg', label: 'JPEG image' },
  { hex: '47494638', mime: 'image/gif', extension: 'gif', label: 'GIF image' },
  { hex: '52494646', mime: 'image/webp', extension: 'webp', label: 'RIFF container (WAV / AVI / WebP)' },
  { hex: '504b0304', mime: 'application/zip', extension: 'zip', label: 'ZIP archive (also DOCX, XLSX, APK, EPUB)' },
  { hex: '1f8b', mime: 'application/gzip', extension: 'gz', label: 'gzip stream' },
  { hex: '255044462d', mime: 'application/pdf', extension: 'pdf', label: 'PDF document' },
  { hex: '7f454c46', mime: 'application/x-elf', extension: 'elf', label: 'ELF executable' },
  { hex: '4d5a', mime: 'application/x-msdownload', extension: 'exe', label: 'Windows PE executable' },
  { hex: '424d', mime: 'image/bmp', extension: 'bmp', label: 'Bitmap image' },
  { hex: '7b22', mime: 'application/json', extension: 'json', label: 'Text that starts with {" — likely JSON' },
  { hex: '3c', mime: 'text/xml', extension: 'xml', label: 'Text that starts with "<" — likely XML or HTML' },
  { hex: '4f676353', mime: 'audio/ogg', extension: 'ogg', label: 'Ogg stream' },
  { hex: '000001', mime: 'video/mp4', extension: 'mp4', label: 'MPEG transport stream' },
  { hex: '66747970', mime: 'video/mp4', extension: 'mp4', label: 'MP4 (ftyp box at offset 4)' },
  { hex: '52617221', mime: 'application/x-rar-compressed', extension: 'rar', label: 'RAR archive' },
  { hex: '13e45a8d', mime: 'application/octet-stream', extension: 'cbr', label: 'SQLite 3 database' },
]

function toHex(bytes: Uint8Array) {
  let out = ''
  for (const b of bytes) out += b.toString(16).padStart(2, '0')
  return out
}

export function bytesToHexDump(bytes: Uint8Array, maxBytes = 256) {
  const slice = bytes.subarray(0, maxBytes)
  const rows: string[] = []
  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.subarray(i, Math.min(i + 16, slice.length))
    const hex = Array.from(chunk)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ')
      .padEnd(47, ' ')
    const ascii = Array.from(chunk)
      .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.'))
      .join('')
    rows.push(`${i.toString(16).padStart(8, '0')}  ${hex}  |${ascii}|`)
  }
  if (bytes.length > maxBytes) rows.push(`… ${bytes.length - maxBytes} more bytes`)
  return rows.join('\n')
}

function utf8DecodeStrict(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

export function encodeBase64(input: string, options: EncodeOptions = {}): EncodedResult {
  const variant = options.variant ?? 'standard'
  const padding = options.padding ?? true
  const lineLength = options.lineLength ?? 0
  const alphabet = variant === 'url' ? URL_ALPHABET : STANDARD_ALPHABET
  const warnings: string[] = []
  let bytes: Uint8Array

  if (options.input === 'hex') {
    const clean = input.replace(/[\s:]/g, '')
    if (!/^[0-9a-fA-F]*$/.test(clean)) {
      return { ok: false, output: '', bytes: 0, characters: 0, overheadPercent: 0, groups: 0, paddedChars: 0, warnings: ['Hex input may only contain 0-9, a-f, A-F and spaces.'] }
    }
    if (clean.length % 2 !== 0) {
      return { ok: false, output: '', bytes: 0, characters: 0, overheadPercent: 0, groups: 0, paddedChars: 0, warnings: ['Hex input must have an even number of digits — the trailing nibble would be dropped.'] }
    }
    bytes = new Uint8Array(clean.length / 2)
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  } else if (options.input === 'latin1') {
    bytes = Uint8Array.from([...input].map((c) => c.codePointAt(0)! & 0xff))
    if ([...input].some((c) => (c.codePointAt(0) ?? 0) > 0xff))
      warnings.push('At least one character is above U+00FF, so it cannot be represented by a single byte in latin-1; the low 8 bits were used. Choose UTF-8 unless you really mean raw bytes.')
  } else {
    bytes = new TextEncoder().encode(input)
  }

  let output = ''
  let groups = 0
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = bytes[i + 1]
    const b2 = bytes[i + 2]
    const chunk = (b0 << 16) | ((b1 ?? 0) << 8) | (b2 ?? 0)
    let quad = alphabet[(chunk >> 18) & 63] + alphabet[(chunk >> 12) & 63]
    if (b1 === undefined) quad += padding ? '==' : ''
    else if (b2 === undefined) quad += alphabet[(chunk >> 6) & 63] + (padding ? '=' : '')
    else quad += alphabet[(chunk >> 6) & 63] + alphabet[chunk & 63]
    groups++
    output += quad
  }

  if (lineLength > 0 && output.length > lineLength) {
    const wrapped: string[] = []
    for (let i = 0; i < output.length; i += lineLength) wrapped.push(output.slice(i, i + lineLength))
    output = wrapped.join('\n')
  }

  if (variant === 'url' && padding) warnings.push('base64url normally omits padding: RFC 4648 §5 defines the URL- and filename-safe alphabet without the "=" step, and RFC 7515 §2 repeats it for JWS. Keeping "=" is valid text but a JWT library will not expect it.')
  if (lineLength > 0 && variant === 'url') warnings.push('Line wrapping belongs to MIME (RFC 2045 uses 76 characters) and PEM; base64url payloads such as JWT segments must stay on one line.')

  const characters = output.replace(/\n/g, '').length
  return {
    ok: true,
    output,
    bytes: bytes.length,
    characters,
    overheadPercent: bytes.length === 0 ? 0 : Math.round((characters / bytes.length - 1) * 1000) / 10,
    groups,
    paddedChars: (output.match(/=/g) ?? []).length,
    warnings,
  }
}

export function decodeBase64(input: string, options: { variant?: 'auto' | Base64Variant; strict?: boolean; allowNewlines?: boolean } = {}): DecodedResult {
  const issues: DecodeIssue[] = []
  let working = input
  const wasUrl = /[-_]/.test(working) && ![...STANDARD_ALPHABET].some((c) => working.includes(c))
  const variant: Base64Variant = options.variant && options.variant !== 'auto' ? options.variant : wasUrl ? 'url' : 'standard'
  const alphabet = variant === 'url' ? URL_ALPHABET : STANDARD_ALPHABET

  const jwt = looksLikeJwt(working) ? decodeJwt(working, issues) : null
  const dataUri = /^data:/i.test(working.trim()) ? decodeDataUri(working.trim(), issues) : null
  const pem = /-----BEGIN [^-]+-----/.test(working) ? decodePem(working, issues) : null

  let source = pem?.payload ?? dataUri?.payload ?? working
  const whitespace = (source.match(/[\s]/g) ?? []).length
  if (whitespace > 0) {
    if (options.allowNewlines === false)
      issues.push({ severity: 'error', code: 'whitespace', message: `${whitespace} whitespace characters found and strict mode is on.` })
    else
      issues.push({ severity: 'info', code: 'whitespace', message: `${whitespace} whitespace characters ignored.`, hint: 'MIME (RFC 2045) and PEM wrap base64 at 76 and 64 characters, and JSON web keys are often pretty-printed. Decoders must drop whitespace — but it is not part of the data, which is why "is this the same blob" comparisons must normalise first.' })
    source = source.replace(/[\s]/g, '')
  }

  const urlish = variant === 'url' || /[-_]/.test(source)
  if (urlish && variant === 'standard') {
    source = source.replace(/-/g, '+').replace(/_/g, '/')
    issues.push({ severity: 'info', code: 'base64url-normalised', message: 'The value uses - and _, so it was mapped to the standard alphabet before decoding.', hint: 'RFC 4648 §5 replaces the two alphabet characters that are unsafe in URLs and file names: 62 becomes "-" and 63 becomes "_". The bit packing is otherwise identical.' })
  }
  const plusAsSlash = source.includes('+') && variant === 'url'
  if (plusAsSlash) issues.push({ severity: 'warning', code: 'plus-in-url-safe', message: 'A "+" appeared in a base64url value.', hint: 'Either the payload is really standard base64, or the "+" came from a query string where it decodes to a space. That substitution is the most common cause of a JWT or cookie failing to verify after a round trip through a URL.' })

  const invalid = new Map<string, number>()
  for (const ch of source) {
    if (!alphabet.includes(ch) && ch !== '=') invalid.set(ch, (invalid.get(ch) ?? 0) + 1)
  }
  if (invalid.size > 0) {
    const list = [...invalid.entries()].map(([c, n]) => `${JSON.stringify(c)} ×${n}`).join(', ')
    issues.push({
      severity: 'error',
      code: 'invalid-character',
      message: `Not a base64 character: ${list}`,
      hint: 'RFC 4648 §4 gives the base 64 alphabet: A–Z, a–z, 0–9 and two further symbols, with "=" padding described in §3.2 and §3.3 telling a reader how to treat anything outside the table. A character off the alphabet is always a sign of a copy/paste truncation, a URL-decoded "+" turning into a space, or text that was never base64 at all.',
      position: source.search(new RegExp(`[^${variant === 'url' ? 'A-Za-z0-9\\-_' : 'A-Za-z0-9+/='}]`)),
    })
  }

  const padCount = (source.match(/=/g) ?? []).length
  if (/=.*[^=]/.test(source))
    issues.push({ severity: 'error', code: 'padding-in-middle', message: 'A "=" appears before other characters.', hint: 'Padding is only legal as the final one or two characters. A "=" in the middle means the value was concatenated or truncated.' })
  if (padCount > 2)
    issues.push({ severity: 'error', code: 'too-much-padding', message: `${padCount} padding characters is impossible.`, hint: 'Each group of 4 characters decodes to 3 bytes, so at most 2 padding characters are ever needed. More than that means the length is wrong.' })

  const lengthError = source.replace(/=+$/, '').length % 4
  if (source.length % 4 === 1 || lengthError === 1)
    issues.push({
      severity: 'error',
      code: 'bad-length',
      message: `The payload is ${source.length} characters, and length ≡ 1 (mod 4) can never be valid base64.`,
      hint: 'A 4-character group holds 6 bits per character, so a remainder of 1 would need 6 bits to carry only 8 bits of data. Real-world cause: a "+" was read as a space and then stripped, or one character was lost when copying from a log.',
    })

  const bytes = new Uint8Array(Math.floor((source.length * 6) / 8))
  let buffer = 0
  let bits = 0
  let index = 0
  let nonCanonical = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (ch === '=') break
    const value = alphabet.indexOf(ch)
    if (value < 0) continue
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      const byte = (buffer >> bits) & 0xff
      bytes[index++] = byte
    }
  }
  if (bits > 0 && (buffer & ((1 << bits) - 1)) !== 0) nonCanonical = true
  const actual = bytes.subarray(0, index)

  if (nonCanonical)
    issues.push({
      severity: 'warning',
      code: 'non-canonical',
      message: 'The last symbol carries leftover bits that are not zero.',
      hint: 'RFC 4648 §3.5 says the unused trailing bits MUST be set to zero on output, and that implementations may check this on input. Non-canonical encodings decode to the same bytes but can bypass signature or hash checks and are a known way to smuggle data through "is this base64" filters.',
      position: source.length - 1,
    })

  const text = utf8DecodeStrict(actual)
  const printable = text === null ? 0 : [...text].filter((c) => c.charCodeAt(0) >= 0x20 || c === '\n' || c === '\t' || c === '\r').length
  const isText = text !== null && printable >= text.length * 0.9
  if (text === null && actual.length > 0)
    issues.push({
      severity: 'info',
      code: 'not-utf8',
      message: 'The decoded bytes are not valid UTF-8, so this is binary data rather than text.',
      hint: 'Base64 is a binary-to-text wrapper: whatever was encoded first — an image, a compressed archive, a key, or text in another charset. A string decoder will not recover it as characters, and treating those bytes as latin-1 silently "works" while corrupting them.',
    })

  const hex = toHex(actual)
  const mime = SIGNATURES.find((s) => hex.startsWith(s.hex)) ?? null
  if (mime)
    issues.push({ severity: 'info', code: 'magic-bytes', message: `Magic bytes match: ${mime.label} (${mime.extension}).`, hint: 'Identified from the leading bytes, so it holds even if the file extension or the declared MIME type is wrong. Always check the real content type before writing a decoded upload to disk.' })

  const roundTrips = encodeBase64(toHex(actual), { input: 'hex', variant, padding: padCount > 0 }).output.replace(/\n/g, '') === source

  return {
    ok: !issues.some((i) => i.severity === 'error'),
    bytes: actual,
    text: isText ? text : null,
    isText,
    hexPreview: bytesToHexDump(actual),
    issues,
    variant,
    decodedSize: actual.length,
    encodedSize: source.length,
    overheadPercent: actual.length === 0 ? 0 : Math.round((source.length / actual.length - 1) * 1000) / 10,
    roundTrips,
    mime: mime ? { extension: mime.extension, label: mime.label, mime: mime.mime } : null,
    jwt,
    dataUri,
    pem: pem ? { label: pem.label, derBytes: pem.derBytes } : null,
  }
}

function looksLikeJwt(value: string) {
  return /^[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*$/.test(value.trim())
}

export type JwtDecoded = {
  header: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  signatureBytes: number
  headerText: string
  payloadText: string
  claims: { name: string; label: string; value: string; note?: string }[]
  warnings: string[]
}

function decodeJwt(token: string, issues: DecodeIssue[]): JwtDecoded | null {
  const [h, p, s] = token.trim().split('.')
  if (!h || !p) return null
  const decodeSegment = (segment: string) => {
    const result = decodeBase64(segment, { variant: 'url' })
    if (!result.ok || !result.text) return null
    try {
      return JSON.parse(result.text) as Record<string, unknown>
    } catch {
      return null
    }
  }
  const header = decodeSegment(h)
  const payload = decodeSegment(p)
  if (!header && !payload) return null
  const warnings: string[] = []
  const signatureBytes = s ? Math.floor((s.length * 6) / 8) : 0
  if (!s || s === '') warnings.push('There is no signature segment, so nothing proves where this token came from.')
  if (header?.alg === 'none' || header?.alg === undefined)
    warnings.push('alg is "none"/absent. A verifier that accepts this algorithm treats any signature as valid, which is the original JWT bypass class (CVE-2015-9235 era). Reject "none" explicitly in verifier code.')
  if (header?.alg === 'HS256' && typeof header.kid === 'string')
    warnings.push('A MAC algorithm with a kid header invites key-confusion attacks if the server looks the key up from an attacker-influenced value.')
  const now = Math.floor(Date.now() / 1000)
  const claims: JwtDecoded['claims'] = []
  const describe = (name: string, label: string) => {
    const raw = payload?.[name]
    if (typeof raw !== 'number') return
    const seconds = raw > 4102444800 ? Math.floor(raw / 1000) : raw
    const date = new Date(seconds * 1000)
    let note: string | undefined
    if (name === 'exp') note = seconds < now ? `Expired ${formatAgo(now - seconds)} ago — the token is no longer valid.` : `Still valid for ${formatAgo(seconds - now)}.`
    if (name === 'nbf') note = seconds > now ? `Not usable for another ${formatAgo(seconds - now)}.` : 'Already active.'
    if (name === 'iat') note = seconds > now + 120 ? 'Issued in the future: usually a clock drift or a millisecond/second unit mix-up.' : undefined
    claims.push({ name, label, value: `${date.toISOString()}  (${seconds})`, note })
  }
  describe('exp', 'Expiry time')
  describe('iat', 'Issued at')
  describe('nbf', 'Not before')
  for (const name of ['iss', 'aud', 'sub', 'jti']) {
    const raw = payload?.[name]
    if (typeof raw === 'string') claims.push({ name, label: CLAIM_LABELS[name], value: raw })
  }
  if (payload && !('exp' in payload)) warnings.push('The payload has no "exp" claim, so this token never expires unless the server adds its own cutoff.')
  if (payload && typeof payload.sub === 'string' && payload.sub.length > 255) warnings.push('The "sub" claim is longer than the 255 ASCII character limit RFC 7519 §4.1.2 recommends.')
  if (token.length > 5000) warnings.push('This token is over 5 KB. RFC 7519 §6.1 warns implementations must handle at least 281 bytes and browsers drop URLs over roughly 8 KB, so JWTs do not belong in query strings or cookies at this size.')
  issues.push({ severity: 'info', code: 'jwt-detected', message: 'Recognised as a JSON Web Token (three base64url segments separated by ".").', hint: 'The segments are readable, not secret: base64 is encoding, not encryption, so never put passwords or tokens you consider private in a JWT payload. Signature verification is the only thing that proves authenticity, and this tool does not verify it.' })
  return {
    header,
    payload,
    signatureBytes,
    headerText: JSON.stringify(header, null, 2),
    payloadText: JSON.stringify(payload, null, 2),
    claims,
    warnings,
  }
}

const CLAIM_LABELS: Record<string, string> = {
  iss: 'Issuer',
  aud: 'Audience',
  sub: 'Subject',
  jti: 'JWT ID',
}

function formatAgo(seconds: number) {
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [size, label] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size)
      return `${n} ${label}${n > 1 ? 's' : ''}`
    }
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`
}

export type DataUriDecoded = {
  mime: string
  base64: boolean
  payload: string
  charset?: string
  decodedBytes?: number
  rawText?: string
  isImage: boolean
}

function decodeDataUri(value: string, issues: DecodeIssue[]): DataUriDecoded | null {
  const match = /^data:([^;,]*)?((?:;[^,]*)?),(.*)$/s.exec(value)
  if (!match) {
    issues.push({ severity: 'error', code: 'bad-data-uri', message: 'A data: URL must look like data:[<mime>][;base64],<data>.', hint: 'RFC 2397 defines the syntax; RFC 3986 §6.1 covers the percent-encoded non-base64 form.' })
    return null
  }
  const [, mime, params, data] = match
  const base64 = /;base64$/i.test(params)
  issues.push({
    severity: 'info',
    code: 'data-uri',
    message: `Parsed as a data: URL (${base64 ? 'base64' : 'percent-encoded'} form, MIME type "${mime || 'defaults to text/plain;charset=US-ASCII'}").`,
    hint: 'RFC 2397 §3 makes an omitted media type default to text/plain; browsers given an SVG data URI in an <img> run it without scripting, but the same SVG loaded as a document can execute. Inline assets also cost about 33% more bytes than the raw file and cannot be cached separately.',
  })
  return { mime: mime || 'text/plain', base64, payload: data, charset: /charset=([^;]+)/i.exec(params)?.[1], isImage: /^image\//.test(mime) }
}

function decodePem(value: string, issues: DecodeIssue[]): { payload: string; label: string; derBytes: number } | null {
  const match = /-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/.exec(value)
  if (!match) return null
  const label = match[1].trim()
  const payload = match[2]
  const derBytes = Math.floor((payload.replace(/[\s]/g, '').length * 6) / 8)
  issues.push({
    severity: 'info',
    code: 'pem',
    message: `PEM block detected: "${label}" (${derBytes} bytes of DER inside).`,
    hint: 'PEM (RFC 7468) is base64 with header and footer lines plus a label; the wrapped bytes are DER-encoded ASN.1. Line breaks are part of the transport format, not the data, which is why a "diff" of two PEM files can look different while the key is identical.',
  })
  return { payload, label, derBytes }
}

export function base64LengthOf(byteLength: number, padding = true) {
  const groups = Math.ceil(byteLength / 3)
  return padding ? groups * 4 : Math.ceil((byteLength * 8) / 6)
}
