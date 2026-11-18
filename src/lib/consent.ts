export type ConsentChoice = 'all' | 'necessary'

export const CONSENT_KEY = 'fmttools-cookie-consent'

/** Footer "Cookie settings" asks the mounted banner to re-open through this event. */
export const CONSENT_EVENT = 'fmttools:consent'

export function readConsent(): ConsentChoice | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    return stored === 'all' || stored === 'necessary' ? stored : null
  } catch {
    /* storage disabled (private mode): treat as undecided, so the prompt is honest */
    return null
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice)
  } catch {
    /* the choice still applies to this page view */
  }
}

export function openConsentDialog() {
  window.dispatchEvent(new Event(CONSENT_EVENT))
}
