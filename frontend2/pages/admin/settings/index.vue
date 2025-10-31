<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
      <p class="text-gray-600">Quản lý cấu hình và thiết lập hệ thống</p>
    </div>

    <!-- Settings Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin chung</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tên website</label>
                <input
                  v-model="settings.general.siteName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả website</label>
                <textarea
                  v-model="settings.general.siteDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                  <input
                    v-model="settings.general.contactEmail"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    v-model="settings.general.contactPhone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Múi giờ & Ngôn ngữ</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                <select v-model="settings.general.timezone" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="UTC">UTC</option>
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (UTC+7)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ mặc định</label>
                <select v-model="settings.general.defaultLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Auction Settings -->
        <div v-if="activeTab === 'auction'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt đấu giá</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Thời gian gia hạn tự động (giây)</label>
                  <input
                    v-model.number="settings.auction.autoExtendTime"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p class="text-xs text-gray-500 mt-1">Thời gian gia hạn khi có bid mới gần kết thúc</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bước giá tối thiểu (%)</label>
                  <input
                    v-model.number="settings.auction.minBidIncrement"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p class="text-xs text-gray-500 mt-1">% tăng tối thiểu so với giá hiện tại</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  v-model="settings.auction.requireApproval"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <div>
                  <label class="text-sm font-medium text-gray-900">Yêu cầu phê duyệt lots</label>
                  <p class="text-xs text-gray-500">Tất cả lots phải được admin duyệt trước khi lên sàn</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  v-model="settings.auction.allowBuyNow"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <div>
                  <label class="text-sm font-medium text-gray-900">Cho phép mua ngay</label>
                  <p class="text-xs text-gray-500">Người bán có thể đặt giá "Mua ngay"</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Phí giao dịch</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phí người bán (%)</label>
                <input
                  v-model.number="settings.auction.sellerFee"
                  type="number"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phí người mua (%)</label>
                <input
                  v-model.number="settings.auction.buyerFee"
                  type="number"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Settings -->
        <div v-if="activeTab === 'payment'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.payment.creditCard.enabled" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">Thẻ tín dụng</div>
                    <div class="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                  </div>
                </div>
                <button class="text-sm text-blue-600 hover:text-blue-700">Cấu hình</button>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.payment.paypal.enabled" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">PayPal</div>
                    <div class="text-sm text-gray-500">Thanh toán qua PayPal</div>
                  </div>
                </div>
                <button class="text-sm text-blue-600 hover:text-blue-700">Cấu hình</button>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.payment.bankTransfer.enabled" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div class="text-sm text-gray-500">Chuyển khoản trực tiếp</div>
                  </div>
                </div>
                <button class="text-sm text-blue-600 hover:text-blue-700">Cấu hình</button>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.payment.crypto.enabled" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">Tiền mã hóa</div>
                    <div class="text-sm text-gray-500">Bitcoin, Ethereum, USDT</div>
                  </div>
                </div>
                <button class="text-sm text-blue-600 hover:text-blue-700">Cấu hình</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Settings -->
        <div v-if="activeTab === 'email'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Cấu hình SMTP</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    v-model="settings.email.smtpHost"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    v-model.number="settings.email.smtpPort"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="587"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    v-model="settings.email.smtpUser"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    v-model="settings.email.smtpPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Gửi email thử nghiệm
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông báo email</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.email.notifications.newBid" class="w-4 h-4 text-blue-600" />
                <label class="text-sm text-gray-900">Thông báo khi có bid mới</label>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.email.notifications.outbid" class="w-4 h-4 text-blue-600" />
                <label class="text-sm text-gray-900">Thông báo khi bị outbid</label>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.email.notifications.auctionEnd" class="w-4 h-4 text-blue-600" />
                <label class="text-sm text-gray-900">Thông báo khi đấu giá kết thúc</label>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.email.notifications.payment" class="w-4 h-4 text-blue-600" />
                <label class="text-sm text-gray-900">Thông báo thanh toán</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.security.require2FA" class="w-4 h-4 text-blue-600" />
                <div>
                  <label class="text-sm font-medium text-gray-900">Bắt buộc xác thực 2 yếu tố</label>
                  <p class="text-xs text-gray-500">Yêu cầu 2FA cho tất cả người dùng</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.security.requireEmailVerification" class="w-4 h-4 text-blue-600" />
                <div>
                  <label class="text-sm font-medium text-gray-900">Xác thực email</label>
                  <p class="text-xs text-gray-500">Yêu cầu xác thực email trước khi đấu giá</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input type="checkbox" v-model="settings.security.requirePhoneVerification" class="w-4 h-4 text-blue-600" />
                <div>
                  <label class="text-sm font-medium text-gray-900">Xác thực số điện thoại</label>
                  <p class="text-xs text-gray-500">Yêu cầu xác thực SĐT cho giao dịch lớn</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Giới hạn đăng nhập</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Số lần đăng nhập sai tối đa</label>
                <input
                  v-model.number="settings.security.maxLoginAttempts"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Thời gian khóa (phút)</label>
                <input
                  v-model.number="settings.security.lockoutDuration"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <button class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Hủy
        </button>
        <button @click="saveSettings" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'Chung' },
  { id: 'auction', label: 'Đấu giá' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'email', label: 'Email' },
  { id: 'security', label: 'Bảo mật' }
]

const settings = ref({
  general: {
    siteName: 'Catawiki Clone',
    siteDescription: 'Nền tảng đấu giá trực tuyến hàng đầu',
    contactEmail: 'contact@auction.com',
    contactPhone: '+84 123 456 789',
    timezone: 'Asia/Ho_Chi_Minh',
    defaultLanguage: 'vi'
  },
  auction: {
    autoExtendTime: 120,
    minBidIncrement: 5,
    requireApproval: true,
    allowBuyNow: true,
    sellerFee: 12,
    buyerFee: 5
  },
  payment: {
    creditCard: { enabled: true },
    paypal: { enabled: true },
    bankTransfer: { enabled: true },
    crypto: { enabled: false }
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    notifications: {
      newBid: true,
      outbid: true,
      auctionEnd: true,
      payment: true
    }
  },
  security: {
    require2FA: false,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30
  }
})

const saveSettings = () => {
  console.log('Saving settings:', settings.value)
  alert('Cài đặt đã được lưu thành công!')
}
</script>