<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">📦 Danh sách các phiên đấu giá</h1>

    <div v-if="auctions.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="auction in auctions"
        :key="auction.id"
        class="bg-white shadow-md p-5 rounded-2xl border border-gray-200 hover:shadow-lg transition"
      >
        <!-- Hình ảnh item -->
        <img
          v-if="auction.item?.imageUrl"
          :src="auction.item.imageUrl"
          class="w-full h-40 object-cover rounded-xl mb-3"
        />

        <!-- Thông tin item -->
        <h2 class="text-xl font-semibold mb-1">{{ auction.item?.name }}</h2>
        <p class="text-gray-600 mb-2 line-clamp-2">{{ auction.item?.description }}</p>
        <p><b>Giá khởi điểm:</b> {{ auction.item?.startingPrice }} ETH</p>

        <!-- Thông tin đấu giá -->
        <p><b>Trạng thái:</b> {{ auction.status }}</p>
        <p><b>Kết thúc:</b> {{ formatDate(auction.endTime) }}</p>

        <!-- Seller -->
        <p><b>Người bán:</b> {{ auction.seller?.email }}</p>

        <!-- Link chi tiết -->
        <NuxtLink
          :to="`/auction/${auction.contractAddress}`"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 inline-block"
        >
          Xem chi tiết
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 mt-20 text-lg">
      Không có phiên đấu giá nào.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

const auctions = ref<any[]>([])
const { getAuctions } = useAuctionApi()

onMounted(async () => {
  try {
    auctions.value = await getAuctions()
    console.log('Auctions loaded:', auctions.value)
  } catch (err) {
    console.error('❌ Lỗi tải danh sách:', err)
  }
})

// Hàm format thời gian
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN')
}
</script>
