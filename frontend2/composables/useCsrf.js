// composables/useCsrf.js
import { ref } from 'vue'

export const useCsrf = () => {
  const csrf = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchCsrf = async () => {
    loading.value = true
    error.value = null
    try {
      // Gọi backend /auth/csrf-token — nhớ backend phải enable CORS + credentials
      const res = await $fetch('http://localhost:3001/auth/csrf-token', {
        credentials: 'include'
      })
      csrf.value = res?.csrfToken || null
      return csrf.value
    } catch (err) {
      console.error('Lỗi lấy CSRF token:', err)
      error.value = err
      csrf.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return { csrf, fetchCsrf, loading, error }
}
