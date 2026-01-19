import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      businessName,
      contactPerson,
      contactEmail,
      contactPhone,
      mainService,
      city,
      province,
      providerId
    } = body

    // Simple HTML email
    const html = `
      <h2>New Provider Listing - Review Required</h2>
      <p><strong>Business:</strong> ${businessName}</p>
      <p><strong>Contact:</strong> ${contactPerson}</p>
      <p><strong>Email:</strong> ${contactEmail}</p>
      <p><strong>Phone:</strong> ${contactPhone}</p>
      <p><strong>Service:</strong> ${mainService}</p>
      <p><strong>Location:</strong> ${city}, ${province}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <br/>
      <p><a href="http://localhost:3000/admin/providers/${providerId}/review">Click here to review</a></p>
    `

    // Send via Resend
    await resend.emails.send({
      from: 'FindAPro <admin@findapro.co.za>',
      to: ['admin@findapro.co.za'],
      subject: `New Provider: ${businessName}`,
      html,
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      note: 'Form was submitted, but email notification failed'
    })
  }
}