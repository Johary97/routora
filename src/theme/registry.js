import fieldCompanion from '@themes/field-companion/manifest.js'
import topographic from '@themes/topographic/manifest.js'
import cyberNav from '@themes/cyber-nav/manifest.js'

import FieldCompanionLayout from '@themes/field-companion/Layout.vue'
import TopographicLayout from '@themes/topographic/Layout.vue'
import CyberNavLayout from '@themes/cyber-nav/Layout.vue'

export const THEME_REGISTRY = {
  'field-companion': { manifest: fieldCompanion, Layout: FieldCompanionLayout },
  topographic: { manifest: topographic, Layout: TopographicLayout },
  'cyber-nav': { manifest: cyberNav, Layout: CyberNavLayout }
}

export const THEME_LIST = Object.values(THEME_REGISTRY).map((t) => t.manifest)

export const DEFAULT_THEME_SLUG = 'field-companion'

export function getTheme(slug) {
  return THEME_REGISTRY[slug] || THEME_REGISTRY[DEFAULT_THEME_SLUG]
}
