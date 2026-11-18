/**
 * Strict RFC 8259 JSON scanner + AST printer.
 * Round-trips through an AST instead of JSON.parse/JSON.stringify so that key
 * order, duplicate keys and number literals survive formatting unchanged.
 */

export type JsonObjectNode = {
  kind: 'object'
  members: { key: string; value: JsonNode; keyStart: number; start: number; end: number }[]
  start: number
  end: number
}
export type JsonArrayNode = { kind: 'array'; items: JsonNode[]; start: number; end: number }
export type JsonStringNode = { kind: 'string'; value: string; raw: string; start: number; end: number }
export type JsonNumberNode = { kind: 'number'; raw: string; value: number; start: number; end: number }
export type JsonLiteralNode = {
  kind: 'boolean' | 'null'
  value: boolean | null
  raw: string
  start: number
  end: number
}
export type JsonNode =
  | JsonObjectNode
  | JsonArrayNode
  | JsonStringNode
  | JsonNumberNode
  | JsonLiteralNode

export type Severity = 'error' | 'warning' | 'info'

export type Diagnostic = {
  severity: Severity
  code: string
  message: string
  hint?: string
  offset: number
  length: number
  line: number
  column: number
  related?: { message: string; line: number; column: number }
}

export type ParseResult = {
  ok: boolean
  node: JsonNode | null
  diagnostics: Diagnostic[]
  errors: Diagnostic[]
  warnings: Diagnostic[]
}

export type Locator = { lineStarts: number[]; at(offset: number): { line: number; column: number } }

export function makeLocator(text: string): Locator {
  const lineStarts = [0]
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) lineStarts.push(i + 1)
  }
  return {
    lineStarts,
    at(offset: number) {
      const safe = Math.max(0, Math.min(offset, text.length))
      let lo = 0
      let hi = lineStarts.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (lineStarts[mid] <= safe) lo = mid
        else hi = mid - 1
      }
      return { line: lo + 1, column: safe - lineStarts[lo] + 1 }
    },
  }
}

const MAX_DEPTH = 200

class Reader {
  pos = 0
  constructor(
    readonly text: string,
    readonly loc: Locator,
    readonly diags: Diagnostic[],
  ) {}

  diag(
    severity: Severity,
    code: string,
    message: string,
    offset: number,
    length = 1,
    hint?: string,
    related?: Diagnostic['related'],
  ) {
    const at = this.loc.at(offset)
    this.diags.push({ severity, code, message, hint, offset, length, ...at, related })
  }

  /** A method, not a getter: TypeScript keeps narrowing a property access
   *  across `pos` changes, which hides the comparisons that follow a skip. */
  ch() {
    return this.text[this.pos]
  }

  peek(offset = 0) {
    return this.text[this.pos + offset]
  }

  eof() {
    return this.pos >= this.text.length
  }

  skipTrivia(depthAware = true) {
    void depthAware
    for (;;) {
      const c = this.text[this.pos]
      if (c === undefined) return
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        this.pos++
        continue
      }
      if (c === '\u00a0' || c === '\ufeff' || c === '\u2028' || c === '\u2029' || /[\u2000-\u200a\u202f\u205f\u3000]/.test(c)) {
        this.diag(
          'error',
          'invalid-whitespace',
          `Invalid whitespace character U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}.`,
          this.pos,
          1,
          'RFC 8259 §2 allows only space, tab, LF and CR outside strings. Invisible characters copied from web pages or word processors are the most common cause of this error.',
        )
        this.pos++
        continue
      }
      if (c === '/' && (this.peek(1) === '/' || this.peek(1) === '*')) {
        const start = this.pos
        if (this.peek(1) === '/') {
          while (!this.eof() && this.text[this.pos] !== '\n') this.pos++
        } else {
          this.pos += 2
          while (!this.eof() && !(this.text[this.pos] === '*' && this.peek(1) === '/')) this.pos++
          this.pos += 2
        }
        this.diag(
          'error',
          'comment',
          'Comments are not valid JSON.',
          start,
          this.pos - start,
          'Comments belong to JSON5 / JSONC. Use the "Fix common issues" action to strip them, or keep them out of machine-readable payloads.',
        )
        continue
      }
      return
    }
  }

  unexpected(what: string, offset = this.pos, length = 1) {
    const found = this.eof() ? 'end of input' : `this character`
    this.diag(
      'error',
      'unexpected-token',
      `Expected ${what} but found ${found}${this.eof() ? '' : ` ${JSON.stringify(this.text[this.pos])}`}.`,
      offset,
      length,
    )
  }
}

const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/

function parseNumberLiteral(r: Reader): JsonNumberNode | null {
  const start = r.pos
  while (r.pos < r.text.length && /[-+.eE0-9_]/.test(r.text[r.pos])) r.pos++
  const raw = r.text.slice(start, r.pos)
  if (raw === 'NaN' || raw === 'Infinity' || raw === '-Infinity') {
    r.diag(
      'error',
      'non-standard-number',
      `"${raw}" is not valid JSON.`,
      start,
      raw.length,
      'RFC 8259 §6 has no NaN or Infinity literal. Encode missing values as null, or send the sentinel as a string such as "Infinity".',
    )
    return null
  }
  if (raw.includes('_')) {
    r.diag('error', 'numeric-separator', 'Digit separators such as "_" are not valid JSON.', start, raw.length)
    return null
  }
  if (!NUMBER_RE.test(raw)) {
    if (/^-?0\d/.test(raw)) {
      r.diag(
        'error',
        'leading-zero',
        `Leading zeros are not allowed in JSON numbers ("${raw}").`,
        start,
        raw.length,
        'RFC 8259 §6 forbids them. If the value is an identifier (zip code, phone number, version), quote it: "007".',
      )
    } else if (raw === '-' || raw === '') {
      r.diag('error', 'incomplete-number', 'A number is not complete here.', start, Math.max(1, raw.length))
    } else {
      r.diag('error', 'malformed-number', `"${raw}" is not a JSON number.`, start, raw.length)
    }
    return null
  }
  const value = Number(raw)
  const isIntegerOnly = !/[.eE]/.test(raw)
  if (isIntegerOnly && !Number.isSafeInteger(value)) {
    r.diag(
      'warning',
      'unsafe-integer',
      `${raw} exceeds 2^53−1 and cannot be held exactly by a double-precision float.`,
      start,
      raw.length,
      'Values this large lose digits in JavaScript, JSON.parse, most browsers and many backends. Quote them or use a BigInt-aware parser. This formatter keeps the original text so nothing is lost here.',
    )
  } else if (Number(raw) === value && !Number.isNaN(value)) {
    const digits = raw.replace(/[-+.eE0]/g, '').replace(/^0+/, '').length
    if (/[.]/.test(raw) && digits > 15) {
      r.diag(
        'warning',
        'precision-loss',
        `${raw} has more significant digits than a double can hold; parsers may round it.`,
        start,
        raw.length,
      )
    }
  }
  return { kind: 'number', raw, value, start, end: r.pos }
}

function parseStringLiteral(r: Reader): JsonStringNode | null {
  if (r.ch() !== '"') {
    if (r.ch() === "'") {
      const start = r.pos
      r.pos++
      while (!r.eof() && r.ch() !== "'") r.pos++
      if (!r.eof()) r.pos++
      r.diag(
        'error',
        'single-quoted-string',
        'Single-quoted strings are not valid JSON.',
        start,
        r.pos - start,
        'Use double quotes. JSON5 and Python dict repr() both allow single quotes, which is why pasted data often fails here.',
      )
      return { kind: 'string', value: r.text.slice(start + 1, r.pos - 1), raw: r.text.slice(start, r.pos), start, end: r.pos }
    }
    r.unexpected('a double-quoted string')
    return null
  }
  const start = r.pos
  r.pos++
  let out = ''
  for (;;) {
    if (r.eof()) {
      r.diag('error', 'unterminated-string', 'String is never closed.', start, 1, 'A missing closing quote, or a raw newline inside the string, is usually the cause.')
      return null
    }
    const c = r.text[r.pos]
    if (c === '"') {
      r.pos++
      return { kind: 'string', value: out, raw: r.text.slice(start, r.pos), start, end: r.pos }
    }
    if (c === '\n' || c === '\r') {
      r.diag(
        'error',
        'newline-in-string',
        'Raw newlines are not allowed inside JSON strings.',
        r.pos,
        1,
        'Escape them as \\n, or wrap the text with JSON.stringify. Paste-with-newlines from log files is the usual trigger.',
      )
      return null
    }
    if (c !== '\\' && c.charCodeAt(0) < 0x20) {
      r.diag(
        'error',
        'unescaped-control-char',
        `Unescaped control character U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} in string.`,
        r.pos,
        1,
        'RFC 8259 §7 requires control characters to be escaped, for example \\t or \\u0009.',
      )
      out += c
      r.pos++
      continue
    }
    if (c === '\\') {
      const esc = r.text[r.pos + 1]
      const map: Record<string, string> = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }
      if (esc === 'u') {
        const hex = r.text.slice(r.pos + 2, r.pos + 6)
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          r.diag('error', 'bad-escape', `\\u must be followed by exactly four hex digits (found "${hex}").`, r.pos, 2)
          r.pos += 2
          continue
        }
        const code = parseInt(hex, 16)
        const isHigh = code >= 0xd800 && code <= 0xdbff
        if (isHigh) {
          const low = r.text.slice(r.pos + 6, r.pos + 12)
          if (low.startsWith('\\u') && /^[0-9a-fA-F]{4}$/.test(low.slice(2))) {
            const lo = parseInt(low.slice(2), 16)
            if (lo >= 0xdc00 && lo <= 0xdfff) {
              out += String.fromCharCode(code, lo)
              r.pos += 12
              continue
            }
          }
          r.diag(
            'warning',
            'lone-surrogate',
            'A high surrogate is not followed by a low surrogate.',
            r.pos,
            6,
            'Lone surrogates are accepted by JSON.parse but are replaced with U+FFFD by TextEncoder and by most non-JavaScript parsers, which silently corrupts emoji and CJK extension characters.',
          )
          out += String.fromCharCode(code)
          r.pos += 6
          continue
        }
        out += String.fromCharCode(code)
        r.pos += 6
        continue
      }
      if (esc in map) {
        out += map[esc]
        r.pos += 2
        continue
      }
      r.diag(
        'error',
        'invalid-escape',
        `\\${esc ?? ''} is not a valid JSON escape sequence.`,
        r.pos,
        2,
        'Only " \\ / b f n r t and \\uXXXX are defined. \\x41 and \\0 come from other languages, not JSON.',
      )
      out += esc ?? ''
      r.pos += 2
      continue
    }
    if (c === '\u2028' || c === '\u2029') {
      r.diag(
        'info',
        'js-unsafe-line-separator',
        'U+2028/U+2029 are valid JSON but break eval-based JSON consumption in older JavaScript engines.',
        r.pos,
        1,
        'Escape them as \\u2028 / \\u2029 when embedding JSON inside a <script> tag.',
      )
    }
    out += c
    r.pos++
  }
}

function parseValue(r: Reader, depth: number): JsonNode | null {
  if (depth > MAX_DEPTH) {
    r.diag('error', 'max-depth', `Nesting is deeper than ${MAX_DEPTH} levels.`, r.pos, 1, 'Extremely deep nesting can overflow recursive parsers in other runtimes. Flatten the structure if you can.')
    return null
  }
  r.skipTrivia()
  if (r.eof()) {
    r.diag('error', 'unexpected-end', 'Input ended before a value was found.', r.pos, 1, 'This happens with an empty textarea, or with JSON that was truncated by a copy/paste or a proxy buffer limit.')
    return null
  }
  const c = r.ch()
  if (c === '{') return parseObject(r, depth)
  if (c === '[') return parseArray(r, depth)
  if (c === '"') return parseStringLiteral(r)
  if (c === "'") return parseStringLiteral(r)
  if (c === '-' || (c >= '0' && c <= '9')) return parseNumberLiteral(r)
  for (const [word, value] of [
    ['true', true],
    ['false', false],
    ['null', null],
  ] as const) {
    if (r.text.startsWith(word, r.pos)) {
      r.pos += word.length
      return { kind: word === 'null' ? 'null' : 'boolean', value, raw: word, start: r.pos - word.length, end: r.pos }
    }
  }
  if (/[a-zA-Z_$]/.test(c)) {
    const start = r.pos
    while (r.pos < r.text.length && /[a-zA-Z0-9_$]/.test(r.text[r.pos])) r.pos++
    const word = r.text.slice(start, r.pos)
    r.diag(
      'error',
      'unquoted-key',
      `"${word}" is not quoted.`,
      start,
      word.length,
      'Object keys must be double-quoted strings. Unquoted keys come from JavaScript object literals; use the "Fix common issues" action to add quotes.',
    )
    return null
  }
  r.unexpected('a JSON value')
  return null
}

function parseObject(r: Reader, depth: number): JsonObjectNode | null {
  const start = r.pos
  r.pos++
  const node: JsonObjectNode = { kind: 'object', members: [], start, end: start }
  r.skipTrivia()
  if (r.ch() === '}') {
    node.end = ++r.pos
    return node
  }
  for (;;) {
    r.skipTrivia()
    if (r.eof()) {
      r.diag('error', 'unexpected-end', 'Object is missing its closing "}".', r.pos, 1, 'Check for an unbalanced brace — paste a truncated response body here often causes it.')
      return null
    }
    if (r.ch() === '}') {
      node.end = ++r.pos
      return node
    }
    const key = parseStringLiteral(r)
    if (!key) return null
    r.skipTrivia()
    if (r.ch() !== ':') {
      r.unexpected('a ":" between a key and its value')
      return null
    }
    r.pos++
    const value = parseValue(r, depth + 1)
    if (!value) return null
    const duplicate = node.members.find((m) => m.key === key.value)
    if (duplicate) {
      r.diag(
        'warning',
        'duplicate-key',
        `Duplicate key "${key.value}" in the same object.`,
        key.start,
        key.raw.length,
        'RFC 8259 §4 says names SHOULD be unique but does not forbid duplicates. JSON.parse and most parsers keep the last value and drop the first silently — that is data loss. This tool keeps both members when printing.',
        { message: 'First occurrence', line: r.loc.at(duplicate.keyStart).line, column: r.loc.at(duplicate.keyStart).column },
      )
    }
    node.members.push({ key: key.value, value, keyStart: key.start, start: key.start, end: value.end })
    r.skipTrivia()
    if (r.ch() === ',') {
      r.pos++
      r.skipTrivia()
      if (r.ch() === '}') {
        r.diag(
          'error',
          'trailing-comma',
          'Trailing comma before "}" is not valid JSON.',
          r.pos - 1,
          1,
          'Allowed in JavaScript object literals and JSON5, rejected by JSON.parse. Remove it or use the "Fix common issues" action.',
        )
        node.end = ++r.pos
        return node
      }
      continue
    }
    if (r.ch() === '}') {
      node.end = ++r.pos
      return node
    }
    r.unexpected('a "," or "}"')
    return null
  }
}

function parseArray(r: Reader, depth: number): JsonArrayNode | null {
  const start = r.pos
  r.pos++
  const node: JsonArrayNode = { kind: 'array', items: [], start, end: start }
  r.skipTrivia()
  if (r.ch() === ']') {
    node.end = ++r.pos
    return node
  }
  for (;;) {
    r.skipTrivia()
    if (r.eof()) {
      r.diag('error', 'unexpected-end', 'Array is missing its closing "]".', r.pos, 1)
      return null
    }
    if (r.ch() === ']') {
      node.end = ++r.pos
      return node
    }
    const item = parseValue(r, depth + 1)
    if (!item) return null
    node.items.push(item)
    r.skipTrivia()
    if (r.ch() === ',') {
      r.pos++
      r.skipTrivia()
      if (r.ch() === ']') {
        r.diag(
          'error',
          'trailing-comma',
          'Trailing comma before "]" is not valid JSON.',
          r.pos - 1,
          1,
          'Allowed in JavaScript array literals, rejected by strict parsers. Remove it or use the "Fix common issues" action.',
        )
        node.end = ++r.pos
        return node
      }
      continue
    }
    if (r.ch() === ']') {
      node.end = ++r.pos
      return node
    }
    if (r.ch() === ':' || /^[}\]]/.test(r.ch() ?? '')) {
      r.unexpected('a "," between array elements')
      return null
    }
    r.diag(
      'error',
      'missing-comma',
      'Array elements must be separated by a comma.',
      r.pos,
      1,
      'A missing comma is the most frequent cause of "Unexpected token" errors in hand-edited JSON.',
    )
    return null
  }
}

export function parseJson(text: string): ParseResult {
  const loc = makeLocator(text)
  const r = new Reader(text, loc, [])
  let trimmed = text
  const leadingBom = text.charCodeAt(0) === 0xfeff
  if (leadingBom) trimmed = text.slice(1)
  if (leadingBom) {
    r.diag(
      'warning',
      'utf8-bom',
      'File starts with a UTF-8 byte order mark (U+FEFF).',
      0,
      1,
      'Excel and Notepad add a BOM. RFC 8259 §8.1 requires JSON text exchanged between systems to be UTF-8 and §8 says implementations MUST NOT add a BOM; several parsers, including strict JSON Schema loaders, reject it.',
    )
  }
  const bomAdjustedText = trimmed
  const bomReader = new Reader(bomAdjustedText, makeLocator(bomAdjustedText), r.diags)
  let node: JsonNode | null = null
  if (bomAdjustedText.trim().length === 0) {
    bomReader.diag('error', 'empty-input', 'No JSON to parse — the input is empty or whitespace only.', 0, Math.max(1, bomAdjustedText.length))
  } else {
    node = parseValue(bomReader, 0)
    if (node) {
      bomReader.skipTrivia()
      if (!bomReader.eof()) {
        if ((bomReader.ch() === '}' || bomReader.ch() === ']') && bomReader.diags.at(-1)?.code !== 'unexpected-end') {
          bomReader.diag('error', 'extra-brace', 'Unexpected closing bracket after the top-level value.', bomReader.pos, 1, 'Usually an extra } or ] at the end of a pasted payload.')
        } else {
          bomReader.diag(
            'error',
            'multiple-values',
            'More than one value at the top level.',
            bomReader.pos,
            1,
            'RFC 8259 §2 requires exactly one top-level value. JSON Lines / NDJSON (one object per line) is not valid JSON — convert it by wrapping the lines in [ ] and separating them with commas.',
          )
        }
        node = null
      }
    }
  }
  const diagnostics = bomReader.diags.map((d) => (leadingBom ? { ...d, offset: d.offset + 1, length: d.length } : d))
  const errors = diagnostics.filter((d) => d.severity === 'error')
  const warnings = diagnostics.filter((d) => d.severity !== 'error')
  return { ok: node !== null && errors.length === 0, node, diagnostics, errors, warnings }
}

export type PrintOptions = {
  indent?: number | 'tab'
  sortKeys?: 'keep' | 'asc' | 'desc' | 'numeric'
  lineEnding?: 'lf' | 'crlf'
  keepUnicode?: boolean
  maxArrayLength?: number
}

const DEFAULTS: Required<Omit<PrintOptions, 'maxArrayLength'>> & { maxArrayLength: number } = {
  indent: 2,
  sortKeys: 'keep',
  lineEnding: 'lf',
  keepUnicode: true,
  maxArrayLength: 0,
}

function escapeString(value: string, keepUnicode: boolean): string {
  let out = '"'
  for (const ch of value) {
    const code = ch.codePointAt(0)!
    if (ch === '"') out += '\\"'
    else if (ch === '\\') out += '\\\\'
    else if (ch === '\b') out += '\\b'
    else if (ch === '\f') out += '\\f'
    else if (ch === '\n') out += '\\n'
    else if (ch === '\r') out += '\\r'
    else if (ch === '\t') out += '\\t'
    else if (code < 0x20) out += `\\u${code.toString(16).padStart(4, '0')}`
    else if (!keepUnicode && (code > 0x7e || code === 0x2b || code === 0x2f)) out += unicodeEscape(ch)
    else if (!keepUnicode && (code === 0x2028 || code === 0x2029))
      out += `\\u${code.toString(16)}`
    else out += ch
  }
  return `${out}"`
}

function unicodeEscape(ch: string): string {
  const code = ch.codePointAt(0)!
  if (code <= 0xffff) return `\\u${code.toString(16).padStart(4, '0')}`
  const v = code - 0x10000
  const hi = 0xd800 + (v >> 10)
  const lo = 0xdc00 + (v & 0x3ff)
  return `\\u${hi.toString(16).padStart(4, '0')}\\u${lo.toString(16).padStart(4, '0')}`
}

function sortMembers(members: JsonObjectNode['members'], mode: PrintOptions['sortKeys']) {
  if (!mode || mode === 'keep') return members
  const copy = [...members]
  if (mode === 'numeric') {
    copy.sort((a, b) => {
      const na = Number(a.key)
      const nb = Number(b.key)
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
      if (Number.isFinite(na)) return -1
      if (Number.isFinite(nb)) return 1
      return a.key.localeCompare(b.key, 'en')
    })
  } else {
    copy.sort((a, b) => (mode === 'asc' ? 1 : -1) * a.key.localeCompare(b.key, 'en', { numeric: true, sensitivity: 'base' }))
  }
  return copy
}

export function printNode(node: JsonNode, options: PrintOptions = {}): string {
  const opts = { ...DEFAULTS, ...options }
  const pad = opts.indent === 'tab' ? '\t' : ' '.repeat(Math.max(0, opts.indent))
  const out: string[] = []

  const walk = (n: JsonNode, depth: number, prefix: string | undefined, last: boolean) => {
    const indent = pad.repeat(depth)
    const tail = last ? '' : ','
    if (n.kind === 'object') {
      if (n.members.length === 0) {
        out.push(`${prefix || indent}{}${tail}`)
        return
      }
      out.push(`${prefix || indent}{`)
      const members = sortMembers(n.members, opts.sortKeys)
      members.forEach((m, i) => {
        walk(
          m.value,
          depth + 1,
          `${pad.repeat(depth + 1)}${escapeString(m.key, opts.keepUnicode)}: `,
          i === members.length - 1,
        )
      })
      out.push(`${indent}}${tail}`)
      return
    }
    if (n.kind === 'array') {
      if (n.items.length === 0) {
        out.push(`${prefix || indent}[]${tail}`)
        return
      }
      out.push(`${prefix || indent}[`)
      n.items.forEach((item, i) => walk(item, depth + 1, undefined, i === n.items.length - 1))
      out.push(`${indent}]${tail}`)
      return
    }
    const scalar =
      n.kind === 'number'
        ? n.raw
        : n.kind === 'string'
          ? escapeString(n.value, opts.keepUnicode)
          : n.raw
    out.push(`${prefix || indent}${scalar}${tail}`)
  }

  walk(node, 0, undefined, true)
  const text = out.join('\n')
  return opts.lineEnding === 'crlf' ? text.replace(/\n/g, '\r\n') : text
}

export function printMinified(node: JsonNode, keepUnicode = true): string {
  const encode = (n: JsonNode): string => {
    switch (n.kind) {
      case 'object':
        return `{${n.members.map((m) => `${escapeString(m.key, keepUnicode)}:${encode(m.value)}`).join(',')}}`
      case 'array':
        return `[${n.items.map(encode).join(',')}]`
      case 'number':
        return n.raw
      case 'string':
        return escapeString(n.value, keepUnicode)
      default:
        return n.raw
    }
  }
  return encode(node)
}

export function toJsValue(node: JsonNode | null, bigIntegers = false): unknown {
  if (!node) return null
  switch (node.kind) {
    case 'object': {
      const obj: Record<string, unknown> = {}
      for (const m of node.members) obj[m.key] = toJsValue(m.value, bigIntegers)
      return obj
    }
    case 'array':
      return node.items.map((item) => toJsValue(item, bigIntegers))
    case 'number':
      // A plain integer past 2^53-1 only survives as a BigInt; double rounding
      // would silently rewrite 9007199254740993 to ...992.
      return bigIntegers && /^[-+]?\d+$/.test(node.raw) && !Number.isSafeInteger(node.value) ? BigInt(node.raw) : node.value
    case 'string':
      return node.value
    case 'boolean':
      return node.value
    default:
      return null
  }
}

export function valueToNode(value: unknown): JsonNode {
  if (value === null || value === undefined) return { kind: 'null', value: null, raw: 'null', start: 0, end: 4 }
  if (Array.isArray(value))
    return { kind: 'array', items: value.map(valueToNode), start: 0, end: 0 }
  if (typeof value === 'object') {
    return {
      kind: 'object',
      members: Object.entries(value as Record<string, unknown>).map(([key, v]) => ({
        key,
        value: valueToNode(v),
        keyStart: 0,
        start: 0,
        end: 0,
      })),
      start: 0,
      end: 0,
    }
  }
  if (typeof value === 'number')
    return { kind: 'number', raw: Number.isFinite(value) ? String(value) : 'null', value, start: 0, end: 0 }
  if (typeof value === 'boolean')
    return { kind: 'boolean', value, raw: String(value), start: 0, end: 0 }
  const str = String(value)
  return { kind: 'string', value: str, raw: JSON.stringify(str), start: 0, end: 0 }
}

export type JsonStats = {
  bytes: number
  chars: number
  lines: number
  depth: number
  objects: number
  arrays: number
  members: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
  duplicates: number
  minifiedBytes: number
  prettyBytes: number
  largestArray: number
  isArrayRoot: boolean
  recordCount: number
}

export function jsonStats(node: JsonNode | null, source: string, minified = '', pretty = ''): JsonStats {
  const stats: JsonStats = {
    bytes: new Blob([source]).size,
    chars: source.length,
    lines: source.split('\n').length,
    depth: 0,
    objects: 0,
    arrays: 0,
    members: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    duplicates: 0,
    minifiedBytes: minified ? new Blob([minified]).size : 0,
    prettyBytes: 0,
    largestArray: 0,
    isArrayRoot: node?.kind === 'array',
    recordCount: 0,
  }
  if (!node) return stats
  const keysSeen = new Set<string>()
  const walk = (n: JsonNode, depth: number) => {
    stats.depth = Math.max(stats.depth, depth)
    if (n.kind === 'object') {
      stats.objects++
      const local = new Set<string>()
      for (const m of n.members) {
        stats.members++
        keysSeen.add(m.key)
        if (local.has(m.key)) stats.duplicates++
        local.add(m.key)
        walk(m.value, depth + 1)
      }
      return
    }
    if (n.kind === 'array') {
      stats.arrays++
      stats.largestArray = Math.max(stats.largestArray, n.items.length)
      for (const item of n.items) walk(item, depth + 1)
      return
    }
    if (n.kind === 'string') stats.strings++
    else if (n.kind === 'number') stats.numbers++
    else if (n.kind === 'boolean') stats.booleans++
    else stats.nulls++
  }
  walk(node, 1)
  stats.recordCount = node.kind === 'array' ? node.items.length : 1
  stats.prettyBytes = new Blob([pretty || source]).size
  return stats
}

export function outline(node: JsonNode | null, maxLines = 60): string[] {
  const lines: string[] = []
  if (!node) return lines
  const walk = (n: JsonNode, depth: number, label: string) => {
    if (lines.length >= maxLines) return
    if (n.kind === 'object') {
      lines.push(`${'  '.repeat(depth)}${label}{${n.members.length} keys}`)
      for (const m of n.members.slice(0, 12)) {
        if (m.value.kind === 'object' || m.value.kind === 'array') walk(m.value, depth + 1, `"${m.key}": `)
        else lines.push(
          `${'  '.repeat(depth + 1)}"${m.key}": ${m.value.kind}${m.value.kind === 'string' && (m.value as JsonStringNode).value.length > 40 ? ' · long text' : ''}`,
        )
      }
      if (n.members.length > 12) lines.push(`${'  '.repeat(depth + 1)}… ${n.members.length - 12} more`)
      return
    }
    if (n.kind === 'array') {
      lines.push(`${'  '.repeat(depth)}${label}[${n.items.length} items]`)
      if (n.items[0]) walk(n.items[0], depth + 1, 'first: ')
    }
  }
  walk(node, 0, '')
  return lines
}
