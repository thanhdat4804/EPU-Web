<template>
  <div class="relative bg-white overflow-hidden scale-110">
    <NuxtLink :to="`/auction/${auction.contractAddress}`" class="block">
      <!-- Ảnh -->
      <div class="aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          :src="getImageUrl(auction.item?.mainImage, auction.item?.imageUrl)"
          :alt="auction.item?.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Thông tin -->
      <div class="pt-3 pb-5 pr-4">
        <h3 class="text-sm leading-tight line-clamp-2 mb-1 text-gray-800"
            style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 650;">
          {{ auction.item?.name || 'Đang tải...' }}
        </h3>
        <div class="mt-1.5">
          <p class="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5 leading-none"
             style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 500;">
            Current bid
          </p>
          <p class="text-xl leading-none tracking-tight text-gray-900"
             style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 650;">
            {{ formatPrice(currentBid) }}
          </p>
        </div>
      </div>
    </NuxtLink>
    <button
      @click.stop.prevent="handleFavorite"
      class="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border transition-all duration-300 hover:shadow-lg hover:bg-white hover:scale-110 select-none group"
      :class="liked ? 'border-blue-600 shadow-blue-600/10' : 'border-gray-300'"
    >
      <!-- Icon tim – chưa thích: viền xanh đậm, đã thích: fill xanh + hiệu ứng scale + pulse nhẹ -->
      <svg
        class="w-5 h-5 flex-shrink-0 transition-all duration-300"
        :class="liked ? 'text-blue-600 scale-110 animate-pulse-once' : 'text-blue-600'"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          v-if="!liked"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
        <path
          v-else
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>

      <!-- Số lượng – luôn xám đậm, đẹp mượt -->
      <span
        class="text-sm font-medium text-gray-600 tracking-tight select-none"
        style="font-family: 'Basis Grotesque Pro', sans-serif;"
      >
        {{ favoriteCount }}
      </span>
    </button>

    <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Basis+Grotesque+Pro:wght@300;400;500;600;700;800;900&display=swap">
  </div>
  
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useFavorite } from '~/composables/useFavorite'

const props = defineProps({
  auction: { type: Object, required: true }
})

const auctionId = toRef(props.auction, 'id')  


const { liked, favoriteCount, loading, handleFavorite } = useFavorite(auctionId)

// Các hàm còn lại giữ nguyên 100%
const getImageUrl = (mainImage: any, imageUrl: any) => {
  if (imageUrl) return imageUrl
  if (mainImage) return `http://localhost:3001/uploads/${mainImage}`
  return '/no-image.jpg'
}

const currentBid = computed(() => {
  return props.auction.onchain?.highestBid ||
         props.auction.item?.currentPrice ||
         props.auction.item?.startingPrice || 0
})

const formatPrice = (price: any) => {
  if (!price || price == 0) return '0.00 ETH'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }) + ' ETH'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>