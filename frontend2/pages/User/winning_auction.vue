<template>
  <div class="min-h-screen bg-white">
    <Header />

    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- TITLE – GIỐNG CATAWIKI 100% -->
      <div class="mb-12 text-center">
        <h1 class="text-5xl font-bold text-blue-900 tracking-tight">
          Các phiên bạn đã thắng
        </h1>
        <p class="mt-3 text-lg text-blue-600">
          Theo dõi trạng thái thanh toán và nhận hàng
        </p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="text-center py-24">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-xl text-gray-600">Đang tải chiến thắng của bạn...</p>
      </div>

      <!-- DANH SÁCH – VUÔNG VỨC, ĐẸP NHƯ CATAWIKI -->
      <div v-else-if="auctions.length" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="a in auctions"
          :key="a.contractAddress"
          class="bg-white shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden"
        >
          <!-- ẢNH + BADGE TRẠNG THÁI -->
          <div class="relative h-64 bg-gray-100">
            <img
              v-if="a.item?.mainImage"
              :src="a.item.mainImage"
              class="w-full h-full object-cover"
              alt="Vật phẩm"
            />
            <div v-else class="flex items-center justify-center h-full">
              <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16a2 2 0 012.828 0L20 16m-6-4v1" />
              </svg>
            </div>

            <!-- Badge trạng thái – vuông, nhỏ, đẹp -->
            <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 text-xs font-bold text-white shadow"
                :class="statusConfig[a.status]?.badge || 'bg-gray-500'"
              >
                {{ statusConfig[a.status]?.label || a.status }}
              </span>
            </div>
          </div>

          <!-- NỘI DUNG -->
          <div class="p-6">
            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-3">
              {{ a.item?.name }}
            </h3>
            <p class="text-sm text-gray-600 line-clamp-2 mb-5">
              {{ a.item?.description || 'Không có mô tả' }}
            </p>

            <!-- GIÁ THẮNG -->
            <div class="flex items-end justify-between mb-6">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">Giá thắng</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">
                  {{ formatEth(a.winningBid) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Seller nhận</p>
                <p class="font-mono text-sm text-blue-600 font-semibold">
                  {{ formatEth(a.winningBid * 0.9) }}
                </p>
              </div>
            </div>

            <!-- THỜI GIAN -->
            <div class="text-sm text-gray-600 mb-6">
              <span class="text-xs text-gray-500">Kết thúc:</span>
              <span class="font-medium ml-1">{{ formatDate(a.endTime) }}</span>
            </div>

            <!-- NÚT HÀNH ĐỘNG – VUÔNG, ĐẸP, KHÔNG BO TRÒN -->
            <div class="flex gap-3">
              <button
                v-if="a.status === 'Ended'"
                @click="payRemaining(a)"
                :disabled="paying"
                class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold transition disabled:opacity-60"
              >
                {{ paying ? 'Đang gửi...' : `Thanh toán ${formatEth(a.winningBid * 0.9)}` }}
              </button>

              <div
                v-else-if="a.status === 'Paid'"
                class="flex-1 py-3 text-center bg-blue-100 text-blue-700 font-bold"
              >
                Chờ seller giao hàng
              </div>

              <button
                v-else-if="a.status === 'Shipped'"
                @click="confirmReceived(a)"
                :disabled="confirming"
                class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold transition"
              >
                {{ confirming ? 'Đang xác nhận...' : 'Đã nhận hàng – Xác nhận OK' }}
              </button>

              <div
                v-else-if="a.status === 'Completed'"
                class="flex-1 py-3 text-center bg-green-100 text-green-700 font-bold"
              >
                Hoàn tất – Tiền đã về seller
              </div>

              <div
                v-else-if="a.status === 'PenalizedSeller'"
                class="flex-1 py-3 text-center bg-purple-100 text-purple-700 font-bold"
              >
                Seller bị phạt – Bạn được hoàn tiền + cọc
              </div>

              <div
                v-else-if="a.status === 'Penalized'"
                class="flex-1 py-3 text-center bg-red-100 text-red-700 font-bold"
              >
                Bạn bị phạt do không thanh toán
              </div>
            </div>

            <!-- XEM CHI TIẾT -->
            <div class="mt-5 text-center">
              <button
                @click="$router.push(`/auction/${a.contractAddress}`)"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm"
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