// File: src/lib/resend.ts
import { Resend } from 'resend'
import { supabase, supabaseAdmin, getEmailTemplate, type Provider } from './supabase'

// ==================== INITIALIZATION ====================
const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not set. Email sending will fail.')
}

const resend = new Resend(RESEND_API_KEY || '')

// ==================== UTILITY FUNCTIONS ====================
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}

function sanitizeEmailAddress(email: string): string {
  return email.trim().toLowerCase()
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ==================== CORE EMAIL FUNCTION ====================
async function sendEmailWithTemplate(
  to: string | string[],
  templateName: string,
  variables: Record<string, string>
): Promise<{ success: boolean; data?: any; error?: string; templateUsed?: string }> {
  const recipients = Array.isArray(to) ? to : [to]
  const sanitizedRecipients = recipients.map(sanitizeEmailAddress)
  
  console.log(`📧 [${new Date().toISOString()}] Sending "${templateName}" to:`, sanitizedRecipients.join(', '))
  
  try {
    // 1. Get template from database using helper function
    const { data: template, error: templateError } = await getEmailTemplate(templateName)
    
    if (templateError || !template) {
      console.error(`❌ Template "${templateName}" not found:`, templateError?.message)
      return {
        success: false,
        error: `Template "${templateName}" not found`,
        templateUsed: 'none'
      }
    }

    console.log(`✅ Template loaded: ${templateName}`)

    // 2. Replace variables in subject and body
    let subject = template.subject
    let body = template.body

    const replacements: Record<string, string> = {}
    const missingVariables: string[] = []

    // First pass: collect all variables
    const variablePattern = /\{\{([^}]+)\}\}/g
    const allVariables = new Set<string>()
    let match
    
    while ((match = variablePattern.exec(subject + body)) !== null) {
      allVariables.add(match[1].trim())
    }

    // Second pass: replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      const regex = new RegExp(escapeRegExp(placeholder), 'g')
      const safeValue = value || ''
      
      replacements[placeholder] = safeValue
      
      subject = subject.replace(regex, safeValue)
      body = body.replace(regex, safeValue)
      
      allVariables.delete(key)
    })

    // Check for missing variables
    allVariables.forEach(variable => {
      missingVariables.push(variable)
      console.warn(`⚠️ Variable "{{${variable}}}" was not provided`)
    })

    console.log(`📝 Variables replaced: ${Object.keys(replacements).length}`)
    if (Object.keys(replacements).length > 0) {
      console.log('   Details:', Object.keys(replacements))
    }

    // 3. Convert newlines to <br> for HTML, preserve paragraphs
    const html = body
      .split('\n\n') // Split by double newlines (paragraphs)
      .map(paragraph => {
        if (paragraph.trim() === '') return '<p>&nbsp;</p>'
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
      })
      .join('')

    console.log(`🚀 Sending email with subject: "${subject}"`)
    
// 4. Send email via Resend
const response = await resend.emails.send({
  from: 'FindAPro <admin@findapro.co.za>',
  to: sanitizedRecipients,
  subject,
  html,
  replyTo: 'support@findapro.co.za',
  headers: {
    'X-Template-Name': templateName,
    'X-Email-Type': 'system-notification'
  }
})

// 4. Send email via Resend
const response = await resend.emails.send({
  from: 'FindAPro <admin@findapro.co.za>',
  to: sanitizedRecipients,
  subject,
  html,
  replyTo: 'support@findapro.co.za',
  headers: {
    'X-Template-Name': templateName,
    'X-Email-Type': 'system-notification'
  }
})

// Check if response contains error
if (response.error) {
  console.error(`❌ Resend API error:`, response.error)
  return {
    success: false,
    error: `Resend API error: ${response.error.message}`,
    templateUsed: templateName
  }
}

console.log(`✅ Email sent successfully. Resend ID: ${response.data?.id}`)

return {
  success: true,
  data: {
    ...response.data,
    resendId: response.data?.id,
    templateName,
    variablesProvided: Object.keys(variables),
    variablesReplaced: Object.keys(replacements),
    missingVariables,
    recipientCount: sanitizedRecipients.length
  },
  templateUsed: templateName
}

console.log(`✅ Email sent successfully. Resend ID: ${response.data?.id}`)

return {
  success: true,
  data: {
    ...response.data,
    resendId: response.data?.id,
    templateName,
    variablesProvided: Object.keys(variables),
    variablesReplaced: Object.keys(replacements),
    missingVariables,
    recipientCount: sanitizedRecipients.length
  },
  templateUsed: templateName
}

  } catch (error: any) {
    console.error(`❌ Error sending "${templateName}" email:`, error)
    
    return {
      success: false,
      error: error.message || 'Unknown error',
      templateUsed: templateName
    }
  }
}

// ==================== SPECIFIC EMAIL FUNCTIONS ====================
export async function sendNewListingAdminEmail(provider: Provider) {
  console.log(`👤 Sending new listing notification for: ${provider.business_name}`)
  
  const baseUrl = getBaseUrl()
  const variables = {
    business_name: provider.business_name,
    contact_person: provider.contact_person,
    contact_email: provider.contact_email,
    contact_phone: provider.contact_phone || 'Not provided',
    main_service: provider.main_service,
    city: provider.city,
    province: provider.province,
    admin_url: `${baseUrl}/admin/providers/${provider.id}/review`,
    provider_id: provider.id
  }

  return sendEmailWithTemplate(
    'admin@findapro.co.za',
    'new_listing_admin',
    variables
  )
}

export async function sendNewListingConfirmationEmail(provider: Provider) {
  console.log(`👥 Sending submission confirmation to: ${provider.contact_email}`)
  
  const { data: template } = await getEmailTemplate('listing_submitted')
  
  if (template) {
    const variables = {
      contact_person: provider.contact_person,
      business_name: provider.business_name,
      main_service: provider.main_service,
      city: provider.city,
      province: provider.province,
      reference_id: provider.id.substring(0, 8).toUpperCase(),
      submission_date: new Date(provider.created_at).toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      support_email: 'support@findapro.co.za'
    }

    return sendEmailWithTemplate(
      provider.contact_email,
      'listing_submitted',
      variables
    )
  } else {
    // Fallback template
    console.warn('⚠️ listing_submitted template not found, using fallback')
    
    const fallbackVariables = {
      contact_person: provider.contact_person,
      business_name: provider.business_name,
      main_service: provider.main_service,
      city: provider.city,
      reference_id: provider.id.substring(0, 8).toUpperCase(),
      support_email: 'support@findapro.co.za'
    }
    
    return sendEmailWithTemplate(
      provider.contact_email,
      'listing_submitted_fallback',
      fallbackVariables
    )
  }
}

export async function sendProviderStatusEmail(
  provider: Provider, 
  action: string, 
  reason?: string
): Promise<{ success: boolean; data?: any; error?: string; templateUsed?: string }> {
  console.log(`🔄 Sending ${action} email to provider: ${provider.contact_email}`)
  
  const templateMap: Record<string, string> = {
    approve: 'listing_approved',
    reject: 'listing_rejected',
    pause: 'listing_paused',
    delete: 'listing_deleted',
    reactivate: 'listing_reactivated'
  }

  const templateName = templateMap[action]
  if (!templateName) {
    console.error(`❌ No template mapping for action: ${action}`)
    return {
      success: false,
      error: `No template for action: ${action}`,
      templateUsed: 'none'
    }
  }

  const baseUrl = getBaseUrl()
  
  // Determine reason based on action
  let reasonText = ''
  if (action === 'reject') {
    reasonText = reason || provider.rejection_reason || 'No reason provided'
  } else if (action === 'pause') {
    reasonText = reason || provider.pause_reason || 'No reason provided'
  } else if (action === 'delete') {
    reasonText = reason || provider.deletion_reason || 'Account removed by admin'
  }

  const variables = {
    contact_person: provider.contact_person,
    business_name: provider.business_name,
    main_service: provider.main_service,
    city: provider.city,
    listing_url: `${baseUrl}/providers/${provider.id}`,
    login_url: `${baseUrl}/login`,
    support_url: `${baseUrl}/support`,
    rejection_reason: reasonText,
    pause_reason: reasonText,
    deletion_reason: reasonText,
    action_date: new Date().toLocaleDateString('en-ZA')
  }

  return sendEmailWithTemplate(
    provider.contact_email,
    templateName,
    variables
  )
}

export async function sendAdminConfirmationEmail(
  adminEmail: string,
  provider: Provider,
  action: string,
  reason?: string
) {
  console.log(`✅ Sending confirmation to admin: ${adminEmail}`)
  
  try {
    const actionTitles: Record<string, string> = {
      approve: 'Approved',
      reject: 'Rejected',
      pause: 'Paused',
      delete: 'Deleted',
      reactivate: 'Reactivated'
    }

    const actionTitle = actionTitles[action] || action
    const sanitizedEmail = sanitizeEmailAddress(adminEmail)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Action Confirmation - FindAPro</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #0070f3 0%, #0060d6 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #0070f3;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-item {
              margin: 8px 0;
            }
            .info-label {
              font-weight: 600;
              color: #555;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              background-color: #28a745;
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Action Confirmation: ${actionTitle}</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="info-item">
                  <span class="info-label">Action:</span> ${actionTitle}
                </div>
                <div class="info-item">
                  <span class="info-label">Business:</span> ${provider.business_name}
                </div>
                <div class="info-item">
                  <span class="info-label">Contact:</span> ${provider.contact_person}
                </div>
                <div class="info-item">
                  <span class="info-label">Provider Email:</span> ${provider.contact_email}
                </div>
                <div class="info-item">
                  <span class="info-label">Provider ID:</span> ${provider.id}
                </div>
                ${reason ? `
                <div class="info-item">
                  <span class="info-label">Reason:</span> ${reason}
                </div>
                ` : ''}
                <div class="info-item">
                  <span class="info-label">Time:</span> ${new Date().toLocaleString('en-ZA')}
                </div>
              </div>
              <p style="color: #666;">
                This is an automated confirmation that the action has been processed successfully.
                The provider has been notified via email.
              </p>
            </div>
            <div class="footer">
              <p>FindAPro Admin System</p>
              <p>${new Date().getFullYear()} © FindAPro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: [sanitizedEmail],
      subject: `[Action ${actionTitle}] ${provider.business_name} - FindAPro Admin`,
      html,
    })
    
    // Check for errors
    if (response.error) {
      console.error('❌ Error sending admin confirmation:', response.error)
      return { 
        success: false, 
        error: response.error.message,
        templateUsed: 'admin_confirmation'
      }
    }
    
    console.log(`✅ Admin confirmation email sent successfully to ${sanitizedEmail}`)
    return { 
      success: true, 
      data: response.data,
      templateUsed: 'admin_confirmation' 
    }
  } catch (error: any) {
    console.error('❌ Error sending admin confirmation:', error)
    return { 
      success: false, 
      error: error.message,
      templateUsed: 'admin_confirmation'
    }
  }
}

// ==================== BULK/HELPER FUNCTIONS ====================
export async function sendBulkProviderEmails(
  providers: Provider[],
  action: string,
  reason?: string
): Promise<Array<{ providerId: string; success: boolean; error?: string }>> {
  console.log(`📨 Sending bulk ${action} emails to ${providers.length} providers`)
  
  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      try {
        const result = await sendProviderStatusEmail(provider, action, reason)
        return {
          providerId: provider.id,
          businessName: provider.business_name,
          success: result.success,
          error: result.error,
          email: provider.contact_email
        }
      } catch (error: any) {
        return {
          providerId: provider.id,
          businessName: provider.business_name,
          success: false,
          error: error.message,
          email: provider.contact_email
        }
      }
    })
  )

  const formattedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        providerId: providers[index]?.id || 'unknown',
        businessName: providers[index]?.business_name || 'unknown',
        success: false,
        error: result.reason?.message || 'Unknown error',
        email: providers[index]?.contact_email || 'unknown'
      }
    }
  })

  const successCount = formattedResults.filter(r => r.success).length
  console.log(`📊 Bulk email results: ${successCount}/${providers.length} successful`)
  
  return formattedResults
}

export async function testEmailConnection() {
  try {
    console.log('🔧 Testing email connection...')
    
    // Test Resend API key
    if (!RESEND_API_KEY) {
      return {
        success: false,
        error: 'RESEND_API_KEY not configured',
        service: 'Resend'
      }
    }

    // Try to send a test email (Resend doesn't have a dedicated test endpoint,
    // but we can check if the client initializes without errors)
    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: ['test@example.com'],
      subject: 'Test Connection',
      html: '<p>This is a test email to verify connection.</p>',
    })
    
    if (response.error) {
      return {
        success: false,
        error: `Resend API error: ${response.error.message}`,
        service: 'Resend'
      }
    }
    
    // If we get here, the client works
    return {
      success: true,
      message: 'Email service configured correctly',
      service: 'Resend',
      resendKeyConfigured: !!RESEND_API_KEY,
      resendClientReady: true
    }
    
  } catch (error: any) {
    // Check specific error types
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: 'Invalid RESEND_API_KEY',
        service: 'Resend'
      }
    }
    
    return {
      success: false,
      error: error.message || 'Unknown email connection error',
      service: 'Resend'
    }
  }
}

// ==================== EXPORT ALL FUNCTIONS ====================
export {
  sendEmailWithTemplate
}