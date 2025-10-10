<template>
  <div class="max-w-2xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">🧾 Tạo đấu giá mới</h1>

    <form v-if="!isCreating" @submit.prevent="onSubmit" class="space-y-4">
      <!-- Tên đấu giá -->
      <div>
        <label class="block text-sm font-medium mb-1">Tên đấu giá</label>
        <input
          v-model="name"
          class="border p-2 rounded w-full"
          placeholder="Nhập tên đấu giá"
          required
        />
      </div>

      <!-- Mô tả -->
      <div>
        <label class="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          v-model="description"
          class="border p-2 rounded w-full"
          rows="3"
          placeholder="Mô tả ngắn về vật phẩm"
        ></textarea>
      </div>

      <!-- Ảnh -->
      <div>
        <label class="block text-sm font-medium mb-1">Ảnh (URL)</label>
        <input
          v-model="imageUrl"
          type="url"
          class="border p-2 rounded w-full"
          placeholder="https://example.com/item.jpg"
        />
      </div>

      <!-- Giá khởi điểm -->
      <div>
        <label class="block text-sm font-medium mb-1">Giá khởi điểm (ETH)</label>
        <input
          v-model.number="startingPrice"
          type="number"
          step="0.01"
          min="0"
          class="border p-2 rounded w-full"
          placeholder="Nhập giá khởi điểm"
          required
        />
      </div>

      <!-- Giá sàn -->
      <div>
        <label class="block text-sm font-medium mb-1">Giá sàn (ETH)</label>
        <input
          v-model.number="reservePrice"
          type="number"
          step="0.01"
          min="0"
          class="border p-2 rounded w-full"
          placeholder="Tùy chọn"
        />
      </div>

      <!-- Thời gian đấu giá -->
      <div>
        <label class="block text-sm font-medium mb-1">Thời gian đấu giá (giây)</label>
        <input
          v-model.number="biddingTime"
          type="number"
          min="30"
          class="border p-2 rounded w-full"
          required
        />
      </div>

      <!-- Nút tạo -->
      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Tạo đấu giá
      </button>
    </form>

    <div v-else class="text-green-600 font-semibold text-center mt-6">
      ⏳ Đang tạo đấu giá, vui lòng chờ...
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '#app'
import { useAuctionApi } from '~/composables/useAuctionApi'

const name = ref('')
const description = ref('')
const imageUrl = ref('')
const startingPrice = ref(0)
const reservePrice = ref(null)
const biddingTime = ref(60)
const isCreating = ref(false)

const router = useRouter()
const { createAuction } = useAuctionApi()

const onSubmit = async () => {
  try {
    isCreating.value = true

    const auctionData = {
      name: name.value,
      description: description.value,
      imageUrl: imageUrl.value,
      startingPrice: startingPrice.value,
      reservePrice: reservePrice.value,
      duration: biddingTime.value,
    }

    const result = await createAuction(auctionData)

    if (result && result.contractAddress) {
  router.push(`/auction/${result.contractAddress}`)
    } else {
      alert('Không nhận được thông tin đấu giá mới!')
    }
  } catch (err) {
    console.error(err)
    alert('Tạo đấu giá thất bại!')
  } finally {
    isCreating.value = false
  }
}
</script>
