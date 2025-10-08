<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div v-if="auction" class="max-w-4xl mx-auto space-y-8">

      <!-- Auction Info -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">🏷️ Auction Details</h1>
        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-semibold">Seller:</span> {{ auction.seller }}</div>
          <div><span class="font-semibold">Highest Bid:</span> {{ auction.highestBid }} ETH</div>
          <div><span class="font-semibold">Highest Bidder:</span> {{ auction.highestBidder }}</div>
          <div><span class="font-semibold">Ended:</span> {{ auction.ended ? "Yes" : "No" }}</div>
        </div>
      </div>

      <!-- Countdown -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">⏳ Time Remaining</h2>
        <div class="flex justify-center items-center gap-6 text-center">
          <div v-for="(time, label) in countdown" :key="label" class="bg-gray-100 p-4 rounded-xl min-w-[70px]">
            <p class="text-4xl font-extrabold text-gray-900">{{ time }}</p>
            <p class="text-sm uppercase text-gray-500">{{ label }}</p>
          </div>
        </div>
        <div class="mt-4 text-center text-gray-600">
          Ends at: <b>{{ formattedEndTime }}</b>
        </div>
        <div class="h-2 bg-blue-100 mt-4 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Place a Bid -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">💸 Place a Bid</h2>
        <input
          v-model.number="bidAmount"
          type="number"
          min="0"
          step="0.01"
          class="border rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Enter bid amount (ETH)"
        />
        <button
          @click="submitBid"
          class="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 w-full font-semibold transition"
        >
          Submit Bid
        </button>
      </div>

      <!-- List of Bidders -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 class="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">👥 All Bidders</h2>
        <ul v-if="bidders.length > 0" class="space-y-2">
          <li
            v-for="(b, index) in bidders"
            :key="index"
            class="flex justify-between items-center border-b pb-2 hover:bg-gray-50 transition rounded-md px-2"
          >
            <span class="text-gray-700">{{ b.bidder }}</span>
            <span class="font-semibold text-gray-900">{{ b.amount }} ETH</span>
          </li>
        </ul>
        <p v-else class="text-gray-500">No bids yet.</p>
      </div>

    </div>

    <div v-else class="text-center text-gray-600 mt-20 text-lg">
      Loading auction information...
    </div>
  </div>
</template>
