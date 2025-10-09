<template>
  <header class="w-full bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
      <!-- Logo + Categories -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo.svg" alt="BIDora" class="h-8" />
          <span class="text-2xl font-semibold text-blue-700">BIDora</span>
        </NuxtLink>

        <!-- Categories Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
          >
            Categories
            <svg
              class="w-4 h-4 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-if="showDropdown"
            class="absolute z-50 mt-2 w-56 bg-white border rounded-lg shadow-lg"
          >
            <ul class="divide-y divide-gray-100">
              <li
                v-for="(cat, i) in categories"
                :key="i"
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                {{ cat }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Search bar -->
      <div class="hidden md:flex flex-1 mx-8 max-w-lg">
        <input
          type="text"
          placeholder="Search for brand, model, artist..."
          class="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-4 text-sm font-medium">
        <a href="#" class="hover:text-blue-600">How it works?</a>
        <a href="#" class="hover:text-blue-600">Help</a>
        <button class="text-gray-700 hover:text-blue-600">🌐 EN</button>
        <NuxtLink
          to="/login"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign in
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const showDropdown = ref(false)
const categories = [
  'Art',
  'Jewellery',
  'Watches',
  'Fashion',
  'Coins & Stamps',
  'Comics',
  'Cars & Bikes',
  'Wine & Spirits',
  'Interiors',
  'Asian & Tribal Art',
  'Toys & Models',
  'Archaeology',
  'Books & History',
]

const toggleDropdown = () => (showDropdown.value = !showDropdown.value)

onClickOutside(document, () => (showDropdown.value = false))
</script>
