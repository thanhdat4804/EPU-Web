<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p class="text-gray-600">Phân tích dữ liệu và xu hướng kinh doanh</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>7 ngày qua</option>
          <option>30 ngày qua</option>
          <option>3 tháng qua</option>
          <option>1 năm qua</option>
          <option>Tùy chỉnh</option>
        </select>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất báo cáo
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Tổng doanh thu</div>
            <div class="text-3xl font-bold mt-2">$2.45M</div>
            <div class="text-sm mt-2 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
              +23.5% vs tháng trước
            </div>
          </div>
          <div class="p-3 bg-white bg-opacity-20 rounded-full">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Lots đã bán</div>
            <div class="text-3xl font-bold mt-2">1,234</div>
            <div class="text-sm mt-2">342 lots đang đấu giá</div>
          </div>
          <div class="p-3 bg-white bg-opacity-20 rounded-full">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Người dùng mới</div>
            <div class="text-3xl font-bold mt-2">+856</div>
            <div class="text-sm mt-2">Tháng này</div>
          </div>
          <div class="p-3 bg-white bg-opacity-20 rounded-full">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Tỷ lệ chuyển đổi</div>
            <div class="text-3xl font-bold mt-2">68.5%</div>
            <div class="text-sm mt-2">+4.2% vs tháng trước</div>
          </div>
          <div class="p-3 bg-white bg-opacity-20 rounded-full">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Biểu đồ doanh thu</h3>
          <select class="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>Ngày</option>
            <option>Tuần</option>
            <option>Tháng</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div class="text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
            <p class="text-sm">(Tích hợp Chart.js hoặc Recharts)</p>
          </div>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Phân bố theo danh mục</h3>
        <div class="space-y-4">
          <div v-for="category in categories" :key="category.name">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
              <span class="text-sm font-bold text-gray-900">{{ category.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                :class="category.color"
                :style="{ width: category.percentage + '%' }"
                class="h-2 rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Performers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Sellers -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Người bán hàng đầu</h3>
        <div class="space-y-4">
          <div v-for="(seller, index) in topSellers" :key="seller.id" class="flex items-center gap-4">
            <div class="text-2xl font-bold text-gray-400 w-8">{{ index + 1 }}</div>
            <img :src="seller.avatar" :alt="seller.name" class="w-12 h-12 rounded-full" />
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ seller.name }}</div>
              <div class="text-sm text-gray-500">{{ seller.itemsSold }} lots đã bán</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-gray-900">${{ seller.revenue.toLocaleString() }}</div>
              <div class="text-sm text-gray-500">Doanh thu</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Lots -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Lots bán chạy nhất</h3>
        <div class="space-y-4">
          <div v-for="(lot, index) in topLots" :key="lot.id" class="flex items-center gap-4">
            <div class="text-2xl font-bold text-gray-400 w-8">{{ index + 1 }}</div>
            <img :src="lot.image" :alt="lot.title" class="w-12 h-12 rounded object-cover" />
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ lot.title }}</div>
              <div class="text-sm text-gray-500">{{ lot.category }}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-gray-900">${{ lot.finalPrice.toLocaleString() }}</div>
              <div class="text-sm text-green-600">{{ lot.bids }} lượt đấu giá</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Statistics Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Thống kê chi tiết theo danh mục</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lots</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã bán</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tỷ lệ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TB/Lot</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="stat in categoryStats" :key="stat.category" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div :class="stat.color" class="w-3 h-3 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-900">{{ stat.category }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ stat.totalLots }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ stat.sold }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ stat.successRate }}%</span>
                  <div class="w-16 bg-gray-200 rounded-full h-2 ml-3">
                    <div :class="stat.color" :style="{ width: stat.successRate + '%' }" class="h-2 rounded-full"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ stat.revenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ stat.avgPrice.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const categories = ref([
  { name: 'Nghệ thuật', percentage: 35, color: 'bg-blue-500' },
  { name: 'Đồng hồ', percentage: 28, color: 'bg-green-500' },
  { name: 'Trang sức', percentage: 22, color: 'bg-purple-500' },
  { name: 'Đồ cổ', percentage: 10, color: 'bg-yellow-500' },
  { name: 'Khác', percentage: 5, color: 'bg-gray-500' }
])

const topSellers = ref([
  {
    id: 1,
    name: 'John Smith',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff',
    itemsSold: 156,
    revenue: 450000
  },
  {
    id: 2,
    name: 'Maria Garcia',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
    itemsSold: 134,
    revenue: 380000
  },
  {
    id: 3,
    name: 'David Chen',
    avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=10b981&color=fff',
    itemsSold: 98,
    revenue: 290000
  }
])

const topLots = ref([
  {
    id: 1,
    title: 'Tranh Picasso 1960',
    category: 'Nghệ thuật',
    image: 'https://via.placeholder.com/150',
    finalPrice: 125000,
    bids: 45
  },
  {
    id: 2,
    title: 'Rolex Daytona Gold',
    category: 'Đồng hồ',
    image: 'https://via.placeholder.com/150',
    finalPrice: 95000,
    bids: 38
  },
  {
    id: 3,
    title: 'Nhẫn kim cương 10ct',
    category: 'Trang sức',
    image: 'https://via.placeholder.com/150',
    finalPrice: 80000,
    bids: 32
  }
])

const categoryStats = ref([
  {
    category: 'Nghệ thuật',
    totalLots: 342,
    sold: 289,
    successRate: 85,
    revenue: 1200000,
    avgPrice: 4152,
    color: 'bg-blue-500'
  },
  {
    category: 'Đồng hồ',
    totalLots: 267,
    sold: 234,
    successRate: 88,
    revenue: 980000,
    avgPrice: 4188,
    color: 'bg-green-500'
  },
  {
    category: 'Trang sức',
    totalLots: 198,
    sold: 156,
    successRate: 79,
    revenue: 750000,
    avgPrice: 4808,
    color: 'bg-purple-500'
  },
  {
    category: 'Đồ cổ',
    totalLots: 145,
    sold: 112,
    successRate: 77,
    revenue: 340000,
    avgPrice: 3036,
    color: 'bg-yellow-500'
  },
  {
    category: 'Xe cổ',
    totalLots: 56,
    sold: 48,
    successRate: 86,
    revenue: 2100000,
    avgPrice: 43750,
    color: 'bg-red-500'
  }
])
</script>