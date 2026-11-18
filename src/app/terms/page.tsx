import type { Metadata } from 'next'
import { Callout, DataTable, H3, P, Prose, Section } from '@/components/content'
import { SitePageShell } from '@/components/layout/SitePageShell'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { formatDate } from '@/lib/utils'

const PATH = '/terms/'
const UPDATED = '2026-11-18'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service - Rules for Using FmtTools',
  description:
    'The terms attached to using FmtTools: what the free tools license you to do, what they do not warrant, who owns the text you paste, and how specification names are referenced.',
  path: PATH,
  keywords: ['terms of service', 'free developer tools licence', 'client-side tool disclaimer', 'no warranty converter'],
  modifiedTime: UPDATED,
  publishedTime: UPDATED,
})

const TOC = [
  { id: 'agreement', label: 'What you are agreeing to' },
  { id: 'licence', label: 'Licence to use the tools' },
  { id: 'your-data', label: 'Your input stays yours' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'warranty', label: 'What the tools do and do not promise' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'ip', label: 'Names, specifications and content' },
  { id: 'availability', label: 'Availability and changes' },
  { id: 'contact', label: 'Contact and governing terms' },
]

export default function Terms() {
  return (
    <SitePageShell
      kicker="Site policy"
      h1="Terms of Service"
      path={PATH}
      updated={UPDATED}
      description="The terms attached to using FmtTools: what the free tools license you to do, what they do not warrant, and who owns the text you paste."
      lead="These terms are written for what this site actually is: a set of free, static, browser-resident converters and technical references. Because the service never receives your data, several clauses you expect in a SaaS agreement are deliberately absent, and a few unusual ones replace them."
      toc={TOC}
    >
      <Prose>
        <Section id="agreement" title="What you are agreeing to" kicker="Scope" className="border-t-0 pt-0">
          <P>
            By loading a page on <code>fmttools.com</code> you accept these terms. If you are using the tools on behalf of an
            employer, using them means your organisation accepts them too. There is no account, no click-through and no signature: the
            agreement is between you (or your organisation) and the operator of this site, and it takes effect at the moment a
            converter runs in your browser.
          </P>
          <P>
            The price of admission is zero. That is a genuine term, not a marketing line: no feature is gated behind a signup, no tool
            output is truncated for unpaying visitors, and nothing here is a trial with a clock running.
          </P>
        </Section>

        <Section id="licence" title="Licence to use the tools" kicker="What you may do">
          <P>
            You may use every converter and reference on this site for personal, educational, internal and commercial work without
            asking, without attribution and without a licence fee. Specifically:
          </P>
          <ul>
            <li>Formatting, validating, converting, minifying or repairing your data in a browser tab, then shipping the result anywhere.</li>
            <li>
              Quoting the guides and comparisons in documentation, talks, blog posts and internal training, with a link back being
              appreciated but not required.
            </li>
            <li>Using the published specification documents referenced here under the terms of their own standards bodies.</li>
          </ul>
          <DataTable
            head={['You want to', 'Permitted?', 'Condition']}
            rows={[
              ['Convert production data with a tool', 'Yes', 'Nothing. The data never reaches us, so there is nothing for us to licence.'],
              ['Ship output into a commercial product', 'Yes', 'The result is yours; no royalty, no credit clause.'],
              ['Mirror the site as your own tool page', 'No', 'Rehosting the converters or the guides wholesale competes with the source rather than citing it.'],
              ['Scrape the guides into an AI training set or a content farm', 'No', 'Bulk automated collection of the written material is not licensed, even though reading it is.'],
              ['Embed a link to a tool in your own docs or app', 'Yes', 'Plain links are always fine and welcome.'],
            ]}
          />
        </Section>

        <Section id="your-data" title="Your input stays yours" kicker="Ownership">
          <P>
            You keep all rights to whatever you paste, upload to your own disk, or download from a tool. Because the processing happens
            locally, the operator neither receives nor could receive a copy, and therefore claims nothing over it: no licence grant, no
            right to store, no right to train on it. The clipboard and file-download paths write only to your machine.
          </P>
          <P>
            The corollary is equally important and stated plainly: since we never hold your data, we cannot restore it, correct it, or
            produce it for anyone. Nothing on this site is a backup. Keep your originals.
          </P>
        </Section>

        <Section id="acceptable-use" title="Acceptable use" kicker="Restrictions">
          <P>
            The list is short, because a static site offers very little surface to abuse:
          </P>
          <ul>
            <li>Do not hammer the host with automated requests in a way that degrades service for other visitors.</li>
            <li>Do not present content from this site as your own work, or as an official product of IETF, W3C or the YAML project.</li>
            <li>Do not use the site&apos;s name or logo to imply endorsement of a product, service or dataset.</li>
            <li>Do not attempt to bypass client-side limits or probe the infrastructure for weaknesses without telling us first.</li>
          </ul>
          <Callout tone="warn" title="Compliance stays with you">
            <P>
              If the text you paste is subject to a regulation, a contract or a classification scheme, that obligation travels with the
              data and is not discharged by processing it locally. A tool that keeps your payload on your machine helps with some
              reviews and excuses none of them.
            </P>
          </Callout>
        </Section>

        <Section id="warranty" title="What the tools do and do not promise" kicker="Warranty disclaimer">
          <P>
            The converters implement published rules: JSON follows RFC 8259 and ECMA-404, CSV follows RFC 4180 with the delimiter,
            quoting and header choices each tool documents, Base64 follows RFC 4648 including base64url, and percent-encoding follows
            RFC 3986. The guides cite the clause they describe. That is a description of intent, not a warranty.
          </P>
          <H3>The specific limits worth knowing</H3>
          <ul>
            <li>
              <strong>Lenient modes change your bytes.</strong> JSON repair makes a documented set of guesses to turn broken input into
              parseable JSON. It is a recovery aid, not a normaliser, and repaired output is not equivalent to the original document.
            </li>
            <li>
              <strong>Type inference is a judgement.</strong> CSV to JSON and YAML to JSON choose a type for an unquoted token using
              rules stated on the page. Another parser may choose differently; for contracts, declare the schema instead of relying on
              inference.
            </li>
            <li>
              <strong>Precision and size have ceilings.</strong> Numbers beyond IEEE-754 double precision, and files large enough to
              exhaust the tab&apos;s memory, fail or change value. The guides give the working ranges.
            </li>
            <li>
              <strong>Nothing here is certified.</strong> No ISO/SOC attestation, no accessibility conformance statement beyond the
              keyboard and screen-reader behaviour the interface implements, and no service-level agreement.
            </li>
          </ul>
          <P>
            THE SERVICE, INCLUDING EVERY TOOL, GUIDE AND DOWNLOAD, IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
            WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND
            NON-INFRINGEMENT. YOU ARE RESPONSIBLE FOR VERIFYING OUTPUT BEFORE RELYING ON IT.
          </P>
        </Section>

        <Section id="liability" title="Limitation of liability" kicker="Risk allocation">
          <P>
            To the maximum extent permitted by law, the operator is not liable for indirect, incidental, special, consequential or
            punitive loss — including lost data, lost profits, business interruption, or loss of goodwill — arising from use of, or
            inability to use, this site, even if the cause was a defect in a converter. Your sole remedy for dissatisfaction is to stop
            using the site. If a converter corrupts data you supplied, the mitigation is structural rather than legal: the input was
            never leaving your machine, so the failure is recoverable from your own copy.
          </P>
        </Section>

        <Section id="ip" title="Names, specifications and content" kicker="Intellectual property">
          <P>
            &quot;JSON&quot;, &quot;YAML&quot;, &quot;XML&quot; and &quot;Base64&quot; are names of formats owned or maintained by their
            respective communities; &quot;RFC&quot; documents belong to the IETF; the XML recommendations belong to W3C. They are used
            here descriptively, to say which rules a tool implements. Nothing on this site implies that those organisations publish,
            endorse or review it.
          </P>
          <ul>
            <li>The written guides, comparisons and interface copy on this site are the operator&apos;s work.</li>
            <li>The specification texts themselves remain with their authors; this site links to them rather than reproducing them.</li>
            <li>Third-party product names mentioned in the material belong to their owners and are used for identification only.</li>
          </ul>
        </Section>

        <Section id="availability" title="Availability and changes" kicker="Continuity">
          <P>
            The site runs on shared hosting and has no redundancy contract, so availability is offered best-effort. A tool may be
            renamed, merged, or removed when a better implementation replaces it; removed tools are usually folded into another page
            rather than deleted outright, but no page is promised forever. Materially different behaviour in a converter is documented
            on that tool&apos;s page and, where it matters, in the relevant guide.
          </P>
          <P>
            These terms may be revised as the site changes. The revision date at the top of this page is the only notice; continuing to
            use the site after a change means the new version applies. The version in force is dated {formatDate(UPDATED)}.
          </P>
        </Section>

        <Section id="contact" title="Contact and governing terms" kicker="Getting in touch">
          <P>
            Requests about licensing the written material, reports of a converter producing wrong output, and questions about how these
            terms interact with your own compliance obligations go to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, or through the
            <a href="/contact/"> contact page</a>. Include the tool, the input shape and what you expected, and you will get a real
            answer rather than a policy citation.
          </P>
          <P>
            Data handling is described separately in the <a href="/cookie-policy/">cookie policy</a>, which is part of these terms. If a
            provision here turns out to be unenforceable, the remainder stays in effect.
          </P>
        </Section>
      </Prose>
    </SitePageShell>
  )
}
