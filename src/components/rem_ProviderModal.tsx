// src/components/ProviderModal.tsx - PROVIDER DETAIL MODAL
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { 
  X, MapPin, Star, Phone, Mail, Globe, Calendar, 
  MessageSquare, Share2, Heart, Award, Shield, 
  CheckCircle, Users, Clock, DollarSign, ChevronRight,
  Sparkles, StarHalf, ExternalLink
} from 'lucide-react'

interface ProviderModalProps {
  provider: any
  onClose: () => void
}

export default function ProviderModal({ provider, onClose }: ProviderModalProps) {
  const [isFavorite, setIsFavorite] = useState(provider.is_favorite)
  const [activeTab, setActiveTab] = useState('overview')
  const [showContactForm, setShowContactForm] = useState(false)

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      name: 'Alex Johnson',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Exceptional service! The attention to detail was remarkable.',
      avatar: 'AJ'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      rating: 4,
      date: '1 month ago',
      comment: 'Professional and timely. Highly recommended!',
      avatar: 'SW'
    },
    {
      id: 3,
      name: 'Michael Chen',
      rating: 5,
      date: '2 months ago',
      comment: 'Transformed our space completely. Worth every penny.',
      avatar: 'MC'
    }
  ]

  // Mock portfolio items
  const portfolioItems = [
    { id: 1, title: 'Luxury Villa', category: 'Residential', image: '/api/placeholder/400/300' },
    { id: 2, title: 'Corporate Office', category: 'Commercial', image: '/api/placeholder/400/300' },
    { id: 3, title: 'Boutique Hotel', category: 'Hospitality', image: '/api/placeholder/400/300' }
  ]

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Add your Supabase favorite logic here
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle contact form submission
    setShowContactForm(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'pricing', label: 'Pricing' }
  ]

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden">
              {/* Header */}
              <div className="relative">
                {/* Header Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-cyan-500/10" />
                
                {/* Header Content */}
                <div className="relative p-6 sm:p-8 border-b border-emerald-500/20">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Logo/Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                          {provider.business_name.charAt(0)}
                        </div>
                        {provider.featured && (
                          <div className="absolute -top-2 -right-2">
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Featured
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                            {provider.business_name}
                          </h2>
                          <div className="flex items-center flex-wrap gap-3">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium">
                              {provider.main_service}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">{provider.city}, {provider.province}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">{provider.price_range}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleFavorite}
                            className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300"
                          >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={() => setShowContactForm(true)}
                            className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300"
                          >
                            Contact
                          </button>
                          <button
                            onClick={onClose}
                            className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-white/10 transition-all duration-300"
                          >
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-xl font-bold text-white">{provider.rating}</span>
                          </div>
                          <span className="text-gray-400">({provider.review_count} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400">Verified Professional</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          <span className="text-gray-400">Usually responds in 2 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800">
                  <div className="container mx-auto px-6">
                    <div className="flex flex-wrap gap-4">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-3 font-medium transition-all duration-300 relative ${activeTab === tab.id ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                        >
                          {tab.label}
                          {activeTab === tab.id && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Description */}
                      <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          About {provider.business_name}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {provider.description}
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-4">
                          With over a decade of experience in premium service delivery, {provider.business_name} has established itself as a leader in the {provider.main_service.toLowerCase()} industry. Our team of certified professionals ensures exceptional quality and customer satisfaction.
                        </p>
                      </div>

                      {/* Services */}
                      <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                        <h3 className="text-xl font-bold text-white mb-6">Services Offered</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            'Initial Consultation',
                            'Project Planning',
                            'Implementation',
                            'Quality Assurance',
                            'Ongoing Support',
                            'Maintenance'
                          ].map((service, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              <span className="text-gray-300">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Contact & Info */}
                    <div className="space-y-6">
                      {/* Contact Card */}
                      <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                        <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                            <Phone className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-sm text-gray-400">Phone</p>
                              <p className="text-white font-medium">+1 (555) 123-4567</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                            <Mail className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-sm text-gray-400">Email</p>
                              <p className="text-white font-medium">contact@example.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-sm text-gray-400">Website</p>
                              <a href="#" className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                                www.example.com
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowContactForm(true)}
                          className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300"
                        >
                          Send Message
                        </button>
                      </div>

                      {/* Verification Badges */}
                      <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                        <h3 className="text-xl font-bold text-white mb-6">Verifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-300">Identity Verified</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-300">License Verified</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-300">Premium Member</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-300">500+ Projects Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-2xl aspect-video bg-gradient-to-r from-emerald-500/20 to-purple-500/20 border border-gray-700">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl font-bold text-white/20">
                                {provider.business_name.charAt(0)}
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-gray-300 text-sm">{item.category}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-2xl font-bold text-white">{provider.rating}</span>
                          <span className="text-gray-400">({provider.review_count} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="pb-6 border-b border-gray-800 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {review.avatar}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{review.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                      ))}
                                    </div>
                                    <span className="text-gray-500 text-sm">{review.date}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="modern-glass rounded-2xl p-6 border border-emerald-500/20">
                      <h3 className="text-xl font-bold text-white mb-6">Pricing Plans</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: 'Basic', price: '$999', features: ['Initial Consultation', 'Basic Planning', 'Email Support'] },
                          { name: 'Professional', price: '$2,499', features: ['Full Planning', 'Project Management', 'Priority Support', 'Quality Assurance'] },
                          { name: 'Enterprise', price: 'Custom', features: ['Full Suite Services', 'Dedicated Manager', '24/7 Support', 'Extended Warranty'] }
                        ].map((plan, index) => (
                          <div key={index} className={`rounded-2xl p-6 border ${index === 1 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700'}`}>
                            <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                            <div className="text-3xl font-bold text-white mb-4">{plan.price}</div>
                            <ul className="space-y-3 mb-6">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300">
                              Select Plan
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-black">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-gray-400 text-sm">Listed on FindAPro Premium</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
                      <Share2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Share</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 transition-all duration-300">
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                      <span className="text-gray-400">{isFavorite ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  )
}