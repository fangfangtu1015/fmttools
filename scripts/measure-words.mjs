import fs from 'node:fs'

const SQ = /code=\{\s*'(?:[^'\\]|\\.)*'\s*\}/g
const DQ = /code=\{\s*"(?:[^"\\]|\\.)*"\s*\}/g
const TQ = /code=\{\s*`(?:[^`\\]|\\.)*`\s*\}/g
const CMT = /\{\s*\/\*[\s\S]*?\*\/\s*\}/g
const SELF = /<[A-Za-z][^>]*\/>/g
const TAG = /<\/?[A-Za-z][^>]*>/g

export function bodyWords(src) {
  const i = src.indexOf('export default function')
  if (i < 0) return null
  let b = src.slice(i)
  b = b.replace(SQ, ' ').replace(DQ, ' ').replace(TQ, ' ')
  b = b.replace(CMT, ' ')
  b = b.replace(SELF, ' ')
  b = b.replace(TAG, ' ')
  return b.split(/\s+/).filter((w) => /[A-Za-z0-9]{2,}/.test(w)).length
}

if (process.argv[2]) {
  for (const f of process.argv.slice(2)) {
    const src = fs.readFileSync(f, 'utf8')
    const m = src.match(/^  words: (\d+),/m)
    const t = src.match(/^  title: '(.*)',$/m) || src.match(/^  title: "(.*)"/m)
    console.log(String(bodyWords(src)).padStart(6), f, 'meta:', m ? m[1] : '-')
  }
}
