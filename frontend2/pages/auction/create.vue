<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    <!-- HEADER -->
    <Header />
    <!-- FORM TẠO ĐẤU GIÁ -->
    <div class="max-w-4xl mx-auto p-6 mt-4">
      <div class="bg-white/95 backdrop-blur-xl shadow-2xl border border-blue-100/50 overflow-hidden">
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
              @input="touched.name = true"
              class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-blue-50/30 placeholder-gray-400 text-gray-900 font-medium"
              :class="{
                'border-red-500 focus:ring-red-500': errors.name,
                'border-gray-300 focus:ring-blue-500': !errors.name
              }"
              placeholder="Nhập tên đấu giá"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Mô tả -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Mô tả</span>
            </label>
            <textarea
              v-model="description"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-blue-50/20 placeholder-gray-400 resize-none"
              placeholder="Mô tả chi tiết về vật phẩm..."
            ></textarea>
          </div>

          <!-- Link ảnh/video (tùy chọn) -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Link ảnh/video (tùy chọn)</span>
            </label>
            <input
              v-model="imageUrl"
              type="url"
              class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-purple-50/20 placeholder-gray-400"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- ẢNH CHÍNH -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Ảnh chính</span>
            </label>
            <input
              type="file"
              accept="image/*"
              @change="onMainImageChange"
              ref="mainImageInput"
              class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            <div v-if="mainImagePreview" class="mt-3 relative inline-block">
              <img
                :src="mainImagePreview"
                alt="Ảnh chính"
                class="w-64 h-48 object-cover border-2 border-gray-300 shadow"
              />
              <button
                @click.prevent="removeMainImage"
                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition"
                title="Xóa ảnh chính"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p v-if="errors.mainImage" class="mt-1 text-xs text-red-600">{{ errors.mainImage }}</p>
          </div>

          <!-- ẢNH PHỤ -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Ảnh phụ (tối đa 5 ảnh)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              @change="onSubImagesChange"
              ref="subImagesInput"
              class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            <div v-if="subImagePreviews.length" class="mt-3 flex flex-wrap gap-3">
              <div v-for="(img, i) in subImagePreviews" :key="i" class="relative">
                <img :src="img" class="w-24 h-24 object-cover border border-gray-300 shadow" />
                <button
                  @click.prevent="removeSubImage(i)"
                  class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow transition text-xs"
                  title="Xóa ảnh này"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- Thể loại -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-blue-600">Thể loại</span>
            </label>
            <select
              v-model="categoryId"
              @change="touched.categoryId = true"
              class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-blue-50/20 text-gray-900 font-medium"
              :class="{
                'border-red-500 focus:ring-red-500': errors.categoryId,
                'border-gray-300 focus:ring-sky-500': !errors.categoryId
              }"
            >
              <option :value="null" disabled>-- Chọn thể loại --</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <p v-if="errors.categoryId" class="mt-1 text-xs text-red-600">{{ errors.categoryId }}</p>
          </div>

          <!-- Giá khởi điểm + Giá sàn -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-blue-600">Giá khởi điểm (ETH)</span>
              </label>
              <input
                v-model.number="startingPrice"
                @input="touched.startingPrice = true"
                type="text"
                inputmode="decimal"
                class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-emerald-50/30 placeholder-gray-400 font-bold text-emerald-900"
                :class="{
                  'border-red-500 focus:ring-red-500': errors.startingPrice,
                  'border-gray-300 focus:ring-emerald-500': !errors.startingPrice
                }"
                placeholder="0.05"
              />
              <p v-if="errors.startingPrice" class="mt-1 text-xs text-red-600">{{ errors.startingPrice }}</p>
            </div>
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-blue-600">Giá sàn (ETH)</span>
              </label>
              <input
                v-model.number="reservePrice"
                @input="touched.reservePrice = true"
                type="text"
                inputmode="decimal"
                class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-indigo-50/30 placeholder-gray-400"
                :class="{
                  'border-red-500 focus:ring-red-500': errors.reservePrice,
                  'border-gray-300 focus:ring-indigo-500': !errors.reservePrice
                }"
                placeholder="0.1 (không bắt buộc)"
              />
              <p v-if="errors.reservePrice" class="mt-1 text-xs text-red-600">{{ errors.reservePrice }}</p>
            </div>
          </div>

          <!-- Ước tính giá -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-blue-600">Ước tính min (ETH)</span>
              </label>
              <input
                v-model.number="estimateMin"
                @input="touched.estimateMin = true"
                type="text"
                inputmode="decimal"
                class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-amber-50/30 placeholder-gray-400"
                :class="{
                  'border-red-500 focus:ring-red-500': errors.estimateMin,
                  'border-gray-300 focus:ring-amber-500': !errors.estimateMin
                }"
                placeholder="0.2"
              />
              <p v-if="errors.estimateMin" class="mt-1 text-xs text-red-600">{{ errors.estimateMin }}</p>
            </div>
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-blue-600">Ước tính max (ETH)</span>
              </label>
              <input
                v-model.number="estimateMax"
                @input="touched.estimateMax = true"
                type="text"
                inputmode="decimal"
                class="w-full px-4 py-3 border focus:ring-2 focus:border-transparent transition-all duration-200 bg-amber-50/30 placeholder-gray-400"
                :class="{
                  'border-red-500 focus:ring-red-500': errors.estimateMax,
                  'border-gray-300 focus:ring-amber-600': !errors.estimateMax
                }"
                placeholder="0.5"
              />
              <p v-if="errors.estimateMax" class="mt-1 text-xs text-red-600">{{ errors.estimateMax }}</p>
            </div>
          </div>

          <!-- Thời gian đấu giá (Ngày / Giờ / Phút) -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-cyan-600">Thời gian đấu giá</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              <!-- Ngày -->
              <div>
                <input
                  v-model.number="duration.days"
                  type="number"
                  min="0"
                  max="30"
                  @input="updateBiddingTime(); touched.biddingTime = true"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center font-medium"
                  :class="{ 'border-red-500': errors.biddingTime }"
                  placeholder="0"
                />
                <p class="text-xs text-gray-600 mt-1 text-center">Ngày</p>
              </div>
              <!-- Giờ -->
              <div>
                <input
                  v-model.number="duration.hours"
                  type="number"
                  min="0"
                  max="23"
                  @input="updateBiddingTime(); touched.biddingTime = true"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center font-medium"
                  :class="{ 'border-red-500': errors.biddingTime }"
                  placeholder="0"
                />
                <p class="text-xs text-gray-600 mt-1 text-center">Giờ</p>
              </div>
              <!-- Phút -->
              <div>
                <input
                  v-model.number="duration.minutes"
                  type="number"
                  min="0"
                  max="59"
                  @input="updateBiddingTime(); touched.biddingTime = true"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center font-medium"
                  :class="{ 'border-red-500': errors.biddingTime }"
                  placeholder="0"
                />
                <p class="text-xs text-gray-600 mt-1 text-center">Phút</p>
              </div>
            </div>

            <!-- Hiển thị tổng -->
            <p class="mt-2 text-sm font-medium text-cyan-700">
              Tổng: <span class="font-bold">{{ formatDuration }}</span>
            </p>

            <!-- Lỗi -->
            <p v-if="errors.biddingTime" class="mt-1 text-xs text-red-600">{{ errors.biddingTime }}</p>

            <!-- Gợi ý -->
            <p class="mt-1 text-xs text-blue-600">
              Tối thiểu 1 phút
            </p>
          </div>

          <!-- Nút tạo -->
          <button
            type="submit"
            :disabled="isCreating || hasErrors"
            class="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3 text-lg"
          >
            <span v-if="!isCreating" class="text-2xl">Tạo đấu giá</span>
            <span v-else>Tạo...</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { ethers } from 'ethers'
import { useRouter } from 'vue-router'
import { useAuctionApi } from '~/composables/useAuctionApi'
import Header from '~/components/User/Header.vue'

// === REFS ===
const name = ref('')
const description = ref('')
const imageUrl = ref('')
const startingPrice = ref(0)
const reservePrice = ref<number | null>(null)
const estimateMin = ref<number | null>(null)
const estimateMax = ref<number | null>(null)
const categoryId = ref<number | null>(null)
const categories = ref<{ id: number; name: string }[]>([])
const isCreating = ref(false)

// ẢNH
const mainImage = ref<File | null>(null)
const subImages = ref<File[]>([])
const mainImagePreview = ref('')
const subImagePreviews = ref<string[]>([])
const mainImageInput = ref<HTMLInputElement | null>(null)
const subImagesInput = ref<HTMLInputElement | null>(null)

// THỜI GIAN
const duration = ref({ days: 1, hours: 0, minutes: 0 })
const biddingTime = ref(86400) // giây

// TOUCHED
const touched = ref({
  name: false,
  mainImage: false,
  startingPrice: false,
  reservePrice: false,
  estimateMin: false,
  estimateMax: false,
  biddingTime: false,
  categoryId: false
})

// ERRORS
const errors = ref({
  name: '',
  mainImage: '',
  startingPrice: '',
  reservePrice: '',
  estimateMin: '',
  estimateMax: '',
  biddingTime: '',
  categoryId: ''
})

// === VALIDATE ===
const validateForm = () => {
  const newErrors = {
    name: name.value.trim() ? '' : 'Vui lòng nhập tên đấu giá',
    mainImage: mainImage.value ? '' : 'Vui lòng chọn ảnh chính',
    startingPrice: startingPrice.value > 0 ? '' : 'Giá khởi điểm phải lớn hơn 0',
    reservePrice: reservePrice.value === null || reservePrice.value >= 0 ? '' : 'Giá sàn không hợp lệ',
    estimateMin: estimateMin.value === null || estimateMin.value >= 0 ? '' : 'Ước tính min không hợp lệ',
    estimateMax: estimateMax.value === null || estimateMax.value >= 0 ? '' : 'Ước tính max không hợp lệ',
    biddingTime: biddingTime.value >= 30 ? '' : 'Thời gian phải từ 30 giây trở lên',
    categoryId: categoryId.value !== null ? '' : 'Vui lòng chọn thể loại'
  }

  if (estimateMin.value !== null && estimateMax.value !== null && estimateMin.value > estimateMax.value) {
    newErrors.estimateMin = 'Ước tính min phải ≤ max'
    newErrors.estimateMax = 'Ước tính max phải ≥ min'
  }

  Object.keys(newErrors).forEach(key => {
    const k = key as keyof typeof touched.value
    if (!touched.value[k]) newErrors[k] = ''
  })

  errors.value = newErrors
}

// === WATCH ===
watch(
  [name, mainImage, startingPrice, reservePrice, estimateMin, estimateMax, categoryId],
  () => validateForm()
)

watch(duration, () => updateBiddingTime(), { deep: true })

// === COMPUTED ===
const hasErrors = computed(() => Object.values(errors.value).some(err => err !== ''))

const formatDuration = computed(() => {
  const d = duration.value.days || 0
  const h = duration.value.hours || 0
  const m = duration.value.minutes || 0
  const parts: string[] = []
  if (d > 0) parts.push(`${d} ngày`)
  if (h > 0) parts.push(`${h} giờ`)
  if (m > 0) parts.push(`${m} phút`)
  return parts.length ? parts.join(' ') : '0 phút'
})

// === ẢNH ===
const onMainImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  mainImage.value = file
  mainImagePreview.value = URL.createObjectURL(file)
  touched.value.mainImage = true
  validateForm()
}

const onSubImagesChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []).slice(0, 5)
  subImages.value = files
  subImagePreviews.value = files.map(f => URL.createObjectURL(f))
}

const removeMainImage = () => {
  mainImage.value = null
  mainImagePreview.value = ''
  if (mainImageInput.value) mainImageInput.value.value = ''
  touched.value.mainImage = true
  validateForm()
}

const removeSubImage = (index: number) => {
  subImages.value.splice(index, 1)
  subImagePreviews.value.splice(index, 1)
}

// === THỜI GIAN ===
const updateBiddingTime = () => {
  const total = (duration.value.days || 0) * 86400 +
                (duration.value.hours || 0) * 3600 +
                (duration.value.minutes || 0) * 60
  biddingTime.value = Math.max(total, 0)
  validateForm()
}

// === API & ROUTER ===
const router = useRouter()
const { createAuction } = useAuctionApi()

// === LOAD CATEGORIES ===
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3001/categories')
    if (!res.ok) throw new Error('Không thể tải danh sách thể loại')
    categories.value = await res.json()
  } catch (err) {
    console.error('Lỗi load categories:', err)
  }
  // Mặc định 1 ngày
  duration.value = { days: 1, hours: 0, minutes: 0 }
  updateBiddingTime()
})

// === SUBMIT ===
const onSubmit = async () => {
  Object.keys(touched.value).forEach(k => (touched.value[k] = true))
  validateForm()
  if (hasErrors.value) return alert('Vui lòng sửa các lỗi!')

  if (!window.ethereum) return alert('Cài MetaMask!')
  const token = localStorage.getItem('jwt')
  if (!token) return alert('Đăng nhập trước!')

  isCreating.value = true
  try {
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
    alert('Đang tạo hợp đồng...')
    const receipt = await tx.wait()
    const event = receipt.events?.find(e => e.event === 'ActionCreated')
    if (!event?.args?.actionAddress) throw new Error('Không tìm thấy địa chỉ hợp đồng!')

    const contractAddress = event.args.actionAddress
    const formData = new FormData()
    const auctionData = {
      name: name.value.trim(),
      description: description.value || null,
      imageUrl: imageUrl.value || null,
      startingPrice: startingPrice.value,
      reservePrice: reservePrice.value ?? null,
      estimateMin: estimateMin.value ?? null,
      estimateMax: estimateMax.value ?? null,
      duration: biddingTime.value,
      categoryId: categoryId.value!,
      contractAddress,
    }
    formData.append('data', JSON.stringify(auctionData))
    if (mainImage.value) formData.append('mainImage', mainImage.value)
    subImages.value.forEach(f => formData.append('subImages', f))

    const result = await createAuction(formData)
    if (result?.contractAddress) {
      alert('Tạo đấu giá thành công!')
      router.push(`/auction/${result.contractAddress}`)
    } else {
      throw new Error('Lỗi server')
    }
  } catch (err: any) {
    alert(`Lỗi: ${err.message || 'Không xác định'}`)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
input[type="text"][inputmode="decimal"]::-webkit-outer-spin-button,
input[type="text"][inputmode="decimal"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="text"][inputmode="decimal"] {
  -moz-appearance: textfield;
}
.group:focus-within label {
  color: #2563eb;
}
</style>