<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
    
    <div :class="['transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20']">
      <Header @toggleSidebar="sidebarOpen = !sidebarOpen" />
      
      <main class="p-6">
        <slot />  <!-- Đảm bảo có dòng này -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const sidebarOpen = ref(true)
</script>