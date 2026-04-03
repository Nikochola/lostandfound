'use client'

import { useState } from 'react'

interface ClaimFormProps {
  itemId: string
  itemName: string
}

export default function ClaimForm({ itemId, itemName }: ClaimFormProps) {
  const [name, setName]       = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemName, claimerName: name, claimerContact: contact, message }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'შეცდომა. სცადე თავიდან.')
    } else {
      setDone(true)
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="rounded-2xl border-2 border-brand-pale bg-brand-light p-8 text-center space-y-2">
        <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-brand-dark font-serif text-lg">მოთხოვნა გაიგზავნა!</p>
        <p className="text-sm text-gray-500 font-sans">ადმინისტრაცია მალე დაგიკავშირდება.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">შენი სახელი *</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          placeholder="მაგ: ნიკა ბერიძე"
          required
        />
      </div>

      <div>
        <label className="label">კონტაქტი — ტელეფონი ან ელ-ფოსტა *</label>
        <input
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="input"
          placeholder="მაგ: +995 599 123 456"
          required
        />
      </div>

      <div>
        <label className="label">დამატებითი ინფო (სურვილისამებრ)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="აღწერე, სად შეგხვდა ნივთი ან სხვა დეტალები..."
        />
      </div>

      {error && <p className="text-red-500 text-sm font-sans">{error}</p>}

      <button
        type="submit"
        className="btn-primary w-full"
        style={{ padding: '14px 24px', fontSize: '0.95rem' }}
        disabled={submitting}
      >
        {submitting ? 'იგზავნება...' : 'ნივთის მოთხოვნა'}
      </button>
    </form>
  )
}
