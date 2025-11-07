<template>
  <div class="max-w-2xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">🧾 Tạo đấu giá mới</h1>

    <form v-if="!isCreating" @submit.prevent="onSubmit" class="space-y-4">
      <!-- Tên đấu giá -->
      <div>
        <label class="block text-sm font-medium mb-1">Tên đấu giá</label>
        <input
          v-model="name"
          class="border p-2 rounded w-full"
          placeholder="Nhập tên đấu giá"
          required
        />
      </div>

      <!-- Mô tả -->
      <div>
        <label class="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          v-model="description"
          class="border p-2 rounded w-full"
          rows="3"
          placeholder="Mô tả ngắn về vật phẩm"
        ></textarea>
      </div>

      <!-- Ảnh -->
      <div>
        <label class="block text-sm font-medium mb-1">Ảnh (URL)</label>
        <input
          v-model="imageUrl"
          type="url"
          class="border p-2 rounded w-full"
          placeholder="https://example.com/item.jpg"
        />
      </div>

      <!-- Giá khởi điểm -->
      <div>
        <label class="block text-sm font-medium mb-1">Giá khởi điểm (ETH)</label>
        <input
          v-model.number="startingPrice"
          type="number"
          step="0.01"
          min="0"
          class="border p-2 rounded w-full"
          placeholder="Nhập giá khởi điểm"
          required
        />
      </div>

      <!-- Giá sàn -->
      <div>
        <label class="block text-sm font-medium mb-1">Giá sàn (ETH)</label>
        <input
          v-model.number="reservePrice"
          type="number"
          step="0.01"
          min="0"
          class="border p-2 rounded w-full"
          placeholder="Tùy chọn"
        />
      </div>

      <!-- Thời gian đấu giá -->
      <div>
        <label class="block text-sm font-medium mb-1">Thời gian đấu giá (giây)</label>
        <input
          v-model.number="biddingTime"
          type="number"
          min="30"
          class="border p-2 rounded w-full"
          required
        />
      </div>

      <!-- Nút tạo -->
      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Tạo đấu giá
      </button>
    </form>

    <div v-else class="text-green-600 font-semibold text-center mt-6">
      ⏳ Đang tạo đấu giá, vui lòng chờ...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ethers } from 'ethers'
import { useRouter } from '#app'
import { useAuctionApi } from '~/composables/useAuctionApi'

const name = ref('')
const description = ref('')
const imageUrl = ref('')
const startingPrice = ref(0)
const reservePrice = ref<number | null>(null)
const biddingTime = ref(60)
const isCreating = ref(false)
const router = useRouter()
const { createAuction } = useAuctionApi()

const onSubmit = async () => {
  try {
    if (!window.ethereum) return alert('Vui lòng cài đặt MetaMask!')
    const token = localStorage.getItem('jwt')
    if (!token) return alert('Bạn cần đăng nhập trước.')

    isCreating.value = true

    // === GIAI ĐOẠN 1: DEPLOY CONTRACT QUA METAMASK ===
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress() // ← ĐÚNG: address string

    // ĐÚNG: ABI + ADDRESS
    const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const factoryABI = [
      'function createAction(uint256 _biddingTime, address _seller) external',
      'function getAllActions() external view returns (address[] memory)',
      'event ActionCreated(address indexed seller, address actionAddress, uint endTime)' // ← ĐÚNG
    ]

    const factory = new ethers.Contract(factoryAddress, factoryABI, signer)

    // ĐÚNG: GỌI createAction(biddingTime, seller)
    const tx = await factory.createAction(
      biddingTime.value,        // ← uint256 (giây)
      userAddress,              // ← address
      { gasLimit: 5000000 }     // ← BẮT BUỘC
    )

    alert('Đang tạo đấu giá trên blockchain...')
    const receipt = await tx.wait()

    // ĐÚNG: LẤY ĐỊA CHỈ TỪ EVENT
    const event = receipt.events?.find(e => e.event === 'ActionCreated')
    if (!event?.args?.actionAddress) throw new Error('Không tìm thấy địa chỉ mới!')
    const contractAddress = event.args.actionAddress

    console.log('Auction created at:', contractAddress)

    // === GIAI ĐOẠN 2: LƯU VÀO DB ===
    const auctionData = {
      contractAddress,
      name: name.value,
      description: description.value,
      imageUrl: imageUrl.value,
      startingPrice: startingPrice.value,
      reservePrice: reservePrice.value ?? undefined,
      duration: biddingTime.value
    }

    const result = await createAuction(auctionData)
    if (result?.contractAddress) {
      alert('Tạo đấu giá thành công!')
      router.push(`/auction/${result.contractAddress}`)
    } else {
      alert('Lỗi: Không nhận được kết quả từ server')
    }

  } catch (err: any) {
    console.error('Lỗi:', err)
    alert(`Tạo đấu giá thất bại: ${err.message || 'Lỗi không xác định'}`)
  } finally {
    isCreating.value = false
  }
}
</script>
