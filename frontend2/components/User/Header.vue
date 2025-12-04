<template>
  <header class="bg-white sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

      <!-- Logo -->
      <NuxtLink to="/auction" class="text-3xl font-bold text-blue-600 select-none">
        BidDora
      </NuxtLink>

      <!-- Thanh tìm kiếm -->
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

        <!-- Dropdown kết quả tìm kiếm -->
        <div v-if="searchResults.length && search.trim()"
             class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg max-h-80 overflow-y-auto z-50 rounded-lg">
          <div v-for="item in searchResults" :key="item.id"
               @click="goToItem(item.id)"
               class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition rounded">
            <img :src="item.imageUrl || '/no-image.jpg'" class="w-12 h-12 object-cover rounded" alt="">
            <div>
              <p class="font-medium text-gray-900 truncate">{{ item.name }}</p>
              <p class="text-sm text-gray-500">{{ formatPrice(item.currentPrice || item.startingPrice) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Nút + User -->
      <div class="flex items-center gap-8 text-sm font-medium">

        <NuxtLink to="/auction/create" class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Đấu giá nào</span>
        </NuxtLink>

        <NuxtLink to="/user/my_auction" class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-6 0h6" />
          </svg>
          <span>Đấu giá của tôi</span>
        </NuxtLink>

        <!-- Chưa đăng nhập -->
        <template v-if="!user">
          <NuxtLink to="/auth/login" class="text-gray-700 hover:text-blue-600">Đăng nhập</NuxtLink>
          <NuxtLink to="/auth/register" class="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 transition rounded-md">
            Đăng ký
          </NuxtLink>
        </template>

        <!-- ĐÃ ĐĂNG NHẬP – FULL Dropdown Settings + Logout -->
        <template v-else>
          <div class="relative group">
            <!-- Click vào đây → vào Profile -->
            <div @click="goToProfile"
                 class="flex items-center gap-2.5 cursor-pointer py-2 px-3 hover:bg-gray-100 transition rounded-lg select-none">
              <div class="w-9 h-9 bg-blue-100 rounded flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="font-medium text-gray-800">{{ user.name }}</span>
              <svg class="w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:rotate-180"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Dropdown khi hover -->
            <div class="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-lg 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                            transition-all duration-300 origin-top-right scale-95 group-hover:scale-100 z-50">
              
              <!-- Trang cá nhân -->
              <NuxtLink to="/user/profile" class="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Trang cá nhân</span>
              </NuxtLink>

              <!-- Cài đặt -->
              <NuxtLink to="/user/settings" class="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Cài đặt</span>
              </NuxtLink>

              <div class="h-px bg-gray-200 mx-4"></div>

              <!-- Đăng xuất -->
              <button @click="logout"
                      class="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWallet } from '~/composables/useWallet'

const router = useRouter()
const route = useRoute()
const search = ref('')
const searchResults = ref([])
const user = ref(null)
let timeout = null

const { walletAddress, connectMetamask, fetchWallet } = useWallet()

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return
  try {
    const userData = await $fetch('http://localhost:3001/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    await fetchWallet(userData.id)
  } catch (err) {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
  }
})

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

const goToItem = (id) => {
  search.value = ''
  searchResults.value = []
  router.push(`/auction/${id}`)
}

const goToProfile = () => {
  router.push('/user/profile')
}

const logout = () => {
  localStorage.removeItem('jwt')
  localStorage.removeItem('user')
  user.value = null
  walletAddress.value = null
  window.location.reload()
}

const formatPrice = (price) => {
  if (!price) return '—'
  return `${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`
}
</script>