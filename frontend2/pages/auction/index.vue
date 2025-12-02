<template>
  <div class="min-h-screen bg-white">
    <Header />
    <CategoryMenu
      :categories="categories"
      :selected="selectedCategory"
      @select="selectCategory"
    />

    <!-- Loading / Error -->
    <div v-if="loading" class="max-w-7xl mx-auto px-6 py-24 text-center text-gray-600 text-lg">
      Đang tải các phiên đấu giá...
    </div>
    <div v-else-if="error" class="max-w-7xl mx-auto px-6 py-24 text-center text-red-600 text-lg">
      {{ error }}
    </div>

    <!-- DANH SÁCH – CHỈ 4 CỘT TRÊN MÀN HÌNH LỚN → ẢNH TO NHẤT -->
    <div v-else class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <ProductCard
          v-for="auction in auctions"
          :key="auction.id || auction.contractAddress"
          :auction="auction"
        />
      </div>
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
  return `${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`
}
</script>
