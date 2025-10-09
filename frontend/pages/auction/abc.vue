<template>
  <div class="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6">
    <h1 class="text-2xl font-bold text-center">🎯 Auction DApp</h1>

    <!-- Auction Info -->
    <div class="space-y-2">
      <p><strong>Highest Bid:</strong> {{ highestBid }} ETH</p>
      <p><strong>Highest Bidder:</strong> {{ highestBidder }}</p>
      <p><strong>Time Left:</strong> {{ timeLeft }}s</p>
    </div>

    <!-- Place a Bid -->
    <div class="space-y-4">
      <input
        v-model="bidAmount"
        type="number"
        placeholder="Enter bid in ETH"
        class="border p-2 w-full rounded-md"
      />
      <button
        @click="submitBid"
        class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Place Bid
      </button>
    </div>

    <!-- Bid History -->
    <div class="mt-6">
      <h2 class="text-lg font-semibold mb-2">📜 Bid History</h2>
      <ul class="border rounded-md divide-y">
        <li
          v-for="(bid, index) in bidList"
          :key="index"
          class="p-2 text-sm flex justify-between"
        >
          <span>{{ bid.bidder }}</span>
          <span>{{ bid.amount }} ETH</span>
        </li>
        <li v-if="bidList.length === 0" class="p-2 text-gray-500 text-center">
          No bids yet
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE = "http://localhost:3001";

const highestBid = ref("0");
const highestBidder = ref("");
const bidAmount = ref("");
const bidList = ref([]);
const timeLeft = ref(0);

// Lấy thông tin đấu giá
async function fetchAuctionInfo() {
  try {
    const res = await $fetch(`${API_BASE}/auction/info`);
    console.log("Auction info:", res);
  } catch (err) {
    console.error("Fetch auction info error:", err);
  }
}

// Lấy bid cao nhất
async function fetchHighest() {
  try {
    const res = await $fetch(`${API_BASE}/auction/highest`);
    highestBid.value = res.highest;
    highestBidder.value = res.highestBidder;
  } catch (err) {
    console.error("Fetch highest bid error:", err);
  }
}

// Lấy danh sách tất cả người tham gia
async function fetchBidList() {
  try {
    const res = await $fetch(`${API_BASE}/auction/bids`);
    bidList.value = res;
  } catch (err) {
    console.error("Fetch bid list error:", err);
    bidList.value = [];
  }
}

// Gửi bid mới
async function submitBid() {
  if (!bidAmount.value || parseFloat(bidAmount.value) <= 0) {
    alert("Please enter a valid amount!");
    return;
  }
  try {
    const res = await $fetch(`${API_BASE}/auction/bid`, {
      method: "POST",
      body: { amountEth: parseFloat(bidAmount.value) },
    });
    if (res.success) {
      alert(`Bid placed! TX hash: ${res.txHash}`);
      bidAmount.value = "";
      await fetchHighest();
      await fetchBidList();
    } else {
      alert("Error: " + res.error);
    }
  } catch (err) {
    console.error("Submit bid error:", err);
  }
}

onMounted(async () => {
  await fetchAuctionInfo();
  await fetchHighest();
  await fetchBidList();
});
</script>

<style scoped>
body {
  font-family: "Inter", sans-serif;
  background-color: #f8fafc;
}
</style>
