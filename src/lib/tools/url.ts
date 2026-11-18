/**
 * Percent-encoding engine for RFC 3986 §2 (reserved/unreserved characters and
 * the %HH escape) plus application/x-www-form-urlencoded, with canonicalisation
 * and a URL structure inspector.
 */

export type EncodeMode = 'component' | 'path' | 'query-value' | 'uri' | 'form'

export type EncodeIssue = {
  severity: 'info' | 'warning'
  code: string
  message: string
  hint?: string
}

export type EncodeResult = {
  output: string
  originalLength: number
  encodedLength: number
  escapes: number
  bytesEncoded: number
  issues: EncodeIssue[]
}

const UNRESERVED = /[A-Za-z0-9\-._~]/
const SAFE_BY_MODE: Record<EncodeMode, RegExp> = {
  // encodeURIComponent keeps A-Z a-z 0-9 - _ . ! ~ * ' ( )
  component: /[A-Za-z0-9\-._!~*'()]/,
  // A path segment may keep the sub-delims and "/" but not "?", "#", "%".
  path: /[A-Za-z0-9\-._~!$&'()*+,;=:@/]/,
  // A query value keeps "/" and "?" but must not keep "&", "=", "+", "#".
  'query-value': /[A-Za-z0-9\-._~!$'()*;,/?@:]/,
  // A whole URI keeps every reserved delimiter defined in RFC 3986 §2.2.
  uri: /[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]/,
  // HTML form serialization: only alphanumerics plus "-._*" stay literal.
  form: /[A-Za-z0-9\-._*]/,
}

const EXCLUDED = /[<>""{}|\\\^\[\]`% ]/

function byteLengthOf(codePoint: number) {
  if (codePoint <= 0x7f) return 1
  if (codePoint <= 0x7ff) return 2
  if (codePoint <= 0xffff) return 3
  return 4
}

function hexEscape(codePoint: number, uppercase: boolean) {
  const bytes: number[] = []
  if (codePoint <= 0x7f) bytes.push(codePoint)
  else if (codePoint <= 0x7ff) bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
  else if (codePoint <= 0xffff) bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f))
  else
    bytes.push(
      0xf0 | (codePoint >> 18),
      0x80 | ((codePoint >> 12) & 0x3f),
      0x80 | ((codePoint >> 6) & 0x3f),
      0x80 | (codePoint & 0x3f),
    )
  return bytes.map((b) => (uppercase ? `%${b.toString(16).toUpperCase().padStart(2, '0')}` : `%${b.toString(16).padStart(2, '0')}`)).join('')
}

export function percentEncode(input: string, mode: EncodeMode = 'component', uppercase = true): EncodeResult {
  const issues: EncodeIssue[] = []
  const safe = SAFE_BY_MODE[mode]
  let output = ''
  let escapes = 0
  let bytesEncoded = 0
  for (const ch of input) {
    const cp = ch.codePointAt(0)!
    if (mode === 'form' && cp === 0x20) {
      output += '+'
      escapes++
      bytesEncoded += 1
      continue
    }
    if (cp === 0x25 && mode !== 'uri') {
      output += uppercase ? '%25' : '%25'
      escapes++
      bytesEncoded++
      continue
    }
    if (cp === 0x25) {
      output += '%'
      continue
    }
    if (cp === 0x2b && (mode === 'query-value' || mode === 'form')) {
      output += uppercase ? '%2B' : '%2b'
      escapes++
      bytesEncoded++
      continue
    }
    if (cp <= 0x7f && safe.test(ch)) {
      output += ch
      continue
    }
    if (cp <= 0x7f && EXCLUDED.test(ch) && mode === 'uri') {
      output += hexEscape(cp, uppercase)
      escapes++
      bytesEncoded++
      continue
    }
    if (cp <= 0x7f && mode === 'uri' && safe.test(ch)) {
      output += ch
      continue
    }
    const esc = hexEscape(cp, uppercase)
    output += esc
    escapes++
    bytesEncoded += byteLengthOf(cp)
  }

  if (/[\u0080-\uFFFF]/.test(input))
    issues.push({
      severity: 'info',
      code: 'non-ascii',
      message: 'Non-ASCII characters were encoded as UTF-8 byte sequences.',
      hint: 'RFC 3986 §2.5 only allows percent-encoded octets to stand for characters whose encoding is known, and §7.2 says the encoding must be UTF-8 unless another protocol states otherwise. Windows-1252 or Shift-JIS payloads produce the same % escapes with different numbers, which is why "mojibake" URLs happen when the two sides disagree.',
    })
  if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(input))
    issues.push({
      severity: 'info',
      code: 'surrogate-pair',
      message: 'Astral characters (emoji and some CJK ideographs) became four %-escapes from a surrogate pair.',
      hint: 'Encoding half a surrogate pair yields an invalid UTF-8 sequence that servers reject with 400. Iterate by code point, never by UTF-16 unit.',
    })
  if (mode === 'query-value' && /[&=]/.test(input))
    issues.push({
      severity: 'info',
      code: 'delimiter-conflict',
      message: 'The value contained "&" or "=", which are the query delimiters, so both were escaped.',
      hint: 'Leaving them raw is the classic injection bug: a value carrying "&admin=1" adds a parameter the server never intended to receive.',
    })
  if (mode === 'component' && /\//.test(input))
    issues.push({ severity: 'info', code: 'slash-encoded', message: '"/" was escaped to %2F because component mode treats the whole string as one path segment.', hint: 'Some web servers and WAFs reject %2F in a path (IIS and Apache both normalise it before routing), so route-style values sometimes must stay unescaped — encode each segment separately instead.' })
  if (/^\s|\s$/.test(input))
    issues.push({ severity: 'warning', code: 'edge-whitespace', message: 'The input starts or ends with whitespace.', hint: 'Browsers trim leading/trailing C0 controls and space when parsing a URL (RFC 3986 §2.4.2), so a space in the middle is %20 but at the edges it simply disappears.' })

  return {
    output,
    originalLength: input.length,
    encodedLength: output.length,
    escapes,
    bytesEncoded,
    issues,
  }
}

export type DecodeIssue = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  hint?: string
}

export type DecodeResult = {
  ok: boolean
  output: string
  issues: DecodeIssue[]
  escapes: number
  doubleEncoded: boolean
  canBeNormalised: boolean
}

export function percentDecode(input: string, options: { plusAsSpace?: boolean; strict?: boolean } = {}): DecodeResult {
  const issues: DecodeIssue[] = []
  const plusAsSpace = options.plusAsSpace ?? false
  let output = ''
  let escapes = 0
  let invalid = 0
  let lowercase = 0
  let unreserved = 0

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '+' && plusAsSpace) {
      output += ' '
      continue
    }
    if (ch !== '%') {
      output += ch
      continue
    }
    const hex = input.slice(i + 1, i + 3)
    if (!/^[0-9A-Fa-f]{2}$/.test(hex)) {
      invalid++
      if (options.strict) {
        issues.push({
          severity: 'error',
          code: 'bad-escape',
          message: `Invalid percent-encoding "${input.slice(i, i + 3)}" at offset ${i}.`,
          hint: 'RFC 3986 §2.1 defines an escape as "%" followed by two HEXDIG. A lone "%" (a 100% sign typed raw into a URL) or "%zz" is not decodable, so strict servers answer 400 while lenient ones pass the text through.',
        })
        output += input[i]
        continue
      }
      issues.push({
        severity: 'warning',
        code: 'bad-escape',
        message: `Invalid percent-encoding "${input.slice(i, i + 3)}" at offset ${i} was passed through literally.`,
        hint: 'A "%" that is not followed by two hex digits means the sender never escaped its own data, so a "%" typed as a percent sign survives decoding as a "%".',
      })
      output += ch
      continue
    }
    escapes++
    if (/[a-f]/.test(hex)) lowercase++
    const byte = parseInt(hex, 16)
    const char = String.fromCharCode(byte)
    if (byte <= 0x7f && UNRESERVED.test(char)) unreserved++
    if (byte === 0x25) {
      // decoded to "%" — a strong sign the payload was encoded twice
      issues.push({
        severity: 'warning',
        code: 'double-encoded',
        message: `%${hex} decodes to "%", so the text has probably been percent-encoded twice.`,
        hint: 'Encoding "%20" again gives "%2520". Applications that decode once and then split on "&" see the wrong values, and one extra decode is a normalisation trick that slips past naive pattern filters.',
      })
    }
    if (byte === 0x2b) output += '+'
    else output += char
    i += 2
  }

  // Reinterpret the produced string as UTF-8 when it contains high octets.
  let decoded = output
  if (/[\u0080-\u00ff]/.test(output)) {
    const bytes = Uint8Array.from([...output].map((c) => c.charCodeAt(0) & 0xff))
    const asUtf8 = utf8(bytes)
    if (asUtf8 !== null) decoded = asUtf8
    else
      issues.push({
        severity: 'warning',
        code: 'invalid-utf8',
        message: 'The decoded octets are not a valid UTF-8 sequence.',
        hint: 'Either the sender used a different charset (Windows-1252 is the common one) or the escapes were cut. Replace-with-"?" decoding hides the corruption instead of reporting it.',
      })
  }

  if (lowercase > 0)
    issues.push({
      severity: 'info',
      code: 'lowercase-hex',
      message: `${lowercase} escape${lowercase > 1 ? 's' : ''} used lowercase hex digits.`,
      hint: 'The hex digits are case-insensitive (§2.4 says "%2f" and "%2F" mean the same octet), but §6.2.2.1 recommends uppercase so that identical URLs compare equal and caches hit once.',
    })
  if (unreserved > 0)
    issues.push({
      severity: 'info',
      code: 'over-encoded',
      message: `${unreserved} escape${unreserved > 1 ? 's' : ''} stand for unreserved characters and can be written literally.`,
      hint: 'RFC 3986 §2.3: unreserved characters MUST NOT be percent-encoded, because "%41" and "A" are equivalent URIs but not equivalent strings. Normalising them makes deduplication and signature checks reliable.',
    })

  return {
    ok: !issues.some((i) => i.severity === 'error'),
    output: decoded,
    issues,
    escapes,
    doubleEncoded: issues.some((i) => i.code === 'double-encoded'),
    canBeNormalised: lowercase > 0 || unreserved > 0,
  }
}

function utf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

/** Uppercase hex digits, decode unreserved escapes: the RFC 3986 §6.2.2.1 form. */
export function normalisePercentEncoding(input: string) {
  let output = ''
  let changed = 0
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '%') {
      const hex = input.slice(i + 1, i + 3)
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        const upper = hex.toUpperCase()
        const byte = parseInt(upper, 16)
        const char = String.fromCharCode(byte)
        if (byte <= 0x7f && UNRESERVED.test(char)) {
          output += char
          changed++
        } else {
          if (upper !== hex) changed++
          output += `%${upper}`
        }
        i += 2
        continue
      }
    }
    output += ch
  }
  return { output, changed }
}

export type UrlPart = { name: string; value: string; note?: string }
export type QueryParam = { key: string; value: string; raw: string; decodedKey: string; decodedValue: string; repeated: boolean }

export type UrlAnalysis = {
  ok: boolean
  parts: UrlPart[]
  params: QueryParam[]
  issues: DecodeIssue[]
  browserResolved: string | null
  arrayKeys: string[]
  longestChain: number
}

const URI_REGEX = /^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/

export function analyseUrl(input: string): UrlAnalysis {
  const issues: DecodeIssue[] = []
  const value = input.trim()
  const match = URI_REGEX.exec(value)
  const scheme = match?.[1] ?? ''
  const authority = match?.[2] ?? ''
  const path = match?.[3] ?? ''
  const query = match?.[4]
  const fragment = match?.[5]
  const parts: UrlPart[] = []
  const params: QueryParam[] = []
  const arrayKeys: string[] = []

  if (!match) return { ok: false, parts: [], params: [], issues: [{ severity: 'error', code: 'unparseable', message: 'The value is not structured like a URI.' }], browserResolved: null, arrayKeys: [], longestChain: 0 }

  parts.push({ name: 'scheme', value: scheme, note: scheme ? (scheme === 'http' ? 'Unencrypted: every byte, including cookies and passwords, is visible to anyone on the path. RFC 3986 §2.1 forbids percent-decoding the scheme, so "hTTP://" and "http://" are the same scheme but a filter comparing strings will miss it.' : undefined) : 'No scheme — the value is a relative reference, resolved against the current document.' })
  if (authority) {
    const userInfo = authority.includes('@') ? authority.slice(0, authority.lastIndexOf('@')) : ''
    const hostPort = authority.includes('@') ? authority.slice(authority.lastIndexOf('@') + 1) : authority
    const port = /:\d+$/.test(hostPort) ? hostPort.slice(hostPort.lastIndexOf(':')) : ''
    const host = port ? hostPort.slice(0, hostPort.lastIndexOf(':')) : hostPort
    parts.push({ name: 'authority', value: authority, note: userInfo ? 'The authority contains user information ("user:pass@"). RFC 3986 §3.2.1 deprecates this and browsers now prompt or block it; RFC 7230 §4 forbids it in a URI sent over HTTPS.' : undefined })
    parts.push({ name: 'host', value: host, note: /[^\x00-\x7f]/.test(host) ? 'The host contains non-ASCII characters: an IRI. DNS stores it as Punycode (an xn-- label) per RFC 3492, and homoglyph lookalikes such as a Cyrillic "а" are the reason browsers display IDNs in their xn-- form.' : undefined })
    if (port) parts.push({ name: 'port', value: port.slice(1), note: undefined })
  }
  parts.push({ name: 'path', value: path, note: path.startsWith('//') ? 'A path that begins with "//" is parsed as an authority, which is the mechanism behind open-redirect and SSRF bugs in naive URL builders.' : undefined })
  if (query !== undefined) parts.push({ name: 'query', value: query })
  if (fragment !== undefined) parts.push({ name: 'fragment', value: fragment, note: 'Everything after "#" is never sent to the server (RFC 3986 §3.5), so a token placed in a fragment stays client-side but is still written to history and to the Referer of later requests.' })

  if (query !== undefined && query.length > 0) {
    const seen = new Map<string, number>()
    for (const raw of query.split('&')) {
      if (raw === '') continue
      const eq = raw.indexOf('=')
      const key = eq === -1 ? raw : raw.slice(0, eq)
      const val = eq === -1 ? '' : raw.slice(eq + 1)
      const decodedKey = percentDecode(key, { plusAsSpace: true }).output
      const decodedValue = percentDecode(val, { plusAsSpace: true }).output
      seen.set(decodedKey, (seen.get(decodedKey) ?? 0) + 1)
      params.push({ key, value: val, raw, decodedKey, decodedValue, repeated: false })
    }
    for (const p of params) {
      p.repeated = (seen.get(p.decodedKey) ?? 0) > 1
      if (/\[\]?$/.test(p.decodedKey) || /(\[\d+\])$/.test(p.decodedKey)) arrayKeys.push(p.decodedKey)
    }
    const duplicates = [...seen.entries()].filter(([, n]) => n > 1)
    if (duplicates.length)
      issues.push({
        severity: 'warning',
        code: 'repeated-key',
        message: `Repeated query key${duplicates.length > 1 ? 's' : ''}: ${duplicates.map(([k, n]) => `"${k}" ×${n}`).join(', ')}.`,
        hint: 'Nothing in RFC 3986 defines the meaning of a repeated key. PHP keeps the last value, Node and most frameworks give an array, Spring binds the first — which is how "duplicate parameter" differences become security bugs.',
      })
  }

  if (/javascript:|data:|vbscript:/i.test(value))
    issues.push({
      severity: 'error',
      code: 'dangerous-scheme',
      message: 'This URL uses a scripting scheme.',
      hint: 'Assigning it to an anchor href or a whitelist-unaware redirect executes script in your origin. Allow-list http/https instead of block-listing javascript: — the block-list is trivially bypassed with "&#106;avascript:" and case changes.',
    })
  if (/\s/.test(value))
    issues.push({ severity: 'warning', code: 'raw-space', message: 'The URL contains a raw space.', hint: 'Spaces are not allowed anywhere in a URI; browsers silently insert %20 when you type one in the address bar, so tests pass by hand and fail from code.' })
  if (/[<>"{}|\\^`\[\]]/.test(value))
    issues.push({ severity: 'warning', code: 'excluded-characters', message: 'The URL contains characters excluded by RFC 3986 §2.4 (< > " { } | \\ ^ ` [ ]).', hint: 'They must be percent-encoded. The square brackets are the exception that trips people up: they are legal delimiters around an IPv6 host but excluded everywhere else.' })
  const plusRaw = params.some((p) => p.value.includes('+'))
  if (plusRaw)
    issues.push({
      severity: 'warning',
      code: 'ambiguous-plus',
      message: 'A query value contains a literal "+".',
      hint: 'In application/x-www-form-urlencoded, "+" means a space (the convention predates RFC 3986 and is codified in the HTML spec), while in a URI query a "+" is just a plus. A search term "C++" arrives as "C  " on servers that decode the query as a form body — the single most reported URL encoding bug.',
    })

  let browserResolved: string | null = null
  try {
    browserResolved = new URL(value, 'https://example.com/').toString()
  } catch {
    browserResolved = null
  }
  if (browserResolved && browserResolved !== value && scheme === '')
    parts.push({ name: 'resolved against https://example.com/', value: browserResolved, note: 'How a browser interprets the same relative reference (RFC 3986 §5).' })

  let longestChain = 0
  let probe = value
  for (let n = 0; n < 6; n++) {
    const d = percentDecode(probe, {})
    if (d.output === probe) break
    longestChain = n + 1
    probe = d.output
  }
  if (longestChain > 1)
    issues.push({ severity: 'warning', code: 'multi-layer', message: `Decoding this value ${longestChain} times still changes it (nested encoding layers).`, hint: 'Each extra layer hides the payload from naive validators. Normalise to a single canonical layer before comparing or authorising.' })

  return { ok: true, parts, params, issues, browserResolved, arrayKeys, longestChain }
}

export function buildQuery(params: [string, string][], options: { plusForSpace?: boolean; uppercaseHex?: boolean } = {}) {
  return params
    .map(([key, value]) => {
      const k = percentEncode(key, 'query-value', options.uppercaseHex ?? true).output
      const v = percentEncode(value, 'query-value', options.uppercaseHex ?? true).output
      const spaced = options.plusForSpace ? v.replace(/%20/g, '+') : v
      return `${k}=${spaced}`
    })
    .join('&')
}
