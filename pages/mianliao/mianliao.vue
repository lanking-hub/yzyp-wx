<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <CustomNavBar />

    <!-- 内容区域，为导航栏留出空间 -->
    <view class="content-wrapper">
      <!-- 面料推荐标题栏 -->
      <view class="section-header">
        <text class="header-icon">✏️</text>
        <text class="header-text">面料推荐</text>
      </view>

      <!-- 面料需求容器 -->
      <view class="design-container">
        <view class="container-title">
          <text class="title-icon">👕</text>
          <text class="title-text">面料需求</text>
        </view>
        <view class="container-content">
			<text class="brand-hint">描述您需要的面料特性</text>
          <textarea
            class="desc-input"
            placeholder="例如：针织面料，透气舒适，适合贴身穿着…"
            placeholder-class="placeholder-text"
          />
        </view>
      </view>

      <!-- 生成按钮 -->
      <button class="generate-btn">
        <text class="btn-icon">✏️</text>
        <text class="btn-text">智能面料推荐</text>
      </button>

      <!-- 推荐结果容器 -->
      <view class="design-container">
        <view class="container-title">
          <text class="title-icon">📤</text>
          <text class="title-text">推荐结果</text>
        </view>
        <view class="container-content">
          <view class="result-placeholder">
            <text class="placeholder-text">请点击"智能面料推荐"按钮获取面料推荐</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 交互逻辑后续自行补充
import CustomNavBar from '../../components/CustomNavBar/CustomNavBar.vue'

export default {
  name: 'Mianliao',
  components: {
    CustomNavBar
  },
  data() {
    return {
      // 预留数据属性，用于后续交互逻辑
      fabricDescription: '',
      generatedResult: null
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
  padding-top: 160rpx; /* 为自定义导航栏留出空间 */
  padding-bottom: 60px;
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 模块标题栏（服装设计） */
.section-header {
  padding: 30rpx 30rpx 30rpx 0;
  background-color: #FFF8F0; /* 与页面背景同色 */
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}
.header-icon {
  font-size: 36rpx;
  color: #FF7F50;
}
.header-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF7F50;
}

/* 设计容器 - 统一样式 */
.design-container {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 容器标题 - 圆角样式 */
.container-title {
  background-color: #FF7F50;
  color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.title-icon {
  font-size: 32rpx;
}
.title-text {
  font-size: 32rpx;
  font-weight: 500;
}

/* 容器内容 */
.container-content {
  padding: 30rpx;
}

/* 面料需求提示文字 */
.brand-hint {
  font-size: 36rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  font-weight: bold;
}

/* 设计描述输入框 */
.desc-input {
  width: 100%;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx 30rpx;
  min-height: 160rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  background-color: #fafafa;
}
.placeholder-text {
  color: #999999;
  font-size: 28rpx;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  margin: 30rpx 0;
  background-color: #FF7F50;
  color: #fff;
  border-radius: 30rpx;
  padding: 24rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(255, 127, 80, 0.3);
}
.btn-icon {
  font-size: 32rpx;
}
.btn-text {
  font-size: 32rpx;
}

/* 生成结果占位符 */
.result-placeholder {
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  min-height: 240rpx;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-text {
  color: #999999;
  font-size: 28rpx;
}
</style>