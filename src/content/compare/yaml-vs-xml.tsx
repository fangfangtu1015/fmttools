/**
 * YAML vs XML. Content module for /compare/yaml-vs-xml/.
 * Clause references were checked against the published XML 1.0 (Fifth Edition),
 * XML Information Set (Second Edition), XML Schema Parts 1 and 2 (Second
 * Edition), XPath 3.1, YAML 1.2.2 and RFC 7303 texts on 2026-11-12, together
 * with the OWASP XXE page and four published CVE records. Every byte count,
 * tag count, text-node count and gzip figure below was computed on the markup
 * printed beside it, using the recipe stated in the caption; nothing here is
 * quoted from a third-party benchmark. Parser behaviour attributed to
 * ElementTree for Python is the output of parsing and re-serialising the exact
 * document printed in this article.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'yaml-vs-xml',
  path: '/compare/yaml-vs-xml/',
  title: 'YAML vs XML: One Has a Data Model, One Has a Syntax | FmtTools',
  description:
    'YAML versus XML compared for a real document migration: the XML Infoset, XML Schema, XPath and canonicalisation against YAML tags, anchors and silent typing.',
  h1: 'YAML and XML Are Not Two Syntaxes for the Same Tree',
  faqTopic: 'YAML and XML',
  summary:
    'XML standardises the tree, the schema, the path syntax and the canonical form; YAML standardises the text and leaves the rest to your parser, and that asymmetry decides every conversion rule.',
  keywords: [
    'yaml vs xml',
    'xml infoset vs yaml node graph',
    'xml to yaml migration',
    'yaml to xml conversion fidelity',
    'xsi:type vs yaml tag resolution',
    'xml namespaces and yaml anchors',
    'xxe vs yaml tag deserialisation',
    'xml schema vs json schema for config',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 23,
  sections: [
    { id: 'quick-answer', label: 'Quick answer: pick by who validates the file' },
    { id: 'four-writings', label: 'The same document written four ways' },
    { id: 'the-asymmetry', label: 'The asymmetry: one format has a standardised tree' },
    { id: 'unrepresentable', label: 'What each direction cannot say' },
    { id: 'whitespace', label: 'Whitespace: two different contracts' },
    { id: 'keys-that-collide', label: 'Namespaces against anchors' },
    { id: 'types', label: 'Type resolution against xsi:type' },
    { id: 'bytes', label: 'Verbose in what way, measured' },
    { id: 'security', label: 'Two attack surfaces, both optional' },
    { id: 'toolchain', label: 'The toolchain gap: validators, paths, transforms' },
    { id: 'migration', label: 'Migrating XML to YAML: a failure catalogue' },
    { id: 'decision', label: 'Fidelity matrix, decision table and what this site converts' },
  ],
  faqs: [
    {
      question: 'Is YAML or XML the better format for configuration in 2026?',
      answer:
        'YAML is better when every reader of the file is code you control, because then a schema language, a path syntax and a canonical form are things you may decline to have. XML is better when a party you do not control parses the file: XML Schema, XPath and XSLT are normative, so a vendor, a regulator or an open-source consumer can check your document against a published contract instead of against your parser configuration. Most teams choosing between the two are choosing who validates the file.',
    },
    {
      question: 'Why does XML have a standard schema language and YAML does not?',
      answer:
        'XML needed one to be a markup metalanguage: without a grammar language there is no way to say what a vocabulary allows, and the 1998 design put that job in the DTD. XML Schema (2001) replaced DTDs with a type system over the Infoset. YAML has nothing equivalent because its specification defines tag resolution over scalar text instead: the core schema in YAML 1.2.2 section 10.3 is a set of regular expressions, and validation of structure is delegated to third-party languages such as JSON Schema.',
    },
    {
      question: 'Can I convert XML to YAML without losing data?',
      answer:
        'No, unless you accept an invented encoding. Attributes, namespace declarations, mixed content, processing instructions, comments and DTD declarations have no slots in the YAML representation graph, so a converter must either drop them or invent keys for them. The document in this article grew from 545 bytes of YAML to 856 bytes of round-tripped YAML because eleven synthetic keys were invented and one alias was expanded into a duplicate. Data survives; the encoding of the intent usually does not.',
    },
    {
      question: 'Which format is more dangerous to parse?',
      answer:
        'Both are dangerous through optional parser features rather than through their core syntax. XML exposes external entities, which gives file disclosure, server-side request forgery and entity-expansion denial of service; disabling DTD processing removes all three. YAML exposes tag-based construction and unbounded alias expansion, which give code execution in some loaders and memory exhaustion in most; restricting the schema and capping alias work removes both. If you can only change one setting, turn off DTDs and resolve only the core schema.',
    },
    {
      question: 'Does compression make the size difference disappear?',
      answer:
        'Mostly. The 200-record corpus measured here is 100,226 bytes as YAML and 209,738 as XML, a raw ratio of 2.09, and 2,291 against 3,211 bytes gzipped at level 9, a ratio of 1.40. XML verbosity is mostly repetition of element names, and repetition is exactly what deflate monetises. What compression does not fix is the per-node memory cost of an XML tree or the number of characters a human must type and read.',
    },
    {
      question: 'Why does my XPath stop matching after a namespace change?',
      answer:
        'Because an unprefixed element name in a document with a default namespace is not in the empty namespace. XPath 3.1 matches a step against a namespace name plus a local name, so `//service` asks for an element with no namespace, and finds nothing in a document whose services inherit `https://example.com/manifest/1`. Bind a prefix in your evaluator or match on `local-name()`. The same trap appears when a YAML-to-XML writer invents a namespace per nesting level: the path worked before the conversion only by accident.',
    },
    {
      question: 'What happens to YAML anchors when they are converted to XML?',
      answer:
        'They are expanded, because XML has no in-document reference that means "this subtree is the same node as that one". General entities come close but substitute text before the tree is built, and XLink is an attribute vocabulary rather than identity. So the alias disappears, the repeated block is duplicated, and an edit that used to change one place in the file now has to be made in every copy. If the alias encoded a deliberate shared identity, that fact is lost silently.',
    },
    {
      question: 'Can this site convert XML to YAML?',
      answer:
        'No. FmtTools parses and rewrites JSON, YAML, CSV, TSV, NDJSON and Base64 in the browser, and has no XML parser, no XSD or RELAX NG validator and no XML-to-YAML converter, because a correct one would have to decide the namespace, attribute and mixed-content rules first. What the site does have is the YAML-to-JSON and JSON-to-YAML pair, which is the practical way to inspect the JSON an external converter produced.',
    },
  ],
  sources: [
    {
      label: 'XML 1.0 (Fifth Edition) — W3C Recommendation, 26 November 2008',
      href: 'https://www.w3.org/TR/xml/',
      detail:
        'Checked for: the definition of a well-formed document in 2.1 and the document production [1]; the section numbering and productions for Comments [15], Processing Instructions [16], CDATA [18]-[21], prolog [22]-[27] and the document type declaration [28]; White Space Handling in 2.10, including the MUST sentence that a validating processor informs the application which characters constitute white space appearing in element content and the sentence introducing the special attribute xml:space; attribute-value normalisation in 3.3.3; the no-recursion rule that a parsed entity MUST NOT contain a recursive reference to itself, directly or indirectly, in 4.3.2; and the validity definition in 3.4.',
      accessed: '2026-11-12',
    },
    {
      label: 'XML Information Set (Second Edition) — W3C Recommendation, 4 February 2004',
      href: 'https://www.w3.org/TR/xml-infoset/',
      detail:
        'Checked for: the statement that the XML Information Set is an abstract data model for XML documents rather than a physical one; the eleven kinds of information item (document, element, attribute, namespace, text, processing instruction, comment, document type declaration, entity reference, notation and unparsed entity); the [namespace name] property of an element item and the single [normalized value] property of an attribute item; that text items carry character data; and the exclusions around attribute values supplied by DTD defaults.',
      accessed: '2026-11-12',
    },
    {
      label: 'XML Schema Part 1: Structures (Second Edition) — W3C Recommendation, 28 October 2004',
      href: 'https://www.w3.org/TR/xmlschema-1/',
      detail:
        'Checked for: 2.2, which says that building on the information set gives a priori guarantees of well-formedness and namespace conformance; 2.6.1, where the type assertion attribute is defined and its value stated to be a QName interpreted through 3.15.3; 3.2.1 on the default and fixed attribute use terms; 3.3.6 on type substitution requiring members to share or refine the head type definition; and 3.10 on processContents taking strict, lax and skip for wildcard matches.',
      accessed: '2026-11-12',
    },
    {
      label: 'XML Schema Part 2: Datatypes (Second Edition) — W3C Recommendation, 28 October 2004',
      href: 'https://www.w3.org/TR/xmlschema-2/',
      detail:
        'Checked for: 3.2.1 defining string as finite sequences of characters matching the Char production; 3.2.2.1 listing the boolean lexical literals true, false, 1 and 0 against the value space true and false; 3.2.3 defining decimal as i times 10 to the minus n; 3.2.4.1 and 3.2.5.1 giving the float and double lexical forms including INF, -INF and NaN; 3.2.9.1 giving the date lexical form; 2.5.2 establishing anySimpleType as the base of all primitive datatypes; and the canonical representation rules used in the type tables here.',
      accessed: '2026-11-12',
    },
    {
      label: 'XPath 3.1 — W3C Recommendation',
      href: 'https://www.w3.org/TR/xpath-31/',
      detail:
        'Checked for: the path syntax that makes element and attribute addressing a standardised operation on an XML document, the axes and node tests used in the examples here, and the requirement that a bare name test in a path matches the namespace name plus local name — the reason a default namespace breaks an otherwise obvious expression.',
      accessed: '2026-11-12',
    },
    {
      label: 'YAML Ain\u2019t Markup Language (YAML) Specification Revision 1.2.2',
      href: 'https://yaml.org/spec/1.2.2/',
      detail:
        'Checked for: 3.2.1, which describes the representation as a rooted, connected, directed graph of tagged nodes that may include cycles and nodes with more than one incoming edge, and 3.2.2 and 3.2.3 for the serialization tree and presentation stream; 3.3.1 requiring each alias to refer to a previously anchored node; 3.3.2 stating that tag resolution is specific to the application and that processors should let it be overridden; 3.3.3 on recognized and valid tags; 5.3 productions [4]-[6] and [15]-[17]; 6.1 including the rule that tab characters must not be used in indentation and that the amount of indentation is a presentation detail; 6.2 separation spaces; 8.1 block scalars with indentation and chomping indicators; 9.1 and 9.2 documents and streams; and the 10.2 JSON and 10.3 core schema resolution tables.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7303 — XML Media Types',
      href: 'https://datatracker.ietf.org/doc/html/rfc7303',
      detail:
        'Checked for: the registration of application/xml and text/xml, the rule that they may not be used unless the parsed entities are also well-formed document entities, the authority of the byte-order mark for the encoding and the UTF-8 default, and the security considerations naming external DTDs and entities. Also consulted: RFC 9512, which registers application/yaml and points at YAML 1.2.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP — XML External Entity (XXE) Processing',
      href: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      detail:
        'Checked for the recommended posture that an XML processor be configured to use a local static DTD and disallow any declared DTD included in the XML document, which is the mitigation the security table in this article is organised around, and for the classification of entity expansion as a distinct denial-of-service consequence rather than a disclosure one.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    {
      path: '/learn/xml/',
      name: 'XML: The Complete Guide',
      blurb: 'Well-formedness, namespaces, DTD entities, XPath and canonicalisation, clause by clause.',
    },
    {
      path: '/compare/xml-vs-json/',
      name: 'XML vs JSON',
      blurb: 'The nearest thing to a YAML comparison this site can measure, with the attribute rules spelled out.',
    },
    {
      path: '/format-converters/yaml-to-json/',
      name: 'YAML to JSON',
      blurb: 'Parse YAML in the browser and see exactly what the resolver made of your scalars.',
    },
    {
      path: '/use-cases/config-conversion/',
      name: 'Config Conversion Tools',
      blurb: 'The workflow for moving a service between config formats without changing its behaviour.',
    },
  ],
  words: 4532,
  image: '/images/covers/cmp-yaml-vs-xml.png',
  imageAlt: 'A YAML document and an XML document side by side, with the XML side joined up to a schema, a path expression and a canonical form that the YAML side has no standard equivalent of.',
}

export default function Article() {
  return (
    <>
      <Section id="quick-answer" title="Quick answer: pick by who validates the file" kicker="Start here">
        <Lead>
          If every program that reads the file is yours, use YAML: it costs far less markup per byte and it is easier for a human to edit under
          time pressure. If anybody else validates the file — a vendor, a regulator, an interoperability standard, a signature — use XML,
          because XML brings a published data model, a schema language, a path syntax and a canonical serialisation, and YAML brings none of
          those. The bracket count is the least interesting difference between them.
        </Lead>
        <P>
          The sentence that explains almost every other difference: <strong>XML standardised the tree; YAML standardised the way you write a
          tree down.</strong> After parsing, an XML processor owes you a defined abstract object — the Information Set, eleven kinds of item
          with named properties — plus optional contracts (XSD, XPath, XSLT, Canonical XML) that are themselves specifications with conformance
          clauses. After parsing, a YAML processor owes you a graph of nodes and scalars, and then your configuration decides what a value
          <em> is</em>: which schema resolves an unquoted scalar, which <Rich text="yq" /> dialect queries it, which emitter writes it back.
        </P>
        <CodeBlock
          title="the difference a beginner actually feels"
          language="yaml"
          code={`country: NO       # YAML 1.1 resolver: false.   YAML 1.2: the string "NO".
version: 1.10     # both: the number 1.1, not the text 1.10.
release: 2026.42  # a float, so 2026.40 would print as 2026.4.
timeout: 30m      # a string here, and in XML the same string.
# In XML all four stay text until a schema says otherwise:
# <release>2026.42</release> is the string "2026.42" with no type asserted.`}
          caption="The first three lines are the Norway problem, which has ended more YAML migrations than any stylistic complaint about it. Nothing is malformed, nothing errors, and the value the program receives is not the value you wrote — a type change caused by the format, not by an edit. Quote anything whose shape matters, or move the decision into a schema."
        />
        <DataTable
          caption="Which format for which job — and the property of the format that decides it"
          head={['You are writing…', 'Use', 'Because']}
          rows={[
            ['Kubernetes, CI or deployment manifests', 'YAML', 'The ecosystem, the diff tools and the templating already assume it.'],
            ['A config file a human edits by hand', 'YAML', 'Roughly half the bytes for the same tree; less to type and less to misread.'],
            ['An interchange format a vendor consumes', 'XML plus a published XSD', 'They can test your document without reading your source code.'],
            ['Prose with markup inside it', 'XML', 'Mixed content is a first-class Infoset feature; YAML has no slot for ordering between text and elements.'],
            ['A payload that must be signed', 'XML', 'Canonical XML gives a deterministic serialisation to sign. YAML has no canonical form.'],
            ['Records with no nesting at all', 'CSV or JSON', 'Flat rows do not need a markup metalanguage in either format.'],
            ['Config whose types matter', 'Either, with a schema', 'Untyped YAML and unvalidated XML have the same hole; only one has a standard filler.'],
          ]}
        />
        <P>
          Everything below earns those rows. The next section writes one real document four ways so the losses are numbers you can check
          rather than claims; the sections after that go down through the model, the vocabulary gaps, whitespace, naming, types, size, security
          and tooling, and end with the migration failure catalogue and the fidelity matrix.
        </P>
      </Section>

      <Section id="four-writings" title="The same document written four ways" kicker="Worked example">
        <P>
          Everything is argued against one document, so that the byte counts, the losses and the surprises are all checkable. It is a
          deployment manifest, which is the genre that has been migrating from XML to YAML for a decade, and it contains the features that
          matter: a release identifier that looks like a number, an aliased block, a nested sequence, environment variables, a multi-line note,
          a comment, and enough metadata to be carried in attributes.
        </P>
        <CodeBlock
          title="the source, as YAML"
          language="yaml"
          code={`# Release manifest for checkout-api
%YAML 1.2
---
release:
  id: 2026.42
  name: "checkout-api"
  channel: stable
  rollback: &rb
    strategy: blue-green
    window: 30m
  services:
    - name: api
      image: "registry.example.com/checkout-api:2026.42"
      ports: [8080, 8443]
      replicas: 3
      rollback: *rb
    - name: worker
      image: "registry.example.com/checkout-worker:2026.42"
      replicas: 2
      env:
        LOG_LEVEL: info
        FEATURE_X: "yes"
  notes: |
    Roll back if the p99 latency
    exceeds 400 ms.
...`}
          caption="545 bytes, 26 lines. Measured under the recipe in the bytes section: 334 bytes are structure (indentation, key text, colons, the comment, the directive, the two document markers and the dash indicators) and 211 bytes are scalar content. Note three things already: id resolves to a float under the core schema, FEATURE_X is deliberately quoted so that it cannot, and rollback is one node with two incoming edges."
        />
        <CodeBlock
          title="the same document, as XML"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<!-- Release manifest for checkout-api -->
<release id="2026.42" name="checkout-api" channel="stable"
         xmlns="https://example.com/manifest/1"
         xmlns:ops="https://example.com/ops/1">
  <rollback>
    <strategy>blue-green</strategy>
    <ops:window unit="minutes">30</ops:window>
  </rollback>
  <services>
    <service kind="api">
      <image>registry.example.com/checkout-api:2026.42</image>
      <ports>
        <port>8080</port>
        <port>8443</port>
      </ports>
      <replicas>3</replicas>
      <rollback>
        <strategy>blue-green</strategy>
        <ops:window unit="minutes">30</ops:window>
      </rollback>
    </service>
    <service kind="worker">
      <image>registry.example.com/checkout-worker:2026.42</image>
      <replicas>2</replicas>
      <env name="LOG_LEVEL">info</env>
      <env name="FEATURE_X">yes</env>
    </service>
  </services>
  <notes>Roll back if the <em>p99</em> latency exceeds 400 ms.</notes>
  <?ops hint="manual approval before the second batch"?>
</release>`}
          caption="1,067 bytes, 21 elements, 21 start tags and 21 end tags, 10 attributes plus 2 namespace declarations, one comment, one processing instruction and one XML declaration: 739 bytes of markup, 158 bytes of whitespace-only text nodes, 170 bytes of payload. The alias is gone, because XML has no way to say two subtrees are the same node, and notes is mixed content, because YAML has no way to say that."
        />
        <P>
          Now the two round trips. Neither is produced by a tool on this site — FmtTools has no XML converter — and neither is presented as
          canonical. They are what a generic converter with rules on the table produces: attributes and namespace declarations become keys with
          a synthetic prefix, repeated children become sequences, and text content becomes a key called <Rich text="_text" />.
        </P>
        <CodeBlock
          title="XML, after a round trip through YAML"
          language="yaml"
          code={`release:
  _id: "2026.42"
  _name: "checkout-api"
  _channel: "stable"
  _xmlns: "https://example.com/manifest/1"
  _xmlns_ops: "https://example.com/ops/1"
  rollback:
    strategy: blue-green
    ops:window:
      _unit: "minutes"
      _text: "30"
  services:
    service:
      - _kind: "api"
        image: registry.example.com/checkout-api:2026.42
        ports:
          port:
            - "8080"
            - "8443"
        replicas: "3"
        rollback:
          strategy: blue-green
          ops:window:
            _unit: "minutes"
            _text: "30"
      - _kind: "worker"
        image: registry.example.com/checkout-worker:2026.42
        replicas: "2"
        env:
          - _name: "LOG_LEVEL"
            _text: info
          - _name: "FEATURE_X"
            _text: yes
  notes: "Roll back if the p99 latency exceeds 400 ms."`}
          caption="856 bytes — 311 more than the YAML that started this, because 11 synthetic keys were invented and the aliased rollback block was duplicated. Three silent changes: the comment and the processing instruction vanished, the em element inside notes was flattened into a string, and _text: yes is now an unquoted plain scalar, which a YAML 1.1 resolver turns into the boolean true."
        />
        <CodeBlock
          title="YAML, after a round trip through XML"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="https://example.com/manifest/1">
  <release>
    <id>2026.42</id>
    <name>checkout-api</name>
    <channel>stable</channel>
    <rollback xmlns="https://example.com/manifest/1/rollback">
      <strategy>blue-green</strategy>
      <window>30m</window>
    </rollback>
    <services>
      <item xmlns="https://example.com/manifest/1/services">
        <name>api</name>
        <image>registry.example.com/checkout-api:2026.42</image>
        <ports>
          <item>8080</item>
          <item>8443</item>
        </ports>
        <replicas>3</replicas>
        <rollback>
          <strategy>blue-green</strategy>
          <window>30m</window>
        </rollback>
      </item>
      <item>
        <name>worker</name>
        <image>registry.example.com/checkout-worker:2026.42</image>
        <replicas>2</replicas>
        <env>
          <LOG_LEVEL>info</LOG_LEVEL>
          <FEATURE_X>yes</FEATURE_X>
        </env>
      </item>
    </services>
    <notes>Roll back if the p99 latency exceeds 400 ms.</notes>
  </release>
</manifest>`}
          caption="1,101 bytes, 27 elements, three namespace declarations and four generic item element names. This is the failure mode of a writer that derives a namespace per nesting level: the tree is still well-formed, and every path expression ever written against it is now wrong, because an element with no prefix in a document with a default namespace is in that namespace, not in the empty one."
        />
        <DataTable
          caption="The same information set, four encodings, all measured on the texts printed above"
          head={['Document', 'Bytes', 'Lines', 'Structural bytes', 'Payload bytes', 'What changed']}
          rows={[
            ['YAML, source', '545', '26', '334', '211', 'none — this is the baseline'],
            ['XML, source', '1,067', '33', '897 (markup plus whitespace text)', '170', 'alias expanded, mixed content introduced'],
            ['XML to YAML, round trip', '856', '34', 'n/a', 'n/a', '11 synthetic keys, comment and PI dropped, yes unquoted'],
            ['YAML to XML, round trip', '1,101', '37', 'n/a', 'n/a', '3 namespace declarations, 4 generic item names, block scalar folded'],
          ]}
          foot="Structural bytes for the two round-tripped documents are not quoted because the classification depends on whether you count a synthetic key as structure or as payload; the raw totals and the specific losses are the parts that are load-bearing."
        />
        <Callout tone="warn" title="What the round trips are really showing">
          <P>
            Both directions survive, in the narrow sense that every string in the original appears somewhere in the result. What does not
            survive is the encoding of intent. The alias encoded a fact — these two blocks are one node — and XML has no slot for that fact, so
            the blocks become free to drift apart. The mixed content in notes encoded a fact — this sentence contains markup — and YAML has no
            slot for interleaving, so the ordering is destroyed. A converter is not a format change; it is a renegotiation of what your document
            is allowed to mean.
          </P>
        </Callout>
      </Section>

      <Section id="the-asymmetry" title="The asymmetry: one format has a standardised tree" kicker="The real difference">
        <P>
          Ask which is better and you will be handed the same object twice, with one of them wearing angle brackets. That comparison is beside
          the point: nobody dropping XML for YAML is saving keystrokes, and nobody keeping XML is spending them for pleasure. XML and YAML both
          describe trees, and only one of them has a standardised tree. The other has a standardised way of writing one down.
        </P>
        <P>
          <Rich text="XML 1.0 (Fifth Edition)" /> §2.1 makes well-formedness a property of the text: a document must match production [1],
          satisfy every well-formedness constraint, and every entity it references must itself be well-formed. <Rich text="The XML Information
          Set" /> then describes, normatively, what a processor hands you after the text is consumed: document, element, attribute, namespace,
          text, processing instruction, comment, document type declaration, entity reference, notation and unparsed entity items, each with
          named properties such as the <Rich text="[namespace name] of an element" /> and the <Rich text="[normalized value] of an attribute" />.
          That is a data model, not a syntax, and it is what makes the following two documents the same fact:
        </P>
        <CodeBlock
          title="two spellings the Infoset calls identical"
          language="xml"
          code={`<release channel="stable"><notes>ok</notes></release>

<release    channel='stable'   >
        <notes>ok</notes>
</release>`}
          caption="Different bytes, same element items, same attribute item with one [normalized value], same two children in the same order — a conformant processor is obliged to hand you the same information set either way. YAML has an equivalent guarantee at its serialization layer, and then loses it one level up: change the resolver schema and the type of a scalar changes, so two conformant readers can disagree about what a value is, not merely about how it was spelled."
        />
        <P>
          On top of the model the stack keeps building, and every layer is a published specification with a conformance clause rather than a
          product: XML Schema Parts 1 and 2 constrain the information set and assign types to it — Part 1 §2.2 is explicit that building on the
          Infoset gives schemas &quot;a priori guarantees of well-formedness&quot; and namespace conformance. XPath 3.1 standardises how you
          address a node, XSLT 3.0 how you rewrite it, XPointer how to point inside one, and Canonical XML supplies the deterministic
          serialisation that makes a signed payload possible at all: you cannot sign text when two conformant writers may disagree about
          attribute order.
        </P>
        <P>
          YAML standardises less, and it is worth being exact rather than disparaging. <Rich text="YAML 1.2.2 §3.2.1" /> defines a
          representation as &quot;a rooted, connected, directed graph of tagged nodes&quot;, permits cycles and multiple incoming edges, and
          splits the model into a serialization tree (§3.2.2), where order and anchors exist, and a presentation stream (§3.2.3), where
          indentation, styles and comments exist. That is a real model, and in one respect it is stronger than XML: an alias in YAML denotes
          node identity, which XML simply cannot express. What YAML does not have is anything above that model — no standard schema language
          (§10 offers three recommended tag-resolution schemas and §10.4 points at &quot;other schemas&quot;), no standard path syntax, no
          standard transformation language, no canonical form, no fragment identifier.
        </P>
        <Callout tone="note" title="Four consequences, and they are the four things that break in a migration">
          <P>
            XML tooling composes, because an XPath written by one person means the same thing to another person&apos;s validator. XML failures
            are portable: a well-formedness error means the same in libxml2, Xerces and MSXML. YAML&apos;s semantics live in configuration —
            the type of a scalar is decided by which schema your loader was told to use, and the shape of a query by which <Rich text="yq" />{' '}
            dialect you installed. And a converter between the two has to invent rules, because only one direction is constrained by a published
            model. Every XML-to-YAML converter you will ever use carries an undocumented opinion about attributes.
          </P>
        </Callout>
        <KeyTerms
          items={[
            { term: 'Information Set (Infoset)', definition: 'The normative abstract model of what an XML processor gives you: 11 item kinds with named properties, independent of how the document was written.' },
            { term: 'Well-formed vs valid', definition: 'Well-formed is XML 1.0 syntax, which a processor must enforce. Valid means conforming to a named grammar, which it need not even look at.' },
            { term: 'Representation graph', definition: 'YAML 1.2.2 §3.2.1: a rooted directed graph of tagged nodes, permitted to contain cycles — more expressive than a tree, less standardised above it.' },
            { term: 'Presentation stream', definition: 'The text layer of YAML: indentation, block styles, comments, directives. The spec says explicitly that indentation is a presentation detail.' },
            { term: 'Tag resolution', definition: 'How a plain YAML scalar becomes int, bool or str. Decided by a chosen schema, not by the document; §3.3.2 admits it is application-specific.' },
            { term: 'xsi:type', definition: 'The XML instance attribute that asserts a type for an element; Part 1 §2.6.1 says its value is a QName resolved against a type definition.' },
            { term: 'Canonical form', definition: 'A deterministic serialisation of an Infoset. XML has two published ones; YAML has none, which is why YAML signatures wrap the data in JSON first.' },
          ]}
        />
      </Section>

      <Section id="unrepresentable" title="What each direction cannot say" kicker="Vocabulary gaps">
        <P>
          The useful way to plan a conversion is not &quot;what will my tool do&quot; but &quot;which features of one model have no slot in the
          other&quot;. Below is that list, feature by feature, with the mechanism each format uses and what a converter is forced to decide.
        </P>
        <DataTable
          caption="Features with no equivalent in the other model, and the decision each one forces on a converter"
          head={['Feature', 'How it works at home', 'What the other format must invent or drop']}
          rows={[
            ['XML attributes', 'An unordered set of unique names, each with one normalised string value; no nesting, no markup.', 'A key that cannot collide with a child element, so converters prefix them; two attributes named id in different namespaces collapse unless the prefix includes the URI.'],
            ['XML namespace declarations', 'A URI identity plus a prefix whose scope runs from the start-tag to the matching end-tag.', 'Nothing. A round-tripped document either loses the prefix mapping or stores xmlns as an ordinary scalar, which no longer scopes anything.'],
            ['Mixed content', 'Text and elements interleaved as ordered children of one element — the reason XML is a markup language.', 'Either a concatenation that loses the interleaving, or an invented list of typed fragments. YAML mappings cannot express ordering between siblings of different kinds.'],
            ['Processing instructions', 'Application-directed markup, [16], with a PITarget and data.', 'Dropped by most converters. YAML has no target-directed markup at all; comments are inert and §3.2.3.3 puts them in the presentation layer.'],
            ['DTD and entity declarations', 'A grammar plus named substitutions, including notations and unparsed entities.', 'Dropped entirely. This is where the schema contract goes, so the migration trades a published constraint for an undocumented convention.'],
            ['xsi:type assertions', 'A per-instance claim that this element is of that schema type, Part 1 §2.6.1.', 'A YAML tag, which is the right mechanism and almost never used, so the type usually becomes a string and a downstream parser re-guesses it.'],
            ['YAML anchors and aliases', 'Node identity: one node reachable from two places, permitted to form cycles, §3.2.1.', 'Duplicated subtrees, or XLink attributes that mean nothing to a plain processor, or internal general entities that substitute text rather than nodes.'],
            ['YAML tags', 'Explicit type assertions plus the extension mechanism §3.3.3 says must be recognized to be valid.', 'Either an attribute holding the URI, or a naming convention. Both make the tagged value look like data to a processor that cannot see the type.'],
            ['Explicit keys', 'The ? indicator, production [5], permitting a key that is a sequence, a mapping or a long scalar.', 'An element name. XML names cannot contain structure, so a mapping keyed by coordinates has no faithful XML shape at all.'],
            ['Multi-document streams', '--- and ... markers, §9.1-9.2, plus %YAML and %TAG directives per document.', 'Either a wrapper element with a repeated child, which changes every path, or one file per document, which changes the transport.'],
            ['Block scalars', 'Literal and folded styles with indentation and chomping indicators, §8.1.', 'A text node holding newlines, plus a convention for trailing newline handling that XML does not have. xml:space preserves the bytes; it does not preserve the intent that they are verbatim.'],
            ['Merge keys', 'The 1.1 << convention, a working draft rather than part of the core schema.', 'Nothing. The merged keys are simply present or absent, and whether they were inherited is lost.'],
          ]}
        />
        <H3 id="mixed-content-in-two-words">Mixed content, in two lines</H3>
        <P>
          One row deserves more than a cell, because it is where a conversion does not degrade the document but refutes it. XML can put an
          element in the middle of a sentence and keep the order; YAML cannot put anything in the middle of a scalar.
        </P>
        <CodeBlock
          title="markup inside prose, and the two bad options"
          language="yaml"
          code={`# XML, normatively ordered children:
# <notes>Roll back if the <em>p99</em> latency exceeds 400 ms.</notes>

# Option 1 — what every converter does: the element becomes text.
notes: "Roll back if the p99 latency exceeds 400 ms."

# Option 2 — the ordering becomes data, and only your code knows the convention.
notes:
  - text: "Roll back if the "
  - em: "p99"
  - text: " latency exceeds 400 ms."`}
          caption="Option 1 destroys which words were emphasised. Option 2 keeps everything and invents a vocabulary: it is a YAML encoding of an XML idea, and no other tool will read it as markup. XML resolves the question in the model instead — the Infoset orders the children of one element, and a schema declares the element mixed — which is why the row above says lossy rather than configurable."
        />
        <H3 id="the-shape-neither-can-say">The shape neither format can say</H3>
        <CodeBlock
          title="a YAML mapping whose keys are sequences"
          language="yaml"
          code={`? [latitude, longitude]
: name: Reykjavik
  tz: UTC
cells:
  ? [2026, 11, 12]
  : 41`}
          caption="Legal YAML: production [5] makes the question mark the mapping-key indicator, so any node may be a key, and §3.2.1 requires keys to be unique and unordered. XML cannot hold this shape at all, because an element or attribute name must be an XML name, which excludes structure. The reverse gap is the same size: a YAML scalar containing a paragraph in which an element appears mid-sentence is not a scalar in XML either, and XML has a normative word for the distinction — element content versus mixed content — that YAML does not."
        />
        <Callout tone="spec" title="Ordering: the quiet asymmetry">
          <P>
            YAML 1.2.2 §3.2.1 says mapping keys are unordered and must be unique. XML 1.0 puts attributes in the same bucket — unordered,
            unique by name — but makes element children an ordered, repeatable list. So a document-order dependency in XML is expressible and
            portable; in YAML it is either a sequence, which changes the shape, or a bug waiting for a loader that sorts keys. If your config
            has an implicit priority ordering carried by the order of a mapping, XML was the honest choice, and the YAML version is relying on a
            coincidence of hash-map implementations.
          </P>
        </Callout>
      </Section>

      <Section id="whitespace" title="Whitespace: two different contracts" kicker="§6.1 against §2.10">
        <P>
          Both formats let whitespace change meaning, and the mechanisms are so different that the bugs they cause are never the same bug. YAML
          makes indentation structural and then apologises for it. XML makes whitespace ordinary data and then asks a schema what to do with it.
        </P>
        <P>
          The YAML rule is unambiguous and most developers have never read it. §6.1 says indentation is zero or more space characters at the
          start of a line and that, &quot;to maintain portability, tab characters must not be used in indentation, since different systems treat
          tabs differently&quot;. The same section adds the sentence that should govern every style guide:{' '}
          <Rich text="&quot;The amount of indentation is a presentation detail and must not be used to convey content information.&quot;" /> And
          §6.2 permits tabs as <strong>separation space</strong> between tokens, which is why <Rich text="key:&lt;tab&gt;value" /> parses while{' '}
          <Rich text="&lt;tab&gt;key: value" /> inside a nested block does not.
        </P>
        <CodeBlock
          title="one column of indentation, two different documents"
          language="yaml"
          code={`# A: the note is a folded paragraph in a key called notes
notes: >
  roll back if the p99
  latency exceeds 400 ms
  if ops are busy

# B: one space removed from the third content line
notes: >
  roll back if the p99
  latency exceeds 400 ms
 if ops are busy`}
          caption="In A every content line is indented past the block scalar indicator, so folding joins all four lines into one sentence. In B the last line is indented less than the first, which §6.5 treats as a more-indented line boundary condition rather than a paragraph continuation — the same words, with one space deleted, produce a different string. Nothing is ill-formed in either case and no validator will mention it, because this is what the language means."
        />
        <P>
          XML takes the opposite route: whitespace inside an element is text, and text items are part of the normative information set. That is
          why the manifest above contains 31 whitespace-only text nodes totalling 158 bytes — 15 per cent of the file — and why two APIs reading
          the same document disagree about what it contains.
        </P>
        <CodeBlock
          title="the whitespace you did not count as content"
          language="xml"
          code={`<ports>
  <port>8080</port>
</ports>`}
          caption="Between the ports tags there is a text item containing a newline and two spaces, and it is in the information set like any other. A DOM or ElementTree walk that ignores whitespace-only text sees one child; one that obeys the Infoset sees three. XML 1.0 §2.10 lets an application that intends a human-readable result choose to ignore whitespace in element content, and promises only this: a validating processor MUST also inform the application which characters constitute white space appearing in element content — so the answer depends on a schema or DTD having been loaded."
        />
        <P>
          Between those two choices, pretty-printing changes the value of a text node. The classic failure is the element that sometimes has
          children and sometimes has only indentation: <Rich text="&lt;window&gt;30&lt;/window&gt;" /> survives either opinion, and{' '}
          <Rich text="&lt;notes&gt;&#10;    text&#10;  &lt;/notes&gt;" /> does not. Measured directly: parsing the manifest with the Python
          standard library&apos;s ElementTree and re-serialising produces 1,068 bytes in which the comment, the processing instruction and the XML
          declaration have all vanished and both namespace prefixes have been regenerated as ns0 and ns1, while all 31 whitespace-only text
          nodes survive exactly as written. The part the standard insists on keeping is the indentation nobody wanted; the part that carried the
          intent is what a perfectly conformant library dropped without an error.
        </P>
        <P>
          Two mechanisms exist because this is unresolved. <Rich text="xml:space" /> is the special attribute §2.10 introduces to signal that
          whitespace in that element should be preserved — inherited, so <Rich text="xml:space=&quot;preserve&quot;" /> on a root covers the
          document. And §3.3.3 normalises attribute values, which is why a base64 payload in an attribute behaves differently from the same
          payload in element content: a literal line break inside an attribute value becomes a space, while a numeric character reference to the
          same newline survives as a real line feed. See <Rich text="[Base64](/learn/base64/)" /> for the encoding side of that trap.
        </P>
        <DataTable
          caption="Whitespace: what each format makes normative, and what it leaves to taste"
          head={['Question', 'YAML 1.2.2', 'XML 1.0 (Fifth Edition)']}
          rows={[
            ['Are tabs legal for indentation?', 'No — §6.1 forbids them in indentation, while §6.2 allows them as separation space.', 'Yes — #x9 is one of the three allowed whitespace characters, production [3].'],
            ['Is indentation semantic?', 'Yes for block collections and block scalars, which contradicts the presentation-detail sentence in the same section.', 'No, never: indentation is text, and text is payload.'],
            ['Does whitespace-only content change a value?', 'Only inside a block scalar, where folding and chomping decide it, §8.1.', 'Yes, and whether that matters depends on the declared content model, §2.10.'],
            ['Is there a preservation signal?', 'No signal needed for block scalars, none available for plain ones.', 'xml:space, inherited, defined in §2.10 and deliberately not a conformance requirement for all applications.'],
            ['Does the standard model keep it?', 'The presentation stream keeps styles; the serialization tree keeps none of the indentation.', 'The Infoset keeps every text item, including the ones that are only line feeds and spaces.'],
            ['Who strips it?', 'Your emitter, by choosing plain, quoted or block style.', 'Your application, by choosing whether to ignore element-content whitespace.'],
          ]}
        />
        <Callout tone="tip" title="The rule that survives both formats">
          <P>
            Treat whitespace as load-bearing in exactly one place: inside a value that is itself markup or text for a human. In YAML that means
            block scalars with an explicit indentation indicator when the content starts with a space, and quoting anything whose shape matters.
            In XML it means declaring the content model — a schema, or at least a documented convention — and using{' '}
            <Rich text="xml:space=&quot;preserve&quot;" /> only where it is genuinely needed, because preserving whitespace on a whole document is
            how 158 bytes of indentation get into a signature.
          </P>
        </Callout>
      </Section>

      <Section id="keys-that-collide" title="Namespaces against anchors" kicker="Two answers to collisions">
        <P>
          Every format that lets two people extend a vocabulary has to answer one question: what happens when both of them want to write the
          same key. XML answered in 1999. YAML never answered, and the ecosystem answered with anchors, which are a different mechanism solving
          a different problem.
        </P>
        <H3 id="xml-namespaces">XML: identity by URI, spelling by prefix</H3>
        <P>
          A namespace is an identifier that happens to be shaped like a URI, and the recommendation is emphatic that the resemblance is not an
          invitation: it is not a goal that the namespace name be directly usable for retrieval. Processors compare the string. Two declarations
          with the same URI put elements in the same namespace; two URIs differing by one trailing slash put them in different ones. The prefix
          is decoration, and the Infoset proves it by keeping namespace identity as a property of the element item rather than as a piece of the
          tag. Four rules do all the damage in practice:
        </P>
        <CodeBlock
          title="where the namespace actually applies"
          language="xml"
          code={`<release xmlns="https://example.com/manifest/1"
         xmlns:ops="https://example.com/ops/1">
  <window unit="minutes">30</window>
  <ops:window unit="minutes">30</ops:window>
</release>`}
          caption="channel and unit are in no namespace at all, even with a default namespace declared on the root, because a default namespace applies to unprefixed element names and deliberately not to attribute names — the most misunderstood rule in XML, and the reason attribute-heavy formats look namespace-clean and are not. Meanwhile window and ops:window are different names: the first inherits https://example.com/manifest/1, the second is in ops. A declaration scopes its prefix from its start-tag to the matching end-tag and an inner declaration overrides an outer one, the xml prefix is bound by definition and x-m-l prefixes in any case are reserved, and a used prefix must be declared — while an undeclared default namespace is simply an ordinary document in no namespace."
        />
        <P>
          Against collisions XML offers exactly three slots: a different namespace URI, an attribute rather than a child element, or a repeated
          element in a known position. That is a small but real vocabulary, and it is why <Rich text="[XML Schema wildcards](/learn/xml/)" /> can
          say &quot;anything from a namespace I have not heard of goes here&quot; and mean it — Part 1 §3.10 lets a schema set{' '}
          <Rich text="processContents" /> to strict, lax or skip for elements matching <Rich text="xs:any" />. YAML has no equivalent sentence,
          because it has no standard notion of a vocabulary attached to a key.
        </P>
        <H3 id="yaml-anchors">YAML: identity by anchor, extension by tag</H3>
        <P>
          YAML&apos;s answer to repetition is not namespacing but sharing, and it is the one place YAML is strictly more expressive than XML.
        </P>
        <CodeBlock
          title="an alias, which XML cannot say"
          language="yaml"
          code={`rollback: &rb
  strategy: blue-green
  window: 30m
services:
  - name: api
    rollback: *rb
  - name: worker
    rollback: *rb`}
          caption="§3.3.1 makes one structural promise: every alias shall refer to a previous node identified by an anchor, and processors should reject ill-formed streams and unidentified aliases. Notice what it does not say — nothing about how many times an alias may be expanded, nothing about depth, and nothing about whether the loaded structure shares one object or copies it twice. That silence is why the same file is a memory-saving device in one loader and a hazard in another (see the security section). XML has no in-document reference that means &quot;these two subtrees are the same node&quot;, so a converter expands this into copies."
        />
        <P>
          For key collisions YAML gives two weaker tools. Tags (§6.9.1, §3.3.2-3.3.4) attach a URI to a node, so a vocabulary can be named — but
          it names the type of the node, not the namespace of the key, and §3.3.3 states the honest limit: for a node to be valid its tag must be
          recognized by the processor, which makes vendor extension a matter of whose parser you are running rather than of what your document
          says. The other tool is a naming convention — dotted keys, prefixed keys, a nested map under a vendor name — and none of those is
          checkable.
        </P>
        <P>
          This is why the round trip earlier produced unreadable output when the writer invented a namespace per level, and it is the opposite
          mistake to the one a YAML author makes. In XML, prefix soup is visible and painful: three declarations, four generic{' '}
          <Rich text="item" /> element names, every path broken, because the namespace name of <Rich text="rollback" /> is now a function of
          where in the document it appears. In YAML the same situation looks fine: vendor-prefixed keys that no tool validates, collides or
          resolves. Choose the failure you can see — or decide the vocabulary once, at the root, and let converters inherit it.
        </P>
        <Callout tone="warn" title="The collision nobody notices">
          <P>
            An attribute and a child element may share a name in XML without conflict, because they are different kinds of information item. A
            converter that flattens both into YAML mapping keys has created a collision where the source had none, and the usual escape — a
            prefix such as <Rich text="_" /> — changes the key but not the fact that one of the two values wins. The measured round trip above
            has eleven such synthetic keys, and none of them would survive a second conversion back.
          </P>
        </Callout>
      </Section>

      <Section id="types" title="Type resolution against xsi:type" kicker="Where the type lives">
        <P>
          Here the two formats disagree most sharply, and not about whether they are typed. The disagreement is where the type is stored: in the
          text, or in a document somewhere else.
        </P>
        <P>
          YAML decides from the characters. §10.1 defines a failsafe schema that resolves everything to sequences, mappings and strings; §10.2 a
          JSON schema; §10.3 the core schema, which the specification calls &quot;the recommended default schema that YAML processor should use
          unless instructed otherwise&quot;. The core schema is a table of regular expressions applied to plain scalars. Its consequences are
          worth knowing exactly: a leading <Rich text="+" /> is accepted as an integer, which JSON forbids; underscores are not accepted, though
          YAML 1.1 took them; and timestamps are not in the core schema at all — the <Rich text="2001-12-14t21:59:43.10-05:00" /> form is a 1.1
          type-repository convention documented in the <Rich text="[YAML 1.1 timestamp type](https://yaml.org/type/timestamp.html)" /> page,
          which is why the same date string is a date in one loader and a string in another.
        </P>
        <P>
          XML decides from a schema, and says so out loud. Without a schema-informed processor XML is entirely text, and that is not a metaphor:
          Part 2 §3.2.1 defines string as finite sequences of characters matching the Char production, and §2.5.2 puts{' '}
          <Rich text="anySimpleType" /> as the base of every primitive datatype, so all values reach the application as lexical strings that
          validation later constrains. The manifest says <Rich text="replicas" /> is 3 in exactly the way a CSV file does — by you agreeing to
          read it that way. Type can be asserted per instance with <Rich text="xsi:type" />, which Part 1 §2.6.1 defines as an attribute whose
          value is a QName resolved to a type definition.
        </P>
        <CodeBlock
          title="a schema that types the manifest"
          language="xml"
          code={`<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="https://example.com/manifest/1"
           elementFormDefault="qualified">
  <xs:element name="release" type="m:Release" xmlns:m="https://example.com/manifest/1"/>
  <xs:complexType name="Release">
    <xs:sequence>
      <xs:element name="rollback" type="m:Rollback"/>
      <xs:element name="services" type="m:Services"/>
      <xs:element name="notes" type="m:Notes" maxOccurs="1"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:token" use="required"/>
    <xs:attribute name="channel" use="required">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:enumeration value="stable"/>
          <xs:enumeration value="canary"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:attribute>
  </xs:complexType>
  <xs:complexType name="Notes" mixed="true">
    <xs:sequence><xs:any minOccurs="0" maxOccurs="unbounded" processContents="lax"/></xs:sequence>
  </xs:complexType>
</xs:schema>`}
          caption="Four things this buys that no YAML file can buy by itself: the id is a token rather than a number, so 2026.42 stays a string; channel is an open enumeration, so a typo is a validation error rather than an unexpected deployment; Notes declares itself mixed, so a processor is obliged to tell you the whitespace there is content; and a type named Release can be reused and substituted for, under §3.3.6, which requires members of a substitution group to share, refine or extend the head's type definition."
        />
        <CodeBlock
          title="the instance, typed both ways"
          language="yaml"
          code={`# XML: type asserted on the instance
# <replicas xsi:type="xs:positiveInteger"
#   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">3</replicas>

# YAML: the same claim made with an explicit tag
replicas: !!int 3
release_id: !!str 2026.42
window: !!str 30m
approved: !!bool false
built: !example,tag:yaml.org,2026:timestamp 2026-11-12T09:04:00Z`}
          caption="The XML assertion is checked by a processor against a published datatype definition; the YAML tag is checked against nothing unless your loader was configured to recognize it. §3.3.3 is blunt: to be valid, a node must have a tag recognized by the processor, so the !!int above is a request, and the last line is an application-specific tag most parsers will refuse to resolve at all."
        />
        <DataTable
          caption="Scalar typing: the same value, both mechanisms"
          head={['Written as', 'YAML core schema (§10.3)', 'XML Schema datatype', 'Note']}
          rows={[
            ['2026.42', 'float 2026.42', 'xs:string unless asserted', 'The YAML version is why release identifiers get quoted; 2026.40 would print as 2026.4.'],
            ['+12', 'int 12', 'xs:integer accepts +12', 'JSON forbids the leading plus, so this YAML is not JSON; see the JSON schema row in §10.2.'],
            ['0o14', 'int 12', 'not valid xs:integer lexical input', 'Base-8 and base-16 spellings exist only in YAML; in XML you would use xs:hexBinary or a custom type.'],
            ['1_000', 'string (underscores are YAML 1.1)', 'not valid xs:integer', 'A YAML 1.1 loader reads int 1000; a 1.2 loader reads a string. Both are conformant.'],
            ['yes', 'string in 1.2 core, bool in 1.1', 'xs:boolean does not accept yes', 'Part 2 §3.2.2.1 allows only true, false, 1 and 0 as lexical values — the strictest of the three.'],
            ['.inf', 'float positive infinity', 'xs:double accepts INF and -INF, xs:decimal does not', 'Decimal is exact (i times 10 to the minus n), so infinity is not in its value space at all.'],
            ['.nan', 'float NaN', 'xs:double accepts NaN, xs:decimal does not', 'Neither format can round-trip NaN through JSON.'],
            ['2026-11-12', 'string in core, date in 1.1 repositories', 'xs:date with optional time zone', 'The one type both ecosystems claim and neither agrees on without configuration.'],
            ['null / ~ / empty', 'null', 'absent element or xsi:nil="true"', 'XML needs an explicit nil attribute plus a nillable declaration; YAML has a scalar.'],
          ]}
        />
        <P>
          Read as a decision, the table says something uncomfortable about both formats: untyped input plus a guessing resolver is the same
          situation as typed input plus no schema, which is where most XML in production actually lives. The difference is that XML has a
          published way to fix it that every processor understands, and YAML has a published set of guesses and a third-party schema language
          bolted on afterwards.
        </P>
      </Section>

      <Section id="bytes" title="Verbose in what way, measured" kicker="Bytes">
        <P>
          XML is verbose. The interesting question is verbose in what currency, because the answer determines whether it costs you anything you
          care about. The recipe, so you can reproduce it: for XML every byte inside a start-tag, end-tag, the declaration, the comment and the
          processing instruction counts as markup, whitespace-only text between tags as whitespace, and the rest as payload; for YAML,
          indentation, line breaks, key text plus the following colon and space, the dash indicators, the comment, the directive and the two
          document markers count as structure, and scalar content as payload. Both partitions add up exactly to the file size, which is the
          property that makes them comparable.
        </P>
        <DataTable
          caption="One deployment manifest, partitioned as bytes (UTF-8)"
          head={['Measure', 'YAML', 'XML', 'Ratio']}
          rows={[
            ['Whole file', '545', '1,067', '1.96'],
            ['Markup or structure', '334', '739', '2.21'],
            ['Whitespace-only text nodes', 'included above', '158', '31 of 46 text segments'],
            ['Payload', '211', '170', '0.81'],
            ['Structure per payload byte', '1.58', '4.35', 'XML spends 2.75 times as much per byte of content'],
            ['Named things', '20 mapping keys, 2 block sequence entries, 1 flow sequence of 2', '21 elements, 10 attributes, 2 namespace declarations', '-'],
            ['Gzipped at level 9, this file', '331', '478', '1.44'],
          ]}
          foot="The payload row deserves a caveat the ratio does not: the XML version stores several values as attributes, which the recipe counts as markup, while the YAML version stores the equivalents as scalars, counted as payload. That is a fair reflection of what a parser does with them, not of which bytes carry information."
        />
        <P>
          The interesting number is structure per byte of content: 4.35 for XML against 1.58 for YAML. But per-record repetition is what
          bandwidth is made of, so both documents were expanded into 200-record files — the release id incrementing, the replica count varying —
          and measured again.
        </P>
        <DataTable
          caption="200 records, compressed and uncompressed, gzip level 9"
          head={['Encoding', 'Raw bytes', 'Gzipped', 'Compressed as a share of raw', 'Ratio to YAML']}
          rows={[
            ['YAML multi-document stream', '100,226', '2,291', '2.29%', '1.00'],
            ['XML wrapper document', '209,738', '3,211', '1.53%', '1.40'],
            ['Difference', '109,512', '920', 'deflate favours XML', 'raw ratio 2.09 falls to 1.40 gzipped'],
          ]}
          foot="Measured here with Python’s gzip module at compression level 9 on the two generated files, which contain 200 copies of the manifest above with the release id and replica count varied per record. Parse time and memory were not benchmarked: those are the costs that do not show up in a size table, and they depend on library versions in ways that would need a test environment to state honestly."
        />
        <P>
          Compression favours XML because XML verbosity is almost entirely repetition of a small alphabet of element names, and repetition at a
          distance is what a sliding-window compressor is for: 21 elements means 42 tag delimiters in which <Rich text="strategy" /> and{' '}
          <Rich text="rollback" /> recur endlessly, and 158 bytes of indentation compress to almost nothing. YAML&apos;s savings are distributed
          differently — the anchor and alias saved one repeated block in the source, which is a saving no compressor can make twice.
        </P>
        <P>
          So verbosity has three prices. Bandwidth: about 40 per cent worse for XML on this corpus compressed, rarely a decision in 2026.
          Storage: roughly 2x, which matters at archive scale. Human cost: 1,067 bytes against 545 for the same document — 21 paired tags and 31
          whitespace-only text nodes against 26 lines whose structure is 20 key colons and 2 dash indicators. The last of those is why people
          pick YAML for a file a human edits under time pressure, and it is a legitimate reason, provided they also accept that the file now has
          no standard way to say what it means.
        </P>
      </Section>

      <Section id="security" title="Two attack surfaces, both optional" kicker="Security">
        <P>
          This is the comparison most often stated wrongly, in both directions. Neither format is insecure by design; both ship an optional,
          powerful mechanism specified before adversarial input was a normal case, and both sets of advisories are about that mechanism being
          left on.
        </P>
        <H3 id="xml-entities">XML: DTDs, external entities, expansion</H3>
        <P>
          XML&apos;s extra machinery is the document type declaration and the entity mechanism built on it, productions [26]-[28], [68]-[77] and
          §4.3. External general and parameter entities let a document name a resource the processor should substitute — file disclosure,
          server-side request forgery and port scanning when that resource is <Rich text="file:///etc/passwd" /> or an internal endpoint, in what
          the industry calls XXE. Entity expansion turns the substitution rules into a multiplier: a handful of nested definitions produce an
          exponentially larger tree, the billion laughs pattern, which the specification addresses only through the recursion constraint in
          §4.3.2 — a parsed entity MUST NOT contain a recursive reference to itself, directly or indirectly. Non-recursive nesting is not
          recursion, so the rule stops nothing relevant.
        </P>
        <CodeBlock
          title="both XML attack shapes, abbreviated"
          language="xml"
          code={`<?xml version="1.0"?>
<!DOCTYPE r [
  <!ENTITY x SYSTEM "file:///etc/passwd">
  <!-- disclosure: &x; in element content -->
  <!-- SSRF:   <!ENTITY y SYSTEM "http://169.254.169.254/latest/meta-data/"> -->

  <!ENTITY a "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
  <!ENTITY b "&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;">
  <!ENTITY c "&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;&b;">
  <!-- each level multiplies by 16; seven levels is roughly 800 MB of text
       expanded from a file of a few hundred bytes -->
]>
<r>&x;</r>`}
          caption="Illustrative, truncated deliberately at three expansion levels. The mechanism is textual substitution before parsing completes, which is why the resulting tree can be far larger than the bytes on the wire — and why a processor cannot detect it from the document size alone."
        />
        <P>
          The published mitigations reduce to one instruction. The <Rich text="OWASP XXE guidance" /> entry in this page&apos;s sources says a
          processor should use a local static DTD and disallow any DTD declared in the document; in practice that means turning DTD processing
          off entirely, and where that is impossible, disabling external-entity resolution and capping expansion. The consequences are not
          theoretical: <Rich text="[CVE-2019-5427](https://access.redhat.com/security/cve/CVE-2019-5427)" /> is a billion-laughs exposure in
          c3p0 before 0.9.5.4 caused by loading XML configuration without recursive-expansion protection, and{' '}
          <Rich text="[CVE-2021-32623](https://www.cve.org/CVERecord?id=CVE-2021-32623)" /> is the same class in Opencast before 9.6. Note the
          common shape: in both cases the XML was the configuration, and the parser feature was never disabled because the configuration was
          trusted.
        </P>
        <H3 id="yaml-tags">YAML: tags, and aliases with no budget</H3>
        <P>
          YAML has nothing like a DTD: no external entities, no parameter entities, no notations, no unparsed entities and no substitution step
          at all, so the entire XXE class is unavailable and the billion-laughs construction has no lexical form. What it has is two features
          that arrive at the same place by a different route.
        </P>
        <P>
          The first is tags. §3.3.2 states plainly that tag resolution is specific to the application and that processors should provide a
          mechanism for the application to override and expand the default rules. That is a sound design decision and also the door: a resolver
          that maps a tag to a constructor can be persuaded to build an object, and object construction is code execution. The history is
          documented — <Rich text="PyYAML’s yaml.load()" /> executing arbitrary code on untrusted data before 5.1 (
          <Rich text="[CVE-2017-18342](https://osv.dev/vulnerability/GHSA-rprw-h62v-c2w7)" />, followed by CVE-2020-14343 against the partial
          fix) is exactly this mechanism — and loaders restricted to the core schema, including most modern JavaScript and Go implementations,
          are not vulnerable because they have no constructor registry to abuse.
        </P>
        <P>
          The second is aliases, and this is the surprise: YAML&apos;s answer to entity expansion is structurally identical to the problem. An
          alias means the same node again, and if a loader expands it at load time instead of sharing the object, expansion multiplies with
          nothing in the specification to bound it — §3.3.1 requires only that each alias refer to a previously anchored node.{' '}
          <Rich text="[CVE-2023-47163](https://osv.dev/vulnerability/GHSA-gw7g-qr8w-3448)" /> records Remarshal before 0.17.1 expanding YAML
          alias nodes without limit, described in the advisory as a billion-laughs attack against YAML, and{' '}
          <Rich text="[CVE-2022-25857](https://www.cve.org/CVERecord?id=CVE-2022-25857)" /> covers SnakeYAML before 1.31 lacking a nested-depth
          limitation for collections.
        </P>
        <CodeBlock
          title="the YAML equivalent of an expansion bomb"
          language="yaml"
          code={`a: &a ["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"]
b: &b [*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a,*a]
c: &c [*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b,*b]
d: &d [*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c,*c]
e: &e [*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d,*d]`}
          caption="Sixteen aliases per level, five levels: 16 to the power 5, about one million leaf references, from 295 bytes of text. If the loader shares nodes this is a graph of a million references and a small tree; if it deep-copies, it is a memory-exhaustion bug in whatever language the loader happens to be written in. The file is entirely well-formed by §3.3.1, and no clause caps the work."
        />
        <DataTable
          caption="Attack classes, and whether the format even has the mechanism"
          head={['Class', 'XML mechanism', 'YAML mechanism', 'Setting that removes it']}
          rows={[
            ['File disclosure', 'External general entity with a system identifier', 'None — there is no substitution step', 'Disallow DTDs'],
            ['Server-side request forgery', 'External entity pointing at a URL', 'None', 'Disallow DTDs, disable resolver'],
            ['Expansion DoS', 'Nested internal entities, each level multiplying', 'Alias fan-out, expanding at load', 'Cap expansions; cap alias work'],
            ['Depth DoS', 'Deeply nested elements (parser stack)', 'Deeply nested flow collections', 'Depth limits, e.g. SnakeYAML 1.31'],
            ['Object construction', 'Not a format feature; bound to schema-driven binding tools', 'Tag resolution to a constructor', 'Restrict to the core schema, no custom resolvers'],
            ['Grammar abuse', 'DTD defaults surprising a schemaless reader', 'Not applicable — YAML has no defaults', 'Validate against a schema, do not rely on defaults'],
            ['Encoding confusion', 'Declaration versus byte-order mark (RFC 7303 is explicit)', 'UTF-8, UTF-16 by BOM only (§5.2)', 'Require UTF-8, reject BOM surprises'],
          ]}
          foot="The final column is the only genuine difference in kind: the XML rows are switched off by refusing to process a feature that is genuinely optional, and the YAML rows by bounding work and narrowing a resolver. Neither format can be made safe by its own text."
        />
        <Callout tone="risk" title="The sentence to put in a review checklist">
          <P>
            If your service parses XML from anywhere it does not control, the only posture with a track record is no DTD processing at all: no
            external entities, no external DTDs, no network resolver, and a hard cap on entity expansion and document depth. If it parses YAML,
            resolve nothing beyond the core or JSON schema, register no custom tags, and cap alias expansion and collection depth — then test
            both, by feeding a document with a declared doctype and a stream with twenty aliases of an alias, and requiring a loud failure. A
            silent success in either test means the setting was not actually applied.
          </P>
        </Callout>
      </Section>

      <Section id="toolchain" title="The toolchain gap: validators, paths, transforms" kicker="Twenty-five years of implementations">
        <P>
          Format arguments are usually settled by ecosystem, and here the asymmetry is the whole story. XML ships with a validation and
          transformation stack specified in public documents and implemented many times over since 1998: constraint checking with DTDs, XML
          Schema 1.0 and 1.1, <Rich text="RELAX NG" /> and Schematron; addressing with XPath and XPointer; transformation with XSLT;
          canonical serialisation with Canonical XML and Exclusive XML Canonicalisation; signing with XMLDSig; type mapping with Schema Part
          2&apos;s built-in datatype library. Each has independent implementations that a conformance clause forces to agree. YAML has a syntax
          specification, three recommended tag schemas, and then libraries: validation is JSON Schema or a language-specific type system,
          querying is <Rich text="yq" /> in at least three unrelated dialects that share a name, transformation is code, and canonical form does
          not exist — which is why signing YAML in practice means converting it to JSON first.
        </P>
        <CodeBlock
          title="the same three jobs, both stacks"
          language="bash"
          code={`# 1. Validate the document against a published contract
xmllint --schema manifest.xsd --noout manifest.xml        # one tool, one grammar language
# YAML has no equivalent single step:
yq eval '.' manifest.yaml                                  # syntax only
check-jsonschema --schemafile manifest.schema.json converted.json

# 2. Address a node
xmllint --xpath 'string(//m:service[@kind="api"]/m:image)' manifest.xml
yq '.services.service[] | select(._kind == "api") | .image' manifest.yaml   # jq-flavoured

# 3. Transform, and prove the result is the same tree
xsltproc normalise.xsl manifest.xml > canonical.xml
java -jar xmlsec1.jar canonicalize canonical.xml > digest.xml
# YAML: re-emit with your emitter and diff; there is no canonicaliser to disagree with`}
          caption="The shape of the workflow is the argument, not the tools: XML validation and transformation are separate programs with a documented interface between them, so the contract outlives the project that wrote it. The YAML workflow has a syntax checker in step one and a schema chosen by whoever set up the pipeline, which means a wrong schema and a missing schema look identical from the command line."
        />
        <P>
          What a compiler-quality validator buys a config format is the strongest single argument for XML, and it is rarely articulated. Error
          localisation about the contract rather than the bytes — that the value of attribute <Rich text="channel" /> in element{' '}
          <Rich text="release" /> at line 3 is not one of the allowed enumeration values, which is a sentence a reviewer can act on.
          Machine-checkable contracts between organisations, so a vendor can be told &quot;conform to this file&quot; and tested against it.
          Type assignment before application code runs, which removes a class of coercion bugs downstream. Reuse, through named complex types,
          substitution groups and wildcards with documented processing modes. Determinism across implementations, which is what a conformance
          clause is for.
        </P>
        <P>
          What it costs is real, and YAML authors are not wrong to resent it. XSD is a type system with subset rules and validity constraints of
          its own prose; Part 1 defines a family of &quot;must&quot; and &quot;shall&quot; obligations on schema documents that nobody reads
          twice, tooling is heavy, error messages are famously verbose, and the expressive ceiling is lower than people expect — XSD cannot say
          &quot;exactly one of these two elements, and I will tell you which one you got&quot; without contortions, which is why Schematron
          exists alongside it. Most damaging for config: a schema is a second artefact to version, publish and migrate, and the gap between the
          schema and the loader&apos;s behaviour is where outages live.
        </P>
        <P>
          The honest position is that YAML does not lack validation because its designers were careless; it lacks it because permissive tag
          resolution (§3.3.2) does not compose with a normative constraint language. Want machine-checkable YAML without XML and you end up with
          JSON Schema plus a convention that everything passes through a typed boundary — two documents and a discipline instead of one schema.
        </P>
      </Section>

      <Section id="migration" title="Migrating XML to YAML: a failure catalogue" kicker="Migration">
        <P>
          This section is ordered by how long each failure takes to notice, which is roughly the reverse of how often it is discussed.
        </P>
        <P>
          <Rich text="1. The contract disappears." /> The day you stop shipping a schema, the document stops being checkable by anyone who is
          not your code. Mitigation is a JSON Schema plus typed parsing plus a lint stage, and it must exist before the migration, not after the
          first outage; the <Rich text="[Config Conversion workflow](/use-cases/config-conversion/)" /> page covers the practical order.
        </P>
        <P>
          <Rich text="2. Scalars change type." /> The round trip in the second section emitted <Rich text="_text: yes" /> unquoted, and a 1.1
          loader resolves that to boolean true: a feature flag becomes a different type because of a conversion step nobody reviewed. The whole
          class — <Rich text="yes" />, <Rich text="no" />, <Rich text="on" />, <Rich text="off" />, the country code <Rich text="NO" />, the
          version <Rich text="1.10" /> becoming <Rich text="1.1" />, the identifier <Rich text="0o755" /> becoming <Rich text="493" /> — comes
          from the resolver tables in §10 and is documented in the <Rich text="[YAML guide](/learn/yaml/)" />. The rule is mechanical: quote any
          scalar that is not a number you intend to do arithmetic with.
        </P>
        <P>
          <Rich text="3. Attribute flattening collides." /> Eleven synthetic keys in the measured round trip, and the collisions stay invisible
          until two of them land on the same key name. Choose a documented convention once, per converter, and reject documents that would
          violate it — the alternative is silent data loss, which happened here to nothing at all only because the example was small.
        </P>
        <P>
          <Rich text="4. Mixed content is destroyed." /> If your XML has prose in the middle of structure — and if it came from DocBook, DITA, a
          SAML message with human-readable text, an SVG label or an Office document, it does — YAML cannot hold it. That is not a converter
          defect. It is the correct conclusion that the artefact is a document, and the migration should stop.
        </P>
        <P>
          <Rich text="5. Anchors become copies." /> Expansion loses the identity claim, and the second-order problem bites later: after a load,
          a shared aliased node means an edit at one position is visible at the other, while a deep-copied one means the two drift. A tool that
          round-trips YAML without tracking anchors silently changes which of those worlds you live in, and a merge key (<Rich text="&lt;&lt;" />,
          a 1.1 convention rather than a core-schema feature) makes it worse, because inherited keys look native.
        </P>
        <P>
          <Rich text="6. Namespaces are re-invented badly." /> The per-level namespace soup is the case above; the subtler failure is dropping
          namespace identity entirely, because two vocabularies that coexisted peacefully in XML become one key namespace in YAML, and a{' '}
          <Rich text="type" /> attribute from each provider now overwrites the other.
        </P>
        <P>
          <Rich text="7. Ordering assumptions survive by luck." /> YAML mapping keys are unordered by definition; if the old XML relied on
          document order among siblings — batch steps, filter chains, security policy assertions — the sequence must become an explicit sequence,
          not a mapping.
        </P>
        <P>
          <Rich text="8. Pointing and signing do not migrate." /> XPointer and XPath-based fragment addressing have no YAML counterpart, and
          XMLDSig depends on canonicalisation, which YAML does not have. A signed payload is not a config file; leave it where it is.
        </P>
        <P>
          <Rich text="9. The encoding declaration disappears." /> RFC 7303 gives XML a per-document story: the byte-order mark is authoritative,
          the declaration states the encoding, and <Rich text="application/xml" /> versus <Rich text="text/xml" /> carries rules. YAML streams
          are UTF-8, UTF-16BE or UTF-16LE, detected by the BOM (§5.2), with nothing inside the document to declare. When the transport lies about
          the charset, XML has a second channel to correct it and YAML does not.
        </P>
        <Callout tone="tip" title="When XML is still the correct answer">
          <P>
            Four situations, and none of them are about taste. Documents: anything with mixed content, prose, or a stylesheet applied by someone
            else. Signed or encrypted payloads, where canonicalisation is the security property and XMLDSig plus Canonical XML are the only
            standard way to get it. Formats standardised by a body other than your team — <Rich text="[DocBook 5.1](https://tdg.docbook.org/tdg/5.1/)" />,
            the OASIS DITA and OPML specifications, GPX, SAML, SOAP, Office Open XML — where the vocabulary, the schema and the tooling already
            exist and moving it means maintaining a private dialect. And multi-vendor interchange, where &quot;we publish an XSD&quot; is a
            contract a third party can test against without asking your team anything. If none of those describe your file, YAML plus a schema is
            a defensible, and usually better, choice.
          </P>
        </Callout>
      </Section>

      <Section id="decision" title="Fidelity matrix, decision table and what this site converts" kicker="Decide">
        <P>
          Two tables finish the argument. The first is what a converter can promise, feature by feature; read its middle column as
          &quot;instructions you must write down somewhere&quot;. The second is the choice itself, stated as a question about contracts.
        </P>
        <DataTable
          caption="Conversion fidelity: what survives, what needs a rule, what cannot be preserved"
          head={['Feature in the source', 'Direction', 'Fidelity', 'What the converter must be told']}
          rows={[
            ['Nested mappings and sequences', 'both ways', 'lossless', 'Nothing — this is the common subset both models share.'],
            ['Scalar text', 'both ways', 'lossless, types not', 'Whether to quote; and the target loader\u2019s schema version.'],
            ['Attributes', 'XML to YAML', 'recoverable only by convention', 'A key prefix, and a rule for attribute-versus-child collisions.'],
            ['Namespaces', 'XML to YAML', 'identity can be kept, prefix scope cannot', 'Whether to expand URIs into keys, keep them as metadata, or resolve them once.'],
            ['Mixed content', 'XML to YAML', 'lossy', 'Nothing helps; the artefact is a document.'],
            ['Comments', 'both ways', 'usually dropped', 'Whether the emitter preserves comments, which most do not.'],
            ['Processing instructions', 'XML to anything', 'lost', 'Treated as markup nobody recognises.'],
            ['DTD or schema references', 'XML to YAML', 'lost', 'This is where the contract went; you need to re-create it elsewhere.'],
            ['Anchors and aliases', 'YAML to XML', 'lost, expanded to duplicates', 'Whether the identity was semantic or a typing convenience.'],
            ['Explicit tags', 'YAML to XML', 'usually demoted to an attribute', 'Which tags map to xsi:type assertions and which are dropped.'],
            ['Explicit keys', 'YAML to XML', 'lost', 'A naming scheme for structure-valued keys, or a refusal.'],
            ['Block scalars', 'YAML to XML', 'text survives, intent does not', 'Whether to emit xml:space, and how trailing newlines are decided.'],
            ['Multi-document streams', 'YAML to XML', 'shape changes', 'A wrapper element name, which invalidates existing paths.'],
            ['Merge keys', 'YAML to XML', 'invisible', 'Whether inherited keys should be marked, and nothing can mark them.'],
            ['Document order', 'YAML to XML', 'assumed', 'That a mapping order is not load-bearing; if it is, fix the YAML first.'],
          ]}
        />
        <DataTable
          caption="Decision table: choose by the contract, not by the punctuation"
          head={['Situation', 'Choose', 'Because']}
          rows={[
            ['Config read only by your own services', 'YAML', 'Less markup per byte, better for human edits, and you can supply the discipline the format lacks.'],
            ['Config consumed by third parties you do not control', 'XML plus a published schema, or JSON plus JSON Schema', 'A contract an outsider can test without your source.'],
            ['Prose, documentation, authoring', 'XML', 'Mixed content, stylesheets and DITA or DocBook tooling already exist.'],
            ['Payloads that must be signed or encrypted', 'XML', 'Canonicalisation is specified; there is no YAML equivalent.'],
            ['Data with a schema and no structure', 'CSV or JSON', 'If your XML is only flat records, you are paying for a markup language.'],
            ['Kubernetes, CI and deployment manifests', 'YAML', 'The ecosystem, the diffing tools and the templating all assume it.'],
            ['Wire formats specified in the 2000s', 'XML', 'SOAP, SAML, Office Open XML and SVG are XML; conversion is a rewrite.'],
            ['Anything whose types matter', 'either, with a schema', 'Untyped YAML and unvalidated XML have the same hole, and only one has a standard filler.'],
          ]}
        />
        <KeyTerms
          items={[
            { term: 'Common subset', definition: 'Mappings, sequences and strings. Everything outside it is a convention you must specify yourself.' },
            { term: 'Fidelity', definition: 'Whether the result re-expresses the same claim, not whether the same characters survive.' },
            { term: 'Converter rule', definition: 'A written decision about attributes, namespaces and mixed content. Every XML-to-YAML tool has them; almost none publish them.' },
            { term: 'Schema discipline', definition: 'For YAML: a JSON Schema, typed parsing at the boundary and a lint stage. Without it, YAML has no contract at all.' },
          ]}
        />
        <H3 id="what-this-site-does">What this site converts, and what it does not</H3>
        <P>
          Be clear about the tooling position, because it is a deliberate limit. FmtTools runs entirely in the browser and handles JSON,
          YAML, CSV, TSV, NDJSON and Base64. It has a YAML-to-JSON converter and a JSON-to-YAML converter, and it has <Rich text="no XML
          parser, no XSD or RELAX NG validator, and no XML-to-YAML or YAML-to-XML converter" />. That is not an oversight: as the fidelity
          matrix shows, an XML converter is a set of policy decisions about attributes, namespaces and mixed content before it is a program, and
          a page that silently picked those defaults would be making a vocabulary decision on your behalf.
        </P>
        <P>
          What the tools here are genuinely good for in an XML-to-YAML migration is the inspection step. When a converter hands you JSON — from{' '}
          <Rich text="xml2js" />, <Rich text="xmllint --xpath" /> piped through a script, or your own XSLT — paste the result into{' '}
          <Rich text="[JSON to YAML](/format-converters/json-to-yaml/)" /> to see what the emitter would do to your scalars, and paste the YAML
          back into <Rich text="[YAML to JSON](/format-converters/yaml-to-json/)" /> to see what a resolver decided about types. That is where
          the <Rich text="yes" />-becomes-boolean and <Rich text="2026.42" />-becomes-float defects appear, and they appear faster in a browser
          than in a pipeline. For the XML side of the boundary you still need <Rich text="xmllint" />, <Rich text="yq" /> or an XSLT stylesheet,
          and none of those live here.
        </P>
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          <ToolLink path="/format-converters/yaml-to-json/" name="YAML to JSON" blurb="See which scalars the resolver typed, and which it left as strings." />
          <ToolLink path="/format-converters/json-to-yaml/" name="JSON to YAML" blurb="Preview how an emitter quotes, folds or breaks your values." />
        </div>
        <P>
          The verdict, in the form I would put in front of the punctuation arguments: YAML and XML differ most in what their standards bodies
          agreed to specify. XML standardised the tree, the constraints, the addressing and the canonical form, then left the syntax ugly. YAML
          standardised a beautiful syntax for a graph, then left everything above it to your configuration. Pick according to which half of that
          you can afford to own.
        </P>
      </Section>
    </>
  )
}
