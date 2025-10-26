<template>
  <div>
    <Header />

    <div v-if="loading" class="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>

    <div
      v-else
      class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
    >
      <!-- Ảnh vật phẩm -->
      <div class="flex justify-center">
        <img
          :src="item.imageUrl || '/no-image.jpg'"
          alt="Ảnh vật phẩm"
          class="rounded-xl shadow-md max-h-96 object-contain bg-gray-50"
        />
      </div>

      <!-- Thông tin vật phẩm -->
      <div class="space-y-6">
        <!-- Tên vật phẩm -->
        <h1 class="text-3xl font-bold text-gray-800">{{ item.name }}</h1>

        <!-- Chi tiết vật phẩm -->
        <div class="border-t pt-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Chi tiết vật phẩm</h2>
          <p v-if="item.description" class="text-gray-700 leading-relaxed whitespace-pre-line">
            {{ item.description }}
          </p>
          <p v-else class="text-gray-500 italic">Không có mô tả cho vật phẩm này.</p>
        </div>

        <!-- Thông tin giá -->
        <div class="border-t pt-4 space-y-1 text-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">💰 Thông tin đấu giá</h2>
          <p>
            <span class="font-semibold text-gray-900">Giá khởi điểm:</span>
            {{ formatPrice(item.startingPrice) }}
          </p>
          <p v-if="item.reservePrice">
            <span class="font-semibold text-gray-900">Giá sàn:</span>
            {{ formatPrice(item.reservePrice) }}
          </p>
          <p v-if="item.estimateMin || item.estimateMax">
            <span class="font-semibold text-gray-900">Giá ước tính:</span>
            {{ formatEstimate(item.estimateMin, item.estimateMax) }}
          </p>
          <p v-if="item.status">
            <span class="font-semibold text-gray-900">Trạng thái:</span>
            <span
              :class="{
                'text-yellow-600': item.status === 'pending',
                'text-green-600': item.status === 'approved',
                'text-red-600': item.status === 'rejected'
              }"
            >
              {{ item.status }}
            </span>
          </p>
          <p>
            <span class="font-semibold text-gray-900">Ngày tạo:</span>
            {{ formatDate(item.createdAt) }}
          </p>
        </div>

        <!-- Ô đấu giá -->
        <div class="bg-gray-50 p-5 rounded-xl shadow-inner space-y-3 border mt-6">
          <h2 class="text-lg font-semibold text-gray-800">💎 Đặt giá đấu</h2>
          <input
            v-model="bidAmount"
            type="number"
            min="0"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập số tiền bạn muốn đấu giá"
          />
          <button
            @click="placeBid"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Đặt giá ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '~/components/User/Header.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const item = ref({})
const bidAmount = ref('')
const loading = ref(true)
const error = ref('')

const fetchItem = async () => {
  try {
    const res = await $fetch(`http://localhost:3001/items/${route.params.id}`)
    item.value = res
  } catch (err) {
    console.error(err)
    error.value = 'Không thể tải thông tin vật phẩm'
  } finally {
    loading.value = false
  }
}

const placeBid = async () => {
  if (!bidAmount.value || bidAmount.value <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ!')
    return
  }

  try {
    const token = localStorage.getItem('jwt')
    if (!token) {
      alert('Vui lòng đăng nhập để đấu giá!')
      return
    }

    await $fetch(`http://localhost:3001/items/${route.params.id}/bid`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { amount: Number(bidAmount.value) }
    })

    alert('Đặt giá thành công!')
    fetchItem()
    bidAmount.value = ''
  } catch (err) {
    console.error(err)
    alert('Lỗi khi đặt giá: ' + (err?.data?.message || err.message))
  }
}

onMounted(fetchItem)

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    : '—'

const formatEstimate = (min, max) => {
  if (!min && !max) return '—'
  if (min && max) return `${formatPrice(min)} - ${formatPrice(max)}`
  return min ? `Từ ${formatPrice(min)}` : `Đến ${formatPrice(max)}`
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleString('vi-VN') : '—'
</script>
