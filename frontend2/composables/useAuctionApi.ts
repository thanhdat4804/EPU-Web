// composables/useAuctionApi.ts
import { $fetch } from 'ofetch'

const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  const { $csrfToken } = useNuxtApp()

  // 🧩 Lấy JWT token từ localStorage
  const getJwt = () => localStorage.getItem('jwt') || ''

  // 🧩 Sinh headers động (JWT + CSRF)
  const getHeaders = (isFormData = false) => {
    const headers: Record<string, string> = {}
    const jwt = getJwt()
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`

    const csrf = $csrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf

    if (!isFormData) headers['Content-Type'] = 'application/json'
    return headers
  }

  // ============================================================
  // 🟢 GET: Danh sách tất cả đấu giá
  // ============================================================
  const getAuctions = async () => {
    return await $fetch(`${API_BASE}/list`)
  }

  // ============================================================
  // 🟢 GET: Chi tiết 1 đấu giá (DB + Onchain)
  // ============================================================
  const getAuctionDetail = async (address: string) => {
    return await $fetch(`${API_BASE}/${address}/detail`)
  }

  // ============================================================
  // 🟢 GET: Danh sách người đặt giá (on-chain)
  // ============================================================
  const getAllBids = async (address: string): Promise<any[]> => {
  try {
    const res = await $fetch(`${API_BASE}/${address}/bids`, {
      headers: getHeaders(),
    })
    return Array.isArray(res) ? res : []
  } catch (error) {
    console.warn('getAllBids failed:', error)
    return [] // TRẢ MẢNG RỖNG → FRONTEND HIỆN "Chưa có ai đấu giá"
  }
}

  // ============================================================
  // 🟢 GET: Danh sách đấu giá mà user đã thắng
  // ============================================================
  const getMyWinningAuctions = async () => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')
    return await $fetch(`${API_BASE}/my-wins`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    })
  }

  // ============================================================
  // 🟡 POST: Tạo đấu giá mới (kèm ảnh chính + ảnh phụ)
  // ============================================================
  const createAuction = async (formData: FormData) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: formData,
    })
  }

  // ============================================================
  // 🟡 POST: Ghi nhận giao dịch đặt giá
  // ============================================================
  const recordBid = async (address: string, amount: number, txHash: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/record-bid`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: { amount, txHash },
    })
  }

  // ============================================================
  // 🟡 POST: Ghi nhận thanh toán
  // ============================================================
  const recordPayment = async (address: string, txHash: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/record-payment`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: { txHash },
    })
  }

  // ============================================================
  // 🟡 POST: Xác nhận người thắng đã nhận hàng
  // ============================================================
  const confirmReceived = async (address: string, txHash: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')
    return await $fetch(`${API_BASE}/${address}/confirm`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: { txHash },
    })
  }

  // ============================================================
  // 🟡 POST: Mở tranh chấp
  // ============================================================
  const openDispute = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/dispute`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  // ============================================================
  // 🟡 POST: Hoàn tiền cho người mua
  // ============================================================
  const refundBuyer = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/refund`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  // ============================================================
  // 🟡 POST: Rút cọc cho người thua
  // ============================================================
  const withdrawDeposit = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  // ============================================================
  // 🟡 POST: Phạt người thắng không thanh toán
  // ============================================================
  const penalizeWinner = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/penalize`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  return {
    getAuctions,
    getAuctionDetail,
    getAllBids,
    getMyWinningAuctions,
    createAuction,
    recordBid,
    recordPayment,
    confirmReceived,
    openDispute,
    refundBuyer,
    withdrawDeposit,
    penalizeWinner,
  }
}
