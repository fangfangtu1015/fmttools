'use client'

import * as React from 'react'
import { NumberField, Segmented, SelectField, ToggleField } from '@/components/tool/controls'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { jsonStats, parseJson, printNode, printMinified, type Diagnostic } from '@/lib/tools/json'
import { repairJson } from '@/lib/tools/json-repair'

const SAMPLE = `{"users":[{"id":9007199254740993,"name":"Anne\\u00e5","roles":["admin","ops"],"active":true,"score":4.5,"note":null},{"id":2,"name":"Li Wei","roles":["ops"],"active":false,"score":3.25,"note":"queued for review, 2026-01-07"}],"page":1,"total":2,"next":null}`

function indentValue(raw: string): number | 'tab' {
  return raw === 'tab' ? 'tab' : Number(raw)
}

function DiagnosticList({ items }: { items: Diagnostic[] }) {
  if (items.length === 0) return null
  return (
    <ul className="mt-3 space-y-2.5">
      {items.slice(0, 12).map((item, index) => (
        <li key={`${item.code}-${item.offset}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="flex flex-wrap items-baseline gap-2">
            <span
              className={
                item.severity === 'error'
                  ? 'rounded bg-rose-600 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-white'
                  : item.severity === 'warning'
                    ? 'rounded bg-amber-500 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-white'
                    : 'rounded bg-sky-600 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-white'
              }
            >
              {item.severity}
            </span>
            <span className="font-mono text-xs text-slate-500">
              line {item.line}, col {item.column} · byte {item.offset}
            </span>
            <span className="text-[0.8125rem] font-semibold text-slate-900">{item.message}</span>
          </p>
          {item.hint ? <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">{item.hint}</p> : null}
          {item.related ? (
            <p className="mt-1 text-xs text-slate-500">
              Also at line {item.related.line}, column {item.related.column}: {item.related.message}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function JsonFormatterWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [indentMode, setIndentMode] = React.useState('2')
  const [customWidth, setCustomWidth] = React.useState(2)
  const [sortKeys, setSortKeys] = React.useState('keep')
  const [keepUnicode, setKeepUnicode] = React.useState(true)
  const [crlf, setCrlf] = React.useState(false)
  const [repair, setRepair] = React.useState(false)
  const [showStats, setShowStats] = React.useState(true)

  const parsed = React.useMemo(() => (input.trim() ? parseJson(input) : null), [input])
  const repairResult = React.useMemo(
    () => (repair && parsed && !parsed.ok ? repairJson(input, indentMode === 'custom' ? customWidth : indentValue(indentMode)) : null),
    [repair, parsed, input, indentMode, customWidth],
  )

  const indent: number | 'tab' = indentMode === 'custom' ? customWidth : indentValue(indentMode)
  const output = React.useMemo(() => {
    if (!parsed) return ''
    if (parsed.ok && parsed.node)
      return printNode(parsed.node, { indent, sortKeys: sortKeys as 'keep' | 'asc' | 'desc' | 'numeric', keepUnicode, lineEnding: crlf ? 'crlf' : 'lf' })
    if (repairResult?.ok) return repairResult.output
    return ''
  }, [parsed, indent, sortKeys, keepUnicode, crlf, repairResult])

  const stats = React.useMemo(
    () => (parsed?.ok && parsed.node ? jsonStats(parsed.node, input, printMinified(parsed.node, keepUnicode), output) : null),
    [parsed, input, keepUnicode, output],
  )

  const ndjson = React.useMemo(() => {
    if (parsed?.ok) return null
    const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (lines.length < 2) return null
    return lines.every((line) => parseJson(line).ok) ? lines.length : null
  }, [input, parsed])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-5">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Indent</p>
          <Segmented
            legend="Indentation width"
            value={indentMode}
            onChange={setIndentMode}
            options={[
              { value: '2', label: '2', title: 'Two spaces' },
              { value: '4', label: '4', title: 'Four spaces' },
              { value: 'tab', label: 'Tab', title: 'One tab character per level' },
              { value: 'custom', label: 'Custom', title: 'Choose a width' },
            ]}
          />
        </div>
        {indentMode === 'custom' ? (
          <div className="min-w-0">
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Width</p>
            <NumberField label="Custom indent width" value={customWidth} onChange={setCustomWidth} min={1} max={8} />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Key order</p>
          <SelectField
            ariaLabel="Key order"
            value={sortKeys}
            onChange={setSortKeys}
            options={[
              { value: 'keep', label: 'Keep as written' },
              { value: 'asc', label: 'Sort A to Z' },
              { value: 'desc', label: 'Sort Z to A' },
              { value: 'numeric', label: 'Sort numeric-like keys' },
            ]}
          />
        </div>
        <ToggleField label="Escape non-ASCII" hint="Writes € as \u20ac" checked={!keepUnicode} onChange={(v) => setKeepUnicode(!v)} />
        <ToggleField label="Repair mode" hint="Accepts quotes, comments, trailing commas" checked={repair} onChange={setRepair} />
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="Input JSON"
          ariaLabel="Input JSON"
          value={input}
          onChange={setInput}
          error={Boolean(parsed) && !parsed?.ok && !repairResult?.ok}
          onSample={() => setInput(SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste JSON, NDJSON or a JavaScript-style object literal…"
          stats={[
            { label: 'Lines', value: String(input.split('\n').length) },
            { label: 'Bytes', value: String(bytesOf(input)) },
          ]}
        />
        <OutputPane
          label="Formatted output"
          value={output}
          filename="formatted.json"
          mime="application/json"
          stats={[
            { label: 'Bytes', value: String(bytesOf(output)) },
            { label: 'Depth', value: stats ? String(stats.depth) : '—' },
            { label: 'Members', value: stats ? String(stats.members) : '—' },
          ]}
        />
      </div>

      {parsed && !parsed.ok ? (
        <ResultBanner
          tone="bad"
          title={`This is not valid JSON — ${parsed.errors.length} syntax ${parsed.errors.length === 1 ? 'error' : 'errors'}`}
          detail={
            <div>
              <p>
                First problem at line {parsed.errors[0]?.line}, column {parsed.errors[0]?.column}: {parsed.errors[0]?.message}
              </p>
              {ndjson ? (
                <p className="mt-1">
                  Every line parses on its own, so this looks like newline-delimited JSON ({ndjson} records) rather than one document.
                </p>
              ) : null}
              {repairResult ? (
                <p className="mt-1">
                  {repairResult.ok
                    ? `Repair mode converted it: ${repairResult.fixes.length} mechanical ${repairResult.fixes.length === 1 ? 'change' : 'changes'} applied.`
                    : 'Repair mode could not find an unambiguous fix.'}
                </p>
              ) : (
                <p className="mt-1">Turn on repair mode to try mechanical fixes for JavaScript-style syntax.</p>
              )}
            </div>
          }
        />
      ) : parsed && parsed.ok ? (
        <ResultBanner
          tone="good"
          title="Valid JSON"
          detail={
            parsed.warnings.length
              ? `Parsed with ${parsed.warnings.length} ${parsed.warnings.length === 1 ? 'warning' : 'warnings'} about things a plain JSON.parse would have hidden.`
              : 'No syntax problems and no risky values detected.'
          }
        />
      ) : null}

      {parsed && parsed.warnings.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-amber-800">Warnings on this document</h2>
          <DiagnosticList items={parsed.warnings} />
        </section>
      ) : null}

      {parsed && !parsed.ok && parsed.errors.length > 1 ? (
        <section className="rounded-xl border border-rose-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-rose-800">Syntax errors, in order</h2>
          <p className="mt-1 text-[0.8125rem] text-slate-600">
            Fix the earliest one first: a single missing comma can cascade into positions that were never actually wrong.
          </p>
          <DiagnosticList items={parsed.errors} />
        </section>
      ) : null}

      {repairResult?.ok ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Changes repair mode made</h2>
          <ul className="mt-2 space-y-1.5">
            {repairResult.fixes.slice(0, 20).map((fix, index) => (
              <li key={`${fix.line}-${fix.column}-${index}`} className="text-[0.8125rem] leading-relaxed text-slate-700">
                <span className="font-mono text-xs text-slate-500">
                  line {fix.line}, col {fix.column}
                </span>{' '}
                <span className="font-semibold">{fix.kind}</span>: {fix.from} → {fix.to}
                <span className="text-slate-500"> — {fix.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Repair mode is for reading a malformed payload, not for shipping it. The output is valid JSON, but the deviation was in the source.
          </p>
        </section>
      ) : null}

      {showStats && stats ? (
        <StatGrid
          items={[
            { label: 'Depth', value: String(stats.depth), note: 'Longest nesting chain' },
            { label: 'Objects', value: String(stats.objects) },
            { label: 'Arrays', value: String(stats.arrays), note: stats.largestArray ? `Largest holds ${stats.largestArray}` : undefined },
            { label: 'Members', value: String(stats.members) },
            { label: 'Strings', value: String(stats.strings) },
            { label: 'Numbers', value: String(stats.numbers) },
            { label: 'Booleans / null', value: `${stats.booleans} / ${stats.nulls}` },
            { label: 'Duplicate names', value: String(stats.duplicates), note: stats.duplicates ? 'Kept in output' : 'None' },
            { label: 'Minified bytes', value: String(stats.minifiedBytes) },
            { label: 'Pretty bytes', value: String(stats.prettyBytes), note: `${stats.prettyBytes - stats.minifiedBytes} of whitespace` },
            { label: 'Root', value: stats.isArrayRoot ? 'array' : 'object', note: stats.recordCount ? `${stats.recordCount} records` : 'single value' },
            { label: 'Lines', value: String(stats.lines) },
          ]}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <ToggleField label="Show structure statistics" checked={showStats} onChange={setShowStats} />
        <span>
          Formatting runs locally: {bytesOf(input)} bytes were parsed in this tab and nothing was sent anywhere.
        </span>
      </div>
    </div>
  )
}
