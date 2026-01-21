// File: src/components/CategoryPreview.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Phone, Calendar, MessageSquare } from 'lucide-react'

interface CategoryPreviewProps {
  isOpen: boolean
  onClose: () => void
  category: any
}

export function CategoryPreview({ isOpen, onClose, category }: CategoryPreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Preview Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-50"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-luxury-navy to-luxury-midnight border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="p-8 border-b border-white/10 relative">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: category.accentColor }}
                  >
                    <category.icon className="w-8 h-8" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{category.label}</h2>
                    <p className="text-white/60">{category.description}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                  >
                    <X className="w-6 h-6 text-white/70" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Stats */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Service Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-3xl font-bold text-white mb-1">
                          {category.providers.toLocaleString()}+
                        </div>
                        <div className="text-sm text-white/60">Verified Providers</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-3xl font-bold text-white mb-1">4.9</div>
                        <div className="text-sm text-white/60">Avg. Rating</div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300">
                        <Calendar className="w-5 h-5" />
                        Book a Service
                      </button>
                      <button className="w-full py-3 px-4 rounded-xl border border-white/20 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300">
                        <MessageSquare className="w-5 h-5" />
                        Chat with Providers
                      </button>
                    </div>
                  </div>
                  
                  {/* Popular Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Popular Services</h3>
                    <div className="space-y-3">
                      {['Emergency Repairs', 'Scheduled Maintenance', 'Installation Services', 'Consultation'].map((service, i) => (
                        <div 
                          key={service}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white group-hover:text-gradient transition-colors duration-300">
                              {service}
                            </span>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}