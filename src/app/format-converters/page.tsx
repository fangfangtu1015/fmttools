import { CategoryShell } from '@/components/layout/CategoryShell'
import { CATEGORY_COPY } from '@/lib/category-copy'
import { CATEGORIES } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const category = CATEGORIES.find((item) => item.id === 'format-converters')!
const copy = CATEGORY_COPY['format-converters']

export const metadata = buildMetadata({
  title: copy.indexTitle,
  description: copy.indexDescription,
  path: category.path,
  keywords: ['csv to json', 'json to csv', 'json to yaml', 'yaml to json', 'data format converter'],
})

export default function FormatConvertersIndex() {
  return <CategoryShell category={category} />
}
