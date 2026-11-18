import * as React from 'react'
import { GroupIndexShell } from '@/components/layout/ArticleShell'
import { GROUPS, GROUP_LABELS } from '@/content/registry'
import { LEARN } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const labels = GROUP_LABELS.learn

export const metadata = buildMetadata({
  title: labels.indexTitle,
  description: labels.indexDescription,
  path: labels.path,
  keywords: ['json guide', 'csv guide', 'yaml guide', 'xml guide', 'base64 guide', 'data format reference'],
})

export default function LearnIndex() {
  return (
    <GroupIndexShell
      group="learn"
      heading="Data format guides"
      intro="Five references written against the published specifications rather than blog folklore: what the grammar permits, what implementations actually do with your data, and which failure costs you real characters."
      items={LEARN.map((entry) => GROUPS.learn[entry.slug])}
    />
  )
}
