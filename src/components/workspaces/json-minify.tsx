'use client'

import * as React from 'react'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { ToggleField } from '@/components/tool/controls'
import { jsonStats, parseJson, printMinified } from '@/lib/tools/json'

const SAMPLE = `{
  "dataset": "e2e-fixture",
  "generated": "2026-11-12T09:14:02Z",
  "records": [
    { "id": 1, "label": "leading zero kept", "zip": "00420", "amount": 12.5 },
    { "id": 2, "label": "unsafe integer", "zip": "9007199254740993", "amount": 0.1 }
  ],
  "notes": "Multi-line value:\\nsecond line stays inside the string."
}`

async function gzippedSize(text: string) {
  if (typeof CompressionStream === 'undefined') return null
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  const buffer = await new Response(stream).arrayBuffer()
  return buffer.byteLength
}

export function JsonMinifyWorkspace() {
  const [input, setInput] = React.useState(SAMPLE)
  const [escapeUnicode, setEscapeUnicode] = React.useState(false)
  const [gzip, setGzip] = React.useState<{ input: number | null; output: number | null }>({ input: null, output: null })

  const parsed = React.useMemo(() => (input.trim() ? parseJson(input) : null), [input])
  const output = React.useMemo(() => (parsed?.ok && parsed.node ? printMinified(parsed.node, !escapeUnicode) : ''), [parsed, escapeUnicode])
  const stats = React.useMemo(() => (parsed?.ok && parsed.node ? jsonStats(parsed.node, input, output) : null), [parsed, input, output])

  const verified = React.useMemo(() => {
    if (!output) return false
    const reparsed = parseJson(output)
    if (!reparsed.ok || !reparsed.node) return false
    return printMinified(reparsed.node, !escapeUnicode) === output
  }, [output, escapeUnicode])

  React.useEffect(() => {
    let cancelled = false
    if (!output) {
      setGzip({ input: null, output: null })
      return
    }
    void Promise.all([gzippedSize(input), gzippedSize(output)]).then(([a, b]) => {
      if (!cancelled) setGzip({ input: a, output: b })
    })
    return () => {
      cancelled = true
    }
  }, [input, output])

  const inputBytes = bytesOf(input)
  const outputBytes = bytesOf(output)
  const saved = inputBytes - outputBytes
  const percent = inputBytes > 0 ? (saved / inputBytes) * 100 : 0

  return (
    <div className="space-y-4">
      <OptionsBar className="sm:grid-cols-3">
        <ToggleField label="Escape non-ASCII" hint="Writes é as \u00e9 — larger for UTF-8 payloads" checked={escapeUnicode} onChange={setEscapeUnicode} />
        <div className="text-[0.8125rem] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">Whitespace only</p>
          <p className="mt-1">Space, tab, LF and CR outside strings. String contents are never touched.</p>
        </div>
        <div className="text-[0.8125rem] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">
            {gzip.output === null ? 'gzip comparison unavailable' : `gzip: ${gzip.input} B → ${gzip.output} B`}
          </p>
          <p className="mt-1">{gzip.output === null ? 'This browser has no Compression Streams API, so the row is omitted rather than estimated.' : 'Both sizes are what a compressed transfer would actually carry.'}</p>
        </div>
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="JSON to minify"
          ariaLabel="JSON to minify"
          value={input}
          onChange={setInput}
          error={Boolean(parsed) && !parsed?.ok}
          onSample={() => setInput(SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste pretty-printed JSON…"
          stats={[
            { label: 'Bytes', value: String(inputBytes) },
            { label: 'Lines', value: String(input.split('\n').length) },
          ]}
        />
        <OutputPane
          label="Minified JSON"
          value={output}
          filename="minified.json"
          mime="application/json"
          stats={[
            { label: 'Bytes', value: String(outputBytes) },
            { label: 'Saved', value: saved > 0 ? `${saved} B (${percent.toFixed(1)}%)` : '0 B', tone: saved > 0 ? 'good' : 'default' },
          ]}
        />
      </div>

      {parsed && !parsed.ok ? (
        <ResultBanner
          tone="bad"
          title="Cannot minify: the input is not valid JSON"
          detail={`First error at line ${parsed.errors[0]?.line}, column ${parsed.errors[0]?.column}: ${parsed.errors[0]?.message}. Minifying text that does not parse would mean guessing at string boundaries, which is how whitespace inside a value gets deleted.`}
        />
      ) : parsed && parsed.ok ? (
        <ResultBanner
          tone={verified ? 'good' : 'warn'}
          title={verified ? 'Minified and verified' : 'Minified, but the round trip did not reproduce identical bytes'}
          detail={
            <div>
              <p>
                {inputBytes} bytes → {outputBytes} bytes, {saved} removed ({percent.toFixed(1)} percent).{' '}
                {gzip.output !== null && gzip.input !== null ? `Compressed: ${gzip.input} → ${gzip.output} bytes.` : ''}
              </p>
              {parsed.warnings.length ? (
                <p className="mt-1">
                  {parsed.warnings.length} warning(s) carried over from parsing — the{' '}
                  <a href="/json-tools/validator/" className="underline underline-offset-2">
                    JSON validator
                  </a>{' '}
                  lists what a plain JSON.parse would do to these values.
                </p>
              ) : null}
            </div>
          }
        />
      ) : null}

      {stats ? (
        <StatGrid
          items={[
            { label: 'Input bytes', value: String(inputBytes) },
            { label: 'Output bytes', value: String(outputBytes) },
            { label: 'Whitespace removed', value: `${saved} B`, note: `${percent.toFixed(1)}% of the document` },
            { label: 'Lines collapsed', value: `${input.split('\n').length} → 1` },
            { label: 'Members', value: String(stats.members) },
            { label: 'Depth', value: String(stats.depth) },
            { label: 'Duplicate names', value: String(stats.duplicates), note: stats.duplicates ? 'Preserved in output' : 'None' },
            { label: 'Round trip', value: verified ? 'identical' : 'differs', note: 'Output re-parsed and re-minified' },
          ]}
        />
      ) : null}
    </div>
  )
}
