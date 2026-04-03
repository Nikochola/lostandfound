import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const TO = 'freelance@millennium-school.org'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await request.json()
  const { itemId, itemName, claimerName, claimerContact, message } = body

  if (!claimerName?.trim() || !claimerContact?.trim()) {
    return NextResponse.json({ error: 'სახელი და კონტაქტი სავალდებულოა.' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'Lost & Found <onboarding@resend.dev>',
    to: TO,
    subject: `ნივთის მოთხოვნა: ${itemName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a2e;margin-bottom:16px">ნივთის მოთხოვნა</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666;width:120px">ნივთი</td><td style="padding:8px 0;font-weight:600">${itemName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">ID</td><td style="padding:8px 0;font-family:monospace;font-size:13px;color:#888">${itemId}</td></tr>
          <tr><td style="padding:8px 0;color:#666">სახელი</td><td style="padding:8px 0;font-weight:600">${claimerName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">კონტაქტი</td><td style="padding:8px 0">${claimerContact}</td></tr>
          ${message ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">შეტყობინება</td><td style="padding:8px 0">${message}</td></tr>` : ''}
        </table>
      </div>
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
