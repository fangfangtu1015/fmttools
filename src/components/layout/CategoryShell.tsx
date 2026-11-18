import * as React from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { FaqList } from '@/components/content'
import { JsonLd } from '@/components/JsonLd'
import { LetterBadge } from '@/components/ui/card'
import { breadcrumbSchema, collectionSchema, faqSchema } from '@/lib/seo'
import { CATEGORIES, toolsInCategory, type Category, type CategoryId, type ToolDef } from '@/lib/site'
import { CATEGORY_COPY, type CategoryCopy } from '@/lib/category-copy'
import { TOOL_COPY } from '@/lib/tool-copy'

/**
 * Index page for one tool column. The FAQ list rendered here is the same array
 * the FAQPage schema is built from, and the card list is the ItemList.
 */
export function CategoryShell({ category }: { category: Category }) {
  const copy: CategoryCopy = CATEGORY_COPY[category.id]
  const tools: ToolDef[] = toolsInCategory(category.id)

  return (
    <>
      <JsonLd
        blocks={[
          collectionSchema({
            name: copy.heading,
            path: category.path,
            description: copy.indexDescription,
            modified: '2026-11-12',
            items: tools.map((tool) => ({ name: tool.name, path: tool.path, description: tool.summary })),
          }),
          breadcrumbSchema({ path: category.path }),
          faqSchema({ path: category.path, items: copy.faqs }),
        ]}
      />

      <div className="mx-auto max-w-content px-4 pt-5 sm:px-6">
        <Breadcrumbs path={category.path} />
      </div>

      <div className="mx-auto max-w-content px-4 pb-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <LetterBadge letter={category.letter} className={`h-12 w-12 rounded-xl text-[0.8125rem] ${category.accent}`} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-slate-900">{copy.heading}</h1>
            <p className="mt-1 text-[0.8125rem] font-bold uppercase tracking-wider text-slate-500">{category.headline}</p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-[1.0625rem] leading-relaxed text-slate-600">{copy.intro}</p>

        <ul className="mt-6 max-w-3xl space-y-2.5">
          {copy.angle.map((line) => (
            <li key={line.slice(0, 40)} className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-slate-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-[1.375rem] font-extrabold tracking-tight text-slate-900">
          {tools.length} tools in this column
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <a key={tool.slug} href={tool.path} className="grid-card flex flex-col p-5 no-underline">
              <span className="flex items-center gap-2.5">
                <LetterBadge letter={tool.letter} className="h-8 w-10 rounded-md text-[0.5625rem]" />
                <span className="text-[1.0625rem] font-bold leading-snug text-slate-900">{tool.name}</span>
              </span>
              <span className="mt-2.5 text-[0.875rem] leading-relaxed text-slate-600">{tool.summary}</span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {TOOL_COPY[tool.slug].features.slice(0, 3).map((feature) => (
                  <span key={feature} className={`rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset ${category.chip}`}>
                    {feature.split(':')[0]}
                  </span>
                ))}
              </span>
            </a>
          ))}
        </div>

        <section className="mt-12" id="faq">
          <h2 className="text-[1.375rem] font-extrabold tracking-tight text-slate-900">Questions people ask before converting</h2>
          <div className="mt-4 max-w-3xl">
            <FaqList items={copy.faqs} />
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div>
            <h2 className="text-[1.375rem] font-extrabold tracking-tight text-slate-900">Read next</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {copy.reading.map((item) => (
                <li key={item.path}>
                  <a href={item.path} className="block rounded-xl border border-slate-200 bg-white p-4 no-underline transition hover:border-blue-300 hover:shadow-sm">
                    <span className="text-[0.9375rem] font-bold text-slate-900">{item.name}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-relaxed text-slate-600">{item.blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <nav aria-label="Other tool columns" className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Other columns</p>
              <ul className="mt-2.5 space-y-2.5">
                {CATEGORIES.filter((other) => other.id !== category.id).map((other) => (
                  <li key={other.id}>
                    <a href={other.path} className="text-[0.8125rem] font-bold text-slate-800 transition hover:text-blue-700">
                      {other.name}
                    </a>
                    <span className="mt-0.5 block text-[0.75rem] leading-snug text-slate-500">
                      {toolsInCategory(other.id as CategoryId).length} tools
                    </span>
                  </li>
                ))}
                <li>
                  <a href="/#all-tools" className="text-[0.8125rem] font-bold text-blue-700">
                    All tools index →
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </section>
      </div>
    </>
  )
}
