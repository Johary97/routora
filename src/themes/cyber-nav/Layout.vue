<template>
  <div class="cn-shell">
    <header class="cn-header">
      <div class="cn-brand">
        <slot name="brand" />
      </div>
      <div class="cn-header-actions">
        <slot name="header-actions" />
      </div>
    </header>

    <main class="cn-main">
      <div class="cn-map" aria-label="Carte navigation">
        <slot name="map" />
      </div>

      <div class="cn-scanline" aria-hidden="true" />

      <div class="cn-hud cn-hud-tl">
        <div class="cn-hud-label">SPEED</div>
        <div class="cn-hud-value">{{ hud.speed }} <span class="cn-hud-unit">km/h</span></div>
      </div>

      <div class="cn-hud cn-hud-tr">
        <div class="cn-hud-label">ETA</div>
        <div class="cn-hud-value">{{ hud.eta }}</div>
      </div>

      <div class="cn-hud cn-hud-bl">
        <div class="cn-hud-label">NEXT</div>
        <div class="cn-hud-value cn-hud-value-sm">{{ hud.next }}</div>
      </div>

      <div class="cn-hud cn-hud-br">
        <div class="cn-hud-label">WX</div>
        <div class="cn-hud-value">{{ hud.weather }}</div>
      </div>

      <aside class="cn-panel" aria-label="Console étapes">
        <div class="cn-panel-bar">
          <span class="cn-panel-title">// ROUTE.OPS</span>
          <button type="button" class="cn-panel-toggle" @click="panelOpen = !panelOpen">
            {{ panelOpen ? '−' : '+' }}
          </button>
        </div>
        <div v-show="panelOpen" class="cn-panel-body">
          <slot name="address-search" />
          <slot name="route-controls" />
          <slot name="waypoints" />
          <slot name="actions" />
          <slot name="stats" />
          <slot name="errors" />
        </div>
      </aside>
    </main>

    <AppFab />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppFab from '@components/AppFab.vue'

const panelOpen = ref(true)

// HUD purement décoratif.
const hud = ref({
  speed: '00',
  eta: '--:--',
  next: 'STDBY',
  weather: '21°C'
})
</script>

<style scoped>
.cn-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--body-background);
  color: var(--color-text);
  font-family: var(--font-mono);
}

.cn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-soft);
  flex: none;
  z-index: 30;
}

.cn-brand {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.85rem;
}

.cn-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* Évite le chevauchement avec le HUD bottom-right. */
.cn-shell :deep(.app-fab) {
  bottom: 5.5rem;
  right: 1rem;
}

@media (max-width: 900px) {
  .cn-shell :deep(.app-fab) {
    bottom: 1rem;
    right: 1rem;
  }
}

.cn-main {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.cn-map {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
}

.cn-map :deep(.map-view) {
  flex: 1;
  border-radius: 0;
  border: none;
}

.cn-scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(34, 211, 238, 0) 40%,
    rgba(34, 211, 238, 0.12) 50%,
    rgba(34, 211, 238, 0) 60%,
    transparent 100%
  );
  background-size: 100% 200%;
  animation: cn-scan 4s linear infinite;
}

@keyframes cn-scan {
  0% {
    background-position: 0% -100%;
  }
  100% {
    background-position: 0% 200%;
  }
}

.cn-hud {
  position: absolute;
  z-index: 10;
  padding: 0.5rem 0.75rem;
  background: var(--surface-background);
  border: 1px solid var(--border-soft);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.18);
  font-family: var(--font-mono);
  min-width: 95px;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.cn-hud-tl {
  top: 1rem;
  left: 1rem;
}

.cn-hud-tr {
  top: 1rem;
  right: 1rem;
}

.cn-hud-bl {
  bottom: 1rem;
  left: 1rem;
}

.cn-hud-br {
  bottom: 1rem;
  right: 1rem;
}

.cn-hud-label {
  font-size: 0.6rem;
  color: var(--primary-color);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cn-hud-value {
  font-size: 1.05rem;
  color: var(--color-heading);
  letter-spacing: 0.05em;
  font-weight: 500;
  margin-top: 0.15rem;
}

.cn-hud-value-sm {
  font-size: 0.8rem;
}

.cn-hud-unit {
  font-size: 0.65rem;
  color: var(--color-muted);
}

.cn-panel {
  position: absolute;
  top: 1rem;
  right: 5.5rem;
  width: 360px;
  max-height: calc(100vh - 8rem);
  z-index: 20;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  box-shadow: 0 0 24px rgba(6, 182, 212, 0.22);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
}

.cn-panel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface-solid);
}

.cn-panel-title {
  font-size: 0.7rem;
  color: var(--primary-color);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.cn-panel-toggle {
  width: 22px;
  height: 22px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--primary-color);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  line-height: 1;
}

.cn-panel-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.85rem;
  overflow-y: auto;
}

@media (max-width: 900px) {
  .cn-panel {
    position: static;
    width: 100%;
    max-height: 50vh;
    top: auto;
    right: auto;
    margin: 0;
    border: none;
    border-top: 1px solid var(--border-color);
  }
  .cn-main {
    display: flex;
    flex-direction: column;
  }
  .cn-map {
    position: relative;
    flex: 1;
    min-height: 40vh;
  }
  .cn-hud-tr,
  .cn-hud-br {
    display: none; /* collision avec le panel mobile */
  }
}
</style>
