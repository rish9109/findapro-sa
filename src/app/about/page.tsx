// File: src/app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Star, Target, CheckCircle, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">FindAPro</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Connecting South Africans with trusted local service professionals since 2024
          </p>
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
                <p className="text-gray-400 leading-relaxed">
                  At FindAPro, we're revolutionizing how South Africans find and connect with local service professionals. 
                  Our platform bridges the gap between skilled professionals and customers who need their services, 
                  creating a trusted community built on transparency, quality, and reliability.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Values */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Trust & Safety",
                description: "Every provider is verified to ensure reliable service delivery and customer protection",
                color: "from-blue-400 to-cyan-400"
              },
              {
                icon: Users,
                title: "Community First",
                description: "Building strong connections between professionals and homeowners across South Africa",
                color: "from-green-400 to-emerald-400"
              },
              {
                icon: Star,
                title: "Quality Assurance",
                description: "Maintaining high standards through reviews and ratings from real customers",
                color: "from-yellow-400 to-amber-400"
              },
              {
                icon: CheckCircle,
                title: "Transparency",
                description: "Clear pricing, honest reviews, and open communication between all parties",
                color: "from-purple-400 to-pink-400"
              },
              {
                icon: Globe,
                title: "Local Focus",
                description: "Supporting local businesses and strengthening South Africa's service economy",
                color: "from-red-400 to-orange-400"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${value.color}/20 rounded-lg flex items-center justify-center border ${value.color.split(' ')[0].replace('from-', '')}/30`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-gray-400 text-sm">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Registered Details</h3>
                <div className="text-gray-400 space-y-2">
                  <p><strong className="text-gray-300">Company Name:</strong> Find A Pro Connect (PTY) LTD</p>
                  <p><strong className="text-gray-300">Registration:</strong> Registered with CIPC</p>
                  <p><strong className="text-gray-300">Website:</strong> findapro.co.za</p>
                  <p><strong className="text-gray-300">Founded:</strong> 2024</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What We Do</h3>
                <p className="text-gray-400 leading-relaxed">
                  FindAPro is a comprehensive service directory platform that connects homeowners and businesses 
                  with verified service professionals across South Africa. From plumbers and electricians to 
                  cleaning services and home renovations, we make finding reliable help simple, fast, and secure.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Our Commitment</h3>
                <p className="text-gray-400 leading-relaxed">
                  We are committed to maintaining a safe, trustworthy platform where both service providers 
                  and customers can connect with confidence. Through our verification processes, review system, 
                  and customer support, we ensure quality connections that benefit everyone in our community.
                </p>
              </div>
              
              <div className="pt-6 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/providers/provider-listings"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300"
                  >
                    List Your Service
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}