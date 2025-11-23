<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">
        🔐 Đặt lại mật khẩu
      </h2>

      <div v-if="success" class="text-green-600 text-center">
        ✅ {{ success }}
      </div>

      <div v-else>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Mật khẩu mới</label>
          <input
            type="password"
            v-model="newPassword"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Xác nhận mật khẩu</label>
          <input
            type="password"
            v-model="confirmPassword"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm mb-4 text-center">
          {{ error }}
        </div>

        <button
          @click="resetPassword"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          <span v-if="!loading">Đặt lại mật khẩu</span>
          <span v-else>⏳ Đang xử lý...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const API_BASE = 'http://localhost:3001/users'

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// 🧩 Lấy token từ URL
const token = route.query.token as string

// 🟢 Gửi request reset password
const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  if (!token) {
    error.value = 'Token không hợp lệ hoặc đã hết hạn.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        newPassword: newPassword.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại')
    success.value = data.message

    // ⏳ Tự động quay lại login sau 3s
    setTimeout(() => router.push('/auth/login'), 3000)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
