// composables/useAuctionApi.ts
import { $fetch } from 'ofetch'
import { useCsrf } from '~/composables/useCsrf'
const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  // LẤY CSRF TỪ PLUGIN (là function)
  const { $csrfToken } = useNuxtApp()

  // LẤY JWT TỪ localStorage
  const getJwt = () => localStorage.getItem('jwt') || ''

  // TẠO HEADERS ĐỘNG
  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    }

    const jwt = getJwt()
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`
    }

    // GỌI $csrfToken() → TRẢ VỀ STRING
    const csrf = $csrfToken()
    if (csrf) {
      headers['X-CSRF-Token'] = csrf
    }

    return headers
  }
  const getAuctions = async () => {
    return await $fetch(`${API_BASE}/list`)
  }

  const getAuctionDetail = async (address: string) => {
    return await $fetch(`${API_BASE}/${address}/detail`)
  }

  const getMyWinningAuctions = async () => {
    const jwt = getJwt()
    if (!jwt) throw new Error('Bạn chưa đăng nhập')
    return await $fetch(`${API_BASE}/my-wins`, {
      method: 'GET',
      headers: getHeaders(),
    })
  }

  const createAuction = async (formData: FormData) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')

    const headers: Record<string, string> = {
      Authorization: `Bearer ${jwt}`,
    }

    const csrf = $csrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf

    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    })
  }

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

  const openDispute = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/dispute`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  const refundBuyer = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/refund`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  const withdrawDeposit = async (address: string) => {
    const jwt = getJwt()
    if (!jwt) throw new Error('User not logged in')
    return await $fetch(`${API_BASE}/${address}/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

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