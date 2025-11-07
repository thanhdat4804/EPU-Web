import { ref } from 'vue'
import { ethers } from 'ethers'

export const useWallet = () => {
  // dùng useState để đồng bộ giữa các trang
  const walletAddress = useState('walletAddress', () => null)
  const isConnecting = ref(false)

  // 🟢 Kết nối Metamask
  const connectMetamask = async (userId) => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('❌ Bạn cần cài đặt MetaMask để tiếp tục.')
        return
      }

      isConnecting.value = true

      // ethers v5 ✅
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      walletAddress.value = address
      localStorage.setItem('walletAddress', address)

      console.log('✅ Đã kết nối MetaMask:', address)

      // Gọi API backend để liên kết ví với user
      await $fetch('http://localhost:3001/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, wallet: address }), // ✅ thêm JSON.stringify để tránh lỗi body object
      })

      return address
    } catch (err) {
      console.error('❌ Lỗi khi kết nối MetaMask:', err)
      alert('Không thể kết nối MetaMask. Vui lòng thử lại.')
    } finally {
      isConnecting.value = false
    }
  }

  // 🟣 Lấy ví đã lưu từ backend
  const fetchWallet = async (userId) => {
    try {
      const res = await $fetch(`http://localhost:3001/wallet/${userId}`)
      if (res?.wallet) {
        walletAddress.value = res.wallet
        localStorage.setItem('walletAddress', res.wallet)
      } else {
        console.warn('⚠️ Người dùng chưa liên kết ví.')
      }
    } catch (err) {
      console.warn('⚠️ Không thể lấy ví người dùng:', err)
    }
  }

  return { walletAddress, connectMetamask, fetchWallet, isConnecting }
}
