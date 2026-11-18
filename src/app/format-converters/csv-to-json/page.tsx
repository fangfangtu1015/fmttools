import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { CsvToJsonWorkspace } from '@/components/workspaces/csv-to-json'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['csv-to-json']

export const metadata = toolMetadata(tool)

export default function CsvToJsonPage() {
  return <ToolShell tool={tool} workspace={<CsvToJsonWorkspace />} />
}
