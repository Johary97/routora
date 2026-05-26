<template>
  <div class="fc-shell">
    <!-- HEADER : compact, flotte au-dessus -->
    <header class="fc-header">
      <slot name="brand" />
      <div class="fc-header-actions">
        <slot name="header-actions" />
        <ThemeSwitcher />
        <button
          type="button"
          class="fc-mode-toggle"
          :aria-label="mode === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'"
          @click="toggleMode"
        >
          <svg v-if="mode === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- WORKSPACE :
         Desktop ≥1024 : panel 400px left + map droite
         Mobile : map full-screen + bottom-sheet 3 paliers -->
    <main class="fc-workspace" :data-sheet-state="sheetState">
      <section class="fc-panel" aria-label="Panneau étapes">
        <div class="fc-panel-inner">
          <slot name="address-search" />
          <slot name="route-controls" />
          <slot name="waypoints" />
          <slot name="actions" />
          <slot name="stats" />
          <slot name="errors" />
        </div>
      </section>

      <section class="fc-map" aria-label="Carte">
        <slot name="map" />
      </section>

      <!-- Handle pour la bottom-sheet (mobile uniquement) -->
      <button
        type="button"
        class="fc-sheet-handle"
        :aria-label="`Bottom sheet : ${sheetState}`"
        @click="cycleSheet"
      >
        <span class="fc-sheet-grip" aria-hidden="true" />
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()
const sheetState = ref('half') // collapsed | half | expanded

function cycleSheet() {
  sheetState.value =
    sheetState.value === 'collapsed'
      ? 'half'
      : sheetState.value === 'half'
        ? 'expanded'
        : 'collapsed'
}
</script>

<style scoped>
.fc-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: var(--body-background);
  color: var(--color-text);
  font-family: var(--font-sans);
}

.fc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--navbar-background);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-soft);
  z-index: 30;
  flex: none;
}

.fc-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.fc-mode-toggle {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-color);
  background: var(--surface-solid);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.fc-mode-toggle:hover {
  transform: translateY(-1px);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.fc-workspace {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
}

.fc-panel {
  width: 400px;
  flex: none;
  background: var(--body-background);
  border-right: 1px solid var(--border-soft);
  overflow-y: auto;
}

.fc-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.fc-map {
  flex: 1;
  position: relative;
  min-height: 0;
  display: flex;
}

.fc-map :deep(.map-view) {
  flex: 1;
  border-radius: 0;
  border: none;
}

/* Handle bottom-sheet : caché en desktop */
.fc-sheet-handle {
  display: none;
}

/* MOBILE — bottom-sheet 3 paliers, map plein écran en background */
@media (max-width: 1023px) {
  .fc-workspace {
    display: block;
  }

  .fc-map {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .fc-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-right: none;
    border-top: 1px solid var(--border-color);
    background: var(--surface-solid);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    z-index: 10;
    transition: height 240ms cubic-bezier(0.32, 0.72, 0, 1);
    overflow-y: auto;
  }

  .fc-workspace[data-sheet-state="collapsed"] .fc-panel {
    height: 80px;
  }

  .fc-workspace[data-sheet-state="half"] .fc-panel {
    height: 50vh;
  }

  .fc-workspace[data-sheet-state="expanded"] .fc-panel {
    height: 90vh;
  }

  .fc-sheet-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 50%;
    bottom: calc(80px - 16px);
    transform: translateX(-50%);
    width: 60px;
    height: 32px;
    background: var(--surface-solid);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    z-index: 20;
    transition: bottom 240ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .fc-workspace[data-sheet-state="half"] .fc-sheet-handle {
    bottom: calc(50vh - 16px);
  }

  .fc-workspace[data-sheet-state="expanded"] .fc-sheet-handle {
    bottom: calc(90vh - 16px);
  }

  .fc-sheet-grip {
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--color-muted);
  }
}
</style>
