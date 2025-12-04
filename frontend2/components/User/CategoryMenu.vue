<template>
  <div class="relative bg-white">
    <!-- Nền trắng + giới hạn chiều rộng, căn giữa -->
    <div class="max-w-7xl mx-auto relative">

      <!-- Nút trái -->
      <button @click="scrollLeft"
        class="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-white via-white to-transparent flex items-center justify-center">
        <ChevronLeft class="w-7 h-7 text-gray-500 hover:text-blue-600 transition" />
      </button>

      <!-- Thanh category – không full width, căn giữa -->
      <div ref="scrollContainer"
     class="flex gap-10 overflow-x-auto no-scrollbar px-20 py-6 scroll-smooth">

        <!-- All -->
        <button @click="$emit('select', 'all')"
                class="relative flex flex-col items-center group transition-all duration-300 min-w-fit pb-3"
                :class="selected === 'all' ? 'text-blue-600' : 'text-gray-600'">

          <div class="w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-all"
              :class="selected === 'all' ? 'bg-blue-100' : 'bg-transparent group-hover:bg-blue-50'">
            <svg class="w-7 h-7 transition-colors"
                :class="selected === 'all' ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16M10 4v16" />
            </svg>
          </div>

          <span class="text-sm font-medium whitespace-nowrap">All</span>

          <!-- Gạch chân xanh khi active -->
          <div v-if="selected === 'all'"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full transition-all duration-300"></div>
        </button>

        <!-- Các category khác -->
        <button v-for="cat in categories" :key="cat.id"
                @click="$emit('select', cat.id)"
                class="relative flex flex-col items-center group transition-all duration-300 min-w-fit pb-3"
                :class="selected === cat.id ? 'text-blue-600' : 'text-gray-600'">

          <div class="w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-all"
              :class="selected === cat.id ? 'bg-blue-100' : 'bg-transparent group-hover:bg-blue-50'">
            <component :is="getCategoryIcon(cat.name)"
                      class="w-7 h-7 transition-colors duration-300"
                      :class="selected === cat.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'" />
          </div>

          <span class="text-sm font-medium whitespace-nowrap">
            {{ cat.name }}
          </span>

          <!-- Gạch chân xanh khi active -->
          <div v-if="selected === cat.id"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-blue-600  transition-all duration-300"></div>
        </button> 
      </div>

      <!-- Nút phải -->
      <button @click="scrollRight"
        class="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-white via-white to-transparent flex items-center justify-center">
        <ChevronRight class="w-7 h-7 text-gray-500 hover:text-blue-600 transition" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { 
  Palette, Gem, Car, BookOpen, Shirt, Coins, Home, ScrollText, Globe, Camera, Mountain, Archive
} from 'lucide-vue-next'

defineProps({ categories: Array, selected: [String, Number] })
defineEmits(['select'])

const scrollContainer = ref<HTMLElement | null>(null)
const scrollLeft = () => scrollContainer.value?.scrollBy({ left: -280, behavior: 'smooth' })
const scrollRight = () => scrollContainer.value?.scrollBy({ left: 280, behavior: 'smooth' })

// Icon mapping (cập nhật thêm cho đủ)
const getCategoryIcon = (name: string) => {
  const map: Record<string, any> = {
    'art': Palette,
    'jewellery': Gem, 'jewelry': Gem, 'precious': Gem,
    'classic cars': Car, 'car': Car, 'motorcycle': Car,
    'books': BookOpen, 'comics': BookOpen, 'history': Archive,
    'fashion': Shirt,
    'coins': Coins, 'stamps': Coins,
    'interiors': Home, 'decorations': Home,
    'asian': Globe, 'tribal': ScrollText,
    'archaeology': Archive, 'natural': Mountain,
    'photography': Camera
  }

  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(map)) {
    if (lower.includes(key)) return icon
  }
  return Palette
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>