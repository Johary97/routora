<template>
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-value">{{ stopsLabel }}</span>
      <span class="stat-label">étapes</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ distanceLabel }}</span>
      <span class="stat-label">distance</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ durationLabel }}</span>
      <span class="stat-label">durée estimée</span>
    </div>
    <div v-if="improvementPct > 0" class="stat improvement">
      <span class="stat-value">−{{ improvementPct.toFixed(0) }}%</span>
      <span class="stat-label">gain optimisation</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDuration } from '../services/route-optimizer.js'

const props = defineProps({
  stops: { type: Number, default: 0 },
  distanceKm: { type: Number, default: 0 },
  durationMin: { type: Number, default: 0 },
  improvementPct: { type: Number, default: 0 }
})

const stopsLabel = computed(() => (props.stops > 1 ? `${props.stops - 1}` : '0'))
const distanceLabel = computed(() => {
  if (!props.distanceKm) return '—'
  if (props.distanceKm < 1) return `${Math.round(props.distanceKm * 1000)} m`
  return `${props.distanceKm.toFixed(props.distanceKm < 10 ? 1 : 0)} km`
})
const durationLabel = computed(() => (props.durationMin > 0 ? formatDuration(props.durationMin) : '—'))
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat.improvement .stat-value {
  color: var(--success-color);
}
</style>
