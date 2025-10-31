<template>
  <div class="p-6">
    <!-- Nút quay lại -->
    <div class="mb-4">
      <NuxtLink
        to="/admin/users"
        class="inline-flex items-center text-gray-600 hover:text-blue-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách
      </NuxtLink>
    </div>

    <!-- Thông tin người dùng -->
    <div class="bg-white p-6 rounded-2xl shadow">
      <div class="flex items-center mb-6">
        <img
          :src="user.avatar"
          alt="Avatar"
          class="w-20 h-20 rounded-full border mr-6 object-cover"
        />
        <div>
          <h2 class="text-2xl font-bold mb-1">{{ user.name }}</h2>
          <p class="text-gray-500">{{ user.email }}</p>
          <p class="text-sm mt-2">
            <span
              :class="[
                'px-2 py-1 rounded text-sm font-medium',
                user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ]"
            >
              {{ user.active ? 'Đang hoạt động' : 'Bị khóa' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Thông tin chi tiết -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold mb-2">Thông tin cá nhân</h3>
          <ul class="space-y-1 text-gray-700">
            <li><strong>Giới tính:</strong> {{ user.gender }}</li>
            <li><strong>Ngày sinh:</strong> {{ user.birthdate }}</li>
            <li><strong>Số điện thoại:</strong> {{ user.phone }}</li>
            <li><strong>Địa chỉ:</strong> {{ user.address }}</li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Thông tin tài khoản</h3>
          <ul class="space-y-1 text-gray-700">
            <li><strong>Vai trò:</strong> {{ user.role }}</li>
            <li><strong>Ngày tạo:</strong> {{ user.createdAt }}</li>
            <li><strong>Lần đăng nhập cuối:</strong> {{ user.lastLogin }}</li>
            <li><strong>Trạng thái:</strong> 
              <span :class="user.active ? 'text-green-600' : 'text-red-600'">
                {{ user.active ? 'Hoạt động' : 'Bị khóa' }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Lịch sử đấu giá -->
      <div class="mt-8">
        <h3 class="font-semibold mb-2">Lịch sử đấu giá gần đây</h3>
        <table class="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">Phiên</th>
              <th class="px-4 py-2 text-left">Giá đặt</th>
              <th class="px-4 py-2 text-left">Trạng thái</th>
              <th class="px-4 py-2 text-left">Ngày</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(bid, index) in user.bids"
              :key="index"
              class="hover:bg-gray-50 border-t"
            >
              <td class="px-4 py-2">{{ bid.item }}</td>
              <td class="px-4 py-2">{{ bid.amount.toLocaleString() }} ₫</td>
              <td class="px-4 py-2">
                <span
                  :class="[
                    'px-2 py-1 rounded text-sm font-medium',
                    bid.status === 'won'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ bid.status === 'won' ? 'Thắng' : 'Thua' }}
                </span>
              </td>
              <td class="px-4 py-2">{{ bid.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.params.id;

// Dữ liệu giả
const user = ref({
  id: userId,
  name: "Nguyễn Văn A",
  email: "a@example.com",
  avatar: "https://i.pravatar.cc/150?u=" + userId,
  gender: "Nam",
  birthdate: "1990-05-12",
  phone: "0987 654 321",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  role: "Người mua",
  active: true,
  createdAt: "2023-02-10",
  lastLogin: "2025-10-26",
  bids: [
    { item: "Tranh sơn dầu cổ", amount: 1200000, status: "won", date: "2025-09-20" },
    { item: "Đồng hồ Seiko", amount: 850000, status: "lost", date: "2025-09-15" },
    { item: "Bộ tem cổ", amount: 430000, status: "lost", date: "2025-08-30" },
  ],
});
</script>
