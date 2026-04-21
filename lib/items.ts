import { Item } from '@/lib/types'

const STORAGE_BUCKET = 'lost-and-found'
const STORAGE_PREFIXES = [
  `/storage/v1/object/public/${STORAGE_BUCKET}/`,
  `/storage/v1/object/authenticated/${STORAGE_BUCKET}/`,
  `/storage/v1/object/sign/${STORAGE_BUCKET}/`,
]

type ItemRow = {
  id: string
  name: string
  category: string
  description: string
  location: string
  date: string
  status: string
  color: string | null
  image_url: string | null
}

export function extractStoragePath(imageRef: string | null | undefined) {
  if (!imageRef) return null

  const trimmed = imageRef.trim()
  if (!trimmed) return null

  for (const prefix of STORAGE_PREFIXES) {
    const index = trimmed.indexOf(prefix)
    if (index >= 0) {
      const path = trimmed.slice(index + prefix.length)
      return path ? decodeURIComponent(path.split('?')[0]) : null
    }
  }

  if (trimmed.startsWith(`${STORAGE_BUCKET}/`)) {
    return trimmed.slice(STORAGE_BUCKET.length + 1)
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return trimmed.replace(/^\/+/, '')
}

export function getImageSrc(imageRef: string | null | undefined) {
  const resolved = extractStoragePath(imageRef)
  if (!resolved) return undefined
  if (/^https?:\/\//i.test(resolved)) return resolved
  return `/api/images?path=${encodeURIComponent(resolved)}`
}

export function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Item['category'],
    description: row.description,
    location: row.location,
    date: row.date,
    status: row.status as Item['status'],
    color: row.color ?? '',
    imageUrl: getImageSrc(row.image_url),
  }
}
