import { ArticleShell } from '@/components/layout/ArticleShell'
import { loadArticle, slugs } from '@/content/registry'
import { articleMetadata } from '@/lib/article-page'

export function generateStaticParams() {
  return slugs('use-cases').map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return articleMetadata('use-cases', params.slug)
}

export default function UseCaseArticle({ params }: { params: { slug: string } }) {
  const { meta, Body } = loadArticle('use-cases', params.slug)
  return <ArticleShell meta={meta} group="use-cases" Body={Body} />
}
