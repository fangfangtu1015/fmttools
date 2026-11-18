/**
 * YAML engine. Parsing uses the `yaml` CST library (YAML 1.2 core schema,
 * positional errors, duplicate-key warnings). Serialisation is hand-written so
 * output can be made safe for YAML 1.1 readers — the behaviour behind the
 * "Norway problem".
 */

import { parseDocument, isMap, isScalar, visit, type Node } from 'yaml'
import { parseJson, toJsValue } from './json'

export type YamlIssue = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  hint?: string
  line?: number
  column?: number
}

export type Coercion = {
  raw: string
  line: number
  column: number
  resolved: string
  resolvedType: string
  yaml11: string
  risk: 'high' | 'medium' | 'none'
  note: string
}

export type YamlStats = {
  anchors: number
  aliases: number
  mergeKeys: number
  blockScalars: number
  flowNodes: number
  tags: number
  multilineStrings: number
  topLevelKeys: number
  longestLine: number
  tabIndentedLines: number
}

export type YamlParseResult = {
  ok: boolean
  value: unknown
  issues: YamlIssue[]
  coercions: Coercion[]
  documents: number
  stats: YamlStats
}

const BOOL_11 = /^(y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF)$/
const BOOL_12 = /^(true|false|True|False|TRUE|FALSE)$/
const NULL_11 = /^(~|null|Null|NULL|)$/
const INT_12 = /^[-+]?(0|[1-9][0-9_]*)$/
const INT_HEX = /^[-+]?0x[0-9a-fA-F_]+$/
const INT_OCT_11 = /^[-+]?0[0-7_]+$/
const INT_OCT_12 = /^[-+]?0o[0-7_]+$/
const SEXAGESIMAL = /^[-+]?[0-9][0-9_]*(:[0-5]?[0-9])+$/
const FLOAT_12 = /^[-+]?(\.[0-9]+|[0-9][0-9_]*(\.[0-9_]*)?)([eE][-+]?[0-9]+)?$/
const FLOAT_SPECIAL = /^[-+]?\.(inf|Inf|INF|nan|NaN|NAN)$/
const TIMESTAMP_11 = /^\d{1,4}-\d{1,2}-\d{1,2}([Tt ].*)?$/
const VERSION_LIKE = /^\d+\.\d+(\.\d+)*$/

export type ScalarClass = {
  type12: string
  display12: string
  type11: string
  display11: string
  risk: Coercion['risk']
  note: string
}

/**
 * What does this plain (unquoted) scalar become under each version of the
 * language? This is the core of every silent YAML data-corruption bug.
 */
export function classifyScalar(raw: string): ScalarClass {
  const numeric = (value: string) => String(Number(value.replace(/_/g, '')))

  const type12 = (() => {
    if (BOOL_12.test(raw)) return 'boolean'
    if (NULL_11.test(raw)) return 'null'
    if (INT_HEX.test(raw) || INT_OCT_12.test(raw) || INT_12.test(raw)) return 'integer'
    if (FLOAT_SPECIAL.test(raw)) return 'float'
    if (FLOAT_12.test(raw) && !SEXAGESIMAL.test(raw)) return 'float'
    return 'string'
  })()
  const type11 = (() => {
    if (BOOL_11.test(raw)) return 'boolean'
    if (NULL_11.test(raw)) return 'null'
    if (SEXAGESIMAL.test(raw)) return 'integer (base 60)'
    if (TIMESTAMP_11.test(raw)) return 'timestamp'
    if (INT_HEX.test(raw) || INT_OCT_11.test(raw) || INT_OCT_12.test(raw) || INT_12.test(raw)) return 'integer'
    if (FLOAT_SPECIAL.test(raw) || FLOAT_12.test(raw)) return 'float'
    return 'string'
  })()

  const display12 = (() => {
    switch (type12) {
      case 'boolean':
        return raw.toLowerCase()
      case 'null':
        return raw === '' ? 'null  (from an empty value)' : raw === '~' ? 'null' : 'null'
      case 'integer':
        return numeric(raw.startsWith('0x') ? String(parseInt(raw.replace(/[+-]/, ''), 16)) : raw.startsWith('0o') ? String(parseInt(raw.replace(/[+-]|0o/g, ''), 8)) : raw)
      case 'float':
        return FLOAT_SPECIAL.test(raw) ? raw : numeric(raw)
      default:
        return JSON.stringify(raw)
    }
  })()
  const display11 = (() => {
    switch (type11) {
      case 'boolean':
        return /^(y|yes|true|on)$/i.test(raw) ? 'true' : 'false'
      case 'null':
        return 'null'
      case 'integer (base 60)': {
        const sign = raw.startsWith('-') ? -1 : 1
        const parts = raw.replace(/^[+-]/, '').split(':').map((p) => Number(p.replace(/_/g, '')) || 0)
        return String(sign * parts.reduce((acc, p) => acc * 60 + p, 0))
      }
      case 'timestamp':
        return 'Date object'
      case 'integer':
        if (INT_OCT_11.test(raw)) return String(parseInt(raw.replace(/[+-]|0/g, '').slice(0) , 8) || Number(`0${raw.replace(/[+-]/, '')}`))
        return numeric(raw)
      case 'float':
        return numeric(raw)
      default:
        return JSON.stringify(raw)
    }
  })()

  let risk: Coercion['risk'] = 'none'
  let note = ''
  if (/^(NO|No|no|N|n|OFF|Off|off|On|on|ON|YES|Yes|yes|Y|y|TRUE|True|FALSE|False)$/ .test(raw)) {
    risk = 'high'
    note = 'YAML 1.1 resolves this to a boolean; the 1.2 core schema keeps it as a string. ISO 3166-1 alpha-2 codes (Norway = NO), feature flags written as on/off, and "Y" answers change type depending on which parser a project happens to pull in.'
  } else if (INT_OCT_11.test(raw)) {
    risk = 'high'
    note = `A leading zero makes YAML 1.1 read "${raw}" as octal (${display11}). File modes such as 0755, zip codes and part numbers are the usual victims. Quote it, or write 0o755 for the 1.2 form.`
  } else if (SEXAGESIMAL.test(raw)) {
    risk = 'high'
    note = `YAML 1.1 sexagesimal int: "${raw}" becomes the integer ${display11} (base 60). Clock times and durations must be quoted.`
  } else if (TIMESTAMP_11.test(raw)) {
    risk = 'high'
    note = `YAML 1.1 parses the unquoted value "${raw}" into a timestamp, so exporters dump a Unix epoch or an ISO string with a time zone added — never the text you wrote.`
  } else if (VERSION_LIKE.test(raw)) {
    risk = 'medium'
    note = `Version-like text such as "${raw}" becomes the float ${display12}: the trailing zero disappears, so "1.10" is written back as 1.1. Quote semantic versions and package versions.`
  } else if (/^\d+$/.test(raw) && raw.length > 15) {
    risk = 'medium'
    note = 'Whole numbers longer than 15 digits exceed double precision, so the last digits are rewritten by any float-based parser. Quote long IDs.'
  } else if (type11 !== type12 && type11 !== 'string') {
    risk = 'medium'
    note = `A YAML 1.1 reader gives ${type11} (${display11}); a 1.2 core reader gives ${type12}. Quote the value if the type must be identical everywhere.`
  }
  return { type12, display12, type11, display11, risk, note }
}

export function countDocuments(source: string) {
  const markers = source.split(/\r\n|\r|\n/).filter((l) => l === '---' || l.startsWith('--- ')).length
  return Math.max(1, markers)
}

function cleanMessage(message: string) {
  return message.replace(/\s+at line \d+(, column \d+)?\.?$/i, '').trim()
}

function hintForYamlError(message: string) {
  const m = message.toLowerCase()
  if (m.includes('tab')) return 'YAML forbids tabs for indentation (spec §6.1 and §8.4): block structure is defined by exact column numbers, so a tab makes a key ambiguous. Replace tabs with spaces — this is the most common YAML syntax error.'
  if (m.includes('block sequence entries')) return 'A sequence entry needs "- " at the start of the line, with every dash in the same column as its siblings.'
  if (m.includes('implicit map') || m.includes('map keys') || m.includes('unexpected')) return 'Look for a missing space after a colon, an unquoted value containing ": " (URLs and "note: see below" both break), an unterminated quote, or indentation that does not line up with the sibling keys.'
  if (m.includes('anchor')) return 'An &anchor must be a plain, non-empty name, and every *alias must point at an anchor defined earlier in the document.'
  if (m.includes('tag')) return 'A custom !tag needs a matching %TAG directive or a schema that knows the tag.'
  if (m.includes('alias')) return 'Aliases and merge keys (<<) are YAML-only features with no JSON equivalent; check the anchor spelling and ordering.'
  return undefined
}

export function parseYaml(source: string): YamlParseResult {
  const issues: YamlIssue[] = []
  const coercions: Coercion[] = []
  const stats: YamlStats = {
    anchors: 0,
    aliases: 0,
    mergeKeys: 0,
    blockScalars: 0,
    flowNodes: 0,
    tags: 0,
    multilineStrings: 0,
    topLevelKeys: 0,
    longestLine: 0,
    tabIndentedLines: 0,
  }
  const lines = source.split(/\r\n|\r|\n/)
  stats.longestLine = lines.reduce((m, l) => Math.max(m, l.length), 0)
  stats.tabIndentedLines = lines.filter((l) => /^\t+/.test(l)).length

  if (source.charCodeAt(0) === 0xfeff)
    issues.push({
      severity: 'warning',
      code: 'bom',
      message: 'The stream starts with a byte order mark.',
      hint: 'A BOM is legal at the start of a UTF-8 stream but several loaders report "unexpected character" because it is not a YAML token.',
    })

  const doc = parseDocument(source, { prettyErrors: false, strict: true, logLevel: 'silent', merge: true })
  const lineAt = (offset?: number) => {
    if (offset === undefined) return { line: undefined as number | undefined, column: undefined as number | undefined }
    const clamped = Math.max(0, Math.min(offset, source.length))
    let line = 1
    for (let i = 0; i < clamped; i++) if (source[i] === '\n') line++
    const start = source.lastIndexOf('\n', Math.max(0, clamped - 1)) + 1
    return { line, column: clamped - start + 1 }
  }

  for (const e of doc.errors) {
    const pos = lineAt(e.pos?.[0])
    issues.push({ severity: 'error', code: 'yaml-error', message: cleanMessage(e.message), line: pos.line, column: pos.column, hint: hintForYamlError(e.message) })
  }
  for (const w of doc.warnings) {
    const pos = lineAt(w.pos?.[0])
    const duplicate = /duplicate/i.test(w.message)
    issues.push({
      severity: 'warning',
      code: duplicate ? 'duplicate-key' : 'yaml-warning',
      message: duplicate ? w.message : cleanMessage(w.message),
      line: pos.line,
      column: pos.column,
      hint: duplicate
        ? 'In a mapping a repeated key overwrites the earlier value with no error. The classic Kubernetes symptom: two overrides for the same field in one manifest, and only the last one is applied.'
        : undefined,
    })
  }
  if (stats.tabIndentedLines > 0)
    issues.push({
      severity: doc.errors.length ? 'error' : 'warning',
      code: 'tab-indent',
      message: `${stats.tabIndentedLines} line${stats.tabIndentedLines > 1 ? 's' : ''} indented with a tab.`,
      hint: 'YAML forbids tabs for indentation. Convert them to spaces before sharing the file — editors that display "tab width 4" hide this for the author and expose it for everyone else.',
    })

  if (doc.errors.length > 0) return { ok: false, value: null, issues, coercions, documents: countDocuments(source), stats }

  let value: unknown = null
  try {
    value = doc.toJS({ maxAliasCount: 1000, merge: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    issues.push({
      severity: 'error',
      code: 'compose-failed',
      message: cleanMessage(message),
      hint: /alias|anchor/i.test(message)
        ? 'An alias cannot be resolved, or the document exceeds the alias safety limit. Anchors (&), aliases (*) and merge keys (<<) are the YAML features with no JSON equivalent, and they are also the reason a YAML file can describe an exponentially large structure in a few kilobytes.'
        : undefined,
    })
    return { ok: false, value: null, issues, coercions, documents: countDocuments(source), stats }
  }

  // Visitor keys are capitalised node types: `Scalar`, `Map`, `Seq`, `Alias`.
  // A lowercase `node`/`value`/`key` key is silently ignored, which would leave
  // every stat at zero.
  const classify = (node: Node) => {
    if (node.anchor) stats.anchors++
    if (node.tag) stats.tags++
    if (!isScalar(node)) return
    if (node.type === 'BLOCK_LITERAL' || node.type === 'BLOCK_FOLDED') stats.blockScalars++
    if (typeof node.value === 'string' && node.value.includes('\n')) stats.multilineStrings++
    if (node.type !== 'PLAIN') return
    const raw = node.source
    if (typeof raw !== 'string' || raw.length === 0 || raw !== raw.trim()) return
    const cls = classifyScalar(raw)
    // Report version-dependent types and literals a numeric round trip rewrites
    // (`1e3` prints as 1000); a plain 1 resolves identically everywhere.
    const rewritten = cls.type12 !== 'string' && cls.display12 !== raw
    if (cls.risk === 'none' && !rewritten) return
    const pos = lineAt(node.range?.[0])
    coercions.push({
      raw,
      line: pos.line ?? 1,
      column: pos.column ?? 1,
      resolved: cls.display12,
      resolvedType: cls.type12,
      yaml11: `${cls.type11} ${cls.display11}`,
      risk: cls.risk,
      note: cls.note,
    })
  }

  visit(doc, {
    Scalar(key, node) {
      void key
      classify(node)
    },
    Alias(key, node) {
      void key
      stats.aliases++
    },
    Map(key, node) {
      classify(node)
      if (node.flow) stats.flowNodes++
      for (const item of node.items) {
        // With merge enabled the parser resolves the "<<" key, leaving `value`
        // empty, so the raw source is what identifies a merge key.
        const k = item.key
        if (isScalar(k) && (k.value === '<<' || k.source === '<<')) stats.mergeKeys++
      }
    },
    Seq(key, node) {
      classify(node)
      if (node.flow) stats.flowNodes++
    },
  })

  if (isMap(doc.contents)) stats.topLevelKeys = doc.contents.items.length

  const documents = countDocuments(source)
  if (documents > 1)
    issues.push({
      severity: 'info',
      code: 'multi-document',
      message: `This stream contains ${documents} documents separated by "---".`,
      hint: `Only the first document was converted. A YAML stream is a sequence of documents, so loaders such as js-yaml and Python's yaml.safe_load return a single value unless you use loadAll / safe_load_all.`,
      line: 1,
    })

  const ok = !issues.some((i) => i.severity === 'error')
  return { ok, value, issues, coercions, documents, stats }
}

export type YamlWriteOptions = {
  indent?: number
  quoteAll?: boolean
  quoteUnsafe?: boolean
  nullStr?: 'null' | '~' | 'empty'
  sortKeys?: boolean
  blockScalars?: boolean
  header?: string
  lineEnding?: 'lf' | 'crlf'
}

export type YamlWriteResult = {
  yaml: string
  protectedValues: { raw: string; reason: string }[]
  unrepresentable: string[]
}

const INDICATORS = "-?:,[]{}#&*!|>'\"%@`"

function needsQuotes(raw: string, protect11: boolean) {
  if (raw === '') return true
  if (/^\s|\s$/.test(raw)) return true
  if (/[\n\r\u0085\u2028\u2029]/.test(raw)) return true
  if (/[\u0000-\u0008\u000b-\u001f\u007f]/.test(raw)) return true
  if (INDICATORS.includes(raw[0])) return true
  if (/[:#]/.test(raw) && (/: |:\+$| #/.test(raw) || raw.endsWith(':'))) return true
  if (/\t/.test(raw)) return true
  const cls = classifyScalar(raw)
  if (cls.type12 !== 'string') return true
  if (protect11 && cls.type11 !== 'string') return true
  return false
}

function quoteScalar(raw: string): string {
  if (/[\\"\u0000-\u0008\u000b-\u001f\u007f-\u009f]/.test(raw) || /[\n\r]/.test(raw)) return JSON.stringify(raw)
  if (raw.includes("'")) return `"${raw}"`
  return `'${raw}'`
}

function safeBlockCandidate(value: string) {
  if (!/\n/.test(value)) return false
  if (value.startsWith(' ') || value.startsWith('\t')) return false
  const lines = value.split('\n')
  if (lines.some((l) => /\s$/.test(l))) return false
  if (lines[lines.length - 1] === '' && lines[lines.length - 2] === '') return false
  return true
}

function blockScalar(value: string, childPad: string): string[] {
  const endsWithNewline = value.endsWith('\n')
  const keepExtra = value.endsWith('\n\n')
  const header = keepExtra ? '|+' : endsWithNewline ? '|' : '|-'
  const body = value.replace(/\n+$/, '').split('\n')
  const lines = [header]
  for (const l of body) lines.push(l === '' ? '' : `${childPad}${l}`)
  if (keepExtra) lines.push('')
  else if (endsWithNewline) void 0
  return lines
}

export function writeYamlResult(value: unknown, options: YamlWriteOptions = {}): YamlWriteResult {
  const indent = Math.max(1, options.indent ?? 2)
  const quoteAll = options.quoteAll ?? false
  const protect11 = options.quoteUnsafe ?? true
  const nullToken = options.nullStr === '~' ? '~' : options.nullStr === 'empty' ? '' : 'null'
  const protectedValues: { raw: string; reason: string }[] = []
  const unrepresentable: string[] = []
  const pad = (depth: number) => ' '.repeat(depth * indent)
  const out: string[] = []
  if (options.header) out.push(...options.header.split('\n').map((l) => (l.trim().startsWith('#') ? l : `# ${l}`)))

  const seen = new WeakSet<object>()

  const scalar = (v: unknown): string => {
    if (v === null || v === undefined) return nullToken
    if (typeof v === 'boolean') return String(v)
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) {
        unrepresentable.push(`Non-finite number ${String(v)} emitted as a quoted string, because JSON's NaN/Infinity have no number form in the YAML core schema.`)
        return quoteScalar(String(v))
      }
      return String(v)
    }
    if (typeof v === 'bigint') {
      unrepresentable.push(`Integer ${String(v)} is outside JavaScript's safe range; written unquoted and needs a big-number-aware reader.`)
      return String(v)
    }
    const text = typeof v === 'string' ? v : String(v)
    const cls = classifyScalar(text)
    if (quoteAll) return JSON.stringify(text)
    if (needsQuotes(text, protect11)) {
      if (cls.type12 === 'string' && cls.type11 !== 'string')
        protectedValues.push({ raw: text, reason: `Quoted so a YAML 1.1 reader does not resolve it to ${cls.type11} (${cls.display11}).` })
      else if (/^\d/.test(text))
        protectedValues.push({ raw: text, reason: 'Quoted so it stays a string instead of becoming a number and losing formatting such as a leading zero or a trailing .0.' })
      return quoteScalar(text)
    }
    return text
  }

  const isContainer = (v: unknown) => v !== null && typeof v === 'object'

  const emitMap = (record: Record<string, unknown>, depth: number) => {
    const entries = Object.entries(record)
    if (options.sortKeys) entries.sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    for (const [key, val] of entries) {
      const safeKey = quoteAll || needsQuotes(key, protect11) ? quoteScalar(key) : key
      if (isContainer(val)) {
        const arr = Array.isArray(val) ? val : Object.values(val as object)
        const isEmpty = arr.length === 0
        if (isEmpty) {
          out.push(`${pad(depth)}${safeKey}: ${Array.isArray(val) ? '[]' : '{}'}`)
          continue
        }
        out.push(`${pad(depth)}${safeKey}:`)
        emit(val, depth + 1)
        continue
      }
      if (typeof val === 'string' && (options.blockScalars ?? true) && safeBlockCandidate(val)) {
        out.push(`${pad(depth)}${safeKey}:`)
        out.push(...blockScalar(val, pad(depth + 1)))
        continue
      }
      out.push(`${pad(depth)}${safeKey}: ${scalar(val)}`)
    }
  }

  const emitSeq = (items: unknown[], depth: number) => {
    for (const item of items) {
      if (isContainer(item)) {
        const childLines: string[] = []
        const innerPad = pad(depth)
        const capture = out.length
        emit(item, depth + 1)
        const produced = out.splice(capture)
        if (produced.length === 0) {
          out.push(`${innerPad}- ${Array.isArray(item) ? '[]' : '{}'}`)
          continue
        }
        const first = produced[0].slice((depth + 1) * indent)
        out.push(`${innerPad}- ${first}`)
        for (let i = 1; i < produced.length; i++) out.push(produced[i])
        continue
      }
      if (typeof item === 'string' && (options.blockScalars ?? true) && safeBlockCandidate(item)) {
        out.push(`${pad(depth)}-`)
        out.push(...blockScalar(item, pad(depth + 1)))
        continue
      }
      out.push(`${pad(depth)}- ${scalar(item)}`)
    }
  }

  function emit(v: unknown, depth: number) {
    if (v !== null && typeof v === 'object') {
      if (seen.has(v as object)) {
        unrepresentable.push('A cyclic structure was detected and written as a null placeholder; YAML anchors are required to express shared references.')
        out.push(`${pad(depth)}null`)
        return
      }
      seen.add(v as object)
      if (Array.isArray(v)) {
        if (v.length === 0 && depth > 0) {
          // handled by caller
        }
        emitSeq(v, depth)
        return
      }
      emitMap(v as Record<string, unknown>, depth)
      return
    }
    out.push(`${pad(depth)}${scalar(v)}`)
  }

  if (!isContainer(value)) {
    if (typeof value === 'string' && (options.blockScalars ?? true) && safeBlockCandidate(value)) {
      out.push(...blockScalar(value, ''))
    } else out.push(scalar(value))
  } else if (Array.isArray(value) && value.length === 0) out.push('[]')
  else if (!Array.isArray(value) && Object.keys(value as object).length === 0) out.push('{}')
  else emit(value, 0)

  const body = out.join('\n')
  const eol = options.lineEnding === 'crlf' ? '\r\n' : '\n'
  return { yaml: `${body}${body.endsWith('\n') ? '' : '\n'}`.replace(/\\$/, '').replace(/\n/g, eol), protectedValues, unrepresentable }
}

export function writeYaml(value: unknown, options: YamlWriteOptions = {}): string {
  return writeYamlResult(value, options).yaml
}

export type YamlToJsonResult = { json: string; yaml: YamlParseResult }

export function yamlToJson(source: string, indent = 2): YamlToJsonResult {
  const parsed = parseYaml(source)
  return { json: parsed.ok ? JSON.stringify(parsed.value, null, indent) : '', yaml: parsed }
}

export type JsonToYamlResult = { yaml: string; error?: YamlIssue; protectedValues: { raw: string; reason: string }[]; unrepresentable: string[] }

export function jsonToYaml(source: string, options: YamlWriteOptions = {}): JsonToYamlResult {
  const parsed = parseJson(source)
  if (!parsed.ok || !parsed.node) {
    const first = parsed.errors[0]
    return {
      yaml: '',
      error: first ? { severity: 'error', code: first.code, message: `Line ${first.line}, column ${first.column}: ${first.message}`, hint: first.hint, line: first.line, column: first.column } : { severity: 'error', code: 'invalid-json', message: 'The input is not valid JSON.' },
      protectedValues: [],
      unrepresentable: [],
    }
  }
  const written = writeYamlResult(toJsValue(parsed.node, true), options)
  return { yaml: written.yaml, protectedValues: written.protectedValues, unrepresentable: written.unrepresentable }
}
