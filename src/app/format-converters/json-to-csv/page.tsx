import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { JsonToCsvWorkspace } from '@/components/workspaces/json-to-csv'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['json-to-csv']

export const metadata = toolMetadata(tool)

export default function JsonToCsvPage() {
  return <ToolShell tool={tool} workspace={<JsonToCsvWorkspace />} />
}
