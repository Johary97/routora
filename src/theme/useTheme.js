import { ref, computed, readonly, inject, watch } from 'vue'
import { DEFAULT_THEME_SLUG, THEME_REGISTRY, getTheme, THEME_LIST } from './registry.js'

const STORAGE_KEY = 'routora.theme-slug'
const MODE_STORAGE_KEY = 'routora.theme-mode'
export const THEME_INJECTION_KEY = Symbol('routora-theme')

function readPersistedSlug() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && THEME_REGISTRY[v]) return v
  } catch {
    /* localStorage indisponible */
  }
  return DEFAULT_THEME_SLUG
}

function readPersistedMode(defaultMode) {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* localStorage indisponible */
  }
  return defaultMode
}

export function createThemeStore() {
  const slug = ref(readPersistedSlug())
  const initialManifest = getTheme(slug.value).manifest
  const mode = ref(readPersistedMode(initialManifest.defaultMode || 'light'))
  const transitioning = ref(false)

  const manifest = computed(() => getTheme(slug.value).manifest)
  const Layout = computed(() => getTheme(slug.value).Layout)
  const availableThemes = computed(() => THEME_LIST)

  function applyDom() {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme-slug', slug.value)
    document.documentElement.setAttribute('data-theme', mode.value)
  }

  function switchTheme(nextSlug) {
    if (!THEME_REGISTRY[nextSlug] || nextSlug === slug.value) return
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const apply = () => {
      slug.value = nextSlug
      // defaultMode du thème appliqué uniquement si aucune préférence persistée.
      const nextManifest = getTheme(nextSlug).manifest
      try {
        const stored = localStorage.getItem(MODE_STORAGE_KEY)
        if (!stored && nextManifest.defaultMode) mode.value = nextManifest.defaultMode
      } catch {
        /* no-op */
      }
    }

    if (prefersReducedMotion) {
      apply()
      return
    }
    transitioning.value = true
    window.setTimeout(() => {
      apply()
      window.setTimeout(() => {
        transitioning.value = false
      }, 140)
    }, 140)
  }

  function toggleMode() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  function setMode(next) {
    if (next === 'dark' || next === 'light') mode.value = next
  }

  // Persistance + DOM sync
  watch(
    slug,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, val)
      } catch {
        /* no-op */
      }
      applyDom()
    },
    { immediate: true }
  )

  watch(
    mode,
    (val) => {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, val)
      } catch {
        /* no-op */
      }
      applyDom()
    },
    { immediate: true }
  )

  return {
    slug: readonly(slug),
    mode: readonly(mode),
    manifest,
    Layout,
    availableThemes,
    transitioning: readonly(transitioning),
    switchTheme,
    toggleMode,
    setMode
  }
}

export const ThemePlugin = {
  install(app) {
    const store = createThemeStore()
    app.provide(THEME_INJECTION_KEY, store)
    app.config.globalProperties.$theme = store
  }
}

export function useTheme() {
  const store = inject(THEME_INJECTION_KEY, null)
  if (!store) {
    throw new Error('useTheme(): ThemePlugin must be installed via app.use(ThemePlugin).')
  }
  return store
}
