/**
 * Lenient JSON "repair" pass for almost-valid payloads: comments, single
 * quotes, unquoted keys, trailing/missing commas, Python-style literals and
 * NDJSON streams. Output is always strict RFC 8259 text.
 */

export type RepairFix = {
  line: number
  column: number
  kind: string
  from: string
  to: string
  note: string
}

export type RepairResult = {
  ok: boolean
  output: string
  value: unknown
  fixes: RepairFix[]
  errors: { line: number; column: number; message: string }[]
}

type Token = {
  type: 'punct' | 'string' | 'number' | 'ident'
  value: string
  start: number
  end: number
}

const LITERAL_MAP: Record<string, { value: unknown; to: string }> = {
  true: { value: true, to: 'true' },
  false: { value: false, to: 'false' },
  null: { value: null, to: 'null' },
  True: { value: true, to: 'true' },
  False: { value: false, to: 'false' },
  None: { value: null, to: 'null' },
  NULL: { value: null, to: 'null' },
  Null: { value: null, to: 'null' },
  undefined: { value: null, to: 'null' },
  NaN: { value: null, to: 'null' },
  Infinity: { value: null, to: 'null' },
  '-Infinity': { value: null, to: 'null' },
}

export function locate(text: string, offset: number) {
  let line = 1
  let column = 1
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++
      column = 1
    } else column++
  }
  return { line, column }
}

function tokenize(text: string, fixes: RepairFix[], errors: RepairResult['errors']): Token[] {
  const tokens: Token[] = []
  let i = 0
  const push = (type: Token['type'], value: string, start: number, end: number) =>
    tokens.push({ type, value, start, end })

  while (i < text.length) {
    const c = text[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++
      continue
    }
    if (c === '\u00a0' || c === '\ufeff' || (c >= '\u2000' && c <= '\u200a') || c === '\u2028' || c === '\u2029') {
      fixes.push({ ...locate(text, i), kind: 'whitespace', from: `U+${c.charCodeAt(0).toString(16).toUpperCase()}`, to: ' ', note: 'Non-standard whitespace replaced with a space (RFC 8259 §2 allows only space, tab, CR, LF).' })
      i++
      continue
    }
    if (c === '/' && text[i + 1] === '/') {
      const start = i
      while (i < text.length && text[i] !== '\n') i++
      fixes.push({ ...locate(text, start), kind: 'comment', from: shorten(text.slice(start, i)), to: '', note: 'Line comment removed — JSON has no comment syntax.' })
      continue
    }
    if (c === '/' && text[i + 1] === '*') {
      const start = i
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i += 2
      fixes.push({ ...locate(text, start), kind: 'comment', from: shorten(text.slice(start, i)), to: '', note: 'Block comment removed.' })
      continue
    }
    if (c === '"' || c === "'") {
      const start = i
      const quote = c
      i++
      let out = ''
      let closed = false
      while (i < text.length) {
        if (text[i] === '\\') {
          const esc = text[i + 1]
          if (esc === 'u' && /^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) {
            out += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16))
            i += 6
            continue
          }
          const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '"': '"', "'": "'", '\\': '\\', '/': '/' }
          if (esc in map) {
            out += map[esc]
            i += 2
            continue
          }
          fixes.push({ ...locate(text, i), kind: 'invalid-escape', from: `\\${esc ?? ''}`, to: map[esc] ?? '\\\\' + (esc ?? ''), note: 'Unknown escape sequence kept as literal text.' })
          out += esc ?? ''
          i += 2
          continue
        }
        if (text[i] === quote) {
          closed = true
          i++
          break
        }
        if (text.charCodeAt(i) < 0x20) {
          fixes.push({ ...locate(text, i), kind: 'control-char', from: `U+${text.charCodeAt(i).toString(16).toUpperCase()}`, to: '\\u…', note: 'Raw control character escaped.' })
          out += text[i]
          i++
          continue
        }
        out += text[i]
        i++
      }
      if (!closed) errors.push({ ...locate(text, start), message: 'Unterminated string — no closing quote found.' })
      if (quote === "'") {
        fixes.push({ ...locate(text, start), kind: 'quotes', from: shorten(text.slice(start, i)), to: JSON.stringify(out), note: 'Single-quoted string converted to a double-quoted JSON string.' })
      }
      push('string', out, start, i)
      continue
    }
    if (c === '{' || c === '}' || c === '[' || c === ']' || c === ':' || c === ',') {
      push('punct', c, i, i + 1)
      i++
      continue
    }
    if (/[-0-9]/.test(c)) {
      const start = i
      if (c === '-' || c === '+') i++
      if (text[i] === 'I' && text.startsWith('Infinity', i)) {
        i += 8
        const raw = text.slice(start, i)
        push('ident', raw, start, i)
        continue
      }
      while (i < text.length && /[0-9]/.test(text[i])) i++
      if (text[i] === '.') {
        i++
        while (i < text.length && /[0-9]/.test(text[i])) i++
      }
      if (text[i] === 'e' || text[i] === 'E') {
        i++
        if (text[i] === '+' || text[i] === '-') i++
        while (i < text.length && /[0-9]/.test(text[i])) i++
      }
      const raw = text.slice(start, i)
      const isHex = /^0[xX][0-9a-fA-F]+$/.test(raw)
      const isOctal = /^0o[0-7]+$/.test(raw)
      const hasLeadingZero = /^-?0\d/.test(raw)
      let normalised = raw
      if (isHex) normalised = String(parseInt(raw.slice(2), 16))
      else if (isOctal) normalised = String(parseInt(raw.slice(2), 8))
      if (hasLeadingZero && !isHex && !isOctal) {
        normalised = raw.replace(/^(-?)0+(?=[1-9])/, '$1')
        fixes.push({ ...locate(text, start), kind: 'leading-zero', from: raw, to: normalised, note: 'Leading zero removed from a number. If this is an identifier (zip code, phone), it should have been a quoted string instead.' })
      } else if (isHex || isOctal) {
        fixes.push({ ...locate(text, start), kind: 'radix', from: raw, to: normalised, note: 'Non-decimal number literal converted to decimal.' })
      }
      push('number', normalised, start, i)
      continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      const start = i
      while (i < text.length && /[A-Za-z0-9_$]/.test(text[i])) i++
      push('ident', text.slice(start, i), start, i)
      continue
    }
    errors.push({ ...locate(text, i), message: `Character ${JSON.stringify(c)} cannot appear in JSON.` })
    i++
  }
  return tokens
}

function shorten(s: string) {
  const flat = s.replace(/\s+/g, ' ').trim()
  return flat.length > 32 ? `${flat.slice(0, 32)}…` : flat
}

class Parser {
  index = 0
  constructor(
    private tokens: Token[],
    private text: string,
    private fixes: RepairFix[],
    private errors: RepairResult['errors'],
  ) {}

  peek() {
    return this.tokens[this.index]
  }

  next() {
    return this.tokens[this.index++]
  }

  atPunct(value: string) {
    const t = this.peek()
    return t?.type === 'punct' && t.value === value
  }

  parseDocument(): unknown {
    const values: unknown[] = []
    while (this.index < this.tokens.length) {
      if (this.atPunct(',')) {
        this.next()
        continue
      }
      const v = this.parseValue()
      if (v !== undefined) values.push(v)
    }
    if (values.length === 0) {
      this.errors.push({ ...locate(this.text, 0), message: 'Nothing to convert — the input has no JSON value in it.' })
      return null
    }
    if (values.length === 1) return values[0]
    this.fixes.push({
      ...locate(this.text, this.tokens[this.index - 1]?.start ?? 0),
      kind: 'multiple-values',
      from: `${values.length} top-level values`,
      to: '1 array',
      note: `Found ${values.length} values where RFC 8259 §2 allows exactly one, so they were collected into an array. This is how NDJSON/JSON Lines input is turned into a single JSON document.`,
    })
    return values
  }

  parseValue(): unknown {
    const t = this.peek()
    if (!t) {
      this.errors.push({ ...locate(this.text, this.text.length), message: 'Input ended while a value was expected.' })
      return null
    }
    if (t.type === 'punct' && t.value === '{') return this.parseObject()
    if (t.type === 'punct' && t.value === '[') return this.parseArray()
    if (t.type === 'string') {
      this.next()
      return t.value
    }
    if (t.type === 'number') {
      this.next()
      const n = Number(t.value)
      if (!Number.isFinite(n)) {
        this.fixes.push({ ...locate(this.text, t.start), kind: 'bad-number', from: t.value, to: 'null', note: 'Value is not a finite JSON number, replaced with null.' })
        return null
      }
      return n
    }
    const mapped = LITERAL_MAP[t.value]
    if (mapped) {
      if (t.value !== mapped.to) {
        this.fixes.push({ ...locate(this.text, t.start), kind: 'literal', from: t.value, to: mapped.to, note: `"${t.value}" is a literal from another language, not JSON. Replaced with ${mapped.to}.` })
      }
      this.next()
      return mapped.value
    }
    if (t.type === 'ident') {
      this.errors.push({ ...locate(this.text, t.start), message: `"${t.value}" is not a JSON value and not an object key.` })
      this.next()
      return null
    }
    this.errors.push({ ...locate(this.text, t.start), message: `Unexpected "${t.value}".` })
    this.next()
    return null
  }

  parseObject(): Record<string, unknown> {
    const open = this.next()
    const obj: Record<string, unknown> = {}
    for (;;) {
      if (this.atPunct('}')) {
        this.next()
        return obj
      }
      if (!this.peek()) {
        this.errors.push({ ...locate(this.text, open.start), message: 'Object is missing its closing "}".' })
        return obj
      }
      if (this.atPunct(',')) {
        const comma = this.next()
        if (this.atPunct('}')) {
          this.fixes.push({ ...locate(this.text, comma.start), kind: 'trailing-comma', from: ',}', to: '}', note: 'Trailing comma before "}" removed.' })
          this.next()
          return obj
        }
        continue
      }
      const keyToken = this.peek()
      if (keyToken.type === 'ident') {
        this.next()
        this.fixes.push({ ...locate(this.text, keyToken.start), kind: 'unquoted-key', from: keyToken.value, to: JSON.stringify(keyToken.value), note: 'Unquoted object key wrapped in double quotes.' })
      } else if (keyToken.type === 'number') {
        this.next()
        this.fixes.push({ ...locate(this.text, keyToken.start), kind: 'numeric-key', from: keyToken.value, to: JSON.stringify(keyToken.value), note: 'Object keys must be strings; the number was converted to a string key.' })
      } else if (keyToken.type === 'string') {
        this.next()
      } else {
        this.errors.push({ ...locate(this.text, keyToken.start), message: `Expected an object key but found ${JSON.stringify(keyToken.value)}.` })
        this.next()
        return obj
      }
      const key = keyToken.value
      if (this.atPunct(':')) this.next()
      else
        this.fixes.push({
          ...locate(this.text, keyToken.end),
          kind: 'missing-colon',
          from: '',
          to: ':',
          note: `No ":" after the key "${key}" — inserted.`,
        })
      const value = this.parseValue()
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        this.fixes.push({
          ...locate(this.text, keyToken.start),
          kind: 'duplicate-key',
          from: key,
          to: `${key} (last value kept)`,
          note: 'The key appears more than once in the same object. Only one value can survive; the last occurrence was kept. Review the fix list before using the output.',
        })
      }
      obj[key] = value
      if (this.atPunct('}')) {
        this.next()
        return obj
      }
      if (!this.atPunct(',')) {
        const here = this.peek()
        if (here)
          this.fixes.push({
            ...locate(this.text, here.start),
            kind: 'missing-comma',
            from: '',
            to: ',',
            note: 'Missing comma between members inserted.',
          })
        else break
      }
    }
    this.errors.push({ ...locate(this.text, open.start), message: 'Object is missing its closing "}".' })
    return obj
  }

  parseArray(): unknown[] {
    const open = this.next()
    const arr: unknown[] = []
    for (;;) {
      if (this.atPunct(']')) {
        this.next()
        return arr
      }
      if (!this.peek()) {
        this.errors.push({ ...locate(this.text, open.start), message: 'Array is missing its closing "]".' })
        return arr
      }
      if (this.atPunct(',')) {
        const comma = this.next()
        if (this.atPunct(']')) {
          this.fixes.push({ ...locate(this.text, comma.start), kind: 'trailing-comma', from: ',]', to: ']', note: 'Trailing comma before "]" removed.' })
          this.next()
          return arr
        }
        continue
      }
      const value = this.parseValue()
      arr.push(value === undefined ? null : value)
      if (this.atPunct(']')) {
        this.next()
        return arr
      }
      if (!this.atPunct(',')) {
        const here = this.peek()
        if (here)
          this.fixes.push({
            ...locate(this.text, here.start),
            kind: 'missing-comma',
            from: '',
            to: ',',
            note: 'Missing comma between elements inserted.',
          })
        else break
      }
    }
    this.errors.push({ ...locate(this.text, open.start), message: 'Array is missing its closing "]".' })
    return arr
  }
}

export function repairJson(input: string, indent: number | 'tab' = 2): RepairResult {
  const fixes: RepairFix[] = []
  const errors: RepairResult['errors'] = []
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  if (input.charCodeAt(0) === 0xfeff) {
    fixes.push({ ...locate(input, 0), kind: 'bom', from: 'U+FEFF', to: '', note: 'UTF-8 byte order mark stripped.' })
  }
  const tokens = tokenize(text, fixes, errors)
  const parser = new Parser(tokens, text, fixes, errors)
  const value = tokens.length ? parser.parseDocument() : null
  if (!tokens.length) errors.push({ ...locate(text, 0), message: 'The input is empty.' })
  const spacing = indent === 'tab' ? '\t' : ' '.repeat(Math.max(0, indent))
  let output = ''
  try {
    output = JSON.stringify(value, null, spacing) ?? ''
  } catch {
    errors.push({ ...locate(text, 0), message: 'The repaired structure could not be serialized.' })
  }
  return { ok: errors.length === 0, output, value, fixes, errors }
}
