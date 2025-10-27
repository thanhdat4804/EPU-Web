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
              : 'text-gray-700 hover:bg-gray-50'"
          >
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
                <button class="text-blue-600 text-sm font-medium hover:underline" @click="editField('name')">
                  Change
                </button>
              </div>
            </div>

            <!-- Username -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Username</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">{{ user?.username || 'user-' + user?.id }}</p>
                <p class="text-sm text-gray-500">You can’t edit your username.</p>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Email</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">{{ user?.email || '—' }}</p>
                <button class="text-blue-600 text-sm font-medium hover:underline" @click="editField('email')">
                  Change
                </button>
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Password</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">********</p>
                <button class="text-blue-600 text-sm font-medium hover:underline" @click="editField('password')">
                  Change
                </button>
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-semibold text-gray-700">Phone number</label>
              <div class="flex items-center justify-between mt-1">
                <p class="text-gray-900">{{ user?.phone || 'Not added' }}</p>
                <button class="text-blue-600 text-sm font-medium hover:underline" @click="editField('phone')">
                  {{ user?.phone ? 'Change' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Các tab khác -->
        <section v-else-if="currentTab === 'addresses'">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Addresses</h2>
          <p class="text-gray-600">Bạn chưa có địa chỉ nào.</p>
        </section>

        <section v-else-if="currentTab === 'payment'">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Payment</h2>
          <p class="text-gray-600">Chưa có phương thức thanh toán được lưu.</p>
        </section>

        <section v-else-if="currentTab === 'notifications'">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Emails & Notifications</h2>
          <p class="text-gray-600">Quản lý thông báo và email nhận được.</p>
        </section>

        <section v-else-if="currentTab === 'verification'">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Verification</h2>
          <p class="text-gray-600">Xác minh tài khoản để bảo mật tốt hơn.</p>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '~/components/User/Header.vue'

const user = ref(null)
const currentTab = ref('account')

const tabs = [
  { key: 'account', label: 'Account', required: true },
  { key: 'addresses', label: 'Addresses', required: true },
  { key: 'payment', label: 'Payment', required: true },
  { key: 'notifications', label: 'Emails & Notifications', required: true },
  { key: 'verification', label: 'Verification', required: true },
]

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

const editField = (field) => {
  alert(`Chức năng chỉnh sửa ${field} sẽ được thêm sau.`)
}
</script>
