import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFallbackItems, mapItem } from '@/lib/items'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'millennium2026'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!supabase) {
    const item = getFallbackItems().find(entry => entry.id === params.id)
    return item
      ? NextResponse.json(item)
      : NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    const fallbackItem = getFallbackItems().find(entry => entry.id === params.id)
    return fallbackItem
      ? NextResponse.json(fallbackItem)
      : NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(mapItem(data))
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Map camelCase updates → snake_case columns
  const updates: Record<string, unknown> = {}
  if (body.updates.status)   updates.status    = body.updates.status
  if (body.updates.imageUrl) updates.image_url = body.updates.imageUrl

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('items').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
