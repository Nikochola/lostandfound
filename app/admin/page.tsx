'use client'

import { useState } from 'react'
import ItemCard from '@/components/ItemCard'
import { Item, Category } from '@/lib/types'

interface Report {
  id: string
  name: string
  description: string
  date: string
  seen: boolean
}

const CATEGORIES: Category[] = ['ტანსაცმელი', 'აქსესუარები', 'სხვა']

const EMPTY_FORM = {
  name: '',
  category: 'ტანსაცმელი' as Category,
}

type FormState = typeof EMPTY_FORM

export default function AdminPage() {
  const [password, setPassword]   = useState('')
  const [unlocked, setUnlocked]   = useState(false)
  const [authError, setAuthError] = useState('')
  const [checking, setChecking]   = useState(false)

  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  const [items, setItems]         = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const [reports, setReports]     = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(false)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setAuthError('')
    // Verify by attempting a POST with a dummy payload — API will 401 on bad password
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, _check: true, name: '' }),
    })
    if (res.status === 401) {
      setAuthError('არასწორი პაროლი. სცადე თავიდან.')
    } else {
      // 400/422 = password ok, bad data — still unlock
      setUnlocked(true)
      setLoadingItems(true)
      setLoadingReports(true)
      fetch('/api/items').then(r => r.json()).then(d => { setItems(d); setLoadingItems(false) })
      fetch('/api/reports', { headers: { 'x-admin-password': password } })
        .then(r => r.json()).then(d => { setReports(d); setLoadingReports(false) })
    }
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    // Upload image first if provided
    let imageUrl = ''
    if (imageFile) {
      const fd = new FormData()
      fd.append('file', imageFile)
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: fd,
      })
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }
    }

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl,
        password,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'შეცდომა. სცადე თავიდან.')
      if (res.status === 401) { setUnlocked(false); setAuthError('სესია ამოიწურა.') }
    } else {
      setSuccess(true)
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview(null)
      setItems(prev => [data, ...prev])
    }
    setSubmitting(false)
  }

  async function handleMarkReturned(id: string) {
    const res = await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, updates: { status: 'returned' } }),
    })
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'returned' as const } : i))
  }

  async function handleDelete(id: string) {
    if (!confirm('გსურს ნივთის წაშლა?')) return
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleMarkReportSeen(id: string) {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, updates: { seen: true } }),
    })
    if (res.ok) setReports(prev => prev.map(r => r.id === id ? { ...r, seen: true } : r))
  }

  async function handleDeleteReport(id: string) {
    if (!confirm('წაიშალოს განცხადება?')) return
    const res = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) setReports(prev => prev.filter(r => r.id !== id))
  }

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="card p-8 w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-serif">ადმინ პანელი</h1>
            <p className="text-sm text-gray-500 font-sans">შეიყვანე ადმინის პაროლი</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="label">პაროლი</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoFocus
                required
              />
              {authError && <p className="text-red-500 text-xs mt-1.5 font-sans">{authError}</p>}
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={checking}>
              {checking ? 'მოწმდება...' : 'შესვლა'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Admin panel ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">ადმინ პანელი</h1>
          <p className="text-sm text-gray-400 mt-1 font-sans">ნივთების დამატება და მართვა</p>
        </div>
        <button
          onClick={() => { setUnlocked(false); setPassword('') }}
          className="btn-ghost"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          გამოსვლა
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Form ── */}
        <div className="lg:col-span-2">
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2 font-serif">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ახალი ნივთის დამატება
            </h2>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2 font-sans">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ნივთი წარმატებით დაემატა!
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">ნივთის სახელი *</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="input"
                  placeholder="მაგ: შავი Nike ჩანთა"
                  required
                />
              </div>

              <div>
                <label className="label">კატეგორია *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => set('category', cat)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all font-sans ${
                        form.category === cat
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">სურათი</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-brand/40 hover:bg-brand-light/30 transition-colors">
                    <svg className="w-8 h-8 text-gray-300 mt-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400 font-sans">სურათის ატვირთვა</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null
                        setImageFile(f)
                        if (f) setImagePreview(URL.createObjectURL(f))
                      }}
                    />
                  </label>
                )}
              </div>

              <button type="submit" className="btn-primary w-full" style={{padding:'12px 24px', fontSize:'0.9rem'}} disabled={submitting}>
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ემატება...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ნივთის დამატება
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Items list ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg font-serif">ყველა ნივთი</h2>
            <span className="badge bg-gray-100 text-gray-500 font-sans">{items.length} სულ</span>
          </div>

          {loadingItems ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-gray-50" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 font-sans">ნივთები ჯერ არ დამატებულა</div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="relative group">
                  <ItemCard item={item} onMarkReturned={handleMarkReturned} showActions />
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-50 hover:bg-red-100 text-red-400 rounded-lg flex items-center justify-center transition-all"
                    title="წაშლა"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Reports ── */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-xl font-serif">
            განცხადებები
            {reports.filter(r => !r.seen).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-xs font-bold text-gray-900">
                {reports.filter(r => !r.seen).length}
              </span>
            )}
          </h2>
          <span className="badge bg-gray-100 text-gray-500 font-sans">{reports.length} სულ</span>
        </div>

        {loadingReports ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-50" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="card p-8 text-center text-gray-400 font-sans">განცხადებები ჯერ არ არის</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.map(report => (
              <div
                key={report.id}
                className={`relative group card p-5 space-y-2 ${!report.seen ? 'border-accent border-2' : ''}`}
              >
                {!report.seen && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent" />
                )}
                <div className="flex items-center justify-between pr-4">
                  <p className="font-semibold text-gray-900 font-serif">{report.name}</p>
                  <p className="text-xs text-gray-400 font-sans">{report.date}</p>
                </div>
                <p className="text-sm text-gray-500 font-sans leading-relaxed">{report.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  {!report.seen && (
                    <button
                      onClick={() => handleMarkReportSeen(report.id)}
                      className="text-xs text-brand font-medium font-sans hover:text-brand-dark"
                    >
                      ✓ ნანახია
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-xs text-red-400 font-sans hover:text-red-600 ml-auto"
                  >
                    წაშლა
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
