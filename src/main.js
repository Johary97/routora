import { createApp } from 'vue'
import App from './App.vue'
import { ThemePlugin } from './theme/useTheme.js'
import i18n, { getLocale } from './i18n/index.js'

import 'leaflet/dist/leaflet.css'
import './styles/main.css'

// Tokens scopés via :root[data-theme-slug="..."], inactifs hors thème actif.
import './themes/field-companion/tokens.css'
import './themes/topographic/tokens.css'
import './themes/cyber-nav/tokens.css'

if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.setAttribute('lang', getLocale())
}

const app = createApp(App)
app.use(i18n)
app.use(ThemePlugin)
app.mount('#app')
