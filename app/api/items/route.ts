import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'millennium2026'

function toItem(row: Record<string, unknown>) {
  return {
    id:          row.id          as string,
    name:        row.name        as string,
    category:    row.category    as string,
    description: row.description as string,
    location:    row.location    as string,
    date:        row.date        as string,
    status:      row.status      as string,
    color:       row.color       as string,
    imageUrl:    row.image_url   as string,
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(toItem))
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'არასწორი პაროლი' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      id:          Date.now().toString(),
      name:        body.name,
      category:    body.category,
      description: body.description || '',
      location:    body.location    || '',
      date:        body.date        || new Date().toISOString().split('T')[0],
      status:      'available',
      color:       body.color       || '',
      image_url:   body.imageUrl    || '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toItem(data as Record<string, unknown>), { status: 201 })
}
