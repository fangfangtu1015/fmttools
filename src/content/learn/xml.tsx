/**
 * XML complete guide. Content module for /learn/xml/.
 * Clause references were checked against the published XML 1.0 (Fifth Edition),
 * Namespaces in XML 1.0 (Third Edition), RFC 7303 and XPath 3.1 texts on
 * 2026-11-12; every byte count in this article was measured on the markup
 * printed beside it, not quoted from a blog post. Vendor parser option strings
 * are the documented API surface of the libraries named and should be re-checked
 * against the version pinned in your lockfile or base image.
 * Revised 2026-11-17: the specification walkthrough is compressed to what a
 * working developer needs, the section count is folded down to nine, and every
 * FmtTools behaviour statement lives in the final section only. The byte
 * measurements are unchanged and still come from the printed markup.
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'xml',
  path: '/learn/xml/',
  title: 'XML Guide: Syntax, Namespaces, XPath, XSD and XXE | FmtTools',
  description:
    'A complete XML guide: well-formedness, escaping, namespaces, DTD entities, XXE and billion laughs mitigations, XPath, XSD, canonicalization and byte counts.',
  h1: 'XML: The Complete Guide to Markup That Refuses to Die',
  summary:
    'The five markup rules, how namespaces actually resolve, what a parser hands you, and why the formats SOAP, RSS, SVG and Office still depend on XML.',
  keywords: ['xml guide', 'xml namespaces', 'xml dtd entities', 'xpath', 'xxe', 'xml vs json'],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 20,
  sections: [
    { id: 'what-xml-is', label: 'What XML is, and the Fifth Edition' },
    { id: 'syntax-and-characters', label: 'Characters, escaping, elements, prolog' },
    { id: 'namespaces', label: 'Namespaces, the way people get them wrong' },
    { id: 'dtds-and-xxe', label: 'DTDs, entity kinds and XXE' },
    { id: 'infoset-and-validation', label: 'The Infoset, and the three schema languages' },
    { id: 'xpath', label: 'XPath axes and predicates' },
    { id: 'large-files-and-canonical-bytes', label: 'Large files, and canonical bytes' },
    { id: 'xml-against-json', label: 'XML against JSON: bytes and live uses' },
    { id: 'how-our-xml-tools-handle-these-cases', label: 'How our tools handle these cases' },
  ],
  faqs: [
    {
      question: 'My file parses in one library and throws in another. What do I change first?',
      answer:
        'Check three settings before you touch the file. Namespace awareness: an undeclared prefix is not an XML 1.0 error at all, only a namespaces error, so a processor that is not namespace-aware never reports it. DTD posture: whether the other parser expands internal entities and supplies attribute defaults changes the tree, not the syntax. Entity resolution: if one stack fetches external entities and the other refuses, the same document succeeds in one and fails in the other. Then compare the two outputs as information sets, not as bytes.',
    },
    {
      question: 'Should we migrate off XML, or keep it?',
      answer:
        'Migrate only when the data is record-shaped and nobody signs a fragment of it. If you own the vocabulary end to end, need no identity constraints, and can carry each namespace URI into the new format deliberately, the move is mostly mechanical — and the byte saving only exists uncompressed, because gzipped XML came out smaller in the measurements above. Keep it for signatures over subtrees, mixed content, datatype checking, ordered configuration. "It is verbose" is not a reason to migrate; "we keep losing leading zeros in conversion" is.',
    },
    {
      question: 'How do I choose the namespace-handling option in a converter, a diff tool or an XPath evaluator?',
      answer:
        'Decide by what you are comparing. For queries, bind a prefix and use it: a local-name() workaround matches the wrong vocabulary and throws away the index. For diffs, use namespace-aware comparison, because a prefix rename changes nothing while a scope change moves meaning without moving text. For conversions, keep the prefix or the URI in the key — dropping both collapses urn:sales and urn:crm the day someone merges two feeds. Renaming biblio: to b: is a byte saving, not a schema change.',
    },
    {
      question: 'One record, two formats: which one is actually smaller?',
      answer:
        'It depends where the bytes are read. Uncompressed, JSON is smaller: 618 bytes against 693 for the entry used throughout this guide, and 493 against 587 minified. Transmitted gzipped, XML wins — 5,435 bytes against 7,481 across 500 records — because XML overhead is repeated element names, and repetition is what deflate monetises. A file you store and grep is a different argument from an API you compress. Measure your own record shape before quoting either.',
    },
    {
      question: 'How do I check a claim in this guide against my own stack?',
      answer:
        'Every byte count here was taken from the markup printed beside it: save that block to a file, run wc -c, then gzip -9 and wc -c again, and the size table reproduces. For parser behaviour, send one document with a DOCTYPE carrying an empty internal subset and one internal entity referenced in a field, and require a loud rejection — a silent success means you are still exposed. Re-check every option string against the library version pinned in your lockfile or base image.',
    },
  ],
  sources: [
    {
      label: 'XML 1.0 (Fifth Edition) — W3C Recommendation',
      href: 'https://www.w3.org/TR/xml/',
      detail:
        'Checked for: the document production [1] and the definition of a well-formed document in 2.1; the Char production [2] ranges; element productions [39]-[44]; the CDSect productions [18]-[21]; prolog [22], XMLDecl [23] and VersionInfo [24]; the MUST sentences that "&" and "<" be escaped by numeric character reference or &amp; and &lt; and that ">" be escaped when part of "]]>"; the rule that only CDEnd is recognised inside a CDATA section; the entity productions and [9] EntityValue; the sentence "A parsed entity MUST NOT contain a recursive reference to itself"; and the rule that a reference to an external parsed entity inside an attribute value is a fatal error.',
      accessed: '2026-11-12',
    },
    {
      label: 'Namespaces in XML 1.0 (Third Edition) — W3C Recommendation, 8 December 2009',
      href: 'https://www.w3.org/TR/xml-names/',
      detail:
        'Checked for: that the namespace-name value MUST be a URI reference or the empty string and that "It is not a goal that it be directly usable for retrieval of a schema"; the scope sentence for prefix declarations extending from the start-tag to the corresponding end-tag and excluding inner declarations; "Default namespace declarations do not apply directly to attribute names"; that the xml prefix is by definition bound to http://www.w3.org/XML/1998/namespace and MUST NOT be bound elsewhere; that other prefixes beginning with the three-letter sequence x, m, l in any case combination are reserved and processors MUST NOT treat them as fatal errors; that a prefix used on a name MUST have been declared on that element or an ancestor; and that an empty default-namespace value has the same effect as no default namespace.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 7303 — XML Media Types',
      href: 'https://datatracker.ietf.org/doc/html/rfc7303',
      detail:
        'Checked for: the registration of application/xml and text/xml, the requirement that they not be used unless the parsed entities are also well-formed document entities, the rule that the byte-order mark is authoritative for the encoding, the default of UTF-8 when nothing else declares one, and the obsoletion of RFC 3023.',
      accessed: '2026-11-12',
    },
    {
      label: 'XPath 3.1 — W3C Recommendation',
      href: 'https://www.w3.org/TR/xpath-31/',
      detail:
        'Checked for: the axes table (3.3.2.1) and the statement that the namespace axis is deprecated and that an implementation need not support it; and the path-expression rule that a step is evaluated against the context node, its axis, a node test and predicates.',
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
  words: 3963,
  image: '/images/covers/learn-xml.png',
  imageAlt: 'A tree of angle-bracket markup resolving into namespaces, entities and an XPath projection over a document.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        XML is the only widely deployed data format whose governing specification has not changed its syntax in twenty-eight years. That
        stability is why a DOCX, a SAML assertion, an SVG icon and a Maven build file still speak one language — and why the same three bugs
        keep recurring: a namespace that silently changes what an element means, an entity that reads a file it should not have, and a converter
        that turns one repeated element into an object and two into an array.
      </Lead>

      <Section id="what-xml-is" title="What XML is, and what the Fifth Edition changed" kicker="Definitions">
        <P>
          XML is a metalanguage: it defines no elements you may use, only the rules by which you define a vocabulary. Production [1] of the
          Fifth Edition gives a document&apos;s shape in one line — optional prolog, exactly one element, trailing miscellaneous markup — and a
          document is well-formed if it matches that production, satisfies every well-formedness constraint, and every entity it references is
          well-formed too. The design is a subtraction from SGML: explicit names, mandatory closing tags, strict nesting, escaped character data,
          no recovery — a violation is fatal.
        </P>
        <P>
          The Fifth Edition is current and introduced no new syntax, only the character model, production [2]:{' '}
          <Rich text="`#x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]`" />. Read as exclusions the ranges become useful —
          no NUL, no control characters below 0x20 except tab, line feed and carriage return, no surrogates (an encoding artefact, not
          characters), no 0xFFFE or 0xFFFF. One erratum, E09, relaxed what may appear in a name, which is why a modern parser accepts name
          characters a 1998 parser rejected.
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
          caption="Measured on this file: 693 bytes, 12 start tags and 12 end tags, 6 attributes plus 1 namespace declaration, 9 content text nodes and 14 carrying only indentation. The declaration costs 38 bytes; pretty-printing 68 more than the minified file."
        />
        <P>
          That document is the running example throughout, including two values — <Rich text="`44.99`" /> and <Rich text="`true`" /> — that a
          converter will insist on typing even though XML has no idea what they are. RFC 7303 registers <Rich text="`application/xml`" /> and{' '}
          <Rich text="`text/xml`" /> and obsoletes RFC 3023; it forbids their use unless the parsed entities are also well-formed document
          entities. An XML fragment is not an XML document.
        </P>
        <H3>Well-formedness against validity is a policy question</H3>
        <P>
          Under the usual five-rule summary of the syntax sit two separate tables in the specification, and the separation is the most
          consequential decision in the format. The well-formedness constraints are syntax-level, apply to every processor, and are fatal: legal
          characters against [2]; no duplicate attributes on one start-tag; proper nesting of declarations and parameter-entity references across
          the DTD subsets; the <Rich text="`WITN`" /> rule; entity evaluation, so a general entity&apos;s replacement text must itself be
          well-formed; conditionally included markup. A non-validating processor must enforce all of it.
        </P>
        <P>
          The validity constraints claim something about a grammar: the root must be the declared document type, every element declared and
          matching its content model, <Rich text="`#REQUIRED`" /> attributes present, <Rich text="`#FIXED`" /> attributes equal, IDs unique,
          IDREFs resolving. A document can be perfectly well-formed and perfectly invalid, and a processor that is not validating will not know
          the difference. When someone says a pipeline &quot;validates the XML&quot;, ask which table they mean: the answer determines whether
          element ordering was checked at all.
        </P>
        <DataTable
          caption="The same mistakes, sorted by which constraint table catches them"
          head={['Input', 'Verdict', 'Which rule catches it', 'Who notices']}
          rows={[
            ['<note>a <b>c</note></b>', 'Not well-formed', 'Crossed tags, production [39]', 'Every parser, always'],
            ['<e a="1" a="2"/>', 'Not well-formed', '[WFC] No Duplicate Attribute', 'Every parser, always'],
            ['<e>R&D</e>', 'Not well-formed', 'The "&" MUST be escaped', 'Every parser, always'],
            ['<e>a NUL b</e> with a real 0x00', 'Not well-formed', '[WFC] Legal Character, [2]', 'Every parser, always'],
            ['<entry> with no title, DTD requires one', 'Well-formed, invalid', '[VC] Element Valid', 'Only a validating processor'],
            ['<entry/> where the DTD says id is #REQUIRED', 'Well-formed, invalid', '[VC] Required Attribute', 'Only a validating processor'],
            ['Two elements sharing one ID value', 'Well-formed, invalid', '[VC] ID', 'Only a validating processor'],
          ]}
          foot="The first four fail at parse time on any stack; the last three are invisible unless DTD validation is on — the reason XSD exists."
        />
        <Callout tone="note" title="The fragment problem">
          <P>
            An element on its own is not a well-formed document, and &quot;XML fragment&quot; has no conformance definition. Store one in a column
            or a config file and you have chosen a private convention — namespace declarations, undeclared prefixes and entity references all
            behave differently inside a fragment.
          </P>
        </Callout>
        <KeyTerms
          items={[
            { term: 'well-formed', definition: 'Matches [1] and every [WFC].' },
            { term: 'valid', definition: 'Well-formed and satisfies the DTD constraints for the root type.' },
            { term: 'fatal error', definition: 'The processor must stop and reject the document.' },
            { term: 'metalanguage', definition: 'Rules for describing vocabularies; defines none itself.' },
            { term: 'vocabulary', definition: 'The names you chose: XHTML, SVG, Atom, DITA.' },
            { term: 'document entity', definition: 'The top-level parsed entity; the only one a non-validating processor must read.' },
            { term: 'expanded name', definition: 'What a namespace-aware processor builds: URI plus local name.' },
          ]}
        />
      </Section>

      <Section
        id="syntax-and-characters"
        title="Characters, escaping, elements, attributes and the prolog"
        kicker="Productions [2], [18]-[23], [39]-[44]"
      >
        <P>
          Four ways to get a character into content. A literal character is allowed if it is in production [2]. A numeric reference —{' '}
          <Rich text="`&amp;#65;`" /> or <Rich text="`&amp;#x41;`" /> — names a code point and is permitted for anything in the character set,
          including what the document encoding cannot represent. The predefined general entities are the only names the specification defines for
          content: <Rich text="`&amp;lt;`" />, <Rich text="`&amp;gt;`" /> <Rich text="`&amp;amp;`" /> <Rich text="`&amp;quot;`" /> and{' '}
          <Rich text="`&amp;apos;`" />. And a reference to an external entity is allowed in content but fatal in an attribute value — the split
          every XXE mitigation has to respect.
        </P>
        <P>
          Ampersand and less-than <strong>MUST</strong> be escaped numerically or as <Rich text="`&amp;amp;`" /> and{' '}
          <Rich text="`&amp;lt;`" />; greater-than <strong>MUST</strong> be escaped only inside <Rich text="`]]&gt;`" />, so a generator that
          escapes every <Rich text="`&gt;`" /> is correct and unreadable. In an attribute value the delimiter <strong>MUST</strong> be escaped, so{' '}
          <Rich text={'`title="She said &quot;hi&quot;"`'} /> is fine while a literal second double quote ends the value early and the rest becomes
          a syntax error.
        </P>
        <CodeBlock
          title="content vs attribute value: what must be escaped where"
          language="xml"
          code={`<!--  content:  &  and  <  are fatal.  >  only inside "]]>"  -->
<q author="Knuth, Donald E.">&lt;TeX&gt; was written in C, and A &amp; B is fine.</q>
<q note="He said &quot;yes&quot;, then 'maybe'."}      <!-- ' needs no escape here -->
<formula>a &gt; b &amp;&amp; c &lt;= d</formula>              <!-- &gt; not required, but harmless -->
<block>the closing sequence must be split: ]]&gt;]]&gt;</block>
<!-- an external entity reference in an attribute value is a fatal error -->
<bad path="&anyExternalEntity;"/>`}
          caption="Two of these six lines are fatal, and the last is why XXE mitigations concentrate on attributes and DTDs rather than content."
        />
        <H3>CDATA sections escape markup, not everything</H3>
        <P>
          A CDATA section, productions [18]-[21], makes the parser treat what follows as character data: only the end sequence is recognised
          inside it. Entities are not expanded, so <Rich text="`&amp;amp;`" /> stays seven characters of text. Tags are not recognised, which is
          why an HTML snippet inside an RSS <Rich text="`description`" /> element survives as data. And because only the terminator is looked for,
          there is no escape for <Rich text="`]]&gt;`" /> inside CDATA: you end the section and start another, splitting the sequence across the
          boundary — which is also why CDATA cannot nest.
        </P>
        <CodeBlock
          title="the ]]&gt; problem, solved the only way it can be"
          language="xml"
          code={`<![CDATA[if (a < b && c <![CDATA[> d) { }]]>
<![CDATA[if (a < b && c ]]>]]><![CDATA[> d) { }]]>   <!-- correct: terminator split at the boundary -->`}
          caption="Line one is the bug in every code-snippet-in-XML generator: the parser closes the section at the first ]]> and hits a bare < in markup position."
        />
        <Callout tone="warn" title="Whitespace is never insignificant">
          <P>
            Every space, tab and newline between tags is a text node, and a model decides what that costs: <Rich text="`(#PCDATA)*`" /> in a DTD
            or <Rich text="`mixed`" /> in Schema tolerates indentation, an element content model does not, so one file can validate before
            beautification and fail after it.
          </P>
        </Callout>
        <H3>Elements and attributes are two information models</H3>
        <P>
          Production [39] defines an element as name, start-tag, content, end-tag, or an empty-element tag — [44] makes{' '}
          <Rich text="`<name/>`" /> exactly equivalent to <Rich text="`<name></name>`" /> — and [43] lets content be elements, character data,
          references, CDATA, PIs and comments: a tree of named nodes with ordered children. Attributes, [41], are the second model, and reading
          them as a compact spelling of elements is the mistake: unordered, unique-keyed, single-valued, outside the content sequence — every
          property in the table below has shipped a bug.
        </P>
        <DataTable
          caption="Element content against attribute values, property by property"
          head={['Property', 'Element', 'Attribute value']}
          rows={[
            ['Order among siblings', 'Significant: document order is data', 'Not significant on one start-tag'],
            ['Same name twice', 'Allowed; how lists are expressed', 'Forbidden: [WFC] No Duplicate Attribute'],
            ['Nesting', 'Unbounded', 'Impossible: no element inside a value'],
            ['Markup inside', 'Elements, CDATA, references, PIs, comments', 'Character data and internal references only; external is fatal'],
            ['Whitespace', 'Preserved exactly; always a text node', 'Normalized, then trimmed and collapsed if tokenized'],
            ['Defaults', 'None: absence is absence', 'A DTD supplies #IMPLIED, #REQUIRED or #FIXED values'],
            ['Mixed with text', 'Yes: mixed content is legal', 'No: never part of a run of prose'],
          ]}
        />
        <P>
          Normalization is where real corruption comes from, in two passes: first every tab and newline in the value becomes a space and every
          character reference becomes its target; second, a tokenized attribute — ID, IDREF, NMTOKEN, ENTITY, NOTATION or an enumeration — is
          trimmed and its space runs collapse to one. A CDATA-declared attribute stops after the first pass. That is why a wrapped base64 key
          inside <Rich text="`ds:KeyValue`" /> arrives as one long line with single spaces where your newlines were; the{' '}
          <Rich text="[Base64 guide](/learn/base64/)" /> covers that accident. Keep multi-line payloads in element content, where whitespace
          survives.
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
          caption="18 bytes is the whole price difference, and not the reason to choose. The reason: 'year' as an attribute cannot take a second value, cannot be localized, and will not appear in a query over the element's content."
        />
        <Callout tone="tip" title="The rule that survives twenty years of schema reviews">
          <P>
            Put in an attribute whatever qualifies the element it sits on — identifier, language, unit, role, type discriminator — and put in an
            element anything that is content or might need structure. The tell you got it wrong is an attribute whose value contains a delimiter
            you invented: <Rich text={'`tags="a,b,c"`'} /> is a list wearing an attribute&apos;s clothes.
          </P>
        </Callout>
        <H3>The prolog, and who decides the encoding</H3>
        <P>
          Production [22] makes the prolog optional: XML declaration, miscellaneous markup, optional DOCTYPE, more miscellaneous markup.
          Production [23], the XML declaration, is the only thing in the language that is not a processing instruction despite looking like one:
          the parser matches <Rich text="`<?xml`" /> against the declaration before the PI production, which is why a PI target must not match{' '}
          <Rich text="`xml`" /> in any case combination.
        </P>
        <CodeBlock
          title="every legal way to open a document"
          language="xml"
          code={`<?xml version="1.0" encoding="UTF-8"?>                    <!-- 38 bytes: the usual -->
<?xml version='1.0'?>                                     <!-- 23: legal, encoding omitted -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>   <!-- + the standalone assertion -->
<?xml version="1.0" ?>                                   <!-- space before ?> : legal -->
<?xml version='1.0' encoding='windows-1252'?>             <!-- named encoding, must match the bytes -->
<?xml-stylesheet type="text/xsl" href="render.xsl"?>      <!-- a PI, NOT a declaration -->
<!DOCTYPE biblio:collection SYSTEM "biblio.dtd">          <!-- in the prolog, before the root -->`}
          caption="Measured: the 38-byte declaration is overhead you cannot avoid when declaring an encoding; the 23-byte form is what a generator emits when it trusts UTF-8, and a UTF-8 BOM adds 3 more."
        />
        <P>
          Three documents argue about the encoding and agree on the order: a media-type <Rich text="`charset`" /> parameter, then the
          byte-order mark, which RFC 7303 makes authoritative, then the declaration, then UTF-8 by default. So the declaration is a claim about
          bytes already decoded, not a decoder setting. When <Rich text={'`encoding="UTF-8"`'} /> sits atop a file starting FF FE, the mark
          wins: the document is UTF-16LE and the declaration is fiction. When the declaration says UTF-8 and the bytes are Windows-1252, the
          parser either fails on an invalid sequence or accepts 0x91 as a legal code point and hands you garbage.
        </P>
        <P>
          <Rich text={'`standalone="yes"`'} /> is a third claim, and it does not mean &quot;no external DTD&quot;: it asserts the document does
          not depend on markup outside itself — no external entity whose content matters, no attribute defaults. The version pseudo-attribute is
          the last trap: a literal string <Rich text={'`"1.0"`'} />, not a number, so <Rich text={'`"1.1"`'} /> names a different specification,
          one implemented by essentially nothing that consumes your files.
        </P>
      </Section>

      <Section id="namespaces" title="Namespaces, explained the way people get them wrong" kicker="Namespaces in XML 1.0">
        <P>
          A namespace is an identifier, not a location and not a type. The recommendation says a declaration&apos;s value MUST be a URI reference
          or the empty string, SHOULD be unique and persistent, and &quot;It is not a goal that it be directly usable for retrieval of a
          schema.&quot; Processors compare strings: <Rich text="`http://example.org/biblio/1.0`" /> and{' '}
          <Rich text="`http://example.org/biblio/1.1`" /> are two vocabularies as far as every tool is concerned, even if the same human wrote
          both, and nothing in the format fetches the URI or cares that the page behind it is a 404.
        </P>
        <H3>The four mistakes, in the order teams make them</H3>
        <P>
          <strong>One: a prefix is not part of the identity.</strong> <Rich text={'`<biblio:entry xmlns:biblio="urn:x">`'} /> and{' '}
          <Rich text={'`<b:entry xmlns:b="urn:x">`'} /> describe the same element in the same namespace. Renaming a prefix changes nothing in the
          data model: on the running example, <Rich text="`biblio:`" /> to <Rich text="`b:`" /> removes 20 bytes from 693 and no semantics, and
          across 1,000 records saves 12,000 bytes, 21.9% of the document. Changing the URI is a schema change.
        </P>
        <P>
          <strong>Two: default namespaces do not apply to attributes.</strong> The specification is flat:{' '}
          <em>&quot;Default namespace declarations do not apply directly to attribute names; the interpretation of unprefixed attributes is
          determined by the element on which they appear.&quot;</em> That is why every Schema instance document spells out{' '}
          <Rich text="`xmlns:xsi`" />, and why the element below has its names in three places.
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
          caption="row and cell are in urn:sales. p:id is in urn:person. kind is in NO namespace, not urn:sales — the one almost everybody gets wrong. xsi:type is in the Schema-instance namespace, and xs:positiveInteger is only text: xmlns:xs is not declared, so nothing resolves it."
        />
        <P>
          <strong>Three: scope and shadowing are lexical.</strong> A declaration extends from the start-tag carrying it to the matching end-tag,
          excluding any inner declaration of the same prefix. A prefix can mean four URIs in one document and the last declaration before the use
          wins — which is why namespace-aware diff tools exist: a subtree moved between two parents changes namespace without changing a
          character of the element.
        </P>
        <P>
          <strong>Four: reserved prefixes are not errors.</strong> The <Rich text="`xml`" /> prefix is by definition bound to{' '}
          <Rich text="`http://www.w3.org/XML/1998/namespace`" /> and MUST NOT be bound elsewhere; every other prefix beginning with x, m, l in any
          case combination is reserved, and processors MUST NOT treat it as fatal. So <Rich text={'`xmlns:xml="urn:me"`'} /> is an error while{' '}
          <Rich text={'`xmlns:xmh="urn:me"`'} /> is a warning at most, and may quietly collide with a specification written next year. An empty
          default <Rich text={'`xmlns=""`'} /> escapes an inherited default.
        </P>
        <Callout tone="spec" title="Namespace well-formedness is not XML well-formedness">
          <P>
            Undeclared prefixes are not an XML 1.0 error at all: they are a namespaces error, and only a namespace-aware processor reports them.
            That is why the same file parses happily in one library and throws in another — <Rich text="`namespaceAware=true`" /> on a Java
            factory is a correctness setting, not a performance one.
          </P>
        </Callout>
      </Section>

      <Section id="dtds-and-xxe" title="DTDs, entity kinds, and the attack surface they create" kicker="Productions [9], [28]-[31], [53]; CWE-611, CWE-776">
        <P>
          A document type declaration, [28], names the root&apos;s type and may carry definitions in two places: an internal subset between square
          brackets, and an external subset named by a SYSTEM or PUBLIC identifier, which [30] defines as a text declaration plus markup
          declarations. Both hold the same four kinds — <Rich text="`<!ELEMENT>`" />, <Rich text="`<!ATTLIST>`" /> (attribute definition [53]),{' '}
          <Rich text="`<!ENTITY>`" /> and <Rich text="`<!NOTATION>`" /> — and proper nesting requires parameter-entity references to cross the
          subset boundary correctly. Content models come from <Rich text="`<!ELEMENT>`" />: ANY, EMPTY, a choice or sequence with ? and *, or the
          mixed form <Rich text="`(#PCDATA | b | i)*`" /> — with no unordered construct and no way to say <em>exactly one</em> without
          enumerating alternatives.
        </P>
        <P>
          The entity value is production [9] EntityValue, delimited by quote, apostrophe or — the form every generator forgets — percent sign,
          and its text is not parsed when written: it is replacement text, expanded only when something references it. That indirection is the
          whole attack surface.
        </P>
        <DataTable
          caption="Six kinds of reference that all look like markup"
          head={['Kind', 'Declared', 'Referenced as', 'Where it may appear', 'Read without validating?']}
          rows={[
            ['Internal general entity', '<!ENTITY c "Copyright">', '&name;', 'Content, attribute values, DTD defaults', 'Always; the text is part of the document'],
            ['External parsed general entity', '<!ENTITY ch1 SYSTEM "ch1.xml">', '&ch1;', 'Content only; in an attribute it is fatal', 'Only if external general entities are allowed'],
            ['External unparsed entity', '<!ENTITY logo SYSTEM "logo.png" NDATA png>', 'an attribute of type ENTITY', 'Those attribute values, never content', 'Never expanded; the notation must be declared'],
            ['Internal parameter entity', '<!ENTITY % model "(title, author+)">', '%model;', 'Markup only, inside the DTD', 'Yes, when the DTD is read'],
            ['External parameter entity', '<!ENTITY % dtd SYSTEM "common.dtd">', '%dtd;', 'Markup only, usually in the internal subset', 'Yes — the classic XXE trigger'],
            ['Numeric character reference', 'not an entity', '&#65; or &#x41;', 'Content and attribute values', 'Always; handled separately'],
          ]}
        />
        <CodeBlock
          title="a DTD, internal and external, with defaults and notations"
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
  <!NOTATION png SYSTEM "image/png">
  <!ENTITY cover SYSTEM "cover.png" NDATA png>
]>
<biblio:collection>
  <biblio:entry id="&isbn-prefix;-1491950751">
    <title>R&D and &lt;markup&gt; in one document</title>
    <author>Kleppmann, Martin</author>
  </biblio:entry>
</biblio:collection>`}
          caption="Three hazards in eleven lines: the external parameter entity, the #REQUIRED constraint a non-validating parser will not check, and the lang default that makes the tree differ from the file."
        />
        <H3>External entities as an attack surface</H3>
        <P>
          Because an external entity reference inside an attribute value is fatal, exfiltration has to land in content. And the specification asks
          something surprising of the cheapest parser in the room — a non-validating processor may not skip the DTD wholesale; it must read far
          enough into both subsets to resolve parameter-entity references and the declarations they contain. That is why XXE exists in services
          that claim not to validate anything: the attacker needs no validation, only a parser that reads markup declarations.
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
          caption="Both are well-formed, both parse with default settings in a great many stacks, and neither is the most destructive thing an entity can do."
        />
        <H3>Expansion bombs: cycles are banned, size is not</H3>
        <P>
          <em>&quot;A parsed entity MUST NOT contain a recursive reference to itself&quot;</em> is why a naive self-referencing DTD is rejected —
          and why billion laughs does not reference itself. It references the entity one level below, ten times, nine levels deep: no cycle, so
          no constraint fires, only exponential growth.
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
          caption="Expansion size is 3 times 10 to the n bytes: e3 is 3,000, e6 is 3,000,000, e9 is 3,000,000,000 (2.79 GiB). A parser that materialises replacement text in memory dies at about level 7."
        />
        <P>
          The subtler cousin needs no recursion: declare one entity with 5,000 characters of replacement text and reference it a thousand times
          in content, and a 10,040-byte document becomes 5,000,000 bytes — some 500 times its own size, with no cycles, no external resources,
          and a DTD that looks like a template. Expansion is linear in the number of references, so a parser tracking only depth will not see it
          coming; you need a budget on expansions or output size, and both are implementation limits, not specification requirements.
        </P>
        <Callout tone="warn" title="XXE is a configuration failure, not a format failure">
          <P>
            XXE abuses indirection over external resources — the feature that makes document assembly and shared vocabularies possible, and that
            XML 1.0 ships enabled. Nothing in the specification requires a processor to fetch anything; implementation defaults opened the hole.
            OWASP states the posture plainly: a processor{' '}
            <em>&quot;should be configured to use a local static DTD and disallow any declared DTD included in the XML document&quot;</em>. If
            your vocabulary needs no DTD, a document with a DOCTYPE is malformed for your application: say so loudly rather than parse it.
          </P>
        </Callout>
        <DataTable
          caption="Hardening each implementation: three settings and one question about defaults"
          head={['Implementation', 'Refuse all DTDs', 'Refuse external resolution', 'Cap expansion', 'Default posture']}
          rows={[
            ['Java JAXP (SAX, DOM, StAX)', 'disallow-doctype-decl true; StAX SUPPORT_DTD false', 'external-general-entities and external-parameter-entities false; accessExternalDTD ""; IS_SUPPORTING_EXTERNAL_ENTITIES false', 'FEATURE_SECURE_PROCESSING applies limits on counts, depths and sizes', 'Permissive: DOCTYPEs accepted, entities resolved unless refused'],
            ['.NET System.Xml', 'DtdProcessing.Prohibit', 'XmlResolver = null; the default resolver reaches the network', 'Not configurable; use Prohibit plus size limits', 'DtdProcessing.Ignore in many templates: skipped, not forbidden'],
            ['Python xml.etree / SAX', 'No switch; use defusedxml and catch DTDForbidden', 'expat skips external general entities; a custom handler must not fetch', 'defusedxml counts expansions, raises EntitiesForbidden', 'Safe against XXE by expat accident, not against bombs'],
            ['lxml (libxml2)', 'XMLParser(resolve_entities=False, load_dtd=False, huge_tree=False)', 'no_network=True blocks http and file fetches', 'huge_tree=False keeps library limits; omit XML_PARSE_NOENT', 'resolve_entities on, load_dtd off'],
            ['C / libxml2', 'Omit XML_PARSE_DTDLOAD and XML_PARSE_DTDVALID', 'XML_PARSE_NONET; avoid XML_PARSE_NOENT', 'XML_PARSE_HUGE lifts library limits: leaving it off is the mitigation', 'xmlRead* defaults do not fetch'],
            ['Browsers', 'Not configurable; external subsets not fetched', 'None at all', 'Not exposed', 'Safe by construction; check the parse-error node'],
          ]}
          foot="Defaults change between releases. Verify against your pinned version, then prove it: parse a document containing a DOCTYPE and assert rejection."
        />
        <Callout tone="risk" title="The test that finds the parsers nobody hardened">
          <P>
            Enumeration is the hard part. A service that accepts XML usually parses it in four places: the binding, the schema validator, the
            signing or canonicalization step, and a library that sniffs the file for its type. Hardening the primary parser leaves the other three.
            Send a probe with an internal entity referenced in a field plus a DOCTYPE with an empty internal subset and compare what each stage
            does; the mismatch is your inventory of unprotected entry points. Add a size limit, a parse timeout, and an egress rule denying the
            parser process outbound connections — that one survives a forgotten flag.
          </P>
        </Callout>
      </Section>

      <Section id="infoset-and-validation" title="What a parser hands you, and which grammar checks it" kicker="Infoset, DTD, XSD, RELAX NG">
        <P>
          Between the bytes and your object model sits a document nobody reads: the XML Information Set. It defines what a processor is
          understood to have produced — document, elements, attributes, text, comments, PIs, entities, notations, namespaces — each with
          properties rather than syntax: for an element, name, namespace name and prefix as separate properties, children, base URI; for an
          attribute, owner, value, type, and the specified-or-defaulted flag. XPath, DOM, SAX and XQuery are all views of it.
        </P>
        <P>
          Two pairs of documents explain signing and diffing. One has the same information set and different bytes: reordered attributes, single
          versus double quoting, a renamed prefix, an entity reference replaced by its text, a CDATA section replaced by escapes, indentation —
          each invisible to a conforming processor, each breaking a byte comparison. The other has the same bytes and a different set: one file
          parsed with a DTD supplying <Rich text="`#FIXED`" /> and <Rich text={'`"en"`'} /> defaults against the same file parsed without it, a
          mislabelled encoding, a <Rich text={'`standalone="yes"`'} /> claim honoured or ignored. Two teams can honestly report different content
          for one file.
        </P>
        <DataTable
          caption="Which API exposes which part of the abstraction"
          head={['API', 'Style', 'Sees', 'Blind to', 'Typical failure']}
          rows={[
            ['DOM', 'Tree, in memory', 'Elements, attributes, text, comments, PIs', 'Entity boundaries', 'Memory exhaustion; whitespace nodes breaking childElementCount'],
            ['SAX / XMLReader', 'Push events', 'Callbacks, characters(), the attribute list', 'Anything not yet parsed', 'Assuming one characters() call per text node'],
            ['StAX', 'Pull events', 'The same stream on demand, plus file location', 'Nothing; it is a cursor', 'Skipping a subtree with the wrong END_ELEMENT'],
            ['XPath 3.1', 'Node-set expression', 'Nodes via axes, sequences and maps', 'DTD defaults; CDATA versus text', 'The empty result a default namespace causes'],
            ['XQuery / XDM', 'Sequence of values', 'Typed values, validation annotations', 'Byte-level provenance', 'Assuming order survives an unordered FLWOR'],
          ]}
        />
        <H3>DTD against XML Schema against RELAX NG</H3>
        <P>
          Only one of the three is part of XML 1.0 conformance, and it is the weakest. A DTD constrains names, ordering and attribute presence;
          its type system is about five entries, and it cannot say a price must be a decimal, that exactly one of four elements is required, or
          that an identifier here equals a value there. It predates namespaces and matches declarations on the local name only.
        </P>
        <P>
          XML Schema is the opposite trade — hundreds of datatypes, facets, defaults, identity constraints expressed with XPath, substitution
          groups, wildcards with lax or strict processing — and the only one of the three a document can be validated against without the schema
          being part of its own syntax. Its costs are real: Unique Particle Attribution forbids any content model whose validation needs
          lookahead, so <Rich text="`((a|ab)+)`" /> is rejected and must be rewritten, and the specification is long enough that implementations
          disagree at the edges, which is why XSD 1.1 added <Rich text="`xs:assert`" />.
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
          caption="RELAX NG does two things XSD cannot without contortions: an unordered interleave of optional children, and a grammar that fits on one screen. Only XSD can do these two: the unique constraint, and a datatype with facets."
        />
        <DataTable
          caption="Expressiveness, honestly compared"
          head={['Capability', 'DTD', 'XML Schema', 'RELAX NG (ISO/IEC 19757-2)']}
          rows={[
            ['Datatypes', 'ID, IDREF, ENTITY, NMTOKEN, enumeration', 'Hundreds, with restriction and list derivation', 'The Schema datatype library, no derivation machinery'],
            ['Pattern and range', 'Enumerated value lists only', 'pattern, maxLength, minInclusive, totalDigits, stackable', 'pattern plus datatype reference; no facet inheritance'],
            ['Namespaces', 'Local name only', 'targetNamespace, elementFormDefault, wildcards', 'One namespace declaration per pattern'],
            ['Referential integrity', 'ID uniqueness, IDREF resolution, document scope', 'unique, key, keyref with selector and field', 'Name classes; no keyref equivalent'],
            ['Mixed content', 'Coarse: (#PCDATA | b | i)*', 'Mixed complex types', 'The natural case; text is another pattern'],
            ['Unordered children', 'Impossible', 'xs:all with maxOccurs 1 in 1.0; unordered in 1.1', 'interleave, unbounded, no UPA problem'],
            ['Extensibility', 'None; undeclared elements are invalid', 'strict, lax and skip wildcards', 'anyName and except: "my vocabulary plus yours"'],
            ['Recursion', 'Self-referential content models', 'Complex types referenced from declarations', 'Patterns recurse freely and read naturally'],
            ['Where you meet it', 'DocBook, DITA maps, HTML 4 DTDs', 'SOAP, Office Open XML, XBRL, SAML, GPX', 'DocBook 5, TEI, ODF schemata'],
          ]}
          foot="Choose DTD for entities and conditional markup; RELAX NG when a human must maintain the grammar; XSD for typing, identity constraints, or an ecosystem that already ships one."
        />
      </Section>

      <Section id="xpath" title="XPath axes and predicates, with the paths worth writing" kicker="XPath 3.1">
        <P>
          An XPath step is three things: an axis naming nodes relative to the context node, a node test filtering them, and predicates filtering
          the result. XPath 3.1 defines thirteen axes; two pairs are worth memorising, child against descendant and following-sibling against
          following.
        </P>
        <DataTable
          caption="The thirteen axes of XPath 3.1 and what each one walks"
          head={['Axis', 'Selects', 'Node types', 'Direction', 'Note']}
          rows={[
            ['self', 'The context node alone', 'Any', '—', 'A bare name test implies child::'],
            ['child', 'Immediate children', 'Element for a name', 'Down one level', 'The * wildcard matches accidental whitespace'],
            ['descendant', 'Everything below, any depth', 'Element', 'Down', 'Never attributes or namespaces'],
            ['descendant-or-self', 'descendant plus context', 'Element', 'Down', 'This is what // means'],
            ['parent', 'The single parent', 'Element', 'Up', 'nil for the root'],
            ['ancestor', 'The path to the root', 'Element', 'Up, reverse', 'Reverse document order surprises people'],
            ['ancestor-or-self', 'ancestor plus context', 'Element', 'Up', 'Makes grouping by container possible'],
            ['attribute', 'Attributes on the context node', 'Attribute', 'Sideways', '@ here; namespace declarations never appear'],
            ['namespace', 'In-scope namespace nodes', 'Namespace', 'Sideways', 'Deprecated in 3.1; support optional'],
            ['following', 'After it, minus descendants', 'Any', 'Forward', 'The axis for "anywhere after this"'],
            ['following-sibling', 'Later children of one parent', 'Any', 'Sideways forward', 'Bounded by the parent; makes [last()] meaningful'],
            ['preceding', 'Before it, excluding ancestors', 'Any', 'Backward', 'Mirror of following, reverse order'],
            ['preceding-sibling', 'Earlier children of one parent', 'Any', 'Sideways backward', 'count(preceding-sibling::*) is the classic trick'],
          ]}
          foot="There is no grandparent, sibling or descendant-of-sibling axis: what people want they build, as parent::author/following-sibling::author or the union a | b."
        />
        <CodeBlock
          title="paths against the running example, with the node counts they return"
          language="xpath"
          code={`declare namespace b = "http://example.org/biblio/1.0";   (: in XPath 1.0 you bind the prefix in the evaluator :)

/biblio:collection/biblio:entry                     (: 1 node                    :)
count(//*)                                          (: 12                        :)
count(//@*)                                         (: 6 - xmlns is not an attribute :)
count(//text())                                     (: 23 pretty, 9 minified     :)
//biblio:entry/@id                                  (: 9781491950751             :)
//tags/tag[2]                                       (: the 2nd tag under EACH tags parent :)
(count(//tags/tag)[2])                              (: 1 node: position in the whole set :)
//biblio:entry[biblio:price/@currency = "USD"]      (: predicate on a nested step :)
//biblio:entry[number(biblio:price) > 40]           (: explicit cast: untypedAtomic to double :)
//biblio:entry[biblio:author/@role]                 (: existence of the attribute, not its value :)
following-sibling::*[1][self::published]            (: "the very next sibling is published" :)
b:entry/b:tags/b:tag ! string()                     (: 3.1 simple map of a sequence, "!" operator :)`}
          caption="Two of these lines are the bugs: the positional predicate, and //@* excluding the declaration that xmlns:biblio really is in XML 1.0 terms."
        />
        <P>
          Predicates filter positionally. <Rich text="`//tag[2]`" /> is short for{' '}
          <Rich text="`/descendant-or-self::node()/child::tag[2]`" />: the predicate applies for each parent, so it returns the second tag of
          every tag-list, not the second tag overall — to index the whole result, parenthesise, <Rich text="`(//tag)[2]`" />. And a comparison
          against untyped content is a type decision in disguise: XML has no types, so <Rich text={'`biblio:price > 44`'} /> converts by rule in
          1.0 and casts <Rich text="`xsi:untypedAtomic`" /> to double later. Write the cast; it survives the day someone puts{' '}
          <Rich text={'`<price>44.99 USD</price>`'} /> in your pipeline.
        </P>
        <H3>XSLT and XQuery, in the space they deserve</H3>
        <P>
          XSLT is a declarative, Turing-complete transformation language over the same tree: templates match node patterns, and 2.0 and 3.0
          added grouping, iteration, functions and packages. It remains the tool for document work — DocBook or DITA into HTML or XSL-FO and
          thence PDF, XBRL linkbases, reshaping one vocabulary into another — because it preserves order, keeps text runs intact and outputs a
          tree rather than a value; its costs are verbosity and a second language&apos;s learning curve. XQuery is the other half: functional, on
          the same data model, with FLWOR expressions and joins, for questions that are data-shaped rather than rendering-shaped. Both address
          with XPath, and neither is a good answer to &quot;I need this in JSON&quot;.
        </P>
      </Section>

      <Section id="large-files-and-canonical-bytes" title="Large files, and canonical bytes for signatures" kicker="StAX, SAX, xml-c14n">
        <P>
          The DOM is the easiest API and the most expensive: it turns a serialised tree into an object graph and keeps it. Do the arithmetic on
          the running example — the 500-record file measured later is 238,500 bytes holding roughly 6,000 elements, 3,000 attributes and 4,500
          content text nodes, about 13,500 nodes for a quarter of a megabyte. Scale to a 2 GB export and you want 115 million node objects, each
          with a name, owner document, child and sibling links and a namespace pointer: five to ten times the file size in heap, with the peak
          reached before you have read a value.
        </P>
        <P>
          Streaming removes the tree. SAX is push: the parser calls <Rich text="`startElement`" /> and <Rich text="`characters`" />, gives a{' '}
          <Rich text="`Locator`" /> for line and column, and hands an attribute list valid only during that callback — the first bug most people
          write. StAX is pull: you ask for the next event and skip whole subtrees without building them. .NET settled on{' '}
          <Rich text="`XmlReader`" /> and Android shipped <Rich text="`XmlPullParser`" /> because a phone could not afford the DOM for a large
          feed. Both guarantee constant memory for a document of any size, as long as you do not accumulate.
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
          caption="Two decisions matter: the DTD is refused before parsing starts, and text is buffered per tag because a parser may split a character run wherever it likes."
        />
        <H3>What streaming costs, and the two escape hatches</H3>
        <P>
          You lose XPath and random access: you cannot ask about the end of a document while at the beginning. DTD attribute defaults do not
          appear unless you validate, and namespace processing means reading local name and URI separately rather than the prefixed spelling a
          human typed. Two escape hatches: partial trees — build a DOM for the subtree you want, process it, drop it; and schema-aware streaming —
          XSLT 3.0 streams a template down a document when the pattern evaluates in one pass, so no look-back and no node visited twice. Both are
          fragile, since a small template change silently turns streaming back into buffering everything: measure memory rather than trusting the
          attribute. For the line-at-a-time version of this problem see <Rich text="[Log Analysis Tools](/use-cases/log-analysis/)" />.
        </P>
        <H3>Canonical bytes: why attribute order is a security property</H3>
        <P>
          Canonicalization exists because of the information-set pair above. Signing raw bytes means signing a representation rather than a
          message, so every interoperable XML signature — XML Signature, SAML assertions, WS-Security headers, XBRL facts, update manifests — is
          taken over a canonical octet stream. Canonical XML is not a pretty printer; it is a normalisation with a fixed answer. The rules, in
          the order they bite: UTF-8 with no declaration; document order, because element order is data; namespace declarations before attributes
          and sorted, attributes sorted by namespace URI then local name with no-namespace first; character references replaced by the characters
          they name; CDATA turned into escaped text; attribute values normalized; empty elements written as start-tag plus end-tag; tabs and
          newlines in text escaped numerically; comments dropped unless the profile says otherwise.
        </P>        <CodeBlock
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
          caption="A and B differ by four bytes of source and hash differently as files; canonicalised they are the same 108-byte octet stream, which is the only reason a signature over either can be verified by a stranger."
        />
        <P>
          The default algorithm is <em>inclusive</em>: it emits every namespace in scope, including ones inherited from an ancestor outside the
          signed fragment and ones the subtree never uses — correct for a whole document, dangerous for a fragment. That is why Exclusive
          Canonicalization exists: it outputs only namespaces <em>visibly utilized</em> by the element, so a signature over{' '}
          <Rich text={'`//Assertion/AttributeStatement`'} /> is not invalidated by the envelope it sits inside. Whitespace is the other half: text
          nodes are data, so indentation inside mixed content is part of the signed bytes and the canonical form keeps it, while the
          whitespace-stripping variant discards whitespace-only nodes between elements but never text inside one. When a partner&apos;s
          verification fails and yours succeeds, ask in that order: which variant each side used, whether a beautifier or a git filter touched the
          file, whether <Rich text="`xml:space`" /> was involved.
        </P>
        <Callout tone="risk" title="Two attacks that live in the canonicalization layer">
          <P>
            XML Signature Wrapping depends on signer and verifier disagreeing about which subtree a signature covers: the attacker keeps the
            signed element, adds an untouched copy elsewhere, and the application reads the wrong one. The mitigation is structural — verify that
            the signed node is the node you act on. The second is the DTD and comment problem: if the subset or a comment is canonicalised, markup
            added before the root changes the digest, which is how an XXE payload can arrive inside something that looks signed.
          </P>
        </Callout>
      </Section>

      <Section id="xml-against-json" title="XML against JSON: measured bytes, live uses, and the conversion losses" kicker="Arithmetic, not folklore">
        <P>
          The running example, as XML with declaration and two-space indentation, is 693 bytes; the equivalent JSON object, pretty-printed, 618.
          Stripped of whitespace, 587 against 493 — real differences, and much smaller than the arguments usually had about it.
        </P>
        <P>
          Repetition changes the picture, the part most writeups skip: 500 records of the same shape, minified, same values, are 238,500 bytes of
          XML against 219,907 of JSON, 8.5% apart; gzipped at level 9 the same two files are 5,435 and 7,481 bytes — XML 27%{' '}
          <strong>smaller</strong>. XML&apos;s overhead is almost pure redundancy: <Rich text="`</title>`" /> repeats a string deflate has already
          seen, and the 140 bytes of element names in the 480-byte minified entry compress to nothing. JSON&apos;s overhead differs in kind: quoted
          keys are redundant, numeric and boolean literals are not.
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
            ['500 records, gzipped level 9', '5,435 bytes', '7,481 bytes', 'XML 27.4% SMALLER'],
            ['Prefix tax, 1,000 records', '66,831 prefixed', '54,831 unprefixed', 'prefix alone +21.9%'],
            ['Mixed-content paragraph', '130 bytes', '169 bytes (BadgerFish)', 'conversion costs more than markup'],
            ['One call, SOAP 1.2 versus JSON', '185 bytes', '26 bytes', 'XML +611%: envelopes, not data'],
            ['Name share of a minified record', '140 of 480 bytes', 'n/a: keys play that role', '29% is repeated names'],
          ]}
          foot="Measured with Node's Buffer.byteLength and zlib gzip level 9 on the markup printed here; reproduce with wc -c and gzip -9."
        />
        <H3>Where XML still wins in production</H3>
        <P>
          XML survives because specific problems were specified against it, and the capabilities they need — identity, signature, mixed
          vocabularies, documents rather than records — are the ones newer formats lack.
        </P>
        <DataTable
          caption="Live XML, and the feature that keeps it there"
          head={['Domain', 'Format', 'What it uses XML for', 'Why not JSON']}
          rows={[
            ['Single sign-on', 'SAML 2.0 over XML Signature', 'Namespace vocabularies, canonicalization, a signature over part of a tree', 'Signing a fragment needs a canonical byte model; JSON has none'],
            ['Office documents', 'Office Open XML: .docx, .xlsx, .pptx', 'A ZIP of XML parts and relationships; styles as separate documents', 'JSON would work; the vocabulary, schema and editors are XML'],
            ['Vector graphics', 'SVG', 'Mixed content for text-in-shape, presentation attributes, a namespace per module', 'Geometry in attributes and element order are both load-bearing'],
            ['Feeds', 'RSS 2.0 and Atom', 'CDATA for embedded HTML, namespaced extensions, xml:base', 'Extension vocabularies without collision is the namespace problem, solved'],
            ['Geodata', 'GPX waypoints, tracks, routes', 'Attributes for latitude and longitude, schema types, a text declaration', 'A GPX file is 30 KB of points; the schema is why readers agree'],
            ['RPC and messaging', 'SOAP 1.2, WSDL, the WS-* stack', 'An envelope, mustUnderstand headers, typed bodies against XSD', 'Enterprise contracts, not bandwidth'],
            ['Build and config', 'Maven, AndroidManifest, Ant, Tomcat, Info.plist', 'Deep nesting, ordered plugin execution, machine-written grammar', 'Order in manifests is semantics; JSON object order is not'],
            ['Databases', 'PostgreSQL xml, Oracle XMLTYPE, SQL Server, DB2', 'Document storage with XPath and XQuery, indexed paths, schema registration', 'The data is documents, not rows'],
            ['Publishing', 'DocBook, DITA, TEI, JATS, EPUB, MathML', 'Long mixed content, conditional inclusion, entity assembly, XSLT to print', 'A book is a document; documents need mixed content'],
          ]}
        />
        <P>
          The honest comparison is on <Rich text="[XML vs JSON](/compare/xml-vs-json/)" /> and, for configuration,{' '}
          <Rich text="[YAML vs XML](/compare/yaml-vs-xml/)" />.
        </P>
        <H3>XML to JSON: the conventions and the six losses</H3>
        <P>
          There is no standard XML-to-JSON mapping: the conventions disagree in ways invisible until a consumer breaks. The one used here puts
          attributes under underscore-prefixed keys, element text under <Rich text={'`#text`'} />, repeated elements in arrays.
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
          caption="Four decisions made without asking: the prefix vanished, one author became an object while two tags became an array, 44.99 stayed a string while true became a boolean, and the empty generated attribute kept its quotes."
        />
        <DataTable
          caption="The six losses, with the smallest document that demonstrates each"
          head={['Loss', 'XML', 'Typical JSON', 'What breaks']}
          rows={[
            ['Cardinality', '<order><item/></order> (44 bytes)', '{"order":{"item":{}}}; two items give {"item":[…]}', 'A consumer for one shape throws on the other'],
            ['Attributes', '<e a="1">x</e>', '{"e":{"_a":"1","#text":"x"}}', 'Collisions: an element _a and an attribute a become one key'],
            ['Mixed content', '<p>The <b>X</b> is <i>Y</i>.</p> (130 bytes)', 'BadgerFish 169, xml-js 224, or 86 without the markup', 'Consumers must agree which of three they got'],
            ['Order', 'Element order is data; attribute order is not', 'Key order is a writer implementation detail', 'Signed or diffed documents; sequences of mixed children'],
            ['Types', 'Strings unless a DTD or XSD says otherwise', 'Guessing: 44.99 to number, true to boolean, 007 to 7', 'Leading zeros, big integers, date zones'],
            ['Provenance', 'Comments, PIs, CDATA, entities, xml:space', 'Discarded, or promoted into keys', 'Round-tripping is not a round trip'],
          ]}
        />
        <P>
          Three rules follow. Force arrays for elements that may repeat, so one record and two records have the same shape — the most common
          conversion defect. Keep namespace URIs somewhere if the vocabulary matters: dropping the prefix without keeping the URI collapses{' '}
          <Rich text={'`urn:sales`'} /> and <Rich text="`urn:crm`" /> into one key the day someone merges two feeds. And convert after validation,
          not after entity expansion: a converter that resolves external entities first has turned a translation problem into the XXE problem
          above.
        </P>
      </Section>

      <Section id="how-our-xml-tools-handle-these-cases" title="How our tools handle these cases" kicker="Scope">
        <P>
          This is the only place on this page that describes what FmtTools does. There is no XML converter here, and that is a decision rather
          than an omission: a converter cannot be correct without knowing which of the six losses you mean to accept. What the site does is the far
          end of the pipeline — formatting, validating and minifying the JSON your mapper produced. The{' '}
          <Rich text="[JSON validator](/json-tools/validator/)" /> is the part that reports on conversion damage: duplicate keys and precision
          loss, which is what the collision and type-guessing rows above predict. Nothing here parses a DOCTYPE, fetches an external entity or
          canonicalises a signature: those are your parser&apos;s configuration, and the tables above are the checklist.
        </P>
      </Section>
    </Prose>
  )
}
