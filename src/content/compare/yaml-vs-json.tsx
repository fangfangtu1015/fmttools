/**
 * YAML vs JSON comparison. Content module for /compare/yaml-vs-json/.
 * Facts resolved against the YAML 1.2.2 and 1.1 specifications, the YAML 1.1
 * type repository, RFC 8259, the PyYAML documentation, the Kubernetes object
 * model documentation and the YAML spec project issue tracker (meta.sources).
 * Byte counts quoted below were computed with Buffer.byteLength on the exact
 * code samples rendered here. No parsing benchmarks were run, and none claimed.
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, P, Rich, Section, ToolLink } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'yaml-vs-json',
  path: '/compare/yaml-vs-json/',
  title: 'YAML vs JSON: Where the Conversion Loses Data | FmtTools',
  description:
    'YAML and JSON compared on typing, duplicate keys, comments, anchors and document streams, with a conversion matrix, a probe you can run, and a decision table.',
  h1: 'How YAML and JSON Diverge, Line by Line',
  faqTopic: 'YAML and JSON',
  summary:
    'The same payload in YAML and JSON, and an exact account of what a converter keeps, guesses or throws away: types, keys, comments, anchors and documents.',
  keywords: [
    'yaml vs json',
    'yaml to json conversion',
    'norway problem yaml',
    'json duplicate keys',
    'yaml anchors and aliases',
    'yaml comments json',
    'ndjson vs yaml multi document',
    'yaml 1.1 vs 1.2 parser',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 28,
  sections: [
    { id: 'one-payload-two-documents', label: 'One payload, two documents' },
    { id: 'the-superset-claim', label: 'The superset claim, tested' },
    { id: 'types-depend-on-parser', label: 'Types that depend on your parser' },
    { id: 'numbers-and-dates', label: 'Numbers, dates and version strings' },
    { id: 'duplicate-keys', label: 'Duplicate keys and keys that are not strings' },
    { id: 'comments', label: 'Comments and the metadata they carry' },
    { id: 'anchors-aliases', label: 'Anchors, aliases and merge keys' },
    { id: 'streams-and-ndjson', label: 'Multi-document streams and NDJSON' },
    { id: 'ecosystems-and-cost', label: 'Parse cost, error quality, ecosystems' },
    { id: 'conversion-matrix', label: 'What survives a conversion' },
    { id: 'decision', label: 'Decision table' },
  ],
  faqs: [
    {
      question: 'Is YAML a superset of JSON?',
      answer:
        'In one direction only. The YAML 1.2 revision made JSON compatibility a stated goal, so a normal JSON text is a valid YAML 1.2 document. It is not a superset in behaviour: a JSON text with two members of the same name is well-formed under RFC 8259, which says names only SHOULD be unique, while the YAML data model requires mapping keys to be unique. Tag resolution, anchors and multi-document streams also have no JSON counterpart, so the round trip is lossy even when parsing succeeds.',
    },
    {
      question: 'Why does converting YAML to JSON change my values?',
      answer:
        'Because YAML resolves unquoted scalars against a schema before anything is written out. A 1.1 resolver turns NO into false, 0755 into 493, 1:15 into 75 and 2024-01-15 into a timestamp object. Under the 1.2 core schema the last three stay text, except that some implementations read 0755 as decimal 755, and the version is a float in both. The converter then serialises whatever the resolver produced, so the JSON output faithfully describes a document that already stopped saying what you typed.',
    },
    {
      question: 'Which format gives better error messages?',
      answer:
        'JSON, almost always, because its grammar is narrow: six structural characters, no indentation state, and an error usually lands on the byte offset or line and column that is wrong. YAML parsers report a context chain from the composition stage, which frequently names the line after the mistake, because in block style the problem is usually that the parser is still inside a node it expected to end. The deeper difference is that YAML can also accept the file and hand back wrong values.',
    },
    {
      question: 'Can JSON store comments the way YAML can?',
      answer:
        'No. RFC 8259 has no comment production, so a file with a line beginning with two slashes is not JSON at all. Extensions such as JSON5 and the JSONC dialect used by VS Code add comments, but the price is that a standard parser rejects the file, so something must strip the comments before the bytes reach JSON.parse. That strip is a second lossy conversion, and it is why configuration with prose in it is usually kept in YAML, TOML or a schema-annotated format.',
    },
    {
      question: 'What happens to YAML anchors when I convert to JSON?',
      answer:
        'JSON has no reference concept, so a converter must choose: expand every alias into an independent copy, which destroys shared identity and inflates the output, or fail. Expansion is the friendlier choice, and it is why the round trip is not symmetric: JSON cannot say that two nodes are the same node, so converting back gives a tree with duplicated subtrees and no anchors. Merge keys are worse, because a converter that resolves the merge emits a flat map.',
    },
    {
      question: 'Are YAML anchors a denial-of-service risk?',
      answer:
        'Yes, when the parser builds a native object graph. Aliases let nine lines of text describe hundreds of millions of nodes: nine aliases per level over nine levels is nine to the power of nine, 387,420,489 nodes. The YAML specification project discusses this in issue 45, which records that the specification does not limit expansion and that the class of attack surfaced in the Kubernetes project through the go-yaml dependency; the report is tracked as issue 83253 and became CVE-2019-11253. If you parse uploaded YAML, check what your library caps.',
    },
    {
      question: 'How do I write records that JSON cannot hold several of?',
      answer:
        'For JSON, use NDJSON or JSON Lines: one JSON value per line, terminated by a newline, with the media type application/x-ndjson. That gives append, split and per-record error isolation, which a single JSON array does not, because one malformed byte invalidates the whole file. YAML solves the same problem inside one file with the document markers, a start marker of three dashes and an end marker of three dots, and a stream of documents is not the same shape as one document containing a list.',
    },
    {
      question: 'Should I use YAML or JSON for a new configuration file in 2026?',
      answer:
        'Use JSON, or a schema-validated YAML written by a generator, if the file will ever be machine-edited, diffed record by record, or consumed by more than one language. Use YAML by hand when humans write nesting and need comments, and then quote every string and validate against a real schema. Use neither for large flat tabular data, where CSV plus NDJSON is smaller and streams better than either.',
    },
  ],
  sources: [
    {
      label: 'YAML 1.2.2 specification, revision 1.2.2 (2021-10-01)',
      href: 'https://yaml.org/spec/1.2.2/',
      detail:
        'Section 1.2 on JSON compatibility as the stated focus of 1.2; 3.2.1.1 and 3.2.1.3 on mapping keys being unordered and unique and on key equality; 3.2.2 and 3.3.1 on anchors, aliases and the representation graph; 6.6 on comments needing separation from other tokens; 9.1 on the document start and end markers; 10.3.2 for the core schema resolution table, which contains no timestamp type.',
      accessed: '2026-11-12',
    },
    {
      label: 'YAML 1.1 specification',
      href: 'https://yaml.org/spec/1.1/',
      detail:
        'The version most deployed parsers were written against: implicit typing driven by the type repository, and unique mapping keys as a data-model requirement.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format',
      href: 'https://www.rfc-editor.org/rfc/rfc8259',
      detail:
        'Section 4 states that the names within an object SHOULD be unique; the grammar defines no comment production; numbers reject leading zeros and a leading plus sign; section 8.1 requires UTF-8 for text exchanged between systems. Published December 2017, STD 90, obsoletes RFC 7159 and RFC 4627.',
      accessed: '2026-11-12',
    },
    {
      label: 'Boolean type for YAML 1.1 (yaml.org type repository, draft dated 2005-01-18)',
      href: 'https://yaml.org/type/bool.html',
      detail:
        'The tag:yaml.org,2002:bool resolution list: y, Y, yes, Yes, YES, n, N, no, No, NO, true, True, TRUE, false, False, FALSE, on, On, ON, off, Off, OFF, with the stated intent that booleans are English words for readability and may be abbreviated to one character.',
      accessed: '2026-11-12',
    },
    {
      label: 'Integer type for YAML 1.1 (yaml.org type repository, draft dated 2005-02-11)',
      href: 'https://yaml.org/type/int.html',
      detail:
        'The 1.1 integer forms: decimal, 0x hexadecimal, 0b binary, leading-zero octal and base-60 sexagesimal, with underscore digit separators ignored; the worked example 190:20:30 resolving to 685230.',
      accessed: '2026-11-12',
    },
    {
      label: 'PyYAML documentation',
      href: 'https://pyyaml.org/wiki/PyYAMLDocumentation',
      detail:
        'Documents the library against YAML 1.1 and states that yaml.load is as powerful as pickle.load and so may call any Python function, which is why safe_load and SafeLoader exist and why full_load was the middle ground that later needed hardening.',
      accessed: '2026-11-12',
    },
    {
      label: 'Kubernetes documentation: Understand Kubernetes objects',
      href: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/',
      detail:
        'States that by convention manifests are YAML, that the API request itself carries JSON, and that tools such as kubectl convert the manifest into JSON when making the request. Also lists apiVersion, kind, metadata and spec as the fields a manifest must set.',
      accessed: '2026-11-12',
    },
    {
      label: 'yaml/yaml-spec issue 45: entity expansion is not limited by the specification',
      href: 'https://github.com/yaml/yaml-spec/issues/45',
      detail:
        'Records that the current YAML specification does not mention limiting alias expansion, that this class of attack is commonly called a billion laughs attack, that it surfaced in the Kubernetes project as a possible API server issue in October 2019 with go-yaml underneath, and that the library author considered the implementation conforming.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/format-converters/yaml-to-json/', name: 'YAML to JSON', blurb: 'Parse YAML and see which plain scalars changed type on the way out.' },
    { path: '/format-converters/json-to-yaml/', name: 'JSON to YAML', blurb: 'Emit block YAML that quotes anything a 1.1 resolver would misread.' },
    { path: '/use-cases/config-conversion/', name: 'Config conversion workflow', blurb: 'Manifests, pipelines and profiles moved between formats, with checks.' },
    { path: '/learn/yaml/', name: 'YAML: the complete guide', blurb: 'The implicit typing rules this comparison leans on, spelled out clause by clause.' },
  ],
  words: 6082,
  image: '/images/covers/cmp-yaml-vs-json.png',
  imageAlt: 'A single service configuration shown twice, as indented YAML on the left and as JSON on the right, with four values highlighted where the two documents resolve to different results.',
}

export default function Article() {
  return (
    <>
      <Section id="one-payload-two-documents" title="One payload, two documents" kicker="Start here">
        <P>
          Here is one service description written twice. Nothing about it is exotic: a name, a version, a port, three replicas, two feature flags, two limits, two environment variables and a banner with a line break in it. The YAML file is 312 bytes over
          18 lines. The JSON file is 376 bytes over 21 lines. Minify the JSON and it is 259 bytes, which is 53 bytes smaller than the YAML; delete the opening comment from the YAML and it falls to 269, because that single line of prose costs 43 bytes and
          the JSON file has no way to carry one at all.
        </P>
        <CodeBlock
          title="yaml, 312 bytes"
          language="yaml"
          code={`# Release manifest for the billing service
service:
  name: billing
  version: "1.10"
  port: 8080
  replicas: 3
  features:
    - invoice-pdf
    - dunning
  limits:
    memory: 512Mi
    cpu: 250m
  env:
    LOG_LEVEL: info
    REGION: eu-west-1
  banner: |
    Billing service
    Maintenance window 02:00 UTC`}
          caption="Computed with Buffer.byteLength on exactly these characters, LF line endings, UTF-8, no trailing whitespace."
        />
        <CodeBlock
          title="json, 376 bytes indented, 259 minified"
          language="json"
          code={`{
  "service": {
    "name": "billing",
    "version": "1.10",
    "port": 8080,
    "replicas": 3,
    "features": [
      "invoice-pdf",
      "dunning"
    ],
    "limits": {
      "memory": "512Mi",
      "cpu": "250m"
    },
    "env": {
      "LOG_LEVEL": "info",
      "REGION": "eu-west-1"
    },
    "banner": "Billing service\\nMaintenance window 02:00 UTC\\n"
  }
}`}
          caption="Same data, 64 bytes more than the YAML version once indented, 53 bytes less once minified. The line break inside the banner is escaped here and literal there, which is the first real difference in what the reader must do."
        />
        <P>
          Those numbers are the whole of the honest argument about size, and they are worth putting in front of the usual claims. Indentation costs bytes in both formats. Repeated key names cost bytes in JSON and cost nothing in YAML, because YAML writes
          a key name once per level rather than once per record. Escape-vs-literal newlines cost nothing at this size. None of it decides anything, because if size were the criterion you would gzip both files and stop talking.
        </P>
        <P>
          The differences that decide it are about who answers the question "what type is this value?". In JSON the answer is visible in the characters: quoted means string, unquoted means number, boolean or null, and braces and brackets mean structure. There
          is no other case. In YAML the answer is usually the same, but for any value written without quotes the format asks a resolver to pattern-match the text and pick a type, and the resolver that runs is a property of the library your build happens to
          depend on rather than of the file. Everything in this comparison follows from that one asymmetry: comments, anchors, duplicate keys, document streams and the two versions of the specification are each a separate consequence, and each has a distinct
          cost when the two documents are supposed to mean the same thing.
        </P>
        <P>
          A second asymmetry is easier to miss because it is invisible until you need it. A JSON text is one value, and only one value, in one file. A YAML stream is zero or more documents, and inside each document the nodes form a graph rather than a tree.
          So JSON cannot say "these two configuration blocks are the same object" and cannot say "this file continues with another document", and every tool that has to handle both formats has to decide what to do about it, usually silently.
        </P>
        <Callout tone="note" title="How the claims on this page are sourced">
          <P>
            Byte counts are computed here, on the samples above, with the method stated in the caption. Behavioural claims are either quoted from a specification with its section number, listed in the source record at the bottom of the page, or written as
            something to check in your own parser. No parsing or serialisation benchmark was run for this page, so no speed figures appear in it; the cost sections describe what a parser has to do, not how fast any particular one does it.
          </P>
        </Callout>
      </Section>

      <Section id="the-superset-claim" title="The superset claim, tested" kicker="Syntax against behaviour">
        <P>
          You will be told that YAML is a superset of JSON, and the sentence is half defensible. Section 1.2 of the YAML 1.2.2 specification says the primary focus of the 1.2 revision was making YAML a strict superset of JSON, and the introduction repeats
          that JSON compatibility was one of the two motivations for leaving 1.1 behind. In that narrow, syntactic sense the claim is about as true as a format claim gets: paste an ordinary JSON file into a YAML parser and it composes, resolves and loads.
        </P>
        <P>
          The claim fails in three places, and all three matter in production rather than in a pedants' quarrel.
        </P>
        <H3>One: uniqueness of keys is required in one grammar and recommended in the other</H3>
        <P>
          RFC 8259 section 4 says the names within an object SHOULD be unique. SHOULD is a recommendation, not a requirement, so the document below is a valid JSON text, and a conforming parser may accept it, reject it or keep one of the two values without
          breaking the specification. The YAML data model is different: section 3.2.1.1 defines a mapping node as having unordered, unique keys, and section 3.2.1.3 defines what uniqueness means, namely that no two keys are equal, where equality is tag plus
          canonical content. A JSON text with a repeated name is therefore well-formed JSON and not a well-formed YAML document, which is a clean contradiction of the superset sentence.
        </P>
        <CodeBlock
          title="valid JSON, not a valid YAML document"
          language="json"
          code={`{
  "retry": true,
  "retry": false
}`}
          caption="Most parsers keep one of the two and report nothing. Whether yours keeps the first or the last is an implementation property; check it with a test file rather than guessing, because the answer changes between a browser runtime, a database driver and a command-line tool."
        />
        <H3>Two: the number grammars do not line up</H3>
        <P>
          JSON numbers are strictly optional minus, an integer part with no leading zeros and no leading plus, an optional fraction and an optional exponent. YAML 1.2 core schema integers are wider: <Rich text="`0x3A`" /> and <Rich text="`0o7`" /> resolve
          to integers, <Rich text="`+42`" /> is legal, <Rich text="`.inf`" /> and <Rich text="`.nan`" /> are floats, and none of those four spellings is JSON. YAML 1.1 is wider again, adding binary, leading-zero octal, base-60 and digit separators. So the
          inclusion runs the other way for numbers: some YAML scalars are not JSON values at all, and a converter that has to emit JSON must either stringify them or change them.
        </P>
        <H3>Three: the semantic layer has no JSON counterpart</H3>
        <P>
          Tags, anchors, aliases, merge keys, document markers and comments are YAML-only, and they are not decoration: they carry identity and type information that the JSON text cannot express. That is why section 10 of the specification matters here. It
          recommends three schemas, and one of them is literally called the JSON schema, whose sole purpose is to resolve plain scalars exactly as JSON would. A processor that loads your YAML with the JSON schema gives you JSON typing semantics; a processor
          that uses the core schema gives you slightly wider spellings; a 1.1 processor gives you a different document. All three can be described as "parsing YAML".
        </P>
        <CodeBlock
          title="the same file, three schema answers"
          language="yaml"
          code={`hex: 0x3A        # core: integer 58   json schema: string "0x3A"
plus: +42        # core: integer 42   json schema: string "+42"
inf: .inf        # core: float         json schema: string ".inf"
words: NO         # 1.1: boolean false  1.2: string "NO"
when: 2024-01-15  # 1.1: timestamp       1.2: string`}
          caption="Section 10.3.2 is the core schema resolution table; the JSON schema in 10.2 restricts integers and floats to the JSON spellings. Which table your loader consults is the single most consequential undocumented fact about your configuration pipeline."
        />
        <KeyTerms
          items={[
            { term: 'serialization', definition: 'The characters: the stream, the indentation, the quotes. What your repository stores and your diff tool reads.' },
            { term: 'representation graph', definition: 'What the parser composes: nodes and edges, with anchors preserved and aliases pointing back to an earlier node.' },
            { term: 'resolved value', definition: 'What your program receives: native types after a schema table has matched the scalar text. This is where the disagreement lives.' },
            { term: 'core schema', definition: 'The recommended 1.2 tag set: null, bool, int, float, string, sequence and mapping, with wider integer spellings than JSON permits.' },
            { term: 'JSON schema', definition: 'A 1.2 schema that resolves plain scalars exactly as JSON does. Asking for it is how you make YAML type like JSON on purpose.' },
            { term: 'failsafe schema', definition: 'Only string, sequence and mapping: every scalar arrives as text and nothing is guessed. Useful for exchange, useless for flags.' },
          ]}
        />
        <Callout tone="spec" title="The sentence to keep">
          <P>
            YAML 1.2 aims to accept JSON syntax; it does not aim to reproduce JSON semantics, and 1.1 does not promise either. So "YAML is a superset of JSON" is a statement about the parser's input grammar. It says nothing about the value your program
            ends up holding, which is the part that wakes you up.
          </P>
        </Callout>
      </Section>

      <Section id="types-depend-on-parser" title="Types that depend on your parser" kicker="The resolver">
        <P>
          Take the first file that a colleague hands you and look only at the values that are not in quotes. Each one is a claim: that the characters you typed are the value you meant, and that the resolver in whatever library is installed agrees. For
          strings that contain no digits, dots, colons or boolean words, the claim holds in every version of the specification. Outside that set, the two versions disagree loudly, and the disagreement has a name because of a country code.
        </P>
        <H3>The Norway problem, stated as a regular expression</H3>
        <P>
          The YAML 1.1 type repository defines <Rich text="`tag:yaml.org,2002:bool`" /> with an explicit list of accepted plain scalars: <Rich text="`y`" />, <Rich text="`Y`" />, <Rich text="`yes`" />, <Rich text="`Yes`" />, <Rich text="`YES`" />,
          <Rich text="`n`" />, <Rich text="`N`" />, <Rich text="`no`" />, <Rich text="`No`" />, <Rich text="`NO`" />, <Rich text="`true`" /> and its two capitalisations, <Rich text="`false`" /> and its two capitalisations, plus <Rich text="`on`" />,
          <Rich text="`On`" />, <Rich text="`ON`" />, <Rich text="`off`" />, <Rich text="`Off`" /> and <Rich text="`OFF`" />. Twenty-four spellings of two values, and the page explains the intent: booleans are English words for readability and may be
          abbreviated to a single character. The 1.2 core schema keeps only the true and false spellings and drops the other eighteen to strings.
        </P>
        <CodeBlock
          title="the config that types differently in two libraries"
          language="yaml"
          code={`locales: [en, NO, SE]
digests:
  - yes
  - on
flags:
  - {y: 2024, n: 2025}
mode: "NO"          # quoting removes the question entirely`}
          caption="Under a 1.1 resolver the first line is [en, false, SE], the second is [true, true], and the third is a map whose keys are booleans. Under the 1.2 core schema the words stay strings, and the last line is a string in both."
        />
        <P>
          The reason this is a data-integrity problem rather than a curiosity is that no warning exists to be read. The parse succeeds. The list has the right length. Only the type of one element changed, and the downstream code either rejects it with a
          message that does not mention the input file, or, worse, accepts a boolean where a country code was intended and matches nothing. A filter that matches nothing is how a maintenance job silently widens its scope to every environment.
        </P>
        <H3>How to find out which resolver you actually run</H3>
        <P>
          Do not read the library's README for a version claim; read the answer it gives you for a file with known content. Write six keys with values <Rich text="`NO`" />, <Rich text="`0755`" />, <Rich text="`1:15`" />, <Rich text="`1_000`" />,
          <Rich text="`2024-01-15`" /> and <Rich text="`1.10`" />, parse it with the exact library pinned in your lockfile or base image, and print the type of each value. A false, an integer 493, an integer 75, an integer 1000, a timestamp object and the
          float 1.1 is a 1.1 resolver, which is what PyYAML documents itself against, and which is also why that documentation warns that <Rich text="`yaml.load`" /> is as powerful as <Rich text="`pickle.load`" /> and may call any Python function. Four
          strings plus a float, with the file mode resolving to 755 or staying text, is a 1.2 core resolver. Anything else is a hybrid, and hybrids are the interesting case.
        </P>
        <CodeBlock
          title="the probe, in three runtimes"
          language="bash"
          code={`printf 'a: NO\\nb: 0755\\nc: 1:15\\nd: 1_000\\ne: 2024-01-15\\nf: 1.10\\n' > probe.yaml

python3 -c "import yaml; print(yaml.safe_load(open('probe.yaml')))"
node -e "const y=require('js-yaml'); console.log(y.load(require('fs').readFileSync('probe.yaml','utf8')))"
python3 -c "import yaml; print(yaml.__version__)"
node -e "console.log(require('js-yaml/package.json').version)"
go list -m all 2>/dev/null | grep -i yaml`}
          caption="The last three lines are the point: the printed types are only interpretable together with the version that produced them. Run the probe in the container image you deploy, not on your laptop."
        />
        <DataTable
          caption="Reading the probe output: what each answer tells you about the library in front of you"
          head={['Probe value', 'A 1.1 resolver returns', 'A 1.2 core resolver returns', 'What the answer means']}
          rows={[
            ['NO', 'boolean false', 'string', 'The 24-word boolean list is active. Quote everything.'],
            ['yes / on', 'boolean true', 'string', 'Same mechanism, and it also applies to map keys.'],
            ['0755', 'integer 493', 'integer 755, or string', 'Leading-zero octal is a 1.1 rule; implementations split on the 1.2 answer.'],
            ['1:15', 'integer 75', 'string', 'Base-60 integers exist only in 1.1. 190:20:30 is 685230 there.'],
            ['1_000', 'integer 1000', 'string', 'Digit separators are ignored in 1.1 and unexplained in 1.2 core.'],
            ['2024-01-15', 'a timestamp object', 'string', 'The 1.2 core table in 10.3.2 has no timestamp entry at all.'],
            ['1.10', 'float 1.1', 'float 1.1', 'Agreement, and both are wrong for a version string.'],
            ['.inf', 'float', 'float', 'Legal YAML, illegal JSON, so a converter must invent a spelling.'],
            ['~ / empty', 'null', 'null', 'The one null spelling every schema shares.'],
          ]}
          foot="If two of these answers come back from two tools in one pipeline, the pipeline does not have one meaning for your file; it has two, and the deployed one is whichever the consumer at the end happens to use."
        />
        <P>
          There is a third possibility, and it is the most common one in real repositories: mixed output, where <Rich text="`NO`" /> becomes a boolean but <Rich text="`1:15`" /> stays a string. That means a 1.1-heritage library with a partially ported
          resolver, or a template renderer that quotes some fields and leaves others bare. Treat it as the worst case, because the file passes review and the tests, and the behaviour depends on which field a future edit touches.
        </P>
      </Section>

      <Section id="numbers-and-dates" title="Numbers, dates and version strings" kicker="Values that change type">
        <P>
          Three families of data look like numbers to a person reading a config file and are not numbers in either schema: versions, modes and identifiers with digits in them, and times. Each has its own mechanism, and JSON is innocent of all three,
          because JSON has one number form and requires quotes on everything else.
        </P>
        <H3>Versions</H3>
        <P>
          <Rich text="`1.10`" /> matches the float pattern in both versions, so it resolves to the number 1.1 and the trailing zero is gone before your program sees it. <Rich text="`1.0e3`" /> becomes 1000. <Rich text="`1.2.3`" /> matches nothing, so it
          stays a string, which is why three-part versions are safe and two-part versions are not. Note where JSON stands in this: it has no resolver at all, so <Rich text="`1.10`" /> inside a JSON file is the number 1.1 in every parser that ever ran, and
          the only spelling that keeps the text is the quoted one. YAML is the same in this particular case and worse in the others, which is the point of quoting rather than of picking a side.
        </P>
        <H3>Modes, identifiers and leading zeros</H3>
        <P>
          Under 1.1 a leading zero signals octal, so <Rich text="`0755`" /> is 493 and <Rich text="`0644`" /> is 420. Under the 1.2 core table the decimal pattern is <Rich text="`[-+]? [0-9]+`" />, which a literal reading lets <Rich text="`0755`" />
          through as 755, and the explicit octal spelling is <Rich text="`0o755`" />, which is 493 and is not a legal 1.1 integer form. Real implementations differ on the leading-zero case; some keep a compatibility branch for the old rule. So four digits
          have, at least, three possible answers, and the only spelling with one answer in every version is the quoted one.
        </P>
        <H3>Times, and the base-60 integer</H3>
        <P>
          The 1.1 integer repository accepts base 60, and says so plainly, because sixty-part values are convenient for time and angles. <Rich text="`1:15`" /> is 75. <Rich text="`190:20:30`" /> is 685230, which is the specification repository's own worked
          example. A schedule written as a bare clock time in a flow sequence therefore arrives as an integer in a 1.1 parser and as a string in a 1.2 parser, and both are conforming. The 1.2 core table has no sexagesimal forms.
        </P>
        <H3>Dates, the type 1.2 left out of its recommended schemas</H3>
        <P>
          This is the quietest difference in the two formats, because nothing announces it. YAML 1.1 defines <Rich text="`!!timestamp`" /> and resolves a bare ISO-looking date to it, so a 1.1 loader hands back a date value rather than the eight characters
          you typed, and re-serialising that value may add a time zone or a midnight depending on which release produced it. The 1.2 recommended schemas define no timestamp type, so <Rich text="`2024-01-15`" /> is simply the string you typed. JSON has no
          date type either, which makes JSON the format that is consistent rather than the one that is clever: a date is a string and every consumer agrees to parse it.
        </P>
        <P>
          What the four families have in common is that JSON cannot join the disagreement, and that asymmetry is a generator policy rather than a curiosity. A JSON emitter has one number grammar, so it can only write what the grammar allows: no leading
          plus, no leading zeros, no hexadecimal, no base-60, no <Rich text="`.inf`" /> or <Rich text="`.nan`" />. A YAML emitter has to decide, for every scalar, whether to leave it plain or quote it, and an emitter that always writes plain text is an
          emitter that turns your string into somebody else's number. The defensible default follows from the tables above without needing a new rule: emit numbers only where the schema says a number belongs, quote everything else, and when a value has no
          JSON spelling at all, fail or annotate it rather than inventing one.
        </P>
        <CodeBlock
          title="eleven scalars, and which answer depends on the resolver"
          language="yaml"
          code={`v1: 1.10           # float 1.1 in both versions
v2: 1.2.3          # string in both, two dots match nothing
m1: 0755           # 1.1 octal 493 / 1.2 decimal 755 or string
m2: 0o755          # 1.2 core 493 / not a 1.1 integer form
t1: 1:15           # 1.1 base-60 integer 75 / 1.2 string
t2: 190:20:30      # 1.1 base-60 integer 685230 / 1.2 string
sep: 1_000         # 1.1 integer 1000 / 1.2 string
d1: 2024-01-15     # 1.1 timestamp / 1.2 string
inf: .inf          # float in both, and invalid JSON
plus: +42          # integer in YAML, invalid in JSON
safe: "0755"       # string in every version of the language`}
          caption="Eleven lines of text, one of which is guaranteed to mean the same thing in every parser in your pipeline. The other ten depend on which schema the library consults."
        />
        <Callout tone="warn" title="What this costs you on a conversion">
          <P>
            When a YAML file is converted to JSON, whatever the resolver produced is what gets serialised. So an integer 493 becomes the JSON number 493 and your file mode is now a number that every later reader must remember to format with a leading
            zero; an integer 75 becomes the number 75 and your half-past-one is now nonsense in a schedule; a timestamp object becomes some ISO text that may not be the ISO text you wrote, because the dumping side chooses a time zone. None of this is a
            conversion bug. It is the resolver's answer, faithfully carried across.
          </P>
        </Callout>
      </Section>

      <Section id="duplicate-keys" title="Duplicate keys and keys that are not strings" kicker="One word: uniqueness">
        <P>
          This is the clearest example of the two formats making opposite choices, and it is worth reading as policy rather than trivia. JSON permits a repeated name and tells you, in section 4 of RFC 8259, that the names in an object SHOULD be unique,
          which leaves the behaviour of a duplicate unspecified. YAML forbids it, as a property of the data model rather than of the parser: a mapping node has unique keys, keys are compared by tag plus canonical content, and a document that violates the
          rule is not a document.
        </P>
        <P>
          The two formats are therefore equally strict on paper and equally inconsistent in practice, but they fail in opposite directions. A JSON parser that ignores the SHOULD gives you last-write-wins or first-write-wins depending on the runtime, and
          the object it produces is a normal object that no longer shows the duplicate anywhere. A YAML parser that enforces the rule stops the load entirely. One failure is invisible; the other is loud, and the loud one is usually the cheaper one at 3am.
        </P>
        <H3>Equality is by type, which is how you get invisible collisions</H3>
        <P>
          Because key equality is tag plus canonical content, two keys that look different are the same key if they resolve to the same typed value. Under 1.1, <Rich text="`013`" /> is octal 11 and <Rich text="`0xB`" /> is hexadecimal 11, so those two
          lines in one mapping are a duplicate — a duplicate nobody can see in a diff, and one that only appears if the parser actually resolves integer forms before comparing keys. This is the case where "check your parser" has teeth: the file that
          loads in one library and errors in the other is not a broken file, it is two files.
        </P>
        <CodeBlock
          title="the three kinds of duplicate key, in one file"
          language="yaml"
          code={`a: 1
a: 2              # textual duplicate; many loaders take the last

int-keys:
  013: x
  0xB: y          # duplicate under a 1.1 resolver, both are integer 11

quoted-vs-plain:
  "1": a
  1: b            # distinct keys in YAML, identical keys in JSON`}
          caption="The third block is the interesting one: a YAML mapping may legitimately hold both the string key 1 and the integer key 1, because their tags differ. JSON object names are always strings, so converting that mapping produces one key and one value, and one of the two is discarded."
        />
        <H3>The conversion side of the same rule</H3>
        <P>
          Non-string keys are legal YAML and illegal JSON, and that is not an edge case in configuration: port numbers, HTTP status codes and year values get used as map keys all the time, because a mapping keyed by number is nicer than a list of pairs.
          Any converter must then stringify. Once it does, keys that were distinct nodes collapse: <Rich text="`1`" /> and <Rich text="`'1'`" /> are both the name 1, and so are <Rich text="`true`" /> and <Rich text="`'true'`" />. A conversion that
          silently stringifies two keys into one has lost a value, and the JSON output looks like a smaller version of the same document rather than a damaged one.
        </P>
        <P>
          The reverse direction is friendlier, and worth saying: a JSON object always has string names, so JSON to YAML key handling is safe by construction, provided the emitter quotes the names that a 1.1 resolver would otherwise retype. That is a real
          risk in the other direction, and it is why a generator that emits YAML should quote key text such as <Rich text="`NO`" /> or <Rich text="`on`" /> rather than trusting that a bare key looks like a word.
        </P>
        <DataTable
          caption="Duplicate and non-string keys: what each format does and what a converter can do about it"
          head={['Situation', 'In JSON', 'In YAML', 'On conversion']}
          rows={[
            ['Two textual copies of a name', 'Valid; names SHOULD be unique, parser decides', 'Not a valid mapping', 'Nothing to convert; the input is already ambiguous'],
            ['013 and 0xB as keys', 'Both are string names, no collision', 'Duplicate under a 1.1 resolver', 'Fails or succeeds depending on the loader'],
            ['Integer key 1 next to string key "1"', 'Impossible: names are strings', 'Two distinct keys', 'One survives; the other is silently dropped'],
            ['Boolean key yes as a name', 'Impossible', 'A bool key in 1.1, a string key in 1.2', 'Stringified as true or as yes, per resolver'],
            ['Empty key', 'Legal: the empty string', 'Legal', 'Survives as an empty name'],
            ['Null value for a key with nothing after the colon', 'Requires explicit null', 'Empty plain scalar resolves to null', 'Survives as null in both'],
          ]}
          foot="Run the file through a validator that reports duplicate names as its own finding class. A JSON validator that only checks syntax will pass a document with three copies of the same key and a different value each time."
        />
      </Section>

      <Section id="comments" title="Comments and the metadata they carry" kicker="43 bytes that cannot cross">
        <P>
          RFC 8259 has no comment production. Not "comments are discouraged" — the grammar does not have a rule for them, so a file with a line beginning with two slashes is not JSON, and no parser may accept it without implementing a different format.
          That is a deliberate design property rather than an oversight: the document describes JSON as a lightweight, interoperable interchange format, and every concession to human authors is a way for two implementations to disagree. Comments are the
          clearest possible disagreement, which is why the extensions that add them are separate formats with separate names.
        </P>
        <P>
          YAML has comments and only a few rules about them. Section 6.6 requires that a comment be separated from other tokens by whitespace, and a comment runs to the end of the line. There is no way to comment inside a quoted or block scalar, because
          there everything is content. And there is no nesting problem to have, since the comment has no end marker: <Rich text="`#`" /> is not a token that opens anything.
        </P>
        <CodeBlock
          title="what a comment is worth, and where it goes"
          language="yaml"
          code={`# Owner: platform-team, escalation in #oncall Slack channel
# Rotate the token before the certificate renewal window
service:
  name: billing
  token: abc123 #def   # everything from the space-hash is dropped
  note: "a hash # inside quotes is content, not a comment"`}
          caption="Line 2 is documentation. The token line is a live truncation: a value containing a space then a hash is cut at the hash. The quoted line shows the only reliable defence, which is quoting."
        />
        <P>
          That truncation is the mechanism that makes this section belong in a comparison rather than a style guide. When YAML is converted to JSON, two kinds of information vanish: the comments themselves, and any value that was quietly shortened by a
          hash. The first loss is visible in the diff. The second is invisible, because the converter reports a successful parse of a string you did not write.
        </P>
        <P>
          The JSON workarounds are worth knowing precisely, because each one is a format fork. JSON5 adds comments and other JavaScript-isms; JSONC is the dialect VS Code uses, with comments and trailing commas; and the third option, which is what most
          build pipelines actually do, is to keep the authored file commented and run a strip step before parsing. A strip step is a lossy conversion at build time instead of at load time, which is often fine and sometimes terrible: the moment the stripped
          bytes are what you ship, the file you can read and the file your program parses are two artefacts, and any tool that reads the shipped one sees no comments.
        </P>
        <P>
          The structural answer, if your data must be JSON, is to put documentation in the schema rather than the data. A JSON Schema document has <Rich text="`description`" /> and <Rich text="`title`" /> keywords for exactly this purpose, so the prose
          travels with the shape and the payload stays clean. If the file is configuration that humans edit in a repository, YAML with comments and a schema validated in CI is usually the cheaper combination, and that is a reasonable reading of why so
          many project configuration formats are YAML files with a bespoke schema bolted on.
        </P>
        <Callout tone="tip" title="If you must move a commented file into JSON">
          <P>
            Decide before you convert which of the three fates each comment gets: delete it, promote it into a real field such as <Rich text="`description`" />, or move it into a separate documented file next to the data. A converter cannot make that
            call, and a converter that pretends otherwise is inventing keys your schema does not have. Then keep the comment characters out of values, which is the one part of this that a linter can enforce: hash characters preceded by whitespace in a
            plain scalar, and any plain scalar containing them at all.
          </P>
        </Callout>
      </Section>

      <Section id="anchors-aliases" title="Anchors, aliases and merge keys" kicker="A graph has no JSON spelling">
        <P>
          This is the difference with no workaround, so it deserves the strongest statement on the page. JSON is a tree. Every node in a JSON text is reached exactly once from the root, and two subtrees that look identical are two subtrees. YAML's
          representation model, defined in section 3.2.1 of the 1.2.2 specification, is a graph: an anchor names a node at its first occurrence and an alias refers back to it, and section 3.3.1 requires that an alias refer to a previous node identified by
          that anchor. A processor may serialise the graph as a tree of events with alias markers, which is exactly what it says it does, and exactly what JSON has no syntax for.
        </P>
        <CodeBlock
          title="identity, which is the part you lose"
          language="yaml"
          code={`base: &defaults
  retries: 3
  region: eu-west-1

job-b: *defaults
job-c: *defaults

job-a:
  <<: *defaults
  retries: 5`}
          caption="job-b and job-c are the same node, so in a runtime that builds native references they are the same object: mutate one and the other changes. After a JSON round trip they are two equal but separate maps, and no marker says they used to be one. job-a shows the merge key, which a 1.2-core-only parser leaves as a literal key."
        />
        <P>
          Three consequences follow. The first is reuse: a document with twelve near-identical blocks can be written once and referenced twelve times, which is why a hand-written manifest puts a defaults block at the top of the file and points at it from
          every job below, and why the <Rich text="`<<`" /> merge key keeps being used despite being a YAML 1.1 working-draft type that no 1.2 recommended schema defines. The second is that a converter must choose between expanding aliases into copies,
          which changes the graph into a tree and usually inflates the output, or failing. Expansion is the friendlier of the two, because the alternative is a converter that rejects any file with a defaults block in it, but which one your tool performs is
          a property of the tool: test it with a two-alias file before you rely on the answer. The third is the one that appears in security advisories.
        </P>
        <H3>Expansion is not free, and it is not linear</H3>
        <CodeBlock
          title="nine lines that are worth hundreds of millions of nodes"
          language="yaml"
          code={`a: &a ["x","x","x","x","x","x","x","x","x"]
b: &b [*a,*a,*a,*a,*a,*a,*a,*a,*a]
c: &c [*b,*b,*b,*b,*b,*b,*b,*b,*b]
d: &d [*c,*c,*c,*c,*c,*c,*c,*c,*c]
e: &e [*d,*d,*d,*d,*d,*d,*d,*d,*d]
f: &f [*e,*e,*e,*e,*e,*e,*e,*e,*e]
g: &g [*f,*f,*f,*f,*f,*f,*f,*f,*f]
h: &h [*g,*g,*g,*g,*g,*g,*g,*g,*g]
i: &i [*h,*h,*h,*h,*h,*h,*h,*h,*h]`}
          caption="Nine aliases per level, nine levels: a processor that materialises references as native containers builds 9 to the power of 9 nodes, which is 387,420,489. The text producing them is 323 bytes."
        />
        <P>
          The YAML specification project discusses exactly this in issue 45, opened in October 2019 by the engineer who had reported the Kubernetes problem. Its point is narrow and uncomfortable: the specification never mentions limiting node expansion,
          so a loader can be fully conforming and still be a denial-of-service vector. The thread records the position of the implementers — that go-yaml had followed the specification, that it added a limit of its own in the meantime, and that a
          recommendation in the specification would be better than every implementation inventing its own rule. Nothing of the kind happened. The issue was closed in October 2021 on the grounds that this is an implementation matter needing no normative
          change, with one editor noting that the particular go-yaml behaviour was simply a bug. So the cap, if there is one, belongs to your library rather than to the format: loaders that do limit expansion expose it as an option with a default that is
          worth reading rather than assuming, and the Kubernetes report itself, tracked as issue 83253 and assigned CVE-2019-11253, was fixed by version rather than by specification — 1.13.12, 1.14.8, 1.15.5 and 1.16.2.
        </P>
        <P>
          JSON, by contrast, has no reference syntax at all, so it has no expansion problem — at the cost of having no way to express shared identity. That trade is the whole section: YAML buys reuse and a compact file, and pays for it with a document
          whose memory cost is not bounded by its size, and whose JSON form is a different document.
        </P>
        <H3>Everything else anchors break</H3>
        <P>
          Anchors are discarded once the graph is composed, so whether a tool preserves them is a property of the tool. That makes diffs ambiguous: two files that differ only in anchor names describe identical data, and a review tool that renders the
          resolved tree cannot tell you which one changed. Merging flattens structure, so a schema validator sees a map that the author did not write. Anchors and aliases only reach inside the document that declares them: section 9.1 makes each document a
          separate serialization with its own boundaries, and section 3.3.1 requires an alias to resolve to a node the processor has already seen, so sharing an anchor across a stream boundary is not something to rely on, which is why the reuse blocks
          live at the head of the same file that uses them, under whatever top-level key the tool has reserved for itself, rather than in a file of their own. And the same section says an unidentified alias should be rejected, which is a rule that only
          helps you if the parser you chose bothers to implement rejection.
        </P>
        <Callout tone="risk" title="Check these four things about your loader">
          <P>
            One: does it expand aliases into copies or hold shared nodes? Two: does it cap alias count, node count or depth, and what happens when the cap is exceeded — error or truncated tree? Three: does it implement <Rich text="`<<`" /> as a merge,
            or hand you a literal key? Four: does it honour tags that name constructors in your runtime? The fourth is not theoretical; it is the reason PyYAML documents <Rich text="`yaml.load`" /> as unsafe and offers <Rich text="`safe_load`" />, and the
            reason a loader that supports round-tripping your object graph is a loader with a larger attack surface than one that only knows strings, sequences, maps and numbers.
          </P>
        </Callout>
      </Section>

      <Section id="streams-and-ndjson" title="Multi-document streams and NDJSON" kicker="One file, many records">
        <P>
          A JSON text is one value. A YAML stream is zero or more documents, separated by the two markers defined in section 9.1: three dashes start a document, three dots end one without starting another. Directives such as a version or a tag handle go
          before the start marker. That is a structural difference rather than a syntactic one, and it explains a family of surprises for anyone who has to move data between the two.
        </P>
        <CodeBlock
          title="one YAML file, three documents, and one that is empty"
          language="yaml"
          code={`---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
...
---
# a third document containing only a comment`}
          caption="Kubernetes-style multi-manifest file. Note that a parser may report two or three documents here, depending on whether it counts a document whose content is only a comment, and that the end marker in the middle is legal and nearly unused."
        />
        <P>
          The conversion question is not "what do I do with the markers" but "what shape does the stream become". Three legitimate answers exist, and they are not equivalent: an array of documents, which changes a top-level mapping into an array element;
          the first document only, which silently discards data; or a concatenation of YAML documents in one output file, which is not JSON at all. A tool that picks for you without saying so is making a schema decision on your behalf, and the array
          choice in particular breaks every consumer that assumed the document root was an object.
        </P>
        <H3>NDJSON, the pragmatic answer, and why it is not a YAML feature</H3>
        <P>
          JSON's workaround is one value per line: NDJSON, also called JSON Lines, with each record a complete JSON text terminated by a newline, and the media type commonly written for it is <Rich text="`application/x-ndjson`" />. It is deliberately not a
          superset of JSON parsing; it is a framing convention around JSON texts. The properties that matter are operational: you can append a record without rewriting a file, split a stream on a newline, process a record as soon as its line arrives, and,
          most usefully, isolate failure to one record. One malformed byte in a single JSON array invalidates the entire document; one malformed line invalidates one line.
        </P>
        <CodeBlock
          title="the same three records, framed three ways"
          language="text"
          code={`# one JSON array: cannot be appended to, one comma from broken
[{"id":1},{"id":2},{"id":3}]

# NDJSON: one JSON value per line, append-friendly
{"id":1}
{"id":2}
{"id":3}

# YAML stream: three documents, same framing idea, richer content
---
id: 1
---
id: 2
---
id: 3`}
          caption="The NDJSON rules assume the value fits on one line, which JSON guarantees because string content cannot contain a raw line break. YAML block scalars, folded content and anchors have no such guarantee, which is why line-oriented tools break on YAML."
        />
        <P>
          There is a symmetry worth holding on to. NDJSON and the YAML document stream are the same idea — framing many records in one file — arrived at from opposite ends. JSON needed a framing convention because its grammar has none. YAML needed no
          convention because the language has the marker built in, but it cannot promise that a document fits on a line, so the entire ecosystem of line-based tools, which is most of Unix, stops working on it. If your pipeline is <Rich text="`grep`" />,
          <Rich text="`cut`" />, <Rich text="`awk`" /> and a batch loader, NDJSON is the better format and it is not close. If your records are hand-edited and nested, YAML with markers is the better format, and it will not be streamable in the same way.
        </P>
        <P>
          The last consequence is the one that bites during an incident: error locality. A single YAML document with three dashes at the top and one bad indentation at line 400 has no valid records in it, because the parse fails and the parser does not
          know where you meant the boundary to be. A stream with three dashes between records can often salvage the records before the failure — often, not always, and this is another "check your library" item, because whether a parser exposes documents
          parsed before the error is an API property, not a spec requirement.
        </P>
      </Section>

      <Section id="ecosystems-and-cost" title="Parse cost, error quality, ecosystems" kicker="Why the industry picked one">
        <P>
          Look at where YAML actually won, and the pattern is consistent: it won in places where a human writes a nested tree by hand and where the file is documentation as well as input. It lost everywhere data moves in volume, and everywhere a machine
          writes the file. The Kubernetes object documentation is explicit about the architecture: by convention manifests are YAML, the API request carries JSON, and tools such as kubectl convert the manifest into JSON when making the request. That is
          the shape of the whole industry compromise — human-facing YAML, machine-facing JSON, with a conversion step in between that has to make every decision described above.
        </P>
        <H3>What a YAML parser has to do that a JSON parser does not</H3>
        <P>
          A JSON parser is a scanner over six structural characters with a string state and a number state. A YAML parser additionally maintains an indentation stack for block context, decides whether a dash or colon is structural or content, tracks
          simple-key state across lines, handles five scalar styles with two kinds of folding and three chomping modes, collects anchors into a table, composes a graph, and then resolves every plain scalar against a schema table. None of that makes YAML
          slow in any quotable sense — the magnitude depends on the library and its version, and nobody should quote you a number for it — but it does explain the two things users notice, which are error messages and behaviour on malformed input.
        </P>
        <P>
          JSON errors are short and positional, because a narrow grammar has few possible reasons to fail: an unexpected token at an offset. YAML errors are context chains, because the parser's complaint is usually that a node it opened was not closed
          the way it expected, and the classic message names the line where the parser noticed the problem rather than the line where you caused it. That is why a tab in block indentation produces a confusing pointer, and it is why "paste the file into a
          strict parser and read the first line and column" is the only reliable debugging instruction for either format.
        </P>
        <CodeBlock
          title="the two failure shapes, as users meet them"
          language="bash"
          code={`$ kubectl apply -f deployment.yaml
error: error parsing deployment.yaml: error converting YAML to JSON: yaml: line 12: did not find expected key

$ python3 -c "import json; json.load(open('a.json'))"
json.decoder.JSONDecodeError: Expecting ',' delimiter: line 12 column 3 (char 231)

$ python3 -c "import yaml; print(yaml.safe_load(open('b.yaml'))['version'])"
1.1        # the file said 1.10, the load succeeded, nothing was reported`}
          caption="Two formats, two failure modes: JSON refuses loudly at a position, YAML accepts quietly with a different value. A pipeline that only handles thrown exceptions has no code path for the last line."
        />
        <P>
          There is a memory consequence to that decomposition, worth stating without pretending to have measured it. In a YAML processor the anchor table and the composed representation graph are both live while native values are built, and any
          implementation that preserves shared nodes has to keep the referenced subtrees reachable, so peak usage is a multiple of the file size and the multiplier is a property of the library rather than of the format. A JSON parser that constructs values
          while scanning has less to hold, and a line-oriented NDJSON reader holds one record. The operational reading is that a very large YAML file is not a file-sized memory problem, and the only honest way to learn how much worse it is involves running
          the library you deploy against the input you actually ship.
        </P>
        <H3>Why YAML in particular, in the projects that chose it</H3>
        <P>
          For manifests, the reasons were nesting with fewer bytes than XML, a comment line above each block for the next engineer, and the fact that the conversion to JSON is mechanical. The other hand-written configuration formats in a stack were
          picked for the same three reasons and each inherited the same costs, which is why their documentation is so heavily populated with quoting rules. GitHub Actions names the characters that are special in YAML and tells you to quote around them,
          because a plain value that begins with the reserved indicator <Rich text="`!`" /> starts a tag rather than a string, and the file fails to parse rather than failing to run. Compose-style formats define a top-level extension key so that shared
          defaults live in the same document as the services that use them, which is not a product decision but a consequence of the rules quoted above: section 9.1 makes every document its own serialization and section 3.3.1 requires an alias to point at
          a node the processor has already seen, so nothing declared in one file can be aliased from another. Everything else follows the pattern of the probe above: where a tool states which YAML it implements, read that as a claim about the library it
          happens to ship, and where it does not state one, your only evidence is what the loader returns for a file you wrote on purpose.
        </P>
        <P>
          The Kubernetes case has one more wrinkle worth naming, because it turns a formatting question into a server-side type error: since the manifest is converted to JSON on the way to the API, an unquoted value that the resolver typed as a string is
          delivered as a JSON string into a Go field that expects an integer, and the error text is about unmarshalling, not about your file. The two fast moves for that class of failure are "look at the line the resolver touched" and "look at the JSON the
          converter produced", and the second one is the fastest, which is why the conversion tools on this site exist in the shape they do.
        </P>
        <DataTable
          caption="The two formats as the ecosystems use them"
          head={['Property', 'JSON', 'YAML', 'Consequence for a config format']}
          rows={[
            ['Who writes the file', 'machines, and humans debugging machines', 'humans, and generators', 'Human-written files need comments and forgiving typing rules'],
            ['Where the type decision happens', 'in the characters you wrote', 'in the resolver of the library that loaded it', 'Cross-version bugs are invisible at load time'],
            ['Error behaviour on bad structure', 'fails at an offset', 'fails with a context chain, or succeeds with wrong data', 'Silent coercion has no error path'],
            ['Streaming', 'trivial per record with NDJSON', 'bounded by markers, not by lines', 'Line-oriented tooling works on one and not the other'],
            ['Schema story', 'JSON Schema, a real vocabulary', 'none in the language; each project invents one', 'Validation is always a second dependency'],
            ['Wire use', 'the API body, database documents, logs', 'manifests, pipelines, compose files, playbooks', 'The two meet at a conversion boundary in most stacks'],
          ]}
          foot="The last row is the reason this page exists: most outages in a YAML-to-JSON pipeline happen at the boundary rather than inside either format."
        />
      </Section>

      <Section id="conversion-matrix" title="What survives a conversion" kicker="The honest table">
        <P>
          Every converter on this site has to make the decisions described above, so it is worth writing them down in one place rather than leaving them as a rumour. The rows below are what a YAML document can contain and what happens to each item on the
          way into JSON, and back. Anything marked as lost is not a defect of one tool; it has no representation in the target grammar.
        </P>
        <DataTable
          caption="YAML to JSON, item by item, and what the reverse trip can restore"
          head={['YAML construct', 'Survives into JSON as', 'Lost or changed', 'Back to YAML?']}
          rows={[
            ['Nested mapping and sequence', 'object and array', 'nothing', 'Yes'],
            ['Plain string value', 'JSON string', 'nothing, until a resolver retypes it', 'Yes, but quoting may change'],
            ['Integer, float, boolean, null', 'number, true/false, null', '.inf and .nan have no JSON spelling', 'No for the two non-finite floats'],
            ['0x3A, 0o755, +42, 1_000, 1:15', 'resolved number or string', 'the spelling you typed', 'No'],
            ['Comment line', 'nothing', 'all of it', 'No'],
            ['Value containing a space and a hash', 'the truncated string', 'everything after the hash', 'No, and no warning exists'],
            ['Block scalar with | or >', 'one string with escaped newlines', 'the style, the folding, the chomping choice', 'Only if the emitter guesses, and it will'],
            ['Explicit !!str on a scalar', 'the underlying text', 'the tag, so the type guarantee disappears', 'No'],
            ['!!binary payload', 'base64 text, or a mangled string', 'the declared type', 'Only by convention'],
            ['!!timestamp, from a 1.1 loader', 'ISO text chosen by the dumping side', 'your original characters, possibly a midnight', 'Not reliably'],
            ['Anchor and alias, shared node', 'an expanded copy per reference', 'shared identity, and the graph shape', 'No'],
            ['Merge key with two levels', 'a flattened map', 'which keys came from where', 'No'],
            ['!!set, !!omap, !!pairs', 'array, object or failure', 'the type contract they encode', 'No'],
            ['Non-string mapping key', 'a stringified name', 'distinctness, if two keys stringify alike', 'No'],
            ['Duplicate mapping keys', 'input usually rejected', 'n/a, the document is invalid YAML', 'n/a'],
            ['Three-document stream', 'array of objects, or the first document', 'the boundary, and the intent behind it', 'Only if the tool chose your shape'],
            ['A %YAML or %TAG directive', 'nothing', 'the declared version or handle bindings', 'No'],
            ['Key order', 'the JSON name order', 'nothing, though the spec calls mappings unordered', 'Depends on the emitter'],
          ]}
          foot="Eighteen rows, and only the first is an unqualified yes. This is why the recommendation in the next section is not about aesthetics: if a machine must read and rewrite the file, the format with fewer unrecoverable constructs wins."
        />
        <P>
          Two notes on reading that table. The key-order row is a trap in both formats rather than a difference: the YAML data model says mappings are unordered, and JSON calls an object an unordered collection of name-value pairs, yet both are
          serialised left to right and both are diffed as text, so in practice order is preserved by most tools and load-bearing in most pipelines even though neither specification will promise it. If order is semantic for you — a plugin list, a
          precedence chain — encode it as a sequence, not as mapping keys.
        </P>
        <P>
          The block scalar row is the one that causes the most arguments in review, because a converter that turns a literal block into a single escaped string has produced correct JSON and destroyed the file's readability, while the reverse trip has to
          decide, without being told, whether a string containing line breaks should be written folded, literal or quoted. Generators solve this by choosing one style and sticking to it; hand editors solve it by keeping long prose out of configuration and
          in a separate documented file.
        </P>
        <KeyTerms
          items={[
            { term: 'lossless', definition: 'A conversion where the original document can be reconstructed byte for byte. Almost never true across these two formats.' },
            { term: 'round trip', definition: 'A to B to A. Test it by diffing the two A files, not by checking that both parses succeeded.' },
            { term: 'canonical form', definition: 'The representation you treat as authoritative. In a YAML-to-JSON pipeline, the JSON output is the canonical form of the document.' },
            { term: 'coercion report', definition: 'A list of the plain scalars whose resolved type differs from the characters typed. The most useful artifact a converter can emit.' },
          ]}
        />
      </Section>

      <Section id="decision" title="Decision table" kicker="Choose, then write it down">
        <P>
          The useful output of a comparison is not a winner; it is a rule your team can apply without re-litigating it, plus the exceptions you have already thought about. The table below is the argument of this page compressed into one screen: the left
          column is the situation an engineer is actually in, and the middle columns are the two answers and the reason.
        </P>
        <DataTable
          caption="Which format for which job, with the reason stated as a mechanism rather than a preference"
          head={['Situation', 'Pick', 'Because']}
          rows={[
            ['A wire format for an API body', 'JSON', 'One grammar, one number form, no resolver between you and the value'],
            ['Records in a log or a bulk import', 'NDJSON', 'Append, split and per-record failure, and line tools work'],
            ['A file a human edits in a repository, nested', 'YAML', 'Key names appear once, comments survive, diff reads like prose'],
            ['A file a machine reads and rewrites', 'JSON', 'Fewer unrecoverable constructs in the conversion matrix above'],
            ['Feature flags and typed scalars under review', 'YAML, quoted, or JSON', 'Either way the type must be written down, not inferred'],
            ['Shared defaults across many blocks', 'YAML with anchors', 'JSON cannot express that two nodes are the same node'],
            ['Anything parsed from an untrusted source', 'JSON, or a capped YAML loader', 'Tags that name constructors and unbounded alias expansion are both attack surface'],
            ['Config with several records in one file', 'NDJSON or a YAML stream', 'Do not invent an array of documents inside a format that means something by it'],
            ['Multi-language consumers reading one file', 'JSON', 'The YAML resolver differs across languages; the JSON one does not exist'],
            ['Large flat tabular data', 'Neither: CSV', 'Repeated key names cost more than the type safety buys'],
            ['Existing YAML you are not allowed to change', 'YAML, with lint rules', 'Quote strings, forbid tabs, cap aliases, validate against the tool schema'],
          ]}
          foot="Seven of the eleven rows turn on one question: is the primary author a human or a machine. The other four turn on trust, on how many language runtimes read the file, on record framing and on size. Write the answer for each of your own file types into a contributing guide and the table stops needing to be argued."
        />
        <H3>Four rules if you keep both</H3>
        <P>
          Most teams end up with both formats in the same stack, because the manifest is YAML and the API is JSON, so the rules that matter are about the boundary rather than the choice.
        </P>
        <P>
          <Rich text="**Quote every string in generated YAML.**" /> A quoted scalar reaches the resolver as text in 1.1 and 1.2 alike, which deletes a whole class of cross-version disagreement, and it costs three characters. Our
          <Rich text="[JSON to YAML](/format-converters/json-to-yaml/)" /> converter does this by default and lists the values it protected, because that list doubles as a review note about which fields in your schema are identifiers wearing the clothes of
          numbers.
        </P>
        <P>
          <Rich text="**Treat the JSON output as the canonical form of your YAML.**" /> If you cannot say what your configuration looks like after resolution, you cannot say what you deployed. Paste the manifest into
          <Rich text="[YAML to JSON](/format-converters/yaml-to-json/)" />, read the coercion report, and diff the result against last week's — a boolean, a float or a number where a string used to be is the entire signature of these incidents, and the diff
          finds it in seconds. Before you trust the JSON, <Rich text="[validate it](/json-tools/validator/)" /> rather than eyeballing it, since a converter that emitted invalid JSON would otherwise hide inside a conversion you already assumed was the risky
          step.
        </P>
        <P>
          <Rich text="**Never let a converter choose your document boundary.**" /> If the input is a stream or an NDJSON file, say which shape you want and check the output length against the input record count; the count is the only signal that a
          document did not go missing. If your records are binary or carry bytes, the <Rich text="[Base64 tool](/encoders-decoders/base64/)" /> is the honest place to encode them, because YAML can do it with a tag that JSON has no equivalent for.
        </P>
        <P>
          <Rich text="**Put the comments where the schema can see them.**" /> If the shipped format is JSON, documentation belongs in JSON Schema description fields; if it is YAML, keep prose in comment lines and keep hash characters out of values, then
          format the file with <Rich text="[JSON Formatter](/json-tools/formatter/)" /> and its YAML counterpart so that a reformat never changes a resolved value.
        </P>
        <Callout tone="tip" title="The one-paragraph summary">
          <P>
            JSON and YAML are not two spellings of one idea. JSON is a wire format with a fixed meaning for every character; YAML is a language with a pluggable type resolver, a graph model and a comment syntax, wrapped around a compatibility layer that
            was explicitly designed to accept JSON. Choose by who writes the file and who reads it. Then put the choice, the quoting rule, the schema and the conversion boundary in writing, because the differences on this page are all invisible at load
            time and all obvious in a diff — provided someone looks at the diff of the resolved values rather than the file.
          </P>
        </Callout>
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          <ToolLink path="/format-converters/yaml-to-json/" name="YAML to JSON" blurb="Strict parse, positional errors, and a report of the coercions that differ between YAML 1.1 and 1.2." />
          <ToolLink path="/format-converters/json-to-yaml/" name="JSON to YAML" blurb="Block-style output that quotes anything a 1.1 resolver would misread." />
        </div>
        <P>
          If the decision you are actually facing is wider than these two formats, the sibling comparisons cover the other corners of the same argument: <Rich text="[YAML vs TOML](/compare/yaml-vs-toml/)" /> is about whether indentation and implicit typing
          are worth it in a file nobody generates, <Rich text="[XML vs JSON](/compare/xml-vs-json/)" /> covers the namespace-and-schema side that YAML deliberately left out, and
          <Rich text="[JSON vs CSV](/compare/json-vs-csv/)" /> handles the flat-table case where both of these formats lose. The underlying rules, resolver by resolver, are in
          <Rich text="[the YAML guide](/learn/yaml/)" /> and <Rich text="[the JSON guide](/learn/json/)" />.
        </P>
      </Section>
    </>
  )
}
