import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { provider, subject, message } = await request.json()

    if (!provider || !subject || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Personalize the message
    const personalizedMessage = message
      .replace(/{{business_name}}/g, provider.business_name)
      .replace(/{{contact_person}}/g, provider.contact_person)

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f7fa;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="background: #0a3d3d; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Find a Pro Connect</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #1e2e2e; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${personalizedMessage}</p>
            <hr style="border: none; border-top: 1px solid #e2e9ef; margin: 24px 0;">
            <p style="color: #5f7373; font-size: 14px; text-align: center;">
              This email was sent to ${provider.business_name}<br>
              <a href="mailto:support@findapro.co.za" style="color: #0a3d3d;">support@findapro.co.za</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const response = await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: [provider.contact_email],
      subject: subject,
      html: html,
      replyTo: 'support@findapro.co.za'
    })

    return NextResponse.json({ 
      success: !response.error, 
      data: response.data,
      provider: provider.business_name
    })

  } catch (error: any) {
    console.error('Bulk email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}