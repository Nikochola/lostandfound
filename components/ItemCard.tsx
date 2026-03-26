'use client'

import { useState, useEffect } from 'react'
import { Item } from '@/lib/types'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'ტანსაცმელი': {
    bg: 'bg-brand-light',
    text: 'text-brand-dark',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 3H5l-2 4v1h2v13h14V8h2V7l-2-4h-4m-6 0v4m0 0H7m2 0h6m0-4v4m0 0h2" />
      </svg>
    ),
  },
  'აქსესუარები': {
    bg: 'bg-accent-pale',
    text: 'text-yellow-800',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  'სხვა': {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface ItemCardProps {
  item: Item
  onMarkReturned?: (id: string) => void
  showActions?: boolean
}

export default function ItemCard({ item, onMarkReturned, showActions = false }: ItemCardProps) {
  const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES['სხვა']
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [lightboxOpen])

  return (
    <>
      <div className={`card overflow-hidden flex flex-col gap-0 ${item.status === 'returned' ? 'opacity-60' : ''}`}>
        {/* Image */}
        {item.imageUrl && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="block w-full overflow-hidden group relative"
            aria-label="სურათის გადიდება"
          >
            <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        )}
        <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}>
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug truncate font-serif">{item.name}</h3>
            <span className={`badge mt-1 ${style.bg} ${style.text}`}>{item.category}</span>
          </div>
          {/* Status */}
          <span className={`badge flex-shrink-0 ${
            item.status === 'available'
              ? 'bg-accent-pale text-yellow-800'
              : 'bg-green-50 text-green-700'
          }`}>
            {item.status === 'available' ? 'ელოდება' : 'დაბრუნდა'}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(item.date)}</span>
          </div>
          {item.color && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>{item.color}</span>
            </div>
          )}
        </div>

        {/* Admin action */}
        {showActions && item.status === 'available' && onMarkReturned && (
          <button
            onClick={() => onMarkReturned(item.id)}
            className="mt-1 w-full text-center text-sm text-green-700 font-medium py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors font-sans"
          >
            ✓ მფლობელს მიეცა
          </button>
        )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && item.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="დახურვა"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={item.imageUrl}
            alt={item.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
