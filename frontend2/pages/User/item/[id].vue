<template>
  <div>
    <!-- Header -->
    <UserHeader />

    <div v-if="item" class="max-w-6xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Hình ảnh sản phẩm -->
        <div class="flex justify-center items-center bg-gray-100 rounded-lg p-6">
          <img
            :src="item.imageUrl || '/no-image.jpg'"
            :alt="item.name"
            class="max-h-[400px] object-contain rounded-lg shadow"
          />
        </div>

        <!-- Thông tin chi tiết -->
        <div>
          <h1 class="text-3xl font-bold mb-4">{{ item.name }}</h1>
          <p class="text-gray-600 mb-6">{{ item.description }}</p>

          <div class="space-y-2">
            <p>
              <span class="font-semibold">Giá khởi điểm:</span>
              {{ formatPrice(item.startingPrice) }}
            </p>
            <p>
              <span class="font-semibold">Giá hiện tại:</span>
              <span class="text-blue-600 font-bold text-lg">
                {{ formatPrice(item.currentPrice) }}
              </span>
            </p>
            <p>
              <span class="font-semibold">Kết thúc vào:</span>
              {{ formatDate(item.endTime) }}
            </p>
          </div>

          <button
            class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
          >
            Tham gia đấu giá
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-10">
      Đang tải dữ liệu sản phẩm...
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useItem } from '~/composables/User/useItem'
import UserHeader from '~/components/User/Header.vue'

const route = useRoute()
const { item, fetchItem } = useItem()

onMounted(() => {
  fetchItem(route.params.id)
})

const formatPrice = (price) => {
  if (!price) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN')
}
</script>
