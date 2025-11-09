<template>
  <div class="bg-gray-50 min-h-screen p-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">
      Các phiên đấu giá bạn đã thắng
    </h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p class="mt-3 text-gray-600">Đang tải danh sách...</p>
    </div>

    <!-- Danh sách -->
    <div v-else>
      <div v-if="auctions.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="a in auctions"
          :key="a.contractAddress"
          class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <!-- Hình ảnh + thông tin -->
          <div>
            <img
              :src="a.item?.imageUrl || '/no-image.jpg'"
              class="w-full h-48 object-cover rounded-xl mb-4 shadow-sm"
              alt="Ảnh vật phẩm"
            />
            <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ a.item?.name }}</h2>
            <p class="text-gray-600 mb-3 line-clamp-2">{{ a.item?.description }}</p>

            <!-- Giá thắng -->
            <p class="text-gray-700 mb-1">
              <b class="text-green-600">Giá thắng:</b>
              <span class="font-mono text-lg ml-1">{{ formatEth(a.winningBid) }}</span>
            </p>

            <!-- Đã thanh toán bao nhiêu -->
            <p class="text-gray-700 mb-1" v-if="a.status !== 'Ended'">
              <b>Đã gửi:</b>
              <span class="font-mono">{{ formatEth(a.winningBid * 0.9) }}</span>
              <span class="text-sm text-gray-500 ml-1">(90% còn lại)</span>
            </p>

            <!-- Thời gian kết thúc -->
            <p class="text-gray-700 mb-1">
              <b>Kết thúc:</b> {{ formatDate(a.endTime) }}
            </p>

            <!-- Trạng thái -->
            <p class="text-gray-700 mb-3">
              <b>Trạng thái:</b>
              <span
                class="px-3 py-1 rounded-full text-white text-sm font-medium ml-2"
                :class="{
                  'bg-orange-500': a.status === 'Ended',
                  'bg-blue-600': a.status === 'Paid',
                  'bg-green-600': a.status === 'Completed',
                  'bg-red-600': a.status === 'Penalized',
                }"
              >
                {{ statusText(a.status) }}
              </span>
            </p>
          </div>

          <!-- NÚT HÀNH ĐỘNG -->
          <div class="mt-4 space-y-2">
            <!-- 1. Chưa thanh toán → Gửi phần còn lại -->
            <button
              v-if="a.status === 'Ended'"
              @click="payRemaining(a)"
              :disabled="paying"
              class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-60"
            >
              <span v-if="paying">Đang gửi...</span>
              <span v-else>Thanh toán {{ formatEth(a.winningBid * 0.9) }}</span>
            </button>

            <!-- 2. Đã thanh toán → Xác nhận nhận hàng -->
            <button
              v-else-if="a.status === 'Paid'"
              @click="confirmReceived(a)"
              :disabled="confirming"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60"
            >
              <span v-if="confirming">Đang xác nhận...</span>
              <span v-else>Xác nhận đã nhận hàng</span>
            </button>

            <!-- 3. Hoàn tất / Bị phạt -->
            <div
              v-else
              class="w-full py-3 text-center font-medium rounded-lg"
              :class="{
                'bg-green-100 text-green-700': a.status === 'Completed',
                'bg-red-100 text-red-700': a.status === 'Penalized',
              }"
            >
              {{ a.status === 'Completed' ? 'Hoàn tất' : 'Bị phạt (mất cọc)' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Không có dữ liệu -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4 text-gray-300">Chưa có chiến thắng</div>
        <p class="text-gray-600 text-lg mb-4">Bạn chưa thắng bất kỳ phiên đấu giá nào.</p>
        <NuxtLink to="/" class="text-blue-600 hover:underline font-medium">
          Quay lại trang chủ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { useAuctionApi } from '~/composables/useAuctionApi'

const auctions = ref<any[]>([])
const loading = ref(true)
const paying = ref(false)
const confirming = ref(false)

const { getMyWinningAuctions, recordPayment, confirmReceived: apiConfirmReceived } = useAuctionApi()

// LẤY DANH SÁCH THẮNG TỪ API
onMounted(async () => {
  try {
    auctions.value = await getMyWinningAuctions()
  } catch (err: any) {
    alert(err.message || 'Không thể tải danh sách đấu giá thắng')
  } finally {
    loading.value = false
  }
})

// 1. THANH TOÁN PHẦN CÒN LẠI (90%)
const payRemaining = async (auction: any) => {
  if (paying.value) return
  paying.value = true

  try {
    if (!window.ethereum) throw new Error('Cài MetaMask!')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      auction.contractAddress,
      ['function payWinningBid() payable'],
      signer
    )

    const remaining = ethers.utils.parseEther((auction.winningBid * 0.9).toString())
    const tx = await contract.payWinningBid({ value: remaining })
    alert('Đang gửi giao dịch...')

    const receipt = await tx.wait()

    // GHI NHẬN BACKEND
    await recordPayment(auction.contractAddress, receipt.transactionHash)

    // CẬP NHẬT UI
    auction.status = 'Paid'
    alert('Thanh toán thành công! Vui lòng chờ nhận hàng.')
  } catch (err: any) {
    alert(err?.message || 'Thanh toán thất bại!')
  } finally {
    paying.value = false
  }
}

// 2. XÁC NHẬN ĐÃ NHẬN HÀNG → CHUYỂN TIỀN CHO SELLER
const confirmReceived = async (auction: any) => {
  if (confirming.value) return
  confirming.value = true

  try {
    if (!window.ethereum) throw new Error('Cài MetaMask!')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      auction.contractAddress,
      ['function confirmReceived()'],
      signer
    )

    const tx = await contract.confirmReceived()
    alert('Đang xác nhận...')

    const receipt = await tx.wait()
    if (!receipt.status) throw new Error('Giao dịch thất bại')

    // GỌI API VỚI txHash
    await confirmReceived(auction.contractAddress, receipt.transactionHash)

    auction.status = 'Completed'
    alert('Xác nhận thành công!')
  } catch (err: any) {
    alert(err.message || 'Xác nhận thất bại!')
  } finally {
    confirming.value = false
  }
}

// HELPER
const formatDate = (d: string) =>
  new Date(d).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const formatEth = (v: number | string) => `${Number(v).toFixed(4)} ETH`

const statusText = (status: string) => {
  switch (status) {
    case 'Ended': return 'Chưa thanh toán'
    case 'Paid': return 'Đã thanh toán, chờ nhận hàng'
    case 'Completed': return 'Hoàn tất'
    case 'Penalized': return 'Bị phạt'
    default: return status
  }
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