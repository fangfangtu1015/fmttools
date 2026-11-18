import type { Metadata } from 'next'
import { SITE, absolute, asset, breadcrumbsFor } from './site'

export type SeoInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogType?: 'website' | 'article'
  image?: string
  imageWidth?: number
  imageHeight?: number
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
}

const DEFAULT_IMAGE = '/images/og-default.png'

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  ogType = 'website',
  image = DEFAULT_IMAGE,
  imageWidth = 1200,
  imageHeight = 630,
  publishedTime,
  modifiedTime,
  noindex,
}: SeoInput): Metadata {
  const url = absolute(path)
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      url,
      siteName: SITE.name,
      title,
      description,
      locale: 'en_US',
      images: [{ url: asset(image), width: imageWidth, height: imageHeight, alt: `${SITE.name} — ${title}` }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [asset(image)],
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
  }
}

type Id = { '@id': string }
export type SchemaBlock = Record<string, unknown>

function idRef(url: string, fragment: string): Id {
  return { '@id': `${url}#${fragment}` }
}

export function webApplicationSchema(options: {
  name: string
  path: string
  description: string
  features: string[]
  category: string
  operatingSystem?: string
  datePublished?: string
  dateModified?: string
}): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${url}#app`,
    name: options.name,
    url,
    description: options.description,
    applicationCategory: `https://schema.org/DeveloperApplication`,
    applicationSubCategory: options.category,
    operatingSystem: options.operatingSystem ?? 'Any operating system with a modern web browser',
    browserRequirements: 'Requires JavaScript. Requires a browser with Web Crypto and Blob support.',
    isAccessibleForFree: true,
    featureList: options.features,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    processorRequirements: 'Any CPU; all conversion runs on the client with no server round trip.',
    memoryRequirements: 'Depends on input size; several hundred megabytes of heap per 100 MB of text.',
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
  }
}

export function faqSchema(options: { path: string; items: { question: string; answer: string }[] }): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: options.items.map((item, index) => ({
      '@type': 'Question',
      '@id': `${url}#question-${index + 1}`,
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: stripMarkdown(item.answer) },
    })),
  }
}

export function breadcrumbSchema(options: { path: string }): SchemaBlock {
  const url = absolute(options.path)
  const crumbs = breadcrumbsFor(options.path)
  return {
    '@context': 'https://schema.org',
    '@id': `${url}#breadcrumb`,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  }
}

export function webPageSchema(options: {
  name: string
  path: string
  description: string
  type?: 'WebPage' | 'ContactPage'
  updated?: string
}): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': options.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: options.name,
    description: options.description,
    inLanguage: 'en',
    isPartOf: websiteRef(),
    publisher: organizationObject(),
    ...(options.updated ? { dateModified: options.updated } : {}),
  }
}

export function articleSchema(options: {
  name: string
  path: string
  description: string
  published: string
  modified: string
  sections?: string[]
  words?: number
  image?: string
}): SchemaBlock {
  const url = absolute(options.path)
  const image = asset(options.image ?? DEFAULT_IMAGE)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: options.name,
    description: options.description,
    url,
    inLanguage: 'en',
    datePublished: options.published,
    dateModified: options.modified,
    wordCount: options.words,
    image: { '@type': 'ImageObject', url: image, caption: options.name },
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: organizationObject(),
    ...(options.sections ? { sections: options.sections.map((s) => ({ '@type': 'WebPageElement', headline: s })) } : {}),
  }
}

export function collectionSchema(options: {
  name: string
  path: string
  description: string
  items: { name: string; path: string; description?: string }[]
  modified: string
}): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: options.name,
    description: options.description,
    url,
    isPartOf: websiteRef(),
    dateModified: options.modified,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.items.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absolute(item.path),
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  }
}

export function howToSchema(options: {
  name: string
  path: string
  description: string
  steps: { title: string; body: string }[]
  toolName: string
}): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: `${options.toolName}: how to use it`,
    description: options.description,
    url,
    totalTime: 'PT1M',
    tool: {
      '@type': 'HowToTool',
      name: `${options.toolName} runs in the browser with no installation and no network request.`,
    },
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      itemListElement: [
        {
          '@type': 'HowToDirection',
          // The page renders these strings through Rich, so the schema has to carry the same plain text.
          text: index === 0 ? `${stripMarkdown(step.body)} Paste or drop your own text; nothing is uploaded.` : stripMarkdown(step.body),
        },
      ],
    })),
  }
}

export function websiteSchema(): SchemaBlock {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#/website`,
    url: SITE.url,
    name: SITE.name,
    description: 'Free in-browser converters for JSON, CSV, YAML, Base64 and percent-encoded URLs, with format references and comparison guides.',
    inLanguage: 'en',
    publisher: organizationObject(),
    copyrightYear: new Date().getFullYear(),
    license: 'https://schema.org/PublicAccessLicense',
    isAccessibleForFree: true,
  }
}

function websiteRef(): SchemaBlock {
  return { '@type': 'WebSite', '@id': `${SITE.url}/#/website`, url: SITE.url, name: SITE.name }
}

export function organizationObject(): SchemaBlock {
  return {
    '@type': 'Organization',
    '@id': `${SITE.url}/#/organization`,
    name: SITE.name,
    url: SITE.url,
    logo: asset('/images/logo.png'),
    email: SITE.email,
    sameAs: [`https://twitter.com/${SITE.twitter.replace('@', '')}`, 'https://github.com/fmttools'],
    description: `${SITE.name} publishes client-side data format tools and technical references for JSON, CSV, YAML, XML and Base64.`,
    knowsAbout: [
      'JSON (RFC 8259)',
      'CSV (RFC 4180)',
      'YAML 1.2',
      'XML 1.0',
      'Base64 (RFC 4648)',
      'URI syntax (RFC 3986)',
      'Data interchange formats',
    ],
  }
}

export function softwareSchema(options: { name: string; path: string; description: string }): SchemaBlock {
  const url = absolute(options.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: options.name,
    url,
    description: options.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_]/g, '')
    .trim()
}

export function renderJsonLd(blocks: (SchemaBlock | SchemaBlock[] | false | null | undefined)[]): SchemaBlock[] {
  const out: SchemaBlock[] = []
  for (const block of blocks) {
    if (!block) continue
    if (Array.isArray(block)) out.push(...block)
    else out.push(block)
  }
  return out
}
