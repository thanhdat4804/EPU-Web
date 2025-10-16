<!-- admin/src/App.vue -->
<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside 
      :class="[
        'bg-gray-900 text-white transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo & Toggle -->
      <div class="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 v-show="sidebarOpen" class="text-xl font-bold">EPU Auction</h1>
        <button 
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-800 rounded transition-colors"
        >
          <svg v-if="sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeMenu = item.id"
          :class="[
            'w-full flex items-center space-x-3 p-3 rounded-lg transition-all',
            activeMenu === item.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-800'
          ]"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span v-show="sidebarOpen" class="font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <!-- User Info & Logout -->
      <div class="p-4 border-t border-gray-800">
        <div v-show="sidebarOpen" class="mb-3 p-3 bg-gray-800 rounded-lg">
          <p class="text-sm font-semibold">Admin User</p>
          <p class="text-xs text-gray-400">admin@epu.com</p>
        </div>
        <button class="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
          <span class="text-xl">🚪</span>
          <span v-show="sidebarOpen">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-10">
        <div class="flex items-center justify-between p-4">
          <!-- Search Bar -->
          <div class="flex-1 max-w-xl">
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Notifications & Profile -->
          <div class="flex items-center space-x-4 ml-4">
            <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <span class="text-xl">🔔</span>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <!-- Dashboard View -->
        <div v-if="activeMenu === 'dashboard'">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div 
              v-for="(stat, index) in stats" 
              :key="index"
              class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-2">{{ stat.title }}</p>
                  <h3 class="text-3xl font-bold text-gray-800">{{ stat.value }}</h3>
                  <p :class="`text-sm mt-2 font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`">
                    {{ stat.change }}
                  </p>
                </div>
                <div :class="`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg`">
                  {{ stat.emoji }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Auctions Table -->
          <div class="bg-white rounded-xl shadow-md mb-6">
            <div class="p-6 border-b flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-800">Đấu giá gần đây</h2>
              <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + Tạo mới
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giá hiện tại</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr 
                    v-for="auction in recentAuctions" 
                    :key="auction.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4 text-sm text-gray-900">{{ auction.id }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-gray-200 rounded-lg mr-3">🖼️</div>
                        <span class="text-sm font-medium text-gray-900">{{ auction.title }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span 
                        :class="[
                          'px-3 py-1 text-xs font-semibold rounded-full',
                          auction.status === 'Đang diễn ra' ? 'bg-green-100 text-green-800' :
                          auction.status === 'Kết thúc' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        ]"
                      >
                        {{ auction.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ auction.currentBid }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ auction.endTime }}</td>
                    <td class="px-6 py-4">
                      <button class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        Chi tiết →
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Revenue Chart -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-6">Doanh thu theo tháng</h3>
              <div class="h-64 flex items-end justify-around space-x-2">
                <div 
                  v-for="(height, i) in revenueData" 
                  :key="i"
                  class="flex flex-col items-center flex-1 group"
                >
                  <div 
                    class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                    :style="{ height: `${height}%` }"
                    :title="`Tháng ${i + 1}: ${height}%`"
                  ></div>
                  <span class="text-xs text-gray-600 mt-2 font-medium">T{{ i + 1 }}</span>
                </div>
              </div>
            </div>

            <!-- Category Distribution -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-6">Phân loại đấu giá</h3>
              <div class="space-y-4">
                <div v-for="(item, i) in categories" :key="i">
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium text-gray-700">{{ item.name }}</span>
                    <span class="font-bold text-gray-900">{{ item.value }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      :class="`${item.color} h-3 rounded-full transition-all duration-500 ease-out`"
                      :style="{ width: `${item.value}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Auctions Management View -->
        <div v-else-if="activeMenu === 'auctions'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">Quản lý đấu giá</h2>
            <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              + Tạo đấu giá mới
            </button>
          </div>
          <div class="p-6">
            <div class="text-center py-12">
              <span class="text-6xl mb-4 block">📦</span>
              <p class="text-gray-500 text-lg">Danh sách các phiên đấu giá sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <!-- Products Management View -->
        <div v-else-if="activeMenu === 'products'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
            <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              + Thêm sản phẩm
            </button>
          </div>
          <div class="p-6">
            <div class="text-center py-12">
              <span class="text-6xl mb-4 block">📦</span>
              <p class="text-gray-500 text-lg">Danh sách sản phẩm sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <!-- Users Management View -->
        <div v-else-if="activeMenu === 'users'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
          </div>
          <div class="p-6">
            <div class="text-center py-12">
              <span class="text-6xl mb-4 block">👥</span>
              <p class="text-gray-500 text-lg">Danh sách người dùng sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <!-- Analytics View -->
        <div v-else-if="activeMenu === 'analytics'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">Thống kê & Báo cáo</h2>
          </div>
          <div class="p-6">
            <div class="text-center py-12">
              <span class="text-6xl mb-4 block">📊</span>
              <p class="text-gray-500 text-lg">Báo cáo thống kê sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <!-- Settings View -->
        <div v-else-if="activeMenu === 'settings'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
          </div>
          <div class="p-6">
            <div class="text-center py-12">
              <span class="text-6xl mb-4 block">⚙️</span>
              <p class="text-gray-500 text-lg">Cài đặt hệ thống sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State
const sidebarOpen = ref(true)
const activeMenu = ref('dashboard')
const searchQuery = ref('')

// Menu configuration
const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'auctions', icon: '🔨', label: 'Quản lý đấu giá' },
  { id: 'products', icon: '📦', label: 'Sản phẩm' },
  { id: 'users', icon: '👥', label: 'Người dùng' },
  { id: 'analytics', icon: '📈', label: 'Thống kê' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt' }
]

// Dashboard stats
const stats = ref([
  { 
    title: 'Tổng đấu giá', 
    value: '156', 
    change: '+12%', 
    color: 'bg-blue-500',
    emoji: '🔨'
  },
  { 
    title: 'Người dùng', 
    value: '1,234', 
    change: '+8%', 
    color: 'bg-green-500',
    emoji: '👥'
  },
  { 
    title: 'Doanh thu', 
    value: '45.2M', 
    change: '+23%', 
    color: 'bg-purple-500',
    emoji: '💰'
  },
  { 
    title: 'Đang diễn ra', 
    value: '28', 
    change: '+5%', 
    color: 'bg-orange-500',
    emoji: '⏰'
  }
])

// Recent auctions data
const recentAuctions = ref([
  { 
    id: 1, 
    title: 'Tranh Nhà', 
    status: 'Đang diễn ra', 
    currentBid: '100,000,000 ₫', 
    endTime: '2h 30m' 
  },
  { 
    id: 2, 
    title: 'Đồng hồ cổ', 
    status: 'Đang diễn ra', 
    currentBid: '250,000,000 ₫', 
    endTime: '5h 15m' 
  },
  { 
    id: 3, 
    title: 'Vật phẩm sưu tầm', 
    status: 'Kết thúc', 
    currentBid: '75,000,000 ₫', 
    endTime: 'Đã kết thúc' 
  },
  { 
    id: 4, 
    title: 'Đấu giá xe', 
    status: 'Sắp diễn ra', 
    currentBid: '-', 
    endTime: 'Bắt đầu sau 1 ngày' 
  }
])

// Chart data
const revenueData = ref([40, 65, 45, 80, 70, 90, 75])

const categories = ref([
  { name: 'Nghệ thuật', value: 45, color: 'bg-blue-500' },
  { name: 'Đồ cổ', value: 30, color: 'bg-green-500' },
  { name: 'Trang sức', value: 15, color: 'bg-purple-500' },
  { name: 'Khác', value: 10, color: 'bg-orange-500' }
])
</script>

<style scoped>
/* Custom scrollbar */
main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: #f1f5f9;
}

main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>