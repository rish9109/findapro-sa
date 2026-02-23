// File: src/app/privacy/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Mail, Cookie, Globe, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-500/30 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* POPIA Compliance Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">POPIA Compliant</h3>
                  <p className="text-gray-300">
                    FindAPro is committed to protecting your privacy and complying with the 
                    Protection of Personal Information Act (POPIA) of South Africa. This policy 
                    explains how we collect, use, and safeguard your personal information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy Policy Content */}
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
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>
                    Find A Pro Connect (PTY) LTD ("Company", "we", "us", or "our") respects your privacy 
                    and is committed to protecting your personal information. This Privacy Policy explains 
                    how we collect, use, disclose, and safeguard your information when you use our platform, 
                    website, and services (collectively, the "Platform").
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. By accessing or using the Platform, you 
                    acknowledge that you have read, understood, and agree to be bound by all terms of this 
                    Privacy Policy. If you do not agree with our policies and practices, please do not use 
                    our Platform.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">2.1 Personal Information:</strong> We may collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name and surname</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Physical address</li>
                    <li>ID number or company registration number (for verification)</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Professional credentials, licenses, and certifications (for service providers)</li>
                    <li>Profile photos and business information</li>
                  </ul>
                  
                  <p><strong className="text-gray-300">2.2 Automatically Collected Information:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage data and browsing behavior</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location information (with your consent)</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <div className="text-gray-400 space-y-4">
                  <p>We use your information for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Creating and managing your account</li>
                    <li>Verifying service provider credentials</li>
                    <li>Facilitating connections between customers and providers</li>
                    <li>Processing and responding to inquiries</li>
                    <li>Sending service-related notifications</li>
                    <li>Improving our Platform and user experience</li>
                    <li>Detecting and preventing fraud</li>
                    <li>Complying with legal obligations</li>
                    <li>Marketing communications (with your consent)</li>
                  </ul>
                </div>
              </section>

              {/* Legal Basis for Processing */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing (POPIA)</h2>
                <div className="text-gray-400 space-y-4">
                  <p>Under POPIA, we process your personal information based on:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-gray-300">Consent:</strong> You have given clear consent for us to process your personal information for specific purposes</li>
                    <li><strong className="text-gray-300">Contract:</strong> Processing is necessary for a contract you have with us, or because you have asked us to take specific steps before entering into a contract</li>
                    <li><strong className="text-gray-300">Legal obligation:</strong> Processing is necessary for compliance with the law</li>
                    <li><strong className="text-gray-300">Legitimate interests:</strong> Processing is necessary for our legitimate interests or the legitimate interests of a third party</li>
                  </ul>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Information Sharing & Disclosure</h2>
                <div className="text-gray-400 space-y-4">
                  <p><strong className="text-gray-300">5.1 Service Providers:</strong> We may share information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment processors</li>
                    <li>Cloud service providers</li>
                    <li>Analytics providers</li>
                    <li>Customer support tools</li>
                  </ul>
                  
                  <p><strong className="text-gray-300">5.2 Other Users:</strong> Your profile information is visible to other users as part of the Platform's functionality.</p>
                  
                  <p><strong className="text-gray-300">5.3 Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation.</p>
                  
                  <p><strong className="text-gray-300">5.4 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</p>
                  
                  <p className="text-amber-400 mt-2">
                    <strong>Important:</strong> We do not sell your personal information to third parties.
                  </p>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">6. Data Security</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure socket layer (SSL) technology</li>
                    <li>Access controls and authentication measures</li>
                    <li>Regular security assessments</li>
                    <li>Staff training on data protection</li>
                  </ul>
                  <p>While we take reasonable precautions, no method of transmission over the Internet is 100% secure.</p>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined 
                    in this Privacy Policy, unless a longer retention period is required or permitted by law. 
                    When you delete your account, we will delete or anonymize your personal information within 
                    a reasonable timeframe, subject to legal requirements.
                  </p>
                </div>
              </section>

              {/* Your Rights (POPIA) */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">8. Your Rights Under POPIA</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-gray-300">Access:</strong> Request a copy of your personal information</li>
                    <li><strong className="text-gray-300">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                    <li><strong className="text-gray-300">Deletion:</strong> Request deletion of your personal information (subject to legal exceptions)</li>
                    <li><strong className="text-gray-300">Objection:</strong> Object to the processing of your personal information</li>
                    <li><strong className="text-gray-300">Restriction:</strong> Request restriction of processing</li>
                    <li><strong className="text-gray-300">Data Portability:</strong> Receive your information in a structured, commonly used format</li>
                    <li><strong className="text-gray-300">Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please complete the contact us form.
                  </p>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">9. Cookies & Tracking Technologies</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, and 
                    personalize content. You can control cookies through your browser settings. However, 
                    disabling cookies may affect Platform functionality.
                  </p>
                  <p><strong className="text-gray-300">Types of cookies we use:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Essential cookies (required for Platform operation)</li>
                    <li>Functional cookies (remember your preferences)</li>
                    <li>Analytics cookies (understand how users interact with our Platform)</li>
                    <li>Marketing cookies (with your consent)</li>
                  </ul>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    Our Platform is not intended for individuals under the age of 18. We do not knowingly 
                    collect personal information from children. If you become aware that a child has provided 
                    us with personal information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* Third-Party Links */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Third-Party Links</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    Our Platform may contain links to third-party websites. We are not responsible for the 
                    privacy practices or content of these websites. We encourage you to read the privacy 
                    policies of any third-party sites you visit.
                  </p>
                </div>
              </section>

              {/* International Transfers */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">12. International Data Transfers</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>
                    Your information may be transferred to and processed in countries outside South Africa 
                    where our service providers operate. We ensure appropriate safeguards are in place to 
                    protect your information in accordance with POPIA requirements.
                  </p>
                </div>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Changes to This Privacy Policy</h2>
                <div className="text-gray-400 space-y-4">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material 
                    changes by posting the new Privacy Policy on this page with an updated effective date. 
                    Your continued use of the Platform after such modifications constitutes acceptance of 
                    the updated Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white">14. Contact Us</h2>
                </div>
                <div className="text-gray-400 space-y-4">
                  <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact our us:</p>
                  
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-4">
                    <p><strong className="text-gray-300">Find A Pro Connect (PTY) LTD</strong></p>
                    <p><strong className="text-gray-300">Administration:</strong> admin@findapro.co.za</p>
                    <p><strong className="text-gray-300">Website:</strong> findapro.co.za</p>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    You also have the right to lodge a complaint with the Information Regulator of South Africa:
                    <br />
                    <strong className="text-gray-300">Website:</strong> www.justice.gov.za/inforeg/
                  </p>
                </div>
              </section>

              {/* Acknowledgement */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-300">
                      By using FindAPro, you acknowledge that you have read and understood this Privacy Policy 
                      and consent to the collection, use, and disclosure of your personal information as described herein.
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