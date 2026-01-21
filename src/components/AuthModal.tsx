// File: src/components/AuthModal.tsx - FINAL VERSION WITH SUPABASE LOGIC
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Shield, Sparkles, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

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
      setEmail('')
      setPassword('')
      setName('')
      setSurname('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setPasswordChecks({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
      })
    }
  }, [authModalVisible, authModalMode])

  // Validate password as user types
  useEffect(() => {
    if (!showSignup) return
    
    setPasswordChecks({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [password, showSignup])

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

        // Check if all password requirements are met
        const allChecksMet = Object.values(passwordChecks).every(check => check)
        if (!allChecksMet) {
          setError('Please meet all password requirements')
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

  // Check if passwords match (for signup)
  const passwordsMatch = showSignup && password === confirmPassword && confirmPassword.length > 0

  // If modal is not visible, don't render anything
  if (!authModalVisible) return null

  return createPortal(
    <AnimatePresence>
      {authModalVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 border-b border-emerald-500/20">
                  <div className="flex justify-between items-start sm:items-center mb-2">
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 mt-1 sm:mt-0">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                          {showForgotPassword ? 'Reset Password' : showSignup ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm truncate">
                          {showForgotPassword 
                            ? 'Enter your email to reset your password' 
                            : showSignup 
                              ? 'Join FindAPro to access all features' 
                              : 'Sign in to your premium account'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        console.log('❌ Auth modal closed')
                        hideAuthModal()
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white ml-2 flex-shrink-0"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>

                {/* Forgot Password Form */}
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {success && (
                      <div className="bg-emerald-500/10 text-emerald-400 p-3 sm:p-4 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Success!</span>
                        </div>
                        {success}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('↩️ Back to login from forgot password')
                              switchToLogin()
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                          >
                            ← Back to login
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 text-red-400 p-3 sm:p-4 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => {
                            console.log('📧 Forgot password email input:', e.target.value)
                            setForgotPasswordEmail(e.target.value)
                          }}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className={`w-full py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                        forgotPasswordLoading
                          ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-800">
                      <p className="text-gray-500 text-sm">
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            console.log('↩️ Back to login clicked')
                            switchToLogin()
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          Back to login
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Login/Signup Form */
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {success && (
                      <div className="bg-emerald-500/10 text-emerald-400 p-3 sm:p-4 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Success!</span>
                        </div>
                        {success}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('↩️ Back to login from success')
                              switchToLogin()
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                          >
                            Click here to login →
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 text-red-400 p-3 sm:p-4 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Error</span>
                        </div>
                        {error}
                        {error.includes('sign up') && (
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🔄 Switching to signup from error')
                              switchToSignup()
                            }}
                            className="block mt-2 text-red-400 hover:text-red-300 font-medium"
                          >
                            Yes, create an account
                          </button>
                        )}
                      </div>
                    )}

                    {showSignup && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              First Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  console.log('👤 First name input:', e.target.value)
                                  setName(e.target.value)
                                }}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                                placeholder="John"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Last Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input
                                type="text"
                                value={surname}
                                onChange={(e) => {
                                  console.log('👤 Last name input:', e.target.value)
                                  setSurname(e.target.value)
                                }}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                                placeholder="Doe"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            console.log('📧 Email input:', e.target.value)
                            setEmail(e.target.value)
                          }}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {!showSignup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              console.log('🔑 Password input (masked)')
                              setPassword(e.target.value)
                            }}
                            required
                            className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                            placeholder="Your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🔓 Forgot password clicked')
                            switchToForgotPassword()
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-sm mt-2"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {showSignup && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => {
                                console.log('🔑 Signup password input (masked)')
                                setPassword(e.target.value)
                              }}
                              required
                              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
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
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => {
                                console.log('🔑 Confirm password input (masked)')
                                setConfirmPassword(e.target.value)
                              }}
                              required
                              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
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
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || (showSignup && (!passwordsMatch || !Object.values(passwordChecks).every(check => check)))}
                      className={`w-full py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                        isLoading || (showSignup && (!passwordsMatch || !Object.values(passwordChecks).every(check => check)))
                          ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                          : showSignup
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                      }`}
                    >
                      {isLoading 
                        ? (showSignup ? 'Creating Account...' : 'Signing In...')
                        : (showSignup ? 'Create Account' : 'Sign In')
                      }
                    </button>

                    <div className="text-center pt-4 border-t border-gray-800">
                      {showSignup ? (
                        <p className="text-gray-500 text-sm">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🔄 Switching to login from signup')
                              switchToLogin()
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Sign in here
                          </button>
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🔄 Switching to signup from login')
                              switchToSignup()
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Sign up here
                          </button>
                        </p>
                      )}
                    </div>
                  </form>
                )}

                {/* Security footer */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-t border-gray-800">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-400">Secure & Encrypted Connection</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}