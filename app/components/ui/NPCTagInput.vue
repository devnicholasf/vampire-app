<template>
  <div>
    <label class="df-label mb-2">{{ label }}</label>
    <div class="df-tag-container">
      <div v-if="modelValue.length > 0" class="df-tags-wrapper">
        <div
          v-for="(tag, index) in modelValue"
          :key="index"
          class="df-tag"
        >
          <span class="df-tag-icon w-3 h-3">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>
          </span>
          <span class="df-tag-text">{{ tag }}</span>
          <button
            type="button"
            @click="removeTag(index)"
            class="df-tag-remove"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="df-tag-input-wrapper">
        <input
          v-model="newTag"
          type="text"
          :placeholder="placeholder"
          @keydown.enter.prevent="addTag"
          @keydown.comma.prevent="addTag"
          class="df-tag-input"
        />
        <div class="df-tag-hint">Enter para adicionar</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  label: string
  placeholder: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const newTag = ref('')

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-gold, #d4a647);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.df-tag-container {
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  background: var(--df-bg-input, #0d0d20);
  padding: 0.75rem;
  transition: all 0.2s;
}

.df-tag-container:focus-within {
  border-color: var(--df-red, #dc2626);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
}

.df-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.df-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: white;
  animation: tagEnter 0.2s ease;
}

@keyframes tagEnter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.df-tag-icon {
  font-size: 0.75rem;
}

.df-tag-text {
  font-weight: 500;
}

.df-tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  background: transparent;
  border: none;
  color: var(--df-red, #dc2626);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.df-tag-remove:hover {
  background: rgba(220, 38, 38, 0.2);
  color: white;
}

.df-tag-input-wrapper {
  position: relative;
}

.df-tag-input {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.875rem;
  outline: none;
}

.df-tag-input::placeholder {
  color: var(--df-muted, #6b6b80);
}

.df-tag-hint {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.625rem;
  color: var(--df-muted, #6b6b80);
  pointer-events: none;
}
</style>
