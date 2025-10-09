<template>
  <div class="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition">
    <img :src="item.image" alt="" class="w-full h-48 object-cover" />
    <div class="p-4">
      <h3 class="text-lg font-medium">{{ item.title }}</h3>
      <p class="text-gray-600 text-sm mt-1">Current bid: {{ item.bid }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ item: Object })
</script>
