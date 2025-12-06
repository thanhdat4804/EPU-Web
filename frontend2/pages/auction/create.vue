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

              <!-- HIỂN THỊ CỌC 20% -->
              <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p class="text-sm font-medium text-amber-800">
                  Cọc bắt buộc (20%): 
                  <span class="font-bold">{{ sellerDeposit }} ETH</span>
                </p>
                <p class="text-xs text-amber-600 mt-1">
                  Sẽ bị mất nếu không giao hàng đúng hạn
                </p>
              </div>
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

          <!-- Thời gian đấu giá -->
          <div class="group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-cyan-600">Thời gian đấu giá</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
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
            <p class="mt-2 text-sm font-medium text-cyan-700">
              Tổng: <span class="font-bold">{{ formatDuration }}</span>
            </p>
            <p v-if="errors.biddingTime" class="mt-1 text-xs text-red-600">{{ errors.biddingTime }}</p>
            <p class="mt-1 text-xs text-blue-600">Tối thiểu 1 phút</p>
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
          <p class="mt-2 text-sm text-blue-600">Cọc: {{ sellerDeposit }} ETH đang được gửi</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '~/components/User/Header.vue'
import { useItem } from '~/composables/useItem' // ← DÙNG useItem ĐÃ CÓ CSRF + JWT

const router = useRouter()
const { createItem } = useItem() // ← CHỈ DÙNG createItem

// === REFS – GIỮ NGUYÊN NHƯ CŨ ===
const name = ref('')
const description = ref('')
const imageUrl = ref('')
const startingPrice = ref(0)
const reservePrice = ref<number | null>(null)
const estimateMin = ref<number | null>(null)
const estimateMax = ref<number | null>(null)
const categoryId = ref<number | null>(null)
const categories = ref<{ id: number; name: string }[]>([])

// Ảnh
const mainImage = ref<File | null>(null)
const subImages = ref<File[]>([])
const mainImagePreview = ref('')
const subImagePreviews = ref<string[]>([])

// Thời gian (giữ nguyên nhưng KHÔNG DÙNG nữa)
const duration = ref({ days: 1, hours: 0, minutes: 0 })
const totalDuration = computed(() => {
  return duration.value.days * 24 * 60 +
         duration.value.hours * 60 +
         duration.value.minutes
})
const biddingTime = ref(86400)

// Loading
const isCreating = ref(false)

// === LOAD CATEGORIES ===
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3001/categories')
    if (!res.ok) throw new Error()
    categories.value = await res.json()
  } catch (err) {
    console.error('Lỗi load categories:', err)
  }
})

// === XỬ LÝ ẢNH – GIỮ NGUYÊN ===
const onMainImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  mainImage.value = file
  mainImagePreview.value = URL.createObjectURL(file)
}

const onSubImagesChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []).slice(0, 5)
  subImages.value = files
  subImagePreviews.value = files.map(f => URL.createObjectURL(f))
}

const removeMainImage = () => {
  mainImage.value = null
  mainImagePreview.value = ''
}

const removeSubImage = (index: number) => {
  subImages.value.splice(index, 1)
  subImagePreviews.value.splice(index, 1)
}

// === VALIDATE – GIỮ NGUYÊN NHƯ CŨ ===
const errors = ref({
  name: '', mainImage: '', startingPrice: '', categoryId: ''
})
const validateForm = () => {
  errors.value.name = name.value.trim() ? '' : 'Vui lòng nhập tên đấu giá'
  errors.value.mainImage = mainImage.value ? '' : 'Vui lòng chọn ảnh chính'
  errors.value.startingPrice = startingPrice.value > 0 ? '' : 'Giá khởi điểm phải lớn hơn 0'
  errors.value.categoryId = categoryId.value ? '' : 'Vui lòng chọn thể loại'
}
const hasErrors = computed(() => Object.values(errors.value).some(e => e !== ''))

// === SUBMIT – CHỈ GỌI createItem → TẠO PENDING, KHÔNG TẠO AUCTION ===
const onSubmit = async () => {
  validateForm()
  if (hasErrors.value) return alert('Vui lòng sửa các lỗi!')

  isCreating.value = true
  try {
    const formData = new FormData()

    const itemData = {
      name: name.value.trim(),
      description: description.value || null,
      startingPrice: startingPrice.value,
      reservePrice: reservePrice.value || null,
      estimateMin: estimateMin.value || null,
      estimateMax: estimateMax.value || null,
      categoryId: categoryId.value || null,
      imageUrl: imageUrl.value || null,
      duration: totalDuration.value
    }

    formData.append('data', JSON.stringify(itemData))

    if (mainImage.value) formData.append('mainImage', mainImage.value)
    subImages.value.forEach(f => formData.append('subImages', f))

    await createItem(formData)

    alert('Gửi duyệt thành công! Vui lòng chờ Admin duyệt.')
    router.push('/my-items') // ← Chuyển sang trang My Items để xem trạng thái
  } catch (err: any) {
    alert('Lỗi: ' + (err.message || 'Không thể gửi duyệt'))
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