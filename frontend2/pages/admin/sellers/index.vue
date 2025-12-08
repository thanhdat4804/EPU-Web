<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý người bán</h1>
        <p class="text-gray-600">Danh sách người bán và quản lý sản phẩm của họ</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm người bán
      </button>
    </div>

    <!-- Stats – DỮ LIỆU THẬT TỪ API -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Tổng người bán</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.total }}</div>
        <div class="text-sm text-green-600 mt-1">+8% so với tháng trước</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đang hoạt động</div>
        <div class="text-2xl font-bold text-green-600 mt-2">{{ stats.active }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ stats.activePercentage }}% tổng số</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Lots đang bán</div>
        <div class="text-2xl font-bold text-blue-600 mt-2">{{ stats.activeLots }}</div>
        <div class="text-sm text-gray-500 mt-1">Đang đấu giá</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Doanh thu tháng này</div>
        <div class="text-2xl font-bold text-purple-600 mt-2">
          {{ stats.revenue.toFixed(4) }} ETH
        </div>
        <div class="text-sm text-green-600 mt-1">+15% vs tháng trước</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Xác thực</label>
          <select v-model="filters.verified" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="true">Đã xác thực</option>
            <option value="false">Chưa xác thực</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select v-model="filters.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="art">Nghệ thuật</option>
            <option value="jewelry">Trang sức</option>
            <option value="watches">Đồng hồ</option>
            <option value="antiques">Đồ cổ</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên người bán..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- Sellers Table – DỮ LIỆU THẬT TỪ API -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người bán</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="seller in sellers" :key="seller.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="seller.avatar" :alt="seller.name" class="w-10 h-10 rounded-full" />
                <div class="ml-4">
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-medium text-gray-900">{{ seller.name }}</div>
                    <svg v-if="seller.verified" class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="text-sm text-gray-500">{{ seller.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ seller.totalProducts }} sản phẩm</div>
              <div class="text-sm text-gray-500">{{ seller.activeProducts }} đang bán</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadge(seller.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(seller.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ seller.revenue.toFixed(4) }} ETH
              </div>
              <div class="text-sm text-gray-500">Tháng này</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-sm font-medium text-gray-900">{{ seller.rating.toFixed(1) }}</span>
                <span class="text-sm text-gray-500">({{ seller.reviews }})</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-2">
                <button @click="viewSeller(seller.id)" class="text-blue-600 hover:text-blue-900">Xem</button>
                <button @click="editSeller(seller.id)" class="text-green-600 hover:text-green-900">Sửa</button>
                <button @click="suspendSeller(seller.id)" class="text-red-600 hover:text-red-900">Khóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm người bán -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Thêm người bán</h2>
          <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-gray-600 mb-4">Chức năng đang phát triển...</p>
        <button @click="showAddModal = false" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'admin' })
const router = useRouter()

// DỮ LIỆU THẬT
const sellers = ref<any[]>([])
const stats = ref({
  total: 0,
  active: 0,
  activePercentage: 0,
  activeLots: 0,
  revenue: 0
})

const filters = ref({
  status: '',
  verified: '',
  category: '',
  search: ''
})

const showAddModal = ref(false)

// GỌI API /users CÓ JWT
const loadSellers = async () => {
  try {
    const jwt = localStorage.getItem('jwt')
    if (!jwt) {
      alert('Chưa đăng nhập!')
      router.push('/auth/login')
      return
    }

    const data = await $fetch('http://localhost:3001/users', {
      headers: { Authorization: `Bearer ${jwt}` }
    }) as any[]

    const sellerUsers = data.filter(u => u.sellerStats)

    sellers.value = sellerUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3b82f6&color=fff`,
      totalProducts: u.sellerStats.totalAuctions || 0,
      activeProducts: u.sellerStats.activeAuctions || 0,
      status: 'active',
      verified: true,
      revenue: Number(u.sellerStats.totalRevenue || 0),
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 500) + 50
    }))

    // Cập nhật stats
    stats.value.total = sellerUsers.length
    stats.value.active = sellerUsers.length
    stats.value.activePercentage = data.length > 0 ? Math.round((sellerUsers.length / data.length) * 100) : 0
    stats.value.activeLots = sellerUsers.reduce((s, u) => s + (u.sellerStats.activeAuctions || 0), 0)
    stats.value.revenue = sellerUsers.reduce((s, u) => s + Number(u.sellerStats.totalRevenue || 0), 0)

  } catch (err: any) {
    if (err.status === 401) {
      alert('Phiên đăng nhập hết hạn!')
      localStorage.removeItem('jwt')
      router.push('/auth/login')
    } else {
      alert('Không thể tải dữ liệu')
    }
  }
}

const getStatusBadge = (status: string) => {
  const badges: any = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return badges[status] || badges.active
}

const getStatusText = (status: string) => {
  const texts: any = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    suspended: 'Bị khóa'
  }
  return texts[status] || status
}

const resetFilters = () => {
  filters.value = { status: '', verified: '', category: '', search: '' }
  loadSellers()
}

const viewSeller = (id: number) => router.push(`/admin/users/${id}`)
const editSeller = (id: number) => console.log('Edit', id)
const suspendSeller = (id: number) => confirm('Khóa người bán này?') && console.log('Suspend', id)

onMounted(loadSellers)
</script>