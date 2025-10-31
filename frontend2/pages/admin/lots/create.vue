<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/admin/lots" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tạo Lot đấu giá mới</h1>
        <p class="text-gray-600">Điền thông tin chi tiết về sản phẩm</p>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Đồng hồ Rolex Submariner 1960s"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                <option value="art">Nghệ thuật</option>
                <option value="jewelry">Trang sức</option>
                <option value="watches">Đồng hồ</option>
                <option value="antiques">Đồ cổ</option>
                <option value="cars">Xe cổ</option>
                <option value="books">Sách quý</option>
                <option value="wine">Rượu vang</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.condition"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn tình trạng</option>
                <option value="new">Mới</option>
                <option value="excellent">Xuất sắc</option>
                <option value="very_good">Rất tốt</option>
                <option value="good">Tốt</option>
                <option value="fair">Khá</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.description"
              required
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết về sản phẩm, lịch sử, xuất xứ..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Giá đấu giá</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Giá khởi điểm (USD) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.startPrice"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Giá đặt trước (USD)
            </label>
            <input
              v-model.number="form.reservePrice"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000"
            />
            <p class="text-xs text-gray-500 mt-1">Giá tối thiểu để bán (không hiển thị công khai)</p>
          </div>
        </div>
      </div>

      <!-- Images -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Hình ảnh</h2>
        
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <div class="mt-4">
            <label class="cursor-pointer">
              <span class="text-blue-600 hover:text-blue-700 font-medium">Tải ảnh lên</span>
              <input type="file" class="hidden" multiple accept="image/*" @change="handleImageUpload" />
            </label>
            <p class="text-sm text-gray-500 mt-1">hoặc kéo thả ảnh vào đây</p>
          </div>
          <p class="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 10MB mỗi ảnh</p>
        </div>

        <div v-if="form.images.length > 0" class="grid grid-cols-4 gap-4 mt-4">
          <div v-for="(image, index) in form.images" :key="index" class="relative group">
            <img :src="image" class="w-full h-24 object-cover rounded-lg" />
            <button
              @click="removeImage(index)"
              type="button"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Expert Assignment -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Chuyên gia thẩm định</h2>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Chọn chuyên gia
          </label>
          <select
            v-model="form.expertId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn sau</option>
            <option value="1">John Smith - Chuyên gia đồng hồ</option>
            <option value="2">Maria Garcia - Chuyên gia nghệ thuật</option>
            <option value="3">Robert Chen - Chuyên gia trang sức</option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4">
        <NuxtLink
          to="/admin/lots"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </NuxtLink>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo Lot
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const form = ref({
  title: '',
  category: '',
  condition: '',
  description: '',
  startPrice: null,
  reservePrice: null,
  expertId: '',
  images: []
})

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.images.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const submitForm = () => {
  console.log('Form submitted:', form.value)
  // Call API to create lot
  alert('Lot đã được tạo thành công!')
}
</script>