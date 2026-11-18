'use client'

import * as React from 'react'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { SelectField } from '@/components/tool/controls'
import { parseYaml, yamlToJson, type Coercion } from '@/lib/tools/yaml'
import { DataTable } from '@/components/content'

const SAMPLE = `# Deployment manifest with the usual suspects
name: orders-api
country: NO
enabled: off
version: 1.10
permissions: 017
duration: 12:30
when: 2025-01-07
single: y
empty:
quoted: "keep me a string"
base: &defaults
  replicas: 3
  image: registry.local/orders:1
prod:
  <<: *defaults
  replicas: 12
list:
  - a
  - b
block: |
  line one
  line two`

function coercionTone(risk: Coercion['risk']) {
  if (risk === 'high') return 'text-rose-800 bg-rose-50 border-rose-200'
  if (risk === 'medium') return 'text-amber-800 bg-amber-50 border-amber-200'
  return 'text-slate-700 bg-slate-50 border-slate-200'
}

export function YamlToJsonWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [indent, setIndent] = React.useState('2')

  const parsed = React.useMemo(() => (input.trim() ? parseYaml(input) : null), [input])
  const result = React.useMemo(() => (input.trim() && parsed?.ok ? yamlToJson(input, Number(indent)) : null), [input, parsed, indent])
  const output = result?.json ?? ''

  const highRisk = parsed?.coercions.filter((coercion) => coercion.risk === 'high') ?? []
  const mediumRisk = parsed?.coercions.filter((coercion) => coercion.risk === 'medium') ?? []

  return (
    <div className="space-y-4">
      <OptionsBar className="sm:grid-cols-3">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">JSON indentation</p>
          <SelectField
            ariaLabel="JSON indentation"
            value={indent}
            onChange={setIndent}
            options={[
              { value: '2', label: '2 spaces' },
              { value: '4', label: '4 spaces' },
              { value: '0', label: 'Minified' },
            ]}
          />
        </div>
        <div className="text-[0.8125rem] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">Parser edition</p>
          <p className="mt-1">YAML 1.2 core schema. Divergence from YAML 1.1 is reported per scalar, never silently merged.</p>
        </div>
        <div className="text-[0.8125rem] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">Anchors</p>
          <p className="mt-1">
            Aliases and merge keys are expanded into concrete values, because JSON has no reference mechanism. {parsed ? `${parsed.stats.aliases} alias(es), ${parsed.stats.mergeKeys} merge key(s) here.` : ''}
          </p>
        </div>
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="YAML input"
          ariaLabel="YAML input"
          value={input}
          onChange={setInput}
          error={!!parsed && !parsed.ok}
          onSample={() => setInput(SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste a manifest, a workflow or any YAML document…"
          stats={[
            { label: 'Lines', value: String(input.split('\n').length) },
            { label: 'Bytes', value: String(bytesOf(input)) },
          ]}
        />
        <OutputPane
          label="JSON output"
          value={output}
          filename="converted.json"
          mime="application/json"
          stats={[
            { label: 'Bytes', value: String(bytesOf(output)) },
            { label: 'Documents', value: parsed ? String(parsed.documents) : '—' },
            { label: 'Top keys', value: parsed ? String(parsed.stats.topLevelKeys) : '—' },
          ]}
        />
      </div>

      {parsed && !parsed.ok ? (
        <ResultBanner
          tone="bad"
          title="This document does not parse"
          detail={
            <ul className="mt-1 space-y-1">
              {parsed.issues.slice(0, 6).map((issue, index) => (
                <li key={`${issue.code}-${index}`}>
                  <span className="font-mono text-xs">
                    {issue.line !== undefined ? `line ${issue.line}` : 'document'}
                    {issue.column !== undefined ? `, col ${issue.column}` : ''}
                  </span>{' '}
                  — {issue.message}
                  {issue.hint ? <span className="block opacity-80">{issue.hint}</span> : null}
                </li>
              ))}
            </ul>
          }
        />
      ) : parsed && parsed.ok ? (
        <ResultBanner
          tone={highRisk.length ? 'warn' : 'good'}
          title={highRisk.length ? `Parsed, with ${highRisk.length} value(s) whose type a YAML 1.1 reader would change` : 'Parsed cleanly'}
          detail={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>{parsed.documents} document(s)</span>
              <span>{parsed.stats.anchors} anchor(s)</span>
              <span>{parsed.stats.blockScalars} block scalar(s)</span>
              <span>{parsed.stats.flowNodes} flow node(s)</span>
              <span>{parsed.stats.tabIndentedLines} tab-indented line(s)</span>
              <span>{parsed.issues.filter((i) => i.severity !== 'error').length} note(s)</span>
            </div>
          }
        />
      ) : null}

      {parsed && parsed.issues.filter((issue) => issue.severity !== 'error').length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Structural notes</h2>
          <ul className="mt-2 space-y-1.5">
            {parsed.issues
              .filter((issue) => issue.severity !== 'error')
              .slice(0, 20)
              .map((issue, index) => (
                <li key={`${issue.code}-${index}`} className="text-[0.8125rem] leading-relaxed text-slate-700">
                  <span
                    className={
                      issue.severity === 'warning'
                        ? 'mr-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-amber-800'
                        : 'mr-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-sky-800'
                    }
                  >
                    {issue.severity}
                  </span>
                  {issue.line !== undefined ? <span className="mr-1.5 font-mono text-xs text-slate-500">line {issue.line}</span> : null}
                  {issue.message}
                  {issue.hint ? <span className="block pl-1 text-xs text-slate-500">{issue.hint}</span> : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {parsed && parsed.coercions.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Plain scalars whose type is version-dependent, or that a numeric round trip rewrites</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {highRisk.length} high risk, {mediumRisk.length} worth a look, {parsed.coercions.length - highRisk.length - mediumRisk.length} same type in both editions but reprinted differently. A bare scalar is resolved by the reader, not written by you — quoting is the only way to pin it down.
          </p>
          <DataTable
            compact
            head={['Line', 'Scalar as written', 'YAML 1.2 resolves', 'YAML 1.1 resolves', 'Risk', 'Why it matters']}
            rows={parsed.coercions.slice(0, 40).map((coercion) => [
              <span key="l" className="font-mono text-xs">{coercion.line}</span>,
              <span key="r" className="font-mono text-xs text-slate-900">{coercion.raw}</span>,
              <span key="n" className="font-mono text-xs">{coercion.resolved}</span>,
              <span key="o" className="font-mono text-xs">{coercion.yaml11}</span>,
              <span key="k" className={`rounded border px-1.5 py-0.5 text-[0.625rem] font-bold uppercase ${coercionTone(coercion.risk)}`}>{coercion.risk}</span>,
              <span key="w" className="text-xs leading-snug">{coercion.note}</span>,
            ])}
            foot="“Risk high” means the two spec editions resolve the same bare scalar to different values, so the meaning depends on which library your pipeline happens to use."
          />
        </section>
      ) : null}

      {parsed ? (
        <StatGrid
          items={[
            { label: 'Documents', value: String(parsed.documents), note: parsed.documents > 1 ? 'Joined into a JSON array' : 'Single document' },
            { label: 'Top-level keys', value: String(parsed.stats.topLevelKeys) },
            { label: 'Anchors', value: String(parsed.stats.anchors) },
            { label: 'Aliases', value: String(parsed.stats.aliases) },
            { label: 'Merge keys', value: String(parsed.stats.mergeKeys) },
            { label: 'Block scalars', value: String(parsed.stats.blockScalars) },
            { label: 'Flow nodes', value: String(parsed.stats.flowNodes) },
            { label: 'Explicit tags', value: String(parsed.stats.tags) },
            { label: 'Multi-line strings', value: String(parsed.stats.multilineStrings) },
            { label: 'Longest line', value: String(parsed.stats.longestLine) },
            { label: 'Tab-indented lines', value: String(parsed.stats.tabIndentedLines), note: parsed.stats.tabIndentedLines ? 'Legal inside values, not indentation' : 'None' },
            { label: 'Coerced scalars', value: String(parsed.coercions.length) },
          ]}
        />
      ) : null}
    </div>
  )
}
