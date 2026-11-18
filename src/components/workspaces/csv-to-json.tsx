'use client'

import * as React from 'react'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { SelectField, ToggleField } from '@/components/tool/controls'
import { auditCsvForSpreadsheetDamage, csvToJson, detectDelimiter, parseCsv, type CsvIssue, type CsvToJsonOptions } from '@/lib/tools/csv'

const SAMPLE = `id,name,zip,amount,joined,score
1,Anne Ås,00420,12.50,2026-01-07,9007199254740993
2,"Li, Wei",90210,7.25,2026-02-28,3.5
3,Gonzalo Ibáñez,28001,,2026-03-01,4
4,"Multi
line value",10001,-3.75,2026-04-15,2`

function IssueTable({ issues }: { issues: CsvIssue[] }) {
  if (issues.length === 0) return null
  const counts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1
    return acc
  }, {})
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5">
      <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Parse report</h2>
      <p className="mt-1 text-xs text-slate-500">
        {counts.error ?? 0} error(s), {counts.warning ?? 0} warning(s), {counts.info ?? 0} note(s).
      </p>
      <div className="scrollbar-thin mt-3 max-h-80 overflow-auto">
        <table className="w-full border-collapse text-[0.8125rem]">
          <thead className="sticky top-0 bg-slate-50 text-left">
            <tr>
              <th className="px-2.5 py-1.5 font-bold text-slate-600">Severity</th>
              <th className="px-2.5 py-1.5 font-bold text-slate-600">Where</th>
              <th className="px-2.5 py-1.5 font-bold text-slate-600">Issue</th>
            </tr>
          </thead>
          <tbody>
            {issues.slice(0, 60).map((issue, index) => (
              <tr key={`${issue.code}-${index}`} className="border-t border-slate-100 align-top">
                <td className="px-2.5 py-1.5">
                  <span
                    className={
                      issue.severity === 'error'
                        ? 'rounded bg-rose-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-rose-800'
                        : issue.severity === 'warning'
                          ? 'rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-amber-800'
                          : 'rounded bg-sky-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-sky-800'
                    }
                  >
                    {issue.severity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-xs text-slate-500">
                  {issue.row !== undefined ? `row ${issue.row}` : 'file'}
                  {issue.column !== undefined ? ` · col ${issue.column}` : ''}
                </td>
                <td className="px-2.5 py-1.5 text-slate-700">
                  {issue.message}
                  {issue.hint ? <span className="block text-xs text-slate-500">{issue.hint}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function CsvToJsonWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [delimiterMode, setDelimiterMode] = React.useState('auto')
  const [customDelimiter, setCustomDelimiter] = React.useState(';')
  const [hasHeader, setHasHeader] = React.useState(true)
  const [inferTypes, setInferTypes] = React.useState('safe')
  const [shape, setShape] = React.useState('array-of-objects')
  const [quoteStyle, setQuoteStyle] = React.useState('double')
  const [trimFields, setTrimFields] = React.useState(false)
  const [nullAsEmpty, setNullAsEmpty] = React.useState(true)

  const sniffed = React.useMemo(() => detectDelimiter(input), [input])
  const delimiter = delimiterMode === 'auto' ? sniffed.delimiter : delimiterMode === 'custom' ? customDelimiter : delimiterMode

  const model = React.useMemo(() => (input.trim() ? parseCsv(input, { delimiter, hasHeader, trimFields, skipBlankLines: true, quoteChar: '"', escapeStyle: quoteStyle as 'double' | 'backslash' }) : null), [input, delimiter, hasHeader, trimFields, quoteStyle])
  const audit = React.useMemo(() => (model?.ok ? auditCsvForSpreadsheetDamage(model) : []), [model])

  const result = React.useMemo(() => {
    if (!input.trim()) return null
    const options: CsvToJsonOptions = {
      csvOptions: { delimiter, hasHeader, trimFields, skipBlankLines: true, escapeStyle: quoteStyle as 'double' | 'backslash' },
      inferTypes: inferTypes as CsvToJsonOptions['inferTypes'],
      shape: shape as CsvToJsonOptions['shape'],
      indent: 2,
      nullTokens: ['NA', 'N/A', 'null', 'NULL'],
      keepBlankAs: nullAsEmpty ? 'null' : 'empty-string',
    }
    return csvToJson(input, options)
  }, [input, delimiter, hasHeader, trimFields, quoteStyle, inferTypes, shape, nullAsEmpty])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-5">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Delimiter</p>
          <SelectField
            ariaLabel="Delimiter"
            value={delimiterMode}
            onChange={setDelimiterMode}
            options={[
              { value: 'auto', label: `Auto — detected ${JSON.stringify(sniffed.delimiter)}` },
              { value: ',', label: 'Comma' },
              { value: '\t', label: 'Tab (TSV)' },
              { value: ';', label: 'Semicolon' },
              { value: '|', label: 'Pipe' },
              { value: 'custom', label: 'Custom…' },
            ]}
          />
          <p className="mt-1.5 text-xs leading-snug text-slate-500">{sniffed.reason}</p>
          {delimiterMode === 'custom' ? <input value={customDelimiter} onChange={(e) => setCustomDelimiter(e.target.value.slice(0, 1))} className="mt-1.5 w-16 rounded-lg border border-slate-300 px-2 py-1 font-mono text-sm" aria-label="Custom delimiter" /> : null}
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Type inference</p>
          <SelectField
            ariaLabel="Type inference"
            value={inferTypes}
            onChange={setInferTypes}
            options={[
              { value: 'none', label: 'All strings (safest)' },
              { value: 'safe', label: 'Safe — numbers and booleans only' },
              { value: 'aggressive', label: 'Aggressive — also nulls and dates' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">JSON shape</p>
          <SelectField
            ariaLabel="Output shape"
            value={shape}
            onChange={setShape}
            options={[
              { value: 'array-of-objects', label: 'Array of objects' },
              { value: 'array-of-arrays', label: 'Array of arrays' },
              { value: 'object-of-arrays', label: 'Object of column arrays' },
            ]}
          />
        </div>
        <ToggleField label="First row is a header" checked={hasHeader} onChange={setHasHeader} />
        <ToggleField label="Blank cell becomes null" hint="Off writes an empty string" checked={nullAsEmpty} onChange={setNullAsEmpty} />
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="CSV or TSV input"
          ariaLabel="CSV input"
          value={input}
          onChange={setInput}
          onSample={() => setInput(SAMPLE)}
          onFile={(content, filename) => setInput(content)}
          placeholder="Paste CSV text or drop a .csv / .tsv file…"
          stats={[
            { label: 'Lines', value: String(input.split(/\r?\n/).filter(Boolean).length) },
            { label: 'Bytes', value: String(bytesOf(input)) },
          ]}
        />
        <OutputPane
          label="JSON output"
          value={result?.json ?? ''}
          filename="converted.json"
          mime="application/json"
          stats={[
            { label: 'Records', value: result ? String(result.recordCount) : '—' },
            { label: 'Columns', value: result ? String(result.columnCount) : '—' },
            { label: 'Bytes', value: String(bytesOf(result?.json ?? '')) },
          ]}
        />
      </div>

      {model ? (
        <ResultBanner
          tone={model.meta.raggedRows > 0 ? 'warn' : 'good'}
          title={`Parsed ${model.meta.rowCount} record(s) into ${model.headers.length} column(s) with the ${JSON.stringify(model.meta.delimiter)} delimiter`}
          detail={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Line endings: {model.meta.lineEnding}</span>
              <span>BOM: {model.meta.bom ? 'present and stripped' : 'none'}</span>
              <span>Quoted cells: {model.meta.quotedCells}</span>
              <span>Cells with newlines: {model.meta.multilineCells}</span>
              <span>Ragged rows: {model.meta.raggedRows}</span>
              {result?.roundTripped ? <span>Round trip: identical</span> : <span>Round trip: differs</span>}
            </div>
          }
        />
      ) : null}

      {result && result.types.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Column typing decisions</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Inference mode “{inferTypes}”. A mixed column is one where the values do not agree, which usually means the file has a header inside the data or two record types merged.
          </p>
          <div className="scrollbar-thin mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-2.5 py-1.5 font-bold text-slate-600">Column</th>
                  <th className="px-2.5 py-1.5 font-bold text-slate-600">Inferred</th>
                  <th className="px-2.5 py-1.5 font-bold text-slate-600">Examples</th>
                  <th className="px-2.5 py-1.5 font-bold text-slate-600">Nulls</th>
                  <th className="px-2.5 py-1.5 font-bold text-slate-600">Mixed</th>
                </tr>
              </thead>
              <tbody>
                {result.types.map((column) => (
                  <tr key={column.column} className="border-t border-slate-100 align-top">
                    <td className="px-2.5 py-1.5 font-mono text-xs text-slate-900">{column.column}</td>
                    <td className="px-2.5 py-1.5">
                      <span className={column.mixed ? 'font-semibold text-amber-800' : 'font-semibold text-slate-800'}>{column.inferred}</span>
                    </td>
                    <td className="px-2.5 py-1.5 font-mono text-xs text-slate-600">{column.examples.join(' · ')}</td>
                    <td className="px-2.5 py-1.5 tabular-nums text-slate-600">{column.nulls}</td>
                    <td className="px-2.5 py-1.5">{column.mixed ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-amber-800">yes</span> : <span className="text-slate-400">no</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.precisionLoss > 0 ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[0.8125rem] leading-relaxed text-amber-900">
              {result.precisionLoss} value(s) were too large to be JSON numbers without rounding, so they were kept as strings. Switching inference to “aggressive” would not change that: the 53-bit mantissa limit is a property of the reader, not of this tool.
            </p>
          ) : null}
        </section>
      ) : null}

      {audit.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-amber-800">Spreadsheet risk in these values</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Cells a spreadsheet application is likely to reinterpret if the file is opened by double-clicking rather than imported with per-column types.
          </p>
          <ul className="mt-3 space-y-2">
            {audit.slice(0, 15).map((row, index) => (
              <li key={`${row.column}-${row.row}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[0.8125rem] leading-relaxed">
                <p className="font-mono text-xs text-slate-500">
                  {row.column} · row {row.row} · <span className="text-slate-900">{row.cell}</span>
                </p>
                <p className="mt-1 text-slate-800">{row.risk}</p>
                <p className="text-slate-600">{row.why}</p>
                <p className="mt-1 font-semibold text-emerald-800">Fix: {row.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <IssueTable issues={result?.issues ?? []} />

      {model ? (
        <StatGrid
          items={[
            { label: 'Rows', value: String(model.meta.rowCount) },
            { label: 'Columns', value: String(model.meta.maxColumnCount) },
            { label: 'Distinct widths', value: model.meta.columnCounts.filter((v, i, a) => a.indexOf(v) === i).length.toString(), note: 'More than 1 means ragged data' },
            { label: 'Ragged rows', value: String(model.meta.raggedRows), note: model.meta.raggedRows ? 'Padded or truncated at your call' : 'Uniform' },
            { label: 'Quoted cells', value: String(model.meta.quotedCells) },
            { label: 'Embedded newlines', value: String(model.meta.embeddedNewlines) },
            { label: 'Duplicate headers', value: String(model.meta.duplicateHeaders.length), note: model.meta.duplicateHeaders.join(', ') || 'None' },
            { label: 'JSON records', value: String(result?.recordCount ?? 0) },
          ]}
        />
      ) : null}
    </div>
  )
}
