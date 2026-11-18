import * as React from 'react'
import { cn, formatDate } from '@/lib/utils'

/**
 * Editorial primitives shared by guides, use-case pages and comparisons.
 * Content is authored as TSX using these pieces so that headings, tables,
 * code and FAQ markup stay consistent — and so schema.org FAQ data can be
 * generated from the exact strings rendered here.
 */

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('prose-ct max-w-prose', className)}>{children}</div>
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="max-w-prose text-[1.1875rem] leading-[1.7] text-slate-600">{md(children)}</p>
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="group mt-12 scroll-mt-24 text-[1.6rem] font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  )
}

export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mt-9 scroll-mt-24 text-[1.275rem] font-bold text-slate-900">
      {children}
    </h3>
  )
}

export function Section({
  id,
  title,
  kicker,
  children,
  className,
}: {
  id: string
  title: string
  kicker?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 border-t border-slate-200 pt-10', className)}>
      {kicker ? <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blue-700">{kicker}</p> : null}
      <H2 id={`${id}-h`}>{title}</H2>
      <div className="prose-ct mt-2 max-w-prose">{children}</div>
    </section>
  )
}

const TOKEN = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g

/** Markdown-lite renderer: links, inline code and bold, without innerHTML. */
function inline(text: string): React.ReactNode {
  const parts = text.split(TOKEN).filter(Boolean)
  return parts.map((part, index) => {
    if (part.startsWith('[')) {
      const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
      if (match) {
        const external = /^https?:/.test(match[2]) && !match[2].startsWith('https://fmttools.com')
        return (
          <a
            key={index}
            href={match[2]}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {match[1]}
          </a>
        )
      }
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={index}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index}>{part.slice(2, -2)}</strong>
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

export function Rich({ text }: { text: string }) {
  return <>{inline(text)}</>
}

/** String children arrive as JSX text, where markdown would otherwise print literally. */
function md(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => (typeof child === 'string' ? inline(child) : child))
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[1.0625rem] leading-[1.75] text-slate-700">{md(children)}</p>
}

export function CodeBlock({
  title,
  code,
  language = 'json',
  caption,
}: {
  title?: string
  code: string
  language?: string
  caption?: string
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3.5 py-2">
        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500">{title ?? language}</span>
        <span className="font-mono text-[0.6875rem] text-slate-400">{code.split('\n').length} lines</span>
      </figcaption>
      <pre className="scrollbar-thin overflow-x-auto bg-code-bg px-3.5 py-3 text-[0.8125rem] leading-6 text-code-fg">
        <code>{code}</code>
      </pre>
      {caption ? <p className="border-t border-slate-200 bg-white px-3.5 py-2 text-xs leading-snug text-slate-600">{caption}</p> : null}
    </figure>
  )
}

export function DataTable({
  caption,
  head,
  rows,
  foot,
  compact,
}: {
  caption?: string
  head: string[]
  rows: React.ReactNode[][]
  foot?: string
  compact?: boolean
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="border-b border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-xs font-semibold text-slate-600">{inline(caption)}</caption> : null}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {head.map((cell) => (
              <th key={cell} scope="col" className={cn('px-3.5 text-left align-bottom font-bold text-slate-700', compact ? 'py-2 text-xs' : 'py-2.5 text-[0.8125rem]')}>
                {inline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/40">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-3.5 py-2.5 text-left align-top text-[0.8125rem] font-semibold text-slate-900">
                    {md(cell)}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-3.5 py-2.5 align-top text-[0.8125rem] leading-relaxed text-slate-600">
                    {md(cell)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {foot ? <p className="border-t border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-500">{inline(foot)}</p> : null}
    </div>
  )
}

const CALLOUT_TONES = {
  spec: 'border-sky-200 bg-sky-50',
  warn: 'border-amber-200 bg-amber-50',
  risk: 'border-rose-200 bg-rose-50',
  tip: 'border-emerald-200 bg-emerald-50',
  note: 'border-slate-200 bg-slate-50',
} as const

const CALLOUT_LABELS = {
  spec: 'In the specification',
  warn: 'Where this goes wrong',
  risk: 'Security consequence',
  tip: 'What to do instead',
  note: 'Note',
} as const

export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: keyof typeof CALLOUT_TONES
  title?: string
  children: React.ReactNode
}) {
  return (
    <aside className={cn('my-6 rounded-xl border px-4 py-3.5', CALLOUT_TONES[tone])}>
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-slate-500">{title ?? CALLOUT_LABELS[tone]}</p>
      <div className="mt-1.5 space-y-2 text-[0.9375rem] leading-relaxed text-slate-800">{children}</div>
    </aside>
  )
}

export type Source = { label: string; href: string; detail: string; accessed?: string }

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <section aria-labelledby="sources-h" className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
      <h2 id="sources-h" className="text-[0.9375rem] font-bold uppercase tracking-wider text-slate-700">
        Sources and further reading
      </h2>
      <ol className="mt-3 space-y-2.5">
        {sources.map((source, index) => (
          <li key={source.href} className="text-sm leading-relaxed">
            <span className="mr-1.5 font-mono text-xs text-slate-400">[{index + 1}]</span>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer external"
              className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-600"
            >
              {source.label}
            </a>
            <span className="text-slate-600"> — {source.detail}</span>
            {source.accessed ? <span className="text-slate-400"> (accessed {formatDate(source.accessed)})</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

export type Faq = { question: string; answer: string }

/** The same array renders here and is passed to faqSchema(), so markup matches the page. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-start gap-2.5 text-[0.9375rem] font-semibold text-slate-900 marker:hidden">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{item.question}</span>
          </summary>
          <div className="mt-2 max-w-prose pl-7 text-[0.9375rem] leading-relaxed text-slate-600">
            <p>
              <Rich text={item.answer} />
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}

export function Figure({
  src,
  alt,
  caption,
  width = 1200,
  height = 630,
  priority,
}: {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
  priority?: boolean
}) {
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="auto"
        className="block h-auto w-full bg-slate-50"
      />
      <figcaption className="border-t border-slate-200 px-4 py-2.5 text-xs leading-relaxed text-slate-600">{caption}</figcaption>
    </figure>
  )
}

export function KeyTerms({ items }: { items: { term: string; definition: string }[] }) {
  return (
    <dl className="my-6 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.term} className="bg-white px-4 py-3">
          <dt className="font-mono text-[0.8125rem] font-bold text-slate-900">{item.term}</dt>
          <dd className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">{item.definition}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ToolLink({ path, name, blurb, letter }: { path: string; name: string; blurb?: string; letter?: string }) {
  return (
    <a href={path} className="grid-card flex items-start gap-3 no-underline">
      {letter ? (
        <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[0.625rem] font-black text-white">
          {letter}
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-bold text-slate-900">{name}</span>
        {blurb ? <span className="mt-1 block text-[0.8125rem] leading-relaxed text-slate-600">{blurb}</span> : null}
      </span>
    </a>
  )
}

export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">On this page</p>
      <ol className="mt-2.5 space-y-1.5 text-[0.8125rem]">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-2">
            <span className="font-mono text-xs text-slate-400">{index + 1}</span>
            <a href={`#${item.id}`} className="font-medium text-slate-700 transition hover:text-blue-700">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
