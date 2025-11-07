<template>
  <div class="bg-gray-50 min-h-screen p-8">
    <h1 class="text-3xl font-bold mb-8 text-center">Các phiên đấu giá bạn đã thắng</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-600 text-lg">Đang tải...</div>

    <!-- Danh sách -->
    <div v-else>
      <div v-if="auctions.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="a in auctions"
          :key="a.contractAddress"
          class="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col justify-between"
        >
          <!-- Hình ảnh + thông tin -->
          <div>
            <img
              :src="a.item?.imageUrl || '/no-image.jpg'"
              class="w-full h-48 object-cover rounded-xl mb-4"
              alt="Ảnh vật phẩm"
            />
            <h2 class="text-xl font-semibold mb-2">{{ a.item?.name }}</h2>
            <p class="text-gray-600 mb-2 line-clamp-2">{{ a.item?.description }}</p>
            <p class="text-gray-700 mb-1">
              <b>Giá thắng:</b> {{ formatEth(a.onchain?.highestBid || a.item?.startingPrice) }}
            </p>
            <p class="text-gray-700 mb-1">
              <b>Thời gian kết thúc:</b> {{ formatDate(a.endTime) }}
            </p>
            <p class="text-gray-700 mb-2">
              <b>Trạng thái:</b>
              <span
                class="px-2 py-1 rounded text-white text-sm"
                :class="{
                  'bg-green-600': a.status === 'Ended',
                  'bg-blue-600': a.status === 'Paid',
                  'bg-red-500': a.status === 'Penalized',
                }"
              >
                {{ statusText(a.status) }}
              </span>
            </p>
          </div>

          <!-- Nút hành động -->
          <div class="mt-4">
            <!-- Chưa thanh toán -->
            <button
              v-if="a.status === 'Ended'"
              @click="payAuction(a)"
              :disabled="paying"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
            >
              {{ paying ? 'Đang xử lý...' : 'Thanh toán ngay' }}
            </button>

            <!-- Đã thanh toán hoặc bị phạt -->
            <button
              v-else
              disabled
              class="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
            >
              {{ a.status === 'Paid' ? 'Đã thanh toán' : 'Đã bị phạt' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Không có dữ liệu -->
      <div v-else class="text-center text-gray-600 text-lg mt-10">
        Bạn chưa thắng đấu giá nào.
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
const myWallet = ref<string>('')

const { getAuctions, recordPayment } = useAuctionApi()

// Lấy danh sách + ví MetaMask
onMounted(async () => {
  try {
    // BƯỚC 1: Kết nối MetaMask để lấy địa chỉ ví
    if (!window.ethereum) {
      alert('Cài đặt MetaMask để sử dụng!')
      loading.value = false
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    myWallet.value = await signer.getAddress()

    // BƯỚC 2: Lấy danh sách tất cả auction
    const allAuctions = await getAuctions()

    // BƯỚC 3: Lọc chỉ những phiên bạn thắng
    auctions.value = allAuctions
  } catch (err: any) {
    console.error('Lỗi tải danh sách:', err)
    alert('Không thể tải danh sách đấu giá. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
})

// Thanh toán
const payAuction = async (auction: any) => {
  if (paying.value) return
  paying.value = true

  try {
    if (!window.ethereum) throw new Error('MetaMask chưa được cài đặt')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()

    // Kiểm tra người dùng có phải người thắng
    if (userAddress.toLowerCase() !== auction.onchain.highestBidder.toLowerCase()) {
      alert('Bạn không phải người thắng cuộc!')
      return
    }

    // Gọi contract
    const contract = new ethers.Contract(
      auction.contractAddress,
      ['function payWinningBid() payable'],
      signer
    )

    const amount = ethers.parseEther(String(auction.onchain.highestBid || 0))
    const tx = await contract.payWinningBid({ value: amount })
    alert('Đang gửi giao dịch... Vui lòng chờ xác nhận.')

    const receipt = await tx.wait()

    // Ghi nhận backend
    await recordPayment(auction.contractAddress, receipt.transactionHash)

    // Cập nhật UI
    auction.status = 'Paid'
    alert('Thanh toán thành công!')
  } catch (err: any) {
    console.error('Lỗi thanh toán:', err)
    alert(err?.message || 'Thanh toán thất bại!')
  } finally {
    paying.value = false
  }
}

// Helper
const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN')
const formatEth = (v: number | string) => `${Number(v).toFixed(4)} ETH`
const statusText = (status: string) => {
  switch (status) {
    case 'Ended': return 'Đã kết thúc'
    case 'Paid': return 'Đã thanh toán'
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