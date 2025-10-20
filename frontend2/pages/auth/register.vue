<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block mb-2 font-medium">Họ tên</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
            placeholder="Nhập họ tên"
          />
        </div>

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
          Đăng ký
        </button>
      </form>

      <p class="text-center mt-4 text-sm">
        Đã có tài khoản?
        <NuxtLink to="/auth/login" class="text-blue-600 hover:underline">Đăng nhập</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const handleRegister = async () => {
  try {
    const res = await $fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value }
    })
    alert('Đăng ký thành công!')
    router.push('/auth/login')
  } catch (err) {
    alert('Đăng ký thất bại: ' + err?.data?.message || err.message)
  }
}
</script>
