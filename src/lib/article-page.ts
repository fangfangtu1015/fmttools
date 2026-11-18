import { loadArticle, type ArticleGroup } from '@/content/registry'
import { buildMetadata } from './seo'

/** Metadata for a guide, use-case or comparison page, taken from the module's own meta. */
export function articleMetadata(group: ArticleGroup, slug: string) {
  const { meta } = loadArticle(group, slug)
  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
    keywords: meta.keywords,
    ogType: 'article',
    image: meta.image,
    imageWidth: 1536,
    imageHeight: 1024,
    publishedTime: meta.published,
    modifiedTime: meta.updated,
  })
}
