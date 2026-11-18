'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={htmlFor} className="block text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function SelectField({
  value,
  onChange,
  options,
  id,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  id?: string
  ariaLabel?: string
}) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-2.5 pr-8 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Segmented({
  value,
  onChange,
  options,
  legend,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; title?: string }[]
  legend: string
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm" role="group" aria-label={legend}>
        {options.map((option, index) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              title={option.title}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex-1 whitespace-nowrap px-2 py-1.5 text-xs font-semibold transition',
                index > 0 && 'border-l border-slate-300',
                active ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ToggleField({
  checked,
  onChange,
  label,
  hint,
  id,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  id?: string
}) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div className="flex items-start gap-2">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-500/40"
      />
      <label htmlFor={inputId} className="cursor-pointer select-none text-sm font-medium leading-snug text-slate-700">
        {label}
        {hint ? <span className="mt-0.5 block text-xs font-normal text-slate-500">{hint}</span> : null}
      </label>
    </div>
  )
}

export function NumberField({
  value,
  onChange,
  min = 1,
  max = 12,
  label,
  step = 1,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label: string
  step?: number
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)))
        }}
        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
      />
    </div>
  )
}

export function CopyButton({ text, label = 'Copy', className, tone = 'secondary' }: { text: string; label?: string; className?: string; tone?: 'secondary' | 'default' | 'ghost' }) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'failed'>('idle')

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', 'true')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(area)
        if (!ok) throw new Error('execCommand rejected')
      }
      setState('copied')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('failed')
      window.setTimeout(() => setState('idle'), 2400)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        tone === 'secondary' && 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-200',
        tone === 'default' && 'bg-blue-700 text-white hover:bg-blue-800',
        tone === 'ghost' && 'text-slate-500 hover:bg-white/70 hover:text-slate-800',
        state === 'copied' && 'bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-600',
        className,
      )}
      aria-live="polite"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
        {state === 'copied' ? (
          <path d="M4 10.5l3.5 3.5L16 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="7" y="7" width="9" height="9" rx="2" />
            <path d="M13 7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2h1" />
          </>
        )}
      </svg>
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : label}
    </button>
  )
}

export function DownloadButton({ text, filename, mime = 'text/plain;charset=utf-8', label }: { text: string; filename: string; mime?: string; label: string }) {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    const blob = new Blob([text], { type: mime })
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [text, mime])

  return (
    <a
      href={url ?? '#'}
      download={filename}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-200"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M10 4v8m0 0l-3-3m3 3l3-3M5 15h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </a>
  )
}
