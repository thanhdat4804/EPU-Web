<template>
  <!-- GIỮ NGUYÊN TEMPLATE ĐẸP NHƯ CŨ -->
  <div class="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100">
    <NuxtLink :to="`/auction/${auction.contractAddress}`" class="block">
      <!-- Ảnh + badge + nội dung giữ nguyên -->
      <div class="aspect-square bg-gray-50 overflow-hidden relative">
        <img :src="getImageUrl(auction.item?.mainImage, auction.item?.imageUrl)" :alt="auction.item?.name"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div class="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm z-10"
          :class="auction.status === 'Active' ? 'bg-emerald-500/95 text-white' : 'bg-gray-700/95 text-white'">
          {{ auction.status === 'Active' ? 'Đang diễn ra' : 'Đã kết thúc' }}
        </div>
      </div>
      <div class="p-4 space-y-3">
        <h3 class="font-bold text-gray-900 line-clamp-2 text-base leading-tight">
          {{ auction.item?.name || 'Đang tải...' }}
        </h3>
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <i class="fa-brands fa-ethereum text-indigo-600 text-lg"></i>
              <span class="text-2xl font-bold text-indigo-600">
                {{ formatPrice(auction.item?.startingPrice || 0) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Giá khởi điểm</p>
          </div>
          <div v-if="auction.status === 'Active'" class="text-right">
            <p class="text-xs text-gray-500">Còn lại</p>
            <p class="font-mono text-lg font-bold text-emerald-600">{{ timeLeft }}</p>
          </div>
        </div>
      </div>
    </NuxtLink>

    <!-- NÚT TIM -->
    <button
      v-if="auction.id"
      @click.stop="handleFavorite"
      :disabled="loading"
      class="absolute top-3 right-3 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center border-2 border-white/60 transition-all duration-300 z-50 hover:scale-125"
      :class="{
        'text-red-500 ring-4 ring-red-500/30 shadow-red-500/30': liked,
        'text-gray-400 hover:text-red-500 hover:shadow-lg': !liked && !loading,
        'opacity-70 cursor-not-allowed': loading
      }"
    >
      <svg v-if="!liked && !loading" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <svg v-else-if="liked" class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <div v-else class="w-6 h-6 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </button>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useCsrf } from '~/composables/useCsrf'

const props = defineProps({
  auction: { type: Object, required: true }
})

// DÙNG useCsrf TRỰC TIẾP TRONG COMPONENT – GIỐNG HỆT TRANG LOGIN
const { csrfToken, fetchCsrf } = useCsrf()

const loading = ref(false)
const liked = ref(false)

// LẤY JWT
const getJwt = () => localStorage.getItem('jwt') || ''

// Kiểm tra đã yêu thích chưa
const isFavorited = async (auctionId) => {
  const jwt = getJwt()
  if (!jwt || !auctionId) return false
  try {
    const res = await $fetch(`http://localhost:3001/favorites/check/${auctionId}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    return !!res.isFavorited
  } catch (err) {
    console.warn('Check favorite failed:', err)
    return false
  }
}

watchEffect(async () => {
  if (props.auction?.id) {
    liked.value = await isFavorited(props.auction.id)
  }
})

// ĐẢM BẢO CSRF CÓ TRƯỚC KHI GỌI
const ensureCsrf = async () => {
  if (!csrfToken.value) {
    await fetchCsrf()
  }
}

// XỬ LÝ BẤM TIM – ĐÃ THÊM ĐẦY ĐỦ Authorization + X-CSRF-Token
const handleFavorite = async () => {
  if (!props.auction?.id || loading.value) return

  const jwt = getJwt()
  if (!jwt) {
    localStorage.setItem('pendingFavorite', String(props.auction.id))
    localStorage.setItem('redirectAfterLogin', location.pathname)
    navigateTo('/login')
    return
  }

  loading.value = true
  try {
    await ensureCsrf() // Đảm bảo có CSRF token

    if (liked.value) {
      // XÓA YÊU THÍCH
      await $fetch(`http://localhost:3001/favorites/${props.auction.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${jwt}`,     // ĐÃ THÊM
          'X-CSRF-Token': csrfToken.value    // ĐÃ CÓ
        }
      })
      liked.value = false
    } else {
      // THÊM YÊU THÍCH
      await $fetch('http://localhost:3001/favorites', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,     // ĐÃ THÊM
          'X-CSRF-Token': csrfToken.value    // ĐÃ CÓ
        },
        body: { auctionId: props.auction.id }
      })
      liked.value = true
    }
  } catch (err) {
    console.error('Favorite failed:', err)
    // Nếu token hết hạn hoặc không hợp lệ → redirect login
    if (err.status === 401) {
      localStorage.removeItem('jwt')
      localStorage.setItem('pendingFavorite', String(props.auction.id))
      localStorage.setItem('redirectAfterLogin', location.pathname)
      navigateTo('/login')
    }
  } finally {
    loading.value = false
  }
}

// Helper functions (giữ nguyên)
const getImageUrl = (mainImage, imageUrl) => {
  if (imageUrl) return imageUrl
  if (mainImage) return `http://localhost:3001/uploads/${mainImage}`
  return '/no-image.jpg'
}

const formatPrice = (price) => {
  if (!price) return '—'
  return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETH'
}

const timeLeft = computed(() => {
  if (props.auction?.status !== 'Active') return ''
  const diff = new Date(props.auction.endTime) - Date.now()
  if (diff <= 0) return 'Hết giờ'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`
})
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