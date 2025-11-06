<template>
  <NuxtLink
    :to="`/auction/${auction.contractAddress}`"
    class="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition block overflow-hidden"
  >
    <div class="aspect-square bg-gray-100 flex items-center justify-center">
      <img
        :src="auction.item?.imageUrl || '/no-image.jpg'"
        :alt="auction.item?.name"
        class="object-contain w-full h-full"
      />
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-gray-800 truncate">
        {{ auction.item?.name }}
      </h3>
      <p class="text-sm text-gray-500 mt-1 truncate">
        {{ auction.item?.description || 'Không có mô tả' }}
      </p>

      <div class="mt-3 flex justify-between items-center">
        <span class="text-blue-600 font-bold">
          {{ formatPrice(auction.item?.startingPrice || 0) }}
        </span>

        <span
          class="text-xs font-semibold px-2 py-1 rounded-lg"
          :class="{
            'bg-green-100 text-green-700': auction.status === 'Active',
            'bg-gray-200 text-gray-600': auction.status === 'Ended'
          }"
        >
          {{ auction.status }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  auction: { type: Object, required: true },
})

const formatPrice = (price) => {
  if (!price) return '—'
  return `${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETH`
}
</script>
