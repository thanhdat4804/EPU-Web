<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">All Auctions</h1>

    <div v-for="auction in auctions" :key="auction.address" class="border p-4 rounded-lg mb-4 shadow">
      <p><strong>Seller:</strong> {{ auction.seller }}</p>
      <p><strong>Highest Bid:</strong> {{ auction.highestBid }} ETH</p>
      <p><strong>Ended:</strong> {{ auction.ended ? 'Yes' : 'No' }}</p>

      <NuxtLink
        :to="`/auction/${auction.address}`"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 inline-block"
      >
        View Details
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuctionApi } from '~/composables/useAuctionApi'

const { getAuctions } = useAuctionApi()
const auctions = ref<any[]>([])

onMounted(async () => {
  auctions.value = await getAuctions()
})
</script>
