import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'millennium2026'

export interface Report {
  id: string
  name: string
  description: string
  date: string
  seen: boolean
}

export async function GET(request: NextRequest) {
  const pwd = request.headers.get('x-admin-password')
  if (pwd !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!supabase) return NextResponse.json([])

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  if (!body.name?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: 'სახელი და აღწერა სავალდებულოა' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      id:          Date.now().toString(),
      name:        body.name.trim(),
      description: body.description.trim(),
      date:        new Date().toISOString().split('T')[0],
      seen:        false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
