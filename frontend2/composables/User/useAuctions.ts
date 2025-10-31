// composables/User/useAuctions.ts
import { ref, onMounted } from 'vue'

export function useAuctions() {
  const baseUrl = 'http://localhost:3001'

  const categories = ref<any[]>([])
  const auctions = ref<any[]>([])
  const selectedCategory = ref<'all' | number>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 🏷️ Lấy danh sách thể loại
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/categories`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      categories.value = await res.json()
    } catch (err) {
      console.error('❌ Lỗi khi lấy categories:', err)
      error.value = 'Không thể tải danh sách thể loại.'
    }
  }

  // 💎 Lấy danh sách đấu giá (tất cả hoặc theo thể loại)
  const fetchAuctions = async (category: 'all' | number = 'all') => {
    try {
      loading.value = true
      error.value = null

      if (category === 'all') {
        // 🔹 Lấy tất cả đấu giá
        const res = await fetch(`${baseUrl}/auction/list`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        auctions.value = await res.json()
      } else {
        // 🔹 Lấy category cụ thể (có items kèm auction)
        const res = await fetch(`${baseUrl}/categories/${category}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const categoryData = await res.json()

        // ⚙️ Lấy danh sách item có đấu giá (auction != null)
        auctions.value = categoryData.items
        ? categoryData.items
            .filter((item: any) => item.auction !== null) // chỉ lấy item có auction
            .map((item: any) => ({
              ...item.auction,  // lấy dữ liệu auction
              item,             // gắn kèm thông tin item (ảnh, mô tả,...)
            }))
        : []
      }

      console.log('🟢 Auctions loaded:', auctions.value)
    } catch (err) {
      console.error('❌ Lỗi khi lấy auctions:', err)
      error.value = 'Không thể tải danh sách đấu giá.'
    } finally {
      loading.value = false
    }
  }


  // 🔄 Khi chọn category
  const selectCategory = async (category: 'all' | number) => {
    selectedCategory.value = category
    await fetchAuctions(category)
  }

  // 🚀 Khi mở trang
  onMounted(async () => {
    await fetchCategories()
    await fetchAuctions()
  })

  return {
    categories,
    auctions,
    selectedCategory,
    selectCategory,
    loading,
    error,
  }
}
