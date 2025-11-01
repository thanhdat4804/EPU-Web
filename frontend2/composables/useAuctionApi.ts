import { $fetch } from 'ofetch'

const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  // 🟢 Lấy tất cả đấu giá
  const getAuctions = async (): Promise<any[]> => {
    return await $fetch(`${API_BASE}/list`)
  }

  // 🟢 Lấy chi tiết 1 đấu giá
  const getAuctionDetail = async (address: string): Promise<any> => {
    return await $fetch(`${API_BASE}/${address}/detail`)
  }

  // 🟢 Lấy danh sách bid của 1 đấu giá
  const getAllBids = async (address: string): Promise<any[]> => {
    return await $fetch(`${API_BASE}/${address}/bids`)
  }

  // 🟢 Tạo đấu giá mới
  const createAuction = async (auctionData: any): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: auctionData,
    })
  }

  // 🟢 Đặt giá (gửi deposit)
  const placeBid = async (address: string, amount: number, deposit: number): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/bid`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount, deposit },
    })
  }

  // 🟢 Thanh toán phần còn lại (winner)
  const payWinningBid = async (address: string, amount: number): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount },
    })
  }

  // 🟢 Xác nhận đã nhận hàng
  const confirmReceived = async (address: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // 🟢 Mở tranh chấp
  const openDispute = async (address: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/dispute`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // 🟢 Seller hoàn tiền cho buyer khi tranh chấp thắng
  const refundBuyer = async (address: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // 🟢 Người thua rút tiền cọc
  const withdrawDeposit = async (address: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/withdraw`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // 🟢 Phạt người thắng nếu không thanh toán sau 24h
  const penalizeWinner = async (address: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/penalize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  return {
    getAuctions,
    getAuctionDetail,
    getAllBids,
    createAuction,
    placeBid,
    payWinningBid,
    confirmReceived,
    openDispute,
    refundBuyer,
    withdrawDeposit,
    penalizeWinner,
  }
}
