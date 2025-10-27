export const useItem = () => {
  const item = useState('item', () => null)

  const fetchItem = async (id) => {
    try {
      const res = await $fetch(`http://localhost:3001/items/${id}`)
      item.value = res
    } catch (err) {
      console.error('Lỗi khi tải item:', err)
    }
  }

  return { item, fetchItem }
}
