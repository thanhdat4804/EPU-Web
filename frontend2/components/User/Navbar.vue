<template>
  <div class="relative">
    <header
      class="flex items-center justify-between px-8 py-3 border-b border-gray-200 bg-white relative z-50"
    >
      <div class="flex items-center space-x-6">
        <!-- Logo -->
        <div class="text-2xl font-bold text-blue-600">catawiki</div>

        <!-- Nút Categories -->
        <button
          @click="toggleCategories"
          class="text-sm font-medium hover:text-blue-600 flex items-center"
        >
          Categories
          <span
            class="ml-1 transition-transform duration-200"
            :class="{ 'rotate-180': showCategories }"
          >
            ⌄
          </span>
        </button>

        <!-- Ô tìm kiếm -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search for brand, model, artist..."
            class="border border-gray-300 rounded-full px-4 py-1 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Menu bên phải -->
      <div class="flex items-center space-x-5 text-sm">
        <a href="#">How it works?</a>
        <a href="#">Help</a>
        <button class="hover:text-blue-600">❤️</button>
        <button class="hover:text-blue-600">🌐 EN</button>
        <button
          class="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
        >
          <span>👤</span><span>Nhã</span>
        </button>
      </div>
    </header>

    <!-- 👇 Đưa panel ra ngoài header -->
    <CategoriesPanel
      v-if="showCategories"
      @close="showCategories = false"
      class="fixed top-[64px] left-0 w-full z-40"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CategoriesPanel from '~/components/User/CategoriesPanel.vue'

const showCategories = ref(false)
const toggleCategories = () => (showCategories.value = !showCategories.value)
</script>
