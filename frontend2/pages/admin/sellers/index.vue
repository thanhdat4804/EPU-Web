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

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Tổng người bán</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.total }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đang hoạt động</div>
        <div class="text-2xl font-bold text-green-600 mt-2">{{ stats.active }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Lots đang bán</div>
        <div class="text-2xl font-bold text-blue-600 mt-2">{{ stats.activeLots }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Doanh thu tháng này</div>
        <div class="text-2xl font-bold text-purple-600 mt-2">
          {{ stats.revenue.toFixed(4) }} ETH
        </div>
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
            <option value="blocked">Bị khóa</option>
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

    <!-- Sellers Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người bán</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
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
                <img :src="seller.avatar" class="w-10 h-10 rounded-full" />
                <div class="ml-4">
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-medium text-gray-900">{{ seller.name }}</div>
                    <svg v-if="seller.verified" class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066..." />
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
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1">
                ⭐ <span>{{ seller.rating.toFixed(1) }}</span>
                <span class="text-sm text-gray-500">({{ seller.reviews }})</span>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-2">
                <button @click="viewSeller(seller.id)" class="text-blue-600 hover:text-blue-900">Xem</button>
                <button @click="editSeller(seller.id)" class="text-green-600 hover:text-green-900">Sửa</button>

                <!-- Nút khóa -->
                <button
                  v-if="seller.status === 'active'"
                  @click="suspendSeller(seller.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Khóa
                </button>

                <!-- Nút bỏ khóa -->
                <button
                  v-else
                  @click="unblockSeller(seller.id)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  Bỏ khóa
                </button>
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
            ✖
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
import { useCsrf } from '~/composables/useCsrf'
definePageMeta({ layout: 'admin' })
const router = useRouter()
const { csrfToken, fetchCsrf } = useCsrf()
// Data
const sellers = ref<any[]>([])
const stats = ref({
  total: 0,
  active: 0,
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

// LOAD SELLER LIST
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
    })

    const sellerUsers = data.filter(u => u.sellerStats)

    sellers.value = sellerUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3b82f6&color=fff`,
      totalProducts: u.sellerStats.totalAuctions || 0,
      activeProducts: u.sellerStats.activeAuctions || 0,
      status: (u.status || 'ACTIVE').trim().toLowerCase(),
      verified: !!u.verified,
      revenue: Number(u.sellerStats.totalRevenue || 0),
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 500) + 50
    }))

    stats.value.total = sellerUsers.length
    stats.value.active = sellers.value.filter(s => s.status === 'active').length
    stats.value.activeLots = sellerUsers.reduce((s, u) => s + (u.sellerStats.activeAuctions || 0), 0)
    stats.value.revenue = sellerUsers.reduce((s, u) => s + Number(u.sellerStats.totalRevenue || 0), 0)

  } catch (err) {
    console.error(err)
    alert('Không thể tải dữ liệu')
  }
}

// STATUS BADGE
const getStatusBadge = (status: string) => {
  status = status.trim().toLowerCase();
  const badges = {
    active: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800'
  };
  return badges[status] || badges.active;
}

const getStatusText = (status: string) => {
  status = status.trim().toLowerCase();
  const texts = {
    active: 'Hoạt động',
    blocked: 'Bị khóa'
  };
  return texts[status] || status;
}


const resetFilters = () => {
  filters.value = { status: '', verified: '', category: '', search: '' }
  loadSellers()
}

// ACTIONS
const viewSeller = (id: number) => router.push(`/admin/users/${id}`)
const editSeller = (id: number) => console.log('Edit', id)

// 🔥 KHÓA USER
const suspendSeller = async (id: number) => {
  if (!confirm('Bạn có chắc muốn khóa người bán này?')) return

  try {
    const jwt = localStorage.getItem('jwt')

    await $fetch(`http://localhost:3001/users/${id}/block`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'X-CSRF-Token': csrfToken.value, }
    })

    alert('Đã khóa người bán!')
    loadSellers()

  } catch (err) {
    console.error(err)
    alert('Không thể khóa người bán!')
  }
}
const unblockSeller = async (id: number) => {
  if (!confirm('Bạn có chắc muốn bỏ khóa người bán này?')) return

  try {
    const jwt = localStorage.getItem('jwt')

    await $fetch(`http://localhost:3001/users/${id}/unblock`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'X-CSRF-Token': csrfToken.value,
      }
    })

    alert('Đã mở khóa người bán!')
    loadSellers()

  } catch (err) {
    console.error(err)
    alert('Không thể mở khóa!')
  }
}

onMounted(loadSellers)
</script>
