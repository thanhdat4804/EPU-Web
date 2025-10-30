<template>
  <div class="space-y-6">
    <!-- Header -->
   
<div class="flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
    <p class="text-gray-600">Danh sách tất cả người dùng trong hệ thống</p>
  </div>
  <NuxtLink
    to="/admin/users/create"
    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Thêm người dùng
  </NuxtLink>
</div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Tổng người dùng</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">15,824</div>
        <div class="text-sm text-green-600 mt-1">+12% so với tháng trước</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Người bán</div>
        <div class="text-2xl font-bold text-blue-600 mt-2">1,234</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Người mua</div>
        <div class="text-2xl font-bold text-green-600 mt-2">14,590</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Hoạt động hôm nay</div>
        <div class="text-2xl font-bold text-purple-600 mt-2">342</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
          <select v-model="filters.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
            <option value="expert">Chuyên gia</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="suspended">Tạm khóa</option>
            <option value="banned">Cấm vĩnh viễn</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Xác thực</label>
          <select v-model="filters.verified" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="verified">Đã xác thực</option>
            <option value="unverified">Chưa xác thực</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên, email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div class="flex items-end">
          <button class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Người dùng
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Vai trò
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Đã tham gia
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tổng chi tiêu
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Trạng thái
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="user.avatar" :alt="user.name" class="w-10 h-10 rounded-full" />
                <div class="ml-4">
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <svg v-if="user.verified" class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRoleBadge(user.role)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.joinedDate }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${{ user.totalSpent.toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadge(user.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-2">
                <button @click="viewUser(user.id)" class="text-blue-600 hover:text-blue-900">Xem</button>
                <button @click="editUser(user.id)" class="text-green-600 hover:text-green-900">Sửa</button>
                <button @click="suspendUser(user.id)" class="text-yellow-600 hover:text-yellow-900">Khóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
      <div class="text-sm text-gray-700">
        Hiển thị <span class="font-medium">1</span> đến <span class="font-medium">10</span> trong <span class="font-medium">15,824</span> kết quả
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
  role: '',
  status: '',
  verified: '',
  search: ''
})

const users = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff',
    role: 'buyer',
    verified: true,
    joinedDate: '2024-01-15',
    totalSpent: 45000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
    role: 'seller',
    verified: true,
    joinedDate: '2023-11-20',
    totalSpent: 120000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Robert Chen',
    email: 'robert.c@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Chen&background=10b981&color=fff',
    role: 'expert',
    verified: true,
    joinedDate: '2023-08-10',
    totalSpent: 0,
    status: 'active'
  }
])

const getRoleBadge = (role) => {
  const badges = {
    buyer: 'bg-blue-100 text-blue-800',
    seller: 'bg-green-100 text-green-800',
    expert: 'bg-purple-100 text-purple-800'
  }
  return badges[role] || badges.buyer
}

const getRoleText = (role) => {
  const texts = {
    buyer: 'Người mua',
    seller: 'Người bán',
    expert: 'Chuyên gia'
  }
  return texts[role] || role
}

const getStatusBadge = (status) => {
  const badges = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800'
  }
  return badges[status] || badges.active
}

const getStatusText = (status) => {
  const texts = {
    active: 'Hoạt động',
    suspended: 'Tạm khóa',
    banned: 'Cấm'
  }
  return texts[status] || status
}

const viewUser = (id) => {
  console.log('View user:', id)
}

const editUser = (id) => {
  console.log('Edit user:', id)
}

const suspendUser = (id) => {
  if (confirm('Khóa tài khoản người dùng này?')) {
    console.log('Suspend user:', id)
  }
}
</script>