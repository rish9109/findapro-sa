// File: src/components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

  if (!authModalVisible) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (showSignup) {
        // Signup validation
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
        const result = await login(email, password)
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
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToSignup = () => {
    setShowSignup(true)
    setError('')
    setSuccess('')
  }

  const switchToLogin = () => {
    setShowSignup(false)
    setError('')
    setSuccess('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">
              {showSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <button
              onClick={hideAuthModal}
              className="text-white hover:text-blue-200 text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100">
            {showSignup 
              ? 'Join FindAPro to access all features' 
              : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
              {success}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={switchToLogin}
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
                  onClick={switchToSignup}
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
                    onChange={(e) => setName(e.target.value)}
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
                    onChange={(e) => setSurname(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={showSignup ? "At least 6 characters" : "Your password"}
            />
          </div>

          {showSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>
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
                  onClick={switchToLogin}
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
                  onClick={switchToSignup}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}