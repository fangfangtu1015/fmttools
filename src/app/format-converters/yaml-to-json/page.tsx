import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { YamlToJsonWorkspace } from '@/components/workspaces/yaml-to-json'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['yaml-to-json']

export const metadata = toolMetadata(tool)

export default function YamlToJsonPage() {
  return <ToolShell tool={tool} workspace={<YamlToJsonWorkspace />} />
}
