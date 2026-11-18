/**
 * Workflow page: /use-cases/api-debugging/
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * Engine claims verified against src/lib/tools/json.ts, json-repair.ts, base64.ts and url.ts.
 * Specification claims verified against RFC 9110, RFC 9112, RFC 8259, RFC 7519, RFC 3986,
 * RFC 7464, RFC 9457 and MDN's server-sent events documentation (see meta.sources).
 * The FAQ block and the source list are rendered by ArticleShell from meta.
 *
 * Revised 2026-11-17: consolidated 15 sections into 8, removed FAQ/正文 duplication,
 * moved tool-internal details into a single How Our Tools Handle These Cases callout.
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'api-debugging',
  path: '/use-cases/api-debugging/',
  title: 'API Debugging Tools - JSON, JWT & Base64 Runbook | FmtTools',
  description:
    'A runbook for debugging HTTP API responses: check the three encodings, decode a JWT honestly, find the path, diff payloads and fix broken query strings.',
  h1: 'Tools for Debugging HTTP APIs',
  faqTopic: 'debugging HTTP APIs',
  summary:
    'What to do when a response arrives as one unreadable line: check the encoding claims first, decode honestly, and name the step you are stuck on.',
  keywords: [
    'api debugging tools',
    'read json response online',
    'jwt decoder without verifying',
    'content encoding vs transfer encoding',
    'ndjson response debugging',
    'percent encode query string',
    'duplicate json keys response',
    'diff two api responses',
  ],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 18,
  sections: [
    { id: 'triage', label: 'When the response arrives unreadable' },
    { id: 'problem-details', label: 'Read the error body before you invent one' },
    { id: 'jwt', label: 'JWT: decodable is not verified' },
    { id: 'paths-pagination', label: 'Finding the array: paths and pagination' },
    { id: 'duplicates-diffing', label: 'Duplicate keys and diffing without noise' },
    { id: 'streaming', label: 'Streaming bodies: NDJSON and SSE' },
    { id: 'query-string', label: 'Query-string bugs' },
    { id: 'runbook', label: 'Symptom to first finding' },
  ],
  faqs: [
    {
      question: 'Can I check whether a JWT is valid by decoding it?',
      answer:
        'No. Decoding reads the header and payload; it does not verify the signature. A decoded token tells you what the token claims (alg, kid, exp, issuer), which is useful when debugging clock skew or unit mismatches. It tells you nothing about who issued it. Authenticity requires checking the signature over the exact header and payload bytes with the algorithm pinned by your code, never read from the header.',
    },
    {
      question: 'Why does my JWT fail after it passes through a URL?',
      answer:
        'A base64url signature containing "+" survives a query string badly: form decoding turns "+" into a space, so the base64 decoder reports an invalid character or a length that is one mod four. Percent-encode the token once, do not encode it twice, and check the URL Encoder inspector for the ambiguous-plus and multi-layer warnings before blaming the auth server.',
    },
    {
      question: 'Should I minify a JSON fixture before committing it?',
      answer:
        'No. A one-line fixture makes every future change a whole-file diff with no context, so review becomes impossible and blame stops being useful. Commit the pretty form; if size matters for a payload-budget test, generate the compact form at build time from the pretty source and keep the generator. Run the validator first, because duplicate names and unsafe integers pass a round trip silently.',
    },
    {
      question: 'My bulk-import endpoint says the body is invalid on the last line only. What is wrong?',
      answer:
        'A missing trailing newline, not a bad record. Newline-delimited JSON ends each record with LF, and several bulk APIs require the final LF because they split on it and treat the remainder as an incomplete record. Confirm your writer flushes a newline after the last object, then check with the formatter that every line parses on its own.',
    },
  ],
  sources: [
    {
      label: 'RFC 9110: HTTP Semantics',
      href: 'https://www.rfc-editor.org/rfc/rfc9110.html',
      detail: 'Section 8.4 defines content codings and Content-Encoding; section 8.3 makes Content-Type the media type of the representation; section 12.5.1 covers content type negotiation with Accept.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 9112: HTTP/1.1 Messages',
      href: 'https://www.rfc-editor.org/rfc/rfc9112.html',
      detail: 'Section 7 defines transfer codings and the chunked transfer coding; section 6.3 excludes 1xx, 204 and 304 from carrying any body.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format',
      href: 'https://www.rfc-editor.org/rfc/rfc8259.html',
      detail: 'Section 2 fixes JSON text as whitespace around exactly one value; section 4 says names within an object SHOULD be unique; section 6 gives the number grammar; section 8.1 requires UTF-8 for text exchanged between systems.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7519: JSON Web Token (JWT)',
      href: 'https://www.rfc-editor.org/rfc/rfc7519.html',
      detail: 'Three base64url-encoded segments separated by dots; NumericDate as a JSON number of seconds from the UTC epoch; the exp, nbf and iat claims.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3986: Uniform Resource Identifier (URI): Generic Syntax',
      href: 'https://www.rfc-editor.org/rfc/rfc3986.html',
      detail: 'Section 2.1 defines pct-encoded; section 2.4 requires components to be separated before encoded octets are decoded; section 7.3 states that treating a plus as a space is not part of URI syntax.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7464: JSON Text Sequences',
      href: 'https://www.rfc-editor.org/rfc/rfc7464.html',
      detail: 'The application/json-seq media type and the ABNF 1*( RS JSON-text LF ), where the trailing LF lets a receiver detect a truncated value.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 9457: Problem Details for HTTP APIs',
      href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
      detail: 'The application/problem+json media type and its type, title, status, detail and instance members, with extension members permitted.',
      accessed: '2026-11-12',
    },
    {
      label: 'MDN: Using server-sent events',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
      detail: 'text/event-stream as the required response type; the data, event, id and retry fields; consecutive data lines concatenated with a newline; proxy buffering as the reason streams stall.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Errors by line and column, a structure outline, and the counts that describe a huge body.' },
    { path: '/json-tools/formatter/', name: 'JSON Formatter', blurb: 'Key order and number literals preserved, duplicate keys kept, NDJSON recognised.' },
    { path: '/encoders-decoders/base64/', name: 'Base64 Encode & Decode', blurb: 'JWT segments, magic bytes, base64url alphabet and non-canonical trailing bits.' },
    { path: '/encoders-decoders/url/', name: 'URL Encode & Decoder', blurb: 'Four escaping modes, an inspector that splits every component, a query builder.' },
    { path: '/json-tools/minify/', name: 'JSON Minifier', blurb: 'Byte savings, a gzip comparison and a round-trip proof on the compacted text.' },
    { path: '/use-cases/log-analysis/', name: 'Tools for Reading Structured Logs', blurb: 'The NDJSON and interleaved-write problems, worked in the other direction.' },
    { path: '/use-cases/encoding/', name: 'Encoding Tools with Security Consequences', blurb: 'Where alg none, double decoding and unverified tokens stop being a formatting question.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'The grammar, the number rules and the interoperability clauses behind this page.' },
  ],
  words: 3650,
  image: '/images/covers/use-api-debugging.png',
  imageAlt: 'A debugging runbook laid out in six panels: a single long response line, the three encoding headers, a token split into three segments, a paginated array, two payloads being compared and a query string with escaped characters.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        The failure is almost never that you cannot parse JSON. It is that the bytes you are holding are not the bytes the
        server sent, or are perfectly valid and mean something other than what the field name implies. This page is a runbook
        for the distinct problems hiding behind <Rich text={'"the response is unreadable"'} />, with a place to start for
        each one.
      </Lead>

      <Section id="triage" title="When the response arrives unreadable" kicker="Triage">
        <P>
          A list endpoint returns 2 MB with no indentation, and your editor has stopped responding. Resist the instinct to
          pretty-print it first. Formatting a document you do not yet understand turns a triage problem into a scrolling
          problem. The useful first move is structural: paste the body into the <a href="/json-tools/validator/">JSON
          Validator</a> and read the counts before the content — byte count, line count, root kind, nesting depth, member
          and value counts, the largest array at any depth, and a structure outline of the first object and first array
          element. Those numbers answer the three questions that determine what you do next: is this one document or
          several, where is the collection buried, and did the whole body arrive.
        </P>
        <P>
          Truncation is the single most common cause of a large body that will not parse, and it has three distinct shapes
          that look identical from the terminal:
        </P>
        <CodeBlock
          title="the three truncation shapes"
          language="json"
          code={'{"items":[{"id":1,"body":"lorem…   <- cut mid-string, no closing braces\n{"items":[{"id":1},{"id":2"}               <- cut mid-token: expected a "," or "}"\n{"items":[{"id":1}]}x                     <- one paste too far: extra closing bracket'}
          caption="Same error message in your console, three different causes. Byte count against Content-Length separates them."
        />
        <H3>The three encodings, and the order you undo them</H3>
        <P>
          A response that looks like garbage is far more often a failed undo of one of three transformations than a server
          producing garbage. Three headers describe three different layers, and you must undo them in order:
        </P>
        <DataTable
          caption="The three transformations, in the order you must undo them"
          head={['Layer', 'Header', 'What it wraps', 'How to undo it']}
          rows={[
            ['1. Framing', 'Transfer-Encoding: chunked', 'The HTTP/1.1 message content, for safe transport', 'Read hex-length chunk prefixes until a zero-length chunk'],
            ['2. Coding', 'Content-Encoding: gzip, br, zstd', 'The representation data itself', 'Decompress, left to right in the header value'],
            ['3. Character', 'Content-Type charset parameter', 'The characters inside the decoded bytes', 'Decode UTF-8, not latin-1, not twice'],
          ]}
          foot="RFC 9112 §7 calls framing a transformation for safe transport; RFC 9110 §8.4 calls content coding a property of the representation. Framing bytes are never your data."
        />
        <P>
          The rule is: de-chunk, decompress, decode characters, parse. Most "the server sent broken JSON" reports against
          a compressed endpoint are one step of that chain skipped or reversed. A hex preview beginning{' '}
          <Rich text={'`1f 8b`'} /> under a header saying <Rich text={'`application/json`'} /> means the coding step is
          still pending, not that the payload is corrupt. Two version-sensitive facts: HTTP/2 and HTTP/3 forbid
          Transfer-Encoding entirely, so the same endpoint can arrive chunked through one proxy and unchunked through
          another; and <Rich text={'`Content-Length`'} /> describes the encoded data, so its disagreeing with your
          decompressed byte count is not a bug.
        </P>
        <H3>Mangled text is a decoding mistake, not a server bug</H3>
        <P>
          Curly quotes becoming three characters, an umlaut becoming a letter plus an accent, a name becoming{' '}
          <Rich text={'`Smithe??`'} /> — none of those are produced by a server. They are produced by a decoder that was
          handed UTF-8 bytes and asked to interpret them as a single-byte code page. RFC 8259 §8.1 requires text exchanged
          between systems to be encoded in UTF-8, so <Rich text={'`application/json; charset=windows-1252`'} /> is a
          document that breaks the interoperability clause, not a client that needs a different decoder.
        </P>
        <DataTable
          caption="Symptom, mechanism, and the check that proves it"
          head={['What you see', 'What happened', 'How to prove it', 'Correct fix']}
          rows={[
            ['Â and é in place of curly quotes', 'UTF-8 bytes decoded as Windows-1252', 'Count bytes against characters in the decoded text', 'Decode as UTF-8; do not re-encode'],
            ['Smithe?? or boxes', 'Encoder could not represent the character and substituted', 'Compare the source value, not the rendering', 'Re-export from the system that still has the data'],
            ['The first header name has an invisible prefix', 'A BOM was read as part of the string', 'A utf8-bom warning at offset 0', 'Strip the mark before ingesting'],
            ['Emoji arrive as pairs of boxes', 'Text was handled as 16-bit units, not code points', 'A lone-surrogate warning from the validator', 'Escape as a surrogate pair, or fix the encoder'],
          ]}
          foot="Every row is a decoder decision. Not one of them is fixed by editing the text."
        />
        <P>
          The expensive version of this mistake is silent. A name that differs from the reference table by one decomposed
          combining character does not look mangled, it looks like a missing record, and the next engineer responds by
          adding an outer join. Character problems are only cosmetic when the text is displayed; as soon as the text is a
          key, a mismatch is a data loss event with a cosmetic symptom.
        </P>
        <H3>The body you cannot read is not JSON</H3>
        <P>
          Before you debug a parser, check whether the payload was ever a JSON document. A large share of unreadable API
          responses are HTML, XML, an error page from something in the middle, or a different media type wearing a JSON
          file extension. The practical check is a magic-byte look: a payload whose first printable byte is{' '}
          <Rich text={'`<`'} /> is XML or HTML; one that starts with an opening brace and a double quote is JSON. The{' '}
          <a href="/encoders-decoders/base64/">Base64 decoder</a> compares leading bytes against a signature table and
          names the container it found — a gzip stream, a ZIP archive, a PDF — which holds even when the declared type or
          file extension is wrong.
        </P>
        <DataTable
          caption="Common non-JSON bodies and what produced them"
          head={['First characters', 'What it is', 'Who produced it', 'Where the real error is']}
          rows={[
            ['<!DOCTYPE html', 'A browser-facing error page', 'An origin server or framework default error handler', 'Accept was wrong, or the route does not exist'],
            ['<html><head><title>502', 'A gateway or load balancer page', 'nginx, Cloudflare, an ALB', 'The upstream never answered; your API is not involved'],
            ['<?xml', 'Legacy endpoint, or content negotiation you lost', 'A SOAP or Atom handler', 'Accept header, or the wrong path version'],
            ['Binary block, then readable text', 'A container: gzip, ZIP, a PDF', 'A file endpoint', 'The content coding step has not been undone'],
          ]}
          foot="One of these is a real API bug. The others are correct behaviour that a JSON-first client mishandles."
        />
        <P>
          If the response alternates between media types with no code change, look at the cache and the{' '}
          <Rich text={'`Vary`'} /> header, not the parser. A cache keyed on <Rich text={'`Accept`'} /> can hand your JSON
          request a cached HTML variant, which reproduces only for some clients and never in your integration test.
        </P>
      </Section>

      <Section id="problem-details" title="Read the error body before you invent one" kicker="Errors">
        <P>
          RFC 9457 standardised what an API error body should say, and it is the only part of this page that is about
          reading rather than decoding. A problem document has five defined members, and each answers a different question
          than the one most teams put in their error payload.
        </P>
        <DataTable
          caption="The five defined members and what to do with each"
          head={['Member', 'Question it answers', 'What is legal', 'Debugging use']}
          rows={[
            ['type', 'Which error class is this', 'A URI reference; defaults to about:blank', 'A stable string to group on, and often a documentation URL'],
            ['title', 'What is this class called', 'Short, human-readable, fixed per type', 'Do not parse it; it is allowed to change wording'],
            ['status', 'Which HTTP status carried it', 'A number, consistent with the response status', 'Separates 400 from 422 from 403 without reading prose'],
            ['detail', 'What happened this time', 'Human-readable, occurrence-specific', 'The one field worth logging verbatim'],
            ['instance', 'Where to find out more about this occurrence', 'A URI referring to this occurrence', 'A correlation id to take to the log'],
          ]}
          foot="Extension members are explicitly permitted, so a valid problem document can also carry your errors array, retry hints or field lists."
        />
        <P>
          Three misreadings cost time. First, treating <Rich text={'`type`'} /> as a link: it is a URI reference used as a
          global identifier, and <Rich text={'`about:blank`'} /> is the default for a problem with no registered type, not
          a broken field. Second, reading <Rich text={'`title`'} /> as a machine value: it belongs to the type, not the
          occurrence, and a server is free to re-word it, so group by <Rich text={'`type`'} />, never by{' '}
          <Rich text={'`title`'} />. Third, ignoring <Rich text={'`status`'} /> inside the body when it disagrees with the
          status line: that disagreement is a server bug where someone built the error from an internal exception type and
          let the transport pick the code. Capture both numbers in your logs; the pair identifies the bug even when neither
          alone does.
        </P>
        <CodeBlock
          title="a problem document worth reading"
          language="json"
          code={'{\n  "type": "https://api.example.com/errors/validation",\n  "title": "Request failed field validation",\n  "status": 422,\n  "detail": "The \\"since\\" parameter must be an ISO 8601 date.",\n  "instance": "/requests/01J9XK2M4Q",\n  "errors": [{ "path": "/since", "expected": "date" }]\n}'}
          caption="The last two members are extensions. The detail here tells you the parameter and the format; that sentence is why you read the body."
        />
        <P>
          The meta-lesson for every section that follows: an error response is the only payload in your system that is
          supposed to explain itself. When a 400 arrives, its body is the diagnosis. Parsing it as an instance of your
          success schema and reporting a mismatch is the most reliable way to turn a five-second answer into a half-day of
          guessing.
        </P>
      </Section>

      <Section id="jwt" title="JWT: decodable is not verified" kicker="Tokens">
        <P>
          A JSON Web Token in its compact form is three base64url-encoded segments separated by full stops: a header, a
          payload and a signature. Anyone can read the first two. That is not a bug and not a secret: RFC 7519 describes
          the token as a structure whose segments are encoded, not encrypted, and base64url is an encoding. The honest
          statement of what a decoder gives you is that the payload is readable and that the signature is{' '}
          <Rich text={'**unverifiable without the key**'} />, and a tool that shows you a decoded payload without saying so
          is teaching the wrong lesson.
        </P>
        <CodeBlock
          title="what the header is really telling you"
          language="json"
          code={'{\n  "alg": "HS256",\n  "typ": "JWT",\n  "kid": "us-east-1-2026-11"\n}\n--- decoded, not verified ---\nthe header is attacker-supplied text: never route on it'}
          caption="A kid that names a key, an alg that names an algorithm, and no proof that either came from the party that issued the token."
        />
        <P>
          Two header fields deserve immediate suspicion. An empty third segment means nothing proves where the token came
          from. A header asking for <Rich text={'`alg: none`'} /> or omitting <Rich text={'`alg`'} /> entirely is the
          original JWT bypass class: a verifier willing to accept it treats any signature as valid. And a MAC algorithm
          paired with a <Rich text={'`kid`'} /> is the shape that invites key confusion when a server resolves the key
          from a value the client controls.
        </P>
        <P>
          The failure mode that sends most people to a decoder is a token that will not decode, and almost all of those are
          transport damage rather than auth damage. A signature segment that travelled through a query string unescaped can
          have had its <Rich text={'`+`'} /> read as a space by form decoding, which surfaces in the base64 layer as an
          invalid-character error naming the offending symbol. Strip that space and the length becomes one more than a
          multiple of four, which the decoder reports as an impossible length. And a padded segment whose padding appears
          before other characters is reported as padding in the middle — the signature of two values concatenated or a
          value truncated, not of a bad token.
        </P>
        <H3>exp, nbf and iat: seconds, milliseconds and clock skew</H3>
        <P>
          The three time claims are defined as a NumericDate: a JSON number holding the count of seconds from the UTC
          epoch, ignoring leap seconds. Not milliseconds. Not local time. A huge fraction of expired-token reports are
          somebody writing milliseconds into a seconds field, and the second-largest group is a generator whose clock is
          not the verifier's clock.
        </P>
        <DataTable
          caption="Unit and zone mistakes, and the number you would actually see"
          head={['What the generator did', 'The value in the payload', 'How it reads', 'Symmetric symptom']}
          rows={[
            ['Wrote milliseconds', '1762000000000', 'Year 57,000 if read as seconds', 'Detected by a divide-by-1000 heuristic'],
            ['Set exp as iat plus 3600, with iat in milliseconds', 'A one-hour token', 'Valid for 3.6 seconds', 'Intermittent auth failures under load'],
            ['Formatted local wall-clock time as a number', 'Off by the zone offset', 'Hours early or late', 'Works in dev, fails in prod'],
            ['Wrote exp as a JSON string', '"1762000000"', 'No row at all: only numbers are rendered', 'The claim silently disappears from the report'],
            ['Verifier clock is unsynchronised', 'Correct value', 'Expired seconds ago', 'Only some nodes reject the token'],
          ]}
          foot="The string case is the sneaky one: the claim renderer looks for a JSON number, so a quoted timestamp produces no expiry row and no complaint."
        />
        <P>
          Read the raw number before the friendly date, then check three things in order: whether the unit is seconds,
          whether the generator and the verifier agree on which instant is now, and whether the algorithm in the header is
          the one your code expects. A token that fails all three and still works on a colleague machine is a clock
          problem, and no amount of decoding will tell you more.
        </P>
        <Callout tone="risk" title="Security consequence">
          <P>
            Nothing here verifies anything. Authenticity comes from checking the signature over the exact bytes of the
            header and payload segments, with the algorithm pinned by your code and never read from the header. Trailing
            bits that should be zero but are not produce a non-canonical encoding that decodes to the same bytes — a
            documented way of slipping variants past filters that check whether something is base64.
          </P>
        </Callout>
      </Section>

      <Section id="paths-pagination" title="Finding the array: paths and pagination" kicker="Navigation">
        <P>
          Most payloads that resist reading are not big; they are deep. You need one value out of a document whose
          interesting collection lives at <Rich text={'`response._embedded.items[37].links.next.href`'} />, and guessing
          the path is how people end up formatting 2 MB again. Two notations exist for naming a location, and they solve
          different problems.
        </P>
        <DataTable
          caption="The two path notations, and when each one is the right thing to type"
          head={['Notation', 'Root', 'Examples', 'Use it when']}
          rows={[
            ['JSON Pointer', 'The empty string, which means the whole document', '/data/items, /data/items/0/id, /a~1b/c~0d', 'You need exactly one value, addressed deterministically'],
            ['JSONPath', 'The dollar sign', '$.data.items[*].id, $..id, $.items[0:10]', 'You need a set of values, or a filter over a collection'],
          ]}
          compact
          foot="Pointer escapes: a key containing a solidus is written ~1 and a key containing a tilde is written ~0."
        />
        <P>
          The <a href="/json-tools/validator/">validator</a> gives you the shape that tells you which expression to write.
          Root says whether the document is an object or an array, Records is the length of the top-level array, Largest
          array is the longest array at any depth, so when Records is one and Largest array is five hundred the collection
          is wrapped. The structure outline walks the first object and the first array element, printing each key with its
          value kind, which is where you read <Rich text={'`"items": [500 items]`'} /> and write the pointer yourself.
        </P>
        <H3>Six pagination failures, in the order they are usually discovered</H3>
        <CodeBlock
          title="the shapes that break"
          language="json"
          code={'{"data":[…],"meta":{"page":1,"limit":1000,"returned":100,"total":4982}}\n{"data":[…],"meta":{"next_cursor":"eyJvIjoiMjAyNi0xMS0xMiJ9","has_more":true}}\n{"data":[…],"meta":{"next_cursor":"eyJvIjoiMjAyNi0xMS0xMiJ9","has_more":true}}   <- identical cursor: you are looping\n{"data":[…50 records…],"meta":{"next_cursor":null,"has_more":false}}                <- limit silently capped at 50'}
          caption="Returned against limit is the first pair to read. A next_cursor identical to the one you sent is a loop, not a last page."
        />
        <P>
          The cursor in that second line decodes to a date, and that is the point: opaque cursors are usually base64, and
          the <a href="/encoders-decoders/base64/">decoder</a> will tell you whether it is text, JSON, or binary, which is
          how you learn that paging is driven by a timestamp and that records inserted with the same timestamp are the
          reason page three repeats rows from page two. Repeats across pages are almost always an ordering problem: a sort
          on a non-unique column gives the server no stable tie-break, so the fix is an order on (timestamp, id), and the
          diagnosis is a duplicate count over the exported id column.
        </P>
        <Callout tone="warn" title="Where this goes wrong">
          <P>
            Offset paging has a second, quieter bug that no header will show you. If rows are inserted or deleted while you
            page, an offset cursor shifts the window under you, and you can silently skip records as easily as repeat them.
            Comparing counts on the first and last page proves nothing; comparing the union of ids against the total the
            server claims is the only check that distinguishes these two failures.
          </P>
        </Callout>
      </Section>

      <Section id="duplicates-diffing" title="Duplicate keys and diffing without noise" kicker="Comparison">
        <P>
          The word duplicate covers two distinct problems in an API response, and conflating them wastes afternoons. One is
          a repeated name inside a single JSON object, which is a document defect. The other is a repeated record across an
          array, which is a data defect and usually a pagination artefact of the kind the previous section describes.
        </P>
        <H3>Duplicate names inside one object</H3>
        <P>
          RFC 8259 §4 says names within an object SHOULD be unique. SHOULD is not MUST, so a document with the same key
          twice is legal JSON, and the meaning is delegated to whoever reads it. The consequence is data loss by default:
          parsers that build a map keep one value per name, and the overwhelmingly common behaviour is last-value-wins.
        </P>
        <CodeBlock
          title="a real duplicate, formatted"
          language="json"
          code={'{\n  "id": "ord_8812",\n  "status": "pending",\n  "amount": 4200,\n  "status": "cancelled"\n}\nwarning: Duplicate key "status" in the same object (first occurrence: line 2)\nJSON.parse value: "cancelled"     this tool keeps both lines when printing'}
          caption="Same key, two values, one document. Whatever your parser does, one of these two is gone before your code sees it."
        />
        <P>
          Duplicates come from one of four places: a body assembled by concatenating strings, an envelope that merges an
          upstream payload into its own object, a template that emits an optional field and then a default one, or two
          serialisers in the same pipeline writing the same field with different casing rules. The first is fixable in
          five minutes; the other three explain why it reproduces only for some records. Treat any duplicate in an API
          response as a producer bug and find the serializer that emitted it.
        </P>
        <H3>Diffing two responses without diffing the noise</H3>
        <P>
          You have two responses and a text diff shows four hundred changed lines, of which six are interesting. The ratio
          is not bad luck. JSON has four properties that make naive text diffing systematically misleading:
        </P>
        <DataTable
          caption="Four reasons two identical payloads do not match as text"
          head={['Property', 'Spec basis', 'What the diff shows', 'Who can rewrite it']}
          rows={[
            ['Object member order is not significant', 'An object is an unordered collection of name and value pairs', 'Every line moved, nothing changed', 'Any serialiser, and your own language at the next round trip'],
            ['Number literals keep whatever spelling was written', 'RFC 8259 §6 grammar, with range and precision left to implementations', '1e3 against 1000 against 1000.0', 'JSON.parse rewrites all three; this formatter rewrites none'],
            ['Insignificant whitespace is allowed anywhere outside strings', 'RFC 8259 §2 is whitespace, one value, whitespace', 'The entire file, if one side was pretty-printed', 'Formatters, minifiers and template engines'],
            ['Escaping has many valid forms', 'RFC 8259 §7 defines the escapes; nothing forbids \\u00e9 over é', 'A quoted name looks changed', 'Unicode-escaping writers, and non-JSON-aware encoders'],
          ]}
          foot="The fourth one is the least obvious and the most common in cross-language diffs: two encoders, one string, two byte sequences."
        />
        <P>
          The normalisation ladder, in the order that costs least. Step one: collapse whitespace on both sides with the{' '}
          <a href="/json-tools/minify/">minifier</a>, which prints the parsed tree without insignificant space and emits
          number literals exactly as they were written, so it removes formatting differences without creating numeric ones.
          If the two compact forms are byte-identical, you are done. Step two: normalise key order on both sides with the{' '}
          <a href="/json-tools/formatter/">formatter</a>. Sorting both sides identically turns a reordered payload into an
          empty diff; sorting one side only makes your diff a lie.
        </P>
        <P>
          Step three, and this is where people get hurt: do not use a language round trip as your normaliser. Passing both
          files through a JSON parser and back out looks principled and is destructive in two specific ways. Numbers are
          re-emitted in the shortest form that parser prefers, so <Rich text={'`12.50`'} /> becomes{' '}
          <Rich text={'`12.5`'} />, and any integer above 2^53 minus one comes back as a different number entirely. And
          member order is rewritten by the language: JavaScript puts integer-like keys first in ascending order regardless
          of how they were written, so a round trip through <Rich text={'`JSON.parse`'} /> reorders part of your document
          on its own.
        </P>
        <Callout tone="spec" title="In the specification">
          <P>
            Run two comparisons and keep them separate. A text comparison of two normalised forms answers whether the
            payloads are the same document, which is what a fixture or a cache needs; a value comparison answers whether
            they mean the same thing, which is what a behaviour change needs. RFC 8259 §6 recommends that implementations
            set no range or precision limits lower than IEEE 754 binary64, which is why fifteen significant digits is the
            number to trust across systems.
          </P>
        </Callout>
      </Section>

      <Section id="streaming" title="Streaming bodies: NDJSON and SSE" kicker="Streaming">
        <P>
          A bulk import body, a log download and a machine-learning response stream are not one JSON document. They are
          many documents separated by something, and the strict parser is right to reject them: RFC 8259 §2 defines JSON
          text as whitespace, exactly one value, whitespace. The interesting question is what separates the records,
          because that is where the conventions differ and where the truncation bugs live.
        </P>
        <DataTable
          caption="Two ways to put many JSON values in one byte stream"
          head={['Convention', 'Separator', 'Media type', 'Where it bites']}
          rows={[
            ['NDJSON, JSON Lines', 'One LF after each value', 'application/x-ndjson', 'A missing final newline, a pretty-printed record, an embedded raw newline'],
            ['JSON text sequence', 'RS before each value, LF after it', 'application/json-seq', 'Interleaved writers, values that are not self-delimiting'],
            ['One array of records', 'Commas, no per-record newline', 'application/json', 'Nothing can be appended; you must rewrite the file'],
          ]}
          foot="RFC 7464 uses RS to mark a record start and LF to mark a record end, so a reader can notice a value that never terminated itself."
        />
        <P>
          The <a href="/json-tools/formatter/">formatter</a> recognises NDJSON: when the strict parse fails it splits the
          input on line breaks, tries every line on its own, and if all of them parse it reports a record count. That count
          is what you reconcile against the importer; if it does not match the rows the server says it sent, you have a
          truncated stream, not a formatting problem.
        </P>
        <CodeBlock
          title="three lines, three different faults"
          language="json"
          code={'{"ts":"2026-11-12T09:04:11Z","msg":"cache miss","trace":"a91f"}\n{"ts":"2026-11-12T09:04:11Z","msg":"up {"ts":"2026-11-12T09:04:11Z","dur_ms":4}\n{"ts":"2026-11-12T09:04:12Z","note":"line one\nline two","trace":"b3c0"}\n{"ts":"2026-11-12T09:04:13Z","msg":"flushed'}
          caption="Line two is two writers on one descriptor. Line three is a raw newline inside a string. Line four is the truncated tail."
        />
        <P>
          Each fault has a distinct signature. The interleaved line errors near the end of the row, because the object
          never closes before another object starts. The embedded newline produces the diagnostic that raw newlines are
          not allowed inside JSON strings, naming the line — the fastest way to find the writer that pasted a stack trace
          into a field without escaping it. The truncated final record produces an unexpected-end error and is the only
          one of the three the server caused. Several bulk endpoints split on the separator and treat the remainder as a
          record, so a writer that omits the last LF gives an error naming the final line and nothing else.
        </P>
        <H3>Server-sent events: JSON inside a text protocol</H3>
        <P>
          An event stream is the least JSON-like thing on this page, and the most commonly mis-debugged. The response is
          served as <Rich text={'`text/event-stream`'} /> with UTF-8 text. Each message is a block of{' '}
          <Rich text={'`field: value`'} /> lines terminated by a blank line, which is what dispatches the event. The fields
          are <Rich text={'`data`'} /> for the payload, <Rich text={'`event`'} /> for a named type,{' '}
          <Rich text={'`id`'} /> for the last event id, and <Rich text={'`retry`'} /> for the reconnection delay. When
          consecutive lines begin with <Rich text={'`data:`'} />, the client concatenates them with a newline between each.
        </P>
        <CodeBlock
          title="a stream and what you must extract"
          language="text"
          code={': keepalive\nid: 41\nevent: delta\ndata: {"choices":[{"index":0,"finish_reason":null}]}\ndata: [DONE]\n\nid: 42\ndata: partial\ndata: payload\n\nretry: 3000'}
          caption="Two blank-line-terminated messages plus a retry hint. The payload of the second message is the two data lines joined by a newline character."
        />
        <P>
          Four stream-specific failures, each with a distinct name. The sentinel: <Rich text={'`[DONE]`'} /> parsed as JSON
          reports that a value was expected, and a client that swallows that error has turned a protocol terminator into an
          exception — filter the sentinel before the parser, not after it. The keepalive: a comment line fed to a JSON
          parser produces an error at the colon, which means the frame was never unwrapped, which is your job, not the
          server's. The multi-line payload: if the writer split a string value across data lines you get the
          raw-newline-in-a-string error, which is a server-side framing bug worth reporting. Reconnection: the last event
          id is what the client sends back, so an id that is not monotonic, or absent, produces duplicated events or a
          silent gap. Buffering: a proxy that buffers the response turns a live stream into a burst at the end, and the
          mitigation is an explicit no-buffering response header at the proxy plus a flush at the application.
        </P>
      </Section>

      <Section id="query-string" title="Query-string bugs" kicker="Request side">
        <P>
          Half of the responses you cannot read were caused by a request you did not send, and the query string is where
          that happens. A URI carries two meanings at once: the characters, and the delimiters that say where components
          and parameters start. RFC 3986 defines the syntax but not your parameter format, and every bug in this section
          comes from that gap.
        </P>
        <P>
          Four rules, four bugs. Rule one: separate the components before you decode anything. RFC 3986 §2.4 says
          components must be parsed and separated before the percent-encoded octets inside them can be safely decoded. Do
          it in the other order and a value containing <Rich text={'`&admin=1`'} /> becomes a parameter, which is the whole
          injection class in one sentence. Rule two: a plus is not a space, except when it is. RFC 3986 §7.3 states that
          treating a plus as a space is not part of URI syntax and should not be relied on without an explicit agreement
          between sender and receiver. That agreement is what your framework either has or does not have, with{' '}
          <Rich text={'`C++`'} /> arriving as <Rich text={'`C  `'} /> as the reported case. Rule three: never encode twice.
          Percent-encoding is idempotent only in one direction, and encoding an already-encoded string turns{' '}
          <Rich text={'`%20`'} /> into <Rich text={'`%2520`'} />. This is the bug behind a great many OAuth failures: a
          redirect URI encoded by the client and encoded again by the library changes the string that gets signed, so the
          signature check fails on a value that looks correct in the log. Rule four: normalise before you compare.{' '}
          <Rich text={'`%41`'} /> and <Rich text={'`A`'} /> denote the same URI but are not the same string, so two URLs
          that differ only in escaping will not match a cache key, a signature base string or a permission rule.
        </P>
        <DataTable
          caption="What the URL inspector reports, and the bug each finding points at"
          head={['Finding', 'Severity', 'The underlying bug', 'Fix on which side']}
          rows={[
            ['repeated-key', 'warning', 'Nothing defines a repeated key: one framework keeps the last, one builds an array, one binds the first', 'Sender: emit one key, or the array convention your server expects'],
            ['ambiguous-plus', 'warning', 'A literal plus in a query value, which form decoding turns into a space', 'Sender: encode the plus; receiver: agree on the convention'],
            ['multi-layer', 'warning', 'Nested percent-encoding that validators inspect only one layer of', 'Sender: encode exactly once'],
            ['raw-space', 'warning', 'A space in a URI, silently turned into %20 by the address bar but rejected from code', 'Sender: encode it'],
            ['path beginning with //', 'info', 'A path that parses as an authority, the classic open-redirect and SSRF mechanism', 'Server: validate the target, do not concatenate'],
            ['dangerous-scheme', 'error', 'A scripting scheme in a URL that will be assigned to a link or a redirect', 'Server: allow-list http and https'],
          ]}
          foot="Decode keys and values with the plus-as-space rule in the inspector, but check the toggle in the decoder against the context: it is right for a form body, wrong for a path."
        />
        <Callout tone="risk" title="Security consequence">
          <P>
            A single trailing percent sign is the smallest example of the whole class. Lenient decoding passes an invalid
            escape through as a literal percent; strict decoding rejects it. A filter that decodes once and a server that
            decodes once with different policies see two different strings, and the difference is where the payload gets
            in. Set the strict option, read which escape was rejected and at what offset, and find out which of the two
            behaviours your production server actually has: the two ends of a request must implement the same decoder.
          </P>
        </Callout>
      </Section>

      <Section id="runbook" title="Symptom to first finding" kicker="Checklist">
        <P>
          The order below is the order that resolves most reports. Read the row that matches what you can see, do the step,
          and only move to the next row when the current one has given you a number or a finding rather than a suspicion.
        </P>
        <DataTable
          caption="Symptom to page to first finding, in runbook order"
          head={['#', 'If you see this', 'Open', 'Read this first']}
          rows={[
            ['1', 'A status code you did not expect', 'Your client, with headers', 'Content-Type, Content-Encoding, Transfer-Encoding against Content-Length'],
            ['2', 'A body that will not parse', <a href="/json-tools/validator/">JSON Validator</a>, 'The error line and column, and whether the byte count matches'],
            ['3', 'A body that parses but is unreadable', <a href="/json-tools/validator/">JSON Validator</a>, 'The structure outline, Records, Largest array, Depth'],
            ['4', 'Text with wrong accents or a stray mark', <a href="/json-tools/formatter/">JSON Formatter</a>, 'The utf8-bom and invalid-whitespace diagnostics'],
            ['5', 'Bytes that look like a container', <a href="/encoders-decoders/base64/">Base64 Decode</a>, 'The magic-bytes match, and whether it is UTF-8 at all'],
            ['6', 'A token you need to understand', <a href="/encoders-decoders/base64/">Base64 Decode</a>, 'Header alg, kid, then exp and iat as raw numbers'],
            ['7', 'A record that seems to be missing', <a href="/json-tools/validator/">JSON Validator</a>, 'The duplicate-key warning with its first-occurrence position'],
            ['8', 'A body that is many documents', <a href="/json-tools/formatter/">JSON Formatter</a>, 'The NDJSON record count, then repair it into an array'],
            ['9', 'A query that returned the wrong thing', <a href="/encoders-decoders/url/">URL Encoder</a>, 'The inspector parameters, plus repeated-key and multi-layer'],
            ['10', 'Two payloads you must compare', <a href="/json-tools/minify/">JSON Minifier</a>, 'Both compact forms, then both with keys sorted'],
          ]}
          compact
          foot="Steps 1, 5 and 6 are the three that most often end the investigation without touching a formatter at all."
        />
        <Callout tone="tip" title="Fixtures: minify at build time, commit the pretty form">
          <P>
            A one-line fixture has no line-level diff: any change replaces the whole line, so review shows a two-megabyte
            deletion and insertion and no human can tell whether the change is intended. Commit the pretty form; if size
            matters for a payload-budget test, generate the compact form at build time from the pretty source and keep the
            generator. Run the validator before committing, because duplicate names and unsafe integers pass a round trip
            silently — a fixture that only the lenient path accepts is a lie about your API.
          </P>
        </Callout>
        <KeyTerms
          items={[
            { term: 'content coding', definition: 'A transformation of the representation data named in Content-Encoding, undone left to right: RFC 9110 §8.4.' },
            { term: 'transfer coding', definition: 'A transformation of the message content for safe transport, chiefly chunked framing: RFC 9112 §7. Never part of your data.' },
            { term: 'NumericDate', definition: 'A JSON number of seconds from the UTC epoch, ignoring leap seconds, used for exp, nbf and iat. Not milliseconds.' },
            { term: 'unverified token', definition: 'A JWT whose segments you have decoded. Readable claims are evidence about intent, not evidence about origin.' },
            { term: 'canonical percent-encoding', definition: 'Uppercase hex digits with unreserved characters written literally: RFC 3986 §6.2.2, the only version safe to compare or sign.' },
            { term: 'insignificant whitespace', definition: 'Space, tab, LF and CR between tokens, permitted by RFC 8259 §2 and the only thing minification removes.' },
          ]}
        />
        <div className="my-6 grid gap-3 sm:grid-cols-2">
          <ToolLink path="/use-cases/log-analysis/" name="Tools for Reading Structured Logs" letter="LG" blurb="NDJSON, interleaved writes and base64 message fields, worked as a log problem." />
          <ToolLink path="/use-cases/encoding/" name="Encoding Tools with Security Consequences" letter="EN" blurb="alg none, double decoding and normalisation tricks, when formatting becomes an auth question." />
          <ToolLink path="/learn/json/" name="JSON: The Complete Specification Guide" letter="JS" blurb="The grammar, the number limits, duplicate names and the interoperability clauses." />
          <ToolLink path="/learn/base64/" name="Base64: The Complete Encoding Guide" letter="B6" blurb="The bit arithmetic behind every segment of a token, the alphabets, and padding rules." />
        </div>
        <Callout tone="spec" title="How these tools handle the cases">
          <P>
            The validator reports byte count, line count, root kind, nesting depth, member and value counts, the largest
            array at any depth, and a structure outline capped so a pathological document still finishes rendering. The
            formatter preserves key order and number literals exactly as written, keeps duplicate keys in its output, and
            recognises NDJSON by splitting on line breaks when the strict parse fails. The minifier removes only
            insignificant whitespace, preserves number literals and key order, and reports a round-trip verdict that
            re-parses its own output. The base64 decoder recognises JWT shape, distinguishes text from binary by attempting
            a strict UTF-8 decode, and applies a divide-by-1000 heuristic for NumericDate values above the year 2100. The
            URL inspector splits every component, warns on ambiguous-plus, multi-layer encoding, and repeated keys.
            Nothing here decompresses a response, verifies a signature, or holds a key — everything runs in your browser
            tab, so a body measured in hundreds of megabytes belongs in a streaming tool.
          </P>
        </Callout>
      </Section>
    </Prose>
  )
}
