<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
      <p class="text-gray-600">Theo dõi và quản lý các giao dịch thanh toán</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">Tổng doanh thu</div>
            <div class="text-2xl font-bold text-gray-900 mt-2">$2,456,789</div>
            <div class="text-sm text-green-600 mt-1">+23% so với tháng trước</div>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Chờ xử lý</div>
        <div class="text-2xl font-bold text-yellow-600 mt-2">$45,200</div>
        <div class="text-sm text-gray-500 mt-1">12 giao dịch</div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Đã hoàn thành</div>
        <div class="text-2xl font-bold text-green-600 mt-2">$2,401,589</div>
        <div class="text-sm text-gray-500 mt-1">1,234 giao dịch</div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">Thất bại</div>
        <div class="text-2xl font-bold text-red-600 mt-2">$10,000</div>
        <div class="text-sm text-gray-500 mt-1">5 giao dịch</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phương thức</label>
          <select v-model="filters.method" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả</option>
            <option value="credit_card">Thẻ tín dụng</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="crypto">Tiền mã hóa</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
          <input
            v-model="filters.fromDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
          <input
            v-model="filters.toDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div class="flex items-end">
          <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Xuất Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Mã giao dịch
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Người dùng
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Lot
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Số tiền
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Phương thức
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Trạng thái
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ngày
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-mono font-medium text-gray-900">{{ payment.transactionId }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="payment.user.avatar" :alt="payment.user.name" class="w-8 h-8 rounded-full" />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ payment.user.name }}</div>
                  <div class="text-sm text-gray-500">{{ payment.user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ payment.lotTitle }}</div>
              <div class="text-sm text-gray-500">{{ payment.lotCode }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-bold text-gray-900">${{ payment.amount.toLocaleString() }}</div>
              <div class="text-xs text-gray-500">Phí: ${{ payment.fee.toLocaleString() }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <component :is="getPaymentIcon(payment.method)" class="w-5 h-5" />
                <span class="text-sm text-gray-900">{{ getMethodText(payment.method) }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadge(payment.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(payment.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ payment.date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-2">
                <button @click="viewPayment(payment.id)" class="text-blue-600 hover:text-blue-900">Xem</button>
                <button v-if="payment.status === 'pending'" @click="approvePayment(payment.id)" class="text-green-600 hover:text-green-900">Duyệt</button>
                <button v-if="payment.status === 'completed'" @click="refundPayment(payment.id)" class="text-red-600 hover:text-red-900">Hoàn</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
      <div class="text-sm text-gray-700">
        Hiển thị <span class="font-medium">1</span> đến <span class="font-medium">10</span> trong <span class="font-medium">1,251</span> kết quả
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

const filters = ref({
  status: '',
  method: '',
  fromDate: '',
  toDate: ''
})

const payments = ref([
  {
    id: 1,
    transactionId: 'TXN-2024-001234',
    user: {
      name: 'John Smith',
      email: 'john@example.com',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff'
    },
    lotTitle: 'Đồng hồ Rolex Submariner',
    lotCode: 'LOT-2024-001',
    amount: 23000,
    fee: 460,
    method: 'credit_card',
    status: 'completed',
    date: '2024-10-25 14:30'
  },
  {
    id: 2,
    transactionId: 'TXN-2024-001235',
    user: {
      name: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff'
    },
    lotTitle: 'Nhẫn kim cương 5 carat',
    lotCode: 'LOT-2024-003',
    amount: 45000,
    fee: 900,
    method: 'paypal',
    status: 'pending',
    date: '2024-10-26 10:15'
  },
  {
    id: 3,
    transactionId: 'TXN-2024-001236',
    user: {
      name: 'David Lee',
      email: 'david@example.com',
      avatar: 'https://ui-avatars.com/api/?name=David+Lee&background=10b981&color=fff'
    },
    lotTitle: 'Tranh sơn dầu cổ',
    lotCode: 'LOT-2024-002',
    amount: 50000,
    fee: 1000,
    method: 'bank_transfer',
    status: 'processing',
    date: '2024-10-26 11:20'
  }
])

const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || badges.pending
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    failed: 'Thất bại',
    refunded: 'Đã hoàn'
  }
  return texts[status] || status
}

const getMethodText = (method) => {
  const texts = {
    credit_card: 'Thẻ tín dụng',
    paypal: 'PayPal',
    bank_transfer: 'Chuyển khoản',
    crypto: 'Crypto'
  }
  return texts[method] || method
}

const getPaymentIcon = (method) => {
  const icons = {
    credit_card: {
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`
    },
    paypal: {
      template: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.14a.528.528 0 01-.522.446H8.278c-.362 0-.656-.29-.576-.648l1.726-10.946a.805.805 0 01.794-.68h2.5c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327z"/></svg>`
    },
    bank_transfer: {
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>`
    },
    crypto: {
      template: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>`
    }
  }
  return icons[method] || icons.credit_card
}

const viewPayment = (id) => {
  console.log('View payment:', id)
}

const approvePayment = (id) => {
  if (confirm('Duyệt giao dịch này?')) {
    console.log('Approve payment:', id)
  }
}

const refundPayment = (id) => {
  if (confirm('Hoàn tiền cho giao dịch này?')) {
    console.log('Refund payment:', id)
  }
}
</script>