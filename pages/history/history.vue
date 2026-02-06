<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <CustomNavBar />

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 历史记录标题 -->
      <view class="header-section">
        <view class="title-left">
          <view class="back-button" @click="goBack">
            <text class="back-arrow">◀</text>
          </view>
          <text class="page-title">历史记录</text>
        </view>
      </view>

      <!-- 历史记录列表 -->
      <view class="history-list">
        <view
          v-for="(item, index) in allRecords"
          :key="index"
          class="history-item"
          @click="showHistoryDetail(item)"
        >
          <view class="item-main">
            <view class="item-left">
              <view class="item-title">{{ item.title || '暂无标题' }}</view>
              <view class="item-brand-info">
                <text class="brand-prefix">品牌：</text>
                <text class="item-brand">{{ item.brand || '未知品牌' }}</text>
                <text class="item-time">{{ formatTime(item.createTime) }}</text>
              </view>
            </view>
            <view class="item-right">
              <view v-if="item.imageLoadError" class="item-image-placeholder">
                <text class="placeholder-icon">🖼️</text>
                <text class="placeholder-text">图片已失效</text>
              </view>
              <image
                v-else
                class="item-image"
                :src="item.content"
                mode="aspectFill"
                @error="(e) => onImageError(e, item)"
                :lazy-load="true"
                :show-menu-by-longpress="false"
              ></image>
            </view>
          </view>
          <view class="delete-icon-wrapper" @click.stop="confirmDeleteItem(item)">
      <text class="delete-icon">✕</text>
      </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="!loading && hasMore && allRecords.length > 0" class="load-more-tip">
        <text>上拉加载更多</text>
      </view>

      <!-- 没有更多数据提示 -->
      <view v-if="!loading && !hasMore && allRecords.length > 0" class="no-more-tip">
        <text>没有更多数据了</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-section">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && allRecords.length === 0" class="empty-section">
        <text>暂无历史记录</text>
      </view>

    </view>

    
    <!-- 历史记录详情弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-container" @click.stop>
        <!-- 弹窗标题栏 -->
        <view class="modal-header">
          <text class="modal-title">历史记录详情</text>
          <view class="close-btn" @click="closeModal">×</view>
        </view>

        <!-- 弹窗内容 -->
        <view class="modal-content">
          <view class="modal-info-section">
            <view class="info-item">
              <text class="info-label">标题</text>
              <text class="info-value">{{ selectedHistory?.title || '暂无标题' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">品牌</text>
              <text class="info-value">{{ selectedHistory?.brand || '未知品牌' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">描述</text>
              <text class="info-value">{{ selectedHistory?.description || '暂无描述' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">生成内容</text>
              <view class="content-image-container">
                <view v-if="selectedHistory?.contentImageError" class="content-image-placeholder">
                  <text class="placeholder-icon-large">🖼️</text>
                  <text class="placeholder-text-large">图片链接已失效</text>
                </view>
                <image
                  v-else
                  class="content-image"
                  :src="selectedHistory?.content"
                  mode="aspectFit"
                  @error="(e) => onContentImageError(e)"
                  :lazy-load="true"
                  :show-menu-by-longpress="false"
                ></image>
              </view>
            </view>
            <view class="info-item">
              <text class="info-label">创建时间</text>
              <text class="info-value">{{ formatTime(selectedHistory?.createTime) }}</text>
            </view>
          </view>
        </view>

        <!-- 底部按钮区域 -->
        <view class="modal-footer">
          <button
            class="action-btn collect-btn"
            :class="{ 'uncollect-btn': selectedHistory?.isCollected === 1 }"
            @click="handleCollectAction"
            :disabled="isCollecting"
          >
            <image v-if="!isCollecting" class="btn-icon-img" :src="selectedHistory?.isCollected === 1 ? '/static/icons/actions/取消收藏.svg' : '/static/icons/actions/爱心_active.svg'" mode="aspectFit"></image>
            <text v-else class="btn-icon-emoji">⏳</text>
            <text class="btn-text">{{ isCollecting ? '处理中...' : (selectedHistory?.isCollected === 1 ? '取消收藏' : '收藏') }}</text>
          </button>
          <button class="action-btn export-btn" @click="saveImage">
            <image class="btn-icon-img" src="/static/icons/actions/download.svg" mode="aspectFit"></image>
            <text class="btn-text">保存图片</text>
          </button>
          <button class="action-btn delete-btn" @click="confirmDeleteSelectedItem">
            <image class="btn-icon-img" src="/static/icons/actions/删除.svg" mode="aspectFit"></image>
            <text class="btn-text">删除</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/CustomNavBar/CustomNavBar.vue'
import { get, del, post } from '../../utils/request.js'

export default {
  name: 'History',
  components: {
    CustomNavBar
  },
  data() {
    return {
      loading: false,
      showModal: false,
      selectedHistory: null,
      isCollecting: false,
      allRecords: [], // 所有累积的记录
      hasMore: true, // 是否还有更多数据
      currentPage: 1,
      pageSize: 10
    }
  },
  onLoad(options) {
    this.fetchHistoryData()
  },
  onReachBottom() {
    this.loadMore()
  },
    methods: {
    async fetchHistoryData(isLoadMore = false) {
      try {
        this.loading = true

        let requestPage = this.currentPage
        if (isLoadMore) {
          // 加载更多时，请求下一页
          requestPage = this.currentPage + 1
        }

        console.log('请求页码:', requestPage, '是否加载更多:', isLoadMore)

        // 这里替换为实际的API调用
        const response = await this.requestHistoryData(requestPage, this.pageSize)
        console.log('历史记录数据响应:', response)

        // 确保返回的数据结构正确 - 数据在response.data中
        const historyListData = response.data || {}
        console.log('历史记录列表数据:', historyListData)
        const newRecords = (historyListData.records || []).map(item => ({
          ...item,
          imageLoadError: false // 初始化图片加载状态
        }))

        if (isLoadMore) {
          // 加载更多：累积数据并更新页码
          this.allRecords = [...this.allRecords, ...newRecords]
          this.currentPage = requestPage
        } else {
          // 首次加载：重置数据
          this.allRecords = newRecords
          this.currentPage = 1
        }

        // 检查是否还有更多数据
        const total = historyListData.total || 0
        this.hasMore = this.allRecords.length < total

        if (!isLoadMore) {
          console.log('历史记录首次加载完成，条数:', this.allRecords.length)
        } else {
          console.log('历史记录加载更多完成，累计条数:', this.allRecords.length, '当前页:', this.currentPage)
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
        // 如果是登录相关错误，不需要额外提示，因为request.js已经处理了
        if (!error.message.includes('用户未登录')) {
          uni.showToast({
            title: '获取历史记录失败',
            icon: 'none'
          })
        }
        if (!isLoadMore) {
          this.allRecords = []
        }
      } finally {
        this.loading = false
      }
    },

    async requestHistoryData(pageNum, pageSize) {
      // 使用封装好的请求工具，自动处理token和错误码
      const response = await get('https://fashionai.top/api/history', {
        pageNum: pageNum,
        pageSize: pageSize
      })

      // request.js会自动处理A000100错误码并触发登录
      // 这里只需要返回数据
      return response
    },

    async loadMore() {
      if (!this.loading && this.hasMore) {
        await this.fetchHistoryData(true)
      }
    },

    
    formatTime(timeStr) {
      if (!timeStr) return '未知时间'
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'processing': '处理中',
        'failed': '失败',
        'pending': '待处理'
      }
      return statusMap[status] || '未知'
    },

    getStatusClass(status) {
      return `status-${status}`
    },

    viewHistoryDetail(item) {
      console.log('查看历史记录详情:', item)
      // 这里可以跳转到详情页面
      uni.navigateTo({
        url: `/pages/history-detail/history-detail?id=${item.id}`
      })
    },

    confirmDeleteItem(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条历史记录吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteHistoryItem(item.id)
          }
        }
      })
    },

    confirmDeleteSelectedItem() {
      if (!this.selectedHistory) {
        uni.showToast({
          title: '请先选择要删除的项目',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条历史记录吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteSelectedItem()
          }
        }
      })
    },

    async deleteSelectedItem() {
      try {
        await this.deleteHistoryItem(this.selectedHistory.id)
        // 删除成功后关闭弹窗
        this.closeModal()
      } catch (error) {
        console.error('删除失败:', error)
      }
    },

    async deleteHistoryItem(id) {
      try {
        // 这里调用删除API
        await this.requestDeleteHistory(id)

        // 从本地数组中移除该项
        const index = this.allRecords.findIndex(item => item.id === id)
        if (index > -1) {
          this.allRecords.splice(index, 1)
        }

        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })

        // 如果当前页已经没有数据了，并且不是第一页，则加载前一页
        if (this.allRecords.length === 0 && this.currentPage > 1) {
          this.currentPage -= 1
          await this.fetchHistoryData(false)
        }
      } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    },

    async requestDeleteHistory(id) {
      // 使用封装好的删除请求工具，自动处理token和错误码
      await del(`https://fashionai.top/api/history/${id}`, {})

      // request.js会自动处理A000100错误码并触发登录
      return { success: true }
    },

    showHistoryDetail(item) {
      // 深拷贝 item，避免直接引用导致的问题
      this.selectedHistory = {
        ...item,
        contentImageError: false // 初始化图片加载状态
      }

      // 使用 nextTick 确保 DOM 更新完成后再显示弹窗
      this.$nextTick(() => {
        this.showModal = true
      })
    },

    closeModal() {
      this.showModal = false
      this.selectedHistory = null
    },

      handleCollectAction() {
      if (!this.selectedHistory || !this.selectedHistory.id) {
        uni.showToast({
          title: '无法操作，缺少历史记录ID',
          icon: 'error'
        })
        return
      }

      // 根据isCollected状态决定是收藏还是取消收藏
      if (this.selectedHistory.isCollected === 1) {
        this.unCollectHistory()
      } else {
        this.collectHistory()
      }
    },

    async collectHistory() {
      this.isCollecting = true

      try {
        console.log('开始收藏历史记录，historyId:', this.selectedHistory.id)

        // 发送POST请求到收藏接口
        const result = await post(`https://fashionai.top/api/design-collection/collect/${this.selectedHistory.id}`)

        console.log('收藏结果:', result)

        // 检查收藏结果
        if (result && result.code === "0") {
          // 更新收藏状态
          this.selectedHistory.isCollected = 1

          // 更新列表中的对应项状态
          const recordIndex = this.allRecords.findIndex(item => item.id === this.selectedHistory.id)
          if (recordIndex !== -1) {
            this.allRecords[recordIndex].isCollected = 1
          }

          uni.showToast({
            title: '收藏成功',
            icon: 'success'
          })
        } else {
          throw new Error(result ? result.message : '收藏失败')
        }

      } catch (error) {
        console.error('收藏失败:', error)
        uni.showToast({
          title: '收藏失败: ' + (error.message || '请重试'),
          icon: 'error'
        })
      } finally {
        this.isCollecting = false
      }
    },

    async unCollectHistory() {
      this.isCollecting = true

      try {
        console.log('开始取消收藏历史记录，historyId:', this.selectedHistory.id)

        // 发送POST请求到取消收藏接口
        const result = await post(`https://fashionai.top/api/design-collection/remove_collect/${this.selectedHistory.id}`)

        console.log('取消收藏结果:', result)

        // 检查取消收藏结果
        if (result && result.code === "0") {
          // 更新收藏状态
          this.selectedHistory.isCollected = 0

          // 更新列表中的对应项状态
          const recordIndex = this.allRecords.findIndex(item => item.id === this.selectedHistory.id)
          if (recordIndex !== -1) {
            this.allRecords[recordIndex].isCollected = 0
          }

          uni.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
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

    saveImage() {
      if (!this.selectedHistory || !this.selectedHistory.content) {
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
        url: this.selectedHistory.content,
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
        link.href = this.selectedHistory.content
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

    truncateContent(content) {
      if (!content) return '暂无内容'
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    },

    onImageError(e, item) {
      console.log('列表图片加载失败:', item.id, e)
      // 图片加载失败时，标记为加载失败状态，可以显示占位符
      item.imageLoadError = true
    },

    onContentImageError(e) {
      console.log('详情图片加载失败:', this.selectedHistory?.id, e)
      // 详情页图片加载失败，可以显示占位符
      if (this.selectedHistory) {
        this.selectedHistory.contentImageError = true
      }
    },

    goBack() {
      uni.navigateBack()
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
  padding-bottom: 60rpx; /* 正常底部内边距 */
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

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.back-button:active {
  transform: scale(0.9);
}

.back-arrow {
  font-size: 36rpx;
  color: #1E3A8A;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1E3A8A;
}

/* 标题栏图标颜色 */
.header-section .header-icon {
  filter: brightness(0) saturate(100%) invert(9%) sepia(39%) saturate(3894%) hue-rotate(227deg) brightness(99%) contrast(96%);
  /* 这个滤镜会将颜色转换为 #1E3A8A 深蓝色 */
}

/* 历史记录列表 */
.history-list {
  margin-bottom: 40rpx;
}


.item-main {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.item-left {
  flex: 1;
  min-width: 0; /* 允许文字内容正确换行 */
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding-top: 8rpx;
}

.item-title {
  font-size: 32rpx;
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

.brand-prefix {
  font-size: 24rpx;
  color: #666;
  font-weight: normal;
}

.item-right {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  position: relative;
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
  background-color: #f5f5f5; /* 添加默认背景色 */
  min-width: 120rpx; /* 防止图片加载时宽度塌陷 */
  min-height: 120rpx; /* 防止图片加载时高度塌陷 */
}

/* 列表图片占位符 */
.item-image-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.placeholder-icon {
  font-size: 32rpx;
  line-height: 1;
}

.placeholder-text {
  font-size: 20rpx;
  color: #999;
  line-height: 1;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.status-completed {
  background-color: #e7f7e7;
  color: #28a745;
}

.status-processing {
  background-color: #fff3cd;
  color: #ffc107;
}

.status-failed {
  background-color: #f8d7da;
  color: #dc3545;
}

.status-pending {
  background-color: #d1ecf1;
  color: #17a2b8;
}

/* 历史记录项支持删除图标定位 */
.history-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  position: relative;
}

/* 删除图标样式 */
.delete-icon-wrapper {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-icon-wrapper:active {
  transform: scale(0.9);
}

.delete-icon {
  font-size: 24rpx;
  line-height: 1;
  color: #666;
  font-weight: normal;
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

/* 加载更多提示 */
.load-more-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 没有更多数据提示 */
.no-more-tip {
  text-align: center;
  padding: 40rpx;
  color: #ccc;
  font-size: 28rpx;
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
  overflow: hidden; /* 防止内容溢出 */
}

.modal-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1; /* 确保背景在弹窗下方 */
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
  background-color: #f5f5f5; /* 添加默认背景色 */
  min-width: 200rpx; /* 防止图片加载时宽度塌陷 */
  min-height: 200rpx; /* 防止图片加载时高度塌陷 */
}

/* 详情页图片占位符 */
.content-image-placeholder {
  width: 100%;
  height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
}

.placeholder-icon-large {
  font-size: 80rpx;
  line-height: 1;
}

.placeholder-text-large {
  font-size: 28rpx;
  color: #999;
  line-height: 1;
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
  padding: 12rpx 0;
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