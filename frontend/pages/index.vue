<template>
  <div>
    <Navbar />

    <CategoryBar />

    <section class="mt-10 text-center">
      <h2 class="text-3xl font-semibold text-blue-700">
        Special objects, <span class="text-black">selected by experts</span>
      </h2>
    </section>

    <FeaturedSlider />

    <section class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 px-10">
      <AuctionCard
        v-for="item in featuredItems"
        :key="item.id"
        :item="item"
      />
    </section>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import CategoryBar from '~/components/CategoryBar.vue'
import FeaturedSlider from '~/components/FeaturedSlider.vue'
import AuctionCard from '~/components/AuctionCard.vue'
import Footer from '~/components/Footer.vue'

const featuredItems = [
  { id: 1, title: 'Vintage Lamp', image: '/img/lamp.jpg', bid: '€120' },
  { id: 2, title: 'Rare Pokemon Card', image: '/img/card.jpg', bid: '€950' },
  { id: 3, title: 'Classic Painting', image: '/img/art.jpg', bid: '€4000' },
  { id: 4, title: 'Jaguar E-Type', image: '/img/car.jpg', bid: '€95,000' },
]
</script>
