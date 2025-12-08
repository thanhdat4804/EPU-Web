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

              <!-- Loading -->
              <div v-if="addressLoading" class="text-center py-12">
                <div class="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>

              <!-- Không có địa chỉ -->
              <div v-else-if="addresses.length === 0" class="text-center py-12 text-gray-500">
                Chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!
              </div>

              <!-- Danh sách địa chỉ -->
              <div v-else class="space-y-4">
                <div v-for="addr in addresses" :key="addr.id"
                     class="border border-gray-200 rounded-lg p-5 flex justify-between items-start hover:border-blue-300 transition"
                     :class="{ 'border-blue-500 bg-blue-50': addr.isDefault }">
                  <div>
                    <p class="font-medium text-gray-800 flex items-center gap-3">
                      {{ addr.recipientName }}
                      <span v-if="addr.isDefault" class="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Mặc định</span>
                    </p>
                    <p class="text-gray-600 mt-1">{{ addr.phone }}</p>
                    <p class="text-gray-600 mt-1">
                      {{ addr.addressLine }}, {{ addr.ward ? addr.ward + ', ' : '' }}
                      {{ addr.district }}, {{ addr.city }}, {{ addr.country }}
                    </p>
                  </div>
                  <div class="flex gap-4">
                    <button @click="openEditAddress(addr)" class="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                    <button v-if="!addr.isDefault" @click="deleteAddress(addr.id)" class="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                    <button v-if="!addr.isDefault" @click="setDefaultAddress(addr.id)" class="text-green-600 hover:text-green-800 font-medium">Đặt mặc định</button>
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

    <transition name="fade">
      <div v-if="showAddAddress" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-96 p-6 animate-fadeIn">
          <h3 class="text-lg font-semibold mb-4">
            {{ editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}
          </h3>
          <div class="space-y-4">
            <input v-model="addrForm.recipientName" type="text" placeholder="Họ tên người nhận"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="addrForm.phone" type="text" placeholder="Số điện thoại"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="addrForm.addressLine" type="text" placeholder="Địa chỉ chi tiết"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="addrForm.district" type="text" placeholder="Quận/Huyện"
                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            <input v-model="addrForm.city" type="text" placeholder="Tỉnh/Thành phố"
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '~/components/User/Header.vue'
import { User, Home, Bell } from 'lucide-vue-next'
import { useUserAddress } from '~/composables/useUserAddress'

// === CHUNG ===
const user = ref<any>(null)
const currentTab = ref('account')

const tabs = [
  { key: 'account', label: 'Tài khoản', icon: User },
  { key: 'addresses', label: 'Địa chỉ', icon: Home },
  { key: 'notifications', label: 'Thông báo', icon: Bell },
]

// === TÀI KHOẢN ===
const showEditName = ref(false)
const showEditPassword = ref(false)
const newName = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// === ĐỊA CHỈ – DÙNG useUserAddress ===
const {
  addresses,
  loading: addressLoading,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = useUserAddress()

const showAddAddress = ref(false)
const editingAddress = ref<any>(null)
const addrForm = ref({
  recipientName: '',
  phone: '',
  addressLine: '',
  ward: '',
  district: '',
  city: '',
  country: 'Việt Nam',
  isDefault: false
})

// === CHỈ 1 onMounted DUY NHẤT ===
onMounted(async () => {
  const jwt = localStorage.getItem('jwt')
  if (jwt) {
    try {
      user.value = await $fetch('http://localhost:3001/users/me', {
        headers: { Authorization: `Bearer ${jwt}` }
      })
    } catch (err) {
      localStorage.removeItem('jwt')
    }
  }

  // Chỉ load địa chỉ khi vào tab này
  if (currentTab.value === 'addresses') {
    await getAddresses()
  }
})

// === ĐỊA CHỈ ===
const openAddAddress = () => {
  editingAddress.value = null
  addrForm.value = {
    recipientName: '',
    phone: '',
    addressLine: '',
    ward: '',
    district: '',
    city: '',
    country: 'Việt Nam',
    isDefault: false
  }
  showAddAddress.value = true
}

const openEditAddress = (addr: any) => {
  editingAddress.value = addr
  addrForm.value = { ...addr }
  showAddAddress.value = true
}

const saveAddress = async () => {
  if (!addrForm.value.recipientName?.trim() || !addrForm.value.phone?.trim() || !addrForm.value.addressLine?.trim()) {
    return alert('Vui lòng điền đầy đủ!')
  }
  try {
    if (editingAddress.value) {
      await updateAddress(editingAddress.value.id, addrForm.value)
    } else {
      await createAddress(addrForm.value)
    }
    showAddAddress.value = false
    alert('Lưu thành công!')
  } catch (err) {
    alert('Lỗi lưu địa chỉ')
  }
}

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