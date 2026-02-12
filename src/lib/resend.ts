// File: src/lib/resend.ts
// COMPLETE REPLACEMENT - Copy/paste this entire file

import { Resend } from 'resend'
import { supabase, getEmailTemplate, extractProviderData, type SafeProvider } from './supabase'

// ==================== INITIALIZATION ====================
const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not set. Email sending will fail.')
}

const resend = new Resend(RESEND_API_KEY || '')

// ==================== SMART VARIABLE EXTRACTOR ====================
function extractEmailVariables(provider: SafeProvider): Record<string, string> {
  // Safely parse service_areas
  let location = 'South Africa'
  try {
    const areas = typeof provider.service_areas === 'string' 
      ? JSON.parse(provider.service_areas) 
      : provider.service_areas
    
    if (Array.isArray(areas) && areas.length > 0) {
      location = areas[0]
    }
  } catch (e) {
    // Silently fallback to default
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    // Core business info
    business_name: provider.business_name,
    contact_person: provider.contact_person,
    contact_email: provider.contact_email,
    contact_phone: provider.contact_phone,
    alternate_phone: provider.alternate_phone || 'Not provided',
    main_service: provider.main_service,
    
    // Location (from service_areas)
    location: location,
    city: location, // Alias
    province: location, // Alias
    service_areas: location,
    
    // Reference & dates
    reference_id: provider.id.substring(0, 8).toUpperCase(),
    provider_id: provider.id,
    submission_date: new Date(provider.submitted_at).toLocaleDateString('en-ZA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    action_date: new Date().toLocaleDateString('en-ZA'),
    updated_date: new Date().toLocaleDateString('en-ZA', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    
    // URLs
    admin_url: `${baseUrl}/admin/providers/${provider.id}/review`,
    listing_url: `${baseUrl}/providers/${provider.id}`,
    dashboard_url: `${baseUrl}/providers/dashboard`,
    admin_dashboard_url: `${baseUrl}/admin/providers/${provider.id}`,
    login_url: `${baseUrl}/login`,
    support_url: `${baseUrl}/support`,
    support_email: 'support@findapro.co.za',
    
    // Status & reasons
    status: provider.status,
    rejection_reason: provider.rejection_reason || 'No reason provided',
    pause_reason: provider.pause_reason || 'No reason provided',
    deletion_reason: provider.deletion_reason || 'Account removed by admin',
    status_message: getStatusMessage(provider.status),
    status_initial: (provider.status || 'P').charAt(0).toUpperCase(),
    pending_review: provider.status === 'pending' 
      ? '<li>You will receive another email when review is complete (24-48 hours)</li>' 
      : ''
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'has been submitted for review',
    approved: 'has been approved and is live',
    rejected: 'has been reviewed and was not approved',
    pause: 'has been paused',
    reactivated: 'has been reactivated'
  }
  return messages[status] || 'has been updated'
}

// ==================== CORE EMAIL FUNCTION ====================
async function sendEmailWithTemplate(
  to: string | string[],
  templateName: string,
  variables: Record<string, string>
): Promise<{ success: boolean; data?: any; error?: string; templateUsed?: string }> {
  const recipients = Array.isArray(to) ? to : [to]
  
  console.log(`📧 [${new Date().toISOString()}] Sending "${templateName}"`)
  
  try {
    const { data: template, error: templateError } = await getEmailTemplate(templateName)
    
    if (templateError || !template) {
      console.error(`❌ Template "${templateName}" not found`)
      return {
        success: false,
        error: `Template "${templateName}" not found`,
        templateUsed: 'none'
      }
    }

    let subject = template.subject
    let body = template.body

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      subject = subject.replace(regex, value || '')
      body = body.replace(regex, value || '')
    })

    // Clean up any remaining variables
    body = body.replace(/\{\{[^}]+\}\}/g, '')
    subject = subject.replace(/\{\{[^}]+\}\}/g, '')

    // Convert newlines to HTML
    const html = body
      .split('\n\n')
      .map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '<p>&nbsp;</p>')
      .join('')

    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: recipients,
      subject: subject.trim(),
      html,
      replyTo: 'support@findapro.co.za',
      headers: { 'X-Template-Name': templateName }
    })

    if (response.error) {
      return { success: false, error: response.error.message, templateUsed: templateName }
    }

    return {
      success: true,
      data: { ...response.data, templateName },
      templateUsed: templateName
    }

  } catch (error: any) {
    console.error(`❌ Error:`, error.message)
    return { success: false, error: error.message, templateUsed: templateName }
  }
}

// ==================== EMAIL FUNCTIONS ====================

export async function sendNewListingAdminEmail(provider: any) {
  const safeProvider = extractProviderData(provider)
  const variables = extractEmailVariables(safeProvider)
  return sendEmailWithTemplate('admin@findapro.co.za', 'new_listing_admin', variables)
}

export async function sendNewListingConfirmationEmail(provider: any) {
  const safeProvider = extractProviderData(provider)
  const variables = extractEmailVariables(safeProvider)
  
  const result = await sendEmailWithTemplate(safeProvider.contact_email, 'listing_submitted', variables)
  if (!result.success) {
    return sendEmailWithTemplate(safeProvider.contact_email, 'provider_status_update', variables)
  }
  return result
}

export async function sendProviderStatusEmail(
  provider: any, 
  action: string, 
  reason?: string
) {
  const safeProvider = extractProviderData(provider)
  const variables = extractEmailVariables(safeProvider)
  
  if (action === 'reject') variables.rejection_reason = reason || variables.rejection_reason
  if (action === 'pause') variables.pause_reason = reason || variables.pause_reason
  if (action === 'delete') variables.deletion_reason = reason || 'Account removed by admin'
  
  const templateMap: Record<string, string> = {
    approve: 'listing_approved',
    reject: 'listing_rejected',
    pause: 'listing_paused',
    delete: 'listing_deleted',
    reactivate: 'listing_reactivated'
  }
  
  const templateName = templateMap[action] || 'provider_status_update'
  return sendEmailWithTemplate(safeProvider.contact_email, templateName, variables)
}

export async function sendAdminConfirmationEmail(
  adminEmail: string,
  provider: any,
  action: string,
  reason?: string
) {
  const safeProvider = extractProviderData(provider)
  const variables = extractEmailVariables(safeProvider)
  
  const actionTitles: Record<string, string> = {
    approve: 'Approved', reject: 'Rejected', pause: 'Paused',
    delete: 'Deleted', reactivate: 'Reactivated'
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px;">
          <h2 style="color: #0e3b47;">✅ Action Confirmation: ${actionTitles[action] || action}</h2>
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #0070f3;">
            <p><strong>Business:</strong> ${variables.business_name}</p>
            <p><strong>Contact:</strong> ${variables.contact_person}</p>
            <p><strong>Email:</strong> ${variables.contact_email}</p>
            <p><strong>Phone:</strong> ${variables.contact_phone}</p>
            <p><strong>Provider ID:</strong> ${variables.provider_id}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-ZA')}</p>
          </div>
          <p style="color: #666;">Provider has been notified via email.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">FindAPro Admin System</p>
        </div>
      </body>
    </html>
  `

  try {
    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: [adminEmail.trim().toLowerCase()],
      subject: `[Action ${actionTitles[action]}] ${variables.business_name}`,
      html,
    })
    return { success: !response.error, data: response.data, templateUsed: 'admin_confirmation' }
  } catch (error: any) {
    return { success: false, error: error.message, templateUsed: 'admin_confirmation' }
  }
}

export async function sendListingUpdatedEmail(
  to: string,
  businessName: string,
  status: string,
  providerId: string,
  recipientType: 'provider' | 'admin'
) {
  const variables = {
    business_name: businessName,
    status: status,
    provider_id: providerId,
    dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/providers/dashboard`,
    admin_dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/providers/${providerId}`,
    updated_date: new Date().toLocaleDateString('en-ZA'),
    status_message: getStatusMessage(status),
    status_initial: status.charAt(0).toUpperCase(),
    pending_review: status === 'pending' 
      ? '<li>You will receive another email when review is complete (24-48 hours)</li>' 
      : ''
  }
  
  const templateName = recipientType === 'provider' ? 'provider_listing_updated' : 'admin_listing_updated'
  return sendEmailWithTemplate(to, templateName, variables)
}

// ==================== EXPORTS ====================
export {
  sendEmailWithTemplate,
  extractEmailVariables
}