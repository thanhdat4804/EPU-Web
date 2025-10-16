<template>
  <div class="min-h-screen bg-white text-gray-900">
    <Navbar />
    <CategoryBar />

    <main class="px-8 py-6">
      <HeroBanner />
      <ProductGrid />
    </main>
  </div>
</template>

<script setup>
import Navbar from '~/components/User/Navbar.vue'
import CategoryBar from '~/components/User/CategoryBar.vue'
import HeroBanner from '~/components/User/HeroBanner.vue'
import ProductGrid from '~/components/User/ProductGrid.vue'
</script>
