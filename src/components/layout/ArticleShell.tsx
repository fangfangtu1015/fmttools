import * as React from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { FaqList, OnThisPage, Section, SourceList, ToolLink } from '@/components/content'
import { JsonLd } from '@/components/JsonLd'
import type { ArticleMeta } from '@/lib/content-types'
import { GROUPS, GROUP_LABELS, type ArticleGroup } from '@/content/registry'
import { articleSchema, breadcrumbSchema, collectionSchema, faqSchema } from '@/lib/seo'
import { TOOLS } from '@/lib/site'
import { formatDate } from '@/lib/utils'

const GROUP_KICKER: Record<ArticleGroup, string> = {
  learn: 'Format reference',
  'use-cases': 'Workflow toolkit',
  compare: 'Format comparison',
}

/** Split the tools out of an article's related list so the sidebar can show them separately. */
function relatedTools(meta: ArticleMeta) {
  return meta.related
    .map((item) => TOOLS.find((tool) => tool.path === item.path))
    .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool))
}

function MoreInSection({ group, current }: { group: ArticleGroup; current: string }) {
  const siblings = Object.entries(GROUPS[group])
    .filter(([slug]) => slug !== current)
    .slice(0, 3)
  if (siblings.length === 0) return null
  const labels = GROUP_LABELS[group]
  return (
    <nav aria-label={`More in ${labels.crumb}`} className="mt-10">
      <h2 className="text-[0.9375rem] font-bold uppercase tracking-wider text-slate-700">{labels.crumb}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {siblings.map(([slug, sibling]) => (
          <a key={slug} href={sibling.meta.path} className="grid-card p-4 no-underline">
            <span className="block text-[0.9375rem] font-bold leading-snug text-slate-900">{sibling.meta.h1}</span>
            <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-slate-600">{sibling.meta.summary}</span>
          </a>
        ))}
      </div>
      <a href={labels.path} className="mt-4 inline-block text-[0.8125rem] font-semibold text-blue-700">
        All {labels.crumb.toLowerCase()}
      </a>
    </nav>
  )
}

export function ArticleShell({ meta, group, Body }: { meta: ArticleMeta; group: ArticleGroup; Body: React.ComponentType }) {
  const tools = relatedTools(meta)
  const links = meta.related.filter((item) => !item.path.startsWith('/json-tools/') && !item.path.startsWith('/format-converters/') && !item.path.startsWith('/encoders-decoders/'))

  return (
    <>
      <JsonLd
        blocks={[
          articleSchema({
            name: meta.h1,
            path: meta.path,
            description: meta.description,
            published: meta.published,
            modified: meta.updated,
            sections: meta.sections.map((section) => section.label),
            words: meta.words,
            image: meta.image,
          }),
          breadcrumbSchema({ path: meta.path }),
          faqSchema({ path: meta.path, items: meta.faqs }),
        ]}
      />

      <div className="mx-auto max-w-content px-4 pt-5 sm:px-6">
        <Breadcrumbs path={meta.path} />
      </div>

      <header className="mx-auto mt-4 max-w-content px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blue-700">{GROUP_KICKER[group]}</p>
          <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.45rem]">{meta.h1}</h1>
          <p className="mt-4 text-[1.125rem] leading-[1.7] text-slate-600">{meta.summary}</p>
        </div>
        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-200 py-3 text-[0.8125rem] text-slate-600">
          <div className="flex items-center gap-1.5">
            <dt className="text-slate-500">Updated</dt>
            <dd className="font-semibold text-slate-800">{formatDate(meta.updated)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Reading time</dt>
            <dd>{meta.readingMinutes} min read</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Length</dt>
            <dd>{meta.words.toLocaleString('en-US')} words</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Reviewer note</dt>
            <dd>Checked against the published specification</dd>
          </div>
        </dl>
        <img
          src={meta.image}
          alt={meta.imageAlt}
          width={1536}
          height={1024}
          className="mt-6 block h-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm"
        />
      </header>

      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <article className="min-w-0">
            <Body />

            <Section
              id="faq"
              title={`Questions about ${meta.faqTopic ?? meta.h1.replace(/:.*$/, '').trim()}`}
              kicker="Answers"
            >
              <FaqList items={meta.faqs} />
            </Section>

            {links.length > 0 ? (
              <Section id="next-up" title="Next up" kicker="Related">
                <div className="my-4 grid gap-3 sm:grid-cols-2">
                  {links.map((item) => (
                    <ToolLink key={item.path} path={item.path} name={item.name} blurb={item.blurb} />
                  ))}
                </div>
              </Section>
            ) : null}

            <SourceList sources={meta.sources} />

            <MoreInSection group={group} current={meta.slug} />
          </article>

          <aside className="hidden lg:block lg:sticky lg:top-20">
            <OnThisPage items={meta.sections.concat({ id: 'faq', label: 'Questions and answers' })} />
            {tools.length > 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Tools for this page</p>
                <ul className="mt-2.5 space-y-2">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <a href={tool.path} className="flex items-start gap-2 text-[0.8125rem] font-semibold text-slate-700 transition hover:text-blue-700">
                        <span aria-hidden="true" className="mt-0.5 inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded bg-slate-900 px-1 text-[0.5625rem] font-black text-white">
                          {tool.letter}
                        </span>
                        {tool.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  )
}

/** Index page for a content group: header, card grid and the three schema blocks. */
export function GroupIndexShell({
  group,
  heading,
  intro,
  items,
}: {
  group: ArticleGroup
  heading: string
  intro: string
  items: { meta: ArticleMeta; Body: React.ComponentType }[]
}) {
  const labels = GROUP_LABELS[group]
  return (
    <>
      <JsonLd
        blocks={[
          collectionSchema({
            name: heading,
            path: labels.path,
            description: labels.indexDescription,
            modified: items.map((item) => item.meta.updated).sort()[0] ?? '2026-11-02',
            items: items.map((item) => ({ name: item.meta.h1, path: item.meta.path, description: item.meta.summary })),
          }),
          breadcrumbSchema({ path: labels.path }),
          faqSchema({ path: labels.path, items: INDEX_FAQS[group] }),
        ]}
      />
      <div className="mx-auto max-w-content px-4 pt-5 sm:px-6">
        <Breadcrumbs path={labels.path} />
      </div>
      <div className="mx-auto max-w-content px-4 pb-4 pt-6 sm:px-6">
        <h1 className="max-w-3xl text-[2rem] font-extrabold leading-tight tracking-tight text-slate-900">{heading}</h1>
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-slate-600">{intro}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <a key={item.meta.path} href={item.meta.path} className="grid-card flex flex-col overflow-hidden p-0 no-underline">
              <img
                src={item.meta.image}
                alt={item.meta.imageAlt}
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="h-40 w-full border-b border-slate-200 bg-slate-50 object-cover sm:h-44"
              />
              <span className="block p-5">
                <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-blue-700">
                  {GROUP_KICKER[group]} · {item.meta.readingMinutes} min
                </span>
                <span className="mt-1.5 block text-[1.0625rem] font-bold leading-snug text-slate-900">{item.meta.h1}</span>
                <span className="mt-2 block text-[0.875rem] leading-relaxed text-slate-600">{item.meta.summary}</span>
                <span className="mt-3 block text-[0.8125rem] font-semibold text-slate-500">{formatDate(item.meta.updated)}</span>
              </span>
            </a>
          ))}
        </div>
        <Section id="index-faq" title="Common questions" kicker="Before you start">
          <FaqList items={INDEX_FAQS[group]} />
        </Section>
      </div>
    </>
  )
}

const INDEX_FAQS: Record<ArticleGroup, { question: string; answer: string }[]> = {
  learn: [
    {
      question: 'Are these guides a substitute for the specification?',
      answer:
        'No. Each guide cites the clause it describes — RFC 8259 for JSON, RFC 4180 for CSV, the YAML 1.2 spec, XML 1.0 Fifth Edition and RFC 4648 — and links to it in the source list. The guides explain what the clauses mean in practice and where implementations diverge from them.',
    },
    {
      question: 'Which guide should I read first?',
      answer:
        'If you are moving data between two systems, start with the guide for the format you are writing, not the one you are reading: most corruption happens during serialisation. The JSON and CSV guides cover the two cases that come up most often.',
    },
    {
      question: 'Do the guides recommend a tool on this site?',
      answer:
        'Each guide links to the converters that implement the rules it describes, and every converter runs locally in your browser, so the page you are reading is not an upload gateway for your data.',
    },
  ],
  'use-cases': [
    {
      question: 'Is any of this data sent to a server?',
      answer:
        'No. Every converter referenced from a use-case page parses and rewrites the text inside your browser tab, then offers the result as a Blob download. Nothing is POSTed, and there is no account to sign in to.',
    },
    {
      question: 'Can I use these workflows on files that are too big for a browser?',
      answer:
        'Up to roughly 100-200 MB of text a modern browser handles in memory, depending on the device. Above that, use a streaming parser such as `jq`, `gojq`, Python `csv` with an iterator, or `yq` — the guides explain the same rules those tools apply.',
    },
    {
      question: 'Do the workflows cover formats other than JSON, CSV and YAML?',
      answer:
        'XML, TSV, TOML and NDJSON are covered inside the relevant guides and comparisons. This site builds tools for text formats where the conversion step is the error-prone one.',
    },
  ],
  compare: [
    {
      question: 'How are these comparisons measured?',
      answer:
        'Where a page quotes a size ratio or a count, it is produced from the same record encoded in both formats and described in the text, or attributed to the published source and year. Benchmarks that depend on a specific library version are labelled as such.',
    },
    {
      question: 'Is one format always the winner?',
      answer:
        'No, and a page that claimed so would be useless for a decision. Each comparison states the conditions under which each format is the better choice, then gives the conversion path between them.',
    },
    {
      question: 'Why is there no XML to JSON converter if you compare them?',
      answer:
        'Because a correct one needs namespace resolution, attribute collapsing and mixed-content rules, which is a different project from the ten converters here. The XML guide explains the mapping decisions you have to make before any tool can be written.',
    },
  ],
}
