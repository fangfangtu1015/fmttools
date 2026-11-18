'use client'

import * as React from 'react'
import { CATEGORIES, COMPARES, LEARN, TOOLS, USE_CASES } from '@/lib/site'
import { cn } from '@/lib/utils'
import { openConsentDialog } from '@/lib/consent'

function Logo() {
  return (
    <a href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="FmtTools home">
      <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-lg" width={32} height={32} />
      <span className="text-[0.9375rem] font-extrabold tracking-tight text-slate-900">
        Fmt<span className="text-blue-700">Tools</span>
      </span>
    </a>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        {label}
        <Chevron open={open} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-40 mt-1 w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-content items-center gap-3 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main navigation" className="ml-2 hidden items-center gap-0.5 md:flex">
          <Dropdown label="Tools">
            <div className="grid gap-1 sm:grid-cols-2">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="rounded-lg p-2 hover:bg-slate-50">
                  <a href={category.path} className="flex items-center gap-2 text-[0.8125rem] font-bold text-slate-900">
                    <span className={cn('inline-flex h-5 w-7 items-center justify-center rounded text-[0.5625rem] font-black text-white', category.accent)}>
                      {category.letter}
                    </span>
                    {category.name}
                  </a>
                  <ul className="mt-1.5 space-y-0.5">
                    {TOOLS.filter((tool) => tool.category === category.id).map((tool) => (
                      <li key={tool.slug}>
                        <a href={tool.path} className="block rounded px-1.5 py-0.5 text-[0.8125rem] text-slate-600 transition hover:bg-blue-50 hover:text-blue-800">
                          {tool.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <a href="/#all-tools" className="mt-1 block rounded-lg px-2.5 py-2 text-[0.8125rem] font-semibold text-blue-700 hover:bg-blue-50">
              All tools →
            </a>
          </Dropdown>
          <a href="/learn/" className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Format guides
          </a>
          <a href="/use-cases/" className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Use cases
          </a>
          <a href="/compare/" className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Comparisons
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 md:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="border-b border-slate-100 py-2">
              <a href={category.path} className="text-sm font-bold text-slate-900">
                {category.name}
              </a>
              <ul className="mt-1 grid gap-0.5">
                {TOOLS.filter((tool) => tool.category === category.id).map((tool) => (
                  <li key={tool.slug}>
                    <a href={tool.path} className="block py-1 text-[0.8125rem] text-slate-600">
                      {tool.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap gap-4 pt-3 text-sm font-semibold text-slate-700">
            <a href="/learn/">Format guides</a>
            <a href="/use-cases/">Use cases</a>
            <a href="/compare/">Comparisons</a>
          </div>
        </nav>
      ) : null}
    </header>
  )
}

const SPECS = [
  { label: 'RFC 8259 — JSON', href: 'https://datatracker.ietf.org/doc/html/rfc8259' },
  { label: 'RFC 4180 — CSV', href: 'https://datatracker.ietf.org/doc/html/rfc4180' },
  { label: 'YAML 1.2 Specification', href: 'https://yaml.org/spec/1.2.2/' },
  { label: 'XML 1.0 (Fifth Edition)', href: 'https://www.w3.org/TR/xml/' },
  { label: 'RFC 4648 — Base64', href: 'https://datatracker.ietf.org/doc/html/rfc4648' },
  { label: 'RFC 3986 — URI', href: 'https://datatracker.ietf.org/doc/html/rfc3986' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            All conversion happens in your browser. No data is uploaded, stored or logged.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Converters for JSON, CSV, YAML, Base64 and percent-encoded URIs, plus references written against the published
            specifications. No tracking pixels, no accounts, no uploads.
          </p>
        </div>

        <nav aria-label="Tools">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Tools</h2>
          <ul className="mt-3 space-y-1.5">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <a href={tool.path} className="text-sm text-slate-600 transition hover:text-blue-700">
                  {tool.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Guides and references">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Guides</h2>
          <ul className="mt-3 space-y-1.5">
            {LEARN.map((item) => (
              <li key={item.slug}>
                <a href={item.path} className="text-sm text-slate-600 transition hover:text-blue-700">
                  {item.name} guide
                </a>
              </li>
            ))}
            <li className="pt-2">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400">Use cases</span>
            </li>
            {USE_CASES.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <a href={item.path} className="text-sm text-slate-600 transition hover:text-blue-700">
                  {item.name}
                </a>
              </li>
            ))}
            {COMPARES.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <a href={item.path} className="text-sm text-slate-600 transition hover:text-blue-700">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Source specifications">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Standards we test against</h2>
          <ul className="mt-3 space-y-1.5">
            {SPECS.map((spec) => (
              <li key={spec.href}>
                <a
                  href={spec.href}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="text-sm text-slate-600 transition hover:text-blue-700"
                >
                  {spec.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {year} {`FmtTools`}. Tools are free to use; specification names and identifiers belong to their respective
            standards bodies.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <a href="/contact/" className="hover:text-slate-800">
              Contact
            </a>
            <a href="/terms/" className="hover:text-slate-800">
              Terms of Service
            </a>
            <a href="/cookie-policy/" className="hover:text-slate-800">
              Cookie Policy
            </a>
            <button
              type="button"
              onClick={openConsentDialog}
              className="text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-800"
            >
              Cookie settings
            </button>
            <a href="/#faq" className="hover:text-slate-800">
              How your data is handled
            </a>
            <a href="/sitemap.xml" className="hover:text-slate-800">
              Sitemap
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
