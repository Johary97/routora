<template>
  <ThemeBoundary>
    <!-- Brand : injecté dans le header de chaque thème -->
    <template #brand>
      <a href="#" class="brand" @click.prevent="goHome" aria-label="Routora">
        <svg class="brand-mark" viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="7" cy="7" r="3" />
          <circle cx="25" cy="25" r="3" />
          <path d="M7 10v4a5 5 0 0 0 5 5h8a5 5 0 0 1 5 5v.5" />
        </svg>
        <span class="brand-name">Routora</span>
      </a>
    </template>

    <!-- Actions header (Share) -->
    <template #header-actions>
      <button
        v-if="waypoints.length > 0"
        type="button"
        class="btn btn-ghost"
        :title="copied ? 'Lien copié' : 'Copier un lien partageable'"
        @click="copyShareLink"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {{ copied ? 'Lien copié' : 'Partager' }}
      </button>
    </template>

    <!-- Recherche d'adresse -->
    <template #address-search>
      <div class="slot-block">
        <h3 class="slot-title">Ajouter une étape</h3>
        <AddressSearch @select="onAddressSelect" />
        <p class="slot-hint">Ou cliquez n'importe où sur la carte pour déposer une étape.</p>
      </div>
    </template>

    <!-- Boucle retour / contrôles itinéraire -->
    <template #route-controls>
      <label v-if="waypoints.length > 1" class="loop-toggle">
        <input type="checkbox" v-model="closeLoop" />
        <span>Retour au départ</span>
      </label>
    </template>

    <!-- Liste de waypoints -->
    <template #waypoints>
      <div class="slot-block">
        <div class="slot-head">
          <h3 class="slot-title">
            Itinéraire
            <span v-if="waypoints.length > 0" class="counter">{{ waypoints.length }}</span>
          </h3>
        </div>
        <WaypointList
          :waypoints="waypoints"
          @reorder="onReorder"
          @remove="removeWaypoint"
        />
      </div>
    </template>

    <!-- Actions principales -->
    <template #actions>
      <div v-if="waypoints.length > 1" class="action-row">
        <button type="button" class="btn btn-primary" :disabled="optimizing" @click="optimize">
          {{ optimizing ? 'Optimisation…' : "Optimiser l'ordre" }}
        </button>
        <button v-if="waypoints.length > 0" type="button" class="btn btn-ghost" @click="clearAll">
          Tout réinitialiser
        </button>
      </div>
    </template>

    <!-- Stats -->
    <template #stats>
      <div v-if="waypoints.length > 0" class="slot-block">
        <StatsBar
          :stops="waypoints.length"
          :distance-km="distanceKm"
          :duration-min="durationMin"
          :improvement-pct="improvementPct"
        />
        <p v-if="routeSource === 'straight-line' && waypoints.length > 1" class="route-source">
          Itinéraire affiché à vol d'oiseau (service routier indisponible).
        </p>
      </div>
    </template>

    <!-- Erreurs -->
    <template #errors>
      <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    </template>

    <!-- Carte -->
    <template #map>
      <MapView
        :waypoints="waypoints"
        :route-geometry="routeGeometry"
        @map-click="onMapClick"
        @marker-drag="onMarkerDrag"
      />
    </template>
  </ThemeBoundary>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ThemeBoundary from '@theme/ThemeBoundary.vue'

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
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-heading);
  text-decoration: none;
  transition: color var(--transition-fast, 0.15s ease);
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
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.slot-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.slot-title {
  margin: 0;
  font-size: 0.85rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-heading);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.slot-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.counter {
  font-size: 0.7rem;
  background: var(--primary-color);
  color: #fff;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  letter-spacing: 0;
}

.loop-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-muted);
  cursor: pointer;
  user-select: none;
}

.loop-toggle input {
  accent-color: var(--primary-color);
}

.action-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-row .btn {
  flex: 1;
  min-width: 120px;
}

.route-source {
  margin: 0.4rem 0 0;
  font-size: 0.7rem;
  color: var(--color-subtle);
  font-style: italic;
}

.error-banner {
  margin: 0;
  padding: 0.6rem 0.75rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: 0.8rem;
}
</style>
