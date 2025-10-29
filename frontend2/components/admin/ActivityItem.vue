<template>
  <div class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
    <div class="flex-1">
      <div class="font-medium text-gray-900">{{ title }}</div>
      <div class="text-sm text-gray-500">{{ time }}</div>
    </div>
    <span :class="getStatusClass(status)" class="px-2 py-1 text-xs font-semibold rounded-full">
      {{ status }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  time: String,
  status: String
})

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    ending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>