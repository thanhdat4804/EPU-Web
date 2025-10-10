<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div v-if="auction" class="max-w-4xl mx-auto space-y-8">

      <!-- Auction Info -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ auction.item?.name || 'Chi tiết đấu giá' }}</h1>

        <!-- Ảnh vật phẩm -->
        <img
          v-if="auction.item?.imageUrl"
          :src="auction.item.imageUrl"
          class="w-full h-64 object-cover rounded-xl mb-4"
          alt="Auction item"
        />

        <p class="text-gray-700 mb-2">{{ auction.item?.description }}</p>
        <p><b>👤 Người bán:</b> {{ auction.seller }}</p>
        <p><b>🏆 Giá cao nhất hiện tại:</b> {{ auction.highestBid }} ETH</p>
        <p><b>💰 Người giữ giá cao nhất:</b> {{ auction.highestBidder }}</p>
      </div>

      <!-- Countdown -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">⏳ Thời gian còn lại</h2>

        <div class="flex justify-center gap-6 text-center">
          <div v-for="(val, label) in countdown" :key="label" class="px-4">
            <p class="text-4xl font-bold">{{ val }}</p>
            <p class="uppercase text-gray-500 text-sm">{{ label }}</p>
          </div>
        </div>

        <p class="mt-4 text-gray-600">
          Kết thúc vào: <b>{{ formatDate(auction.endTime) }}</b>
        </p>

        <div class="h-2 bg-blue-100 mt-4 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600 transition-all duration-1000" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Bid Form -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
        <h2 class="text-xl font-semibold mb-4">💰 Đặt giá</h2>
        <input
          v-model.number="bidAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Nhập số ETH"
          class="border p-2 rounded-lg w-full mb-3"
        />
        <button
          @click="placeBidAction"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Đặt giá
        </button>
      </div>

      <!-- Bidders List -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">📋 Danh sách người đấu giá</h2>
        <ul v-if="bidders.length">
          <li
            v-for="(b, i) in bidders"
            :key="i"
            class="flex justify-between items-center border-b py-2"
          >
            <span>{{ b.bidder }}</span>
            <span class="font-semibold text-gray-800">{{ b.amount }} ETH</span>
          </li>
        </ul>
        <p v-else class="text-gray-500">Chưa có ai đấu giá.</p>
      </div>
    </div>

    <div v-else class="text-center text-gray-600 mt-20 text-lg">
      Đang tải thông tin đấu giá...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctionApi } from '~/composables/useAuctionApi'

const route = useRoute()
const auction = ref(null)
const bidders = ref([])
const bidAmount = ref(0)
const { getAuctionDetail, getAllBids, placeBid } = useAuctionApi()

// Countdown
const countdown = ref({ DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' })
const progress = ref(0)
let timer = null

const updateCountdown = () => {
  if (!auction.value?.endTime) return
  const end = new Date(auction.value.endTime).getTime()
  const now = Date.now()
  const total = end - new Date(auction.value.startTime).getTime()
  const remaining = Math.max(0, end - now)

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((remaining / (1000 * 60)) % 60)
  const seconds = Math.floor((remaining / 1000) % 60)

  countdown.value = {
    DAYS: String(days).padStart(2, '0'),
    HOURS: String(hours).padStart(2, '0'),
    MINUTES: String(minutes).padStart(2, '0'),
    SECONDS: String(seconds).padStart(2, '0')
  }

  const passed = Math.min(1, (now - new Date(auction.value.startTime).getTime()) / total)
  progress.value = Math.min(100, passed * 100)
}

onMounted(async () => {
  try {
    const address = route.params.address
    auction.value = await getAuctionDetail(address)
    bidders.value = await getAllBids(address)
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  } catch (err) {
    console.error('❌ Lỗi tải chi tiết:', err)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const placeBidAction = async () => {
  try {
    const address = route.params.address
    await placeBid(address, bidAmount.value)
    bidders.value = await getAllBids(address)
    auction.value = await getAuctionDetail(address)
    alert('Đặt giá thành công!')
  } catch (err) {
    console.error(err)
    alert('Đặt giá thất bại!')
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN')
}
</script>
