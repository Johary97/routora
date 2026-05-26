<template>
  <div
    class="theme-boundary"
    :data-theme-slug="slug"
    :data-theme="mode"
    :style="{ opacity: transitioning ? 0.4 : 1 }"
  >
    <component :is="Layout">
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope || {}" />
      </template>
    </component>
    <div class="theme-copyright" aria-hidden="false">
      © 2026 — Johary ANDRIANJAFIMANOHISOLO · Développeur Informatique
    </div>
  </div>
</template>

<script setup>
import { useTheme } from './useTheme.js'

const { slug, mode, Layout, transitioning } = useTheme()
</script>

<style scoped>
.theme-boundary {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: opacity 140ms ease-out;
}

.theme-copyright {
  position: fixed;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  padding: 4px 10px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--surface-background, #fff) 70%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid var(--border-soft, rgba(127, 127, 127, 0.18));
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-subtle, var(--color-muted, #888));
  white-space: nowrap;
  max-width: calc(100vw - 24px);
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .theme-copyright {
    font-size: 0.55rem;
    letter-spacing: 0.06em;
    padding: 3px 8px;
  }
}
</style>
