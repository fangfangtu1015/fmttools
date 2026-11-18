/**
 * Base64 encoding guide.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * The product behaviour described in the final section was checked against
 * src/lib/tools/base64.ts; the RFC clause numbers still cited in this file
 * were checked against the published RFC texts on 2026-11-12.
 */

import { Callout, CodeBlock, DataTable, Figure, H3, KeyTerms, P, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'base64',
  path: '/learn/base64/',
  title: 'Base64 Complete Guide: RFC 4648, base64url & JWT | FmtTools',
  description:
    'A complete guide to Base64 with worked bit maths: the RFC 4648 alphabet, padding and size overhead, base64url, MIME and PEM wrapping, data URIs, JWTs and why it is not encryption.',
  h1: 'Base64: The Complete Encoding Guide',
  summary:
    'Three bytes become four characters — the arithmetic, the alphabets, the padding rules, the 33% overhead, and every place the encoding shows up in practice.',
  keywords: ['base64 guide', 'rfc 4648', 'base64url', 'base64 padding', 'data uri', 'jwt base64url', 'is base64 encryption'],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 9,
  sections: [
    { id: 'bit-arithmetic', label: 'The problem Base64 solves, and the bits behind it' },
    { id: 'alphabets-and-padding', label: 'Alphabets, padding and the two safe symbols' },
    { id: 'wrapping-and-pem', label: 'Line wrapping: MIME rules and PEM armour' },
    { id: 'canonical', label: 'Canonical encoding and leftover bits' },
    { id: 'containers', label: 'Where Base64 actually shows up: data URIs and JWTs' },
    { id: 'decoding-in-code', label: 'Decoding it in code, and identifying the bytes' },
    { id: 'how-the-tool-handles-it', label: 'How this site handles these cases' },
  ],
  faqs: [
    {
      question: 'Why did my Base64 decode to garbage?',
      answer:
        'Work through the common causes in order. A hyphen or underscore means you are holding base64url, and a lenient standard decoder silently drops those characters. A plus that became a space came through a query string. If the length is right but the text is wrong, the bytes were UTF-8 and you read them as Latin-1 or the reverse — a fatal UTF-8 decode turns that into an exception instead of replacement characters.',
    },
    {
      question: 'Can I store a secret as Base64?',
      answer:
        'You can store it, but you cannot keep it. A base64 value in a config file, cookie or log is readable by anyone who can see it, and the character shape is no barrier to a grep for credentials. Encode a secret only to move it through a text channel. Where it has to rest, keep it in a keystore or secret manager and store a reference.',
    },
    {
      question: 'Is there a maximum size for Base64 data?',
      answer:
        'The encoding itself has no ceiling: it is a streaming regrouping, so the length is always 4 * ceil(n / 3) characters. Every limit you hit belongs to the carrier: query strings, cookies, mail and proxy line limits, the parsed weight of an HTML document that inlines a data URI, and the argument-count cap that makes a naive browser helper throw RangeError on large input.',
    },
    {
      question: 'Which Base64 variant should I pick for a new format?',
      answer:
        'Pick by transport, not by taste. Standard base64 with padding is right for MIME, PEM and data URIs. base64url without padding is right for anything in a path segment, query value, cookie or filename, because hyphen and underscore are unreserved. base32 is worth its 60% overhead only when a human reads the value aloud or types it.',
    },
    {
      question: 'Can a Base64 value be corrupted without anyone noticing?',
      answer:
        'Yes. There is no checksum and no parity, so one flipped character silently produces different bytes, and characters dropped or added in transport usually still decode. If integrity matters, put a MAC or a hash over the decoded octets and verify it — which is exactly what signed tokens do around the encoded part.',
    },
    {
      question: 'Should I store Base64 in a text column or decode it first?',
      answer:
        'Store the decoded octets when the value is really data — a key, an image, an opaque identifier — because the text form costs a third more and any comparison over encoded text has to agree on one spelling of what may legally have fifteen. Keep the encoded form when the text itself is the artefact: a token segment whose signature covers the encoded bytes.',
    },
  ],
  sources: [
    {
      label: 'RFC 4648 — The Base16, Base32, and Base64 Data Encodings',
      href: 'https://datatracker.ietf.org/doc/html/rfc4648',
      detail:
        '§3.1 line feeds, §3.2 padding, §3.3 non-alphabet characters, §3.5 canonical encoding, §4 base64, §5 base64url, §6 base32, §7 base32hex, §12 security.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 2045 — MIME Part One, §6.8 Base64 Content-Transfer-Encoding',
      href: 'https://datatracker.ietf.org/doc/html/rfc2045',
      detail: '76-character line rule, ignore-outside-alphabet decoder rule, "about 33 percent larger".',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7468 — Text Encodings of PKCS #8 and Other Objects (PEM)',
      href: 'https://datatracker.ietf.org/doc/html/rfc7468',
      detail: 'BEGIN/END label structure, 64 chars per line, parsers SHOULD ignore whitespace.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 2397 — The "data" URL scheme',
      href: 'https://datatracker.ietf.org/doc/html/rfc2397',
      detail: 'dataurl grammar, default text/plain US-ASCII.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7515 — JSON Web Signature (JWS)',
      href: 'https://datatracker.ietf.org/doc/html/rfc7515',
      detail: '§7 compact serialisation with BASE64URL; §5.1 signing input.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8725 — JSON Web Token Best Current Practices',
      href: 'https://datatracker.ietf.org/doc/html/rfc8725',
      detail: '§3.1 reject unexpected alg rather than trusting the header.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3986 — Uniform Resource Identifier: Generic Syntax',
      href: 'https://datatracker.ietf.org/doc/html/rfc3986',
      detail: '§2.3 unreserved characters (hyphen, period, underscore, tilde).',
      accessed: '2026-11-12',
    },
    {
      label: 'MDN — Window.btoa() / atob()',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa',
      detail: 'Latin-1 constraint, InvalidCharacterError, TextEncoder/TextDecoder pattern.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8259 — JSON Data Interchange Format',
      href: 'https://datatracker.ietf.org/doc/html/rfc8259',
      detail: '§7 forces control-character escaping, §8.1 fixes UTF-8 — why binary must be wrapped.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/encoders-decoders/base64/', name: 'Base64 Encode & Decode', blurb: 'Encode and decode with variant, padding and line-length control, plus JWT, data URI and PEM inspection.' },
    { path: '/encoders-decoders/url/', name: 'URL Encoder & Decoder', blurb: 'Percent-encoding per RFC 3986, with a query inspector that catches double encoding.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'The format most base64 travels inside, including the escaping and UTF-8 rules that force the wrapper.' },
    { path: '/use-cases/api-debugging/', name: 'Tools for Debugging HTTP APIs', blurb: 'The same decoder in an ordered triage workflow for responses, tokens and log bodies.' },
    { path: '/use-cases/encoding/', name: 'Encoding & Security Tools', blurb: 'Canonical base64, double decoding and the normalisation bugs that get CVE numbers.' },
  ],
  words: 1785,
  image: '/images/covers/learn-base64.png',
  imageAlt: 'A flat vector illustration of a binary byte stream passing through an encoder into a printable alphabet of letters, digits and the plus and slash characters.',
}

export default function Article() {
  return (
    <>
      <Section id="bit-arithmetic" title="The problem Base64 solves, and the bits behind it" kicker="Arithmetic">
        <P>
          <strong>TL;DR.</strong> Base64 rewrites arbitrary bytes using 64 printable characters — it does not compress, detect corruption, or conceal
          anything. Three octets become four characters, always.
        </P>
        <P>
          Base64 is a binary-to-text encoding: it rewrites an arbitrary sequence of octets using 64 characters that every text transport agrees to pass through
          unmangled, plus one filler character. RFC 4648 standardises five related encodings in one document, and its section 3 exists because the pre-RFC world
          disagreed about line breaks, padding and stray characters — still the source of most base64 bug reports. JSON has a milder version of the same problem:
          RFC 8259 §7 requires control characters to be escaped and §8.1 fixes UTF-8, so a JPEG, a signature or a key cannot appear in a JSON string as itself.
        </P>
        <H3>Three bytes, twenty-four bits, four characters</H3>
        <P>
          Everything else follows from one observation: 3 octets contain 24 bits, and 24 divides exactly by 6, so each output character carries 6 bits. The
          encoder reads three octets, concatenates them into one 24-bit number, cuts that into four 6-bit pieces and looks each up in the alphabet. Take the three
          characters M, a and n — the example RFC 4648 itself uses in §9.
        </P>
        <CodeBlock
          title="worked example"
          language="text"
          code={`M = 0x4D = 01001101
a = 0x61 = 01100001
n = 0x6E = 01101110

24-bit stream:  010011 010110 000101 101110
6-bit indices:      19     22      5     46
Alphabet lookup:     T      W      F      u

base64("Man") = "TWFu"   (3 octets in, 4 characters out)`}
          caption="The bit groups straddle octet boundaries on purpose: index 22 is the low two bits of M followed by the high four bits of a."
        />
        <P>
          The regrouping never asks whether a byte is printable, valid UTF-8, or part of a multibyte sequence — base64 has no notion of characters, only octets.
          That is why the encoding is safe for compressed streams, image data and key material. The group size is three because nothing smaller fits: a single
          octet leaves four bits stranded and two leave two, so only at three does the fit become exact.
        </P>
        <Figure
          src="/images/learn-base64.svg"
          alt="Three stages: the octets for Man in binary, the 24 bits regrouped into four six-bit indices, and the indices mapped through the RFC 4648 alphabet to TWFu."
          caption="The whole algorithm in one picture. Everything after this point is about what happens when the input is not a multiple of three, which alphabet is in force, and where line breaks may be inserted."
          width={1200}
          height={540}
        />
        <H3>The 33 percent penalty</H3>
        <P>
          Base64 expands data by a third: four characters on the wire for three octets, hence 4/3. RFC 2045 §6.8 says so in as many words. The figure is
          asymptotic — small payloads pay worse, because padding adds a whole character for zero bits of input, so one octet becomes four characters and a 300%
          increase. Below about twenty bytes, quote the exact number rather than a third.
        </P>
        <DataTable
          caption="Exact encoded length and measured overhead"
          head={['Input octets', 'Output characters', 'Overhead', 'Input octets', 'Output characters', 'Overhead']}
          rows={[
            ['1', '4', '300%', '9', '12', '33.3%'],
            ['2', '4', '100%', '12', '16', '33.3%'],
            ['3', '4', '33.3%', '64', '88', '37.5%'],
            ['4', '8', '100%', '1000', '1336', '33.6%'],
            ['5', '8', '60%', '1024', '1368', '33.6%'],
          ]}
          foot="Output length for n octets is 4 * ceil(n / 3) with padding, ceil(n * 8 / 6) without. Text encoding and line wrapping add more on top."
        />
        <KeyTerms
          items={[
            { term: 'octet', definition: 'A single 8-bit byte. The unit of input. RFC 4648 always counts octets, not characters.' },
            { term: 'index', definition: 'A 6-bit value from 0 to 63. The unit of output before it is rendered as a character.' },
            { term: 'alphabet', definition: 'The table that maps an index to a character. §4 and §5 differ in exactly two rows.' },
            { term: 'variant', definition: 'Which alphabet is in force: standard (plus and slash) or url (hyphen and underscore).' },
            { term: 'padding', definition: 'The "=" filler that replaces output characters which had no input bits behind them.' },
            { term: 'canonical', definition: 'An encoding whose leftover bits are zero, so the decoded value has exactly one spelling.' },
          ]}
        />
        <Callout tone="spec" title="RFC 4648 §3.3 on characters outside the alphabet">
          <P>
            Implementations MUST reject encoded data containing characters outside the base alphabet unless the referencing document says otherwise. MIME §6.8 says
            the opposite — ignore them. That contradiction is why two decoders can look at one string, follow different rules, and both claim to be correct.
          </P>
        </Callout>
      </Section>

      <Section id="alphabets-and-padding" title="Alphabets, padding and the two safe symbols" kicker="RFC 4648">
        <P>
          <strong>TL;DR.</strong> Standard base64 uses <code>+</code> and <code>/</code>; base64url swaps them for <code>-</code> and <code>_</code> so the
          output is safe in URIs and filenames. Padding is a length signal, not data.
        </P>
        <P>
          Section 4 defines the 64-character table: indices 0–25 are uppercase letters, 26–51 lowercase, 52–61 digits, 62 the plus sign and 63 the slash. The
          padding character is the equals sign.
        </P>
        <CodeBlock
          title="index to character"
          language="text"
          code={` 0 A    1 B    2 C    3 D  ...  16 Q   17 R   18 S   19 T   25 Z
 26 a   27 b   28 c   29 d  ...  46 u   47 v   48 w   49 x   51 z
 52 0   53 1   54 2   55 3  ...  60 8   61 9
 62 +   63 /        pad =

base64("foobar") = "Zm9vYmFy"      indices 25 38 61 47 24 38 5 50`}
          caption="These are zero-based positions, not character codes: A means 0 and a means 26. Base64 is case-sensitive — Q and q are indices 16 and 42."
        />
        <P>
          The two final symbols are the interesting pair. Plus and slash are both reserved in URIs — slash is a path separator and plus means a space in
          form-encoded data. Section 5 is the answer for the web: index 62 becomes the hyphen and index 63 the underscore. That is the entire change; the bit
          grouping and padding rules are identical. Because hyphen and underscore are unreserved in RFC 3986 §2.3, a base64url value needs no percent-encoding in a
          path segment, query value or filename.
        </P>
        <CodeBlock
          title="the same bytes in three spellings"
          language="text"
          code={`bytes        = fb ff bf        (three octets chosen to hit indices 62 and 63)
standard     = +/+/            index 62 is "+",  index 63 is "/"
base64url    = -_-_            index 62 is "-",  index 63 is "_"
in a query   = "+" is read as a space by form decoders; "%2B%2F" is the safe spelling
in a path    = "/" splits the segment; "%2F" is decoded by some servers before routing`}
          caption="base64url is not a different encoding; it is the same encoding with the two characters that break transports removed."
        />
        <P>
          The convention in practice is that base64url also drops padding. RFC 7515 defines the BASE64URL function used by JWS without the pad character, which is
          why a JSON Web Token never contains an equals sign. Reading base64url as standard base64 is the dangerous direction: a hyphen or underscore is not in
          the §4 alphabet, so a strict decoder errors while a lenient one ignores it and hands back a payload two or three octets short.
        </P>
        <H3>Padding is a length signal, not data</H3>
        <DataTable
          caption="The complete padding rule"
          head={['Octets mod 3', 'Data characters in the last group', 'Pad characters', 'Example', 'Decoded octets']}
          rows={[
            ['0', 'four', 'none', 'Zm9v for "foo"', '3'],
            ['1', 'two', 'two', 'Zg== for "f"', '1'],
            ['2', 'three', 'one', 'Zm8= for "fo"', '2'],
          ]}
          foot="A length of 4k + 1 can never occur, because one leftover character holds 6 bits and cannot carry a whole octet."
        />
        <P>
          Padding is redundant information: the character count of an unpadded value determines its byte count exactly, which is why JWS omits it. The consequence
          surprises people who treat a base64 string as an identifier — the padded and unpadded spellings of the same payload are the same data, so a database of
          padded values cannot be joined against one of unpadded values without normalising first.
        </P>
        <H3>Why you would ever use base32</H3>
        <P>
          Base32 (§6) pays 60% instead of 33 to get an alphabet with no plus, no slash, and no glyph that looks like another glyph: no 0 confused with O, no 1
          with I. That is why it is the choice for one-time-password secrets and identifiers a human may read aloud. Base32hex (§7) puts digits first, so encoded
          strings sort like the values behind them.
        </P>
        <DataTable
          caption="Five encodings from the same document"
          head={['Encoding', 'Clause', 'Symbols', 'Bits/char', 'Overhead', 'Why you would pick it']}
          rows={[
            ['base16', '§8', '0-9 A-F', '4', '100%', 'Hex dumps, anything read digit by digit'],
            ['base32', '§6', 'A-Z 2-7', '5', '60%', 'Spoken or typed codes; no confusing glyphs'],
            ['base32hex', '§7', '0-9 A-V', '5', '60%', 'Encoded values that must sort like their data'],
            ['base64', '§4', 'A-Z a-z 0-9 + /', '6', '33%', 'Default choice for binary in a text channel'],
            ['base64url', '§5', 'A-Z a-z 0-9 - _', '6', '33%', 'Same, but safe in URIs and file names'],
          ]}
          foot="Only the alphabet changes between rows; the bit packing rule is the same. Overhead is 8/bits-per-char minus one."
        />
      </Section>

      <Section id="wrapping-and-pem" title="Line wrapping: MIME rules and PEM armour" kicker="Layout">
        <P>
          <strong>TL;DR.</strong> RFC 4648 base64 has no line breaks. MIME wraps at 76, PEM at exactly 64, JWS never wraps. Mixing those rules is how a
          certificate gets rejected.
        </P>
        <P>
          Section 3.1 settles it for the core encoding: implementations MUST NOT add line feeds unless the referencing specification explicitly directs otherwise.
          Line breaks belong to the formats that embed base64, and each says something different.
        </P>
        <DataTable
          caption="Who wraps, at what width, and with which terminator"
          head={['Format', 'Clause', 'Wrap width', 'Terminator', 'Decoder must ignore breaks?']}
          rows={[
            ['RFC 4648 base64', '§3.1', 'no wrapping at all', 'none', 'not applicable'],
            ['MIME base64 CTE', 'RFC 2045 §6.8', 'no more than 76 characters', 'CRLF', 'yes — out-of-alphabet ignored'],
            ['PEM', 'RFC 7468 §2', 'exactly 64 except the last line', 'newline', 'parsers SHOULD ignore whitespace'],
            ['base64url / JWS', 'RFC 7515 §7', 'one line, always', 'none', 'a break would change the signed bytes'],
          ]}
          foot="MIME says a maximum of 76; PEM says an exact 64. Treating those as the same rule is how a certificate file ends up rejected."
        />
        <H3>PEM armour over DER</H3>
        <P>
          PEM is not a key format. It is a transport wrapper: base64 with a labelled header and footer, defined by RFC 7468 §2. Between the armour sits DER — a
          binary encoding of ASN.1, so the payload of a PEM block is never text, however readable the base64 looks.
        </P>
        <CodeBlock
          title="one key, three layers"
          language="text"
          code={`-----BEGIN PRIVATE KEY-----        (1) PEM armour, RFC 7468 §2, label from §4
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcw...   (2) base64, wrapped at exactly 64
-----END PRIVATE KEY-----          characters per line, LF or CRLF

inside the base64:                 (3) DER-encoded ASN.1 PrivateKeyInfo
  SEQUENCE { version, AlgorithmIdentifier, OCTET STRING key }`}
          caption="Labels are meaningful: PRIVATE KEY is PKCS #8, RSA PRIVATE KEY is PKCS #1, CERTIFICATE is an X.509 RFC 5280 certificate."
        />
        <P>
          Three traps live in that wrapper. First, diffing: parsers ignore whitespace, so two files with the same key can differ in line endings and both stay
          valid — text comparison answers the wrong question. Second, the label is a contract: BEGIN PRIVATE KEY and BEGIN RSA PRIVATE KEY describe different ASN.1
          structures. Third, BEGIN and END labels must agree, because a mismatched footer is a truncated or spliced file.
        </P>
      </Section>

      <Section id="canonical" title="Canonical encoding and the leftover bits" kicker="§3.5">
        <P>
          <strong>TL;DR.</strong> A one-octet payload has sixteen valid-length encodings but only one canonical one. Compare decoded octets, never encoded text.
        </P>
        <P>
          With one input octet the encoder needs twelve bits of capacity for eight bits of data, so four bits in the second character are not determined by the
          payload; with two octets, two bits of the third are free. Section 3.5 closes that hole: pad bits MUST be set to zero by conforming encoders, which gives
          exactly one encoding per value. Decoders MAY reject non-zero pad bits — most do not, which is why the ambiguity survives in the wild.
        </P>
        <CodeBlock
          title="sixteen spellings, one octet"
          language="text"
          code={`Zg==  011001 100000   pad bits 0000   canonical, decodes to 0x66
Zh==  011001 100001   pad bits 0001   decodes to 0x66
Zi==  011001 100010   pad bits 0010   decodes to 0x66
...
Zv==  011001 101111   pad bits 1111   decodes to 0x66

two-octet case, "fo" = 66 6F, canonical Zm8=:
Zm8=  pad bits 00   canonical
Zm9=  pad bits 01   same two octets
Zm/=  pad bits 11   same two octets`}
          caption="Each is accepted by a lenient decoder and produces identical bytes. Only the first is canonical."
        />
        <P>
          The consequence: a cache keyed on encoded text stores the same object sixteen times; a signature over the encoded string is valid for one spelling and
          trivially transferable to the other fifteen; a validator that only checks whether a string is base64 accepts what a downstream library rejects — the
          classic normalisation-bypass shape.
        </P>
        <Callout tone="risk" title="Rules that actually hold up">
          <P>
            Compare decoded octets, never encoded text. Canonicalise on ingress: decode, re-encode with your padding convention, and store that result. If a
            signature is defined over the encoded form, verify the encoded bytes exactly as received and reject any input whose pad bits are not zero.
          </P>
        </Callout>
      </Section>

      <Section id="containers" title="Where Base64 actually shows up: data URIs and JWTs" kicker="Containers">
        <P>
          <strong>TL;DR.</strong> Data URIs inline binary resources with a 33% overhead and no cache reuse. JWTs are three base64url segments joined by periods —
          the signature covers the encoded text, not the decoded JSON.
        </P>
        <P>
          A data URI puts the bytes of a resource into a URL. RFC 2397 §3 gives the grammar: data, colon, an optional media type, an optional base64 indicator, a
          comma, and then the data. Without the semicolon-base64 marker the text after the comma is percent-encoded; with it, the text is base64 and the decoded
          octets are the resource.
        </P>
        <CodeBlock
          title="the three forms, and what each one means"
          language="text"
          code={`data:,Hello%20World                 plain text, percent-encoded, type defaults
data:text/plain;charset=UTF-8,caf%C3%A9    5 octets written as 15 characters
data:image/png;base64,iVBORw0KGgo...       PNG octets, 33% overhead, no escaping
data:image/svg+xml,%3Csvg ...%3E           percent form for text-based vectors`}
          caption="The semicolon-base64 marker is a flag on the whole document, not a charset. An inlined asset cannot be cached on its own and is re-sent with every document that references it."
        />
        <H3>JWTs and the JWS compact serialisation</H3>
        <P>
          A JSON Web Signature in compact form is three base64url values joined by periods. The encoding is the §5 alphabet (no plus, no slash), and the
          BASE64URL function omits padding, so an equals sign never appears — which makes segment length modulo four one of the fastest sanity checks available.
        </P>
        <CodeBlock
          title="segment anatomy"
          language="text"
          code={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ . SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

header     {"alg":"HS256","typ":"JWT"}     36 chars, 36 mod 4 = 0, decodes to 27 octets
payload    sub, name, iat                 74 chars, 74 mod 4 = 2, decodes to 55 octets
signature  32 raw bytes                    43 chars, 43 mod 4 = 3, never parsed as JSON

signing input (RFC 7515 §5.1) = ASCII(BASE64URL(UTF8(header)) + "." + BASE64URL(payload))
the signature covers that ASCII string, not the decoded JSON`}
          caption="Because the signature is computed over the encoded text, editing a claim and re-encoding breaks verification. An alg value you did not choose is not a hint — RFC 8725 §3.1 requires verifiers to check the algorithm."
        />
        <P>
          The length arithmetic tells you what a truncated token means: 4k+1 is impossible, so a segment of that length gained or lost a character in transit
          rather than being signed differently. Reading the segments needs no key, so anything confidential inside a JWS belongs in a JWE or behind a server-side
          reference.
        </P>
      </Section>

      <Section id="decoding-in-code" title="Decoding it in code, and identifying the bytes" kicker="In practice">
        <P>
          <strong>TL;DR.</strong> <code>btoa</code> takes a Latin-1 string, not text — use <code>TextEncoder</code> first. Decode with{' '}
          <code>fatal: true</code> to turn silent corruption into an exception.
        </P>
        <P>
          The Web Platform defines two base64 functions whose type signature is the source of much confusion. btoa takes a string and treats each character code
          as one byte; atob returns a string where each character has a code point below 256. Since btoa interprets code points as byte values, it throws
          InvalidCharacterError as soon as any code point exceeds 0xFF — the argument is not text, it is a byte array wearing a string costume. The honest version
          is three explicit steps.
        </P>
        <CodeBlock
          title="the round trip that does not lose data"
          language="js"
          code={`const bytesToBase64 = (bytes) =>
  btoa(String.fromCodePoint(...bytes));              // one code point per octet

const base64ToBytes = (value) =>
  Uint8Array.from(atob(value), (c) => c.codePointAt(0));

const text = 'a \\u0100 \\u{10000} \\u6587';        // 4 code points, 13 octets

const encoded = bytesToBase64(new TextEncoder().encode(text));
// "YSDEgCDwkICAIOaWhw=="   20 characters, two pad signs

new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(encoded));
// back to the original string, or a TypeError rather than mojibake`}
          caption="TextEncoder produces UTF-8 octets; String.fromCodePoint over those octets makes the Latin-1 string btoa expects. The spread operator caps argument count, so a production version loops in chunks."
        />
        <P>
          The failure is asymmetric: encoding text with code points above 0xFF throws, so you notice; decoding a Latin-1 payload as UTF-8 does not, because the
          platform decoder replaces invalid sequences with U+FFFD and hands back a string of the right shape and the wrong content. Only a fatal decoder tells
          binary bytes apart from text it cannot read.
        </P>
        <H3>Identifying the decoded bytes</H3>
        <P>
          Base64 carries no description of its payload, so the format of a decoded result has to come from somewhere. A filename is a guess and a declared media
          type is a claim; the only evidence in the payload itself is its leading octets.
        </P>
        <DataTable
          caption="Common signature openings, in the order a prefix matcher tries them"
          head={['Leading octets', 'Reported as', 'Extension', 'Note']}
          rows={[
            ['89 50 4e 47', 'PNG image', 'png', 'Unambiguous; the first four bytes of every PNG'],
            ['ff d8 ff', 'JPEG image', 'jpg', 'Start of Image followed by a marker segment'],
            ['47 49 46 38', 'GIF image', 'gif', 'The GIF87a or GIF89a magic'],
            ['52 49 46 46', 'RIFF container', 'webp', 'Also WAV and AVI — container is certain, codec is not'],
            ['50 4b 03 04', 'ZIP archive', 'zip', 'DOCX, XLSX, APK and EPUB are all ZIP files'],
            ['1f 8b', 'gzip stream', 'gz', 'Commonly seen inside a base64 field that claims to be plain text'],
            ['25 50 44 46 2d', 'PDF document', 'pdf', 'The literal ASCII of %PDF-'],
            ['7f 45 4c 46', 'ELF executable', 'elf', 'A binary in a data URI should end the conversation'],
            ['4d 5a', 'Windows PE', 'exe', 'Two bytes only, so expect occasional false positives'],
            ['42 4d', 'Bitmap image', 'bmp', 'Also the ASCII of B and M, so short values deserve a second look'],
            ['7b 22', 'JSON object', 'json', 'A two-byte heuristic — brace plus quote'],
            ['3c', 'XML / HTML / SVG', 'xml', 'One byte: all three start with a less-than sign'],
          ]}
          foot="Matching is a lowercase hex prefix test against the decoded bytes. The first match wins. Absence of a match is not evidence of a problem — use this to catch a mismatch between what a field claims and what it carries."
        />
      </Section>

      <Section id="how-the-tool-handles-it" title="How this site handles these cases" kicker="This site">
        <P>
          <strong>TL;DR.</strong> The encoder exposes every decision — variant, padding, line length, input encoding — instead of burying it. The decoder reports
          measurements plus a diagnostic list, and keeps warnings, errors and informational notes apart.
        </P>
        <P>
          You choose the variant, whether to pad, a line length, and how to read the input. UTF-8 is the default; Latin-1 is the btoa-compatible mode; hex input
          is validated separately, rejecting non-hex characters and an odd digit count rather than silently dropping the trailing nibble. The result carries the
          arithmetic: byte count, character count, group count, padded count and overhead percentage.
        </P>
        <P>
          Variant detection is honest about its limits: a value made only of letters and digits is legal in both alphabets and cannot be classified from its
          contents, so the decoder looks for distinguishing characters and otherwise decodes as standard with hyphen and underscore mapped back. The decode report
          counts whitespace rather than swallowing it, names how many characters were ignored, and offers strict mode that turns the same input into an error —
          usable as a linter for values that are functionally fine and contractually wrong. Arithmetic faults get their own codes: pad before data, more than two
          pad characters, length congruent to 1 mod 4, characters outside the alphabet. A non-canonical tail is a warning with the §3.5 citation, and a round-trip
          flag records whether re-encoding reproduces the input.
        </P>
        <P>
          The container work follows the same pattern. A value that splits into three base64url segments is recognised as a JWT: header and payload are decoded
          and parsed as JSON, claims like exp/iat/nbf get ISO timestamps, a numeric claim above 4102444800 is divided by a thousand so a millisecond expiry
          displays as a date, and the signature segment is measured but never verified — nothing in the browser holds your key. A value beginning with{' '}
          <code>data:</code> reports the media type and base64 flag. A PEM block is found by a matched BEGIN/END pair, so a mismatched footer is not treated as
          PEM.
        </P>
        <Callout tone="note" title="Where to read which report">
          <P>
            Feed a whole JWT to the plain byte path and you get an arithmetically honest but useless answer: the two periods listed as characters outside the
            alphabet. Use the token panel for a JWT, the data URI panel for an inlined asset, and the byte panel with its hex dump for anything you are trying to
            identify from its magic bytes.
          </P>
        </Callout>
      </Section>
    </>
  )
}
