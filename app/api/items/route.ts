import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mapItem } from '@/lib/items'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'millennium2026'

export async function GET() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(mapItem))
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
  return NextResponse.json(mapItem(data), { status: 201 })
}
