import Link from 'next/link'
import ItemCard from '@/components/ItemCard'
import LostReportForm from '@/components/LostReportForm'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/types'
import { getFallbackItems, mapItem } from '@/lib/items'

export const dynamic = 'force-dynamic'

async function getItems(): Promise<Item[]> {
  if (!supabase) return getFallbackItems()

  const { data } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  return data?.map(mapItem) ?? getFallbackItems()
}

export default async function HomePage() {
  const allItems = await getItems()
  const available = allItems.filter(i => i.status === 'available')
  const returned  = allItems.filter(i => i.status === 'returned')
  const recent    = available.slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section className="py-10 sm:py-16 flex flex-col items-center text-center gap-4 sm:gap-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.08] font-serif max-w-2xl">
          დაკარგე ნივთი?
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-md leading-relaxed font-sans">
          შეამოწმე სკოლაში ნაპოვნი ნივთები
        </p>
        <div className="flex items-center gap-5 mt-1 sm:mt-2">
          <Link href="/items" className="btn-primary" style={{padding:'14px 36px'}}>
            ნივთების ნახვა
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4 pb-14">
        <div className="rounded-2xl bg-[#f3f2ff] p-4 sm:p-6 flex flex-col gap-1 sm:gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-brand font-serif">{allItems.length}</span>
          <span className="text-xs sm:text-sm text-gray-500 font-sans">ნაპოვნი ნივთი</span>
        </div>
        <div className="rounded-2xl bg-accent-pale border-2 border-accent p-4 sm:p-6 flex flex-col gap-1 sm:gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-yellow-700 font-serif">{available.length}</span>
          <span className="text-xs sm:text-sm text-gray-500 font-sans">ელოდება მფლობელს</span>
        </div>
        <div className="rounded-2xl bg-green-50 p-4 sm:p-6 flex flex-col gap-1 sm:gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-green-600 font-serif">{returned.length}</span>
          <span className="text-xs sm:text-sm text-gray-500 font-sans">დაბრუნებული</span>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="pb-14 space-y-5">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">კატეგორიები</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { cat: 'ტანსაცმელი',  border: 'border-brand-pale', text: 'text-brand-dark', count: allItems.filter(i => i.category === 'ტანსაცმელი').length },
            { cat: 'აქსესუარები', border: 'border-yellow-200', text: 'text-yellow-800', count: allItems.filter(i => i.category === 'აქსესუარები').length },
            { cat: 'სხვა',        border: 'border-gray-100',   text: 'text-gray-500',   count: allItems.filter(i => i.category === 'სხვა').length },
          ].map(({ cat, border, text, count }) => (
            <Link
              key={cat}
              href={`/items?category=${encodeURIComponent(cat)}`}
              className={`rounded-2xl border-2 ${border} p-4 sm:p-8 flex flex-col items-center gap-2 sm:gap-3 hover:scale-[1.02] transition-transform bg-white`}
            >
              <span className={`text-lg sm:text-2xl font-bold font-serif ${text}`}>{cat}</span>
              <span className="text-xs sm:text-sm text-gray-400 font-sans">{count} ნივთი</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent ── */}
      {recent.length > 0 && (
        <section className="pb-14 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">ბოლოს ნაპოვნი</h2>
            <Link href="/items" className="text-sm text-brand font-medium font-sans hover:text-brand-dark flex items-center gap-1">
              ყველა
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* ── Lost report form ── */}
      <section className="pb-14 flex justify-center">
        <div className="w-full max-w-xl">
          <LostReportForm />
        </div>
      </section>
    </div>
  )
}
