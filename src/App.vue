<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <a href="#" class="brand" @click.prevent="goHome" aria-label="Routora">
          <svg class="brand-mark" viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="7" cy="7" r="3" />
            <circle cx="25" cy="25" r="3" />
            <path d="M7 10v4a5 5 0 0 0 5 5h8a5 5 0 0 1 5 5v.5" />
          </svg>
          <span class="brand-name">Routora</span>
        </a>

        <div class="header-actions">
          <button v-if="waypoints.length > 0" type="button" class="btn btn-ghost" @click="copyShareLink" :title="copied ? 'Lien copié' : 'Copier un lien partageable'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {{ copied ? 'Lien copié' : 'Partager' }}
          </button>
          <button type="button" class="theme-toggle" @click="toggleTheme" :aria-label="theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="workspace">
      <aside class="control-panel">
        <section class="panel-section">
          <h2 class="panel-title">Ajouter une étape</h2>
          <AddressSearch @select="onAddressSelect" />
          <p class="panel-hint">
            Ou cliquez n'importe où sur la carte pour déposer une étape.
          </p>
        </section>

        <section class="panel-section">
          <div class="section-head">
            <h2 class="panel-title">
              Itinéraire
              <span v-if="waypoints.length > 0" class="counter">{{ waypoints.length }}</span>
            </h2>
            <label v-if="waypoints.length > 1" class="loop-toggle">
              <input type="checkbox" v-model="closeLoop" />
              <span>Retour au départ</span>
            </label>
          </div>

          <WaypointList
            :waypoints="waypoints"
            @reorder="onReorder"
            @remove="removeWaypoint"
          />

          <div v-if="waypoints.length > 1" class="action-row">
            <button type="button" class="btn btn-primary" :disabled="optimizing" @click="optimize">
              {{ optimizing ? 'Optimisation…' : 'Optimiser l\'ordre' }}
            </button>
            <button v-if="waypoints.length > 0" type="button" class="btn btn-ghost" @click="clearAll">
              Tout réinitialiser
            </button>
          </div>
        </section>

        <section v-if="waypoints.length > 0" class="panel-section">
          <StatsBar
            :stops="waypoints.length"
            :distance-km="distanceKm"
            :duration-min="durationMin"
            :improvement-pct="improvementPct"
          />
          <p v-if="routeSource === 'straight-line' && waypoints.length > 1" class="route-source">
            Itinéraire affiché à vol d'oiseau (service routier indisponible).
          </p>
        </section>

        <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
      </aside>

      <section class="map-pane">
        <MapView
          :waypoints="waypoints"
          :route-geometry="routeGeometry"
          @map-click="onMapClick"
          @marker-drag="onMarkerDrag"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MapView from './components/MapView.vue'
import AddressSearch from './components/AddressSearch.vue'
import WaypointList from './components/WaypointList.vue'
import StatsBar from './components/StatsBar.vue'

import { optimizeRoute, measureRoute, estimateDurationMinutes } from './services/route-optimizer.js'
import { reverseGeocode } from './services/geocoding.js'
import { fetchDrivingRoute } from './services/routing.js'
import {
  saveSnapshot,
  loadSnapshot,
  encodeShareLink,
  decodeShareLink
} from './services/persistence.js'

const theme = ref('dark')
const waypoints = ref([])
const closeLoop = ref(false)
const optimizing = ref(false)
const errorMessage = ref('')
const copied = ref(false)

const routeGeometry = ref([])
const routeSource = ref(null)
const drivingDistanceKm = ref(null)
const drivingDurationMin = ref(null)
const improvementPct = ref(0)

let routingController = null
let lastRouteSignature = ''

const distanceKm = computed(() => {
  if (drivingDistanceKm.value !== null) return drivingDistanceKm.value
  return measureRoute(waypoints.value, closeLoop.value)
})

const durationMin = computed(() => {
  if (drivingDurationMin.value !== null) return drivingDurationMin.value
  return estimateDurationMinutes(distanceKm.value)
})

function uid() {
  return `wp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function routeSignature() {
  return `${closeLoop.value ? '1' : '0'}|` +
    waypoints.value.map((w) => `${w.lat.toFixed(5)},${w.lng.toFixed(5)}`).join(';')
}

async function refreshRouteGeometry() {
  if (routingController) {
    routingController.abort()
    routingController = null
  }

  if (waypoints.value.length < 2) {
    routeGeometry.value = []
    drivingDistanceKm.value = null
    drivingDurationMin.value = null
    routeSource.value = null
    return
  }

  const sequence = closeLoop.value
    ? [...waypoints.value, waypoints.value[0]]
    : waypoints.value

  routingController = new AbortController()
  const result = await fetchDrivingRoute(sequence, { signal: routingController.signal })
  routingController = null

  routeGeometry.value = result.coordinates
  drivingDistanceKm.value = result.distanceKm
  drivingDurationMin.value = result.durationMin
  routeSource.value = result.source
}

async function addWaypoint(partial) {
  const waypoint = {
    id: uid(),
    lat: partial.lat,
    lng: partial.lng,
    label: partial.label || ''
  }
  waypoints.value.push(waypoint)

  if (!waypoint.label) {
    const enrichment = await reverseGeocode({ lat: waypoint.lat, lng: waypoint.lng })
    if (enrichment) {
      const target = waypoints.value.find((w) => w.id === waypoint.id)
      if (target) target.label = enrichment.shortLabel || enrichment.label
    }
  }
}

function onAddressSelect(item) {
  errorMessage.value = ''
  addWaypoint({ lat: item.lat, lng: item.lng, label: item.shortLabel || item.label })
}

function onMapClick({ lat, lng }) {
  errorMessage.value = ''
  addWaypoint({ lat, lng })
}

function onMarkerDrag({ id, lat, lng }) {
  const target = waypoints.value.find((w) => w.id === id)
  if (!target) return
  target.lat = lat
  target.lng = lng
  target.label = ''
  reverseGeocode({ lat, lng }).then((enrichment) => {
    if (enrichment) target.label = enrichment.shortLabel || enrichment.label
  })
}

function onReorder(list) {
  waypoints.value = list
}

function removeWaypoint(id) {
  waypoints.value = waypoints.value.filter((w) => w.id !== id)
}

function clearAll() {
  waypoints.value = []
  routeGeometry.value = []
  improvementPct.value = 0
  errorMessage.value = ''
  drivingDistanceKm.value = null
  drivingDurationMin.value = null
  routeSource.value = null
}

async function optimize() {
  if (waypoints.value.length < 3) {
    errorMessage.value = 'Ajoutez au moins 3 étapes pour optimiser.'
    return
  }
  errorMessage.value = ''
  optimizing.value = true
  try {
    const result = optimizeRoute(waypoints.value, { closeLoop: closeLoop.value })
    waypoints.value = result.orderedWaypoints.map((w, i) => ({ ...w, id: waypoints.value[result.order[i]].id }))
    improvementPct.value = result.improvementPct
  } finally {
    optimizing.value = false
  }
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('routora.theme', theme.value)
}

async function copyShareLink() {
  const url = encodeShareLink(waypoints.value, { closeLoop: closeLoop.value })
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1800)
  } catch (_) {
    errorMessage.value = 'Impossible de copier le lien automatiquement.'
  }
}

function goHome() {
  clearAll()
  history.replaceState(null, '', window.location.pathname + window.location.search)
}

function applyDecodedSnapshot(decoded) {
  if (!decoded || !Array.isArray(decoded.waypoints)) return
  closeLoop.value = !!decoded.closeLoop
  waypoints.value = decoded.waypoints.map((w) => ({
    id: w.id || uid(),
    lat: w.lat,
    lng: w.lng,
    label: w.label || ''
  }))
}

onMounted(() => {
  const storedTheme = localStorage.getItem('routora.theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    theme.value = storedTheme
    document.documentElement.setAttribute('data-theme', storedTheme)
  }

  const sharedFromUrl = decodeShareLink(window.location.hash)
  if (sharedFromUrl) {
    applyDecodedSnapshot(sharedFromUrl)
    history.replaceState(null, '', window.location.pathname + window.location.search)
    return
  }

  const snapshot = loadSnapshot()
  if (snapshot) applyDecodedSnapshot(snapshot)
})

watch(
  [waypoints, closeLoop],
  () => {
    saveSnapshot({ waypoints: waypoints.value, closeLoop: closeLoop.value })

    const signature = routeSignature()
    if (signature === lastRouteSignature) return
    lastRouteSignature = signature
    refreshRouteGeometry()
  },
  { deep: true }
)
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-header {
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  flex: none;
}

.header-inner {
  max-width: 100%;
  margin: 0;
  padding: 0.875rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-heading);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.brand:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.brand-mark {
  color: var(--primary-color);
}

.brand-name {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
}

.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.workspace {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(320px, 420px) 1fr;
  gap: 0;
  min-height: 0;
}

.control-panel {
  background: var(--body-background);
  border-right: 1px solid var(--border-color);
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.panel-title {
  margin: 0;
  font-size: 0.9rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-heading);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.counter {
  font-size: 0.7rem;
  background: var(--primary-color);
  color: #fff;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  letter-spacing: 0;
}

.panel-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.loop-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-muted);
  cursor: pointer;
  user-select: none;
}

.loop-toggle input {
  accent-color: var(--primary-color);
}

.action-row {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-row .btn {
  flex: 1;
  min-width: 120px;
}

.route-source {
  margin: 0.5rem 0 0;
  font-size: 0.7rem;
  color: var(--color-subtle);
  font-style: italic;
}

.error-banner {
  margin: 0;
  padding: 0.625rem 0.75rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: 0.8rem;
}

.map-pane {
  position: relative;
  padding: 1.25rem;
  padding-left: 1.25rem;
  min-height: 0;
  display: flex;
}

.map-pane > :deep(.map-view) {
  flex: 1;
  height: 100%;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .control-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 55vh;
  }
  .map-pane {
    padding: 0.75rem;
  }
}
</style>
