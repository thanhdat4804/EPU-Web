<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div v-if="auction" class="max-w-3xl mx-auto space-y-6">
      <!-- Auction Info -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">🏷️ Auction Details</h1>
        <p><strong>Seller:</strong> {{ auction.seller }}</p>
        <p><strong>Highest Bid:</strong> {{ auction.highestBid }} ETH</p>
        <p><strong>Highest Bidder:</strong> {{ auction.highestBidder }}</p>
        <p><strong>Ended:</strong> {{ auction.ended ? "Yes" : "No" }}</p>
      </div>

      <!-- Countdown -->
      <div class="p-6 bg-white rounded-xl shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">⏳ Time Remaining</h2>
        <div class="flex justify-center items-center gap-6 text-center">
          <div v-for="(time, label) in countdown" :key="label">
            <p class="text-4xl font-bold text-gray-900">{{ time }}</p>
            <p class="text-sm uppercase text-gray-500">{{ label }}</p>
          </div>
        </div>
        <div class="mt-4 text-center text-gray-600">
          Ends at: <b>{{ formattedEndTime }}</b>
        </div>
        <div class="h-1 bg-blue-500 mt-3 rounded" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Place a Bid -->
      <div class="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 class="text-xl font-bold text-gray-800">💸 Place a Bid</h2>
        <input
          v-model.number="bidAmount"
          type="number"
          min="0"
          step="0.01"
          class="border rounded-lg p-2 w-full"
          placeholder="Enter bid amount (ETH)"
        />
        <button
          @click="submitBid"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
        >
          Submit Bid
        </button>
      </div>

      <!-- List of Bidders -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="text-xl font-bold mb-4 text-gray-800">👥 All Bidders</h2>
        <ul v-if="bidders.length > 0" class="space-y-2">
          <li
            v-for="(b, index) in bidders"
            :key="index"
            class="flex justify-between border-b pb-2"
          >
            <span>{{ b.bidder }}</span>
            <span class="font-semibold">{{ b.amount }} ETH</span>
          </li>
        </ul>
        <p v-else class="text-gray-500">No bids yet.</p>
      </div>
    </div>

    <div v-else class="text-center text-gray-600 mt-10">
      Loading auction information...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctionApi } from '@/composables/useAuctionApi'

const route = useRoute()
const { getAuctionInfo, getAllBids, placeBid } = useAuctionApi()

const auction = ref<any>(null)
const bidders = ref<any[]>([])
const bidAmount = ref<number>(0)
const countdown = ref({ DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' })
const progress = ref(0)
let interval: any = null

const formattedEndTime = computed(() => {
  if (!auction.value?.endTime) return 'Unknown'
  const date = new Date(auction.value.endTime)
  return date.toLocaleString()
})

onMounted(async () => {
  const address = route.params.address as string
  await fetchAuction(address)
  await fetchBidders(address)
  startCountdown(auction.value.endTime)
})

onUnmounted(() => {
  clearInterval(interval)
})

async function fetchAuction(address: string) {
  try {
    auction.value = await getAuctionInfo(address)
  } catch (error) {
    console.error('Error fetching auction:', error)
  }
}

async function fetchBidders(address: string) {
  try {
    bidders.value = await getAllBids(address)
  } catch (error) {
    console.error('Error fetching bidders:', error)
  }
}

async function submitBid() {
  if (!bidAmount.value || bidAmount.value <= 0) {
    alert('Please enter a valid bid amount!')
    return
  }

  try {
    const address = route.params.address as string
    await placeBid(address, bidAmount.value)
    alert('Bid placed successfully!')
    await fetchAuction(address)
    await fetchBidders(address)
  } catch (error) {
    console.error('Error placing bid:', error)
    alert('Failed to place bid.')
  }
}

function startCountdown(endTime: string) {
  const end = new Date(endTime).getTime()
  const totalDuration = end - Date.now()
  if (isNaN(end)) return

  interval = setInterval(() => {
    const now = Date.now()
    const remaining = end - now

    if (remaining <= 0) {
      clearInterval(interval)
      countdown.value = { DAYS: '00', HOURS: '00', MINUTES: '00', SECONDS: '00' }
      progress.value = 100
      return
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((remaining / (1000 * 60)) % 60)
    const seconds = Math.floor((remaining / 1000) % 60)

    countdown.value = {
      DAYS: String(days).padStart(2, '0'),
      HOURS: String(hours).padStart(2, '0'),
      MINUTES: String(minutes).padStart(2, '0'),
      SECONDS: String(seconds).padStart(2, '0')
    }

    progress.value = Math.min(100, ((totalDuration - remaining) / totalDuration) * 100)
  }, 1000)
}
</script>

<style scoped>
.flex > div {
  background: #f9fafb;
  padding: 10px 16px;
  border-radius: 10px;
  min-width: 80px;
}
</style>
