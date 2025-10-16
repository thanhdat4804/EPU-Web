<template>
  <div
    class="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-30 animate-slideDown"
  >
    <div class="max-w-6xl mx-auto py-10 px-10 relative">
      <!-- Nút đóng -->
      <button
        @click="$emit('close')"
        class="absolute right-10 top-6 text-2xl text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <h2 class="text-3xl font-semibold mb-8">Categories</h2>

      <!-- Danh sách thể loại -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          @click="goToCategory(category)"
          class="flex justify-between items-center p-4 rounded-md cursor-pointer hover:shadow-md transition-all duration-200"
          :style="{ backgroundColor: category.color }"
        >
          <h3 class="font-medium text-gray-800 leading-snug w-[70%]">
            {{ category.name }}
          </h3>
          <div class="w-16 h-16 overflow-hidden rounded-full flex-shrink-0">
            <img
              :src="category.image"
              alt="Category image"
              class="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

// Danh sách thể loại mẫu
const categories = [
  {
    id: 1,
    name: 'Archaeology & Natural History',
    slug: 'archaeology-natural-history',
    color: '#C5A17D',
    image: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2'
  },
  {
    id: 2,
    name: 'Art',
    slug: 'art',
    color: '#A8D5BA',
    image: 'https://images.unsplash.com/photo-1528747045269-390fe33c19d4'
  },
  {
    id: 3,
    name: 'Asian & Tribal Art',
    slug: 'asian-tribal-art',
    color: '#7BB5E3',
    image: 'https://images.unsplash.com/photo-1587815071048-6d84f2d92e17'
  },
  {
    id: 4,
    name: 'Books & Historical Memorabilia',
    slug: 'books-historical-memorabilia',
    color: '#A9B997',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba'
  },
  {
    id: 5,
    name: 'Classic Cars, Motorcycles & Automobilia',
    slug: 'classic-cars-motorcycles-automobilia',
    color: '#A3856A',
    image: 'https://images.unsplash.com/photo-1600959907703-32c3bdc7c50a'
  },
  {
    id: 6,
    name: 'Coins & Stamps',
    slug: 'coins-stamps',
    color: '#C9C4DC',
    image: 'https://images.unsplash.com/photo-1617034194291-7b97ed9858be'
  },
  {
    id: 7,
    name: 'Comics & Animation',
    slug: 'comics-animation',
    color: '#9BD8D5',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f'
  },
  {
    id: 8,
    name: 'Fashion',
    slug: 'fashion',
    color: '#F3C8CF',
    image: 'https://images.unsplash.com/photo-1521334884684-d80222895322'
  }
]

// Khi click vào 1 thể loại
const goToCategory = (category) => {
  // Đóng panel
  // (để Navbar nhận event và ẩn panel)
  window.scrollTo(0, 0)
  // Điều hướng đến trang /category/[slug]
  router.push(`/User/category/${category.slug}`)
}
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slideDown {
  animation: slideDown 0.25s ease-out;
}
</style>
