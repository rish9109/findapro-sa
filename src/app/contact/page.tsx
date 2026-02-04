// File: src/app/contact/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle, AlertCircle, Home, Mail, Clock, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSuccess(true)
      setShowSuccessModal(true)
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnHome = () => {
    router.push('/')
  }

  const handleSendAnother = () => {
    setShowSuccessModal(false)
    setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
   
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">FindAPro</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help! Fill out the form below and our team will get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setShowSuccessModal(false)}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                          <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        {/* Animated ring */}
                        <motion.div
                          className="absolute inset-0 border-2 border-green-400 rounded-full"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      </div>
                    </div>
                    
                    {/* Success Message */}
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        Thank you for contacting FindAPro. We've received your message and will respond within 24-48 hours.
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleReturnHome}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 group"
                      >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Return to Home
                      </button>
                      
                      <button
                        onClick={handleSendAnother}
                        className="w-full py-3 px-6 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 hover:text-white transition-all duration-300"
                      >
                        Send Another Message
                      </button>
                    </div>
                    
                    {/* Footer Note */}
                    <p className="text-gray-500 text-xs text-center mt-6 pt-4 border-t border-gray-800">
                      Need immediate assistance? Email us at support@findapro.co.za
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-6"
            >
              <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-400">Error Sending Message</h3>
                    <p className="text-red-300/80 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600"
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </motion.div>
              </div>

              {/* Contact Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600"
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600"
                    placeholder="+27 12 345 6789"
                    disabled={loading}
                  />
                </motion.div>
              </div>

              {/* Subject */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600"
                  placeholder="How can we help you?"
                  required
                  disabled={loading}
                />
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600 resize-none"
                  placeholder="Please provide details about your inquiry..."
                  required
                  disabled={loading}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 group ${
                    loading 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                      Send Message
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10"></div>
                    </>
                  )}
                </button>
                
                <p className="text-gray-500 text-sm text-center mt-4">
                  We typically respond within 24-48 hours during business days.
                </p>
              </motion.div>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-center group hover:border-gray-700 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-all">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="text-blue-400 font-semibold mb-1">Email</div>
              <a 
                href="mailto:support@findapro.co.za" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                support@findapro.co.za
              </a>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-center group hover:border-gray-700 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-all">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <div className="text-purple-400 font-semibold mb-1">Business Hours</div>
              <div className="text-gray-400 text-sm">Mon-Fri: 8AM-5PM</div>
              <div className="text-gray-400 text-xs mt-1">Sat: 9AM-1PM</div>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-center group hover:border-gray-700 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/40 transition-all">
                  <Building className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-cyan-400 font-semibold mb-1">Company</div>
              <div className="text-gray-400 text-sm">Find A Pro Connect (PTY) LTD</div>
              <div className="text-gray-400 text-xs mt-1">findapro.co.za</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}