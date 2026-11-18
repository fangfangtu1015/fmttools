'use client'

import * as React from 'react'
import { CopyButton, DownloadButton } from './controls'
import { cn, formatBytes, formatNumber } from '@/lib/utils'

export type PaneStats = { label: string; value: string; tone?: 'default' | 'good' | 'warn' | 'bad' }

const TONE: Record<NonNullable<PaneStats['tone']>, string> = {
  default: 'text-slate-600',
  good: 'text-emerald-700',
  warn: 'text-amber-700',
  bad: 'text-rose-700',
}

export function InputPane({
  label,
  value,
  onChange,
  stats,
  placeholder,
  sampleLabel = 'Load sample',
  onSample,
  onFile,
  ariaLabel,
  error,
  textareaRef,
  rows = 18,
  monospace = true,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  stats?: PaneStats[]
  placeholder?: string
  sampleLabel?: string
  onSample?: () => void
  onFile?: (content: string, filename: string) => void
  ariaLabel?: string
  error?: boolean
  textareaRef?: React.RefObject<HTMLTextAreaElement>
  rows?: number
  monospace?: boolean
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const readFile = (file: File) => {
    if (!onFile) return
    const reader = new FileReader()
    reader.onload = () => onFile(String(reader.result ?? ''), file.name)
    reader.readAsText(file)
  }

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition',
        dragging ? 'border-blue-500 ring-2 ring-blue-500/25' : error ? 'border-rose-300' : 'border-slate-200',
      )}
      onDragOver={
        onFile
          ? (event) => {
              event.preventDefault()
              setDragging(true)
            }
          : undefined
      }
      onDragLeave={onFile ? () => setDragging(false) : undefined}
      onDrop={
        onFile
          ? (event) => {
              event.preventDefault()
              setDragging(false)
              const file = event.dataTransfer.files?.[0]
              if (file) readFile(file)
            }
          : undefined
      }
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-2.5">
        <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-500">{label}</h2>
        <div className="flex items-center gap-1.5">
          {onSample ? (
            <button
              type="button"
              onClick={onSample}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {sampleLabel}
            </button>
          ) : null}
          {onFile ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Open file
              </button>
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                aria-label="Choose a file to load into the input"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) readFile(file)
                  event.target.value = ''
                }}
              />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Clear
          </button>
        </div>
      </header>
      <textarea
        ref={textareaRef}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label={ariaLabel ?? label}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'scrollbar-thin min-h-[13rem] w-full flex-1 resize-y bg-white px-3.5 py-3 text-[0.8125rem] leading-6 text-slate-900 outline-none placeholder:text-slate-400',
          monospace && 'font-mono',
        )}
      />
      {stats?.length ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs">
          {stats.map((stat) => (
            <span key={stat.label} className={cn('font-medium', TONE[stat.tone ?? 'default'])}>
              <span className="text-slate-400">{stat.label} </span>
              {stat.value}
            </span>
          ))}
        </footer>
      ) : null}
    </section>
  )
}

export function OutputPane({
  label,
  value,
  stats,
  error,
  actions,
  filename,
  mime,
  children,
  rows = 18,
}: {
  label: string
  value: string
  stats?: PaneStats[]
  error?: React.ReactNode
  actions?: React.ReactNode
  filename?: string
  mime?: string
  children?: React.ReactNode
  rows?: number
}) {
  const body = children ?? <HighlightedText text={value} />
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-2.5">
        <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-500">{label}</h2>
        <div className="flex items-center gap-1.5">
          {actions}
          {value ? <CopyButton text={value} /> : null}
          {value && filename ? <DownloadButton text={value} filename={filename} mime={mime} label="Download" /> : null}
        </div>
      </header>
      {error ? (
        <div className="border-b border-rose-100 bg-rose-50/80 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-rose-900">{error}</div>
      ) : null}
      <pre
        aria-label={`${label} output`}
        className="scrollbar-thin min-h-[13rem] flex-1 overflow-auto whitespace-pre bg-white px-3.5 py-3 text-[0.8125rem] leading-6 text-slate-900"
        style={{ maxHeight: `${rows * 1.5 + 2}rem` }}
      >
        {value ? body : <span className="text-slate-400">The converted result appears here. Nothing is uploaded — conversion happens in this tab.</span>}
      </pre>
      {stats?.length ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs">
          {stats.map((stat) => (
            <span key={stat.label} className={cn('font-medium', TONE[stat.tone ?? 'default'])}>
              <span className="text-slate-400">{stat.label} </span>
              {stat.value}
            </span>
          ))}
        </footer>
      ) : null}
    </section>
  )
}

const JSON_TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],])/g

/**
 * Token-coloured output without dangerouslySetInnerHTML: every span is built
 * from matched substrings of the tool result.
 */
export function HighlightedText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let key = 0
  JSON_TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = JSON_TOKEN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const [whole, str, colon, keyword, number, punct] = match
    let cls = 'text-slate-700'
    if (str && colon) cls = 'text-sky-800 font-semibold'
    else if (str) cls = 'text-emerald-800'
    else if (keyword) cls = 'text-violet-700 font-semibold'
    else if (number) cls = 'text-amber-800'
    else if (punct) cls = 'text-slate-400'
    nodes.push(
      <span key={key++} className={cls}>
        {colon ? str + colon : whole}
      </span>,
    )
    last = match.index + whole.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return (
    <code className="font-mono">
      <span className="whitespace-pre">{nodes}</span>
    </code>
  )
}

export function OptionsBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  )
}

export function ResultBanner({
  tone,
  title,
  detail,
  actions,
}: {
  tone: 'good' | 'bad' | 'warn' | 'info'
  title: React.ReactNode
  detail?: React.ReactNode
  actions?: React.ReactNode
}) {
  const map = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    bad: 'border-rose-200 bg-rose-50 text-rose-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  } as const
  const glyph = { good: 'OK', bad: 'ERR', warn: '!', info: 'i' } as const
  return (
    <div className={cn('flex flex-wrap items-start gap-3 rounded-xl border px-3.5 py-3', map[tone])}>
      <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/70 text-[0.625rem] font-bold ring-1 ring-inset ring-black/10">
        {glyph[tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-snug">{title}</p>
        {detail ? <div className="mt-1 text-[0.8125rem] leading-relaxed opacity-90">{detail}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  )
}

export function StatGrid({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-3.5 py-2.5">
          <dt className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">{item.label}</dt>
          <dd className="mt-0.5 truncate font-mono text-[0.9375rem] font-semibold text-slate-900" title={item.value}>
            {item.value}
          </dd>
          {item.note ? <p className="mt-0.5 text-xs leading-snug text-slate-500">{item.note}</p> : null}
        </div>
      ))}
    </dl>
  )
}

export function bytesOf(text: string) {
  return new Blob([text]).size
}

export function lineColumnOf(text: string, offset: number) {
  const clamped = Math.max(0, Math.min(offset, text.length))
  let line = 1
  for (let i = 0; i < clamped; i++) if (text[i] === '\n') line++
  const start = text.lastIndexOf('\n', Math.max(0, clamped - 1)) + 1
  return { line, column: clamped - start + 1 }
}

export function SizeNote({ input, output }: { input: string; output: string }) {
  return (
    <>
      {formatBytes(bytesOf(input))} → {formatBytes(bytesOf(output))} ({formatNumber(output.length)} characters)
    </>
  )
}
