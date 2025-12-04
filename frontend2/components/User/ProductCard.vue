<template>
  <div class="relative bg-white overflow-hidden scale-110">
    <NuxtLink :to="`/auction/${auction.contractAddress}`" class="block">

      <!-- Ảnh -->
      <div class="aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          :src="getImageUrl(auction.item?.mainImage, auction.item?.imageUrl)"
          :alt="auction.item?.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Thông tin – sát mép, font Basis Grotesque mượt mà -->
      <div class="pt-3 pb-5 pr-4">
        <!-- Tên sản phẩm – nhỏ hơn, thanh thoát hơn -->
        <h3 class="text-sm leading-tight line-clamp-2 mb-1 text-gray-800" 
            style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 300;">
          {{ auction.item?.name || 'Đang tải...' }}
        </h3>

        <div class="mt-1.5">
          <!-- "Current bid" – nhỏ xíu, mỏng, đúng chuẩn Catawiki -->
          <p class="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5 leading-none" 
            style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 500;">
            Current bid
          </p>

          <!-- Giá tiền – nhỏ lại 1 tí nhưng vẫn nổi bật -->
          <p class="text-xl leading-none tracking-tight text-gray-900" 
            style="font-family: 'Basis Grotesque Pro', sans-serif; font-weight: 650;">
            {{ formatPrice(currentBid) }}
          </p>
        </div>
      </div>
    </NuxtLink>

    <!-- Nút tim -->
    <button
      @click.stop="handleFavorite"
      :disabled="loading"
      class="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center z-10 border border-gray-200 transition-transform hover:scale-110"
      :class="liked ? 'text-red-500' : 'text-gray-400'"
    >
      <svg v-if="!liked" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>

    <!-- LOAD FONT TRỰC TIẾP TRONG COMPONENT NÀY – 100% HOẠT ĐỘNG -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Basis+Grotesque+Pro:wght@300;400;500;700;800;850;900&display=swap"
    >
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useCsrf } from '~/composables/useCsrf'

const props = defineProps({
  auction: { type: Object, required: true }
})

// CSRF + Favorite logic
const { csrfToken, fetchCsrf } = useCsrf()
const loading = ref(false)
const liked = ref(false)

const getJwt = () => localStorage.getItem('jwt') || ''

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

const ensureCsrf = async () => {
  if (!csrfToken.value) await fetchCsrf()
}

const handleFavorite = async () => {
  if (!props.auction?.id || loading.value) return
  const jwt = getJwt()
  if (!jwt) {
    localStorage.setItem('pendingFavorite', String(props.auction.id))
    localStorage.setItem('redirectAfterLogin', location.pathname)
    return navigateTo('/auth/login')
  }

  loading.value = true
  try {
    await ensureCsrf()
    if (liked.value) {
      await $fetch(`http://localhost:3001/favorites/${props.auction.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'X-CSRF-Token': csrfToken.value
        }
      })
      liked.value = false
    } else {
      await $fetch('http://localhost:3001/favorites', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
          'X-CSRF-Token': csrfToken.value
        },
        body: { auctionId: props.auction.id }
      })
      liked.value = true
    }
  } catch (err) {
    console.error('Favorite failed:', err)
    if (err.status === 401) {
      localStorage.removeItem('jwt')
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Helper functions
const getImageUrl = (mainImage, imageUrl) => {
  if (imageUrl) return imageUrl
  if (mainImage) return `http://localhost:3001/uploads/${mainImage}`
  return '/no-image.jpg'
}

const currentBid = computed(() => {
  return props.auction.onchain?.highestBid ||
         props.auction.item?.currentPrice ||
         props.auction.item?.startingPrice || 0
})

const formatPrice = (price) => {
  if (!price || price == 0) return '0.00 ETH'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }) + ' ETH'
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