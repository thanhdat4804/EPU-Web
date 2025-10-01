<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" class="h-12 w-12" />
          <div>
            <h1 class="text-xl font-bold text-blue-900">TRƯỜNG ĐẠI HỌC ĐIỆN LỰC</h1>
            <p class="text-sm text-gray-600 italic">Electric Power University</p>
          </div>
        </div>
        <!-- Menu -->
        <nav class="hidden md:flex space-x-6">
          <a href="#" class="text-gray-700 hover:text-blue-600 font-medium">Trang chủ</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 font-medium">Quy định</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 font-medium">Sinh viên</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 font-medium">Tin tức</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tin tức box -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-4 border-b pb-2">Dành cho tân sinh viên khóa D20</h2>
          <ul class="space-y-2">
            <li class="group cursor-pointer transition duration-300 rounded-md px-3 py-2 hover:bg-blue-50 flex items-center justify-between">
              <span class="text-gray-700 group-hover:text-blue-800 transition">📢 Thông báo chương trình nhập học trực tiếp...</span>
              <span class="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300">→</span>
            </li>

            <li class="group cursor-pointer transition duration-300 rounded-md px-3 py-2 hover:bg-blue-50 flex items-center justify-between">
              <span class="text-gray-700 group-hover:text-blue-800 transition">📢 Thông báo v/v nộp hồ sơ miễn giảm học phí...</span>
              <span class="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300">→</span>
            </li>

            <li class="group cursor-pointer transition duration-300 rounded-md px-3 py-2 hover:bg-blue-50 flex items-center justify-between">
              <span class="text-gray-700 group-hover:text-blue-800 transition">📢 Thông báo về việc mua BHYT cho sinh viên...</span>
              <span class="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300">→</span>
            </li>
          </ul>

        </section>

        <!-- Thông báo khác -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-4 border-b pb-2">Thông báo</h2>
          <ul class="space-y-3">
            <li class="hover:text-blue-700 cursor-pointer">⚠️ Cảnh báo học tập học kỳ 2 năm học 2024-2025...</li>
            <li class="hover:text-blue-700 cursor-pointer">⚠️ Buộc thôi học đối với sinh viên D19...</li>
          </ul>
        </section>
      </div>

      <!-- Right sidebar -->
      <aside class="space-y-6">
        <!-- Đăng nhập -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-4">Đăng nhập</h2>
          <form class="space-y-4">
            <input type="text" placeholder="Mã sinh viên" class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <input type="password" placeholder="Mật khẩu" class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <div class="flex items-center space-x-2">
              <input type="radio" name="type" class="text-blue-600" checked />
              <label>Sinh viên đang học</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="radio" name="type" class="text-blue-600" />
              <label>Sinh viên tốt nghiệp</label>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Đăng nhập</button>
          </form>
        </div>

        <!-- Phụ huynh -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-4">Dành cho phụ huynh</h2>
          <ul class="space-y-2 text-blue-600">
            <li><a href="#">🔎 Tra cứu thông tin</a></li>
            <li><a href="#">📄 Tra cứu văn bằng</a></li>
            <li><a href="#">📊 Tra cứu kết quả học tập</a></li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>
