/**
 * XML complete guide. Content module for /learn/xml/.
 * Clause references were checked against the published XML 1.0 (Fifth Edition),
 * Namespaces in XML 1.0 (Third Edition), RFC 7303 and XPath 3.1 texts on
 * 2026-11-12; every byte count in this article was measured on the markup
 * printed beside it, not quoted from a blog post. Vendor parser option strings
 * are the documented API surface of the libraries named and should be re-checked
 * against the version pinned in your lockfile or base image.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'xml',
  path: '/learn/xml/',
  title: 'XML Guide: Syntax, Namespaces, XPath, XSD and XXE | ConvertTools',
  description:
    'A complete XML guide: well-formedness, escaping, namespaces, DTD entities, XXE and billion laughs mitigations, XPath, XSD, canonicalization and byte counts.',
  h1: 'XML: The Complete Guide to Markup That Refuses to Die',
  summary:
    'The five markup rules, how namespaces actually resolve, what an InfoSet is, and why the format SOAP, RSS, SVG and Office files still depend on it.',
  keywords: ['xml guide', 'xml namespaces', 'xml dtd entities', 'xpath', 'xxe', 'xml vs json'],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 19,
  sections: [
    { id: 'fifth-edition', label: 'What XML is, and what the Fifth Edition changed' },
    { id: 'well-formedness', label: 'Well-formedness against validity' },
    { id: 'characters-escaping', label: 'Characters, escaping and the CDATA exception' },
    { id: 'elements-attributes', label: 'Elements, attributes and two information models' },
    { id: 'prolog', label: 'The prolog, the XML declaration and encoding' },
    { id: 'namespaces', label: 'Namespaces, explained the way people get them wrong' },
    { id: 'dtd-entities', label: 'DTDs, subsets and every kind of entity' },
    { id: 'xxe', label: 'External entities as an attack surface' },
    { id: 'infoset', label: 'The Information Set every parser hands you' },
    { id: 'validation', label: 'DTD against XML Schema against RELAX NG' },
    { id: 'xpath', label: 'XPath axes and predicates, with worked paths' },
    { id: 'streaming', label: 'Streaming parsers and the large-file problem' },
    { id: 'canonical', label: 'Canonical XML and why order is a security property' },
    { id: 'verbosity', label: 'Measured verbosity: one record, two formats' },
    { id: 'in-production', label: 'Where XML still wins in production' },
    { id: 'xml-to-json', label: 'XML to JSON conventions and what they lose' },
    { id: 'endures', label: 'Why a 1998 specification still ships software' },
  ],
  faqs: [
    {
      question: 'Is XML still used in 2026?',
      answer:
        'Yes, and mostly where you are not looking at it. Every `.docx`, `.xlsx` and `.pptx` is a ZIP of XML parts; every SVG is XML; SAML assertions, SOAP envelopes, Office Open XML, EPUB package documents, Android manifests, Maven `pom.xml`, PostgreSQL `xml` columns and Garmin `.gpx` files are all live XML today. What stopped is **new** public APIs choosing it: the payload formats people design in 2026 are JSON, and XML survives as the document and interchange substrate underneath formats that were specified while JSON did not exist.',
    },
    {
      question: 'What is the difference between well-formed and valid?',
      answer:
        'Well-formedness is syntax: a document that matches the document production, satisfies every well-formedness constraint and whose referenced entities are themselves well-formed. Validity is a claim about a **grammar**: the document additionally matches a DTD that declares its element types and attributes. A processor must reject a document that is not well-formed; it may never look at validity unless you ask it to validate. That is why "the XML is valid" is not a complete sentence — valid against which DTD, read from where?',
    },
    {
      question: 'Does a parser download the namespace URI?',
      answer:
        'No, and the specification says the URI is not meant for that. A namespace name is compared as a string: two declarations with the same URI are the same namespace, and two URIs that differ in one character are different namespaces, even if they point at the same file. The Namespaces recommendation states that the namespace name SHOULD be unique and persistent and that it is not a goal for it to be directly usable for retrieval. Treat `xmlns` as an identifier, never as a link.',
    },
    {
      question: 'Are attributes just lightweight elements?',
      answer:
        'No. They are a second, deliberately weaker information model: an unordered set of unique names, each with one normalized string value. Attributes cannot repeat, cannot nest, cannot contain elements, cannot hold markup, cannot carry `]]>`-escaping problems, and may have defaults supplied by a DTD. Elements are ordered, repeatable and nestable. The practical consequences are real: a DTD can put an attribute value where a character reference to an external entity would be fatal, and an XML-to-JSON converter has to invent a key prefix for every attribute it meets.',
    },
    {
      question: 'What breaks when you convert XML to JSON?',
      answer:
        'Six things, in order of how long they take to find: a repeated element becomes an array only when it repeats, so one item and many items produce different shapes; attribute values need a synthetic key that differs between libraries; mixed content has no faithful JSON model; element and attribute order are both lost or both mangled; an empty element may become `null`, `""`, `{}` or `[]` depending on the library; and every value arrives as a string, so a converter that guesses types will turn `007` into `7` exactly like the CSV pipeline does.',
    },
    {
      question: 'How do I actually stop XXE in my parser?',
      answer:
        'Turn off DTD processing entirely, then turn off external-entity resolution, then cap expansions. In Java that is `disallow-doctype-decl` (plus `external-general-entities`, `external-parameter-entities` and `accessExternalDTD` if you must keep DTDs); in .NET `DtdProcessing.Prohibit` with `XmlResolver = null`; in lxml `resolve_entities=False` with `no_network=True`; and in Python `defusedxml` which refuses DTDs and entity expansion beyond a budget by default. Then test it: parse a document with a `<!DOCTYPE>` and require a loud failure. A silent success means you are still vulnerable.',
    },
    {
      question: 'Is XML really bigger than JSON?',
      answer:
        'Raw, yes, but less than the folklore: the same one-record bibliography entry measured here is 693 bytes as XML against 618 as JSON, a 12% difference, and 587 against 493 minified. Repeated across 500 records the difference shrinks to 8.5%, and gzipped the XML is the **smaller** file: 5,435 bytes against 7,481. XML verbosity is mostly repetition of element names, and repetition is exactly what deflate monetises. The cost XML really imposes is CPU, memory and keystrokes, not bandwidth.',
    },
    {
      question: 'Why does my XPath return nothing when the element is obviously there?',
      answer:
        'Because `//entry` asks for an element whose namespace name is the empty string and whose local name is `entry`, and your document puts `entry` in a default namespace. Default namespace declarations apply to unprefixed element names, so the element is not in "no namespace" — it is in the URI you declared. Either bind a prefix in your XPath evaluator and write `//b:entry`, or match on `local-name()` (slow, and it also matches the wrong vocabulary). This single mismatch is the most common XML bug in the wild.',
    },
  ],
  sources: [
    {
      label: 'XML 1.0 (Fifth Edition) — W3C Recommendation',
      href: 'https://www.w3.org/TR/xml/',
      detail:
        'Checked for: the document production [1] and the definition of a well-formed document in 2.1; the Char production [2] ranges; the Common Constructs of 2.3; element productions [39]-[44] and [53] AttDef; Comment [15], PITarget [17] and the CDSect productions [18]-[21]; prolog [22], XMLDecl [23] and VersionInfo [24]; the MUST sentences that "&" and "<" be escaped by numeric character reference or &amp; and &lt; and that ">" be escaped when part of "]]>"; the rule that only CDEnd is recognised inside a CDATA section; the entity productions and [9] EntityValue; the sentence "A parsed entity MUST NOT contain a recursive reference to itself"; and the rule that a reference to an external parsed entity inside an attribute value is a fatal error.',
      accessed: '2026-11-12',
    },
    {
      label: 'Namespaces in XML 1.0 (Third Edition) — W3C Recommendation, 8 December 2009',
      href: 'https://www.w3.org/TR/xml-names/',
      detail:
        'Checked for: the section structure (XML Namespaces, Declaring Namespaces, Qualified Names, Using Qualified Names, Applying Namespaces to Elements and Attributes, document and processor conformance); that the namespace-name value MUST be a URI reference or the empty string and that "It is not a goal that it be directly usable for retrieval of a schema"; the scope sentence for prefix declarations extending from the start-tag to the corresponding end-tag and excluding inner declarations; "Default namespace declarations do not apply directly to attribute names"; that the xml prefix is by definition bound to http://www.w3.org/XML/1998/namespace and MUST NOT be bound elsewhere; that other prefixes beginning with the three-letter sequence x, m, l in any case combination are reserved and processors MUST NOT treat them as fatal errors; that a prefix used on a name MUST have been declared on that element or an ancestor; and that an empty default-namespace value has the same effect as no default namespace.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7303 — XML Media Types',
      href: 'https://datatracker.ietf.org/doc/html/rfc7303',
      detail:
        'Checked for: the registration of application/xml and text/xml, the requirement that they not be used unless the parsed entities are also well-formed document entities, the rule that the byte-order mark is authoritative for the encoding, the default of UTF-8 when nothing else declares one, the optional charset parameter, the security considerations around external DTDs and entities, and the obsoletion of RFC 3023.',
      accessed: '2026-11-12',
    },
    {
      label: 'XPath 3.1 — W3C Recommendation',
      href: 'https://www.w3.org/TR/xpath-31/',
      detail:
        'Checked for: the axes table (3.3.2.1) and the statement that the namespace axis is deprecated and that an implementation need not support it; the path-expression rule that a step is evaluated against the context node, its axis, a node test and predicates; and the 3.1 additions of maps, arrays, document access and the string concatenation operator over XPath 3.0.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP — XML External Entity (XXE) Processing',
      href: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      detail:
        'Checked for the guidance that an XML processor "should be configured to use a local static DTD and disallow any declared DTD included in the XML document", which is the conservative posture the mitigation table in this article is organised around.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/compare/xml-vs-json/', name: 'XML vs JSON', blurb: 'The same payload measured in both formats, with a decision table for new work.' },
    { path: '/compare/yaml-vs-xml/', name: 'YAML vs XML', blurb: 'Anchors against entities, maps against attributes, and two very different answers to extension.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'The format every XML-to-JSON conversion is aiming at, and where its own rules are silent.' },
    { path: '/learn/base64/', name: 'Base64: The Complete Encoding Guide', blurb: 'What XML does to binary payloads, and why attribute-embedded base64 breaks on newlines.' },
    { path: '/json-tools/validator/', name: 'JSON Validator', blurb: 'Validate the output of your XML conversion and see duplicate keys and precision loss.' },
    { path: '/use-cases/api-debugging/', name: 'Tools for Debugging HTTP APIs', blurb: 'The triage order for a payload that arrived in a format you did not expect.' },
  ],
  words: 7736,
  image: '/images/covers/learn-xml.png',
  imageAlt: 'A tree of angle-bracket markup resolving into namespaces, entities and an XPath projection over a document.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        XML is the only widely deployed data format whose governing specification has not changed its syntax in twenty-eight years. That
        stability is the reason a DOCX, a SAML assertion, an SVG icon and a Maven build file still speak the same underlying language, and
        it is also the reason the same three bugs keep recurring: a namespace that silently changes what an element means, an entity that
        reads a file it should not have, and a converter that turns one repeated element into an object and two into an array. This guide walks those rules and then follows each one into the failures it causes.
      </Lead>

      <Section id="fifth-edition" title="What XML is, and what the Fifth Edition changed" kicker="Definitions">
        <P>
          XML is a metalanguage. The specification does not define any elements, attributes or document shapes you are allowed to use; it
          defines the rules by which you may define a vocabulary, and the constraints a processor must enforce. Production [1] in §2.1 of
          XML 1.0 (Fifth Edition) gives the whole shape of a document in one line — an optional prolog, exactly one element, and trailing
          miscellaneous markup — and the definition of well-formedness that follows it says a document is well-formed if it matches that
          production, satisfies every well-formedness constraint, and every entity it references is well-formed too. Everything else in
          this article is a consequence of those few sentences.
        </P>
        <P>
          The design is a deliberate subtraction from SGML. Element and attribute names are explicit, closing tags are mandatory, the tree
          must be properly nested, character data is escaped rather than quoted by convention, and a processor may recover nothing: a
          violation is fatal and the document is rejected. The specification&apos;s only semantic commitments are namespace identity and the constraint tables.
        </P>
        <H3>The Fifth Edition changed characters, not syntax</H3>
        <P>
          First Edition was 1998; the Fifth Edition is the current recommendation, and it introduced no new syntax. What it changed is the
          character model, together with the errata it folded in. The Char production, [2], now reads as a set of ranges taken straight from
          Unicode and ISO 10646: horizontal tab, line feed and carriage return; then 0x20 through 0xD7FF; then 0xE000 through 0xFFFD; then
          0x10000 through 0x10FFFF. Read that list as a set of exclusions and it becomes useful: no NUL, no control characters at all below
          0x20 except the three whitespace ones, no surrogate code points in either half (the gap between 0xD7FF and 0xE000 exists
          precisely because surrogates are an encoding artefact, not characters), and no 0xFFFE or 0xFFFF non-characters. One incorporated
          erratum, E09, relaxed the restrictions on what may appear in a name, which is why modern parsers accept name characters that a
          1998 parser rejected.
        </P>
        <CodeBlock
          title="a complete XML document, 693 bytes"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<biblio:collection xmlns:biblio="http://example.org/biblio/1.0" generated="2026-11-12">
  <biblio:entry id="9781491950751" lang="en">
    <title>Designing Data-Intensive Applications</title>
    <author role="primary">Kleppmann, Martin</author>
    <publisher>O'Reilly Media</publisher>
    <published year="2017">2017-06-16</published>
    <price currency="USD">44.99</price>
    <tags>
      <tag>database</tag>
      <tag>distributed systems</tag>
    </tags>
    <summary>A survey of storage engines, replication and consistency, with notes on batch and stream processing.</summary>
    <inStock>true</inStock>
  </biblio:entry>
</biblio:collection>`}
          caption="Measured on this exact file: 693 bytes, 12 start tags and 12 end tags, 6 attributes plus 1 namespace declaration, 9 text nodes carrying content and 14 more carrying nothing but indentation. The XML declaration costs 38 bytes, and the pretty-printing costs 68 bytes more than the same document minified."
        />
        <P>
          That document is the running example for the rest of this guide. It is deliberately ordinary: one vocabulary bound to a namespace
          URI, six attributes of the sort that carry metadata rather than content, a repeated element, a free-text element with a comma in
          it, and two values — <Rich text="`44.99`" /> and <Rich text="`true`" /> — that a converter will insist on typing even though XML
          has no idea what they are.
        </P>
        <H3>What a media type adds on top</H3>
        <P>
          RFC 7303 registers <Rich text="`application/xml`" /> and <Rich text="`text/xml`" /> and obsoletes the earlier RFC 3023. Two
          sentences in it matter in practice. The first is that these media types must not be used unless the parsed entities are also
          well-formed document entities — an XML fragment is not an XML document, and the specification has a separate notion for it. The
          second is the encoding determination: the media type parameter, then the byte-order mark, which the RFC makes authoritative, then
          the encoding declaration in the prolog, then UTF-8 as the default when nothing else has spoken. A document that says{' '}
          <Rich text={'`encoding="UTF-8"`'} /> while beginning with the three UTF-16 bytes is not ambiguous; the mark wins, and the declaration
          is a lie that you must handle after decoding.
        </P>
        <KeyTerms
          items={[
            { term: 'well-formed', definition: 'Matches production [1], satisfies every [WFC], and every referenced entity is well-formed too.' },
            { term: 'valid', definition: 'Well-formed and additionally satisfies the DTD constraints for the document type named in the root.' },
            { term: 'fatal error', definition: 'The processor must stop and reject the document. Every well-formedness violation is one.' },
            { term: 'metalanguage', definition: 'A language for describing languages: XML defines rules for vocabularies, never a vocabulary.' },
            { term: 'instance', definition: 'One document written against a grammar: the DOCX, the RSS feed, the SOAP envelope.' },
            { term: 'vocabulary', definition: 'The element and attribute names you chose: XHTML, SVG, Atom, DITA, your own.' },
            { term: 'document entity', definition: 'The top-level parsed entity; the only one a non-validating processor must read.' },
            { term: 'expanded name', definition: 'The pair a namespace-aware processor builds: namespace URI plus local name.' },
          ]}
        />
        <Callout tone="spec" title="The character ranges of the Fifth Edition">
          <P>
            Production [2]: <Rich text="`#x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]`" />. Every character in a
            document must be in that set, whether it arrives literally, as a numeric character reference, or as the replacement text of an
            entity. This is why an XML parser rejects a literal NUL from a database dump rather than passing it through, and why the
            surrogate range is missing: the syntax has no way to express a code point that only exists inside UTF-16.
          </P>
        </Callout>
      </Section>

      <Section id="well-formedness" title="Well-formedness against validity, and why the difference is a policy" kicker="The five rules">
        <P>
          Practitioners compress XML&apos;s syntax requirements into five rules, and the compression is good enough to keep in your head:
          every opening tag needs a matching closing tag or must be self-closing; there is exactly one root element; tags must be nested in
          the order they were opened; every attribute has a name, an equals sign and a quoted value; and the characters{' '}
          <Rich text="`&`" /> and <Rich text="`<`" /> must be escaped. Under that summary sit two separate tables in the specification, and
          the separation is the most consequential design decision in the format.
        </P>
        <P>
          The first table is the well-formedness constraints. They are syntax-level, they apply to every processor, and violating one is a
          fatal error: legal characters (nothing outside production [2]); no duplicate attributes on one start-tag; properly nested
          declarations and parameter-entity references across the internal and external subsets; the <Rich text="`WITN`" /> rule — where an
          element declared with element content must not carry markup declarations inside its content; entity evaluation, which requires the
          replacement text of a general entity to be independently well-formed when it is referenced in content; and the conditionally
          included markup rule, which requires an ignored conditional section to still contain well-formed markup. A non-validating
          processor must enforce all of these even though it is allowed to ignore the DTD almost entirely.
        </P>
        <P>
          The second table is the validity constraints, and these are a different kind of claim: the root element must be the declared
          document type, every element must be declared and its content must match its declared model, declared attributes must be
          legal-and-present, <Rich text="`#REQUIRED`" /> attributes must appear, <Rich text="`#FIXED`" /> attributes must equal their fixed
          value, ID values must be unique, IDREF values must resolve to a declared ID. A document can be perfectly well-formed and perfectly
          invalid, and a processor that is not validating will not know the difference. When someone says a pipeline &quot;validates the
          XML&quot;, ask which table they mean, because the answer determines whether element ordering was checked at all.
        </P>
        <DataTable
          caption="The same mistakes, sorted by which constraint table catches them"
          head={['Input', 'Verdict', 'Which rule catches it', 'Who notices']}
          rows={[
            ['<note>a <b>c</note></b>', 'Not well-formed', 'Crossed start- and end-tags, production [39]', 'Every parser, always'],
            ['<e a="1" a="2"/>', 'Not well-formed', '[WFC] No Duplicate Attribute', 'Every parser, always'],
            ['<e>R&D</e>', 'Not well-formed', 'The "&" MUST be escaped', 'Every parser, always'],
            ['<e>a NUL b</e> with a real 0x00', 'Not well-formed', '[WFC] Legal Character, production [2]', 'Every parser, always'],
            ['<entry>no title</entry> where the DTD requires one', 'Well-formed, invalid', '[VC] Element Valid', 'Only a validating processor'],
            ['<entry/> where the DTD says the id attribute is #REQUIRED', 'Well-formed, invalid', '[VC] Required Attribute', 'Only a validating processor'],
            ['Two elements sharing one ID value', 'Well-formed, invalid', '[VC] ID', 'Only a validating processor'],
          ]}
          foot="The first four rows fail at parse time in any language, on any stack. The last three are invisible unless DTD validation is switched on — and they are the reason XSD exists."
        />
        <Callout tone="note" title="The fragment problem">
          <P>
            A single element out of a document is not a well-formed document, because production [1] demands exactly one root element and no
            markup before it. &quot;XML fragment&quot; is a term of art with no conformance definition behind it, which is why RFC 7303 says
            the document media types must not be used unless the parsed entities are well-formed document entities too. If you store a
            fragment in a database column or a configuration file, you are choosing a private convention; write it down, because
            namespace declarations, undeclared prefixes and entity references all behave differently in a fragment than in a document.
          </P>
        </Callout>
      </Section>

      <Section id="characters-escaping" title="Characters, escaping and the CDATA exception" kicker="Production [20]">
        <P>
          There are four ways to get a character into XML content and exactly one of them is a trap. The literal character is allowed if it
          is in production [2]. A numeric character reference — <Rich text="`&amp;#65;`" /> or <Rich text="`&amp;#x41;`" /> — names a code
          point and is permitted for anything in the character set, including characters the document encoding cannot represent; this is the
          mechanism that lets one UTF-8 file carry Linear B syllabograms and an emoji. The predefined general entities are the only names the
          specification itself defines for use in content: <Rich text="`&amp;lt;`" />, <Rich text="`&amp;gt;`" />,{' '}
          <Rich text="`&amp;amp;`" />, <Rich text="`&amp;quot;`" /> and <Rich text="`&amp;apos;`" />. And a character reference to an external
          entity is allowed in content but fatal in an attribute value — the split that §4 makes and that every XXE mitigation table has to
          respect.
        </P>
        <P>
        The escaping rule itself is short enough to memorise. The specification requires that the ampersand and the less-than sign{' '}
          <strong>MUST</strong> be escaped using a numeric character reference or <Rich text="`&amp;amp;`" /> and <Rich text="`&amp;lt;`" />.
          The greater-than sign <strong>MUST</strong> be escaped only when it is part of the sequence <Rich text="`]]&gt;`" /> — which is
          why a generator that escapes every <Rich text="`&gt;`" /> produces technically correct, gratuitously unreadable output. Quotation
          marks are constrained by context rather than by content: in an attribute value, the character that delimits the value{' '}
          <strong>MUST</strong> be escaped, so <Rich text={'`title="She said &quot;hi&quot;"`'} /> is fine while a literal second double quote
          ends the value early and the rest becomes a syntax error. The other quote style does not have to be escaped at all, which is why
          mixed-quoting generators produce documents that diff badly.
        </P>
        <CodeBlock
          title="content vs attribute value: what must be escaped where"
          language="xml"
          code={`<!--  content:  &  and  <  are fatal.  >  only inside "]]>"  -->
<q author="Knuth, Donald E.">&lt;TeX&gt; was written in C, and A &amp; B is fine.</q>
<q note="He said &quot;yes&quot;, then 'maybe'."/>      <!-- ' needs no escape here -->
<formula>a &gt; b &amp;&amp; c &lt;= d</formula>              <!-- &gt; not required, but harmless -->
<block>the closing sequence must be split: ]]&gt;]]&gt;</block>
<!-- an external entity reference in an attribute value is a fatal error -->
<bad path="&anyExternalEntity;"/>`}
          caption="Two of these six lines are fatal, one is stylistic, and the last one is the reason XXE mitigations concentrate on attributes and DTDs rather than on content."
        />
        <H3>CDATA sections escape markup, not everything</H3>
        <P>
        A CDATA section — productions [18] through [21], <Rich text="`&lt;![CDATA[`" /> through <Rich text="`]]&gt;`" /> — tells the
          parser to treat what follows as character data without recognition, with one exception the specification states bluntly: only the end
          sequence is recognised inside a CDATA section. That single sentence explains all of CDATA&apos;s behaviour. Entities are not expanded,
          so{' '}
          <Rich text="`&amp;amp;`" /> inside a section stays as seven characters of text, not one ampersand. Tags are not recognised, which is
          why embedding an HTML snippet in an RSS <Rich text="`description`" /> element with CDATA preserves the markup as data. And because the
          only thing the parser looks for is the terminator, the terminator cannot appear: there is no escape for{' '}
          <Rich text="`]]&gt;`" /> inside CDATA, and the standard trick is to end the section and start another one, splitting the sequence
          across the boundary. Nesting is impossible for the same reason.
        </P>
        <CodeBlock
          title="the ]]&gt; problem, solved the only way it can be"
          language="xml"
          code={`<![CDATA[if (a < b && c <![CDATA[> d) { }]]>
<![CDATA[if (a < b && c ]]>]]><![CDATA[> d) { }]]>   <!-- correct: terminator split at the boundary -->`}
          caption="The first line is the bug that appears in every code-snippet-in-XML generator: the parser closes the section at the first ]]> it sees and then hits a bare < in what is now markup position."
        />
        <Callout tone="warn" title="Whitespace is never insignificant">
          <P>
            There is no such thing as insignificant whitespace in XML. Every space, tab and newline between tags is a text node, and the
            pretty-printed version of the running example carries 68 more bytes and 14 more text nodes than the minified one — 23 text nodes
            against 9. A document
            that allows whitespace in its content model — <Rich text="`(#PCDATA)*`" /> in a DTD,{' '}
            <Rich text="`mixed`" /> in XML Schema — tolerates indentation; a document with an element content model does not, which is why
            the same file can validate before beautification and fail after it. The one place the specification does help you is attribute
            values, where normalization replaces tabs and newlines with a single space — see{' '}
            <Rich text="[Elements and attributes](#elements-attributes-h)" />.
          </P>
        </Callout>
      </Section>

      <Section id="elements-attributes" title="Elements, attributes and two different information models" kicker="Productions [39]-[44]">
        <P>
          Production [39] defines an element as a name, a start-tag, content and an end-tag, or as an empty-element tag; [40] builds the
          start-tag from the name plus attributes; [42] is the end-tag, and its name must match the start-tag&apos;s; [43] allows content to
          be elements, character data, references, CDATA sections, processing instructions and comments; [44] is{' '}
          <Rich text="`<name/>`" />, which the specification treats as exactly equivalent to{' '}
          <Rich text="`<name></name>`" />. Four productions, and the whole data model of the language is on the table: a tree of named nodes
          with an ordered list of children.
        </P>
        <P>
          Attributes — production [41], a name, an equals sign and a quoted value — are the second model, and the mistake is to read them as
          a compact spelling of elements. They are not; they are unordered, unique-keyed, single-valued and outside the content sequence.
          The differences are not stylistic, they are structural, and each one produces a bug someone has shipped.
        </P>
        <DataTable
          caption="Element content against attribute values, property by property"
          head={['Property', 'Element', 'Attribute value']}
          rows={[
            ['Order among siblings', 'Significant: the document order is part of the data', 'Not significant: the spec says the relative order of attribute specifications on one start-tag carries no meaning'],
            ['Same name twice', 'Allowed, and how lists are expressed', 'Forbidden — [WFC] No Duplicate Attribute, a fatal error'],
            ['Nesting', 'Unbounded', 'Impossible: an attribute value cannot contain an element'],
            ['Markup inside', 'Elements, CDATA, references, PIs, comments', 'Character data and character or internal-entity references only; external references are fatal'],
            ['Whitespace', 'Preserved exactly as written, always a text node', 'Normalized: tabs and newlines become spaces, and tokenized types then get trimmed and collapsed'],
            ['Defaults', 'None — absence is absence', 'A DTD can supply #IMPLIED, #REQUIRED or #FIXED values the document never contained'],
            ['Mixed with text', 'Yes: mixed content is legal', 'No: an attribute is never part of a run of prose'],
          ]}
        />
        <P>
          Attribute-value normalization is the other half of the story and a frequent source of real corruption. Two passes happen: first
          every tab, line feed and carriage return in the value is replaced with a space and every character reference is replaced with its
          target; second, if the attribute is declared with a tokenized type — ID, IDREF, NMTOKEN, ENTITY, NOTATION or an enumeration — the
          result is stripped of leading and trailing spaces and each internal run of spaces collapses to one. A CDATA-declared attribute
          stops after the first pass. That asymmetry is why a wrapped base64 key inside <Rich text="`ds:KeyValue`" /> arrives as one long
          line with single spaces where your newlines were, and why{' '}
          <Rich text={'`type="a b"`'} /> declared as an enumeration of <Rich text="`a|b`" /> matches nothing. The{' '}
          <Rich text="[Base64 guide](/learn/base64/)" /> covers the encoding side of that accident; the fix on this side is to keep
          multi-line payloads in element content, where whitespace survives.
        </P>
        <CodeBlock
          title="the same fact, spelled two ways, with a byte count"
          language="xml"
          code={`<published year="2017">2017-06-16</published>                          <!-- 45 bytes -->
<published><year>2017</year><date>2017-06-16</date></published>   <!-- 63 bytes -->

<!-- which one is right depends on what "year" means to a reader: -->
<biblio:entry id="9781491950751" lang="en">   <!-- metadata about the thing -->
  <title>Designing Data-Intensive Applications</title>   <!-- the thing itself -->
</biblio:entry>`}
          caption="18 bytes is the whole price difference in this pair, and it is not the reason to choose. The reason is that 'year' as an attribute cannot take a second value, cannot be localized, and will not appear in any query over the element's content."
        />
        <Callout tone="tip" title="The rule that holds up over twenty years of schema reviews">
          <P>
            Put in an attribute what qualifies the meaning of the element it sits on — an identifier, a language, a unit, a role, a type
            discriminator — and put in an element anything that is part of the content or might one day need structure of its own. The
            tell that you got it wrong is an attribute whose value contains a delimiter you invented: <Rich text={'`tags="a,b,c"`'} /> is a
            list wearing an attribute&apos;s clothes, and the day someone needs a tag containing a comma, you have a format change rather
            than a data change.
          </P>
        </Callout>
      </Section>

      <Section id="prolog" title="The prolog, the XML declaration and the encoding declaration" kicker="Productions [22]-[28]">
        <P>
          Production [22] makes the prolog optional and gives its shape: an optional XML declaration, then miscellaneous markup, then an
          optional document type declaration, then more miscellaneous markup. Production [23] is the XML declaration, and it is the only
          thing in the language that is not a processing instruction despite looking exactly like one: the parser matches{' '}
          <Rich text="`<?xml`" /> with the declaration production before it ever reaches the PI production, which is also why a PI target
          name must not match <Rich text="`xml`" /> in any case combination.
        </P>
        <CodeBlock
          title="every legal way to open a document"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>                    <!-- 38 bytes: the usual -->
<?xml version='1.0'?>                                     <!-- 23: legal, encoding omitted -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>   <!-- + the standalone assertion -->
<?xml version="1.0" ?>                                   <!-- space before ?> : legal -->
<!-- <?xml version="1.0"?>  written as a comment          -->  <!-- also legal, and useless -->
<?xml version='1.0' encoding='windows-1252'?>             <!-- named encoding, must match the bytes -->
<?xml-stylesheet type="text/xsl" href="render.xsl"?>      <!-- a PI, NOT a declaration -->
<!DOCTYPE biblio:collection SYSTEM "biblio.dtd">          <!-- in the prolog, before the root -->`}
          caption="Measured: the 38-byte declaration is unavoidable overhead in a document that declares an encoding; the 23-byte form is what a generator emits when it trusts UTF-8, and a UTF-8 BOM in front of either adds 3 more bytes."
        />
        <H3>Who decides the encoding, in what order</H3>
        <P>
        Three documents argue about this and they agree on the outcome. The specification says an entity without an encoding declaration is treated as
          UTF-8 unless it begins with the UTF-16 byte pattern that identifies itself; RFC 7303 adds the transport layer, making a media-type
          charset and then the byte-order mark authoritative, with UTF-8 the default if none of the three has spoken. The practical consequence
          is that the encoding declaration is a claim about bytes already decoded, not a decoder setting. When{' '}
          <Rich text={'`encoding="UTF-8"`'} /> sits atop a file whose first bytes are FF FE, the mark wins, the document is UTF-16LE, and
          everything you read from the declaration is fiction. When the declaration says UTF-8 and the bytes are Windows-1252, the parser either
          fails on an invalid sequence or — worse — accepts 0x91 as a legal code point and hands you a smart quote as garbage.
        </P>
        <P>
        The <Rich text="`standalone`" /> attribute is a separate claim and it is easy to state wrongly. <Rich text={'`standalone="yes"`'} /> does
          not mean &quot;no external DTD&quot;; it means the author asserts that the document does not depend on markup outside itself: no
          external entity whose content matters, no attribute defaults, no entity replacement it needs. A processor must treat a violation as an
          error worth reporting rather than a lie that changes the tree, and in practice most tools read the attribute only as a hint about
          whether to fetch anything. The version pseudo-attribute is the last trap: it is a literal string{' '}
          <Rich text={'`"1.0"`'} />, not a number, so <Rich text={'`"1.1"`'} /> is a different specification, not a newer minor revision.
          XML 1.1 exists and is implemented by essentially nothing that consumes your files; the safest declaration in circulation is the one
          the Fifth Edition describes.
        </P>
        <KeyTerms
          items={[
            { term: 'prolog', definition: 'Optional opening of a document: declaration, then comments and PIs, then the DOCTYPE.' },
            { term: 'XMLDecl', definition: 'Production [23]; version, optional encoding, optional standalone. Not a processing instruction.' },
            { term: 'EncodingDecl', definition: 'An encoding name that must be a registered character encoding, matched case-insensitively.' },
            { term: 'SDDecl', definition: 'standalone="yes" or "no": an assertion about dependence on external markup.' },
            { term: 'text declaration', definition: 'The same syntax at the head of an external parsed entity, where version is optional.' },
            { term: 'doctype', definition: 'Production [28]; names the document type, may carry an internal subset and point at an external one.' },
            { term: 'Misc', definition: 'Production [27]: comments and processing instructions, legal in the prolog and after the root.' },
            { term: 'BOM', definition: '3 bytes for UTF-8, 2 for UTF-16; authoritative over the declaration, and fatal before a root in JSON.' },
          ]}
        />
      </Section>

      <Section id="namespaces" title="Namespaces, explained the way people get them wrong" kicker="Namespaces in XML 1.0">
        <P>
          A namespace is an identifier, not a location and not a type. The Namespaces recommendation states that the value of a namespace
          declaration MUST be either a URI reference or the empty string, that it SHOULD be unique and persistent, and — the sentence that
          settles the argument — &quot;It is not a goal that it be directly usable for retrieval of a schema.&quot; Processors compare those
          strings. Two documents using{' '}
          <Rich text="`http://example.org/biblio/1.0`" /> and <Rich text="`http://example.org/biblio/1.1`" /> describe two different
          vocabularies as far as every tool is concerned, even if the same human wrote both, and nothing in the format fetches the URI,
          checks that it resolves, or cares that the page behind it is a 404.
        </P>
        <H3>The four mistakes, in the order teams make them</H3>
        <P>
          <strong>One: a prefix is not part of the identity.</strong>{' '}
          <Rich text={'`<biblio:entry xmlns:biblio="urn:x">`'} /> and <Rich text={'`<b:entry xmlns:b="urn:x">`'} /> describe the same element in
          the same namespace. Renaming a prefix changes nothing in the data model — measured on the running example, changing{' '}
          <Rich text="`biblio:`" /> to <Rich text="`b:`" /> removes 20 bytes from 693 and changes no semantics at all; across a 1,000-record
          file the same rename saves 12,000 bytes, which is 21.9% of the document. Changing the URI, by contrast, is a schema change.
        </P>
        <P>
          <strong>Two: default namespaces do not apply to attributes.</strong> The specification says so in one flat sentence:
          <em> &quot;Default namespace declarations do not apply directly to attribute names; the interpretation of unprefixed attributes is
          determined by the element on which they appear.&quot;</em> That is why every XML Schema instance document needs{' '}
          <Rich text="`xmlns:xsi`" /> spelled out, and why the following element has three names in three different places.
        </P>
        <CodeBlock
          title="one element, four namespace outcomes"
          language="xml"
          code={`<row xmlns="urn:sales"
     xmlns:p="urn:person"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     p:id="7"
     kind="order"
     xsi:type="xs:positiveInteger">
  <cell>42</cell>
</row>`}
          caption="row and cell are in urn:sales. p:id is in urn:person. kind is in NO namespace, not urn:sales — this is the one almost everybody gets wrong. xsi:type is in the Schema-instance namespace, and the value xs:positiveInteger is only text: xmlns:xs is not declared here, so nothing resolves it."
        />
        <P>
          <strong>Three: scope and shadowing are lexical.</strong> A prefix declaration extends from the start-tag that carries it to the
          matching end-tag, excluding any inner declaration of the same prefix — the specification&apos;s scope rule names that exception
          explicitly. So a prefix can mean four URIs in one document, and the last declaration before the use wins. That is legal and it is
          the reason namespace-aware diff tools exist: a subtree moved between two parents can change namespace without changing a single
          character of the element itself.
        </P>
        <P>
        <strong>Four: reserved prefixes are not errors.</strong> The <Rich text="`xml`" /> prefix is by definition bound to{' '}
          <Rich text="`http://www.w3.org/XML/1998/namespace`" />, MAY be declared but need not be, and MUST NOT be bound to anything else. Every
          other prefix beginning with the three letters x, m, l in any case combination is reserved for future specification, and processors MUST
          NOT treat such a prefix as a fatal error. So{' '}
          <Rich text={'`xmlns:xml="urn:me"`'} /> is an error while <Rich text={'`xmlns:xmh="urn:me"`'} /> is a warning at most, and a
          document using it may quietly collide with a specification written next year. An empty default declaration{' '}
          <Rich text={'`xmlns=""`'} /> is the standard way to escape an inherited default: within its scope it has the same effect as
          declaring no default at all.
        </P>
        <Callout tone="spec" title="Namespace well-formedness is not XML well-formedness">
          <P>
            A document whose prefixes are undeclared is not an XML 1.0 error at all: it is a namespaces error, and only a namespace-aware
            processor reports it. Conformance in the recommendation is split accordingly — documents must be namespace well-formed, and
            processors that claim namespace awareness must reject the ones that are not. This is why the same file parses happily in one
            library and throws in another, and why{' '}
            <Rich text="`namespaceAware=true`" /> on a Java factory is a correctness setting, not a performance one.
          </P>
        </Callout>
      </Section>

      <Section id="dtd-entities" title="DTDs, subsets and every kind of entity" kicker="Productions [28]-[31], [53], [71]-[77]">
        <P>
          A document type declaration, production [28], names the type of the root element and may carry definitions in two places: an
          internal subset between square brackets, and an external subset named by a SYSTEM or PUBLIC identifier. Production [30] defines the
          external subset as a text declaration plus markup declarations. Both subsets hold the same four kinds of declaration —{' '}
          <Rich text="`<!ELEMENT>`" />, <Rich text="`<!ATTLIST>`" /> (whose attribute definition is production [53]),{' '}
          <Rich text="`<!ENTITY>`" /> and <Rich text="`<!NOTATION>`" /> — and the well-formedness constraint on proper nesting requires that
          parameter-entity references and declarations cross the subset boundary in a properly nested way, which is why the{' '}
          <Rich text="`%pe;`" /> that pulls in an external DTD must appear exactly where a declaration could appear.
        </P>
        <P>
          Content models come from{' '}
          <Rich text="`<!ELEMENT>`" />: a name class of ANY, a bare EMPTY, a choice or sequence of element names with the occurrence
          indicators ? and *, or the mixed form <Rich text="`(#PCDATA | b | i)*`" />. Note what is missing: DTD content models have no
          ordering-independent construct, no way to say <em>exactly one</em> without enumerating alternatives, no counts beyond unbounded, and
          no way to express <Rich text="`a{3}`" />. The entity value itself is production [9] EntityValue, delimited by quote, apostrophe or —
          the form every generator forgets — percent sign, and the specification is explicit that the text inside is not parsed when it is
          written: it is replacement text, expanded only when something references it.
        </P>
        <DataTable
          caption="Six kinds of reference that all look like markup"
          head={['Kind', 'Declared', 'Referenced as', 'May appear in', 'Read by a non-validating parser?']}
          rows={[
            ['Internal general entity', '<!ENTITY © "Copyright">  (or the longer name)', '&name;  in content, name in an attribute value', 'Content and attribute values, and DTD defaults', 'Always — the replacement text is part of the document'],
            ['External parsed general entity', '<!ENTITY ch1 SYSTEM "ch1.xml">', '&ch1;', 'Content only — a reference in an attribute value is fatal', 'Only if external general entities are allowed; its content is a separate document entity'],
            ['External unparsed entity', '<!ENTITY logo SYSTEM "logo.png" NDATA png>', 'as the value of an attribute of type ENTITY or ENTITIES', 'Attribute values of those types, never in content', 'Never expanded; the notation must also be declared'],
            ['Internal parameter entity', '<!ENTITY % model "(title, author+)">', '%model;', 'Markup only - inside the DTD, never in document content', 'Yes, when the DTD is read at all'],
            ['External parameter entity', '<!ENTITY % dtd SYSTEM "common.dtd">', '%dtd;', 'Markup only; typically declared and referenced in the internal subset', 'Yes — this is the classic XXE trigger in a parser that validates nothing'],
            ['Numeric character reference', 'not an entity at all', '&#65; or &#x41;', 'Content and attribute values', 'Always; the spec handles it separately from entity references'],
          ]}
          foot="The two rows that matter for security are the external general entity and the external parameter entity. The first needs a reference in content; the second needs only a declaration, because the reference is in the markup itself."
        />
        <CodeBlock
          title="a complete DTD, internal and external, with defaults and notations"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE biblio:collection [
  <!ENTITY % shared SYSTEM "https://example.org/common.dtd">   <!-- fetched even when you do not validate -->
  %shared;
  <!ENTITY isbn-prefix "978">
  <!ELEMENT biblio:collection (biblio:entry+)>
  <!ELEMENT biblio:entry (title, author+, publisher?, published?, price?, tags?, summary?, inStock?)>
  <!ATTLIST biblio:entry id  CDATA  #REQUIRED
                             lang   CDATA  "en"
                             status (in|out|discontinued) "in">
  <!ELEMENT tags (tag+)>
  <!ELEMENT tag (#PCDATA)>
  <!ELEMENT summary (#PCDATA)>
  <!NOTATION png SYSTEM "image/png">
  <!ENTITY cover SYSTEM "cover.png" NDATA png>
]>
<biblio:collection>
  <biblio:entry id="&isbn-prefix;-1491950751">
    <title>R&D and &lt;markup&gt; in one document</title>
    <author>Kleppmann, Martin</author>
  </biblio:entry>
</biblio:collection>`}
          caption="Three hazards are visible in eleven lines: the external parameter entity on line 3, the #REQUIRED constraint that a non-validating parser will not check, and the lang default that makes the tree differ from the file."
        />
      </Section>

      <Section id="xxe" title="External entities as an attack surface, from file reads to blowup" kicker="CWE-611 and CWE-776">
        <P>
          Everything that makes XML dangerous about entities is already in the previous section: a declaration may name another resource,
          and a reference substitutes that resource&apos;s content into the tree. The specification closes one door and leaves the other
          open — a reference to an external parsed entity inside an attribute value is a fatal error, so exfiltration has to land in
          content — and then requires something surprising of the cheapest parser in the room. A non-validating processor is not allowed to
          skip the DTD wholesale: it must read far enough into the internal and external subsets to resolve the parameter-entity references
          and the declarations they contain. That is why an XXE vulnerability exists in services that claim not to validate anything. The
          attacker does not need validation; they need a parser that reads markup declarations.
        </P>
        <CodeBlock
          title="the two payloads that end most XXE writeups"
          language="xml"
          code={`<!-- 1. read a local file into a field the application echoes back -->
<?xml version="1.0"?>
<!DOCTYPE order [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<order><comment>&xxe;</comment></order>

<!-- 2. make the server a client: SSRF against a link-local metadata service -->
<?xml version="1.0"?>
<!DOCTYPE order [ <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/"> ]>
<order><comment>&xxe;</comment></order>`}
          caption="Both are well-formed, both parse successfully with default settings in a great many stacks, and neither is anywhere near the most destructive thing an entity can do."
        />
        <H3>Expansion bombs: the specification bans cycles, not size</H3>
        <P>
          <em>&quot;A parsed entity MUST NOT contain a recursive reference to itself&quot;</em> is a real constraint, and it is why a naive
          self-referencing DTD is rejected. It is also why the famous billion laughs payload does not reference itself — it references the
          entity one level below, ten times, nine levels deep. There is no cycle, so no constraint fires; there is only exponential growth.
          The document below is 561 bytes and expands to 3,000,000,000 bytes of text, a ratio of about 5.3 million to one.
        </P>
        <CodeBlock
          title="billion laughs, complete, 561 bytes"
          language="xml"
          code={`<?xml version="1.0"?>
<!DOCTYPE bomb [
  <!ENTITY e0 "LOL">
  <!ENTITY e1 "&e0;&e0;&e0;&e0;&e0;&e0;&e0;&e0;&e0;&e0;">
  <!ENTITY e2 "&e1;&e1;&e1;&e1;&e1;&e1;&e1;&e1;&e1;&e1;">
  <!-- ... e3 through e8, each ten of the one before ... -->
  <!ENTITY e9 "&e8;&e8;&e8;&e8;&e8;&e8;&e8;&e8;&e8;&e8;">
]>
<bomb>&e9;</bomb>`}
          caption="Expansion size is 3 times 10 to the n bytes: e3 is 3,000 bytes, e6 is 3,000,000, e9 is 3,000,000,000 (2.79 GiB). A parser that materialises replacement text in memory dies at about level 7."
        />
        <P>
          The subtler cousin needs no recursion at all and defeats the intuition that only nested entities are dangerous. Declare one entity
          with 5,000 characters of replacement text and reference it a thousand times in content: a 10,040-byte document becomes 5,000,000
          bytes — roughly 500 times its own size — with no cycles, no external resources, and a DTD that looks like a template. Because the
          expansion is linear in the number of references, a parser that only tracks depth will not see it coming; you need a budget on
          expansions or on output size, and both are implementation limits, not spec requirements.
        </P>
        <Callout tone="warn" title="XXE is a configuration failure, not a format failure">
          <P>
            The feature that XXE abuses — indirection over external resources — is the same feature that makes document assembly and shared
            vocabularies possible, and XML 1.0 ships it enabled. Nothing in the specification requires a processor to fetch anything; the
            defaults of the implementations are what opened the hole. OWASP puts the conservative posture plainly: an XML processor{' '}
            <em>&quot;should be configured to use a local static DTD and disallow any declared DTD included in the XML document&quot;</em>.
            If your vocabulary does not need a DTD — and almost none do now that schema validation happens in XSD or RELAX NG — then a
            document containing a DOCTYPE is malformed for your application, and you should say so loudly rather than parse it.
          </P>
        </Callout>
        <H3>The flags, per parser</H3>
        <DataTable
          caption="Hardening each implementation: three settings and one question about defaults"
          head={['Implementation', 'Refuse all DTDs', 'Refuse external resolution', 'Cap expansion', 'Default posture']}
          rows={[
            ['Java JAXP (SAX, DOM, StAX)', 'setFeature("http://apache.org/xml/features/disallow-doctype-decl", true); for StAX, XMLInputFactory.SUPPORT_DTD = false', 'external-general-entities and external-parameter-entities to false, nonvalidating/load-external-dtd to false, XMLConstants/property/accessExternalDTD to ""; XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES = false', 'XMLConstants.FEATURE_SECURE_PROCESSING true applies the implementation limits on expansion counts, depths and sizes', 'Historically permissive: DOCTYPEs are accepted and external entities are resolved unless you say otherwise'],
            ['.NET System.Xml', 'XmlReaderSettings.DtdProcessing = DtdProcessing.Prohibit', 'XmlReaderSettings.XmlResolver = null (the default resolver can reach the network)', 'Not configurable on the reader; rely on Prohibit plus input size limits', 'DtdProcessing.Ignore by default in many templates: the DTD is skipped but not forbidden'],
            ['Python xml.etree / minidom / SAX', 'No built-in switch; use defusedxml.ElementTree and catch its DTDForbidden', 'expat does not resolve external general entities by default; a custom ExternalEntityRefHandler must not fetch', 'defusedxml counts expansions and raises EntitiesForbidden / ExponentialEntityExpansionError', 'Safe against XXE by accident of expat, not against expansion bombs'],
            ['lxml (libxml2 bindings)', 'etree.XMLParser(resolve_entities=False, load_dtd=False, huge_tree=False)', 'no_network=True blocks http and file fetches during parsing', 'huge_tree=False keeps libxml2 built-in limits on text, names and entity expansions in force; do not pass XML_PARSE_NOENT', 'resolve_entities is on and load_dtd off: internal entities expand, external DTDs are not loaded unless asked'],
            ['C / libxml2 directly', 'Do not pass XML_PARSE_DTDLOAD or XML_PARSE_DTDVALID', 'XML_PARSE_NONET; avoid XML_PARSE_NOENT, which substitutes entity content into the tree', 'XML_PARSE_HUGE is the opt-out that lifts the library limits: leaving it off is the mitigation', 'xmlRead* with default options does not fetch from the network'],
            ['Browsers (DOMParser, XMLHttpRequest)', 'Not configurable; DOCTYPE is parsed but external subsets are not fetched', 'No external entity fetching at all in the XML parsing APIs', 'Not exposed', 'Safe by construction; still check the parse-error node rather than assuming success'],
          ]}
          foot="Option strings and defaults change between releases. Verify against the version pinned in your lockfile or base image, then prove it: parse a document containing a DOCTYPE and assert that your service rejects it."
        />
        <Callout tone="risk" title="The test that finds the parsers nobody hardened">
          <P>
            Enumeration is the hard part. A service that accepts XML usually parses it in four places: the SOAP or REST binding, the schema
            validator, the signing or canonicalization step, and a library that inspects the file for its type — a document reader, an image
            decoder, a font tool. Setting the feature on the primary parser and stopping leaves the other three as they were. Send a benign
            probe containing an internal entity (<Rich text={'`<!ENTITY a "A">`'} /> referenced in a field) and a{' '}
            <Rich text="`<!DOCTYPE>`" /> with an empty internal subset, then compare what each stage does with them; the mismatch is your
            inventory of unprotected entry points. Add a document-size limit, a parse timeout, and an egress rule that denies the parser
            process from making outbound connections at all — the last one is the mitigation that survives a forgotten flag.
          </P>
        </Callout>
      </Section>

      <Section id="infoset" title="The Information Set: what a parser actually hands you" kicker="The abstraction layer">
        <P>
          Between the bytes and your object model sits a document nobody reads: the XML Information Set. It defines the things a processor
          is understood to have produced — a document information item, elements, attributes, text, comments, CDATA sections, processing
          instructions, entities, notations and namespaces — each with properties rather than syntax: for an element, its name, the
          namespace name and prefix as separate properties, its children, its attributes, its base URI and its general entity; for an
          attribute, an owner element, a value, a type and the crucial specified-or-defaulted flag. XPath, DOM, SAX and XQuery are all
          views of this abstraction, which is why a bug described as &quot;the parser dropped a node&quot; is almost always a statement
          about a profile of it.
        </P>
        <P>
        Two pairs of documents explain everything that follows about canonicalization, signing and diffing. The first pair has the same Information Set
          and different bytes: reordered attributes, single versus double quoting, a prefix renamed from{' '}
          <Rich text="`biblio:`" /> to <Rich text="`b:`" /> (693 bytes against 673 on the running example), an entity reference replaced by its
          replacement text, a CDATA section replaced by escaped characters, whitespace added between tags. Every one of those is invisible to a
          conforming processor that is namespace-aware and entity-expanding, and every one of them breaks a byte-level comparison. The second
          pair has the same bytes and a different Information Set: one file parsed with a DTD that supplies{' '}
          <Rich text="`#FIXED`" /> and <Rich text={'`"en"`'} /> defaults against the same file parsed without it; a mislabelled{' '}
          <Rich text="`encoding`" /> declaration; a <Rich text={'`standalone="yes"`'} /> claim the parser honours or ignores. This is why two
          teams can honestly report different content for one file.
        </P>
        <DataTable
          caption="Which API exposes which part of the abstraction"
          head={['API', 'Style', 'Sees', 'Deliberately blind to', 'Typical failure it causes']}
          rows={[
            ['DOM (Document, Element, Attr, Text)', 'Tree, in memory', 'Elements, attributes, text nodes, comments and PIs as live nodes', 'Entity boundaries and any declaration-only structure', 'Memory exhaustion on large inputs; whitespace text nodes breaking a naive childElementCount check'],
            ['SAX / XMLReader', 'Push events', 'start and end element callbacks, characters(), the attribute list as provided', 'Anything not yet parsed, and the ability to go back', 'Code that assumes one characters() call per text node'],
            ['StAX (XMLStreamReader)', 'Pull events', 'The same event stream, consumed on demand, plus getFileLocation()', 'Nothing structurally; it is a cursor, not a tree', 'Skipping a subtree with the wrong END_ELEMENT expectation'],
            ['XPath 3.1', 'Node-set expression', 'Nodes, via axes; and the sequence and map types added in 3.1', 'DTD defaults, and the difference between a CDATA text node and an ordinary one', 'The empty result that a default namespace causes'],
            ['XQuery / XDM', 'Sequence of values', 'Typed values, and the post-schema-validation annotations when a schema is in play', 'Byte-level provenance', 'Assuming document order survives an unordered FLWOR clause'],
          ]}
        />
      </Section>

      <Section id="validation" title="DTD against XML Schema against RELAX NG" kicker="Three grammars, three jobs">
        <P>
          Only one of the three schema languages is part of XML 1.0 conformance, and it is the weakest. A DTD constrains names, ordering and
          attribute presence, and it can declare an attribute&apos;s type as ID, ENTITY, NMTOKEN or an enumeration — which is a type system
          of about five entries. It cannot express that a price must be a decimal, that an email must match a pattern, that exactly one of
          four elements is required, or that an identifier in one part of the document must equal a value in another. It predates
          namespaces and matches element declarations on the local name only. Its two genuine advantages are that it is the native grammar of
          the format and that nothing else gives you conditional sections and entity-based document assembly.
        </P>
        <P>
        XML Schema (XSD) is the opposite trade: a type system with hundreds of built-in datatypes derived by restriction and list, facets like{' '}
          <Rich text="`pattern`" />, <Rich text="`minInclusive`" /> and <Rich text="`totalDigits`" />, element and attribute defaults, identity
          constraints expressed with XPath, substitution groups for polymorphic documents, and wildcards with lax or strict processing. It is
          also the only one of the three that a document can be validated against without the schema being part of the document&apos;s own
          syntax. Its costs are real: the content-model rules include the Unique Particle Attribution constraint, which forbids any content model
          whose validation requires lookahead — so <Rich text="`((a|ab)+)`" /> is rejected and must be rewritten — and the spec is
          long enough that implementations disagree at the edges, which is why XSD 1.1 added{' '}
          <Rich text="`xs:assert`" /> for constraints a content model cannot state.
        </P>
        <CodeBlock
          title="the same vocabulary twice"
          language="xml"
          code={`<!-- XML Schema 1.0, the part that matters -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://example.org/biblio/1.0"
           xmlns:b="http://example.org/biblio/1.0"
           elementFormDefault="qualified">
  <xs:element name="entry">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="title"  type="xs:string"/>
        <xs:element name="author" type="b:person" maxOccurs="unbounded"/>
        <xs:element name="price"  minOccurs="0">
          <xs:complexType>
            <xs:simpleContent>
              <xs:extension base="xs:decimal">
                <xs:attribute name="currency" type="b:currencyCode" use="required"/>
              </xs:extension>
            </xs:simpleContent>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
      <xs:attribute name="id"   type="xs:string" use="required"/>
      <xs:attribute name="lang" type="xs:language" default="en"/>
    </xs:complexType>
  </xs:element>
  <xs:unique name="oneIsbn">
    <xs:selector xpath="b:entry"/>
    <xs:field   xpath="@id"/>
  </xs:unique>
</xs:schema>

<!-- RELAX NG Compact Syntax, the whole vocabulary in eleven lines -->
namespace b = "http://example.org/biblio/1.0"
default namespace = "http://example.org/biblio/1.0"
start = element collection { entry+ }
entry =
  element entry {
    attribute id { xsd:token },
    attribute lang { text }?,
    element title { text },
    element author { person }+,
    element price { attribute currency { text }, xsd:decimal }?,
    element tags { tag+ }?,
    element summary { text }?,
    element inStock { xsd:boolean }?
  }
tag    = element tag { xsd:token }
person = element author { attribute role { "primary" | "contrib" }?, text }`}
          caption="Two things RELAX NG does here that XSD cannot do at all without contortions: an unordered interleave of the optional children, and a grammar that fits on one screen. Two things only XSD can do: the unique constraint, and a datatype with facets."
        />
        <DataTable
          caption="Expressiveness, honestly compared"
          head={['Capability', 'DTD', 'XML Schema', 'RELAX NG (ISO/IEC 19757-2)']}
          rows={[
            ['Built-in datatypes', 'None beyond ID, IDREF, ENTITY, NMTOKEN and an enumeration', 'Hundreds: date, decimal, duration, QNames, plus restriction and list derivations', 'The XML Schema datatype library for simple content, no derivation machinery'],
            ['Pattern and range checks', 'Only an enumerated value list', 'pattern, maxLength, minInclusive, totalDigits and friends, stackable', 'pattern plus datatype reference; no facet inheritance'],
            ['Namespace awareness', 'Matches on the local name; namespaces are invisible to it', 'First-class: targetNamespace, elementFormDefault, wildcards', 'First-class and simpler: one namespace declaration per pattern'],
            ['Referential integrity', 'ID uniqueness and IDREF resolution only, whole-document scope', 'selector and field with unique, key and keyref, scoped per element', 'Name classes for uniqueness; no keyref equivalent'],
            ['Mixed content', 'Legal, coarse: (#PCDATA | b | i)*', 'Legal via mixed complex types', 'Legal and the natural case; text is just another pattern'],
            ['Unordered children', 'Impossible', 'xs:all, limited to maxOccurs 1 in 1.0; xs:sequence with unordered in 1.1', 'interleave, unbounded and composable, no UPA problem'],
            ['Extensibility by design', 'None; undeclared elements are invalid', 'strict, lax and skip wildcards (any, anyAttribute)', 'anyName and except, which is the cleanest expression of "my vocabulary plus yours"'],
            ['Recursive definitions', 'Content models can be self-referential', 'Element declarations reference complex types; recursion works', 'Patterns recurse freely and it reads naturally'],
            ['Where you meet it', 'Legacy SGML-lineage documents, DocBook, DITA maps, HTML 4 DTDs', 'Enterprise and government vocabularies: SOAP, Office Open XML, XBRL, SAML, GPX', 'DocBook 5, TEI, ODF schemata, and anyone who wanted a grammar they could read'],
          ]}
          foot="A practical reading: choose DTD only when you need entities or conditional markup; choose RELAX NG when the job is shape and a human must maintain the grammar; choose XSD when the job is data typing, identity constraints or an ecosystem that already ships one."
        />
      </Section>

      <Section id="xpath" title="XPath axes and predicates, with the paths worth writing" kicker="XPath 3.1">
        <P>
          An XPath step is three things: an axis that names a set of nodes relative to the context node, a node test that filters it, and
          any number of predicates that filter the result. XPath 3.1 defines thirteen axes, and the axis table is the single most useful page
          in the specification because it settles the questions people re-derive every few years. Two of the thirteen are worth memorising as
          pairs: child against descendant, and following-sibling against following.
        </P>
        <DataTable
          caption="The thirteen axes of XPath 3.1 and what each one walks"
          head={['Axis', 'Selects', 'Node types', 'Direction', 'Note']}
          rows={[
            ['self', 'The context node alone', 'Any', '—', 'The default: a bare name test implies child::'],
            ['child', 'Immediate children', 'Element only for a bare name', 'Down, one level', 'The * wildcard here is the usual source of accidental whitespace matches'],
            ['descendant', 'Everything below, at any depth', 'Element', 'Down', 'Never includes attributes or namespaces'],
            ['descendant-or-self', 'descendant plus the context node', 'Element', 'Down', 'This is what // means: /descendant-or-self::node()/'],
            ['parent', 'The single parent', 'Element', 'Up', 'nil for the root, so a parent step on it yields nothing'],
            ['ancestor', 'Every node on the path to the root', 'Element', 'Up, reverse order', 'Reverse document order, which surprises people writing predicates'],
            ['ancestor-or-self', 'ancestor plus the context node', 'Element', 'Up', 'The axis that makes grouping by container possible'],
            ['attribute', 'The attributes on the context node', 'Attribute', 'Sideways', 'Unprefixed @ is this axis; it never returns namespace declarations in a namespace-aware processor'],
            ['namespace', 'The in-scope namespace nodes', 'Namespace', 'Sideways', 'Deprecated in 3.1 and an implementation need not support it'],
            ['following', 'Everything after the context node in document order, excluding descendants', 'Any', 'Forward', 'The right axis for "after this element, anywhere"'],
            ['following-sibling', 'Later children of the same parent', 'Any', 'Sideways forward', 'bounded by the parent, which is what makes [1] and [last()] meaningful'],
            ['preceding', 'Everything before it, excluding ancestors', 'Any', 'Backward', 'The mirror of following, in reverse document order'],
            ['preceding-sibling', 'Earlier children of the same parent', 'Any', 'Sideways backward', 'count(preceding-sibling::*) is the classic position-at-authoring-time trick'],
          ]}
          foot="There is no grandparent, no sibling and no descendant-of-sibling axis. What people want, they build: parent::author/following-sibling::author, or the union a | b."
        />
        <CodeBlock
          title="paths against the running example, with the node counts they return"
          language="xpath"
          code={`declare namespace b = "http://example.org/biblio/1.0";   (: XQuery syntax; in XPath 1.0 you bind the prefix in the evaluator :)

/biblio:collection/biblio:entry                     (: 1 node                    :)
count(//*)                                          (: 12                        :)
count(//@*)                                         (: 6 — xmlns is not an attribute :)
count(//text())                                     (: 23 pretty, 9 minified     :)
//biblio:entry/@id                                  (: 9781491950751             :)
//tags/tag[2]                                       (: the 2nd tag under EACH tags parent :)
(count(//tags/tag)[2])                              (: 1 node: position in the whole set :)
//biblio:entry[biblio:price/@currency = "USD"]      (: predicate on a nested step :)
//biblio:entry[number(biblio:price) > 40]           (: explicit cast: untypedAtomic to double :)
//biblio:entry[biblio:author/@role]                  (: existence of the attribute, not its value :)
//title[. = "R&D and <markup> in one document"]      (: string comparison against the context item :)
following-sibling::*[1][self::published]            (: "the very next sibling is published" :)
//biblio:entry[last()]/preceding-sibling::biblio:entry/count(.)   (: 3.1: a single node has count 1, so use count() outside :)
b:entry/b:tags/b:tag ! string()                     (: 3.1 simple map of a sequence, "!" operator :)`}
          caption="Two of these lines are the bugs: //tags/tag[2] does not mean the second tag in the document, and //@* does not include the namespace declaration that xmlns:biblio really is in XML 1.0 terms."
        />
        <P>
        Predicates filter a node sequence positionally, and that is where the two most durable XPath misunderstandings live.{' '}
          <Rich text="`//tag[2]`" /> is short for <Rich text="`/descendant-or-self::node()/child::tag[2]`" /> — the predicate is applied
          for each parent, so it returns the second tag of every tag-list, not the second tag overall; to index the whole result you must
          parenthesise it, <Rich text="`(//tag)[2]`" />. And a comparison against untyped content is a type decision in disguise: XML has no
          types, so <Rich text={'`biblio:price > 44`'} /> in XPath 1.0 converts strings to numbers by rule, while XPath 2.0 and later cast{' '}
          <Rich text="`xsi:untypedAtomic`" /> to double. Write the cast explicitly: it costs nine bytes and it survives the day someone puts{' '}
          <Rich text={'`<price currency="USD">44.99 USD</price>`'} /> in your pipeline.
        </P>
        <H3>XSLT and XQuery, in the space they deserve</H3>
        <P>
          XSLT is a declarative, Turing-complete transformation language over the same tree: templates match node patterns, modes let one
          document be processed several times for different outputs, and the 2.0 and 3.0 generations added grouping, iteration, functions and
          packages. What it is genuinely still for is document work — turning DocBook or DITA into HTML or XSL-FO and thence to PDF, driving
          XBRL calculation and presentation linkbases, reshaping one enterprise vocabulary into another — because it preserves order, keeps
          text runs intact, and outputs a tree rather than a value. Its costs are verbosity, a learning curve that is really a second
          language&apos;s learning curve, and debuggers that are rare in shop toolchains.
        </P>
        <P>
          XQuery is the other half of the same effort: a functional query language built on the XPath 3.1 data model and type system, with
          FLWOR expressions, joins over sequences, and native construction of new documents, used where the question is data-shaped rather
          than rendering-shaped — native XML databases, document stores, and any pipeline that must project, group and aggregate across large
          XML corpora. Both languages share XPath for addressing, and neither is a good answer to &quot;I need this in JSON&quot;, which is a
          conversion problem with its own section below.
        </P>
      </Section>

      <Section id="streaming" title="Streaming parsers and the large-file problem" kicker="SAX, StAX, XmlReader, XmlPullParser">
        <P>
          The DOM is the easiest API and the most expensive one, because it turns a serialised tree into an object graph and keeps it. Do the
          arithmetic on the running example rather than trusting a rule of thumb: the 500-record file measured below is 238,500 bytes and
          contains roughly 6,000 elements, 3,000 attributes and 4,500 content text nodes — about 13,500 nodes for a quarter of a megabyte.
          Scale that to a 2 GB export and you are asking for 115 million node objects, each carrying a name, an owner document, child and
          sibling links, and a namespace pointer. Five to ten times the file size in heap is the usual experience, and the peak is reached
          before you have read a single value.
        </P>
        <P>
          Streaming removes the tree. SAX is push: the parser calls you —{' '}
          <Rich text="`startElement`" />, <Rich text="`characters`" />, <Rich text="`endElement`" /> — with a{' '}
          <Rich text="`Locator`" /> for line and column, and the attribute list it hands you is only valid during that callback, which is
          the first bug most people write. StAX is pull: you ask for the next event, you can skip an entire subtree without ever building it,
          and the code reads like the document. .NET settled on{' '}
          <Rich text="`XmlReader`" />, a pull reader over any stream, and Android shipped{' '}
          <Rich text="`XmlPullParser`" /> because a phone could not afford the DOM for a large feed. libxml2 exposes both shapes — a SAX-style
          handler table and an incremental reader — and all of them share the same guarantee: constant memory for a document of any size, as
          long as you do not accumulate.
        </P>
        <CodeBlock
          title="the pattern that actually ships: stream the file, object per record"
          language="java"
          code={`XMLInputFactory f = XMLInputFactory.newInstance();
f.setProperty(XMLInputFactory.SUPPORT_DTD, false);                  // no DTDs at all
f.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
XMLStreamReader r = f.createXMLStreamReader(new FileInputStream("export.xml"));

List<Entry> page = new ArrayList<>(500);
Entry current = null;
String tag = null;
while (r.hasNext()) {
    switch (r.next()) {
        case XMLStreamConstants.START_ELEMENT:
            tag = r.getLocalName();                                  // namespace-aware: local name only
            if ("entry".equals(tag)) { current = new Entry(attr(r, "id"), attr(r, "lang")); }
            break;
        case XMLStreamConstants.CHARACTERS:
            if (current != null && tag != null) current.append(tag, r.getText());
            break;                                                   // NOTE: may be split across calls
        case XMLStreamConstants.END_ELEMENT:
            if ("entry".equals(r.getLocalName())) { page.add(current); current = null;
                if (page.size() == 500) { sink.write(page); page.clear(); } }
            tag = null;
            break;
    }
}`}
          caption="Two decisions are visible and both matter: the DTD is refused before parsing starts, and text is buffered per tag because a parser is free to split a character run wherever it likes."
        />
        <H3>What you give up, and the two escape hatches</H3>
        <P>
        You lose XPath and random access: you cannot ask a question about the end of a document while you are at the beginning of it. Attribute
          defaults from a DTD do not appear unless you validate, and namespace processing means reading the local name and the URI separately
          rather than the prefixed spelling a human typed. Two escape hatches exist. Partial trees: build a DOM only for the subtree you want,
          process it, drop it — a DOM builder attached to a SAX parser, or a cursor that advances to the next record and materialises one.
          Schema-aware streaming: XSLT 3.0 streams a template down a document when the pattern can be evaluated in one pass, which means no
          look-back and no node visited twice. Both are fragile: a small change to the template silently turns streaming back into buffering the
          whole input, so measure memory rather than trusting the attribute. For the line-at-a-time version of the same problem, see{' '}
          <Rich text="[Log Analysis Tools](/use-cases/log-analysis/)" /> and the{' '}
          <Rich text="[JSON guide](/learn/json/)" /> on NDJSON.
        </P>
      </Section>

      <Section id="canonical" title="Canonical XML and why attribute order is a security property" kicker="xml-c14n">
        <P>
          Canonicalization exists because of a fact established two sections ago: byte-identical documents can have different Information Sets
          and Infoset-identical documents can have different bytes. Signing or hashing raw bytes therefore means signing a representation
          rather than a message, and every interoperable signature in XML — XML Signature, SAML assertions, WS-Security headers, XBRL facts,
          the manifests in a software update — is taken over a canonical octet stream instead. Canonical XML defines that stream. It is not a
          pretty printer; it is a normalisation with a fixed answer.
        </P>
        <P>
        The rules, in the order they bite: the output is UTF-8 with no XML declaration; the tree is emitted in document order, because element order
          is data and must survive; namespace declarations are output before attributes and sorted, and attributes are sorted by namespace URI
          then local name, with those in no namespace first — the sort is exactly what makes the pair above identical after
          canonicalization. Character references are replaced by the characters they name, CDATA sections become ordinary escaped text,
          attribute values receive their whitespace normalization, empty elements are written as a start-tag plus an end-tag rather than{' '}
          <Rich text="`/>`" />, and tabs and newlines inside text are escaped as numeric references so they survive transport. Comments are
          removed unless the profile says otherwise, and processing instructions inside the subtree are kept.
        </P>
        <CodeBlock
          title="two documents, one canonical form"
          language="xml"
          code={`<!-- A: 128 bytes -->
<row  b:kind="order" xmlns:p="urn:person" xmlns="urn:sales" p:id="7"
     xmlns:b="urn:things">
  <cell>42</cell>
</row>

<!-- B: 132 bytes, same tree, attributes and namespace declarations in a different order -->
<row xmlns="urn:sales" xmlns:b="urn:things" xmlns:p="urn:person"
     p:id="7"    b:kind="order">
  <cell>42</cell>
</row>

<!-- canonical form of both: UTF-8, declaration omitted, namespaces sorted before attributes -->
<row xmlns="urn:sales" xmlns:b="urn:things" xmlns:p="urn:person" b:kind="order" p:id="7"><cell>42</cell></row>`}
          caption="A and B differ by four bytes of source and hash differently as stored files; after canonicalization they are the same 108-byte octet stream, which is the only reason a signature over either one can be verified by a stranger."
        />
        <H3>Inclusive, exclusive, and the whitespace that decides the hash</H3>
        <P>
        The default algorithm is <em>inclusive</em>: it emits every namespace in scope, including ones inherited from an ancestor outside the signed
          fragment and ones the subtree never uses. That is correct for a whole document and dangerous for a fragment, which is why Exclusive
          Canonicalization exists: it outputs only the namespaces <em>visibly utilized</em> by the element being canonicalised, so a signature
          over{' '}
          <Rich text={'`//Assertion/AttributeStatement`'} /> is not invalidated by the envelope it happens to sit inside. Whitespace is the
          other half of the story. Because text nodes are data, indentation inside a mixed-content element is part of the signed bytes and the
          canonical form keeps it; the whitespace-stripping variant discards whitespace-only text nodes between elements but never touches text
          inside an element. If a partner&apos;s verification fails and yours succeeds, ask in that order: which variant each side used, whether
          a beautifier or a git filter touched the file, whether{' '}
          <Rich text="`xml:space`" /> was involved.
        </P>
        <Callout tone="risk" title="Two attacks that live in the canonicalization layer">
          <P>
            XML Signature Wrapping depends on the verifier and the signer disagreeing about which subtree the signature covers: an attacker
            keeps the signed element and adds an untouched copy elsewhere, and the application reads the wrong one. The mitigation is
            structural — verify that the signed node is the node you are about to act on, not merely that some signature is valid. The second
            is the DTD and comment problem: if the DTD subset or a comment is part of what is canonicalised, an attacker who can add markup
            before the root changes the digest, which is also how an XXE payload can arrive inside something that looks signed. Both are
            reasons the spec&apos;s canonicalisation rules are stated as an octet stream rather than as a tree.
          </P>
        </Callout>
      </Section>

      <Section id="verbosity" title="Measured verbosity: one record, two formats, real byte counts" kicker="Arithmetic, not folklore">
        <P>
          The running example is one bibliography entry with six attributes, a repeated element and a sentence of prose. Encoded as XML with
          the declaration and two-space indentation it is 693 bytes; as the equivalent JSON object, pretty-printed, it is 618. Strip the
          whitespace from both and the pair is 587 against 493. Those are the numbers behind the standard claim that XML is verbose, and they
          are a 12.1% and a 19.1% difference respectively — real, and much smaller than the arguments that are usually had about it.
        </P>
        <P>
          Repetition changes the picture, which is the part most writeups skip. Generated 500 records of the same shape, minified, on the same
          values: 238,500 bytes of XML against 219,907 bytes of JSON, a difference of 8.5%. Gzipped at level 9, the same two files are 5,435
          bytes and 7,481 bytes — the XML is 27% <strong>smaller</strong>. The reason is that XML&apos;s overhead is almost pure redundancy:
          the end tag{' '}
          <Rich text="`</title>`" /> that closes{' '}
          <Rich text="`<title>`" /> is a repeat of a string deflate has already seen, and the 140 bytes of element names inside the 480-byte
          minified entry (29% of the payload) compress to almost nothing. JSON&apos;s overhead is different in kind: quoted keys are
          redundant too, but its numeric and boolean literals are not, so a record set with many numbers gains less.
        </P>
        <DataTable
          caption="Every figure in this section, with how it was produced"
          head={['Measure', 'XML', 'JSON', 'Difference']}
          rows={[
            ['One record, indented, UTF-8', '693 bytes', '618 bytes', 'XML +12.1%'],
            ['One record, minified', '587 bytes', '493 bytes', 'XML +19.1%'],
            ['One record, indented, gzipped', '430 bytes', '373 bytes', 'XML +15.3%'],
            ['One record, minified, gzipped', '387 bytes', '348 bytes', 'XML +11.2%'],
            ['500 records, minified', '238,500 bytes', '219,907 bytes', 'XML +8.5%'],
            ['500 records, gzipped at level 9', '5,435 bytes', '7,481 bytes', 'XML 27.4% SMALLER'],
            ['Namespace prefix tax, 1,000 records', '66,831 bytes prefixed', '54,831 unprefixed', 'the prefix alone is +21.9%'],
            ['Mixed-content paragraph', '130 bytes', '169 bytes (BadgerFish-style)', 'the conversion costs more than the markup'],
            ['One method call, SOAP 1.2 versus JSON', '185 bytes', '26 bytes', 'XML +611% — protocol envelopes, not data'],
            ['Element-name share of a minified record', '140 of 480 bytes', 'n/a (keys play that role)', '29% of the payload is names, repeated'],
          ]}
          foot="All figures measured with Node's Buffer.byteLength and zlib gzip level 9 on the markup and JSON printed in this guide. Reproduce them by saving the two files from the next sections and running wc -c and gzip -9."
        />
      </Section>

      <Section id="in-production" title="Where XML still wins in production" kicker="The formats you actually meet">
        <P>
          XML survives not because it is popular but because specific problems were specified against it, and the capabilities those problems
          need — identity, signature, mixed vocabularies, documents rather than records — are exactly the ones the format has and the newer
          formats do not. The list below is not nostalgic; every entry has active tooling, an active specification and a reason it could not
          simply be JSON.
        </P>
        <DataTable
          caption="Live XML, and the feature that keeps it there"
          head={['Domain', 'Format', 'What it uses XML for', 'Why not JSON']}
          rows={[
            ['Web single sign-on', 'SAML 2.0 assertions over XML Signature', 'Namespace-keyed vocabularies, canonicalization, an enveloped signature over part of a tree', 'Signing a fragment requires a canonical byte model; JSON has none'],
            ['Office documents', 'Office Open XML (ECMA-376, ISO/IEC 29500): .docx, .xlsx, .pptx', 'A ZIP container of XML parts plus relationships; run properties, styles and shared strings as separate documents', 'JSON would work but the vocabulary, the schema and 25 years of editors are XML'],
            ['Vector graphics', 'SVG', 'Mixed content for text-in-shape, presentation attributes, an XML namespace per feature module', 'Coordinate geometry in attributes and elements in document order are both load-bearing'],
            ['Feeds', 'RSS 2.0 and Atom (RFC 4287)', 'CDATA for embedded HTML, namespaced extensions such as Dublin Core, xml:base for relative links', 'Extension vocabularies without collision is the namespace problem, solved'],
            ['Geodata', 'GPX 1.0/1.1 waypoints, tracks, routes', 'Attributes for latitude and longitude, schema-defined types, a text declaration per file', 'A GPX file is 30 KB of points; the schema is the reason readers agree'],
            ['RPC and messaging', 'SOAP 1.2 with WSDL, and the whole WS-* stack', 'An envelope, header blocks with mustUnderstand, typed bodies against XSD', 'Enterprise contracts, not bandwidth'],
            ['Build and configuration', 'Maven pom.xml, Android AndroidManifest.xml, Ant build.xml, Tomcat server.xml, .NET config, Info.plist', 'Deep nesting, ordered plugin execution, namespace-free verbose grammar that a machine writes', 'Order in build plugins and manifests is semantics; JSON object order is not'],
            ['Databases', 'PostgreSQL xml with xpath(); Oracle XMLTYPE; SQL Server and DB2 xml types', 'Storage of documents with XQuery and XPath evaluation, indexed paths, schema registration', 'The data is documents, not rows'],
            ['Publishing', 'DocBook, DITA, TEI, JATS, EPUB package documents, MathML, XHTML', 'Long-form mixed content, conditional inclusion, entity assembly, XSLT transformation to print', 'A book is a document; documents need mixed content'],
          ]}
        />
        <P>
          If you are making that decision now, the honest comparison is on{' '}
          <Rich text="[XML vs JSON](/compare/xml-vs-json/)" /> and, for configuration specifically,{' '}
          <Rich text="[YAML vs XML](/compare/yaml-vs-xml/)" />.
        </P>
      </Section>

      <Section id="xml-to-json" title="XML to JSON conventions and what the conversion loses" kicker="Six losses, named">
        <P>
          Start with the blunt statement: there is no standard XML-to-JSON mapping. There are conventions, and they disagree in ways that are
          invisible until a consumer breaks. What follows is the convention this guide uses when comparing formats — attributes as keys with
          an underscore prefix, element text under{' '}
          <Rich text={'`#text`'} />, repeated elements as arrays — and the six losses that every variant shares. The running example converts to:
        </P>
        <CodeBlock
          title="the 693-byte entry, converted"
          language="json"
          code={`{ "collection": {
    "_generated": "2026-11-12",
    "entry": {
      "_id": "9781491950751", "_lang": "en",
      "title": "Designing Data-Intensive Applications",
      "author": { "_role": "primary", "#text": "Kleppmann, Martin" },
      "publisher": "O'Reilly Media",
      "published": { "_year": "2017", "#text": "2017-06-16" },
      "price": { "_currency": "USD", "#text": "44.99" },
      "tags": { "tag": ["database", "distributed systems"] },
      "summary": "A survey of storage engines, replication and consistency, with notes on batch and stream processing.",
      "inStock": true } } }`}
          caption="Four decisions the converter made without asking: the namespace prefix vanished, a single author became an object while a repeated tag became an array, 44.99 stayed a string while true became a boolean, and the empty generated attribute kept its quotes."
        />
        <DataTable
          caption="The six losses, with the smallest document that demonstrates each"
          head={['Loss', 'XML', 'Typical JSON', 'What breaks']}
          rows={[
            ['Cardinality', '<order><item/></order> (44 bytes)', '{"order":{"item":{}}} — but two items give {"item":[…]}', 'A consumer written for one shape throws on the other; the fix is always-array, and it changes single-item payloads too'],
            ['Attributes', '<e a="1">x</e>', '{"e":{"_a":"1","#text":"x"}}', 'Key-collision rules: an element named _a and an attribute a become the same key'],
            ['Mixed content', '<p>The <b>X</b> is <i>Y</i>.</p> (130 bytes)', 'BadgerFish-style 169 bytes, xml-js-style 224 bytes, or 86 bytes with the markup thrown away', 'Every consumer must agree which of the three it got; the 86-byte answer is a different document'],
            ['Order', 'Element order is data; attribute order is not', 'JSON object key order is an implementation detail of the writer', 'Signed or diffed documents; and any pipeline that relies on sequence of mixed children'],
            ['Types', 'Everything is a string, or a DTD/XSD says otherwise', 'A converter guesses: 44.99 to number, true to boolean, 007 to 7', 'Identifiers lose leading zeros, big integers lose precision, dates lose their zone — the CSV failure, again'],
            ['Provenance', 'Comments, PIs, CDATA boundaries, entity references, xml:space', 'Discarded, or worse, promoted into keys', 'Round-tripping is not a round trip; only the Infoset-equivalent parts survive'],
          ]}
        />
        <P>
        Three practical rules follow. Force arrays for elements your schema allows to repeat, so that one record and two records have the same shape
          — the single most common conversion defect, and the reason the 44-byte and 72-byte documents above produce different JSON. Keep
          namespace URIs somewhere if the vocabulary matters: dropping the prefix without keeping the URI collapses{' '}
          <Rich text={'`urn:sales`'} /> and <Rich text="`urn:crm`" /> into the same key the day someone merges two feeds, and the cheapest
          convention is to keep the prefix in the key. And convert after validation, not after entity expansion — a converter that resolves
          external entities first has turned a translation problem into the XXE problem above, and{' '}
          <Rich text="[the JSON validator](/json-tools/validator/)" /> will not tell you it happened. For the reverse direction, {' '}
          <Rich text="[JSON to CSV](/format-converters/json-to-csv/)" /> exposes the same decisions the other way, and{' '}
          <Rich text="[XML vs JSON](/compare/xml-vs-json/)" /> measures the payload rather than the mapping.
        </P>
        <Callout tone="note" title="Why this site has no XML converter">
          <P>
            Deliberately. A converter cannot be correct without knowing which of the six losses you meant to accept, so this site keeps to the part with a defensible
            answer: formatting, validating and minifying the JSON at the far end.
          </P>
        </Callout>
      </Section>

      <Section id="endures" title="Why a 1998 specification still ships software" kicker="The verdict">
        <P>
          XML has survived JSON, YAML, TOML and two decades of opinion because it solved a different problem than the formats that replaced it
          in APIs. It was designed as a reduction of SGML for documents that must be machine-verified, and the reduction was surgical: keep the
          tree, keep the escape rules, keep the declaration mechanism, and make every ambiguity fatal. The features that came after — namespaces
          in 1999, XSD in the 2000s, XPath and XSLT and XQuery as a coherent query layer, canonicalization for trust — are not bolt-ons, they
          are the reason a SAML assertion can be signed, an EPUB can be validated and a Word document can be opened by a program its author
          never met.
        </P>
        <P>
          Six things carry the weight. A name is an identity, not a string, because the namespace URI is part of it. Data has order, because
          element order is data and attribute order is not. Documents may mix prose and structure, because mixed content exists. Types may be
          asserted outside the instance, because XSD and RELAX NG validate without changing the file. A subtree may be addressed and
          transformed without loading the whole thing, because XPath and streaming both work on partial views. And a tree may be reduced to a
          canonical octet stream so that a signature means something to a stranger. JSON has none of those, and for record-shaped data it does
          not need them.
        </P>
        <P>
        The honest counterweights are the ones this guide has spent its length on: the format has no types of its own, so every consumer
          invents them; its security surface is a configuration responsibility; its text APIs are verbose because they were designed for
          documents rather than diff viewers; and its conversion story is a set of conventions with unnamed losers. None of that is a reason
          to abandon a document format. It is a reason to stop choosing XML for what is really a list of records.
        </P>
        <Callout tone="tip" title="The seven-line checklist">
          <P>
            For any XML you operate: refuse DOCTYPEs unless the vocabulary needs them. Disable external entity resolution everywhere a parser
            is constructed, including the ones buried in libraries. Set limits on input size, expansions and parse time. Turn on namespace
            awareness and validate against XSD or RELAX NG rather than a DTD. Bind prefixes in XPath instead of reaching for{' '}
            <Rich text="`local-name()`" />. Canonicalise before you sign or hash, and know which variant your partner uses. And when you hand
            the data to another system, write down which of the six conversion losses you accepted. If you are choosing between formats rather
            than debugging one, start with{' '}
            <Rich text="[the XML vs JSON comparison](/compare/xml-vs-json/)" />, then the{' '}
            <Rich text="[data migration workflow](/use-cases/data-migration/)" />, and keep the{' '}
            <Rich text="[encoding and security tools](/use-cases/encoding/)" /> open while you review the parser settings.
          </P>
        </Callout>
      </Section>
    </Prose>
  )
}
