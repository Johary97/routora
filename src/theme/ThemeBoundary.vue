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
</style>
