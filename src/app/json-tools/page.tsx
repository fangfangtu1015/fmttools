import { CategoryShell } from '@/components/layout/CategoryShell'
import { CATEGORY_COPY } from '@/lib/category-copy'
import { CATEGORIES } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const category = CATEGORIES.find((item) => item.id === 'json-tools')!
const copy = CATEGORY_COPY['json-tools']

export const metadata = buildMetadata({
  title: copy.indexTitle,
  description: copy.indexDescription,
  path: category.path,
  keywords: ['json formatter online', 'json validator', 'json minifier', 'pretty print json', 'json tools'],
})

export default function JsonToolsIndex() {
  return <CategoryShell category={category} />
}
