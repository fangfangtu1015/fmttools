/**
 * Use case: encoding and security.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * Every claim about tool behaviour is taken from src/lib/tools/base64.ts, url.ts and yaml.ts.
 * External claims are cited in meta.sources against the pages opened on 2026-11-12.
 *
 * Revised 2026-11-17: consolidated 14 sections into 8, removed FAQ/正文 duplication,
 * moved tool-internal details into a single How Our Tools Handle These Cases callout.
 */

import { Callout, CodeBlock, DataTable, Figure, H3, KeyTerms, P, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'encoding',
  path: '/use-cases/encoding/',
  title: 'Encoding & Security Tools - Base64, URL, JWT Checks | FmtTools',
  description:
    'Where encoding meets security: base64 is not encryption, JWT alg none, double percent-encoding bypasses, CSV formula injection and data URI script risks.',
  h1: 'Encoding Tools with Security Consequences',
  faqTopic: 'encoding and security',
  summary:
    'Every normalisation bug that has a security label on it: canonical base64, double decoding, "+" versus space, formula injection, and unverified tokens.',
  keywords: [
    'base64 is not encryption',
    'non-canonical base64',
    'double percent-encoding bypass',
    'JWT alg none check',
    'CSV formula injection',
    'gzip ISIZE modulo 2^32',
    'Content-Encoding vs Transfer-Encoding',
    'URL encoding security review',
    'punycode homoglyph domain',
    'base64 padding in a query string',
    'base64url without padding',
    'detect base32 hex digest false positive',
  ],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 18,
  sections: [
    { id: 'not-encryption', label: 'Encoding is not encryption' },
    { id: 'canonical-base64', label: 'Canonical base64 and the plus sign problem' },
    { id: 'layered-decoding', label: 'Layered decoding, base64 in URLs, and path traversal' },
    { id: 'identity-tokens', label: 'Identity and tokens: punycode, homoglyphs, unverified JWTs' },
    { id: 'data-uri-compressed', label: 'Data URIs and compressed payloads' },
    { id: 'identify-encoding', label: 'Which encoding am I holding' },
    { id: 'formula-xxe', label: 'Formula injection and XXE: normalisation inside the parser' },
    { id: 'review-checklist', label: 'Review checklist' },
  ],
  faqs: [
    {
      question: 'Is base64 encryption?',
      answer:
        'No. RFC 4648 states these encodings provide no computational confidentiality. The Base64 tool prints the decoded bytes, a hex dump and a magic-byte match for anything recognisable. A secret needs a cipher and a key; a value that merely needs to be unreadable to a human is exactly what base64 is for.',
    },
    {
      question: 'How do I check whether a value is double-encoded?',
      answer:
        'Decode it repeatedly until the output stops changing, and count the passes. The URL analyser does this up to six times and reports a multi-layer finding with the count. `%252e%252e%252f` needs two passes to become `../`, so a filter that decodes once and validates immediately is validating a string the recipient never sees.',
    },
    {
      question: 'Can I tell whether a JWT is safe by decoding it?',
      answer:
        'No. Decoding reads the header and payload, which are integrity-protected but never confidential. Verification needs the key and the algorithm set your verifier was configured with. Use the decoder to inspect your own tokens and to find `alg` values your verifier should refuse.',
    },
    {
      question: 'Does quoting a CSV field stop formula injection?',
      answer:
        'Quoting is a parsing rule, not a sandbox. The writer quotes any field starting with `=`, `+`, `-` or `@` so the value arrives intact, but OWASP lists quoting as one option alongside a leading single quote or a tab inside the quoted field. Treat any spreadsheet that opens your export as an evaluator.',
    },
  ],
  sources: [
    {
      label: 'RFC 7515: JSON Web Signature (JWS)',
      href: 'https://www.rfc-editor.org/rfc/rfc7515',
      detail:
        'Section 2 defining BASE64URL as the base64url alphabet of RFC 4648 section 5 with the padding characters omitted and no line breaks, the compact serialisation as three such segments joined by periods, and appendix C.3 giving the deterministic recovery of the padding from the length modulo four.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 1950: ZLIB Compressed Data Format Specification version 3.3',
      href: 'https://www.rfc-editor.org/rfc/rfc1950',
      detail:
        'The two-byte zlib header holding the compression method in the low nibble of the first byte and the check bits in the second, with the requirement that the sixteen-bit value formed by the two bytes be a multiple of 31.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 1952: GZIP File Format Specification version 4.3',
      href: 'https://www.rfc-editor.org/rfc/rfc1952',
      detail:
        'The ten-byte header of identifier bytes, compression method, flags, modification time, extra flags and operating system code; and the eight-byte trailer holding a CRC-32 of the uncompressed data and ISIZE, the original input size modulo 2 to the 32.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 9110: HTTP Semantics, section 8.4 on content codings',
      href: 'https://www.rfc-editor.org/rfc/rfc9110.html#section-8.4',
      detail:
        'Content-Encoding as a modifier to the media type that is applied to the selected representation and travels end to end, in contrast with the hop-by-hop Transfer-Encoding of a single message; the rule that a list of codings is undone from right to left.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3986: Uniform Resource Identifier (URI): Generic Syntax',
      href: 'https://www.rfc-editor.org/rfc/rfc3986',
      detail:
        'The gen-delims and sub-delims sets in section 2.2, the unreserved set and the rule that a producer must not percent-encode unreserved characters in section 2.3, section 2.4 on leading and trailing spaces, the syntax-based normalisation of section 6.2.2.1, and the prohibition on decoding the scheme.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 4648: The Base16, Base32, and Base64 Data Encodings',
      href: 'https://www.rfc-editor.org/rfc/rfc4648',
      detail:
        'The 24-bit group procedure and equals-sign padding, the canonical rule that unused trailing bits MUST be zero on output with parsers allowed to reject otherwise, the base64url alphabet of section 5, and the statement that the scheme provides no computational confidentiality.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8725: JSON Web Token Best Current Practices',
      href: 'https://www.rfc-editor.org/rfc/rfc8725',
      detail:
        'The requirement that libraries let the caller specify a supported algorithm set and MUST NOT use any other algorithm for cryptographic operations, and the guidance against generating or consuming tokens whose algorithm is none.',
      accessed: '2026-11-12',
    },
    {
      label: 'MDN: URLSearchParams',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
      detail:
        'The serialisation rules for application/x-www-form-urlencoded that the form mode of the URL encoder implements: U+0020 becomes a plus sign, and the percent-encode set is every code point except ASCII alphanumerics and star, hyphen, full stop and underscore.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP: CSV Injection',
      href: 'https://owasp.org/www-community/attacks/CSV_Injection',
      detail:
        'The four leading characters that make a cell a formula, and the mitigation list of double quoting, a single quote prefix, or a tab inserted inside the quoted field so Excel does not evaluate it.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP: XML External Entity Processing',
      href: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      detail:
        'The impact classes attributed to external entity resolution, including disclosure of confidential data and denial of service, and the mitigation of configuring the XML processor to disallow external entity resolution and DTD validation.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP: Path Traversal',
      href: 'https://owasp.org/www-community/attacks/Path_Traversal',
      detail:
        'The dot-dot-slash sequences and their percent-encoded forms, and the recommendation to normalise input before validating it, which is why decoding order is treated here as a security property rather than a style preference.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 2397: The "data" URL Scheme',
      href: 'https://www.rfc-editor.org/rfc/rfc2397',
      detail:
        'The syntax of a data URL, the default media type of plain text with the US-ASCII charset when none is given, percent-encoding of characters that cannot appear, and the statement that an application should not interpret a data URL whose media type has been disallowed by configuration.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3492: Punycode: A Bootstring Encoding of Unicode for Internationalized Domain Names',
      href: 'https://www.rfc-editor.org/rfc/rfc3492',
      detail:
        'The xn-- ASCII Compatible Encoding prefix for labels that need non-ASCII code points, and the acknowledgement that visually ambiguous code points exist, which is the reason the analyser reports a non-ASCII host in both forms.',
      accessed: '2026-11-12',
    },
    {
      label: 'Microsoft: Excel specifications and limits',
      href: 'https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3',
      detail:
        'The worksheet grid of 1,048,576 rows by 16,384 columns, the 32,767 character ceiling for a cell and the fifteen digit numeric precision behind the spreadsheet-damage findings in the CSV audit.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/encoders-decoders/base64/', name: 'Base64 Encode & Decode', blurb: 'Decodes one layer, reports whether the result is text, and flags a second encoded layer.' },
    { path: '/encoders-decoders/url/', name: 'URL Encode & Decode', blurb: 'Percent-encoding per RFC 3986, with a double-encoding banner and a canonical-form check.' },
    { path: '/learn/base64/', name: 'Base64: The Complete Format Guide', blurb: 'RFC 4648 alphabets, padding, line lengths and the data URL wrapper.' },
    { path: '/use-cases/api-debugging/', name: 'API Debugging Workflow', blurb: 'The same decoding steps inside an ordered triage of a response.' },
  ],
  words: 3800,
  image: '/images/covers/use-encoding.png',
  imageAlt: 'A flat vector diagram of one byte stream branching into three encoded representations above a filter panel that inspects only one branch.',
}

export default function Article() {
  return (
    <>
      <Section id="not-encryption" title="Encoding is not encryption">
        <Figure
          src="/images/use-encoding.svg"
          alt="Four panels: plain text, its base64 and percent-encoded forms, a filter that inspects only one layer, and the same value after normalisation matching the blocklisted string."
          caption="Every finding on this page comes from the same gap: a filter looks at one representation while the program acts on another. The encodings themselves are boring and perfectly reversible."
          width={1200}
          height={540}
        />
        <P>
          Four primitives get confused with each other in code review, and the confusion is where the incidents are. Encoding is a reversible, key-free representation change: base64, percent-encoding, punycode, the quoting rules of CSV. Its only
          job is to move bytes through a channel that cannot carry them. Encryption is reversible with a key and is the only one of the four that provides confidentiality. A hash is one-way and detects modification. A signature is a hash or a MAC
          made with a key, and it detects modification by someone who does not hold that key.
        </P>
        <P>
          RFC 4648 is explicit about the first of these: the base16, base32 and base64 encodings do not provide computational confidentiality, and the document recommends protecting the data before encoding it when confidentiality matters. That
          sentence is worth testing against your own code. Paste an opaque-looking value into the <a href="/encoders-decoders/base64/">Base64 tool</a> and read what comes back: the decoded bytes, a hex dump, a printable-text verdict, and a
          magic-byte match when the payload is a recognisable file type. If the field is meant to be secret, the tool has already told you that it is not.
        </P>
        <KeyTerms
          items={[
            { term: 'encoding', definition: 'Key-free, reversible representation change. Same bytes, different characters.' },
            { term: 'encryption', definition: 'Key-dependent reversible transform. Confidentiality only while the key is secret.' },
            { term: 'normalisation', definition: 'Rewriting an encoded value into one canonical spelling without changing what it means.' },
            { term: 'canonical form', definition: 'The single legal spelling of a value under a specification that permits only one.' },
            { term: 'decoding pass', definition: 'One application of a decoder. Layers of encoding need layers of passes to reach the payload.' },
            { term: 'integrity check', definition: 'A comparison proving two inputs are the same bytes, usually a hash or a MAC.' },
          ]}
        />
        <DataTable
          caption="What each primitive guarantees, and what a reviewer usually assumes"
          head={['Primitive', 'Reversible?', 'Needs a key?', 'Guarantees', 'Seen by the tools here']}
          rows={[
            ['base64, percent, punycode', 'Yes, by anyone', 'No', 'Nothing about secrecy or origin', 'Decoded output plus warnings about legal-but-odd spellings'],
            ['encryption', 'Yes, with the key', 'Yes', 'Confidentiality', 'Not offered: these tools do not encrypt'],
            ['hash', 'No', 'No', 'Change detection only', 'The round-trip check compares re-encoded text'],
            ['signature or MAC', 'No', 'Yes, a verification key', 'Origin and change detection', 'JWT segment split and signature byte count, never a verdict'],
          ]}
          foot="The mistake that turns an encoding bug into a security bug is treating the first row as if it belonged in the third or the fourth."
        />
        <Callout tone="risk" title="The consequence">
          <P>
            A value that passes a check on its encoded text and a program that acts on the decoded form are two different objects. Any decision made on one while looking at the other is a normalisation bug, and normalisation bugs are the whole
            subject of this page. The fix always has the same shape: decide on one canonical representation, convert to it before comparing, and reject values that refuse to convert.
          </P>
        </Callout>
      </Section>

      <Section id="canonical-base64" title="Canonical base64 and the plus sign problem">
        <P>
          Base64 packs three bytes into four characters, six bits per character. That is exact when the input length is a multiple of three. When it is not, the last character carries fewer data bits than it can hold, and those leftover bits are
          still present in the symbol you wrote. RFC 4648 handles this with two statements that belong next to each other: on output the unused bits MUST be set to zero, and an implementation MAY check that on input and reject a value that fails.
        </P>
        <P>
          The consequence is that a legal-looking base64 string is not necessarily the encoding of one particular thing, because the same bytes have several spellings. A one-byte payload has sixteen distinct strings that all decode to it, and a
          three-byte payload has exactly one. The looseness lives entirely in the tail group.
        </P>
        <DataTable
          caption="Every spelling of three payloads, computed with the RFC 4648 bit regrouping"
          head={['Payload', 'Canonical', 'Other legal-looking spellings', 'Unused bits', 'Decoded bytes']}
          rows={[
            ['"no", 2 bytes', 'bm8=', 'bm9= and bm+= and bm/=', '2', '6e 6f every time'],
            ['"a", 1 byte', 'YQ==', 'YR== through Yf==: fifteen of them', '4', '61 every time'],
            ['"abc", 3 bytes', 'YWJj', 'none', '0', '61 62 63'],
          ]}
          foot="Two programs that compare base64 as text will disagree about values that decode identically, and a filter that only checks whether a blob is base64-shaped will accept spellings its own encoder would never have produced."
        />
        <P>
          The <a href="/encoders-decoders/base64/">decoder</a> reports this precisely instead of generally. When the leftover bits are non-zero it emits a non-canonical warning, quotes the specification clause, and points at the position of the
          offending character. There is also a round-trip flag: the tool re-encodes the bytes it just produced and states whether the result equals the text you pasted, which is the cheapest possible canonical-form test. MIME wraps base64 at 76
          characters and PEM at 64, so real-world payloads contain newlines that are not part of the data; the decoder drops whitespace and says how many characters it dropped, and turning the strict option on makes that an error.
        </P>
        <H3>The three meanings of a plus sign</H3>
        <P>
          A plus in transmitted text can mean three things, and the difference between them has caused more field corruption than most syntax errors. In a URI query a plus is a plus: RFC 3986 lists it among the sub-delims, legal to appear
          literally. In an <code>application/x-www-form-urlencoded</code> body a plus means a space, and MDN states the rule as a serialisation requirement, encode U+0020 as a plus. In a base64 payload a plus is the 62nd value of the standard
          alphabet and has no business appearing in a base64url segment at all. All three travel through the same request line and the same form bodies, so the same character gets different treatment depending on which parser is on the other end.
        </P>
        <DataTable
          caption="One base64 payload followed through a query string"
          head={['Stage', 'Text', 'What the next reader sees']}
          rows={[
            ['original bytes', 'fb ff', 'two bytes with no safe text form'],
            ['standard base64', '+/8=', 'four characters, one of them a plus'],
            ['placed in a query unencoded', ' /8=', 'the plus became a space'],
            ['decoded with whitespace dropped', 'ff', 'one byte, not the original two'],
            ['the tool verdict', 'round trip false', 'plus-in-url-safe warning on the way back up'],
          ]}
          foot="Nothing here is malformed: each step is a legal reading of the previous one under some convention. The decoder has a warning naming this exact round trip as the usual cause of a token or cookie failing to verify after passing through a URL."
        />
        <P>
          The <a href="/encoders-decoders/url/">URL encoder</a> has five modes, and the mode decides which characters it leaves alone. Component encodes the slash. Query-value treats ampersand and equals sign as structure but does not turn a space
          into a plus. Form matches <code>URLSearchParams</code>: it writes a space as a plus. URI follows RFC 3986, where a space must become <code>%20</code>. Choosing the wrong set produces two symmetric failures: use form mode on a path
          segment and a space arrives as a plus, so the server looks for a file with a plus in its name; use component mode on a form body and <code>C++</code> arrives as <code>C</code> followed by two spaces.
        </P>
        <CodeBlock
          title="three spellings"
          language="text"
          code={'q=C%2B%2B  read as a URI query value:  C++\nq=C++      read as a form body:         C  \nq=C%20%20  read either way:               C  '}
          caption="Three spellings, two meanings, and only one of them survives both readers."
        />
        <Callout tone="tip" title="What to do instead">
          <P>
            Compare decoded bytes, or compare re-encoded canonical text, never the two spellings you were handed. If you publish a hash over an encoded attachment, state which spelling that hash covers, because sixteen spellings of a one-byte
            payload produce the same decoded file. Pick the transport alphabet and the padding convention before you pick an encoder: base64url without padding for anything that goes in a path segment, a query value or a cookie; standard
            base64 percent-encoded as a whole value for anything that cannot.
          </P>
        </Callout>
      </Section>

      <Section id="layered-decoding" title="Layered decoding, base64 in URLs, and path traversal">
        <P>
          Percent-encoding is idempotent in one direction only. Encoding a value twice and decoding it once leaves a string that still looks encoded while having already defeated a single-pass check. The character that reveals the layering is the
          percent sign itself, because <code>%25</code> is a literal percent: a double-encoded space is <code>%2520</code>, and a double-encoded dot-dot-slash is a string no naive filter recognises. The analyser answers the layering question by
          iteration: it decodes repeatedly until the output stops changing, up to six passes, and reports the count as a nested-encoding finding.
        </P>
        <DataTable
          caption="Decode passes for one input, counted until the text stops changing"
          head={['Pass', 'Text after the pass', 'Is it traversal yet?']}
          rows={[
            ['0, as pasted', '%252e%252e%252fetc%252fpasswd', 'no, it is not yet dot-dot-slash'],
            ['1', '%2e%2e%2fetc%2fpasswd', 'no, still percent-escaped'],
            ['2', '../etc/passwd', 'yes, this is the payload'],
            ['3', '../etc/passwd', 'unchanged, so the loop stops'],
          ]}
          foot="A filter that decodes once validates the string from pass 1, which contains neither a slash nor a dot-dot sequence."
        />
        <P>
          RFC 3986 section 6.2.2.1 defines syntax-based normalisation, and it is exactly two rewrites that preserve meaning for every URI: uppercase the hex digits in each escape, and decode any escape that happens to name an unreserved
          character. The normalise function in the URL tool implements those two steps and nothing else. Section 2.3 adds the producer-side rule: a URI producing application must not percent-encode unreserved characters. When the decoder finds
          <code>%41</code> where <code>A</code> would do, it reports the value as over-encoded, which is legal but unusual, and unusual encodings are what allowlist mismatches are made of.
        </P>
        <H3>Base64 inside a URL: which layer moves first</H3>
        <P>
          Base64 and percent-encoding collide by construction. Three characters a base64 string can produce have other jobs in a URI: plus and slash are the 62nd and 63rd values of the standard alphabet, and the equals sign is its padding. RFC 3986
          section 2.2 gives the resolution rule: if data for a URI component would conflict with a reserved character's purpose as a delimiter, then the conflicting data must be percent-encoded before the URI is formed. Section 2.4 fixes the
          order on the way back in: components must be parsed and separated before the percent-encoded octets within those components can be safely decoded. Put the two clauses together and there is exactly one correct sequence: split the query
          into pairs, decode the escapes in the pair you want, then base64-decode the result.
        </P>
        <DataTable
          caption="One four-byte payload in seven transports, and what the decoder returns for each"
          head={['Text handed to the decoder', 'How it came about', 'Decoded output', 'What the report adds']}
          rows={[
            ['YWJj/g==', 'the canonical padded spelling', '4 bytes, 61 62 63 fe', 'not-utf8, so a binary payload; round trip true'],
            ['YWJj/g=', 'one pad character where two belong', 'the same 4 bytes', 'nothing except a round trip that now reads false'],
            ['YWJj_g', 'base64url with the padding skipped', 'the same 4 bytes', 'a base64url-normalised info line; round trip true'],
            ['YWJj-g', 'a slash replaced with a dash instead of an underscore', '4 bytes, 61 62 63 fa', 'an alphabet note only, and a decoded payload that changed'],
            ['YWJj%2Fg%3D', 'escapes handed over undecoded', '6 bytes, 61 62 63 d8 58 37', 'invalid-character for each percent sign, plus non-canonical'],
            ['++8=', 'a two-plus value written into a query raw', '2 bytes, fb ef', 'the correct answer, because nothing decoded it'],
            ['8=', 'the same value after a form decode and a whitespace drop', '0 bytes', 'bad-length and non-canonical, so a hard error'],
          ]}
          foot="Rows two and four are the ones that pass every check. A lost pad character moves only the round-trip flag, and a mis-mapped alphabet character changes the decoded payload while the report stays clean."
        />
        <P>
          RFC 7515 defines its encoding as base64url with the padding characters omitted, and its appendix C.3 gives the recovery rule: add nothing when the length is divisible by four, two pads when the remainder is two, one pad when the remainder
          is three, and call the input illegal when the remainder is one. That last branch cannot be reached by a correct encoder, because three input bytes always produce exactly four characters, so a remainder of one means a character was lost
          rather than that a convention was chosen. This is why the length rule is an error rather than a warning here.
        </P>
        <H3>Path traversal that survives one normalisation pass</H3>
        <P>
          OWASP describes the traversal attack as dot-dot-slash sequences together with encoded variants, and states the mitigation as normalising the input before validating it. The engineering detail that makes this hard is that before is a
          single point in a pipeline that usually contains several decoders, and each of them changes what the string looks like.
        </P>
        <DataTable
          caption="Representations of one intent, and what a single-pass validator sees"
          head={['Input', 'After one decode pass', 'After two passes', 'Tool finding']}
          rows={[
            ['../etc/passwd', '../etc/passwd', 'unchanged', 'nothing: already plain text'],
            ['..%2fetc%2fpasswd', '../etc/passwd', 'unchanged', 'delimiters are reserved, so encoding them is legal and not reported'],
            ['%2e%2e%2f%65tc', '..//etc', 'unchanged', 'normalise rewrites it; lowercase hex noted'],
            ['%252e%252e%252fetc', '%2e%2e%2fetc', '../etc', 'multi-layer, two passes'],
            ['%25252e%25252e%25252f', '%252e%252e%252f', '../ after the third', 'multi-layer, three passes'],
            ['%c0%afetc%2fpasswd', 'bytes c0 af, not text', 'not applicable', 'invalid UTF-8: an overlong encoding is not a character'],
          ]}
          foot="The last row is the one people forget. An overlong encoding of a slash is not valid UTF-8 at all, so a decoder that is strict about UTF-8 refuses it, while a decoder that maps bytes through a single-byte charset produces a slash and calls it success."
        />
        <Callout tone="risk" title="Security consequence">
          <P>
            RFC 3986 warns against comparing URIs after decoding, because reserved characters that were encoded and reserved characters that were literal become indistinguishable once you have decoded them. The ordering rule for a validator: compare
            after normalising with the two section 6.2.2.1 rewrites, not after fully decoding; and if you must validate a decoded payload, decode every layer first, because validating in the middle of a chain validates a string your recipient
            never sees. Validate on the resolved path against a fixed root, and treat a value whose decode chain is longer than one as suspicious rather than as something to normalise into acceptance.
          </P>
        </Callout>
      </Section>

      <Section id="identity-tokens" title="Identity and tokens: punycode, homoglyphs, unverified JWTs">
        <P>
          A host name can contain characters that DNS cannot store. RFC 3492 solves that with an ASCII Compatible Encoding: a label that needs non-ASCII code points is rewritten with the prefix <code>xn--</code> followed by an encoding of the
          differences, and the specification itself acknowledges that visually ambiguous code points exist. That acknowledgement is the origin of the homoglyph problem, and the prefix is the visible trace of the mechanism. The analyser reports
          both forms and explains the gap: the string you compare against an allowlist is the ASCII form, the string your user reads is the Unicode form, and a check written against one is not a check on the other.
        </P>
        <DataTable
          caption="Two host spellings, one DNS name"
          head={['Representation', 'What it is', 'Good for', 'Dangerous for']}
          rows={[
            ['Unicode label', 'what the user typed or read', 'rendering, copying, matching intent', 'string comparison, because code points can look identical and differ'],
            ['ASCII xn-- label', 'what DNS and TLS certificates see', 'allowlists, subject matching, logs', 'human review, because nobody can eyeball a homoglyph inside it'],
            ['percent-encoded host', 'not legal', 'nothing', 'it signals that somebody form-encoded the wrong component of the URI'],
          ]}
          foot="Percent-encoding is not how a non-ASCII label gets into a URI host; punycode is. A percent sign inside the host component means an encoder was applied to a component that does not take escapes."
        />
        <P>
          Case matters for a different reason. RFC 3986 forbids percent-decoding the scheme, so <code>hTTP://</code> and <code>http://</code> are the same scheme, and a filter comparing strings will miss it. The same panel reports an unencrypted
          scheme as a finding of its own, because plain HTTP exposes cookies and passwords to anyone on the path no matter how carefully the encoding was handled upstream. If the authority contains a user-info part, the note says RFC 3986
          deprecates it and RFC 7230 forbids it in a URI sent over HTTPS, because user-info is where people paste credentials and the escape rules for that component are not the rules for a query.
        </P>
        <H3>Unverified tokens: base64url with a claim set</H3>
        <P>
          A JSON Web Token is three base64url segments separated by dots, and nothing about that makes it a lock. The first two segments are plain JSON, and the third is a signature produced with a key the reader does not have. The decoder
          recognises the shape, splits the segments, prints the header and the payload as JSON, reports the signature length in bytes, and lists the registered claims it found with an interpretation attached to each time value. What it
          deliberately does not do is verify, and it says so in the output.
        </P>
        <P>
          When the header algorithm is <code>none</code> or absent, the warning states that a verifier accepting that algorithm treats any signature as valid. When a MAC algorithm header carries a key id, the warning names key confusion as the
          risk if the server looks the key up from an attacker-influenced value. Those map onto requirements in RFC 8725, which says a library MUST let the caller specify a supported set of algorithms and MUST NOT use any other algorithm, and that
          each key MUST be used with exactly one algorithm. Time claims are read as UTC seconds; expiry is reported as elapsed or remaining time, and a token with no expiry gets a warning of its own, because an indefinitely valid bearer token is a
          revocation problem.
        </P>
        <DataTable
          caption="Header and payload observations against the requirement each one corresponds to"
          head={['What the decoder prints', 'What it proves', 'What it does not prove', 'Requirement behind the warning']}
          rows={[
            ['the alg value', 'what the sender asked for', 'what the verifier will accept', 'a caller-specified algorithm set, nothing else used'],
            ['absent or none algorithm', 'a token a weak verifier would trust', 'validity of anything at all', 'do not consume unsecured tokens unless explicitly requested'],
            ['kid alongside a MAC', 'the server may look up a key from it', 'that the key is the right kind of key', 'one key, one algorithm, checked at operation time'],
            ['exp, iat, nbf in UTC seconds', 'the sender intended a lifetime', 'that either party has the right clock', 'validate the time claims'],
            ['signature byte count', 'that there is something to check', 'that the algorithm or key is right', 'the algorithm must match the key type'],
          ]}
          foot="Signature length is derived from the segment character count, so it is an observation about the text rather than a verdict on the token."
        />
        <Callout tone="risk" title="Security consequence">
          <P>
            Everything on this page that lets a value change spelling without changing meaning also lets a token change shape without changing bytes, which matters if your verification code re-encodes a payload before checking it. The defensive
            rule is boring and worth writing on the wall: choose the algorithm set, hand it to the library, and never let the token choose. RFC 8725 is short and belongs in the checklist for every token library the team adopts.
          </P>
        </Callout>
      </Section>

      <Section id="data-uri-compressed" title="Data URIs and compressed payloads">
        <P>
          RFC 2397 defines the data URL as a scheme, an optional media type, an optional base64 flag, a comma and the data, with the default media type being plain text in the US-ASCII charset when no media type is supplied. The base64 flag is
          the reason this belongs on a page about encodings: a data URI is a container of base64 carrying a declared content type, and a declaration is not a check. The decoder recognises the prefix, splits the media type from the payload and
          puts the payload through the same pipeline as any other base64 value, which includes magic-byte sniffing. A data URI that declares one media type while its leading bytes match another is reported with what the bytes say.
        </P>
        <P>
          On the URL side the analyser treats scripting schemes as an error rather than a warning. A value whose scheme is a script or a data scheme is reported as using a scripting scheme, and the note says that assigning it to an anchor href or
          to a redirect target that has no allowlist executes script in your own origin, recommending that http and https be allow-listed instead of script schemes being block-listed, because a block-list of the literal word is bypassed by case
          changes and by a numeric character reference for the first letter.
        </P>
        <H3>Compressed payloads: the layer that throws information away</H3>
        <P>
          A base64 string whose decoded bytes begin <code>1f 8b</code> is a gzip stream, and gzip is the container in which most encoded payloads actually travel. RFC 1952 gives it a ten-byte header, an optional extension block, a DEFLATE body
          and an eight-byte trailer. The trailer holds a CRC-32 of the uncompressed data and a field called ISIZE. ISIZE stores the size of the original input <em>modulo 2 to the 32</em>, because four bytes is all the format has. A payload that
          came from a ten-byte file and one that came from a file of four gigabytes plus ten bytes carry the same trailer. So ISIZE is a consistency check on the low thirty-two bits of a length, not a length, and a decoder that allocates a
          buffer from it is right for small inputs and wrong in a way that only shows up on large ones.
        </P>
        <P>
          The CRC in the trailer deserves the same care, because it is the field most often mistaken for a security control. CRC-32 is a linear checksum designed to catch a flipped bit on a tape. Two different inputs can be made to share a CRC by
          solving for the tail bytes, and nothing about the algorithm involves a key, so a matching CRC proves that the sender and the receiver agree on the arithmetic, not that the payload is the payload you expected. Three header fields exist
          to describe the file that was compressed, and they arrive in the payload of a transport that was not supposed to know about it: MTIME is the source file's modification time, FNAME is the original file name, FCOMMENT is free text. An
          endpoint that gzips a generated report and hands it back in a data URI is therefore publishing the build host's filesystem layout and clock unless the compressor was told not to record them, which is what <code>gzip -n</code> exists
          for.
        </P>
        <DataTable
          caption="The gzip header fields a decoder reads, and what each one actually licenses it to conclude"
          head={['Field', 'Width', 'Safe to use for', 'Not safe to use for']}
          rows={[
            ['ID1 ID2', '2 bytes', 'deciding that this is a gzip stream, which is exactly what magic-byte sniffing does', 'deciding the stream is well formed or safe'],
            ['CM', '1 byte', 'rejecting a method other than 8 instead of guessing', 'negotiating anything, there is nothing to negotiate'],
            ['FLG plus FNAME, FCOMMENT, FEXTRA', '1 byte plus variable', 'skipping past the body correctly', 'logging without redaction, they carry source paths'],
            ['MTIME', '4 bytes', 'nothing a recipient needs', 'anything, it is a fingerprint of the producing host'],
            ['CRC32', '4 bytes', 'detecting an accidental truncation or bit flip', 'authenticating the payload, it is unkeyed and linear'],
            ['ISIZE', '4 bytes', 'a low-32-bit consistency check on the decoded length', 'sizing a buffer, it wraps at four gibibytes'],
          ]}
          foot="Two of these fields are the reason a decoder can be correct about the bytes and still wrong about the intent: the container describes a file, and the transport only carried an opaque blob."
        />
        <P>
          On the wire, HTTP splits the question in two. <code>Content-Encoding</code> is end-to-end: it describes the selected representation, survives proxies, and is what the media type is a modifier of. <code>Transfer-Encoding</code> is
          hop-by-hop: it describes that one message on that one connection, and every intermediate node may apply a different one. When both are present, the decoding order is fixed regardless of the order the fields appear in the header block:
          reassemble the chunks, then inflate. A server that receives a request body in a content coding it cannot undo responds 415 Unsupported Media Type, so request-side compression is a supported feature to negotiate and not a hint.
        </P>
        <Callout tone="risk" title="Security consequence">
          <P>
            A decoder that accepts a compressed payload at all has to bound the output before it starts, because the whole point of DEFLATE is that a small input can expand a great deal. The YAML parser used on this site caps alias expansion at
            a thousand aliases per document for the analogous reason. Same shape of problem, same shape of defence: a byte ceiling on the compressed input, a separate byte ceiling on the decompressed output, and a hard wall-clock limit, checked
            before decoding rather than reported after.
          </P>
        </Callout>
      </Section>

      <Section id="identify-encoding" title="Which encoding am I holding">
        <P>
          Before any of the previous sections can be applied to a value you found in a log, one question has to be answered: which decoder is this. The engine on this site answers it with a fixed sequence of tests, and knowing the order is useful
          because it tells you which claims are cheap and which are guesses. Three wrapper patterns are tried first, before any alphabet checking: three runs of URL-safe characters separated by dots is read as a JSON Web Token, a leading
          <code>data:</code> is read as a data URL, and a matched begin-and-end marker line is read as PEM. Then whitespace is counted and removed, dash and underscore are mapped to the standard alphabet if either is present, padding is checked,
          and the length modulo four is checked. Only then does the bit regrouping run, followed by the leftover-bit test, a strict UTF-8 attempt, a magic-byte match on the decoded bytes, and a re-encode comparison.
        </P>
        <P>
          The last three of those tests all work on bytes rather than on text, and that is the whole design decision worth copying. A container format fixes its opening bytes, so the encoded spelling of those bytes is equally fixed: a gzip stream
          begins <code>H4sI</code>, a ZIP archive and therefore every DOCX, XLSX, APK and EPUB file <code>UEsDB</code>, a PNG <code>iVBOR</code>, a PDF <code>JVBER</code>. The prefix <code>eyJ</code> is the same fact about a different layer: it is
          what an opening brace followed by a quotation mark encodes to, which is why every JWT header and payload segment starts with those three characters. These are prefixes of the text and not of the bytes, so they are a hint about which
          decoder to try and never a verdict; the verdict comes from the decoded leading bytes.
        </P>
        <P>
          The other half of the question is which shapes look like base64 and are not, because that is what an allowlist built on a shape test gets wrong. A hex digest is a subset of the base64 alphabet and its lengths are all multiples of four:
          an MD5 string is 32 characters and decodes to 24 bytes, SHA-256 is 64 and decodes to 48, and each of those passes without an error and round-trips as though it were a proper encoding. Ordinary words pass too: <code>test</code> decodes
          to three bytes and <code>data</code> to three more, none of them text.
        </P>
        <DataTable
          caption="Inputs that a shape test accepts, and what the same bytes mean under the format they came from"
          head={['Input', 'Length mod 4', 'What this site reports', 'What it is']}
          rows={[
            ['d41d8cd98f00b204e9800998ecf8427e', '0', '24 bytes, binary, round trip true', 'an MD5 hex digest of the empty string'],
            ['test', '0', '3 bytes, not valid UTF-8', 'an English word'],
            ['MZXW6YTB', '0', '6 bytes, round trip true, no warning', 'base32 of the word fooba, per RFC 4648 test vectors'],
            ['MY======', '0', 'too-much-padding error, non-canonical', 'base32 of the letter f, six pads to a group of eight'],
            ['YWJjZ', '1', 'bad-length error and non-canonical', 'a truncated value: five characters cannot come from any encoder'],
            ['H4sIAAAAAAAACstIzcnJVyjPL8pJAQCFEUoNCwAAAA==', '0', '31 bytes, magic bytes match gzip', 'the string hello world, compressed then encoded'],
          ]}
          foot="Four of these six rows decode without an error and none of the four is a base64 payload of text. Shape can prove a value is decodable, never that it was produced by the encoder you have in mind."
        />
        <Callout tone="risk" title="Security consequence">
          <P>
            RFC 4648 section 12 is short and every paragraph is a warning about identification. Ignoring non-alphabet characters instead of rejecting the whole encoding creates a covert channel and can be used to defeat a string comparison.
            Base encoding adds no entropy to the plaintext, but it increases the amount of plaintext available and provides a signature for cryptanalysis in the form of a characteristic probability distribution: base64 of text is not noise, a
            few hundred characters are enough to tell prose from a hash, and the letter frequencies of whatever you encoded survive the wrapper completely. Identify from the decoded bytes, state which spelling any hash you publish covers, and
            when a value arrives in an unexpected shape, reject it rather than normalising it into acceptance.
          </P>
        </Callout>
      </Section>

      <Section id="formula-xxe" title="Formula injection and XXE: normalisation inside the parser">
        <P>
          The format is a grid and the reader is an expression evaluator, which is the whole problem. OWASP describes the result: a cell beginning with one of four characters is treated as a formula by the spreadsheet, and the mitigations it
          lists are wrapping fields in double quotes, prefixing with a single quote, or inserting a tab inside the quoted field. The four leading characters are <code>=</code>, <code>+</code>, <code>-</code> and <code>@</code>. That is a
          normalisation problem of exactly the same shape as the ones above, with the twist that the decoder is a spreadsheet and the encoding layer is the CSV quoting rule. RFC 4180 says a field containing a delimiter, a quote or a line break
          must be quoted, and says nothing about the first character of the content, because a grid format has no opinion about execution. Quoting therefore protects the value on the way in and does nothing on the way out: the same text is
          handed to the evaluator intact.
        </P>
        <DataTable
          caption="Cell content, whether it is a finding, and why"
          head={['Cell', 'Audit verdict', 'Reason in the report']}
          rows={[
            ['=1+1', 'formula injection', 'first character is one of the four'],
            ['+3584012345678', 'formula injection', 'first character is a plus, and international phone numbers are the common accidental case'],
            ['-45', 'not flagged', 'a minus followed by a digit or a point reads as a negative number'],
            ['-45;anything', 'formula injection', 'a minus followed by something that is not a number'],
            ['@SUM(A1)', 'formula injection', 'first character is an at sign'],
            ['00123', 'leading zero dropped', 'a number-typed cell stores it as 123'],
            ['123456789012345678', 'precision loss', 'spreadsheets keep about fifteen significant digits'],
          ]}
          foot="The fourth row is the reason the auditor does not simply test for a leading minus: arithmetic-looking values are legitimate and formula-looking ones are not, and the difference is the character after the minus."
        />
        <Callout tone="risk" title="Security consequence">
          <P>
            A CSV export is a program in a language your users never agreed to run. The defensive version of that is a change of ownership rather than a change of format: the code that writes the file decides whether a field is safe, and the person
            opening it in a spreadsheet is not the reviewer. If you generate exports from user-controlled text such as display names, product descriptions or anything read back out of a CRM, those four characters are the whole surface and the
            writer is where they get handled.
          </P>
        </Callout>
        <H3>XXE: normalisation happening inside the parser</H3>
        <P>
          Everything above happens between the payload and the parser. XML external entities happen inside the parser, which is why they are the hardest to reason about and the easiest to miss in review. OWASP describes the impact as disclosure
          of confidential data, denial of service and other system impacts, and describes the mitigation as configuring the XML processor to disallow external entity resolution and DTD validation. The mechanism is a normalisation step the
          format requires: a document may declare entities, and entity references are replaced before the document is presented to the application. Once a reference may point at a name outside the document, the parser performs a fetch on your
          behalf and the application sees only the resulting text. The encoding-adjacent part is that the payload reaching the parser is often an encoded layer of something else, so the parser you hardened carefully may not be the parser that
          receives the document.
        </P>
        <DataTable
          caption="Reference resolution across the formats covered here"
          head={['Format', 'Resolution feature', 'What it enables', 'Control available in this site']}
          rows={[
            ['XML', 'entities and an external DTD subset', 'reading data outside the document, and unbounded expansion cost', 'none: there is no XML parser here'],
            ['YAML', 'anchors, aliases and merge keys', 'a small document describing a much larger value', 'alias expansion capped at a thousand by the parser this site uses'],
            ['JSON', 'nothing', 'no reference mechanism exists in the grammar', 'not applicable: RFC 8259 has no resolution step'],
            ['CSV', 'nothing in the format, but the reader evaluates formulas', 'execution inside the spreadsheet', 'writer quoting plus the audit report'],
            ['base64 and data URIs', 'nothing themselves', 'a document arriving at the wrong parser', 'magic-byte identification of the decoded payload'],
          ]}
          foot="The absence of a resolution step is a genuine security property of JSON, and the presence of one is a genuine cost of the formats that are pleasant to write by hand."
        />
        <Callout tone="tip" title="What to do instead">
          <P>
            For XML you accept, turn off DTDs or at least external entity resolution, in the parser configuration of the code that receives the document, in a way the document itself cannot override. For any format with references, configure a
            limit on resolution work rather than a rule about the text. For any encoded container, identify what is inside before routing it, which is what the magic-byte report is for.
          </P>
        </Callout>
      </Section>

      <Section id="review-checklist" title="Review checklist">
        <P>
          The findings above come from four recurring decisions, and each one is checkable in an hour of code reading with a decoder window open beside you. None of this needs a live system: every case reproduces by pasting your own values into
          the tools and reading what the reports say about them.
        </P>
        <DataTable
          caption="Four questions, the tool that answers them, and the finding to expect"
          head={['Question about your code', 'Tool', 'Finding that answers it']}
          rows={[
            ['Which spelling do we compare: encoded text or decoded bytes?', 'Base64', 'a non-canonical warning naming the position, plus a round-trip flag'],
            ['How many decode passes before this value stops changing?', 'URL analyser', 'a multi-layer finding carrying the pass count'],
            ['Which component of the URI did we mean to encode?', 'URL encoder modes', 'differences between component, query-value, form, path and URI output'],
            ['Does the reader resolve references or evaluate expressions?', 'CSV audit and base64 sniffing', 'formula injection rows and a magic-byte media type'],
            ['Does the token algorithm come from the token or from our configuration?', 'Base64 JWT view', 'unsecured-algorithm and key-confusion warnings'],
          ]}
          foot="The ordering rule that covers all five: decode fully, normalise to one canonical form, then compare or authorise. A pipeline that validates between two decoders is validating a string its recipient never sees."
        />
        <P>
          The invariants worth writing down: encode once, with the mode that matches the component. Decode fully, with strict settings, and refuse anything that needs more than one pass to settle. Normalise with the two meaning-preserving
          rewrites and nothing else. Compare decoded bytes or canonical text rather than two arbitrary spellings. Allow-list schemes, media types, algorithms and character sets, because every block-list on this page has its escape documented in
          the tool hint that flags it. Configure the parser instead of auditing the text, because resolution and evaluation both happen inside the parser. And keep the reports, because a round-trip flag, a pass count and a magic-byte verdict
          are cheap evidence about an input long after the request that carried it has gone.
        </P>
        <Callout tone="note" title="How our tools handle these cases">
          <P>
            The recogniser requires three runs of URL-safe characters separated by dots before it treats a value as a JWT, so a token whose segments still carry padding is not identified as a token at all. The base64 decoder maps dash and
            underscore back to the standard alphabet, reports that as an info line, and refuses characters outside the alphabet rather than skipping them, because RFC 4648 section 12 names that skip as a covert channel. The URL analyser
            decodes up to six passes and reports the count as a nested-encoding finding; it also notes a path beginning with two slashes as the mechanism behind open-redirect and SSRF bugs in naive URL builders. The CSV writer quotes any
            field whose first character is one of the four formula leaders when its length is greater than one, and the auditor produces a finding naming the cell, column and row with the reason that mainstream spreadsheets treat them as
            formulas. The YAML parser behind the tools is given a limit of a thousand aliases per document, and a document that exceeds it produces an error rather than a slow success. The base64 decoder identifies a gzip stream from the
            leading 1f 8b bytes and reports the payload as binary rather than text, which is the correct stopping point: it does not inflate the stream, because everything after that is a second decoding step with its own parser and its own
            place in the trust boundary.
          </P>
        </Callout>
        <Callout tone="note" title="One sentence version">
          <P>
            An encoding tells you how a value looks; it does not tell you what it means, who produced it, or what the next component in the chain will do with it, and every finding on this page is somebody acting on one of those three as if it
            were the first.
          </P>
        </Callout>
      </Section>
    </>
  )
}
