<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Tiêu đề -->
    <h1 class="text-2xl font-bold text-gray-800 mb-6">
      Quản lý người bán
    </h1>

    <!-- Thanh tìm kiếm & lọc -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Ô tìm kiếm -->
      <input
        v-model="search"
        type="text"
        placeholder="Tìm kiếm người bán..."
        class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      <!-- Bộ lọc trạng thái -->
      <select
        v-model="filter"
        class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="">Tất cả</option>
        <option value="active">Hoạt động</option>
        <option value="suspended">Bị khóa</option>
      </select>
    </div>

    <!-- Bảng danh sách người bán -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số sản phẩm
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="seller in filteredSellers"
            :key="seller.id"
            class="hover:bg-gray-50 transition duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ seller.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ seller.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ seller.itemCount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full':
                    true,
                  'bg-green-100 text-green-800': seller.status === 'active',
                  'bg-red-100 text-red-800': seller.status === 'suspended'
                }"
              >
                {{ seller.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewSeller(seller)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Xem
              </button>
              <button
                @click="toggleStatus(seller)"
                class="text-orange-600 hover:text-orange-900"
              >
                {{ seller.status === 'active' ? 'Khóa' : 'Mở' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Thông báo khi không có dữ liệu -->
      <div
        v-if="filteredSellers.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Không tìm thấy người bán nào.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Dữ liệu mẫu (thay bằng API thực tế sau)
const sellers = ref([
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', itemCount: 12, status: 'active' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', itemCount: 8, status: 'active' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', itemCount: 0, status: 'suspended' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', itemCount: 25, status: 'active' },
])

// State tìm kiếm và lọc
const search = ref('')
const filter = ref('')

// Tính toán danh sách đã lọc
const filteredSellers = computed(() => {
  return sellers.value.filter(seller => {
    const matchesSearch =
      seller.name.toLowerCase().includes(search.value.toLowerCase()) ||
      seller.email.toLowerCase().includes(search.value.toLowerCase())

    const matchesFilter = !filter.value || seller.status === filter.value

    return matchesSearch && matchesFilter
  })
})

// Hành động
const viewSeller = (seller) => {
  alert(`Xem chi tiết: ${seller.name}`)
  // Gọi API hoặc chuyển trang chi tiết
}

const toggleStatus = (seller) => {
  seller.status = seller.status === 'active' ? 'suspended' : 'active'
  // Gọi API cập nhật trạng thái
}
</script>

<style scoped>
/* Tailwind đã xử lý hầu hết, có thể thêm custom nếu cần */
</style>