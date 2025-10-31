<template>
  <div>
    <button
      @click="toggle"
      :class="[
        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors',
        'hover:bg-gray-800 text-gray-300'
      ]"
    >
      <div class="flex items-center gap-3">
        <component :is="iconComponent" class="w-5 h-5 flex-shrink-0" />
        <transition name="fade">
          <span v-if="isOpen" class="text-sm font-medium">{{ title }}</span>
        </transition>
      </div>
      <transition name="fade">
        <svg
          v-if="isOpen"
          :class="['w-4 h-4 transition-transform', expanded ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </transition>
    </button>

    <!-- Submenu -->
    <transition name="slide">
      <div v-if="expanded && isOpen" class="mt-1 ml-8 space-y-1">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="[
            'block px-3 py-2 text-sm rounded-lg transition-colors',
            'hover:bg-gray-800',
            isItemActive(item.to) ? 'bg-blue-600 text-white' : 'text-gray-400'
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: String,
  icon: String,
  items: Array,
  isOpen: Boolean
})

const route = useRoute()
const expanded = ref(false)

const toggle = () => {
  if (props.isOpen) {
    expanded.value = !expanded.value
  }
}

const isItemActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Icon components
const icons = {
  gavel: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>`
  },
  users: {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
  }
}

const iconComponent = computed(() => icons[props.icon] || icons.gavel)
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>