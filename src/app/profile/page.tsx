// File: src/app/profile/page.tsx - UPDATED WITH LISTING CHECK
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, getUserListings, Provider } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Sparkles,
  Key,
  XCircle,
  Building,
  Edit,
  ExternalLink
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<Record<string, string>>({})
  const [deleteError, setDeleteError] = useState('')
  
  // NEW: User's listings state
  const [userListings, setUserListings] = useState<Provider[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [deletingListing, setDeletingListing] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // Load user data and listings
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Get name from raw_user_meta_data
        const rawMetaData = user.user_metadata || {}
        
        setFormData({
          name: rawMetaData.name || '',
          surname: rawMetaData.surname || '',
          email: user.email || ''
        })

        // Load user's listings
        await loadListings()
      }
    }

    loadUserData()
  }, [user])

  const loadListings = async () => {
    if (!user?.id) return
    
    setLoadingListings(true)
    try {
      const listings = await getUserListings(user.id)
      setUserListings(listings)
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoadingListings(false)
    }
  }

  // Validate new password
  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordChecks({
        length: passwordData.newPassword.length >= 8,
        lowercase: /[a-z]/.test(passwordData.newPassword),
        uppercase: /[A-Z]/.test(passwordData.newPassword),
        number: /[0-9]/.test(passwordData.newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)
      })
    }
  }, [passwordData.newPassword])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setSuccess({})
  
    try {
      // Validate inputs
      const newErrors: Record<string, string> = {}
  
      if (!formData.name.trim()) {
        newErrors.name = 'First name is required'
      }
  
      if (!formData.surname.trim()) {
        newErrors.surname = 'Last name is required'
      }
  
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        newErrors.email = 'Valid email is required'
      }
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setSaving(false)
        return
      }
  
      // Prepare update data for metadata (name, surname, full_name)
      const metadataUpdates = {
        data: {
          name: formData.name.trim(),
          surname: formData.surname.trim(),
          full_name: `${formData.name.trim()} ${formData.surname.trim()}`.trim()
        }
      }
  
      console.log('📤 Supabase metadata update:', metadataUpdates)
  
      // Update profile metadata first
      const { error: metadataError } = await supabase.auth.updateUser(metadataUpdates)
  
      if (metadataError) {
        console.error('❌ Metadata update error:', metadataError)
        throw new Error(metadataError.message)
      }
  
      // If email changed, require verification
      if (formData.email !== user?.email) {
        console.log('📧 Email changed, sending verification...')
        
        // Update email (this will trigger verification email)
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email.trim()
        })
  
        if (emailError) {
          console.error('❌ Email update error:', emailError)
          throw new Error(emailError.message)
        }
  
        setSuccess({
          email: 'Verification email sent! Please check your inbox to confirm your new email address. You will need to sign out and back in after verification.'
        })
      } else {
        setSuccess({
          general: 'Profile updated successfully!'
        })
        
        // Refresh user data
        const { data: { user: refreshedUser } } = await supabase.auth.getUser()
        if (refreshedUser) {
          const meta = refreshedUser.user_metadata || {}
          setFormData({
            name: meta.name || '',
            surname: meta.surname || '',
            email: refreshedUser.email || ''
          })
        }
      }
  
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      setErrors({
        general: error.message || 'Failed to update profile'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setErrors({})
    setSuccess({})

    try {
      // Validate password
      const newErrors: Record<string, string> = {}

      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required'
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (!Object.values(passwordChecks).every(check => check)) {
        newErrors.newPassword = 'Please meet all password requirements'
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setChangingPassword(false)
        return
      }

      console.log('🔐 Password change attempt')

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        console.error('❌ Password change error:', error)
        if (error.message.includes('invalid')) {
          throw new Error('Current password is incorrect')
        }
        throw new Error(error.message)
      }

      console.log('✅ Password changed successfully')

      // Clear form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setSuccess({
        password: 'Password updated successfully!'
      })

    } catch (error: any) {
      console.error('❌ Password change error:', error)
      setErrors({
        password: error.message || 'Failed to change password'
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    setDeletingListing(listingId)
    try {
      const response = await fetch('/api/listings/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete listing')
      }

      // Remove from local state
      setUserListings(prev => prev.filter(listing => listing.id !== listingId))
      setSuccess({
        listings: 'Listing deleted successfully!'
      })

    } catch (error: any) {
      console.error('Error deleting listing:', error)
      setErrors({
        listings: error.message || 'Failed to delete listing'
      })
    } finally {
      setDeletingListing(null)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setLoading(true)
  
    try {
      console.log('🗑️ Account deletion attempt for user:', user?.id)
  
      if (!user?.id) {
        throw new Error('No user ID found')
      }
  
      // Call the API route
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })
  
      const result = await response.json()
  
      if (!response.ok) {
        // Check if it's because of active listings
        if (result.error === 'USER_HAS_ACTIVE_LISTINGS' && result.listings) {
          setDeleteError(`You have ${result.listings.length} active listing(s). Please delete them first before deleting your account.`)
          setLoading(false)
          return
        }
        throw new Error(result.message || result.error || 'Failed to delete account')
      }
  
      console.log('✅ Account deletion successful:', result)
  
      // Sign out the user
      await logout()
      
      // Show success message briefly
      setSuccess({
        delete: 'Your account has been deleted successfully.'
      })
  
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
  
    } catch (error: any) {
      console.error('❌ Account deletion error:', error)
      
      // Parse error message for better UX
      let errorMessage = error.message || 'Failed to delete account'
      
      if (errorMessage.includes('ADMIN_CLIENT_NOT_AVAILABLE') || 
          errorMessage.includes('service_role') || 
          errorMessage.includes('JWT')) {
        errorMessage = `
          Server configuration issue. Please:
          1. Ensure SUPABASE_SERVICE_ROLE_KEY is in your .env.local file
          2. Contact support if the problem persists
        `
      }
      
      setDeleteError(errorMessage)
      setLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    return null
  }

  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0
  const allPasswordChecksMet = Object.values(passwordChecks).every(check => check)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-10">
      <div className="container mx-auto px-4 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account information, listings, and security
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Profile Information Card */}
            <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
              </div>

              {errors.general && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {errors.general}
                </div>
              )}

              {success.general && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Success!</span>
                  </div>
                  {success.general}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        placeholder="John"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        placeholder="Doe"
                      />
                    </div>
                    {errors.surname && (
                      <p className="mt-2 text-sm text-red-400">{errors.surname}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                  {success.email && (
                    <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {success.email}
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Changing email requires verification
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                    saving
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Changes
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* My Listings Card */}
            <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Building className="w-6 h-6 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">My Service Listings</h2>
                </div>
              </div>

              {errors.listings && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {errors.listings}
                </div>
              )}

              {success.listings && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Success!</span>
                  </div>
                  {success.listings}
                </div>
              )}

              {loadingListings ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your listings...</p>
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Listings Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't created any service listings yet.</p>
                  <Link
                    href="/providers/provider-listings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-white text-lg">{listing.business_name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              listing.status === 'approved' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : listing.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-gray-400 space-y-1">
                            <p className="text-sm">{listing.contact_person}</p>
                            <p className="text-sm">{listing.main_service}</p>
                            <p className="text-sm">{listing.contact_phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/providers/edit-listing/${listing.id}`)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            disabled={deletingListing === listing.id}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            {deletingListing === listing.id ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Security & Delete */}
          <div className="space-y-8">
            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Key className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Change Password</h2>
              </div>

              {errors.password && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {errors.password}
                </div>
              )}

              {success.password && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Success!</span>
                  </div>
                  {success.password}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password requirements */}
                  {passwordData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-400">Password must contain:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                        {Object.entries(passwordChecks).map(([key, isValid]) => (
                          <div key={key} className="flex items-center gap-2">
                            {isValid ? 
                              <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
                              <XCircle className="w-4 h-4 text-gray-500" />
                            }
                            <span className={`text-xs ${isValid ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {key === 'length' && '8+ characters'}
                              {key === 'lowercase' && 'Lowercase letter'}
                              {key === 'uppercase' && 'Uppercase letter'}
                              {key === 'number' && 'Number'}
                              {key === 'special' && 'Special character'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="Confirm your new password"
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
                  {passwordData.confirmPassword.length > 0 && (
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
                  
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changingPassword || !passwordData.currentPassword || !allPasswordChecksMet || !passwordsMatch}
                  className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                    changingPassword || !passwordData.currentPassword || !allPasswordChecksMet || !passwordsMatch
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {changingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Delete Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-red-500/20 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Delete Account</h2>
              </div>

              {deleteError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {deleteError}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-gray-400">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => {
                      // Check if user has listings before showing delete confirmation
                      if (userListings.length > 0) {
                        setDeleteError(`You have ${userListings.length} active listing(s). Please delete them first before deleting your account.`)
                      } else {
                        setShowDeleteConfirm(true)
                        setDeleteError('')
                      }
                    }}
                    className="w-full py-3.5 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete My Account
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h3 className="font-bold text-white">Are you absolutely sure?</h3>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      This action cannot be undone. This will permanently delete your account and remove all your data.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white transition-all duration-300 flex-1 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5" />
                            Yes, Delete My Account
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Security Notice</h3>
                <p className="text-sm text-gray-400">
                  Your data is encrypted and secured with enterprise-grade security
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-300">Protected by Supabase Auth</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-800 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}