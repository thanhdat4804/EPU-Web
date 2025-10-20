<template>
  <div class="relative bg-white border-b">
    <!-- Nút mũi tên trái -->
    <button
      @click="scrollLeft"
      class="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-white via-white/80 to-transparent"
    >
      <ChevronLeft
        class="w-5 h-5 text-gray-600 hover:text-blue-600 transition"
      />
    </button>

    <!-- Thanh thể loại -->
    <div
      ref="scrollContainer"
      class="flex space-x-6 overflow-x-auto no-scrollbar px-10 py-3 scroll-smooth"
    >
      <button
        @click="$emit('select', 'all')"
        :class="[
          'text-sm whitespace-nowrap font-medium pb-1 border-b-2 transition',
          selected === 'all'
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-600 border-transparent hover:text-blue-500'
        ]"
      >
        All
      </button>

      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="$emit('select', cat.id)"
        :class="[
          'text-sm whitespace-nowrap font-medium pb-1 border-b-2 transition',
          selected === cat.id
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-600 border-transparent hover:text-blue-500'
        ]"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Nút mũi tên phải -->
    <button
      @click="scrollRight"
      class="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-white via-white/80 to-transparent"
    >
      <ChevronRight
        class="w-5 h-5 text-gray-600 hover:text-blue-600 transition"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps({
  categories: Array,
  selected: [String, Number]
})
defineEmits(['select'])

const scrollContainer = ref<HTMLElement | null>(null)

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({ left: -300, behavior: 'smooth' })
}

const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: 300, behavior: 'smooth' })
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
}
</style>
