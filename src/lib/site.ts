export const SITE = {
  name: 'FmtTools',
  url: 'https://fmttools.com',
  tagline: 'Data format converters that run entirely in your browser',
  locale: 'en',
  twitter: '@fmttools',
  email: 'team@fmttools.com',
  launched: '2026',
} as const

export function absolute(path: string) {
  return `${SITE.url}${path.endsWith('/') ? path : `${path}/`}`
}

/** Asset URLs keep their extension: trailingSlash only applies to pages. */
export function asset(path: string) {
  return `${SITE.url}${path}`
}

export type CategoryId = 'json-tools' | 'format-converters' | 'encoders-decoders'

export type Category = {
  id: CategoryId
  name: string
  path: `/${CategoryId}/`
  letter: string
  blurb: string
  accent: string
  chip: string
  headline: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'json-tools',
    name: 'JSON Tools',
    path: '/json-tools/',
    letter: 'JS',
    blurb: 'Beautify, validate and shrink JSON without losing a single byte of precision.',
    accent: 'bg-sky-600',
    chip: 'bg-sky-50 text-sky-800 ring-sky-200',
    headline: 'Parse, print and check JSON documents',
  },
  {
    id: 'format-converters',
    name: 'Format Converters',
    path: '/format-converters/',
    letter: 'FC',
    blurb: 'Move data between JSON, CSV and YAML with type inference you can audit.',
    accent: 'bg-violet-600',
    chip: 'bg-violet-50 text-violet-800 ring-violet-200',
    headline: 'Convert tabular and hierarchical formats both ways',
  },
  {
    id: 'encoders-decoders',
    name: 'Encoders & Decoders',
    path: '/encoders-decoders/',
    letter: 'ED',
    blurb: 'RFC 4648 Base64 and RFC 3986 percent-encoding, including base64url, JWT and data: URI inspection.',
    accent: 'bg-emerald-600',
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    headline: 'Binary-to-text and URI escaping, done correctly',
  },
]

export type ToolDef = {
  slug: string
  name: string
  path: string
  category: CategoryId
  h1: string
  title: string
  description: string
  summary: string
  keywords: string[]
  letter: string
  popular: boolean
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    path: '/json-tools/formatter/',
    category: 'json-tools',
    h1: 'JSON Formatter and Validator',
    title: 'JSON Formatter Online - Free JSON Beautifier & Validator | FmtTools',
    description:
      'Free online JSON formatter and validator. Beautify, minify, and validate JSON data instantly. No signup required. Works in your browser, data never leaves it.',
    summary: 'Re-indents JSON with 2, 4 or tab spacing, keeps key order and numeric literals exactly as written, and marks every syntax problem with a line and column.',
    keywords: ['json formatter', 'json beautifier', 'pretty print json', 'json prettifier online', 'format json online'],
    letter: 'F',
    popular: true,
  },
  {
    slug: 'json-validator',
    name: 'JSON Validator',
    path: '/json-tools/validator/',
    category: 'json-tools',
    h1: 'JSON Validator and Syntax Checker',
    title: 'JSON Validator Online - Check JSON Syntax & Errors | FmtTools',
    description:
      'Validate JSON against RFC 8259 and get the exact line, column and cause of every error. Free online validator with warnings for big integers and duplicate keys.',
    summary: 'Reports the precise offset of each syntax error, plus the warnings ordinary parsers hide: duplicate keys, unsafe integers, stray BOM, comments and NDJSON.',
    keywords: ['json validator', 'validate json online', 'json syntax checker', 'json parser error', 'check json format'],
    letter: 'V',
    popular: true,
  },
  {
    slug: 'json-minify',
    name: 'JSON Minifier',
    path: '/json-tools/minify/',
    category: 'json-tools',
    h1: 'JSON Minifier and Compressor',
    title: 'JSON Minifier Online - Free JSON Compressor & Size Report | FmtTools',
    description:
      'Strip whitespace and line breaks from JSON in one click. See exactly how many bytes you saved, verify the round trip and keep numeric precision intact.',
    summary: 'Removes insignificant whitespace, reports byte savings against the input and gzips a comparison copy, and proves the output parses back to the same value.',
    keywords: ['json minifier', 'minify json', 'compress json online', 'json to minified', 'reduce json size'],
    letter: 'M',
    popular: false,
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON',
    path: '/format-converters/csv-to-json/',
    category: 'format-converters',
    h1: 'CSV to JSON Converter',
    title: 'CSV to JSON Converter Online - Free, Secure & Accurate | FmtTools',
    description:
      'Convert CSV to JSON with an RFC 4180 parser. Detects delimiters, infers column types safely, and flags ragged rows, duplicate headers and precision loss.',
    summary: 'A state-machine CSV reader (quoted fields, embedded newlines, CRLF and BOM) that turns rows into objects and tells you when a column cannot be typed safely.',
    keywords: ['csv to json', 'convert csv to json online', 'csv to json array of objects', 'csv json converter', 'csv to json with headers'],
    letter: 'C→J',
    popular: true,
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV',
    path: '/format-converters/json-to-csv/',
    category: 'format-converters',
    h1: 'JSON to CSV Converter',
    title: 'JSON to CSV Converter Online - Flatten Nested JSON Free | FmtTools',
    description:
      'Convert JSON to CSV in your browser. Flattens nested objects, unions ragged columns, quotes per RFC 4180 and warns about Excel data loss before you download.',
    summary: 'Handles arrays of objects, object-of-objects dictionaries and nested payloads, with configurable path flattening, column ordering and RFC-correct quoting.',
    keywords: ['json to csv', 'json to csv converter', 'nested json to csv', 'json array to csv', 'convert json to csv online'],
    letter: 'J→C',
    popular: true,
  },
  {
    slug: 'json-to-yaml',
    name: 'JSON to YAML',
    path: '/format-converters/json-to-yaml/',
    category: 'format-converters',
    h1: 'JSON to YAML Converter',
    title: 'JSON to YAML Converter Online - Free YAML 1.2 Output | FmtTools',
    description:
      'Convert JSON to YAML with correct block indentation and safe scalar quoting. Protects country codes and versions from YAML 1.1 boolean coercion. Free, in-browser.',
    summary: 'Writes block-style YAML with consistent indentation, block scalars for multi-line text, and explicit quoting of any string a YAML 1.1 reader could misinterpret.',
    keywords: ['json to yaml', 'json to yaml converter', 'convert json to yaml online', 'json to yaml kubernetes', 'json to yml'],
    letter: 'J→Y',
    popular: false,
  },
  {
    slug: 'yaml-to-json',
    name: 'YAML to JSON',
    path: '/format-converters/yaml-to-json/',
    category: 'format-converters',
    h1: 'YAML to JSON Converter',
    title: 'YAML to JSON Converter with Error Lines - Free Parser | FmtTools',
    description:
      'Convert YAML to JSON with a YAML 1.2 parser. Exact error lines, tab-indentation and duplicate-key warnings, plus a report of version-dependent scalar types.',
    summary: 'Parses YAML 1.2 with positional errors, then lists every plain scalar whose type is version-dependent or that a numeric round trip rewrites — the mechanism behind the Norway problem.',
    keywords: ['yaml to json', 'yaml to json converter', 'convert yaml to json online', 'yaml to json kubernetes', 'yml to json'],
    letter: 'Y→J',
    popular: false,
  },
  {
    slug: 'base64',
    name: 'Base64 Encode & Decode',
    path: '/encoders-decoders/base64/',
    category: 'encoders-decoders',
    h1: 'Base64 Encoder and Decoder',
    title: 'Base64 Encoder & Decoder Online - Free, RFC 4648 | FmtTools',
    description:
      'Encode and decode Base64, base64url and MIME variants in your browser. Inspect JWT segments, data URIs and PEM blocks, and detect binary types from magic bytes.',
    summary: 'One tool with two tabs: UTF-8-safe encoding with base64url and padding control, and a decoder that sniffs magic bytes, unpacks JWTs and flags non-canonical output.',
    keywords: ['base64 encode', 'base64 decode', 'base64 encoder online', 'base64 decoder', 'base64url', 'encode string to base64'],
    letter: 'B64',
    popular: true,
  },
  {
    slug: 'url-encoder',
    name: 'URL Encode & Decode',
    path: '/encoders-decoders/url/',
    category: 'encoders-decoders',
    h1: 'URL Encoder and Decoder',
    title: 'URL Encoder & Decoder Online - Percent Encoding, Free | FmtTools',
    description:
      'Percent-encode or decode URLs, path segments and query values per RFC 3986. Normalise escapes, inspect query parameters and catch double encoding instantly.',
    summary: 'Five escaping modes (component, path, query value, whole URI, form body), canonicalisation to uppercase escapes, plus a URL inspector that splits every RFC 3986 component.',
    keywords: ['url encode', 'url decode', 'percent encoding', 'url encoder online', 'encodeURIComponent alternative', 'escape url online'],
    letter: 'URL',
    popular: true,
  },
]

export const TOOL_BY_SLUG: Record<string, ToolDef> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]))

export function toolsInCategory(category: CategoryId) {
  return TOOLS.filter((t) => t.category === category)
}

export type LearnDef = {
  slug: string
  name: string
  path: string
  h1: string
  title: string
  description: string
  summary: string
  keywords: string[]
  letter: string
  readingMinutes: number
  updated: string
  toolPaths: string[]
}

export const LEARN: LearnDef[] = [
  {
    slug: 'json',
    name: 'JSON',
    path: '/learn/json/',
    h1: 'JSON: The Complete Specification Guide',
    title: 'JSON Complete Guide: Syntax, Spec Rules & Pitfalls (2026) | FmtTools',
    description:
      'A complete guide to JSON: RFC 8259 grammar, number precision, duplicate keys, NDJSON, JSON5 and JSON Schema, with worked examples and the errors parsers hide.',
    summary: 'What the standard actually says — grammar, the number rules, duplicate names, ordering, MIME type, and why 32-bit integers break in JavaScript.',
    keywords: ['json guide', 'json syntax', 'rfc 8259', 'json number precision', 'ndjson', 'json5'],
    letter: 'JS',
    readingMinutes: 10,
    updated: '2026-11-17',
    toolPaths: ['/json-tools/formatter/', '/json-tools/validator/', '/json-tools/minify/'],
  },
  {
    slug: 'csv',
    name: 'CSV',
    path: '/learn/csv/',
    h1: 'CSV: The Complete Format Guide',
    title: 'CSV Complete Guide: RFC 4180 Rules, Delimiters & Traps | FmtTools',
    description:
      'Everything about CSV: RFC 4180 quoting rules, delimiter sniffing, BOM and encodings, Excel data loss, TSV, and why you can never split CSV on a comma.',
    summary: 'The one standard that exists, the rules writers break, and the two-stage parsing bug that means split(",") is never a CSV parser.',
    keywords: ['csv guide', 'rfc 4180', 'csv quoting rules', 'csv delimiter', 'csv bom utf-8', 'csv data loss'],
    letter: 'CS',
    readingMinutes: 13,
    updated: '2026-11-17',
    toolPaths: ['/format-converters/csv-to-json/', '/format-converters/json-to-csv/'],
  },
  {
    slug: 'yaml',
    name: 'YAML',
    path: '/learn/yaml/',
    h1: 'YAML: The Complete Guide to the Format That Types Your Data',
    title: 'YAML Complete Guide: 1.1 vs 1.2, Norway Problem & Fixes | FmtTools',
    description:
      'How YAML really works: implicit typing, the Norway problem, tabs, anchors, merge keys, block scalars, security history, and rules for YAML that survives review.',
    summary: 'Why unquoted NO becomes false, why 1.10 becomes 1.1, and how indentation, anchors and the two versions of the spec turn into production incidents.',
    keywords: ['yaml guide', 'norway problem', 'yaml 1.2', 'yaml indentation', 'yaml anchors', 'block scalar'],
    letter: 'YM',
    readingMinutes: 20,
    updated: '2026-11-17',
    toolPaths: ['/format-converters/yaml-to-json/', '/format-converters/json-to-yaml/'],
  },
  {
    slug: 'xml',
    name: 'XML',
    path: '/learn/xml/',
    h1: 'XML: The Complete Guide to Markup That Refuses to Die',
    title: 'XML Complete Guide: Syntax, Namespaces, XPath & XXE | FmtTools',
    description:
      'A complete XML guide: well-formedness rules, namespaces, DTD and entities, XPath, XSD, RSS and SVG, plus XXE and entity-expansion attacks with mitigations.',
    summary: 'The five markup rules, how namespaces actually resolve, what an InfoSet is, and why the format SOAP, RSS, SVG and Office files still depend on it.',
    keywords: ['xml guide', 'xml namespaces', 'xml dtd entities', 'xpath', 'xxe', 'xml vs json'],
    letter: 'XM',
    readingMinutes: 20,
    updated: '2026-11-17',
    toolPaths: ['/json-tools/validator/', '/compare/xml-vs-json/'],
  },
  {
    slug: 'base64',
    name: 'Base64',
    path: '/learn/base64/',
    h1: 'Base64: The Complete Encoding Guide',
    title: 'Base64 Complete Guide: RFC 4648, base64url & JWT | FmtTools',
    description:
      'Base64 explained with worked bit maths: the RFC 4648 alphabet, padding and size overhead, base64url, MIME and PEM wrapping, data URIs, JWTs and why it is not encryption.',
    summary: 'Three bytes become four characters — the arithmetic, the alphabets, the padding rules, the 33% overhead, and every place the encoding shows up in practice.',
    keywords: ['base64 guide', 'rfc 4648', 'base64url', 'base64 padding', 'data uri', 'jwt base64url', 'is base64 encryption'],
    letter: 'B6',
    readingMinutes: 9,
    updated: '2026-11-17',
    toolPaths: ['/encoders-decoders/base64/', '/learn/base64/'],
  },
]

export type UseCaseDef = {
  slug: string
  name: string
  path: string
  h1: string
  title: string
  description: string
  summary: string
  letter: string
  toolPaths: string[]
  updated: string
}

export const USE_CASES: UseCaseDef[] = [
  {
    slug: 'api-debugging',
    name: 'API Debugging Tools',
    path: '/use-cases/api-debugging/',
    h1: 'Tools for Debugging HTTP APIs',
    title: 'API Debugging Tools - Inspect JSON, JWT & Base64 Free | FmtTools',
    description:
      'A workflow and toolset for debugging API responses: beautify JSON payloads, decode JWT tokens, diff key order, minify fixtures and check content encodings.',
    summary: 'What to do when a response is a single 2 MB line: decode the token, find the path, format the body, and check the encoding claims before you blame the server.',
    letter: 'API',
    toolPaths: [
      '/json-tools/formatter/',
      '/json-tools/validator/',
      '/encoders-decoders/base64/',
      '/encoders-decoders/url/',
      '/json-tools/minify/',
    ],
    updated: '2026-11-17',
  },
  {
    slug: 'data-migration',
    name: 'Data Migration Tools',
    path: '/use-cases/data-migration/',
    h1: 'Tools for Migrating Data Between Systems',
    title: 'Data Migration Tools - CSV to JSON & Type Safety | FmtTools',
    description:
      'Move data between CSV, JSON and YAML without silent corruption: audit columns, catch 15-digit precision loss, fix ragged rows and verify every round trip.',
    summary: 'The pre-flight audit that stops zip codes losing their leading zero and IDs losing their last three digits on the way into a new database.',
    letter: 'DM',
    toolPaths: [
      '/format-converters/csv-to-json/',
      '/format-converters/json-to-csv/',
      '/format-converters/yaml-to-json/',
      '/json-tools/validator/',
    ],
    updated: '2026-11-17',
  },
  {
    slug: 'config-conversion',
    name: 'Config Conversion Tools',
    path: '/use-cases/config-conversion/',
    h1: 'Tools for Converting Configuration Files',
    title: 'Config Conversion Tools - JSON, YAML & TOML | FmtTools',
    description:
      'Convert between config formats safely: JSON to YAML for Kubernetes, YAML to JSON for pipelines, quoting that survives 1.1 parsers, and duplicate-key detection.',
    summary: 'Manifests, Helm charts, CI pipelines and Spring profiles: how to move a config between formats without a boolean appearing where a string belonged.',
    letter: 'CF',
    toolPaths: [
      '/format-converters/json-to-yaml/',
      '/format-converters/yaml-to-json/',
      '/json-tools/formatter/',
      '/json-tools/validator/',
    ],
    updated: '2026-11-17',
  },
  {
    slug: 'log-analysis',
    name: 'Log Analysis Tools',
    path: '/use-cases/log-analysis/',
    h1: 'Tools for Reading Structured Logs',
    title: 'Log Analysis Tools - NDJSON, JSON Lines & Base64 | FmtTools',
    description:
      'Turn structured logs into analysable JSON: wrap NDJSON into arrays, split interleaved lines, decode base64 message fields and keep timestamps precise.',
    summary: 'For the log line that is valid JSON on its own but invalid as a file: NDJSON, interleaved writes, embedded base64, and how to get a queryable array.',
    letter: 'LG',
    toolPaths: ['/json-tools/formatter/', '/json-tools/validator/', '/encoders-decoders/base64/', '/format-converters/csv-to-json/'],
    updated: '2026-11-17',
  },
  {
    slug: 'test-data',
    name: 'Test Data Tools',
    path: '/use-cases/test-data/',
    h1: 'Tools for Building Test Fixtures',
    title: 'Test Data Tools - Generate JSON, CSV & YAML Fixtures | FmtTools',
    description:
      'Build believable fixtures: shape JSON responses, write CSV that opens correctly in Excel, generate YAML for tests and keep identifiers as exact strings.',
    summary: 'Edge cases that break software are not random: empty strings, unsafe integers, embedded commas and dates in mixed time zones. Build them on purpose.',
    letter: 'TD',
    toolPaths: ['/format-converters/json-to-csv/', '/format-converters/csv-to-json/', '/format-converters/json-to-yaml/', '/json-tools/formatter/'],
    updated: '2026-11-17',
  },
  {
    slug: 'encoding',
    name: 'Encoding & Security Tools',
    path: '/use-cases/encoding/',
    h1: 'Encoding Tools with Security Consequences',
    title: 'Encoding & Security Tools - Base64, URL, JWT Checks | FmtTools',
    description:
      'Where encoding meets security: base64 is not encryption, JWT alg none, double percent-encoding bypasses, CSV formula injection and data URI script risks.',
    summary: 'Every normalisation bug that has a security label on it: canonical base64, double decoding, "+" versus space, formula injection, and unverified tokens.',
    letter: 'EN',
    toolPaths: ['/encoders-decoders/base64/', '/encoders-decoders/url/', '/json-tools/validator/', '/format-converters/csv-to-json/'],
    updated: '2026-11-17',
  },
]

export type CompareDef = {
  slug: string
  name: string
  path: string
  h1: string
  title: string
  description: string
  summary: string
  left: string
  right: string
  updated: string
  toolPaths: string[]
}

export const COMPARES: CompareDef[] = [
  {
    slug: 'json-vs-csv',
    name: 'JSON vs CSV',
    path: '/compare/json-vs-csv/',
    h1: 'JSON vs CSV: Which Format for Your Data?',
    title: 'JSON vs CSV: 14 Differences, When to Use Each (2026) | FmtTools',
    description:
      'JSON versus CSV compared on structure, nesting, typing, streaming, file size, database imports and spreadsheet safety, with a decision table and conversion notes.',
    summary: 'Hierarchy against a grid: the differences that decide where a payload should live, measured on the same record.',
    left: 'JSON',
    right: 'CSV',
    updated: '2026-11-12',
    toolPaths: ['/format-converters/json-to-csv/', '/format-converters/csv-to-json/'],
  },
  {
    slug: 'yaml-vs-json',
    name: 'YAML vs JSON',
    path: '/compare/yaml-vs-json/',
    h1: 'YAML vs JSON: Readability Against Predictability',
    title: 'YAML vs JSON: Which Config Format Is Safer? (2026) | FmtTools',
    description:
      'YAML against JSON for configuration: implicit typing, the Norway problem, comments, anchors, size, parse speed and which one fails loudly in code review.',
    summary: 'The comparison every Kubernetes and CI team needs: what you gain in keystrokes and what you pay in silently retyped values.',
    left: 'YAML',
    right: 'JSON',
    updated: '2026-11-12',
    toolPaths: ['/format-converters/yaml-to-json/', '/format-converters/json-to-yaml/'],
  },
  {
    slug: 'xml-vs-json',
    name: 'XML vs JSON',
    path: '/compare/xml-vs-json/',
    h1: 'XML vs JSON: The Trade-offs After 25 Years',
    title: 'XML vs JSON: Size, Schema, Namespaces & Speed | FmtTools',
    description:
      'XML versus JSON on verbosity, typing, schema validation, namespaces, XPath, streaming, attack surface and the domains where XML is still the correct answer.',
    summary: 'Not a legacy-versus-modern question: attributes, namespaces, XSD and XPath are capabilities JSON has no equivalent for.',
    left: 'XML',
    right: 'JSON',
    updated: '2026-11-12',
    toolPaths: ['/json-tools/formatter/', '/json-tools/validator/'],
  },
  {
    slug: 'csv-vs-tsv',
    name: 'CSV vs TSV',
    path: '/compare/csv-vs-tsv/',
    h1: 'CSV vs TSV: Choosing a Delimiter That Will Not Bite You',
    title: 'CSV vs TSV: Delimiter Choice, Safety & Tooling | FmtTools',
    description:
      'Comma versus tab separated values: why tabs need less quoting, how Hive, Spark, Postgres and Excel treat each, and the sniffing rules that pick wrong.',
    summary: 'The same grid with a different delimiter — and the reason data engineering default to tabs while business users default to commas.',
    left: 'CSV',
    right: 'TSV',
    updated: '2026-11-02',
    toolPaths: ['/format-converters/csv-to-json/', '/format-converters/json-to-csv/'],
  },
  {
    slug: 'yaml-vs-toml',
    name: 'YAML vs TOML',
    path: '/compare/yaml-vs-toml/',
    h1: 'YAML vs TOML: Configuration Formats Compared',
    title: 'YAML vs TOML: Indentation, Types & Tooling | FmtTools',
    description:
      'YAML against TOML for configuration: significant indentation versus tables, unquoted coercion, explicit key order, Cargo and pyproject.toml adoption.',
    summary: 'TOML exists because YAML indentation and implicit typing are hard to review. Here is exactly where each format breaks.',
    left: 'YAML',
    right: 'TOML',
    updated: '2026-11-12',
    toolPaths: ['/format-converters/json-to-yaml/', '/format-converters/yaml-to-json/'],
  },
  {
    slug: 'csv-vs-excel',
    name: 'CSV vs Excel',
    path: '/compare/csv-vs-excel/',
    h1: 'CSV vs Excel: Storage Format Against Application',
    title: 'CSV vs Excel: Data Loss, Limits & When to Use Each | FmtTools',
    description:
      'CSV versus XLSX compared: what double-clicking a CSV does to identifiers, the 15-digit rule, gene-symbol corruption, 1,048,576 rows and 16,384 columns.',
    summary: 'The most expensive data corruption in the world happens between a CSV file and a double click. Here is the mechanism and the workaround.',
    left: 'CSV',
    right: 'Excel / XLSX',
    updated: '2026-11-12',
    toolPaths: ['/format-converters/json-to-csv/', '/format-converters/csv-to-json/'],
  },
  {
    slug: 'yaml-vs-xml',
    name: 'YAML vs XML',
    path: '/compare/yaml-vs-xml/',
    h1: 'YAML vs XML: Two Ways to Describe a Tree',
    title: 'YAML vs XML: Nesting, Attributes & Validation | FmtTools',
    description:
      'YAML against XML: tree expressiveness, attributes versus maps, mixed content, anchors versus entities, validation with XSD, and document size ratios.',
    summary: 'Both describe trees, but XML separates data from document and YAML separates nothing — which is why one has namespaces and the other has tabs.',
    left: 'YAML',
    right: 'XML',
    updated: '2026-11-12',
    toolPaths: ['/format-converters/yaml-to-json/', '/learn/xml/'],
  },
]

export const LEARN_BY_SLUG = Object.fromEntries(LEARN.map((l) => [l.slug, l]))
export const USE_CASE_BY_SLUG = Object.fromEntries(USE_CASES.map((u) => [u.slug, u]))
export const COMPARE_BY_SLUG = Object.fromEntries(COMPARES.map((c) => [c.slug, c]))

export type Crumb = { name: string; path: string }

/** Standalone site pages sit one level under Home, outside the tool and article trees. */
export const SITE_PAGES: Record<string, string> = {
  '/cookie-policy/': 'Cookie Policy',
  '/terms/': 'Terms of Service',
  '/contact/': 'Contact',
}

export function breadcrumbsFor(path: string): Crumb[] {
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }]
  if (path === '/') return crumbs
  const sitePage = SITE_PAGES[path]
  if (sitePage) return [{ name: 'Home', path: '/' }, { name: sitePage, path }]
  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'json-tools' || segments[0] === 'format-converters' || segments[0] === 'encoders-decoders') {
    const category = CATEGORIES.find((c) => c.id === segments[0])
    if (category) crumbs.push({ name: category.name, path: category.path })
  } else if (segments[0] === 'learn') {
    crumbs.push({ name: 'Format Guides', path: '/learn/' })
  } else if (segments[0] === 'use-cases') {
    crumbs.push({ name: 'Use Cases', path: '/use-cases/' })
  } else if (segments[0] === 'compare') {
    crumbs.push({ name: 'Comparisons', path: '/compare/' })
  }
  const tool = TOOLS.find((t) => t.path === path)
  if (tool) crumbs.push({ name: tool.name, path: tool.path })
  else {
    const def = [...LEARN, ...USE_CASES, ...COMPARES].find((d) => d.path === path)
    if (def) crumbs.push({ name: def.slug === 'api-debugging' ? def.name : def.name, path: def.path })
  }
  return crumbs
}
