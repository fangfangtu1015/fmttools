'use client'

import * as React from 'react'
import { Button, LinkButton } from '@/components/ui/button'
import { SITE } from '@/lib/site'

const TOPICS = [
  { value: 'tool-bug', label: 'A tool produced wrong output', subject: 'Tool issue' },
  { value: 'guide-error', label: 'A guide or comparison is inaccurate', subject: 'Correction' },
  { value: 'missing-tool', label: 'A converter or format is missing', subject: 'Feature request' },
  { value: 'licensing', label: 'Licensing or reuse of the written material', subject: 'Licensing enquiry' },
  { value: 'privacy', label: 'Cookies, data handling or these policies', subject: 'Policy question' },
  { value: 'other', label: 'Something else', subject: 'Message' },
] as const

const FIELD =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25'

/**
 * Composes a mail message in the visitor's own client. The site has no backend,
 * so this form cannot submit anywhere: the only transport is the mailto: URL.
 */
export function ContactForm() {
  const [topic, setTopic] = React.useState<(typeof TOPICS)[number]['value']>('tool-bug')
  const [details, setDetails] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  const meta = TOPICS.find((item) => item.value === topic) ?? TOPICS[0]
  const body = details.trim()
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`[${meta.subject}]`)}&body=${encodeURIComponent(body)}`

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(SITE.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the address is visible on the page anyway */
    }
  }

  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-800">What is it about?</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value as typeof topic)} className={FIELD}>
            {TOPICS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2">
          <span className="text-[0.8125rem] font-semibold text-slate-800">Or write to us directly</span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${SITE.email}`}
              className="font-mono text-sm font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-600"
            >
              {SITE.email}
            </a>
            <Button variant="outline" size="sm" onClick={copyAddress}>
              {copied ? 'Copied' : 'Copy address'}
            </Button>
          </div>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-800">Details</span>
        <textarea
          rows={7}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          spellCheck
          placeholder={
            'Tool and page URL, what you pasted (or its shape), what came back, what you expected, and your browser.\n\nPlease describe the input rather than sending the file itself.'
          }
          className={`${FIELD} scrollbar-thin resize-y font-mono text-[0.8125rem] leading-6`}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <LinkButton href={href} size="lg">
          Open in your mail app
        </LinkButton>
        <p className="text-xs leading-relaxed text-slate-500">
          Subject line: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.75rem] text-slate-700">[{meta.subject}]</code>
          {' · '}Nothing is sent until your mail app does it. This form has no server behind it.
        </p>
      </div>
    </div>
  )
}
