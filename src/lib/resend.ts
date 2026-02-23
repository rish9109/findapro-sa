// File: src/lib/resend.ts - COMPLETE WORKING VERSION
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
  let serviceAreas = 'South Africa'
  try {
    const areas = typeof provider.service_areas === 'string' 
      ? JSON.parse(provider.service_areas) 
      : provider.service_areas
    
    if (Array.isArray(areas) && areas.length > 0) {
      serviceAreas = areas.join(', ')
    }
  } catch (e) {
    // Silently fallback to default
  }

  // Clean the baseUrl - FIX FOR THE admin@ ISSUE
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Remove any email-like prefixes (like admin@) from the URL
  baseUrl = baseUrl.replace(/https?:\/\/[^@]+@/, 'https://')
  
  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '')
  
  // Ensure proper format
  if (baseUrl.includes('localhost')) {
    // Keep as is for local
  } else if (!baseUrl.startsWith('http')) {
    baseUrl = 'https://' + baseUrl
  }

  return {
    // Core business info
    business_name: provider.business_name,
    contact_person: provider.contact_person,
    contact_email: provider.contact_email,
    contact_phone: provider.contact_phone || 'Not provided',
    alternate_phone: provider.alternate_phone || '',
    main_service: provider.main_service,
    
    // Location
    service_areas: serviceAreas,
    
    // IDs
    id: provider.id,
    provider_id: provider.id,
    reference_id: provider.id.substring(0, 8).toUpperCase(),
    
    // Dates
    submission_date: new Date(provider.submitted_at).toLocaleDateString('en-ZA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    updated_date: new Date().toLocaleDateString('en-ZA', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    action_date: new Date().toLocaleDateString('en-ZA'),
    
    // URLs
    admin_url: `${baseUrl}/admin/providers/${provider.id}`,
    listing_url: `${baseUrl}/providers/${provider.id}`,
    login_url: `${baseUrl}/login`,
    dashboard_url: `${baseUrl}/provider/dashboard`,
    admin_dashboard_url: `${baseUrl}/admin/providers/${provider.id}`,
    support_url: `${baseUrl}/support`,
    support_email: 'support@findapro.co.za',
    
    // Status & reasons
    status: provider.status,
    rejection_reason: provider.rejection_reason || 'Your listing could not be approved at this time. Please contact support for more information.',
    pause_reason: provider.pause_reason || 'Your listing has been temporarily paused.',
    deletion_reason: provider.deletion_reason || 'Your listing has been removed from Find a Pro.',
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
    approved: 'has been approved and is now live',
    rejected: 'was not approved',
    paused: 'has been paused',
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
  
  console.log(`📧 Sending "${templateName}" to:`, recipients)
  
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

    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: recipients,
      subject: subject.trim(),
      html: body,
      replyTo: 'support@findapro.co.za',
      headers: { 'X-Template-Name': templateName }
    })

    if (response.error) {
      console.error(`❌ Resend error:`, response.error)
      return { success: false, error: response.error.message, templateUsed: templateName }
    }

    console.log(`✅ Email sent successfully: ${templateName}`)
    return {
      success: true,
      data: { ...response.data, templateName },
      templateUsed: templateName
    }

  } catch (error: any) {
    console.error(`❌ Error sending email:`, error.message)
    return { success: false, error: error.message, templateUsed: templateName }
  }
}

// ==================== SPECIFIC EMAIL FUNCTIONS ====================

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
  
  // Update reason variables based on action
  if (action === 'reject' && reason) {
    variables.rejection_reason = reason
  } else if (action === 'pause' && reason) {
    variables.pause_reason = reason
  } else if (action === 'delete' && reason) {
    variables.deletion_reason = reason
  }
  
  const templateMap: Record<string, string> = {
    approve: 'listing_approved',
    reject: 'listing_rejected',
    pause: 'listing_paused',
    delete: 'listing_deleted',
    reactivate: 'listing_reactivated'
  }
  
  const templateName = templateMap[action]
  
  if (!templateName) {
    console.error(`❌ No template found for action: ${action}`)
    return { success: false, error: `No template for action: ${action}` }
  }
  
  return sendEmailWithTemplate(safeProvider.contact_email, templateName, variables)
}

export async function sendResubmitConfirmationEmail(
  to: string,
  businessName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; background: #f4f7fa;">
      <div style="max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="background: #0a3d3d; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Find a Pro Connect</h1>
          <p style="color: #b8e0d2; margin: 6px 0 0; font-size: 13px;">PTY (LTD) · South Africa</p>
        </div>
        <div style="padding: 32px 28px; text-align: center;">
          <div style="display: inline-block; background: #e3f2ef; color: #0a3d3d; padding: 6px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; border: 1px solid #c0dfda;">
            🔄 RESUBMITTED
          </div>
          <h2 style="color: #1e2e2e; font-size: 26px; font-weight: 600; margin: 0 0 8px;">${businessName}</h2>
          <p style="color: #4a5e5e; font-size: 16px; margin: 0 0 32px;">Your listing has been resubmitted for review</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 24px 0; text-align: left;">
            <p style="margin: 0 0 10px; font-weight: 600;">What happens next:</p>
            <p style="margin: 0 0 8px;">✓ Our team will review your updated listing</p>
            <p style="margin: 0 0 8px;">✓ You'll receive an email once approved</p>
            <p style="margin: 0;">✓ Your business will appear in search results</p>
          </div>
          <p style="color: #5f7373; font-size: 14px; margin-top: 24px;">
            Questions? <a href="mailto:support@findapro.co.za" style="color: #0a3d3d;">support@findapro.co.za</a>
          </p>
        </div>
        <div style="background: #f4f7fa; padding: 20px; text-align: center; border-top: 1px solid #e2e9ef;">
          <p style="margin: 0; color: #5f7373; font-size: 12px;">Find a Pro Connect (PTY) LTD · findapro.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: [to],
      subject: `Your listing has been resubmitted - ${businessName}`,
      html,
    });
    
    return { success: !response.error, data: response.data };
  } catch (error: any) {
    console.error('Error sending resubmit email:', error);
    return { success: false, error: error.message };
  }
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
    approve: 'Approved', 
    reject: 'Rejected', 
    pause: 'Paused',
    delete: 'Deleted', 
    reactivate: 'Reactivated'
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
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  baseUrl = baseUrl.replace(/https?:\/\/[^@]+@/, 'https://').replace(/\/$/, '')
  
  const variables = {
    business_name: businessName,
    status: status,
    provider_id: providerId,
    id: providerId,
    dashboard_url: `${baseUrl}/provider/dashboard`,
    admin_dashboard_url: `${baseUrl}/admin/providers/${providerId}`,
    updated_date: new Date().toLocaleDateString('en-ZA', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    status_message: getStatusMessage(status),
    status_initial: status.charAt(0).toUpperCase(),
    pending_review: status === 'pending' 
      ? '<li>You will receive another email when review is complete (24-48 hours)</li>' 
      : ''
  }
  
  const templateName = recipientType === 'provider' ? 'provider_listing_updated' : 'admin_listing_updated'
  return sendEmailWithTemplate(to, templateName, variables)
}
