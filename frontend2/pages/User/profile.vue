<template>
  <div class="min-h-screen bg-white">
    <!-- Header tái sử dụng -->
    <Header />

    <!-- Phần thân -->
    <div class="border-b border-gray-200 py-6 px-10">
      <h1 class="text-3xl font-semibold text-gray-900">
        Hello {{ user?.name || 'Người dùng' }}
      </h1>
    </div>

    <div class="flex max-w-6xl mx-auto py-10 px-6">
      <!-- Sidebar trái -->
      <aside class="w-1/4 border-r border-gray-200 pr-8">
        <nav class="space-y-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key"
            class="flex items-center justify-between w-full text-left py-2 px-3 rounded-md transition"
            :class="currentTab === tab.key
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-gray-700 hover:bg-gray-50'">
            <span>{{ tab.label }}</span>
            <span v-if="tab.required" class="text-red-500 text-xs">●</span>
          </button>
        </nav>
      </aside>

      <!-- Nội dung chính -->
      <main class="flex-1 pl-10">
        <!-- Tab Account -->
        <section v-if="currentTab === 'account'">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Account</h2>

          <div class="space-y-6">
            <!-- Tên -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Name</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">{{ user?.name || '—' }}</p>
                <button
                  class="text-blue-600 text-sm font-medium hover:underline"
                  @click="showEditName = true">
                  Change
                </button>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Email</label>
              <div class="mt-1 text-gray-900">{{ user?.email || '—' }}</div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Password</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">********</p>
                <button
                  class="text-blue-600 text-sm font-medium hover:underline"
                  @click="showEditPassword = true">
                  Change
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal đổi tên -->
    <div
      v-if="showEditName"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 class="text-lg font-semibold mb-4">Đổi tên người dùng</h3>
        <input
          v-model="newName"
          type="text"
          placeholder="Nhập tên mới"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div class="flex justify-end space-x-3 mt-5">
          <button
            @click="showEditName = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Hủy
          </button>
          <button
            @click="updateName"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Lưu
          </button>
        </div>
      </div>
    </div>

    <!-- Modal đổi mật khẩu -->
    <div
      v-if="showEditPassword"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 class="text-lg font-semibold mb-4">Đổi mật khẩu</h3>

        <div class="space-y-3">
          <input
            v-model="oldPassword"
            type="password"
            placeholder="Mật khẩu cũ"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <input
            v-model="newPassword"
            type="password"
            placeholder="Mật khẩu mới"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex justify-end space-x-3 mt-5">
          <button
            @click="showEditPassword = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Hủy
          </button>
          <button
            @click="updatePassword"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Lưu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '~/components/User/Header.vue'

const user = ref(null)
const currentTab = ref('account')

const showEditName = ref(false)
const showEditPassword = ref(false)

const newName = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const tabs = [
  { key: 'account', label: 'Account', required: true },
  { key: 'addresses', label: 'Addresses', required: true },
  { key: 'payment', label: 'Payment', required: true },
  { key: 'notifications', label: 'Emails & Notifications', required: true },
  { key: 'verification', label: 'Verification', required: true },
]

// Lấy thông tin user
onMounted(async () => {
  const token = localStorage.getItem('jwt')
  if (!token) return

  try {
    const res = await $fetch('http://localhost:3001/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    user.value = res
  } catch (err) {
    console.error('Lỗi tải thông tin user:', err)
  }
})

// Cập nhật tên người dùng
const updateName = async () => {
  if (!newName.value.trim()) {
    alert('Vui lòng nhập tên mới!')
    return
  }

  const token = localStorage.getItem('jwt')
  if (!token) return

  try {
    await $fetch('http://localhost:3001/users/update-name', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: { name: newName.value },
    })

    user.value.name = newName.value
    showEditName.value = false
    newName.value = ''
    alert('Cập nhật tên thành công!')
  } catch (err) {
    console.error('Lỗi cập nhật tên:', err)
    alert('Đã xảy ra lỗi khi cập nhật tên.')
  }
}

// Cập nhật mật khẩu người dùng
const updatePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('Vui lòng nhập đầy đủ thông tin!')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('Mật khẩu xác nhận không khớp!')
    return
  }

  const token = localStorage.getItem('jwt')
  if (!token) return

  try {
    await $fetch('http://localhost:3001/users/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
    })

    showEditPassword.value = false
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    alert('Đổi mật khẩu thành công!')
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err)
    alert('Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.')
  }
}
</script>
