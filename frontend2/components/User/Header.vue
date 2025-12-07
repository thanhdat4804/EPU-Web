<template>
  <header class="bg-white sticky top-0 z-50 shadow-md border-b-2 border-blue-100">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
      <!-- Logo -->
      <NuxtLink to="/auction" class="flex items-center select-none">
        <img
          src="/public/logo.jpg"
          alt="BidDora - Đấu giá trực tuyến"
          class="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-110"
        />
      </NuxtLink>

      <!-- Thanh tìm kiếm – giữ nguyên -->
      <div class="flex-1 max-w-md mx-8">
        <div class="relative">
          <input
            v-model="search"
            @input="handleSearch"
            @focus="searchResults = []"
            type="text"
            placeholder="Tìm kiếm vật phẩm đấu giá..."
            class="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-300 text-sm font-medium text-gray-800 placeholder:text-gray-500 placeholder:font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition-all duration-200"
          />
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Right side: icons + user -->
      <div class="flex items-center gap-6 text-sm font-medium relative">
        <!-- Tạo đấu giá -->
        <NuxtLink to="/auction/create" class="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full hover:bg-blue-100 hover:border-2 hover:border-blue-400 transition-all duration-200 group shadow-sm">
          <svg class="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </NuxtLink>

        <!-- My Auction -->
        <NuxtLink to="/user/my_auction" class="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full hover:bg-blue-100 hover:border-2 hover:border-blue-400 transition-all duration-200 group shadow-sm">
          <svg class="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-6 0h6" />
          </svg>
        </NuxtLink>

        <!-- Notification Dropdown – GIỮ NGUYÊN SIÊU ĐẸP -->
        <div class="relative">
          <button @click="toggleNotifications" class="relative w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full hover:bg-blue-100 hover:border-2 hover:border-blue-400 transition-all duration-200 group shadow-sm">
            <svg class="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount"
                  class="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>

          <!-- Dropdown thông báo – giữ nguyên 100% đẹp như cũ -->
          <div v-if="showNotifications"
               class="absolute right-0 mt-3 w-96 lg:w-[480px] bg-white border border-gray-200 shadow-2xl overflow-hidden z-50">
            <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
              <h3 class="text-lg font-bold text-gray-900">Thông báo</h3>
              <button @click="markAllRead"
                      class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition">
                Đánh dấu tất cả đã đọc
              </button>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div v-if="!notifications.length" class="text-center py-12 text-gray-500">
                <p class="text-lg">Chưa có thông báo nào</p>
              </div>
              <div v-for="notification in notifications" :key="notification.id"
                   @click.prevent="openNotification(notification)"
                   class="flex gap-5 px-6 py-5 hover:bg-blue-50 transition cursor-pointer border-b border-gray-100 last:border-0"
                   :class="{ 'bg-blue-50 font-semibold': !notification.isRead }">
                <div class="flex-shrink-0">
                  <img :src="getNotificationImage(notification.image)"
                       class="w-14 h-14 object-cover shadow-md"
                       alt="Thông báo" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate text-base">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
                  <p class="text-xs text-gray-400 mt-2">{{ formatDate(notification.createdAt) }}</p>
                </div>
                <div v-if="!notification.read" class="self-start mt-1">
                  <span class="w-3 h-3 bg-red-500 shadow-lg"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- USER – CHỈ DÙNG JWT → TỰ LẤY USER -->
        <template v-if="!user">
          <NuxtLink to="/auth/login" class="text-gray-700 hover:text-blue-600 font-medium">Đăng nhập</NuxtLink>
          <NuxtLink to="/auth/register" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition">
            Đăng ký
          </NuxtLink>
        </template>

        <template v-else>
          <div class="relative group">
            <div @click="goToProfile"
                 class="flex items-center gap-3 cursor-pointer py-2 px-4 hover:bg-blue-50 rounded-xl transition-all duration-200 select-none">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="font-semibold text-gray-800">{{ user.name }}</span>
              <svg class="w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:rotate-180"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Dropdown – có đăng xuất -->
            <div class="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-200 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <NuxtLink to="/user/profile"
                        class="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-700 hover:bg-blue-50 transition">
                Trang cá nhân
              </NuxtLink>
              <button @click="logout"
                      class="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition text-left">
                Đăng xuất
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCsrf } from '~/composables/useCsrf'

const router = useRouter()
const { csrfToken, fetchCsrf } = useCsrf()

// Notification – giữ nguyên siêu đẹp
const showNotifications = ref(false)
const notifications = ref<any[]>([])
const unreadCount = ref(0)

// User – chỉ dùng jwt
const user = ref<any>(null)

// Tìm kiếm – giữ nguyên
const search = ref('')
const searchResults = ref<any[]>([])

// ==================== LẤY USER TỪ JWT ====================
onMounted(async () => {
  await loadUserFromJwt()
  if (user.value) {
    fetchNotifications()
  }
})

const loadUserFromJwt = async () => {
  const jwt = localStorage.getItem('jwt')
  if (!jwt) return

  try {
    const userData = await $fetch('http://localhost:3001/users/me', {
      headers: { Authorization: `Bearer ${jwt}` },
      credentials: 'include'
    })
    user.value = userData
  } catch (err) {
    console.warn('JWT không hợp lệ → tự động đăng xuất')
    logout()
  }
}

// ==================== ĐĂNG XUẤT ====================
const logout = () => {
  localStorage.removeItem('jwt')
  user.value = null
  router.push('/auth/login')
}

// ==================== NOTIFICATION – GIỮ NGUYÊN LOGIC CŨ ====================
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && user.value) fetchNotifications()
}

const fetchNotifications = async () => {
  if (!user.value) return
  try {
    const res = await $fetch(`http://localhost:3001/notifications/${user.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
    })
    notifications.value = res || []
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  } catch (err) {
    console.error('Lỗi tải thông báo:', err)
    notifications.value = []
    unreadCount.value = 0
  }
}

const openNotification = async (notification: any) => {
  if (!notification.isRead) {
    try {
      await authFetch(`http://localhost:3001/notifications/read/${notification.id}`, { method: 'PATCH' })
      notification.isRead = true
      unreadCount.value--
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err)
    }
  }
  showNotifications.value = false
  router.push(notification.link)
}

const markAllRead = async () => {
  if (!user.value) return
  try {
    await authFetch(`http://localhost:3001/notifications/read-all/${user.value.id}`, { method: 'PATCH' })
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (err) {
    console.error('Lỗi đánh dấu tất cả:', err)
  }
}

const getNotificationImage = (filename: string) => {
  if (!filename) return '/no-image.jpg'
  return `http://localhost:3001/uploads/${filename}`
}

const authFetch = async (url: string, options = {}) => {
  if (!process.client) return
  const token = localStorage.getItem('jwt')
  await fetchCsrf()
  return await $fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      'X-CSRF-Token': csrfToken.value,
      ...options.headers
    }
  })
}

// ==================== TÌM KIẾM – GIỮ NGUYÊN ====================
let timeout: any = null
const handleSearch = () => {
  clearTimeout(timeout)
  if (!search.value.trim()) {
    searchResults.value = []
    return
  }
  timeout = setTimeout(async () => {
    try {
      const res = await $fetch(`http://localhost:3001/items/search/by-name?name=${encodeURIComponent(search.value)}`)
      searchResults.value = Array.isArray(res) ? res : []
    } catch (err) {
      searchResults.value = []
    }
  }, 300)
}

const goToItem = (id: number) => {
  search.value = ''
  searchResults.value = []
  router.push(`/auction/${id}`)
}

// ==================== KHÁC ====================
const goToProfile = () => router.push('/user/profile')
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>