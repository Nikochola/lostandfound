import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const DEFAULT_FROM = 'Lost & Found <no-reply@lostandfound.local>'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendClaimNotification({
  itemId,
  itemName,
  claimerName,
  claimerContact,
  message,
}: {
  itemId: string
  itemName: string
  claimerName: string
  claimerContact: string
  message?: string
}) {
  const safeItemName = escapeHtml(itemName)
  const safeItemId = escapeHtml(itemId)
  const safeClaimerName = escapeHtml(claimerName)
  const safeClaimerContact = escapeHtml(claimerContact)
  const safeMessage = message ? escapeHtml(message) : ''

  const subject = `ნივთის მოთხოვნა: ${itemName}`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a2e;margin-bottom:16px">ნივთის მოთხოვნა</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:120px">ნივთი</td><td style="padding:8px 0;font-weight:600">${safeItemName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">ID</td><td style="padding:8px 0;font-family:monospace;font-size:13px;color:#888">${safeItemId}</td></tr>
        <tr><td style="padding:8px 0;color:#666">სახელი</td><td style="padding:8px 0;font-weight:600">${safeClaimerName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">კონტაქტი</td><td style="padding:8px 0">${safeClaimerContact}</td></tr>
        ${safeMessage ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">შეტყობინება</td><td style="padding:8px 0">${safeMessage}</td></tr>` : ''}
      </table>
    </div>
  `
  const text = [
    'ნივთის მოთხოვნა',
    `ნივთი: ${itemName}`,
    `ID: ${itemId}`,
    `სახელი: ${claimerName}`,
    `კონტაქტი: ${claimerContact}`,
    message ? `შეტყობინება: ${message}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const resendKey = process.env.RESEND_API_KEY
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
  const configuredFrom = process.env.EMAIL_FROM || smtpUser || DEFAULT_FROM
  const configuredTo =
    process.env.CLAIM_NOTIFICATION_TO ||
    process.env.EMAIL_TO ||
    process.env.GMAIL_USER

  if (!configuredTo) {
    throw new Error('Claim notification recipient is not configured.')
  }

  if (resendKey) {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: configuredFrom,
      to: [configuredTo],
      subject,
      html,
      text,
      replyTo: claimerContact,
    })
    return { delivered: true, provider: 'resend' as const }
  }

  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465

  if (smtpUser && smtpPass) {
    const transporter = smtpHost
      ? nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        })

    await transporter.sendMail({
      from: configuredFrom,
      to: configuredTo,
      subject,
      html,
      text,
      replyTo: claimerContact,
    })
    return { delivered: true, provider: 'smtp' as const }
  }

  console.warn('Claim submitted without email delivery because no mail credentials are configured.', {
    itemId,
    itemName,
    claimerName,
    claimerContact,
    message,
  })

  return { delivered: false, provider: 'none' as const }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { itemId, itemName, claimerName, claimerContact, message } = body

  if (!claimerName?.trim() || !claimerContact?.trim()) {
    return NextResponse.json({ error: 'სახელი და კონტაქტი სავალდებულოა.' }, { status: 400 })
  }

  try {
    const result = await sendClaimNotification({
      itemId,
      itemName,
      claimerName,
      claimerContact,
      message,
    })

    return NextResponse.json({
      success: true,
      notificationDelivered: result.delivered,
      notificationProvider: result.provider,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Email error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
