/**
 * Editor copy for the nine converter pages. Kept in one module so the visible
 * text and the JSON-LD (featureList, HowTo steps, FAQPage) are generated from
 * the same arrays and can never drift apart.
 *
 * Strings here are markdown-lite: [label](/path/), `code`, **bold**.
 * `features` is also emitted into schema.org featureList, so keep those
 * entries one clause long and free of markup.
 */

export type ToolCopy = {
  categoryName: string
  schemaCategory: string
  intro: string
  whatItDoesHeading: string
  whatItDoes: string[]
  featuresHeading: string
  features: string[]
  howHeading: string
  howIntro: string
  steps: { title: string; body: string }[]
  table?: { heading: string; caption: string; head: string[]; rows: string[][]; foot: string }
  privacyNote: string
  faqs: { question: string; answer: string }[]
  specs: { label: string; href: string; detail: string }[]
  guides: { path: string; name: string; blurb: string }[]
}

export const TOOL_COPY: Record<string, ToolCopy> = {
  'json-formatter': {
    categoryName: 'JSON tools',
    schemaCategory: 'Formatter',
    intro:
      'Paste minified or badly indented JSON and get back a document you can actually read — with key order, number literals and duplicate members preserved exactly as they were written, and every syntax problem pinned to a line and column.',
    whatItDoesHeading: 'A printer that re-indents without rewriting your data',
    whatItDoes: [
      'Most online formatters parse with `JSON.parse` and print with `JSON.stringify`. That silently changes your data: a 17-digit identifier becomes a rounded double, a repeated key disappears, and the order you depended on in a diff is gone. This tool parses the text into an abstract syntax tree that keeps each member and each numeric literal as written, then prints that tree. The only thing that changes is whitespace.',
      'Choose two spaces, four spaces, a tab, or a custom width, and the output is stable — run it twice and the second pass is byte-identical. That matters when a formatted file lands in version control, because an unstable printer produces churn in every review.',
      'When the input is not valid JSON, the formatter does not guess. It reports the first error position, the token it expected, and — where a fix is unambiguous — offers a repair pass that converts JavaScript-style object keys, single quotes, trailing commas, comments and unquoted strings into conforming JSON and lists every change it made.',
    ],
    featuresHeading: 'What the formatter does with your document',
    features: [
      'Two, four, tab or custom indentation with byte-stable output',
      'Key order preserved exactly as written',
      'Numeric literals kept verbatim, so big integers survive',
      'Duplicate member names retained rather than collapsed',
      'Unicode kept as-is or escaped to \\u sequences',
      'Optional key sorting ascending, descending or by first-seen',
      'Syntax errors pinned to line, column and byte offset',
      'Optional repair pass for JSON5-style input with a change log',
      'Drag-and-drop or pick a .json, .txt, .ndjson or .log file',
      'Download the result, copy it, or see size and node counts',
    ],
    howHeading: 'How to format a JSON string',
    howIntro: 'Three steps, all of them local to this tab.',
    steps: [
      {
        title: 'Paste or drop the JSON',
        body: 'Type into the input pane, paste a response body, or drag a file onto it. A minified single-line payload is fine — the parser works on characters, not lines.',
      },
      {
        title: 'Pick indentation and escaping',
        body: 'Two spaces is the convention for most JavaScript and API work; four is common in Python-adjacent configs; a tab suits documents reviewed in an editor with tab-width settings.',
      },
      {
        title: 'Read the diagnostics before you trust the output',
        body: 'Warnings tell you what a normal parser would have hidden: duplicate keys, integers above 2^53-1, a leading byte-order mark, or a file of newline-separated records rather than one document.',
      },
      {
        title: 'Copy or download the result',
        body: 'Copy to the clipboard or save as a .json file. The status bar reports characters, bytes, lines, depth and how many members were touched.',
      },
    ],
    table: {
      heading: 'Formatting options and what each one changes',
      caption: 'Every option in the toolbar, its default, and the effect on the printed document.',
      head: ['Option', 'Default', 'Effect'],
      rows: [
        ['Indent', '2 spaces', 'Width of one nesting level. Output is stable for any fixed value.'],
        ['Key order', 'Keep as written', 'Sorting is opt-in; keeping order preserves diffs and semantic ordering in JSON Schema `properties`.'],
        ['Number literals', 'Verbatim', 'Prints the exact characters from the input, so `9007199254740993` survives instead of becoming `9007199254740992`.'],
        ['Unicode', 'Kept raw', 'Switching to escapes turns `€` into `\\u20ac`, which is the same string but readable in a legacy transport.'],
        ['Repair mode', 'Off', 'Accepts single quotes, unquoted keys, comments, trailing commas and `NaN`, then logs each substitution.'],
        ['Line ending', 'LF', 'CRLF for Windows editors that insist on it.'],
      ],
      foot: 'Nothing in this table is configurable server-side; the options exist only in this tab and are not remembered between visits.',
    },
    privacyNote:
      'The text never leaves the tab. Parsing happens in JavaScript in your browser, so an offline machine with the page already loaded still formats successfully — there is no upload request to fail.',
    faqs: [
      {
        question: 'Does this formatter keep duplicate keys?',
        answer:
          'Yes. RFC 8259 §4 says names in an object SHOULD be unique but does not forbid repeats, and `JSON.parse` keeps only the last value for a duplicated name. This tool works from the parsed syntax tree, so printing preserves both members and the warning tells you the collision is there.',
      },
      {
        question: 'Why does my long ID change when I format it elsewhere?',
        answer:
          'Because that tool converted the number to an IEEE-754 double. Doubles hold 53 bits of mantissa, so integers above 9007199254740991 (2^53 − 1) lose their low bits. Here the digits are printed exactly as typed; see the [JSON validator](/json-tools/validator/) for the warning.',
      },
      {
        question: 'Can it format NDJSON or a log file?',
        answer:
          'A file where each line is its own JSON document is not one valid document, so the formatter detects that shape, reports the record count and formats each line, then joins them back with newlines rather than inventing an array you did not ask for.',
      },
      {
        question: 'What is the largest file it can handle?',
        answer:
          'Roughly a few hundred megabytes of text on a typical laptop, limited by the tab heap rather than any hard cap in the code. Above that, use a streaming parser such as `jq`, Go `json.Decoder` or Python `ijson`.',
      },
      {
        question: 'Does it sort keys alphabetically?',
        answer:
          'Only if you ask. Sorting is offered ascending, descending and numerically for object-like keys, because a sorted diff of a stable document is often more readable — but key order can carry meaning, so keeping it is the default.',
      },
      {
        question: 'Is formatted JSON slower to send over the network?',
        answer:
          'Yes, and measurably so: indentation is pure overhead. Format for reading and use the [JSON minifier](/json-tools/minify/) for transport; gzip typically shrinks the difference to a few percent, which is why pretty-printing in development is acceptable and in production is not.',
      },
      {
        question: 'What does this do that a paste box does not?',
        answer:
          'It parses to a syntax tree that keeps the literal characters of every number, so a snowflake ID such as `9007199254740993` prints with all sixteen digits instead of being rounded by the double-precision conversion `JSON.parse` performs before anything is printed. On top of that it reports duplicate names, marks the line and column of every syntax problem, recognises NDJSON, and cites the RFC 8259 clause behind each diagnostic so the message can be checked against the standard rather than taken on faith.',
      },
    ],
    specs: [
      {
        label: 'RFC 8259 §2 — JSON grammar',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-2',
        detail: 'The production the formatter accepts: array, object, number, string, true, false, null and the insignificant-whitespace set.',
      },
      {
        label: 'RFC 8259 §4 — Objects',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-4',
        detail: 'Names SHOULD be unique. The clause behind the duplicate-key warning and the decision to keep both members.',
      },
      {
        label: 'RFC 8259 §6 — Numbers',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
        detail: 'Interoperability note that implementations may limit digit precision; the reason numeric literals are printed verbatim.',
      },
      {
        label: 'ECMA-404 — The JSON Data Interchange Syntax',
        href: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/',
        detail: 'The identical grammar published as a European standard, referenced for the definition of a well-formed document.',
      },
    ],
    guides: [
      { path: '/learn/json/', name: 'JSON: the complete specification guide', blurb: 'Grammar, number rules, duplicate names and the errors parsers hide.' },
      { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Diagnose a document that will not parse.' },
      { path: '/json-tools/minify/', name: 'JSON Minifier', blurb: 'Strip the whitespace again for transport.' },
    ],
  },

  'json-validator': {
    categoryName: 'JSON tools',
    schemaCategory: 'Validator',
    intro:
      'A validator that answers two questions a `JSON.parse` call cannot: exactly where the document stops being valid, and what a lenient parser would have quietly changed even when it succeeds.',
    whatItDoesHeading: 'Position-precise errors, plus the warnings that survive a successful parse',
    whatItDoes: [
      'The parser is written against the RFC 8259 grammar rather than delegated to `JSON.parse`, so an error carries a byte offset, a line, a column, the token found, the set of tokens expected, and a short note naming the clause. For a two-megabyte single-line response, that is the difference between a five-minute fix and an afternoon.',
      'A document can be valid and still be a problem. Duplicate member names, integers wider than the 53-bit mantissa, values that are `NaN` or `Infinity` in disguise, a leading byte-order mark, comments, and files of newline-delimited records all get flagged with the position and the consequence, not just a red cross.',
      'The result panel reports the shape of the document — depth, member count, array lengths, the largest collection, whether the root is an array — so you can see whether a payload has the structure your code expects before you write against it.',
    ],
    featuresHeading: 'What validation reports',
    features: [
      'Every syntax error with line, column and byte offset',
      'Expected-versus-found token description',
      'Duplicate member name detection with both positions',
      'Unsafe integer detection above 2^53 − 1',
      'BOM, comment, single-quote and trailing-comma diagnosis',
      'NDJSON and JSON text sequence recognition',
      'Control characters and lone surrogates inside strings',
      'Depth, member, node and array-length statistics',
      'Structural outline of the document before and after the error',
      'Repair suggestion when the deviation is mechanical',
    ],
    howHeading: 'How to validate JSON',
    howIntro: 'Validation runs as you type; nothing needs to be submitted.',
    steps: [
      { title: 'Paste the document', body: 'The status banner updates on every change. A green banner means the grammar is satisfied, not that the values are safe — read the warnings too.' },
      { title: 'Work down the diagnostics list', body: 'Errors are ordered by position. Fix the first one and re-read: a single missing comma can produce a cascade of later errors that were never real.' },
      { title: 'Check the statistics against your expectation', body: 'Depth, member count and the largest array tell you whether you are looking at one record, a page of them, or a dictionary keyed by ID.' },
      { title: 'Use the outline to find the path', body: 'The structural preview shows keys down to a chosen depth, which is how you locate the field a schema or a JSONPath expression should target.' },
    ],
    table: {
      heading: 'What each diagnostic means',
      caption: 'The codes this validator emits, whether they block parsing, and the practical consequence.',
      head: ['Diagnostic', 'Severity', 'Consequence'],
      rows: [
        ['Unexpected token', 'Error', 'The grammar is violated at that offset; nothing parses until it is fixed.'],
        ['Duplicate member name', 'Warning', 'Valid JSON, but `JSON.parse` keeps only the last value; one of the two is silently gone.'],
        ['Integer above 2^53 − 1', 'Warning', 'Valid JSON, but JavaScript arithmetic will round it. Quote the value or read it as a string.'],
        ['Byte-order mark', 'Warning', 'Parses in browsers, rejected by many strict back-end parsers, including some JSON libraries.'],
        ['Comments present', 'Error', 'Not JSON. It is JSON5 or a configuration dialect; convert before sending it to an API.'],
        ['Trailing comma', 'Error', 'Allowed in JavaScript literals, forbidden by RFC 8259 §2.'],
        ['One value per line', 'Info', 'NDJSON or an RFC 7464 JSON text sequence, not a single document.'],
        ['Unescaped control character', 'Error', 'Characters below U+0020 must be escaped inside a string per RFC 8259 §7.'],
      ],
      foot: 'Severity reflects the specification, not this tool: only Error rows make the document invalid JSON.',
    },
    privacyNote:
      'Validation is local by construction. The document is never posted anywhere, so a payload containing production credentials, personal data or unreleased API shapes stays on your machine.',
    faqs: [
      {
        question: 'Why is my JSON invalid when it parses in JavaScript?',
        answer:
          'Because the file is not JSON but a JavaScript object literal: unquoted keys, single quotes, trailing commas, comments, or values like `undefined` and `NaN`. `eval` tolerates those; a conforming parser must not. The validator names the exact offset where the divergence starts.',
      },
      {
        question: 'Is a duplicate key an error?',
        answer:
          'No — it is a warning. RFC 8259 §4 says names SHOULD be unique, which is advice, not a requirement, and the ABNF admits the duplicate. The practical risk is that every `JSON.parse` implementation you will meet keeps the last value, so the earlier one is lost. [JSON Formatter](/json-tools/formatter/) prints both.',
      },
      {
        question: 'What is the biggest integer JSON can hold exactly?',
        answer:
          'JSON itself imposes no limit on digits. The limit comes from the reader: an IEEE-754 double represents integers exactly up to 9007199254740991, so the validator warns above that because most consumers are JavaScript, and beyond it the value should be a string.',
      },
      {
        question: 'Can it check my JSON against a schema?',
        answer:
          'No. This tool answers "is this well-formed, and what would a parser do to it". Structural validation against a contract is a different problem — use a JSON Schema 2020-12 validator such as Ajv for that; see the [JSON guide](/learn/json/).',
      },
      {
        question: 'Why does it say my file is NDJSON?',
        answer:
          'Because it contains several complete JSON documents separated by newlines, which is a valid log and transport format but not one JSON document. Wrapping the lines in an array is what the formatter offers; RFC 7468 defines the sequence form with a record-separator character.',
      },
      {
        question: 'Does it validate UTF-8 encoding?',
        answer:
          'It reports lone surrogates and unescaped control characters inside strings, and detects a leading BOM. For byte-level encoding checks on a response, look at the `charset` header and the `content-encoding` claim, then decode with the [Base64 decoder](/encoders-decoders/base64/).',
      },
      {
        question: 'What does the report contain beyond pass or fail?',
        answer:
          'Every diagnostic carries a line, a column and a byte offset plus the rule it broke, and errors after the first are listed too, in source order, with a note that fixing the earliest one is usually what removes the rest. Alongside the errors it reports what a successful `JSON.parse` hides: duplicate names, integers outside 2^53 − 1, a leading BOM, comments, and a file that is actually NDJSON.',
      },
    ],
    specs: [
      {
        label: 'RFC 8259 §2 — Products',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-2',
        detail: 'The ABNF the validator implements, including which characters count as whitespace.',
      },
      {
        label: 'RFC 8259 §7 — Strings',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
        detail: 'Requires escaping of the code points U+0000 through U+001F; the source of the control-character error.',
      },
      {
        label: 'RFC 8259 §8.1 — JSON text security',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
        detail: 'Interoperability and duplicate-name considerations the warning list is built on.',
      },
      {
        label: 'RFC 7464 — JSON text sequences',
        href: 'https://datatracker.ietf.org/doc/html/rfc7464',
        detail: 'The record-separator framing this tool recognises when a file is a stream of values.',
      },
    ],
    guides: [
      { path: '/json-tools/formatter/', name: 'JSON Formatter', blurb: 'Re-indent a document you have just fixed.' },
      { path: '/learn/json/', name: 'JSON complete guide', blurb: 'What the grammar permits and what implementations do anyway.' },
      { path: '/use-cases/api-debugging/', name: 'API debugging tools', blurb: 'A triage order for unreadable responses.' },
    ],
  },

  'json-minify': {
    categoryName: 'JSON tools',
    schemaCategory: 'Compressor',
    intro:
      'Remove the whitespace that RFC 8259 calls insignificant, then show the byte delta, prove the round trip and keep every digit of every number intact.',
    whatItDoesHeading: 'Minification you can verify rather than trust',
    whatItDoes: [
      'Minifying correctly is harder than deleting spaces: whitespace inside a string is data. A naive regular expression that strips `\n` or collapses `\\s+` corrupts documents whose values contain line breaks, and it is a classic source of silently mangled templates and multi-line messages. This tool parses first and only removes whitespace that the grammar classifies as insignificant.',
      'The result panel reports input bytes, output bytes, the saving in bytes and percent, and — where the browser exposes the Compression Streams API — the size of both after gzip, because the interesting question is usually "is minifying before gzip still worth it" and the honest answer depends on how repetitive the document is.',
      'Minification is re-parsed and compared structurally against the input. If the two do not agree, the tool says so instead of handing you a smaller file that means something different.',
    ],
    featuresHeading: 'What the minifier reports and preserves',
    features: [
      'Whitespace removal that never touches string contents',
      'Byte and percentage savings against the original',
      'gzip comparison when the browser supports Compression Streams',
      'Numeric literals preserved exactly',
      'Duplicate members preserved rather than collapsed',
      'Optional escaping of non-ASCII to \\u sequences',
      'Round-trip verification against the parsed input',
      'Line and record counts before and after',
      'Download as .json with the byte count in the filename label',
      'NDJSON detected and reported instead of silently joined',
    ],
    howHeading: 'How to minify JSON',
    howIntro: 'The same three motions as any converter, with a verification step you should not skip.',
    steps: [
      { title: 'Paste the pretty-printed document', body: 'If you received it from the [JSON formatter](/json-tools/formatter/), paste that output directly — the minifier is the inverse pass.' },
      { title: 'Decide on non-ASCII handling', body: 'Leaving Unicode raw is smaller for UTF-8 payloads of Latin text; escaping to `\\u00e9` helps only when the transport cannot carry UTF-8.' },
      { title: 'Read the savings, not just the size', body: 'The panel shows bytes removed and percent. A document that was 90 percent indentation has nowhere near the same post-gzip gain as one with long repeated strings.' },
      { title: 'Confirm the round trip', body: 'The tool re-parses the minified output and compares it to the original tree. If verification fails, the input contained something the grammar does not allow.' },
    ],
    table: {
      heading: 'Where minification actually pays',
      caption: 'Approximate effect of removing whitespace before gzip, by document shape.',
      head: ['Document shape', 'Whitespace share', 'After gzip, minify still helps?'],
      rows: [
        ['Deeply nested, short keys, lots of structure', 'High — often 40-70%', 'Yes; structural tokens dominate and gzip cannot infer your indentation.'],
        ['Long repeated string values, log payloads', 'Low', 'Marginally; gzip already collapses the repetition.'],
        ['Array of many small records', 'High', 'Yes, and the win scales with record count.'],
        ['Base64 blobs in string fields', 'Very low', 'No; encoded payloads are near-incompressible and untouched by whitespace removal.'],
      ],
      foot: 'Shares are the ratio of insignificant whitespace in the formatted document, which the size report prints as a number you can check rather than a claim to take on faith.',
    },
    privacyNote:
      'Everything happens in the tab, including the gzip comparison, which uses the browser Compression Streams API rather than a server. If the API is unavailable, the gzip row is omitted instead of approximated.',
    faqs: [
      {
        question: 'Does minifying JSON change the data?',
        answer:
          'Not if it is done correctly. RFC 8259 §2 defines space, tab, LF and CR outside strings as insignificant. Minification becomes corruption the moment a naive implementation removes whitespace inside a string value, which is why this tool parses before it prints.',
      },
      {
        question: 'Should I minify before storing or before sending?',
        answer:
          'Sending, yes, if you are not already compressing the transport. Storing minified is usually a mistake: you lose readable diffs, and object storage or a database column costs you little per byte compared with the review time you will spend on an unreadable fixture.',
      },
      {
        question: 'Is minified JSON faster to parse?',
        answer:
          'Marginally, because the parser skips fewer characters, but the difference is dwarfed by allocation for large documents. If parse time is your bottleneck, the fix is a smaller payload or a different encoding, not fewer spaces.',
      },
      {
        question: 'Why is my minified file still large?',
        answer:
          'Because the size was data, not formatting. Check the whitespace share in the report: a document that shrinks 5 percent had almost no indentation to remove, and the next step is dropping fields or paginating.',
      },
      {
        question: 'Can it un-minify as well?',
        answer:
          'That is the [JSON formatter](/json-tools/formatter/), in the same column. Both directions operate on the same syntax tree, which is why a format-then-minify round trip is byte-identical to the original minified form.',
      },
      {
        question: 'How do I know minification left the data alone?',
        answer:
          'The output is re-parsed and compared member by member against the tree built from the input, so equality is proved on the value rather than assumed from the character count — and the number literals that survive are the characters you typed, not a double-precision approximation. The panel shows bytes before and after plus a gzip comparison of both, because whitespace removal is where the win is and re-encoding is where it usually is not.',
      },
    ],
    specs: [
      {
        label: 'RFC 8259 §2 — Whitespace',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-2',
        detail: 'Defines exactly which characters may be removed: space, tab, line feed and carriage return.',
      },
      {
        label: 'RFC 8259 §8.1 — Parsing security considerations',
        href: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
        detail: 'Why duplicate names and precision loss must be preserved by a rewriter instead of normalised away.',
      },
      {
        label: 'RFC 9110 §8.4 — Content coding',
        href: 'https://datatracker.ietf.org/doc/html/rfc9110#section-8.4',
        detail: 'How gzip and the `Content-Encoding` header interact with a minified body.',
      },
    ],
    guides: [
      { path: '/json-tools/formatter/', name: 'JSON Formatter', blurb: 'The inverse operation, on the same tree.' },
      { path: '/use-cases/test-data/', name: 'Test data tools', blurb: 'Committing fixtures small enough to read.' },
      { path: '/learn/json/', name: 'JSON complete guide', blurb: 'What insignificant whitespace actually means.' },
    ],
  },

  'csv-to-json': {
    categoryName: 'Format converters',
    schemaCategory: 'Converter',
    intro:
      'A CSV reader that follows RFC 4180 rather than `split(",")`: quoted fields, embedded commas, newlines inside cells, doubled quotes, CRLF, BOM and a delimiter it works out from your data instead of assuming.',
    whatItDoesHeading: 'Parsing is a state machine, and typing is a decision',
    whatItDoes: [
      'RFC 4180 defines a CSV file as records of fields separated by commas, with an optional header row, fields that may be quoted, and quotes inside a quoted field escaped by doubling. Because a quoted field may contain a comma *and* a line break, no implementation that splits on newlines and then on commas is correct. This tool is a single-pass state machine over characters, which is why a cell containing `"Revenue, net\\r\\n2025"` arrives as one value.',
      'The delimiter is inferred by counting consistent occurrences of comma, tab, semicolon and pipe across the first records, and the reason it chose one is printed — so a semicolon file exported from a European locale is not silently converted into one enormous column.',
      'Turning text into typed JSON is where corruption happens, so it is explicit and auditable. Each column gets a reported inferred type, example values, a null count and a `mixed` flag when the column refuses to be one thing. Numbers above 2^53 − 1 are kept as strings regardless of the mode, because a JSON number that overflows a double is a data-loss event.',
    ],
    featuresHeading: 'Conversion controls and diagnostics',
    features: [
      'Automatic delimiter detection with the reason reported',
      'RFC 4180 double-quote escaping and a backslash alternative',
      'Header row on or off, with generated keys when off',
      'Array-of-objects, array-of-arrays or object-of-arrays output',
      'Type inference off, safe or aggressive',
      'Empty versus null controlled by an explicit null-token list',
      'Ragged row, duplicate header and blank header reporting',
      'Precision-loss guard for identifiers above 2^53 − 1',
      'Spreadsheet damage audit listing risky cells and the fix',
      'Row and column counts, plus a downloadable .json result',
    ],
    howHeading: 'How to convert CSV to JSON',
    howIntro: 'The order matters: look at the parse report before you look at the JSON.',
    steps: [
      { title: 'Drop the CSV file or paste its text', body: 'Drag a .csv or .tsv onto the input pane. Files opened in Excel and saved as CSV-US-ASCII frequently carry Windows-1252 bytes; the panel warns when high-bit characters appear without a UTF-8 BOM.' },
      { title: 'Confirm the delimiter and header settings', body: 'The detected delimiter is printed with its evidence. Override it only when your file legitimately looks ambiguous, such as a single-column export.' },
      { title: 'Choose how conservative typing should be', body: 'Safe mode types only unambiguous integers, floats and booleans and leaves anything that could be an identifier alone. Aggressive mode also converts date-like and leading-zero strings, which is exactly where zip codes go wrong.' },
      { title: 'Read the issues before downloading', body: 'Ragged rows, duplicate headers, cells that overflow the safe integer range and formula-looking values are each listed with row and column so the fix is in the source, not in the JSON.' },
    ],
    table: {
      heading: 'Type inference, mode by mode',
      caption: 'What each inference setting does to the same set of cell values.',
      head: ['Cell', 'None', 'Safe', 'Aggressive'],
      rows: [
        ['`42`', '`"42"`', '`42`', '`42`'],
        ['`0042`', '`"0042"`', '`"0042"`', '`42` — leading zeros lost'],
        ['`9007199254740993`', '`"9007199254740993"`', '`"9007199254740993"`', '`"9007199254740993"` — guard holds'],
        ['`N`', '`"N"`', '`"N"`', '`"N"`'],
        ['`2025-01-07`', '`"2025-01-07"`', '`"2025-01-07"`', '`"2025-01-07"` — never a bare number'],
        ['empty', '`""`', '`null`', '`null`'],
      ],
      foot: 'Aggressive mode is offered for machine-generated files with a known schema; for anything a human edited, Safe is the setting that keeps your identifiers intact.',
    },
    privacyNote:
      'The file is read with `FileReader` inside this tab and never sent anywhere. That is the property that makes it usable on exports containing personal data or customer identifiers.',
    faqs: [
      {
        question: 'Can I just split the file on commas?',
        answer:
          'No. RFC 4180 §2 permits a quoted field to contain commas and line breaks, so both the line split and the field split can be wrong. The only correct approach is a character state machine that tracks whether it is inside quotes; see the [CSV guide](/learn/csv/) for the two-stage grammar.',
      },
      {
        question: 'Why did my zip code lose its leading zero?',
        answer:
          'Something between you and the JSON converted the column to a number — usually Excel on open, or an inferring parser. Keep type inference on Safe and the value arrives as a string; the issues list flags columns where leading zeros appear at all.',
      },
      {
        question: 'What delimiter does it detect automatically?',
        answer:
          'Comma, tab, semicolon or pipe, chosen by which one splits every sampled record into the same field count most consistently. The reason string tells you the winner and the runner-up, so a wrong guess is visible rather than silent.',
      },
      {
        question: 'How do I get an array of arrays instead of objects?',
        answer:
          'Set the output shape to array-of-arrays, which keeps column order and emits no keys — useful for database `COPY` and `INSERT` statements. Object-of-arrays is the column-oriented shape that analytics tools prefer.',
      },
      {
        question: 'Does it handle huge CSV files?',
        answer:
          'Up to what your tab can hold: several hundred megabytes on a typical laptop. Above that the browser is the wrong tool and you want a streaming reader — Go `encoding/csv`, Python `csv` with an iterator, DuckDB `read_csv`, or `csvtk`.',
      },
      {
        question: 'What is the spreadsheet damage audit?',
        answer:
          'A pass over the parsed model that reports cells a spreadsheet application is likely to reinterpret: long numerics, values that look like formulas, strings resembling dates, and gene-symbol-style tokens. Each row names the risk and the fix, and it is the same check the [JSON to CSV](/format-converters/json-to-csv/) direction applies on the way out.',
      },
      {
        question: 'Why does the converter explain its delimiter and typing decisions?',
        answer:
          'Because neither is something the file can confirm. Candidate delimiters are scored on header and row consistency and the winner is named with a field-count histogram, so a wrong sniff is visible instead of silent — RFC 4180 only says commas, tabs and semicolons are common, and Excel localises the separator to ";" where the decimal mark is a comma. Every coerced column is listed with the rule applied and how many values satisfied or failed it, and integer strings longer than 15 digits or carrying a leading zero stay strings unless you override that.',
      },
    ],
    specs: [
      {
        label: 'RFC 4180 §2 — Syntax',
        href: 'https://datatracker.ietf.org/doc/html/rfc4180#section-2',
        detail: 'The seven field, record and quoting rules this parser implements.',
      },
      {
        label: 'RFC 4180 §3 — MIME media type',
        href: 'https://datatracker.ietf.org/doc/html/rfc4180#section-3',
        detail: 'text/csv registration and the charset guidance behind the encoding warnings.',
      },
      {
        label: 'RFC 3629 — UTF-8',
        href: 'https://datatracker.ietf.org/doc/html/rfc3629',
        detail: 'Why a BOM is allowed at the start of a UTF-8 file and must be stripped before the first header cell.',
      },
      {
        label: 'OWASP — CSV injection',
        href: 'https://owasp.org/www-community/attacks/CSV_Injection',
        detail: 'The formula-leading characters the audit reports on exported and imported files alike.',
      },
    ],
    guides: [
      { path: '/format-converters/json-to-csv/', name: 'JSON to CSV', blurb: 'The other direction, with flattening choices.' },
      { path: '/learn/csv/', name: 'CSV complete guide', blurb: 'Quoting rules, delimiters and the Excel problem.' },
      { path: '/use-cases/data-migration/', name: 'Data migration tools', blurb: 'Column typing decisions before a load, not after.' },
    ],
  },

  'json-to-csv': {
    categoryName: 'Format converters',
    schemaCategory: 'Converter',
    intro:
      'Flatten an array of objects — or a nested API response — into a rectangular file with a column set you can defend, quoting that satisfies RFC 4180, and a warning list for everything a spreadsheet will do to it afterwards.',
    whatItDoesHeading: 'Every flattening decision is a column you have to explain',
    whatItDoes: [
      'JSON is a tree; CSV is a grid, and there is no single correct projection between them. This tool makes the projection explicit. It accepts an array of objects, an array of arrays, a dictionary whose values are objects, or a single object, and reports the shape it detected before it commits to columns.',
      'Nested objects become composite columns — `address.city`, `address_city` or `address[city]` — to a depth you set, and arrays are handled three ways: indexed columns, joined with a separator, or JSON-encoded into one cell. There is no universally right choice, so the tool states which one it took and how many cells were affected.',
      'Ragged records are unioned rather than truncated: a key present in only one record still gets a column, and the count of records missing it is reported. On the way out, quoting is applied per RFC 4180 §2.6 — any field containing the delimiter, a quote or a line break is quoted, and internal quotes are doubled — plus the leading whitespace and formula-lookalike cases that a strict reading of the RFC leaves ambiguous.',
    ],
    featuresHeading: 'Flattening, ordering and safety controls',
    features: [
      'Array, dictionary and single-object roots detected automatically',
      'Dot, underscore, bracket or flattened column naming',
      'Configurable depth with a report of paths beyond it',
      'Array columns indexed, joined or JSON-encoded',
      'Column order first-seen, alphabetical or deepest-first',
      'Ragged key union with missing-value counts',
      'RFC 4180 quoting, minimal or quote-everything',
      'Optional UTF-8 BOM so Excel opens the file as Unicode',
      'LF or CRLF line endings per RFC 4180 §2.1',
      'Spreadsheet loss audit with per-cell fixes',
    ],
    howHeading: 'How to convert JSON to CSV',
    howIntro: 'Start from the shape report, because that is what determines the columns.',
    steps: [
      { title: 'Paste the JSON', body: 'The most common input is an array of objects from an API page. If your payload wraps records in a field such as `data.items`, extract that array first with the [JSON formatter](/json-tools/formatter/) outline, then paste it here.' },
      { title: 'Set the flattening depth and array style', body: 'Depth 1 keeps one level of nesting as columns; deeper flattening produces wide files. Joining arrays with a separator is readable; JSON-encoding them is lossless and round-trips back.' },
      { title: 'Decide quoting and BOM for your audience', body: 'Quote-everything is the safest for a file a human will open in Excel. The BOM is what stops a UTF-8 file full of accented names rendering as mojibake on Windows.' },
      { title: 'Check the loss audit before you send it', body: 'Values above 15 significant digits, date-like strings and formula-leading tokens are listed with the column and row. Those are the cells a spreadsheet will silently rewrite.' },
    ],
    table: {
      heading: 'What happens to each JSON value shape',
      caption: 'The default projection for every value type, and the alternative if the default does not suit.',
      head: ['JSON value', 'Default CSV cell', 'Alternative'],
      rows: [
        ['`"text"`', 'text', 'Quote-everything mode wraps it in double quotes.'],
        ['`42`', '42', 'Keep as text with a leading apostrophe when a consumer must not retype it.'],
        ['`null`', 'empty cell', 'A literal `NULL` token for database loads.'],
        ['`["a","b"]`', 'a,b', 'Indexed columns `tags.0`, `tags.1`, or JSON in one cell.'],
        ['`{"city":"Oslo"}`', 'address.city column', 'JSON-encoded single cell when the shape is unstable.'],
        ['`9007199254740993`', '9007199254740993', 'Reported as spreadsheet risk: Excel will store 9007199254740990.'],
      ],
      foot: 'The audit row for the last case is the reason this tool prints fixes rather than only warnings: the loss happens in the application that opens the file, not in the conversion.',
    },
    privacyNote: 'Conversion and auditing are entirely local, so a production export containing identifiers can be shaped here without an upload step.',
    faqs: [
      {
        question: 'How do I flatten nested JSON to CSV?',
        answer:
          'Set the flattening depth to cover the levels you want as columns and choose a separator — `address.city` reads well in a header row, an underscore style survives tools that treat dots as path syntax. Anything deeper than the limit is reported instead of silently dropped.',
      },
      {
        question: 'Why are my columns in a strange order?',
        answer:
          'By default columns appear in first-seen order, which follows your data rather than alphabet. Records that omit a key still contribute to the union, so a column can exist with mostly empty cells; that is reported as a missing count.',
      },
      {
        question: 'Can it handle an array of arrays?',
        answer:
          'Yes — a header row is synthesised as `column_1…column_n` unless you supply keys, and the shape report says so. Array-of-arrays input is common from spreadsheet copies and database exports.',
      },
      {
        question: 'Why does the CSV need a BOM for Excel?',
        answer:
          'Without one, Excel on Windows guesses the code page and non-ASCII characters break. The BOM is not part of RFC 4180, and strict parsers must strip it, which is why it is an option rather than the default.',
      },
      {
        question: 'Will opening the CSV in Excel corrupt my data?',
        answer:
          'Potentially, and the audit tells you which cells. The documented behaviours are a 15-significant-digit ceiling, scientific-notation conversion, date reinterpretation of strings like `2024-1-5`, and formula execution for values starting with `=`, `+`, `-` or `@` — see [CSV vs Excel](/compare/csv-vs-excel/).',
      },
      {
        question: 'Can I get the JSON back out of the CSV?',
        answer:
          'Round-trip is exact for JSON-encoded array cells and lossy for joined ones, because a separator inside a value becomes indistinguishable. The [CSV to JSON converter](/format-converters/csv-to-json/) reports column typing so you can see what survived.',
      },
      {
        question: 'What happens to the structures CSV cannot hold?',
        answer:
          'Nothing is dropped quietly. Nested objects become one column per leaf path, with the separator style under your control; arrays are either JSON-encoded into the cell, joined with a delimiter, or expanded by index, and the report counts which strategy each cell got. Ragged records contribute a union of every key rather than vanishing, with the sparse-row count stated, and the Excel audit then lists the cells a spreadsheet is likely to reinterpret — long numerics, formula-looking strings, date-shaped text — before you open the download.',
      },
    ],
    specs: [
      {
        label: 'RFC 4180 §2 — General format',
        href: 'https://datatracker.ietf.org/doc/html/rfc4180#section-2',
        detail: 'Record, field, quoting and header rules the writer implements, including the CRLF default.',
      },
      {
        label: 'RFC 4180 §2.7 — Fields with quotes',
        href: 'https://datatracker.ietf.org/doc/html/rfc4180#section-2',
        detail: 'A quote inside a field is represented as two consecutive quotes; the escaping the writer applies.',
      },
      {
        label: 'Microsoft — Excel specification limits',
        href: 'https://learn.microsoft.com/en-us/office/troubleshoot/excel/lines-columns-a-worksheet',
        detail: 'The 1,048,576 row and 16,384 column ceilings and the 15-digit precision behaviour quoted in the audit.',
      },
    ],
    guides: [
      { path: '/format-converters/csv-to-json/', name: 'CSV to JSON', blurb: 'The reverse projection.' },
      { path: '/compare/csv-vs-excel/', name: 'CSV vs Excel', blurb: 'Exactly what double-clicking does to a file.' },
      { path: '/use-cases/data-migration/', name: 'Data migration tools', blurb: 'Reconciling rows before and after a load.' },
    ],
  },

  'json-to-yaml': {
    categoryName: 'Format converters',
    schemaCategory: 'Converter',
    intro:
      'Emit block-style YAML that a YAML 1.2 reader parses back to the same value — and, more importantly, that a YAML 1.1 reader does not misread as booleans, versions or sexagesimal numbers.',
    whatItDoesHeading: 'Safe output means quoting things a human would not suspect',
    whatItDoes: [
      'JSON has strings and numbers; YAML decides what a bare scalar is. `NO` is a boolean in YAML 1.1 and a string in 1.2, `1.10` is a float that prints as `1.1`, `017` is octal under one spec and a string under another, and `12:30` was sexagesimal 750 in YAML 1.1. Emitting a bare scalar for any of those is how a country code becomes `false` in a Kubernetes manifest.',
      'This writer tests every string against the resolver tables from both spec editions and quotes the ones where they disagree, then reports each protected value so you can see the decision. Multi-line strings become block scalars with an explicit chomping indicator rather than a quoted string full of `\\n`, which keeps a chart template or a README readable in review.',
      'Output is valid YAML 1.2 and deliberately unexciting: no anchors, no custom tags, no flow style except where a value is genuinely a flow collection, because configuration that needs cleverness is configuration that fails in a pipeline.',
    ],
    featuresHeading: 'What the YAML writer controls',
    features: [
      'Block style with 2, 3 or 4 space indentation',
      'YAML 1.1 and 1.2 safe scalar quoting decisions',
      'Block scalars for values containing newlines',
      'Explicit null representation: `null`, `~` or empty',
      'Numbers emitted so no reader retypes them',
      'Optional alphabetical key sorting for diff stability',
      'Document start marker and header comment for manifests',
      'LF or CRLF line endings',
      'Report of every value it chose to quote and why',
      'Round-trip check against the parsed JSON input',
    ],
    howHeading: 'How to convert JSON to YAML',
    howIntro: 'One decision — indentation — and then read the protection report.',
    steps: [
      { title: 'Paste the JSON', body: 'A manifest, a values file or an API response all work. If the input will not parse, fix it with the [JSON validator](/json-tools/validator/) first; this tool will not guess at malformed input.' },
      { title: 'Choose indentation to match the target project', body: 'Two spaces is the Kubernetes and Docker Compose convention. Three or four is legal YAML but produces longer diffs and trips linters configured for the ecosystem default.' },
      { title: 'Decide the null style', body: '`null` is unambiguous in every reader. `~` is idiomatic but invisible in a scan; the empty form is the one that creates accidental nulls when someone deletes a value and leaves the key.' },
      { title: 'Review the protected values list', body: 'Anything quoted that you would have expected bare was quoted deliberately: it is a value a YAML 1.1 parser — including older PyYAML and some Go libraries — would have retyped.' },
    ],
    table: {
      heading: 'Scalars the writer quotes rather than emit bare',
      caption: 'JSON string values, and what each would become if written without quotes.',
      head: ['Value', 'Bare output', 'Under YAML 1.1', 'Under YAML 1.2 core'],
      rows: [
        ['`"NO"`', 'NO', 'boolean false', 'string'],
        ['`"on"`', 'on', 'boolean true', 'string'],
        ['`"1.10"`', '1.10', 'float 1.1', 'float 1.1'],
        ['`"017"`', '017', 'integer 15 (octal)', 'string'],
        ['`"12:30"`', '12:30', 'integer 750', 'string'],
        ['`"2025-01-07"`', '2025-01-07', 'timestamp', 'timestamp'],
        ['`"y"`', 'y', 'boolean true', 'string'],
        ['`"~"`', '~', 'null', 'string'],
      ],
      foot: 'Quoting costs three characters. Each of these rows has been an outage in someone’s pipeline; the default is to quote all of them.',
    },
    privacyNote: 'The conversion runs in your tab, so a private Helm values file or a manifest containing secrets is never transmitted.',
    faqs: [
      {
        question: 'Why are my strings quoted in the YAML output?',
        answer:
          'Because bare scalars are typed by the reader, not the writer. The table above shows the cases: `NO`, `on`, `1.10`, `017`, `12:30` and date-like strings all resolve to something other than a string in at least one widely deployed parser. Quoting is the only portable spelling.',
      },
      {
        question: 'Does the output keep JSON comments?',
        answer:
          'No — JSON has no comments (see [RFC 8259 §3](https://datatracker.ietf.org/doc/html/rfc8259)), so a document with them is JSON5 or a config dialect and must be repaired first. YAML comments, going the other way, are destroyed by conversion because the data model has nowhere to put them.',
      },
      {
        question: 'Can it produce Kubernetes-ready manifests?',
        answer:
          'It produces the YAML that a `data` block converts to, with a document marker and two-space indentation as options. Field ordering, `apiVersion` correctness and schema validation remain yours — run `kubectl --dry-run=server -f` or kubeconform against the result.',
      },
      {
        question: 'What happens to very long strings?',
        answer:
          'Values containing newlines become block scalars with an explicit chomping indicator, which keeps a script or template readable. Long single-line values are not wrapped, because folding a scalar at a column width can alter trailing spaces inside the value.',
      },
      {
        question: 'Does YAML support the full JSON range?',
        answer:
          'The JSON schema of YAML 1.2 does, by design — JSON is a subset of YAML 1.2 (§6 of the spec, "JSON: YAML\'s Second Data Format"). What does not survive is `NaN` and `Infinity`, which are valid YAML floats but not JSON numbers, and those are reported as unrepresentable.',
      },
      {
        question: 'Should config be YAML or JSON?',
        answer:
          'Depends on who reads it. See [YAML vs JSON](/compare/yaml-vs-json/) for the failure modes each format produces in review, and [YAML vs TOML](/compare/yaml-vs-toml/) if the reason you are asking is indentation.',
      },
      {
        question: 'Why trust this emitter with a manifest that has to deploy?',
        answer:
          'Because it treats an unquoted value as a decision rather than a default. Anything a YAML 1.1 reader could retype — `NO`, `on`, `Off`, `~`, `1.10`, a sexagesimal look-alike, a date-shaped string — comes out quoted; non-finite numbers are reported as having no number form in the core schema instead of silently becoming `null`; multi-line text becomes a block scalar rather than one escaped line; and indentation is consistent spaces, which is the one thing YAML never forgives.',
      },
    ],
    specs: [
      {
        label: 'YAML 1.2.2 §6 — JSON: YAML’s second data format',
        href: 'https://yaml.org/spec/1.2.2/#6-json-yamls-second-data-format',
        detail: 'The subset relationship that makes JSON valid YAML input, and the clause this writer stays inside.',
      },
      {
        label: 'YAML 1.2.2 §10.2.1 — Resolved scalar tags',
        href: 'https://yaml.org/spec/1.2.2/#1021-plain-characters',
        detail: 'The core schema resolution table behind the quoting decisions and the protected-values report.',
      },
      {
        label: 'YAML 1.1 §5.3 — Character set and indentation',
        href: 'https://yaml.org/spec/1.1/',
        detail: 'Where the boolean and sexagesimal behaviours come from; still implemented by older parsers in circulation.',
      },
    ],
    guides: [
      { path: '/format-converters/yaml-to-json/', name: 'YAML to JSON', blurb: 'The reverse direction, with coercion reporting.' },
      { path: '/learn/yaml/', name: 'YAML complete guide', blurb: 'Implicit typing, anchors and the Norway problem.' },
      { path: '/use-cases/config-conversion/', name: 'Config conversion tools', blurb: 'Moving manifests between formats without surprises.' },
    ],
  },

  'yaml-to-json': {
    categoryName: 'Format converters',
    schemaCategory: 'Converter',
    intro:
      'Parse YAML 1.2 into JSON with the error position when it fails and, when it succeeds, a report of every scalar whose type is version-dependent or that a numeric round trip rewrites — the mechanism behind most YAML production incidents.',
    whatItDoesHeading: 'Conversion plus a disclosure of what the parser decided',
    whatItDoes: [
      'A YAML document is not a value; it is a set of instructions for producing one. Plain scalars are resolved against a schema, indentation carries structure, and anchors let one node appear in several places. Two readers on the same file can legitimately disagree, so this tool parses with YAML 1.2 rules and then lists the scalars whose resolution differs under YAML 1.1 — the values that will change meaning when an older library in the pipeline touches them.',
      'Errors are positional. Tab indentation, a mapping value that is not a mapping, an inconsistent indentation level, an unresolved alias, a duplicate key, and a document that is actually several documents separated by `---` each get a line and column with an explanation of the rule violated.',
      'Structure is preserved on the way out: sequences stay sequences, nested maps stay nested maps, and block scalars become strings with their newlines intact. Anchors and aliases are expanded into repeated values, because JSON has no aliasing; the report says how many were expanded, since an anchor used for a merge key is a design decision someone should see in review.',
    ],
    featuresHeading: 'What the YAML parser reports',
    features: [
      'YAML 1.2 core schema resolution with 1.1 divergence flags',
      'Errors with line, column and the violated rule',
      'Tab-indentation and inconsistent-indentation detection',
      'Duplicate key reporting with both positions',
      'Multiple document (`---`) recognition and count',
      'Anchor, alias and merge key counts after expansion',
      'Block scalar and flow collection statistics',
      'Tag (`!!str`, `!!int`) occurrences listed',
      'JSON output with configurable indentation',
      'Structural summary of the resulting document',
    ],
    howHeading: 'How to convert YAML to JSON',
    howIntro: 'Paste, read the coercion list, then use the JSON output where JSON is required.',
    steps: [
      { title: 'Paste the YAML', body: 'Manifests, workflows and compose files all work. If the file references external resources, only the local document is parsed — no fetches are performed.' },
      { title: 'Fix positional errors first', body: 'Tab characters in an indentation column are the single most common failure; the error names the line and explains that YAML indentation must be spaces.' },
      { title: 'Read the implicit-typing table', body: 'Each row is a plain scalar, what it resolved to, what a YAML 1.1 reader would produce, and the risk level. High rows are the ones that change a string into a boolean or a number.' },
      { title: 'Copy the JSON', body: 'Use it in a pipeline step that expects JSON input, or continue to the [JSON formatter](/json-tools/formatter/) to re-indent. Anchors are already expanded, so the JSON stands alone.' },
    ],
    table: {
      heading: 'The divergences that matter',
      caption: 'Values parsed differently by YAML 1.1 and YAML 1.2 readers, as reported by the coercion list.',
      head: ['Input', '1.2 core resolves to', '1.1 resolves to', 'Why it hurts'],
      rows: [
        ['`NO`', 'string "NO"', 'boolean false', 'Country code, answer column or flag becomes a boolean.'],
        ['`off`', 'string "off"', 'boolean false', 'A setting value that reads as false in one library and text in another.'],
        ['`1.10`', 'float 1.1', 'float 1.1', 'A version string that loses its trailing digit in every reader.'],
        ['`017`', 'string "017"', 'integer 15', 'Permissions and identifiers silently become numbers.'],
        ['`12:30`', 'string "12:30"', 'integer 750', 'Times and durations reinterpreted as integers.'],
        ['`2025-01-07`', 'timestamp', 'timestamp', 'Date becomes an object in some libraries, a string in others.'],
        ['`y`', 'string "y"', 'boolean true', 'Single-letter column values invert under 1.1.'],
      ],
      foot: 'The fix in every row is the same on the way out: quote the value, or convert to JSON where a string is unambiguous — see the [YAML guide](/learn/yaml/).',
    },
    privacyNote: 'Parsing is performed in this tab. Configuration files containing credentials or internal hostnames are never sent to a server.',
    faqs: [
      {
        question: 'Does it parse YAML 1.1 or 1.2?',
        answer:
          '1.2 core schema, with a report of where a 1.1 reader would resolve a scalar differently. That report is the useful part: the version your toolchain uses is often invisible, and the divergence list shows exactly which values are at risk.',
      },
      {
        question: 'What is the Norway problem?',
        answer:
          'Under YAML 1.1 the plain scalar `NO` — the ISO country code for Norway — resolves to boolean false, so a list of country codes silently becomes a list of booleans. It is a name people use for the whole class of implicit-typing surprises; quoting is the cure.',
      },
      {
        question: 'Why is my YAML rejected because of tabs?',
        answer:
          'YAML forbids tab characters in the indentation column (spec 1.2 §6.1), because tab width is not defined by the format. Tabs inside a scalar value are fine; the parser tells you which line has the offending indentation.',
      },
      {
        question: 'What happens to anchors and merge keys?',
        answer:
          'They are expanded into the values they refer to, since JSON has no reference mechanism. The parser reports how many anchors, aliases and merge keys were present, so you can see that the JSON is a copy rather than a shared node.',
      },
      {
        question: 'Can it handle multi-document YAML?',
        answer:
          'It detects `---` separators and reports the document count. JSON has no multi-document container, so the output is an array of documents with the count stated — which is also what a Kubernetes apply expects when a file holds several manifests.',
      },
      {
        question: 'Is YAML safe to parse from an untrusted source?',
        answer:
          'Only with a schema-limited parser. Historical deserialisation vulnerabilities in YAML libraries come from language-specific tags that construct objects — PyYAML’s `yaml.load` with its default loader is the standard example. Restrict to a safe or load API, which is why this tool only ever resolves to plain JSON values.',
      },
      {
        question: 'What does this report that a one-line parse call does not?',
        answer:
          'A failure arrives with a line, a column and the rule that was broken — tab indentation quoted to §6.1 and §8.4, an inconsistent sequence column, an unresolved alias, a duplicate key — rather than a truncated library message. On success it still reports: which plain scalars resolve differently under YAML 1.1 than under 1.2, how many anchors were expanded because JSON has no aliasing, and whether the file was really several documents behind `---` separators.',
      },
    ],
    specs: [
      {
        label: 'YAML 1.2.2 §6.1 — Whitespace and indentation',
        href: 'https://yaml.org/spec/1.2.2/#61-characters',
        detail: 'The rule that tab indentation is invalid and the basis of the most common parse error.',
      },
      {
        label: 'YAML 1.2.2 §10.3.2 — Resolving plain scalars',
        href: 'https://yaml.org/spec/1.2.2/#1032-differing-node-types',
        detail: 'The core-schema resolution table the coercion report is computed from.',
      },
      {
        label: 'YAML 1.2.2 §3.2 — Anchors and aliases',
        href: 'https://yaml.org/spec/1.2.2/#322-nodes-edges-and-paths',
        detail: 'How `&` and `*` share a node, and why expansion into JSON necessarily duplicates it.',
      },
    ],
    guides: [
      { path: '/format-converters/json-to-yaml/', name: 'JSON to YAML', blurb: 'Write safe YAML from JSON data.' },
      { path: '/learn/yaml/', name: 'YAML complete guide', blurb: 'Implicit typing, block scalars and the two spec editions.' },
      { path: '/compare/yaml-vs-json/', name: 'YAML vs JSON', blurb: 'Which format fails loudly in review.' },
    ],
  },

  base64: {
    categoryName: 'Encoders and decoders',
    schemaCategory: 'Encoder',
    intro:
      'RFC 4648 Base64 in standard, URL-safe and MIME framings, with a decoder that identifies what it decoded: a PNG, a JWT, a data URI, a PEM certificate, or text — plus the non-canonical encodings that break equality checks.',
    whatItDoesHeading: 'Three bytes become four characters, and the remainder is where bugs live',
    whatItDoes: [
      'Base64 maps each group of three input bytes to four characters drawn from a 64-character alphabet, six bits per character. When the input is not a multiple of three, one or two `=` characters pad the output. That padding is a length signal, not data, and it is the source of most of the pain: base64url, defined in RFC 4648 §5 and used by JWTs, swaps `+` and `/` for `-` and `_` and normally omits padding entirely.',
      'The encoder handles UTF-8 text correctly — the common failure with `atob` and `btoa` is that they operate on Latin-1 code units, so an accented character either throws or produces bytes that no longer decode to the original. Encoding goes through `TextEncoder`, so emoji and non-Latin scripts survive the round trip, and a hex input mode is offered for byte-exact work.',
      'The decoder does more than produce text. It reports the variant it accepted, whether the trailing bits were canonical, the decoded size and the size overhead, sniffs magic bytes to name the actual file type, splits a JWT into header, payload and claims with their registered names, unwraps a `data:` URI, recognises PEM armour and shows a hex dump of the first bytes so you can see what you are dealing with.',
    ],
    featuresHeading: 'Encoder and decoder capabilities',
    features: [
      'Standard and URL-safe alphabets with padding control',
      'MIME line wrapping at 64 or 76 characters with CRLF',
      'UTF-8, Latin-1 and hex input modes',
      'Exact size overhead and character-count reporting',
      'Canonical trailing-bit validation on decode',
      'Automatic standard versus base64url detection',
      'Magic-byte identification of PNG, JPEG, GIF, ZIP, PDF and more',
      'JWT header, payload and signature inspection with claim labels',
      'data: URI and PEM block recognition',
      'Hex dump preview and verified encode-decode round trip',
    ],
    howHeading: 'How to encode and decode Base64',
    howIntro: 'Two tabs, one tool: encode for the alphabet you are targeting, decode to find out what you were handed.',
    steps: [
      { title: 'Choose the tab: encode or decode', body: 'The tab is mirrored into the URL, so /encoders-decoders/base64/#decode opens directly on decoding and can be shared as a link.' },
      { title: 'Pick the alphabet and padding', body: 'Standard for MIME, email and data URIs; URL-safe for query parameters, path segments and JWT segments, where `+` and `/` must not appear. Padding is required for the standard alphabet and conventionally absent for base64url.' },
      { title: 'Paste the text or the encoded string', body: 'Files can be dropped onto the input pane; a file is read locally and encoded from its bytes, so binary content works without a text round trip.' },
      { title: 'Read the inspection panel', body: 'For a decoded value, the panel states what it found: image or archive type, JWT claims, data URI media type, PEM label, whether it is text, and whether re-encoding reproduces the input byte for byte.' },
    ],
    table: {
      heading: 'The variants, in one table',
      caption: 'Alphabets, padding and line handling for each Base64 flavour named in the options.',
      head: ['Variant', 'Alphabet tail', 'Padding', 'Line rules', 'Where you meet it'],
      rows: [
        ['Standard (RFC 4648 §4)', '`+` and `/`', 'Required `=`', 'Unfolded by default', 'JSON fields, data URIs, email attachments.'],
        ['base64url (§5)', '`-` and `_`', 'Usually omitted', 'Never wrapped', 'JWT segments, URL parameters, Content-ID strings.'],
        ['MIME (§3.5)', '`+` and `/`', 'Required', 'Wrapped at 76 with CRLF', 'PEM armour, multipart bodies.'],
        ['PEM', 'standard', 'Required', 'Wrapped at 64', 'Certificates and keys between BEGIN and END lines.'],
      ],
      foot: 'A string that decodes successfully in one variant can fail or produce different bytes in another, which is why the decoder reports the variant it settled on rather than accepting anything that looks like base64.',
    },
    privacyNote:
      'Tokens, keys and certificates are decoded in your browser tab and never transmitted. This matters most here: Base64 tooling on other sites is often a convenient way to ship a credential to somebody else’s logs.',
    faqs: [
      {
        question: 'Is Base64 encoding encryption?',
        answer:
          'No, and treating it as such is a recurring security mistake. Base64 is a reversible binary-to-text encoding with no key: any decoder, including this one, recovers the original bytes. It exists to move bytes through a channel that can only carry text. For confidentiality you need an actual cipher — see the [Base64 guide](/learn/base64/).',
      },
      {
        question: 'Why does my JWT have no = signs?',
        answer:
          'JWTs use base64url (RFC 7515 §2), which replaces `+` with `-` and `/` with `_` and strips padding, because the segments appear inside a URL-safe compact serialisation. Adding padding back changes the signature input, so never re-pad a segment before verifying.',
      },
      {
        question: 'Why does btoa() throw on my text?',
        answer:
          'Because `btoa` and `atob` accept only code points in the Latin-1 range, and characters above U+00FF raise `InvalidCharacterError`. The portable route is `TextEncoder` to bytes, then base64, which is what this tool does — no try/catch gymnastics required.',
      },
      {
        question: 'What is a non-canonical encoding?',
        answer:
          'When the final partial group has leftover bits that are not zero, several different inputs map to the same output. `Zm9` and `Zm5` both decode toward the same truncated byte pattern. If a system compares decoded values after re-encoding, two different secrets can appear equal; the decoder flags this explicitly.',
      },
      {
        question: 'How much bigger is Base64 than the original?',
        answer:
          'Always four characters per three bytes, so 33.3 percent overhead before padding, which adds up to two more characters. The panel reports the exact figure for your input, including where line wrapping adds further bytes.',
      },
      {
        question: 'Can I decode a binary file, like an image?',
        answer:
          'Yes. The decoder identifies the type from magic bytes and shows a hex dump, but it will not render the binary as text. If you need the file itself, a data URI can be opened directly, and the panel says when the payload is a data URI.',
      },
      {
        question: 'What does this tell me that atob() does not?',
        answer:
          'It chooses the alphabet from the characters present, so a base64url value containing "-" or "_" is decoded instead of throwing; unpacks the three JWS segments and prints header and claims; recognises a `data:` URI or a PEM block and names the payload from its magic bytes; applies the canonical trailing-bit rule from RFC 4648 §3.5 that most decoders skip; and separates the MIME conveniences — line wrapping, CRLF, ignored non-alphabet characters — from the encoding itself. That last point is the security-relevant one: two texts can decode to the same bytes, so a filter that inspects the decoded value is not looking at what a strict decoder will accept.',
      },
    ],
    specs: [
      {
        label: 'RFC 4648 §4 — Standard alphabet',
        href: 'https://datatracker.ietf.org/doc/html/rfc4648#section-4',
        detail: 'The 64-character table, padding rule and the statement that the encoding adds four characters per three bytes.',
      },
      {
        label: 'RFC 4648 §5 — Filename- and URL-safe alphabet',
        href: 'https://datatracker.ietf.org/doc/html/rfc4648#section-5',
        detail: 'The `-` and `_` substitution used by base64url and every JWT segment.',
      },
      {
        label: 'RFC 4648 §3.5 — Canonical encoding',
        href: 'https://datatracker.ietf.org/doc/html/rfc4648#section-3.5',
        detail: 'Why pad bits left non-zero produce several encodings for one payload, and what a decoder may reject for it.',
      },
      {
        label: 'RFC 2045 §6.8 — MIME base64',
        href: 'https://datatracker.ietf.org/doc/html/rfc2045#section-6.8',
        detail: 'MIME’s 76-character and PEM’s 64-character wrapping conventions with CRLF, and the rule that out-of-alphabet characters are ignored.',
      },
      {
        label: 'RFC 7515 §2 — JWT compact serialisation',
        href: 'https://datatracker.ietf.org/doc/html/rfc7515#section-2',
        detail: 'How the three base64url segments of a JWS are joined, and why padding never appears.',
      },
      {
        label: 'RFC 2397 — data URI scheme',
        href: 'https://datatracker.ietf.org/doc/html/rfc2397',
        detail: 'The `;base64` flag and media-type parameter this decoder recognises and unwraps.',
      },
    ],
    guides: [
      { path: '/learn/base64/', name: 'Base64 complete guide', blurb: 'The bit maths, alphabets, padding and every place the encoding appears.' },
      { path: '/encoders-decoders/url/', name: 'URL Encoder and Decoder', blurb: 'Percent-encoding, the other text-safety mechanism.' },
      { path: '/use-cases/api-debugging/', name: 'API debugging tools', blurb: 'Opening a JWT you received in a 401.' },
    ],
  },

  'url-encoder': {
    categoryName: 'Encoders and decoders',
    schemaCategory: 'Encoder',
    intro:
      'Percent-encoding with the context made explicit — component, path, query value, whole URI or form body — plus canonicalisation, double-encoding detection and a URL inspector that resolves every RFC 3986 part.',
    whatItDoesHeading: 'Correct escaping depends on where in the URL the text sits',
    whatItDoes: [
      'Percent-encoding replaces a character with `%` and two hex digits, but which characters may stay literal depends on the component. A `?` is legal inside a path segment and starts a query after it; `&` separates parameters and must be escaped inside a value; `+` means a literal space only in `application/x-www-form-urlencoded`, and never in a query value produced by `encodeURIComponent`. One escaping mode cannot be right for all five positions, which is why this tool makes you choose.',
      'Decoding is not the mirror image. A decoder that runs twice is a vulnerability: `%252e%252e%252f` decodes once to `../` and a second pass turns it into a traversal the filter never saw. The decoder therefore reports when the input itself contains an escape of a percent sign — a double-encoding signature — instead of quietly normalising it, and it can canonicalise escapes to uppercase and strip percent-encoding of unreserved characters, the normalisation that RFC 3986 §6.2.2 describes.',
      'The inspector splits any URL into scheme, authority, userinfo, host, port, path, query and fragment using the generic grammar of §3, lists each query parameter with its raw and decoded forms, marks repeated keys, and flags non-normal forms such as an empty port or a host that needs IDN encoding.',
    ],
    featuresHeading: 'Modes, normalisation and inspection',
    features: [
      'Five escaping modes: component, path, query value, URI, form body',
      'Uppercase or lowercase hex digits, with canonicalisation',
      'Unreserved-character escapes removed per RFC 3986 §2.3',
      '`+` treated as space only in form-body mode',
      'Double-encoding detection with the affected substring',
      'Invalid escape sequences reported rather than replaced',
      'URL decomposition into all RFC 3986 components',
      'Query parameter table with raw, decoded and repeated flags',
      'Browser-resolved absolute URL where the input can be parsed',
      'Encode and decode tabs deep-linked through the URL hash',
    ],
    howHeading: 'How to percent-encode a URL or a value',
    howIntro: 'Pick the position the text will occupy; that is the whole decision.',
    steps: [
      { title: 'Choose the mode', body: 'Component for a single path segment or a query value, path when slashes should survive, query value when `&` and `=` must not, form body for POST payloads where `+` means space, and whole URI when escaping an already-assembled URL.' },
      { title: 'Paste the text', body: 'The output shows how many characters were escaped and how the length changed, so an over-escaped value — a space becoming `%2520` — is visible immediately.' },
      { title: 'To decode, switch tabs and paste the escaped form', body: 'The decoder reports the escape count, whether the result still contains an encoded percent sign, and whether the string can be canonicalised without changing meaning.' },
      { title: 'Inspect a full URL in the analysis panel', body: 'Components, parameters and their decoded values are listed with any normalisation issues, which is how you find a query key that appears twice with different values.' },
    ],
    table: {
      heading: 'What each mode leaves literal',
      caption: 'Character handling by mode, with the most common mistake in each row.',
      head: ['Mode', 'Keeps literal', 'Escapes', 'Typical mistake if misused'],
      rows: [
        ['Component', "A-Z a-z 0-9 - . _ ~ ! * ' ( )", 'Everything else, including `/ ? & = #`', 'Paths look wrong because the slash became %2F.'],
        ['Path', 'sub-delims, `@`, `:`, `/`', '`? # %` and unsafe bytes', 'A `?` inside a segment starts a query in the reader.'],
        ['Query value', '`/ ?` and unreserved', '`& = + # %` and unsafe bytes', 'An unescaped `&` splits one value into two parameters.'],
        ['Form body', 'unreserved', 'Space becomes `+`, everything unsafe becomes `%XX`', 'Sending `+` in a query value where a literal plus was meant.'],
        ['Whole URI', 'structural delimiters `:/?#[]@&=+`', 'Only characters illegal in a URI', 'Fails to escape a value delimiter, so structure changes.'],
      ],
      foot: 'RFC 3986 §2.4 makes the point behind the table: a reserved character is indistinguishable from its percent-encoded form in meaning only when it stands for itself — which is a decision about position, not about the character.',
    },
    privacyNote: 'Encoding, decoding and analysis all run locally, so a URL containing a session token or an internal hostname is never requested or logged by this site.',
    faqs: [
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer:
          '`encodeURI` assumes the input is a complete URL and leaves the structural characters alone; `encodeURIComponent` assumes it is one component and escapes `#`, `?`, `&`, `/` and `+` too. This tool exposes the same distinction as five explicit modes, because the two JavaScript functions are the wrong granularity for query values.',
      },
      {
        question: 'Why is my space %20 in one place and + in another?',
        answer:
          'Percent-encoding of a space is `%20` everywhere. `+` as a space is a form-encoding convention from `application/x-www-form-urlencoded`, and it only means space in that context — in a path segment or an `OAuth` signature base string a `+` is a literal plus. Mixing the two is the classic signature-failure cause.',
      },
      {
        question: 'What is double encoding and why does it matter?',
        answer:
          'Encoding an already-encoded string turns `%20` into `%2520`. If a server decodes twice — for example a framework that normalises and then a handler that decodes again — input that a filter saw as harmless text becomes a control sequence. The decoder flags the `%25` signature so you can see it rather than discover it in a log.',
      },
      {
        question: 'Should uppercase or lowercase hex be used?',
        answer:
          'Uppercase. RFC 3986 §6.2.2.1 defines percent-encoded octet normalisation as uppercase hex, and treats an escape of an unreserved character as equivalent to the character itself. Canonical output makes comparisons and caches behave, which is why the tool offers it explicitly.',
      },
      {
        question: 'Do I need to encode already-unicode domains?',
        answer:
          'Yes, to punycode (RFC 3492) before the hostname goes into a URL; percent-encoding applies to the path, query and fragment, not to the host. The inspector labels an international host so you can see which transformation it still needs.',
      },
      {
        question: 'Why is my query parameter arriving as an array?',
        answer:
          'Because the key appears more than once — repeated keys are legal and most frameworks collect them. The parameter table marks repeated keys, which is the fastest way to spot an accidental duplicate from a form plus a hand-appended value.',
      },
      {
        question: 'Why five escaping modes instead of one button?',
        answer:
          'Because the same string has several correct answers and picking the wrong one is a bug, not a style choice. `encodeURIComponent` keeps `- _ . ! ~ * \' ( )` and escapes "/", so it breaks a path; `encodeURI` leaves the reserved characters that are legal as delimiters; a path segment may keep sub-delims while a query value must not, or the value can inject parameters; and a form body turns space into "+" where a path would need `%20`. Choose the mode, and the inspector splits the result into RFC 3986 components and flags a second pass of percent-encoding.',
      },
    ],
    specs: [
      {
        label: 'RFC 3986 §2.1 — Percent-encoded octets',
        href: 'https://datatracker.ietf.org/doc/html/rfc3986#section-2.1',
        detail: 'The `%HH` rule and the prohibition on using an encoding to signal a reserved character’s literal meaning.',
      },
      {
        label: 'RFC 3986 §2.2 — Reserved characters',
        href: 'https://datatracker.ietf.org/doc/html/rfc3986#section-2.2',
        detail: 'Gen-delims and sub-delims, and the reason escaping depends on the component the text lands in.',
      },
      {
        label: 'RFC 3986 §2.3 — Unreserved characters',
        href: 'https://datatracker.ietf.org/doc/html/rfc3986#section-2.3',
        detail: 'The four characters that must not be escaped, which canonicalisation removes encodings for.',
      },
      {
        label: 'RFC 3986 §3 — Generic syntax',
        href: 'https://datatracker.ietf.org/doc/html/rfc3986#section-3',
        detail: 'The scheme/authority/path/query/fragment grammar the inspector decomposes against.',
      },
      {
        label: 'RFC 3986 §6.2.2 — Syntax-based normalisation',
        href: 'https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2',
        detail: 'Case and percent-encoding normalisation rules the canonicalise option implements.',
      },
      {
        label: 'RFC 3492 — Punycode',
        href: 'https://datatracker.ietf.org/doc/html/rfc3492',
        detail: 'How an international host name is encoded, which is a separate step from percent-encoding.',
      },
    ],
    guides: [
      { path: '/encoders-decoders/base64/', name: 'Base64 Encoder and Decoder', blurb: 'The other way to make bytes URL-safe.' },
      { path: '/use-cases/encoding/', name: 'Encoding and security tools', blurb: 'Normalisation bugs with security labels on them.' },
      { path: '/use-cases/api-debugging/', name: 'API debugging tools', blurb: 'Signature failures usually start in the query string.' },
    ],
  },
}
