/**
 * JSON: The Complete Specification Guide.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * Optimised for readability: TL;DR per section, prose cut ~50%, FAQ answers ≤80 words.
 * Tool behaviour claims verified against src/lib/tools/json.ts and json-repair.ts
 * (Node 24.13.0, 2026-11-12).
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'json',
  path: '/learn/json/',
  title: 'JSON Complete Guide: Grammar, Numbers & Pitfalls | FmtTools',
  description:
    'JSON explained against RFC 8259 and ECMA-404: grammar, the 2^53-1 integer wall, duplicate keys, NDJSON, JSON Pointer, JSON Schema and measured behaviour.',
  h1: 'JSON: The Complete Specification Guide',
  summary:
    'The grammar, the number rules, duplicate names, member order, and the damage a lenient parser hides — with a TL;DR per section.',
  keywords: ['json guide', 'rfc 8259', 'ecma-404', 'json number precision', 'duplicate json keys', 'ndjson', 'json pointer', 'json schema'],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 10,
  sections: [
    { id: 'json-and-its-standards', label: 'What JSON is, and the two standards behind it' },
    { id: 'grammar', label: 'The grammar, in one pass' },
    { id: 'strings-and-encoding', label: 'Strings and encoding' },
    { id: 'numbers', label: 'Numbers and the 2^53 wall' },
    { id: 'objects', label: 'Objects: member order and duplicate names' },
    { id: 'ecosystem', label: 'JSON outside a single file' },
    { id: 'our-tools', label: 'How our JSON tools handle these cases' },
  ],
  faqs: [
    {
      question: 'Is my JSON uploaded anywhere when I use these tools?',
      answer:
        'No. The engine runs in the browser tab; the document never leaves it. There is no server-side record of a validation run, so capture the diagnostics yourself if you need an audit trail. The repair pass is the one step that rewrites your data locally — read its fix list before the output goes near a repository.',
    },
    {
      question: 'Our API sends 64-bit identifiers as JSON numbers. Do we have to change the schema?',
      answer:
        'Not today, but decide who is exposed. RFC 8259 §6 makes integers in [-(2^53)+1, (2^53)-1] interoperable, so a field that cannot exceed 9007199254740991 is fine until it is not. Stop routing it through parse-then-stringify hops (that is where the last digit changes silently), and make the field a string as the end state — shipped as a new field or version, not edited in place.',
    },
    {
      question: 'Do I need JSON Schema if my parser already rejects malformed input?',
      answer:
        'Yes. A green parse says the text is grammatical, nothing about the contract. The grammar cannot say an identifier matches a pattern, a timestamp carries an offset, a field may be absent but not null, or that unknown members are forbidden. Start with four assertions that pay for themselves: type plus pattern, required versus nullable, numeric bounds, and a rule for extra members.',
    },
    {
      question: 'The response is already gzipped and still too big. What do I change first?',
      answer:
        'Whitespace is the smallest lever left. On the 4.1 MB fixture here, pretty-printing cost 1.72 MB over minified, but after gzip the two came out 2.1% apart — indentation is the most compressible thing in the file. Minify for storage, then attack content: fewer fields, pagination, and move base64 blobs out of band (they are nearly incompressible).',
    },
    {
      question: 'Is JSON.parse safe to call on text from an untrusted source?',
      answer:
        'The parse itself is; the risk is what you do next. Never turn a document into an object with eval or Function (RFC 8259 §12). A member named __proto__ is ordinary data to JSON.parse, but naive recursive merge code later can pollute prototypes. Parse into a tree, validate against a schema, and only then merge it into anything.',
    },
  ],
  sources: [
    {
      label: 'RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format',
      href: 'https://datatracker.ietf.org/doc/html/rfc8259',
      detail:
        'Read for §2 (ABNF), §3 (seven values), §4 (names SHOULD be unique), §6 (IEEE 754 binary64 and the exact-integer range), §7 (MUST-escape set), §8.1/§8.2/§8.3 (UTF-8, BOM, surrogates), §9/§10 (parser/generator MUSTs), §11.1 (application/json), §12 (eval and limits).',
      accessed: '2026-11-12',
    },
    {
      label: 'ECMA-404 — JSON Data Interchange Syntax',
      href: 'https://tc39.es/ecma404/',
      detail:
        'The nine-section syntax document; conformance statement and the "does not require that name strings be unique" sentence.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7464 — JSON Text Sequences',
      href: 'https://datatracker.ietf.org/doc/html/rfc7464',
      detail: 'Record-separator framing, application/json-seq registration.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8785 — JSON Canonicalization Scheme (JCS)',
      href: 'https://datatracker.ietf.org/doc/html/rfc8785',
      detail: 'Property-name sorting as UTF-16 code-unit arrays, no duplicate names, number serialisation deferred to ECMAScript.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 6901 — JSON Pointer',
      href: 'https://datatracker.ietf.org/doc/html/rfc6901',
      detail: 'Syntax and the two escape rules (tilde to ~0, slash to ~1).',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7386 — JSON Merge Patch',
      href: 'https://datatracker.ietf.org/doc/html/rfc7386',
      detail: 'Null in a patch means removal; recursive rule.',
      accessed: '2026-11-12',
    },
    {
      label: 'JSON Schema specification index',
      href: 'https://json-schema.org/specification',
      detail: '2020-12 current release; core plus validation documents.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/json-tools/formatter/', name: 'JSON Formatter', blurb: 'Re-indent without rewriting digits, key order or duplicate members.' },
    { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Line, column and offset for every error, plus the warnings JSON.parse hides.' },
    { path: '/json-tools/minify/', name: 'JSON Minifier', blurb: 'Byte savings, gzip comparison and a verified round trip.' },
    { path: '/use-cases/api-debugging/', name: 'Tools for Debugging HTTP APIs', blurb: 'The triage order for a response that will not parse.' },
    { path: '/learn/yaml/', name: 'YAML: The Complete Guide', blurb: 'The superset claim, implicit typing and where JSON and YAML disagree.' },
    { path: '/encoders-decoders/base64/', name: 'Base64 Encode & Decode', blurb: 'What binary data looks like once JSON forces it into a string.' },
  ],
  words: 1856,
  image: '/images/covers/learn-json.png',
  imageAlt: 'A JSON document annotated with the RFC 8259 clauses that govern it: grammar, number precision, duplicate names and UTF-8 encoding.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        The JSON grammar is about eight productions long, and almost nothing that goes wrong in production goes wrong inside them. It goes wrong in the
        sentences around the grammar: what a number means once a reader turns it into a double, what happens when the same name appears twice, and who
        decides member order. Examples here paste straight into the <a href="/json-tools/validator/">JSON validator</a>.
      </Lead>

      <Section id="json-and-its-standards" title="What JSON is, and the two standards behind it" kicker="Foundations">
        <P>
          <strong>TL;DR.</strong> Two standards describe the same grammar; the bugs live in what neither of them defines.
        </P>
        <P>
          JSON has two normative descriptions. <strong>RFC 8259</strong> is the IETF document: grammar in §2, values in §3, objects in §4, arrays in §5,
          numbers in §6, strings in §7, encoding in §8, parser/generator duties in §9 and §10, media type in §11, security in §12. <strong>ECMA-404</strong>
          is the Ecma standard: a deliberately tiny syntax document. The rules are the same; the coverage is not — byte order marks, the media type and
          <code>eval</code> are RFC 8259 territory only.
        </P>
        <DataTable
          caption="Where each standard answers the questions that bite. Section numbers read 2026-11-12."
          head={['Question', 'RFC 8259', 'ECMA-404']}
          rows={[
            ['Duplicate member names', '§4: SHOULD be unique; behaviour unpredictable', '§6: no uniqueness required'],
            ['Number syntax and precision', '§6', '§8 Numbers'],
            ['UTF-8, BOM, surrogates', '§8.1, §8.2, §8.3', 'Not covered'],
            ['Media type, eval, limits', '§11.1, §12', 'Not covered'],
          ]}
          foot="Where they agree, quote either. Where they differ, RFC 8259 is the one other specs (7464, 8785, 9457) reference."
        />
        <H3>One value per document</H3>
        <P>
          The first production is the whole answer about document shape: one value, optional whitespace, nothing else. A bare number, string or literal is a
          complete document. That was not always true — RFC 4627 required an object or array at the top, which is why a decade of tooling wraps everything in
          an object. RFC 8259 lifted the restriction; the question today is whether the reader in front of you accepts a scalar.
        </P>
        <H3>The media type, in one line</H3>
        <P>
          RFC 8259 §11.1 registers <code>application/json</code> with no charset parameter. UTF-8 is mandatory from §8.1 and a BOM is forbidden on
          network-transmitted JSON — so a document arriving with EF BB BF at offset zero is non-conforming whatever the Content-Type says. Only
          application/json is registered; the text/json name has nothing behind it.
        </P>
        <H3>What neither document defines</H3>
        <P>
          Both standards describe a <em>text</em>. They do not define a data model beyond seven values, a type system, a date format, a way to carry bytes, a
          schema language, member identity, ordering semantics, or any comment syntax. That silence is where most JSON bug reports come from: the format never
          asked the question, so everything a team needs past well-formedness has to be written down outside the file.
        </P>
        <Callout tone="tip" title="A header checklist before you blame the parser">
          <P>
            Declare <code>Content-Type: application/json</code> with no charset. Send UTF-8, never with a BOM. Put gzip or br in
            <code>Content-Encoding</code> — that is the axis that actually pays. Keep the body a single value; for many, use RFC 7464 framing. Check those four
            in order before concluding the parser is broken.
          </P>
        </Callout>
        <KeyTerms
          items={[
            { term: 'JSON text', definition: 'One value with optional insignificant whitespace around it (RFC 8259 §2).' },
            { term: 'value', definition: 'One of seven forms: object, array, number, string, true, false, null (§3).' },
            { term: 'member', definition: 'A name plus a colon plus a value, inside an object (§4).' },
            { term: 'name', definition: 'A string used as a key. SHOULD be unique (§4), but repeats are grammatical.' },
            { term: 'well-formed', definition: 'Conforms to the grammar. Says nothing about whether values are legal for your API — that is a schema question.' },
            { term: 'interoperable', definition: 'The spec\'s word for "implementations will agree". Used for exact integers in [-(2^53)+1, (2^53)-1] (§6).' },
          ]}
        />
      </Section>

      <Section id="grammar" title="The grammar, in one pass" kicker="RFC 8259 §2 and §3">
        <P>
          <strong>TL;DR.</strong> Eight productions, four whitespace characters, seven values — the whole syntax fits in one screen.
        </P>
        <P>The whole syntax is below; everything else in the two standards is commentary on one of its lines.</P>
        <CodeBlock
          title="ABNF, RFC 8259 §2 (condensed)"
          language="abnf"
          code={`JSON-text = ws value ws
value = object / array / number / string / true / false / null
ws = *( %x20 / %x09 / %x0A / %x0D )   ; space, tab, LF, CR only`}
          caption="Every pair of tokens may be separated by ws, and ws is exactly space, tab, LF and CR — nothing else. The full production list is in RFC 8259 §2."
        />
        <P>
          The whitespace rule is a closed list. No vertical tab, no non-breaking space, no zero-width space. A document copied out of a word processor often
          carries U+00A0 where a plain space looks identical, and the failure is mysterious because every editor renders it as a gap.
        </P>
        <H3>The seven values, and the ones that are missing</H3>
        <P>
          RFC 8259 §3 closes the type system: a value is an object, array, number, string, or one of <code>true</code>, <code>false</code>, <code>null</code> —
          lowercase only. That is the complete vocabulary, and it is smaller than almost every schema it describes.
        </P>
        <DataTable
          caption="Types people need and the convention each community settled on."
          head={['Need', 'JSON has', 'The convention, and its failure mode']}
          rows={[
            ['Timestamps', 'string or number', 'RFC 3339 text or epoch integers. Mixing the two in one field breaks consumers silently.'],
            ['Binary data', 'string', 'base64 — adds 33% and loses magic-byte checking unless you decode.'],
            ['Integers over 2^53-1', 'number', 'Send as strings. RFC 8259 §6 does not promise arbitrary precision.'],
            ['Currency', 'number', 'Strings or integer minor units. Binary floating point cannot hold 0.1 exactly.'],
            ['Absent field', 'nothing', 'Omit the member. null is not absence — RFC 7386 merge patch gives null the opposite meaning: deletion.'],
            ['Comments', 'nothing', 'Not available. JSONC and JSON5 allow them; convert before the payload leaves the editor.'],
          ]}
          foot="Every row is a contract you must write down outside the JSON, because the format cannot carry it."
        />
        <Callout tone="spec" title="Three ways a document ends badly at the top level">
          <P>
            <code>{'{"a":1}{"b":2}'}</code> is trailing content, not a document — it is the shape of a JSON Lines file. <code>{'{"a":1}}'}</code> is a hand-closed
            brace after a complete value. A file of blank lines is empty input, a different failure from a truncated one. All three are errors, not warnings.
          </P>
        </Callout>
      </Section>

      <Section id="strings-and-encoding" title="Strings and encoding" kicker="RFC 8259 §7 and §8">
        <P>
          <strong>TL;DR.</strong> Six characters must be escaped; UTF-8 is mandatory; BOM is forbidden; a lone surrogate becomes the replacement character.
        </P>
        <P>
          §7 defines a string as a sequence of Unicode code points in quotation marks. The MUST-escape set is small: quotation mark, reverse solidus, and the
          control characters U+0000 through U+001F. Everything else is optional — the forward solidus may be escaped, and any character may be written raw or
          as <code>\uXXXX</code>.
        </P>
        <DataTable
          caption="The complete escape inventory. Anything not in this table is not a JSON escape."
          head={['Sequence', 'Code point', 'Required?']}
          rows={[
            ['\\"', 'U+0022 quotation mark', 'Yes — the only way to put a double quote inside a string.'],
            ['\\\\', 'U+005C reverse solidus', 'Yes — a single backslash must become two.'],
            ['\\/', 'U+002F solidus', 'Optional. Exists for HTML embedding inside <script>.'],
            ['\\b \\f \\n \\r \\t', 'U+0008 U+000C U+000A U+000D U+0009', 'Required for those control characters.'],
            ['\\uXXXX', 'any', 'Optional for everything; four hex digits, case-insensitive.'],
            ['\\x41, \\0, \\Z', 'not defined', 'Invalid — C, JavaScript or CSS syntax, not JSON.'],
          ]}
          foot="The MUST-escape set is small on purpose: a scanner can find the end of a string without context."
        />
        <H3>UTF-8, BOMs and lone surrogates</H3>
        <P>
          §8.1 fixes UTF-8 and forbids a BOM on network-transmitted JSON. A BOM is not whitespace — it is invisible, absent from the ws set, and changes the
          first byte, so anything that hashes or compares the document gets a different answer. That is why files saved by Notepad parse in a browser and are
          rejected elsewhere.
        </P>
        <P>
          §8.2 names the surrogate hazard: a library that truncates a UTF-16 string mid-pair produces a lone surrogate, and UTF-8 has no room for surrogate
          code units. Measured in Node 24.13.0, encoding U+D83D with TextEncoder produces EF BF BD — the replacement character. An emoji becomes a question
          mark in a log line, and no error is raised.
        </P>
        <Callout tone="warn" title="Control characters are data loss waiting to happen">
          <P>
            A raw tab or line break inside a string violates §7. The paste-a-log-line failure: text copied from a log file arrives with literal line breaks a
            generator would have escaped. Same value, different bytes — a text-level diff reports a change that did not happen.
          </P>
        </Callout>
      </Section>

      <Section id="numbers" title="Numbers and the 2^53 wall" kicker="RFC 8259 §6">
        <P>
          <strong>TL;DR.</strong> Integers above 2^53-1 are not safe — send them as strings. <code>0.1 + 0.2</code> is <code>0.30000000000000004</code>; that
          is IEEE-754, not a bug.
        </P>
        <P>
          A JSON number is an optional minus, an integer part (single zero or nonzero digit followed by digits), an optional fraction, and an optional
          exponent. Leading zeros are not allowed. Neither standard sets a digit limit, distinguishes integers from reals, or admits NaN or Infinity — those
          are not JSON.
        </P>
        <P>
          Then the sentence that explains most incidents: §6 recommends IEEE 754 binary64 precision, and integers in [-(2^53)+1, (2^53)-1] are interoperable.
          That is ±9007199254740991. Above 2^53 the spacing between representable doubles becomes 2, so odd integers round to their nearest even neighbour.
        </P>
        <CodeBlock
          title="the boundary, run in Node 24.13.0"
          language="javascript"
          code={`JSON.parse('9007199254740993')   // 9007199254740992  not representable, ties-to-even
JSON.parse('1e400')              // Infinity          out of range, silently
JSON.parse('0.1') + 0.2          // 0.30000000000000004
String(1e21)                     // '1e+21'           JSON.stringify rewrites it`}
          caption="Every line is the value returned by the runtime. Neither Infinity nor 0-from-underflow is a valid JSON number to re-emit."
        />
        <DataTable
          caption="What a JavaScript reader does to a JSON number. Verified on Node 24.13.0."
          head={['Literal', 'What Number holds', 'Consequence']}
          rows={[
            ['9007199254740993', '9007199254740992', 'The classic ID bug: last digit changes, no error raised.'],
            ['0.1', '0.10000000000000000555…', 'A binary approximation. 0.1 + 0.2 is 0.30000000000000004.'],
            ['1e400', 'Infinity', 'No range error. A strict generator cannot write Infinity back out.'],
            ['1e-400', '0', 'No underflow error: a tiny quantity becomes exactly zero.'],
            ['-0', 'negative zero', 'Object.is() distinguishes it, but JSON.stringify writes 0.'],
          ]}
          foot="A non-JavaScript reader may reject what V8 silently rounds. Neither outcome is a spec violation."
        />
        <H3>Carrying an integer above the wall</H3>
        <P>
          Real systems hand out 64-bit and 128-bit identifiers constantly — database bigints, snowflake IDs, nanosecond timestamps. None fit in 53 bits. The
          defensible fix is to <strong>quote the value as a string</strong> and do arithmetic after parsing in a library that knows about big integers. A
          BigInt replacer in <code>JSON.stringify</code> works at the boundary; a precision-keeping parser fixes only the reader, and the next hop that uses
          <code>JSON.parse</code> still rounds. A reviver cannot rescue the digits — by the time JSON.parse calls it, the literal is already a double.
        </P>
        <Callout tone="warn" title="Decimal drift is not a JavaScript bug">
          <P>
            Money belongs in a string, in integer minor units, or in a schema that constrains the pattern. Put it in a JSON number and you have delegated the
            rounding rule to every reader that consumes your API. If a field is an identifier, make it a string from the start — 63 bits is not a comfort
            margin.
          </P>
        </Callout>
      </Section>

      <Section id="objects" title="Objects: member order and duplicate names" kicker="RFC 8259 §4">
        <P>
          <strong>TL;DR.</strong> Member order has no spec semantics; duplicate keys are grammatical but behaviour is unpredictable — most runtimes keep the
          last value silently.
        </P>
        <P>
          The grammar makes an object a sequence of members, so a document has an order, but neither standard says whether that order carries meaning. In
          practice it is a property of the text, which is why RFC 8785 canonicalisation exists. Arrays are ordered by definition in §5 — "objects are
          dictionaries, arrays are lists" is the only portable mental model.
        </P>
        <P>
          What implementations do anyway is the part people forget to test. Measured in V8, parsing members written as b, a, 2, 1, 10 yields the key sequence
          1, 2, 10, b, a — integer-like keys first in ascending numeric order, then the rest in insertion order. That is an ECMAScript object rule leaking
          through a JSON reader. Python preserves insertion order; Go randomises map iteration on purpose; Java depends on the Map class. Code that diffs two
          documents by key order finds differences the data never had.
        </P>
        <P>
          Duplicates get a soft rule followed by a hard warning. §4: "The names within an object SHOULD be unique." and "behaviour of software that receives
          such an object is unpredictable." A repeated key is grammatical, and the only guarantee is that nobody knows what your consumer will do.
        </P>
        <CodeBlock
          title="the same member twice"
          code={`{"a":1,"b":2,"a":3}`}
          caption="19 bytes, valid JSON, parses without an error in every conforming reader. What it means is the open question."
        />
        <DataTable
          caption="What the 19 bytes above mean, depending on the reader."
          head={['Reader', 'Result', 'Why']}
          rows={[
            ['JavaScript runtime', 'last value', 'Silent. The first value is gone with no message.'],
            ['A member-list reader', 'both members', 'What a diagnostic tool needs to report the collision.'],
            ['A native-object rebuild', 'last value', 'Cannot do otherwise once the structure is an object.'],
          ]}
          foot="Same bytes, three answers. That difference is precisely the §4 unpredictability."
        />
        <Callout tone="warn" title="Sorting is not canonicalising">
          <P>
            Alphabetical and canonical sorting are different operations. RFC 8785 §3.2.3 compares names as arrays of UTF-16 code units — unsigned numeric, not
            locale collation. A locale-aware sort puts "item10" before "item9": right for a readable diff, wrong for bytes that go into a signature.
          </P>
        </Callout>
      </Section>

      <Section id="ecosystem" title="JSON outside a single file" kicker="Framing, paths, digests, contracts">
        <P>
          <strong>TL;DR.</strong> NDJSON for streaming records, JSON Pointer for paths, RFC 8785 for signing — each owns one job, do not mix them.
        </P>
        <P>
          Almost every complaint that "JSON can't do X" has an answer in four categories: supersets that add syntax, framing conventions for concatenating
          documents, carriers that use JSON to express something else, and a contract layer. The table is the map.
        </P>
        <DataTable
          caption="Neighbours of JSON, grouped by what they change."
          head={['Name', 'Category', 'What it adds or requires']}
          rows={[
            ['JSONC / JSON5', 'superset', 'Comments, trailing commas, unquoted keys, single quotes. De-facto; not JSON.'],
            ['YAML 1.2', 'superset claim', 'Grammar is a superset; typing is dangerous — see the [YAML guide](/learn/yaml/).'],
            ['RFC 7464', 'framing', 'Record separators (U+001E) around whole JSON texts; application/json-seq.'],
            ['NDJSON / JSON Lines', 'framing', 'One JSON text per line, LF terminator. Toolable (wc -l, tail -f), unforgiving of raw newlines.'],
            ['RFC 6901 Pointer', 'carrier', 'A path string addressing members/elements; tilde→~0, slash→~1.'],
            ['RFC 7386 Merge Patch', 'carrier', 'A partial document whose nulls mean delete. Cannot append to arrays.'],
            ['RFC 8785 JCS', 'canonical', 'One legal spelling per value for stable digests; keys sorted as UTF-16 units, no duplicates.'],
            ['JSON Schema 2020-12', 'contract', 'A vocabulary of assertions written in JSON describing what a document must look like.'],
          ]}
          foot="Nothing in the superset rows is JSON. A file that parses in one tool and fails in another is almost always one of those rows."
        />
        <H3>Many records: NDJSON and RFC 7464</H3>
        <P>
          One value per document is a problem for logs and paged results. NDJSON is a convention: one JSON text per line, LF terminator. RFC 7464 is a
          specification: each record is prefixed by U+001E and followed by LF, so a reader can resynchronise after a half-written record. NDJSON trades that
          robustness for toolability — <code>wc -l</code> counts records, <code>tail -f</code> works, <code>grep</code> finds a line.
        </P>
        <CodeBlock
          title="three log records, 175 bytes"
          language="json"
          code={`{"ts":"2026-11-12T09:00:00Z","lvl":"info","msg":"start"}
{"ts":"2026-11-12T09:00:01Z","lvl":"warn","msg":"retry 1"}
{"ts":"2026-11-12T09:00:02Z","lvl":"error","msg":"gave up"}`}
          caption="Valid as three JSON texts, invalid as one. A record whose string value contains a raw newline breaks the line-based framing."
        />
        <H3>Paths and canonical bytes</H3>
        <P>
          A JSON Pointer (RFC 6901) is a string naming a location: <code>/foo/0</code> addresses the first element of foo. Two escapes are the entire
          subtlety — a tilde in a name is <code>~0</code>, a slash is <code>~1</code>, and decode order matters: <code>~01</code> resolves to <code>~1</code>,
          not to a slash. RFC 7386 merge patch sends a partial document whose nulls mean delete; it cannot append to an array or delete one element.
        </P>
        <P>
          RFC 8785 canonicalisation exists because hashing needs one spelling per value: keys sorted as UTF-16 code-unit arrays, numbers in ECMAScript
          serialisation, no duplicate names. JCS fixes spelling, not precision — a number a double cannot hold has already lost its digits before
          canonicalisation begins.
        </P>
        <CodeBlock
          title="one document, three spellings, three digests"
          code={`input         {"c": [1, 1.0e2], "a": {"b": [true]}, "d": null}   48 bytes
JCS canonical  {"a":{"b":[true]},"c":[1,100],"d":null}           39 bytes`}
          caption="Both lines are valid JSON and mean the same value. Only the second produces a digest your counterparty will reproduce."
        />
        <Callout tone="note" title="Telling a dialect from its first deviation">
          <P>
            Identify the format before editing the data. A slash before a comment marker is JSONC or JSON5. A single-quoted value is JSON5 or a Python repr. A
            stream separated by U+001E is an RFC 7464 sequence. None of these are fixed by changing the file — they are fixed by choosing the right loader, or
            by <a href="/format-converters/json-to-yaml/">converting</a> if the file is really a configuration document.
          </P>
        </Callout>
      </Section>

      <Section id="our-tools" title="How our JSON tools handle these cases" kicker="src/lib/tools/json.ts">
        <P>
          <strong>TL;DR.</strong> The engine never calls <code>JSON.parse</code>, so it preserves number digits, duplicate keys and member order. The repair
          pass does rewrite values — read its fix list first.
        </P>
        <P>
          Every claim here came from running the actual modules. The engine is a scanner that builds an AST plus three printers and a statistics pass. It never
          calls <code>JSON.parse</code> to do the work, because <code>JSON.parse</code> is the mechanism that destroys the information the tools exist to
          preserve: order, duplicate members, and the exact characters of every number.
        </P>
        <P>
          The consequences: <code>{'{"id":9007199254740993}'}</code> round-trips as 9007199254740993 with one unsafe-integer warning instead of silently
          becoming …92. Duplicate members are kept in the output. Output is stable — one pass re-parses and re-prints to identical bytes, and at indent 2 with
          LF the printed bytes matched <code>JSON.stringify(value, null, 2)</code> across a 6 MB document.
        </P>
        <DataTable
          caption="Printing and analysis options, as the tools expose them."
          head={['Option', 'Values', 'Behaviour that matters']}
          rows={[
            ['Indent', '2, 4, tab, custom', 'Insignificant: the value is unchanged, only byte count moves.'],
            ['Key order', 'keep, ascending, descending, numeric', 'Sort modes use locale-aware collation — not RFC 8785 canonicalisation.'],
            ['Line ending', 'LF or CRLF', 'No trailing newline in either mode.'],
            ['Unicode escaping', 'on or off', 'On, rewrites everything above U+007E plus solidus; astral chars as 12-char surrogate-pair form.'],
          ]}
          foot="Errors stop the pipeline: the formatter and minifier print nothing rather than emit a document a conforming reader would reject."
        />
        <H3>Measured performance</H3>
        <P>
          The fixture is a synthetic array of 20,000 records with ten members each — 4.3 MB minified, 6.0 MB at indent 2 — on Node 24.13.0. Native
          <code>JSON.parse</code> ran in 96 ms (about 45 MB/s); a fidelity parser that keeps raw text, decoded value and byte offsets per node ran in 1,074 ms
          (about 4 MB/s). Eleven times slower buys inspection and diagnosis. After gzip, minified and pretty-printed came out 2.1% apart — indentation is the
          most compressible thing in the file, so teams arguing about pretty-printing are usually arguing about log readability, not bandwidth.
        </P>
        <DataTable
          caption="Diagnostic codes verified by execution. Severity is the engine's own."
          head={['Code', 'Severity', 'Trigger']}
          rows={[
            ['duplicate-key', 'warning', 'Same name twice in one object; names both positions.'],
            ['unsafe-integer', 'warning', 'Integer literal whose double is not safe (exceeds 2^53−1).'],
            ['utf8-bom', 'warning', 'A leading U+FEFF; names the §8.1 MUST NOT.'],
            ['lone-surrogate', 'warning', 'High surrogate escape with no low surrogate after it.'],
            ['invalid-whitespace', 'error', 'Character outside the §2 four between tokens (e.g. U+00A0).'],
            ['comment / trailing-comma / unquoted-key', 'error', 'The JSONC/JSON5 family; hint names the dialect.'],
            ['multiple-values / empty-input', 'error', 'NDJSON reported as "More than one value at the top level".'],
          ]}
          foot="Every diagnostic carries severity, code, message, optional hint, byte length, offset, line and column."
        />
        <P>
          The repair pass is a different program with different guarantees: it prints through <code>JSON.stringify</code>, so duplicate keys collapse to the
          last value and numbers round. Every substitution is in the fix list with a line and column — read it before using the output, and never treat a
          repaired document as equivalent to the original.
        </P>
        <Callout tone="note" title="What none of these tools will do">
          <P>
            No schema validation, no JSON Pointer or JSONPath resolution, no patch application, no duplicate-name enforcement, no numeric coercion, no
            canonicalisation for signing. For the contract layer use a JSON Schema validator; for digests use RFC 8785 explicitly.
          </P>
        </Callout>
      </Section>
    </Prose>
  )
}
