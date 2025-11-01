<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- ✅ Header -->
    <Header />

    <!-- Nội dung trang -->
    <div class="p-8">
      <div v-if="auction" class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <!-- ================== 🟩 CỘT TRÁI: Thông tin vật đấu giá ================== -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <img
              :src="auction.item?.imageUrl || '/no-image.jpg'"
              class="w-full h-96 object-cover rounded-xl border mb-4"
              alt="Ảnh vật phẩm"
            />
            <h1 class="text-3xl font-bold text-gray-800 mb-3">
              {{ auction.item?.name || 'Chi tiết đấu giá' }}
            </h1>

            <!-- Mô tả vật phẩm -->
            <div class="mb-4">
              <p class="font-semibold text-gray-800 mb-1">📝 Thông tin mô tả:</p>
              <p class="text-gray-600 leading-relaxed">
                {{ auction.item?.description || 'Không có mô tả.' }}
              </p>
            </div>

            <div class="space-y-2 text-gray-700 text-sm">
              <p><b>👤 Người bán:</b> {{ auction.seller?.email || 'Ẩn danh' }}</p>
              <p>
                <b>💰 Giá hiện tại:</b>
                <span class="font-semibold text-green-600">
                  {{ formatEth(auction.highestBid || auction.item?.startingPrice) }}
                </span>
              </p>
              <p><b>🏆 Người giữ giá cao nhất:</b> {{ auction.highestBidder || 'Chưa có' }}</p>
              <p><b>⏳ Trạng thái:</b> {{ auction.status }}</p>
            </div>
          </div>
        </div>

        <!-- ================== 🟦 CỘT PHẢI: Countdown + Đặt giá + Danh sách ================== -->
        <div class="space-y-6">
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
              <div
                class="h-full bg-blue-600 transition-all duration-1000"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Form đặt giá -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
            <h2 class="text-xl font-semibold mb-4">💰 Đặt giá</h2>

            <div class="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <input
                v-model.number="bidAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Nhập số ETH"
                class="border p-2 rounded-lg w-full sm:w-64"
              />
              <button
                @click="placeBidAction"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Đặt giá
              </button>
            </div>
          </div>

          <!-- Danh sách người đấu giá -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 class="text-xl font-semibold mb-4">📋 Danh sách người đấu giá</h2>

            <ul v-if="bidders.length">
              <li
                v-for="(b, i) in bidders"
                :key="i"
                class="flex justify-between items-center border-b py-2 text-gray-700"
              >
                <span>{{ b.fromAddress }}</span>
                <span class="font-semibold text-gray-900">{{ formatEth(b.amount) }}</span>
              </li>
            </ul>

            <p v-else class="text-gray-500">Chưa có ai đấu giá.</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="text-center text-gray-600 mt-20 text-lg">
        Đang tải thông tin đấu giá...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/User/Header.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctionApi } from '~/composables/useAuctionApi'

const route = useRoute()
const auction = ref<any>(null)
const bidders = ref<any[]>([])
const bidAmount = ref(0)
const { getAuctionDetail, getAllBids, placeBid } = useAuctionApi()

// Countdown
const countdown = ref({ DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' })
const progress = ref(0)
let timer: any = null

const updateCountdown = () => {
  if (!auction.value?.endTime) return
  const start = new Date(auction.value.startTime).getTime()
  const end = new Date(auction.value.endTime).getTime()
  const now = Date.now()
  const total = end - start
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

  const passed = Math.min(1, (now - start) / total)
  progress.value = Math.min(100, passed * 100)
}

onMounted(async () => {
  try {
    const address = route.params.address as string
    auction.value = await getAuctionDetail(address)
    bidders.value = await getAllBids(address)
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  } catch (err) {
    console.error('❌ Lỗi tải chi tiết:', err)
  }
})

onUnmounted(() => timer && clearInterval(timer))

// 🪙 Đặt giá
const placeBidAction = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) {
    alert('Bạn cần đăng nhập để đặt giá.')
    return
  }
  if (!bidAmount.value || bidAmount.value <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ.')
    return
  }

  try {
    const address = route.params.address as string
    const tx = await placeBid(address, bidAmount.value)
    console.log('Transaction hash:', tx.txHash)
    auction.value = await getAuctionDetail(address)
    bidders.value = await getAllBids(address)
    bidAmount.value = 0
    alert('✅ Đặt giá thành công!')
  } catch (err: any) {
    console.error(err)
    alert(err?.message || 'Đặt giá thất bại!')
  }
}

// Helper
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN')
const formatEth = (val: number | string) => (val ? `${Number(val).toFixed(2)} ETH` : '—')
</script>
