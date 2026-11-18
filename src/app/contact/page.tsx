import type { Metadata } from 'next'
import { Callout, DataTable, P, Prose, Section } from '@/components/content'
import { ContactForm } from '@/components/contact/ContactForm'
import { SitePageShell } from '@/components/layout/SitePageShell'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/site'

const PATH = '/contact/'
const UPDATED = '2026-11-18'

export const metadata: Metadata = buildMetadata({
  title: 'Contact FmtTools - Report a Bug or Ask About a Format',
  description:
    'Reach the people who maintain FmtTools: tool defects, corrections to the guides, licensing questions and policy requests, with the details that make a report actionable.',
  path: PATH,
  keywords: ['contact fmttools', 'report converter bug', 'request a format tool', 'site feedback'],
  modifiedTime: UPDATED,
  publishedTime: UPDATED,
})

const TOC = [
  { id: 'write', label: 'Write to us' },
  { id: 'routing', label: 'Where each request belongs' },
  { id: 'useful-report', label: 'What makes a report actionable' },
  { id: 'no-server', label: 'Why there is no contact form backend' },
  { id: 'limits', label: 'What we cannot do' },
  { id: 'corrections', label: 'How corrections are handled' },
]

export default function Contact() {
  return (
    <SitePageShell
      kicker="Site policy"
      h1="Contact"
      path={PATH}
      updated={UPDATED}
      description="Reach the maintainers of FmtTools: tool defects, corrections to the guides, licensing questions and policy requests."
      lead="One address reaches everyone who works on this site, and the converters run in your browser, so the useful thing to send is a description of the input rather than the input itself. Everything below explains what a good report looks like and what happens after you file one."
      toc={TOC}
      schemaType="ContactPage"
    >
      <Prose>
        <Section id="write" title="Write to us" kicker="The form" className="border-t-0 pt-0">
          <P>
            Pick a topic and draft the message; the button hands it to your own mail client with the subject line already set. Nothing
            is transmitted, stored or queued by this site on the way, because there is no backend that could do it.
          </P>
          <ContactForm />
        </Section>

        <Section id="routing" title="Where each request belongs" kicker="Topics">
          <P>
            All five topics arrive at the same inbox and get handled by whoever maintains the relevant part of the site. The prefix in
            the subject line is what sorts them.
          </P>
          <DataTable
            head={['Topic', 'Subject prefix', 'Who reads it', 'What happens next']}
            rows={[
              ['A tool produced wrong output', '`[Tool issue]`', 'The maintainer of that converter', 'A reproduction is built from your description, then the fix ships with the next deploy'],
              ['A guide or comparison is inaccurate', '`[Correction]`', 'Whoever wrote the page, against the cited clause', 'Checked against the specification clause, not another blog post'],
              ['A converter or format is missing', '`[Feature request]`', 'Backlog owner', 'An honest yes or no, rather than an open-ended maybe'],
              ['Licensing or reuse of the written material', '`[Licensing enquiry]`', 'Site operator', 'Scope of reuse answered in writing before anything is republished'],
              ['Cookies, data handling, policy questions', '`[Policy question]`', 'Site operator', 'Answered from the policy pages, and those pages get rewritten if the answer is not there'],
            ]}
          />
        </Section>

        <Section id="useful-report" title="What makes a report actionable" kicker="Bug reports">
          <P>
            A converter failing on one document and failing on all documents are different bugs with very different fix costs, and the
            only way to tell them apart is the reproduction. Include:
          </P>
          <ul>
            <li>The page URL, so the right tool is obvious (several formats share a name across categories).</li>
            <li>What you pasted — its shape and the offending construct, not the file. Ten lines that trigger it beats ten megabytes.</li>
            <li>What came back, and what you expected instead. &quot;It threw&quot; is a start; the error text quoted from the panel is better.</li>
            <li>Which browser and version, and whether the input came from another tool, a database export, or a spreadsheet.</li>
            <li>For size or precision complaints: the payload size and the largest number or longest string involved.</li>
          </ul>
          <Callout tone="risk" title="Do not send the payload itself">
            <P>
              If the data is production traffic, a customer export or anything covered by a contract, send a synthetic reproduction that
              shows the same structure. The reason this site keeps your input on your machine stops applying the moment you email it to
              us, and a bug never needs real values to be reproducible.
            </P>
          </Callout>
        </Section>

        <Section id="no-server" title="Why there is no contact form backend" kicker="Architecture">
          <P>
            Every page here is a static file and every tool is JavaScript that runs in the tab. There is no application server, no
            database and no inbound endpoint, which means a conventional &quot;send&quot; button would have to talk to something that
            does not exist. Adding one would put a form handler, a datastore and a retention problem in front of a site whose privacy
            position is that it receives nothing.
          </P>
          <P>
            The consequence for you is small: the message sits in your draft folder until your mail app sends it, and the thread lives
            in your mailbox rather than a ticket system you would have to log into later.
          </P>
        </Section>

        <Section id="limits" title="What we cannot do" kicker="Boundaries">
          <ul>
            <li>
              <strong>Recover your data.</strong> Nothing you convert reaches us, so nothing can be returned. Backups stay your side of
              the line.
            </li>
            <li>
              <strong>Give a response-time guarantee.</strong> There is no support contract, no SLA and no phone queue. Mail is read on
              working days and answered by whoever maintains the affected page.
            </li>
            <li>
              <strong>Sign compliance paperwork on request.</strong> No ISO or SOC attestation exists, and there is no processing
              agreement to sign, because no processing happens on our infrastructure.
            </li>
            <li>
              <strong>Debug your file remotely.</strong> Without seeing the input — which you should not send — the useful output is a
              minimal reproduction from you plus the rules the guide cites.
            </li>
          </ul>
        </Section>

        <Section id="corrections" title="How corrections are handled" kicker="After you write">
          <P>
            A confirmed error in a guide is fixed against the specification clause rather than against another blog post, the source
            list on that page gains or repairs the citation, and the page&apos;s <em>Updated</em> date moves. When a converter changes
            behaviour in a way that could alter output, the tool page says so in the same pass. If you reported it, you get the answer in
            the thread you started.
          </P>
          <P>
            Policy and data questions are answered from the <a href="/cookie-policy/">cookie policy</a>; the{' '}
            <a href="/terms/">terms of service</a> cover what the tools license you to do. The address for anything the pages do not
            settle is <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </P>
        </Section>
      </Prose>
    </SitePageShell>
  )
}
