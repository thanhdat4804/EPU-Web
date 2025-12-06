<!-- pages/admin/pending-items.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- TITLE -->
      <div class="mb-12 text-center">
        <h1 class="text-5xl font-bold text-gray-900 tracking-tight">
          Duyệt vật phẩm mới
        </h1>
        <p class="mt-4 text-xl text-gray-600">
          Có <span class="font-bold text-blue-600">{{ pendingItems.length }}</span> vật phẩm đang chờ duyệt
        </p>
      </div>

      <!-- DANH SÁCH PENDING ITEMS -->
      <div v-if="pendingItems.length === 0" class="text-center py-32">
        <div class="bg-gray-200 border-2 border-dashed rounded-xl w-40 h-40 mx-auto mb-8"></div>
        <p class="text-2xl text-gray-500">Không có vật phẩm nào đang chờ duyệt</p>
        <p class="mt-4 text-gray-400">Hãy quay lại sau</p>
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-2">
        <div
          v-for="item in pendingItems"
          :key="item.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
        >
          <div class="flex">
            <!-- ẢNH CHÍNH -->
            <div class="w-80 h-80 bg-gray-100 flex-shrink-0">
              <img
                v-if="item.mainImage"
                :src="item.mainImage"
                class="w-full h-full object-cover"
                alt="Ảnh chính"
              />
              <div v-else class="flex items-center justify-center h-full">
                <svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16a2 2 0 012.828 0L20 16m-6-4v1" />
                </svg>
              </div>
            </div>

            <!-- THÔNG TIN + NÚT DUYỆT -->
            <div class="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div class="mb-6">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3">
                    {{ item.name }}
                  </h3>
                  <p class="text-gray-600 text-lg leading-relaxed">
                    {{ item.description || 'Không có mô tả' }}
                  </p>

                  <div class="mt-6 grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p class="text-gray-500">Người đăng</p>
                      <p class="font-semibold text-gray-900">{{ item.owner.name }}</p>
                      <p class="text-gray-500 text-xs">{{ item.owner.email }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Giá khởi điểm</p>
                      <p class="text-2xl font-bold text-emerald-600">
                        {{ Number(item.startingPrice).toFixed(4) }} ETH
                      </p>
                    </div>
                  </div>

                  <div class="mt-6 flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {{ item.category?.name || 'Chưa chọn danh mục' }}
                    </span>
                    <span class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Chờ duyệt
                    </span>
                  </div>
                </div>

                <!-- NÚT DUYỆT / TỪ CHỐI -->
                <div class="flex gap-4 mt-8">
                  <button
                    @click="approve(item.id)"
                    :disabled="actingId === item.id"
                    class="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-70"
                  >
                    <span v-if="actingId !== item.id">DUYỆT</span>
                    <span v-else class="flex items-center justify-center gap-3">
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang duyệt...
                    </span>
                  </button>

                  <button
                    @click="openRejectModal(item)"
                    class="flex-1 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105"
                  >
                    TỪ CHỐI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TỪ CHỐI -->
    <div v-if="rejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center items-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Từ chối vật phẩm</h3>
        <p class="text-gray-600 mb-6">Vui lòng nhập lý do từ chối:</p>
        <textarea
          v-model="rejectReason"
          rows="4"
          class="w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
          placeholder="Ví dụ: Hình ảnh không rõ, vi phạm chính sách..."
        ></textarea>
        <div class="flex gap-4 mt-6">
          <button
            @click="reject"
            :disabled="!rejectReason.trim() || actingId"
            class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
          >
            Xác nhận từ chối
          </button>
          <button
            @click="rejectModal = null"
            class="flex-1 py-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '~/components/Admin/Header.vue' // ← Header riêng cho admin nếu có
import { useItem } from '~/composables/useItem'

const { getPendingItems, approveItem, rejectItem } = useItem()

const pendingItems = ref<any[]>([])
const actingId = ref<number | null>(null)
const rejectModal = ref<any>(null)
const rejectReason = ref('')
definePageMeta({
  layout: 'admin'
})
onMounted(async () => {
  await loadPending()
})

const loadPending = async () => {
  try {
    pendingItems.value = await getPendingItems()
  } catch (err) {
    alert('Lỗi tải danh sách chờ duyệt')
  }
}

const approve = async (itemId: number) => {
  if (!confirm('Duyệt vật phẩm này?')) return

  actingId.value = itemId
  try {
    await approveItem(itemId) // ← API duyệt
    // BẮT BUỘC PHẢI CÓ DÒNG NÀY – REFRESH LẠI DANH SÁCH!
    await loadPending()
    alert('Đã duyệt thành công!')
  } catch (err) {
    alert('Lỗi khi duyệt')
  } finally {
    actingId.value = null
  }
}

const openRejectModal = (item: any) => {
  rejectModal.value = item
  rejectReason.value = ''
}

const reject = async () => {
  if (!rejectReason.value.trim()) return
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
  }
}
</script>

<style scoped>
</style>