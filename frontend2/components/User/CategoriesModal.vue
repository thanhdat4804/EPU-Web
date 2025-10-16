<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-start justify-center pt-20"
    @click.self="close"
  >
    <div
      class="bg-white rounded-xl shadow-lg p-8 w-[90%] max-w-5xl relative animate-fadeIn"
    >
      <button
        @click="close"
        class="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
      >
        ✕
      </button>

      <h2 class="text-3xl font-semibold mb-8">Categories</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex justify-between items-center p-4 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200"
          :style="{ backgroundColor: category.color }"
        >
          <div>
            <h3 class="font-semibold text-gray-800">{{ category.name }}</h3>
          </div>
          <div class="w-16 h-16 overflow-hidden rounded-full flex-shrink-0">
            <img
              :src="category.image"
              alt="Category image"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  categories: Array
})

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
