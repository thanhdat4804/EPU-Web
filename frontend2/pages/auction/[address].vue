<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <Header />
    <!-- Nội dung chính -->
    <div class="p-8">
      <div v-if="auction" class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <!-- CỘT TRÁI: Thông tin vật phẩm + Ảnh -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <!-- ẢNH CHÍNH -->
            <div class="relative mb-4">
              <img
                :src="getImageUrl(auction.item?.mainImage)"
                class="w-full h-96 object-cover rounded-xl border shadow-sm transition-transform hover:scale-[1.02]"
                alt="Ảnh chính"
                @click="showFullImage(getImageUrl(auction.item?.mainImage))"
              />
              <!-- Placeholder nếu không có ảnh -->
              <div
                v-if="!auction.item?.mainImage"
                class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl border"
              >
                <span class="text-gray-400 text-lg">Không có ảnh chính</span>
              </div>
            </div>
            <!-- ẢNH PHỤ (CAROUSEL NHỎ) -->
            <div v-if="auction.item?.subImages?.length" class="mt-4">
              <p class="text-sm font-semibold text-gray-700 mb-2">Ảnh phụ:</p>
              <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                <div
                  v-for="(img, index) in auction.item.subImages"
                  :key="index"
                  class="flex-shrink-0"
                >
                  <img
                    :src="getImageUrl(img)"
                    class="w-24 h-24 object-cover rounded-lg border shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    alt="Ảnh phụ"
                    @click="showFullImage(getImageUrl(img))"
                  />
                </div>
              </div>
            </div>
            <!-- Tên + Mô tả -->
            <h1 class="text-3xl font-bold text-gray-800 mb-3">
              {{ auction.item?.name || 'Chi tiết đấu giá' }}
            </h1>
            <div class="mb-4">
              <p class="font-semibold text-gray-800 mb-1">Mô tả:</p>
              <p class="text-gray-600 leading-relaxed">
                {{ auction.item?.description || 'Không có mô tả.' }}
              </p>
            </div>
            <!-- Thông tin cơ bản -->
            <div class="space-y-2 text-gray-700 text-sm">
              <p><b>Người bán:</b> {{ auction.seller?.email || 'Ẩn danh' }}</p>
              <p>
                <b>Giá khởi điểm:</b>
                <span class="text-gray-900 font-medium">
                  {{ formatEth(auction.item?.startingPrice) }}
                </span>
              </p>
              <p>
                <b>Giá hiện tại:</b>
                <span class="font-semibold text-green-600">
                  {{ formatEth(auction.onchain?.highestBid || auction.item?.startingPrice) }}
                </span>
              </p>
              <p><b>Người giữ giá cao nhất:</b> {{ auction.onchain?.highestBidder || 'Chưa có' }}</p>
              <p><b>Trạng thái:</b> <span class="px-2 py-1 rounded text-xs" :class="statusClass">{{ auction.status }}</span></p>
            </div>
          </div>
        </div>
        <!-- CỘT PHẢI: Countdown + Đặt giá + Danh sách -->
        <div class="space-y-6">
          <!-- Countdown -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Thời gian còn lại</h2>
            <div class="flex justify-center gap-6 text-center">
              <div v-for="(val, label) in countdown" :key="label" class="px-4">
                <p class="text-4xl font-bold text-blue-600">{{ val }}</p>
                <p class="uppercase text-gray-500 text-sm">{{ label }}</p>
              </div>
            </div>
            <p class="mt-4 text-gray-600">
              Kết thúc vào: <b>{{ formatDate(auction.onchain?.endTime) }}</b>
            </p>
            <div class="h-2 bg-blue-100 mt-4 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
          <!-- Form đặt giá -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center">
            <h2 class="text-xl font-semibold mb-4">Đặt giá bằng MetaMask</h2>
            <div class="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <input
                v-model.number="bidAmount"
                type="number"
                min="0"
                step="0.001"
                placeholder="Nhập số ETH"
                class="border p-3 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                @click="placeBidAction"
                :disabled="isPlacing || !canBid"
                class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-60 font-medium"
              >
                <span v-if="!isPlacing">Đặt giá</span>
                <span v-else>Đang gửi...</span>
              </button>
            </div>
            <p v-if="!canBid" class="text-red-500 text-sm mt-2">Bạn không thể đặt giá (đã kết thúc hoặc chưa đủ điều kiện)</p>
          </div>
          <!-- Danh sách người đấu giá -->
          <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 class="text-xl font-semibold mb-4">Danh sách người đấu giá</h2>
            <ul v-if="bidders.length" class="space-y-2">
              <li
                v-for="(b, i) in bidders.slice(0, 10)"
                :key="i"
                class="flex justify-between items-center border-b pb-2 text-gray-700"
              >
                <span class="truncate max-w-[180px]">{{ b.bidder }}</span>
                <span class="font-semibold text-green-600">{{ formatEth(b.amount) }}</span>
              </li>
            </ul>
            <p v-else class="text-gray-500 text-center py-4">Chưa có ai đấu giá.</p>
          </div>
        </div>
      </div>
      <!-- Loading -->
      <div v-else class="text-center text-gray-600 mt-20 text-lg">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
        <p class="mt-4">Đang tải thông tin đấu giá...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/User/Header.vue'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ethers } from 'ethers'
import { useAuctionApi } from '~/composables/useAuctionApi'

const route = useRoute()
const auction = ref<any>(null)
const bidders = ref<any[]>([])
const bidAmount = ref(0)
const isPlacing = ref(false)
const { getAuctionDetail, getAllBids, recordBid } = useAuctionApi()

// Countdown
const countdown = ref({ DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' })
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// Hàm lấy URL ảnh
const getImageUrl = (filename: string | null | undefined): string => {
  if (!filename) return '/no-image.jpg'
  return `http://localhost:3001/uploads/${filename}`
}

// Xem ảnh full màn hình
const showFullImage = (src: string) => {
  const img = new Image()
  img.src = src
  img.style.maxWidth = '90%'
  img.style.maxHeight = '90%'
  img.style.margin = 'auto'
  img.style.display = 'block'
  img.style.borderRadius = '12px'
  img.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0,0,0,0.85)'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.zIndex = '9999'
  overlay.style.cursor = 'zoom-out'
  overlay.onclick = () => document.body.removeChild(overlay)
  overlay.appendChild(img)
  document.body.appendChild(overlay)
}

// Cập nhật countdown
const updateCountdown = () => {
  if (!auction.value?.onchain?.endTime) {
    countdown.value = { DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' }
    progress.value = 100
    return
  }

  const endTimeStr = auction.value.onchain.endTime
  let endTimeMs: number

  if (typeof endTimeStr === 'string') {
    endTimeMs = new Date(endTimeStr).getTime()
  } else if (typeof endTimeStr === 'number') {
    endTimeMs = endTimeStr * 1000
  } else {
    return
  }

  if (isNaN(endTimeMs)) return

  const now = Date.now()
  const remaining = Math.max(0, endTimeMs - now)

  if (remaining <= 0) {
    countdown.value = { DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' }
    progress.value = 100
    if (timer) clearInterval(timer)
    return
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((remaining / (1000 * 60)) % 60)
  const seconds = Math.floor((remaining / 1000) % 60)

  countdown.value = {
    DAYS: String(days).padStart(2, '0'),
    HOURS: String(hours).padStart(2, '0'),
    MINUTES: String(minutes).padStart(2, '0'),
    SECONDS: String(seconds).padStart(2, '0'),
  }

  // PROGRESS BAR
  const startTimeStr = auction.value.onchain?.startTime || auction.value.createdAt
  let startTimeMs: number

  if (typeof startTimeStr === 'string') {
    startTimeMs = new Date(startTimeStr).getTime()
  } else if (typeof startTimeStr === 'number') {
    startTimeMs = startTimeStr * 1000
  } else {
    startTimeMs = now
  }

  const total = endTimeMs - startTimeMs
  progress.value = total > 0 ? Math.min(100, ((now - startTimeMs) / total) * 100) : 100
}

// Load dữ liệu + BẮT ĐẦU COUNTDOWN
onMounted(async () => {
  try {
    const address = route.params.address as string
    auction.value = await getAuctionDetail(address)
    bidders.value = await getAllBids(address)

    if (process.client) {
      updateCountdown()
      timer = setInterval(updateCountdown, 1000)
    }
  } catch (err) {
    console.error('Lỗi tải chi tiết:', err)
  }
})

// Dọn dẹp khi rời trang
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// CẬP NHẬT COUNTDOWN KHI DỮ LIỆU THAY ĐỔI
watch(
  () => auction.value?.onchain?.endTime,
  () => {
    if (process.client && auction.value?.onchain?.endTime) {
      updateCountdown()
      if (timer) clearInterval(timer)
      timer = setInterval(updateCountdown, 1000)
    }
  }
)

// Đặt giá
const canBid = computed(() => {
  if (!auction.value?.onchain?.endTime) return false
  const endTime = typeof auction.value.onchain.endTime === 'string'
    ? new Date(auction.value.onchain.endTime).getTime()
    : (auction.value.onchain.endTime * 1000)
  return Date.now() < endTime && auction.value.status === 'Active'
})

const placeBidAction = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return alert('Bạn cần đăng nhập.')
  if (!window.ethereum) return alert('Vui lòng cài MetaMask.')
  if (!bidAmount.value || bidAmount.value <= 0) return alert('Số tiền không hợp lệ.')
  const minBid = (auction.value.onchain?.highestBid || auction.value.item?.startingPrice) * 1.05
  if (bidAmount.value < minBid) {
    return alert(`Phải đặt ít nhất ${minBid.toFixed(4)} ETH`)
  }
  try {
    isPlacing.value = true
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contractAddress = route.params.address as string
    const abi = ['function placeBid(uint _amount) payable']
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const deposit = bidAmount.value * 0.1
    const tx = await contract.placeBid(
      ethers.utils.parseEther(bidAmount.value.toString()),
      { value: ethers.utils.parseEther(deposit.toString()) }
    )
    alert('Giao dịch đang xử lý...')
    await tx.wait()
    await recordBid(contractAddress, bidAmount.value, tx.hash)
    auction.value = await getAuctionDetail(contractAddress)
    bidders.value = await getAllBids(contractAddress)
    bidAmount.value = 0
    alert(`Đặt giá thành công! Tx: ${tx.hash}`)
  } catch (err: any) {
    alert(err?.message || 'Đặt giá thất bại!')
  } finally {
    isPlacing.value = false
  }
}

// Format
const formatDate = (input: string | number) => {
  let date: Date
  if (typeof input === 'string') date = new Date(input)
  else if (typeof input === 'number') date = new Date(input * 1000)
  else return '—'
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatEth = (val: number | string) => val ? `${Number(val).toFixed(4)} ETH` : '—'

const statusClass = computed(() => {
  const s = auction.value?.status
  if (s === 'Active') return 'bg-green-100 text-green-800'
  if (s === 'Ended') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { height: 6px; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e0; border-radius: 3px; }
</style>