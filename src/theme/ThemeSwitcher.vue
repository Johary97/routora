<template>
  <div ref="rootRef" class="theme-switcher">
    <button
      type="button"
      class="ts-trigger"
      :title="'Choisir le thème'"
      :aria-haspopup="'listbox'"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggleOpen"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
      </svg>
      <span class="ts-label">{{ active.name }}</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropdownRef"
        class="ts-menu"
        role="listbox"
        aria-label="Choisir le thème"
        :style="dropdownStyle"
      >
        <button
          v-for="m in availableThemes"
          :key="m.slug"
          type="button"
          role="option"
          :aria-selected="m.slug === slug ? 'true' : 'false'"
          :class="['ts-option', { 'is-active': m.slug === slug }]"
          @click="onPick(m.slug)"
        >
          <span class="ts-swatch" :style="{ background: m.swatch }" aria-hidden="true" />
          <span class="ts-option-body">
            <span class="ts-option-name">
              {{ m.name }}
              <svg v-if="m.slug === slug" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span class="ts-option-desc">{{ m.description }}</span>
          </span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { useTheme } from './useTheme.js'

const { slug, switchTheme, availableThemes } = useTheme()
const open = ref(false)
const rootRef = ref(null)
const dropdownRef = ref(null)
const coords = ref(null)

const active = computed(
  () => availableThemes.value.find((m) => m.slug === slug.value) || availableThemes.value[0]
)

const dropdownStyle = computed(() => {
  if (!coords.value) return { visibility: 'hidden' }
  return {
    position: 'fixed',
    top: `${coords.value.top}px`,
    right: `${coords.value.right}px`,
    zIndex: 9999,
  }
})

function toggleOpen() {
  open.value = !open.value
}

function onPick(nextSlug) {
  switchTheme(nextSlug)
  open.value = false
}

function computeCoords() {
  if (!rootRef.value) return
  const r = rootRef.value.getBoundingClientRect()
  coords.value = { top: r.bottom + 8, right: window.innerWidth - r.right }
}

function onClickOutside(event) {
  if (!open.value) return
  const inRoot = rootRef.value && rootRef.value.contains(event.target)
  const inDropdown = dropdownRef.value && dropdownRef.value.contains(event.target)
  if (!inRoot && !inDropdown) open.value = false
}

function onKey(event) {
  if (event.key === 'Escape') open.value = false
}

watch(open, async (v) => {
  if (v) {
    await nextTick()
    computeCoords()
    window.addEventListener('scroll', computeCoords, true)
    window.addEventListener('resize', computeCoords)
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
  } else {
    coords.value = null
    window.removeEventListener('scroll', computeCoords, true)
    window.removeEventListener('resize', computeCoords)
    document.removeEventListener('mousedown', onClickOutside)
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', computeCoords, true)
  window.removeEventListener('resize', computeCoords)
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-flex;
}

.ts-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, #2a2a2a);
  background: transparent;
  color: var(--color-text, currentColor);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.ts-trigger:hover {
  border-color: var(--primary-color, currentColor);
  color: var(--primary-color, currentColor);
}

.ts-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-menu {
  width: 18rem;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--border-color, #2a2a2a);
  background: var(--surface-solid, var(--body-background, #fff));
  box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.25));
  overflow: hidden;
}

.ts-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.8rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-text, currentColor);
  transition: background 0.12s ease;
}

.ts-option:hover {
  background: var(--surface-2, rgba(127, 127, 127, 0.08));
}

.ts-option.is-active {
  background: var(--surface-2, rgba(127, 127, 127, 0.12));
}

.ts-swatch {
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, #2a2a2a);
}

.ts-option-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.ts-option-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-heading, var(--color-text, #111));
}

.ts-option-desc {
  font-size: 0.7rem;
  line-height: 1.3;
  color: var(--color-muted, #777);
}
</style>
