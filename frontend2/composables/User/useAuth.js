import { useState } from '#app'

export const useAuth = () => {
  const user = useState('user', () => null)

  const login = async (token) => {
    localStorage.setItem('jwt', token)

    try {
      const userData = await $fetch('http://localhost:3001/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      user.value = userData
    } catch (err) {
      console.error('Lỗi khi lấy user:', err)
      user.value = null
    }
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    user.value = null
  }

  const loadUserFromStorage = async () => {
    const token = localStorage.getItem('jwt')
    if (!token) return

    try {
      const userData = await $fetch('http://localhost:3001/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      user.value = userData
    } catch (err) {
      console.error('Token không hợp lệ:', err)
      localStorage.removeItem('jwt')
    }
  }

  return { user, login, logout, loadUserFromStorage }
}
