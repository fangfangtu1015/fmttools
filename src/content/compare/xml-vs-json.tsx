/**
 * XML vs JSON comparison. Content module for /compare/xml-vs-json/.
 * Clause references were checked against XML 1.0 (Fifth Edition), Namespaces in XML 1.0
 * (Third Edition), XML Schema Part 2: Datatypes (Second Edition), Exclusive XML Canonicalization
 * 1.0, RFC 8259 and the OWASP XXE page on 2026-11-12. Every byte figure in the size section was
 * measured with wc -c and zlib.gzip level 9 on the exact texts printed beside it; the scripts are
 * described in that section. Parser option strings and converter prefixes are the documented API
 * surface of the libraries named and should be re-checked against the version in your lockfile.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, P, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'xml-vs-json',
  path: '/compare/xml-vs-json/',
  title: 'XML vs JSON: Data Models, Conversion Loss | FmtTools',
  description:
    'XML against JSON as two data models: namespaces, mixed content, types, XXE, streaming and measured byte sizes, with a fidelity table and a decision table.',
  h1: 'XML and JSON Are Two Different Data Models',
  faqTopic: 'XML and JSON',
  summary:
    'The formats are not two spellings of one idea, so conversion is a projection with named losers — here is what falls out, what it costs, and which one to choose.',
  keywords: [
    'xml vs json',
    'xml to json conversion loss',
    'xml namespaces json keys',
    'xxe versus prototype pollution',
    'xml schema data types json',
    'json lines streaming',
    'xml versus json file size gzip',
    'when to use xml instead of json',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 28,
  sections: [
    { id: 'models', label: 'Two data models, not two spellings of one thing' },
    { id: 'three-ways', label: 'One document, three renderings, and what fell out' },
    { id: 'namespaces', label: 'Namespaces: why xmlns exists and where it breaks keys' },
    { id: 'types', label: 'Types: a validation grammar against a set of conventions' },
    { id: 'security', label: 'Security: external entities, expansion bombs and __proto__' },
    { id: 'streaming', label: 'Streaming: SAX and StAX against a format with no framing' },
    { id: 'wire', label: 'Size on the wire, counted rather than asserted' },
    { id: 'xml-wins', label: 'Where XML still wins for real reasons' },
    { id: 'json-wins', label: 'Where JSON won, and the gaps that made BSON and MessagePack' },
    { id: 'decision', label: 'The decision table and a conversion checklist' },
  ],
  faqs: [
    {
      question: 'Is JSON always smaller than XML?',
      answer:
        'Not reliably. The record measured here is 288 bytes as minified XML against 294 as minified JSON, so JSON is six bytes larger; indented, 343 against 355. Compressed at gzip level 9 those two minified files came out at exactly the same 228 bytes, and across 500 varied records XML is 8.3% larger raw but only 2.4% larger compressed, because deflate monetises the repetition XML adds. The number that genuinely grows is conversion: an attribute-prefix mapping costs 303 bytes and a grouped-attributes mapping 359, against 294 for the readable one.',
    },
    {
      question: 'What is the single biggest thing lost when converting XML to JSON?',
      answer:
        'Namespaces, and with them the identity of a vocabulary. An XML name is the pair of a namespace URI and a local name; the JSON key is only the local name. Two documents from different vocabularies that both use the local name `id` collapse into one key, and nothing in the output records that they were ever different. Cardinality is the close second: an element that appears once becomes an object while the same element appearing twice becomes an array, unless the converter is told the expected count.',
    },
    {
      question: 'Why do two XML-to-JSON converters give me different JSON for the same file?',
      answer:
        'Because attributes have no representation in JSON and each library invents one. BadgerFish nests an attribute value under a key beginning with the at sign and puts element text under a dollar sign; the xml-js and fast-xml-parser family uses a prefix such as `@_` with a text key such as `#text`, and both are configuration options that have moved between releases. Some converters promote attributes to sibling keys, which is how an attribute called `id` ends up fighting a child element called `id`. Pin one convention in writing.',
    },
    {
      question: 'Does JSON have XXE?',
      answer:
        'No, because JSON has no entity mechanism: there is no way for a document to name a resource the parser should fetch, and no way for a value to be defined in terms of another value. The equivalent risks are implementation-level rather than format-level: parsing with `eval`, which RFC 8259 section 12 warns against directly; recursive merges that let a `__proto__` key write onto `Object.prototype`; libraries that instantiate classes named in the payload; and unbounded nesting that exhausts a recursive-descent stack.',
    },
    {
      question: 'Which format should a new HTTP API use in 2026?',
      answer:
        'JSON, unless the payload is a document, must be signed at the subtree level, or must be validated at the boundary by a grammar the sender does not control. Those are the three cases where XML features are load-bearing: mixed content for prose with inline structure, canonicalisation for signatures, and XML Schema for machine-checked types. If none of the three applies, choosing XML buys you namespace ceremony, a larger conversion surface and an entity parser you have to lock down.',
    },
    {
      question: 'Can JSON be validated as strictly as XML?',
      answer:
        'Close, but the check sits outside the parser. XML Schema Part 2 defines value spaces, lexical spaces and a canonical representation for nineteen primitive types, so `xs:date` and `xs:decimal` are machine-checked properties once a validating processor is invoked. JSON Schema and OpenAPI can describe the same constraints, but keywords such as `format` are annotations unless you opt into asserting them, and most HTTP frameworks validate only on demand. Strictness in JSON is a process decision; in XML it is a parser configuration.',
    },
    {
      question: 'Is mixed content ever useful in an API?',
      answer:
        'Only when the payload is a document. A paragraph of legal text with inline cross-references, bold runs and footnote markers cannot be expressed in JSON without choosing between destroying the markup and inventing an array of fragments no consumer understands. That is why DOCX, EPUB, DITA, DocBook and SVG keep it. For record-shaped payloads, mixed content is a modelling accident: it means the author wanted both an attribute and text, and a schema with a separate element for each is easier for everyone downstream.',
    },
    {
      question: 'How do I stream a multi-gigabyte file in either format?',
      answer:
        'For XML use a pull parser (StAX) or a push handler (SAX) with namespace awareness turned on, and accept that defaulted attributes and full validity cannot be known from the instance alone. For JSON there is no framing rule in the specification, so the practical answer is a convention: JSON Lines or NDJSON, one value per line, written by a real generator and read line by line. Library event readers work too, but their behaviour on a truncated document is a property of the library, so check your parser.',
    },
  ],
  sources: [
    {
      label: 'XML 1.0 (Fifth Edition) — W3C Recommendation, 26 November 2008',
      href: 'https://www.w3.org/TR/xml/',
      detail:
        'Checked for: production [1] and the definition of a well-formed document in 2.1; the well-formedness constraint names the processor must enforce (Legal Characters, Unique Att Spec, Entity Declared, Parsed Entity, No Recursion, Element Type Match); section 3.3.1 on attributes as name-value pairs whose order is not significant; and section 2.4, where the ampersand and the less-than sign MUST NOT appear literally outside markup delimiters, comments, processing instructions and CDATA sections, and the greater-than sign MUST be escaped inside the closing CDATA sequence.',
      accessed: '2026-11-12',
    },
    {
      label: 'Namespaces in XML 1.0 (Third Edition) — W3C Recommendation, 8 December 2009',
      href: 'https://www.w3.org/TR/xml-names/',
      detail:
        'Checked for: section 3, where a namespace name MUST be a URI reference or the empty string and "It is not a goal that it be directly usable for retrieval of a schema"; the xml prefix being bound by definition to http://www.w3.org/XML/1998/namespace; sections 6.1 and 6.2 for the scope of a declaration extending from the start-tag to the matching end-tag; and section 6.2, "Default namespace declarations do not apply directly to attribute names", which is why an unprefixed attribute has no namespace at all.',
      accessed: '2026-11-12',
    },
    {
      label: 'XML Schema Part 2: Datatypes, Second Edition — W3C Recommendation, 28 October 2004',
      href: 'https://www.w3.org/TR/xmlschema-2/',
      detail:
        'Checked for: value space (2.1), lexical space (2.3) and canonical representation (2.3.1) as separate notions; the nineteen primitive datatypes in 3.2 and the derived types in 3.3; xs:decimal at 3.2.3 with the sentence that precision is not reflected in the value space and 2.0 is not distinct from 2.00; xs:double at 3.2.5 being patterned after the IEEE 754 double-precision type; xs:dateTime at 3.2.7, xs:date at 3.2.9, xs:hexBinary at 3.2.15, xs:base64Binary at 3.2.16 and xs:anyURI at 3.2.17.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format',
      href: 'https://www.rfc-editor.org/rfc/rfc8259.html',
      detail:
        'Checked for the section numbering (2 Grammar, 4 Objects, 6 Numbers, 8 String and Character Issues with 8.1 Character Encoding, 9 Parsers, 10 Generators, 11 IANA Considerations, 12 Security Considerations) and for four sentences quoted in this article: that JSON text exchanged between systems that are not part of a closed ecosystem MUST be encoded using UTF-8 (8.1); the numeric interoperability discussion of IEEE 754 doubles and a value such as 1E400 (6); that behaviour is unpredictable when object names are not unique (4); and that evaluating JSON text as code "generally constitutes an unacceptable security risk" (12).',
      accessed: '2026-11-12',
    },
    {
      label: 'Exclusive XML Canonicalization Version 1.0 — W3C Recommendation, 18 July 2002',
      href: 'https://www.w3.org/TR/xml-exc-c14n/',
      detail:
        'Checked for: the purpose stated in section 1, that a signed subtree must be reduced to a deterministic octet stream; section 2.1 for the problem of moving a document between enclosing contexts; section 3 for the difference between inclusive canonicalization, which emits every inherited namespace declaration, and exclusive canonicalization, which emits only the visibly used ones plus those named in the InclusivePrefixList; and the output MIME type application/xml-canonical. This is the machinery underneath SAML assertion signing.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP — XML External Entity (XXE) Processing',
      href: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      detail:
        'The community page on the vulnerability class: what a document type declaration lets an attacker ask the parser to do (read local files, make server-side requests, scan ports, and exhaust memory through entity expansion) and the mitigation posture of refusing document type declarations and disabling external-entity resolution rather than trying to filter the markup. The URL returns a permanent redirect to the current OWASP community pages host.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/learn/xml/', name: 'XML: The Complete Guide', blurb: 'Productions, namespaces, DTD entities and the XXE mitigation table.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'The seven value kinds, the number rules and what the grammar leaves out.' },
    { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Check the output of a conversion and see duplicate keys and precision loss.' },
    { path: '/use-cases/data-migration/', name: 'Data migration tools', blurb: 'Reconciling rows and types on both sides of a format change.' },
  ],
  words: 6100,
  image: '/images/covers/cmp-xml-vs-json.png',
  imageAlt: 'A namespace-aware XML tree being projected onto the seven JSON value kinds, with attributes, mixed content and a document type declaration falling off the edge.',
}

export default function Article() {
  return (
    <>
      <Section id="models" title="Two data models, not two spellings of one thing" kicker="The models">
        <P>
          Almost every page that compares these two formats opens with a byte count, and the byte count answers a question that nobody should
          have asked. XML and JSON are not two spellings of one data model with different punctuation. They are two different models of what a
          document <em>is</em>, and the choice between them determines what your data is allowed to say before a single character is written.
          Size, speed and readability are consequences; they are also the parts that can be fixed later with a gzip header and a code review.
        </P>
        <P>
          XML is a metalanguage. The specification defines no vocabulary you are permitted to use; it defines the rules by which a vocabulary
          may be defined, and the constraints a processor must enforce. The model it produces is the Information Set — a separate W3C
          specification, Second Edition, dated 4 February 2004 — which enumerates eleven kinds of information item. Seven are basic: document,
          element, attribute, text, CDATA section, comment and processing instruction. Four are augmented, meaning they are only visible to a
          processor that has read declarations: entity reference, notation, unparsed entity and namespace name. Every XML parser hands you some
          projection of that list, and the projection is the interface you are programming against.
        </P>
        <P>
          The consequences of that list are the features that have no JSON counterpart. Production [1] in section 2.1 of XML 1.0 (Fifth
          Edition, 26 November 2008) requires a document to be a prolog, exactly one element and trailing miscellaneous markup, which means an
          XML document cannot be a bare number or a bare string. Attributes are a second, deliberately weaker namespace of names attached to an
          element, and section 3.3.1 states that their order is not significant. Text and child elements may interleave inside the same
          element, which is what mixed content means. A name is not a string but a pair of namespace URI and local name. Entities let a value be
          defined in terms of another value, possibly fetched from outside the file. A document can carry comments and processing instructions
          as first-class nodes. And validity — a claim about element ordering, required attributes and unique identifiers — can be asserted by
          an external grammar without touching the instance.
        </P>
        <P>
          JSON is a value grammar. Section 2 of RFC 8259 defines a value as an object, an array, a number, a string, or one of{' '}
          <Rich text="`true`, `false`, `null`" />, built from six structural characters, and there is nothing else in the model. Seven kinds of
          value and no other ontology: no attributes, because a member is a key and a value; no mixed content, because a string is a string and
          cannot contain elements; no comments, no processing instructions, no entity mechanism, no cardinality, no type assertions, no
          namespace identity, no document type declaration and no canonical form. Absence has two spellings — a member that is not there, and a
          member whose value is <Rich text="`null`" /> — and the format does not say they are different, although your database does.
        </P>
        <P>
          Once you line the two models up like that, the comparison stops being a preference argument. Converting XML to JSON is a projection
          from a larger model onto a smaller one, and projections lose information by construction. Converting JSON to XML looks lossless
          because the target model is bigger, and it is not quite: a number that came from an IEEE 754 double, the order of object members and
          the difference between <Rich text="`null`" /> and an absent key all need a decision, and the decision has to be written down somewhere
          or the next engineer will rediscover it in production. The rest of this page is about which decisions, in which direction, at what cost.
        </P>
        <KeyTerms
          items={[
            { term: 'Information Set', definition: 'The eleven item types an XML parser conceptually produces: seven basic, four augmented. The model behind the syntax.' },
            { term: 'value grammar', definition: 'RFC 8259 section 2: objects, arrays, numbers, strings and three literals. The entire JSON ontology.' },
            { term: 'mixed content', definition: 'An element whose children are text and elements interleaved. Legal in XML, unrepresentable in JSON.' },
            { term: 'namespace name', definition: 'The URI half of an XML extended name. Identity by string comparison; not a retrieval target.' },
            { term: 'processing instruction', definition: 'A <?target data?> node addressed to the application. An Infoset item with no JSON analogue.' },
            { term: 'document type declaration', definition: 'The DOCTYPE that names the DTD to read. The gate through which every XXE attack walks.' },
            { term: 'canonical representation', definition: 'In XML Schema Part 2 (2.3.1), a one-to-one mapping between literals and values. JSON has no equivalent.' },
            { term: 'cardinality', definition: 'How many times an element may appear. Declared in XML grammars; invisible in JSON.' },
          ]}
        />
        <Callout tone="spec" title="The constraints a processor owes you">
          <P>
            The well-formedness constraints in XML 1.0 are enforced by every conforming processor even when DTD validation is off: Legal
            Characters, Unique Att Spec, Entity Declared, Parsed Entity, No Recursion and Element Type Match, among others. Violating one is a
            fatal error, which is the only place the two formats agree on strictness: RFC 8259 requires a parser to reject non-conforming text,
            and section 9 of that document makes clear that a parser MAY accept extensions anyway. Both formats reject malformed input; only one
            of them can also tell you that a required value is missing.
          </P>
        </Callout>
      </Section>

      <Section id="three-ways" title="One document, three renderings, and what fell out" kicker="Fidelity">
        <P>
          Here is a document chosen to be awkward on purpose. It has mixed content, an attribute whose local name collides with a child element
          name, an element that repeats, an element that is empty, two vocabularies, a comment and a processing instruction. Eleven lines of
          markup, eight elements — and the three JSON renderings beneath it disagree about almost all of them.
        </P>
        <CodeBlock
          title="the source document"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<?export target="audit"?>
<o:order xmlns:o="urn:example:orders:2" xmlns:b="urn:example:billing:1" id="A-84120">
  <o:customer id="cus_77">Ana Sofia <o:mark>Marques</o:mark></o:customer>
  <o:line sku="K-100">Steel ruler</o:line>
  <o:line sku="K-101">Brass compass</o:line>
  <o:backorder/>
  <b:id>INV-9001</b:id>
  <o:id>42</o:id>
  <!-- total is computed downstream -->
</o:order>`}
          caption="422 bytes as printed: eight elements in two vocabularies, four data attributes plus two namespace declarations, one element carrying both an attribute and mixed content, one empty self-closing element, and two elements whose local name is id."
        />
        <P>
          First rendering: BadgerFish, the oldest convention still in circulation, which nests attributes under a key named with the at sign and
          puts character data under a single dollar sign.
        </P>
        <CodeBlock
          title="rendering 1 - BadgerFish style"
          language="json"
          code={`{
  "o:order": {
    "@xmlns": { "o": "urn:example:orders:2", "b": "urn:example:billing:1" },
    "@id": { "$": "A-84120" },
    "o:customer": {
      "@id": { "$": "cus_77" },
      "$": "Ana Sofia Marques",
      "o:mark": { "$": "Marques" }
    },
    "o:line": [
      { "@sku": { "$": "K-100" }, "$": "Steel ruler" },
      { "@sku": { "$": "K-101" }, "$": "Brass compass" }
    ],
    "o:backorder": "",
    "b:id": { "$": "INV-9001" },
    "o:id": { "$": "42" }
  }
}`}
          caption="Namespaces survive here as literal prefixes, which means the JSON keys are vocabulary-versioned strings: change the prefix from o to ord and every consumer breaks, even though the namespace name never changed."
        />
        <P>
          Second rendering: the family of conventions that puts an attribute prefix on a key and reserves a text key, which is how xml-js and
          fast-xml-parser represent the same thing. Their exact key names are configuration options that have moved between releases —{' '}
          <Rich text="`_attr`" /> and <Rich text="`_text`" /> in one, <Rich text="`@_id`" /> and{' '}
          <Rich text="`#text`" /> in the other, both usually changeable — so read the output of your own converter rather than trusting the
          sample below. What matters is the shape, not the spelling.
        </P>
        <CodeBlock
          title="rendering 2 - prefixed keys and a text key"
          language="json"
          code={`{
  "?xml": { "@version": "1.0", "@encoding": "UTF-8" },
  "?PI:export": "target=\\"audit\\"",
  "order": {
    "@id": "A-84120",
    "customer": { "@id": "cus_77", "#text": "Ana Sofia Marques", "mark": "Marques" },
    "line": [
      { "@sku": "K-100", "#text": "Steel ruler" },
      { "@sku": "K-101", "#text": "Brass compass" }
    ],
    "backorder": "",
    "id": ["INV-9001", "42"],
    "comment": " total is computed downstream "
  }
}`}
          caption="The namespace URIs are gone. The two id elements with different meanings became one key holding an array, and the mark element survives only as duplicated text inside customer. If this library records the XML declaration and the comment at all, it does so with keys of its own invention."
        />
        <P>
          Third rendering: what a human would write if asked to map the same data by hand, which is what most teams actually mean by
          &quot;convert it to JSON&quot;.
        </P>
        <CodeBlock
          title="rendering 3 - the readable mapping, and its holes"
          language="json"
          code={`{
  "orderId": "A-84120",
  "customer": { "id": "cus_77", "name": "Ana Sofia Marques" },
  "lines": [
    { "sku": "K-100", "description": "Steel ruler" },
    { "sku": "K-101", "description": "Brass compass" }
  ],
  "backorder": null,
  "invoiceId": "INV-9001",
  "id": "42"
}`}
          caption="This one is clean and it is also the most lossy: mixed content became a flat string, the mark element disappeared, the processing instruction and the comment are gone, and the two namespace identities survive only because a person renamed them by hand. Nothing in the output tells a reader that o:id and b:id were ever different things."
        />
        <H3>The inventory of losses</H3>
        <P>
          Read the three renderings against each other and the cost of &quot;just convert it&quot; becomes a list you can hand to a reviewer. The
          table below is the honest version of that list: which XML construct survives, whether it survives at all, and what it degrades into
          when it does.
        </P>
        <DataTable
          caption="Conversion fidelity: XML construct against what arrives in JSON"
          head={['XML construct', 'Survives?', 'What it degrades into']}
          rows={[
            ['Mixed content', 'No', 'Either the concatenated text with the child elements destroyed, or an array of fragments no consumer recognises. The mark element above is the canary.'],
            ['Attributes', 'Only by convention', 'A synthetic key. BadgerFish, xml-js and fast-xml-parser all disagree, and promoting an attribute to a sibling key is how collisions start.'],
            ['Namespace name (the URI)', 'Rarely', 'Local name only. Two vocabularies can collide on one key, and after the round trip no consumer can tell they were different.'],
            ['Repeated element', 'Yes, with a flag', 'An object when it occurs once, an array when it occurs more than once, unless the converter is told the cardinality out of band.'],
            ['Element order', 'Yes', 'Array order is preserved and means the same thing. Document order of siblings inside different parents is not something JSON can assert.'],
            ['Attribute order', 'No, and it does not matter', 'XML 1.0 section 3.3.1 already says attribute order is not significant, so this is a free loss.'],
            ['Comment', 'No', 'Silently dropped, or moved under an invented key that no schema mentions.'],
            ['Processing instruction', 'No', 'Dropped, or stringified. A PI addressed to the application has nowhere to go in a value grammar.'],
            ['CDATA section', 'Partly', 'Character data, indistinguishable from escaped text beside it. Round-tripping may re-escape it differently.'],
            ['DTD-supplied defaults, ID uniqueness', 'No', 'Values a non-validating processor never saw, so two systems reading one file can produce two different JSON documents.'],
            ['Empty element versus absent element', 'Convention', 'null, empty string, empty object or empty array. The absent-versus-null distinction is exactly what a database column cares about.'],
            ['General entities', 'Depends on configuration', 'Expanded text if the parser expanded them, literal ampersand-name text if it did not. Check your parser before you trust a diff.'],
          ]}
          foot="None of these rows is a defect in JSON. They are the surface area of a projection. What matters is that each row is a decision recorded in writing, not rediscovered by whoever reads the output next."
        />
        <Callout tone="warn" title="The collision that ships to production">
          <P>
            The worst case in the table is the fourth row plus the third, in combination. A converter that promotes attribute values to sibling
            keys turns <Rich text={'`<item id="1">`'} /> and a child <Rich text="`<id>`" /> into two members named{' '}
            <Rich text="`id`" /> in one object. RFC 8259 section 4 is blunt about the result: behaviour is unpredictable when object names are
            not unique. Some readers keep the first, most keep the last, and the document is well-formed either way, so no error is raised. If
            your pipeline converts XML to JSON, print the key set your chosen library produces for a document that contains both, and put that
            output under version control.
          </P>
        </Callout>
      </Section>

      <Section id="namespaces" title="Namespaces: why xmlns exists and where it breaks keys" kicker="Identity">
        <P>
          A namespace is the one XML feature that can change the meaning of a document without changing a single word in it — and the one a
          converter can delete without anyone noticing. Understanding that is the difference between reading XML and debugging XML.
        </P>
        <P>
          The problem Namespaces in XML 1.0 was written to solve is vocabulary collision. Two organisations both define an element called{' '}
          <Rich text="`address`" /> with different children; a document that embeds both cannot tell them apart by local name. The recommendation
          solves it by making a name a pair: the namespace name, which MUST be a URI reference or the empty string, plus the local name. Section
          3 of the Third Edition adds the sentence that ends the most arguments: of the namespace name, &quot;It is not a goal that it be
          directly usable for retrieval of a schema&quot;. A parser never downloads it. Identity is string equality, so two URIs differing by one
          character are two vocabularies and a typo in one is invisible until validation fails or, worse, succeeds against the wrong grammar.
        </P>
        <H3>Prefixed, default, and the attribute rule everybody forgets</H3>
        <P>
          A prefixed declaration binds a prefix to a URI and its scope extends from the element&apos;s start-tag to the matching end-tag
          (section 6.1), where an inner declaration for the same prefix shadows the outer one. A default declaration binds the URI for
          unprefixed element names on that element and its descendants (section 6.2), and an empty default value puts those names back in no
          namespace at all. Then comes the rule that costs people the most hours: section 6.2 states that default namespace declarations do not
          apply directly to attribute names. An unprefixed attribute has no namespace, ever — it is not in the default namespace, not in the
          element&apos;s namespace, not in anything. The only attributes that can be in a namespace are prefixed ones, plus the reserved{' '}
          <Rich text="`xml`" /> prefix, which is bound by definition to <Rich text="`http://www.w3.org/XML/1998/namespace`" /> and MUST NOT be
          bound elsewhere. That is why <Rich text="`xml:lang`" /> needs no declaration and why{' '}
          <Rich text={'`lang="en"`'} /> is a different kind of thing entirely.
        </P>
        <P>
          The second rule people trip over is not in the namespace document at all: a default namespace declaration changes what an XPath
          expression matches. <Rich text="`//entry`" /> selects elements whose namespace name is the empty string, so a feed that declares a
          default namespace returns nothing, and the usual &quot;fix&quot; of matching on <Rich text="`local-name()`" /> quietly matches the
          wrong vocabulary too. That failure mode is covered in{' '}
          <Rich text="[the XML guide](/learn/xml/)" />; what matters here is that it is a namespace problem, not an XPath problem.
        </P>
        <CodeBlock
          title="two vocabularies, one key"
          language="xml"
          code={`<ship xmlns:acct="urn:example:accounts:1" xmlns:inv="urn:example:inventory:3"
      acct:id="INV-9001" inv:id="42">
  <acct:id>42</acct:id>
  <inv:id>42</inv:id>
</ship>`}
          caption="Three distinct names to an XML processor: the account id attribute, the inventory id child, and the invoice id in the accounts namespace. All three have different identities and one of them is an attribute, which means none of them is comparable to the others without a schema."
        />
        <CodeBlock
          title="what a namespace-blind converter produces"
          language="json"
          code={`{
  "id": "42",
  "ship": {
    "id": "42",
    "@id": "INV-9001"
  }
}`}
          caption="Illustrative output: local names only, attributes prefixed with the at sign. The two URIs have vanished, urn:example:accounts:1 and urn:example:inventory:3 are now the same string, and the reader cannot tell whether the value 42 came from the invoice or the inventory. A converter that keeps prefixes in keys instead would produce acct:id and inv:id, preserving the distinction but baking the prefix choice into your schema."
        />
        <P>
          There is a third failure mode specific to prefixes. Because a prefix is only a local abbreviation of a URI, a document may use{' '}
          <Rich text="`o:order`" /> today and <Rich text="`ord:order`" /> tomorrow with no change in meaning, and a key-named-by-prefix converter
          will break on every consumer. The stable identity is the URI. So the practical rule for anyone operating a conversion boundary is:
          decide whether the JSON key carries the URI (verbose, stable), a locally pinned prefix (compact, fragile), or nothing at all (lossy,
          silent) — and record the choice in the interface contract, because the output itself will not show it.
        </P>
        <Callout tone="note" title="Namespace-unaware parsing is a real option">
          <P>
            Processors can run with namespace processing off, in which case <Rich text="`xmlns`" /> and <Rich text="`xmlns:prefix`" /> are
            ordinary attributes and <Rich text="`o:order`" /> is an element called <Rich text="`o:order`" />. Several popular libraries default
            to namespace-aware mode and several do not, so the same file can produce two different JSON documents depending on a flag you never
            set. Check your parser. If the converter output contains keys beginning with <Rich text="`xmlns`" />, you are in
            namespace-unaware mode; if it does not, the URIs were probably dropped on the floor.
          </P>
        </Callout>
      </Section>

      <Section id="types" title="Types: a validation grammar against a set of conventions" kicker="Strictness">
        <P>
          Neither format knows what a date is. That single sentence explains most of the difference in operational cost between the two
          ecosystems, because the formats handle the gap in completely different ways: one of them has a standardised vocabulary for asserting
          types outside the instance, and the other has habits.
        </P>
        <P>
          XML Schema Part 2: Datatypes (Second Edition, 28 October 2004) separates three notions that JSON never separates at all. The value
          space (2.1) is the set of distinct values a type denotes. The lexical space (2.3) is the set of literals that can denote them. The
          canonical representation (2.3.1) is a one-to-one mapping between literals and values, which is what makes equality, hashing and
          delta-comparison of values mechanically meaningful. Against that framework the document defines nineteen primitive types in 3.2 and
          the derived types in 3.3, including <Rich text="`xs:date`" /> (3.2.9), <Rich text="`xs:dateTime`" /> (3.2.7),{' '}
          <Rich text="`xs:decimal`" /> (3.2.3), <Rich text="`xs:hexBinary`" /> (3.2.15) and <Rich text="`xs:base64Binary`" /> (3.2.16).
        </P>
        <P>
          Two of those definitions are worth reading closely, because they are the ones people assume JSON has. On <Rich text="`xs:decimal`" />,
          Part 2 says precision is not reflected in the value space and that the number 2.0 is not distinct from the number 2.00 — a decimal
          value is exact and trailing zeros are lexical noise, while the facets <Rich text="`totalDigits`" /> and{' '}
          <Rich text="`fractionDigits`" /> constrain what may appear. On <Rich text="`xs:double`" />, 3.2.5 says the value space is patterned
          after the IEEE 754 double-precision 64-bit floating point type. So an XML schema author can say &quot;exact to two fractional digits,
          never more than nine digits total&quot;, and a validating processor enforces it before your application ever sees the value. Binary
          data gets a real type with a real length, not a string that happens to be base64.
        </P>
        <CodeBlock
          title="what a schema can say that a payload cannot"
          language="xml"
          code={`<xs:element name="order" type="o:OrderType" xmlns:xs="http://www.w3.org/2001/XMLSchema"/>
<xs:complexType name="OrderType">
  <xs:sequence>
    <xs:element name="placed" type="xs:date"/>
    <xs:element name="total" type="xs:decimal"/>          <!-- exact, not a double -->
    <xs:element name="sku"   type="xs:string"/>
    <xs:element name="qty"   type="xs:integer"/>
    <xs:element name="backorder" type="xs:base64Binary"
                  minOccurs="0" nillable="true"/>
  </xs:sequence>
  <xs:attribute name="id" type="xs:ID" use="required"/>
</xs:complexType>
<xs:simpleType name="Currency">
  <xs:restriction base="xs:string">
    <xs:enumeration value="EUR"/><xs:enumeration value="BRL"/><xs:enumeration value="USD"/>
  </xs:restriction>
</xs:simpleType>`}
          caption={'The instance cannot express any of this. minOccurs, nillable, use="required", ID uniqueness and the enumeration are all claims about the document made by a grammar that lives elsewhere — which is the whole reason XSD exists and the whole reason it is heavy.'}
        />
        <P>
          What strictness buys is a loud failure at the boundary, before the value becomes an integer in one service and a float in another. It
          also buys a machine-readable statement of cardinality, which is exactly the information an XML-to-JSON converter most needs and almost
          never reads: given the schema, the converter can emit arrays consistently whether the source happens to contain one item or three. It
          buys generated code, generated documentation and a contract a partner can validate independently.
        </P>
        <P>
          What it costs is a second artefact per vocabulary, kept in step with the first. Schema languages have their own failure modes —
          element form defaults, the <Rich text="`xsi:nil`" /> ceremony that nillable forces into the instance, type substitution rules, import
          and renamespace coupling, and the fact that a schema document is itself namespaced and versioned by URI. There is also the
          operational trap that validation is opt-in: a processor that is not validating will happily accept a document that fails the schema, so
          &quot;we validate the XML&quot; is an assertion about your deployment, not about your format. DTDs, the older mechanism, are weaker
          again: content models, the attribute types <Rich text="`CDATA`" /> and <Rich text="`ID`" /> and <Rich text="`IDREF`" /> and{' '}
          <Rich text="`NMTOKEN`" />, defaults and fixed values — but no types on element content at all.
        </P>
        <P>
          JSON answers the same problem with conventions, and the conventions are genuinely good ones. Dates are ISO 8601 strings;{' '}
          <Rich text="`RFC 3339`" /> is the profile that everybody actually interoperates on. Money is a string, or an integer count of minor
          units, or a number that you have agreed to distrust. Binary is base64 with the alphabet and padding written down somewhere in the
          README. Absence is <Rich text="`null`" /> versus a missing member. RFC 8259 itself does not standardise any of it: section 6 on numeric
          interoperability says good interoperability can be achieved by implementations that expect no more precision or range than IEEE 754
          doubles provide, and notes that a number such as 1E400 &quot;may indicate potential interoperability problems&quot; because it suggests
          the writer expects the reader to have greater capabilities than are widely available. Section 8.1 gives the one hard requirement: JSON
          text exchanged between systems that are not part of a closed ecosystem MUST be encoded using UTF-8.
        </P>
        <CodeBlock
          title="the same contract in JSON Schema"
          language="json"
          code={`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "placed", "total", "lines"],
  "properties": {
    "id":      { "type": "string", "pattern": "^A-[0-9]+$" },
    "placed":  { "type": "string", "format": "date" },
    "total":   { "type": "string", "pattern": "^[0-9]+(\\.[0-9]{2})?$" },
    "qty":     { "type": "integer", "minimum": 1 },
    "backorder": { "type": ["string", "null"], "contentEncoding": "base64" },
    "currency": { "enum": ["EUR", "BRL", "USD"] },
    "lines":   { "type": "array", "minItems": 1, "items": { "type": "object" } }
  },
  "additionalProperties": false
}`}
          caption={'Note the money field: to get xs:decimal exactness in JSON you have to abandon the number type and encode a string, or use a big-decimal library on both ends. A format keyword of "date" is an annotation in draft 2020-12, so a validator asserts it only when format assertions are enabled, and a payload with placed set to "2026-13-45" can pass a default validation run.'}
        />
        <DataTable
          caption="The same three values, and who is responsible for each meaning"
          head={['Value', 'XML with a schema', 'JSON', 'Who decides']}
          rows={[
            ['2026-11-04', 'xs:date, value space of calendar day, typed at parse time (Part 2, 3.2.9)', 'A string. JSON Schema format "date" if assertions are enabled.', 'The schema, in XML. The validator configuration, in JSON.'],
            ['49.90', 'xs:decimal: exact, trailing zeros not distinct, constrained by fractionDigits', 'A number, so the double decides; a string if you opt out of the number type.', 'The parser, and the trailing zero is already gone.'],
            ['a PNG', 'xs:base64Binary with length facets', 'A base64 string with contentEncoding as a hint, or a separate channel', 'Whichever library decoded it last, plus the alphabet you documented.'],
            ['missing required field', 'minOccurs="0", use="optional", nillable with xsi:nil', 'Absent member, or null, or the empty string', 'The contract you can afford to run on every request.'],
            ['identifier uniqueness', 'ID and IDREF constraints checked by a validating processor', 'Nothing in the format', 'Your application code.'],
            ['cardinality of a repeating node', 'maxOccurs, asserted independently of the instance', "Array length, which is a fact about one document rather than a promise", 'The schema in XML; the sample you happened to test in JSON.'],
          ]}
          foot="The pattern is consistent: XML can push type assertions out of the instance and into a grammar, and JSON cannot, so JSON teams push them into a validator, a linter, a code review checklist, or the database column definition."
        />
        <H3>Coercion is the part that bites</H3>
        <P>
          Because JSON has no decimal and XML has no types in the instance, both ecosystems contain a converter that guesses. The failure is the
          same one documented for CSV pipelines: a value that looks numeric is coerced, and <Rich text="`007`" /> becomes{' '}
          <Rich text="`7`" />. XML is accidentally safer here — every character data value is a string until a schema says otherwise — and
          correspondingly more annoying, because the consumer must type every field itself. If your pipeline runs XML into JSON into a database,
          there are three typing decisions in the chain and only one of them is written down. The{' '}
          <Rich text="[JSON validator](/json-tools/validator/)" /> on this site shows the two silent ones: a number that lost precision, and a
          key that appeared twice.
        </P>
      </Section>

      <Section id="security" title="Security: external entities, expansion bombs and __proto__" kicker="Attack surface">
        <P>
          XML has a class of remote vulnerability that JSON does not have, and it is a configuration decision rather than a property of angle
          brackets. Getting that distinction right matters, because the fix follows from it: you do not mitigate a markup feature, you turn off a
          parser feature.
        </P>
        <P>
          The mechanism is the document type declaration. XML lets a document name an external DTD and define general entities whose replacement
          text lives at a system location. A processor that reads declarations will fetch that location. That is the entire bug: a data format
          with a built-in instruction that says &quot;make this request&quot;. The classic payload reads a local file through a{' '}
          <Rich text="`file:`" /> URI and leaks it into the response, or reaches an internal address through{' '}
          <Rich text="`http:`" /> for server-side request forgery and port scanning, or returns content to an attacker-controlled host
          out-of-band through a parameter entity. The reason it is so common is that it needs no vulnerable application code — only a parser
          left at its upstream defaults, inside a library you never looked at.
        </P>
        <CodeBlock
          title="the shape of an XXE payload"
          language="xml"
          code={`<?xml version="1.0"?>
<!DOCTYPE order [
  <!ENTITY x SYSTEM "file:///etc/passwd">
]>
<order><note>&x;</note></order>
<!-- the fetched text arrives in the character data of note -->
<!-- parameter-entity variants exfiltrate the value in a request to an external host -->`}
          caption="Two properties to notice. The attack surface is the DOCTYPE: a document without one cannot do any of this. And the entity is expanded by the processor, not by your code, so an application that never mentions entities is still affected."
        />
        <P>
          The denial-of-service cousin is entity expansion, better known as the billion laughs. Define one entity as ten copies of the previous
          one and repeat the nesting, and a few hundred bytes of markup expands to gigabytes of character data. The external-entity variant of the
          same idea loops an external reference back on itself with a growing payload. Input-size limits do not help, because the expansion
          happens after the input has been accepted; what helps is an expansion budget, a per-entity size cap and a parse timeout. Java&apos;s
          JAXP implementation exposes expansion and entity-size limits as parser features, .NET&apos;s XmlReader has{' '}
          <Rich text="`MaxCharactersFromEntities`" /> and <Rich text="`DtdProcessing`" />, libxml2 caps expanded text, and Python has{' '}
          <Rich text="`defusedxml`" /> for people who would rather refuse than budget. Exact feature names and defaults move between releases, so
          check the documentation for the version you ship rather than the version someone blogged about.
        </P>
        <P>
          These are not hypothetical. The most cited example in the JSON-adjacent world is CVE-2017-7529, published in November 2017 against
          jackson-databind 2.8.9 and earlier, where an XML backend combined with polymorphic type handling turned a payload into an external
          entity read; it carries a CVSS score of 9.0 and it affected a very large amount of Java infrastructure. Apache Solr carried CVE-2019-0193,
          an XXE in a configuration path, which was exploited in the wild. Check each advisory for the precise affected range before you quote it
          in a report — but the operational lesson is the one that generalises: the vulnerable component was a parser somebody else configured, in
          a library that was not advertised as an XML processor.
        </P>
        <Callout tone="tip" title="The mitigation, in the order that works">
          <P>
            One: refuse document type declarations unless the vocabulary genuinely needs them, and make the refusal a test that a DOCTYPE fails
            loudly. Two: disable external-entity resolution and DTD loading, including in the parsers buried inside libraries. Three: cap
            expansions, entity sizes, total input size and parse time. Four: run with namespace awareness on and validate against XSD or RELAX
            NG rather than a DTD. Five: assume every dependency you do not read is configured the way its author shipped it. The{' '}
            <Rich text="[encoding and security workflow](/use-cases/encoding/)" /> page keeps a longer version of this list.
          </P>
        </Callout>
        <H3>JSON&apos;s own classes of failure</H3>
        <P>
          JSON has no entity mechanism, so there is nothing to point at a file. Its failure classes are different and mostly live in
          implementations rather than in the format.
        </P>
        <P>
          The first is evaluation. RFC 8259 section 12 says plainly that evaluating JSON text as code &quot;generally constitutes an
          unacceptable security risk, since the text could contain executable code along with data declarations&quot;. Any pipeline that parses
          JSON by handing it to a scripting interpreter is a remote code execution bug with extra steps.
        </P>
        <P>
          The second is prototype pollution, which is the nearest functional analogue of XXE in JavaScript.{' '}
          <Rich text="`JSON.parse`" /> itself is not the problem — it creates own properties. The problem is what happens next, when an
          untrusted object is merged into a trusted one by a recursive helper that walks keys and assigns, because a member named{' '}
          <Rich text="`__proto__`" /> is reachable as a property assignment in most engines and writes through to{' '}
          <Rich text="`Object.prototype`" />. The disclosed instances over 2018 and 2019 were deep-merge and defaults helpers in widely used
          libraries rather than the parser, which is the same lesson as XXE: the dangerous thing is the component that interprets the structure.
          Mitigations are the same shape too — parse with a reviver that rejects the key, merge with explicit property lists, use{' '}
          <Rich text="`Object.create(null)`" /> for accumulators, or freeze the prototype.
        </P>
        <CodeBlock
          title="the two JSON payloads that are not syntax errors"
          language="javascript"
          code={`// 1. prototype pollution via a naive deep merge
const patch = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge(defaults, patch);            // defaults.isAdmin is now true for every object
// JSON.parse is fine. merge is the bug. Check which merge you are using.

// 2. duplicate member names: well-formed, and unpredictable (RFC 8259 section 4)
const auth = JSON.parse('{"role":"user","role":"admin"}');
// which value survives depends on the parser; both orders parse.

// 3. depth: the grammar is recursive and sets no limit
const deep = "[".repeat(200000) + "]".repeat(200000);
// a recursive-descent parser may throw a stack error; an iterative one may just be slow`}
          caption={'None of the three is a malformed document. That is the point: JSON attacks do not show up as parse errors, and a format whose security model is "do not interpret the text" has nothing for a firewall to match on.'}
        />
        <P>
          The third class is depth. The JSON grammar is recursive and RFC 8259 puts no ceiling on it, so a document of a hundred thousand nested
          arrays is conforming text. Whether your parser throws a stack error, silently truncates, or simply runs out of memory is a property of
          the implementation, and it is worth knowing which before someone sends you that payload on a public endpoint. The fourth class is
          numeric: 1E400 and a fifteen-digit identifier are both legal, and the double that swallows them is section 6 of the same document.
          The fifth class is polymorphic deserialisation, where a library reads a type name out of the payload and instantiates it; that is
          strictly a library feature, not a format feature, and it is the one that produced the longest list of Java and PHP advisories this
          decade.
        </P>
        <KeyTerms
          items={[
            { term: 'XXE', definition: 'XML external entity: a DOCTYPE tells the parser to fetch a resource, and the fetched text becomes character data.' },
            { term: 'parameter entity', definition: 'An entity in the DTD subset, written with a percent sign. The mechanism behind out-of-band exfiltration.' },
            { term: 'billion laughs', definition: 'Nested entity definitions whose expansion is exponential. Input size limits do not help; an expansion budget does.' },
            { term: 'SSRF', definition: 'Server-side request forgery: the parser is made to issue a request from inside your network to a host it should not reach.' },
            { term: 'prototype pollution', definition: 'A crafted member reaching Object.prototype through a recursive merge. JSON.parse is not the culprit; the merge is.' },
            { term: 'autoType', definition: 'A library feature that instantiates a class named in the payload — the closest functional analogue of XXE in JSON tooling.' },
          ]}
        />
        <P>
          Set against that, XML has a genuinely bigger surface, and the reason is worth stating without embarrassment: a format that lets the
          document refer to other documents gives an attacker a fetch primitive. JSON does not, and never will without becoming something else.
          If you operate XML anywhere — including inside a DOCX upload, a SAML login, an RSS ingest or a SOAP partner integration — the parser
          configuration is part of your security review, not part of your formatting preferences.
        </P>
      </Section>

      <Section id="streaming" title="Streaming: SAX and StAX against a format with no framing" kicker="Scale">
        <P>
          The claim you will read everywhere is that JSON streams more easily than XML. It is backwards, and the reason it is backwards is a
          good example of how much of this comparison is about libraries rather than formats.
        </P>
        <P>
          XML has two specified streaming interfaces and thirty years of implementations. SAX is push: the parser calls your{' '}
          <Rich text="`startElement`" /> and <Rich text="`characters`" /> handlers and never builds a tree, so memory is bounded by the deepest
          element rather than the file. StAX, standardised as JSR 173, is pull: you ask for the next event and you decide when to stop, which is
          much easier to embed in a loop that writes output. Both work on a gigabyte document without loading it. Both are namespace-aware,
          which matters because a streaming parser must keep the active prefix bindings as scope states. What streaming cannot do is hand you
          everything a DOM would: a defaulted attribute from an external DTD is not knowable from the instance, entity expansion is a decision
          you make event by event, and full validation of a content model is generally outside the scope of a pull parser.
        </P>
        <P>
          JSON has no streaming standard, and this is a real gap in the specification rather than a gap in implementations. Section 2 of RFC 8259
          describes exactly one value per document and says nothing about sequences of documents, framing, delimiters or partial input.
          Every way of reading JSON incrementally is therefore a convention: a library event reader (Jackson&apos;s{' '}
          <Rich text="`JsonParser`" />, .NET&apos;s <Rich text="`Utf8JsonReader`" />), a generator-based pull API, or a text-level framing
          discipline such as JSON Lines and NDJSON, where each line is a complete self-contained value and the newline is the record boundary.
          None of them interoperate, and each has a different behaviour when the input stops halfway.
        </P>
        <CodeBlock
          title="the same ingest job, three ways"
          language="text"
          code={`XML, StAX pull (specified, portable)
  while (reader.hasNext()) {
      switch (reader.nextEvent()) {
        case START_ELEMENT:
          if ("order".equals(reader.getLocalName()))
              openOrder(reader.getAttributeValue(null, "id"));
          break;
        case END_ELEMENT:   closeOrder(); break;
      }
  }

JSON Lines / NDJSON (a convention, not a standard)
  {"id":"A-84120","placed":"2026-11-04","total":"49.90"}
  {"id":"A-84121","placed":"2026-11-04","total":"12.40"}
  one value per line, LF delimiter, no leading or trailing whitespace

JSON inside a gzip member (where the convention stops working)
  deflate frames do not respect your line boundaries: a truncated
  stream ends at a block boundary, and readers that assume a
  complete final line will silently drop the tail record`}
          caption="The XML event API is standardised and portable; the JSON one is two conventions glued together. Both are fine in practice, and both need the same discipline: a truncation test in your suite."
        />
        <P>
          NDJSON deserves the specific recommendation it has in log pipelines: it is append-only by construction, it is splittable with{' '}
          <Rich text="`split`" /> and greppable with ordinary line tools, it is shardable by byte offset, and a malformed record costs one line
          rather than the file. The trade is that you lose the single-document guarantee and every consumer has to agree that a line is a value.
          The JSON Lines convention is documented at{' '}
          <a href="https://jsonlines.org" target="_blank" rel="noopener noreferrer external">jsonlines.org</a> as a handful of rules rather than a formal
          specification, which is exactly the status you should assume when you design around it.
        </P>
        <P>
          There is an active effort to fix the underlying gaps — usually described as JNI, JSON Next Iteration, which grew out of the BOJSON
          discussion at IETF meetings and proposes things like comments, a plain string delimiter, sequences of values and explicit support for
          values JSON cannot express. I checked the IETF datatracker for this page on 12 November 2026 and could not confirm an adopted
          working-group charter or a published document I would be willing to cite as settled, so the honest statement is that the status is
          unsettled: treat any &quot;JSON 2 will standardise this&quot; claim as a proposal, verify it against the datatracker, and keep building
          on RFC 8259 plus conventions.
        </P>
        <KeyTerms
          items={[
            { term: 'SAX', definition: 'The push interface: your handler is called per event and no tree is built. Memory tracks the open path, not the file.' },
            { term: 'StAX', definition: 'The pull interface, standardised as JSR 173: you request the next event and decide when to stop reading.' },
            { term: 'framing', definition: 'How independent values are separated in one byte stream. RFC 8259 defines none, so every sequence format is a convention.' },
            { term: 'NDJSON', definition: 'JSON Lines in practice: one self-contained value per line, appended, split and grepped with line tools.' },
            { term: 'JNI', definition: 'The informal name for JSON Next Iteration, the proposal to standardise comments, sequences and richer values. Status unsettled as of this writing.' },
            { term: 'scope state', definition: 'The namespace bindings a streaming XML parser must carry, because a prefix can be declared anywhere up the tree.' },
          ]}
        />
        <DataTable
          caption="What each format gives you when the file does not fit in memory"
          head={['Need', 'XML', 'JSON']}
          rows={[
            ['Incremental parse of one huge document', 'SAX (push) and StAX (pull), both specified', 'Library event readers; no standard API and no standard behaviour at truncation'],
            ['Sequence of independent documents', 'Not a document: production [1] allows one root, so you wrap or use a private convention', 'A convention with a name: JSON Lines and NDJSON'],
            ['Random access into a large file', 'Possible with tooling over a known byte range, not part of the format', 'Possible only if the file is chunked; a single value has no offsets'],
            ['Partial validity checking', 'A streaming processor can check well-formedness per event; validity is harder', 'Syntax per line only; schema conformance needs the whole value'],
            ['Namespace context while streaming', 'Scope states maintained by the parser, and you must ask for namespace-aware mode', 'Not applicable'],
            ['Defaulted attributes while streaming', 'Not knowable from the instance; needs the DTD read', 'Not applicable'],
          ]}
          foot="The takeaway is uncomfortable for both sides: XML has a standardised streaming answer to a problem JSON does not have a standardised answer to, and JSON has a document-sequence convention XML does not need to invent because it was never designed for sequences."
        />
      </Section>

      <Section id="wire" title="Size on the wire, counted rather than asserted" kicker="Arithmetic">
        <P>
          This section exists because most of what is written about XML and JSON file sizes is folklore repeated without a calculator. The
          numbers below were produced by counting bytes of the exact texts printed here, with <Rich text="`wc -c`" /> for raw sizes and{' '}
          <Rich text="`zlib.gzip`" /> at level 9 for compressed ones, over a shell loop that generated 500 records. It is not a benchmark. It is
          one record shape, one schema, one compression implementation, and you should reproduce it rather than trust it.
        </P>
        <CodeBlock
          title="one record as XML - 288 bytes minified, 343 indented"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<order id="A-84120" currency="EUR" placed="2026-11-04T09:15:00Z">
  <customer id="cus_77">Ana Sofia Marques</customer>
  <line sku="K-100" qty="2">Steel ruler, 30 cm</line>
  <line sku="K-101" qty="1">Brass compass</line>
  <total>49.90</total>
  <note>Ship to Brussels; contents fragile.</note>
</order>`}
          caption="The indented file is 343 bytes: 288 for the minified document plus 38 for the XML declaration, 10 for two spaces of indentation on the five child lines, and 7 line breaks. Attribute names are unquoted and short, which is cheaper than JSON key syntax for metadata."
        />
        <CodeBlock
          title="the same record as JSON - 294 readable, 303 to 359 faithful"
          language="json"
          code={`{"id":"A-84120","currency":"EUR","placed":"2026-11-04T09:15:00Z","customer":{"id":"cus_77","name":"Ana Sofia Marques"},"line":[{"sku":"K-100","qty":"2","value":"Steel ruler, 30 cm"},{"sku":"K-101","qty":"1","value":"Brass compass"}],"total":"49.90","note":"Ship to Brussels; contents fragile."}`}
          caption="Readable mapping: 294 bytes minified, 355 indented by two. The same document written with a faithful converter convention costs more than the format swap does: prefixed attribute keys and a text key, as in rendering 2 earlier on this page, measure 303 bytes minified and 364 indented, while a grouped attributes object measures 359 and 428. A three to twenty-two percent tax from the convention, against six bytes from the format."
        />
        <H3>Where the bytes actually go</H3>
        <P>
          Count the structural overhead of the two minified records by hand. The XML has 12 tags carrying 60 bytes of element-name characters
          plus 30 bytes of angle-bracket delimiters, which is 90 bytes, and 8 attributes whose names total 30 bytes plus one equals sign each,
          which is 38 more: 128 bytes of name overhead. The JSON has 15 members whose keys total 65 characters, and each key costs two quote
          characters and a colon, which is 45 more: 110 bytes. The difference is 18 bytes on a document of about 290 — under 7% — and the reason
          it is so small is that XML pays for closing tags while JSON pays for quoting every key. On this record the readable JSON is{' '}
          <em>bigger</em> than the XML, because every element that holds both an attribute and text needs a wrapper key in JSON.
        </P>
        <P>
          Repetition is where the story changes, and repetition is what deflate exists to exploit. Running the same generator over 500 records —
          once with identical content, once with varied names, cities, timestamps and item text — produces the table below.
        </P>
        <DataTable
          caption="Measured on these exact files: wc -c for the raw sizes, zlib gzip at level 9 with no stored filename for the compressed ones"
          head={['Run', 'XML raw', 'JSON raw', 'XML at gzip -9', 'JSON at gzip -9']}
          rows={[
            ['One record, minified', '288 B', '294 B', '228 B', '228 B'],
            ['One record, indented by two', '343 B, declaration included', '355 B', '264 B', '248 B'],
            ['One record, prefixed-key mapping', 'not applicable', '303 B minified, 364 B indented', 'not applicable', '232 B minified, 249 B indented'],
            ['One record, grouped-attributes mapping', 'not applicable', '359 B minified, 428 B indented', 'not applicable', '241 B minified, 259 B indented'],
            ['500 identical records', '159,558 B', '147,501 B', '2,021 B', '1,968 B'],
            ['500 varied records', '156,858 B', '144,801 B', '8,898 B', '8,694 B'],
          ]}
          foot="Read the ratios rather than the absolute numbers. Raw, the XML is 8.3% larger; compressed at level 9 on varied content it is 2.4% larger (2.7% on the identical-content run), and on the single minified record deflate produced exactly the same 228 bytes for both formats. Compression factors on the varied run are 17.6x for the XML and 16.7x for the JSON. The two faithful-mapping rows are the interesting ones: a conversion convention costs 9 to 65 bytes per record where the format choice costs six. And on a one-record file the gzip container overhead — a 10-byte header plus an 8-byte trailer — is 18 bytes, three times the difference between the formats, which is why single-file comparisons are noise."
        />
        <P>
          Three honest caveats. First, level 9 on a synthetic file with 500 copies of one record shape is the best case for repetition-based
          compression; a real corpus with many distinct strings compresses less, and the varied run shows that (the gap in bytes grew from 53 to
          204 while the ratio stayed near 2.4%). Second, none of this says anything about HTTP: per-request compression on a single small payload
          is dominated by the same container overhead and by dictionary reuse across requests, which is why a connection that reuses a compression
          dictionary behaves nothing like these numbers. Third, size on the wire is the least important cost in the pipeline anyway.
        </P>
        <Callout tone="note" title="What the size argument is really for">
          <P>
            CPU and memory scale with structure, not with the last two digits of a byte count. XML parsing costs more because a processor must
            track scope, resolve names and manage an entity table, and DOM costs more again because it builds an object per node. JSON parsing
            costs less, and the honest way to win that argument is to measure your own payload with your own parser rather than cite a table
            from a blog. What the numbers here do establish is narrow and useful: the verbosity gap between the formats is single digits before
            compression and about two percent after it, so nobody should choose XML because of size, and nobody should refuse it because of size.
          </P>
        </Callout>
      </Section>

      <Section id="xml-wins" title="Where XML still wins for real reasons" kicker="Defence">
        <P>
          Nobody picks XML because it is compact. It stays in production because four specific capabilities are load-bearing in four specific
          kinds of system, and no JSON feature substitutes for them at the same price.
        </P>
        <H3>Signing a subtree</H3>
        <P>
          A SAML 2.0 assertion is signed with XML Signature over part of a document, and that is only meaningful if the signed bytes can be
          reconstructed identically by the verifier. Canonicalisation is the mechanism that makes this possible. The purpose is stated in section
          1 of Exclusive XML Canonicalization 1.0 (W3C, 18 July 2002); section 2.1 sets out the problem that the exclusive variant exists to
          solve, which is that a signed subtree inherits namespace declarations from ancestors, so moving it into a different enclosing document
          changes the declarations it implies and breaks the signature; section 3 gives the two processing models, inclusive canonicalisation
          emitting every inherited declaration and exclusive emitting only those visibly used plus those named in the inclusive prefix list. The
          output is a defined octet stream with the MIME type <Rich text="`application/xml-canonical`" />.
        </P>
        <P>
          The comparison point is instructive rather than one-sided. JSON does not have this problem because it does not have the same
          operation: a JWS signature covers the exact serialised bytes of a payload, which is simpler and works well — until you need to sign
          <em>part</em> of an object and hand the rest on, or re-serialise through an intermediate that reorders members. There is a JSON
          canonicalisation scheme (RFC 8785) for the cases where determinism matters, and knowing it exists is cheaper than inventing your own
          key sort. OAuth 1.0a took the third route, sidestepping the whole issue with a flat percent-encoded parameter normalisation instead of
          tree canonicalisation, which is a useful reminder that document signing and request signing are different problems.
        </P>
        <H3>Documents that are data</H3>
        <P>
          Mixed content is a feature only if your payload is prose with structure inside it. That describes an embarrassing amount of the world:
          every DOCX, XLSX and PPTX file is a ZIP of XML parts under the Office Open XML package conventions; every EPUB is a ZIP of XHTML plus a
          package document; every SVG on your screen is XML; every Garmin GPX track is XML; and DITA, DocBook, TEI, JATS and LegalXML are all
          document vocabularies in the same family. The paragraph below is the smallest possible demonstration of why none of them converts to
          JSON happily.
        </P>
        <CodeBlock
          title="a DOCX paragraph, which is XML, and cannot be JSON"
          language="xml"
          code={`<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:pPr><w:pStyle w:val="Heading2"/><w:numPr/></w:pPr>
  <w:r><w:t xml:space="preserve">Turn the </w:t></w:r>
  <w:r><w:rPr><w:b/></w:rPr><w:t>caliper</w:t></w:r>
  <w:r><w:t> down to </w:t></w:r>
  <w:hyperlink r:id="rId4"><w:r><w:t>spec 4.2</w:t></w:r></w:hyperlink>
  <w:r><w:t>.</w:t></w:r>
</w:p>`}
          caption="Text and inline structure interleaved inside one element, with a run property that applies to only part of a sentence, a preserved leading space, and a reference to a relationship stored in a different part of the package. The JSON equivalent is either a string with the formatting destroyed or an array of typed fragments that no consumer outside your codebase can read."
        />
        <H3>A query and transformation layer</H3>
        <P>
          XPath and XSLT address a subtree without materialising the document around it, and XQuery turns a collection of XML documents into
          something you can join. The capability is real and it is the reason database engines keep XML types: PostgreSQL has an{' '}
          <Rich text="`xml`" /> column type with XPath-aware functions, and SQL Server and Oracle both expose native XML storage with indexed
          paths. JSON has a query vocabulary too — JSONPath, JSON Pointer, and the JSON query expressions in the various dialects of{' '}
          <Rich text="`SELECT`" /> in document databases — but none of them is a standard with a type system behind it, and none of them comes
          with a transformation language that produces a document rather than a value.
        </P>
        <H3>Vocabulary versioning and extension</H3>
        <P>
          Because a name is a pair of URI and local name, two versions of a vocabulary are different by construction, and a processor can be told
          to accept elements from a namespace it has never seen. That is how OOXML and SAML handle extension without a standards committee, and it
          is the closest XML gets to the extensibility story JSON solves with a registry, a naming convention, or the{' '}
          <Rich text="`@context`" /> indirection of JSON-LD. It costs a URI per vocabulary and a namespace-aware parser; it buys forward
          compatibility without coordination.
        </P>
        <Callout tone="tip" title="The three genuine reasons to choose XML">
          <P>
            The payload is a document and must keep prose and structure interleaved. Part of the payload must be signed and moved between
            enclosing documents, so you need canonicalisation. Or the boundary needs machine-checked types and cardinality asserted by a grammar
            the sender does not control. Everything else — legacy partners aside — is a preference you should be honest about being a preference.
            The syntax, the escape rules and the namespace mechanics behind all three are in{' '}
            <Rich text="[the XML guide](/learn/xml/)" />.
          </P>
        </Callout>
      </Section>

      <Section id="json-wins" title="Where JSON won, and the gaps that made BSON and MessagePack" kicker="Offence">
        <P>
          JSON won the public API, the configuration file and the log pipeline, and it did it for a reason that has nothing to do with the byte
          counts above: a JSON document parses into the native data structure of almost every host language on earth, with no intermediate model
          to learn and no vocabulary to declare. In a browser it is the object model. In Go it unmarshals into a struct. In Python it is a dict.
          That single property is worth more than any syntactic economy, and it is why nobody writes a new SOAP service for a mobile client.
        </P>
        <P>
          The second reason is the absence of ceremony. There is no namespace to declare, no prefix to bind, no document element to keep, no
          entity table to lock down, and no serialization of a scalar to wrap. A configuration file can be a top-level object; a log line can be
          a top-level object; an error response can be a two-member object. RFC 8259 registers the media type in section 11 and defines a format
          small enough to memorise, which is a design property with operational consequences: more people can read your payload correctly without
          consulting a specification, and fewer edge cases exist for two implementations to disagree about.
        </P>
        <P>
          The third is that the gaps in the type model turned out to be worth admitting. JSON has no date, no exact decimal, no binary and no
          distinction between a 32-bit and 64-bit integer, and the ecosystems that grew up around it built the escape hatches rather than pretend
          the strings were enough. MongoDB stores BSON, which has a datetime type, separate 32-bit and 64-bit integers, a binary type with
          subtypes, an ObjectId and a decimal128 for money — and a document size ceiling that exists because the format is a real binary encoding
          with real offsets rather than a text convention. MessagePack and CBOR do the same job for transport, with CBOR specified as a proper
          binary counterpart to JSON; the IANA registry that comes with it lists date and tag semantics that RFC 8259 leaves to folklore. Apache
          CouchDB, by contrast, keeps documents as JSON and base64-encodes attachments, which is the trade in the other direction: readable
          payloads, a 33% penalty on binary, and no type for the thing you encoded.
        </P>
        <CodeBlock
          title="the same three fields, four ways"
          language="text"
          code={`JSON      {"placed":"2026-11-04T09:15:00Z","total":"49.90","pdf":"JVBERi0xLjQK..."}
             types: string, string, string. Nothing here is a date or a number or bytes.

BSON      placed: 0x09 datetime  milliseconds since epoch
          total:  0x13 decimal128 49.90 exactly
          pdf:    0x05 binary, subtype 0x00, length prefix
             types: real, and the wire format is not JSON any more.

XSD       placed type="xs:dateTime"   total type="xs:decimal"   pdf type="xs:base64Binary"
             types asserted in a grammar, checked by a validating processor, instance stays text.

CBOR      tag 1 on a float or string for epoch-based dates, byte strings natively,
          integer widths explicit: a binary superset of the JSON model rather than a text one.`}
          caption="The interesting line is the first: the JSON version carries no type information at all, and every consumer downstream has to agree on the convention. The BSON and XSD versions both solve that; one of them stops being JSON to do it."
        />
        <P>
          It is worth naming what JSON still cannot do, because those limits are the ones that show up in a migration. There is no comment in the
          format, so configuration written as JSON either loses comments or becomes JSONC, which is a dialect with parsers but no specification.
          There is no way to declare that a field is required, only a validator outside the document. There is no canonical serialisation, so two
          byte-identical meanings do not exist unless everyone agrees on the key order and number formatting. And there is no cross-document
          identity: two services can both define a <Rich text="`status`" /> member and mean different things, with nothing in the format to tell
          them apart, which is the exact hole namespaces were invented to fill.
        </P>
        <P>
          For anything that is a tree of records travelling over HTTP, those absences cost nothing, which is why JSON is the default. Where they
          start to cost something is the moment you find out: the log pipeline that needs framing, the reconciliation job that needs a decimal,
          the partner that needs a signature over part of a payload. That is also the moment to stop arguing about formats and start writing down
          conventions, because the convention is what your system actually depends on either way.
        </P>
      </Section>

      <Section id="decision" title="The decision table and a conversion checklist" kicker="Choosing">
        <P>
          Four questions, in this order, and the format usually chooses itself: Is the payload a document or a record? Does anything need to be
          signed at the subtree level? Does the boundary need machine-checked types asserted by a grammar the sender does not control? And does
          the whole pipeline live in one language with one library? Two or more yes answers point at XML; none points at JSON.
        </P>
        <DataTable
          caption="Decide on properties, not on preference"
          head={['Situation', 'Choose', 'The deciding property']}
          rows={[
            ['A new public HTTP API', 'JSON', 'No subtree signing, no prose payload, and the host language parses it natively.'],
            ['A SAML or WS-* federation integration', 'XML', 'XML Signature plus exclusive canonicalisation is the only specified way to sign a movable subtree.'],
            ['Document generation, editing or ingest (DOCX, EPUB, SVG, GPX)', 'XML', 'Mixed content and run-level properties are the data, not an accident of it.'],
            ['Exchange with a partner that has a published XSD', 'XML', 'The grammar is the contract, and both sides can validate against it independently.'],
            ['Application configuration', 'JSON or YAML', 'Neither format adds types here; pick the one your reviewers can read in diff, and mind YAML anchors.'],
            ['Log and event pipelines', 'NDJSON', 'Append-only, line-splittable, one bad record costs one line. See the log-analysis page.'],
            ['Analytics storage and warehouse loads', 'Neither', 'Columnar binary formats with real types and compression beats both text formats on this axis.'],
            ['Database wire format with exact numerics', 'BSON or MessagePack', 'JSON has no decimal, no date and no binary type, and the ceiling exists because it is a real encoding.'],
            ['Migrating an XML store to a JSON API', 'Both, plus a written projection', 'The fidelity table above is the migration plan: each row is a decision with an owner.'],
            ['A payload that must round-trip unchanged', 'Whichever you keep the canonical form of', 'XML has canonicalisation; JSON needs RFC 8785 or your own rules. Round-tripping is a contract either way.'],
          ]}
          foot="Rows one to four are the whole argument. The rest is operational."
        />
        <H3>If you are converting, do these ten things</H3>
        <P>
          One: pick a mapping convention and write it down, including which key carries attributes and which carries text, because the{' '}
          <Rich text="[CSV to JSON](/format-converters/csv-to-json/)" /> style of silent type guessing is a smaller version of the same problem.
          Two: pin cardinality from the schema or from a hand-written list, so an element that happens to occur once still arrives as an array.
          Three: keep namespace identity somewhere — a prefix in the key, a sibling field with the URI, or an explicit rename you own. Four:
          decide empty versus absent versus null and put it in the interface contract. Five: keep values as strings unless a schema asserts a
          type, then assert it at the boundary; the alternative is a decimal becoming a double somewhere in a library you do not read. Six:
          refuse document type declarations and disable external entity resolution in every parser you construct, including the nested ones.
          Seven: cap expansion, entity size and input size before you accept a payload from a stranger. Eight: validate the output against a
          schema, and validate the input against the partner grammar — the <Rich text="[JSON formatter](/json-tools/formatter/)" /> and{' '}
          <Rich text="[validator](/json-tools/validator/)" /> here are for the moment the diff is not enough. Nine: count records on both sides of
          the conversion and reconcile the totals, because the loss modes above are silent and a missing array element is not an error. Ten:
          keep the original bytes for the retention window; when the reconciliation is challenged, the only useful artefact is the input.
        </P>
        <P>
          For binary payloads inside either format, remember that base64 is a convention with an alphabet, a padding rule and a line-length habit
          that differ between implementations: the{' '}
          <Rich text="[Base64 encoder and decoder](/encoders-decoders/base64/)" /> is the fastest way to find out which dialect a partner is
          actually using, and <Rich text="`xs:base64Binary`" /> in particular allows whitespace inside the value where most JSON decoders would
          reject it.
        </P>
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          <ToolLink path="/json-tools/validator/" name="JSON Validator" blurb="Check a converted document for duplicate keys, lost precision and structural surprises." />
          <ToolLink path="/use-cases/data-migration/" name="Data migration tools" blurb="Reconcile rows, types and counts on both sides of a format change." />
        </div>
        <P>
          The summary of a two-thousand-word comparison is shorter than the comparison. XML is a document model with identity, cardinality,
          assertion and canonicalisation, and it earns its complexity wherever those four are needed. JSON is a value model with seven kinds of
          value, and it earns its popularity wherever they are not. What breaks migrations is not the syntax of either: it is the projection
          between the models, the convention nobody wrote down, and the parser configuration nobody reviewed. Two more pages worth reading before
          you commit to a format:{' '}
          <Rich text="[the JSON specification guide](/learn/json/)" /> covers the grammar, the number rules and the duplicate-name behaviour in
          full, and <Rich text="[data migration](/use-cases/data-migration/)" /> walks the reconciliation you will need on the day you switch.
        </P>
      </Section>
    </>
  )
}
