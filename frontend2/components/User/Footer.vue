<!-- components/Footer.vue -->
<template>
  <footer class="bg-white border-t border-gray-200 py-16">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

        <!-- Cột 1 – Logo + Mô tả (logo to hơn) -->
        <div class="lg:col-span-2 space-y-8">
          <NuxtLink to="/" class="inline-block">
            <img
              src="/logo.jpg"
              alt="BidDora - Đấu giá trực tuyến"
              class="h-20 md:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </NuxtLink>
          <p class="text-gray-600 text-sm leading-relaxed max-w-md">
            Nền tảng đấu giá trực tuyến minh bạch, an toàn, sử dụng công nghệ blockchain Ethereum.<br>
            Kết nối người mua và người bán trên toàn quốc.
          </p>

          <!-- Social icons -->
          <div class="flex gap-4">
            <a href="#" class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-0.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.288-2.232.288-.545 0-1.075-.053-1.59-.155 1.077 3.356 4.197 5.797 7.89 5.867-2.891 2.264-6.529 3.612-10.486 3.612 3.351 0 5.858-2.351 6.449-5.448.951-0.498 1.77-1.111 2.479-1.805z"/></svg>
            </a>
            <a href="#" class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.5 0 1.45.69 1.45 1.54v.03c0 .85-.68 1.54-1.45 1.54h-.03c-.8 0-1.45-.69-1.45-1.54v-.03c0-.85.68-1.54 1.45-1.54h.03zm-4.04.6c.8 0 1.45.69 1.45 1.54v8.72c0 .85-.65 1.54-1.45 1.54h-8.72c-.8 0-1.45-.69-1.45-1.54V8.14c0-.85.65-1.54 1.45-1.54h8.72zm0 1.2h-8.72v7.52h8.72v-7.52z"/></svg>
            </a>
            <a href="#" class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

        <!-- Cột 2 – Về BidDora -->
        <div>
          <h3 class="text-gray-900 font-bold text-lg mb-6">Về BidDora</h3>
          <ul class="space-y-4 text-gray-600">
            <li><NuxtLink to="/about" class="hover:text-blue-600 transition">Giới thiệu</NuxtLink></li>
            <li><NuxtLink to="/how-it-works" class="hover:text-blue-600 transition">Cách hoạt động</NuxtLink></li>
            <li><NuxtLink to="/fees" class="hover:text-blue-600 transition">Biểu phí</NuxtLink></li>
            <li><NuxtLink to="/careers" class="hover:text-blue-600 transition">Tuyển dụng</NuxtLink></li>
          </ul>
        </div>

        <!-- Cột 3 – Hỗ trợ -->
        <div>
          <h3 class="text-gray-900 font-bold text-lg mb-6">Hỗ trợ</h3>
          <ul class="space-y-4 text-gray-600">
            <li><NuxtLink to="/help" class="hover:text-blue-600 transition">Trung tâm trợ giúp</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-blue-600 transition">Liên hệ</NuxtLink></li>
            <li><NuxtLink to="/safety" class="hover:text-blue-600 transition">An toàn giao dịch</NuxtLink></li>
          </ul>
        </div>

        <!-- Cột 4 – Pháp lý -->
        <div>
          <h3 class="text-gray-900 font-bold text-lg mb-6">Pháp lý</h3>
          <ul class="space-y-4 text-gray-600">
            <li><NuxtLink to="/terms" class="hover:text-blue-600 transition">Điều khoản sử dụng</NuxtLink></li>
            <li><NuxtLink to="/privacy" class="hover:text-blue-600 transition">Chính sách bảo mật</NuxtLink></li>
            <li><NuxtLink to="/cookies" class="hover:text-blue-600 transition">Chính sách Cookie</NuxtLink></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-16 pt-10 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; 2025 BidDora. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer thuần tĩnh – không cần script
</script>

<style scoped>
footer * {
  font-family: 'Basis Grotesque Pro', system-ui, sans-serif;
}
</style>