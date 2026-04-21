import { Item } from '@/lib/types'
import fallbackItemsData from '@/data/items.json'

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

function normalizeCategory(category: unknown): Item['category'] {
  if (category === 'ტანსაცმელი' || category === 'აქსესუარები' || category === 'სხვა') {
    return category
  }

  return 'სხვა'
}

function normalizeStatus(status: unknown): Item['status'] {
  return status === 'returned' ? 'returned' : 'available'
}

export function sanitizeItem(raw: Record<string, unknown>): Item | null {
  const id = typeof raw.id === 'string' ? raw.id : null
  if (!id) return null

  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : 'უცნობი ნივთი',
    category: normalizeCategory(raw.category),
    description: typeof raw.description === 'string' ? raw.description : '',
    location: typeof raw.location === 'string' ? raw.location : '',
    date: typeof raw.date === 'string' ? raw.date : new Date().toISOString().split('T')[0],
    status: normalizeStatus(raw.status),
    color: typeof raw.color === 'string' ? raw.color : '',
    imageUrl: getImageSrc(
      typeof raw.image_url === 'string'
        ? raw.image_url
        : typeof raw.imageUrl === 'string'
          ? raw.imageUrl
          : undefined
    ),
  }
}

export function getFallbackItems(): Item[] {
  return fallbackItemsData
    .map(entry => sanitizeItem(entry as Record<string, unknown>))
    .filter((item): item is Item => item !== null)
}
