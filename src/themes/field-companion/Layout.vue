<template>
  <div class="fc-shell">
    <header class="fc-header">
      <slot name="brand" />
      <div class="fc-header-actions">
        <slot name="header-actions" />
      </div>
    </header>

    <!-- Desktop : panel 400px + carte. Mobile : carte plein écran + bottom-sheet 3 paliers. -->
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

      <button
        type="button"
        class="fc-sheet-handle"
        :aria-label="`Bottom sheet : ${sheetState}`"
        @click="cycleSheet"
      >
        <span class="fc-sheet-grip" aria-hidden="true" />
      </button>
    </main>

    <AppFab />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppFab from '@components/AppFab.vue'

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

.fc-sheet-handle {
  display: none;
}

/* Mobile : bottom-sheet 3 paliers, carte en arrière-plan. */
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
