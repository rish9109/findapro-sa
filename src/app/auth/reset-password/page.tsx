// File: src/app/auth/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Shield, Lock, Sparkles, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [session, setSession] = useState<any>(null)
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/')
      } else {
        setSession(data.session)
      }
    }
    checkSession()
  }, [router])

  // Validate password as user types
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [password])

  // Check if passwords match
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Check if all password requirements are met
    const allChecksMet = Object.values(passwordChecks).every(check => check)
    if (!allChecksMet) {
      setError('Please meet all password requirements')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || 'Failed to update password')
      } else {
        setSuccess('Password updated successfully!')
        setPassword('')
        setConfirmPassword('')
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Set New Password
                </h2>
                <p className="text-gray-400 text-sm">
                  Create a new password for your FindAPro account
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {success && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/20 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Success!</span>
                </div>
                {success}
                <p className="mt-2 text-sm text-emerald-400/80">
                  Redirecting you to home page...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Error</span>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password requirements */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400">Password must contain:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      {passwordChecks.length ? 
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                        <XCircle className="w-4 h-4 text-gray-500" />
                      }
                      <span className={`text-xs ${passwordChecks.length ? 'text-emerald-400' : 'text-gray-500'}`}>
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.lowercase ? 
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                        <XCircle className="w-4 h-4 text-gray-500" />
                      }
                      <span className={`text-xs ${passwordChecks.lowercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                        Lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.uppercase ? 
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                        <XCircle className="w-4 h-4 text-gray-500" />
                      }
                      <span className={`text-xs ${passwordChecks.uppercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.number ? 
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                        <XCircle className="w-4 h-4 text-gray-500" />
                      }
                      <span className={`text-xs ${passwordChecks.number ? 'text-emerald-400' : 'text-gray-500'}`}>
                        Number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordChecks.special ? 
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                        <XCircle className="w-4 h-4 text-gray-500" />
                      }
                      <span className={`text-xs ${passwordChecks.special ? 'text-emerald-400' : 'text-gray-500'}`}>
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordsMatch ? 
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                      <XCircle className="w-4 h-4 text-red-400" />
                    }
                    <span className={`text-xs ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !passwordsMatch || !Object.values(passwordChecks).every(check => check)}
                className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                  loading || !passwordsMatch || !Object.values(passwordChecks).every(check => check)
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                }`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-500 text-sm">
                Remember your password?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Back to home
                </button>
              </p>
            </div>
          </div>

          {/* Security footer */}
          <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-t border-gray-800">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Secure & Encrypted Connection</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a href="mailto:support@findapro.co.za" className="text-emerald-400 hover:text-emerald-300">
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}