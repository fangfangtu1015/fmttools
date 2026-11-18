import type { Metadata } from 'next'
import { Callout, DataTable, H3, P, Prose, Section } from '@/components/content'
import { SitePageShell } from '@/components/layout/SitePageShell'
import { buildMetadata } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { formatDate } from '@/lib/utils'

const PATH = '/cookie-policy/'
const UPDATED = '2026-11-18'

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy - What FmtTools Stores in Your Browser',
  description:
    'FmtTools sets no cookies and loads no tracking scripts. The exact storage this site touches, what the hosting server logs, and how to change or clear your consent.',
  path: PATH,
  keywords: ['cookie policy', 'no cookie tracking', 'browser local storage', 'static site server logs'],
  modifiedTime: UPDATED,
  publishedTime: UPDATED,
})

const TOC = [
  { id: 'inventory', label: 'Everything this site stores' },
  { id: 'categories', label: 'Cookie categories, and which apply' },
  { id: 'consent', label: 'Why there is a banner at all' },
  { id: 'request-path', label: 'What leaves your machine, and when' },
  { id: 'hosting', label: 'Hosting, logs and retention' },
  { id: 'third-parties', label: 'Third-party services' },
  { id: 'control', label: 'Changing or clearing your choices' },
  { id: 'changes', label: 'Changes and contact' },
]

export default function CookiePolicy() {
  return (
    <SitePageShell
      kicker="Site policy"
      h1="Cookie Policy"
      path={PATH}
      updated={UPDATED}
      description="FmtTools sets no cookies and loads no tracking scripts. The exact storage this site touches, what the hosting server logs, and how to change your consent."
      lead="Short version: this site does not set cookies. Not first-party, not third-party, not analytics, not advertising. The one thing it writes to your browser is a single local-storage key that records your answer to the consent prompt. Everything below is the full inventory, plus what the web server still sees when it serves you a page."
      toc={TOC}
    >
      <Prose>
        <Section id="inventory" title="Everything this site stores" kicker="The inventory" className="border-t-0 pt-0">
          <P>
            These are the only storage mechanisms <code>fmttools.com</code> uses. There is no service worker, no offline application
            cache, no IndexedDB database and no Web SQL store, so nothing else is written on your device beyond the ordinary HTTP
            cache your browser maintains for every site you visit.
          </P>
          <DataTable
            caption="Complete storage inventory for fmttools.com as of November 18, 2026"
            head={['Mechanism', 'Name', 'Purpose', 'Lifetime']}
            rows={[
              ['First-party cookies', '—', 'Not used. Nothing on this site reads or writes `document.cookie`.', '—'],
              ['Third-party cookies', '—', 'Not used. No embedded frames, tags or pixels exist to set them.', '—'],
              [
                'Local storage',
                '`fmttools-cookie-consent`',
                'Remembers whether you chose `allow optional` or `necessary only` in the consent prompt, so the prompt does not reopen on every page.',
                'Until you clear site data or reset it from the footer',
              ],
              [
                'Session storage',
                '—',
                'Not used.',
                '—',
              ],
              ['IndexedDB / Web SQL', '—', 'Not used.', '—'],
              [
                'HTTP cache',
                'Page, script, CSS and image files',
                'Your browser re-fetches nothing it already holds. This is a performance mechanism controlled by your browser, not a tracking identifier: it holds no user-specific value.',
                'Governed by the cache headers your browser receives',
              ],
            ]}
          />
          <Callout tone="note" title="Removed in November 2026">
            <P>
              Until 18 November 2026 this site also wrote <code>fmttools-ui-locale</code> to local storage and as a cookie, because
              the header carried an interface-label language switcher. That switcher and both storage writes have been deleted. If the
              key is still on your device from an earlier visit, it is inert and can be cleared like any other site data.
            </P>
          </Callout>
        </Section>

        <Section id="categories" title="Cookie categories, and which apply" kicker="Classification">
          <P>
            Consent frameworks group storage into categories. Here is what each one would cover on a site like this, and the honest
            status of each:
          </P>
          <DataTable
            head={['Category', 'What it would cover here', 'Status']}
            rows={[
              ['Strictly necessary', 'Storage without which the page cannot function: a session on a login site, a load-balancer affinity cookie.', 'None needed. There is no login, no cart and no server-side session.'],
              ['Preferences / functionality', 'Choices that personalise the interface: language, theme, panel layout.', 'One local-storage key for your consent choice, written only after you click. Nothing else.'],
              ['Analytics', 'Measuring page views and conversion, e.g. Google Analytics, Plausible, Fathom.', 'Not used. No measurement ID, tag or script is loaded.'],
              ['Advertising / marketing', 'Ad targeting, frequency capping, attribution; typically third-party.', 'Not used. No ad network, no affiliate redirects, no social pixel.'],
              ['Cross-site tracking', 'Any identifier readable by more than one domain.', 'Not used, and not possible while the site ships no third-party requests.'],
            ]}
          />
        </Section>

        <Section id="consent" title="Why there is a banner at all" kicker="The apparent contradiction">
          <P>
            A cookie banner on a site that sets no cookies looks like boilerplate copied from a competitor. It is here for two
            specific reasons:
          </P>
          <ul>
            <li>
              <strong>Your choice is recorded before anything could change.</strong> Regulations such as the EU ePrivacy Directive and
              the GDPR require consent to be captured before non-essential storage is written. Storing that preference now means that
              if an analytics or advertising service is ever added, the switch is gated by a decision you already made rather than
              retrofitted after the fact.
            </li>
            <li>
              <strong>The two options behave identically today, and we say so.</strong> Choosing <em>Allow optional</em> enables
              nothing, because there is no optional service to enable. Clicking it writes one local-storage key and closes the prompt.
            </li>
          </ul>
          <P>
            The legal basis for that single key is consent (GDPR Article 6(1)(a)); the basis for serving you the page itself is
            performance of a request you made (Article 6(1)(b)). Under Article 7(3) you can withdraw consent at any time using the
            controls below, and withdrawal does not affect what was already lawful.
          </P>
        </Section>

        <Section id="request-path" title="What leaves your machine, and when" kicker="Data flow">
          <P>
            Every converter on this site — JSON formatter, validator, minifier, CSV to JSON, JSON to CSV, JSON to YAML, YAML to JSON,
            Base64, URL encoder — parses and rewrites text inside your browser tab using JavaScript that was downloaded once. Your
            input never becomes a request body. There is no upload endpoint to send it to, no account system to attach it to, and the
            result is handed back to you as a Blob download generated locally.
          </P>
          <H3>The requests your browser does make</H3>
          <P>
            Loading a page sends an ordinary HTTP request for that document plus its CSS, JavaScript and images. That request carries
            a destination URL, and the server learns what any web server learns: see the next section. Navigating between pages
            produces one such request each. Typing in a tool, formatting, converting, downloading a result and copying to the
            clipboard produce zero requests.
          </P>
          <Callout tone="warn" title="If you paste a secret anyway">
            <P>
              Client-side processing means your payload is not transmitted, but it is still held in your browser&apos;s memory and in
              your clipboard history, and it can end up in your browser&apos;s session restore data. That is a property of your
              machine, not of this site, and it is the reason the converters work offline once loaded.
            </P>
          </Callout>
        </Section>

        <Section id="hosting" title="Hosting, logs and retention" kicker="What the server sees">
          <P>
            Pages and assets are served as static files from shared hosting with a reverse proxy in front. That infrastructure writes
            the conventional web-server access log for each request: timestamp, request line (method, path, protocol), HTTP status,
            response size, <code>Referer</code> and <code>User-Agent</code> headers, and the client IP address. Aggregate traffic
            reporting is derived from those files.
          </P>
          <P>
            We do not add our own logging layer, and the application has no database, queue or request handler that could receive
            submitted content. Log retention follows the hosting control panel&apos;s rotation settings; the practical consequence is
            that a log line outlives a page view but not indefinitely. If you want even that, reach us at the address below and we
            will confirm the current rotation window.
          </P>
        </Section>

        <Section id="third-parties" title="Third-party services" kicker="None embedded">
          <P>
            No fonts, scripts, stylesheets, images or iframes are fetched from another domain. The interface uses your operating
            system&apos;s own font stack, all artwork is served from this origin, and the only external URLs on the site are plain
            links you choose to click — the specification documents in the footer (IETF, W3C, yaml.org) and the reference links
            inside the guides.
          </P>
          <P>
            Once you click one of those links you are on that organisation&apos;s site under its own policy, and your browser sends it
            the usual headers and <code>Referer</code>. That transfer is started by your click, not by anything embedded here.
          </P>
        </Section>

        <Section id="control" title="Changing or clearing your choices" kicker="Your side of it">
          <ul>
            <li>
              <strong>Change your mind.</strong> Use <em>Cookie settings</em> in the footer of any page. The prompt reopens with your
              current choice shown, and saving replaces it.
            </li>
            <li>
              <strong>Delete it outright.</strong> Your browser&apos;s site-data controls for <code>fmttools.com</code> remove the
              key, or send us a request and there is nothing on our side to delete, because the choice never leaves your device.
            </li>
            <li>
              <strong>Block it in advance.</strong> Private-browsing modes and storage-blocking extensions will prevent the key from
              being written. The consequence is only that the prompt reappears on each page load; no feature depends on it.
            </li>
          </ul>
        </Section>

        <Section id="changes" title="Changes and contact" kicker="Keeping this accurate">
          <P>
            If this site ever starts setting a cookie or loading a third-party service, this page is rewritten first: the inventory
            table gains the real name, purpose and lifetime of each entry, and the effective date at the top changes. The version above
            describes the code as deployed on {formatDate(UPDATED)}.
          </P>
          <P>
            Questions about any of this, or a request to confirm the log-retention window, go to{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, or use the form on the{' '}
            <a href="/contact/">contact page</a>.
          </P>
        </Section>
      </Prose>
    </SitePageShell>
  )
}
