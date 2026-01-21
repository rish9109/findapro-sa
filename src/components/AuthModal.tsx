// File: src/components/AuthModal.tsx (Updated with proper overlay)
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function AuthModal() {
  const { 
    authModalVisible, 
    authModalMode, 
    hideAuthModal, 
    login, 
    signup 
  } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSignup, setShowSignup] = useState(authModalMode === 'signup')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (authModalVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [authModalVisible])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (authModalVisible) {
      setShowSignup(authModalMode === 'signup')
      setShowForgotPassword(false)
      setError('')
      setSuccess('')
      console.log('🔓 Auth modal opened in mode:', authModalMode)
    }
  }, [authModalVisible, authModalMode])

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setError('')
    setSuccess('')

    console.log('🔐 Forgot password requested for:', forgotPasswordEmail)
    console.log('📍 Redirect URL:', `${window.location.origin}/auth/reset-password`)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error('❌ Forgot password error:', error)
        setError(error.message || 'Failed to send reset email')
      } else {
        console.log('✅ Forgot password email sent successfully')
        setSuccess('Password reset email sent! Check your inbox.')
        setForgotPasswordEmail('')
      }
    } catch (err: any) {
      console.error('❌ Forgot password exception:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (showSignup) {
        // Signup validation
        console.log('📝 Signup attempt for:', email)
        if (!name.trim() || !surname.trim()) {
          setError('Please enter your name and surname')
          setIsLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }

        const result = await signup(email, password, name.trim(), surname.trim())
        console.log('📝 Signup result:', result)
        
        if (result.success) {
          setSuccess(result.message || 'Account created successfully!')
          // Clear form but keep modal open for login
          setName('')
          setSurname('')
          setPassword('')
          setConfirmPassword('')
          setShowSignup(false)
        } else {
          setError(result.message || 'Signup failed')
        }
      } else {
        // Login
        console.log('🔐 Login attempt for:', email)
        const result = await login(email, password)
        console.log('🔐 Login result:', result)
        
        if (!result.success) {
          // Check if user doesn't exist - suggest signup
          if (result.message?.toLowerCase().includes('user') || result.message?.toLowerCase().includes('invalid')) {
            setError('No account found with this email. Would you like to sign up instead?')
            setShowSignup(true)
          } else {
            setError(result.message || 'Login failed')
          }
        }
      }
    } catch (err: any) {
      console.error('❌ Auth exception:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToSignup = () => {
    setShowSignup(true)
    setShowForgotPassword(false)
    setError('')
    setSuccess('')
    console.log('🔄 Switched to signup form')
  }

  const switchToLogin = () => {
    setShowSignup(false)
    setShowForgotPassword(false)
    setError('')
    setSuccess('')
    console.log('🔄 Switched to login form')
  }

  const switchToForgotPassword = () => {
    setShowForgotPassword(true)
    setError('')
    setSuccess('')
    console.log('🔄 Switched to forgot password form')
  }

  return (
    <AnimatePresence>
      {authModalVisible && (
        <>
          {/* Backdrop - covers entire screen including header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
            onClick={hideAuthModal}
          />
          
          {/* Modal Content - centered and above everything */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-md -translate-x-1/2 -translate-y-1/2 mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">
                    {showForgotPassword ? 'Reset Password' : showSignup ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <button
                    onClick={() => {
                      console.log('❌ Auth modal closed')
                      hideAuthModal()
                    }}
                    className="text-white hover:text-blue-200 transition-colors duration-200 p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-blue-100">
                  {showForgotPassword 
                    ? 'Enter your email to reset your password' 
                    : showSignup 
                      ? 'Join FindAPro to access all features' 
                      : 'Sign in to your account'}
                </p>
              </div>

              {/* Forgot Password Form */}
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="p-6 space-y-5">
                  {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                      {success}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('↩️ Back to login from forgot password')
                            switchToLogin()
                          }}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Back to login →
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        console.log('📧 Forgot password email input:', e.target.value)
                        setForgotPasswordEmail(e.target.value)
                      }}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className={`w-full py-4 rounded-lg font-semibold text-lg ${
                      forgotPasswordLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                  </button>

                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          console.log('↩️ Back to login clicked')
                          switchToLogin()
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Back to login
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Login/Signup Form */
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                      {success}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('↩️ Back to login from success')
                            switchToLogin()
                          }}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Click here to login →
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                      {error}
                      {error.includes('sign up') && (
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🔄 Switching to signup from error')
                            switchToSignup()
                          }}
                          className="block mt-2 text-red-600 hover:text-red-800 font-medium"
                        >
                          Yes, create an account
                        </button>
                      )}
                    </div>
                  )}

                  {showSignup && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              console.log('👤 First name input:', e.target.value)
                              setName(e.target.value)
                            }}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={surname}
                            onChange={(e) => {
                              console.log('👤 Last name input:', e.target.value)
                              setSurname(e.target.value)
                            }}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        console.log('📧 Email input:', e.target.value)
                        setEmail(e.target.value)
                      }}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  {!showSignup && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          console.log('🔑 Password input (masked)')
                          setPassword(e.target.value)
                        }}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔓 Forgot password clicked')
                          switchToForgotPassword()
                        }}
                        className="absolute right-0 -top-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {showSignup && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            console.log('🔑 Signup password input (masked)')
                            setPassword(e.target.value)
                          }}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="At least 6 characters"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            console.log('🔑 Confirm password input (masked)')
                            setConfirmPassword(e.target.value)
                          }}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 rounded-lg font-semibold text-lg ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLoading 
                      ? (showSignup ? 'Creating Account...' : 'Signing In...')
                      : (showSignup ? 'Create Account' : 'Sign In')
                    }
                  </button>

                  <div className="text-center pt-4 border-t">
                    {showSignup ? (
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🔄 Switching to login from signup')
                            switchToLogin()
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Sign in here
                        </button>
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🔄 Switching to signup from login')
                            switchToSignup()
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Sign up here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}