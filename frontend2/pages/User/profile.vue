<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Banner -->
    <div class="border-b border-gray-200 py-8 px-10 bg-white shadow-sm">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
        Hello, {{ user?.name || 'Người dùng' }}
      </h1>
      <p class="text-gray-500 mt-1">Quản lý thông tin tài khoản của bạn</p>
    </div>

    <!-- Main Content -->
    <div class="flex max-w-6xl mx-auto py-10 px-6 gap-8">
      <!-- Sidebar -->
      <aside class="w-1/4 bg-white shadow-sm rounded-xl border border-gray-100 p-4 h-fit sticky top-20 transition-all">
        <nav class="space-y-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key"
            class="flex items-center w-full px-4 py-2 rounded-lg transition-all duration-300"
            :class="currentTab === tab.key
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'">
            <component :is="tab.icon" class="w-5 h-5 mr-2" />
            <span class="font-medium">{{ tab.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main -->
      <main class="flex-1 transition-all duration-500">
      <transition name="fade" mode="out-in">
        <div :key="currentTab">
          <!-- Account Tab -->
          <section v-if="currentTab === 'account'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-8">Tài khoản</h2>
            <div class="space-y-8">
              <!-- Name -->
              <div class="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 class="font-semibold text-gray-700">Tên</h3>
                  <p class="text-gray-600 mt-1">{{ user?.name || '—' }}</p>
                </div>
                <button class="text-blue-600 hover:text-blue-800 font-medium transition" @click="showEditName = true">
                  Thay đổi
                </button>
              </div>
              <!-- Email -->
              <div class="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 class="font-semibold text-gray-700">Email</h3>
                  <p class="text-gray-600 mt-1">{{ user?.email || '—' }}</p>
                </div>
              </div>
              <!-- Password -->
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold text-gray-700">Mật khẩu</h3>
                  <p class="text-gray-600 mt-1">********</p>
                </div>
                <button class="text-blue-600 hover:text-blue-800 font-medium transition" @click="showEditPassword = true">
                  Thay đổi
                </button>
              </div>
            </div>
          </section>

          <!-- Addresses Tab -->
          <section v-else-if="currentTab === 'addresses'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h2>
              <button @click="openAddAddress"
                      class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                + Thêm địa chỉ
              </button>
            </div>

            <div v-if="addresses.length === 0" class="text-center py-12 text-gray-500">
              Chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!
            </div>

            <div v-else class="space-y-4">
              <div v-for="addr in addresses" :key="addr.id"
                  class="border border-gray-200 rounded-lg p-5 flex justify-between items-start hover:border-blue-300 transition">
                <div>
                  <p class="font-medium text-gray-800">{{ addr.address }}</p>
                  <p class="text-gray-600 mt-1">{{ addr.country }}</p>
                </div>
                <div class="flex gap-4">
                  <button @click="openEditAddress(addr)" class="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                  <button @click="deleteAddress(addr.id)" class="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Tab mặc định (nếu cần thêm tab khác sau này) -->
          <section v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>Chưa có nội dung cho tab này</p>
          </section>
        </div>
      </transition>
    </main>
    </div>

    <!-- Modal: Đổi tên -->
    <transition name="fade">
      <div v-if="showEditName" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-96 p-6 animate-fadeIn">
          <h3 class="text-lg font-semibold mb-4">Đổi tên người dùng</h3>
          <input v-model="newName" type="text" placeholder="Nhập tên mới"
                 class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          <div class="flex justify-end space-x-3 mt-5">
            <button @click="showEditName = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Hủy
            </button>
            <button @click="updateName" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Đổi mật khẩu -->
    <transition name="fade">
      <div v-if="showEditPassword" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-96 p-6 animate-fadeIn">
          <h3 class="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
          <div class="space-y-3">
            <input v-model="oldPassword" type="password" placeholder="Mật khẩu cũ"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="newPassword" type="password" placeholder="Mật khẩu mới"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="confirmPassword" type="password" placeholder="Xác nhận mật khẩu mới"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="flex justify-end space-x-3 mt-5">
            <button @click="showEditPassword = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Hủy
            </button>
            <button @click="updatePassword" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Thêm / Sửa địa chỉ -->
    <transition name="fade">
      <div v-if="showAddAddress" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-96 p-6 animate-fadeIn">
          <h3 class="text-lg font-semibold mb-4">
            {{ editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}
          </h3>
          <div class="space-y-4">
            <input v-model="addrForm.address" type="text" placeholder="Địa chỉ chi tiết (số nhà, đường, phường...)"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="addrForm.country" type="text" placeholder="Quốc gia"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="showAddAddress = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Hủy
            </button>
            <button @click="saveAddress" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '~/components/User/Header.vue'
import { User, Home, Bell, Lock } from 'lucide-vue-next'
import { useCsrf } from '~/composables/useCsrf'

const { csrfToken, fetchCsrf } = useCsrf()

// Dữ liệu chung
const user = ref(null)
const currentTab = ref('account')

// Tabs
const tabs = [
  { key: 'account', label: 'Tài khoản', icon: User },
  { key: 'addresses', label: 'Địa chỉ', icon: Home },
  { key: 'notifications', label: 'Thông báo', icon: Bell },
]

// --- Tài khoản ---
const showEditName = ref(false)
const showEditPassword = ref(false)
const newName = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// --- Địa chỉ ---
const addresses = ref([])
const showAddAddress = ref(false)
const editingAddress = ref(null)
const addrForm = ref({ address: '', country: '' })

// Load user + địa chỉ
const loadUser = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return
  try {
    user.value = await $fetch('http://localhost:3001/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err) {
    console.error('Lỗi tải thông tin user:', err)
  }
}

const loadAddresses = async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return
  try {
    addresses.value = await $fetch('http://localhost:3001/users/address', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err) {
    console.error('Lỗi tải địa chỉ:', err)
  }
}

onMounted(async () => {
  await fetchCsrf()
  await loadUser()
  await loadAddresses()
})

// Cập nhật tên
const updateName = async () => {
  if (!newName.value.trim()) return alert('Vui lòng nhập tên mới!')
  const token = localStorage.getItem('jwt')
  try {
    await $fetch('http://localhost:3001/users/update-name', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken.value,
      },
      body: { name: newName.value },
    })
    user.value.name = newName.value
    newName.value = ''
    showEditName.value = false
    alert('Cập nhật tên thành công!')
  } catch {
    alert('Lỗi cập nhật tên!')
  }
}

// Cập nhật mật khẩu
const updatePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value)
    return alert('Vui lòng nhập đầy đủ thông tin!')
  if (newPassword.value !== confirmPassword.value)
    return alert('Mật khẩu xác nhận không khớp!')

  const token = localStorage.getItem('jwt')
  try {
    await $fetch('http://localhost:3001/users/update-password', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken.value,
      },
      body: { oldPassword: oldPassword.value, newPassword: newPassword.value },
    })
    alert('Đổi mật khẩu thành công!')
    showEditPassword.value = false
    oldPassword.value = newPassword.value = confirmPassword.value = ''
  } catch {
    alert('Sai mật khẩu cũ hoặc lỗi server!')
  }
}

// --- Quản lý địa chỉ ---
const openAddAddress = () => {
  editingAddress.value = null
  addrForm.value = { address: '', country: '' }
  showAddAddress.value = true
}

const openEditAddress = (addr) => {
  editingAddress.value = addr
  addrForm.value = { address: addr.address, country: addr.country }
  showAddAddress.value = true
}

const saveAddress = async () => {
  if (!addrForm.value.address.trim() || !addrForm.value.country.trim())
    return alert('Vui lòng nhập đầy đủ thông tin!')

  const token = localStorage.getItem('jwt')
  const isEdit = !!editingAddress.value

  try {
    await $fetch('http://localhost:3001/users/address', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken.value,
      },
      body: isEdit
        ? { id: editingAddress.value.id, ...addrForm.value }
        : addrForm.value,
    })

    alert(isEdit ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!')
    showAddAddress.value = false
    await loadAddresses()
  } catch (e) {
    alert('Lỗi: ' + (e?.data?.message || 'Không thể lưu địa chỉ'))
  }
}

const deleteAddress = async (id) => {
  if (!confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) return

  const token = localStorage.getItem('jwt')
  try {
    await $fetch('http://localhost:3001/users/address', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken.value,
      },
      body: { id },
    })
    alert('Xóa thành công!')
    await loadAddresses()
  } catch {
    alert('Lỗi xóa địa chỉ')
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>