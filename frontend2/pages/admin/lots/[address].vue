<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Chi tiết Lot đấu giá</h1>
        <p class="text-gray-600">Địa chỉ hợp đồng: {{ address }}</p>
      </div>
      <NuxtLink
        to="/admin/lots"
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </NuxtLink>
    </div>

    <!-- Nội dung -->
    <div v-if="loading" class="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">{{ error }}</div>

    <div v-else-if="auction" class="bg-white shadow rounded-lg overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Ảnh -->
        <div>
          <img
            :src="auction.item?.imageUrl || '/no-image.jpg'"
            alt="lot image"
            class="rounded-lg w-full object-cover shadow"
          />
        </div>

        <!-- Thông tin -->
        <div class="flex flex-col justify-between">
            <!-- Thời gian còn lại -->
            <div v-if="!auction.ended" class="text-center mt-6 bg-gray-50 py-6 rounded-lg shadow-inner">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
                ⏳ Thời gian còn lại
            </h3>

            <div class="flex justify-center gap-6 text-center text-gray-800 font-mono">
                <div>
                <div class="text-3xl font-bold">{{ timeLeft.days.toString().padStart(2, '0') }}</div>
                <div class="text-xs uppercase tracking-wider">Days</div>
                </div>
                <div>
                <div class="text-3xl font-bold">{{ timeLeft.hours.toString().padStart(2, '0') }}</div>
                <div class="text-xs uppercase tracking-wider">Hours</div>
                </div>
                <div>
                <div class="text-3xl font-bold text-blue-600">{{ timeLeft.minutes.toString().padStart(2, '0') }}</div>
                <div class="text-xs uppercase tracking-wider">Minutes</div>
                </div>
                <div>
                <div class="text-3xl font-bold text-red-500">{{ timeLeft.seconds.toString().padStart(2, '0') }}</div>
                <div class="text-xs uppercase tracking-wider">Seconds</div>
                </div>
            </div>

            <p class="mt-4 text-sm text-gray-600">
                Kết thúc vào:
                <span class="font-semibold text-gray-800">
                {{ formatDate(auction.endTime) }}
                </span>
            </p>
            </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ auction.item?.name }}</h2>
            <p class="text-gray-600 mb-4">{{ auction.item?.description }}</p>

            <div class="space-y-3 text-sm">
              <p>
                <span class="font-semibold text-gray-800">👤 Chủ sở hữu:</span>
                {{ auction.seller?.name }} ({{ auction.seller?.email }})
              </p>
              <p>
                <span class="font-semibold text-gray-800">🏷️ Người trả giá cao nhất: </span>
                <span>{{ auction.highestBidder || 'Chưa có' }}</span>
              </p>
              <p>
                <span class="font-semibold text-gray-800">💰 Giá hiện tại:</span>
                {{auction.highestBid }} ETH
              </p>
              <p>
                <span class="font-semibold text-gray-800">🕒 Kết thúc:</span>
                {{ formatDate(auction.endTime) }}
              </p>
              <p>
                <span class="font-semibold text-gray-800">📦 Trạng thái:</span>
                <span :class="getStatusClass(auction.ended ? 'Ended' : 'Active')" class="px-2 py-1 rounded-full text-xs font-semibold">
                  {{ auction.ended ? 'Đã kết thúc' : 'Đang hoạt động' }}
                </span>
              </p>
              <p>
                <span class="font-semibold text-gray-800">🔗 Địa chỉ hợp đồng:</span>
                <span class="text-gray-700">{{ auction.contractAddress }}</span>
              </p>
            </div>
          </div>

          <div class="mt-6 border-t pt-4 text-sm text-gray-500">
            <p>Ngày tạo: {{ formatDate(auction.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const address = route.params.address
const API_BASE = 'http://localhost:3001'
const auction = ref(null)
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/auction/${address}/detail`)
    if (!res.ok) throw new Error('HTTP error ' + res.status)
    auction.value = await res.json()
  } catch (err) {
    console.error(err)
    error.value = 'Không thể tải dữ liệu đấu giá'
  } finally {
    loading.value = false
  }
})
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownInterval = null

const startCountdown = (endTime) => {
  clearInterval(countdownInterval)
  const end = new Date(endTime).getTime()

  const updateCountdown = () => {
    const now = Date.now()
    const distance = end - now

    if (distance <= 0) {
      timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
      clearInterval(countdownInterval)
      return
    }

    timeLeft.value = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    }
  }

  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
}

watch(auction, (val) => {
  if (val?.endTime) startCountdown(val.endTime)
})

const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0 ₫'
  return Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '—')
const getStatusClass = (status) => {
  const map = {
    Active: 'bg-green-100 text-green-800',
    Ended: 'bg-gray-100 text-gray-800',
    Cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}
</script>
