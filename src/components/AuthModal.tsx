// File: src/components/AuthModal.tsx
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
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  })

  // Close modal automatically after successful sign-in (including Google)
  useEffect(() => {
    if (!authModalVisible) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        hideAuthModal()
      }
    })

    return () => subscription.unsubscribe()
  }, [authModalVisible, hideAuthModal])

  useEffect(() => {
    if (authModalVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [authModalVisible])

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
  
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Changed back to /auth/callback
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
  
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to start Google sign-in')
      console.error('Google OAuth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message || 'Failed to send reset email')
      } else {
        setSuccess('Password reset email sent! Check your inbox.')
        setForgotPasswordEmail('')
      }
    } catch (err: any) {
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
        if (!name.trim() || !surname.trim()) {
          setError('Please enter your name and surname')
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        const allChecksMet = Object.values(passwordChecks).every(check => check)
        if (!allChecksMet) {
          setError('Please meet all password requirements')
          return
        }
  
        const result = await signup(email, password, name.trim(), surname.trim())
        
        if (result.success) {
          setSuccess(result.message || 'Account created successfully!')
          setName('')
          setSurname('')
          setPassword('')
          setConfirmPassword('')
          setShowSignup(false)
        } else {
          // Handle specific signup errors
          if (result.message?.toLowerCase().includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.')
          } else {
            setError(result.message || 'Signup failed. Please try again.')
          }
        }
      } else {
        const result = await login(email, password)
        
        if (!result.success) {
          // Check for specific error types from the login function
          if (result.error?.message?.toLowerCase().includes('invalid login credentials')) {
            setError('Invalid email or password. Please try again.')
          } 
          else if (result.error?.message?.toLowerCase().includes('email not confirmed')) {
            setError('Please verify your email address before logging in. Check your inbox for the verification link.')
          }
          else if (result.error?.message?.toLowerCase().includes('provider is not supported') || 
                   result.error?.message?.toLowerCase().includes('identity is already linked to another user')) {
            // This could indicate a Google account trying to use email/password
            setError('This email uses Google Sign-In. Please click the Google button below to log in.')
          }
          else {
            // Generic error for any other case - doesn't reveal if email exists or not
            setError('Unable to log in. Please check your credentials and try again.')
          }
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // ─── Fixed switch functions ────────────────────────────────────────
  const switchToSignup = () => {
    setShowSignup(true)
    setShowForgotPassword(false)
    setError('')
    setSuccess('')
  }

  const switchToLogin = () => {
    setShowSignup(false)
    setShowForgotPassword(false)
    setError('')
    setSuccess('')
  }

  const switchToForgotPassword = () => {
    setShowForgotPassword(true)
    setError('')
    setSuccess('')
  }

  const passwordsMatch = showSignup && password === confirmPassword && confirmPassword.length > 0

  if (!authModalVisible) return null

  return createPortal(
    <AnimatePresence>
      {authModalVisible && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
          />
          
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden">
                
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
                      onClick={hideAuthModal}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white ml-2 flex-shrink-0"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>

                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="p-4 sm:p-6 space-y-5">
                    {success && (
                      <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Success!</span>
                        </div>
                        {success}
                        <div className="mt-3">
                          <button type="button" onClick={switchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
                            ← Back to login
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className={`w-full py-3.5 rounded-lg font-semibold transition-all ${forgotPasswordLoading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg hover:shadow-emerald-500/30'}`}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-800">
                      <p className="text-gray-500 text-sm">
                        Remember your password?{' '}
                        <button type="button" onClick={switchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium">
                          Back to login
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
                    {success && (
                      <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Success!</span>
                        </div>
                        {success}
                        <div className="mt-3">
                          <button type="button" onClick={switchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
                            Click here to login →
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className={`p-4 rounded-lg border ${
                        error.includes('Google') 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {error.includes('Google') ? 'Google Account Detected' : 'Error'}
                          </span>
                        </div>
                        {error}
                        {error.includes('Google') && (
                          <div className="mt-3 flex gap-3">
                            <button 
                              type="button" 
                              onClick={switchToForgotPassword} 
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm underline"
                            >
                              Forgot Password
                            </button>
                            <span className="text-gray-500">|</span>
                            <button 
                              type="button" 
                              onClick={handleGoogleSignIn} 
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm underline"
                            >
                              Continue with Google
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {showSignup && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                              placeholder="John"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              value={surname}
                              onChange={(e) => setSurname(e.target.value)}
                              required
                              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {!showSignup ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                            placeholder="Your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <button type="button" onClick={switchToForgotPassword} className="text-emerald-400 hover:text-emerald-300 text-sm mt-2">
                          Forgot password?
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                              placeholder="At least 8 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-400">Password must contain:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(passwordChecks).map(([key, valid]) => (
                                <div key={key} className="flex items-center gap-2">
                                  {valid ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className={`text-xs ${valid ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {key === 'length' ? '8+ characters' :
                                     key === 'lowercase' ? 'Lowercase letter' :
                                     key === 'uppercase' ? 'Uppercase letter' :
                                     key === 'number' ? 'Number' : 'Special character'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>

                          {confirmPassword.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              {passwordsMatch ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
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
                      disabled={isLoading || (showSignup && (!passwordsMatch || !Object.values(passwordChecks).every(Boolean)))}
                      className={`w-full py-3.5 rounded-lg font-semibold transition-all ${
                        isLoading || (showSignup && (!passwordsMatch || !Object.values(passwordChecks).every(Boolean)))
                          ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                          : showSignup
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg hover:shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/30'
                      }`}
                    >
                      {isLoading
                        ? (showSignup ? 'Creating Account...' : 'Signing In...')
                        : (showSignup ? 'Create Account' : 'Sign In')}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gradient-to-b from-gray-900 to-black px-4 text-gray-300">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-medium transition-all border ${
                        isLoading
                          ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed border-gray-700'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300 shadow-sm hover:shadow'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.31-.98 2.42-2.07 3.16v2.63h3.35c1.96-1.81 3.09-4.47 3.09-7.8z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.35-2.63c-1.01.68-2.29 1.08-3.93 1.08-3.02 0-5.58-2.04-6.49-4.79H.96v2.67C2.77 20.39 6.62 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.51 14.21c-.23-.68-.36-1.41-.36-2.21s.13-1.53.36-2.21V7.34H.96C.35 8.85 0 10.39 0 12s.35 3.15.96 4.66l4.55-2.45z"/>
                        <path fill="#EA4335" d="M12 4.98c1.64 0 3.11.56 4.27 1.66l3.19-3.19C17.46 1.01 14.97 0 12 0 6.62 0 2.77 2.61.96 6.34l4.55 2.45C6.42 6.02 8.98 4.98 12 4.98z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="text-center pt-4 border-t border-gray-800">
                      {showSignup ? (
                        <p className="text-gray-500 text-sm">
                          Already have an account?{' '}
                          <button type="button" onClick={switchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Sign in here
                          </button>
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Don't have an account?{' '}
                          <button type="button" onClick={switchToSignup} className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Sign up here
                          </button>
                        </p>
                      )}
                    </div>
                  </form>
                )}

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