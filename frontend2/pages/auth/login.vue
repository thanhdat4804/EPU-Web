<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block mb-2 font-medium">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
            placeholder="Nhập email"
          />
        </div>

        <div class="mb-6">
          <label class="block mb-2 font-medium">Mật khẩu</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </form>

      <p class="text-center mt-4 text-sm">
        Chưa có tài khoản?
        <NuxtLink to="/register" class="text-blue-600 hover:underline">Đăng ký</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await $fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    // 🟢 Backend NestJS thường trả về { access_token: '...' }
    const token = res?.access_token || res?.token
    if (token) {
      localStorage.setItem('jwt', token) // ✅ dùng cùng key với chỗ gọi API
      alert('Đăng nhập thành công!')
      router.push('/User') // ✅ Redirect sang danh sách đấu giá
    } else {
      alert('Không nhận được token từ server')
    }
  } catch (err) {
    console.error(err)
    alert('Đăng nhập thất bại: ' + (err?.data?.message || err.message))
  }
}
</script>
