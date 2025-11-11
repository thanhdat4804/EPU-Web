<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">BidDora</h1>
        <p class="text-gray-600">Tạo tài khoản để bắt đầu đấu giá</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h2>
        <p class="text-gray-600 mb-6">Điền thông tin để tạo tài khoản mới</p>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                v-model="name"
                type="text"
                required
                minlength="2"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="your name"
              />
            </div>
          </div>

          <!-- Email Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                :class="{ 'border-red-500': emailError }"
                placeholder="your@email.com"
                @blur="validateEmail"
              />
            </div>
            <p v-if="emailError" class="text-red-500 text-xs mt-1">
              {{ emailError }}
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Tối thiểu 8 ký tự"
                @input="checkPasswordStrength"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  v-if="!showPassword"
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
            <!-- Password Strength Indicator -->
            <div v-if="password" class="mt-2">
              <div class="flex items-center gap-2">
                <div
                  class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
                >
                  <div
                    :class="passwordStrengthColor"
                    :style="{ width: passwordStrength + '%' }"
                    class="h-full transition-all duration-300"
                  ></div>
                </div>
                <span
                  :class="passwordStrengthColor"
                  class="text-xs font-medium"
                >
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                :class="{ 'border-red-500': passwordMismatch }"
                placeholder="Nhập lại mật khẩu"
                @input="checkPasswordMatch"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  v-if="!showConfirmPassword"
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">
              Mật khẩu không khớp
            </p>
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              v-model="agreeTerms"
              type="checkbox"
              required
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label class="text-sm text-gray-700">
              Tôi đồng ý với
              <a href="#" class="text-blue-600 hover:underline font-medium"
                >Điều khoản dịch vụ</a
              >
              và
              <a href="#" class="text-blue-600 hover:underline font-medium"
                >Chính sách bảo mật</a
              >
            </label>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ loading ? "Đang đăng ký..." : "Đăng ký" }}</span>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
          </div>

          <!-- Social Register -->
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Đã có tài khoản?
            <NuxtLink
              to="/auth/login"
              class="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Đăng nhập ngay
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Footer -->
     
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCsrf } from '~/composables/useCsrf'

const { csrfToken, fetchCsrf } = useCsrf()

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeTerms = ref(false);
const loading = ref(false);
const emailError = ref("");
const passwordMismatch = ref(false);
const passwordStrength = ref(0);
const router = useRouter();

// Lấy CSRF token khi component mount (nếu chưa có)
onMounted(async () => {
  try {
    if (!csrfToken.value) {
      await fetchCsrf();
    }
  } catch (err) {
    // Không block UI nếu fetch token thất bại, component vẫn cho phép thử
    console.warn('Không lấy được CSRF token lúc mount:', err);
  }
});

// Validate email format
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = "Email không hợp lệ";
  } else {
    emailError.value = "";
  }
};

// Check password strength
const checkPasswordStrength = () => {
  const pwd = password.value;
  let strength = 0;

  if (pwd.length >= 8) strength += 25;
  if (pwd.length >= 12) strength += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
  if (/[0-9]/.test(pwd)) strength += 12.5;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;

  passwordStrength.value = Math.min(strength, 100);
};

// Password strength color and text
const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 40) return "bg-red-500 text-red-600";
  if (passwordStrength.value < 70) return "bg-yellow-500 text-yellow-600";
  return "bg-green-500 text-green-600";
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return "Yếu";
  if (passwordStrength.value < 70) return "Trung bình";
  return "Mạnh";
});

// Check password match
const checkPasswordMatch = () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    passwordMismatch.value = true;
  } else {
    passwordMismatch.value = false;
  }
};

// Form validation
const isFormValid = computed(() => {
  return (
    name.value &&
    email.value &&
    !emailError.value &&
    password.value.length >= 8 &&
    confirmPassword.value === password.value &&
    agreeTerms.value
  );
});

const handleRegister = async () => {
  if (!isFormValid.value) {
    alert("❌ Vui lòng điền đầy đủ thông tin và đồng ý với điều khoản");
    return;
  }

  loading.value = true;

  try {
    // Nếu chưa có token thì fetch lại
    if (!csrfToken.value) {
      await fetchCsrf();
    }

    // Sau khi có token, gửi POST kèm header X-CSRF-Token và credentials: 'include'
    const res = await $fetch("http://localhost:3001/auth/register", {
      method: "POST",
      credentials: 'include', // bắt buộc để gửi cookie _csrf (và cookie session nếu dùng)
      headers: {
        "Content-Type": "application/json",
        // chỉ thêm header khi có token
        ...(csrfToken.value ? { "X-CSRF-Token": csrfToken.value } : {}),
      },
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
      },
    });

    alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
    router.push("/auth/login");
  } catch (err) {
    console.error("Register error:", err);
    const errorMessage =
      err?.data?.message || err?.message || "Đăng ký thất bại";
    alert("❌ " + errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
/* Smooth animations */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Gradient background animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
</style>
