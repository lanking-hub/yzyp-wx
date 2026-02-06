<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <CustomNavBar />

    <!-- 内容区域，为导航栏留出空间 -->
    <view class="content-wrapper">
      <!-- 个人信息模块 -->
      <view class="module-card">
        <view class="module-header gradient-1">
          <image class="header-icon" src="/static/icons/actions/个人信息.svg" mode="aspectFit"></image>
          <text class="header-title">个人信息</text>
        </view>
        <view class="module-content">
          <view class="info-item">
            <text class="info-label">头像</text>
            <view class="avatar-container">
              <image
                class="user-avatar"
                :src="userInfo.avatar && !userInfo.avatar.includes('微信用户') ? userInfo.avatar : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjRjFGMUYxIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjE4IiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0zMCA5MEM0MCA4NSA1MCA4MCA2MCA4MEM3MCA4MCA4MCA4NSA5MCA5MFY5MEgzMFY5MFoiIGZpbGw9IiM5OTk5OTkiLz4KPHN2Zz4K'"
                mode="aspectFill"
              ></image>
            </view>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">用户名</text>
            <text class="info-value">{{ userInfo.username }}</text>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">会员状态</text>
            <text class="info-value">{{ userInfo.memberStatus }}</text>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">注册时间</text>
            <text class="info-value">{{ userInfo.registerTime }}</text>
          </view>
        </view>
      </view>
	
	  <!-- 历史记录模块 -->
	  <view class="module-card" @click="goToHistory">
	      <view class="module-header gradient-2">
	        <image class="header-icon" src="/static/icons/actions/图片.svg" mode="aspectFit"></image>
	        <text class="header-title">历史记录</text>
	      </view>
	      <view class="module-content">
	        <view class="info-item">
	          <text class="info-label">查看我的设计历史</text>
	        </view>
	      </view>
	    </view>

      <!-- 设置模块 -->
      <view class="module-card">
        <view class="module-header gradient-2">
          <image class="header-icon" src="/static/icons/actions/设置.svg" mode="aspectFit"></image>
          <text class="header-title">设置</text>
        </view>
        <view class="module-content">
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">图片质量</text>
            <text class="info-value">高清</text>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">语言设置</text>
            <text class="info-value">简体中文</text>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">自动保存设计</text>
            <text class="info-value">开启</text>
          </view>
        </view>
      </view>

      <!-- 关于模块 -->
      <view class="module-card">
        <view class="module-header gradient-1">
          <image class="header-icon" src="/static/icons/actions/关于.png" mode="aspectFit"></image>
          <text class="header-title">关于</text>
        </view>
        <view class="module-content">
          <view class="info-item">
            <text class="info-label">版本</text>
            <text class="info-value">v0.0.1</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/CustomNavBar/CustomNavBar.vue'
import { get } from '../../utils/request.js'
import { getToken } from '../../utils/auth.js'

export default {
  name: 'Wode',
  components: {
    CustomNavBar
  },
  data() {
    return {
      hasLoaded: false, // 防止重复触发登录的标志
      // 预留数据属性，用于后续交互逻辑
      userInfo: {
        username: 'FashionUser',
        memberStatus: '普通会员',
        registerTime: '2024-01-15'
      },
      settings: {
        notification: '开启',
        imageQuality: '高清',
        language: '简体中文',
        autoSave: '开启'
      },
      version: 'v2.1.0'
    }
  },
  onLoad() {
    this.fetchUserInfo()
  },
  onShow() {
    // 只在页面已经加载过且有token的情况下才刷新，避免重复触发登录
    if (this.hasLoaded && this.getToken()) {
      this.fetchUserInfo()
    }
    this.hasLoaded = true
  },
  methods: {
    async fetchUserInfo(isLoginRefresh = false) {
      // #ifdef H5
      // H5模式：请求后端获取真实用户信息（使用固定token）
      try {
        console.log('H5模式 - 正在获取用户信息...')
        const response = await get('https://fashionai.top/api/user', {})
        console.log('H5用户信息响应:', response)

        // 从response.data中获取用户信息
        const userData = response.data || {}

        // 更新用户信息
        this.userInfo.username = userData.name || 'H5用户'
        this.userInfo.avatar = userData.avatar || '/static/default-avatar.png'

        // 更新注册时间（格式化显示）
        if (userData.createTime) {
          this.userInfo.registerTime = this.formatDate(userData.createTime)
        }

        console.log('H5用户信息已更新:', this.userInfo)

        // 强制更新视图
        this.$forceUpdate()

      } catch (error) {
        console.error('H5获取用户信息失败:', error)
        // 使用默认值
        this.userInfo.username = 'H5用户'
        this.userInfo.avatar = '/static/default-avatar.png'
      }
      // #endif

      // #ifdef MP-WEIXIN
      // 微信小程序：正常请求后端
      try {
        console.log('正在获取用户信息...', isLoginRefresh ? '(登录后刷新)' : '')
        const response = await get('https://fashionai.top/api/user', {})
        console.log('用户信息响应:', response)

        // 从response.data中获取用户信息
        const userData = response.data || {}

        // 更新用户信息
        this.userInfo.username = userData.name || 'FashionUser'
        this.userInfo.avatar = userData.avatar || '/static/default-avatar.png'

        // 更新注册时间（格式化显示）
        if (userData.createTime) {
          this.userInfo.registerTime = this.formatDate(userData.createTime)
        }

        console.log('用户信息已更新:', this.userInfo)
        console.log('后端返回的用户名:', userData.name)
        console.log('后端返回的头像:', userData.avatar)
        console.log('后端返回的创建时间:', userData.createTime)
        console.log('格式化后的注册时间:', this.userInfo.registerTime)

        // 如果是登录后刷新，显示成功提示
        if (isLoginRefresh) {
          uni.showToast({
            title: '用户信息已更新',
            icon: 'success',
            duration: 1500
          })
        }

        // 强制更新视图
        this.$forceUpdate()

      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果是登录相关错误，不需要额外提示，因为request.js已经处理了
        if (!error.message.includes('用户未登录')) {
          uni.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      }
      // #endif
    },

    getToken() {
      try {
        return uni.getStorageSync('token')
      } catch (e) {
        console.error('获取token失败:', e)
        return null
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '2024-01-15'
      try {
        const date = new Date(dateStr)
        // 格式化为 YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      } catch (error) {
        console.error('日期格式化失败:', error)
        return '2024-01-15'
      }
    },

    goToHistory() {
      uni.navigateTo({
        url: '/pages/history/history'
      })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.page-container {
  background-color: #FFF8F0; /* 与收藏页面统一的浅米色背景 */
  min-height: 100vh;
}

/* 内容包装器 - 为导航栏留出空间 */
.content-wrapper {
  padding-top: 200rpx; /* 增加顶部间距 */
  padding-bottom: 60px;
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 模块卡片 */
.module-card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.module-card:active {
  transform: scale(0.98);
}

/* 模块头部 */
.module-header {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
}

/* 渐变背景1 - 深蓝到浅紫（偏紫） */
.gradient-1 {
  background: linear-gradient(to right, #1A237E 0%, #4A235A 50%, #9C27B0 100%);
}

/* 渐变背景2 - 纯蓝色系（偏蓝） */
.gradient-2 {
  background: linear-gradient(to right, #00008B 0%, #0064C8 50%, #64B4FF 100%);
}

.header-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
}



.header-title {
  font-size: 32rpx;
  font-weight: 500;
  color: white;
  flex: 1;
}

.arrow-icon {
  font-size: 32rpx;
  color: white;
  margin-left: auto;
}

/* 模块内容 */
.module-content {
  padding: 0;
}

/* 信息项 */
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
}

.info-label {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.info-value {
  font-size: 28rpx;
  color: #666;
  text-align: right;
}

/* 头像样式 */
.avatar-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid #f0f0f0;
}

/* 分割线 */
.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin-left: 30rpx;
  margin-right: 30rpx;
}
</style>