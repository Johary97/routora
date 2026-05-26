<template>
  <div class="waypoint-list">
    <div v-if="waypoints.length === 0" class="empty-state">
      <p>{{ t('waypoints.empty') }}</p>
      <p class="hint">{{ t('waypoints.addHint') }}</p>
    </div>

    <draggable
      v-else
      :model-value="waypoints"
      @update:model-value="$emit('reorder', $event)"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost-card"
      animation="180"
    >
      <template #item="{ element, index }">
        <div :class="['waypoint-card', { 'is-origin': index === 0 }]">
          <div class="drag-handle" :title="index === 0 ? t('waypoints.origin') : t('waypoints.dragHint')">
            <span v-if="index === 0" class="origin-mark">★</span>
            <span v-else class="order-number">{{ index }}</span>
          </div>

          <div class="waypoint-body">
            <div class="waypoint-label">
              {{ element.label || (index === 0 ? t('waypoints.origin') : t('waypoints.stop', { index })) }}
            </div>
            <div class="waypoint-coords">
              {{ element.lat.toFixed(5) }}, {{ element.lng.toFixed(5) }}
            </div>
          </div>

          <button
            type="button"
            class="remove-btn"
            :title="index === 0 ? t('waypoints.removeOrigin') : t('waypoints.removeStop')"
            @click="$emit('remove', element.id)"
            :aria-label="t('common.remove')"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  waypoints: { type: Array, required: true }
})

defineEmits(['reorder', 'remove'])
</script>

<style scoped>
.waypoint-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  padding: 1.5rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--color-muted);
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-subtle);
}

.waypoint-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), transform var(--transition-fast),
    box-shadow var(--transition-fast);
  margin-bottom: 0.5rem;
}

.waypoint-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.waypoint-card.is-origin {
  border-color: var(--success-color);
  background: linear-gradient(to right, var(--success-bg), var(--surface-elevated) 60%);
}

.drag-handle {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: grab;
  user-select: none;
}

.waypoint-card.is-origin .drag-handle {
  background: var(--success-color);
  cursor: default;
}

.drag-handle:active {
  cursor: grabbing;
}

.waypoint-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.waypoint-label {
  font-size: 0.875rem;
  color: var(--color-heading);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waypoint-coords {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-subtle);
}

.remove-btn {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.remove-btn:hover {
  color: var(--error-color);
  border-color: var(--error-color);
  background: var(--error-bg);
}

.ghost-card {
  opacity: 0.4;
  border-style: dashed;
}
</style>
