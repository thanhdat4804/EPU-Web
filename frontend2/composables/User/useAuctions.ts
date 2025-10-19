// composables/useAuctions.ts
import { ref, onMounted } from 'vue'

export function useAuctions() {
  const baseUrl = 'http://localhost:3001'

  const categories = ref([])
  const items = ref([])
  const selectedCategory = ref<'all' | number>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Lấy danh sách thể loại
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/categories`)
      categories.value = await res.json()
    } catch (err) {
      console.error('Lỗi khi lấy categories:', err)
      error.value = 'Không thể tải danh sách thể loại.'
    }
  }

  // Lấy danh sách item (tất cả hoặc theo thể loại)
  const fetchItems = async (category: 'all' | number = 'all') => {
    try {
      loading.value = true
      let url = `${baseUrl}/items`

      if (category !== 'all') {
        url = `${baseUrl}/categories/${category}`
        const res = await fetch(url)
        const data = await res.json()
        items.value = data.items || [] // vì categories/:id trả về category + items
      } else {
        const res = await fetch(url)
        items.value = await res.json()
      }
    } catch (err) {
      console.error('Lỗi khi lấy items:', err)
      error.value = 'Không thể tải danh sách sản phẩm.'
    } finally {
      loading.value = false
    }
  }

  // Chọn thể loại
  const selectCategory = async (category: 'all' | number) => {
    selectedCategory.value = category
    await fetchItems(category)
  }

  onMounted(async () => {
    await fetchCategories()
    await fetchItems()
  })

  return {
    categories,
    items,
    selectedCategory,
    selectCategory,
    loading,
    error,
  }
}
