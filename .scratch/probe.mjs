import fs from 'node:fs'
import { bodyWords } from '../scripts/measure-words.mjs'
const src = fs.readFileSync('src/content/learn/xml.tsx', 'utf8')
let b = src.slice(src.indexOf('export default function'))
const head = b.slice(0, b.indexOf('<Section'))
console.log('lead', bodyWords('export default function Article(){return (' + head), 'TOTAL', bodyWords(b))
for (const p of b.split(/(?=<Section[\s\n])/).filter((x) => x.startsWith('<Section'))) {
  const id = (p.match(/id="([^"]+)"/) || [])[1]
  const body = p.replace(/<\/Section>\s*$/, '')
  console.log(String(bodyWords('export default function A(){' + body)).padStart(5), id)
}
