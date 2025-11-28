// composables/useFavorite.js – CHỈ GIỮ CÁI NÀY THÔI (NHẸ NHƯ LÔNG HỒNG)
import { ref, readonly } from 'vue'

export function useFavorite() {
  const loading = ref(false)
  const getJwt = () => localStorage.getItem('jwt') || ''

  const isFavorited = async (auctionId) => {
    if (!auctionId || !getJwt()) return false
    try {
      const res = await $fetch(`http://localhost:3001/favorites/check/${auctionId}`, {
        headers: { Authorization: `Bearer ${getJwt()}` }
      })
      return !!res.isFavorited
    } catch {
      return false
    }
  }

  return { isFavorited, loading: readonly(loading) }
}