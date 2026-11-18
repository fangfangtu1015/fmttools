import { GroupIndexShell } from '@/components/layout/ArticleShell'
import { GROUPS, GROUP_LABELS } from '@/content/registry'
import { COMPARES } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const labels = GROUP_LABELS.compare

export const metadata = buildMetadata({
  title: labels.indexTitle,
  description: labels.indexDescription,
  path: labels.path,
  keywords: ['json vs csv', 'yaml vs json', 'xml vs json', 'csv vs tsv', 'yaml vs toml', 'csv vs excel', 'data format comparison'],
})

export default function CompareIndex() {
  return (
    <GroupIndexShell
      group="compare"
      heading="Format comparisons, decided on the differences that matter"
      intro="Seven head-to-head references. Each one measures the same record in both formats and stops where the choice actually gets made: nesting against columns, implicit typing against quoted strings, and the spreadsheet that silently rewrites your identifiers."
      items={COMPARES.map((entry) => GROUPS.compare[entry.slug])}
    />
  )
}
