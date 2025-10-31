<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Tổng quan hệ thống đấu giá</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tổng phiên đấu giá"
        :value="stats.totalAuctions"
        icon="gavel"
        color="blue"
        trend="+12%"
      />
      <StatCard
        title="Lots đang đấu giá"
        :value="stats.activeLots"
        icon="tag"
        color="green"
        trend="+5%"
      />
      <StatCard
        title="Người dùng"
        :value="stats.totalUsers"
        icon="users"
        color="purple"
        trend="+18%"
      />
      <StatCard
        title="Doanh thu tháng này"
        :value="`$${stats.revenue.toLocaleString()}`"
        icon="dollar"
        color="yellow"
        trend="+23%"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <ChartCard title="Doanh thu 7 ngày qua">
        <canvas ref="revenueChart"></canvas>
      </ChartCard>

      <!-- Auction Status -->
      <ChartCard title="Trạng thái phiên đấu giá">
        <canvas ref="auctionChart"></canvas>
      </ChartCard>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Auctions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Phiên đấu giá gần đây</h3>
        <div class="space-y-3">
          <ActivityItem
            v-for="auction in recentAuctions"
            :key="auction.id"
            :title="auction.title"
            :time="auction.time"
            :status="auction.status"
          />
        </div>
      </div>

      <!-- Pending Reviews -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Chờ thẩm định</h3>
        <div class="space-y-3">
          <ReviewItem
            v-for="item in pendingReviews"
            :key="item.id"
            :title="item.title"
            :category="item.category"
            :time="item.time"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Mock data
const stats = ref({
  totalAuctions: 1247,
  activeLots: 342,
  totalUsers: 15824,
  revenue: 2456789
})

const recentAuctions = ref([
  { id: 1, title: 'Đồng hồ Rolex cổ', time: '5 phút trước', status: 'active' },
  { id: 2, title: 'Tranh sơn dầu thế kỷ 19', time: '15 phút trước', status: 'ending' },
  { id: 3, title: 'Tem bưu chính hiếm', time: '1 giờ trước', status: 'completed' }
])

const pendingReviews = ref([
  { id: 1, title: 'Bộ sưu tập tiền xu', category: 'Đồ cổ', time: '2 giờ trước' },
  { id: 2, title: 'Đồ trang sức ngọc trai', category: 'Trang sức', time: '3 giờ trước' },
  { id: 3, title: 'Xe Porsche 911 Classic', category: 'Xe cổ', time: '5 giờ trước' }
])

const revenueChart = ref(null)
const auctionChart = ref(null)

onMounted(() => {
  // Initialize charts (you would use Chart.js or similar)
  console.log('Charts would be initialized here')
})
</script>