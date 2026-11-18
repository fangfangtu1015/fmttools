import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { JsonFormatterWorkspace } from '@/components/workspaces/json-formatter'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['json-formatter']

export const metadata = toolMetadata(tool)

export default function JsonFormatterPage() {
  return <ToolShell tool={tool} workspace={<JsonFormatterWorkspace />} />
}
