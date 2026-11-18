/**
 * RFC 4180 CSV/TSV engine: state-machine parser with delimiter detection,
 * a writer with minimal-quoting rules, and a data-loss auditor for the
 * spreadsheet-orientation problems (formula injection, 15-digit precision,
 * leading zeros, Excel limits).
 */

import type { JsonNode } from './json'
import { parseJson, toJsValue } from './json'

export type CsvIssue = {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  hint?: string
  row?: number
  column?: number
  cell?: string
}

export type CsvParseOptions = {
  delimiter?: string | 'auto'
  quoteChar?: string
  escapeStyle?: 'double' | 'backslash'
  hasHeader?: boolean
  trimFields?: boolean
  skipBlankLines?: boolean
  commentChar?: string
}

export type CsvMeta = {
  delimiter: string
  delimiterReason: string
  lineEnding: 'CRLF' | 'LF' | 'CR' | 'mixed' | 'none'
  bom: boolean
  rowCount: number
  columnCounts: number[]
  raggedRows: number
  quotedCells: number
  multilineCells: number
  duplicateHeaders: string[]
  maxColumnCount: number
  embeddedNewlines: number
  headerCells: number
}

export type CsvModel = {
  rows: string[][]
  headers: string[]
  records: Record<string, string>[]
  issues: CsvIssue[]
  meta: CsvMeta
  ok: boolean
}

const CANDIDATE_DELIMITERS = [',', '\t', ';', '|']

export function detectDelimiter(text: string): { delimiter: string; reason: string } {
  const sample = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).slice(0, 40)
  if (sample.length === 0) return { delimiter: ',', reason: 'No data rows to analyse; the comma default was used.' }
  const scores = CANDIDATE_DELIMITERS.map((d) => {
    // Count only occurrences outside quoted sections of the first line.
    const counts = sample.map((line) => countOutsideQuotes(line, d))
    const first = counts[0] ?? 0
    const consistent = counts.filter((c) => c === first).length
    const variance = counts.length > 1 ? 1 - Math.min(1, stdev(counts) / (first || 1)) : 1
    return { delimiter: d, first, consistent, consistency: consistent / counts.length, variance, score: first * (consistent / counts.length) }
  }).filter((s) => s.first > 0)
  if (scores.length === 0) return { delimiter: ',', reason: 'No candidate delimiter appears in the data, so the field count is 1 per row.' }
  scores.sort((a, b) => b.score - a.score || a.delimiter.localeCompare(b.delimiter))
  const best = scores[0]
  const runner = scores[1]
  const reason =
    best.consistency >= 0.9
      ? `"${describe(best.delimiter)}" appears ${best.first}× on line 1 and in the same count in ${best.consistent}/${sample.length} sampled lines.`
      : `"${describe(best.delimiter)}" scored highest (${best.first} occurrences, ${Math.round(best.consistency * 100)}% row consistency) but the counts vary, so set the delimiter explicitly.`
  if (runner && runner.consistency >= 0.9 && Math.abs(runner.first - best.first) <= 1) {
    return {
      delimiter: best.delimiter,
      reason: `Ambiguous: both ${describe(best.delimiter)} (${best.first}×) and ${describe(runner.delimiter)} (${runner.first}×) fit the data. Confirm before trusting the split.`,
    }
  }
  return { delimiter: best.delimiter, reason }
}

function describe(d: string) {
  return d === '\t' ? 'tab (\\t)' : d === ',' ? 'comma (,)' : d === ';' ? 'semicolon (;)' : d === '|' ? 'pipe (|)' : JSON.stringify(d)
}

function countOutsideQuotes(line: string, needle: string) {
  let count = 0
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') inQuotes = !inQuotes
    else if (!inQuotes && c === needle) count++
  }
  return count
}

function stdev(values: number[]) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length)
}

export function parseCsv(input: string, options: CsvParseOptions = {}): CsvModel {
  const issues: CsvIssue[] = []
  const text = input
  const bom = text.charCodeAt(0) === 0xfeff
  if (bom)
    issues.push({
      severity: 'info',
      code: 'bom',
      message: 'A UTF-8 byte order mark (EF BB BF) starts the file.',
      hint: 'Excel on Windows needs the BOM to read a UTF-8 CSV correctly, but RFC 4180 does not define it and most server-side parsers treat it as part of the first header name ("\\ufeffid"). Strip it before ingesting data.',
    })
  const body = bom ? text.slice(1) : text

  const auto = !options.delimiter || options.delimiter === 'auto'
  const detected = auto ? detectDelimiter(body) : { delimiter: options.delimiter as string, reason: 'Delimiter set explicitly.' }
  const delimiter = detected.delimiter
  const quote = options.quoteChar ?? '"'
  const backslashEscape = options.escapeStyle === 'backslash'

  let lf = 0
  let crlf = 0
  let loneCr = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '\n') {
      if (body[i - 1] === '\r') crlf++
      else lf++
    } else if (body[i] === '\r' && body[i + 1] !== '\n') loneCr++
  }
  const kinds = [crlf > 0, lf > 0, loneCr > 0].filter(Boolean).length
  const lineEnding: CsvMeta['lineEnding'] = kinds > 1 ? 'mixed' : kinds === 0 ? 'none' : crlf > 0 ? 'CRLF' : lf > 0 ? 'LF' : 'CR'
  if (kinds > 1)
    issues.push({
      severity: 'warning',
      code: 'mixed-line-endings',
      message: `The file mixes ${crlf ? 'CRLF ' : ''}${lf ? 'LF ' : ''}${loneCr ? 'CR' : ''} line endings.`,
      hint: 'RFC 4180 §2 says lines SHOULD end with CRLF, but parsers that split on \\n alone will treat a quoted field containing a bare CR as unterminated. Normalise before loading into a database.',
    })
  else if (lineEnding === 'CR')
    issues.push({
      severity: 'warning',
      code: 'cr-only',
      message: 'Lines end with a carriage return only (Classic Mac style).',
      hint: 'Splitting on \\n treats the entire file as one row. Convert to \\r\\n or \\n.',
    })

  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let fieldWasQuoted = false
  let rowStart = 1
  let line = 1
  let quotedCells = 0
  let multilineCells = 0
  let embeddedNewlines = 0

  const endField = () => {
    const value = options.trimFields ? field.trim() : field
    if (fieldWasQuoted) quotedCells++
    if (value.includes('\n') || value.includes('\r')) multilineCells++
    row.push(value)
    field = ''
    fieldWasQuoted = false
  }
  const endRow = () => {
    endField()
    if (options.skipBlankLines && row.length === 1 && row[0] === '') {
      row = []
      rowStart = line + 1
      return
    }
    rows.push(row)
    row = []
    rowStart = line + 1
  }

  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '\n') line++
    if (inQuotes) {
      if (c === '\\' && backslashEscape && (body[i + 1] === quote || body[i + 1] === '\\')) {
        field += body[i + 1]
        i++
        continue
      }
      if (c === quote) {
        if (body[i + 1] === quote && !backslashEscape) {
          field += quote
          i++
          continue
        }
        inQuotes = false
        continue
      }
      if (c === '\n' || c === '\r') embeddedNewlines++
      field += c
      continue
    }
    if (c === quote && field === '') {
      inQuotes = true
      fieldWasQuoted = true
      continue
    }
    if (c === quote && field !== '') {
      if (body[i + 1] === delimiter || body[i + 1] === '\n' || body[i + 1] === '\r' || body[i + 1] === undefined) {
        issues.push({
          severity: 'warning',
          code: 'quote-not-at-start',
          message: `Line ${line}: a quote appears mid-field ("${field}${quote}…"), so the quoting is not being used as a field boundary.`,
          hint: 'RFC 4180 §2.6 says quotes are only allowed to open a field or, doubled, inside one. Some writers quote after trailing spaces, which most parsers read as literal characters.',
          row: line,
          cell: `${field}${quote}`,
        })
        field += quote
        continue
      }
      // "abc"def  → the quote closed the field and extra text follows
      issues.push({
        severity: 'warning',
        code: 'text-after-closing-quote',
        message: `Line ${line}: characters follow a closing quote, so they are either appended to the quoted value or lost.`,
        hint: 'This is the classic symptom of a hand-written writer that only quotes when it sees a comma. The value is kept as written here; other parsers may truncate it.',
        row: line,
        cell: `${field}${quote}`,
      })
      field += quote
      continue
    }
    if (c === delimiter) {
      endField()
      continue
    }
    if (c === '\r') {
      if (body[i + 1] === '\n') i++
      endRow()
      continue
    }
    if (c === '\n') {
      endRow()
      continue
    }
    if (c === '\\' && backslashEscape) {
      field += body[i + 1] ?? '\\'
      i++
      continue
    }
    field += c
  }
  if (inQuotes) {
    issues.push({
      severity: 'error',
      code: 'unterminated-quote',
      message: `A quoted field opened on line ${rowStart} is never closed.`,
      hint: 'Everything after that quote was consumed as one field, which is why the row count looks wrong. Usually an unescaped quote inside free text such as a product description or a CSV exported from a query that did not double the quotes.',
      row: rowStart,
    })
    rows.push([...row, field])
  } else if (field !== '' || row.length > 0) {
    endRow()
  }

  const meta: CsvMeta = {
    delimiter,
    delimiterReason: detected.reason,
    lineEnding,
    bom,
    rowCount: rows.length,
    columnCounts: rows.map((r) => r.length),
    maxColumnCount: rows.reduce((m, r) => Math.max(m, r.length), 0),
    raggedRows: 0,
    quotedCells,
    multilineCells,
    duplicateHeaders: [],
    embeddedNewlines,
    headerCells: 0,
  }

  if (rows.length === 0) {
    issues.push({ severity: 'error', code: 'empty', message: 'No rows found — the input is empty.' })
    return { rows: [], headers: [], records: [], issues, meta, ok: false }
  }

  const hasHeader = options.hasHeader !== false && rows.length > 0
  const headerRow = hasHeader ? rows[0] : []
  const headers = hasHeader
    ? headerRow.map((h, idx) => (h.trim() === '' ? `column_${idx + 1}` : h))
    : rows[0].map((_, idx) => `column_${idx + 1}`)
  const dataRows = hasHeader ? rows.slice(1) : rows

  if (hasHeader) {
    meta.headerCells = headerRow.length
    const seen = new Map<string, number>()
    headerRow.forEach((h, i) => {
      const key = h.trim()
      if (key === '')
        issues.push({
          severity: 'warning',
          code: 'blank-header',
          message: `Column ${i + 1} has an empty header.`,
          hint: `Renamed to "${headers[i]}" for JSON output. Duplicate or empty headers are the most common reason a CSV→JSON conversion silently drops data.`,
          column: i + 1,
        })
      seen.set(key, (seen.get(key) ?? 0) + 1)
    })
    meta.duplicateHeaders = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k)
    if (meta.duplicateHeaders.length)
      issues.push({
        severity: 'error',
        code: 'duplicate-header',
        message: `Duplicate header name${meta.duplicateHeaders.length > 1 ? 's' : ''}: ${meta.duplicateHeaders.map((h) => `"${h}"`).join(', ')}.`,
        hint: 'Turning rows into objects forces one key per column, so all but the last value per duplicate name are lost. Rename the columns, or choose the array-of-arrays output shape.',
      })
    if (headerRow.some((h) => /^\d+$/.test(h.trim())))
      issues.push({
        severity: 'info',
        code: 'numeric-header',
        message: 'A header is all digits, which usually means a data row was read as the header.',
        hint: 'Turn off "first row is a header", or check whether the file lost its header line during export.',
      })
  }

  const columnCount = hasHeader ? headerRow.length : meta.maxColumnCount
  let ragged = 0
  dataRows.forEach((r, idx) => {
    if (r.length !== columnCount) {
      ragged++
      const at = hasHeader ? idx + 2 : idx + 1
      if (ragged <= 8)
        issues.push({
          severity: r.length < columnCount ? 'warning' : 'error',
          code: 'ragged-row',
          message: `Line ${at} has ${r.length} fields but the header row has ${columnCount}.`,
          hint:
            r.length > columnCount
              ? 'Extra fields are usually unquoted delimiters inside free text — a city like "San Francisco, CA" or a title with a comma. Those values are silently split into two columns.'
              : 'Short rows are often a trailing delimiter, a blank line, or a quoted field containing a newline that the writer did not quote correctly.',
          row: at,
        })
    }
  })
  meta.raggedRows = ragged
  if (ragged > 8)
    issues.push({ severity: 'info', code: 'ragged-more', message: `${ragged - 8} more rows have a different field count (not listed individually).` })

  const records = dataRows.map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = i < r.length ? r[i] : ''
    })
    return obj
  })

  const controlCells = countCells(dataRows, (v) => /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))
  if (controlCells)
    issues.push({
      severity: 'warning',
      code: 'control-characters',
      message: `${controlCells} cell${controlCells > 1 ? 's' : ''} contain control characters.`,
      hint: 'Vertical tab and form feed survive CSV but break line-based parsers, and Excel replaces them with a space when the file is reopened.',
    })

  const ok = !issues.some((i) => i.severity === 'error')
  return { rows, headers, records, issues, meta, ok }
}

function countCells(rows: string[][], predicate: (v: string) => boolean) {
  let n = 0
  for (const r of rows) for (const v of r) if (predicate(v)) n++
  return n
}

export type CsvWriteOptions = {
  delimiter?: string
  quoteStyle?: 'minimal' | 'all' | 'numeric-safe'
  lineEnding?: 'lf' | 'crlf'
  bom?: boolean
  nullValue?: string
  emptyValue?: string
  objectEncoding?: 'json' | 'stringify'
  floatDecimals?: number | null
}

function fieldNeedsQuotes(value: string, delimiter: string, quote: string) {
  if (value === '') return false
  if (value.includes(delimiter) || value.includes(quote)) return true
  if (/[\n\r\u2028\u2029]/.test(value)) return true
  // Leading/trailing whitespace is significant per RFC 4180 §2.4 but Excel and
  // many parsers trim it on unquoted fields, so quoting preserves the data.
  if (/^\s|\s$/.test(value)) return true
  if (/^[=+\-@]/.test(value) && value.length > 1) return true
  return false
}

export function quoteField(value: string, delimiter: string, quote: string, style: CsvWriteOptions['quoteStyle']) {
  const escaped = value.split(quote).join(quote + quote)
  if (style === 'all') return `${quote}${escaped}${quote}`
  if (style === 'numeric-safe') {
    const looksNumeric = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)
    if (looksNumeric) return `${quote}${value}${quote}`
  }
  return fieldNeedsQuotes(value, delimiter, quote) ? `${quote}${escaped}${quote}` : value
}

export function writeCsv(rows: string[][], options: CsvWriteOptions = {}): string {
  const delimiter = options.delimiter ?? ','
  const quote = '"'
  const eol = options.lineEnding === 'lf' ? '\n' : '\r\n'
  const lines = rows.map((r) => r.map((cell) => quoteField(cell ?? '', delimiter, quote, options.quoteStyle ?? 'minimal')).join(delimiter))
  const body = lines.join(eol)
  const withTerminator = body.length ? `${body}${eol}` : body
  const bomPrefix = options.bom ? '\ufeff' : ''
  return bomPrefix + withTerminator
}

export type JsonToCsvOptions = {
  delimiter?: string
  pathStyle?: 'dot' | 'underscore' | 'bracket' | 'none'
  maxDepth?: number
  arrayStyle?: 'index' | 'join' | 'json'
  columnOrder?: 'first-seen' | 'alphabetical' | 'deepest-first'
  writeOptions?: CsvWriteOptions
  keepUndefinedAsEmpty?: boolean
}

export type JsonToCsvResult = {
  csv: string
  headers: string[]
  rowCount: number
  shape: string
  issues: CsvIssue[]
  nestedPaths: number
  arraysJoined: number
  jsonEncodedCells: number
}

function pathJoin(prefix: string, key: string, style: JsonToCsvOptions['pathStyle']) {
  if (!prefix) return key
  if (style === 'underscore') return `${prefix}_${key}`
  if (style === 'bracket') return `${prefix}[${key}]`
  return `${prefix}.${key}`
}

function stringifyCell(value: unknown, options: JsonToCsvOptions, counters: { json: number; joined: number }) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (Array.isArray(value)) {
    if (options.arrayStyle === 'join' && value.every((v) => v === null || typeof v !== 'object')) {
      counters.joined++
      return value.map((v) => (v ?? '') as unknown as string).join('; ')
    }
    counters.json++
    return JSON.stringify(value)
  }
  counters.json++
  return JSON.stringify(value)
}

function collectPaths(value: unknown, prefix: string, options: JsonToCsvOptions, out: Record<string, string>, depth = 0, counters = { json: 0, joined: 0 }) {
  const maxDepth = options.maxDepth ?? 3
  const style = options.pathStyle ?? 'dot'
  if (Array.isArray(value) && looksLikeScalarArray(value)) {
    out[prefix || 'value'] = stringifyCell(value, options, counters)
    return
  }
  if (value && typeof value === 'object' && depth < maxDepth) {
    const entries: [string, unknown][] = Array.isArray(value)
      ? value.map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      out[prefix || 'value'] = '{}'
      return
    }
    for (const [k, v] of entries) collectPaths(v, prefix ? pathJoin(prefix, k, style) : k, options, out, depth + 1, counters)
    return
  }
  out[prefix || 'value'] = stringifyCell(value, options, counters)
}

function looksLikeScalarArray(value: unknown[]) {
  return value.every((v) => v === null || typeof v !== 'object')
}

export function jsonToCsv(source: string, options: JsonToCsvOptions = {}): JsonToCsvResult {
  const issues: CsvIssue[] = []
  const parsed = parseJson(source)
  if (!parsed.ok || !parsed.node) {
    const first = parsed.errors[0]
    return {
      csv: '',
      headers: [],
      rowCount: 0,
      shape: 'invalid',
      issues: [
        {
          severity: 'error',
          code: 'invalid-json',
          message: first ? `Line ${first.line}, column ${first.column}: ${first.message}` : 'The input is not valid JSON.',
          hint: first?.hint,
        },
      ],
      nestedPaths: 0,
      arraysJoined: 0,
      jsonEncodedCells: 0,
    }
  }
  const value = toJsValue(parsed.node)
  const counters = { json: 0, joined: 0 }
  const flatten = (record: unknown, prefix = '', depth = 0, out: Record<string, string> = {}) => {
    const style = options.pathStyle ?? 'dot'
    if (record === null || record === undefined) {
      out[prefix || 'value'] = ''
      return out
    }
    if (typeof record !== 'object') {
      out[prefix || 'value'] = stringifyCell(record, options, counters)
      return out
    }
    if (Array.isArray(record)) {
      if (looksLikeScalarArray(record)) {
        out[prefix || 'value'] = stringifyCell(record, options, counters)
        return out
      }
      const entries: [string, unknown][] = record.map((v, i) => [String(i), v])
      for (const [k, v] of entries) flatten(v, prefix ? pathJoin(prefix, k, style) : k, depth + 1, out)
      return out
    }
    const entries = Object.entries(record as Record<string, unknown>)
    if (entries.length === 0) {
      out[prefix || 'value'] = '{}'
      return out
    }
    for (const [k, v] of entries) flatten(v, prefix ? pathJoin(prefix, k, style) : k, depth + 1, out)
    return out
  }

  let records: unknown[] = []
  let shape = ''
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { csv: '', headers: [], rowCount: 0, shape: 'empty-array', issues: [{ severity: 'error', code: 'empty-array', message: 'The JSON array is empty, so there are no rows to write.', hint: 'CSV needs at least one record to infer columns.' }], nestedPaths: 0, arraysJoined: 0, jsonEncodedCells: 0 }
    }
    const allObjects = value.every((v) => v && typeof v === 'object' && !Array.isArray(v))
    if (allObjects) {
      records = value
      shape = 'array-of-objects'
    } else if (value.every((v) => Array.isArray(v))) {
      const rows = value as unknown[][]
      const width = Math.max(...rows.map((r) => r.length))
      const table = rows.map((r) => Array.from({ length: width }, (_, i) => stringifyCell(r[i], options, counters)))
      return { csv: writeCsv(table, options.writeOptions), headers: Array.from({ length: width }, (_, i) => `column_${i + 1}`), rowCount: rows.length, shape: 'array-of-arrays', issues: [{ severity: 'info', code: 'array-of-arrays', message: 'Top-level array of arrays: written as a headerless table.', hint: 'JSON does not record which row was the header, so add one yourself if needed.' }], nestedPaths: 0, arraysJoined: counters.joined, jsonEncodedCells: counters.json }
    } else if (value.every((v) => v === null || typeof v !== 'object')) {
      const table = [ ['value'], ...value.map((v) => [String(v ?? '')]) ]
      return { csv: writeCsv(table, { ...options.writeOptions, bom: options.writeOptions?.bom }), headers: ['value'], rowCount: value.length, shape: 'array-of-scalars', issues: [{ severity: 'info', code: 'array-of-scalars', message: 'A flat array was written as a single "value" column because CSV has no way to express a bare list otherwise.' }], nestedPaths: 0, arraysJoined: 0, jsonEncodedCells: 0 }
    } else {
      records = value
      shape = 'mixed-array'
      issues.push({
        severity: 'warning',
        code: 'mixed-array',
        message: 'The array holds objects, arrays and scalars together.',
        hint: 'Each element is flattened independently; scalars land in a column called "value". This is a sign the payload is not a table.',
      })
    }
  } else if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const allObjects = entries.every(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
    if (allObjects && entries.length > 0) {
      records = entries.map(([k, v]) => ({ key: k, ...(v as Record<string, unknown>) }))
      shape = 'object-of-objects'
      issues.push({
        severity: 'info',
        code: 'object-of-objects',
        message: 'The top level is a map of objects, so each map key was emitted as a "key" column.',
        hint: 'JSON objects are unordered while CSV rows are positional; converting a dictionary keeps its keys only by turning them into a column.',
      })
    } else {
      records = [value]
      shape = 'single-object'
    }
  } else {
    return { csv: writeCsv([['value'], [String(value ?? '')]], options.writeOptions), headers: ['value'], rowCount: 1, shape: 'scalar', issues: [{ severity: 'warning', code: 'scalar-root', message: 'The JSON root is a single scalar, so the CSV has one cell.', hint: 'CSV is a table format; a bare string or number cannot be represented meaningfully. Wrap it in an object or array.' }], nestedPaths: 0, arraysJoined: 0, jsonEncodedCells: 0 }
  }

  const flattened = records.map((r) => flatten(r))
  const headerSet: string[] = []
  const seen = new Set<string>()
  if (options.columnOrder === 'alphabetical') {
    const all = new Set<string>()
    flattened.forEach((f) => Object.keys(f).forEach((k) => all.add(k)))
    headerSet.push(...[...all].sort((a, b) => a.localeCompare(b, 'en')))
  } else {
    for (const f of flattened) for (const k of Object.keys(f)) if (!seen.has(k)) (seen.add(k), headerSet.push(k))
  }

  const sparse = flattened.filter((f) => Object.keys(f).length !== headerSet.length).length
  if (sparse > 0)
    issues.push({
      severity: 'info',
      code: 'heterogeneous-records',
      message: `${sparse} of ${flattened.length} records do not have exactly the ${headerSet.length} union columns.`,
      hint: 'JSON allows every object to have different keys; CSV cannot. Missing keys become empty cells, which downstream readers may interpret as null or as an empty string.',
    })

  void collectPaths
  const table = [headerSet, ...flattened.map((f) => headerSet.map((h) => f[h] ?? ''))]
  const csv = writeCsv(table, options.writeOptions)
  const nestedPaths = headerSet.filter((h) => /[._[\]]/.test(h)).length
  return {
    csv,
    headers: headerSet,
    rowCount: flattened.length,
    shape,
    issues,
    nestedPaths,
    arraysJoined: counters.joined,
    jsonEncodedCells: counters.json,
  }
}

export type CsvToJsonOptions = {
  csvOptions?: CsvParseOptions
  inferTypes?: 'none' | 'safe' | 'aggressive'
  shape?: 'array-of-objects' | 'array-of-arrays' | 'object-of-arrays'
  nullTokens?: string[]
  indent?: number | 'tab'
  keepBlankAs?: 'null' | 'empty-string'
}

export type CsvToJsonResult = {
  json: string
  node: JsonNode | null
  recordCount: number
  columnCount: number
  types: { column: string; inferred: string; examples: string[]; mixed: boolean; nulls: number }[]
  issues: CsvIssue[]
  precisionLoss: number
  roundTripped: boolean
}

const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/

export function inferCell(value: string, mode: CsvToJsonOptions['inferTypes'], nullTokens: string[]) {
  if (mode === 'none') return { value, type: 'string' }
  const trimmed = value.trim()
  if (trimmed === '' && (mode === 'aggressive' || value === '')) return { value: null, type: 'null' }
  if (nullTokens.map((t) => t.trim().toUpperCase()).includes(trimmed.toUpperCase())) return { value: null, type: 'null' }
  if (mode === 'aggressive' && /^(true|false)$/i.test(trimmed)) return { value: trimmed.toLowerCase() === 'true', type: 'boolean' }
  if (!/^(true|false)$/.test(trimmed) && !NUMBER_RE.test(trimmed)) return { value, type: 'string' }
  if (/^(true|false)$/.test(trimmed)) return { value: trimmed === 'true', type: 'boolean' }
  const asNumber = Number(trimmed)
  const safe = NUMBER_RE.test(trimmed)
  if (!safe || !Number.isFinite(asNumber)) return { value, type: 'string' }
  const roundTrips = String(asNumber) === trimmed || Number(String(asNumber)) === asNumber
  const digits = trimmed.replace(/[-+.]/g, '').replace(/^0+/, '').length
  if (!Number.isSafeInteger(asNumber) && Number.isInteger(asNumber)) return { value, type: 'string-unsafe-number' }
  if (digits > 15) return { value, type: 'string-long-number' }
  if (!roundTrips) return { value, type: 'string-noncanonical-number' }
  return { value: asNumber, type: Number.isInteger(asNumber) ? 'integer' : 'float' }
}

export function csvToJson(source: string, options: CsvToJsonOptions = {}): CsvToJsonResult {
  const model = parseCsv(source, options.csvOptions ?? {})
  const issues = [...model.issues]
  const mode = options.inferTypes ?? 'safe'
  const nullTokens = options.nullTokens ?? ['NULL', 'N/A']
  const typeReport = new Map<string, { numbers: number; floats: number; ints: number; bools: number; strings: number; nulls: number; unsafe: number; examples: string[] }>()

  const records = model.records.map((row, rowIndex) => {
    const out: Record<string, unknown> = {}
    for (const [key, raw] of Object.entries(row)) {
      const inferred = inferCell(raw, mode, nullTokens)
      const bucket = typeReport.get(key) ?? { numbers: 0, floats: 0, ints: 0, bools: 0, strings: 0, nulls: 0, unsafe: 0, examples: [] }
      if (inferred.type.startsWith('string-')) {
        bucket.unsafe++
        if (inferred.type === 'string-unsafe-number')
          issues.push({
            severity: 'warning',
            code: 'unsafe-integer',
            message: `Column "${key}" row ${rowIndex + 2}: ${raw} is a whole number above 2^53−1.`,
            hint: 'Converted to a number it loses its last digits in JavaScript and any double-based backend, so it was left as a string. Keep identifiers as strings on purpose.',
            row: rowIndex + 2,
            column: model.headers.indexOf(key) + 1,
          })
        bucket.strings++
      } else if (inferred.type === 'null') bucket.nulls++
      else if (inferred.type === 'boolean') bucket.bools++
      else if (inferred.type === 'integer') bucket.ints++
      else if (inferred.type === 'float') bucket.floats++
      else bucket.strings++
      if (bucket.examples.length < 2 && (inferred.type === 'integer' || inferred.type === 'float')) bucket.examples.push(raw)
      typeReport.set(key, bucket)
      out[key] = inferred.value
    }
    return out
  })

  let payload: unknown = records
  const shape = options.shape ?? 'array-of-objects'
  if (shape === 'array-of-arrays') payload = model.meta.duplicateHeaders.length ? model.rows : model.rows.slice(1)
  if (shape === 'object-of-arrays') {
    const columns: Record<string, unknown[]> = {}
    for (const key of model.headers) columns[key] = records.map((r) => r[key])
    payload = columns
  }

  const types = [...typeReport.entries()].map(([column, b]) => {
    const kinds = [b.ints > 0, b.floats > 0, b.bools > 0, b.strings > 0, b.nulls > 0].filter(Boolean).length
    const inferred = b.strings ? (kinds > 1 ? 'string (mixed)' : 'string') : b.ints && !b.floats ? 'integer' : b.floats ? 'number' : b.bools ? 'boolean' : 'null'
    return { column, inferred, examples: b.examples, mixed: kinds > 1, nulls: b.nulls }
  })

  const precisionLoss = types.filter((t) => t.inferred.includes('mixed')).length
  const spacing = options.indent === 'tab' ? '\t' : ' '.repeat(options.indent ?? 2)
  const json = JSON.stringify(payload, null, spacing)
  const reparsed = parseJson(json)
  return {
    json,
    node: reparsed.node,
    recordCount: records.length,
    columnCount: model.headers.length,
    types,
    issues,
    precisionLoss,
    roundTripped: reparsed.ok,
  }
}

export type CsvAuditRow = {
  cell: string
  column: string
  row: number
  risk: string
  why: string
  fix: string
}

export function auditCsvForSpreadsheetDamage(model: CsvModel): CsvAuditRow[] {
  const rows: CsvAuditRow[] = []
  const limit = 40
  const push = (r: Omit<CsvAuditRow, 'row'> & { row: number }) => {
    if (rows.length < limit) rows.push(r)
  }
  model.records.forEach((record, index) => {
    for (const [column, value] of Object.entries(record)) {
      if (value === undefined) continue
      const trimmed = value.trim()
      if (/^[=+@]/.test(trimmed) || (/^-[\d.]/.test(trimmed) === false && /^-[^0-9.]/.test(trimmed))) {
        push({
          cell: value,
          column,
          row: index + 2,
          risk: 'Formula injection (DFXP)',
          why: 'Excel, LibreOffice and Google Sheets treat a cell starting with = + − or @ as a formula, so it can execute on open or exfiltrate data through HYPERLINK/WEBSERVICE.',
          fix: 'Prefix with a single quote or convert to text when importing; sanitise in the writer, not in the viewer.',
        })
      }
      if (/^0\d{1,}$/.test(trimmed)) {
        push({
          cell: value,
          column,
          row: index + 2,
          risk: 'Leading zero dropped',
          why: 'A number-typed cell stores 00123 as 123, which destroys zip codes, phone numbers, IBANs and part numbers.',
          fix: 'Force the column to text on import, or keep it quoted.',
        })
      }
      if (/^\d{12,}$/.test(trimmed)) {
        push({
          cell: value,
          column,
          row: index + 2,
          risk: 'Precision loss / scientific notation',
          why: 'Spreadsheets keep about 15 significant digits and switch longer values to 1.23457E+17, which also drops trailing zeros permanently.',
          fix: 'Import the column as text, or add ="…" quoting from the writer.',
        })
      }
      if (/^(SEPT|DEC|MARCH?|APRIL?|JUNE?|JULY?|OCTOBER|NOVEMBER|DESMAR|_19)$/i.test(trimmed)) {
        push({
          cell: value,
          column,
          row: index + 2,
          risk: 'Gene symbol autocorrect',
          why: 'Excel rewrites symbols such as MARCH, SEP1 and DEC1 as dates. A 2016 GigaScience audit found at least one such corruption in 20% of the spreadsheets of genomics papers it sampled.',
          fix: 'Prefix the column with a tab or import as text; never open the file with a double click.',
        })
      }
      if (trimmed.length > 8192) {
        push({
          cell: `${trimmed.slice(0, 60)}…`,
          column,
          row: index + 2,
          risk: 'Excel cell length limit',
          why: 'A spreadsheet cell holds 32,767 characters and long text is truncated or reformatted on open even though the CSV itself is intact.',
          fix: 'Keep long text out of spreadsheet-bound CSVs; store it as a file reference.',
        })
      }
    }
  })
  if (model.meta.maxColumnCount > 16384)
    rows.push({ cell: '', column: '(all)', row: 1, risk: 'Excel column limit', why: 'XLSX supports 16,384 columns; wider files are cut off.', fix: 'Rotate the data or load it with a database import.' })
  if (model.rows.length > 1048576)
    rows.push({ cell: '', column: '(all)', row: 1, risk: 'Excel row limit', why: 'A single XLSX worksheet holds 1,048,576 rows.', fix: 'Split the file or use a streaming loader.' })
  return rows
}

export { countCells }
