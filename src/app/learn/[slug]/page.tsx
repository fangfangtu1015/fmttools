import { ArticleShell } from '@/components/layout/ArticleShell'
import { loadArticle, slugs } from '@/content/registry'
import { articleMetadata } from '@/lib/article-page'

export function generateStaticParams() {
  return slugs('learn').map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return articleMetadata('learn', params.slug)
}

export default function LearnArticle({ params }: { params: { slug: string } }) {
  const { meta, Body } = loadArticle('learn', params.slug)
  return <ArticleShell meta={meta} group="learn" Body={Body} />
}
