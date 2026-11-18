import * as React from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { OnThisPage } from '@/components/content'
import { breadcrumbSchema, webPageSchema } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

/**
 * Shared frame for the standalone site pages (cookie policy, terms, contact):
 * breadcrumb, header, content column and an optional page index, with the
 * WebPage and BreadcrumbList blocks kept in step with what is rendered.
 */
export function SitePageShell({
  kicker,
  h1,
  lead,
  path,
  description,
  updated,
  schemaType,
  toc,
  children,
}: {
  kicker: string
  h1: string
  lead: string
  path: string
  description: string
  updated: string
  schemaType?: 'WebPage' | 'ContactPage'
  toc?: { id: string; label: string }[]
  children: React.ReactNode
}) {
  return (
    <>
      <JsonLd
        blocks={[
          webPageSchema({ name: h1, path, description, type: schemaType, updated }),
          breadcrumbSchema({ path }),
        ]}
      />

      <div className="mx-auto max-w-content px-4 pt-5 sm:px-6">
        <Breadcrumbs path={path} />
      </div>

      <header className="mx-auto mt-4 max-w-content px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blue-700">{kicker}</p>
          <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.45rem]">{h1}</h1>
          <p className="mt-4 text-[1.125rem] leading-[1.7] text-slate-600">{lead}</p>
          <p className="mt-5 border-t border-slate-200 pt-3 text-[0.8125rem] text-slate-600">
            Last updated <span className="font-semibold text-slate-800">{formatDate(updated)}</span>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <article className="min-w-0">{children}</article>
          {toc && toc.length > 0 ? (
            <aside className="hidden lg:block lg:sticky lg:top-20">
              <OnThisPage items={toc} />
            </aside>
          ) : null}
        </div>
      </div>
    </>
  )
}
