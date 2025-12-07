<!-- pages/admin/pending-items.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Duyệt vật phẩm mới</h1>
        <p class="text-gray-600">Có <span class="font-bold text-blue-600">{{ pendingItems.length }}</span> vật phẩm đang chờ duyệt</p>
      </div>
    </div>

    <!-- Stats – giống hệt các trang admin khác
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="text-sm text-gray-600">Tổng chờ duyệt</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ pendingItems.length }}</div>
        <div class="text-sm text-yellow-600 mt-1">Cần xử lý ngay</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="text-sm text-gray-600">Hôm nay</div>
        <div class="text-2xl font-bold text-blue-600 mt-2">{{ todayCount }}</div>
        <div class="text-sm text-gray-500 mt-1">Vật phẩm mới</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="text-sm text-gray-600">Đã duyệt (tháng này)</div>
        <div class="text-2xl font-bold text-green-600 mt-2">{{ approvedThisMonth }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="text-sm text-gray-600">Tỷ lệ duyệt</div>
        <div class="text-2xl font-bold text-purple-600 mt-2">{{ approvalRate }}%</div>
        <div class="text-sm text-green-600 mt-1">Tăng 5% so với tháng trước</div>
      </div>
    </div>

    <!-- Danh sách vật phẩm chờ duyệt – card đẹp như trang người bán -->
    <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vật phẩm</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đăng</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá khởi điểm</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in pendingItems" :key="item.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <img 
                  :src="getImage(item.mainImage)" 
                  class="w-16 h-16 rounded-lg object-cover shadow"
                  alt="Vật phẩm"
                />
                <div>
                  <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">ID: {{ item.id }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <div class="font-medium text-gray-900">{{ item.owner?.name || '—' }}</div>
                <div class="text-gray-500 text-xs">{{ item.owner?.email || '—' }}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="text-lg font-bold text-emerald-600">
                {{ Number(item.startingPrice).toFixed(4) }} ETH
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {{ item.category?.name || 'Chưa chọn' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <button 
                  @click="approve(item.id)"
                  :disabled="actingId === item.id"
                  class="text-green-600 hover:text-green-800 font-medium transition"
                >
                  {{ actingId === item.id ? 'Đang duyệt...' : 'Duyệt' }}
                </button>
                <button 
                  @click="openRejectModal(item)"
                  class="text-red-600 hover:text-red-800 font-medium transition"
                >
                  Từ chối
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Không có dữ liệu -->
      <div v-if="pendingItems.length === 0" class="text-center py-16 text-gray-500">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-xl">Không có vật phẩm nào đang chờ duyệt</p>
      </div>
    </div>

    <!-- Modal từ chối – đẹp như trang người bán -->
    <div v-if="rejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Từ chối vật phẩm</h3>
        <p class="text-gray-600 mb-6">Vui lòng nhập lý do từ chối:</p>
        <textarea
          v-model="rejectReason"
          rows="5"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          placeholder="Ví dụ: Hình ảnh không rõ, vi phạm chính sách..."
        ></textarea>
        <div class="flex gap-4 mt-8">
          <button
            @click="reject"
            :disabled="!rejectReason.trim() || actingId"
            class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            Xác nhận từ chối
          </button>
          <button
            @click="rejectModal = null; rejectReason = ''"
            class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from '~/components/Admin/Header.vue' // hoặc Header chung
import { useItem } from '~/composables/useItem'

const { getPendingItems, approveItem, rejectItem } = useItem()

const pendingItems = ref<any[]>([])
const actingId = ref<number | null>(null)
const rejectModal = ref<any>(null)
const rejectReason = ref('')

definePageMeta({ layout: 'admin' })

// Load danh sách chờ duyệt
onMounted(async () => {
  await loadPending()
})

const loadPending = async () => {
  try {
    pendingItems.value = await getPendingItems()
  } catch (err) {
    console.error('Lỗi tải danh sách chờ duyệt:', err)
  }
}

// Hàm hỗ trợ
const getImage = (img: string) => img ? `http://localhost:3001/uploads/${img}` : '/no-image.jpg'
const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN')

// Stats giả lập (có thể thay bằng API thật)
const todayCount = computed(() => {
  const today = new Date().toDateString()
  return pendingItems.value.filter(i => new Date(i.createdAt).toDateString() === today).length
})
const approvedThisMonth = ref(89) // thay bằng API thật sau
const approvalRate = ref(94)

// Duyệt
const approve = async (itemId: number) => {
  if (!confirm('Duyệt vật phẩm này?')) return
  actingId.value = itemId
  try {
    await approveItem(itemId)
    pendingItems.value = pendingItems.value.filter(i => i.id !== itemId)
    alert('Đã duyệt thành công!')
  } catch (err) {
    alert('Lỗi khi duyệt')
  } finally {
    actingId.value = null
  }
}

// Từ chối
const openRejectModal = (item: any) => {
  rejectModal.value = item
  rejectReason.value = ''
}
const reject = async () => {
  if (!rejectReason.value.trim()) return alert('Vui lòng nhập lý do!')
  actingId.value = rejectModal.value.id
  try {
    await rejectItem(rejectModal.value.id, rejectReason.value)
    pendingItems.value = pendingItems.value.filter(i => i.id !== rejectModal.value.id)
    alert('Đã từ chối!')
  } catch (err) {
    alert('Lỗi khi từ chối')
  } finally {
    actingId.value = null
    rejectModal.value = null
    rejectReason.value = ''
  }
}
</script>