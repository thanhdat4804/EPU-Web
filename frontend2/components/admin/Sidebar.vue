<template>
  <aside
    :class="[
      'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-gray-900 text-white',
      isOpen ? 'w-64' : 'w-20'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <transition name="fade">
        <h1 v-if="isOpen" class="text-xl font-bold">Admin Panel</h1>
      </transition>
      <button @click="$emit('close')" class="lg:hidden">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
      <!-- Dashboard -->
      <NavItem
        to="/admin"
        icon="home"
        label="Dashboard"
        :isOpen="isOpen"
      />

      <!-- Auctions Management -->
      <NavGroup
        title="Đấu giá"
        icon="gavel"
        :isOpen="isOpen"
        :items="[
          { to: '/admin/auction', label: 'Phiên đấu giá' },
          { to: '/admin/lots', label: 'Lots đấu giá' },
          { to: '/admin/auction/create', label: 'Tạo phiên mới' }
        ]"
      />

      <!-- Users Management -->
      <NavGroup
        title="Người dùng"
        icon="users"
        :isOpen="isOpen"
        :items="[
          { to: '/admin/users', label: 'Danh sách' },
          { to: '/admin/sellers', label: 'Người bán' },
          { to: '/admin/experts', label: 'Chuyên gia' },
          { to: '/admin/users/create', label: 'Thêm người dùng' },
          
        ]"
      />

      <!-- Payments -->
      <NavItem
        to="/admin/payments"
        icon="credit-card"
        label="Thanh toán"
        :isOpen="isOpen"
      />

      <!-- Reports -->
      <NavItem
        to="/admin/reports"
        icon="chart-bar"
        label="Báo cáo"
        :isOpen="isOpen"
      />

      <!-- Support -->
      <NavItem
        to="/admin/support"
        icon="support"
        label="Hỗ trợ"
        :isOpen="isOpen"
      />

      <!-- Settings -->
      <NavItem
        to="/admin/settings"
        icon="settings"
        label="Cài đặt"
        :isOpen="isOpen"
      />
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>