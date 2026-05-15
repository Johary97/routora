/**
 * Wrapper around the public OSRM router (https://router.project-osrm.org).
 * Returns a polyline (GeoJSON LineString) plus distance & duration.
 *
 * If the call fails (offline, rate-limit, etc.) we fall back to straight lines
 * computed from the waypoint coordinates so the UI keeps working.
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

function toLngLatString(waypoints) {
  return waypoints.map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join(';')
}

function straightLineFallback(waypoints) {
  const coordinates = waypoints.map((w) => [w.lng, w.lat])
  return {
    coordinates,
    distanceKm: null,
    durationMin: null,
    source: 'straight-line'
  }
}

export async function fetchDrivingRoute(waypoints, { signal } = {}) {
  if (!waypoints || waypoints.length < 2) {
    return straightLineFallback(waypoints || [])
  }

  const coordsParam = toLngLatString(waypoints)
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'false'
  })

  try {
    const response = await fetch(
      `${OSRM_BASE}/${coordsParam}?${params.toString()}`,
      { headers: { Accept: 'application/json' }, signal }
    )
    if (!response.ok) throw new Error(`OSRM status ${response.status}`)
    const data = await response.json()
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.code || 'Itinéraire indisponible')
    }
    const route = data.routes[0]
    return {
      coordinates: route.geometry.coordinates,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      source: 'osrm'
    }
  } catch (_) {
    return straightLineFallback(waypoints)
  }
}
