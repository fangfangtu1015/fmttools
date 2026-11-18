import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { JsonMinifyWorkspace } from '@/components/workspaces/json-minify'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['json-minify']

export const metadata = toolMetadata(tool)

export default function JsonMinifyPage() {
  return <ToolShell tool={tool} workspace={<JsonMinifyWorkspace />} />
}
