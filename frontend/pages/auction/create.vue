<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Tạo đấu giá mới</h1>

    <form v-if="!isCreating" @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">Tên đấu giá</label>
        <input v-model="name" class="border p-2 rounded w-full" placeholder="Nhập tên đấu giá" />
      </div>

      <div>
        <label class="block text-sm font-medium">Thời gian (giây)</label>
        <input v-model="biddingTime" type="number" class="border p-2 rounded w-full" />
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Tạo đấu giá
      </button>
    </form>

    <div v-else class="text-green-600 font-semibold">
      Đang tạo đấu giá, vui lòng chờ...
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '#app'
import { useAuctionApi } from '~/composables/useAuctionApi'

const name = ref('')
const biddingTime = ref(60)
const isCreating = ref(false)

const router = useRouter()
const { createAuction } = useAuctionApi()

const onSubmit = async () => {
  try {
    isCreating.value = true
    const result = await createAuction(biddingTime.value)

    // nếu backend trả về địa chỉ hợp đồng
    if (result && result.address) {
      router.push(`/auction/${result.address}`)
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
