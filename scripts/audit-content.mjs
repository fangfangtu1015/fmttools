import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ROUTES = new Set([
  '/',
  '/json-tools/',
  '/json-tools/formatter/',
  '/json-tools/validator/',
  '/json-tools/minify/',
  '/format-converters/',
  '/format-converters/csv-to-json/',
  '/format-converters/json-to-csv/',
  '/format-converters/json-to-yaml/',
  '/format-converters/yaml-to-json/',
  '/encoders-decoders/',
  '/encoders-decoders/base64/',
  '/encoders-decoders/url/',
  '/learn/',
  '/use-cases/',
  '/compare/',
  '/contact/',
  '/terms/',
  '/cookie-policy/',
])
for (const g of ['learn', 'use-cases', 'compare']) {
  for (const f of fs.readdirSync(path.join(ROOT, 'src/content', g))) {
    ROUTES.add(`/${g}/${f.replace(/\.tsx$/, '')}/`)
  }
}

const problems = []
const files = []
for (const g of ['learn', 'use-cases', 'compare']) {
  for (const f of fs.readdirSync(path.join(ROOT, 'src/content', g))) {
    if (f.endsWith('.tsx')) files.push(path.join('src/content', g, f))
  }
}

for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8')
  const metaBlock = src.slice(0, src.indexOf('export default function'))
  const body = src.slice(src.indexOf('export default function'))

  const field = (name) => {
    const m = metaBlock.match(new RegExp(`^  ${name}: (.+?),?$`, 'm'))
    if (m) return m[1].replace(/^['"]|['"],$/g, '')
    // Values are often wrapped onto the next line by the formatter.
    const nl = metaBlock.match(new RegExp(`^  ${name}:\\s*\\n\\s*(.+?),?$`, 'm'))
    return nl ? nl[1].replace(/^['"]|['"],$/g, '') : null
  }
  const num = (name) => {
    const m = metaBlock.match(new RegExp(`^  ${name}: (\\d+),`, 'm'))
    return m ? Number(m[1]) : null
  }

  const metaPath = (field('path') || '').replace(/^'|'$/g, '')
  if (!ROUTES.has(metaPath)) problems.push(`${f}: meta.path ${metaPath} is not a known route`)

  const image = (field('image') || '').replace(/^'|'$/g, '')
  if (!image) problems.push(`${f}: meta.image missing`)
  else if (!fs.existsSync(path.join(ROOT, 'public', image.replace(/^\//, '')))) problems.push(`${f}: meta.image ${image} not found on disk`)
  if (!field('imageAlt')) problems.push(`${f}: meta.imageAlt missing`)

  for (const key of ['faqs', 'sources', 'related']) {
    const m = metaBlock.match(new RegExp(`^  ${key}: \\[([^\\]]*)\\]`, 'ms'))
    if (!m || m[1].trim() === '') problems.push(`${f}: meta.${key} is empty`)
  }
  const words = num('words')
  if (!words) problems.push(`${f}: meta.words is ${words}`)

  // section ids
  const declared = [...metaBlock.matchAll(/id: '([a-z0-9-]+)', label:/g)].map((m) => m[1])
  const rendered = [...body.matchAll(/<Section\s+id="([^"]+)"/g)].map((m) => m[1])
  if (declared.join() !== rendered.join()) {
    problems.push(`${f}: sections differ\n    declared: ${declared.join(',')}\n    rendered: ${rendered.join(',')}`)
  }
  for (const id of rendered) {
    if (new RegExp(`id: '${id}',`).test(metaBlock) === false) problems.push(`${f}: rendered section "${id}" not declared`)
  }

  // internal links anywhere in the file
  const links = [...src.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1])
  const richLinks = [...src.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1])
  for (const l of links.concat(richLinks)) {
    if (l.startsWith('/images/')) {
      if (!fs.existsSync(path.join(ROOT, 'public', l.replace(/^\//, '')))) problems.push(`${f}: image ${l} not found`)
      continue
    }
    if (!l.endsWith('/')) problems.push(`${f}: link ${l} has no trailing slash`)
    const bare = l.split('#')[0]
    if (bare && !ROUTES.has(bare)) problems.push(`${f}: link ${l} targets an unknown route`)
  }

  if (/Figure/.test(src)) {
    if (!/images\//.test(src)) problems.push(`${f}: Figure used without a local image`)
  }
}

console.log(`checked ${files.length} article modules`)
console.log(problems.length ? problems.join('\n') : 'no problems')
