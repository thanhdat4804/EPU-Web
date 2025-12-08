// plugins/csrf.client.js
import { useCsrf } from '@/composables/useCsrf'

export default defineNuxtPlugin(async () => {
  const { fetchCsrf, csrfToken } = useCsrf()

  try {
    await fetchCsrf()
  } catch (err) {
    console.warn('CSRF fetch failed at startup:', err)
  }

  // CUNG CẤP TOÀN CỤC: FUNCTION → $csrfToken()
  return {
    provide: {
      csrfToken: () => csrfToken.value, // FUNCTION
      setCsrfToken: (token) => {
        csrfToken.value = token
      },
    },
  }
})