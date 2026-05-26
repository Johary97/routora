<template>
  <div class="topo-shell">
    <header class="topo-header">
      <div class="topo-brand">
        <slot name="brand" />
      </div>
      <div class="topo-header-actions">
        <slot name="header-actions" />
        <ThemeSwitcher />
        <button
          type="button"
          class="topo-mode-toggle"
          :aria-label="mode === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'"
          @click="toggleMode"
        >
          <svg v-if="mode === 'dark'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="topo-main">
      <div class="topo-map" aria-label="Carte topographique">
        <slot name="map" />
      </div>

      <aside class="topo-side" aria-label="Étapes">
        <div class="topo-side-inner">
          <section class="topo-block">
            <h2 class="topo-section-title">Repérer</h2>
            <slot name="address-search" />
            <slot name="route-controls" />
          </section>

          <section class="topo-block">
            <h2 class="topo-section-title">Itinéraire</h2>
            <slot name="waypoints" />
            <slot name="actions" />
          </section>

          <section class="topo-block">
            <slot name="stats" />
            <slot name="errors" />
          </section>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()
</script>

<style scoped>
.topo-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--body-background);
  color: var(--color-text);
  font-family: var(--font-sans);
  background-image:
    radial-gradient(circle at 25% 30%, rgba(120, 113, 108, 0.06) 1px, transparent 1px),
    radial-gradient(circle at 75% 70%, rgba(120, 113, 108, 0.06) 1px, transparent 1px);
  background-size: 32px 32px, 32px 32px;
  background-position: 0 0, 16px 16px;
}

.topo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--border-color);
  background: var(--navbar-background);
  flex: none;
}

.topo-brand {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

.topo-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.topo-mode-toggle {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-solid);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 500ms ease, color 500ms ease;
}

.topo-mode-toggle:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.topo-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  min-height: 0;
}

.topo-map {
  position: relative;
  border-right: 2px solid var(--border-color);
  display: flex;
  min-height: 0;
}

.topo-map :deep(.map-view) {
  flex: 1;
  border-radius: 0;
  border: none;
}

.topo-side {
  overflow-y: auto;
  background: var(--surface-background);
  border-left: 1px solid var(--border-color);
}

.topo-side-inner {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem;
}

.topo-block {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.topo-section-title {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin: 0;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--color-heading);
}

@media (max-width: 900px) {
  .topo-main {
    grid-template-columns: 1fr;
    grid-template-rows: 50vh 1fr;
  }
  .topo-map {
    border-right: none;
    border-bottom: 2px solid var(--border-color);
  }
  .topo-side {
    border-left: none;
  }
}
</style>
