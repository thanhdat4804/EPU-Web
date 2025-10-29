<template>
  <div class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
    <div class="flex-1">
      <div class="font-medium text-gray-900">{{ title }}</div>
      <div class="text-sm text-gray-500">
        <span class="text-blue-600">{{ category }}</span> • {{ time }}
      </div>
    </div>
    <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
      Thẩm định
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  category: String,
  time: String
})
</script>