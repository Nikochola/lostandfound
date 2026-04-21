import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_LABEL } from '@/lib/upload'
import { getImageSrc } from '@/lib/items'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'millennium2026'
const BUCKET = 'lost-and-found'

export async function POST(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Image is too large. Maximum size is ${MAX_IMAGE_UPLOAD_LABEL}.` },
      { status: 413 }
    )
  }

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    path: filename,
    url: getImageSrc(filename),
  })
}
