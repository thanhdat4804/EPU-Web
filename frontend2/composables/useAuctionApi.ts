// composables/useAuctionApi.ts
import { $fetch } from 'ofetch'

const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  // 🟢 Lấy danh sách đấu giá
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

  // 🟢 Tạo đấu giá mới (vẫn do backend deploy)
  const createAuction = async (auctionData: any): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: auctionData,
    })
  }

  // ⚡ Ghi nhận đặt giá (sau khi MetaMask placeBid xong)
  const recordBid = async (address: string, amount: number, txHash: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/record-bid`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount, txHash },
    })
  }

  // ⚡ Ghi nhận thanh toán người thắng (sau khi MetaMask pay xong)
  const recordPayment = async (address: string, txHash: string): Promise<any> => {
    const token = localStorage.getItem('jwt')
    if (!token) throw new Error('User not logged in')

    return await $fetch(`${API_BASE}/${address}/record-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { txHash },
    })
  }

  // 🟢 Buyer xác nhận đã nhận hàng
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

  // 🟢 Seller hoàn tiền cho buyer
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

  // 🟢 Phạt người thắng không thanh toán
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
    recordBid,
    recordPayment,
    confirmReceived,
    openDispute,
    refundBuyer,
    withdrawDeposit,
    penalizeWinner,
  }
}
