<template>
  <section class="mt-10">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="n in 6" :key="n" class="border rounded-xl shadow-sm hover:shadow-md transition">
        <img
          src="https://cdn.catawiki.net/assets/images/diamond-sample.jpg"
          alt="Item"
          class="rounded-t-xl w-full h-48 object-cover"
        />
        <div class="p-3">
          <p class="font-medium">Item {{ n }}</p>
          <p class="text-sm text-gray-500">Current bid</p>
        </div>
      </div>
    </div>
  </section>
</template>
