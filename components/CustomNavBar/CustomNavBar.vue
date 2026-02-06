<template>
	<view class="custom-navbar">
		<!-- 使用 image 组件作为背景 -->
		<image class="navbar-background" src="/static/软件素材/background.webp" mode="aspectFill"></image>
		<view class="navbar-content">
			<view class="nav-title">Fashion AI</view>
			<view class="nav-subtitle">智能服装设计助手</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomNavBar'
}
</script>

<style scoped>
.custom-navbar {
	color: white;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	width: 100%;
	z-index: 999;
	padding-top: 44rpx; /* 状态栏高度 */
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1); /* 底部阴影效果 */
	overflow: hidden;
}

/* 背景图片样式 */
.navbar-background {
	position: absolute;
	top: 0;
	left: 0;
	width: 100vw; /* 使用视口宽度确保铺满 */
	height: 100%;
	z-index: 0;
}

.navbar-content {
	position: relative;
	z-index: 1;
	height: 120rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 30rpx;
}

.nav-title {
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 4rpx;
	color: white;
}

.nav-subtitle {
	font-size: 24rpx;
	opacity: 0.9;
	color: white;
}
</style>