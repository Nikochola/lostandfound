import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/types'
import ClaimForm from '@/components/ClaimForm'
import { getFallbackItems, mapItem } from '@/lib/items'

async function getItem(id: string): Promise<Item | null> {
  if (!supabase) {
    return getFallbackItems().find(item => item.id === id) ?? null
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return getFallbackItems().find(item => item.id === id) ?? null
    }
    throw new Error(error.message)
  }

  if (!data) return getFallbackItems().find(item => item.id === id) ?? null
  return mapItem(data)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ka-GE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const CATEGORY_BG: Record<string, string> = {
  'ტანსაცმელი': 'bg-brand-light text-brand-dark',
  'აქსესუარები': 'bg-accent-pale text-yellow-800',
  'სხვა': 'bg-gray-100 text-gray-600',
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  let item: Item | null = null

  try {
    item = await getItem(params.id)
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">ნივთის ჩატვირთვა ვერ მოხერხდა</h1>
          <p className="text-sm text-gray-500 font-sans">
            მონაცემების სერვერთან დაკავშირება ვერ მოხერხდა. სცადე თავიდან ცოტა ხანში.
          </p>
          <div className="flex justify-center">
            <Link href="/items" className="btn-primary">
              ნივთებზე დაბრუნება
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!item) notFound()

  const badgeCls = CATEGORY_BG[item.category] ?? CATEGORY_BG['სხვა']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Back */}
      <Link
        href="/items"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors font-sans mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ნივთებზე დაბრუნება
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* Left — image + details */}
        <div className="space-y-6">
          {item.imageUrl ? (
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full object-cover max-h-[420px]"
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 h-48 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif leading-tight">
                {item.name}
              </h1>
              <span className={`badge text-sm px-3 py-1 ${
                item.status === 'available'
                  ? 'bg-accent-pale text-yellow-800'
                  : 'bg-green-50 text-green-700'
              }`}>
                {item.status === 'available' ? 'ელოდება მფლობელს' : 'დაბრუნდა'}
              </span>
            </div>

            <span className={`badge text-sm px-3 py-1 ${badgeCls}`}>{item.category}</span>

            {item.description && (
              <p className="text-gray-500 leading-relaxed font-sans">{item.description}</p>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-500 font-sans">
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-sans">
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(item.date)}</span>
              </div>
              {item.color && (
                <div className="flex items-center gap-3 text-sm text-gray-500 font-sans">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>{item.color}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — claim form */}
        <div>
          {item.status === 'returned' ? (
            <div className="card p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-gray-700 font-serif">ეს ნივთი უკვე დაბრუნდა</p>
              <p className="text-sm text-gray-400 font-sans">მისი მფლობელი ნაპოვნია.</p>
            </div>
          ) : (
            <div className="card p-6 space-y-5">
              <div className="space-y-1">
                <h2 className="font-bold text-gray-900 text-lg font-serif">ეს შენი ნივთია?</h2>
                <p className="text-sm text-gray-400 font-sans">
                  შეავსე ფორმა — ადმინისტრაცია დაგიკავშირდება.
                </p>
              </div>
              <ClaimForm itemId={item.id} itemName={item.name} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
