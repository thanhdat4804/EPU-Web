<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- Thanh thể loại -->
    <CategoryMenu
      :categories="categories"
      :selected="selectedCategory"
      @select="selectCategory"
    />

    <div v-if="loading" class="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">{{ error }}</div>

    <!-- Danh sách đấu giá -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
      <NuxtLink
        v-for="auction in auctions"
        :key="auction.contractAddress"
        :to="`/auction/${auction.contractAddress}`"
        class="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition block overflow-hidden"
      >
        <div class="aspect-square bg-gray-100 flex items-center justify-center">
          <img
            :src="auction.item?.imageUrl || '/no-image.jpg'"
            :alt="auction.item?.name"
            class="object-contain w-full h-full"
          />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-800 truncate">{{ auction.item?.name }}</h3>
          <p class="text-sm text-gray-500 mt-1 truncate">
            {{ auction.item?.description || 'Không có mô tả' }}
          </p>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-blue-600 font-bold">
              {{ formatPrice(auction.item?.startingPrice || 0) }}
            </span>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg"
              :class="{
                'bg-green-100 text-green-700': auction.status === 'Active',
                'bg-gray-200 text-gray-600': auction.status === 'Ended'
              }"
            >
              {{ auction.status }}
            </span>
          </div>
        </div>
        
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import Header from '~/components/User/Header.vue'
import CategoryMenu from '~/components/User/CategoryMenu.vue'
import { useAuctions } from '~/composables/User/useAuctions'
import ProductCard from '~/components/User/ProductCard.vue'

const {
  auctions,
  categories,
  selectedCategory,
  selectCategory,
  loading,
  error,
} = useAuctions()
watch(auctions, (val) => {
  console.log('🧩 Auctions data:', JSON.parse(JSON.stringify(val)))
})
const formatPrice = (price) => {
  if (!price) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}
</script>
