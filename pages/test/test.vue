<template>
  <view class="container">
    <view class="header">
      <text class="title">简单登录测试</text>
    </view>

    <!-- 登录状态 -->
    <view class="status-section">
      <text class="section-title">登录状态</text>
      <text class="status-text" :class="{ 'status-online': hasToken }">
        {{ hasToken ? '已登录' : '未登录' }}
      </text>
    </view>

    <!-- 操作按钮 -->
    <view class="actions-section">
      <text class="section-title">操作测试</text>

      <button class="action-btn login-btn" @click="testLogin">
        测试登录
      </button>

      <button class="action-btn api-btn" @click="testAPI">
        测试API请求
      </button>

      <button class="action-btn clear-btn" @click="clearToken">
        清除token
      </button>
    </view>

    <!-- 显示token -->
    <view class="token-section" v-if="token">
      <text class="section-title">当前Token</text>
      <text class="token-text">{{ token }}</text>
    </view>
  </view>
</template>

<script>
import { getToken, clearToken, handleLogin } from '../../utils/auth.js'
import { get, post } from '../../utils/request.js'

export default {
  data() {
    return {
      token: '',
      hasToken: false
    }
  },

  onLoad() {
    this.checkToken()
  },

  methods: {
    // 检查token状态
    checkToken() {
      this.token = getToken() || ''
      this.hasToken = !!this.token
    },

    // 测试登录
    testLogin() {
      handleLogin()
      setTimeout(() => {
        this.checkToken()
      }, 3000)
    },

    // 测试API请求
    async testAPI() {
      try {
        console.log('测试API请求...')

        // 替换为你的实际API端点
        const result = await get('/user/info')

        uni.showToast({
          title: 'API请求成功',
          icon: 'success'
        })

      } catch (error) {
        console.log('API请求失败:', error.message)

        if (error.message === '用户未登录') {
          // 会自动触发登录流程
          console.log('已触发登录流程')
        } else {
          uni.showToast({
            title: 'API请求失败',
            icon: 'error'
          })
        }
      }
    },

    // 清除token
    clearToken() {
      clearToken()
      this.checkToken()
      uni.showToast({
        title: 'Token已清除',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 40rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.status-section,
.actions-section,
.token-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.status-text {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: bold;
}

.status-online {
  color: #2ed573;
}

.action-btn {
  width: 100%;
  height: 80rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #fff;
  border: none;
}

.login-btn {
  background-color: #07c160;
}

.api-btn {
  background-color: #3742fa;
}

.clear-btn {
  background-color: #ff4757;
}

.action-btn:active {
  opacity: 0.8;
}

.token-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  word-break: break-all;
}
</style>