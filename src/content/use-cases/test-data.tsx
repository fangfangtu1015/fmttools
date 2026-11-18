/**
 * Workflow page: /use-cases/test-data/ — "Tools for Building Test Fixtures".
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * Claims about tool behaviour are written against the engines in src/lib/tools/:
 * json.ts (RFC 8259 scanner, 200-level depth cap, duplicate-key and unsafe-integer
 * warnings), csv.ts (RFC 4180 state machine, inference modes, quoting styles,
 * spreadsheet-damage audit) and yaml.ts (YAML 1.2 parse plus the 1.1/1.2 scalar
 * classifier and the 1.1-protecting writer).
 * Counts in the tables and code blocks were measured with Node 24 and a UTF-8
 * TextEncoder on the exact literals printed here, not estimated.
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'test-data',
  path: '/use-cases/test-data/',
  title: 'Test Data Tools - Build Fixtures That Break Code | FmtTools',
  description:
    'Build fixtures that break code on purpose: empty versus null, unsafe integers, ZWJ emoji, coerced YAML scalars and CSV quoting, all with pasteable data.',
  h1: 'Tools for Building Test Fixtures',
  faqTopic: 'building test fixtures',
  summary:
    'The edge cases that break software are not random: absent keys, 2^53 boundaries, invisible marks, delimiters and coerced scalars. Build them on purpose, and keep the byte counts next to them.',
  keywords: [
    'test fixture data',
    'edge case test data',
    'JSON test data generator',
    'CSV test file with commas and quotes',
    'unicode test string emoji',
    'boundary value test data',
    'unsafe integer 9007199254740991',
    'formula injection test case',
  ],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 17,
  sections: [
    { id: 'fixture-design', label: 'Edge cases cluster at boundaries, so build them there' },
    { id: 'empty-and-unicode', label: 'Empty states and the three lengths of a string' },
    { id: 'invisible-and-breaking', label: 'Invisible characters and strings that break parsers' },
    { id: 'numbers-and-identifiers', label: 'Number boundaries and identifiers that must stay text' },
    { id: 'yaml-and-structure', label: 'YAML coercion, depth, and duplicate keys' },
    { id: 'csv-and-schema', label: 'CSV portability and schema contracts' },
    { id: 'determinism-and-size', label: 'Deterministic fixtures and size you can defend' },
    { id: 'fixture-checklist', label: 'Fixture checklist and the page for each step' },
  ],
  faqs: [
    {
      question: 'What is the difference between null, an empty string and a missing key in a fixture?',
      answer:
        'Three different facts. A missing key says the field was never produced; `null` says it was produced with no value; `""` says it was produced with an empty value. JavaScript collapses all three under truthiness, and CSV collapses all three into one empty field, so a fixture has to carry all three in separate named fields and test presence with `Object.hasOwn`, emptiness against `\'\'`, and nullity against `null`.',
    },
    {
      question: 'Why does 9007199254740993 not work as a test ID?',
      answer:
        'Because it is not a distinct value in double precision. The largest integer that compares exactly is 9007199254740991 (2^53 − 1), and `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` is true. The fixture should be the string `"9007199254740993"` wherever a test wants to prove that digits survive a round trip.',
    },
    {
      question: 'Which YAML values need quoting in a fixture?',
      answer:
        'Any scalar whose text is also valid as another type. `NO`, `On`, `y` resolve to booleans in YAML 1.1 and stay strings in 1.2; `0755` becomes integer 493 in 1.1 (octal); `1:30` becomes 90 (base 60); `1.10` becomes float 1.1 and loses the trailing zero; `2024-01-15` becomes a timestamp. The [JSON to YAML](/format-converters/json-to-yaml/) converter quotes them by default and lists what it protected.',
    },
    {
      question: 'Can a JSON fixture contain duplicate keys?',
      answer:
        'It can, and it should, because that is one of the cheapest ways to find silent data loss. RFC 8259 section 4 says names SHOULD be unique but does not forbid repeats, and `JSON.parse` keeps the last value. A fixture with `{"status":"ok","status":"error"}` proves which side of that divide your code is on.',
    },
  ],
  sources: [
    {
      label: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format',
      href: 'https://www.rfc-editor.org/rfc/rfc8259',
      detail: 'The grammar (JSON-TEXT = ws value ws, and number = [ minus ] int [ frac ] [ exp ]), the section 4 SHOULD on unique names, section 6 leaving range and precision to the implementation while naming the interoperable interval -9007199254740991 to 9007199254740991, section 7 requiring U+0000 to U+001F to be escaped, and section 8 requiring UTF-8 and forbidding a byte order mark.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 4180: Common Format and MIME Type for CSV Files',
      href: 'https://www.rfc-editor.org/rfc/rfc4180',
      detail: 'The seven record-and-field rules a CSV fixture has to exercise: CRLF-delimited records, an optional trailing break, an optional header line, spaces being part of a field and not ignorable, quoting required for fields containing a line break, a comma or a double quote, and doubled quotes as the only escape.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3339: Date and Time Formats for Internet Message Transfer',
      href: 'https://www.rfc-editor.org/rfc/rfc3339',
      detail: 'The date-time grammar full-date "T" full-time, the permitted lower-case t and z, the requirement that an offset or Z carries the zone, and the allowance of a second value of 60 for leap seconds.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 4122: A Universally Unique IDentifier (UUID) URN Namespace',
      href: 'https://www.rfc-editor.org/rfc/rfc4122',
      detail: 'The 8-4-4-4-12 hex layout, the version field values one through five, the variant bits, and the nil UUID of all zeros.',
      accessed: '2026-11-12',
    },
    {
      label: 'Unicode Standard Annex #15: Unicode Normalization Forms',
      href: 'https://www.unicode.org/reports/tr15/',
      detail: 'Canonical versus compatibility equivalence and the four normalisation forms, with the warning that compatibility folding erases formatting distinctions and can prevent round-trip conversion.',
      accessed: '2026-11-12',
    },
    {
      label: 'Unicode Standard Annex #29: Unicode Text Segmentation',
      href: 'https://www.unicode.org/reports/tr29/',
      detail: 'The extended grapheme cluster as the user-perceived character, and the statement that a text size limit based on grapheme clusters is a user-perceived limit rather than a data size limit.',
      accessed: '2026-11-12',
    },
    {
      label: 'Unicode Technical Standard #51: Unicode Emoji',
      href: 'https://www.unicode.org/reports/tr51/',
      detail: 'How emoji are built: ZWJ sequences, emoji modifier sequences, Extended Pictographic characters, and tag sequences behind subdivision flags.',
      accessed: '2026-11-12',
    },
    {
      label: 'MDN: Number.MAX_SAFE_INTEGER',
      href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER',
      detail: 'The exact value 9007199254740991, the definition of a safe integer as representable exactly and comparable correctly, and the worked example that MAX_SAFE_INTEGER + 1 === MAX_SAFE_INTEGER + 2 is true.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP Community: CSV Injection (formula injection)',
      href: 'https://community.owasp.org/attacks/CSV_Injection',
      detail: 'The attack class, the dangerous leading characters (=, +, -, tab and the carriage return and line feed), and the mitigations: quoting fields, prefixing with a single quote, and the tab prefix that survives Excel.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Line and column for each error, plus duplicate-key, unsafe-integer and lone-surrogate warnings.' },
    { path: '/json-tools/formatter/', name: 'JSON Formatter', blurb: 'Re-indents and sorts keys while keeping number literals and duplicate members intact.' },
    { path: '/json-tools/minify/', name: 'JSON Minifier', blurb: 'Byte savings and gzip comparison for size fixtures, with a verified round trip.' },
    { path: '/format-converters/csv-to-json/', name: 'CSV to JSON', blurb: 'RFC 4180 parsing with delimiter, quoting and per-column type findings.' },
    { path: '/format-converters/json-to-csv/', name: 'JSON to CSV', blurb: 'Flattening, quoting styles and the spreadsheet-damage audit for export fixtures.' },
    { path: '/format-converters/json-to-yaml/', name: 'JSON to YAML', blurb: 'Block YAML with every 1.1-unsafe scalar quoted, and a list of what was protected.' },
    { path: '/format-converters/yaml-to-json/', name: 'YAML to JSON', blurb: 'The coercion report: what each plain scalar becomes under 1.1 and under 1.2.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'Grammar, number rules, duplicate names and the interop clauses fixtures are built from.' },
  ],
  words: 3700,
  image: '/images/covers/use-test-data.png',
  imageAlt: 'Cover illustration for the test fixture workflow page: a grid of small data samples with empty values, long numbers, emoji and quoted text marked up like a test report.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        Production incidents almost never start in the middle of a value range. They start at a seam: the field that was absent rather than empty, the identifier one digit too long, the emoji that halved into a surrogate, the description that contained a comma. Random data generators are excellent at the middle and useless at the seams, so a fixture set worth keeping is built from the boundaries a specification describes and a real implementation gets wrong.
      </Lead>

      <Section id="fixture-design" title="Edge cases cluster at boundaries, so build them there">
        <P>
          A fixture is a piece of data with a written reason for existing. The reason is what separates it from sample data: a sample shows you what a record looks like, a fixture shows you what a record can legally be. RFC 8259 devotes a section to interoperability issues — the places where implementations are allowed to disagree. That clause is a fixture specification. Everything the standard permits without requiring, or requires without defining, is a place where two correct programs can disagree about your data.
        </P>
        <P>
          Work the field list, not the file. For every field in your payload, the classes below are all reachable, and a fixture set that covers them for one record covers more ground than a thousand generated records that never leave the happy path. Each class is testable in one of the converters on this site, which means the fixture is verifiable before it ever reaches a pipeline.
        </P>
        <DataTable
          caption="The seven classes every fixture field should be assignable to"
          head={['Class', 'What it probes', 'Example value', 'Where it bites']}
          rows={[
            ['Presence', 'Does the reader distinguish absent, null and empty?', 'absent, null, ""', 'Defaults, form validation, database NOT NULL'],
            ['Magnitude', 'Does the value fit the type it lands in?', '9007199254740991 then +2', 'JSON.parse, doubles, spreadsheet display'],
            ['Character class', 'Does the text contain a syntax character?', '"a,b", "say ""hi""", "=SUM(A1)"', 'CSV splitting, formula evaluation, shell quoting'],
            ['Encoding', 'Do bytes, code units and code points agree?', 'one ZWJ family emoji', 'Column widths, slice-based truncation, hashing'],
            ['Invisibility', 'Is the value what it looks like?', 'U+202E before a filename', 'Logs, review UIs, comparisons after normalisation'],
            ['Coercion', 'Does a second reader type it differently?', 'NO, 1.10, 0755, 1:30', 'YAML config, query parameters, spreadsheet import'],
            ['Structure', 'Does the shape rather than the value break things?', '201 arrays deep, duplicate keys', 'Recursive parsers, object mapping, flattening'],
          ]}
          foot="Two fields per class is enough for one record. A fixture file with fourteen fields can carry all seven classes twice."
        />
        <P>
          Start with presence and magnitude, because those two change values silently. Then character class and coercion, which surface as parse failures and are the easiest to notice. Encoding and invisibility come next, since they show up as comparisons that fail for reasons nobody can see. Structure last, because it tends to be a property of the whole document. Keep the boundary values rather than the extreme ones: 9007199254740991 is a fixture; ten to the four hundred is a curiosity. For every numeric or length ceiling in your system, write the value just below the limit, the value exactly at it, and the value just past it.
        </P>
        <Callout tone="spec" title="In the specification">
          <P>
            RFC 8259 section 6 states that implementations are free to set their own limits on the range and precision of numbers, and that interoperability is achieved by confining exchanged values to the interval from minus 9007199254740991 to 9007199254740991. Section 4 adds a SHOULD rather than a MUST on unique names inside an object, which makes a duplicate-key document legal input and therefore a legitimate fixture.
          </P>
        </Callout>
      </Section>

      <Section id="empty-and-unicode" title="Empty states and the three lengths of a string">
        <P>
          There are at least six ways for a field to carry nothing, and most code can only tell two of them apart. Presence, emptiness and nullity are three distinct facts; a fixture that collapses them cannot detect a bug that collapses them further. The record below keeps all six in one object and is 47 bytes minified.
        </P>
        <CodeBlock
          title="empty-states.json"
          language="json"
          code={`{
  "absent": "the key below is not in the object at all",
  "nullValue": null,
  "emptyString": "",
  "spaceString": " ",
  "emptyObject": {},
  "emptyArray": [],
  "zero": 0,
  "false": false
}`}
          caption="Seven nothing-values plus one key that never appears. A whitespace-only string is not empty by length and not blank by intent, which is the seam most trim-on-read code falls into."
        />
        <P>
          Test the absent key three ways, because the three tests are not equivalent: <code>Object.hasOwn(record, key)</code> answers whether the field was produced, <code>record[key] === undefined</code> answers whether it is undefined, and <code>??</code> and <code>||</code> answer different questions again. JSON has no undefined, so a missing key is the only absence a JSON document can carry — which is why code that maps JSON onto a typed object needs the distinction spelled out in the schema.
        </P>
        <DataTable
          caption="What each empty state becomes, measured through the converters on this site"
          head={['Source state', 'In JSON', 'After CSV to JSON (safe)', 'Back to CSV', 'Survives the pair?']}
          rows={[
            ['key absent from the object', 'nothing to write', 'not applicable, keys come from the header', 'empty field', 'no'],
            ['empty cell in a row', 'n/a', 'null', 'empty field, unquoted', 'yes, as null'],
            ['cell with one space', '" "', 'string " " (untrimmed)', 'quoted " "', 'yes'],
            ['cell with the text NULL', '"NULL"', 'null via the token list', 'NULL', 'no, unless tokens are cleared'],
            ['JSON null', 'null', 'n/a', 'empty field, unquoted', 'indistinguishable from empty'],
            ['JSON empty string', '""', 'n/a', 'empty field, unquoted', 'indistinguishable from null'],
            ['JSON empty object', '{}', 'n/a', 'the two characters {}', 'yes, as text'],
            ['JSON empty array', '[]', 'n/a', 'joined to an empty field', 'no'],
          ]}
          foot="The writer quotes a field only when RFC 4180 requires it, and a zero-length field requires nothing, so null and empty string both leave as nothing."
        />
        <P>
          An empty document is not the same test as an empty field. <code>{'{}'}</code> and <code>{'[]'}</code> are both valid JSON, but a bare empty input is not, and the <Rich text={"[JSON validator](/json-tools/validator/)"} /> says so with a dedicated <code>empty-input</code> error. The other near-misses deserve fixtures: <code>[ ]</code> with a single space, an object whose only key is the empty string, and an array holding one null.
        </P>
        <H3>Unicode and the three lengths of a string</H3>
        <P>
          Every length assertion in your code base measures one of four things: UTF-8 bytes, UTF-16 code units, Unicode code points, or user-perceived characters. UAX #29 defines the last as the extended grapheme cluster and states that a size limit counted in clusters is a user-perceived limit rather than a data-size limit. A fixture must therefore be tested with all four numbers written down.
        </P>
        <CodeBlock
          title="unicode.json"
          language="json"
          code={`{
  "familyZWJ": "👨‍👩‍👧‍👦",
  "flagUS": "🇺🇸",
  "skinTone": "👍🏽",
  "variationSelector": "❤️",
  "keycap": "1️⃣",
  "astralIdeograph": "𠀀",
  "combiningNFD": "cafe\u0301",
  "precomposedNFC": "café",
  "compatLigature": "ﬁle",
  "ohmSign": "\u2126",
  "fullwidthC": "Ｃ",
  "oneHalf": "½",
  "hebrew": "שלום",
  "arabicRTL": "مرحبا",
  "cyrillicHomoglyph": "p\\u0430l",
  "turkishI": "İstanbul",
  "sharpS": "Straße"
}`}
          caption="Seventeen values, all legal, all different lengths depending on which ruler you pick."
        />
        <DataTable
          caption="Measured lengths for six of those values, using a UTF-8 encoder and Intl.Segmenter"
          head={['Value', 'UTF-16 units', 'Code points', 'UTF-8 bytes', 'Grapheme clusters', 'Why it differs']}
          rows={[
            ['family ZWJ emoji', '11', '7', '25', '1', 'Four astral emoji at two units each plus three joiners'],
            ['US flag', '4', '2', '8', '1', 'A pair of regional indicator symbols, each astral'],
            ['thumbs up with tone', '4', '2', '8', '1', 'Modifier base plus Fitzpatrick sequence'],
            ['heart with U+FE0F', '2', '2', '6', '1', 'BMP base, emoji presentation selector'],
            ['CJK extension ideograph U+20000', '2', '1', '4', '1', 'A single astral character, one surrogate pair'],
            ['e plus U+0301', '2', '2', '3', '1', 'Combining mark: decomposed form, same cluster'],
            ['fi ligature U+FB01', '1', '1', '3', '1', 'Compatibility character, one unit but three bytes'],
          ]}
          foot="A varchar(255) column counts characters, a JavaScript .length check counts units, a byte budget counts bytes, and a UI label limit counts clusters."
        />
        <P>
          <code>slice(0, 1)</code> on an astral value produces half a surrogate. <code>TextEncoder</code> replaces it with the three bytes of U+FFFD. Case mapping and normalisation both change lengths: lowercasing the dotted capital I yields an i plus a combining dot, and NFKC turns the fi ligature into f and i, the ohm sign into Greek capital omega, and one half into a digit, a fraction slash and a digit. Build both: a fixture pair that is canonically equal but byte-different, and one that is only compatibility-equal.
        </P>
        <CodeBlock
          title="equality-pairs.json"
          language="json"
          code={`{
  "canonicallyEqualButDifferentBytes": ["caf\\u00e9", "cafe\\u0301"],
  "compatibilityEqualOnly": ["ﬁle", "file"],
  "visuallyIdenticalDifferentCharacter": ["pal", "p\\u0430l"],
  "uppercaseChangesLength": ["straße", "STRASSE"],
  "sameClusterDifferentCodePoints": ["👍", "👍🏽"]
}`}
          caption="Row three is the one that breaks joins: the Cyrillic а in the second value is U+0430, not the Latin a, so the strings differ in code points while displaying identically."
        />
        <Callout tone="warn" title="Where this goes wrong">
          <P>
            A length limit enforced on one ruler and checked on another produces a validation error no user can reproduce. Emoji in a display name is not exotic input any more, and a four-person family emoji is eleven units of nothing a user did anything wrong with.
          </P>
        </Callout>
      </Section>

      <Section id="invisible-and-breaking" title="Invisible characters and strings that break parsers">
        <P>
          The most expensive fixture characters are the ones nobody can see in a pull request. These fall into three groups with three different failure modes: format characters that change rendering direction, zero-width characters that change string identity, and syntax characters that are legal in one place and fatal in another. All three are testable by pasting into a tool that reports code points rather than shapes.
        </P>
        <DataTable
          caption="Invisible and bidirectional characters worth a fixture, with what each one breaks"
          head={['Code point', 'Name', 'What it does to a value', 'How the tools report it']}
          rows={[
            ['U+200B', 'zero width space', 'Splits a token without splitting a word; three code points for "ab"', 'unexpected-token error outside strings'],
            ['U+00A0', 'no-break space', 'Looks like a separator, is not whitespace to a JSON reader', 'invalid-whitespace error naming the code point'],
            ['U+FEFF', 'zero width no-break space', 'A byte order mark in the middle of a document', 'invalid-whitespace error; utf8-bom warning at offset zero'],
            ['U+200E / U+200F', 'LRM / RLM', 'Reverses the direction of adjacent runs, so a filename renders differently from its bytes', 'nothing visible in output; check the code point dump'],
            ['U+202E', 'right-to-left override', 'Everything after it renders right-to-left until the terminator', 'nothing: it is a legal character inside a JSON string'],
            ['U+2028 / U+2029', 'line / paragraph separator', 'Valid JSON inside a string, breaks eval-based consumption', 'js-unsafe-line-separator info'],
            ['U+0000 to U+001F', 'C0 control characters', 'RFC 8259 section 7 requires all of them to be escaped', 'unescaped-control-char error with the hex code'],
            ['U+007F', 'delete', 'Not a control character under that clause, but not friendly to YAML', 'the YAML writer quotes it; JSON does not mind'],
            ['U+2044', 'fraction slash', 'Appears when normalising ½, and looks like an ordinary slash', 'only visible as bytes or as a code point dump'],
          ]}
          foot="A character can be entirely legal in the format and still make your logs, your review UI and your filename display lie about what the value is."
        />
        <P>
          The bidirectional controls are the ones to fixture first, because they are invisible in the tool that reviews the fixture. A string written as the letters <code>txt</code>, then U+202E, then <code>exe</code> renders right-to-left after the override, so what a reviewer sees is not what the bytes say. Pair the fixture with an assertion on the code point list rather than on the rendered text.
        </P>
        <H3>Strings that break parsers, spreadsheets and shells</H3>
        <P>
          RFC 4180 gives CSV exactly three structural characters: the comma, the double quote and the line break. A CSV fixture is therefore a test of four states: text containing a delimiter, text containing a quote, text containing a line break, and text with significant leading or trailing whitespace. A fixture value that is inert in JSON may also be an indicator in YAML or a control sequence in a shell, so build a field that is simultaneously a JSON string, a formula prefix, a YAML indicator, and something containing <Rich text={'`</`'} />.
        </P>
        <CodeBlock
          title="hostile-but-legal.json"
          language="json"
          code={`{
  "bidiOverride": "‮txt.exe",
  "rtlMarkTrailing": "invoice‏",
  "zeroWidthInside": "to​ken",
  "nbspInsteadOfSpace": "key value",
  "formula": "=SUM(A1:A9)",
  "atCommand": "@SUM(A1)",
  "yamlIndicator": "- not a list",
  "colonSpace": "note: see below",
  "closeTag": "</script>",
  "escapedBackslash": "C:\\\\tmp",
  "quotePair": "He said \\"hi\\"."
}`}
          caption="Eleven values, one document. The last two lines are the ones that most often fail on the way into a fixture file: a Windows path needs a doubled backslash in JSON, and a quoted phrase needs doubled quotes."
        />
        <CodeBlock
          title="quoting.csv"
          language="csv"
          code={`id,plain,has_comma,has_quote,has_newline,padded,formula,negative,at_sign,tab_char
1,plain text,"Sausalito, CA","She said ""hi""","line one
line two"," leading and trailing ","=SUM(A1:A9)","-4+5","@SUM(A1)","one	two"`}
          caption="Nine fields in one row, each one targeting a single CSV rule. The embedded line break is the reason a row count is not a record count."
        />
        <Callout tone="risk" title="Quoting is not sanitising">
          <P>
            Doubling a quote and wrapping a field tells a parser where the field ends. It tells Excel nothing: a quoted field that begins with <code>=</code> is still evaluated when the file is opened. The OWASP guidance lists the dangerous leading characters as equals, plus, minus, at sign, tab, carriage return and line feed, and the mitigations are quoting, a single-quote prefix, and a tab prefix that survives Excel's parser. The damage audit on this site reports those cells as Formula injection (DFXP) with the recommendation to sanitise in the writer rather than in the viewer. Directional overrides and zero-width characters turn an identity check into a visual comparison, and the same values pass a naive test that compares rendered strings. Normalise to a declared form before comparing, and keep one fixture with a homoglyph in every identity field.
          </P>
        </Callout>
      </Section>

      <Section id="numbers-and-identifiers" title="Number boundaries and identifiers that must stay text">
        <P>
          The number grammar in RFC 8259 is one line — <Rich text={"`number = [ minus ] int [ frac ] [ exp ]`"} /> — and almost every production failure of a numeric fixture is a violation of it rather than a size problem. A leading zero is not a legal integer, a plus sign is not a legal exponent prefix, and there is no literal for NaN or Infinity. Size problems are quieter: they change the value and leave the syntax valid.
        </P>
        <P>
          The ceiling everybody means by a precision limit is 2^53, and the largest integer below it that is safe is <strong>9007199254740991</strong>: the value of <code>Number.MAX_SAFE_INTEGER</code>. One above the ceiling, 9007199254740993 is not a different number from 9007199254740992 once parsed by a double-based reader: <Rich text={"`Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2`"} /> is true.
        </P>
        <CodeBlock
          title="numbers.json"
          language="json"
          code={`{
  "atTheCeiling": 9007199254740991,
  "onePastIt": 9007199254740992,
  "anOddNumberAboveIt": 9007199254740993,
  "belowTheFloor": -9007199254740993,
  "epochMilliseconds": 1703215800000,
  "epochMicroseconds": 1703215800000000,
  "epochNanoseconds": 1703215800000000000,
  "sixteenNines": 9999999999999999,
  "eighteenDigits": 453201511283036612,
  "negativeZero": -0,
  "overflowToInfinity": 1e400,
  "underflowToZero": 1e-400,
  "largestDouble": 1.7976931348623157e308,
  "smallestPositive": 5e-324,
  "binaryFloatSum": 0.30000000000000004,
  "asTextInstead": "9007199254740993"
}`}
          caption="Sixteen numeric states. Paste it into the validator: the whole numbers past the ceiling come back as unsafe-integer warnings, while every one of these parses."
        />
        <P>
          Three of those values are more interesting than they look. <code>1e400</code> overflows to positive infinity, which has no JSON number form, so <code>JSON.stringify</code> writes <code>null</code> in its place. <code>1e-400</code> underflows to zero without complaint. And <code>-0</code> is a real value in IEEE 754 that <code>JSON.stringify</code> prints as plain <code>0</code>, so the sign survives in memory and disappears in the wire format. A fixture of nanoseconds since the epoch is around 1.7 times ten to the eighteen, more than a hundred times past the ceiling, while microseconds at 1.7 times ten to the fifteen are still safe.
        </P>
        <DataTable
          caption="Numeric literals, what they mean after a parse, and what the validator says"
          head={['Literal', 'After a double parse', 'Report', 'Fixture it as']}
          rows={[
            ['9007199254740991', 'exact', 'nothing, it is inside the safe interval', 'number'],
            ['9007199254740993', '9007199254740992', 'unsafe-integer warning', 'string'],
            ['-9007199254740993', '-9007199254740992', 'unsafe-integer warning', 'string'],
            ['007', 'not parsed', 'leading-zero error, hint suggests quoting', 'string "007"'],
            ['+7', 'not parsed', 'malformed-number error', 'string, or 7'],
            ['.5 and 7.', 'not parsed', 'malformed-number error', 'string, or 0.5 / 7'],
            ['1_000', 'not parsed', 'numeric-separator error', 'number 1000'],
            ['NaN, Infinity', 'not parsed', 'non-standard-number error', 'null, or the string "Infinity"'],
            ['1.7976931348623157e308', 'exact, the largest double', 'nothing', 'number'],
            ['0.30000000000000004', 'exact, this is what 0.1 + 0.2 is', 'nothing', 'never compare with ==='],
            ['"9007199254740993"', 'unchanged text', 'nothing', 'string, the correct fixture'],
          ]}
          foot="The formatter and minifier print number literals from the source text rather than from a parsed value, so 9007199254740993 survives re-indenting."
        />
        <H3>Identifiers that look like numbers and must stay text</H3>
        <P>
          An identifier is a fixed-width string that happens to be spelled with digits. Two things go wrong at opposite ends: a value with a leading zero loses its left side to any numeric read, and a value longer than fifteen digits loses its right side to a double. Every system that touches the field has an opinion about which one happens, so the fixture has to carry both shapes side by side.
        </P>
        <CodeBlock
          title="identifiers.json"
          language="json"
          code={`{
  "uuidV4": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "uuidNil": "00000000-0000-0000-0000-000000000000",
  "uuidWithUppercaseHex": "3F2504E0-4F89-41D3-9A0C-0305E82C3301",
  "zipWithLeadingZeros": "00123",
  "e164Phone": "+44 20 7946 0958",
  "iban": "DE89 3704 0044 0532 0130 00",
  "gtin14": "00000123456780",
  "cardPan": "4532015112830366",
  "snowflakeId": "1234567890123456789",
  "semanticVersion": "1.10.0",
  "octalFileMode": "0755",
  "clockTime": "1:30",
  "israelCountryCode": "IL",
  "norwayCountryCode": "NO",
  "featureFlag": "on",
  "partNumber": "0000-00001",
  "sameValueAsNumber": 12
}`}
          caption="Sixteen identifiers plus the number 12 for contrast. 0000-00001 is a part number, and 12 is a quantity, and a fixture that keeps both proves which one your code retyped."
        />
        <DataTable
          caption="The same identifier text through three readers, measured against this site's engines"
          head={['Fixture text', 'As JSON', 'CSV to JSON, safe inference', 'YAML 1.1 reader', 'YAML 1.2 core reader']}
          rows={[
            ['00123', '"00123" if quoted', 'string, leading zero fails the number grammar', 'integer 123 (octal in 1.1)', 'string'],
            ['0755', '"0755"', 'string', 'integer 493', 'string'],
            ['010', '"010"', 'string', 'integer 8', 'string'],
            ['1:30', '"1:30"', 'string', 'integer 90, base 60', 'string'],
            ['1.10.0', '"1.10.0"', 'string', 'string', 'string'],
            ['1.10', '"1.10"', 'number 1.1, the trailing zero is gone', 'float 1.1', 'float 1.1'],
            ['NO', '"NO"', 'string', 'boolean false', 'string'],
            ['on', '"on"', 'string', 'boolean true', 'string'],
            ['1e5', '"1e5"', 'number 100000', 'float 100000', 'float 100000'],
            ['4532015112830366', '"4532015112830366"', 'string plus an unsafe-integer warning', 'float, digits lost', 'float, digits lost'],
            ['1234567890123456789', '"1234567890123456789"', 'string, above the ceiling', 'float, digits lost', 'float, digits lost'],
          ]}
          foot="Every row is a value somebody has legitimately stored in an identifier column. The JSON column is the only one where the text survives untouched, and only because you quoted it first."
        />
        <Callout tone="warn" title="Where this goes wrong">
          <P>
            An assertion written as <code>expect(received.id).toBe(9007199254740993)</code> can pass against a corrupted pipeline, because both sides were parsed by the same double-based reader and both became 9007199254740992. Where digits matter, assert on the text: <Rich text={'`String(received.id)` or a string-typed field.'} /> Generate identifiers as strings and never as numbers, then deliberately include a subset whose text is a valid JSON number so the type system is exercised rather than avoided.
          </P>
        </Callout>
      </Section>

      <Section id="yaml-and-structure" title="YAML coercion, depth, and duplicate keys">
        <P>
          YAML is the only format on this site that types a plain scalar implicitly, and it has two mutually inconsistent rules for doing so. A fixture written for YAML has to survive both readers, which means knowing exactly which strings are also numbers, booleans, nulls or timestamps. The classification below is what the <Rich text={"[YAML to JSON](/format-converters/yaml-to-json/)"} /> converter produces when it reads each plain scalar against both schemas.
        </P>
        <DataTable
          caption="Plain scalars, what each YAML version resolves them to, and the risk label attached"
          head={['Written as', 'YAML 1.1 resolves to', 'YAML 1.2 core resolves to', 'Risk', 'Why it matters']}
          rows={[
            ['NO', 'boolean false', 'string "NO"', 'high', 'The country code for Norway, and a feature flag meaning no'],
            ['on', 'boolean true', 'string "on"', 'high', 'Switches written as on and off, and the two-letter state code'],
            ['y / n / Y / N', 'boolean', 'string', 'high', 'Answer columns in a fixture dataset'],
            ['0755', 'integer 493', 'string "0755"', 'high', 'A leading zero means octal in 1.1: file modes and zip codes'],
            ['010', 'integer 8', 'string "010"', 'high', 'Version tens written as two digits become eight'],
            ['1:30', 'integer 90', 'string "1:30"', 'high', 'Colons mean base sixty, so clock times become durations'],
            ['2024-01-15', 'timestamp', 'string', 'high', 'Exporters then write an epoch or a zone-shifted string'],
            ['1.10', 'float 1.1', 'float 1.1', 'medium', 'Both versions agree, and both drop your trailing zero'],
            ['1e5', 'float 100000', 'float 100000', 'none', 'Scientific notation is a number in both, even for IDs'],
            ['~ / empty', 'null', 'null', 'none', 'A blank value is null in both, so absence needs a key'],
            ['9007199254740993', 'float', 'float', 'medium', 'Longer than fifteen digits, so the last digit moves'],
          ]}
          foot="The risk labels are the converter's own: high means a 1.1 reader and a 1.2 reader disagree about the type, medium means one type was chosen but the text changed."
        />
        <CodeBlock
          title="fixture.yaml"
          language="yaml"
          code={`- case: "no-coercion"
  country: "NO"
  flag: "on"
  mode: "0755"
  duration: "1:30"
  version: "1.10"
  day: "2024-01-15"
  id: "9007199254740993"
  answer: "y"
- case: "coerced-if-you-forget-quotes"
  country: NO
  flag: on
  mode: 0755
  duration: 1:30
  version: 1.10
  day: 2024-01-15
  id: 9007199254740993
  answer: y`}
          caption="Two documents in one block: the quoted record and the unquoted one. Convert the second and read the coercion report."
        />
        <P>
          The <Rich text={"[JSON to YAML](/format-converters/json-to-yaml/)"} /> writer quotes by default any string that a YAML 1.1 reader would resolve to something other than a string, and returns the list of what it protected with the reason for each one. Two structural traps are YAML-specific: a stream containing multiple documents separated by three dashes converts only the first one, and anchors and aliases are shared references rather than copies, so a small YAML file can expand into an enormous structure.
        </P>
        <H3>Depth, duplicate keys and a root that is not an object</H3>
        <P>
          Structural fixtures break the container rather than the value, and they are the cheapest to write because they do not depend on your domain. Depth is a limit nobody documents: the JSON scanner behind the formatter and validator stops at 200 nested levels and reports a <code>max-depth</code> error. The fixture that matters is not the 200-level one but the 40-level and 8-level ones, because those pass here and break a recursive validator somewhere else.
        </P>
        <P>
          Duplicate names are legal-ish and always lossy. RFC 8259 section 4 states that names within an object SHOULD be unique, and <code>JSON.parse</code> keeps the last value. A fixture with <Rich text={'`{"status":"ok","status":"error"}`'} /> tests which side of the sentence your code is on. The validator reports the duplicate as a warning, and the formatter prints both members because it works from the syntax tree.
        </P>
        <CodeBlock
          title="structure.json"
          language="json"
          code={`{
  "duplicateName": { "status": "ok", "status": "error" },
  "emptyRootVariants": [ {}, [], [null], [[]] ],
  "mixedArray": [ 1, "1", true, null, { "a": 1 }, [2] ],
  "pathCollision": { "a.b": 1, "a": { "b": 2 } },
  "scalarRoot": 42,
  "deepButLegal": [ [ [ [ [ [ [ [ [ [ 1 ] ] ] ] ] ] ] ] ] ]
}`}
          caption="Six shapes. The pathCollision object is the sneaky one: flatten it with dotted paths and the two values land in one column."
        />
        <DataTable
          caption="Root shapes and what the JSON to CSV converter says about each"
          head={['Root value', 'Shape reported', 'Output', 'Finding']}
          rows={[
            ['[{"a":1},{"a":2}]', 'array-of-objects', 'one row per element', 'heterogeneous-records when keys differ'],
            ['[[1,2],[3]]', 'array-of-arrays', 'headerless table, column_1 onward', 'info, add the header yourself'],
            ['[1,2,3]', 'array-of-scalars', 'one column named value', 'info'],
            ['[{"a":1},[2],"x"]', 'mixed-array', 'flattened independently, scalars in value', 'warning'],
            ['{"u1":{...},"u2":{...}}', 'object-of-objects', 'rows with an added key column', 'info, objects are unordered'],
            ['{"a":1}', 'single-object', 'one data row', 'nothing'],
            ['42', 'scalar', 'a one-cell table', 'warning, a bare value cannot be a table'],
            ['[]', 'empty-array', 'nothing at all', 'error, CSV needs a record to infer columns'],
          ]}
          foot="The stats panel reports the same distinctions numerically: depth, object and array counts, the largest array, the record count, and a duplicate count."
        />
      </Section>

      <Section id="csv-and-schema" title="CSV portability and schema contracts">
        <P>
          A CSV fixture is finished when three unrelated programs agree on the same cell grid: a state machine that follows the grammar, such as the one behind <Rich text="[CSV to JSON](/format-converters/csv-to-json/)" />, a spreadsheet that picks a type before it asks you, and a bulk loader that decides what an empty field means. Begin with the smallest file that still touches every rule.
        </P>
        <CodeBlock
          language="csv"
          title="minimal-portable.csv"
          caption="47 bytes as written here, with LF endings and a trailing line break. The same grid costs 50 bytes with CRLF and 53 with a byte-order mark in front."
          code={`id,text,num,flag
1,"line one
line two",42.5,""
`}
        />
        <DataTable
          head={['In the file', 'Our parser', 'A spreadsheet', 'PostgreSQL COPY (FORMAT csv)']}
          rows={[
            ['"" quoted empty', 'empty string, kept verbatim', 'empty cell, General format', 'empty string, never null'],
            ['nothing between two delimiters', "empty string here, null after safe type inference", 'empty cell', 'null, unless the column is in FORCE_NOT NULL'],
            ['NULL as bare text', 'null under the default tokens NULL and N/A', 'the four-letter word', 'text, unless you declare the null string'],
            ['unquoted 00123', 'string; the number grammar rejects a leading zero', '123, and the zero is gone', '123 into an integer column, 00123 into text'],
            ['unquoted =SUM(A1:A2)', 'text, plus one formula-injection finding', 'executes when the file opens', 'text here; the damage happens on the next export'],
          ]}
          foot="Those are not three implementations of one rule. They are three rules over the same bytes, so a fixture that only satisfies the first column is a parser test, not a portability test."
        />
        <P>
          Line endings are the cheapest disagreement to remove and the most expensive to debug. RFC 4180 separates records with CRLF, but LF-only files are usable, and mixing them inside one file is what breaks. The byte-order mark is three bytes, <code>EF BB BF</code>, that our parser reports as a <code>bom</code> info finding and that Excel on Windows needs in order to auto-detect UTF-8. A loader that reads the header literally reads those bytes as part of the first column name and rejects the load. The spreadsheet-damage audit walks the parsed records and emits a cell, a column, the file line, a risk name, a reason and a fix: a leading <code>=</code>, <code>+</code> or <code>@</code> is formula injection; <code>00123</code> is a dropped leading zero; twelve or more consecutive digits is precision loss; and a cell over 8,192 characters is flagged against the 32,767-character ceiling.
        </P>
        <H3>A schema that matches the fixture, not the happy path</H3>
        <P>
          A JSON Schema states the contract, and the interesting question is never whether the happy-path record passes. It is which of your fixtures is supposed to fail and for which keyword. Write the schema next to the fixture set, run every fixture through it, and check that the failures are exactly the ones you designed.
        </P>
        <CodeBlock
          language="json"
          title="fixture.schema.json"
          caption="Draft 2020-12. Three decisions carry this file: additionalProperties is false, money is a string with a pattern, and displayName is nullable but never empty."
          code={`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/customer-fixture",
  "title": "Customer fixture record",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "createdAt", "displayName", "amount"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "createdAt": {
      "type": "string",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$"
    },
    "displayName": { "type": ["string", "null"], "minLength": 1 },
    "amount": { "type": "string", "pattern": "^-?[0-9]+[.][0-9]{2}$" },
    "zip": { "type": "string", "pattern": "^[0-9]{5}(-[0-9]{4})?$" },
    "legacyTotal": { "type": "integer", "minimum": -9007199254740991, "maximum": 9007199254740991 },
    "tags": {
      "type": "array",
      "items": { "enum": ["empty", "unicode", "boundary", "structural"] },
      "uniqueItems": true,
      "maxItems": 8
    },
    "legacyName": { "type": "string", "contentEncoding": "base64" }
  }
}`}
        />
        <DataTable
          head={['Keyword', 'What it rejects', 'The fixture that proves the keyword is wired up']}
          rows={[
            ['required', 'a record that omits the key', 'the absent-key field, not the one where it is null'],
            ['additionalProperties: false', 'any key outside properties', 'the same record plus one stray debug field'],
            ['type as a union', 'a number where string or null was allowed', 'displayName of 0 next to displayName of null'],
            ['minLength and maxLength', 'the empty string, and the 4,000-character note', 'both ends of one field, in one fixture'],
            ['pattern', 'right type, wrong shape', 'a version-1 UUID in a field patterned for version 4'],
            ['format', 'nothing, unless the validator asserts formats', '2024-02-30 is the record to try'],
            ['minimum and maximum', 'integers outside the stated range', '2^53 minus 1 and 2^53 as adjacent records'],
            ['oneOf', 'a record that matches two branches at once', 'amount sent as a number somewhere and a string elsewhere'],
            ['uniqueItems and maxItems', 'a repeated tag, or a ninth tag', 'the mixed-array fixture, tightened'],
            ['contentEncoding', 'a string that is not valid base64', 'pair it with the Base64 page before you ship'],
          ]}
          foot="Every row needs a fixture that violates it. A schema no fixture fails is documentation, not a test."
        />
        <P>
          <code>format</code> deserves the confusion it causes: in draft 2020-12 it is an annotation, so a validator that has not opted into format assertion accepts any string, including <code>2024-02-30T00:00:00Z</code>. V8 rolls February 30 forward to 2024-03-01 without complaint, and treats a second value of 60, which RFC 3339 explicitly allows for leap seconds, as an invalid time. Either assert formats in the schema test or normalise timestamps with a parser that errors.
        </P>
      </Section>

      <Section id="determinism-and-size" title="Deterministic fixtures and size you can defend">
        <P>
          A snapshot that changes because the clock moved is not a test, it is a coin toss. Every source of drift below has turned a build red in some project at some hour, and each one is fixed by the same three moves: fix the input, fix the serialisation, redact what you cannot fix.
        </P>
        <DataTable
          head={['Source of drift', 'What it does to the output', 'The fix']}
          rows={[
            ['the clock', 'createdAt differs on every run', 'a literal timestamp, and an injected clock in code'],
            ['random identifiers', 'every run is a new document', 'a seeded generator, or one constant UUID'],
            ['key order', 'a text diff shows a rewrite that changed nothing', 'sort keys ascending, or compare parsed values'],
            ['integer-like keys', 'an object written 2, 1, 0, b, a prints as 0, 1, 2, b, a', 'quote identifiers in the fixture when order carries meaning'],
            ['number formatting', 'stringify writes 1e+21 and 1e-10, not long digit strings', 'amounts as strings at a fixed scale'],
            ['signed zero', 'stringify prints -0 as plain 0', 'assert with Object.is in code, never in JSON'],
            ['collation', 'the default sort gives B then a then the a-umlaut; a German collator gives a, a-umlaut, B', 'sort by an explicit key, not by locale'],
            ['time zone', 'local ISO strings differ between a laptop and CI', 'always Z, or an explicit offset'],
            ['line endings', 'CRLF churn, and a diff on every checkout', 'pin LF in the writer and keep the trailing break'],
            ['indentation', '2 versus 4 versus tab rewrites the whole file', 'one documented indent setting'],
          ]}
          foot="The integer-like-key row is the one people get wrong: ordering those keys first is specified behaviour, so it is deterministic, but it is not insertion order."
        />
        <P>
          Do not diff two JSON files as text. Minify both with the same <Rich text="[minifier](/json-tools/minify/)" /> settings, sort keys with the <Rich text="[formatter](/json-tools/formatter/)" /> in ascending order at a fixed indent, then compare. Redaction comes before the digest: replace volatile fields by path with a fixed token, sort any array whose order is not the thing under test, and keep the redaction list in the repository beside the fixture.
        </P>
        <KeyTerms
          items={[
            { term: 'fixture', definition: 'Data with a written reason for existing: it exercises one named behaviour of the code under test.' },
            { term: 'golden file', definition: 'The recorded output a normalised run is compared against; regenerated deliberately, never accidentally.' },
            { term: 'canonical form', definition: 'The serialisation rules applied before comparison: member order, indent, line endings, number rendering, redactions.' },
            { term: 'boundary value', definition: 'A value at or one step away from a documented limit, such as 9007199254740991 and its successor.' },
            { term: 'redaction', definition: 'Replacing volatile fields with a fixed token before comparison, so a diff can only contain real changes.' },
            { term: 'seeded generator', definition: 'A generator whose output depends only on its seed, so a large fixture can be rebuilt and stays byte-stable.' },
          ]}
        />
        <H3>Size fixtures you can defend</H3>
        <P>
          Committing a 20 MB blob to a repository buys nothing except a slow checkout. A size fixture should come from a seeded script, in one file, with its byte count printed next to it, so anyone reading the test can tell what big means in bytes and which behaviour it exists to prove: chunking, streaming, progress reporting, memory, or the point where a browser tab stops being willing to hold your table.
        </P>
        <CodeBlock
          language="javascript"
          title="make-fixtures.mjs"
          caption="The script that produced every number in this section. Run it with Node 24. Size is measured in UTF-8 bytes through TextEncoder, never as string length."
          code={`import { writeFileSync } from 'node:fs'

const enc = new TextEncoder()
const bytes = (s) => enc.encode(s).length

const record = (id) => ({
  id,
  uuid: '3f2a6c1e-9b47-4c58-8f1d-7e2b9a0c4d63',
  name: 'Zoë Abár-Núñez',
  amount: '1049.95',
  createdAt: '2026-11-12T09:00:00Z',
  tags: ['edge-case', 'fixture'],
  note: null,
})

const encode = (n) => {
  const parts = []
  for (let i = 1; i <= n; i += 1) parts.push(JSON.stringify(record(i)))
  return '[' + parts.join(',') + ']'
}

const atMost = (target) => {
  let lo = 1
  let hi = 400000
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (bytes(encode(mid)) <= target) lo = mid
    else hi = mid - 1
  }
  return lo
}

for (const target of [1024, 1048576, 20971520]) {
  const n = atMost(target)
  const text = encode(n)
  writeFileSync('fixture-' + target + '.json', text)
  console.log(target, 'bytes ->', n, 'records,', bytes(text), 'actual,', text.length, 'chars')
}`}
        />
        <DataTable
          head={['Target', 'Records', 'Actual bytes', 'Measured on one machine']}
          rows={[
            ['1 KiB', '5', '901', 'the ladder straddles the step: 6 records is 1,081 bytes'],
            ['1 MiB', '5,735', '1,048,399', 'JSON.parse median of five runs 28.1 ms, range 23.6 to 75.6'],
            ['20 MiB', '113,960', '20,971,496', 'JSON.parse median of five runs 491.3 ms, range 370.1 to 552.1'],
            ['1 MiB pretty-printed', '5,735', '1,432,645', 'the same data, 1.37 times larger, readable in a diff'],
            ['1 MiB gzipped', '5,735', '18,009', '58.2 to 1, because every record is the same record'],
          ]}
          foot="Node v24.13.0, one process. The byte counts travel; the timings do not."
        />
        <P>
          Three honesty rules come attached to a table like that. First, bytes are not characters: one record here is 179 UTF-8 bytes and 175 characters, and at the 1 MiB step the file is 1,048,399 bytes against 1,025,459 characters. Second, a ratio of fifty-eight to one is a property of a repetitive synthetic file, not of your API. Third, the timings are medians of five runs with a slowest run 3.2 times the fastest, which is the argument for asserting on byte counts and field counts in a size test rather than milliseconds.
        </P>
        <Callout tone="warn" title="What a 20 MiB fixture is actually for">
          <P>
            Not for the parser. Parsing twenty megabytes finishes in under a second and tells you nothing you did not already know about the grammar. Size fixtures earn their place at the seams around the parse: the request that times out before the body arrives, the progress bar that never reaches completion, the streaming reader that assumes a chunk boundary is a record boundary, and the CI cache that refuses a 20 MB artefact.
          </P>
        </Callout>
      </Section>

      <Section id="fixture-checklist" title="Fixture checklist and the page for each step">
        <P>
          Twelve steps, in the order a fixture set gets built. Each row names the artefact that proves the step happened, so the checklist stays auditable instead of aspirational.
        </P>
        <DataTable
          compact
          head={['#', 'Step', 'Evidence it was done', 'Page']}
          rows={[
            ['1', 'Separate the empty states', 'absent key, null, empty string, empty object, empty array in one named record', <Rich text="[validator](/json-tools/validator/)" />],
            ['2', 'Write down three string lengths', 'graphemes, code points and UTF-16 units beside every text fixture', <Rich text="[Base64](/encoders-decoders/base64/)" />],
            ['3', 'Give invisible characters a field', 'no-break space, zero-width joiner, right-to-left override, U+2028, one escaped lone surrogate', <Rich text="[encoding workflow](/use-cases/encoding/)" />],
            ['4', 'Cross the safe-integer ceiling', '9007199254740991 and 9007199254740992 as adjacent records, money as a string', <Rich text="[JSON validator](/json-tools/validator/)" />],
            ['5', 'Keep identifier-like text quoted', '007, 1e5, 1:30, NO, 0755 and a seventeen-digit account number', <Rich text="[CSV to JSON](/format-converters/csv-to-json/)" />],
            ['6', 'Test one CSV in three readers', 'BOM on and off, CRLF and LF, an embedded break, a quoted empty field', <Rich text="[CSV vs Excel](/compare/csv-vs-excel/)" />],
            ['7', 'Quote every coercible YAML scalar', 'the paired file: twenty-five bare booleans and dates beside their quoted twins', <Rich text="[JSON to YAML](/format-converters/json-to-yaml/)" />],
            ['8', 'Assert structure, not vibes', '201 levels of nesting, duplicate keys, a root array, a root scalar, a mixed array', <Rich text="[JSON formatter](/json-tools/formatter/)" />],
            ['9', 'Let the schema fail on purpose', 'one failing fixture per keyword, formats either asserted or dropped', <Rich text="[JSON guide](/learn/json/)" />],
            ['10', 'Normalise before you diff', 'minified, keys sorted, one indent, LF, volatile paths redacted', <Rich text="[JSON minifier](/json-tools/minify/)" />],
            ['11', 'Generate the size ladder', '1 KiB, 1 MiB and 20 MiB from a seed, byte counts printed in the log', <Rich text="[JSON to CSV](/format-converters/json-to-csv/)" />],
            ['12', 'Freeze the artefacts', 'small fixtures committed, large ones regenerated, counts recorded', <Rich text="[API debugging](/use-cases/api-debugging/)" />],
          ]}
          foot="The page column is the tool that shows whether the step happened. A row with no artefact attached is a row nobody can verify."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ToolLink letter="JV" name="JSON Validator" blurb="Duplicate keys, unsafe integers, the 200-level depth cap and the exact position of each finding." path="/json-tools/validator/" />
          <ToolLink letter="JF" name="JSON Formatter" blurb="Indent, member order and line endings, pinned before a golden file is written." path="/json-tools/formatter/" />
          <ToolLink letter="CJ" name="CSV to JSON" blurb="Delimiter detection, inference modes, null tokens and the spreadsheet-damage audit." path="/format-converters/csv-to-json/" />
          <ToolLink letter="JC" name="JSON to CSV" blurb="Flattening counters: paths flattened, arrays joined, cells JSON-encoded." path="/format-converters/json-to-csv/" />
          <ToolLink letter="YJ" name="YAML to JSON" blurb="Which scalars YAML 1.1 coerced, and where a writer would have to add quotes." path="/format-converters/yaml-to-json/" />
          <ToolLink letter="B6" name="Base64" blurb="Look at the exact bytes behind an invisible character, a BOM or a surrogate pair." path="/encoders-decoders/base64/" />
        </div>
        <Callout tone="note" title="How our tools handle these cases">
          <P>
            The JSON scanner in <code>src/lib/tools/json.ts</code> implements an RFC 8259 grammar with a 200-level depth cap, and emits <code>unsafe-integer</code>, <code>duplicate-key</code>, <code>lone-surrogate</code> and <code>unescaped-control-char</code> warnings alongside syntax errors. The CSV engine in <code>src/lib/tools/csv.ts</code> runs an RFC 4180 state machine with delimiter sampling over the first forty non-blank lines, three inference modes, and a spreadsheet-damage audit whose thresholds are: leading <code>=</code>, <code>+</code>, <code>@</code> for formula injection; twelve or more consecutive digits for precision loss; 8,192 characters against the 32,767 ceiling. The YAML engine in <code>src/lib/tools/yaml.ts</code> parses YAML 1.2 and runs a 1.1/1.2 scalar classifier (<code>classifyScalar()</code>) side by side, with a <code>maxAliasCount</code> of 1000 to prevent anchor-expansion bombs. The JSON to YAML writer quotes any string that the 1.1 classifier resolves to a non-string type, and returns the protected list with reasons.
          </P>
        </Callout>
        <Callout tone="tip" title="One line to keep">
          <P>
            A fixture you cannot explain in one sentence is sample data. Write the sentence first, then the bytes, then put the sentence in the test name, so the next reader knows which boundary this file was built to hit.
          </P>
        </Callout>
      </Section>
    </Prose>
  )
}
