<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">📦 Danh sách các phiên đấu giá</h1>

    <div v-if="auctions.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="auction in auctions"
        :key="auction.id"
        class="bg-white shadow-md p-5 rounded-2xl border border-gray-200 hover:shadow-lg transition"
      >
        <img
          v-if="auction.item?.imageUrl"
          :src="auction.item.imageUrl"
          class="w-full h-40 object-cover rounded-xl mb-3"
        />
        <h2 class="text-xl font-semibold mb-1">{{ auction.item?.name }}</h2>
        <p class="text-gray-600 mb-2 line-clamp-2">{{ auction.item?.description }}</p>

        <p><b>Giá khởi điểm:</b> {{ auction.item?.startingPrice }} ETH</p>
        <p><b>Trạng thái:</b> {{ auction.status }}</p>
        <p><b>Kết thúc:</b> {{ formatDate(auction.endTime) }}</p>

        <NuxtLink :to="`/auction/${auction.contractAddress}`" class="text-blue-600 hover:underline">
          Xem chi tiết
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 mt-20 text-lg">
      Không có phiên đấu giá nào.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

const auctions = ref([])
const { getAuctions } = useAuctionApi()

onMounted(async () => {
  try {
    auctions.value = await getAuctions()
    
  } catch (err) {
    console.error('❌ Lỗi tải danh sách:', err)
  }
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN')
}
</script>
