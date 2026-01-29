// File: src/app/favorites/page.tsx - NEW FAVORITES PAGE
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getFavoriteProviders } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Star, Clock, DollarSign, 
  ChevronRight, Shield, Zap, ArrowLeft,
  Sparkles, Users, Award, ShieldCheck
} from 'lucide-react'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  
  const [favoriteProviders, setFavoriteProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      showAuthModal('login')
      router.push('/providers')
    }
  }, [user, router, showAuthModal])

  // Load favorite providers
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError('')
        
        const providers = await getFavoriteProviders(user.id)
        setFavoriteProviders(providers)
        
        if (providers.length === 0) {
          setError('You haven\'t saved any favorites yet.')
        }
      } catch (err: any) {
        console.error('Error loading favorites:', err)
        setError('Failed to load your favorites. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    router.push(`/providers/${providerId}?ref=favorites`)
  }

  // Get price display
  const getPriceDisplay = (provider: any) => {
    if (provider.hourly_rate) {
      return `R${provider.hourly_rate}/hr`
    }
    if (provider.callout_fee) {
      return `R${provider.callout_fee} callout`
    }
    return 'Contact for rates'
  }

  // Handle back to providers
  const handleBack = () => {
    router.push('/providers')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4 sm:mb-6 group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            Back to All Providers
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 fill-pink-400" />
                My Favorite Professionals
              </h1>
              <p className="text-gray-400">
                {favoriteProviders.length} saved {favoriteProviders.length === 1 ? 'professional' : 'professionals'}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600/20 to-pink-500/20 border border-pink-500/30 rounded-xl">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-white text-sm">Personal Collection</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-pink-500"></div>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">Loading your favorites...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-20 modern-glass rounded-2xl border border-gray-700">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6">
              {error}
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-400 text-sm sm:text-base"
            >
              Browse Professionals
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {favoriteProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group cursor-pointer"
              >
                <div 
                  onClick={() => handleProviderClick(provider.id)}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-pink-500/30 overflow-hidden hover:border-pink-500/50 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(236,72,153,0.15)] sm:hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] relative card-3d"
                >
                  {/* Favorite Badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-pink-600 to-pink-500">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1">
                    {provider.emergency_service && (
                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold flex items-center gap-1">
                        <Zap className="w-2 h-2" />
                        <span className="text-xs">24/7</span>
                      </div>
                    )}
                    {provider.insurance && (
                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold flex items-center gap-1">
                        <Shield className="w-2 h-2" />
                        <span className="text-xs">Insured</span>
                      </div>
                    )}
                  </div>

                  {/* Provider Image/Logo */}
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
                    <div className="relative h-full flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {provider.business_name?.charAt(0) || 'P'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300 truncate">
                          {provider.business_name}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">{provider.main_service}</p>
                      </div>
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="font-bold text-white text-sm sm:text-base">
                            {provider.rating || 'New'}
                          </span>
                        </div>
                        {provider.total_reviews > 0 && (
                          <span className="text-gray-500 text-xs sm:text-sm">({provider.total_reviews})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold text-sm sm:text-base">
                          {getPriceDisplay(provider)}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 mb-3 sm:mb-4">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm truncate">
                        {provider.city}, {provider.province}
                      </span>
                    </div>

                    {/* Experience & Completed Jobs */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {provider.experience_years > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                          <span className="text-xs sm:text-sm text-gray-400">
                            {provider.experience_years} years
                          </span>
                        </div>
                      )}
                      {provider.completed_jobs > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="text-xs sm:text-sm text-gray-400">
                            {provider.completed_jobs} jobs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {provider.description && (
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6">
                        {provider.description}
                      </p>
                    )}

                    {/* View Button */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-800">
                      <span className="text-gray-500 text-xs sm:text-sm">
                        View Details
                      </span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state help */}
        {!loading && favoriteProviders.length === 0 && (
          <div className="mt-8 modern-glass rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">How to save favorites</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500/20 to-pink-600/20 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Browse professionals</p>
                  <p className="text-gray-400 text-sm">Find service providers in any category</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500/20 to-pink-600/20 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Click the heart icon</p>
                  <p className="text-gray-400 text-sm">On any provider card to save them</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500/20 to-pink-600/20 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Access anytime</p>
                  <p className="text-gray-400 text-sm">View all saved favorites here or in your profile</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}