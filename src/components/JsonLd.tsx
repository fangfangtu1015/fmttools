import type { SchemaBlock } from '@/lib/seo'

/**
 * Renders JSON-LD as one <script> element per block, so a structured-data
 * validator points at the failing entity instead of the whole page.
 */
export function JsonLd({ blocks }: { blocks: (SchemaBlock | SchemaBlock[] | false | null | undefined)[] }) {
  const flat: SchemaBlock[] = []
  for (const block of blocks) {
    if (!block) continue
    if (Array.isArray(block)) flat.push(...block)
    else flat.push(block)
  }
  return (
    <>
      {flat.map((block, index) => (
        <script
          key={typeof block['@id'] === 'string' ? block['@id'] : `${String(block['@type'])}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escape(JSON.stringify(block)) }}
        />
      ))}
    </>
  )
}

/** Escapes the characters that could terminate the enclosing <script> element. */
function escape(json: string) {
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}
