<!-- pages/csrf-demo.vue -->
<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">CSRF demo (Nuxt)</h1>

    <div class="mb-4">
      <button
        @click="getToken"
        class="px-4 py-2 bg-blue-600 text-white rounded mr-2"
      >
        Lấy CSRF token
      </button>
      <button
        @click="sendPost"
        :disabled="!csrf || posting"
        class="px-4 py-2 bg-green-600 text-white rounded"
      >
        Gửi POST an toàn
      </button>
    </div>

    <div class="mb-4">
      <p><b>CSRF token:</b></p>
      <pre class="bg-gray-100 p-3 rounded">{{ csrf || 'Chưa có' }}</pre>
    </div>

    <div>
      <p class="mb-2">Demo attacker (mở trang attacker.html):</p>
      <a
        href="/attacker.html"
        target="_blank"
        class="text-red-600 underline"
      >
        Mở attacker.html
      </a>
      <p class="text-sm text-gray-500 mt-2">
        (attacker.html là file static bạn đặt trong folder `public/` hoặc host bên ngoài)
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCsrf } from '~/composables/useCsrf'
import { useApi } from '~/composables/useApi'

const { csrf, fetchCsrf } = useCsrf()
const { post } = useApi()
const posting = ref(false)

const getToken = async () => {
  await fetchCsrf()
}

const sendPost = async () => {
  if (!csrf.value) {
    alert('Chưa có CSRF token. Hãy lấy token trước.')
    return
  }
  try {
    posting.value = true
    await post('http://localhost:3001/items', {
      name: 'Demo item from Nuxt',
      startingPrice: 0.5
    })
    alert('POST thành công')
  } catch (err) {
    console.error(err)
    alert('POST thất bại: ' + (err?.data?.message || err.message))
  } finally {
    posting.value = false
  }
}
</script>
