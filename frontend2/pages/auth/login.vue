<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">BidDora</h1>
        <p class="text-gray-600">Nền tảng đấu giá trực tuyến</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h2>
        <p class="text-gray-600 mb-6">Đăng nhập để tiếp tục</p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- EMAIL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': fieldErrors.email.length }"
                placeholder="your@email.com"
                autocomplete="email"
                @focus="fieldErrors.email = []"
              />
            </div>
            <!-- LỖI EMAIL -->
            <div v-if="fieldErrors.email.length" class="mt-2 space-y-1">
              <p v-for="msg in fieldErrors.email" :key="msg" class="text-xs text-red-600 flex items-center gap-1 animate-fade-in">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ msg }}
              </p>
            </div>
          </div>

          <!-- PASSWORD -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': fieldErrors.password.length || authError }"
                placeholder="••••••••"
                autocomplete="current-password"
                @focus="fieldErrors.password = []"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>

            <!-- LỖI PASSWORD -->
            <div v-if="fieldErrors.password.length" class="mt-2 space-y-1">
              <p v-for="msg in fieldErrors.password" :key="msg" class="text-xs text-red-600 flex items-center gap-1 animate-fade-in">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ msg }}
              </p>
            </div>

            <!-- LỖI CHUNG (sai tài khoản/mật khẩu) -->
            <div v-if="authError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-fade-in">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-700 font-medium">{{ authError }}</p>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" v-model="rememberMe" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Quên mật khẩu?</a>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Chưa có tài khoản?
            <NuxtLink to="/auth/register" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Đăng ký ngay
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCsrf } from '~/composables/useCsrf'

const router = useRouter()

// Form
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

// Lỗi validation theo field
interface FieldErrors {
  email: string[]
  password: string[]
}
const fieldErrors = ref<FieldErrors>({ email: [], password: [] })

// Lỗi xác thực (sai email/mật khẩu)
const authError = ref('')

// CSRF
const { csrfToken, fetchCsrf } = useCsrf()

const handleLogin = async () => {
  // Reset
  fieldErrors.value = { email: [], password: [] }
  authError.value = ''
  loading.value = true

  try {
    if (!csrfToken.value) await fetchCsrf()

    const res = await $fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken.value,
      },
      body: { email: email.value, password: password.value },
    })

    const token = res?.token
    if (token) {
      localStorage.setItem('jwt', token)
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('userEmail', email.value)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('userEmail')
      }

      alert('Đăng nhập thành công!')
      const user = res?.user
      router.push(user?.role === 'Admin' ? '/admin' : '/auction')
    }
  } catch (err: any) {
    console.log('LỖI ĐĂNG NHẬP:', err)
    console.log('err.response:', err.response)

    const response = err.response
    if (response?._data) {
      const data = response._data
      const status = response.status

      // Reset
      fieldErrors.value = { email: [], password: [] }
      authError.value = ''

      // 1. Lỗi validation (400) - data là object theo field
      if (status === 400 && data && typeof data === 'object') {
        // Kiểm tra nếu có field email/password
        if (data.email) fieldErrors.value.email = Array.isArray(data.email) ? data.email : [data.email]
        if (data.password) fieldErrors.value.password = Array.isArray(data.password) ? data.password : [data.password]
      }
      // 2. Lỗi xác thực (401)
      else if (status === 401) {
        authError.value = data?.message || 'Email hoặc mật khẩu không đúng'
      }
      // 3. Lỗi khác
      else {
        authError.value = 'Đăng nhập thất bại. Vui lòng thử lại.'
      }
    } else {
      authError.value = 'Không kết nối được server.'
    }
  } finally {
    loading.value = false
  }
}

// Remember Me
onMounted(() => {
  if (localStorage.getItem('rememberMe') === 'true') {
    email.value = localStorage.getItem('userEmail') || ''
    rememberMe.value = true
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
button:active {
  transform: scale(0.98);
}
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>