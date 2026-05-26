<template>
  <div class="address-search" :class="{ 'has-results': showResults }">
    <div class="search-row">
      <svg viewBox="0 0 24 24" class="search-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        :placeholder="placeholder || t('addressSearch.placeholder')"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="onEnter"
        @keydown.down.prevent="moveSelection(1)"
        @keydown.up.prevent="moveSelection(-1)"
        @keydown.esc="hide"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button v-if="query" type="button" class="clear-btn" @mousedown.prevent="clear" :aria-label="t('common.clear')">✕</button>
    </div>

    <div v-if="showResults" class="results-pane">
      <div v-if="loading" class="results-status">{{ t('addressSearch.loading') }}</div>
      <div v-else-if="error" class="results-status error">{{ error }}</div>
      <div v-else-if="results.length === 0 && query.length >= 3" class="results-status">
        {{ t('addressSearch.noResults') }}
      </div>
      <ul v-else class="results-list" role="listbox">
        <li
          v-for="(item, index) in results"
          :key="`${item.lat}-${item.lng}-${index}`"
          :class="['result-item', { active: index === activeIndex }]"
          @mousedown.prevent="select(item)"
          @mouseenter="activeIndex = index"
          role="option"
          :aria-selected="index === activeIndex"
        >
          <span class="result-primary">{{ item.shortLabel }}</span>
          <span class="result-secondary">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { searchAddress } from '../services/geocoding.js'

const { t } = useI18n()

defineProps({
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const inputRef = ref(null)
const query = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')
const activeIndex = ref(-1)
const focused = ref(false)

let debounceTimer = null
let currentController = null

const showResults = computed(() => focused.value && (loading.value || error.value || results.value.length > 0 || query.value.length >= 3))

function runSearch(value) {
  clearTimeout(debounceTimer)
  if (currentController) {
    currentController.abort()
    currentController = null
  }

  if (!value || value.trim().length < 3) {
    results.value = []
    loading.value = false
    error.value = ''
    return
  }

  debounceTimer = setTimeout(async () => {
    loading.value = true
    error.value = ''
    currentController = new AbortController()
    try {
      results.value = await searchAddress(value, { limit: 6, signal: currentController.signal })
      activeIndex.value = results.value.length > 0 ? 0 : -1
    } catch (e) {
      if (e.name !== 'AbortError') {
        error.value = e.message || t('addressSearch.errorGeneric')
        results.value = []
      }
    } finally {
      loading.value = false
      currentController = null
    }
  }, 350)
}

watch(query, runSearch)

function moveSelection(direction) {
  if (results.value.length === 0) return
  const len = results.value.length
  activeIndex.value = (activeIndex.value + direction + len) % len
}

function onEnter() {
  if (activeIndex.value < 0) return
  const item = results.value[activeIndex.value]
  if (item) select(item)
}

function select(item) {
  emit('select', item)
  query.value = ''
  results.value = []
  activeIndex.value = -1
  if (inputRef.value) inputRef.value.blur()
}

function clear() {
  query.value = ''
  results.value = []
  activeIndex.value = -1
  if (inputRef.value) inputRef.value.focus()
}

function hide() {
  if (inputRef.value) inputRef.value.blur()
}

function onFocus() {
  focused.value = true
}

function onBlur() {
  setTimeout(() => { focused.value = false }, 120)
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  if (currentController) currentController.abort()
})
</script>

<style scoped>
.address-search {
  position: relative;
  width: 100%;
}

.search-row {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: var(--color-muted);
  pointer-events: none;
}

.search-row input {
  width: 100%;
  padding-left: 32px;
  padding-right: 30px;
}

.clear-btn {
  position: absolute;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 12px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  color: var(--color-heading);
  background: var(--code-background);
}

.results-pane {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--surface-solid);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-modal);
  max-height: 320px;
  overflow-y: auto;
  z-index: 20;
}

.results-status {
  padding: 0.625rem 0.875rem;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.results-status.error {
  color: var(--error-color);
}

.results-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.result-item.active,
.result-item:hover {
  background: var(--code-background);
}

.result-primary {
  font-size: 0.875rem;
  color: var(--color-heading);
  font-weight: 500;
}

.result-secondary {
  font-size: 0.75rem;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
