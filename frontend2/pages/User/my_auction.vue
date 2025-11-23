<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    <Header />
    <div class="max-w-7xl mx-auto p-6">
      <!-- HEADER -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-blue-900 flex items-center gap-3">
          <span class="text-5xl">Quản lý đấu giá</span>
        </h1>
        <p class="text-blue-600 mt-1">Xem, theo dõi và tương tác với các đấu giá bạn tạo</p>
      </div>

      <!-- TAB -->
      <div class="flex border-b border-blue-200 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2"
          :class="activeTab === tab.key
            ? 'border-blue-600 text-blue-700 bg-blue-50'
            : 'border-transparent text-gray-600 hover:text-blue-600'"
        >
          {{ tab.label }} 
          <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
            :class="tab.count > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- DANH SÁCH ĐẤU GIÁ -->
      <div v-if="auctions.length === 0" class="text-center py-16">
        <p class="text-gray-500 text-lg">Chưa có đấu giá nào ở trạng thái này</p>
        <button @click="$router.push('/create-auction')"
          class="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition">
          Tạo đấu giá mới
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="auc in auctions" :key="auc.contractAddress"
          class="bg-white/95 backdrop-blur-xl shadow-xl border border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-2xl transition">
          
          <!-- HÌNH ẢNH -->
          <div class="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
            <img v-if="auc.item.mainImage" :src="auc.item.mainImage" class="w-full h-full object-cover" />
            <div v-else class="flex items-center justify-center h-full">
              <span class="text-6xl text-blue-300">Package</span>
            </div>
            <!-- TRẠNG THÁI -->
            <div class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow"
              :class="statusConfig[auc.status].badge">
              {{ statusConfig[auc.status].label }}
            </div>
          </div>

          <!-- NỘI DUNG -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900 line-clamp-1">{{ auc.item.name }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ auc.item.description || 'Không có mô tả' }}</p>

            <!-- GIÁ HIỆN TẠI -->
            <div class="mt-4 flex justify-between items-center">
              <div>
                <p class="text-xs text-gray-500">Giá hiện tại</p>
                <p class="font-bold text-xl text-emerald-600">
                  {{ formatPrice(auc.onchain?.highestBid || auc.item.startingPrice) }} ETH
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Người đặt cao nhất</p>
                <p class="font-mono text-xs text-blue-700">
                  {{ auc.onchain?.highestBidder ? shortenAddress(auc.onchain.highestBidder) : 'Chưa có' }}
                </p>
              </div>
            </div>

            <!-- THỜI GIAN -->
            <div class="mt-3 flex justify-between text-xs">
              <div>
                <span class="text-gray-500">Bắt đầu:</span>
                <span class="font-medium ml-1">{{ formatDate(auc.startTime) }}</span>
              </div>
              <div>
                <span class="text-gray-500">Kết thúc:</span>
                <span class="font-medium ml-1">{{ formatDate(auc.endTime) }}</span>
              </div>
            </div>

            <!-- NÚT TƯƠNG TÁC -->
            <div class="mt-5 flex gap-2">
              <button @click="viewDetail(auc.contractAddress)"
                class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition">
                Xem chi tiết
              </button>
              <template v-if="canAct(auc)">
                <button @click="handleAction(auc)" :class="actionClass(auc)" class="flex-1 py-3 font-bold rounded-xl">
                  {{ isActing ? 'Đang xử lý...' : actionText(auc) }}
                </button>
              </template>
              <div v-else :class="statusBoxClass(auc)" class="flex-1 py-3 text-center font-bold rounded-xl">
                {{ statusMessage(auc) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import Header from '~/components/User/Header.vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

const router = useRouter()
const { getMyAuctions, confirmShipped, confirmReceived } = useAuctionApi()

// ==================== STATE ====================
const activeTab = ref('all')
const allAuctions = ref<any[]>([])      // ← DỮ LIỆU GỐC, KHÔNG BAO GIỜ GÁN LẠI
const isActing = ref(false)
const currentUserAddress = ref<string>('')

// ==================== TABS ====================
const tabs = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'Active', label: 'Đang diễn ra', count: 0 },
  { key: 'Ended', label: 'Đã kết thúc', count: 0 },
  { key: 'Paid', label: 'Đã thanh toán', count: 0 },
  { key: 'Shipped', label: 'Đã giao hàng', count: 0 },
  { key: 'Completed', label: 'Hoàn tất', count: 0 },
  { key: 'Penalized', label: 'Bị phạt', count: 0 },
  { key: 'PenalizedSeller', label: 'Bị phạt (bạn)', count: 0 },
]

// ==================== STATUS BADGE ====================
const statusConfig: any = {
  Active: { label: 'Đang đấu giá', badge: 'bg-emerald-500' },
  Ended: { label: 'Đã kết thúc', badge: 'bg-gray-500' },
  Paid: { label: 'Đã thanh toán', badge: 'bg-blue-600' },
  Shipped: { label: 'Đã giao hàng', badge: 'bg-purple-600' },
  Completed: { label: 'Hoàn tất', badge: 'bg-green-600' },
  Penalized: { label: 'Buyer bị phạt', badge: 'bg-red-500' },
  PenalizedSeller: { label: 'Bạn bị phạt', badge: 'bg-red-600' },
}

// ==================== LOAD + KẾT NỐI VÍ ====================
onMounted(async () => {
  await Promise.all([loadAuctions(), connectWallet()])
})

const loadAuctions = async () => {
  try {
    const data = await getMyAuctions()
    allAuctions.value = data
    updateTabCounts()
  } catch (err) {
    alert('Lỗi tải dữ liệu đấu giá')
  }
}

const connectWallet = async () => {
  if (!window.ethereum) return
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    currentUserAddress.value = (await signer.getAddress()).toLowerCase()
  } catch (err) {
    console.warn('User từ chối kết nối ví')
  }
}

// ==================== TAB + FILTER (ĐÃ SỬA LỖI MẤT LIST) ====================
const updateTabCounts = () => {
  tabs.forEach(tab => {
    tab.count = tab.key === 'all'
      ? allAuctions.value.length
      : allAuctions.value.filter(a => a.status === tab.key).length
  })
}

const auctions = computed(() => {
  if (activeTab.value === 'all') return allAuctions.value
  return allAuctions.value.filter(a => a.status === activeTab.value)
})

// ==================== HELPER ====================
const formatPrice = (v: any) => Number(v || 0).toFixed(4)
const shortenAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
const viewDetail = (addr: string) => router.push(`/auction/${addr}`)

// ==================== QUYỀN + NÚT – DÙNG COMPUTED ĐỂ KHÔNG BỊ LỖI EXPOSE ====================
const canAct = computed(() => (auc: any) => {
  if (!currentUserAddress.value) return false
  const user = currentUserAddress.value
  const isSeller = auc.seller?.wallet?.toLowerCase() === user
  const isBuyer = auc.onchain?.highestBidder?.toLowerCase() === user
  return (auc.status === 'Paid' && isSeller) || (auc.status === 'Shipped' && isBuyer)
})

const actionText = computed(() => (auc: any) => 
  auc.status === 'Paid' ? 'Xác nhận giao hàng' : 'Xác nhận nhận hàng'
)

const actionClass = computed(() => (auc: any) => 
  auc.status === 'Paid'
    ? 'bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg'
    : 'bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg'
)

const statusMessage = computed(() => (auc: any) => {
  if (!currentUserAddress.value) return 'Chưa kết nối ví'
  const user = currentUserAddress.value
  const isSeller = auc.seller?.wallet?.toLowerCase() === user
  if (auc.status === 'Paid' && !isSeller) return 'Chờ bạn giao hàng'
  if (auc.status === 'Shipped' && isSeller) return 'Đã giao – Chờ buyer xác nhận'
  if (auc.status === 'Completed') return 'Hoàn tất'
  if (auc.status === 'PenalizedSeller') return 'Bạn bị phạt'
  return 'Không có hành động'
})

const statusBoxClass = computed(() => (auc: any) => {
  if (auc.status === 'Paid') return 'bg-blue-100 text-blue-700'
  if (auc.status === 'Shipped') return 'bg-purple-100 text-purple-700'
  if (auc.status === 'Completed') return 'bg-green-100 text-green-700'
  if (auc.status.includes('Penalized')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
})

// ==================== HÀNH ĐỘNG ====================
const handleAction = async (auc: any) => {
  if (isActing.value) return
  isActing.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const user = (await signer.getAddress()).toLowerCase()
    let tx

    if (auc.status === 'Paid' && auc.seller.wallet.toLowerCase() === user) {
      const contract = new ethers.Contract(auc.contractAddress, ['function confirmShipped() external'], signer)
      tx = await contract.confirmShipped({ gasLimit: 300000 })
      await tx.wait()
      await confirmShipped(auc.contractAddress, tx.hash)
      alert('ĐÃ GIAO HÀNG THÀNH CÔNG!')
    }
    else if (auc.status === 'Shipped' && auc.onchain?.highestBidder?.toLowerCase() === user) {
      const contract = new ethers.Contract(auc.contractAddress, ['function confirmReceived() external'], signer)
      tx = await contract.confirmReceived({ gasLimit: 300000 })
      await tx.wait()
      await confirmReceived(auc.contractAddress, tx.hash)
      alert('XÁC NHẬN NHẬN HÀNG THÀNH CÔNG!')
    }
    else throw new Error('Không có quyền!')

    await loadAuctions()
  } catch (err: any) {
    alert(err.message || 'Thao tác thất bại')
  } finally {
    isActing.value = false
  }
}
</script>