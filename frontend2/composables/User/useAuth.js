import { useState } from '#app'

export const useAuth = () => {
  const user = useState('user', () => null)

  const getUserInfo = async (token) => {
    try {
      const userData = await $fetch('http://localhost:3001/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      console.error('Lỗi khi lấy thông tin user:', err)
      user.value = null
      localStorage.removeItem('user')
    }
  }

  const login = async (email, password) => {
    try {
      const res = await $fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      const token = res?.access_token || res?.token
      if (!token) throw new Error('Không có token trả về')
      localStorage.setItem('jwt', token)
      await getUserInfo(token)
      return { ok: true }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err)
      return { ok: false, message: err?.data?.message || err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
    user.value = null
  }

  const loadUserFromStorage = async () => {
    const token = localStorage.getItem('jwt')
    if (!token) return
    await getUserInfo(token)
  }

  return { user, login, logout, loadUserFromStorage }
}
