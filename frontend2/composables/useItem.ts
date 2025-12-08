// composables/useItem.ts
import { ref } from 'vue'

const API_BASE = 'http://localhost:3001/items'

export function useItem() {
  const { $csrfToken } = useNuxtApp()
  const loading = ref(false)

  // Lấy JWT từ localStorage
  const getJwt = () => localStorage.getItem('jwt') || ''

  // Sinh headers giống hệt useAuctionApi.ts
  const getHeaders = (isFormData = false) => {
    const headers: Record<string, string> = {}
    const jwt = getJwt()
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`

    const csrf = $csrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf

    if (!isFormData) headers['Content-Type'] = 'application/json'
    return headers
  }

  // USER: Tạo item mới (pending)
  const createItem = async (formData: FormData) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      return await $fetch(API_BASE, {
        method: 'POST',
        headers: getHeaders(true),
        credentials: 'include',
        body: formData,
      })
    } finally {
      loading.value = false
    }
  }

  // USER: Lấy danh sách item đã được duyệt (để tạo auction)
  const getApprovedItems = async () => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      return await $fetch(`${API_BASE}/approved`, {
        headers: getHeaders(),
        credentials: 'include',
      })
    } finally {
      loading.value = false
    }
  }

  // USER: Lấy tất cả item của tôi
  const getMyItems = async () => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      return await $fetch(`${API_BASE}/my`, {
        headers: getHeaders(),
        credentials: 'include',
      })
    } finally {
      loading.value = false
    }
  }

  // ADMIN: Lấy danh sách item đang chờ duyệt
  const getPendingItems = async () => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      return await $fetch(`${API_BASE}/pending`, {
        headers: getHeaders(),
        credentials: 'include',
      })
    } finally {
      loading.value = false
    }
  }

  // ADMIN: Duyệt item
  const approveItem = async (itemId: number) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      await $fetch(`${API_BASE}/${itemId}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
      })
      return true
    } catch (err) {
      console.error('Duyệt item thất bại:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ADMIN: Từ chối item
  const rejectItem = async (itemId: number, reason: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')

    loading.value = true
    try {
      await $fetch(`${API_BASE}/${itemId}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
        body: { reason }
      })
      return true
    } catch (err) {
      console.error('Từ chối item thất bại:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    createItem,
    getApprovedItems,
    getMyItems,
    getPendingItems,
    approveItem,
    rejectItem,
  }
}