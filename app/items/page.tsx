'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ItemCard from '@/components/ItemCard'
import { Item, Category } from '@/lib/types'

function ItemsContent() {
  const searchParams = useSearchParams()
  const category = (searchParams.get('category') as Category) || null

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    if (item.status === 'returned') return false
    if (category && item.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.color?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">ნაპოვნი ნივთები</h1>
        <p className="text-gray-400 text-sm font-sans">
          {items.filter(i => i.status === 'available').length} ნივთი ელოდება მფლობელს
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ძებნა სახელით, ადგილით, ფერით..."
          className="input pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>


      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-48 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="text-center py-20 space-y-3">
          <svg className="w-14 h-14 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400 font-medium font-sans">ნივთი ვერ მოიძებნა</p>
          <p className="text-sm text-gray-400 font-sans">სცადე სხვა ძებნა ან შეცვალე ფილტრი</p>
        </div>
      )}
    </div>
  )
}

export default function ItemsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-48" />
      </div>
    }>
      <ItemsContent />
    </Suspense>
  )
}
