import { createApp } from 'vue'
import App from './App.vue'
import { ThemePlugin } from './theme/useTheme.js'

import 'leaflet/dist/leaflet.css'
import './styles/main.css'

// Tokens scopés via :root[data-theme-slug="..."], inactifs hors thème actif.
import './themes/field-companion/tokens.css'
import './themes/topographic/tokens.css'
import './themes/cyber-nav/tokens.css'

const app = createApp(App)
app.use(ThemePlugin)
app.mount('#app')
