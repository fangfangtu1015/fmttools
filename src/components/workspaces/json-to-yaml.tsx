'use client'

import * as React from 'react'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { SelectField, ToggleField } from '@/components/tool/controls'
import { jsonToYaml, type YamlWriteOptions } from '@/lib/tools/yaml'
import { parseJson } from '@/lib/tools/json'

const SAMPLE = `{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": { "name": "orders-api", "labels": { "app": "orders" } },
  "spec": {
    "replicas": 3,
    "template": {
      "spec": {
        "containers": [
          { "name": "api", "image": "registry.local/orders:1.10", "env": [{ "name": "DEBUG", "value": "NO" }, { "name": "PORT", "value": "8080" }] },
          { "name": "worker", "image": "registry.local/worker:2.0", "args": ["--retry", "12:30"] }
        ]
      }
    }
  },
  "notes": "Two lines:\\nsecond line becomes a block scalar."
}`

export function JsonToYamlWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [indent, setIndent] = React.useState('2')
  const [nullStr, setNullStr] = React.useState('null')
  const [sortKeys, setSortKeys] = React.useState(false)
  const [blockScalars, setBlockScalars] = React.useState(true)
  const [quoteAll, setQuoteAll] = React.useState(false)
  const [header, setHeader] = React.useState(true)
  const [lineEnding, setLineEnding] = React.useState('lf')

  const parsed = React.useMemo(() => (input.trim() ? parseJson(input) : null), [input])
  const result = React.useMemo(() => {
    if (!input.trim() || !parsed?.ok) return null
    const options: YamlWriteOptions = {
      indent: Number(indent),
      nullStr: nullStr as YamlWriteOptions['nullStr'],
      sortKeys,
      blockScalars,
      quoteAll,
      header: header ? 'converted from JSON by FmtTools — YAML 1.2 safe output' : undefined,
      lineEnding: lineEnding as 'lf' | 'crlf',
    }
    return jsonToYaml(input, options)
  }, [input, parsed, indent, nullStr, sortKeys, blockScalars, quoteAll, header, lineEnding])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Indentation</p>
          <SelectField
            ariaLabel="Indentation"
            value={indent}
            onChange={setIndent}
            options={[
              { value: '2', label: '2 spaces (K8s convention)' },
              { value: '3', label: '3 spaces' },
              { value: '4', label: '4 spaces' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Null style</p>
          <SelectField
            ariaLabel="Null representation"
            value={nullStr}
            onChange={setNullStr}
            options={[
              { value: 'null', label: 'null (unambiguous)' },
              { value: '~', label: '~ (idiomatic)' },
              { value: 'empty', label: 'empty after the colon' },
            ]}
          />
        </div>
        <ToggleField label="Sort keys alphabetically" hint="Stable diffs for hand-maintained files" checked={sortKeys} onChange={setSortKeys} />
        <ToggleField label="Block scalars" hint="Multi-line strings as | or >" checked={blockScalars} onChange={setBlockScalars} />
        <ToggleField label="Quote every string" hint="Maximum portability" checked={quoteAll} onChange={setQuoteAll} />
        <ToggleField label="Header comment" checked={header} onChange={setHeader} />
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Line ending</p>
          <SelectField
            ariaLabel="Line ending"
            value={lineEnding}
            onChange={setLineEnding}
            options={[
              { value: 'lf', label: 'LF' },
              { value: 'crlf', label: 'CRLF' },
            ]}
          />
        </div>
        <div className="text-[0.8125rem] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">YAML 1.1 defence</p>
          <p className="mt-1">Values that a 1.1 reader would retype are quoted automatically; the list is below.</p>
        </div>
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
          placeholder="Paste the JSON you want as YAML…"
          stats={[
            { label: 'Bytes', value: String(bytesOf(input)) },
            { label: 'Parses', value: parsed?.ok ? 'yes' : 'no', tone: parsed?.ok ? 'good' : 'bad' },
          ]}
        />
        <OutputPane
          label="YAML output"
          value={result?.yaml ?? ''}
          filename="converted.yaml"
          mime="text/yaml"
          stats={[
            { label: 'Bytes', value: String(bytesOf(result?.yaml ?? '')) },
            { label: 'Lines', value: String((result?.yaml ?? '').split('\n').length) },
            { label: 'Protected', value: String(result?.protectedValues.length ?? 0), tone: result && result.protectedValues.length ? 'warn' : 'default' },
          ]}
        />
      </div>

      {parsed && !parsed.ok ? (
        <ResultBanner
          tone="bad"
          title="The input is not valid JSON"
          detail={`First error at line ${parsed.errors[0]?.line}, column ${parsed.errors[0]?.column}: ${parsed.errors[0]?.message}. Fix it in the validator rather than letting a lenient YAML reader guess.`}
        />
      ) : null}

      {result?.error ? <ResultBanner tone="bad" title={result.error.message} detail={result.error.hint} /> : null}

      {result && result.protectedValues.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-amber-800">
            {result.protectedValues.length} value(s) quoted to stop a YAML 1.1 reader retyping them
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Each of these is a string in your JSON. Written as a bare scalar it would resolve to a boolean, a number, a null or a different float depending on which edition of the specification the parser implements.
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {result.protectedValues.slice(0, 24).map((item, index) => (
              <li key={`${item.raw}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[0.8125rem]">
                <span className="font-mono text-slate-900">{JSON.stringify(item.raw)}</span>
                <span className="ml-1.5 text-slate-600">{item.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result && result.unrepresentable.length > 0 ? (
        <ResultBanner
          tone="warn"
          title="Some JSON numbers have no faithful YAML spelling"
          detail={<ul className="mt-1 list-disc pl-4">{result.unrepresentable.map((line) => <li key={line}>{line}</li>)}</ul>}
        />
      ) : null}

      {result ? (
        <StatGrid
          items={[
            { label: 'Output bytes', value: String(bytesOf(result.yaml)) },
            { label: 'Input bytes', value: String(bytesOf(input)) },
            { label: 'Lines', value: String(result.yaml.split('\n').length) },
            { label: 'Longest line', value: String(result.yaml.split('\n').reduce((max, line) => Math.max(max, line.length), 0)) },
            { label: 'Protected values', value: String(result.protectedValues.length), note: 'Quoted against 1.1 coercion' },
            { label: 'Unrepresentable', value: String(result.unrepresentable.length) },
            { label: 'Block scalars', value: blockScalars ? 'enabled' : 'disabled' },
            { label: 'Indentation', value: `${indent} spaces` },
          ]}
        />
      ) : null}
    </div>
  )
}
