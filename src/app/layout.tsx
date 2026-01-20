// File: src/app/layout.tsx (you need to create or update this)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'

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
        <AuthProvider>
          <Header />
          <AuthModal />
          <main className="min-h-screen">
            {children}
          </main>
          {/* You might want to add a Footer component here */}
        </AuthProvider>
      </body>
    </html>
  )
}