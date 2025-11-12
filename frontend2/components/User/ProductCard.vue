<template>
  <NuxtLink
    :to="`/auction/${auction.contractAddress}`"
    class="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block overflow-hidden border border-gray-100"
  >
    <!-- Ảnh sản phẩm -->
    <div class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
      <img
        :src="getImageUrl(auction.item?.mainImage, auction.item?.imageUrl)"
        :alt="auction.item?.name"
        class="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
      />

      <div
        v-if="auction.status === 'Active'"
        class="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm"
      >
        🔥 Đang diễn ra
      </div>
      <div
        v-else
        class="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm"
      >
        ⏱ Kết thúc
      </div>
    </div>

    <!-- Nội dung -->
    <div class="p-3 sm:p-4">
      <h3 class="font-semibold text-gray-800 truncate text-sm sm:text-base">
        {{ auction.item?.name }}
      </h3>
      <p class="text-xs text-gray-500 mt-1 line-clamp-2">
        {{ auction.item?.description || 'Không có mô tả' }}
      </p>

      <div class="mt-3 flex justify-between items-center">
        <span class="text-blue-600 font-bold flex items-center gap-1 text-sm sm:text-base">
          <i class="fa-brands fa-ethereum"></i>
          {{ formatPrice(auction.item?.startingPrice || 0) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  auction: { type: Object, required: true },
})
const getImageUrl = (mainImage, imageUrl) => {
  if (imageUrl) return imageUrl // nếu có link URL thì dùng luôn
  if (mainImage) return `http://localhost:3001/uploads/${mainImage}` // ảnh upload từ máy
  return '/no-image.jpg' // fallback
}
const formatPrice = (price) => {
  if (!price) return '—'
  return `${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETH`
}
</script>

<style scoped>
/* Giới hạn số dòng mô tả */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
