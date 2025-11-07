<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="flex items-center justify-between px-8 py-4 relative">
      <!-- Logo -->
      <NuxtLink to="/auction" class="text-2xl font-bold text-blue-600 select-none">
        BidDora
      </NuxtLink>

      <!-- Thanh tìm kiếm -->
      <div class="flex-1 flex justify-center relative">
        <div class="relative w-full max-w-lg transition-all duration-300">
          <input
            v-model="search"
            type="text"
            placeholder="Tìm kiếm vật phẩm đấu giá..."
            class="w-full border border-gray-300 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            @input="handleSearch"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z"
            />
          </svg>

          <!-- Dropdown kết quả tìm kiếm -->
          <div
            v-if="searchResults.length && search.trim()"
            class="absolute left-0 right-0 bg-white border rounded-lg shadow-md mt-2 z-50 max-h-64 overflow-y-auto"
          >
            <div
              v-for="item in searchResults"
              :key="item.id"
              @click="goToItem(item.id)"
              class="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
            >
              <img
                :src="item.imageUrl || '/no-image.jpg'"
                alt=""
                class="w-10 h-10 object-cover rounded"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-800 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-500 truncate">
                  {{ formatPrice(item.currentPrice || item.startingPrice) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Khu vực người dùng -->
      <div class="space-x-4 flex items-center">
        <!-- Nếu chưa đăng nhập -->
        <template v-if="!user">
          <NuxtLink
            to="/auth/login"
            class="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Đăng nhập
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
          >
            Đăng ký
          </NuxtLink>
        </template>

        <!-- Nếu đã đăng nhập -->
        <template v-else>
          <!-- 🦊 Nếu chưa có ví -->
          <button
            v-if="!walletAddress"
            @click="connectWallet"
            :disabled="isConnecting"
            class="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm hover:bg-yellow-600 transition disabled:opacity-60"
          >
            <span v-if="!isConnecting">🔗 Kết nối ví MetaMask</span>
            <span v-else>⏳ Đang kết nối...</span>
          </button>

          <!-- 🟢 Nếu đã có ví -->
          <div
            v-else
            class="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
          >
            🦊 {{ shortWallet(walletAddress) }}
          </div>

          <!-- 👤 Hồ sơ & đăng xuất -->
          <div
            @click="goToProfile"
            class="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition"
          >
            <i class="fas fa-user text-gray-600"></i>
            <span class="font-medium text-gray-800 text-sm">{{ user.name }}</span>
          </div>
          <button
            @click="logout"
            class="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Đăng xuất
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '~/composables/useWallet'

const router = useRouter()
const search = ref('')
const searchResults = ref([])
const user = ref(null)
let timeout = null

// 🦊 Wallet
const { walletAddress, connectMetamask, fetchWallet, isConnecting } = useWallet()

onMounted(async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return

  try {
    const userData = await $fetch('http://localhost:3001/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))

    // 🔹 Nếu user có ID -> kiểm tra xem ví đã liên kết chưa
    await fetchWallet(userData.id)
  } catch (err) {
    console.error('Không thể tải thông tin user:', err)
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
  }
})

const handleSearch = async () => {
  clearTimeout(timeout)
  if (!search.value.trim()) {
    searchResults.value = []
    return
  }

  timeout = setTimeout(async () => {
    try {
      const res = await $fetch(
        `http://localhost:3001/items?search=${encodeURIComponent(search.value)}`
      )
      searchResults.value = res
    } catch (err) {
      console.error('Lỗi khi tìm kiếm:', err)
      searchResults.value = []
    }
  }, 300)
}

// 🦊 Kết nối MetaMask
const connectWallet = async () => {
  if (!user.value) {
    alert('Vui lòng đăng nhập trước khi liên kết ví!')
    return
  }
  await connectMetamask(user.value.id)
}

// ✂️ Rút gọn địa chỉ ví
const shortWallet = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

const goToItem = (id) => {
  search.value = ''
  searchResults.value = []
  router.push(`/User/item/${id}`)
}

const goToProfile = () => {
  router.push('/User/profile')
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
  return `${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })} ETH`
}
</script>
