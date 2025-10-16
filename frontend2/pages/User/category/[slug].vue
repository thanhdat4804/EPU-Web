<template>
  <div>
    <Navbar />

    <!-- Thanh menu phụ -->
    <SubNavbar />

    <div class="max-w-6xl mx-auto mt-8 px-6">
      <h1 class="text-2xl font-semibold mb-4">
        {{ categoryName }}
      </h1>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="n in 8"
          :key="n"
          class="border rounded-md p-3 shadow-sm hover:shadow-md transition"
        >
          <img
            class="w-full h-40 object-cover rounded-md mb-2"
            src="https://picsum.photos/200/200?random={{n}}"
            alt="item"
          />
          <p class="font-medium">Item {{ n }}</p>
          <p class="text-sm text-gray-500">Current bid</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '~/components/User/Navbar.vue'
import SubNavbar from '~/components/User/SubNavbar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const categoryName = route.params.slug.replace(/-/g, ' ')
</script>
