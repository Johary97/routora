<template>
  <div class="cn-shell">
    <header class="cn-header">
      <div class="cn-brand">
        <slot name="brand" />
      </div>
      <div class="cn-header-actions">
        <slot name="header-actions" />
        <ThemeSwitcher />
        <button
          type="button"
          class="cn-mode-toggle"
          :aria-label="mode === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'"
          @click="toggleMode"
        >
          <svg v-if="mode === 'dark'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="cn-main">
      <!-- Map en background plein -->
      <div class="cn-map" aria-label="Carte navigation">
        <slot name="map" />
      </div>

      <!-- Scanline overlay -->
      <div class="cn-scanline" aria-hidden="true" />

      <!-- HUD aux 4 coins -->
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

      <!-- Panneau opérations à droite (au-dessus de la map) -->
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()
const panelOpen = ref(true)

// Données HUD fake — purement décoratives
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

.cn-mode-toggle {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-solid);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cn-mode-toggle:hover {
  box-shadow: 0 0 8px var(--primary-shadow);
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

/* Scanline */
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

/* HUD aux 4 coins */
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

/* Panel droit */
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
    display: none; /* éviter de coller au panel mobile */
  }
}
</style>
