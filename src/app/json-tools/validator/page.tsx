import { ToolShell, toolMetadata } from '@/components/layout/ToolShell'
import { JsonValidatorWorkspace } from '@/components/workspaces/json-validator'
import { TOOL_BY_SLUG } from '@/lib/site'

const tool = TOOL_BY_SLUG['json-validator']

export const metadata = toolMetadata(tool)

export default function JsonValidatorPage() {
  return <ToolShell tool={tool} workspace={<JsonValidatorWorkspace />} />
}
