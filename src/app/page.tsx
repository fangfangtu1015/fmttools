import * as React from 'react'
import { FormatterDemo } from '@/components/home/FormatterDemo'
import { JsonLd } from '@/components/JsonLd'
import { LetterBadge } from '@/components/ui/card'
import { GROUPS } from '@/content/registry'
import { CATEGORIES, LEARN, TOOLS, USE_CASES, type CategoryId } from '@/lib/site'
import { breadcrumbSchema, buildMetadata, faqSchema, websiteSchema } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

export const metadata = buildMetadata({
  title: 'Free Online Developer Tools - JSON, CSV, Base64 Converter | FmtTools',
  description:
    'Free online data format converters. Format JSON, convert CSV to JSON, encode Base64, and more. No signup, works in browser, privacy-safe.',
  path: '/',
  keywords: [
    'json formatter online',
    'csv to json',
    'yaml to json',
    'base64 encode decode',
    'url encode decode',
    'data format converter',
  ],
})

const HOME_FAQS = [
  {
    question: 'Do these converters upload the data I paste?',
    answer:
      'No. Every tool on this site is JavaScript that runs in your browser tab: parsing, conversion, encoding and validation all happen locally, so the request your browser makes is only for the page itself and its scripts. That is what makes these pages usable on production API payloads, customer exports and private keys — the things you cannot paste into a converter that posts your text to a server. It also means a page keeps working once loaded, with no account, no rate limit and no size quota other than your own memory.',
  },
  {
    question: 'Which converter should I use first?',
    answer:
      'Start with the format you are holding. A JSON body you cannot read goes to the formatter; a file that will not parse goes to the validator, which names the exact line and column; a spreadsheet export destined for an API goes to CSV to JSON; a Kubernetes or CI manifest goes to YAML to JSON; a token or inline image goes to Base64; and a value that has to survive inside a URL goes to URL encode. If the job spans two of those, the use-case pages chain the tools in the order that works.',
  },
  {
    question: 'Is the output safe to put back into production?',
    answer:
      'Conversion is faithful, but faithfulness has limits you should understand. JSON numbers are kept as the literal text you pasted, so 9007199254740993 does not silently become 9007199254740992 the way it does when a value passes through a double-precision number. Where a conversion has to decide something the source format does not express — a CSV column type, a YAML plain scalar, an array in a CSV cell — the page shows the decision and lets you change it. Anything the tool cannot represent without changing meaning is reported rather than guessed, and a round-trip check proves the result parses back to the same value.',
  },
  {
    question: 'Why does my converted CSV lose leading zeros or long ID digits?',
    answer:
      'Because that damage usually happens before conversion, in the spreadsheet. Excel and Google Sheets parse a numeric-looking cell into a number, which drops the leading zero from 007 and caps precision at 15 significant digits, so 12345678901234567 becomes 12345678901234500. Double-clicking a UTF-8 CSV also misreads non-ASCII text unless the file carries a byte-order mark. The CSV to JSON page audits the columns you loaded and lists exactly which ones have already been damaged, so you can fix the export settings instead of trusting the file.',
  },
  {
    question: 'What is the difference between base64 and base64url, and which do I need?',
    answer:
      'Both pack three bytes into four characters from a 64-symbol alphabet (RFC 4648); only two symbols differ. Standard base64 uses "+" and "/", which are unsafe in URLs and file names — a "+" in a query string is read as a space — so §5 replaces index 62 with "-" and index 63 with "_". JWT segments use base64url with the "=" padding removed. Paste a base64url value into a decoder that assumes the standard alphabet and any value containing "-" or "_" breaks, which is why the decoder detects the alphabet from the characters present.',
  },
  {
    question: 'Can I use these tools offline, and is there a size limit?',
    answer:
      'Once a page has loaded, the tool logic is already in the tab, so conversion continues with the network unavailable — handy on a plane or inside an air-gapped VPN. There is no upload cap because there is no upload. The practical ceiling is memory: multi-megabyte payloads format and convert fine, while a file of several hundred megabytes will make the tab work hard, and for those the command-line tools (jq, mlr, yq) stream instead of holding everything in one string.',
  },
  {
    question: 'Do you validate against a JSON Schema or OpenAPI document?',
    answer:
      'Not yet — and we would rather say so than imply it. The validator checks a document against RFC 8259 grammar and reports the errors and risks a plain JSON.parse hides, but it does not check your own schema: required members, types, patterns or enum values. For that you need a validator pointed at the schema you are contracted to, and the formatter plus validator here are the steps before it: get the document parsing cleanly first.',
  },
  {
    question: 'Why do the guides cite clause numbers instead of just describing the formats?',
    answer:
      'Because the clause is where an argument ends. "CSV allows newlines inside a field" is a preference someone can dispute; RFC 4180 §2.6 says a field MAY contain line breaks and §2.7 requires quoting when it does, which is why split(",") is not a CSV parser no matter what your library does quietly. Every guide links the specification it describes, so you can read the source rather than our summary of it — and check whether an implementation disagrees with it.',
  },
]

type ToolRow = { label: string; blurb: string; links: { text: string; path: string }[] }

/** Card copy is written per page position, so it lives here rather than in the shared tool definitions. */
const TOOL_ROWS: Record<CategoryId, ToolRow[]> = {
  'json-tools': [
    {
      label: 'JSON Formatter',
      blurb: 'Beautify JSON with 2/4-space indentation. Handles deeply nested structures.',
      links: [{ text: 'Open the formatter', path: '/json-tools/formatter/' }],
    },
    {
      label: 'JSON Validator',
      blurb: 'Validate against RFC 8259. Reports exact line and column of errors.',
      links: [{ text: 'Validate JSON', path: '/json-tools/validator/' }],
    },
    {
      label: 'JSON Minify',
      blurb: 'Strip whitespace for minimal payload size. No data loss.',
      links: [{ text: 'Minify JSON', path: '/json-tools/minify/' }],
    },
  ],
  'format-converters': [
    {
      label: 'CSV to JSON',
      blurb: 'Delimiter sniffing, type inference, header detection. RFC 4180 compliant.',
      links: [{ text: 'Convert CSV', path: '/format-converters/csv-to-json/' }],
    },
    {
      label: 'JSON to CSV',
      blurb: 'Flatten nested objects and arrays to CSV. Configurable flattening.',
      links: [{ text: 'Convert JSON', path: '/format-converters/json-to-csv/' }],
    },
    {
      label: 'JSON ⇄ YAML',
      blurb: 'Convert both directions. Handles YAML 1.1/1.2 differences and the Norway problem.',
      links: [
        { text: 'JSON → YAML', path: '/format-converters/json-to-yaml/' },
        { text: 'YAML → JSON', path: '/format-converters/yaml-to-json/' },
      ],
    },
  ],
  'encoders-decoders': [
    {
      label: 'Base64 Encode & Decode',
      blurb: 'Standard and Base64URL (RFC 4648). Decode JWTs, inline images, data URIs.',
      links: [{ text: 'Encode or decode', path: '/encoders-decoders/base64/' }],
    },
    {
      label: 'URL Encode & Decode',
      blurb: 'Percent-encoding (RFC 3986). Parse query strings into key-value pairs.',
      links: [{ text: 'Escape a value', path: '/encoders-decoders/url/' }],
    },
  ],
}

const COMPARES_COUNT = Object.keys(GROUPS.compare).length

/** Highest-intent comparisons first: the ones people arrive searching for. */
const FEATURED_COMPARISONS = ['yaml-vs-json', 'json-vs-csv', 'csv-vs-excel']

const TOOL_NAME_BY_PATH = new Map(TOOLS.map((tool) => [tool.path, tool.name]))

const CARD = 'block rounded-[0.625rem] border border-slate-200 bg-white p-4 transition hover:border-blue-500 hover:no-underline'

function Section({ id, title, sub, children }: { id: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-10">
      <div className="mx-auto w-full max-w-[70rem] px-6">
        <h2 className="text-[1.5rem] font-bold leading-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-[0.9375rem] text-slate-500">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const featured = FEATURED_COMPARISONS.map((slug) => GROUPS.compare[slug].meta)

  return (
    <>
      <JsonLd
        blocks={[
          websiteSchema(),
          breadcrumbSchema({ path: '/' }),
          faqSchema({ path: '/', items: HOME_FAQS }),
        ]}
      />

      <div className="bg-white">
        <header className="px-6 pb-8 pt-12 text-center">
          <h1 className="mx-auto max-w-[55rem] text-[2rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.5rem]">
            JSON, CSV, YAML, XML, Base64 — Format, Convert &amp; Encode Online
          </h1>
          <p className="mx-auto mt-4 w-full max-w-[40rem] text-[1.0625rem] text-slate-600">
            Browser-based tools for data format conversion, encoding, and validation. Paste, convert, copy.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-emerald-700">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
            Runs in your browser — paste production data, private keys, nothing is uploaded
          </p>
        </header>

        <div className="mx-auto w-full max-w-[70rem] px-6 pb-10">
          <FormatterDemo />
        </div>

        <Section id="all-tools" title="All tools" sub="Nine tools, grouped by what you are doing to the data.">
          {CATEGORIES.map((category, index) => (
            <div key={category.id}>
              <p className={`text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-slate-500 ${index === 0 ? 'mb-3' : 'mb-3 mt-6'}`}>
                <a href={category.path} className="hover:text-blue-600 hover:underline">
                  {category.name}
                </a>
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TOOL_ROWS[category.id as CategoryId].map((row) =>
                  row.links.length === 1 ? (
                    <a key={row.label} href={row.links[0].path} className={CARD}>
                      <h3 className="text-[0.9375rem] font-bold text-slate-900">{row.label}</h3>
                      <p className="mt-1 text-[0.8125rem] leading-[1.45] text-slate-500">{row.blurb}</p>
                    </a>
                  ) : (
                    <div key={row.label} className={CARD}>
                      <h3 className="text-[0.9375rem] font-bold text-slate-900">
                        <a href={row.links[0].path} className="hover:text-blue-600">
                          {row.label}
                        </a>
                      </h3>
                      <p className="mt-1 text-[0.8125rem] leading-[1.45] text-slate-500">{row.blurb}</p>
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {row.links.map((link) => (
                          <a key={link.path} href={link.path} className="text-[0.8125rem] font-semibold text-blue-600 hover:underline">
                            {link.text} →
                          </a>
                        ))}
                      </p>
                    </div>
                  ),
                )}
                {category.id === 'encoders-decoders' ? (
                  <div aria-disabled="true" className="rounded-[0.625rem] border border-dashed border-slate-300 bg-slate-50 p-4">
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold text-slate-500">
                      More coming
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-600">
                        In progress
                      </span>
                    </h3>
                    <p className="mt-1 text-[0.8125rem] leading-[1.45] text-slate-500">
                      JSON Diff, JWT Decoder, Hash, Timestamp, Regex, UUID — in progress.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </Section>

        <div className="border-y border-slate-200 bg-slate-50">
          <Section id="use-cases" title="Six workflows, ordered by the job in front of you" sub="Start from what you are trying to do, not from the tool name.">
            <div className="grid gap-3 md:grid-cols-2">
              {USE_CASES.map((item) => (
                <a key={item.slug} href={item.path} className={`${CARD} flex items-center gap-3 px-4 py-3.5`}>
                  <span className="text-[0.9375rem] font-semibold text-slate-800">{item.name}</span>
                  <em className="ml-auto whitespace-nowrap text-[0.75rem] not-italic text-slate-400">
                    → {TOOL_NAME_BY_PATH.get(item.toolPaths[0]) ?? 'Open'}
                  </em>
                </a>
              ))}
            </div>
          </Section>
        </div>

        <Section
          id="references"
          title="The pages people open next to the converter"
          sub="Three comparisons that settle the decisions the tools cannot make for you, plus the format guides they are built on. Every one cites the clause it describes."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((meta) => (
              <a key={meta.path} href={meta.path} className="grid-card flex flex-col overflow-hidden p-0 no-underline">
                <img
                  src={meta.image}
                  alt={meta.imageAlt}
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  className="h-36 w-full border-b border-slate-200 bg-white object-cover"
                />
                <span className="block p-5">
                  <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-blue-700">
                    Comparison · {meta.readingMinutes} min
                  </span>
                  <span className="mt-1.5 block text-[1.0625rem] font-bold leading-snug text-slate-900">{meta.h1}</span>
                  <span className="mt-2 block text-[0.875rem] leading-relaxed text-slate-600">{meta.summary}</span>
                  <span className="mt-3 block text-[0.8125rem] font-semibold text-slate-500">Updated {formatDate(meta.updated)}</span>
                </span>
              </a>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <p className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-2.5">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-slate-600">Format guides</span>
              <a href="/learn/" className="text-[0.8125rem] font-bold text-blue-700 hover:underline">
                All {LEARN.length} guides →
              </a>
            </p>
            <ul className="divide-y divide-slate-100">
              {LEARN.map((guide) => (
                <li key={guide.slug}>
                  <a href={guide.path} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5 no-underline transition hover:bg-slate-50">
                    <LetterBadge letter={guide.letter} className="h-6 w-9 shrink-0 rounded text-[0.5rem]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-bold text-slate-900">{guide.h1}</span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-slate-600">{guide.summary}</span>
                    </span>
                    <span className="text-[0.8125rem] font-semibold text-slate-500">
                      {guide.readingMinutes} min · updated {formatDate(guide.updated)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[0.875rem] text-slate-600">
            <a href="/compare/" className="font-bold text-blue-700 hover:underline">
              All {COMPARES_COUNT} format comparisons →
            </a>
          </p>
        </Section>

        <div className="border-t border-slate-200">
          <Section
            id="faq"
            title="Questions people ask before pasting their data"
            sub="Short answers to the ones that decide whether a converter is usable at all: where the data goes, what it does to your numbers, and what it will not claim."
          >
            <div className="max-w-3xl divide-y divide-slate-200 border-t border-slate-200">
              {HOME_FAQS.map((faq) => (
                <div key={faq.question} className="py-4">
                  <h3 className="text-[1rem] font-semibold text-slate-900">{faq.question}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
