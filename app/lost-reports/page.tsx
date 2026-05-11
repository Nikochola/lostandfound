import { supabase } from '@/lib/supabase'
import LostReportForm from '@/components/LostReportForm'

export const dynamic = 'force-dynamic'

interface PublicReport {
  id: string
  name: string
  description: string
  date: string
  created_at: string
}

async function getReports(): Promise<PublicReport[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('reports')
    .select('id, name, description, date, created_at')
    .order('created_at', { ascending: false })
  return (data as PublicReport[] | null) ?? []
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return date
  }
}

export default async function LostReportsPage() {
  const reports = await getReports()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">დაკარგული ნივთები</h1>
        <p className="text-gray-400 text-sm font-sans">
          {reports.length} განცხადება მომხმარებლებისგან
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <div
              key={r.id}
              className="card p-5 space-y-3 bg-white border border-gray-100 rounded-2xl shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-gray-900 font-serif text-lg leading-tight">
                  {r.name}
                </h3>
                <span className="text-xs text-gray-400 font-sans whitespace-nowrap">
                  {formatDate(r.date || r.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-sans whitespace-pre-wrap break-words">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-2">
          <p className="text-gray-400 font-medium font-sans">ჯერ არცერთი განცხადება</p>
          <p className="text-sm text-gray-400 font-sans">
            იყავი პირველი — გამოგვიგზავნე ქვემოთ
          </p>
        </div>
      )}

      <section className="pt-6 flex justify-center">
        <div className="w-full max-w-xl">
          <LostReportForm />
        </div>
      </section>
    </div>
  )
}
