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
            <option value="active">Đang đấu giá</option>
            <option value="sold">Đã bán</option>
            <option value="unsold">Chưa bán</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select v-model="filters.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả</option>
            <option value="art">Nghệ thuật</option>
            <option value="jewelry">Trang sức</option>
            <option value="watches">Đồng hồ</option>
            <option value="antiques">Đồ cổ</option>
            <option value="cars">Xe cổ</option>
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lot
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Danh mục
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá khởi điểm
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá hiện tại
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="lot in lots" :key="lot.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="lot.image" :alt="lot.title" class="w-12 h-12 rounded object-cover" />
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ lot.title }}</div>
                  <div class="text-sm text-gray-500">{{ lot.code }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ lot.category }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">${{ lot.startPrice.toLocaleString() }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium text-gray-900">${{ lot.currentPrice.toLocaleString() }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(lot.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(lot.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-2">
                <button @click="viewLot(lot.id)" class="text-blue-600 hover:text-blue-900">Xem</button>
                <button @click="editLot(lot.id)" class="text-green-600 hover:text-green-900">Sửa</button>
                <button @click="deleteLot(lot.id)" class="text-red-600 hover:text-red-900">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
      <div class="text-sm text-gray-700">
        Hiển thị <span class="font-medium">1</span> đến <span class="font-medium">10</span> trong <span class="font-medium">{{ totalLots }}</span> kết quả
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Trước</button>
        <button class="px-3 py-1 bg-blue-600 text-white rounded">1</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Sau</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const filters = ref({
  status: '',
  category: '',
  search: ''
})

const totalLots = ref(156)

const lots = ref([
  {
    id: 1,
    code: 'LOT-2024-001',
    title: 'Đồng hồ Rolex Submariner',
    category: 'Đồng hồ',
    image: 'https://via.placeholder.com/150',
    startPrice: 15000,
    currentPrice: 23000,
    status: 'active'
  },
  {
    id: 2,
    code: 'LOT-2024-002',
    title: 'Tranh sơn dầu Picasso',
    category: 'Nghệ thuật',
    image: 'https://via.placeholder.com/150',
    startPrice: 50000,
    currentPrice: 50000,
    status: 'pending'
  },
  {
    id: 3,
    code: 'LOT-2024-003',
    title: 'Nhẫn kim cương 5 carat',
    category: 'Trang sức',
    image: 'https://via.placeholder.com/150',
    startPrice: 30000,
    currentPrice: 45000,
    status: 'active'
  }
])

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    sold: 'bg-purple-100 text-purple-800',
    unsold: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    active: 'Đang đấu giá',
    sold: 'Đã bán',
    unsold: 'Chưa bán'
  }
  return texts[status] || status
}

const resetFilters = () => {
  filters.value = { status: '', category: '', search: '' }
}

const viewLot = (id) => {
  console.log('View lot:', id)
}

const editLot = (id) => {
  console.log('Edit lot:', id)
}

const deleteLot = (id) => {
  if (confirm('Bạn có chắc muốn xóa lot này?')) {
    console.log('Delete lot:', id)
  }
}
</script>