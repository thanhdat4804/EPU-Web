<template>
  <header class="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
    <div class="flex items-center space-x-4">
      <img src="/eve.jpg" alt="BidDora" class="h-8" />
      <input
        v-model="search"
        type="text"
        placeholder="Search for items..."
        class="border rounded-lg px-3 py-2 w-80"
      />
    </div>

    <div class="space-x-4">
      <button class="text-sm text-gray-700 hover:underline">Sign in</button>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Register
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
const search = ref('')
</script>
