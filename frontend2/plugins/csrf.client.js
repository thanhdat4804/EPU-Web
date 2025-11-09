// plugins/csrf.client.ts
import { useCsrf } from '~/composables/useCsrf'

export default defineNuxtPlugin(async () => {
  const { fetchCsrf } = useCsrf()
  try {
    await fetchCsrf()
    // console.log('✅ CSRF token fetched once at client startup')
  } catch (err) {
    console.warn('⚠️ CSRF token fetch failed (will retry later if needed)', err)
  }
})
