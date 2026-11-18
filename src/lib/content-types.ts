import type * as React from 'react'
import type { Faq, Source } from '@/components/content'

export type ArticleMeta = {
  slug: string
  path: string
  /** <title>: primary keyword + value proposition + brand, 50-60 characters. */
  title: string
  /** meta description: primary keyword, value, call to action, 150-160 characters. */
  description: string
  /** Single H1 on the page. Must not duplicate the <title> or any H2. */
  h1: string
  /** Short phrase for the "Questions about …" heading. Defaults to the H1 text before its colon. */
  faqTopic?: string
  /** One sentence shown under the H1 and reused in link cards. */
  summary: string
  keywords: string[]
  /** ISO date, required by the Article schema. */
  published: string
  updated: string
  readingMinutes: number
  /** Renders the table of contents and feeds the Article `sections` property. */
  sections: { id: string; label: string }[]
  /** Rendered as the visible FAQ block and as the FAQPage schema. Keep identical. */
  faqs: Faq[]
  sources: Source[]
  /** Internal links shown as "Next up". Use trailing slashes. */
  related: { path: string; name: string; blurb: string }[]
  /** Word count claimed by the schema; measured, not guessed. */
  words: number
  /** Cover illustration, rendered under the H1 and reused as the OG image. */
  image: string
  imageAlt: string
}

export type ArticleModule = {
  meta: ArticleMeta
  default: () => React.JSX.Element
}
