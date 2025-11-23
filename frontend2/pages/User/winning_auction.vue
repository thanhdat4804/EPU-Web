<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    <Header />
    <div class="max-w-7xl mx-auto p-6">
      <!-- TITLE -->
      <div class="mb-8 text-center">
        <h1 class="text-5xl font-bold text-blue-900 flex items-center justify-center gap-4">
          <span class="text-6xl">Các phiên bạn đã thắng</span>
        </h1>
        <p class="text-blue-600 mt-2 text-lg">Theo dõi trạng thái thanh toán và nhận hàng</p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-8 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-xl text-gray-600">Đang tải chiến thắng của bạn...</p>
      </div>

      <!-- DANH SÁCH -->
      <div v-else-if="auctions.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="a in auctions"
          :key="a.contractAddress"
          class="bg-white/95 backdrop-blur-xl shadow-xl border border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <!-- ẢNH + TRẠNG THÁI -->
          <div class="relative h-56 bg-gradient-to-br from-blue-100 to-cyan-100">
            <img
              v-if="a.item?.mainImage"
              :src="a.item.mainImage"
              class="w-full h-full object-cover"
              alt="Vật phẩm"
            />
            <div v-else class="flex items-center justify-center h-full">
              <span class="text-7xl text-blue-300">Trophy</span>
            </div>
            <!-- BADGE TRẠNG THÁI -->
            <div class="absolute top-3 right-3 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
                 :class="statusConfig[a.status]?.badge || 'bg-gray-500'">
              {{ statusConfig[a.status]?.label || a.status }}
            </div>
          </div>

          <!-- NỘI DUNG -->
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 line-clamp-1">{{ a.item?.name }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ a.item?.description || 'Không có mô tả' }}</p>

            <!-- GIÁ THẮNG -->
            <div class="mt-5 flex justify-between items-center">
              <div>
                <p class="text-xs text-gray-500">Giá thắng</p>
                <p class="font-bold text-2xl text-emerald-600">
                  {{ formatEth(a.winningBid) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Seller nhận</p>
                <p class="font-mono text-sm text-blue-700">
                  {{ formatEth(a.winningBid * 0.9) }}
                </p>
              </div>
            </div>

            <!-- THỜI GIAN -->
            <div class="mt-4 flex justify-between text-xs text-gray-500">
              <div>
                <span>Kết thúc:</span>
                <span class="font-medium ml-1">{{ formatDate(a.endTime) }}</span>
              </div>
            </div>

            <!-- NÚT HÀNH ĐỘNG – ĐÃ ĐƯỢC CẬP NHẬT HOÀN TOÀN -->
            <div class="mt-6 flex gap-3">
              <!-- 1. Chưa thanh toán -->
              <button
                v-if="a.status === 'Ended'"
                @click="payRemaining(a)"
                :disabled="paying"
                class="flex-1 py-3 px-5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-60"
              >
                {{ paying ? 'Đang gửi...' : `Thanh toán ${formatEth(a.winningBid * 0.9)}` }}
              </button>

              <!-- 2. Đã thanh toán → Chờ seller giao hàng -->
              <div
                v-else-if="a.status === 'Paid'"
                class="flex-1 py-3 text-center bg-blue-100 text-blue-700 font-bold rounded-xl"
              >
                Chờ seller giao hàng
              </div>

              <!-- 3. Đã giao hàng → Buyer bấm xác nhận (TRẠNG THÁI MỚI) -->
              <button
                v-else-if="a.status === 'Shipped'"
                @click="confirmReceived(a)"
                :disabled="confirming"
                class="flex-1 py-3 px-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all animate-pulse"
              >
                {{ confirming ? 'Đang xác nhận...' : 'Đã nhận hàng – Xác nhận OK' }}
              </button>

              <!-- 4. Hoàn tất -->
              <div
                v-else-if="a.status === 'Completed'"
                class="flex-1 py-3 text-center bg-green-100 text-green-700 font-bold rounded-xl"
              >
                Hoàn tất – Tiền đã về seller
              </div>

              <!-- 5. Seller bị phạt -->
              <div
                v-else-if="a.status === 'PenalizedSeller'"
                class="flex-1 py-3 text-center bg-purple-100 text-purple-700 font-bold rounded-xl"
              >
                Seller bị phạt – Bạn được hoàn tiền + cọc
              </div>

              <!-- 6. Buyer bị phạt (hiếm) -->
              <div
                v-else-if="a.status === 'Penalized'"
                class="flex-1 py-3 text-center bg-red-100 text-red-700 font-bold rounded-xl"
              >
                Bạn bị phạt do không thanh toán
              </div>
            </div>

            <!-- XEM CHI TIẾT -->
            <div class="mt-4 text-center">
              <button
                @click="$router.push(`/auction/${a.contractAddress}`)"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
              >
                Xem chi tiết phiên →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- KHÔNG CÓ DỮ LIỆU -->
      <div v-else class="text-center py-24">
        <div class="text-9xl mb-6 text-gray-200">Trophy</div>
        <p class="text-3xl text-gray-600 mb-4">Bạn chưa thắng phiên nào</p>
        <NuxtLink to="/" class="text-blue-600 hover:underline text-xl font-bold">
          Đi đấu giá ngay nào!
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import Header from '~/components/User/Header.vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

// STATE
const auctions = ref<any[]>([])
const loading = ref(true)
const paying = ref(false)
const confirming = ref(false)

// API
const { getMyWinningAuctions, recordPayment, confirmReceived: apiConfirmReceived } = useAuctionApi()

// ==================== LOAD DATA ====================
onMounted(async () => {
  try {
    const data = await getMyWinningAuctions()
    auctions.value = data.map(a => ({
      ...a,
      onchain: a.onchain || {},
    }))
  } catch (err: any) {
    alert('Lỗi tải dữ liệu: ' + err.message)
  } finally {
    loading.value = false
  }
})

// ==================== THANH TOÁN 90% ====================
const payRemaining = async (a: any) => {
  paying.value = true
  try {
    if (!window.ethereum) throw new Error('Cài MetaMask để thanh toán!')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const amountToPay = ethers.utils.parseEther((a.winningBid * 0.9).toFixed(18))

    const contract = new ethers.Contract(
      a.contractAddress,
      ['function payWinningBid() payable'],
      signer
    )

    const tx = await contract.payWinningBid({
      value: amountToPay,
      gasLimit: 300000
    })

    alert('Đang gửi thanh toán 90%... Vui lòng chờ xác nhận blockchain!')
    await tx.wait()

    await recordPayment(a.contractAddress, tx.hash)
    a.status = 'Paid'

    alert('THANH TOÁN THÀNH CÔNG! Chờ seller giao hàng')
  } catch (err: any) {
    console.error('Lỗi thanh toán:', err)
    alert(err?.reason || err?.message || 'Thanh toán thất bại!')
  } finally {
    paying.value = false
  }
}

// ==================== XÁC NHẬN NHẬN HÀNG ====================
const confirmReceived = async (a: any) => {
  confirming.value = true
  try {
    if (!window.ethereum) throw new Error('Cài MetaMask để xác nhận!')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      a.contractAddress,
      ['function confirmReceived() external'],
      signer
    )

    const tx = await contract.confirmReceived({ gasLimit: 200000 })

    alert('Đang xác nhận bạn đã nhận hàng...')
    await tx.wait()

    await apiConfirmReceived(a.contractAddress, tx.hash)
    a.status = 'Completed'

    alert('XÁC NHẬN THÀNH CÔNG! Tiền + cọc đã được chuyển cho seller!')
  } catch (err: any) {
    console.error('Lỗi xác nhận nhận hàng:', err)
    alert(err?.reason || err?.message || 'Xác nhận thất bại!')
  } finally {
    confirming.value = false
  }
}

// ==================== HELPER ====================
const formatEth = (v: number | string) => {
  return Number(v).toFixed(4) + ' ETH'
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

// ==================== STATUS CONFIG (CHỈ BADGE + LABEL) ====================
const statusConfig: any = {
  Ended: { label: 'Chưa thanh toán', badge: 'bg-orange-600' },
  Paid: { label: 'Đã thanh toán', badge: 'bg-blue-600' },
  Shipped: { label: 'Đã giao hàng', badge: 'bg-purple-600' },
  Completed: { label: 'Hoàn tất', badge: 'bg-green-600' },
  PenalizedSeller: { label: 'Seller bị phạt', badge: 'bg-purple-700' },
  Penalized: { label: 'Bạn bị phạt', badge: 'bg-red-600' },
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>