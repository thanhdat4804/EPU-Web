<template>
  <nav class="flex space-x-6 px-6 py-3 border-b bg-white sticky top-0 z-10">
    <button
      @click="$emit('select', 'all')"
      :class="[
        'text-sm font-medium',
        selected === 'all'
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-500'
      ]"
    >
      All
    </button>

    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="$emit('select', cat.id)"
      :class="[
        'text-sm font-medium',
        selected === cat.id
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-500'
      ]"
    >
      {{ cat.name }}
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps({
  categories: Array,
  selected: [String, Number]
})
defineEmits(['select'])
</script>
