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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Checking admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-blue-600">
                FindAPro Admin
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/admin/pending" className="text-gray-700 hover:text-blue-600">
                  Pending Reviews
                </Link>
                <Link href="/admin/providers" className="text-gray-700 hover:text-blue-600">
                  All Providers
                </Link>
                <Link href="/admin/analytics" className="text-gray-700 hover:text-blue-600">
                  Analytics
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.email})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-t">
        <div className="flex space-x-4 p-4 overflow-x-auto">
          <Link href="/admin" className="whitespace-nowrap text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/admin/pending" className="whitespace-nowrap text-gray-700 hover:text-blue-600">
            Pending
          </Link>
          <Link href="/admin/providers" className="whitespace-nowrap text-gray-700 hover:text-blue-600">
            Providers
          </Link>
          <Link href="/admin/analytics" className="whitespace-nowrap text-gray-700 hover:text-blue-600">
            Analytics
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>FindAPro Admin Dashboard • {new Date().getFullYear()}</p>
          <p className="mt-1">Restricted Access • All actions are logged</p>
        </div>
      </footer>
    </div>
  )
}