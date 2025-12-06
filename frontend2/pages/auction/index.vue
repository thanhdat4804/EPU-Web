<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- Danh mục -->
    <CategoryMenu
      :categories="categories"
      :selected="selectedCategory"
      @select="selectCategory"
    />

    <!-- SLIDER SIÊU ĐẸP – ĐẶT DƯỚI CATEGORY MENU -->
    <div class="w-full bg-white">
      <div class="relative w-full h-[480px] overflow-hidden">
        <div 
          class="absolute inset-0 flex transition-transform duration-700 ease-in-out" 
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <!-- Slide 1 -->
          <div class="min-w-full h-full relative">
            <img src="https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg" 
                 class="w-full h-full object-cover" alt="Nghệ thuật" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-12 text-white max-w-3xl">
              <h2 class="text-5xl lg:text-6xl font-bold leading-tight">Khám Phá Nghệ Thuật Đỉnh Cao</h2>
              <p class="text-xl lg:text-2xl mt-4 opacity-90">Hàng ngàn tác phẩm độc bản từ các nghệ sĩ nổi tiếng toàn cầu</p>
              <button @click="scrollToAuctions" 
                      class="mt-8 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold transition">
                Xem ngay
              </button>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="min-w-full h-full relative">
            <img src="https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg" 
                 class="w-full h-full object-cover" alt="Đồng hồ" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 right-0 p-12 text-white text-right max-w-3xl">
              <h2 class="text-5xl lg:text-6xl font-bold leading-tight">Bộ Sưu Tập Đồng Hồ Cổ</h2>
              <p class="text-xl lg:text-2xl mt-4 opacity-90">Rolex · Patek Philippe · Audemars Piguet</p>
              <button @click="scrollToAuctions" 
                      class="mt-8 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold transition">
                Khám phá
              </button>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="min-w-full h-full relative">
            <img src="https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg" 
                 class="w-full h-full object-cover" alt="Trang sức" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center text-white">
                <h2 class="text-5xl lg:text-7xl font-bold">Trang Sức Hoàng Gia</h2>
                <p class="text-2xl mt-6 opacity-90">Kim cương · Ngọc trai · Vàng 24K</p>
                <button @click="scrollToAuctions" 
                        class="mt-10 px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold transition">
                  Đấu giá ngay
                </button>
              </div>
            </div>
          </div>

          <!-- Slide 4 -->
          <div class="min-w-full h-full relative">
            <img src="https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg" 
                 class="w-full h-full object-cover" alt="Xe cổ" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-12 text-white max-w-3xl">
              <h2 class="text-5xl lg:text-6xl font-bold leading-tight">Xe Cổ & Siêu Xe</h2>
              <p class="text-xl lg:text-2xl mt-4 opacity-90">Ferrari · Lamborghini · Rolls-Royce</p>
              <button @click="scrollToAuctions" 
                      class="mt-8 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold transition">
                Xem bộ sưu tập
              </button>
            </div>
          </div>
        </div>

        <!-- Nút điều hướng -->
        <button @click="prevSlide" 
                class="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition">
          <svg class="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button @click="nextSlide" 
                class="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition">
          <svg class="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dots -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          <button v-for="n in 4" :key="n"
                  @click="currentSlide = n - 1"
                  class="w-3 h-3 bg-white/70 hover:bg-white transition"
                  :class="{ 'bg-white shadow-md': currentSlide === n - 1 }"></button>
        </div>
      </div>
    </div>

    <!-- Danh sách đấu giá -->
    <div v-if="loading" class="max-w-7xl mx-auto px-6 py-24 text-center text-gray-600 text-lg">
      Đang tải các phiên đấu giá...
    </div>
    <div v-else-if="error" class="max-w-7xl mx-auto px-6 py-24 text-center text-red-600 text-lg">
      {{ error }}
    </div>
    <div v-else id="auctions-list" class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <ProductCard
          v-for="auction in auctions"
          :key="auction.id || auction.contractAddress"
          :auction="auction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '~/components/User/Header.vue'
import CategoryMenu from '~/components/User/CategoryMenu.vue'
import ProductCard from '~/components/User/ProductCard.vue'
import { useAuctions } from '~/composables/User/useAuctions'

const {
  auctions,
  categories,
  selectedCategory,
  selectCategory,
  loading,
  error,
} = useAuctions()

// SLIDER LOGIC
const currentSlide = ref(0)
const slides = 4

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides) % slides
}

const scrollToAuctions = () => {
  document.getElementById('auctions-list')?.scrollIntoView({ behavior: 'smooth' })
}

// Auto slide
onMounted(() => {
  const interval = setInterval(nextSlide, 7000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
/* PHÔNG CHỮ BASIS GROTESQUE PRO – ĐÃ CÓ TRONG TOÀN BỘ DỰ ÁN */
html, body, * {
  font-family: 'Basis Grotesque Pro', system-ui, -apple-system, sans-serif;
}

/* NÚT KHÔNG BO VIỀN GÓC */
button {
  border-radius: 0 !important;
}
</style>