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
      <ProductCard
        v-for="auction in auctions"
        :key="auction.contractAddress"
        :auction="auction"
      />
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
