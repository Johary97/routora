import { createApp } from 'vue'
import App from './App.vue'
import { ThemePlugin } from './theme/useTheme.js'

import 'leaflet/dist/leaflet.css'

// Baseline neutre (reset, atomes communs, leaflet integration)
import './styles/main.css'

// Tokens des thèmes — scopés via :root[data-theme-slug="..."],
// inactifs sauf pour le thème actif.
import './themes/field-companion/tokens.css'
import './themes/topographic/tokens.css'
import './themes/cyber-nav/tokens.css'

const app = createApp(App)
app.use(ThemePlugin)
app.mount('#app')
