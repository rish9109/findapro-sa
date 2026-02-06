// File: src/app/legal/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Scale, Shield, AlertTriangle, FileText } from 'lucide-react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-6">
            <Scale className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Legal Information
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Important legal information about using FindAPro
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Important Legal Notice</h3>
                  <p className="text-gray-300">
                    FindAPro is a directory platform connecting service providers with customers. 
                    We do not employ or endorse any listed service providers. Users are responsible 
                    for conducting their own due diligence before engaging any service provider.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
          >
            <div className="space-y-8">
              {/* Platform Disclaimer */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Platform Disclaimer</h2>
                </div>
                
                <div className="text-gray-400 space-y-4">
                  <p>
                    <strong className="text-gray-300">1. Directory Service Only:</strong> FindAPro operates as a connection platform. 
                    We facilitate introductions between service providers and customers but do not directly provide 
                    the services listed on our platform.
                  </p>
                  
                  <p>
                    <strong className="text-gray-300">2. No Employment Relationship:</strong> Service providers listed on FindAPro 
                    are independent contractors or businesses. No employment relationship exists between FindAPro 
                    and any listed service provider.
                  </p>
                  
                  <p>
                    <strong className="text-gray-300">3. User Responsibility:</strong> Customers are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Verifying service provider credentials, licenses, and insurance</li>
                    <li>Conducting background checks if necessary</li>
                    <li>Negotiating terms, pricing, and scope of work directly with the provider</li>
                    <li>Ensuring compliance with all applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              {/* Liability Limitation */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    Find A Pro Connect (PTY) LTD shall not be liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Any damages, losses, or injuries resulting from services provided by listed professionals</li>
                    <li>Misrepresentations or fraudulent activities by service providers or customers</li>
                    <li>Disputes between service providers and customers</li>
                    <li>Quality of work performed by service providers</li>
                    <li>Financial transactions between users and service providers</li>
                    <li>Any indirect, incidental, or consequential damages arising from platform use</li>
                  </ul>
                  
                  <p>
                    Our liability is limited to the maximum extent permitted by South African law.
                  </p>
                </div>
              </section>

              {/* Verification Disclaimer */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Verification & Listings</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    <strong className="text-gray-300">1. Listing Accuracy:</strong> While we conduct basic verification 
                    checks, we cannot guarantee the accuracy, completeness, or timeliness of information provided 
                    by service providers.
                  </p>
                  
                  <p>
                    <strong className="text-gray-300">2. Fake Listings:</strong> We actively monitor and remove 
                    fraudulent listings. Users are encouraged to report suspicious activity immediately. However, 
                    we cannot be held responsible for fake listings that evade our detection systems.
                  </p>
                  
                  <p>
                    <strong className="text-gray-300">3. User Reporting:</strong> Users must report any issues, 
                    suspicious activity, or fraudulent listings through our official contact channels. Prompt 
                    reporting helps us maintain platform integrity.
                  </p>
                </div>
              </section>

              {/* User Safety */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">User Safety Guidelines</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    For your safety, we recommend:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Meet in public places for initial consultations</li>
                    <li>Verify professional credentials and licenses</li>
                    <li>Request references from previous clients</li>
                    <li>Use secure payment methods with transaction records</li>
                    <li>Obtain written agreements for significant work</li>
                    <li>Never share sensitive personal information unnecessarily</li>
                    <li>Report any suspicious behavior immediately</li>
                  </ul>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Governing Law & Jurisdiction</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    These terms and the use of FindAPro are governed by the laws of the Republic of South Africa. 
                    Any disputes shall be subject to the exclusive jurisdiction of the South African courts.
                  </p>
                  
                  <p>
                    <strong className="text-gray-300">Registered Address:</strong> Find A Pro Connect (PTY) LTD, 
                    as registered with CIPC. For legal notices, please contact us through our official channels.
                  </p>
                </div>
              </section>

              {/* Important Note */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mt-8">
                <p className="text-gray-300 text-sm">
                  <strong>Note:</strong> This legal page provides general information. For specific legal advice, 
                  consult with a qualified legal professional. By using FindAPro, you acknowledge and agree to 
                  these terms and our complete Terms & Conditions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}