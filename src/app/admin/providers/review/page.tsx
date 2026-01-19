// File: src/app/admin/providers/[id]/review/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProviderReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('approve')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProvider()
    fetchAdminInfo()
  }, [])

  async function fetchProvider() {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProvider(data)
    } catch (error) {
      console.error('Error fetching provider:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAdminInfo() {
    const { data: { user } } = await supabase.auth.getUser()
    setAdminEmail(user?.email || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider || !adminEmail) return

    setSubmitting(true)

    try {
      // Get admin user ID
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', adminEmail)
        .single()

      if (!admin) throw new Error('Admin not found')

      // Update provider status
      const updateData: any = {
        status: action,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString()
      }

      if (action === 'rejected') {
        updateData.rejection_reason = reason
      } else if (action === 'paused') {
        updateData.pause_reason = reason
      }

      const { error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', provider.id)

      if (updateError) throw updateError

      // Log the action
      const { error: actionError } = await supabase
        .from('provider_actions')
        .insert([{
          provider_id: provider.id,
          admin_id: admin.id,
          action,
          reason: reason || null,
          notes: notes || null
        }])

      if (actionError) throw actionError

      // Send email to provider
      await sendProviderEmail()

      // Send confirmation to admin
      await sendAdminConfirmation()

      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
      router.push('/admin')

    } catch (error: any) {
      console.error('Error processing action:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const sendProviderEmail = async () => {
    const templateName = `listing_${action}`
    
    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single()

    if (!template) {
      console.warn(`No email template found for: ${templateName}`)
      return
    }

    // Replace placeholders
    let subject = template.subject
    let body = template.body

    const replacements: Record<string, string> = {
      '{{contact_person}}': provider.contact_person,
      '{{business_name}}': provider.business_name,
      '{{main_service}}': provider.main_service,
      '{{city}}': provider.city,
      '{{listing_url}}': `${window.location.origin}/providers/${provider.id}`,
      '{{login_url}}': `${window.location.origin}/login`,
      '{{rejection_reason}}': reason,
      '{{pause_reason}}': reason
    }

    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(key, value)
      body = body.replace(key, value)
    })

    // Create mailto link
    const mailtoLink = `mailto:${provider.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  const sendAdminConfirmation = async () => {
    const subject = `Action Completed: ${action} - ${provider.business_name}`
    const body = `
Action: ${action.toUpperCase()}
Business: ${provider.business_name}
Contact: ${provider.contact_person}
Email: ${provider.contact_email}
${reason ? `Reason: ${reason}\n` : ''}
${notes ? `Notes: ${notes}\n` : ''}
Timestamp: ${new Date().toLocaleString()}

Regards,
FindAPro Admin System
    `.trim()

    const mailtoLink = `mailto:admin@findapro.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading provider details...</p>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p>Provider not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Provider Submission</h1>
        <p className="text-gray-600">Review and take action on this submission</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{provider.business_name}</h2>
                  <p className="text-gray-600">{provider.city}, {provider.province}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full
                  ${provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'}`}>
                  {provider.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><strong>Contact:</strong> {provider.contact_person}</p>
                    <p><strong>Email:</strong> {provider.contact_email}</p>
                    <p><strong>Phone:</strong> {provider.contact_phone}</p>
                    {provider.alternate_phone && (
                      <p><strong>Alt Phone:</strong> {provider.alternate_phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Business Details</h3>
                  <div className="space-y-2">
                    <p><strong>Service:</strong> {provider.main_service}</p>
                    <p><strong>Experience:</strong> {provider.experience_years || 'Not specified'}</p>
                    <p><strong>Business Type:</strong> {provider.business_type || 'Not specified'}</p>
                    <p><strong>Submitted:</strong> {new Date(provider.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {provider.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">{provider.description}</p>
                </div>
              )}

              {provider.other_services && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Other Services</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">{provider.other_services}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location & Service Area</h3>
                  <div className="space-y-1">
                    <p><strong>Address:</strong> {provider.physical_address || 'Not provided'}</p>
                    <p><strong>City:</strong> {provider.city}</p>
                    <p><strong>Province:</strong> {provider.province}</p>
                    <p><strong>Service Areas:</strong> {provider.service_areas || 'City-wide'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Pricing & Payment</h3>
                  <div className="space-y-1">
                    <p><strong>Pricing Model:</strong> {provider.pricing_model || 'Not specified'}</p>
                    <p><strong>Rate:</strong> {provider.hourly_rate ? `R${provider.hourly_rate}/hour` : 'Contact for quote'}</p>
                    <p><strong>Accepts Cash:</strong> {provider.accepts_cash ? 'Yes' : 'No'}</p>
                    <p><strong>Accepts Card:</strong> {provider.accepts_card ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border sticky top-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Take Action</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Action
                  </label>
                  <div className="space-y-3">
                    {['approve', 'reject', 'pause'].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="action"
                          value={option}
                          checked={action === option}
                          onChange={(e) => setAction(e.target.value)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-3 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(action === 'reject' || action === 'pause') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for {action}
                      <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      rows={3}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter reason for ${action}ing this listing...`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any internal notes about this review..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 px-4 rounded-lg font-semibold
                      ${action === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        action === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        'bg-yellow-600 hover:bg-yellow-700 text-white'}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {submitting ? 'Processing...' : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full mt-3 py-3 px-4 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const subject = `Query: ${provider.business_name}`
                      const body = `Dear ${provider.contact_person},\n\nRegarding your listing for ${provider.business_name}...`
                      window.open(`mailto:${provider.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
                    }}
                    className="w-full text-left px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    📧 Email Provider
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(`tel:${provider.contact_phone}`, '_blank')}
                    className="w-full text-left px-4 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                  >
                    📞 Call Provider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}