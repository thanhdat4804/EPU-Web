<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased">
    <Header />

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div v-if="auction" class="grid lg:grid-cols-3 gap-12">
        <!-- LEFT COLUMN (2/3) -->
        <div class="lg:col-span-2 space-y-10">

          <!-- Ảnh chính + badge -->
          <div class="relative cursor-zoom-in group">
            <img
              :src="getImageUrl(auction.item?.mainImage)"
              class="w-full object-cover border border-gray-300 transition-transform group-hover:scale-[1.01]"
              alt="Ảnh chính"
              @click="openLightbox(0)"
            />
            <div class="absolute top-4 left-4 bg-white border border-gray-300 px-4 py-2 flex items-center gap-2 text-sm font-medium shadow-sm">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Đã được chuyên gia kiểm định
            </div>
          </div>

          <!-- Ảnh phụ (6 ô + overlay +X) -->
          <div v-if="auction.item?.subImages?.length" class="grid grid-cols-6 gap-3">
            <!-- Ảnh chính luôn hiện đầu -->
            <div @click="openLightbox(0)" class="border border-gray-300 cursor-pointer hover:border-gray-500 overflow-hidden transition">
              <img :src="getImageUrl(auction.item.mainImage)" class="w-full aspect-square object-cover" />
            </div>

            <!-- 5 ảnh phụ tiếp theo -->
            <template v-for="(img, i) in auction.item.subImages.slice(0, 5)" :key="i">
              <div @click="openLightbox(i + 1)" class="border border-gray-300 cursor-pointer hover:border-gray-500 overflow-hidden transition">
                <img :src="getImageUrl(img)" class="w-full aspect-square object-cover" />
              </div>
            </template>

            <!-- Ô cuối cùng: hiện +X nếu còn ảnh -->
            <div v-if="auction.item.subImages.length > 5" @click="openLightbox(0)" class="relative border border-gray-300 cursor-pointer group overflow-hidden">
              <img :src="getImageUrl(auction.item.subImages[5])" class="w-full aspect-square object-cover brightness-75 group-hover:brightness-50 transition" />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-white text-2xl font-bold">
                  +{{ auction.item.subImages.length - 5 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tiêu đề + chuyên gia + mô tả -->
          <div class="space-y-8">
            <div>
              <p class="text-sm text-gray-600 uppercase tracking-wider">
                {{ auction.item?.category?.name }}
              </p>
              <h1 class="mt-2 text-4xl font-bold leading-tight">
                {{ auction.item?.name }}
              </h1>
            </div>

            <div class="flex items-start gap-4 py-6 border-t border-b">
              <div class="w-16 h-16 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
                E
              </div>
              <div>
                <p class="font-semibold">Được chọn bởi chuyên gia</p>
                <p class="text-gray-600 mt-1">Chuyên gia kiểm định đồ cổ với hơn 10 năm kinh nghiệm trong lĩnh vực.</p>
              </div>
            </div>

            <div class="prose prose-lg text-gray-700 leading-relaxed">
              <p>{{ auction.item?.description || 'Không có mô tả chi tiết.' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-8 py-6 border-t text-sm">
              <div><span class="text-gray-600">Người bán:</span> <strong>{{ auction.seller?.email }}</strong></div>
              <div><span class="text-gray-600">Tình trạng:</span> <strong>{{ auction.item?.condition || 'Tốt' }}</strong></div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN (1/3) -->
        <div class="lg:sticky lg:top-6 h-fit">
          <div class="border border-gray-300 overflow-hidden shadow-sm">

            <!-- CHỈ CÒN "Friday 02:53 PM" Ở TRÊN CÙNG (góc phải) -->
            <div class="bg-gray-50 px-6 py-3 border-b text-right text-xs text-gray-600 font-medium">
              {{ formatDateToday() }}
            </div>

            <!-- COUNTDOWN – ĐẸP NHƯ ẢNH, KHÔNG BỊ TO -->
            <div class="bg-white px-6 py-8">
              <div class="flex justify-center items-center gap-4 text-3xl font-mono font-bold text-gray-900">
                <div class="text-center">
                  <div>{{ countdown.DAYS }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wider mt-1">Days</div>
                </div>
                <span class="text-gray-300">|</span>
                <div class="text-center">
                  <div>{{ countdown.HOURS }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wider mt-1">Hours</div>
                </div>
                <span class="text-gray-300">|</span>
                <div class="text-center">
                  <div>{{ countdown.MINUTES }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wider mt-1">Minutes</div>
                </div>
                <span class="text-gray-300">|</span>
                <div class="text-center">
                  <div class="text-red-600">{{ countdown.SECONDS }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wider mt-1">Seconds</div>
                </div>
              </div>
            </div>

            <!-- END TIME – DƯỚI COUNTDOWN -->
            <div class="bg-gray-50 px-6 py-3 border-t text-center text-xs text-gray-700 font-medium">
              End Time: <strong>{{ formatTime(auction.value?.onchain?.endTime) }}</strong>
            </div>

            <!-- BID HIỆN TẠI -->
            <div class="bg-gray-50 px-8 py-7 text-center border-t border-b">
              <p class="text-sm text-gray-600 uppercase tracking-wider font-medium mb-2">
                BID HIỆN TẠI
              </p>
              <p class="text-5xl font-bold text-gray-900 leading-tight">
                {{ formatEth(currentPrice) }}
              </p>
            </div>

            <!-- FORM ĐẶT GIÁ -->
            <div class="p-8 space-y-5 bg-white">
              <div class="relative">
                <input
                  v-model.number="bidAmount"
                  type="number"
                  step="0.001"
                  placeholder=" "
                  class="w-full px-5 py-4 text-xl font-mono text-center border border-gray-300 focus:border-gray-900 outline-none transition peer placeholder:text-gray-400"
                  @focus="clearZero"
                />
                <span class="absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-gray-400 font-medium select-none
                            peer-focus:hidden peer-not-empty:hidden">
                  Từ {{ formatEth(minNextBid) }} trở lên
                </span>
              </div>

              <button
                @click="placeBidAction"
                :disabled="isPlacing || !canBid || !bidAmount || bidAmount < minNextBid"
                class="w-full py-4 bg-catawiki-blue hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-lg transition"
              >
                {{ isPlacing ? 'Đang gửi...' : 'Đặt giá' }}
              </button>

              <p v-if="!canBid" class="text-center text-red-600 font-medium text-sm -mt-3">
                Phiên đấu giá đã kết thúc
              </p>
            </div>

            <!-- LỊCH SỬ NGẮN -->
            <div class="border-t bg-gray-50 px-8 py-6 text-sm">
              <div class="flex justify-between items-center mb-3">
                <span class="font-medium">Lượt đấu giá</span>
                <strong class="text-lg">{{ bidders.length }}</strong>
              </div>
              <div v-if="bidders.length" class="space-y-3">
                <div v-for="(b, i) in bidders.slice(0, 3)" :key="i" class="flex justify-between">
                  <span class="font-mono text-gray-600">{{ b.bidder.slice(0,8) }}...{{ b.bidder.slice(-6) }}</span>
                  <span class="font-semibold">{{ formatEth(b.amount) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="text-center py-32">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    </div>

    <!-- LIGHTBOX FULLSCREEN -->
    <teleport to="body">
      <div v-if="lightboxOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black" @click.self="closeLightbox">
        <img :src="allImages[lightboxIndex]" class="max-w-full max-h-full object-contain select-none" />

        <button @click="closeLightbox" class="absolute top-6 right-6 text-white hover:text-gray-300">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button @click.stop="prevImage" class="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button @click.stop="nextImage" class="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded text-sm font-medium">
          {{ lightboxIndex + 1 }} / {{ allImages.length }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/User/Header.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ethers } from 'ethers'
import { useAuctionApi } from '~/composables/useAuctionApi'
const bidAmount = ref<number | null>(null)
const route = useRoute()
const auction = ref<any>(null)
const bidders = ref<any[]>([])
const isPlacing = ref(false)
const { getAuctionDetail, getAllBids, recordBid } = useAuctionApi()

const countdown = ref({ DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' })
let timer: any = null
let bidRefreshTimer: any = null

// ================= THÊM 2 DÒNG NÀY ĐỂ FIX LỖI =================
const currentPrice = computed(() => 
  auction.value?.onchain?.highestBid || auction.value?.item?.startingPrice || 0
)

const minNextBid = computed(() => currentPrice.value * 1)
// ==============================================================

// Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const allImages = computed(() => {
  if (!auction.value?.item) return []
  return [auction.value.item.mainImage, ...(auction.value.item.subImages || [])]
    .filter(Boolean)
    .map(img => getImageUrl(img))
})

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}
const prevImage = () => lightboxIndex.value = (lightboxIndex.value - 1 + allImages.value.length) % allImages.value.length
const nextImage = () => lightboxIndex.value = (lightboxIndex.value + 1) % allImages.value.length

// ESC key
const handleEscKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && lightboxOpen.value) closeLightbox()
}
onMounted(() => window.addEventListener('keydown', handleEscKey))
onUnmounted(() => window.removeEventListener('keydown', handleEscKey))

// Utils
const getImageUrl = (filename: string | null | undefined): string =>
  filename ? `http://localhost:3001/uploads/${filename}` : '/no-image.jpg'

const formatEth = (val: number | string | undefined | null) => {
  if (!val) return '0.0000 ETH'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `${num.toFixed(4)} ETH`
}

const updateCountdown = () => {
  if (!auction.value?.onchain?.endTime) return
  const endMs = new Date(auction.value.onchain.endTime).getTime()
  const now = Date.now()
  const diff = Math.max(0, endMs - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff / 3600000) % 24)
  const minutes = Math.floor((diff / 60000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  countdown.value = {
    DAYS: String(days).padStart(2, '0'),
    HOURS: String(hours).padStart(2, '0'),
    MINUTES: String(minutes).padStart(2, '0'),
    SECONDS: String(seconds).padStart(2, '0')
  }
}

const canBid = computed(() => {
  if (!auction.value?.onchain?.endTime) return false
  return Date.now() < new Date(auction.value.onchain.endTime).getTime() && auction.value.status === 'Active'
})

const loadBids = async (address: string) => {
  try { bidders.value = await getAllBids(address) } catch (err) { console.error(err) }
}

onMounted(async () => {
  const address = route.params.address as string
  auction.value = await getAuctionDetail(address)
  await loadBids(address)
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
  bidRefreshTimer = setInterval(() => loadBids(address), 15000)
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(bidRefreshTimer)
})

// === ĐẶT GIÁ ===
const placeBidAction = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return alert('Bạn cần đăng nhập.')
  if (!window.ethereum) return alert('Vui lòng cài MetaMask.')
  if (!bidAmount.value || bidAmount.value <= 0) return alert('Số tiền không hợp lệ.')

  if (bidAmount.value < minNextBid.value) {
    return alert(`Phải đặt ít nhất ${minNextBid.value.toFixed(4)} ETH`)
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
    await loadBids(contractAddress)
    bidAmount.value = 0
    alert(`Đặt giá thành công! Tx: ${tx.hash}`)
  } catch (err: any) {
    alert(err?.message || 'Đặt giá thất bại!')
  } finally {
    isPlacing.value = false
  }
}

// Hàm xóa số 0 khi focus
const clearZero = () => {
  if (bidAmount.value === 0 || bidAmount.value === null) {
    bidAmount.value = null
  }
}
const formatDateToday = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// 2. Hiển thị End Time kiểu: 18:00
const formatTime = (isoString: string | undefined) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
</script>

<style scoped>
@import url('https://rsms.me/inter/inter.css');
html { font-family: 'Inter', system-ui, sans-serif; }
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', system-ui, sans-serif; }
}
.bg-catawiki-blue { background-color: #0066FF; }
.text-catawiki-blue { color: #0066FF; }
</style>