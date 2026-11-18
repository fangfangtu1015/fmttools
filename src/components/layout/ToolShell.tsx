import * as React from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { Callout, DataTable, FaqList, H2, P, Prose, Rich } from '@/components/content'
import { JsonLd } from '@/components/JsonLd'
import { LetterBadge } from '@/components/ui/card'
import { absolute, toolsInCategory, type ToolDef } from '@/lib/site'
import { TOOL_COPY, type ToolCopy } from '@/lib/tool-copy'
import { breadcrumbSchema, buildMetadata, faqSchema, howToSchema, webApplicationSchema } from '@/lib/seo'

export function toolMetadata(tool: ToolDef) {
  return buildMetadata({ title: tool.title, description: tool.description, path: tool.path, keywords: tool.keywords })
}

/**
 * Shared layout for every converter page: entity schema, workspace, the
 * tool-specific explanation, same-category links and the visible FAQ that the
 * FAQPage schema is generated from.
 */
export function ToolShell({ tool, workspace }: { tool: ToolDef; workspace: React.ReactNode }) {
  const copy: ToolCopy = TOOL_COPY[tool.slug]
  const siblings = toolsInCategory(tool.category).filter((item) => item.slug !== tool.slug)

  return (
    <>
      <JsonLd
        blocks={[
          webApplicationSchema({
            name: tool.name,
            path: tool.path,
            description: tool.description,
            features: copy.features,
            category: copy.schemaCategory,
            datePublished: '2026-11-12',
            dateModified: '2026-11-12',
          }),
          breadcrumbSchema({ path: tool.path }),
          faqSchema({ path: tool.path, items: copy.faqs }),
          howToSchema({ name: tool.name, path: tool.path, description: copy.howIntro, steps: copy.steps, toolName: tool.name }),
        ]}
      />

      <div className="mx-auto max-w-content px-4 pt-5 sm:px-6">
        <Breadcrumbs path={tool.path} />
      </div>

      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <LetterBadge letter={tool.letter} className="h-12 w-12 rounded-xl text-[0.8125rem]" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.875rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.25rem]">{tool.h1}</h1>
            <p className="mt-2.5 max-w-3xl text-[1.0625rem] leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
        </div>

        <div className="mt-7">{workspace}</div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <div className="min-w-0">
            <Prose>
              <H2 id="what-it-does">{copy.whatItDoesHeading}</H2>
              {copy.whatItDoes.map((paragraph) => (
                <P key={paragraph.slice(0, 32)}>
                  <Rich text={paragraph} />
                </P>
              ))}

              <H2 id="features">{copy.featuresHeading}</H2>
              <ul className="my-4 grid gap-2.5 sm:grid-cols-2">
                {copy.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[0.9375rem] leading-relaxed text-slate-700">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>
                      <Rich text={feature} />
                    </span>
                  </li>
                ))}
              </ul>

              <H2 id="how-to">{copy.howHeading}</H2>
              <ol className="my-4 space-y-3">
                {copy.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-[0.9375rem] font-bold text-slate-900">{step.title}</span>
                      <span className="mt-0.5 block text-[0.9375rem] leading-relaxed text-slate-600">
                        <Rich text={step.body} />
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              {copy.table ? (
                <>
                  <H2 id="reference">{copy.table.heading}</H2>
                  <DataTable head={copy.table.head} rows={copy.table.rows} caption={copy.table.caption} foot={copy.table.foot} />
                </>
              ) : null}

              {copy.privacyNote ? (
                <Callout tone="tip" title="Where your data goes">
                  <P>
                    <Rich text={copy.privacyNote} />
                  </P>
                </Callout>
              ) : null}

              <H2 id="faq">Frequently asked questions</H2>
              <FaqList items={copy.faqs} />
            </Prose>
          </div>

          <aside className="min-w-0">
            <nav aria-label={`More tools in ${copy.categoryName}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">{copy.categoryName}</p>
              <ul className="mt-2.5 space-y-2">
                {siblings.map((item) => (
                  <li key={item.slug}>
                    <a href={item.path} className="flex items-start gap-2 text-[0.8125rem] font-semibold text-slate-700 transition hover:text-blue-700">
                      <span aria-hidden="true" className="mt-0.5 inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded bg-slate-900 px-1 text-[0.5625rem] font-black text-white">
                        {item.letter}
                      </span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Standards this tool follows</p>
              <ul className="mt-2.5 space-y-2">
                {copy.specs.map((spec) => (
                  <li key={spec.href} className="text-[0.8125rem] leading-snug">
                    <a href={spec.href} target="_blank" rel="noopener noreferrer external" className="font-semibold text-blue-700 hover:underline">
                      {spec.label}
                    </a>
                    <span className="mt-0.5 block text-slate-500">{spec.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Read next</p>
              <ul className="mt-2.5 space-y-2">
                {copy.guides.map((guide) => (
                  <li key={guide.path}>
                    <a href={guide.path} className="text-[0.8125rem] font-semibold text-slate-700 transition hover:text-blue-700">
                      {guide.name}
                    </a>
                    <span className="mt-0.5 block text-[0.75rem] leading-snug text-slate-500">{guide.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-500">
              Permalink: <a href={absolute(tool.path)} className="font-mono break-all text-slate-600 hover:text-blue-700">{absolute(tool.path)}</a>
            </p>
          </aside>
        </div>
      </div>
    </>
  )
}
