// composables/useUserAddress.ts
import { ref } from 'vue'

const API_BASE = 'http://localhost:3001/user-addresses'

export function useUserAddress() {
  const addresses = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // LẤY JWT + CSRF
  const getJwt = () => localStorage.getItem('jwt') || ''
  const { csrfToken, fetchCsrf } = useCsrf?.() || { csrfToken: ref(''), fetchCsrf: async () => {} }

  const getHeaders = () => {
    const jwt = getJwt()
    const headers: Record<string, string> = {}
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`
    if (csrfToken.value) headers['X-CSRF-Token'] = csrfToken.value
    headers['Content-Type'] = 'application/json'
    return headers
  }

  // 1. LẤY TẤT CẢ ĐỊA CHỈ
  const getAddresses = async () => {
    loading.value = true
    error.value = null
    try {
      await fetchCsrf()
      const res = await $fetch(API_BASE, {
        headers: getHeaders(),
        credentials: 'include'
      })
      addresses.value = Array.isArray(res) ? res : []
    } catch (err: any) {
      error.value = err.message || 'Lỗi tải địa chỉ'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 2. THÊM ĐỊA CHỈ MỚI
  const createAddress = async (data: {
    recipientName: string
    phone: string
    addressLine: string
    ward?: string
    district: string
    city: string
    country?: string
    isDefault?: boolean
  }) => {
    loading.value = true
    error.value = null
    try {
      await fetchCsrf()
      const res = await $fetch(API_BASE, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: data
      })
      addresses.value = [res, ...addresses.value]
      return res
    } catch (err: any) {
      error.value = err.data?.message || 'Lỗi thêm địa chỉ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 3. SỬA ĐỊA CHỈ
  const updateAddress = async (id: number, data: Partial<{
    recipientName: string
    phone: string
    addressLine: string
    ward?: string
    district: string
    city: string
    country?: string
    isDefault?: boolean
  }>) => {
    loading.value = true
    error.value = null
    try {
      await fetchCsrf()
      const res = await $fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
        body: data
      })
      addresses.value = addresses.value.map(a => a.id === id ? res : a)
      return res
    } catch (err: any) {
      error.value = err.data?.message || 'Lỗi sửa địa chỉ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. XÓA ĐỊA CHỈ
  const deleteAddress = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await fetchCsrf()
      await $fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      })
      addresses.value = addresses.value.filter(a => a.id !== id)
    } catch (err: any) {
      error.value = err.data?.message || 'Lỗi xóa địa chỉ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 5. ĐẶT LÀM MẶC ĐỊNH
  const setDefaultAddress = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await fetchCsrf()
      await $fetch(`${API_BASE}/${id}/default`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      })
      // Cập nhật UI
      addresses.value = addresses.value.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    } catch (err: any) {
      error.value = err.data?.message || 'Lỗi đặt mặc định'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    addresses,
    loading,
    error,

    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}