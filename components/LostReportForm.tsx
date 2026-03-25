'use client'

import { useState } from 'react'

export default function LostReportForm() {
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    if (res.ok) {
      setDone(true)
      setName('')
      setDesc('')
    } else {
      const d = await res.json()
      setError(d.error || 'შეცდომა. სცადე თავიდან.')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="rounded-2xl border-2 border-brand-pale bg-brand-light p-6 text-center space-y-2">
        <p className="font-semibold text-brand-dark font-serif text-lg">გაგზავნილია!</p>
        <p className="text-sm text-gray-500 font-sans">ადმინისტრაცია მალე დაგიკავშირდება.</p>
        <button
          onClick={() => setDone(false)}
          className="text-xs text-brand underline font-sans mt-1"
        >
          კიდევ ერთის გაგზავნა
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-gray-900 font-serif text-lg">ვერ იპოვე შენი ნივთი?</h3>
      <p className="text-sm text-gray-400 font-sans -mt-2">გამოგვიგზავნე განცხადება და ადმინისტრაცია დაგიკავშირდება.</p>

      <div>
        <label className="label">შენი სახელი</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          placeholder="მაგ: ნიკა ბერიძე"
          required
        />
      </div>

      <div>
        <label className="label">რა დაგეკარგა?</label>
        <textarea
          value={description}
          onChange={e => setDesc(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="აღწერე ნივთი — ფერი, ბრენდი, სად შეიძლება დაგრჩეს..."
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm font-sans">{error}</p>}

      <button type="submit" className="btn-primary w-full" style={{ padding: '12px 24px', fontSize: '0.9rem' }} disabled={submitting}>
        {submitting ? 'იგზავნება...' : 'გაგზავნა'}
      </button>
    </form>
  )
}
