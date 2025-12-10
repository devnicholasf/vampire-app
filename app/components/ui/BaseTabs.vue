<template>
  <div :class="tabsClasses">
    <!-- Tab Headers -->
    <div class="flex border-b border-border-primary">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="getTabHeaderClasses(index)"
        @click="setActiveTab(index)"
        :disabled="tab.disabled"
      >
        <span v-if="tab.icon" class="mr-2">{{ tab.icon }}</span>
        {{ tab.label }}
        <BaseBadge
          v-if="tab.badge"
          :variant="activeTabIndex === index ? 'primary' : 'ghost'"
          size="xs"
          class="ml-2"
        >
          {{ tab.badge }}
        </BaseBadge>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content" :class="contentClasses">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        v-show="activeTabIndex === index"
        :class="tabPanelClasses"
      >
        <slot :name="`tab-${index}`" :tab="tab" :index="index">
          <div v-if="tab.content" v-html="tab.content"></div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// BaseTabs - Sistema de abas reutilizável
// ============================================
import { computed, ref, watch } from 'vue'

interface Tab {
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  content?: string
}

interface Props {
  tabs: Tab[]
  modelValue?: number
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  vertical?: boolean
  fullWidth?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', index: number, tab: Tab): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  variant: 'default',
  size: 'md',
  vertical: false,
  fullWidth: false
})

const emit = defineEmits<Emits>()

const activeTabIndex = ref(props.modelValue)

const tabsClasses = computed(() => [
  'tabs-container',
  {
    'flex': props.vertical,
    'flex-col': !props.vertical,
    'w-full': props.fullWidth
  }
])

const contentClasses = computed(() => [
  'pt-4',
  {
    'flex-1 ml-4': props.vertical
  }
])

const tabPanelClasses = computed(() => [
  'tab-panel',
  'focus:outline-none'
])

const getTabHeaderClasses = (index: number) => {
  const isActive = activeTabIndex.value === index
  const tab = props.tabs[index]

  const baseClasses = [
    'px-4 py-2 font-medium text-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]

  if (props.variant === 'pills') {
    baseClasses.push(
      'rounded-md mr-1',
      isActive
        ? 'bg-brand-primary text-black shadow-sm'
        : 'text-text-muted hover:text-text-primary hover:bg-surface-card-hover'
    )
  } else if (props.variant === 'underline') {
    baseClasses.push(
      'border-b-2',
      isActive
        ? 'border-brand-primary text-brand-primary'
        : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-secondary'
    )
  } else {
    // Default variant
    baseClasses.push(
      'border-b-2',
      isActive
        ? 'border-brand-primary text-brand-primary bg-surface-card'
        : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-secondary'
    )
  }

  if (tab?.disabled) {
    baseClasses.push('cursor-not-allowed')
  } else {
    baseClasses.push('cursor-pointer')
  }

  return baseClasses
}

const setActiveTab = (index: number) => {
  if (props.tabs[index]?.disabled) return
  
  const tab = props.tabs[index]
  if (!tab) return
  
  activeTabIndex.value = index
  emit('update:modelValue', index)
  emit('change', index, tab)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  activeTabIndex.value = newValue
})
</script>

<style scoped>
.tab-panel {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>