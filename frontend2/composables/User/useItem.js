export const useItem = () => {
  const item = useState('item', () => null)
  const items = useState('items', () => [])
  const loading = useState('itemLoading', () => false)
  const error = useState('itemError', () => null)

  // ✅ Lấy 1 item theo ID
  const fetchItem = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch(`http://localhost:3001/items/${id}`)
      item.value = res
    } catch (err) {
      console.error('❌ Lỗi khi tải item:', err)
      error.value = err.message || 'Không thể tải dữ liệu vật phẩm'
    } finally {
      loading.value = false
    }
  }

  // ✅ Tìm kiếm item theo tên
  const searchItemsByName = async (name) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch(`http://localhost:3001/items/search/by-name?name=${encodeURIComponent(name)}`)
      items.value = res
    } catch (err) {
      console.error('❌ Lỗi khi tìm item theo tên:', err)
      error.value = err.message || 'Không thể tìm kiếm vật phẩm'
    } finally {
      loading.value = false
    }
  }

  // ✅ Xóa kết quả (reset state)
  const clearItems = () => {
    item.value = null
    items.value = []
    error.value = null
  }

  return {
    item,
    items,
    loading,
    error,
    fetchItem,
    searchItemsByName,
    clearItems,
  }
}
