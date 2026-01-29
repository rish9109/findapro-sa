// File: src/app/admin/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      // Check if user is admin (no auto-insert, just check)
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single()

      // If error, just log it but don't try to insert
      if (error) {
        console.log('Admin check error:', error.message)
        console.log('User needs to be manually added to admin_users table')
        router.push('/admin/login?error=not_admin')
        return
      }

      if (!admin) {
        console.log('User not found in admin_users table')
        router.push('/admin/login?error=not_admin')
        return
      }

      setUser(admin)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Checking admin access...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
      {/* Admin Header */}
      <nav className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Menu */}
            <div className="flex items-center space-x-6 md:space-x-8">
              <Link href="/admin" className="text-xl font-bold text-white flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="hidden sm:inline">FindAPro Admin</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/admin" 
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/pending" 
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors"
                >
                  Pending Reviews
                </Link>
              </div>
            </div>
            
            {/* User Info and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                <span className="font-medium text-white">{user?.name}</span>
                <span className="hidden lg:inline ml-2">({user?.email})</span>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <div className="pb-3 mb-3 border-b border-gray-700">
                <div className="text-sm text-gray-400">
                  <div className="font-medium text-white">{user?.name}</div>
                  <div className="text-xs">{user?.email}</div>
                </div>
              </div>
              
              <Link 
                href="/admin" 
                className="block text-gray-300 hover:text-white hover:bg-gray-700/50 px-3 py-2.5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/pending" 
                className="block text-gray-300 hover:text-white hover:bg-gray-700/50 px-3 py-2.5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pending Reviews
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm space-y-2">
            <p className="font-medium text-gray-400">FindAPro Admin Dashboard • {new Date().getFullYear()}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Restricted Access</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>All actions are logged</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}