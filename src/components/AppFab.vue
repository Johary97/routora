<template>
  <Teleport to="body">
  <div ref="rootRef" class="app-fab" :data-open="open ? 'true' : 'false'">
    <ul class="fab-actions" :aria-hidden="open ? 'false' : 'true'">
      <li class="fab-action">
        <span class="fab-label">Thème</span>
        <ThemeSwitcher />
      </li>

      <li class="fab-action">
        <span class="fab-label">{{ mode === 'dark' ? 'Mode clair' : 'Mode sombre' }}</span>
        <button
          type="button"
          class="fab-btn"
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
      </li>
    </ul>

    <button
      type="button"
      class="fab-main"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      aria-label="Paramètres"
      @click="toggleOpen"
    >
      <svg v-if="open" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()

const open = ref(false)
const rootRef = ref(null)

function toggleOpen() {
  open.value = !open.value
}

function onPointerDown(e) {
  if (!rootRef.value) return
  if (rootRef.value.contains(e.target)) return
  // Le ThemeSwitcher téléporte son dropdown dans body. Garde-le ouvert
  // si le clic est à l'intérieur — sinon on referme tout.
  if (e.target.closest && e.target.closest('[role="listbox"]')) return
  open.value = false
}

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

watch(open, (v) => {
  if (v) {
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('mousedown', onPointerDown)
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointerDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.app-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  font-family: var(--font-sans, system-ui, sans-serif);
}

.fab-actions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  transform-origin: bottom right;
  transition: opacity 220ms ease, transform 220ms ease;
}

.app-fab[data-open="false"] .fab-actions {
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
}

.app-fab[data-open="true"] .fab-actions {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.fab-action {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.fab-label {
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-md, 8px);
  background: var(--primary-color, #2563eb);
  color: #fff;
  font-size: 0.7rem;
  white-space: nowrap;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.18));
}

.fab-btn {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-pill, 999px);
  border: none;
  background: var(--primary-color, #2563eb);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.18));
  transition: transform 0.15s ease;
}

.fab-btn:hover {
  transform: scale(1.08);
}

.fab-btn:focus-visible {
  outline: 2px solid var(--primary-color, #2563eb);
  outline-offset: 2px;
}

.fab-main {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-pill, 999px);
  border: none;
  background: var(--primary-color, #2563eb);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg, 0 12px 28px rgba(0, 0, 0, 0.22));
  transition: transform 0.15s ease;
}

.fab-main:hover {
  transform: scale(1.08);
}

.fab-main:focus-visible {
  outline: 2px solid var(--primary-color, #2563eb);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .app-fab {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
