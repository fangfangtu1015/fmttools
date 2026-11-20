import * as React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Footer, Header } from '@/components/layout/chrome'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: 'Free Online Developer Tools - JSON, CSV, Base64 Converter | FmtTools',
  description:
    'Free online data format converters: JSON, CSV, YAML and Base64. Convert, validate and format in your browser. No signup, works in browser, privacy-safe.',
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: SITE.url },
  manifest: '/site.webmanifest',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [
      { url: '/images/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MSVF6B94"></script>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());",
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
