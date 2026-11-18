import { GroupIndexShell } from '@/components/layout/ArticleShell'
import { GROUPS, GROUP_LABELS } from '@/content/registry'
import { USE_CASES } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const labels = GROUP_LABELS['use-cases']

export const metadata = buildMetadata({
  title: labels.indexTitle,
  description: labels.indexDescription,
  path: labels.path,
  keywords: ['api debugging tools', 'data migration tools', 'config conversion', 'log analysis', 'test data fixtures', 'encoding security'],
})

export default function UseCasesIndex() {
  return (
    <GroupIndexShell
      group="use-cases"
      heading="Workflows, arranged by the job in front of you"
      intro="Six runbooks for the moments where a format decision turns into an incident: a response you cannot read, a column that lost its leading zero, a manifest that changed type in review."
      items={USE_CASES.map((entry) => GROUPS['use-cases'][entry.slug])}
    />
  )
}
