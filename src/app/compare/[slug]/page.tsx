import { ArticleShell } from '@/components/layout/ArticleShell'
import { loadArticle, slugs } from '@/content/registry'
import { articleMetadata } from '@/lib/article-page'

export function generateStaticParams() {
  return slugs('compare').map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return articleMetadata('compare', params.slug)
}

export default function CompareArticle({ params }: { params: { slug: string } }) {
  const { meta, Body } = loadArticle('compare', params.slug)
  return <ArticleShell meta={meta} group="compare" Body={Body} />
}
