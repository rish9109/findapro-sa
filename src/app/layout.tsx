// File: src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'
import LoadingWrapper from '@/components/LoadingWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop'

// ── PWA components ───────────────────────────────────────────────
import InstallPrompt from '@/components/InstallPrompt'
import UpdatePrompt from '@/components/UpdatePrompt'

const inter = Inter({ subsets: ['latin'] })

// ── Viewport config (removes all deprecation warnings)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#111827',
}

export const metadata: Metadata = {
  title: 'FindAPro - Find Trusted Service Providers in South Africa',
  description:
    'Connect with verified professionals for home services, repairs, maintenance, and more across South Africa',

  // ── PWA / Manifest ─────────────────────────────────────────────
  manifest: '/manifest.webmanifest',

  // iOS Safari home screen support
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FindAPro',
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
        {/* iOS home screen icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
      </head>

      <body className={inter.className}>
        <InstallPrompt />
        <UpdatePrompt />

        <ErrorBoundary>
          <AuthProvider>
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