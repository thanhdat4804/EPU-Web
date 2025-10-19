<template>
  <div>
    <Header />

    <CategoryMenu
      :categories="categories"
      :selected="selectedCategory"
      @select="selectCategory"
    />

    <div v-if="loading" class="p-6 text-center text-gray-500">Loading...</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">{{ error }}</div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6 bg-gray-50"
    >
      <ProductCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/User/Header.vue'
import CategoryMenu from '~/components/User/CategoryMenu.vue'
import ProductCard from '~/components/User/ProductCard.vue'
import { useAuctions } from '~/composables/User/useAuctions'

const { categories, items, selectedCategory, selectCategory, loading, error } =
  useAuctions()
</script>
