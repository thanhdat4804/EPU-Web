// composables/useFavorite.ts
import { ref, watchEffect } from 'vue'
import { useCsrf } from '~/composables/useCsrf'
import { useRouter } from 'vue-router'

export const useFavorite = (auctionId: string | number | Ref<string | number | null>) => {
  const router = useRouter()
  const { csrfToken, fetchCsrf } = useCsrf()

  const loading = ref(false)
  const liked = ref(false)
  const favoriteCount = ref(0)

  const getJwt = () => localStorage.getItem('jwt') || ''

  // Kiểm tra đã thích chưa
  const checkFavorite = async (id: string | number) => {
    const jwt = getJwt()
    if (!jwt || !id) return false
    try {
      const res = await $fetch(`http://localhost:3001/favorites/check/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      return !!res.isFavorited
    } catch {
      return false
    }
  }

  // Load trạng thái + số lượng
  watchEffect(async () => {
    const id = typeof auctionId === 'object' ? auctionId.value : auctionId
    if (!id) return

    liked.value = await checkFavorite(id)
    try {
      const res = await $fetch(`http://localhost:3001/favorites/count/${id}`)
      favoriteCount.value = res.count ?? 0
    } catch {
      favoriteCount.value = 0
    }
  })

  const ensureCsrf = async () => {
    if (!csrfToken.value) await fetchCsrf()
  }

  const handleFavorite = async () => {
    const id = typeof auctionId === 'object' ? auctionId.value : auctionId
    if (!id || loading.value) return

    const jwt = getJwt()
    if (!jwt) {
      localStorage.setItem('pendingFavorite', String(id))
      localStorage.setItem('redirectAfterLogin', location.pathname)
      return router.push('/auth/login')
    }

    loading.value = true
    try {
      await ensureCsrf()

      if (liked.value) {
        await $fetch(`http://localhost:3001/favorites/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'X-CSRF-Token': csrfToken.value
          }
        })
        favoriteCount.value--
      } else {
        await $fetch('http://localhost:3001/favorites', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
            'X-CSRF-Token': csrfToken.value
          },
          body: { auctionId: id }
        })
        favoriteCount.value++
      }
      liked.value = !liked.value
    } catch (err: any) {
      console.error('Favorite failed:', err)
      if (err.status === 401) {
        localStorage.removeItem('jwt')
        router.push('/auth/login')
      }
    } finally {
      loading.value = false
    }
  }

  return {
    liked,
    favoriteCount,
    loading,
    handleFavorite
  }
}