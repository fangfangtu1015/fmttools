import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/admin/Documents/Qoder/2026-11-12/10c49fef/.next/server/app'
const problems = []
const notes = []

function walk(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory() && !e.name.startsWith('[')) out.push(...walk(p))
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const files = walk(ROOT)
notes.push('html files: ' + files.length)
const read = (f) => fs.readFileSync(f, 'utf8')

const visible = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')

const isoContext = new Map()

for (const f of files) {
  const html = read(f)
  for (const m of html.matchAll(/"(https:\/\/converttools\.io\/[^"]*?\.(?:png|jpg|svg|webp))\/"/g)) {
    problems.push(f + ': trailing slash on asset ' + m[1])
  }
  const text = visible(html)
  for (const m of text.matchAll(/\]\(\/[^)]*\)/g)) problems.push(f + ': unrendered markdown ' + m[0])
  for (const m of text.matchAll(/\*\*[^<]{2,60}\*\*/g)) problems.push(f + ': unrendered bold ' + m[0].slice(0, 40))
  for (const m of text.matchAll(/20\d\d-\d\d-\d\d/g)) {
    if (!isoContext.has(m[0])) {
      isoContext.set(m[0], path.relative(ROOT, f) + ' :: ' + text.slice(Math.max(0, m.index - 45), m.index + 35).trim())
    }
  }
}
for (const [iso, ctx] of isoContext) problems.push('ISO ' + iso + ' -> ' + ctx)

const home = read(path.join(ROOT, 'index.html'))
notes.push('og:image: ' + (home.match(/property="og:image" content="[^"]*"/) || ['MISSING'])[0])
notes.push('twitter:image: ' + (home.match(/name="twitter:image" content="[^"]*"/) || ['MISSING'])[0])
notes.push('logo: ' + (home.match(/"logo":.{0,90}/) || ['MISSING'])[0])

const mustHave = [
  'Browser-based tools for data format conversion, encoding, and validation. Paste, convert, copy.',
  'Runs in your browser',
  'nothing is uploaded',
  'Full tool',
  'Valid JSON',
  'Nine tools, grouped by what you are doing to the data.',
  'The pages people open next to the converter',
  'aria-disabled="true"',
  'Format, Convert',
]
for (const s of mustHave) if (!home.includes(s)) problems.push('homepage missing copy: ' + s)
for (const s of ['Most used', 'The six tools people come here for', 'Browse by category', 'All tools index', 'Why choose us', 'Latest additions and revisions', '/images/hero.png']) {
  if (home.includes(s)) problems.push('homepage still has: ' + s)
}

for (const [f, needle] of [['use-cases.html', 'images/covers/use-'], ['compare.html', 'images/covers/cmp-']]) {
  const html = read(path.join(ROOT, f))
  const uniq = new Set(html.match(new RegExp(needle + '[a-z0-9-]+\\.png', 'g')) || [])
  notes.push(f + ': covers ' + uniq.size)
  if (uniq.size < 6) problems.push(f + ': only ' + uniq.size + ' cover images')
}

const yvx = read(path.join(ROOT, 'compare', 'yaml-vs-xml.html'))
for (const s of ['Quick answer: pick by who validates the file', 'The same document written four ways', 'Migrating XML to YAML: a failure catalogue', 'Conversion fidelity', 'an alias, which XML cannot say', 'November 12, 2026']) {
  if (!yvx.includes(s)) problems.push('yaml-vs-xml missing: ' + s)
}

for (const [label, html] of [['homepage', home], ['formatter', read(path.join(ROOT, 'json-tools', 'formatter.html'))], ['base64', read(path.join(ROOT, 'encoders-decoders', 'base64.html'))], ['yaml-vs-xml', yvx]]) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  let faq = 0
  const names = []
  const types = []
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b[1])
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        types.push(node['@type'])
        if (node['@type'] === 'FAQPage') {
          faq += node.mainEntity.length
          names.push(...node.mainEntity.map((q) => q.name))
        }
      }
    } catch (e) {
      problems.push(label + ': bad JSON-LD ' + e.message)
    }
  }
  const noscript = html.replace(/<script[\s\S]*?<\/script>/g, '')
  const fold = [...noscript.matchAll(/<summary[^>]*><svg[\s\S]*?<\/svg><span>([^<]*)<\/span><\/summary>/g)].map((m) => m[1])
  const flat = [...noscript.matchAll(/<h3[^>]*>([^<]*\?)<\/h3>/g)].map((m) => m[1])
  const visibleQ = fold.length >= flat.length ? fold : flat
  notes.push(label + ': ld=' + blocks.length + ' [' + types.join(',') + '] faqItems=' + faq + ' visibleQuestions=' + visibleQ.length)
  if (faq && faq !== visibleQ.length) problems.push(label + ': FAQ schema ' + faq + ' vs visible ' + visibleQ.length)
  const mismatch = names.filter((n, i) => n !== visibleQ[i])
  if (mismatch.length) problems.push(label + ': FAQ text differs from schema: ' + mismatch.slice(0, 3).join(' | '))
}

console.log(notes.join('\n'))
console.log('---')
console.log(problems.length ? problems.join('\n') : 'no problems')
