<template>
  <div class="min-h-screen bg-white">
    <Header />
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12">
        <h1 class="text-5xl font-bold text-blue-900 tracking-tight">
          Quản lý đấu giá
        </h1>
        <p class="mt-3 text-lg text-blue-600">
          Theo dõi và quản lý các phiên đấu giá bạn đã tạo
        </p>
      </div>

      <!-- TABS -->
      <div class="border-b border-gray-200 mb-10">
        <div class="flex flex-wrap gap-x-8 gap-y-4 -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="group inline-flex items-center py-4 px-1 border-b-3 font-medium text-sm transition-all duration-300 whitespace-nowrap"
            :class="[
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
            ]"
          >
            <span class="relative">
              {{ tab.label }}
              <span
                class="absolute -top-1 -right-6 px-2.5 py-0.5 text-xs font-bold rounded-full transition-all duration-300"
                :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
              >
                {{ tab.count }}
              </span>
            </span>
          </button>
        </div>
      </div>

      <!-- KHI KHÔNG CÓ DỮ LIỆU -->
      <div v-if="displayedItems.length === 0" class="text-center py-24">
        <div class="bg-gray-200 border-2 border-dashed w-32 h-32 mx-auto mb-8"></div>
        <p class="text-xl text-gray-500 mb-6">Chưa có vật phẩm nào ở trạng thái này</p>
        <button
          @click="$router.push('/create-item')"
          class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow transition"
        >
          Tạo vật phẩm mới
        </button>
      </div>

      <!-- DANH SÁCH -->
      <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in displayedItems"
          :key="item.id || item.contractAddress"
          class="bg-white shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden"
        >
          <div class="relative h-64 bg-gray-100">
            <img
              v-if="getImageUrl(item)"
              :src="getImageUrl(item)"
              class="w-full h-full object-cover"
              alt=""
            />
            <div v-else class="flex items-center justify-center h-full">
              <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16a2 2 0 012.828 0L20 16m-6-4v1" />
              </svg>
            </div>
            <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 text-xs font-bold text-white shadow"
                :class="statusConfig[getItemStatus(item)]?.badge || 'bg-gray-500'"
              >
                {{ statusConfig[getItemStatus(item)]?.label || 'Không xác định' }}
              </span>
            </div>
          </div>

          <div class="p-6">
            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-3">
              {{ item.name || item.item?.name }}
            </h3>

            <div class="flex items-end justify-between mb-5">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">
                  {{ item.auction || item.onchain ? 'Giá hiện tại' : 'Giá khởi điểm' }}
                </p>
                <p class="text-2xl font-bold text-gray-900 mt-1">
                  {{ formatPrice(item.onchain?.highestBid || item.auction?.onchain?.highestBid || item.startingPrice) }} ETH
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Người đặt cao nhất</p>
                <p class="font-mono text-sm text-blue-600 font-medium">
                  {{ (item.onchain?.highestBidder || item.auction?.onchain?.highestBidder) ? shortenAddress(item.onchain?.highestBidder || item.auction?.onchain?.highestBidder) : 'Chưa có' }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div>
                <span class="block text-xs text-gray-500">Bắt đầu</span>
                <span class="font-medium">{{ formatDate(item.startTime || item.auction?.startTime) }}</span>
              </div>
              <div>
                <span class="block text-xs text-gray-500">Kết thúc</span>
                <span class="font-medium">{{ formatDate(item.endTime || item.auction?.endTime) }}</span>
              </div>
            </div>

            <!-- NÚT HÀNH ĐỘNG -->
            <div class="flex gap-3">
              <button
                @click="viewDetail(item.contractAddress || item.auction?.contractAddress)"
                class="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
                :disabled="!item.contractAddress && !item.auction?.contractAddress"
              >
                Xem chi tiết
              </button>

              <!-- NÚT THANH TOÁN – HIỆN MODAL CHÍNH SÁCH -->
              <button
                v-if="item.status === 'approved' && !item.auction"
                @click="openPaymentModal(item)"
                class="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg transition"
                :disabled="isActing"
              >
                {{ isActing ? 'Đang xử lý...' : 'Thanh toán & Tạo đấu giá' }}
              </button>

              <!-- NÚT XÁC NHẬN GIAO/NHẬN HÀNG -->
              <template v-else-if="canAct(item)">
                <button
                  @click="handleAction(item)"
                  :class="actionClass(item)"
                  class="flex-1 py-3 font-bold text-white transition"
                  :disabled="isActing"
                >
                  {{ isActing ? 'Đang xử lý...' : actionText(item) }}
                </button>
              </template>

              <div
                v-else
                :class="statusBoxClass(item)"
                class="flex-1 py-3 text-center font-medium"
              >
                {{ statusMessage(item) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CHÍNH SÁCH + CHECKBOX "TÔI CHẤP NHẬN" -->
    <teleport to="body">
      <div v-if="showPolicyModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Chính sách & Điều khoản đấu giá</h2>
              <button @click="showPolicyModal = false" class="text-gray-400 hover:text-gray-600 transition">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="prose prose-lg text-gray-700 space-y-4">
              <p>Khi bấm <strong>Thanh toán & Tạo đấu giá</strong>, bạn đồng ý với các điều khoản sau:</p>
              <ul class="list-disc pl-6 space-y-3">
                <li>Bạn sẽ đặt cọc <strong>20% giá khởi điểm</strong> (không hoàn lại nếu không giao hàng)</li>
                <li>Nếu không giao hàng đúng hạn → mất toàn bộ cọc</li>
                <li>Nếu người mua không thanh toán → mất tiền cọc của họ</li>
                <li>Tất cả giao dịch được ghi trên blockchain → không thể hủy, không thể sửa</li>
                <li>Phí gas do bạn tự chịu</li>
              </ul>

              <div class="bg-red-50 border border-red-200 p-4 mt-6">
                <p class="font-bold text-red-800">CẢNH BÁO:</p>
                <p class="text-red-700 mt-1">Sau khi xác nhận, giao dịch sẽ được gửi lên blockchain ngay lập tức và <strong>KHÔNG THỂ HỦY</strong>!</p>
              </div>
            </div>

            <!-- CHECKBOX CHẤP NHẬN -->
            <div class="mt-8 flex items-center gap-4">
              <input
                v-model="acceptPolicy"
                type="checkbox"
                id="accept-policy"
                class="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
              />
              <label for="accept-policy" class="text-lg font-medium text-gray-900 cursor-pointer select-none">
                Tôi đã đọc và chấp nhận toàn bộ chính sách & điều khoản trên
              </label>
            </div>

            <!-- NÚT XÁC NHẬN -->
            <div class="mt-8 flex justify-end gap-4">
              <button
                @click="showPolicyModal = false"
                class="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Hủy bỏ
              </button>
              <button
                @click="confirmAndPay"
                :disabled="!acceptPolicy || isActing"
                class="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span v-if="isActing" class="flex items-center gap-2">
                  <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
                <span v-else>
                  Xác nhận & Thanh toán ngay
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'

import Header from '~/components/User/Header.vue'
import { useItem } from '~/composables/useItem'
import { useAuctionApi } from '~/composables/useAuctionApi'

// ==================== ROUTER & COMPOSABLES ====================
const router = useRouter()
const { getMyItems } = useItem()
const { getMyAuctions, createAuctionFromItem, confirmShipped, confirmReceived } = useAuctionApi()

// ==================== STATE ====================
const activeTab = ref('all')
const items = ref<any[]>([])
const auctions = ref<any[]>([])
const isActing = ref(false)
const currentUserAddress = ref<string>('')

// ==================== MODAL THANH TOÁN ====================
const showPolicyModal = ref(false)
const acceptPolicy = ref(false)
const pendingItem = ref<any>(null)

const openPaymentModal = (item: any) => {
  pendingItem.value = item
  acceptPolicy.value = false
  showPolicyModal.value = true
}

const confirmAndPay = async () => {
  if (!acceptPolicy.value || !pendingItem.value) return
  showPolicyModal.value = false
  await handlePayment(pendingItem.value)
  pendingItem.value = null
}
// ==================== TABS ====================
const tabs = [
  { key: 'all',           label: 'Tất cả',                     count: 0 },
  { key: 'pending',       label: 'Chờ duyệt',                  count: 0 },
  { key: 'approved',      label: 'Đã duyệt (chờ thanh toán)',  count: 0 },
  { key: 'Active',        label: 'Đang diễn ra',               count: 0 },
  { key: 'Ended',         label: 'Đã kết thúc',                count: 0 },
  { key: 'Paid',          label: 'Đã thanh toán',              count: 0 },
  { key: 'Shipped',       label: 'Đã giao hàng',               count: 0 },
  { key: 'Completed',     label: 'Hoàn tất',                   count: 0 },
  { key: 'Penalized',     label: 'Bị phạt',                    count: 0 },
  { key: 'PenalizedSeller', label: 'Bị phạt (bạn)',            count: 0 },
]

const statusConfig: any = {
  pending:         { label: 'Chờ duyệt',         badge: 'bg-yellow-500' },
  approved:        { label: 'Đã duyệt',          badge: 'bg-blue-500' },
  Active:          { label: 'Đang đấu giá',      badge: 'bg-emerald-500' },
  Ended:           { label: 'Đã kết thúc',       badge: 'bg-gray-500' },
  Paid:            { label: 'Đã thanh toán',     badge: 'bg-blue-600' },
  Shipped:         { label: 'Đã giao hàng',     badge: 'bg-purple-600' },
  Completed:       { label: 'Hoàn tất',          badge: 'bg-green-600' },
  Penalized:       { label: 'Buyer bị phạt',     badge: 'bg-red-500' },
  PenalizedSeller: { label: 'Bạn bị phạt',       badge: 'bg-red-600' },
}

// ==================== HELPER FUNCTIONS ====================
// Hiển thị ảnh đúng đường dẫn /uploads/
const getImageUrl = (item: any): string => {
  const image = item.mainImage || item.item?.mainImage
  return image ? `http://localhost:3001/uploads/${image}` : '/no-image.jpg'
}

// Lấy wallet của seller từ mọi nguồn dữ liệu
const getSellerWallet = (item: any): string | null => {
  return (
    item.seller?.wallet?.toLowerCase() ||
    item.owner?.wallet?.toLowerCase() ||
    item.item?.owner?.wallet?.toLowerCase() ||
    null
  )
}

// Lấy contract address đúng 100%
const getContractAddress = (item: any): string | null => {
  return (
    item.auction?.contractAddress ||
    item.contractAddress ||
    item.item?.auction?.contractAddress ||
    null
  )
}

// Format
const formatPrice = (v: any) => Number(v || 0).toFixed(4)
const shortenAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
const formatDate = (d: string) => d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''
const viewDetail = (addr: string) => addr && router.push(`/auction/${addr}`)

// ==================== LOAD DATA ====================
onMounted(async () => {
  await Promise.all([
    loadItems(),
    loadAuctions(),
    connectWallet()
  ])
})

const loadItems = async () => {
  try {
    const data = await getMyItems()
    items.value = data || []
    updateTabCounts()
  } catch (err) {
    console.error('Lỗi tải items:', err)
  }
}

const loadAuctions = async () => {
  try {
    const data = await getMyAuctions()
    auctions.value = data || []
    updateTabCounts()
  } catch (err) {
    console.error('Lỗi tải auctions:', err)
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

// ==================== TAB COUNTS ====================
const updateTabCounts = () => {
  tabs.forEach(tab => {
    if (tab.key === 'all') {
      tab.count = items.value.length + auctions.value.length
    } else if (tab.key === 'pending') {
      tab.count = items.value.filter(i => i.status === 'pending').length
    } else if (tab.key === 'approved') {
      tab.count = items.value.filter(i => i.status === 'approved' && !i.auction).length
    } else {
      tab.count = auctions.value.filter(a => a.status === tab.key).length
    }
  })
}

// ==================== DISPLAYED ITEMS ====================
const displayedItems = computed(() => {
  const all = [...items.value, ...auctions.value]
  
  return all.filter(item => {
    const status = getItemStatus(item)
    return status !== null && status !== 'unknown'
  })
})

// ==================== THANH TOÁN & TẠO ĐẤU GIÁ ====================
const handlePayment = async (item: any) => {
  if (!window.ethereum) return alert('Cài MetaMask!')
  if (isActing.value) return
  isActing.value = true

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()

    const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const factoryABI = [
      'function createAction(uint256 _biddingTime, address _seller, uint256 _startingPrice) payable',
      'event ActionCreated(address indexed seller, address actionAddress, uint startingPrice, uint sellerDeposit, uint endTime)'
    ]
    const factory = new ethers.Contract(factoryAddress, factoryABI, signer)

    const startingPriceWei = ethers.utils.parseEther(item.startingPrice.toString())
    
    
    const listingFee = ethers.utils.parseEther("5") // ← ĐÂY LÀ TIỀN THẬT!

    // CỌC 20% + PHÍ LISTING
    const depositWei = startingPriceWei.mul(20).div(100)
    const totalValue = depositWei.add(listingFee) // ← TRỪ TIỀN THẬT!

    const biddingTime = item.duration * 60

    const tx = await factory.createAction(
      biddingTime,
      userAddress,
      startingPriceWei,
      { 
        value: totalValue, // ← GỬI CẢ CỌC + PHÍ LISTING
        gasLimit: 6000000 
      }
    )

    alert(`Đang tạo đấu giá...\nCọc: ${ethers.utils.formatEther(depositWei)} ETH\nPhí listing: ${ethers.utils.formatEther(listingFee)} ETH\nTổng: ${ethers.utils.formatEther(totalValue)} ETH`)

    const receipt = await tx.wait()
    const iface = new ethers.utils.Interface(factoryABI)
    const event = receipt.logs
      .map(log => { try { return iface.parseLog(log) } catch { return null } })
      .find(e => e?.name === 'ActionCreated')

    if (!event?.args?.actionAddress) throw new Error('Không lấy được địa chỉ hợp đồng!')
    const contractAddress = event.args.actionAddress

    await createAuctionFromItem(item.id, contractAddress, tx.hash)
    alert('Tạo đấu giá thành công! Đã trừ phí listing.')

    items.value = items.value.filter(i => i.id !== item.id)
    await loadAuctions()
    router.push(`/auction/${contractAddress}`)

  } catch (err: any) {
    console.error(err)
    alert('Lỗi: ' + (err.message || 'Tạo đấu giá thất bại'))
  } finally {
    isActing.value = false
  }
}

// ==================== XÁC NHẬN GIAO HÀNG / NHẬN HÀNG – ĐÃ SỬA HOÀN HẢO ====================
const handleAction = async (item: any) => {
  if (isActing.value) return
  isActing.value = true

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const contractAddress = getContractAddress(item)
    if (!contractAddress) throw new Error('Không tìm thấy địa chỉ hợp đồng!')

    const status = item.auction?.status || item.status

    let tx

    if (status === 'Paid') {
      const contract = new ethers.Contract(contractAddress, ['function confirmShipped() external'], signer)
      tx = await contract.confirmShipped({ gasLimit: 300000 })
      await tx.wait()
      await confirmShipped(contractAddress, tx.hash)
      alert('ĐÃ GIAO HÀNG THÀNH CÔNG!')
    }
    else if (status === 'Shipped') {
      const contract = new ethers.Contract(contractAddress, ['function confirmReceived() external'], signer)
      tx = await contract.confirmReceived({ gasLimit: 300000 })
      await tx.wait()
      await confirmReceived(contractAddress, tx.hash)
      alert('ĐÃ XÁC NHẬN NHẬN HÀNG!')
    }

    await loadAuctions()
  } catch (err: any) {
    console.error(err)
    alert(err.message || 'Thao tác thất bại')
  } finally {
    isActing.value = false
  }
}

// ==================== TRẠNG THÁI & NÚT – HOÀN HẢO NHẤT ====================
const getItemStatus = (item: any) => {
  // ƯU TIÊN 1: Nếu là item thuần (không có auction)
  if (!item.auction && item.status) {
    if (item.status === 'pending') return 'pending'
    if (item.status === 'approved') return 'approved'
  }

  // ƯU TIÊN 2: Nếu có auction → dùng status của auction
  if (item.auction?.status) {
    return item.auction.status
  }

  // ƯU TIÊN 3: Nếu item có status rõ ràng
  if (item.status && ['Active', 'Ended', 'Paid', 'Shipped', 'Completed', 'Penalized', 'PenalizedSeller'].includes(item.status)) {
    return item.status
  }

  // Mọi trường hợp khác → không hiển thị (bị loại ở displayedItems)
  return null
}

const canAct = computed(() => (item: any) => {
  if (!currentUserAddress.value) return false

  const sellerWallet = getSellerWallet(item)
  const buyerWallet = (item.auction?.onchain?.highestBidder || item.onchain?.highestBidder)?.toLowerCase()
  const status = item.auction?.status || item.status

  const isSeller = sellerWallet === currentUserAddress.value
  const isBuyer = buyerWallet === currentUserAddress.value

  return (status === 'Paid' && isSeller) || (status === 'Shipped' && isBuyer)
})

const actionText = computed(() => (item: any) => {
  const status = item.auction?.status || item.status
  return status === 'Paid' ? 'Xác nhận giao hàng' : 'Xác nhận nhận hàng'
})

const actionClass = computed(() => (item: any) => {
  const status = item.auction?.status || item.status
  return status === 'Paid'
    ? 'bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg'
    : 'bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg'
})

const statusMessage = computed(() => (item: any) => {
  if (!currentUserAddress.value) return 'Chưa kết nối ví'

  const sellerWallet = getSellerWallet(item)
  const status = item.auction?.status || item.status
  const isSeller = sellerWallet === currentUserAddress.value

  if (status === 'pending') return 'Đang chờ duyệt'
  if (status === 'approved' && !item.auction) return 'Chờ bạn thanh toán'
  if (status === 'Paid' && !isSeller) return 'Chờ bạn giao hàng'
  if (status === 'Shipped' && isSeller) return 'Đã giao – Chờ buyer xác nhận'
  if (status === 'Completed') return 'Hoàn tất'
  if (status?.includes('Penalized')) return 'Bị phạt'
  return 'Không có hành động'
})

const statusBoxClass = computed(() => (item: any) => {
  const status = item.auction?.status || item.status
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (status === 'approved' && !item.auction) return 'bg-blue-100 text-blue-700'
  if (status === 'Paid') return 'bg-blue-100 text-blue-700'
  if (status === 'Shipped') return 'bg-purple-100 text-purple-700'
  if (status === 'Completed') return 'bg-green-100 text-green-700'
  if (status?.includes('Penalized')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
})
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