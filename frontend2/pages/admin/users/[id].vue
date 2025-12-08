<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Thông tin người dùng</h1>
        <p class="text-gray-600">Chi tiết tài khoản và hoạt động đấu giá</p>
      </div>
      <NuxtLink
        to="/admin/users"
        class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </NuxtLink>
    </div>

    <!-- User info card -->
    <div class="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ user.name }}</h2>
          <p class="text-gray-500">{{ user.email }}</p>
          <p class="text-sm text-gray-400">Vai trò: <span class="font-semibold">{{ user.role }}</span></p>
        </div>
      </div>

      <div class="mt-4 md:mt-0">
        <p class="text-sm text-gray-500">Địa chỉ ví:</p>
        <p class="font-mono text-sm text-gray-800 bg-gray-50 p-2 rounded">{{ user.wallet || 'Chưa liên kết ví' }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div>
      <div class="border-b mb-4 flex space-x-4">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="selectedTab = tab"
          :class="[
            'px-4 py-2 font-medium text-sm',
            selectedTab === tab
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Tab: Tổng quan -->
      <div v-if="selectedTab === 'Tổng quan'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="card in overviewCards" :key="card.title" class="bg-white p-5 rounded-lg shadow-sm">
            <div class="text-2xl mb-2">{{ card.icon }}</div>
            <p class="text-sm text-gray-500">{{ card.title }}</p>
            <p class="text-xl font-bold">{{ card.value }}</p>
          </div>
        </div>
      </div>

      <!-- Tab: Là người bán -->
      <div v-if="selectedTab === 'Là người bán'" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vật phẩm</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá khởi điểm</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="auction in user.auctions" :key="auction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <!-- Ảnh vật phẩm (thật hoặc fallback) -->
                  <img
                    :src="auction.item?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(auction.item?.name || 'Item')}&background=random&color=fff`"
                    class="w-12 h-12 rounded object-cover"
                    alt="item"
                  />
                  <!-- Tên vật phẩm -->
                  <span class="text-sm font-medium text-gray-900">
                    {{ auction.item?.name || '—' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 font-bold whitespace-nowrap">{{auction.item?.startingPrice}} ETH</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(auction.status)"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{ auction.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-500 text-sm">
                {{ formatDate(auction.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab: Là người mua -->
      <div v-if="selectedTab === 'Là người mua'" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vật phẩm</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá đặt</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết quả</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="bid in user.bids" :key="bid.id" class="hover:bg-gray-50">
              <td class="text-sm px-6 py-4 whitespace-nowrap">{{ bid.auction?.item?.name || '—' }}</td>
              <td class="px-6 py-4 font-bold whitespace-nowrap">{{bid.amount }} ETH</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-gray-700">{{ bid.status || 'Chưa xác định' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const user = ref({})
const tabs = ['Tổng quan', 'Là người bán', 'Là người mua']
const selectedTab = ref('Tổng quan')

const overviewCards = ref([
  { title: 'Tổng đấu giá đã tạo', value: 0, icon: '🏷️' },
  { title: 'Đang hoạt động', value: 0, icon: '⚡' },
  { title: 'Đã bán', value: 0, icon: '💰' },
  { title: 'Đấu giá đã tham gia', value: 0, icon: '📈' },
])

const formatPrice = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN')
}

const getStatusClass = (status) => {
  const map = {
    Active: 'bg-green-100 text-green-700',
    Ended: 'bg-gray-100 text-gray-600',
    Pending: 'bg-yellow-100 text-yellow-700',
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

onMounted(async () => { 
  const res = await fetch(`http://localhost:3001/users/${route.params.id}`)
  user.value = await res.json()

  // tính toán thống kê tổng quan
  overviewCards.value[0].value = user.value.auctions?.length || 0
  overviewCards.value[1].value = user.value.auctions?.filter(a => a.status === 'Active').length || 0
  overviewCards.value[2].value = user.value.auctions?.filter(a => a.status === 'Sold').length || 0
  overviewCards.value[3].value = user.value.bids?.length || 0
})
</script>
