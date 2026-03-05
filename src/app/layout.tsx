// File: src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'
import LoadingWrapper from '@/components/LoadingWrapper'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop'

// ── PWA components ───────────────────────────────────────────────
import InstallPrompt from '@/components/InstallPrompt'

// ── Samsung Internet notice ─────────────────────────────────────
import SamsungBrowserNotice from '@/components/SamsungBrowserNotice'

const inter = Inter({ subsets: ['latin'] })

// ── Viewport config (this generates the correct <meta> tags)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0b0f',           // status bar, address bar, etc.
}

export const metadata: Metadata = {
  title: 'Find A Pro Connect (PTY) LTD',
  description:
    'Your go-to directory for verified professionals across Mzansi. Community-focused. Trust guaranteed. 🇿🇦',

  // ── PWA / Manifest ─────────────────────────────────────────────
  manifest: '/manifest.webmanifest',

  // iOS Safari home screen support
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // try 'black' if translucent stops working in newer iOS
    title: 'Find A Pro',
  },
}

// ────────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{}>
}) {
  return (
    <html lang="en">
      <head>
        {/* iOS home screen icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />

        {/* Strong signal: this site only supports dark mode */}
        <meta name="color-scheme" content="dark only" />
      </head>

      <body className={inter.className}>
        <SamsungBrowserNotice /> {/* ← This one doesn't need auth, so it's fine outside */}

        <ErrorBoundary>
          <AuthProvider>
            <InstallPrompt /> {/* ← MOVED INSIDE AuthProvider */}
            <LoadingWrapper>
              <ScrollToTop />
              <Header />
              <AuthModal />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </LoadingWrapper>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}