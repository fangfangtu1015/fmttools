'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentChoice } from '@/lib/consent'

export function CookieBanner() {
  const [open, setOpen] = React.useState(false)
  const [isSettings, setIsSettings] = React.useState(false)
  const [choice, setChoice] = React.useState<ConsentChoice | null>(null)
  const acceptRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const stored = readConsent()
    if (!stored) setOpen(true)
    const onOpen = () => {
      setIsSettings(Boolean(readConsent()))
      setOpen(true)
    }
    window.addEventListener(CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(CONSENT_EVENT, onOpen)
  }, [])

  React.useEffect(() => {
    if (!open) return
    acceptRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  function save(next: ConsentChoice) {
    writeConsent(next)
    setChoice(next)
    setIsSettings(false)
    setOpen(false)
  }

  return (
    <section
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/98 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-500">
            {isSettings ? 'Your cookie settings' : 'About cookies on this site'}
          </p>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-700">
            FmtTools runs every converter in this browser tab and sets <strong className="font-semibold text-slate-900">no cookies</strong> —
            not first-party, not third-party, no analytics or advertising tags. Your choice below is kept in this browser&apos;s local storage
            so it can be honoured if hosted services are ever added.
            {isSettings && choice ? (
              <>
                {' '}
                Current choice: <strong className="font-semibold text-slate-900">{choice === 'all' ? 'allow optional services' : 'strictly necessary only'}</strong>.
              </>
            ) : null}{' '}
            <a href="/cookie-policy/" className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-600">
              Read the cookie policy
            </a>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button ref={acceptRef} size="sm" onClick={() => save('all')}>
            Allow optional
          </Button>
          <Button variant="outline" size="sm" onClick={() => save('necessary')}>
            Necessary only
          </Button>
          {isSettings ? (
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
