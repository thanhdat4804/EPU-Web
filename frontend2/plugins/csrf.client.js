// plugins/csrf.client.js
import { useCsrf } from '~/composables/useCsrf'

export default defineNuxtPlugin(async () => {
  const { fetchCsrf } = useCsrf()
  try {
    await fetchCsrf()
    // console.log('CSRF token pre-fetched')
  } catch (err) {
    // ignore - component có thể fetch lại nếu cần
  }
})
