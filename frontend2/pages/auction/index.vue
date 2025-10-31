<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Quản lý phiên đấu giá</h1>

    <div class="flex items-center justify-between mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Tìm kiếm theo vật phẩm hoặc ID..."
        class="border rounded px-3 py-2 w-1/3"
      />
      <select v-model="filter" class="border rounded px-3 py-2">
        <option value="">Tất cả</option>
        <option value="active">Đang diễn ra</option>
        <option value="upcoming">Sắp bắt đầu</option>
        <option value="ended">Đã kết thúc</option>
      </select>
    </div>

    <table class="min-w-full bg-white rounded shadow-sm">
      <thead>
        <tr class="border-b bg-gray-50 text-left">
          <th class="p-3">ID</th>
          <th class="p-3">Vật phẩm</th>
          <th class="p-3">Giá hiện tại</th>
          <th class="p-3">Người đặt cao nhất</th>
          <th class="p-3">Thời gian còn lại</th>
          <th class="p-3">Trạng thái</th>
          <th class="p-3 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="auction in filteredAuctions"
          :key="auction.id"
          class="border-b hover:bg-gray-50 transition"
        >
          <td class="p-3">{{ auction.id }}</td>
          <td class="p-3">{{ auction.item }}</td>
          <td class="p-3">€{{ auction.currentBid }}</td>
          <td class="p-3">{{ auction.highestBidder }}</td>
          <td class="p-3">{{ auction.remaining }}</td>
          <td class="p-3">
            <span
              :class="{
                'text-green-600': auction.status === 'active',
                'text-gray-500': auction.status === 'ended',
                'text-blue-600': auction.status === 'upcoming'
              }"
            >
              {{ auction.status }}
            </span>
          </td>
          <td class="p-3 text-right">
            <button class="text-blue-600 hover:underline mr-2">Chi tiết</button>
            <button v-if="auction.status==='active'" class="text-red-600 hover:underline">Kết thúc</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const search = ref('')
const filter = ref('')

const auctions = ref([
  { id: 1, item: 'Đồng hồ Omega 1965', currentBid: 2200, highestBidder: 'buyerA', remaining: '2h 30m', status: 'active' },
  { id: 2, item: 'Tranh phong cảnh cổ', currentBid: 850, highestBidder: 'buyerB', remaining: 'Đã kết thúc', status: 'ended' },
  { id: 3, item: 'Xe Vespa cổ 1978', currentBid: 0, highestBidder: '-', remaining: 'Bắt đầu sau 1h', status: 'upcoming' }
])

const filteredAuctions = computed(() =>
  auctions.value.filter(a =>
    a.item.toLowerCase().includes(search.value.toLowerCase()) &&
    (filter.value === '' || a.status === filter.value)
  )
)
</script>
