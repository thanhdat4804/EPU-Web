import { $fetch } from 'ofetch'

const API_BASE = 'http://localhost:3001/auction'

export function useAuctionApi() {
  const getAuctions = async (): Promise<any[]> => {
    return await $fetch(`${API_BASE}/list`)
  }

  const getAuctionInfo = async (address: string): Promise<any> => {
    return await $fetch(`${API_BASE}/info`, { query: { address } })
  }

  const createAuction = async (duration: number): Promise<any> => {
    return await $fetch(`${API_BASE}/create`, {
      method: 'POST',
      body: { duration },
    })
  }

  const placeBid = async (address: string, amount: number): Promise<any> => {
    return await $fetch(`${API_BASE}/bid`, {
      method: 'POST',
      body: { address, amount },
    })
  }

  const getAllBids = async (address: string): Promise<any[]> => {
    return await $fetch(`${API_BASE}/bids`, { query: { address } })
  }

  return { getAuctions, getAuctionInfo, createAuction, placeBid, getAllBids }
}
