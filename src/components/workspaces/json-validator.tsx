'use client'

import * as React from 'react'
import { InputPane, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { SelectField, ToggleField } from '@/components/tool/controls'
import { jsonStats, outline, parseJson } from '@/lib/tools/json'

const SAMPLE = `{"ok": true, "id": 9007199254740993, "id": 2, "list": [1, 2, 3,], "when": 2026-13-45}`

export function JsonValidatorWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [outlineDepth, setOutlineDepth] = React.useState('60')
  const [showOutline, setShowOutline] = React.useState(true)

  const parsed = React.useMemo(() => (input.trim() ? parseJson(input) : null), [input])
  const stats = React.useMemo(() => (parsed?.ok && parsed.node ? jsonStats(parsed.node, input) : null), [parsed, input])
  const outlineLines = React.useMemo(
    () => (parsed?.node ? outline(parsed.node, Number(outlineDepth)) : []),
    [parsed, outlineDepth],
  )

  const lines = input.split(/\r?\n/)
  const firstError = parsed && !parsed.ok ? parsed.errors[0] : undefined
  const excerpt = firstError
    ? (() => {
        const text = lines[firstError.line - 1] ?? ''
        const start = Math.max(0, firstError.column - 25)
        return { before: text.slice(start, firstError.column - 1), at: text.slice(firstError.column - 1, firstError.column - 1 + Math.max(1, firstError.length)), after: text.slice(firstError.column - 1 + Math.max(1, firstError.length), start + 90), marker: start === 0 ? null : '…' }
      })()
    : null

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="JSON to validate"
          ariaLabel="JSON to validate"
          value={input}
          onChange={setInput}
          error={!!parsed && !parsed.ok}
          onSample={() => setInput(SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste the document you want checked…"
          stats={[
            { label: 'Lines', value: String(lines.length) },
            { label: 'Bytes', value: String(bytesOf(input)) },
          ]}
        />
        <OutputPane
          label="Validation report"
          value={
            !parsed
              ? ''
              : parsed.ok
                ? `VALID — the document satisfies the RFC 8259 grammar.\n\n${parsed.warnings.length} warning(s).\nDepth ${stats?.depth}, ${stats?.members} members, ${stats?.objects} objects, ${stats?.arrays} arrays.`
                : `${parsed.errors.length} syntax error(s)\n\n` +
                  parsed.errors.map((e, i) => `${i + 1}. line ${e.line}, column ${e.column} (byte ${e.offset}) — ${e.message}${e.hint ? `\n   ${e.hint}` : ''}`).join('\n')
          }
          stats={[
            {
              label: 'Status',
              value: parsed ? (parsed.ok ? (parsed.warnings.length ? 'valid, with warnings' : 'valid') : 'invalid') : '—',
              tone: parsed ? (parsed.ok ? (parsed.warnings.length ? 'warn' : 'good') : 'bad') : 'default',
            },
            { label: 'Errors', value: parsed ? String(parsed.errors.length) : '0' },
            { label: 'Warnings', value: parsed ? String(parsed.warnings.length) : '0' },
          ]}
        />
      </div>

      {parsed && parsed.ok ? (
        <ResultBanner
          tone={parsed.warnings.length ? 'warn' : 'good'}
          title={parsed.warnings.length ? `Valid JSON, ${parsed.warnings.length} thing(s) a parser will change` : 'Valid JSON'}
          detail={
            parsed.warnings.length ? (
              <ul className="mt-1 space-y-1">
                {parsed.warnings.map((warning, index) => (
                  <li key={`${warning.code}-${warning.offset}-${index}`}>
                    <span className="font-mono text-xs">
                      line {warning.line}, col {warning.column}
                    </span>{' '}
                    — {warning.message}
                    {warning.hint ? <span className="opacity-80"> {warning.hint}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              'Nothing in the document would be altered by a conforming parser.'
            )
          }
        />
      ) : null}

      {firstError ? (
        <section className="rounded-xl border border-rose-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-rose-800">
            Where parsing stopped: line {firstError.line}, column {firstError.column}
          </h2>
          {excerpt ? (
            <pre className="scrollbar-thin mt-2 overflow-x-auto rounded-lg bg-code-bg px-3 py-2 text-[0.8125rem] leading-6 text-code-fg">
              <code>
                {excerpt.marker}
                {excerpt.before}
                <mark className="rounded bg-rose-300 px-0.5 text-rose-950">{excerpt.at || 'end of line'}</mark>
                {excerpt.after}
              </code>
            </pre>
          ) : null}
          <p className="mt-2 text-[0.875rem] leading-relaxed text-slate-700">{firstError.message}</p>
          {firstError.hint ? <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">{firstError.hint}</p> : null}
          {parsed && parsed.errors.length > 1 ? (
            <p className="mt-2 text-xs text-slate-500">
              {parsed.errors.length - 1} further error position(s) are listed in the report. They are usually consequences of this one.
            </p>
          ) : null}
        </section>
      ) : null}

      {stats ? (
        <StatGrid
          items={[
            { label: 'Depth', value: String(stats.depth) },
            { label: 'Root', value: stats.isArrayRoot ? 'array' : 'object' },
            { label: 'Records', value: String(stats.recordCount) },
            { label: 'Members', value: String(stats.members) },
            { label: 'Strings', value: String(stats.strings) },
            { label: 'Numbers', value: String(stats.numbers) },
            { label: 'Booleans', value: String(stats.booleans) },
            { label: 'Nulls', value: String(stats.nulls) },
            { label: 'Duplicates', value: String(stats.duplicates), note: stats.duplicates ? 'Last value wins in JSON.parse' : 'None' },
            { label: 'Largest array', value: String(stats.largestArray) },
            { label: 'Minified size', value: `${stats.minifiedBytes} B` },
            { label: 'Pretty size', value: `${stats.prettyBytes} B`, note: `${stats.lines} lines` },
          ]}
        />
      ) : null}

      {parsed?.ok ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Structure outline</h2>
              <p className="mt-1 text-xs text-slate-500">Keys down to the depth you set, with the value type at each leaf.</p>
            </div>
            <div className="flex items-end gap-3">
              <div className="w-40">
                <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Max lines</p>
                <SelectField
                  ariaLabel="Outline line limit"
                  value={outlineDepth}
                  onChange={setOutlineDepth}
                  options={[
                    { value: '20', label: '20 lines' },
                    { value: '60', label: '60 lines' },
                    { value: '200', label: '200 lines' },
                  ]}
                />
              </div>
              <ToggleField label="Show outline" checked={showOutline} onChange={setShowOutline} />
            </div>
          </div>
          {showOutline ? (
            <pre className="scrollbar-thin mt-3 max-h-72 overflow-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-[0.8125rem] leading-6 text-slate-800">
              <code>{outlineLines.join('\n')}</code>
            </pre>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
