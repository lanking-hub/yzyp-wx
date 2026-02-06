<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <CustomNavBar />

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 收藏标题 -->
      <view class="header-section">
        <view class="title-left">
          <image class="header-icon" src="/static/icons/actions/爱心_active.svg" mode="aspectFit"></image>
          <text class="page-title">我的收藏</text>
        </view>
      </view>

      <!-- 收藏列表 -->
      <view class="collection-list">
        <view
          v-for="(item, index) in (collectionData || [])"
          :key="index"
          class="collection-item"
          @click="showCollectionDetail(item)"
        >
          <view class="item-main">
            <!-- 左侧图片 -->
            <view class="item-left">
              <image
                class="item-image"
                :src="item.content"
                mode="aspectFill"
                @error="onImageError"
              ></image>
            </view>
            <!-- 右侧信息 -->
            <view class="item-right">
              <view class="item-title">{{ item.title || '暂无标题' }}</view>
              <view class="item-brand-info">
                <text class="brand-prefix">品牌：</text>
                <text class="item-brand">{{ item.brand || '未知品牌' }}</text>
                <text class="item-time">{{ formatTime(item.createTime) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-section">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && (collectionData || []).length === 0" class="empty-section">
        <text>暂无收藏记录</text>
      </view>
    </view>

    <!-- 收藏详情弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-container" @click.stop>
        <!-- 弹窗标题栏 -->
        <view class="modal-header">
          <text class="modal-title">收藏详情</text>
          <view class="close-btn" @click="closeModal">×</view>
        </view>

        <!-- 弹窗内容 -->
        <view class="modal-content">
          <view class="modal-info-section">
            <view class="info-item">
              <text class="info-label">标题</text>
              <text class="info-value">{{ selectedCollection?.title || '暂无标题' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">品牌</text>
              <text class="info-value">{{ selectedCollection?.brand || '未知品牌' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">描述</text>
              <text class="info-value">{{ selectedCollection?.description || '暂无描述' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">生成内容</text>
              <view class="content-image-container">
                <image
                  class="content-image"
                  :src="selectedCollection?.content"
                  mode="aspectFit"
                  @error="onImageError"
                ></image>
              </view>
            </view>
            <view class="info-item">
              <text class="info-label">创建时间</text>
              <text class="info-value">{{ formatTime(selectedCollection?.createTime) }}</text>
            </view>
          </view>
        </view>

        <!-- 底部按钮区域 -->
        <view class="modal-footer">
          <button class="action-btn collect-btn uncollect-btn" @click="unCollectItem(selectedCollection?.id)" :disabled="isCollecting">
            <image v-if="!isCollecting" class="btn-icon-img" src="/static/icons/actions/取消收藏.svg" mode="aspectFit"></image>
            <text v-else class="btn-icon-emoji">⏳</text>
            <text class="btn-text">{{ isCollecting ? '处理中...' : '取消收藏' }}</text>
          </button>
          <button class="action-btn export-btn" @click="saveImage">
            <image class="btn-icon-img" src="/static/icons/actions/download.svg" mode="aspectFit"></image>
            <text class="btn-text">保存图片</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/CustomNavBar/CustomNavBar.vue'
import { get, post } from '../../utils/request.js'

export default {
  name: 'Shoucang',
  components: {
    CustomNavBar
  },
  data() {
    return {
      loading: false,
      showModal: false,
      selectedCollection: null,
      isCollecting: false,
      collectionData: []
    }
  },
  onLoad() {
    this.fetchCollectionData()
  },
  onShow() {
    // 每次页面显示时都刷新收藏数据
    this.fetchCollectionData()
  },
  methods: {
    async fetchCollectionData() {
      try {
        this.loading = true
        console.log('正在获取收藏数据...')

        // 发送GET请求到收藏接口
        const response = await get('https://fashionai.top/api/design-collection', {})
        console.log('收藏数据响应:', response)

        // 从response.data中获取收藏数据（根据您提供的示例，数据在data字段中）
        if (response && response.data) {
          this.collectionData = response.data
          console.log('收藏数据已更新，条数:', this.collectionData.length)
        } else {
          console.log('响应中没有收藏数据')
          this.collectionData = []
        }

      } catch (error) {
        console.error('获取收藏数据失败:', error)
        // 如果是登录相关错误，不需要额外提示，因为request.js已经处理了
        if (!error.message.includes('用户未登录')) {
          uni.showToast({
            title: '获取收藏数据失败',
            icon: 'none'
          })
        }
        this.collectionData = []
      } finally {
        this.loading = false
      }
    },

    showCollectionDetail(item) {
      this.selectedCollection = item
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedCollection = null
    },

    async unCollectItem(id) {
      if (!id) {
        uni.showToast({
          title: '无法取消收藏，缺少ID',
          icon: 'error'
        })
        return
      }

      // 显示确认对话框
      uni.showModal({
        title: '确认取消收藏',
        content: '确定要取消收藏这个项目吗？',
        success: (res) => {
          if (res.confirm) {
            this.performUnCollect(id)
          }
        }
      })
    },

    async performUnCollect(id) {
      this.isCollecting = true

      try {
        console.log('开始取消收藏，ID:', id)

        // 发送POST请求到取消收藏接口（与历史记录页面相同的逻辑）
        const result = await post(`https://fashionai.top/api/design-collection/remove_collect/${id}`)

        console.log('取消收藏结果:', result)

        // 检查取消收藏结果
        if (result && result.code === "0") {
          // 从收藏列表中移除该项
          const index = this.collectionData.findIndex(item => item.id === id)
          if (index > -1) {
            this.collectionData.splice(index, 1)
          }

          uni.showToast({
            title: '已取消收藏',
            icon: 'success'
          })

          // 关闭弹窗
          if (this.selectedCollection && this.selectedCollection.id === id) {
            this.closeModal()
          }
        } else {
          throw new Error(result ? result.message : '取消收藏失败')
        }

      } catch (error) {
        console.error('取消收藏失败:', error)
        uni.showToast({
          title: '取消收藏失败: ' + (error.message || '请重试'),
          icon: 'error'
        })
      } finally {
        this.isCollecting = false
      }
    },

    formatTime(timeStr) {
      if (!timeStr) return '未知时间'
      try {
        const date = new Date(timeStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('时间格式化失败:', error)
        return '未知时间'
      }
    },

    saveImage() {
      if (!this.selectedCollection || !this.selectedCollection.content) {
        uni.showToast({
          title: '没有可保存的图片',
          icon: 'none'
        })
        return
      }

      // #ifdef MP-WEIXIN
      // ========== 微信小程序保存图片到相册 ==========
      uni.showLoading({
        title: '保存中...'
      })

      // 下载图片到本地
      uni.downloadFile({
        url: this.selectedCollection.content,
        success: (res) => {
          if (res.statusCode === 200) {
            // 保存到相册
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.hideLoading()
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                })
              },
              fail: (err) => {
                uni.hideLoading()
                console.error('保存到相册失败:', err)

                // 检查是否是权限问题
                if (err.errMsg && err.errMsg.includes('auth')) {
                  uni.showModal({
                    title: '需要授权',
                    content: '保存图片需要授权访问相册',
                    confirmText: '去授权',
                    cancelText: '取消',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        uni.openSetting()
                      }
                    }
                  })
                } else {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'error'
                  })
                }
              }
            })
          } else {
            uni.hideLoading()
            uni.showToast({
              title: '下载失败',
              icon: 'error'
            })
          }
        },
        fail: (err) => {
          uni.hideLoading()
          console.error('下载图片失败:', err)
          uni.showToast({
            title: '下载失败',
            icon: 'error'
          })
        }
      })
      // #endif

      // #ifdef H5
      // ========== H5网页下载图片 ==========
      uni.showLoading({
        title: '下载中...'
      })

      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = this.selectedCollection.content
        link.download = 'AI服装设计-' + Date.now() + '.png'
        link.target = '_blank'

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        uni.hideLoading()
        uni.showToast({
          title: '下载已开始',
          icon: 'success'
        })
      } catch (error) {
        uni.hideLoading()
        console.error('H5下载图片失败:', error)
        uni.showToast({
          title: '下载失败，请尝试长按图片保存',
          icon: 'none'
        })
      }
      // #endif
    },

    async downloadItem(item) {
      if (!item || !item.content) {
        uni.showToast({
          title: '没有可下载的图片',
          icon: 'none'
        })
        return
      }

      // #ifdef MP-WEIXIN
      // ========== 微信小程序下载图片 ==========
      uni.showLoading({
        title: '下载中...'
      })

      try {
        // 下载图片到本地
        const downloadResult = await uni.downloadFile({
          url: item.content,
          success: (res) => {
            if (res.statusCode === 200) {
              // 保存到相册
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  uni.hideLoading()
                  uni.showToast({
                    title: '下载成功',
                    icon: 'success'
                  })
                },
                fail: (err) => {
                  uni.hideLoading()
                  console.error('保存到相册失败:', err)

                  // 检查是否是权限问题
                  if (err.errMsg && err.errMsg.includes('auth')) {
                    uni.showModal({
                      title: '需要授权',
                      content: '保存图片需要授权访问相册',
                      confirmText: '去授权',
                      cancelText: '取消',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          uni.openSetting()
                        }
                      }
                    })
                  } else {
                    uni.showToast({
                      title: '保存失败',
                      icon: 'error'
                    })
                  }
                }
              })
            } else {
              uni.hideLoading()
              uni.showToast({
                title: '下载失败',
                icon: 'error'
              })
            }
          },
          fail: (err) => {
            uni.hideLoading()
            console.error('下载图片失败:', err)
            uni.showToast({
              title: '下载失败',
              icon: 'error'
            })
          }
        })

      } catch (error) {
        uni.hideLoading()
        console.error('下载过程出错:', error)
        uni.showToast({
          title: '下载出错',
          icon: 'error'
        })
      }
      // #endif

      // #ifdef H5
      // ========== H5网页下载图片 ==========
      uni.showLoading({
        title: '下载中...'
      })

      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = item.content
        link.download = 'AI服装设计-' + Date.now() + '.png'
        link.target = '_blank'

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        uni.hideLoading()
        uni.showToast({
          title: '下载已开始',
          icon: 'success'
        })
      } catch (error) {
        uni.hideLoading()
        console.error('H5下载图片失败:', error)
        uni.showToast({
          title: '下载失败，请尝试长按图片保存',
          icon: 'none'
        })
      }
      // #endif
    },

    onImageError(e) {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.page-container {
  background-color: #FFF8F0;
  min-height: 100vh;
}

/* 内容包装器 */
.content-wrapper {
  padding-top: 200rpx;
  padding-bottom: 60px;
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 头部标题区域 */
.header-section {
  margin-bottom: 40rpx;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.header-icon {
  width: 36rpx;
  height: 36rpx;
  /* 将图标颜色转换为深蓝色 */
  filter: brightness(0) saturate(100%) invert(9%) sepia(39%) saturate(3894%) hue-rotate(227deg) brightness(99%) contrast(96%);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1E3A8A;
}

/* 收藏列表 */
.collection-list {
  margin-bottom: 40rpx;
}

.collection-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.item-main {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.item-left {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
}

.item-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.item-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-brand-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.item-brand {
  font-size: 24rpx;
  color: #333;
  font-weight: normal;
}

.item-time {
  font-size: 24rpx;
  color: #999;
  margin-left: auto;
}

.brand-prefix {
  font-size: 24rpx;
  color: #666;
  font-weight: normal;
}

.item-content {
  margin-bottom: 20rpx;
}

.item-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
}


/* 统一按钮样式 - 橙色细边框、白色背景、橙色文字和图标 */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: 2rpx solid #FF7F50;
  background-color: #fff;
  color: #FF7F50;
  font-weight: 500;
  flex: 1;
  transition: all 0.3s ease;
}

/* 按钮图标样式 - 图片 */
.btn-icon-img {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
}

/* 按钮图标样式 - emoji */
.btn-icon-emoji {
  font-size: 24rpx;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 28rpx;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

/* 按钮悬停效果 */
.action-btn:active {
  background-color: #FFF8F0;
}

/* 按钮禁用状态 */
.action-btn:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  color: #999999;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 60rpx;
  color: #999;
}

/* 空状态 */
.empty-section {
  text-align: center;
  padding: 60rpx;
  color: #999;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background-color: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 700rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
}

/* 弹窗标题栏 */
.modal-header {
  background: linear-gradient(to right, #1A237E 0%, #4A235A 50%, #9C27B0 100%);
  color: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 48rpx;
  color: #fff;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 弹窗内容区域 */
.modal-content {
  padding: 40rpx;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.modal-info-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.content-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  max-height: 400rpx;
  overflow: hidden;
}

.content-image {
  max-width: 100%;
  max-height: 360rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
}

/* 底部按钮区域 */
.modal-footer {
  padding: 30rpx 40rpx 40rpx;
  display: flex;
  gap: 20rpx;
  flex-shrink: 0;
  border-top: 1rpx solid #f0f0f0;
}

/* 弹窗按钮样式 - 蓝紫色渐变背景、白色文字 */
.modal-footer .action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx 0;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #5B9BD5 100%);
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(30, 58, 138, 0.2);
}

/* 弹窗按钮图标样式 - 图片 */
.modal-footer .btn-icon-img {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  /* 将图标颜色转换为白色 */
  filter: brightness(0) saturate(100%) invert(100%);
}

/* 弹窗按钮图标样式 - emoji */
.modal-footer .btn-icon-emoji {
  font-size: 24rpx;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-footer .btn-text {
  font-size: 28rpx;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

/* 弹窗按钮悬停效果 */
.modal-footer .action-btn:active {
  opacity: 0.8;
}

/* 弹窗动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>