<template>
	<view class="container">
		<view class="header">
			<text class="title">{{msg}}</text>
		</view>

		<view class="user-info" v-if="isLoggedIn">
			<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
			<text class="nickname">{{userInfo.name}}</text>
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>

		<view class="login-section" v-else>
			<button
				class="login-btn"
				@click="handleLogin"
			>
				微信登录
			</button>
		</view>
	</view>
</template>

<script>
// 导入全局工具
import auth from '../../utils/auth.js'
import request from '../../utils/request.js'

export default {
	data() {
		return {
			msg: "云织衣谱",
			isLoggedIn: false,
			userInfo: {}
		}
	},
	onLoad() {
		// 检查是否已登录
		this.checkLoginStatus();
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			if (auth.isLoggedIn()) {
				this.isLoggedIn = true
				this.userInfo = auth.getUserInfo() || {}
				console.log('用户已登录:', this.userInfo)
			} else {
				this.isLoggedIn = false
				this.userInfo = {}
			}
		},

		// 处理登录按钮点击
		async handleLogin() {
			uni.showLoading({
				title: '登录中...'
			})

			try {
				// 获取用户授权信息
				const userInfo = await auth.getUserProfile()

				// 执行登录流程
				const result = await auth.performLogin(userInfo)

				uni.hideLoading()

				if (result.success) {
					console.log('登录成功:', result)

					// 更新页面状态
					this.isLoggedIn = true
					this.userInfo = result.userInfo

					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})

					// 可以在这里添加登录成功后的跳转逻辑
					// 比如：uni.switchTab({ url: '/pages/home/home' })
				} else {
					uni.showToast({
						title: result.error || '登录失败',
						icon: 'error'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('登录过程出错:', error)

				let errorMsg = '登录失败'
				if (error.errMsg && error.errMsg.includes('getUserProfile:fail')) {
					errorMsg = '请授权用户信息'
				}

				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		},

		// 处理退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 调用全局退出方法
						auth.logout()

						// 更新页面状态
						this.isLoggedIn = false
						this.userInfo = {}

						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
					}
				}
			})
		},

		// 测试API请求（可选）
		async testApiRequest() {
			try {
				const result = await request.get('/user/profile')
				console.log('API请求成功:', result)
			} catch (error) {
				console.error('API请求失败:', error)
			}
		}
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 40rpx;
	background-color: #f5f5f5;
}

.header {
	margin-bottom: 100rpx;
}

.title {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.user-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx;
	background-color: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-bottom: 20rpx;
}

.nickname {
	font-size: 32rpx;
	color: #333;
}

.logout-btn {
	margin-top: 20rpx;
	padding: 10rpx 30rpx;
	background-color: #ff4757;
	color: #fff;
	font-size: 24rpx;
	border: none;
	border-radius: 20rpx;
}

.logout-btn:active {
	background-color: #ff3838;
}

.login-section {
	width: 100%;
	max-width: 600rpx;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #07c160;
	color: #fff;
	font-size: 32rpx;
	border: none;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 40rpx;
}

.login-btn:active {
	background-color: #06ad56;
}

.login-btn::after {
	border: none;
}
</style>
