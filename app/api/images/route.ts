import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET = 'lost-and-found'
export const dynamic = 'force-dynamic'

function inferContentType(path: string) {
  const normalized = path.toLowerCase()

  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'
  if (normalized.endsWith('.webp')) return 'image/webp'
  if (normalized.endsWith('.gif')) return 'image/gif'
  if (normalized.endsWith('.svg')) return 'image/svg+xml'
  if (normalized.endsWith('.avif')) return 'image/avif'

  return 'application/octet-stream'
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Image storage is not configured' }, { status: 503 })
  }

  const path = request.nextUrl.searchParams.get('path')?.trim()

  if (!path) {
    return NextResponse.json({ error: 'Missing image path' }, { status: 400 })
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(path)

  if (error || !data) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const body = Buffer.from(await data.arrayBuffer())

  return new NextResponse(body, {
    headers: {
      'Content-Type': data.type || inferContentType(path),
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
