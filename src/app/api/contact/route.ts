// File: src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message
    } = body

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(RESEND_API_KEY)

    // Format message
    const fullName = `${firstName} ${lastName}`
    const phoneDisplay = phone || 'Not provided'
    const timestamp = new Date().toLocaleString('en-ZA', {
      dateStyle: 'full',
      timeStyle: 'medium'
    })

    // Send email to admin
    const response = await resend.emails.send({
      from: 'FindAPro Contact Form <contact@findapro.co.za>',
      to: ['admin@findapro.co.za'],
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission - FindAPro</title>
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
                display: inline-block;
                width: 120px;
              }
              .message-box {
                background-color: #f0f7ff;
                border: 1px solid #d0e3ff;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
                white-space: pre-wrap;
                font-family: monospace;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 14px;
                border-top: 1px solid #eee;
                background-color: #f8f9fa;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 New Contact Form Submission</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">From: ${fullName}</p>
              </div>
              
              <div class="content">
                <div class="info-box">
                  <div class="info-item">
                    <span class="info-label">Name:</span> ${fullName}
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email:</span> 
                    <a href="mailto:${email}" style="color: #0070f3; text-decoration: none;">
                      ${email}
                    </a>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Phone:</span> ${phoneDisplay}
                  </div>
                  <div class="info-item">
                    <span class="info-label">Subject:</span> ${subject}
                  </div>
                  <div class="info-item">
                    <span class="info-label">Submitted:</span> ${timestamp}
                  </div>
                </div>
                
                <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
                <div class="message-box">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; margin: 0;">
                    This message was sent via the FindAPro contact form.
                    Please respond to the sender within 24-48 hours.
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>FindAPro Contact System</p>
                <p>${new Date().getFullYear()} © Find A Pro Connect (PTY) LTD. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      replyTo: email,
      headers: {
        'X-Contact-Form': 'true',
        'X-Submitter-Name': fullName,
        'X-Submitter-Email': email
      }
    })

    if (response.error) {
      console.error('Resend API error:', response.error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        submittedAt: timestamp
      }
    })

  } catch (error: any) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FindAPro Contact Form API',
    timestamp: new Date().toISOString()
  })
}