<template>
  <div class="bg-gray-50 min-h-screen p-8">
    <h1 class="text-3xl font-bold mb-8 text-center">🏆 Các phiên đấu giá bạn đã thắng</h1>

    <div v-if="loading" class="text-center text-gray-600 text-lg">Đang tải...</div>

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
            <p class="text-gray-600 mb-2">{{ a.item?.description }}</p>
            <p class="text-gray-700 mb-1">
              <b>Giá thắng:</b> {{ formatEth(a.onchain?.highestBid || a.item?.startingPrice) }}
            </p>
            <p class="text-gray-700 mb-1">
              <b>Thời gian kết thúc:</b> {{ formatDate(a.endTime) }}
            </p>
            <p class="text-gray-700 mb-2">
              <b>Trạng thái:</b>
              <span
                class="px-2 py-1 rounded text-white"
                :class="{
                  'bg-green-600': a.status === 'Ended',
                  'bg-blue-600': a.status === 'Paid',
                  'bg-red-500': a.status === 'Penalized',
                }"
              >
                {{ a.status }}
              </span>
            </p>
          </div>

          <!-- Nút thanh toán -->
          <div class="mt-4">
            <button
              v-if="a.status === 'Ended'"
              @click="payAuction(a)"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              💰 Thanh toán ngay
            </button>

            <button
              v-else
              disabled
              class="w-full bg-gray-400 text-white py-2 rounded-lg"
            >
              Đã thanh toán
            </button>
          </div>
        </div>
      </div>

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
const { getAuctions, recordPayment } = useAuctionApi()

// 🔹 Lấy danh sách các phiên mà user là người thắng
onMounted(async () => {
  try {
    const all = await getAuctions()
    const myWallet = localStorage.getItem('jwt')
    if (!myWallet) {
      alert('Bạn chưa có ví. Vui lòng đăng nhập lại.')
      return
    }

    // Lọc ra các phiên mà user thắng
    auctions.value = all.filter(
      (a: any) =>
        a.onchain?.highestBidder?.toLowerCase() === myWallet.toLowerCase() &&
        ['Ended', 'Active'].includes(a.status)
    )
  } catch (err) {
    console.error(err)
    alert('Lỗi khi tải danh sách đấu giá!')
  } finally {
    loading.value = false
  }
})

// 🪙 Thanh toán (MetaMask + gọi backend)
const payAuction = async (auction: any) => {
  try {
    if (!window.ethereum) {
      alert('MetaMask chưa được cài đặt.')
      return
    }

    // Kết nối MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()

    const contract = new ethers.Contract(auction.contractAddress, [
      'function payWinningBid() payable',
    ], signer)

    // ✅ Gọi hàm thanh toán (ví dụ số tiền chính là highestBid)
    const amount = ethers.utils.parseEther(String(auction.onchain?.highestBid || 0))
    const tx = await contract.payWinningBid({ value: amount })
    await tx.wait()

    // Ghi nhận vào backend
    await recordPayment(auction.contractAddress, tx.hash)

    alert('✅ Thanh toán thành công!')
    auction.status = 'Paid'
  } catch (err: any) {
    console.error(err)
    alert(err?.message || 'Thanh toán thất bại!')
  }
}

// Helper
const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN')
const formatEth = (v: number | string) => `${Number(v).toFixed(3)} ETH`
</script>
