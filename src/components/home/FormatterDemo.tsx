'use client'

import * as React from 'react'
import { CopyButton } from '@/components/tool/controls'
import { cn } from '@/lib/utils'
import { parseJson, printMinified, printNode } from '@/lib/tools/json'

const SAMPLE = '{"name":"FmtTools","tools":9,"nested":{"a":1,"b":2}}'

const PANE =
  'block h-[11.25rem] w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-[0.8125rem] leading-relaxed text-slate-800'

/** The hero runs the same parser the formatter page uses, so the demo cannot drift from the tool. */
export function FormatterDemo() {
  const [input, setInput] = React.useState(SAMPLE)
  const [mode, setMode] = React.useState<'pretty' | 'min'>('pretty')

  const parsed = React.useMemo(() => parseJson(input), [input])
  const output = React.useMemo(() => {
    if (!parsed.ok || !parsed.node) return ''
    return mode === 'pretty' ? printNode(parsed.node, { indent: 2 }) : printMinified(parsed.node)
  }, [parsed, mode])

  const firstError = parsed.errors[0]
  const saved = input.length - output.length

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[1.125rem] font-bold text-slate-900">JSON Formatter</p>
        <a href="/json-tools/formatter/" className="text-[0.8125rem] font-semibold text-blue-700 hover:underline">
          Full tool →
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Input</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            aria-label="JSON input"
            className={`${PANE} resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
          />
        </label>
        <div>
          <span className="mb-1.5 block text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Output</span>
          <pre aria-live="polite" className={`${PANE} overflow-auto whitespace-pre`}>
            {parsed.ok ? output : ''}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('pretty')}
          className={cn(
            'rounded-lg px-4 py-2 text-[0.8125rem] font-semibold transition',
            mode === 'pretty' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          Format
        </button>
        <button
          type="button"
          onClick={() => setMode('min')}
          className={cn(
            'rounded-lg px-4 py-2 text-[0.8125rem] font-semibold transition',
            mode === 'min' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          Minify
        </button>
        <CopyButton text={output} label="Copy" tone="secondary" />

        <span className="ml-2 text-[0.75rem] font-semibold">
          {parsed.ok ? (
            <span className="text-emerald-700">
              Valid JSON ✓{mode === 'min' && saved > 0 ? ` · ${saved} bytes saved` : ''}
            </span>
          ) : (
            <span className="text-rose-700">{firstError ? `Line ${firstError.line}, column ${firstError.column}: ${firstError.message}` : 'Invalid JSON'}</span>
          )}
        </span>
      </div>
    </div>
  )
}
