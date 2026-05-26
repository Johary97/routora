<template>
  <div ref="rootRef" class="map-view"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import L from 'leaflet'
import { useTheme } from '@theme/useTheme.js'

const props = defineProps({
  waypoints: { type: Array, required: true },
  routeGeometry: { type: Array, default: () => [] }
})

const emit = defineEmits(['map-click', 'marker-drag'])

const rootRef = ref(null)
let map = null
let markerLayer = null
let routeLayer = null
let tileLayer = null

const { manifest } = useTheme()
const tileUrl = computed(
  () => manifest.value.mapTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
)
const tileAttribution = computed(
  () =>
    manifest.value.mapTileAttribution ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
)
const mapFilter = computed(() => manifest.value.mapFilter || 'none')

const _DEFAULT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

function makeDivIcon(label, isOrigin) {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    html: `<div class="routora-marker ${isOrigin ? 'origin' : ''}">${label}</div>`
  })
}

function rebuildMarkers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()

  props.waypoints.forEach((w, index) => {
    const marker = L.marker([w.lat, w.lng], {
      icon: makeDivIcon(index === 0 ? '★' : String(index), index === 0),
      draggable: true,
      keyboard: false,
      title: w.label || `Étape ${index}`
    })

    marker.on('dragend', (event) => {
      const { lat, lng } = event.target.getLatLng()
      emit('marker-drag', { id: w.id, lat, lng })
    })

    if (w.label) {
      marker.bindTooltip(w.label, { direction: 'top', offset: [0, -14] })
    }

    marker.addTo(markerLayer)
  })

  fitToContent()
}

function rebuildRoute() {
  if (!map || !routeLayer) return
  routeLayer.clearLayers()

  const geometry = props.routeGeometry
  if (!geometry || geometry.length < 2) return

  const latLngs = geometry.map(([lng, lat]) => [lat, lng])
  L.polyline(latLngs, {
    color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#2980b9',
    weight: 4,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(routeLayer)
}

function fitToContent() {
  if (!map) return
  if (props.waypoints.length === 0) return
  if (props.waypoints.length === 1) {
    map.setView([props.waypoints[0].lat, props.waypoints[0].lng], 14, { animate: true })
    return
  }
  const bounds = L.latLngBounds(props.waypoints.map((w) => [w.lat, w.lng]))
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true })
}

onMounted(async () => {
  await nextTick()
  map = L.map(rootRef.value, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 2,
    maxZoom: 19
  }).setView([46.7, 2.5], 5)

  tileLayer = L.tileLayer(tileUrl.value, {
    attribution: tileAttribution.value,
    maxZoom: 19
  }).addTo(map)
  applyMapFilter()

  markerLayer = L.layerGroup().addTo(map)
  routeLayer = L.layerGroup().addTo(map)

  map.on('click', (event) => {
    emit('map-click', { lat: event.latlng.lat, lng: event.latlng.lng })
  })

  rebuildMarkers()
  rebuildRoute()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.waypoints, () => rebuildMarkers(), { deep: true })
watch(() => props.routeGeometry, () => rebuildRoute())

function applyMapFilter() {
  if (!rootRef.value) return
  rootRef.value.style.filter = mapFilter.value === 'none' ? '' : mapFilter.value
}

function swapTileLayer() {
  if (!map) return
  if (tileLayer) {
    map.removeLayer(tileLayer)
  }
  tileLayer = L.tileLayer(tileUrl.value, {
    attribution: tileAttribution.value,
    maxZoom: 19
  }).addTo(map)
  applyMapFilter()
}

watch(tileUrl, () => swapTileLayer())
watch(mapFilter, () => applyMapFilter())

defineExpose({
  fitToContent
})
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}
</style>
