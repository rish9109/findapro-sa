// File: src/app/terms/page.tsx
'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, UserCheck, Shield, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-6">
            <FileText className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Acceptance Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">By using FindAPro, you agree to these terms</h3>
                  <p className="text-gray-300">
                    Please read these Terms & Conditions carefully before using our platform. 
                    If you do not agree with any part of these terms, you must not use FindAPro.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Terms Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
          >
            <div className="space-y-10">
              {/* Introduction */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>
                    These Terms & Conditions govern your use of FindAPro ("Platform"), operated by Find A Pro Connect (PTY) LTD ("Company", "we", "us", or "our"). 
                    The Platform connects service providers ("Providers") with customers ("Customers") seeking services.
                  </p>
                  <p>
                    By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
                  </p>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">2. User Accounts & Responsibilities</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">2.1 Account Creation:</strong> Users must provide accurate, complete information when creating an account.</p>
                  <p><strong className="text-gray-300">2.2 Account Security:</strong> You are responsible for maintaining account confidentiality and all activities under your account.</p>
                  <p><strong className="text-gray-300">2.3 Prohibited Activities:</strong> Users must not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create fake or misleading listings</li>
                    <li>Impersonate other individuals or businesses</li>
                    <li>Harass, threaten, or abuse other users</li>
                    <li>Post false or defamatory reviews</li>
                    <li>Use the Platform for illegal activities</li>
                    <li>Circumvent our verification systems</li>
                    <li>Share account access with unauthorized parties</li>
                  </ul>
                </div>
              </section>

              {/* Service Providers */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Service Provider Terms</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">3.1 Listing Requirements:</strong> Providers must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate business information</li>
                    <li>Disclose relevant licenses and certifications</li>
                    <li>Maintain adequate insurance where required by law</li>
                    <li>Honor quoted prices and service descriptions</li>
                    <li>Respond to customer inquiries promptly</li>
                  </ul>
                  
                  <p><strong className="text-gray-300">3.2 Service Quality:</strong> Providers are solely responsible for the quality of services rendered.</p>
                  <p><strong className="text-gray-300">3.3 Compliance:</strong> Providers must comply with all applicable South African laws and regulations.</p>
                  <p><strong className="text-gray-300">3.4 Fake Listings:</strong> Creating fake listings will result in immediate account termination and may lead to legal action.</p>
                </div>
              </section>

              {/* Customers */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Customer Terms</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">4.1 Due Diligence:</strong> Customers must conduct their own verification of Providers before engaging services.</p>
                  <p><strong className="text-gray-300">4.2 Payment:</strong> All payment arrangements are between Customer and Provider. FindAPro is not party to any financial transactions.</p>
                  <p><strong className="text-gray-300">4.3 Disputes:</strong> Customers must attempt to resolve disputes directly with Providers before involving FindAPro.</p>
                  <p><strong className="text-gray-300">4.4 Reviews:</strong> Reviews must be honest, factual, and based on actual experience.</p>
                </div>
              </section>

              {/* Platform Use */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">5. Platform Use & Limitations</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">5.1 Service Directory:</strong> FindAPro is a directory platform only. We do not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Employ or endorse any Providers</li>
                    <li>Guarantee service quality or outcomes</li>
                    <li>Handle payments between users</li>
                    <li>Provide legal or professional advice</li>
                    <li>Assume liability for services rendered</li>
                  </ul>
                  
                  <p><strong className="text-gray-300">5.2 Content:</strong> Users retain ownership of their content but grant us license to display it on the Platform.</p>
                  <p><strong className="text-gray-300">5.3 Modifications:</strong> We reserve the right to modify, suspend, or discontinue any part of the Platform.</p>
                </div>
              </section>

              {/* Liability & Disclaimers */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Liability & Disclaimers</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">6.1 No Warranty:</strong> The Platform is provided "as is" without warranties of any kind.</p>
                  <p><strong className="text-gray-300">6.2 Limitation of Liability:</strong> Find A Pro Connect (PTY) LTD shall not be liable for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Any damages from services provided by listed Professionals</li>
                    <li>User interactions or disputes</li>
                    <li>Inaccurate or misleading listings</li>
                    <li>Financial losses from Platform use</li>
                    <li>Technical issues or Platform downtime</li>
                  </ul>
                  <p><strong className="text-gray-300">6.3 Indemnification:</strong> Users agree to indemnify and hold harmless Find A Pro Connect (PTY) LTD from any claims arising from Platform use.</p>
                </div>
              </section>

              {/* Privacy & Data */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Privacy & Data Protection</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">7.1 Data Collection:</strong> We collect and process data as described in our Privacy Policy.</p>
                  <p><strong className="text-gray-300">7.2 Protection of Personal Information Act (POPIA):</strong> We comply with South Africa's POPIA regulations.</p>
                  <p><strong className="text-gray-300">7.3 User Data:</strong> Users are responsible for complying with data protection laws when handling other users' information.</p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Termination & Suspension</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">8.1 Our Rights:</strong> We may suspend or terminate accounts for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violation of these terms</li>
                    <li>Fraudulent activity</li>
                    <li>Creating fake listings</li>
                    <li>Harmful behavior toward other users</li>
                    <li>Legal or regulatory requirements</li>
                  </ul>
                  <p><strong className="text-gray-300">8.2 User Termination:</strong> Users may delete their accounts at any time.</p>
                </div>
              </section>

              {/* General */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">9. General Provisions</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">9.1 Amendments:</strong> We may update these terms periodically. Continued use constitutes acceptance of changes.</p>
                  <p><strong className="text-gray-300">9.2 Governing Law:</strong> These terms are governed by South African law.</p>
                  <p><strong className="text-gray-300">9.3 Severability:</strong> If any provision is found invalid, the remainder remains enforceable.</p>
                  <p><strong className="text-gray-300">9.4 Entire Agreement:</strong> These terms constitute the entire agreement between users and FindAPro.</p>
                  <p><strong className="text-gray-300">9.5 Contact:</strong> For questions about these terms, contact us through our <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Page</Link>.</p>
                </div>
              </section>

              {/* Acknowledgment */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-300">
                      By using FindAPro, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. 
                      You also acknowledge that FindAPro is a directory platform and not a service provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}