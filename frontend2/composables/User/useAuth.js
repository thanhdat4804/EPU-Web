// ~/composables/useAuth.ts
import { useState, useNuxtApp } from '#app'

export const useAuth = () => {
  const user = useState('user', () => null)
  const { $fetch } = useNuxtApp()

  // 🟢 Gọi sau khi đăng nhập thành công
  const login = async (token) => {
    localStorage.setItem('jwt', token)
    try {
      const userData = await $fetch('http://localhost:3001/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      console.error('Lỗi lấy user:', err)
      user.value = null
    }
  }

  // 🟡 Dùng khi reload trang
  const loadUserFromStorage = async () => {
    const token = localStorage.getItem('jwt')
    if (!token) return
    try {
      const userData = await $fetch('http://localhost:3001/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      user.value = userData
    } catch {
      localStorage.removeItem('jwt')
      user.value = null
    }
  }

  // 🔴 Đăng xuất
  const logout = () => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
    user.value = null
    window.location.reload()
  }

  return { user, login, logout, loadUserFromStorage }
}
