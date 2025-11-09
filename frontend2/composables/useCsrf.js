export const useCsrf = () => {
  const csrfToken = useState('csrfToken', () => '')

  const fetchCsrf = async () => {
    const res = await $fetch('http://localhost:3001/auth/csrf-token', {
      credentials: 'include',
    })
    csrfToken.value = res.csrfToken
  }

  return { csrfToken, fetchCsrf }
}
