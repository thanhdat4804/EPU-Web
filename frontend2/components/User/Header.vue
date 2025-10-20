<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="flex items-center justify-between px-8 py-4">
      <!-- Logo -->
      <NuxtLink to="/User" class="text-2xl font-bold text-blue-600 select-none hover:text-blue-700 transition">
        BidDora
      </NuxtLink>

      <!-- Thanh tìm kiếm ở giữa -->
      <div class="flex-1 flex justify-center">
        <div
          class="relative w-full max-w-lg transition-all duration-300 focus-within:scale-[1.02]"
        >
          <input
            v-model="search"
            type="text"
            placeholder="Search for items..."
            class="w-full border border-gray-300 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z"
            />
          </svg>
        </div>
      </div>

      <!-- Nút đăng nhập/đăng ký hoặc thông tin user -->
      <div class="space-x-4 relative">
        <!-- Nếu user chưa đăng nhập -->
        <template v-if="!user">
          <NuxtLink to="/auth/login" class="text-sm text-gray-600 hover:text-blue-600 transition">
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
          >
            Register
          </NuxtLink>
        </template>

        <!-- Nếu user đã đăng nhập -->
        <template v-else>
          <button
            @click="toggleMenu"
            class="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition focus:outline-none"
          >
            <span class="material-icons text-lg">account_circle</span>
            <span>{{ user.name }}</span>
            <span class="material-icons text-sm">expand_more</span>
          </button>

          <!-- Dropdown menu -->
          <transition name="fade">
            <div
              v-if="showMenu"
              class="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md py-2 z-50"
            >
              <NuxtLink
                to="/User/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeMenu"
              >
                Profile
              </NuxtLink>
              <NuxtLink
                to="/User/settings"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeMenu"
              >
                Settings
              </NuxtLink>
              <hr class="my-1" />
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </transition>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '~/composables/User/useAuth'

const search = ref('')
const { user, logout } = useAuth()

const showMenu = ref(false)
const toggleMenu = () => (showMenu.value = !showMenu.value)
const closeMenu = () => (showMenu.value = false)

const handleLogout = () => {
  logout()
  closeMenu()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
