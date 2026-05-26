// Nominatim public : ~1 req/s, pas de clé. Cache mémoire pour limiter le trafic.

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const cache = new Map()

function cacheKey(query, limit) {
  return `${query.toLowerCase().trim()}|${limit}`
}

export async function searchAddress(query, { limit = 5, signal } = {}) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const key = cacheKey(trimmed, limit)
  if (cache.has(key)) return cache.get(key)

  const params = new URLSearchParams({
    q: trimmed,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit)
  })

  const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal
  })

  if (!response.ok) {
    throw new Error(`Recherche indisponible (${response.status})`)
  }

  const raw = await response.json()
  const results = raw.map((item) => ({
    label: item.display_name,
    shortLabel: shortLabel(item),
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    type: item.type,
    category: item.category,
    boundingBox: item.boundingbox ? item.boundingbox.map(Number) : null
  }))

  cache.set(key, results)
  return results
}

export async function reverseGeocode({ lat, lng }, { signal } = {}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '17'
  })

  try {
    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal
    })
    if (!response.ok) return null
    const item = await response.json()
    if (!item || item.error) return null
    return {
      label: item.display_name,
      shortLabel: shortLabel(item),
      lat,
      lng
    }
  } catch (_) {
    return null
  }
}

function shortLabel(item) {
  const a = item.address || {}
  const parts = [
    a.road || a.pedestrian || a.cycleway || a.path,
    a.house_number,
    a.suburb || a.neighbourhood || a.village || a.town || a.city || a.municipality,
    a.country
  ].filter(Boolean)
  if (parts.length === 0) return item.display_name
  return parts.slice(0, 3).join(', ')
}
