<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/admin/users" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
        <p class="text-gray-600">Tạo tài khoản người dùng mới trong hệ thống</p>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+84 123 456 789"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                v-model="form.dateOfBirth"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <textarea
              v-model="form.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Địa chỉ chi tiết..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt tài khoản</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn vai trò</option>
                <option value="buyer">Người mua</option>
                <option value="seller">Người bán</option>
                <option value="expert">Chuyên gia</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              v-model="form.verified"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <div>
              <label class="text-sm font-medium text-gray-900">Tài khoản đã xác thực</label>
              <p class="text-xs text-gray-500">Bỏ qua bước xác thực email</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              v-model="form.sendWelcomeEmail"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <div>
              <label class="text-sm font-medium text-gray-900">Gửi email chào mừng</label>
              <p class="text-xs text-gray-500">Gửi email thông báo tài khoản đã được tạo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Info (if seller or expert) -->
      <div v-if="form.role === 'seller' || form.role === 'expert'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h2>
        
        <div class="space-y-4">
          <div v-if="form.role === 'seller'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Danh mục quan tâm
            </label>
            <div class="grid grid-cols-3 gap-3">
              <label v-for="cat in categories" :key="cat.value" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :value="cat.value"
                  v-model="form.categories"
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm">{{ cat.label }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.role === 'expert'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chuyên môn
            </label>
            <div class="grid grid-cols-3 gap-3">
              <label v-for="spec in specialties" :key="spec.value" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :value="spec.value"
                  v-model="form.specialties"
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm">{{ spec.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Giới thiệu
            </label>
            <textarea
              v-model="form.bio"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Giới thiệu về người dùng..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4">
        <NuxtLink
          to="/admin/users"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </NuxtLink>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo người dùng
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  role: '',
  status: 'active',
  password: '',
  confirmPassword: '',
  verified: false,
  sendWelcomeEmail: true,
  categories: [],
  specialties: [],
  bio: ''
})

const categories = [
  { value: 'art', label: 'Nghệ thuật' },
  { value: 'jewelry', label: 'Trang sức' },
  { value: 'watches', label: 'Đồng hồ' },
  { value: 'antiques', label: 'Đồ cổ' },
  { value: 'cars', label: 'Xe cổ' },
  { value: 'wine', label: 'Rượu vang' }
]

const specialties = [
  { value: 'art', label: 'Nghệ thuật' },
  { value: 'jewelry', label: 'Trang sức' },
  { value: 'watches', label: 'Đồng hồ' },
  { value: 'antiques', label: 'Đồ cổ' },
  { value: 'cars', label: 'Xe cổ' },
  { value: 'wine', label: 'Rượu vang' }
]

const submitForm = () => {
  // Validate password match
  if (form.value.password !== form.value.confirmPassword) {
    alert('Mật khẩu xác nhận không khớp!')
    return
  }

  console.log('Form submitted:', form.value)
  
  // TODO: Call API to create user
  
  alert('Người dùng đã được tạo thành công!')
  router.push('/admin/users')
}
</script>