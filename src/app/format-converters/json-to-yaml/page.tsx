import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { JsonToYamlWorkspace } from '@/components/workspaces/json-to-yaml'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['json-to-yaml']

export const metadata = toolMetadata(tool)

export default function JsonToYamlPage() {
  return <ToolShell tool={tool} workspace={<JsonToYamlWorkspace />} />
}
