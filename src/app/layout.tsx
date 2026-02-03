// File: src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'
import LoadingWrapper from '@/components/LoadingWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop' // <-- NEW COMPONENT

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FindAPro - Find Trusted Service Providers in South Africa',
  description: 'Connect with verified professionals for home services, repairs, maintenance, and more across South Africa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <LoadingWrapper>
              <ScrollToTop /> {/* <-- ADD THIS LINE */}
              <Header />
              <AuthModal />
              <main className="min-h-screen">
                {children}
              </main>
            </LoadingWrapper>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}