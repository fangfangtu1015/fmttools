/**
 * Category index copy. Each entry is specific to its column so the three index
 * pages are not near-duplicates of one another, and the FAQ answers here are the
 * exact strings the FAQPage schema is generated from.
 */
import type { CategoryId } from '@/lib/site'

export type CategoryCopy = {
  indexTitle: string
  indexDescription: string
  heading: string
  intro: string
  angle: string[]
  faqs: { question: string; answer: string }[]
  reading: { name: string; path: string; blurb: string }[]
}

export const CATEGORY_COPY: Record<CategoryId, CategoryCopy> = {
  'json-tools': {
    indexTitle: 'JSON Tools - Formatter, Validator & Minifier | FmtTools',
    indexDescription:
      'Free in-browser JSON tools: format and pretty-print JSON, validate it against RFC 8259 with exact error positions, and minify it while keeping numeric precision.',
    heading: 'JSON tools',
    intro:
      'Three pages over the same parser: one that re-indents a document, one that explains why it will not parse, and one that removes every byte RFC 8259 calls insignificant. All of them keep numbers as the exact literal you pasted — no JavaScript Number round trip — which is the difference between a formatter you can trust on an API payload and one that quietly rewrites 9007199254740993 to 9007199254740992.',
    angle: [
      'The formatter prints from an abstract syntax tree, so key order, duplicate member names and numeric literals survive the rewrite.',
      'The validator reports line, column and byte offset for the first problem, then the rest in order — fixing the earliest one is what stops cascading false positions.',
      'The minifier measures its own result: byte savings, gzip comparison where the browser supports it, and a round-trip check that proves the value is unchanged.',
    ],
    faqs: [
      {
        question: 'Do these JSON tools send my data anywhere?',
        answer:
          'No. Parsing, formatting and validation run in JavaScript inside your browser tab, so a payload never leaves the machine and there is no server-side log of it. That is also why the pages work offline once loaded and why there is no size limit other than your own memory — a 20 MB response is handled locally instead of being uploaded to someone else\'s queue.',
      },
      {
        question: 'Why does my formatted JSON differ from the original file?',
        answer:
          'Only whitespace and, if you ask for it, key order change. RFC 8259 §2 defines object order as unspecified and §6 defines whitespace as insignificant, so a formatter is free to normalise both. These pages keep the order you pasted by default and escape forward slashes nowhere, because RFC 8259 §7 dropped the JSON://\/..\/ escaping that the older ECMAScript JSON.parse (RFC 4627) inherited from JavaScript string literals.',
      },
      {
        question: 'Which page should I use for a file that will not parse?',
        answer:
          'Start with the validator: it names the offending token and the offset, and it flags the things a plain JSON.parse hides, such as a UTF-8 BOM, comments, single quotes, trailing commas and newline-delimited JSON. If the source is a log or a config export, repair mode on the formatter turns JavaScript-style syntax into valid JSON and lists every mechanical change it made.',
      },
    ],
    reading: [
      { name: 'JSON: The Complete Specification Guide', path: '/learn/json/', blurb: 'Grammar, the number rules, duplicate names and the MIME type.' },
      { name: 'Tools for Debugging HTTP APIs', path: '/use-cases/api-debugging/', blurb: 'A workflow for a response that arrives as one 2 MB line.' },
      { name: 'NDJSON and log analysis', path: '/use-cases/log-analysis/', blurb: 'Why every line parses but the file does not.' },
    ],
  },
  'format-converters': {
    indexTitle: 'Format Converters - CSV, JSON & YAML Both Ways | FmtTools',
    indexDescription:
      'Convert CSV to JSON, JSON to CSV, JSON to YAML and YAML to JSON in your browser, with delimiter detection, auditable type inference and coercion warnings.',
    heading: 'Format converters',
    intro:
      'Conversion between JSON, CSV and YAML is where data actually gets lost, because the two formats disagree about everything that is not a string: CSV has no types, no nesting and no escape for a field that contains the delimiter unless you quote it, and YAML assigns types by a set of implicit rules that changed between version 1.1 and 1.2. Each page here shows the decisions it is making instead of hiding them, so a zip code that turns into 12345 is visible at conversion time rather than after the import.',
    angle: [
      'CSV parsing is a state machine over RFC 4180 §2 rules — quoted fields, doubled quotes, embedded newlines, CRLF and a leading BOM — never a split on the delimiter.',
      'Type inference is opt-in and reported column by column, with a guard on integers above 2^53 − 1 that cannot survive a JavaScript number.',
      'YAML output quotes any plain scalar a 1.1 reader could coerce — NO, on, yes, ~, a sexagesimal-looking 1:30, a version string like 1.10.',
    ],
    faqs: [
      {
        question: 'Why does my CSV import produce the wrong number of columns?',
        answer:
          'Splitting on a comma is only correct when no field ever contains a comma, which RFC 4180 §2 lists as a permitted case: a field containing the delimiter MUST be enclosed in double quotes, and a field may also contain line breaks and quotes inside that enclosure. A quoted field with an embedded newline spans several physical lines, so a line-by-line split gives ragged rows. These converters read character by character with the enclosure state tracked, and report rows whose field count differs from the header.',
      },
      {
        question: 'Is it safe to let the converter guess column types?',
        answer:
          'It is safe when the guess is reported, which is what these pages do: every column that coerces shows its inferred type and how many values failed the rule. The dangerous cases are identifiers with a leading zero, 15-plus-digit numbers that exceed the 2^53 − 1 exact-integer limit, ISO dates a spreadsheet reformats, and anything starting with =, + or @ that a spreadsheet evaluates as a formula. Leaving inference off and treating every cell as a string is the correct default for a migration.',
      },
      {
        question: 'Which converter should I use to move a Kubernetes manifest?',
        answer:
          'YAML to JSON first if you want to see how the file actually resolves — that page lists every scalar whose resolved type depends on the spec edition, and expands anchors and merge keys, which is the only way to catch a replicaCount: 010 becoming 8 through octal interpretation. JSON to YAML going the other way quotes the values a 1.1 parser would reinterpret, so country codes and version strings stay strings.',
      },
    ],
    reading: [
      { name: 'CSV: The Complete Format Guide', path: '/learn/csv/', blurb: 'RFC 4180 quoting rules, sniffing, BOM and Excel damage.' },
      { name: 'YAML: The Complete Guide', path: '/learn/yaml/', blurb: 'Implicit typing, the Norway problem, anchors and tabs.' },
      { name: 'Tools for migrating data between systems', path: '/use-cases/data-migration/', blurb: 'The pre-flight audit that stops silent corruption.' },
    ],
  },
  'encoders-decoders': {
    indexTitle: 'Base64 & URL Encoder Decoder Online Tools | FmtTools',
    indexDescription:
      'Encode and decode Base64, base64url and percent-escaped URLs in your browser. Flag non-canonical padding, JWT segments and wrong-component escapes.',
    heading: 'Encoders and decoders',
    intro:
      'Encoding is where "it works when I paste it" stops being good enough. Base64 has two alphabets, optional padding, a canonical-form rule most decoders ignore, and line wrapping that belongs to MIME and PEM rather than the data; percent-encoding depends entirely on which component of a URI you are writing into, so the same value needs different escapes in a path, a query value and a form body. Both pages make those differences visible instead of picking one behaviour silently.',
    angle: [
      'The decoder recognises base64url by its characters, unpacks JWT segments, reads the MIME type off magic bytes and warns when trailing bits are not zero (RFC 4648 §3.5).',
      'Percent-encoding offers component, path, query-value, whole-URI and form modes, because encodeURIComponent is wrong for a query value containing "&" and for a path containing "/".',
      'Both pages normalise rather than merely translate: uppercase hex digits and literal unreserved characters per RFC 3986 §6.2.2.1, so equivalent URLs compare equal.',
    ],
    faqs: [
      {
        question: 'Is base64 encryption?',
        answer:
          'No, and treating it as such is a recurring source of leaked secrets. RFC 4648 describes a binary-to-text encoding: a reversible, keyless transformation with 64 symbols, so any valid value decodes without credentials. It exists to carry bytes through a channel that only accepts text — an email part, a JSON string, a URL segment, a PEM block. Anything genuinely private needs an authenticated cipher; base64 only changes the character set.',
      },
      {
        question: 'Why did my URL stop working after encoding it?',
        answer:
          'Usually because delimiters were encoded, or were not. RFC 3986 §2.2 reserves : / ? # [ ] @ ! $ & \' ( ) * + , ; = for their structural roles, so a "?" inside a query value must become %3F or the value ends early, while the "?" that starts the query must stay raw or the whole URL becomes one path. Component mode escapes "/" and turns a route-style value into %2F, which IIS and Apache normalise before routing and therefore reject. Pick the mode that matches the component you are writing.',
      },
      {
        question: 'What is the difference between base64 and base64url?',
        answer:
          'Same 6-bit packing, two alphabets. RFC 4648 §4 uses "+" and "/"; both are unsafe in URLs and filenames — "+" decodes to a space in a query string — so §5 replaces index 62 with "-" and index 63 with "_". JWTs (RFC 7515) additionally omit the "=" padding. A decoder that assumes the standard alphabet corrupts any base64url value containing "-" or "_", which is why the decode tab detects the alphabet from the characters present.',
      },
    ],
    reading: [
      { name: 'Base64: The Complete Encoding Guide', path: '/learn/base64/', blurb: 'The bit maths, the alphabets, padding and overhead.' },
      { name: 'Encoding tools with security consequences', path: '/use-cases/encoding/', blurb: 'alg "none", double decoding and canonical-form tricks.' },
      { name: 'Tools for debugging HTTP APIs', path: '/use-cases/api-debugging/', blurb: 'Decoding a token and reading its claims safely.' },
    ],
  },
}
