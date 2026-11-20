import type { MetadataRoute } from 'next'
import { COMPARES, LEARN, TOOLS, USE_CASES, CATEGORIES, absolute } from '@/lib/site'

const UPDATED = '2026-11-12'
const SITE_PAGES_UPDATED = '2026-11-18'

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], lastModified = UPDATED) {
  return { url: absolute(path), lastModified, changeFrequency, priority }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry('/', 1.0, 'weekly'),
    ...CATEGORIES.map((category) => entry(category.path, 0.8, 'weekly')),
    ...TOOLS.map((tool) => entry(tool.path, 0.8, 'monthly')),
    entry('/learn/', 0.8, 'weekly'),
    ...LEARN.map((guide) => entry(guide.path, 0.7, 'monthly', guide.updated)),
    entry('/use-cases/', 0.8, 'weekly'),
    ...USE_CASES.map((item) => entry(item.path, 0.6, 'monthly', item.updated)),
    entry('/compare/', 0.8, 'weekly'),
    ...COMPARES.map((item) => entry(item.path, 0.6, 'monthly', item.updated)),
    entry('/contact/', 0.4, 'yearly', SITE_PAGES_UPDATED),
    entry('/terms/', 0.3, 'yearly', SITE_PAGES_UPDATED),
    entry('/cookie-policy/', 0.3, 'yearly', SITE_PAGES_UPDATED),
  ]
}
