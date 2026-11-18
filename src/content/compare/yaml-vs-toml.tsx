/**
 * YAML vs TOML comparison. Content module for /compare/yaml-vs-toml/.
 * Facts resolved against the TOML v1.0.0 and v1.1.0 specifications, the YAML
 * 1.2.2 specification and 1.1 type repository, the Cargo book, PEP 518/517/621,
 * the CPython tomllib documentation and the CI YAML reference (see meta.sources).
 * This site converts YAML and JSON in the browser. It does not convert TOML.
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, P, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'yaml-vs-toml',
  path: '/compare/yaml-vs-toml/',
  title: 'YAML vs TOML: Differences That Break a Config File | FmtTools',
  description:
    'YAML against TOML on types, indentation, machine editing, coercion traps, tags and ecosystem choice, with exact spec clause references and a decision table.',
  h1: 'YAML and TOML, Compared on the Things That Break',
  faqTopic: 'YAML and TOML',
  summary:
    'TOML exists because YAML configuration could not be edited safely by tools. Here is the whole argument, checked clause by clause against both specifications.',
  keywords: [
    'yaml vs toml',
    'toml vs yaml config file',
    'pyproject.toml vs yaml',
    'toml data types',
    'yaml implicit typing problems',
    'machine editable configuration',
    'cargo toml configuration',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 27,
  sections: [
    { id: 'why-two-formats', label: 'Two formats, one argument' },
    { id: 'type-vocabulary', label: 'Closed type set against open resolver' },
    { id: 'structure', label: 'Brackets against counted columns' },
    { id: 'machine-editing', label: 'Who can edit the file safely' },
    { id: 'coercion-traps', label: 'Coercions TOML cannot perform' },
    { id: 'toml-traps', label: 'Where TOML fails to parse' },
    { id: 'comments', label: 'Comments and the human editor' },
    { id: 'security', label: 'Tags and what a grammar refuses' },
    { id: 'ecosystems', label: 'Which ecosystem chose which' },
    { id: 'conversion', label: 'Converting, and what breaks' },
    { id: 'decision', label: 'The decision table' },
  ],
  faqs: [
    {
      question: 'Is TOML a subset of YAML, or the other way round?',
      answer:
        'Neither. YAML 1.2 makes JSON a strict subset of YAML, and its introduction says that was the primary focus of the 1.2 revision. TOML is unrelated to both: a different grammar, a different whitespace model, a closed list of value types. A TOML file is not valid YAML and a YAML file is almost never valid TOML, so conversion between them is a re-encoding, not a re-spelling.',
    },
    {
      question: 'Can TOML express null?',
      answer:
        'No. The TOML v1.0.0 and v1.1.0 specifications list ten permitted value types — String, Integer, Float, Boolean, Offset Date-Time, Local Date-Time, Local Date, Local Time, Array and Inline Table — and state plainly that unspecified values are invalid, with a bare `key =` given as an invalid example. To mean nothing in TOML, omit the key, or write an empty string or an explicit sentinel. This single fact is the largest source of loss in YAML-to-TOML conversion.',
    },
    {
      question: 'Why does YAML turn NO into false while TOML does not?',
      answer:
        'Because the YAML 1.1 boolean type matches `y`, `n`, `yes`, `no`, `on`, `off` and their capitalisations, while TOML has exactly two boolean spellings: `true` and `false`. Writing `enabled = NO` in TOML is not a coercion, it is a parse error, and the parser stops. YAML 1.2 core schema dropped most of the 1.1 spellings, but many deployed parsers still implement 1.1, so the risk follows the library, not the file.',
    },
    {
      question: 'Which format is easier for a program to edit?',
      answer:
        'TOML, and that was the design intent. A key, its equals sign and its value must sit on one line, whitespace around them is ignored, and structure is carried by `[table]` headers rather than by indentation columns. A tool such as `cargo add` can rewrite one dependency line and leave the rest of `Cargo.toml` byte-identical, including comments. Round-tripping YAML without losing comments, key order, anchors and block styles needs a dedicated library.',
    },
    {
      question: 'Is TOML more secure than YAML?',
      answer:
        'In one precise sense, yes: TOML has no tag or constructor mechanism, so a conforming parser cannot be induced by file content to build an application object, which is the class of bug behind unsafe YAML loading. That is a property of the grammar, not a general guarantee. A TOML value can still be interpreted dangerously by the program that reads it, and unsafe YAML remains safe if loaded with a plain-types loader.',
    },
    {
      question: 'Does TOML have comments, multi-line strings and reuse?',
      answer:
        'Comments and multi-line strings, yes. A hash marks the rest of the line as a comment except inside a string, and multi-line basic strings support a line-ending backslash that swallows the newline and following whitespace. Reuse, no: TOML has no anchors, no aliases and no merge keys, so a shared block must be repeated, generated, or lifted by the tool that reads the file.',
    },
    {
      question: 'Should I write Kubernetes manifests or CI pipelines in TOML?',
      answer:
        'No. Kubernetes, GitHub Actions, GitLab CI and Docker Compose parse YAML, and their schemas depend on features TOML lacks: ordered sequences of mappings, multi-document streams separated by three dashes, and anchors for reuse. TOML is the right choice for the layer above or below that — project metadata, build configuration and tool settings, which is what it was designed for.',
    },
    {
      question: 'Can this site convert YAML to TOML?',
      answer:
        'It cannot. FmtTools converts between YAML and JSON in the browser, with [YAML to JSON](/format-converters/yaml-to-json/) and [JSON to YAML](/format-converters/json-to-yaml/), and neither accepts or emits TOML. The practical path is two steps: parse the YAML to JSON here, inspect the resolved types, then move the values into TOML by hand, because every automatic route has to invent a rule for null, tags and anchors.',
    },
  ],
  sources: [
    {
      label: 'TOML v1.0.0 specification',
      href: 'https://toml.io/en/v1.0.0',
      detail:
        'The stated objectives, the ten permitted value types, the "unspecified values are invalid" rule that removes null, the one-key-per-line requirement, comment syntax, bare and quoted key rules, the "you cannot define a table more than once" rule, heterogeneous arrays, integer underscores and the ban on leading zeros.',
      accessed: '2026-11-12',
    },
    {
      label: 'TOML v1.1.0 specification, published 18 December 2025',
      href: 'https://toml.io/en/v1.1.0',
      detail:
        'The same byline and objectives, plus the new normative sentence about comments — parsers must not modify keys or values based on the presence or contents of a comment — multi-line inline tables, the stricter UTF-8 well-formedness requirement and the date-time separator rules quoted here.',
      accessed: '2026-11-12',
    },
    {
      label: 'YAML 1.2.2 specification (2021-10-01)',
      href: 'https://yaml.org/spec/1.2.2/',
      detail:
        'The introduction statement that the 1.2 revision was published in 2009 with the primary focus of making YAML a strict superset of JSON and that it removed many of the problematic implicit typing recommendations, plus the core schema resolution tables, tag handles and the document-stream model.',
      accessed: '2026-11-12',
    },
    {
      label: 'Boolean type for YAML 1.1 (yaml.org type repository)',
      href: 'https://yaml.org/type/bool.html',
      detail:
        'The regular expression that resolves y, Y, yes, no, on, off and every capitalisation to a boolean — the mechanism behind the country-code and feature-flag incidents described in the coercion section.',
      accessed: '2026-11-12',
    },
    {
      label: 'The Cargo Book: Configuration',
      href: 'https://doc.rust-lang.org/cargo/reference/config.html',
      detail:
        'That Cargo configuration files are written in the TOML format with key-value pairs inside sections called tables, that environment variables take precedence over the TOML files, that the .toml extension became the preferred form in Cargo 1.39, and that the credentials file is created and updated automatically by cargo login and cargo logout.',
      accessed: '2026-11-12',
    },
    {
      label: 'PEP 518 — Minimum requirements for an isolated build environment',
      href: 'https://peps.python.org/pep-0518/',
      detail:
        'The verbatim rationale for choosing TOML — human-usable unlike JSON, flexible and standards-based unlike configparser, not overly complex unlike YAML — plus the build-system table, the note that a pyproject.toml may legitimately hold non-build configuration, and the rejected-alternatives discussion.',
      accessed: '2026-11-12',
    },
    {
      label: 'Python documentation: tomllib',
      href: 'https://docs.python.org/3/library/tomllib.html',
      detail:
        'That the standard library gained a TOML parser in 3.11 for TOML 1.0.0 and parses TOML 1.1.0 in 3.15, that the module does not support writing TOML, that CPython loads entries in source order as an implementation detail, and the mapping of the three local date-time types onto datetime objects.',
      accessed: '2026-11-12',
    },
    {
      label: 'GitLab CI/CD YAML reference',
      href: 'https://docs.gitlab.com/ci/yaml/',
      detail:
        'That GitLab CI/CD configuration uses YAML formatting so keyword order is unimportant, that YAML anchors are documented for scripts, and that the extends keyword is described as similar to YAML anchors but simpler and usable with include.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    {
      path: '/format-converters/yaml-to-json/',
      name: 'YAML to JSON',
      blurb: 'The first half of any YAML-to-TOML migration: resolve every plain scalar and see the types.',
    },
    {
      path: '/format-converters/json-to-yaml/',
      name: 'JSON to YAML',
      blurb: 'Emits block YAML that quotes anything a 1.1 reader could misread — the TOML-style defence.',
    },
    { path: '/learn/yaml/', name: 'YAML: the complete guide', blurb: 'Implicit typing, anchors, block scalars and the version differences in full.' },
    { path: '/use-cases/config-conversion/', name: 'Config conversion', blurb: 'Manifests, pipelines and profiles moved between the formats this site does handle.' },
  ],
  words: 5850,
  image: '/images/covers/cmp-yaml-vs-toml.png',
  imageAlt:
    'Two configuration files side by side: a YAML document whose nesting is expressed by indentation, and a TOML document whose nesting is expressed by bracketed table headers and one key per line.',
}

export default function Article() {
  return (
    <>
      <Section id="why-two-formats" title="Two formats, one argument about editing" kicker="Why this exists">
        <P>
          TOML is not a competing spelling of the same idea as YAML. It is a reply to a specific complaint about YAML, and the reply is written into the format's own charter. The <Rich text="[TOML v1.0.0 specification](https://toml.io/en/v1.0.0)" /> opens with three sentences, and every clause of this comparison is a consequence of them: <Rich text="`TOML aims to be a minimal configuration file format that's easy to read due to obvious semantics. TOML is designed to map unambiguously to a hash table. TOML should be easy to parse into data structures in a wide variety of languages.`" /> Easy to read. Unambiguous. Maps to a hash table. Parseable without a build tool chain. Those are not aesthetic preferences; they are answers to the failure modes described in the <Rich text="[YAML guide](/learn/yaml/)" />.
        </P>
        <P>
          The complaint is documented by the people who adopted TOML rather than by its author alone. PEP 518, which chose the format for Python's <Rich text="`pyproject.toml`" />, says the decision out loud: <Rich text="`This format was chosen as it is human-usable (unlike JSON), it is flexible enough (unlike configparser), stems from a standard (also unlike configparser), and it is not overly complex (unlike YAML).`" /> The same page records that the format was <Rich text="`already in use by the Rust community as part of their Cargo package manager`" /> and that that community had said it was happy with the choice. "Not overly complex" is a pointed phrase to use about a language whose 1.2.2 specification runs to hundreds of productions, and it is the entire reason two formats exist for the same job.
        </P>
        <P>
          YAML's own defence is on the record too, and it is honest. The introduction to the <Rich text="[YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/)" /> states that the 1.2 revision was published in 2009, that <Rich text="`its primary focus was making YAML a strict superset of JSON`" />, and that <Rich text="`it also removed many of the problematic implicit typing recommendations`" />. In other words, the committee conceded the criticism and fixed it — but only in 2009, and only in a revision that plenty of shipping parsers do not implement. TOML started from the opposite end: instead of removing the ambiguous types from a big language, it built a small language with nothing ambiguous in it.
        </P>
        <CodeBlock
          title="the same service, written in each format"
          language="yaml"
          code={`# deploy.yaml
service:
  name: billing
  port: 8080
  replicas: 3
  features:
    - retries
    - vault
  limits:
    cpu: "500m"
    memory: 128Mi
owner:
  team: payments
  oncall: ["ana", "tofig"]`}
          caption="Four levels of nesting expressed as four indentation steps. Nothing here names the structure; the columns do."
        />
        <CodeBlock
          title="the same service, as TOML"
          language="toml"
          code={`# deploy.toml
[service]
name = "billing"
port = 8080
replicas = 3
features = ["retries", "vault"]

[service.limits]
cpu = "500m"
memory = "128Mi"

[owner]
team = "payments"
oncall = ["ana", "tofig"]`}
          caption="Nine lines of header and bracket in exchange for the elimination of one whole class of bug: nothing in this file means anything because of where it starts on a line."
        />
        <P>
          Read the pair again with the question "what happens when a tool edits this?" and the difference stops being cosmetic. The TOML file can have <Rich text="`port`" /> rewritten by a script that changes one line; every other byte, including the comment, stays where it is. The YAML file can be edited by a script that rebuilds the whole document from the parsed tree, which is a different operation: it loses the comment, may reorder keys, and re-chooses every scalar style. Both formats are text. Only one of them is text whose meaning is local to the line you are changing.
        </P>
        <DataTable
          caption="The two charters, side by side, in their own words"
          head={['Question', 'YAML 1.2.2', 'TOML 1.0.0 / 1.1.0']}
          rows={[
            ['Declared purpose', 'A human-oriented data serialization language, and a strict superset of JSON', 'A minimal configuration file format, easy to read due to obvious semantics'],
            ['Target model', 'A representation graph of nodes with tags, which may contain shared nodes', 'Maps unambiguously to a hash table'],
            ['Type system', 'Open: tags and a schema decide; three recommended schemas, and implementations may add more', 'Closed: ten value types, and "unspecified values are invalid"'],
            ['Structure', 'Indentation and block context', 'Explicit headers, dotted keys and one key per line'],
            ['Reuse', 'Anchors, aliases and a 1.1 merge type', 'None'],
            ['Documents', 'A stream of zero or more documents per file', 'Exactly one document per file'],
            ['Versioning posture', '1.2 is a superset aimed at 1.1 compatibility; 1.1 semantics still ship', '1.0.0 froze the language; 1.1.0 added only clarifications and two relaxations'],
          ]}
          foot="The last row matters for anyone deciding in 2026: TOML v1.1.0 was published on 18 December 2025 and keeps the same objectives paragraph and the same byline, Tom Preston-Werner, Pradyun Gedam, et al."
        />
        <Callout tone="note" title="The claim this page will defend">
          <P>
            TOML wins on editability, unambiguity and parseability. YAML wins on expressiveness: it can say things TOML cannot say at all — nothing, shared nodes, many documents, typed objects. If you pick by which format is "nicer", you will pick wrong; if you pick by who is allowed to write to the file, you usually pick right. Everything below is evidence for that one sentence.
          </P>
        </Callout>
      </Section>

      <Section id="type-vocabulary" title="A closed type set against an open resolver" kicker="The data model">
        <P>
          TOML enumerates its value types and stops. The specification lists String, Integer, Float, Boolean, Offset Date-Time, Local Date-Time, Local Date, Local Time, Array and Inline Table, then adds the sentence that decides the whole comparison with JSON and YAML: <Rich text="`Unspecified values are invalid.`" /> with <Rich text="`key = # INVALID`" /> as the example. There is no eleventh type. There is no null.
        </P>
        <P>
          YAML works the other way round. Its data model is three node kinds — scalar, sequence, mapping — and an unbounded set of tags; the core schema recommended by 1.2 resolves plain scalars to <Rich text="`!!null`" />, <Rich text="`!!bool`" />, <Rich text="`!!int`" /> and <Rich text="`!!float`" />, and any implementation may define more. So YAML has five ways to write nothing — <Rich text="`null`" />, <Rich text="`Null`" />, <Rich text="`NULL`" />, <Rich text="`~`" />, and an empty value — plus the empty string, which is emphatically not nothing. JSON has exactly one null. TOML has none, and that is the single biggest conversion problem between these formats, not the brackets.
        </P>
        <CodeBlock
          title="absence, in three vocabularies"
          language="yaml"
          code={`# YAML: four distinct states, all legal
explicit_null: null
tilde: ~
empty_value:
empty_string: ""`}
          caption="Resolved with a 1.2 core parser, the first three are null and the fourth is the empty string. Converted to JSON, three of them become null and one becomes an empty string."
        />
        <CodeBlock
          title="the same four states, as TOML"
          language="toml"
          code={`explicit_null = "null"   # the only way to write the word
empty_string = ""
# no way to write null: omit the key instead
# missing_keys_are_the_only_null = # INVALID`}
          caption="In TOML the absence of a key is the whole story. A loader that needs three states — set, empty, absent — must invent a convention, and every tool that reads the file has to agree on it."
        />
        <P>
          The practical shape of this is a schema question, not a syntax question. If your configuration model has a nullable field — <Rich text="`tls_ca:`" /> meaning "verify with the system bundle" versus <Rich text={'`tls_ca: ""`'} /> meaning "do not verify" versus the key absent meaning "TLS off" — TOML can store two of the three states per key and YAML can store all of them, but only if your reader distinguishes an empty value from an empty string, which plenty of readers do not.
        </P>
        <H3>What each format can say at all</H3>
        <DataTable
          caption="Expressiveness, checked against the specifications rather than against taste"
          head={['Concept', 'YAML 1.2', 'TOML 1.1.0', 'Consequence when converting']}
          rows={[
            ['null', 'five spellings plus empty', 'not representable', 'YAML to TOML: every null becomes an omitted key, a string, or a silent failure'],
            ['boolean', 'true/false in 1.2 core; 24 spellings in 1.1', 'exactly true and false', 'TOML to YAML: safe; YAML to TOML: quote the 1.1 spellings first'],
            ['integer', 'decimal, 0x, 0o, 1_000 in 1.1, sign allowed', 'decimal, 0x, 0o, 0b, underscores, no leading zeros', 'Both handle it; the spellings differ'],
            ['float', '0., .5, 1e3, .inf, .nan', 'requires a dot or exponent; inf, +inf, -inf, nan, +nan, -nan', 'NaN equality stays broken in both'],
            ['date and time', 'no timestamp type in the 1.2 schemas; a 1.1 type otherwise', 'four first-class temporal types', 'TOML dates leave as strings or as objects depending on the reader'],
            ['ordered sequence', 'first-class, of any node type', 'first-class, may mix types', 'Fine in both directions'],
            ['mapping with non-string keys', 'legal, including sequence and complex keys', 'keys are always strings', 'YAML to TOML needs key stringification; JSON cannot do it either'],
            ['shared nodes (anchors)', 'first-class; the model is a graph', 'absent', 'Any YAML alias must be expanded before conversion'],
            ['multiple documents', 'one stream, many documents', 'one document per file', 'A Kubernetes manifest has no TOML equivalent'],
            ['comments', 'yes, not part of the data model', 'yes, explicitly not part of the data', 'Lost by every JSON-mediated round trip'],
            ['application types via tags', 'yes, by design', 'no mechanism exists', 'The security section is about exactly this line'],
          ]}
          foot="Nine of these rows are symmetric. Two of them — null and tags — explain most of the complaints you will read about moving configuration between the formats."
        />
        <KeyTerms
          items={[
            { term: 'hash table', definition: 'The structure TOML promises to map to unambiguously: string keys, typed values, nested tables.' },
            { term: 'closed type set', definition: 'A grammar in which every value must match one of a fixed list of shapes; anything else is a syntax error rather than a guess.' },
            { term: 'tag resolution', definition: 'YAML 1.2 mechanism that matches a plain scalar against a schema table to pick a type; no TOML equivalent.' },
            { term: 'local date-time', definition: 'A TOML temporal value with no offset, e.g. 1979-05-27T07:32:00; maps to a datetime with no tzinfo in Python.' },
            { term: 'offset date-time', definition: 'A TOML instant with an explicit offset or Z, e.g. 1979-05-27T07:32:00Z.' },
            { term: 'inline table', definition: 'TOML single-expression map, features = { retries = 3, vault = true }; in 1.1.0 it may be spread over several lines.' },
          ]}
        />
        <Callout tone="warn" title="Where the type difference bites">
          <P>
            Because TOML values are typed by shape and there is no fallback, <Rich text="`port = 8080`" /> is an integer and <Rich text={'`port = "8080"`'} /> is a string, and a loader that wants an integer will reject the second one loudly. YAML makes the same distinction, but its unquoted form passes through a resolver first, so <Rich text="`port: +8080`" /> is a valid YAML integer that JSON cannot represent — a leading plus is not legal JSON number syntax — and the error surfaces later, in a different language, in a different component. TOML cannot be that subtle: it either parses or it does not.
          </P>
        </Callout>
      </Section>

      <Section id="structure" title="Explicit brackets against counted columns" kicker="Syntax">
        <P>
          YAML's structural claim is that a human can write a tree quickly. Its mechanism is indentation: a mapping's members are the lines indented under its key, a sequence's members are the dashes at one column, and the parser works out parentage from character positions. The 1.2 specification is emphatic that the amount of indentation is a presentation detail that must not be used to convey content — but only in the sense that two spaces and four spaces must not mean different things. Relative indentation is load-bearing and absolute indentation is not, which is a fine distinction for a human and a terrible one for a text editor that expands tabs differently.
        </P>
        <P>
          TOML removes the axis. Whitespace is ignored around key names and values, the key, the equals sign and the value must be on the same line — with the exception of values that are themselves multi-line — and there must be a newline or end of file after each key/value pair. The spec even gives the two-line failure as an example: <Rich text={'`first = "Tom" last = "Preston-Werner" # INVALID`'} />. Nesting comes from three constructs and one convention:
        </P>
        <DataTable
          caption={'The four ways to say "nested" in TOML, and what each one is'}
          head={['Construct', 'Example', 'Produces', 'Notes']}
          rows={[
            ['Table header', '[service.limits]', 'a map at service.limits', 'Every following key belongs to it until the next header; order of definition is free'],
            ['Dotted key', 'service.limits.cpu = "500m"', 'the same map, created implicitly', 'Dotted keys define their parent tables; a bare key may contain dots only as a separator'],
            ['Inline table', 'limits = { cpu = "500m", memory = "128Mi" }', 'a map, as one value', 'Self-contained in 1.0.0; v1.1.0 allows its pairs on different lines'],
            ['Array of tables', '[[service.env]]', 'one appended element of an array of maps', 'Repeated headers append; the only way to spread a list of objects over several readable lines'],
          ]}
          foot="The last row is the construct people fight. A YAML sequence of five mappings becomes five [[header]] blocks, and inserting one in the middle means moving a header, not a line."
        />
        <CodeBlock
          title="a list of objects, both ways"
          language="yaml"
          code={`# k8s-style: five items, easy to reorder
ports:
  - name: http
    containerPort: 8080
    protocol: TCP
  - name: metrics
    containerPort: 9090
    protocol: TCP`}
          caption="Each item is four lines and the block for item two can be cut and pasted anywhere in the sequence."
        />
        <CodeBlock
          title="the same list, as an array of tables"
          language="toml"
          code={`[[ports]]
name = "http"
containerPort = 8080
protocol = "TCP"

[[ports]]
name = "metrics"
containerPort = 9090
protocol = "TCP"`}
          caption="Six lines plus two headers. Moving the second item above the first means moving a header line with it, and forgetting that is how people end up with two [[ports]] blocks and one name key stranded in the wrong table."
        />
        <P>
          TOML can express the same list more compactly as an array of inline tables, which is what most generated files do: <Rich text={'`ports = [{ name = "http", containerPort = 8080 }, { name = "metrics", containerPort = 9090 }]`'} />. That is one line, and it is worse for diffs, which is why Cargo and the Python tools write arrays of scalars inline and arrays of objects as repeated <Rich text="`[[table]]`" /> headers. YAML has the same tension between flow style and block style, but the block form is the default and the readable one, and its flow form is byte-identical to JSON.
        </P>
        <H3>Depth, and what it costs</H3>
        <P>
          A nested path in YAML costs one indentation step. The same path in TOML costs either a longer header — <Rich text="`[a.b.c.d]`" /> — or a longer dotted key — <Rich text="`a.b.c.d = 1`" /> — and, crucially, both of those must be consistent with everything else in the file, because a table can be defined only once. Deep structures therefore push TOML toward inline tables and YAML toward indentation, and the two formats hide their pain in different places: YAML hides it in columns that must stay aligned, TOML in headers that must not collide.
        </P>
        <Callout tone="note" title="Order is a different axis again">
          <P>
            The specification's own sentence is <Rich text="`Key/value pairs within tables are not guaranteed to be in any specific order.`" /> So nothing in a conforming TOML program depends on where a key sits. CPython's <Rich text="`tomllib`" /> documentation records that it loads entries in the order they appear in the source, and labels that as an implementation detail rather than a guarantee. YAML mappings are likewise unordered in the data model, though key order is preserved in practice by most libraries and is precious in round-trip editing because it is what the human sees. If your format decision is "we want the file to stay diffable", both formats need a generator with a fixed key order, and neither format gives you one for free.
          </P>
        </Callout>
      </Section>

      <Section id="machine-editing" title="Who is allowed to edit your file without destroying it" kicker="The real question">
        <P>
          Most configuration files are written by a human once and then edited forever by programs: a dependency added by a command, a version bumped by a release bot, a field set by a scaffold generator. The question that decides these two formats is not which reads better but which survives that edit.
        </P>
        <P>
          TOML is built to be rewritten in place. Because structure is carried by headers and each value lives on its own line, a tool can perform surgical text edits and remain correct without ever modelling the document. That is not hypothetical: the <Rich text="[Cargo book](https://doc.rust-lang.org/cargo/reference/config.html)" /> documents Cargo's own configuration as TOML — <Rich text="`Configuration files are written in the TOML format (like the manifest), with simple key-value pairs inside of sections (tables)`" /> — the <Rich text="`cargo add`" /> command is described in the command reference in the same documentation as "Add dependencies to a Cargo.toml manifest file", and the credentials file is documented as <Rich text="`automatically created and updated by cargo login and cargo logout`" />, in a <Rich text="`$CARGO_HOME/credentials.toml`" /> that Cargo has written by default since version 1.68. Cargo also defines the escape hatch that machine editors need: any key of the form <Rich text="`foo.bar`" /> can be set by the environment variable <Rich text="`CARGO_FOO_BAR`" />, and <Rich text="`Environment variables will take precedence over TOML configuration files.`" /> A tool that cannot safely edit the file has a documented way to not touch it.
        </P>
        <P>
          Python tells the same story from the other direction. PEP 518 put <Rich text="`pyproject.toml`" /> under the same logic — a file tools must read reliably, hence a format that is not overly complex — and the point of the file is that it is read by programs that did not write it. Note what those edits are: an <Rich text="`[project]`" /> table key, a <Rich text="`[build-system]`" /> requirement string, a setting inside the <Rich text="`[tool.flit]`" /> table that PEP 518 itself uses as its example. They are single-line changes in a file whose meaning does not depend on alignment, and a comment written by a human three sections above is untouched by all of them. Notably, PEP 621 lists "Require build back-ends to update pyproject.toml when generating an sdist" among its rejected ideas — the concern being tool edits to a human-owned file, not the format's ability to survive them.
        </P>
        <H3>Why YAML round-tripping is a library, not a feature</H3>
        <P>
          A YAML editor cannot work on lines. Move one line and you have moved a subtree; delete a line of indentation and you have changed a parent. So any tool that edits YAML responsibly parses, mutates the tree, and re-serialises, and re-serialising a language that has scalar styles, block headers, anchors, comments, key order and folding choices means deciding what to do about all of them. The specification makes that harder on purpose: anchors are discarded once the representation graph is composed, so whether your merge keys and aliases survive an edit is a property of the library, not of the format. That is why YAML round-tripping is a feature you install — libraries that advertise comment, key-order and style preservation — while TOML round-tripping is a feature the grammar gives you.
        </P>
        <P>
          The asymmetry shows up in what is in the standard library. Python's <Rich text="`tomllib`" /> parses TOML 1.0.0 from 3.11 and TOML 1.1.0 from 3.15, and its documentation states flatly that <Rich text="`This module does not support writing TOML.`" /> Read that correctly: the language shipped a reader and declined to ship a writer, because writing TOML responsibly — preserving what the human typed — is a project of its own, which is why separate libraries exist for it. YAML has no reader in any standard library either, but it has an entire sub-industry of round-trip tooling precisely because the naive path destroys so much.
        </P>
        <CodeBlock
          title="the edit, as a diff: cargo add and its YAML equivalent"
          language="bash"
          code={`$ cargo add serde_json
      Adding serde_json v1.0.145 to dependencies.`}
          caption="Cargo appends one line inside the [dependencies] table. The diff is one added line; every comment, blank line and ordering the author chose is untouched. The equivalent operation in YAML, done by a re-serialising tool, typically diffs the whole file because the writer re-picked every style."
        />
        <DataTable
          caption="What survives an automated edit, format by format"
          head={['Artifact in the file', 'TOML with a line-editing tool', 'YAML with a load-and-dump tool', 'YAML with a round-trip tool']}
          rows={[
            ['Comments', 'Untouched — the tool does not read them', 'Lost, unless the library models them', 'Preserved, as non-data nodes'],
            ['Key order', 'Untouched', 'Preserved by most loaders, not guaranteed', 'Preserved deliberately'],
            ['Blank lines and grouping', 'Untouched', 'Lost', 'Partly preserved'],
            ['Scalar style (quotes, block)', 'Untouched', 'Re-chosen by the emitter', 'Preserved if the library tracks style'],
            ['Anchors and aliases', 'Not applicable — they do not exist', 'Expanded or dropped depending on the library', 'Preserved, with anchor names'],
            ['Quirks a human typed by hand', 'Still there', 'Normalised away', 'Still there'],
            ['A stray indentation change', 'Harmless', 'Changes the data', 'Changes the data'],
          ]}
          foot="The last row is the point of the whole section: TOML is not easier to edit because it is simpler to look at, it is easier to edit because an error in it costs you a parse failure rather than a different document."
        />
        <Callout tone="warn" title="Where TOML editing goes wrong anyway">
          <P>
            Line-oriented editing has its own bug class. A naive tool that appends <Rich text="`foo = 1`" /> to the end of the file puts that key inside whichever <Rich text="`[table]`" /> header happened to be last, silently nesting it under the wrong parent; a tool that inserts <Rich text="`[a]`" /> where <Rich text="`a.b = 1`" /> has already defined table <Rich text="`a`" /> produces a file that fails to parse; and a tool that rewrites an inline table with a regular expression can break a quoted string containing a bracket. The Rust and Python ecosystems solved this by using TOML-aware editors rather than text editors. The difference is that a TOML-aware editor can be one line of code, and a YAML-aware one has to be a style model.
          </P>
        </Callout>
      </Section>

      <Section id="coercion-traps" title="The coercions TOML cannot perform" kicker="Where YAML eats data">
        <P>
          This is the section that decides arguments, so it is worth being exact about what YAML does and to which version. A plain — that is, unquoted — YAML scalar is matched against the resolver table of the schema in force. The YAML 1.1 boolean type matches <Rich text="`y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF`" />. The YAML 1.1 integer type matches decimal, hexadecimal with <Rich text="`0x`" />, binary with <Rich text="`0b`" />, a leading-zero octal form, a base-60 form using colons, and decimals with underscore separators. The float type adds the fixed-point form that rewrites <Rich text="`1.10`" /> as <Rich text="`1.1`" />, exponent forms, sexagesimal floats and <Rich text="`.inf`" /> and <Rich text="`.nan`" />. A timestamp type matches ISO-like dates and turns <Rich text="`2024-01-15`" /> into a date object.
        </P>
        <P>
          Now look at what TOML does with the same six values. It does not do anything, because none of them are valid TOML except the date and the two-part version. TOML has no implicit-string-to-boolean path: the only boolean spellings are <Rich text="`true`" /> and <Rich text="`false`" />, so <Rich text="`enabled = NO`" /> is a syntax error. Its integers forbid leading zeros — the specification's own sentence is <Rich text="`Leading zeros are not allowed.`" /> — so <Rich text="`mode = 0755`" /> fails to parse rather than becoming 493. There is no base-60 form, so <Rich text="`start = 1:15`" /> fails rather than becoming 75. Bare words on the right of an equals sign are not strings either; there is no type for them to take, so they fail. The defence is not a better resolver. The defence is that the grammar refuses the whole file.
        </P>
        <CodeBlock
          title="one file, four traps in it"
          language="yaml"
          code={`country: NO              # 1.1 boolean false / 1.2 string
release: 1.10            # float 1.1 in both versions
file_mode: 0755          # 1.1 octal 493 / not a 1.2 integer form
start: 1:15              # 1.1 sexagesimal 75 / 1.2 string
cutoff: 2024-01-15       # 1.1 timestamp object / 1.2 string
flag: on                 # 1.1 boolean true / 1.2 string`}
          caption="This file parses without complaint in every YAML library you have. Ask what it means after resolution and you get two different answers."
        />
        <CodeBlock
          title="resolved with a YAML 1.1 implementation, e.g. libyaml or PyYAML"
          language="text"
          code={`country   -> bool   false
release   -> float  1.1
file_mode -> int    493
start     -> int    75
cutoff    -> date   2024-01-15
flag      -> bool   true`}
          caption="Two booleans, one float with a digit missing, one integer that was meant to be a permission mask, one integer that was meant to be a clock time, and one object where the schema expects text. Nothing was reported at parse time."
        />
        <CodeBlock
          title="resolved with a YAML 1.2 core implementation"
          language="text"
          code={`country   -> str    "NO"
release   -> float   1.1
file_mode -> str     "0755"     (or rejected: not a valid core integer)
start     -> str    "1:15"
cutoff    -> str    "2024-01-15"
flag      -> str    "on"`}
          caption="Five of six values change type between the two resolvers. Only release is the same in both — a float, still missing its trailing zero."
        />
        <DataTable
          caption="The same six values as TOML: what you write and what happens"
          head={['Intent', 'YAML 1.1', 'YAML 1.2 core', 'TOML', 'What TOML forces you to do instead']}
          rows={[
            ['Country code NO', 'boolean false', 'string', 'parse error', 'country = "NO" — the quotes are the only legal spelling'],
            ['Version 1.10', 'float 1.1', 'float 1.1', 'float 1.1', 'version = "1.10"; TOML still types a bare dotted number'],
            ['Mode 0755', 'int 493', 'string or error', 'parse error', 'mode = "0755", or mode = 0o755 if you want the number'],
            ['Time 1:15', 'int 75', 'string', 'parse error', 'start = "1:15"; a colon is not a number in any TOML type'],
            ['Date 2024-01-15', 'timestamp object', 'string', 'Local Date', 'Either accept a date type or quote it — TOML decides visibly'],
            ['Flag on', 'boolean true', 'string', 'parse error', 'flag = true, or flag = "on" if it is a label'],
          ]}
          foot="Five of the six rows are the same in TOML: it refuses. The exception is the version string, and it is worth knowing, because a float is what a bare 1.10 is in every format with numeric types. Quote versions everywhere."
        />
        <Callout tone="warn" title="The incident shape">
          <P>
            These coercions are not trivia. The reported pattern in CI systems is a list of country codes, environment names or boolean-ish labels written bare, one of which happens to match the 1.1 boolean set, so the list arrives at the consumer containing <Rich text="`false`" /> instead of a code; the filter then matches nothing, or matches everything, and the job does the wrong thing at scale. Nothing crashes, because the value is still a legal value. A second family follows the same route in the other direction: YAML-1.1 implementations resolving <Rich text="`y`" /> and <Rich text="`n`" /> to booleans in a survey or form definition. TOML cannot perform either coercion, not because it is wiser but because <Rich text="`NO`" /> is not one of its ten types.
            </P>
        </Callout>
        <P>
          The honest counterweight: TOML's date-time types mean it also decides behind your back. <Rich text="`updated = 2024-01-15`" /> is a Local Date, delivered to your loader as a date object — Python's tomllib maps Local Date-Time to a <Rich text="`datetime.datetime`" /> with <Rich text="`tzinfo`" /> set to <Rich text="`None`" />, Local Date to <Rich text="`datetime.date`" /> and Local Time to <Rich text="`datetime.time`" />. If the consumer then serialises that onward to JSON, it either succeeds with a formatter or fails with a "not JSON serializable" error, which is a loud, immediate, debuggable failure. YAML's equivalent produces a string in one library and a date in another and lets you ship the disagreement. That is the difference in one line: both formats type your data; only one of them is consistent about it.
        </P>
      </Section>

      <Section id="toml-traps" title="Where TOML files fail to parse" kicker="And its own share of pain">
        <P>
          A format that refuses is a format that fails. If you are moving from YAML, most of your new errors will be TOML's, and they are worth learning before you meet them in a build log.
        </P>
        <H3>Keys</H3>
        <P>
          Bare keys may contain only ASCII letters, digits, underscores and dashes, and — this surprises everyone once — a key made only of digits is legal and is always a string: <Rich text={'`1234 = "value"`'} /> defines the key <Rich text="`1234`" />, not the integer 1234, because TOML has no non-string keys at all. Anything wider needs quotes, and quoted keys follow the same rules as basic or literal strings: <Rich text={'`"127.0.0.1" = "value"`'} /> and <Rich text={'`"character encoding" = "value"`'} /> are both legal, and the specification's advice is to use bare keys <Rich text="`except when absolutely necessary`" />. A bare key must be non-empty; an empty quoted key is allowed and discouraged; and you cannot use a multi-line string as a key. So the dotted key <Rich text="`a.b.c = 1`" /> is three keys joined by dots, and if you want a literal key containing a dot you must quote the whole thing: <Rich text={'`"a.b.c" = 1`'} /> is one key, not three.
        </P>
        <H3>Tables and the double-definition error</H3>
        <P>
          The rule is <Rich text="`Like keys, you cannot define a table more than once. Doing so is invalid.`" /> The way people break it is by mixing the two ways of creating a table, because dotted keys create and define a table for every key part before the last one. The specification shows both failures, and the second one is the surprise:
        </P>
        <CodeBlock
          title="the ordering error almost everyone hits"
          language="toml"
          code={`[fruit]
apple = "red"

[fruit]            # INVALID: the table already exists
orange = "orange"

[fruit]
apple.color = "red"     # this dotted key defines the table fruit.apple

[fruit.apple]           # INVALID: that table is already defined
texture = "smooth"

[fruit.apple.skin]      # VALID: a header may define a SUB-table of it
type = "thin"`}
          caption="The parser reports the collision at the header line, not at the dotted key several lines earlier, which is why the usual experience is that a file which looked fine becomes unparseable after an edit somewhere else in it."
        />
        <P>
          Two related clauses are worth knowing, because both look like errors and are not. Super-tables do not have to be declared: <Rich text="`[x.y.z.w]`" /> works with no <Rich text="`[x]`" /> anywhere, and <Rich text="`[x]`" /> written afterwards is explicitly allowed — <Rich text="`defining a super-table afterward is ok`" />. And out-of-order sub-tables are legal but frowned upon: the specification labels interleaving <Rich text="`[fruit.apple]`" />, <Rich text="`[animal]`" />, <Rich text="`[fruit.orange]`" /> as <Rich text="`VALID BUT DISCOURAGED`" />, which is exactly the shape a naive appending tool produces when it writes <Rich text="`[tool.newthing]`" /> at the bottom of a <Rich text="`pyproject.toml`" />. Whitespace inside a header is also tolerated — <Rich text="`[ g . h . i ]`" /> means <Rich text="`[g.h.i]`" /> — so a diff that adds padding will not fail, it will just look strange.
        </P>
        <H3>Strings</H3>
        <P>
          TOML has basic strings, literal strings, and multi-line versions of both. Basic strings use double quotes and interpret escape sequences; literal strings use single quotes and interpret nothing, so <Rich text="`'C:\\Users\\name'`" /> is exactly the characters you typed. Multi-line basic strings open and close with triple quotes, and inside them a line ending with a single backslash is not an escape: it deletes the newline and all whitespace up to the next non-whitespace character, which is how you wrap a long value without embedding the line break. The trap is that this only exists in multi-line basic strings — no backslash continuation in literal strings, no continuation in single-line forms — and that a stray trailing backslash inside a literal string is just a backslash.
        </P>
        <CodeBlock
          title="strings, the four ways"
          language="toml"
          code={`basic = "tab\\tand \\"quote\\" and \\u00e9"
literal = 'tab\\t stays literal'
multi_basic = """
First line continues \\
  onto the next because of the trailing backslash.
"""
multi_literal = '''
no escapes here at all: \\t stays \\t
'''`}
          caption="Four string forms, three different answers to the same backslash. multi_basic resolves to a single sentence with no newline in the middle; multi_literal keeps every line break you typed."
        />
        <H3>Numbers</H3>
        <P>
          Integers take decimal with an optional sign, hexadecimal <Rich text="`0x`" />, octal <Rich text="`0o`" /> and binary <Rich text="`0b`" /> prefixes, and underscores are permitted between digits for readability — <Rich text="`1_000_000`" /> — but not at the start, not at the end, not around the prefix, and not doubled. Leading zeros are not allowed, which is why file modes must be quoted or written with <Rich text="`0o`" />. Floats require either a fractional part or an exponent, accept <Rich text="`inf`" />, <Rich text="`+inf`" />, <Rich text="`-inf`" /> and <Rich text="`nan`" />, <Rich text="`+nan`" />, <Rich text="`-nan`" /> — and note that a NaN value never compares equal to itself, in TOML as everywhere else, so <Rich text="`nan == nan`" /> is false whatever the format says.
        </P>
        <KeyTerms
          items={[
            { term: 'bare key', definition: 'A TOML key limited to A-Za-z0-9_- ; "1.2" needs quotes or becomes two keys.' },
            { term: 'dotted key', definition: 'a.b.c = 1 — one assignment that implicitly creates the tables a and a.b.' },
            { term: 'array of tables', definition: 'Repeated [[name]] headers that append one mapping to a list each time — the only way TOML spells a list of objects.' },
            { term: 'line-ending backslash', definition: 'Inside a multi-line basic string only: removes the newline and the whitespace that follows it.' },
            { term: 'global table', definition: 'The root table, where keys written before any header live.' },
            { term: 'heterogeneous array', definition: 'Legal in TOML: "Values of different types may be mixed." Most style guides still forbid it.' },
          ]}
        />
        <Callout tone="note" title="What changed in v1.1.0">
          <P>
            TOML v1.1.0, published 18 December 2025, keeps the objectives paragraph word for word and relaxes or clarifies a small number of rules rather than adding features. The two you will notice: an inline table's pairs <Rich text="`can be put on different lines`" /> — the single-line constraint of 1.0.0 was lifted — and the Comment section now states normatively that <Rich text="`Comments should be used to communicate between the human readers of a file. Parsers must not modify keys or values, based on the presence (or contents) of a comment.`" /> The file must also be a well-formed UTF-8 code-unit sequence, to be rejected rather than silently repaired. Nothing in 1.1.0 adds null, anchors or tags. If a tool tells you it cannot parse a 1.1.0 file, it is a 1.0.0 parser, and the difference is almost never the reason your build fails.
            </P>
        </Callout>
      </Section>

      <Section id="comments" title="Comments, whitespace and the human editor" kicker="The thing JSON cannot do">
        <P>
          Start with the shared advantage over JSON: both formats have comments, and comments are why either exists as a configuration language at all. In TOML a hash marks the rest of the line as a comment except when inside a string — so <Rich text={'`another = "# This is not a comment"`'} /> is a string that begins with a hash — and control characters other than tab are not permitted in comments. In YAML a space followed by a hash starts a comment, and a hash at the start of a line or after a token does the same. Neither format puts the comment anywhere in the data model: comments are text-layer artifacts that a parser may read and a serializer must invent a mechanism to keep.
        </P>
        <P>
          TOML is explicit that comments carry no meaning, and as of v1.1.0 it says so normatively: parsers must not modify keys or values based on the presence or contents of a comment. That matters more than it reads. It means a TOML tool may reorder lines within a table, drop a blank line, or regenerate a section, and no semantics move. It also means no tool may use a comment as a directive — which is why ecosystem conventions that look like comments are a thing to check, not assume.
        </P>
        <P>
          YAML comments are equally outside the data model and equally fragile in practice, for a different reason. A YAML comment line is ignored, so adding one never changes the data — but the lines around it are positioned relative to each other, so the edit that follows the comment can. Every YAML editor has met the same three accidents: a commented-out block that silently merges its children into the parent because the block it annotated was the only thing at that indentation; a re-indent that moves a sequence under a different key; and a trailing comment placed inside a multi-line scalar, where it becomes prose. In TOML, the corresponding mistakes are all parse errors.
        </P>
        <CodeBlock
          title="a comment that changes the meaning of what follows"
          language="yaml"
          code={`jobs:
  - name: build
    # runs on the shared runners
    tags: [linux]
  - name: test
tags: [global]        # is this the second job's tag list, or a top-level key?`}
          caption="Answer: a top-level key, because the sequence item ended when the column dedented. Now delete the indentation on one line and re-read the file."
        />
        <CodeBlock
          title="the same annotation, in TOML"
          language="toml"
          code={`[[jobs]]
name = "build"
# runs on the shared runners
tags = ["linux"]

[[jobs]]
name = "test"

[global]
tags = ["global"]`}
          caption="Removing or re-adding a comment changes nothing here, and there is no column for the second tags key to fall back into — it belongs to whichever header is in force, which is written two lines above it."
        />
        <P>
          The asymmetry to remember when you choose: YAML's structure is invisible and therefore editable by accident; TOML's structure is visible and therefore merely verbose. Human-edited files get edited by humans who do not read the whole document, and that is the failure mode a configuration format is judged on.
        </P>
      </Section>

      <Section id="security" title="Tags, constructors, and what a grammar can refuse" kicker="Say it precisely">
        <P>
          YAML's tag mechanism is the most misunderstood part of the format, and it is the correct dividing line between the two languages on security. A YAML node may carry a tag that tells the processor how to construct a value; the <Rich text="`!!`" /> handle expands to <Rich text="`tag:yaml.org,2002:`" /> under the core schema, and a local tag written with a single <Rich text="`!`" /> is deliberately left undefined by the language. The specification says plainly that language-specific tags such as <Rich text="`!ruby/object:Set`" /> do not suffice for interoperable exchange. The consequence is that a YAML parser may be configured — historically, by default — to obey a tag it finds in the input and build the thing it names.
        </P>
        <P>
          That is the entire class of YAML deserialisation incidents: a document containing <Rich text="`!!python/object/apply:`" /> followed by a module attribute and arguments is, to a loader that honours Python object tags, a function call rather than data. PyYAML documents the problem in its own terms, recommending <Rich text="`safe_load`" /> for input you do not trust and comparing the unsafe <Rich text="`load`" /> to pickle; CVE-2017-18342 covers arbitrary code execution through <Rich text="`yaml.load`" /> before PyYAML 5.1, and CVE-2020-14343 covers a bypass of the intermediate <Rich text="`FullLoader`" /> before 5.4 through the object constructor it still permitted. Two fixes, and the second one existed because the first one kept a middle ground.
        </P>
        <P>
          TOML has no tag mechanism, and it is worth stating exactly why that helps. The grammar admits ten value types, named in the specification, and then declares that unspecified values are invalid. There is no syntactic position in which you can write "and now construct an object of class X", so a conforming parser has nothing to obey. The same closure kills the other two YAML payload tricks: there are no anchors or aliases, so there is no reference-multiplying document to expand — a ten-line YAML bomb that becomes hundreds of millions of nodes has no TOML analogue, because TOML cannot name a node and refer back to it — and there is no merge type to be interpreted differently by two libraries.
        </P>
        <Callout tone="note" title="The precise claim, and the limit of it">
          <P>
            This is a parser-conformance property, not a safety guarantee. It holds for a parser that implements the grammar; it does not hold for a loader with plug-ins, and it says nothing about what your application does with a parsed TOML value. TOML is full of strings, and a configuration system that <Rich text="`exec`s" /> a string from <Rich text="`[scripts]`" />, globs a path from <Rich text="`include = `" />, or evaluates an expression from a key is as dangerous as any unsafe loader — with the difference that the danger is in your code, where you can see it, rather than in the grammar of the input file. When someone tells you TOML is secure, translate that into: TOML has no way to express a constructor, so the trust decision cannot be delegated to the file.
            </P>
        </Callout>
        <P>
          The second-order lesson from the YAML history is about surface area, and it applies to the format decision itself. Every feature a configuration language has that lets a file say "interpret me" or "expand me" is a place where a parser implementation can be wrong: merge keys that mean different things in two libraries, custom tags that a linter does not understand, anchors that turn into a memory problem. TOML's minimalism is not only an editing argument; it is the same argument made about attack surface. YAML's power is real and its ecosystems need it. Its power is also exactly the thing that has to be switched off when the file comes from somewhere you do not control.
        </P>
      </Section>

      <Section id="ecosystems" title="Which ecosystem chose which format, and why" kicker="The section people actually want">
        <P>
          The distributions are not random. Each ecosystem made a choice that follows from what its files are for, and once you see the pattern the decision table writes itself.
        </P>
        <H3>Rust: TOML all the way down</H3>
        <P>
          Cargo's manifest, its configuration file and its credentials file are all TOML, and the Cargo book describes the configuration files as TOML with key-value pairs in tables. The reasons are the ones in the objectives paragraph: a package manifest is edited by the package manager itself — <Rich text="`cargo add`" />, <Rich text="`cargo remove`" /> and the release tooling rewrite dependency tables routinely — and a build tool must not lose a human's comment or reorder a section. Rust also inherits the "no build tools required" property: a bootstrap toolchain can parse its own metadata without a YAML library, which matters more in a language whose dependency graph is compiled from source.
        </P>
        <H3>Python: TOML for the handshake, YAML for the rest</H3>
        <P>
          Python picked TOML for exactly one file, <Rich text="`pyproject.toml`" />, and PEP 518's rationale is the clearest statement of the trade-off available anywhere: human-usable unlike JSON, flexible and standards-based unlike INI, not overly complex unlike YAML. That file is the interface between a project and a build back-end — a contract two unrelated programs must read the same way — which is the definition of a case for a closed grammar. PEP 518 defined the <Rich text="`[build-system]`" /> table; PEP 517 then extended it, in its own words <Rich text="`extending the [build-system] table in that file with one additional key, build-backend`" />, and added a <Rich text="`backend-path`" /> key for in-tree back-ends. PEP 621 put project metadata in <Rich text="`[project]`" />, and the same PEP states that <Rich text="`For tools wishing to store their own settings in pyproject.toml, they may use the [tool] table`" /> — PEP 518's own worked example was that <Rich text="`the flit tool would store its configuration in [tool.flit]`" /> — which is why one file now carries a project's linter, formatter, type checker and test-runner settings in separate tables. Meanwhile Python's operational configuration — Ansible playbooks, pre-commit hooks, CI pipelines, Kubernetes charts — stayed YAML, because those files are nested, list-heavy, human-written and read by one tool. Note also that Python waited until 3.11 to put a TOML reader in the standard library, and still ships no writer: the format is chosen for reading, and PEP 621 explicitly declined to require back-ends to rewrite the file.
        </P>
        <H3>Go: neither, by policy</H3>
        <P>
          Go's dependency metadata lives in <Rich text="`go.mod`" />, a purpose-built line-oriented format with directives such as <Rich text="`module`" />, <Rich text="`go`" /> and <Rich text="`require`" />, documented in the Go module reference on the official site, not in TOML or YAML. Go's standard library contains a JSON codec and neither a YAML nor a TOML parser, so any Go program reading configuration pulls in a third-party module, and in practice that means BurntSushi/toml or pelletier/go-toml for TOML and go-yaml for YAML. The Go tools themselves use a bespoke format for their machine-edited metadata — a third answer to the same question, and evidence that "one format for everything" is not the only way to avoid the YAML round-trip problem.
        </P>
        <H3>The YAML-stronghold ecosystems</H3>
        <P>
          Kubernetes, GitHub Actions, GitLab CI, Docker Compose and OpenAPI are all YAML, and the reasons are structural rather than cultural. Kubernetes' API is JSON; a manifest is a human spelling of a JSON body, converted by the client before the request, so it needs the same expressive surface as JSON plus comments and multi-document files — one <Rich text="`---`" />-separated stream can contain a Deployment, a Service and a ConfigMap, which TOML has no way to express. GitHub Actions needs deeply nested job maps, sequences of mappings, and interpolation expressions in strings. GitLab's reference states that <Rich text="`GitLab CI/CD configuration uses YAML formatting, so the order of keywords is not important unless otherwise specified`" />, documents a section on YAML anchors for scripts, and then points readers to a schema-level substitute instead: <Rich text="`Use extends to reuse configuration sections.`" /> and <Rich text="`It is similar to YAML anchors, but simpler and you can use extends with include.`" /> That pair is the whole YAML story in miniature, a language feature adopted for reuse, then partly replaced by a feature of the schema because the language version turned out to be harder to reason about. Docker Compose files lean on the same language features for shared service defaults, and OpenAPI documents are written in YAML because a schema document wants references, long descriptions as block scalars, and both JSON and YAML readings of the same file.
        </P>
        <DataTable
          caption="Where each format is the default, and the property that earned it"
          head={['File or system', 'Format', 'Why that format']}
          rows={[
            ['Cargo.toml, .cargo/config.toml', 'TOML', 'The package manager rewrites it; comments and one-line-per-key make that safe'],
            ['pyproject.toml: [build-system], [project], [tool.*]', 'TOML', 'A contract between a project and unrelated build tooling; PEP 518 said "not overly complex"'],
            ['.cargo/credentials.toml, written by cargo login', 'TOML', 'A file the tool creates and updates itself, so editing safety is the whole requirement'],
            ['Kubernetes manifests, Helm values', 'YAML', 'A spelling of a JSON API body, plus multi-document streams and lists of mappings'],
            ['GitHub Actions, GitLab CI, CircleCI, Ansible', 'YAML', 'Nesting, sequences of maps, block scalars for scripts, interpolation inside strings'],
            ['Docker Compose', 'YAML', 'Anchor-based fragments and merge keys for shared service defaults'],
            ['OpenAPI documents', 'YAML', 'Long prose descriptions, references, and identical JSON and YAML readings'],
            ['go.mod', 'neither', 'Standard-library minimalism plus a machine-edited file: a bespoke format was cheaper'],
          ]}
          foot={'Read down the Why column, not the Format column. The property that appears most often for TOML is "the tool edits this"; the property that appears most often for YAML is "the shape is nested and the list has objects in it".'}
        />
        <Callout tone="note" title="The pattern">
          <P>
            TOML has won the layer where a program and a human share one file: package manifests, build configuration, tool settings. YAML has won the layer where a human writes a nested, list-heavy document for one consumer and the file is generated, templated and diffed rather than edited in place. Those are not competing claims about readability; they are two different answers to "who is allowed to write to this file", which is the question at the top of this page.
            </P>
        </Callout>
      </Section>

      <Section id="conversion" title="Converting between the two, and what breaks" kicker="The matrix">
        <P>
          There is no shared syntax to exploit: YAML 1.2 can read JSON, TOML can read nothing. Conversion is therefore re-encoding through a common model, and the model you pick decides the losses. The honest intermediate is JSON, because both formats map onto it more or less, and the more-or-less is where the interesting failures live.
        </P>
        <DataTable
          caption="Conversion matrix: what each direction can and cannot do"
          head={['Feature in the source', 'YAML to TOML', 'TOML to YAML', 'What you must decide by hand']}
          rows={[
            ['null', 'cannot be represented', 'trivially fine, emits null', 'Omit the key, write an empty string, or invent a sentinel per field'],
            ['Nested maps', 'fine, as tables or dotted keys', 'fine, as block mappings', 'Whether to use [a.b] headers or a.b.c = 1, and stick to one style'],
            ['Sequence of maps', 'only as repeated [[table]] headers', 'fine', 'Table naming for every list element; a list inside a list becomes gymnastics'],
            ['Sequence of sequences', 'legal but unreadable', 'fine', 'Whether to inline it or restructure the data'],
            ['Anchors and aliases', 'must be expanded first', 'n/a — nothing to expand', 'Expansion duplicates content, so the TOML file grows and the DRY property is gone'],
            ['Merge keys', 'must be expanded, and 1.2 parsers may not resolve them', 'n/a', 'Which of the two libraries interpretations to encode'],
            ['Multi-document streams', 'impossible in one file', 'one YAML document per TOML file', 'File naming, and losing --- grouping'],
            ['Comments', 'lost through JSON', 'lost through JSON', 'Whether to keep the original file and hand-move values instead'],
            ['Key order', 'not preserved by the format, by convention', 'not guaranteed either', 'Pick a canonical order and generate, or accept noisy diffs'],
            ['Explicit tags, e.g. !!binary', 'no equivalent', 'base64 string at best', 'Decode and re-encode as a typed value or a string'],
            ['Block scalars, | and >', 'multi-line basic or literal strings', 'block scalar, chosen from the content', 'Chomping: whether the final newline was data'],
            ['Sexagesimal and octal 1.1 values', 'would arrive as ints 75 and 493', 'n/a', 'Whether the number was ever intended'],
            ['Large integers and float precision', 'integers are 64-bit in practice', 'depends on the YAML parser', 'Stringify anything that must survive exactly'],
          ]}
          foot="Six of the thirteen rows are only a problem in the YAML-to-TOML direction. That asymmetry is the format's design, not an implementation gap: TOML is a subset of what YAML can say."
        />
        <P>
          Two of these deserve a worked example because they cause the most silent damage. The first is null. A YAML file with <Rich text="`timeout:`" /> — an empty value, therefore null — converted to TOML either disappears entirely, in which case the loader must apply the same default the YAML reader applied, or becomes <Rich text={'`timeout = ""`'} />, in which case a loader that treats an empty string as zero gets a different number. Neither is a bug in the converter; both are a schema decision the converter made for you.
        </P>
        <P>
          The second is the deeply nested map. YAML nests to any depth for the cost of a column, and TOML nests for the cost of either a header or a dotted path, and headers are file-global: put a <Rich text="`[a.b]`" /> header in the middle of a long file and every following key belongs to it until the next header, which is exactly how "why is my key ending up under the wrong table" bugs are born. A five-level configuration tree in YAML is comfortable and in TOML is a chore; that is the price of the visibility you paid for in the coercion section, and it is a real price.
        </P>
        <Callout tone="warn" title="What this site does and does not do">
          <P>
            FmtTools handles browser-side conversion between YAML and JSON. It does not parse, validate or emit TOML — there is no TOML converter here, and nothing on this page should be read as a claim that there is. What it can do for a YAML-to-TOML migration is the step that matters most and that TOML tools cannot do for you: show you what your YAML actually contains after resolution, so that you know which values are booleans that were meant to be strings before you commit the equivalent TOML.
          </P>
          <div className="my-3 grid gap-3 sm:grid-cols-2">
            <ToolLink path="/format-converters/yaml-to-json/" name="YAML to JSON" blurb="Resolve every plain scalar and get the typed document, with positional parse errors." />
            <ToolLink path="/format-converters/json-to-yaml/" name="JSON to YAML" blurb="Write block YAML that quotes anything a 1.1 reader could misread." />
          </div>
          <P>
            The workflow people actually use is the two-step one: paste the YAML into <Rich text="[YAML to JSON](/format-converters/yaml-to-json/)" />, read the coercion report to find the values whose type surprised you, fix the YAML and re-convert until the JSON says what you meant, and only then move those values into TOML by hand. Hand-moving is not a weakness of the tooling; it is the point at which the schema decisions in the matrix above get made by a person rather than by a script.
          </P>
        </Callout>
      </Section>

      <Section id="decision" title="The decision table, and the working rules" kicker="Choose on this">
        <P>
          Everything above compresses into one question with two answers. If the file is a description of a nested, list-heavy system that a human writes and one tool reads, and the tool mostly generates it, use YAML: Kubernetes manifests, CI pipelines, compose files, playbooks, API documents. If the file is project metadata or tool configuration that several unrelated programs must read identically and at least one of them writes, use TOML: the manifest, the build contract, the per-tool table. If both descriptions fit your file, that is a smell — split it.
        </P>
        <DataTable
          caption="Pick by property, not by preference"
          head={['Your situation', 'Pick', 'The reason, from the specifications']}
          rows={[
            ['Humans write and edit the file, no program rewrites it', 'YAML', 'Nesting is cheap, comments are local, and the resolver risk is manageable with quoting'],
            ['A command-line tool edits the file after a human wrote it', 'TOML', 'One key per line plus explicit tables mean a line edit cannot change the tree'],
            ['Several unrelated programs must agree on the meaning', 'TOML', 'A closed set of ten types and no tag mechanism, so there is one answer'],
            ['The payload needs null, or three states of absence', 'YAML or JSON', 'TOML declares unspecified values invalid; there is no null to write'],
            ['The payload is a list of objects, edited by hand', 'YAML', 'Sequences of mappings are one indentation step, not one header per element'],
            ['The file may come from outside your trust boundary', 'TOML or JSON', 'No constructor syntax; with YAML, only a plain-types loader'],
            ['You need many documents in one file', 'YAML', 'Stream markers exist; TOML is one document per file'],
            ['You need a machine-generated, reviewable diff', 'Either, with a fixed emitter', 'Neither format promises key order'],
            ['Your repo already has both', 'Keep both, and draw the line at who writes each file', 'That is the split the ecosystems above converged on'],
          ]}
          foot="If your answer keeps landing in the same row as the file you already have, keep the file. Format arguments are cheap; migration is not."
        />
        <H3>If the repository uses both</H3>
        <P>
          It probably should, and the boundary is easy to state. <Rich text="`pyproject.toml`" /> or <Rich text="`Cargo.toml`" /> and the <Rich text="`[tool.*]`" /> tables that hang off them are TOML, because build tools write into them. Your deployment manifests, CI pipelines and local development overrides are YAML, because they are trees with lists of objects in them. API payloads, fixtures and anything a program both produces and consumes are JSON, because there is no human in the loop and JSON's machine-readability is the point. JSON5 earns its place in exactly one spot: a hand-written file that is really a JavaScript object — a lint configuration, a build script's options — where comments and trailing commas matter more than portability, and where nothing outside that toolchain reads it.
        </P>
        <CodeBlock
          title="the same project, split along the ownership line"
          language="bash"
          code={`repo/
  pyproject.toml            # TOML: tools write [project] and [tool.*]
  Cargo.toml                # TOML: cargo add writes [dependencies]
  .github/workflows/ci.yml  # YAML: nested, list-heavy, one consumer
  docker-compose.yml        # YAML: anchors for shared service defaults
  k8s/base/deployment.yaml  # YAML: a spelling of a JSON API body
  openapi.yaml              # YAML: long descriptions, references
  config/app.yaml           # YAML: humans edit this, nothing writes it
  fixtures/order.json       # JSON: generated and consumed by programs only`}
          caption="Not a style preference. Every TOML file in this list is one a program is expected to edit, and every YAML file is one a human writes in an editor."
        />
        <H3>Ten rules that keep both formats honest</H3>
        <DataTable
          caption="Working rules, YAML and TOML"
          head={['Rule', 'Format', 'Because']}
          rows={[
            ['Quote every string in generated files', 'YAML', 'Removes the resolver from the loop entirely'],
            ['Never write a bare version, mode, time or country code', 'YAML', '1.1 readers turn 1.10, 0755, 1:15 and NO into numbers and booleans'],
            ['Quote file modes as "0755" or use 0o755', 'both', 'TOML bans leading zeros; YAML 1.1 reads them as octal'],
            ['Dates in one style, always quoted in YAML', 'both', 'TOML types them, YAML 1.1 types them, 1.2 core does not'],
            ['One nesting style per subtree', 'TOML', 'Dotted keys and table headers collide, and the error points at the wrong line'],
            ['No tabs, ever, in YAML indentation', 'YAML', 'The specification forbids it and the parse error does not name the character'],
            ['No anchors in files a tool will rewrite', 'YAML', 'Anchor survival is a library property, not a format property'],
            ['Do not rely on key order in either format', 'both', 'Neither specification defines ordering semantics for tables or mappings'],
            ['Load untrusted YAML with plain-types loaders only', 'YAML', 'Tags can name constructors; CVE-2017-18342 and CVE-2020-14343'],
            ['Add a schema and validate, in whichever format you chose', 'both', 'Neither format defines one; every project layers its own'],
          ]}
          foot="The last row is the one neither format answers. YAML has no schema language in the standard and TOML has none either — a TOML file that parses is a valid TOML file, which is a much weaker statement than a valid configuration."
        />
        <P>
          If you are here because a build tool asked you to move a file from one format to the other, the sequence that wastes the least time is: convert the YAML to JSON first and read what came back, because that is the document your consumers see; decide each null and each mistyped scalar explicitly; then write the TOML by hand rather than trusting a generator, and keep the original YAML in the pull request so the reviewer can see the schema decisions. For the wider argument about when a text format should carry types at all, the neighbouring pages cover it: <Rich text="[YAML vs JSON](/compare/yaml-vs-json/)" /> on implicit typing and the superset claim, the <Rich text="[YAML guide](/learn/yaml/)" /> on the resolver tables in full, and the <Rich text="[config conversion](/use-cases/config-conversion/)" /> toolkit for the steps this site can actually run for you.
        </P>
      </Section>
    </>
  )
}
