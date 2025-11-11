<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    <!-- HEADER -->
    <Header />

    <!-- FORM TẠO ĐẤU GIÁ -->
    <div class="max-w-4xl mx-auto p-6 mt-12">
      <div class="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-blue-100/50 overflow-hidden">
        <!-- Header Form -->
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <h2 class="text-3xl font-bold flex items-center gap-3">
            <span class="text-4xl">Tạo đấu giá</span>
          </h2>
          <p class="mt-1 text-blue-100">Đưa vật phẩm của bạn lên sàn đấu giá phi tập trung</p>
        </div>

        <!-- FORM -->
        <form v-if="!isCreating" @submit.prevent="onSubmit" class="p-8 space-y-7">
          <!-- Tên đấu giá -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Tên đấu giá</span>
            </label>
            <input
              v-model="name"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-blue-50/30 placeholder-gray-400 text-gray-900 font-medium"
              placeholder="Nhập tên đấu giá"
              required
            />
          </div>

          <!-- Mô tả -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-cyan-600">Mô tả</span>
            </label>
            <textarea
              v-model="description"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-blue-50/20 placeholder-gray-400 resize-none"
              placeholder="Mô tả chi tiết về vật phẩm..."
            ></textarea>
          </div>

          <!-- ẢNH CHÍNH -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-teal-600">Ảnh chính</span>
            </label>
            <input
              type="file"
              accept="image/*"
              @change="onMainImageChange"
              class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            <div v-if="mainImagePreview" class="mt-3">
              <img
                :src="mainImagePreview"
                alt="Ảnh chính"
                class="w-64 h-48 object-cover rounded-xl shadow-lg border border-gray-200"
              />
            </div>
          </div>

          <!-- ẢNH PHỤ -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-cyan-600">Ảnh phụ (tối đa 5 ảnh)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              @change="onSubImagesChange"
              class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            <div v-if="subImagePreviews.length" class="mt-3 flex flex-wrap gap-3">
              <img
                v-for="(img, i) in subImagePreviews"
                :key="i"
                :src="img"
                class="w-24 h-24 object-cover rounded-lg shadow border border-gray-200"
              />
            </div>
          </div>

          <!-- Thể loại -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-sky-600">Thể loại</span>
            </label>
            <select
              v-model="categoryId"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-blue-50/20 text-gray-900 font-medium"
              required
            >
              <option value="" disabled>-- Chọn thể loại --</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Giá khởi điểm + Giá sàn -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-emerald-600">Giá khởi điểm (ETH)</span>
              </label>
              <input
                v-model.number="startingPrice"
                type="number"
                step="0.001"
                min="0"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-emerald-50/30 placeholder-gray-400 font-bold text-emerald-900"
                placeholder="0.05"
                required
              />
            </div>
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-indigo-600">Giá sàn (ETH)</span>
              </label>
              <input
                v-model.number="reservePrice"
                type="number"
                step="0.001"
                min="0"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-indigo-50/30 placeholder-gray-400"
                placeholder="0.1"
              />
            </div>
          </div>

          <!-- Thời gian đấu giá -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-cyan-600">Thời gian đấu giá (giây)</span>
            </label>
            <input
              v-model.number="biddingTime"
              type="number"
              min="30"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-cyan-50/30 placeholder-gray-400"
              placeholder="86400"
              required
            />
            <p class="mt-1 text-xs text-blue-600">Tối thiểu 30 giây. Gợi ý: 86400 (1 ngày)</p>
          </div>

          <!-- Nút tạo -->
          <button
            type="submit"
            class="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3 text-lg"
          >
            <span class="text-2xl">Tạo đấu giá</span>
          </button>
        </form>

        <!-- LOADING -->
        <div v-else class="p-16 text-center">
          <div class="relative inline-block">
            <div class="animate-spin rounded-full h-20 w-20 border-4 border-blue-100"></div>
            <div class="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p class="mt-6 text-xl font-semibold text-blue-700">Đang triển khai hợp đồng...</p>
          <p class="mt-2 text-sm text-blue-600">Vui lòng chờ, giao dịch đang được xác nhận trên blockchain</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { useRouter } from '#app'
import { useAuctionApi } from '~/composables/useAuctionApi'
import Header from '~/components/User/Header.vue'

const name = ref('')
const description = ref('')
const startingPrice = ref(0)
const reservePrice = ref<number | null>(null)
const biddingTime = ref(86400)
const categoryId = ref<number | null>(null)
const categories = ref<{ id: number; name: string }[]>([])
const isCreating = ref(false)

// ẢNH
const mainImage = ref<File | null>(null)
const subImages = ref<File[]>([])
const mainImagePreview = ref('')
const subImagePreviews = ref<string[]>([])

const onMainImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  mainImage.value = file
  mainImagePreview.value = URL.createObjectURL(file)
}

const onSubImagesChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  subImages.value = files.slice(0, 5)
  subImagePreviews.value = subImages.value.map(f => URL.createObjectURL(f))
}

const router = useRouter()
const { createAuction } = useAuctionApi()

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3001/categories')
    if (!res.ok) throw new Error('Không thể tải danh sách thể loại')
    categories.value = await res.json()
  } catch (err) {
    console.error('Lỗi load categories:', err)
  }
})

const onSubmit = async () => {
  try {
    if (!window.ethereum) return alert('Vui lòng cài đặt MetaMask!')
    const token = localStorage.getItem('jwt')
    if (!token) return alert('Bạn cần đăng nhập trước.')
    if (!categoryId.value) return alert('Vui lòng chọn thể loại!')

    isCreating.value = true

    // Triển khai hợp đồng
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()

    const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const factoryABI = [
      'function createAction(uint256 _biddingTime, address _seller) external',
      'event ActionCreated(address indexed seller, address actionAddress, uint endTime)'
    ]
    const factory = new ethers.Contract(factoryAddress, factoryABI, signer)
    const tx = await factory.createAction(biddingTime.value, userAddress, { gasLimit: 5000000 })

    alert('Đang tạo hợp đồng trên blockchain...')
    const receipt = await tx.wait()
    const event = receipt.events?.find(e => e.event === 'ActionCreated')
    if (!event?.args?.actionAddress) throw new Error('Không tìm thấy địa chỉ hợp đồng!')

    const contractAddress = event.args.actionAddress

    // Gửi dữ liệu + ảnh
    const formData = new FormData()

    // GỬI DỮ LIỆU DƯỚI DẠNG JSON
    const auctionData = {
      name: name.value,
      description: description.value,
      startingPrice: startingPrice.value,        // ← number
      reservePrice: reservePrice.value ?? null,  // ← number | null
      duration: biddingTime.value,
      categoryId: categoryId.value!,
      contractAddress: contractAddress,
    }
    formData.append('data', JSON.stringify(auctionData))

    // GỬI ẢNH
    if (mainImage.value) formData.append('mainImage', mainImage.value)
    subImages.value.forEach(f => formData.append('subImages', f))

    const result = await createAuction(formData)
    if (result?.contractAddress) {
      alert('Tạo đấu giá thành công!')
      router.push(`/auction/${result.contractAddress}`)
    } else {
      throw new Error('Không nhận được phản hồi từ server')
    }
  } catch (err: any) {
    console.error('Lỗi:', err)
    alert(`Tạo đấu giá thất bại: ${err.message || 'Lỗi không xác định'}`)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.group:focus-within label {
  color: #2563eb;
}
</style>
