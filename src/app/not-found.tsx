import * as React from 'react'
import { LetterBadge } from '@/components/ui/card'
import { COMPARES, LEARN, TOOLS } from '@/lib/site'

export const metadata = {
  title: 'Page not found | FmtTools',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <p className="font-mono text-[0.8125rem] font-bold uppercase tracking-widest text-slate-500">404 · not found</p>
      <h1 className="mt-3 max-w-2xl text-[2rem] font-extrabold leading-tight tracking-tight text-slate-900">
        That path does not exist on this site
      </h1>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-slate-600">
        Two causes account for almost all of these: a trailing slash dropped somewhere, and an old bookmark from a converter that used to live at a
        different path. Nothing you typed was lost — a 404 response means the server never resolved the resource, so no data was sent anywhere.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h2 className="text-[1.125rem] font-bold text-slate-900">Tools</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <a href={tool.path} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 no-underline transition hover:border-blue-300">
                  <LetterBadge letter={tool.letter} className="h-7 w-9 rounded-md text-[0.5625rem]" />
                  <span className="text-[0.875rem] font-semibold text-slate-800">{tool.name}</span>
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-[1.125rem] font-bold text-slate-900">Guides and comparisons</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[...LEARN, ...COMPARES].map((item) => (
              <li key={item.path}>
                <a href={item.path} className="text-[0.875rem] font-medium text-slate-700 hover:text-blue-700">
                  {item.h1}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Start over</p>
          <ul className="mt-2.5 space-y-2 text-[0.875rem] font-semibold">
            <li>
              <a href="/" className="text-blue-700 hover:underline">
                Home, with every tool indexed
              </a>
            </li>
            <li>
              <a href="/learn/" className="text-blue-700 hover:underline">
                Format guides
              </a>
            </li>
            <li>
              <a href="/use-cases/" className="text-blue-700 hover:underline">
                Workflows by job
              </a>
            </li>
            <li>
              <a href="/sitemap.xml" className="text-blue-700 hover:underline">
                Full sitemap
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
