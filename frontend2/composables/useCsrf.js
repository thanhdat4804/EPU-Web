// composables/useCsrf.js
export const useCsrf = () => {
  const csrfToken = useState('csrfToken', () => '')

  const fetchCsrf = async () => {
    try {
      const res = await $fetch('http://localhost:3001/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
      })
      csrfToken.value = res.csrfToken
      console.log('CSRF Token fetched:', csrfToken.value)
    } catch (error) {
      console.error('Lỗi fetch CSRF:', error)
      throw error
    }
  }

  return { csrfToken, fetchCsrf }
}