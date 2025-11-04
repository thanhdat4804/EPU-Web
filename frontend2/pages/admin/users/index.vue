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
      <div class="bg-white rounded-lg shadow p-6" v-for="stat in stats" :key="stat.title">
        <div class="text-sm text-gray-600">{{ stat.title }}</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stat.value }}</div>
        <div v-if="stat.sub" class="text-sm text-green-600 mt-1">{{ stat.sub }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
          <select v-model="filters.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="User">Người mua</option>
            <option value="Seller">Người bán</option>
            <option value="Admin">Quản trị</option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên, email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div class="flex items-end col-span-2">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tham gia</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`"
                  class="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
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
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/admin/users/${user.id}`"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Xem
                </NuxtLink>
                <button @click="editUser(user.id)" class="text-green-600 hover:text-green-900">
                  Sửa
                </button>
                <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900">
                  Xóa
                </button>
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

definePageMeta({
  layout: 'admin'
})

const filters = ref({
  role: '',
  search: ''
})

const users = ref([])
const stats = ref([
  { title: 'Tổng người dùng', value: 0 },
  { title: 'Người bán', value: 0 },
  { title: 'Người mua', value: 0 },
  { title: 'Quản trị viên', value: 0 }
])

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  const res = await fetch('http://localhost:3001/users', {
    headers: { Authorization: `Bearer ${token}` }
  })
  users.value = await res.json()

  stats.value[0].value = users.value.length
  stats.value[1].value = users.value.filter(u => u.role === 'Seller').length
  stats.value[2].value = users.value.filter(u => u.role === 'User').length
  stats.value[3].value = users.value.filter(u => u.role === 'Admin').length
})

const filteredUsers = computed(() =>
  users.value.filter(u => {
    const roleOk = !filters.value.role || u.role === filters.value.role
    const searchOk =
      !filters.value.search ||
      u.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      u.email.toLowerCase().includes(filters.value.search.toLowerCase())
    return roleOk && searchOk
  })
)

const getRoleBadge = (role) => {
  const map = {
    User: 'bg-blue-100 text-blue-800',
    Seller: 'bg-green-100 text-green-800',
    Admin: 'bg-purple-100 text-purple-800'
  }
  return map[role] || 'bg-gray-100 text-gray-800'
}

const getRoleText = (role) => {
  const map = {
    User: 'Người mua',
    Seller: 'Người bán',
    Admin: 'Quản trị viên'
  }
  return map[role] || role
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

const resetFilters = () => {
  filters.value = { role: '', search: '' }
}

const editUser = (id) => alert(`Sửa người dùng ID ${id}`)
const deleteUser = (id) => confirm(`Xóa người dùng ID ${id}?`)
</script>
