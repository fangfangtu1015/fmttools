import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { Base64Workspace } from '@/components/workspaces/base64'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['base64']

export const metadata = toolMetadata(tool)

export default function Base64Page() {
  return <ToolShell tool={tool} workspace={<Base64Workspace />} />
}
