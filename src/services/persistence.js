// Snapshot localStorage + encodage du lien de partage (base64 dans le hash).

const STORAGE_KEY = 'routora.snapshot.v1'

export function saveSnapshot(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (_) {
    // localStorage plein ou désactivé
  }
}

export function loadSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

export function clearSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (_) {}
}

function compactWaypoint(w) {
  return [
    Number(w.lat.toFixed(6)),
    Number(w.lng.toFixed(6)),
    w.label || ''
  ]
}

function expandWaypoint(entry, index) {
  const [lat, lng, label] = entry
  return {
    id: `share-${index}-${Math.random().toString(36).slice(2, 8)}`,
    lat,
    lng,
    label: label || ''
  }
}

export function encodeShareLink(waypoints, options = {}) {
  if (!waypoints || waypoints.length === 0) return null
  const payload = {
    v: 1,
    c: options.closeLoop ? 1 : 0,
    w: waypoints.map(compactWaypoint)
  }
  const json = JSON.stringify(payload)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  const url = new URL(window.location.href)
  url.hash = `r=${base64}`
  return url.toString()
}

export function decodeShareLink(hash) {
  if (!hash) return null
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash
  if (!cleaned.startsWith('r=')) return null
  try {
    const base64 = cleaned.slice(2)
    const json = decodeURIComponent(escape(atob(base64)))
    const payload = JSON.parse(json)
    if (payload.v !== 1 || !Array.isArray(payload.w)) return null
    return {
      closeLoop: payload.c === 1,
      waypoints: payload.w.map(expandWaypoint)
    }
  } catch (_) {
    return null
  }
}
