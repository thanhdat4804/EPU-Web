// composables/useApi.js
import { useCsrf } from './useCsrf'

export const useApi = () => {
  const { csrf, fetchCsrf } = useCsrf()

  const ensureToken = async () => {
    if (!csrf.value) {
      await fetchCsrf()
    }
  }

  const post = async (url, body) => {
    await ensureToken()
    return await $fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.value
      },
      body
    })
  }

  const put = async (url, body) => {
    await ensureToken()
    return await $fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.value
      },
      body
    })
  }

  const del = async (url) => {
    await ensureToken()
    return await $fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf.value }
    })
  }

  return { post, put, del, csrf }
}
