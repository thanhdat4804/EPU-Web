<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý chuyên gia thẩm định</h1>
        <p class="text-gray-600">Danh sách các chuyên gia thẩm định sản phẩm đấu giá</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm chuyên gia
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">Tổng chuyên gia</div>
            <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.total }}</div>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đang hoạt động</div>
        <div class="text-2xl font-bold text-green-600 mt-2">{{ stats.active }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ stats.activePercentage }}% tổng số</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Lots đã thẩm định</div>
        <div class="text-2xl font-bold text-purple-600 mt-2">{{ stats.lotsReviewed }}</div>
        <div class="text-sm text-gray-500 mt-1">Tháng này</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Chờ phê duyệt</div>
        <div class="text-2xl font-bold text-yellow-600 mt-2">{{ stats.pending }}</div>
        <div class="text-sm text-gray-500 mt-1">Lots đang chờ</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Chuyên môn</label>
          <select v-model="filters.specialty" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="art">Nghệ thuật</option>
            <option value="jewelry">Trang sức</option>
            <option value="watches">Đồng hồ</option>
            <option value="antiques">Đồ cổ</option>
            <option value="cars">Xe cổ</option>
            <option value="wine">Rượu vang</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="busy">Bận</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tên chuyên gia..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- Experts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="expert in experts"
        :key="expert.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <!-- Expert Header -->
          <div class="flex items-start gap-4 mb-4">
            <img
              :src="expert.avatar"
              :alt="expert.name"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ expert.name }}</h3>
                <svg v-if="expert.verified" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="text-sm text-gray-600 mb-2">{{ expert.title }}</div>
              <span :class="getStatusBadge(expert.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(expert.status) }}
              </span>
            </div>
          </div>

          <!-- Specialties -->
          <div class="mb-4">
            <div class="text-xs font-medium text-gray-500 mb-2">Chuyên môn</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="specialty in expert.specialties"
                :key="specialty"
                class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
              >
                {{ getSpecialtyText(specialty) }}
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
            <div class="text-center">
              <div class="text-lg font-bold text-gray-900">{{ expert.lotsReviewed }}</div>
              <div class="text-xs text-gray-500">Đã thẩm định</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-gray-900">{{ expert.avgTime }}h</div>
              <div class="text-xs text-gray-500">TB xử lý</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-green-600">{{ expert.rating }}</div>
              <div class="text-xs text-gray-500">Đánh giá</div>
            </div>
          </div>

          <!-- Contact -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ expert.email }}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ expert.phone }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="viewExpert(expert.id)"
              class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xem chi tiết
            </button>
            <button
              @click="editExpert(expert.id)"
              class="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Expert Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Thêm chuyên gia mới</h2>
          <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="addExpert" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                v-model="newExpert.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Chức danh</label>
              <input
                v-model="newExpert.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="VD: Chuyên gia đồng hồ cao cấp"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="newExpert.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                v-model="newExpert.phone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Chuyên môn</label>
            <div class="grid grid-cols-3 gap-3">
              <label v-for="spec in specialtyOptions" :key="spec.value" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :value="spec.value"
                  v-model="newExpert.specialties"
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm">{{ spec.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm (năm)</label>
            <input
              v-model.number="newExpert.experience"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
            <textarea
              v-model="newExpert.bio"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Mô tả về chuyên gia..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thêm chuyên gia
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const stats = ref({
  total: 24,
  active: 18,
  activePercentage: 75,
  lotsReviewed: 342,
  pending: 15
})

const filters = ref({
  specialty: '',
  status: '',
  search: ''
})

const showAddModal = ref(false)

const specialtyOptions = [
  { value: 'art', label: 'Nghệ thuật' },
  { value: 'jewelry', label: 'Trang sức' },
  { value: 'watches', label: 'Đồng hồ' },
  { value: 'antiques', label: 'Đồ cổ' },
  { value: 'cars', label: 'Xe cổ' },
  { value: 'wine', label: 'Rượu vang' }
]

const newExpert = ref({
  name: '',
  title: '',
  email: '',
  phone: '',
  specialties: [],
  experience: 0,
  bio: ''
})

const experts = ref([
  {
    id: 1,
    name: 'Dr. Robert Chen',
    title: 'Chuyên gia đồng hồ cao cấp',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Chen&background=3b82f6&color=fff',
    email: 'robert.chen@auction.com',
    phone: '+84 901 234 567',
    specialties: ['watches', 'jewelry'],
    status: 'active',
    verified: true,
    lotsReviewed: 156,
    avgTime: 2.5,
    rating: 4.9,
    experience: 15
  },
  {
    id: 2,
    name: 'Maria Garcia',
    title: 'Chuyên gia nghệ thuật đương đại',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
    email: 'maria.garcia@auction.com',
    phone: '+84 902 345 678',
    specialties: ['art'],
    status: 'active',
    verified: true,
    lotsReviewed: 234,
    avgTime: 3.2,
    rating: 4.8,
    experience: 20
  },
  {
    id: 3,
    name: 'John Smith',
    title: 'Chuyên gia xe cổ và đồ cổ',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=10b981&color=fff',
    email: 'john.smith@auction.com',
    phone: '+84 903 456 789',
    specialties: ['cars', 'antiques'],
    status: 'busy',
    verified: true,
    lotsReviewed: 89,
    avgTime: 4.1,
    rating: 4.7,
    experience: 12
  },
  {
    id: 4,
    name: 'Sophie Laurent',
    title: 'Chuyên gia trang sức kim cương',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=f59e0b&color=fff',
    email: 'sophie.laurent@auction.com',
    phone: '+84 904 567 890',
    specialties: ['jewelry'],
    status: 'active',
    verified: true,
    lotsReviewed: 198,
    avgTime: 2.8,
    rating: 4.9,
    experience: 18
  },
  {
    id: 5,
    name: 'David Anderson',
    title: 'Chuyên gia rượu vang quý hiếm',
    avatar: 'https://ui-avatars.com/api/?name=David+Anderson&background=8b5cf6&color=fff',
    email: 'david.anderson@auction.com',
    phone: '+84 905 678 901',
    specialties: ['wine'],
    status: 'active',
    verified: false,
    lotsReviewed: 67,
    avgTime: 1.9,
    rating: 4.6,
    experience: 10
  },
  {
    id: 6,
    name: 'Elena Petrova',
    title: 'Chuyên gia đồ cổ Châu Âu',
    avatar: 'https://ui-avatars.com/api/?name=Elena+Petrova&background=ef4444&color=fff',
    email: 'elena.petrova@auction.com',
    phone: '+84 906 789 012',
    specialties: ['antiques', 'art'],
    status: 'inactive',
    verified: true,
    lotsReviewed: 145,
    avgTime: 3.5,
    rating: 4.8,
    experience: 22
  }
])

const getStatusBadge = (status) => {
  const badges = {
    active: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || badges.active
}

const getStatusText = (status) => {
  const texts = {
    active: 'Đang hoạt động',
    busy: 'Bận',
    inactive: 'Tạm nghỉ'
  }
  return texts[status] || status
}

const getSpecialtyText = (specialty) => {
  const texts = {
    art: 'Nghệ thuật',
    jewelry: 'Trang sức',
    watches: 'Đồng hồ',
    antiques: 'Đồ cổ',
    cars: 'Xe cổ',
    wine: 'Rượu vang'
  }
  return texts[specialty] || specialty
}

const resetFilters = () => {
  filters.value = { specialty: '', status: '', search: '' }
}

const viewExpert = (id) => {
  console.log('View expert:', id)
}

const editExpert = (id) => {
  console.log('Edit expert:', id)
}

const addExpert = () => {
  console.log('Add expert:', newExpert.value)
  showAddModal.value = false
  newExpert.value = {
    name: '',
    title: '',
    email: '',
    phone: '',
    specialties: [],
    experience: 0,
    bio: ''
  }
  alert('Chuyên gia đã được thêm thành công!')
}
</script>