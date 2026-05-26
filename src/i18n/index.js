import { createI18n } from 'vue-i18n'
import fr from './fr.json'
import en from './en.json'

const STORAGE_KEY = 'routora_locale'
const SUPPORTED = ['fr', 'en']
const FALLBACK = 'fr'

function detectLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED.includes(stored)) return stored
  } catch (_) {
    // localStorage indisponible (SSR, private mode strict) — on retombe sur navigator.
  }
  const nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || ''
  const short = nav.slice(0, 2).toLowerCase()
  if (SUPPORTED.includes(short)) return short
  return FALLBACK
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: FALLBACK,
  messages: { fr, en },
})

export function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch (_) {
    // Persistance best-effort.
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('lang', locale)
  }
}

export function getLocale() {
  return i18n.global.locale.value
}

export const SUPPORTED_LOCALES = SUPPORTED

export default i18n
