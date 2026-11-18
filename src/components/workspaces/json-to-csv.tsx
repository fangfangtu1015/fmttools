'use client'

import * as React from 'react'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { NumberField, SelectField, ToggleField } from '@/components/tool/controls'
import { jsonToCsv, type JsonToCsvOptions } from '@/lib/tools/csv'
import { parseJson } from '@/lib/tools/json'

const SAMPLE = `[
  {"id":1,"name":"Anne Ås","address":{"city":"Oslo","zip":"0050"},"tags":["ops","admin"],"score":4.5,"active":true},
  {"id":2,"name":"Li, Wei","address":{"city":"Seattle","zip":"90210"},"tags":["ops"],"score":null,"active":false,"extra":{"nested":{"deep":"value"}}},
  {"id":9007199254740993,"name":"Gonzalo Ibáñez","address":{"city":"Madrid"},"tags":[],"score":3.25,"active":true}
]`

export function JsonToCsvWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [delimiter, setDelimiter] = React.useState(',')
  const [pathStyle, setPathStyle] = React.useState('dot')
  const [maxDepth, setMaxDepth] = React.useState(2)
  const [arrayStyle, setArrayStyle] = React.useState('join')
  const [columnOrder, setColumnOrder] = React.useState('first-seen')
  const [quoteStyle, setQuoteStyle] = React.useState('minimal')
  const [lineEnding, setLineEnding] = React.useState('lf')
  const [bom, setBom] = React.useState(false)

  const parsed = React.useMemo(() => (input.trim() ? parseJson(input) : null), [input])
  const result = React.useMemo(() => {
    if (!input.trim() || !parsed?.ok) return null
    const options: JsonToCsvOptions = {
      delimiter,
      pathStyle: pathStyle as JsonToCsvOptions['pathStyle'],
      maxDepth,
      arrayStyle: arrayStyle as JsonToCsvOptions['arrayStyle'],
      columnOrder: columnOrder as JsonToCsvOptions['columnOrder'],
      writeOptions: {
        delimiter,
        quoteStyle: quoteStyle as 'minimal' | 'all' | 'numeric-safe',
        lineEnding: lineEnding as 'lf' | 'crlf',
        bom,
        nullValue: '',
        emptyValue: '',
      },
    }
    return jsonToCsv(input, options)
  }, [input, parsed, delimiter, pathStyle, maxDepth, arrayStyle, columnOrder, quoteStyle, lineEnding, bom])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-5">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Delimiter</p>
          <SelectField
            ariaLabel="Delimiter"
            value={delimiter}
            onChange={setDelimiter}
            options={[
              { value: ',', label: 'Comma' },
              { value: '\t', label: 'Tab (TSV)' },
              { value: ';', label: 'Semicolon' },
              { value: '|', label: 'Pipe' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Nested keys</p>
          <SelectField
            ariaLabel="Nested key style"
            value={pathStyle}
            onChange={setPathStyle}
            options={[
              { value: 'dot', label: 'address.city' },
              { value: 'underscore', label: 'address_city' },
              { value: 'bracket', label: 'address[city]' },
              { value: 'none', label: 'JSON-encode the object' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Array cells</p>
          <SelectField
            ariaLabel="Array handling"
            value={arrayStyle}
            onChange={setArrayStyle}
            options={[
              { value: 'join', label: 'Join with a separator' },
              { value: 'index', label: 'One column per index' },
              { value: 'json', label: 'Keep as JSON text' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Max depth</p>
          <NumberField label="Maximum flatten depth" value={maxDepth} onChange={setMaxDepth} min={1} max={6} />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Quoting</p>
          <SelectField
            ariaLabel="Quote style"
            value={quoteStyle}
            onChange={setQuoteStyle}
            options={[
              { value: 'minimal', label: 'Only when required' },
              { value: 'all', label: 'Quote every field' },
              { value: 'numeric-safe', label: 'Quote numeric-looking text' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Column order</p>
          <SelectField
            ariaLabel="Column order"
            value={columnOrder}
            onChange={setColumnOrder}
            options={[
              { value: 'first-seen', label: 'First seen in the data' },
              { value: 'alphabetical', label: 'Alphabetical' },
              { value: 'deepest-first', label: 'Shallow keys first' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Line ending</p>
          <SelectField
            ariaLabel="Line ending"
            value={lineEnding}
            onChange={setLineEnding}
            options={[
              { value: 'lf', label: 'LF (Unix)' },
              { value: 'crlf', label: 'CRLF (RFC 4180 §2.1)' },
            ]}
          />
        </div>
        <ToggleField label="UTF-8 BOM" hint="Stops Excel guessing the code page" checked={bom} onChange={setBom} />
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="JSON input"
          ariaLabel="JSON input"
          value={input}
          onChange={setInput}
          error={Boolean(parsed) && !parsed?.ok}
          onSample={() => setInput(SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste an array of objects, a dictionary or a nested payload…"
          stats={[
            { label: 'Bytes', value: String(bytesOf(input)) },
            { label: 'Parses', value: parsed?.ok ? 'yes' : 'no' , tone: parsed?.ok ? 'good' : 'bad' },
          ]}
        />
        <OutputPane
          label="CSV output"
          value={result?.csv ?? ''}
          filename={delimiter === '\t' ? 'converted.tsv' : 'converted.csv'}
          mime={delimiter === '\t' ? 'text/tab-separated-values' : 'text/csv'}
          stats={[
            { label: 'Rows', value: result ? String(result.rowCount) : '—' },
            { label: 'Columns', value: result ? String(result.headers.length) : '—' },
            { label: 'Bytes', value: String(bytesOf(result?.csv ?? '')) },
          ]}
        />
      </div>

      {result ? (
        <ResultBanner
          tone={result.issues.some((issue) => issue.severity === 'error') ? 'warn' : 'good'}
          title={`Wrote ${result.rowCount} record(s) × ${result.headers.length} column(s) — detected shape: ${result.shape}`}
          detail={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Nested paths flattened: {result.nestedPaths}</span>
              <span>Arrays joined: {result.arraysJoined}</span>
              <span>JSON-encoded cells: {result.jsonEncodedCells}</span>
              <span>Quoting: {quoteStyle === 'all' ? 'every field' : quoteStyle === 'numeric-safe' ? 'numeric-looking text quoted' : 'only where required'}</span>
              <span>Line ending: {lineEnding.toUpperCase()}</span>
            </div>
          }
        />
      ) : null}

      {result && result.headers.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Column set</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            The union of every key found in the records, in the order the option produced. Keys present in only some records still become columns, so the grid stays rectangular.
          </p>
          <ol className="mt-3 flex flex-wrap gap-1.5">
            {result.headers.map((header, index) => (
              <li key={header} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[0.75rem] text-slate-800">
                <span className="text-slate-400">{index + 1}</span> {header}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {result && result.issues.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-amber-800">What this conversion had to decide</h2>
          <ul className="mt-2 space-y-2">
            {result.issues.slice(0, 25).map((issue, index) => (
              <li key={`${issue.code}-${index}`} className="text-[0.8125rem] leading-relaxed text-slate-700">
                <span
                  className={
                    issue.severity === 'error'
                      ? 'mr-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-rose-800'
                      : issue.severity === 'warning'
                        ? 'mr-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-amber-800'
                        : 'mr-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-sky-800'
                  }
                >
                  {issue.severity}
                </span>
                {issue.message}
                {issue.hint ? <span className="block pl-1 text-xs text-slate-500">{issue.hint}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!parsed?.ok && input.trim() ? (
        <ResultBanner
          tone="bad"
          title="The input is not valid JSON"
          detail={parsed ? `First error at line ${parsed.errors[0]?.line}, column ${parsed.errors[0]?.column}: ${parsed.errors[0]?.message}` : undefined}
        />
      ) : null}

      {result ? (
        <StatGrid
          items={[
            { label: 'Records', value: String(result.rowCount) },
            { label: 'Columns', value: String(result.headers.length) },
            { label: 'CSV bytes', value: String(bytesOf(result.csv)) },
            { label: 'JSON bytes', value: String(bytesOf(input)) },
            { label: 'Nested paths', value: String(result.nestedPaths), note: 'Flattened into composite headers' },
            { label: 'Arrays joined', value: String(result.arraysJoined) },
            { label: 'JSON cells', value: String(result.jsonEncodedCells), note: 'Round-trips back exactly' },
            { label: 'Shape', value: result.shape },
          ]}
        />
      ) : null}
    </div>
  )
}
