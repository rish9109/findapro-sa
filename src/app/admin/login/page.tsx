// File: src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
  
      if (authError) throw authError
  
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()
  
      if (!admin) {
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            name: 'Admin',
            role: 'admin'
          })
          .select()

        if (insertError) {
          console.log('Could not add user to admin table:', insertError.message)
        }
      }
  
      window.location.href = '/admin'
  
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            FindAPro Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Restricted access to authorized personnel only
          </p>
        </div>

        <div className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-xl py-8 px-6 sm:px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 block w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                placeholder="admin@findapro.co.za"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 block w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in to Admin Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Use admin credentials provided
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having trouble? Ensure your email is in the admin_users table.
          </p>
        </div>
      </div>
    </div>
  )
}