import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { UrlEncoderWorkspace } from '@/components/workspaces/url-encoder'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['url-encoder']

export const metadata = toolMetadata(tool)

export default function UrlEncoderPage() {
  return <ToolShell tool={tool} workspace={<UrlEncoderWorkspace />} />
}
