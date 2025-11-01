<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
        <p class="text-gray-600">Quản lý yêu cầu hỗ trợ và ticket từ người dùng</p>
      </div>
     
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">Tổng ticket</div>
            <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.total }}</div>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Chờ xử lý</div>
        <div class="text-2xl font-bold text-yellow-600 mt-2">{{ stats.pending }}</div>
        <div class="text-sm text-gray-500 mt-1">Cần phản hồi</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đang xử lý</div>
        <div class="text-2xl font-bold text-blue-600 mt-2">{{ stats.inProgress }}</div>
        <div class="text-sm text-gray-500 mt-1">Đang giải quyết</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đã giải quyết</div>
        <div class="text-2xl font-bold text-green-600 mt-2">{{ stats.resolved }}</div>
        <div class="text-sm text-green-600 mt-1">+{{ stats.resolvedToday }} hôm nay</div>
      </div>
    </div>

    <!-- Filters & Tabs -->
    <div class="bg-white rounded-lg shadow">
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tab.count"
              :class="[
                'ml-2 px-2 py-0.5 text-xs rounded-full',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filters -->
      <div class="p-4 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
            <select v-model="filters.priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Tất cả</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select v-model="filters.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Tất cả</option>
              <option value="technical">Kỹ thuật</option>
              <option value="payment">Thanh toán</option>
              <option value="account">Tài khoản</option>
              <option value="auction">Đấu giá</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Mã ticket, tên người dùng..."
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
    </div>

    <!-- Tickets List -->
    <div class="space-y-4">
      <div
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="viewTicket(ticket)"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <!-- Left side -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-mono text-gray-500">#{{ ticket.id }}</span>
                <span :class="getPriorityBadge(ticket.priority)" class="px-2 py-1 text-xs font-semibold rounded">
                  {{ getPriorityText(ticket.priority) }}
                </span>
                <span :class="getCategoryBadge(ticket.category)" class="px-2 py-1 text-xs rounded">
                  {{ getCategoryText(ticket.category) }}
                </span>
              </div>

              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ ticket.subject }}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ ticket.description }}</p>

              <div class="flex items-center gap-4 text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <img :src="ticket.user.avatar" :alt="ticket.user.name" class="w-6 h-6 rounded-full" />
                  <span>{{ ticket.user.name }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ ticket.createdAt }}</span>
                </div>
                <div v-if="ticket.assignee" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ ticket.assignee }}</span>
                </div>
              </div>
            </div>

            <!-- Right side -->
            <div class="flex flex-col items-end gap-3 ml-4">
              <span :class="getStatusBadge(ticket.status)" class="px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                {{ getStatusText(ticket.status) }}
              </span>
              
              <div class="flex items-center gap-2">
                <button
                  @click.stop="assignTicket(ticket.id)"
                  class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Gán
                </button>
                <button
                  @click.stop="resolveTicket(ticket.id)"
                  class="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  Giải quyết
                </button>
              </div>

              <!-- Response Count -->
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ ticket.responseCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTickets.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Không có ticket nào</h3>
      <p class="text-gray-600">Chưa có yêu cầu hỗ trợ nào phù hợp với bộ lọc</p>
    </div>

    <!-- Pagination -->
    <div v-if="filteredTickets.length > 0" class="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
      <div class="text-sm text-gray-700">
        Hiển thị <span class="font-medium">1</span> đến <span class="font-medium">{{ filteredTickets.length }}</span> trong <span class="font-medium">{{ stats.total }}</span> kết quả
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Trước</button>
        <button class="px-3 py-1 bg-blue-600 text-white rounded">1</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Sau</button>
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'admin'
})

const stats = ref({
  total: 156,
  pending: 23,
  inProgress: 45,
  resolved: 88,
  resolvedToday: 12
})

const activeTab = ref('all')

const tabs = [
  { id: 'all', label: 'Tất cả', count: 156 },
  { id: 'pending', label: 'Chờ xử lý', count: 23 },
  { id: 'inProgress', label: 'Đang xử lý', count: 45 },
  { id: 'resolved', label: 'Đã giải quyết', count: 88 }
]

const filters = ref({
  priority: '',
  category: '',
  search: ''
})

const showCreateTicket = ref(false)

const newTicket = ref({
  subject: '',
  category: '',
  priority: 'medium',
  description: ''
})

const tickets = ref([
  {
    id: 'TK-2024-001',
    subject: 'Không thể thanh toán sau khi thắng đấu giá',
    description: 'Tôi đã thắng đấu giá một món đồ nhưng khi nhấn thanh toán thì trang báo lỗi. Đã thử nhiều lần nhưng vẫn không được.',
    category: 'payment',
    priority: 'urgent',
    status: 'pending',
    user: {
      name: 'Nguyễn Văn A',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff'
    },
    assignee: null,
    responseCount: 0,
    createdAt: '2 giờ trước',
    updatedAt: '2 giờ trước'
  },
  {
    id: 'TK-2024-002',
    subject: 'Tài khoản bị khóa không rõ lý do',
    description: 'Sáng nay đăng nhập vào thì thấy tài khoản bị khóa. Tôi chưa vi phạm gì cả. Mong được hỗ trợ mở khóa.',
    category: 'account',
    priority: 'high',
    status: 'inProgress',
    user: {
      name: 'Trần Thị B',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=ec4899&color=fff'
    },
    assignee: 'Admin 1',
    responseCount: 3,
    createdAt: '5 giờ trước',
    updatedAt: '1 giờ trước'
  },
  {
    id: 'TK-2024-003',
    subject: 'Làm thế nào để upload nhiều ảnh cho sản phẩm?',
    description: 'Tôi muốn đăng bán một bộ sưu tập đồng hồ nhưng không biết cách upload nhiều ảnh. Có thể hỗ trợ không?',
    category: 'technical',
    priority: 'low',
    status: 'resolved',
    user: {
      name: 'Lê Văn C',
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=10b981&color=fff'
    },
    assignee: 'Admin 2',
    responseCount: 5,
    createdAt: '1 ngày trước',
    updatedAt: '3 giờ trước'
  },
  {
    id: 'TK-2024-004',
    subject: 'Đấu giá bị gián đoạn khi sắp kết thúc',
    description: 'Phiên đấu giá đồng hồ Rolex hôm qua bị gián đoạn 2 lần trong 10 phút cuối. Tôi đã bị mất cơ hội thắng.',
    category: 'auction',
    priority: 'high',
    status: 'pending',
    user: {
      name: 'Phạm Thị D',
      avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=f59e0b&color=fff'
    },
    assignee: null,
    responseCount: 1,
    createdAt: '4 giờ trước',
    updatedAt: '4 giờ trước'
  }
])

const filteredTickets = computed(() => {
  let result = tickets.value

  // Filter by tab
  if (activeTab.value !== 'all') {
    result = result.filter(t => t.status === activeTab.value)
  }

  // Filter by priority
  if (filters.value.priority) {
    result = result.filter(t => t.priority === filters.value.priority)
  }

  // Filter by category
  if (filters.value.category) {
    result = result.filter(t => t.category === filters.value.category)
  }

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(t =>
      t.id.toLowerCase().includes(search) ||
      t.subject.toLowerCase().includes(search) ||
      t.user.name.toLowerCase().includes(search)
    )
  }

  return result
})

const getPriorityBadge = (priority) => {
  const badges = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return badges[priority] || badges.medium
}

const getPriorityText = (priority) => {
  const texts = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp'
  }
  return texts[priority] || priority
}

const getCategoryBadge = (category) => {
  return 'bg-purple-50 text-purple-700'
}

const getCategoryText = (category) => {
  const texts = {
    technical: 'Kỹ thuật',
    payment: 'Thanh toán',
    account: 'Tài khoản',
    auction: 'Đấu giá',
    other: 'Khác'
  }
  return texts[category] || category
}

const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    inProgress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || badges.pending
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Chờ xử lý',
    inProgress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng'
  }
  return texts[status] || status
}

const resetFilters = () => {
  filters.value = { priority: '', category: '', search: '' }
}

const viewTicket = (ticket) => {
  console.log('View ticket:', ticket)
  // Navigate to ticket detail page or open modal
}

const assignTicket = (id) => {
  console.log('Assign ticket:', id)
  // Show assign dialog
}

const resolveTicket = (id) => {
  if (confirm('Đánh dấu ticket này là đã giải quyết?')) {
    console.log('Resolve ticket:', id)
  }
}

const createTicket = () => {
  console.log('Create ticket:', newTicket.value)
  showCreateTicket.value = false
  newTicket.value = {
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  }
  alert('Ticket đã được tạo thành công!')
}
</script>