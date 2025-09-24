<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <!-- Card -->
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">
        🚀 EPU Web
      </h1>

      <p class="text-gray-600 text-center mb-6">
        Đây là một trang demo được tạo bằng <span class="font-semibold text-blue-600">TailwindCSS</span>.
      </p>

      <!-- Button -->
      <div class="flex justify-center">
        <button
          class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Bấm vào đây
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-10 text-gray-500">
      © {{ new Date().getFullYear() }} - Demo Nuxt 4 + TailwindCSS
    </footer>
  </div>
</template>
