import * as React from 'react'
import { breadcrumbsFor } from '@/lib/site'
import { cn } from '@/lib/utils'

export function Breadcrumbs({ path, className }: { path: string; className?: string }) {
  const crumbs = breadcrumbsFor(path)
  if (crumbs.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-slate-500">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 ? (
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {last ? (
                <span aria-current="page" className="font-semibold text-slate-700">
                  {crumb.name}
                </span>
              ) : (
                <a href={crumb.path} className="font-medium transition hover:text-blue-700">
                  {crumb.name}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
