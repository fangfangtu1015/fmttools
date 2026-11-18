import { Callout, CodeBlock, DataTable, H3, KeyTerms, P, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'csv-vs-tsv',
  path: '/compare/csv-vs-tsv/',
  title: 'CSV vs TSV: Delimiter Choice, Safety & Tooling | FmtTools',
  description:
    'Comma versus tab separated values: why tabs need less quoting, how Hive, Spark, Postgres and Excel treat each, and the sniffing rules that pick wrong.',
  h1: 'CSV vs TSV: Choosing a Delimiter That Will Not Bite You',
  summary:
    'The same grid with a different delimiter — and the reason data engineers default to tabs while business users default to commas.',
  keywords: [
    'csv vs tsv',
    'delimiter choice',
    'tab separated values',
    'csv quoting rules',
    'hive textfile delimiter',
    'postgres copy delimiter',
    'csv delimiter detection',
  ],
  published: '2026-11-02',
  updated: '2026-11-02',
  readingMinutes: 25,
  sections: [
    { id: 'anatomy', label: 'What a delimiter actually does' },
    { id: 'quoting', label: 'Quoting is the cost, and tabs buy it down' },
    { id: 'split-trap', label: 'The split trap runs in both directions' },
    { id: 'sniffing', label: 'How a sniffer decides, and how it decides wrong' },
    { id: 'engines', label: 'Hive, Spark and Postgres have three different defaults' },
    { id: 'excel', label: 'Excel does not treat a TSV like a CSV' },
    { id: 'bytes', label: 'Gzip, not the delimiter, is the pipeline answer' },
    { id: 'decision', label: 'Which one, when' },
    { id: 'commas', label: 'Where commas are still the right answer' },
  ],
  faqs: [
    {
      question: 'Is TSV faster to parse than CSV?',
      answer:
        'Not meaningfully. Both are a single pass over bytes, and a correct reader is a state machine either way, because a tab can appear inside a quoted field just as a comma can. What tabs change is how often you need quotes at all: in the 1,000-row table below, 1,488 cells needed quoting with commas and 406 with tabs. Fewer quoted fields means fewer parser branches, not a faster loop.',
    },
    {
      question: 'Can I use `split()` on a TSV file?',
      answer:
        'Only if you can prove no value contains a tab. That proof is easy to assert and hard to hold, because pasted text, log message fields and spreadsheet notes all smuggle tabs in. In the measured corpus 75 of 1,000 rows broke a naive tab split, versus 1,000 of 1,000 for commas. A state machine such as the [CSV to JSON converter](/format-converters/csv-to-json/) handles both.',
    },
    {
      question: 'Which delimiter does Hive use by default?',
      answer:
        'Not a tab character you can type. The delimited text SerDe defaults `FIELDS TERMINATED BY` to `\\001`, control character A, and writes NULL as `\\N`. Hive stores plain text files, so the delimiter lives in the table definition rather than in the file, and a file that looks tab-separated only parses if the DDL says so.',
    },
    {
      question: 'Why does my tab-separated file open in one column?',
      answer:
        'Because the program decided delimiters from the extension, not from the bytes. Excel opens `.csv` with its list separator and `.txt` with the Text Import Wizard, and neither assumes tabs. Renaming the file to `.txt` and importing, or using Data, Get Data, From Text, gives you the column type choice that a double click takes away.',
    },
    {
      question: 'Does Postgres COPY use commas or tabs?',
      answer:
        'Tabs in text format, commas in CSV format. The `COPY` documentation states the default is a tab character in text format and a comma in CSV format, and that text format escapes with backslashes while CSV format quotes. `DELIMITER E\'\\t\'` is only needed to be explicit; the real difference is escaping and NULL representation.',
    },
    {
      question: 'Should I compress delimited text files?',
      answer:
        'Yes, and it matters far more than the delimiter choice. The same 1,000-row table was 61,269 bytes as CSV and 59,105 as TSV, but 18,306 and 17,938 bytes gzipped: about 70 percent smaller either way. gzip is defined in RFC 1952 with a CRC-32 check and an ISIZE field, so damage is detected rather than silent.',
    },
    {
      question: 'How do I convert a TSV to JSON without losing data?',
      answer:
        'Paste it into the [CSV to JSON converter](/format-converters/csv-to-json/) and read the reported delimiter and its evidence before downloading. It counts candidate separators outside quoted regions of the first 40 non-blank lines, and says so if the data is ambiguous. Keep identifier columns as strings: safe inference leaves `09401` and 17-digit values alone.',
    },
  ],
  sources: [
    {
      label: 'RFC 4180 — Common Format and MIME Type for CSV Files',
      href: 'https://www.rfc-editor.org/rfc/rfc4180.txt',
      detail:
        'The §2 field rules quoted throughout — CRLF record delimiter, the optional header line that producer and consumer must agree on, the sentence “Spaces are considered part of a field and should not be ignored”, rule 5’s parenthetical that some programs such as Microsoft Excel do not use double quotes at all, rule 6’s three characters that force quoting and rule 7’s doubling — plus the §3 text/csv registration with its two optional parameters, charset and header, the §4 ABNF, where escaped is DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE and TEXTDATA is %x20-21 / %x23-2B / %x2D-7E, and §1’s note that IANA already carried a registration for text/tab-separated-values while CSV had none.',
      accessed: '2026-11-12',
    },
    {
      label: 'IANA — Media Type Registration: text/tab-separated-values',
      href: 'https://www.iana.org/assignments/media-types/text/tab-separated-values',
      detail:
        'The registration that RFC 4180 §1 refers to: fields separated by tabs, a constant field count per line, no escape mechanism for a tab inside a value, the character set named as a required parameter, and the description of the format as the lowest common denominator between two applications. Contact of record is the University of Minnesota gopher team.',
      accessed: '2026-11-12',
    },
    {
      label: 'Apache Hive — Language Manual DDL',
      href: 'https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL',
      detail:
        'The row_format grammar for ROW FORMAT DELIMITED, the defaults FIELDS TERMINATED BY \'\\001\', COLLECTION ITEMS TERMINATED BY \'\\002\', MAP KEYS TERMINATED BY \'\\003\' and NULL DEFINED AS \'\\N\', the recommendation to use single-byte control characters, and the sentence that escaping is needed if you want to work with data that can contain these delimiter characters.',
      accessed: '2026-11-12',
    },
    {
      label: 'Apache Spark — CSV Data Source',
      href: 'https://spark.apache.org/docs/latest/sql-data-sources-csv.html',
      detail:
        'The option table: sep and delimiter as aliases defaulting to a comma and allowed to be one or more characters, header defaulting to false, quote defaulting to the double quote, escape defaulting to the backslash, nullValue, inferSchema defaulting to false and costing an extra pass, mode PERMISSIVE, multiLine defaulting to false with the documented behaviour that a line break inside a quoted value terminates the record there, and the compression option whose scope is write.',
      accessed: '2026-11-12',
    },
    {
      label: 'PostgreSQL — COPY',
      href: 'https://www.postgresql.org/docs/current/sql-copy.html',
      detail:
        'DELIMITER defaulting to “a tab character in text format, a comma in CSV format”, NULL defaulting to backslash-N in text format and an unquoted empty string in CSV format, the backslash escape table including backslash-t for a tab in data, ESCAPE defaulting to the QUOTE value in CSV mode, FORCE_QUOTE and FORCE_NOT_NULL, HEADER, and the sentence that CSV files “are not strictly one line per table row like text-format files”.',
      accessed: '2026-11-12',
    },
    {
      label: 'Microsoft — Excel specifications and limits',
      href: 'https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3',
      detail:
        'The ceilings that bound any delimited import: 1,048,576 rows by 16,384 columns on a worksheet, 32,767 characters in a cell and 15 digits of number precision.',
      accessed: '2026-11-12',
    },
    {
      label: 'RFC 1952 — GZIP file format specification version 4.3',
      href: 'https://www.rfc-editor.org/rfc/rfc1952',
      detail:
        'The ten-byte header with ID1 and ID2 fixed at 31 and 139, CM 8 for DEFLATE, the FLG, MTIME, XFL and OS members, and the two trailer members quoted in the compression section: CRC32, “a Cyclic Redundancy Check value of the uncompressed data”, and ISIZE, “the size of the original (uncompressed) input data modulo 2^32”.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP — CSV Injection',
      href: 'https://community.owasp.org/attacks/CSV_Injection',
      detail:
        'The dangerous prefix set that includes the equals sign, plus, minus, at sign, tab, carriage return and line feed and their full-width look-alikes, and the mitigation note that Microsoft Excel may remove quotes or escape characters on save so that a previously escaped formula becomes active again.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    {
      path: '/format-converters/csv-to-json/',
      name: 'CSV to JSON',
      blurb: 'Parses both dialects with a state machine, reports the delimiter it chose and the evidence for it, and flags ragged rows and precision loss.',
    },
    {
      path: '/learn/csv/',
      name: 'CSV: The Complete Format Guide',
      blurb: 'The RFC 4180 clause-by-clause reference behind the quoting and sniffing rules summarised here.',
    },
    {
      path: '/compare/csv-vs-excel/',
      name: 'CSV vs Excel',
      blurb: 'What a double click does to identifiers, dates and leading zeros, and the import path that does not.',
    },
    {
      path: '/use-cases/data-migration/',
      name: 'Data Migration Tools',
      blurb: 'The pre-flight audit for moving a table between systems without silently changing a value.',
    },
  ],
  words: 5594,
  image: '/images/covers/cmp-csv-vs-tsv.png',
  imageAlt: 'The same thousand-row table written twice, once with commas highlighted between fields and once with tabs, with the quoted cells counted on each side.',
}

export default function Article() {
  return (
    <>
      <Section id="anatomy" title="What a delimiter actually does" kicker="The byte that does the work">
        <P>
          A delimiter has one job: to say where a field ends. It does not say what the field is, whether it may be empty, how a
          missing value is written or which characters the bytes mean. That narrowing matters, because almost every argument
          about commas against tabs is really an argument about the things the delimiter does not do, and the two formats differ
          most where they look most alike.
        </P>
        <P>
          The file name carries less information than people assume. A <Rich text=".csv" /> suffix announces an intention and not
          a dialect: it does not say which character separates the fields on the machine that will open it, whether the first line
          is data, whether a blank field is a null, or what the bytes mean. The one place any of that is recorded in a standard is
          RFC 4180 §3, which registers text/csv with two optional parameters, charset and header — a delimiter parameter is not
          among them, and no producer writes it even if it were. So both formats rely on an agreement that lives outside the file,
          and the difference between them is how often that agreement has to be renegotiated after the bytes exist.
        </P>
        <P>
          There is exactly one specification on the table, and it is not the one people quote when they defend tabs. RFC 4180
          §2 gives seven rules: records sit on separate lines delimited by a carriage return and line feed pair; the last record
          may omit that line break; a header line is optional and “should contain the same number of fields as the records in the
          rest of the file”, with its presence or absence agreed between producer and consumer; fields are separated by commas,
          each line should carry the same number of fields, and “Spaces are considered part of a field and should not be ignored”;
          fields may be enclosed in double quotes, with the parenthetical that some programs “such as Microsoft Excel, do not use
          double quotes at all”; a field containing a line break, a double quote or a comma must be quoted; and a double quote
          inside a quoted field is escaped by doubling it.
        </P>
        <P>
          TSV has no such memo. It has a registration in the IANA tree that RFC 4180 §1 mentions in its own justification — the
          registration existed while CSV did not — and that registration describes records of tab-separated fields with a constant
          number of fields per line, calls the format the lowest common denominator between two applications, names the character
          set as a required parameter and offers no escape mechanism at all. Its contact of record is a University of Minnesota
          gopher team. So the honest framing of the comparison is not standard against non-standard: it is a grammar with an escape
          hatch against a definition with none.
        </P>
        <P>
          One consequence of that asymmetry is rarely noticed. The §4 ABNF of RFC 4180 defines an escaped field as
          <Rich text={' DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE '} /> and TEXTDATA as
          <Rich text=" %x20-21 / %x23-2B / %x2D-7E" />. The tab character is %x09, which is in neither set. Read as a grammar
          rather than as a sketch, the CSV specification cannot express a tab-delimited file at all, not even inside quotes. Every
          tool on the comma side of this argument that claims RFC 4180 conformance while accepting{' '}
          <Rich text={'sep="\\t"'} /> is implementing the rules of §2 with a substituted character, which is sensible, and
          is not the same thing as the memo.
        </P>
        <KeyTerms
          items={[
            { term: 'delimiter / separator', definition: 'The one character that ends a field. It is data-loss-adjacent, not data-describing: it carries no type, no nullness, no encoding.' },
            { term: 'quoted field', definition: 'A field wrapped in double quotes, in which the delimiter, a line break and a doubled quote are legal as data. The only escape mechanism RFC 4180 offers.' },
            { term: 'naive split', definition: 'Cutting a record on every occurrence of the delimiter with no quote state. Correct only when the delimiter is provably absent from all values.' },
            { term: 'sniffing', definition: 'Scoring candidate delimiters against the bytes, usually outside quoted regions, and picking the highest. A guess with a failure mode, never a fact.' },
            { term: 'dialect', definition: 'The bundle a reader actually needs: delimiter, quote character, escape rule, line terminator, header presence, null token and character encoding.' },
            { term: 'null token', definition: 'How an absent value is written. Empty, "\\N", NULL or nothing at all — the portability problem nobody puts in the file name.' },
          ]}
        />
        <P>
          The measurements in this article come from one file, reused in every section so the comparisons are arithmetic rather
          than vibes. It is an export of a real shape: a thousand rows with a name column, an address line, a free-text note, a
          money column and a few identifiers. Written with commas it is 61,269 bytes; with tabs, 59,105. With commas, 1,488 cells
          required quoting; with tabs, 406 did. A naive split on commas produces the wrong field count on all 1,000 rows, and a
          naive split on tabs gets it wrong on 75. Gzipped, the two files are 18,306 and 17,938 bytes. Those four pairs of numbers
          are the whole argument, and the sections that follow read them in order. The clause-by-clause reading of the grammar
          itself is in the <Rich text="[CSV guide](/learn/csv/)" />; what belongs here is the comparison, so the rules are quoted
          only as far as the choice between the two dialects turns on them.
        </P>
      </Section>

      <Section id="quoting" title="Quoting is the cost, and tabs buy it down" kicker="Why 2,164 bytes">
        <P>
          Start with the cheapest claim in the article and the one most often stated backwards: a tab-delimited file is smaller
          than the comma-delimited version of the same table <em>only</em> because of quoting. The delimiters themselves cost the
          same. A comma is one byte and a tab is one byte, and the number of separators per record is fixed by the schema, so
          switching character changes nothing at all in the byte count. Everything else is quote characters, and here the
          arithmetic closes exactly.
        </P>
        <DataTable
          caption="The same thousand rows, both delimiters, counting only what differs"
          head={['Measure', 'Comma file', 'Tab file', 'Difference']}
          rows={[
            ['Cells that needed quoting', '1,488', '406', '1,082 cells'],
            ['Quote characters added at two per cell', '2,976', '812', '2,164 bytes'],
            ['Total file size', '61,269 bytes', '59,105 bytes', '2,164 bytes'],
            ['Size difference', '—', '—', '3.5% of the comma file'],
          ]}
          foot="1,488 minus 406 is 1,082 cells that were quoted because of a comma and needed no quoting because of a tab. Two quote characters per cell is 2,164 bytes, which is 61,269 minus 59,105 to the byte. No other difference between the two files survives inspection."
        />
        <P>
          That is a tidy result and it is worth stating what it does not mean. It does not mean the tab file is 3.5% cheaper to
          produce, transport or store in any pipeline that compresses; the compression section shows the gap collapsing to 368
          bytes. It does not mean the tab file needs less careful reading; it needs the same state machine, just with rarer
          branchings. What it does mean is that the delimiter decision is a decision about how often the quoting mechanism fires,
          and how often a value that contains the structure character has to survive an encoder and a decoder on their way to your
          column.
        </P>
        <P>
          The 1,082 cells that stopped being special are the ones whose only offence was a comma: surnames written as “Ndlovu,
          A.”, addresses with “Suite 4, Floor 2”, amounts like “1,204.99” produced by a locale that formats with a thousands
          separator, and notes that quote a sentence. Tabs do not appear in that kind of prose. The 406 cells that stayed special
          are the interesting ones, because they are the cells that would break a naive split: values containing a real tab, a
          double quote or an embedded line break, pasted out of a spreadsheet note or a log message or a form field someone
          filled in by copying from another window.
        </P>
        <CodeBlock
          title="one record, both dialects"
          language="csv"
          code={'id,name,address,note,amount\n84120,"Ndlovu, A.","Suite 4, Floor 2, Leeds","quoted from the log:\t""retry once""",1204.99\n\nid\tname\taddress\tnote\tamount\n84120\tNdlovu, A.\tSuite 4, Floor 2, Leeds\t"quoted from the log:\t""retry once"""\t1204.99'}
          caption="The same five fields. In the comma file three cells carry quotes: the surname, the address and the note. In the tab file only the note does, because it contains a tab and a double quote, which are the two characters the delimiter change cannot make ordinary. Two cells fewer quoted is four bytes fewer on this row, and 2,164 bytes on the file."
        />
        <P>
          Quoting has a cost beyond the two characters, and it is the reason the escaping rules deserve more attention than the
          delimiter. A quoted field that contains a double quote has to double it, per §2 rule 7, and that transformation is the
          one step where a producer and a rewriter can disagree and the file still look legal. Rule 5 makes the disagreement
          explicit: if fields are not enclosed in quotes, double quotes may not appear inside them — and the memo then admits that
          some programs do not use quotes at all. A comma-delimited file with 1,488 quoted cells is a file where 1,488 values have
          been through an encode-and-escape path. A tab-delimited file with 406 has been through it 1,082 fewer times. Every
          one of those passes is a chance for a writer that does not double the quote, or a reader that does not un-double it, to
          move a value one column to the left.
        </P>
        <P>
          Rule 4 bears quietly on all of it: “Spaces are considered part of a field and should not be ignored.” A writer that
          trims before deciding whether a value needs quoting is not the same writer as one that quotes first and never trims, and
          the two produce files that differ in bytes a reader cannot see. Padding is data on both sides of this comparison, so the
          trimming rule belongs in the contract next to the quoting rule, and a value that legitimately begins or ends with a space
          is one more argument for quote-everything over quote-what-the-writer-remembered.
        </P>
        <Callout tone="warn" title="Where this goes wrong">
          <P>
            The failure mode of the low-quoting file is not size, it is silence. When a producer of TSV decides quoting is
            unnecessary, it usually turns quoting off in the writer rather than sanitising the data, and then a value containing a
            tab either shifts every later column or is dropped with an error the job log buries. That is the 75 rows in the
            measured corpus, and it is why the recommendation in the decision section is to quote everything or to prove the tab is
            absent, never to assume the tab is absent because the file is called .tsv.
          </P>
        </Callout>
      </Section>

      <Section id="split-trap" title="The split trap runs in both directions" kicker="75 rows, not zero">
        <P>
          The familiar warning is that you must never split a CSV on a comma. It is true, and it is incomplete, and the
          incompleteness is the main reason teams choose tabs: the tab version of the same shortcut feels safe, because the
          delimiter is a character nobody types. In the measured corpus, splitting each record on commas gives a field count that
          disagrees with the header for all 1,000 rows. Splitting on tabs gives a disagreeing count for 75 rows. The naive reader
          is wrong in one case and wrong-but-quietly in the other, which is worse, because a bug that fires on one row in thirteen
          becomes a data-quality ticket three months later.
        </P>
        <P>
          What those 75 rows are made of is worth naming, since the usual assumption is that tabs only come from spreadsheets.
          They come from copy and paste: a note field filled from a console log, an address block pasted out of a ticket, a
          description copied from a form where somebody used the tab key to move between inputs instead of the mouse. They come
          from producers that joined fields with the wrong character and left the original inside. And they come from the free-text
          columns nobody types a schema check for. Every one of them survives a tab split as an extra field, which shifts every
          column after it, which is exactly the CSV bug — just rare enough to pass a spot check.
        </P>
        <P>
          The reverse direction is the one the tab camp never expects: a TSV that is quoted properly is still a file with a
          quoting rule, and a naive reader breaks it in a new way. Those 406 cells carry quotes as data. A line splitter that does
          not understand quotes sees the opening quote as the first character of the value, so the value starts with a double quote
          and ends with one, and any downstream equality test against the clean string fails. A consumer that does strip surrounding
          quotes but does not un-double the inner ones turns “retry once” into a mangled value. Neither of those is a delimiter
          problem, and switching the delimiter does not remove the need to handle either.
        </P>
        <H3>The escape hatch that is not a delimiter</H3>
        <P>
          There is a version of this argument where the delimiter is chosen so that the naive split genuinely cannot fail, and
          Hive is its purest case. The default field terminator is <Rich text="\001" />, control character A, with{' '}
          <Rich text="\002" /> between collection items and <Rich text="\003" /> between map keys. A value containing{' '}
          <Rich text="\001" /> is essentially never written by a human or pasted out of a browser, so a line-based reader with a
          split is right every time, and the manual’s note that “escaping is needed if you want to work with data that can contain
          these delimiter characters” is a sentence about a character you will not meet. That is a real engineering win, and it is
          available for tabs only to the extent that your data is tab-free — the corpus shows 75 rows where it is not.
        </P>
        <P>
          The cost is that the file has stopped being a document. A <Rich text="\001" /> delimited table cannot be opened in a
          spreadsheet, is unintelligible in a text editor, and cannot be validated by a reader that has not been told the
          delimiter, because the delimiter lives in the table definition rather than in the file. Hive stores plain text and keeps
          the dialect in the DDL, so a file that looks tab-separated parses only if someone wrote{' '}
          <Rich text={'FIELDS TERMINATED BY "\\011"'} /> at creation time. That coupling is the reason a Hive export landing
          in a data-lake table directory is a support ticket.
        </P>
        <P>
          Postgres solves the same problem in the opposite direction and is worth stealing from. In text format its delimiter is
          a tab, and a tab that is data is written as the two-character sequence backslash-t, with backslash-N for NULL and a
          documented escape table for the rest. The consequence is the strongest structural property on this page: in a Postgres
          text dump, every tab is structural, so one record per line and one field per tab are facts the format guarantees rather
          than hopes. The price is that a plain TSV reader is wrong about the escaped values and you have to unescape, which is
          why the escape table, not the delimiter, is the thing a loader has to know.
        </P>
        <CodeBlock
          title="the two-line check that settles it"
          language="bash"
          code={'# does the header field count match every other line?\nawk -F"\\t" -v h="$(head -1 out.tsv | awk -F"\\t" "{print NF}")" \\\n  \'NF != h { bad++ } END { print bad+0 " of " NR-1 " rows disagree" }\' out.tsv\n\n# same question for commas, with quoting ignored — the CSV answer is always "all of them"\nawk -F"," \'NF != 5 { bad++ } END { print bad+0 }\' out.csv'}
          caption="On the measured corpus the tab version of this reports 75 of 1,000 and the comma version reports 1,000. The first is a reason to parse properly; the second is a reason people already parse CSV properly, which is the asymmetry in one command."
        />
        <Callout tone="tip" title="What to do instead">
          <P>
            Parse with a state machine and keep the naive split for the audit. The split is a good instrument, in other words: it
            tells you how many rows disagree with your assumption, which is the number you needed before choosing the format at
            all. The <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> reports the delimiter it detected and
            the rows whose field count disagrees with the header, so the check costs one paste rather than a script.
          </P>
        </Callout>
      </Section>

      <Section id="sniffing" title="How a sniffer decides, and how it decides wrong" kicker="Inference">
        <P>
          Nobody declares a delimiter in a file name, so something has to guess, and the guessing is a scoring problem with
          four failure modes. Our reader considers comma, tab, semicolon and pipe; samples the first 40 non-blank lines; counts how
          many times each candidate occurs <em>outside a quoted section</em> of each sampled line; requires at least one occurrence
          on line 1 for a candidate to be considered; computes consistency as the fraction of sampled lines whose count equals
          line 1’s count; and scores a candidate as its first-line count multiplied by that consistency. Ties break alphabetically.
          That is the entire rule, and you can reason about its mistakes from it.
        </P>
        <P>
          The first mistake is the one that costs the tab fan, and it is plain arithmetic. Take a five-column TSV: four tabs on
          every sampled line, so tab scores 4 × 1.00 = 4. Now suppose the address column carries exactly four commas on every row,
          which is what “Suite 4, Floor 2, Leeds, UK” does to a scorer. Comma also scores 4 on a 40-of-40 consistency, the two
          candidates tie, and the tie is broken alphabetically, which puts comma before tab. The tab file is read as a comma file
          with perfect confidence and no evidence either way. Remove one comma from one sampled line and the fractions separate
          again: comma scores 4 × 0.975 = 3.9, tab keeps 4, and the same bytes now read correctly. The point is that consistency
          measures regularity, not structure — prose can be as regular as a separator, and a tie-break is not a finding.
        </P>
        <P>
          The second mistake is circularity. “Outside a quoted section” requires knowing the quote character and the quoting rules
          before you know the delimiter, and it requires a scanner that tracks quote state across physical lines. A quoted field
          containing a carriage return and line feed contributes its internal commas to one sampled line’s count and nothing to
          the next, so the consistency fraction falls by however many sampled lines are cut in the middle — a quarter of them is
          75%, half of them is 50% — and a low score comes back reported as ambiguity rather than as a wrong delimiter. Any sniffer
          that does not track quote state across lines is counting data as structure, and any sniffer that does is doing most of
          the parse before deciding how to parse.
        </P>
        <P>
          The third is the dominance of line 1, which is baked into the score by construction. A header written with a different
          convention than the body — a hand-edited top row, a report banner line, a CSV whose first line is a title with a comma
          in it — supplies the count that everything else is measured against. Requiring an occurrence on line 1 has the opposite
          failure too: a genuinely single-column file scores nothing for every candidate and is indistinguishable from a
          caret-delimited file, which is why the honest output for that case is one field per row and a sentence saying so.
        </P>
        <P>
          The fourth is the candidate list. A sniffer that considers four characters cannot find the fifth: pipe-and-quote
          dialects, <Rich text="\001" />, ASCII 30 and 31 record and unit separators, the carets that legacy extracts use, and the
          tab-in-a-semicolon-file that a European export produces. A wrong delimiter is loud; an unconsidered delimiter is a file
          of one column that validates perfectly.
        </P>
        <P>
          What the rule gets right is worth stating as well, or this section reads as a warning about a program nobody wrote. When
          the tab count is uniform and no column of prose happens to match it, the tab candidate wins on consistency rather than on
          a tie, and the answer is correct for the boring reason. A tool should still print the two highest scores and how many
          lines it sampled, because a verdict of 4 against 3.9 is a different statement from a verdict of 4 against 0 even though
          both download the same file.
        </P>
        <DataTable
          caption="What a correct sniffer reports, and what it should not be trusted to decide"
          head={['Evidence in the sample', 'Verdict the scorer gives', 'What you should do']}
          rows={[
            ['Tab 4 per line on 40/40 lines; comma 4 per line on 40/40', 'Comma, because the tie breaks alphabetically', 'Set the delimiter explicitly; a tie is not a finding'],
            ['Tab 4 per line on 40/40; comma 4 on line 1, one line short', 'Tab, at 4 against 3.9 — the right answer, by one comma', 'Do not rely on the prose being consistent'],
            ['Comma 2 per line, but quoted cells span three physical lines', 'Comma at 50 to 67% consistency, reported as ambiguous', 'The file is CSV; the sampler is line-based. Declare it.'],
            ['Line 1 is a report title containing a comma; body is tab-delimited', 'Whatever line 1 supports', 'Skip leading non-table lines before sniffing'],
            ['No candidate occurs at all', 'One field per row', 'Ask what the producer wrote; carets and control characters are invisible here'],
          ]}
          foot="This is why the converter prints its evidence rather than only its answer: a score of 4 against a score of 4 is not knowledge. The same rule is worked through clause by clause in the CSV guide, linked below under Next up."
        />
        <Callout tone="note" title="Nobody sniffs in a pipeline, and they should not">
          <P>
            The engines are consistent here: Spark’s <Rich text="sep" /> defaults to a comma and does not guess; Postgres takes
            the delimiter from your <Rich text="COPY" /> statement; Hive takes it from the DDL; Excel takes it from the extension
            and your regional settings, which is the least defensible option of the four and the one billions of people use. The
            only production-grade answer is to write the delimiter into the loader configuration, and the only place guessing is
            legitimate is in an interactive tool where a human can see the evidence and override it in one click.
          </P>
        </Callout>
      </Section>

      <Section id="engines" title="Hive, Spark and Postgres have three different defaults" kicker="Implementations">
        <P>
          Ask what the default delimiter is and you get three answers that are not about bytes at all. Hive defaults to a
          control character, Spark defaults to the comma and Postgres defaults to whichever of the two you asked for. The
          interesting part is not the ranking of tabs and commas but the fact that each engine’s default is a statement about who
          is supposed to read the file.
        </P>
        <H3>Hive: a delimiter that is not a character you can type</H3>
        <P>
          The delimited text SerDe defaults <Rich text="FIELDS TERMINATED BY" /> to <Rich text="\001" />, collection items to{' '}
          <Rich text="\002" />, map keys to <Rich text="\003" /> and NULL to <Rich text="\N" />, and the manual recommends
          single-byte control characters for the job. The reasoning is visible in the split section: control characters do not
          occur in the kind of text humans write, so the delimiter is never ambiguous with data and no quoting rule is needed. The
          escape character defaults to none, which is the correct choice for a delimiter that cannot appear and the wrong one for
          everything else — a value that does contain the terminator shifts the columns silently, and there is no quoting to
          absorb a stray character. Note also what is <em>not</em> in the design: a tab-delimited file does not become a Hive
          table by inspection. The dialect lives in the table definition, and the file is bytes.
        </P>
        <H3>Spark: the comma with an opt-in header and a documented multi-character trap</H3>
        <P>
          Spark’s CSV source defaults <Rich text="sep" /> to a comma, <Rich text="header" /> to false,{' '}
          <Rich text="quote" /> to the double quote and <Rich text="escape" /> to a backslash, and <Rich text="inferSchema" /> to
          false at the cost of an extra pass. Two of those are the practical answer to “why did my tab file come back with one
          column called _c0”. Because <Rich text="header" /> is false, the first row becomes data and the columns are named{' '}
          <Rich text="_c0" /> to <Rich text="_c4" />; because <Rich text="sep" /> defaults to a comma, a tab file with real commas
          in its text columns parses as one broken column of its own choosing.
        </P>
        <P>
          <Rich text="multiLine" /> is the option that decides what a quoted line break means, and it defaults to false. With it
          off, the documented behaviour is that a line break inside a quoted value terminates the record at that break, the value is
          truncated there and the remainder begins a new record, either or both of which may be malformed. That is precisely the
          situation RFC 4180 rule 6 permits and Postgres CSV format produces, and it is a size-and-shape disagreement in one
          sentence: the same file is one row to a loader that knows about quoting and two broken rows to a default Spark read, which
          is what the <Rich text="mode" /> options PERMISSIVE, DROPMALFORMED and FAILFAST are there to turn into an error rather
          than a shorter table.
        </P>
        <P>
          The option table also says the separator “can be one or more characters”, which reads like a convenience and is a
          statement about that reader rather than a promise about the ecosystem: a two-character separator is a dialect Spark
          implements and most other readers will take as data. Choose a delimiter that every consumer represents as one character.
        </P>
        <P>
          One more Spark default deserves the reader’s attention because it is a genuine conformance gap between the file you
          write and RFC 4180: <Rich text="escape" /> defaults to the backslash. The memo’s rule 7 escapes a quote inside a quoted
          field by doubling it, so a Spark-written file that quotes a value containing a double quote produces{' '}
          <Rich text={'"he said \\"hi\\" one, two"'} /> where the specification expects{' '}
          <Rich text={'"he said ""hi"" one, two"'} />. Postgres CSV mode makes the opposite choice — its ESCAPE defaults to the QUOTE value, so it
          doubles — and Excel, per the memo’s own parenthetical, does not quote at all. Three implementations, three escaping
          rules, one delimiter argument.
        </P>
        <H3>Postgres: two formats, and the difference is not the comma</H3>
        <P>
          COPY defaults to a tab in text format and a comma in CSV format, and the sentence worth acting on is the one about
          lines: CSV format produces files that are “not strictly one line per table row like text-format files”, because quoted
          values may carry carriage returns and line feeds. In text format a tab that is data is written backslash-t and NULL is
          written <Rich text="\N" />; in CSV format NULL is an unquoted empty string and the quote is doubled. So the same table
          with the same columns has two serialisations in which the word “empty” means different things — and{' '}
          <Rich text="FORCE_NOT_NULL" /> exists precisely to stop an empty field being read as a null when the file was written by
          something that has no concept of null.
        </P>
        <P>
          The consequence of that last sentence is the error a migration actually produces. A null exported from Postgres in CSV
          format arrives as an unquoted empty field; read into Hive, whose null token is backslash-N, the same field becomes an
          empty string, and a count of missing values taken after the load silently returns zero. Read through Spark it is empty again until{' '}
          <Rich text="nullValue" /> is set. <Rich text="FORCE_QUOTE" /> works the other way, on export: it quotes the named
          columns whether or not they need it, which is how you signal to a reader that a column of numeric identifiers is text
          rather than numbers — at least to the readers that consult the quotes before they guess.
        </P>
        <CodeBlock
          title="three dialects, three statements"
          language="sql"
          code={'-- Postgres: tab-delimited text, backslash escapes, \\N for NULL\nCOPY orders TO \'/tmp/orders.txt\' WITH (DELIMITER E\'\\t\');\n-- Postgres: the same rows as CSV, comma default, empty unquoted string for NULL\nCOPY orders TO \'/tmp/orders.csv\' WITH (FORMAT csv, HEADER true);\n\n-- Hive: the delimiter is metadata, not bytes; \\011 is tab\nCREATE TABLE orders (id STRING, name STRING, addr STRING, note STRING, amount DECIMAL(12,2))\n  ROW FORMAT DELIMITED FIELDS TERMINATED BY \'\\011\'\n  STORED AS TEXTFILE;\n\n-- Spark: comma is the default, so both of these options are load-bearing\nspark.read.option("sep", "\\t").option("header", "true").csv("/tmp/orders.tsv")'}
          caption="Read the three escape and null decisions off the statements rather than trusting the extensions: backslash-N, unquoted empty, and backslash-N again. That is where these engines actually disagree."
        />
        <DataTable
          caption="Defaults, as documented, for the three engines most likely to read your file"
          head={['Engine', 'Default delimiter', 'NULL as written', 'Quoting and escaping', 'Where the dialect lives']}
          rows={[
            ['Hive TEXTFILE', "\\001, control character A", "\\N", 'No quoting; ESCAPED BY defaults to none', 'In the table definition, not the file'],
            ['Spark CSV', 'Comma', 'Empty, configurable with nullValue', 'Double quotes, escape defaults to backslash', 'In the reader options, per job'],
            ['Postgres COPY text', 'Tab', "\\N", 'Backslash escapes, including \\t for a tab in data', 'In the statement'],
            ['Postgres COPY csv', 'Comma', 'Unquoted empty string', 'Double quotes, ESCAPE defaults to the quote', 'In the statement'],
          ]}
          foot="The header line is the exception that proves the point: Spark defaults header to false, Postgres needs HEADER true on both sides of the transfer, and the Hive delimited-text SerDe takes column names from the DDL rather than from line 1, so a header written into a text table’s directory arrives as a row of data."
        />
      </Section>

      <Section id="excel" title="Excel does not treat a TSV like a CSV" kicker="The extension decides">
        <P>
          Excel is the reason the comma survives every technical argument against it, and it is also the reason a tab file is
          the most likely one to arrive as a single column. The mechanism is an if-statement on the file name. A{' '}
          <Rich text=".csv" /> file is opened using the list separator from your regional settings — a comma in an en-US install, a
          semicolon in most European ones — and a <Rich text=".txt" /> file is opened through the Text Import Wizard, where you
          choose the delimiter yourself. Neither path assumes tabs. The extension does the sniffing, and the sniffing is one
          string comparison.
        </P>
        <P>
          That produces two failures worth distinguishing. In the first, the tab file opens as one column, which is loud,
          harmless and slightly embarrassing: nothing is lost, and the fix is Data, Get Data, From Text, or a rename to{' '}
          <Rich text=".txt" /> and a tick in the wizard. In the second, the delimiter matches but the interpretation does not, and
          that is silent: identifiers become numbers, 15 digits of precision is the published ceiling, dates in an unreadable
          format become the locale’s date, and leading zeros are removed. Both formats meet that failure identically; the only
          difference is that the comma file is more likely to be opened by double-clicking, because the extension matched.
        </P>
        <P>
          The import path is where the delimiter choice and the data-loss question meet, and it is worth walking because it
          answers the question this section is really about. In the wizard, step one sets the delimiter — tick Tab, untick Comma,
          or type the character your export actually used. Step two sets the per-column type, and Text is the answer for anything
          that is an identifier: an 18-digit merchant reference, a zip code with a leading zero, a SKU that starts with a digit and
          is not a number. In the measured corpus, the amount column is the only one where a numeric interpretation is correct,
          which is the normal situation and the reason the defaults are wrong more often than right.
        </P>
        <Callout tone="warn" title="The limits that no delimiter fixes">
          <P>
            Whatever character separates the fields, the workbook has 1,048,576 rows, 16,384 columns, 32,767 characters in a cell
            and 15 digits of numeric precision. A thousand-row table is nowhere near those ceilings, and a five-million-row export
            is past the first one before you have opened it. The format comparison is a rounding error against the question of
            whether the consumer can hold the data at all.
          </P>
        </Callout>
        <P>
          One hazard belongs specifically to the tab file, and it is counter-intuitive enough to be worth a paragraph. The
          spreadsheet formula-injection problem — a cell whose value begins with a character that makes the application evaluate
          it — has a prefix list that includes the equals sign, the plus, the minus and the at sign, and also the tab and the
          carriage return, because leading whitespace is skipped before the parser decides. So the character that delimits your
          fields is one of the characters that can arm a formula. Excel’s documented behaviour on re-saving also removes quotes and
          escape characters, which can reactivate a formula that was previously neutralised; anything that round-trips through a
          spreadsheet is a trust boundary you have re-opened, whichever delimiter you picked.
        </P>
        <P>
          The practical conclusion is narrow and reliable: if the recipient is a person with a spreadsheet, write the comma file
          and test it in the recipient’s locale, because the semicolon alternative is not a stylistic choice but a different
          program setting. If the recipient is a loader, the file name is irrelevant and the delimiter is a configuration value.
          If the file is going to be opened and saved, the discussion you should be having is about column types and precision, and
          that is the subject of <Rich text="[CSV vs Excel](/compare/csv-vs-excel/)" />.
        </P>
      </Section>

      <Section id="bytes" title="Gzip, not the delimiter, is the pipeline answer" kicker="The 368-byte result">
        <P>
          Take the two files from the first section and compress them, and the argument this page has been building changes
          shape. The comma file is 61,269 bytes and gzips to 18,306; the tab file is 59,105 and gzips to 17,938. The 2,164-byte
          advantage that quoting analysis produced so cleanly becomes 368 bytes, which is 2.0% of the compressed comma file
          instead of 3.5% of the raw one. Roughly five sixths of the delimiter’s benefit evaporates, because DEFLATE had already
          found the commas and their quotes and encoded them as repeated matches.
        </P>
        <DataTable
          caption="Raw against gzipped, same thousand rows"
          head={['File', 'Raw bytes', 'Gzipped bytes', 'Gzipped as % of raw', 'Reduction']}
          rows={[
            ['Comma delimited', '61,269', '18,306', '29.9%', '70.1%'],
            ['Tab delimited', '59,105', '17,938', '30.4%', '69.6%'],
            ['Difference', '2,164', '368', '—', '1,796 bytes of advantage lost'],
          ]}
          foot="Both ratios are computed from the four byte counts, not rounded from a guess. If you are shipping text over a network or storing it in an object bucket, the delimiter choice is worth 368 bytes per thousand rows and the compression choice is worth 42,963."
        />
        <P>
          Compression also changes the failure modes, and this is the part that is usually left out of the size argument. A
          truncated plain file is partly readable: you get every record before the cut, which is what makes a grid of rows the
          format of choice for exports and log shipping. A truncated gzip member is not readable as a stream that ends cleanly —
          you decompress what arrives and you discover the problem at the trailer, where RFC 1952 puts two checks: a CRC32 over the
          uncompressed data and ISIZE, the original size modulo 2 to the 32nd. Damage is detected rather than absorbed, which is
          the honest advantage and the one nobody puts in a comparison table. The header is small — ten bytes, ID1 and ID2 fixed at
          31 and 139, CM 8 for DEFLATE, then FLG, MTIME, XFL and OS — so the framing costs nothing against the checking it buys.
        </P>
        <P>
          There is a structural consequence as well, and it decides how a compressed export is laid out on disk. One gzip member
          is one DEFLATE stream, and a stream has to be decoded in order from its start, so a single compressed file offers no
          useful split point to a job that wants to read byte ranges in parallel. That is why engines write a directory of part
          files, each compressed on its own, and the framing price of that layout is eighteen bytes per member — ten of header,
          eight of trailer — which is nothing at any practical part size. The reason not to shard into millions of pieces is
          metadata and directory listings, not bytes.
        </P>
        <P>
          One limit from that trailer deserves to be known before you compress a large export. ISIZE is modulo 2 to the 32nd, so
          above 4,294,967,296 bytes of uncompressed input the field wraps and stops telling you anything useful: a payload of five
          gibibytes reports 1,073,741,824. The CRC still checks, so use it, and do not write an integrity test that compares
          ISIZE to a file size you expect.
        </P>
        <P>
          The engine view of this is consistent with the byte arithmetic. Spark’s CSV writer takes a <Rich text="compression" />{' '}
          option whose scope is write, and its reader takes the codec from the file name; the delimiter, meanwhile, is still{' '}
          <Rich text="sep" />, still defaulted to a comma, still yours to set. In other words: compress the text, and stop arguing
          about which single byte separates the fields, because that argument is 2% of a decision that is already 70% made.
        </P>
        <Callout tone="tip" title="What to do instead">
          <P>
            Pick the delimiter for the loader that reads it, then write the compressed file, then measure the thing that actually
            costs money. If the question is “how big is our export”, the answer is dominated by whether it is compressed at all, by
            how many bytes the quoting adds to free-text columns, and by whether one column can be dropped. The delimiter is fourth
            on that list, and it is fourth on every list you can build from these numbers.
          </P>
        </Callout>
      </Section>

      <Section id="decision" title="Which one, when" kicker="Recommendations">
        <P>
          There is a version of this comparison that ends “tabs for machines, commas for humans”, and it is a good mnemonic that
          happens to be incomplete: it is wrong about Hive, which wants neither, and it hides the three decisions that dominate
          the outcome. The honest recommendation is that the delimiter is a small decision, and the reason teams should write it
          down is to stop having it again, not because choosing correctly improves much.
        </P>
        <DataTable
          caption="Where each choice is defensible, with the reason attached"
          head={['Situation', 'Choose', 'Because']}
          rows={[
            ['A column can contain the other delimiter', 'The one that is absent from the data', 'Quoting cost is the only size difference, and the split trap is the only correctness difference'],
            ['Free text, logs, notes, pasted content', 'Tab', 'Commas appear in prose and tabs appear in paste, and 75 of 1,000 rows here contain at least one tab in a value'],
            ['Someone will double-click it', 'Comma, in the recipient locale', 'Excel decides by extension and regional settings, and a semicolon locale makes your comma file one column'],
            ['Bulk load into Postgres', 'Whatever the COPY statement says', 'Text format defaults to tab with backslash escapes; CSV format defaults to comma with doubled quotes'],
            ['Hive table over object storage', '\\001, as documented', 'A delimiter that cannot appear in text makes the naive split safe and the quoting rule unnecessary'],
            ['Spark job reading a directory of files', 'Set sep explicitly, always', 'The default is a comma and header is false, so an undeclared tab file becomes _c0 to _c4'],
            ['Interchange with consumers you have not met', 'Comma, quote all, UTF-8, CRLF, declared null token', 'It is the dialect the largest number of readers default to'],
          ]}
          foot="Seven situations, and the delimiter is the deciding factor in three of them. In the other four the load-bearing decisions are the header convention, the null token, the encoding and the escaping rule."
        />
        <P>
          The three that dominate are worth naming as a checklist, because they are the ones that produce silently wrong data.
          <strong> Quoting policy:</strong> quote nothing, quote what must be quoted, or quote everything. Quote-all is the
          defensive choice and costs two bytes per field on every row: on this corpus, on the order of the field count per record,
          it is the same order of size as the delimiter difference, which is the point — the two are comparably trivial, and the
          third option, “quote what the writer remembered to quote”, is the one that produces incidents.{' '}
          <strong>Encoding:</strong> UTF-8 with or without a byte order mark is a decision that changes what the bytes mean, which
          is strictly more consequential than which character ends a field. <strong>NULL representation:</strong> empty string,{' '}
          <Rich text="\N" />, the literal word NULL, or an absent field are four different values, and Postgres’s two formats pick
          two of them for the same column.
        </P>
        <P>
          Then the smaller list, which still belongs in a contract: the line terminator (CRLF against LF, and mixed endings that
          make a diff look like a rewrite), the header convention agreed between producer and consumer rather than assumed, whether
          spaces are trimmed even though the specification says they are data, whether the last record carries a line break, and
          what happens to a row whose field count disagrees. If you are choosing between the two formats for a migration, the
          workflow in <Rich text="[data migration](/use-cases/data-migration/)" /> is where those seven items get written down
          before the first load.
        </P>
        <P>
          For the specific question this page exists for: choose tabs when the data is text a person wrote, when you or your
          tools will split lines rather than parse them, and when the loader has been told. Choose commas when a spreadsheet is in
          the loop, when the consumer’s default is the comma and you would rather not configure it, and when your audience includes
          the RFC — literally, since RFC 4180 is the only one of the two documents. Choose neither when you control both ends and
          can afford to write the dialect in one place: then <Rich text="\001" /> is the option that makes the class of bug
          disappear instead of becoming rarer.
        </P>
        <Callout tone="note" title="The one-line version">
          <P>
            The delimiter decides how often you quote. The quoting rule decides whether your values survive. The encoding decides
            whether they mean anything. Write all three down in the loader, name the file accordingly and compress it.
          </P>
        </Callout>
      </Section>

      <Section id="commas" title="Where commas are still the right answer" kicker="And the landmine">
        <P>
          Tabs win the technical arguments assembled above, and commas remain the default for reasons that are mostly
          institutional and one of which is a genuine hazard. Four of the engines on this page default to the comma: Spark’s{' '}
          <Rich text="sep" />, Postgres in CSV format, the RFC itself, and whatever tool you have never configured. The comma is
          also the character a spreadsheet on an English installation splits on, and it is what the web means by{' '}
          <Rich text="text/csv" />. If the file has to be intelligible to software you do not control, the comma is the
          conservative choice and conservatism is a legitimate engineering value.
        </P>
        <P>
          The hazard is that CSV is not one dialect in the spreadsheet world. On a machine whose list separator is a semicolon —
          the default across much of Europe, because the comma is already the decimal separator — a comma file opens as one column
          and a semicolon file opens correctly, and the extension is identical for both. So “send a CSV” does not specify the
          bytes, and there is no place in the file to put the answer. RFC 4180 §3 registers the media type with two optional
          parameters, charset and header, and the registration carries no delimiter parameter. A semicolon file has no way of
          announcing itself except by being opened and failing.
        </P>
        <P>
          That is the strongest argument for tabs, and it is an argument about ambiguity rather than about parsing: tab is tab on
          every keyboard and in every locale, and a producer cannot accidentally change it by shipping from a German laptop. It is
          worth stating plainly because it is rarely on the lists. Everything else about commas — the quoting cost, the sniffing
          risk, the split failure — is a cost you pay knowingly, and the measured corpus puts a number on it: 1,082 cells needing
          quoting, 2,164 bytes, 368 of them after gzip.
        </P>
        <P>
          Two further places where commas are simply correct. The first is paste-forward: a column of text from a comma file
          lands in a spreadsheet cell the way people expect, whereas a tab-delimited value pasted into a sheet splits across cells
          before the quoting rules can save it, which is how a tab from a log line becomes two columns and a wrong report. The
          second is the ecosystem of small tools, dashboards and reporting UIs that accept an upload and default to the comma;
          against those, choosing tabs means choosing a configuration step in every one of them, and a configuration step is a
          support ticket.
        </P>
        <CodeBlock
          title="the same table, three dialects, one contract line each"
          language="text"
          code={'out.csv   : delimiter=,    quote=all     encoding=UTF-8  null=empty  header=present  endings=CRLF  gzip\nout.tsv   : delimiter=\\t   quote=minimal encoding=UTF-8  null=\\N    header=present  endings=LF    gzip\nwarehouse : delimiter=\\001 quote=none    encoding=UTF-8  null=\\N    header=absent   endings=LF    gzip'}
          caption="Six decisions per file, and the delimiter is one of them. The contract line is the deliverable: the file name carries the delimiter, and the line next to it carries the five that actually corrupt data."
        />
        <P>
          So the closing position is not a winner. It is that the delimiter is a small, writable-down decision, that tabs buy
          you 3.5% of size and 73% of the quoting events and nothing else, that they buy you a naive split only when you have
          proven the tab absent, and that they cost you the double-click. If you take one instruction from these measurements,
          take the audit rather than the format: count the cells that would need quoting under each candidate in your own corpus,
          count the rows where each candidate disagrees with the header, and let those two numbers choose. On a table of text, tabs
          win. On a table of numbers with no prose, both files are the same size, the split is safe either way, and the comma is
          the one your colleagues can open — which is a completely sufficient reason, and a much better one than a habit.
        </P>
      </Section>
    </>
  )
}
