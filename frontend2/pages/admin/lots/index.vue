<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Lots đấu giá</h1>
        <p class="text-gray-600">Danh sách tất cả các lots trong hệ thống</p>
      </div>
      <NuxtLink
        to="/admin/lots/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm Lot mới
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="Active">Đang đấu giá</option>
            <option value="Ended">Đã kết thúc</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select v-model="filters.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên lot, mã lot..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá khởi điểm</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="lot in filteredLots" :key="lot.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="lot.item?.imageUrl || '/no-image.jpg'" alt="image" class="w-12 h-12 rounded object-cover" />
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ lot.item?.name }}</div>
                  <div class="text-sm text-gray-500">{{ lot.contractAddress.slice(0, 10) }}...</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ lot.item?.category?.name || '—' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{lot.item?.startingPrice}} ETH</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(lot.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ lot.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-2">
                <button @click="viewLot(lot.contractAddress)" class="text-blue-600 hover:text-blue-900">Xem</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })

const API_BASE = 'http://localhost:3001'
const lots = ref([])
const categories = ref([])
const filters = ref({ status: '', category: '', search: '' })

// 🟢 Lấy danh sách đấu giá
const fetchLots = async () => {
  try {
    const res = await fetch(`${API_BASE}/auction/list`)
    lots.value = await res.json()
  } catch (err) {
    console.error('❌ Lỗi khi tải lots:', err)
  }
}

// 🟢 Lấy danh mục
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/categories`)
    categories.value = await res.json()
  } catch (err) {
    console.error('❌ Lỗi khi tải categories:', err)
  }
}

//🟢 Chuyển trang detail
const viewLot = (address) => {
  navigateTo(`/admin/lots/${address}`)
}

onMounted(async () => {
  await Promise.all([fetchLots(), fetchCategories()])
})

// 🎯 Lọc dữ liệu
const filteredLots = computed(() => {
  return lots.value.filter(lot => {
    const matchStatus = !filters.value.status || lot.status === filters.value.status
    const matchCategory = !filters.value.category || lot.item?.category?.name === filters.value.category
    const matchSearch = !filters.value.search || lot.item?.name.toLowerCase().includes(filters.value.search.toLowerCase())
    return matchStatus && matchCategory && matchSearch
  })
})

const formatPrice = (p) => {
  return p ? p.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '—'
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    Active: 'bg-green-100 text-green-800',
    Ended: 'bg-gray-100 text-gray-800',
    Cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => (filters.value = { status: '', category: '', search: '' })
</script>
