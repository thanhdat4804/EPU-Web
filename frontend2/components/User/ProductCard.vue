<template>
  <div
    class="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition"
  >
    <img
      :src="item.imageUrl"
      alt="item"
      class="w-full h-48 object-cover"
    />
    <div class="p-4">
      <h3 class="text-sm font-semibold truncate">{{ item.name }}</h3>
      <p class="text-gray-500 text-xs mt-1 truncate">
        {{ item.category?.name }}
      </p>
      <p class="text-blue-600 font-semibold mt-2">
        Current bid: {{ item.currentBid }}$
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>
