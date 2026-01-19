// File: src/app/admin/email-templates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState({ subject: '', body: '' })

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: any) => {
    setEditing(template.id)
    setEditData({ subject: template.subject, body: template.body })
  }

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editData.subject,
          body: editData.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setEditing(null)
      fetchTemplates()
      alert('Template updated successfully!')
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Failed to update template')
    }
  }

  const handleTest = async (template: any) => {
    const testEmail = prompt('Enter test email address:')
    if (!testEmail) return

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: template.name,
          testEmail,
          providerData: {
            business_name: 'Test Business',
            contact_person: 'Test Contact',
            contact_email: testEmail,
            main_service: 'Test Service',
            city: 'Test City',
            province: 'Test Province'
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`Test email sent to ${testEmail}`)
      } else {
        alert('Failed to send test email')
      }
    } catch (error) {
      console.error('Test email error:', error)
      alert('Error sending test email')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading email templates...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600">Manage email templates sent to providers and admins</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Used when: {template.name === 'new_listing_admin' ? 'New provider submits listing' :
                    template.name === 'listing_approved' ? 'Provider listing is approved' :
                    template.name === 'listing_rejected' ? 'Provider listing is rejected' :
                    'Provider listing is paused'}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleTest(template)}
                    className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    Test Email
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {editing === template.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={editData.subject}
                      onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body
                    </label>
                    <textarea
                      value={editData.body}
                      onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                      rows={10}
                      className="w-full p-3 border rounded-lg font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Available variables: {'{{contact_person}}'} {'{{business_name}}'} {'{{main_service}}'} {'{{city}}'} {'{{listing_url}}'}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(template.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Subject:</p>
                    <p className="font-medium">{template.subject}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Body Preview:</p>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{template.body}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}