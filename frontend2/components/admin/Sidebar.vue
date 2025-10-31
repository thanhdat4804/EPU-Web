<template>
  <aside class="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 text-white">
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 border-b border-gray-700 px-4">
      <h1 class="text-xl font-bold">Quản lý Admin</h1>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
      <!-- Dashboard -->
      <NuxtLink
        to="/admin"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive('/admin') && !isActive('/admin/', true) 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-gray-800'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-sm font-medium">Dashboard</span>
      </NuxtLink>

      <!-- Đấu giá -->
      <div>
        <button
          @click="toggleGroup('auction')"
          class="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <span class="text-sm font-medium">Đấu giá</span>
          </div>
          <svg
            :class="['w-4 h-4 transition-transform', openGroups.auction ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div
          :class="[
            'overflow-hidden transition-all duration-300',
            openGroups.auction ? 'max-h-40 mt-1' : 'max-h-0'
          ]"
        >
          <div class="ml-8 space-y-1">
            <NuxtLink
              to="/admin/auction"
              :class="getSubItemClass('/admin/auction')"
            >
              Phiên đấu giá
            </NuxtLink>
            <NuxtLink
              to="/admin/lots"
              :class="getSubItemClass('/admin/lots')"
            >
              Lots đấu giá
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Người dùng -->
      <div>
        <button
          @click="toggleGroup('users')"
          class="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="text-sm font-medium">Người dùng</span>
          </div>
          <svg
            :class="['w-4 h-4 transition-transform', openGroups.users ? 'rotate-180' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div
          :class="[
            'overflow-hidden transition-all duration-300',
            openGroups.users ? 'max-h-60 mt-1' : 'max-h-0'
          ]"
        >
          <div class="ml-8 space-y-1">
            <NuxtLink
              to="/admin/users"
              :class="getSubItemClass('/admin/users')"
            >
              Danh sách
            </NuxtLink>
            <NuxtLink
              to="/admin/sellers"
              :class="getSubItemClass('/admin/sellers')"
            >
              Người bán
            </NuxtLink>
            <NuxtLink
              to="/admin/experts"
              :class="getSubItemClass('/admin/experts')"
            >
              Chuyên gia
            </NuxtLink>
            <NuxtLink
              to="/admin/users/create"
              :class="getSubItemClass('/admin/users/create')"
            >
              Thêm người dùng
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Thanh toán -->
      <NuxtLink
        to="/admin/payments"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive('/admin/payments')
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span class="text-sm font-medium">Thanh toán</span>
      </NuxtLink>

      <!-- Báo cáo -->
      <NuxtLink
        to="/admin/reports"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive('/admin/reports')
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-sm font-medium">Báo cáo</span>
      </NuxtLink>

      <!-- Hỗ trợ -->
      <NuxtLink
        to="/admin/support"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive('/admin/support')
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span class="text-sm font-medium">Hỗ trợ</span>
      </NuxtLink>

      <!-- Cài đặt -->
      <NuxtLink
        to="/admin/settings"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive('/admin/settings')
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-sm font-medium">Cài đặt</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const openGroups = ref({
  auction: false,
  users: false
})

const toggleGroup = (group) => {
  openGroups.value[group] = !openGroups.value[group]
}

const isActive = (path, exact = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const getSubItemClass = (path) => {
  return [
    'block px-4 py-2 text-sm rounded-lg transition-colors',
    isActive(path)
      ? 'bg-blue-600 text-white'
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
  ]
}
</script>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>