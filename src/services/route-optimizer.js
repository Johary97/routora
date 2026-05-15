/**
 * Route optimization — pure geometry.
 * Input : ordered list of waypoints [{ lat, lng, ... }]
 * Output: a new ordering minimising total path length, with origin fixed in place.
 *
 * Algorithm:
 *   1. Nearest-Neighbor starting from index 0 (the user-defined origin).
 *   2. 2-opt local search to escape obvious crossings.
 *
 * Distances are great-circle (Haversine). Returns kilometres.
 */

const EARTH_RADIUS_KM = 6371

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

function buildDistanceMatrix(points) {
  const n = points.length
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineKm(points[i], points[j])
      matrix[i][j] = d
      matrix[j][i] = d
    }
  }
  return matrix
}

function totalDistance(order, matrix, closeLoop) {
  let total = 0
  for (let i = 0; i < order.length - 1; i++) {
    total += matrix[order[i]][order[i + 1]]
  }
  if (closeLoop && order.length > 1) {
    total += matrix[order[order.length - 1]][order[0]]
  }
  return total
}

function nearestNeighborOrder(matrix, startIndex = 0) {
  const n = matrix.length
  const visited = new Array(n).fill(false)
  const order = [startIndex]
  visited[startIndex] = true

  for (let step = 1; step < n; step++) {
    const current = order[order.length - 1]
    let bestNext = -1
    let bestDistance = Infinity
    for (let candidate = 0; candidate < n; candidate++) {
      if (visited[candidate]) continue
      const d = matrix[current][candidate]
      if (d < bestDistance) {
        bestDistance = d
        bestNext = candidate
      }
    }
    order.push(bestNext)
    visited[bestNext] = true
  }
  return order
}

/**
 * 2-opt: repeatedly reverse subsequences that shorten the total length.
 * Origin (index 0 of `order`) is locked in first position.
 */
function twoOpt(order, matrix, closeLoop, maxIterations = 200) {
  const n = order.length
  if (n < 4) return order

  let improved = true
  let iterations = 0
  let best = order.slice()
  let bestDistance = totalDistance(best, matrix, closeLoop)

  while (improved && iterations < maxIterations) {
    improved = false
    iterations++

    for (let i = 1; i < n - 2; i++) {
      for (let k = i + 1; k < n - (closeLoop ? 0 : 1); k++) {
        const candidate = best.slice(0, i)
          .concat(best.slice(i, k + 1).reverse())
          .concat(best.slice(k + 1))

        const candidateDistance = totalDistance(candidate, matrix, closeLoop)
        if (candidateDistance + 1e-9 < bestDistance) {
          best = candidate
          bestDistance = candidateDistance
          improved = true
        }
      }
    }
  }

  return best
}

/**
 * Optimise the visit order.
 *
 * @param {Array<{lat:number, lng:number}>} waypoints
 *   Waypoints in user-provided order. `waypoints[0]` is treated as the origin
 *   and stays fixed at position 0 in the result.
 * @param {Object} [options]
 * @param {boolean} [options.closeLoop=false]  If true, the tour returns to origin.
 * @returns {{ order:number[], orderedWaypoints:Array, distanceKm:number,
 *             improvedFromKm:number, improvementPct:number }}
 */
export function optimizeRoute(waypoints, options = {}) {
  const closeLoop = options.closeLoop === true
  const n = waypoints.length

  if (n <= 2) {
    const matrix = buildDistanceMatrix(waypoints)
    const baseOrder = waypoints.map((_, i) => i)
    return {
      order: baseOrder,
      orderedWaypoints: waypoints.slice(),
      distanceKm: totalDistance(baseOrder, matrix, closeLoop),
      improvedFromKm: totalDistance(baseOrder, matrix, closeLoop),
      improvementPct: 0
    }
  }

  const matrix = buildDistanceMatrix(waypoints)
  const initialOrder = waypoints.map((_, i) => i)
  const initialDistance = totalDistance(initialOrder, matrix, closeLoop)

  const nnOrder = nearestNeighborOrder(matrix, 0)
  const optimized = twoOpt(nnOrder, matrix, closeLoop)
  const optimizedDistance = totalDistance(optimized, matrix, closeLoop)

  const improvementPct = initialDistance > 0
    ? Math.max(0, ((initialDistance - optimizedDistance) / initialDistance) * 100)
    : 0

  return {
    order: optimized,
    orderedWaypoints: optimized.map((i) => waypoints[i]),
    distanceKm: optimizedDistance,
    improvedFromKm: initialDistance,
    improvementPct
  }
}

/**
 * Quick total distance of the current order without reordering.
 */
export function measureRoute(waypoints, closeLoop = false) {
  if (waypoints.length < 2) return 0
  let total = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += haversineKm(waypoints[i], waypoints[i + 1])
  }
  if (closeLoop) {
    total += haversineKm(waypoints[waypoints.length - 1], waypoints[0])
  }
  return total
}

/**
 * Rough driving time estimate when no routing service is available.
 * Assumes an average of 40 km/h door-to-door (urban mix with stops).
 */
export function estimateDurationMinutes(distanceKm, stopDurationMin = 0, stopCount = 0) {
  const drivingMin = (distanceKm / 40) * 60
  return Math.round(drivingMin + stopDurationMin * stopCount)
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, '0')}`
}
