export const useAuth = () => {
  const user = useState('user', () => null)

  const login = (userData) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
  }

  return { user, login, logout }
}
