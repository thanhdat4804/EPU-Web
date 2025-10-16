<template>
  <nav
    class="flex space-x-8 border-t border-gray-200 px-8 py-2 bg-white text-sm font-medium overflow-x-auto scrollbar-hide"
  >
    <button
      v-for="tab in tabs"
      :key="tab.name"
      class="pb-1 border-b-2 flex-shrink-0"
      :class="activeTab === tab.name
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent hover:text-blue-600'"
      @click="handleTabClick(tab)"
    >
      {{ tab.name }}
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('This week')

const tabs = [
  { name: 'This week', type: 'static' },
  { name: 'For you', type: 'static' },
  { name: 'Trending', type: 'static' },
  { name: 'Art', type: 'category', slug: 'art' },
  { name: 'Interiors', type: 'category', slug: 'interiors-decorations' },
  { name: 'Jewellery', type: 'category', slug: 'jewellery-precious-stones' },
  { name: 'Watches', type: 'category', slug: 'watches-pens-lighters' },
  { name: 'Fashion', type: 'category', slug: 'fashion' },
  { name: 'Coins & Stamps', type: 'category', slug: 'coins-stamps' },
  { name: 'Comics', type: 'category', slug: 'comics-animation' },
  { name: 'Cars & Bikes', type: 'category', slug: 'classic-cars-motorcycles-automobilia' },
]

const handleTabClick = (tab) => {
  activeTab.value = tab.name

  if (tab.type === 'category') {
    router.push(`/User/category/${tab.slug}`)
  } else {
    // sau này bạn có thể thêm hành vi riêng cho “This week”, “For you”, ...
    console.log(`Clicked tab: ${tab.name}`)
  }
}
</script>

<style scoped>
/* Ẩn thanh cuộn ngang nếu có nhiều tab */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
