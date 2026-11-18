import { CategoryShell } from '@/components/layout/CategoryShell'
import { CATEGORY_COPY } from '@/lib/category-copy'
import { CATEGORIES } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

const category = CATEGORIES.find((item) => item.id === 'encoders-decoders')!
const copy = CATEGORY_COPY['encoders-decoders']

export const metadata = buildMetadata({
  title: copy.indexTitle,
  description: copy.indexDescription,
  path: category.path,
  keywords: ['base64 encode', 'base64 decode', 'url encode', 'percent encoding', 'encoder decoder tools'],
})

export default function EncodersDecodersIndex() {
  return <CategoryShell category={category} />
}
