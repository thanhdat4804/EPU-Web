import { $fetch } from 'ofetch'

const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  const getAuctions = async (): Promise<any[]> => {
    return await $fetch(`${API_BASE}/list`)
  }

  const getAuctionDetail = async (address: string): Promise<any> => {
  return await $fetch(`${API_BASE}/${address}`)
  }


  const getAllBids = async (address: string): Promise<any[]> => {
    return await $fetch(`${API_BASE}/${address}/bids`)
  }

  const createAuction = async (auctionData: any): Promise<any> => {
    const token = localStorage.getItem('jwt')
    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: auctionData,
    })
  }

  const placeBid = async (address: string, amount: number): Promise<any> => {
    return await $fetch(`${API_BASE}/${address}/bid`, {
      method: 'POST',
      body: { amount },
    })
  }

  return { getAuctions, getAuctionDetail, getAllBids, createAuction, placeBid }
}
