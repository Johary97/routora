<template>
  <div class="topo-shell">
    <header class="topo-header">
      <div class="topo-brand">
        <slot name="brand" />
      </div>
      <div class="topo-header-actions">
        <slot name="header-actions" />
      </div>
    </header>

    <main class="topo-main">
      <div class="topo-map" aria-label="Carte topographique">
        <slot name="map" />
      </div>

      <aside class="topo-side" aria-label="Étapes">
        <div class="topo-side-inner">
          <section class="topo-block">
            <h2 class="topo-section-title">Localisation</h2>
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

    <AppFab />
  </div>
</template>

<script setup>
import AppFab from '@components/AppFab.vue'
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
