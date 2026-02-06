<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<CustomNavBar />

		<!-- 内容区域，为导航栏留出空间 -->
		<view class="content-wrapper">
			<!-- 服装设计标题栏 -->
			<view class="section-header">
				<view class="title-left">
					<image class="title-icon" src="/static/icons/actions/pencil_active.svg" mode="aspectFit"></image>
					<text class="header-text">服装设计</text>
				</view>
				<view class="title-right" @click="refreshPage">
					<image class="refresh-icon" src="/static/icons/actions/刷新.svg" mode="aspectFit"></image>
				</view>
			</view>

			<!-- 设计描述容器 -->
			<view class="design-container">
				<view class="container-title gradient-1">
					<image class="title-icon" src="/static/icons/actions/tshirt.svg" mode="aspectFit"></image>
					<text class="title-text">设计描述</text>
				</view>
				<view class="container-content">
					<text class="brand-hint">描述您想要的服装</text>
					<!-- #ifdef H5 -->
					<textarea v-model="designDescription" class="desc-input" placeholder="例如：一条收腰纯色连衣裙，适合春季穿着…"
						style="width:100%;height:80px;padding:12px 15px;border:1px solid #eee;border-radius:6px;font-size:14px;background:#fafafa;box-sizing:border-box;resize:none;cursor:text;display:block;"></textarea>
					<!-- #endif -->
					<!-- #ifndef H5 -->
					<textarea v-model="designDescription" class="desc-input" placeholder="例如：一条收腰纯色连衣裙，适合春季穿着…"
						placeholder-class="placeholder-text" auto-height></textarea>
					<!-- #endif -->

					<!-- 品牌风格选择 -->
					<view class="brand-section">
						<text class="brand-hint">选择品牌风格</text>
						<view class="brand-list">
							<view class="brand-item brand-item-pink" :class="{ active: selectedBrand === 'ralph-lauren' }"
								@click="selectBrand('ralph-lauren')">
								<image class="item-icon" src="/static/icons/brands/四芒星.svg" mode="aspectFit"></image>
								<text class="item-name">Ralph Lauren</text>
							</view>
							<view class="brand-item brand-item-cyan" :class="{ active: selectedBrand === 'house-of-cb' }"
								@click="selectBrand('house-of-cb')">
								<image class="item-icon" src="/static/icons/brands/四芒星.svg" mode="aspectFit"></image>
								<text class="item-name">CHANEL</text>
							</view>
							<view class="brand-item brand-item-green" :class="{ active: selectedBrand === 'lululemon' }"
								@click="selectBrand('lululemon')">
								<image class="item-icon" src="/static/icons/brands/四芒星.svg" mode="aspectFit">
								</image>
								<text class="item-name">Lululemon</text>
							</view>
							<view class="brand-item brand-item-purple" :class="{ active: selectedBrand === 'zara' }"
								@click="selectBrand('zara')">
								<image class="item-icon" src="/static/icons/brands/四芒星.svg" mode="aspectFit"></image>
								<text class="item-name">ZARA</text>
							</view>
							<view class="brand-item brand-item-orange" :class="{ active: selectedBrand === 'cos' }"
								@click="selectBrand('cos')">
								<image class="item-icon" src="/static/icons/brands/四芒星.svg" mode="aspectFit"></image>
								<text class="item-name">Louis Vuitton</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 生成按钮 -->
			<button class="generate-btn" @click="generateDesign" :disabled="isGenerating">
				<image v-if="!isGenerating" class="btn-icon-img" src="/static/icons/actions/wand-magic.svg"
					mode="aspectFit"></image>
				<text v-else class="btn-icon-emoji">⏳</text>
				<text class="btn-text">{{ isGenerating ? '生成中...' : '生成服装设计' }}</text>
			</button>

			<!-- 冷启动提示 - 点击生成后显示 -->
			<view v-if="showColdStartTip" class="cold-start-tip">
				<text class="tip-icon">💡</text>
				<text class="tip-text">模型加载中，首次生成需要30-60秒，请耐心等待</text>
			</view>

			<!-- 生成结果容器 -->
			<view class="design-container">
				<view class="container-title gradient-2">
					<image class="title-icon" src="/static/icons/actions/图片.svg" mode="aspectFit"></image>
					<text class="title-text">生成结果</text>
				</view>
				<view class="container-content">
					<!-- AI生成提示 -->
					<view class="ai-notice" v-if="generatedResult">
						<text class="ai-notice-text">图像由AI生成，请注意甄别</text>
					</view>

					<!-- 显示生成的图片 -->
					<view v-if="generatedResult" class="result-image-container">
						<image class="result-image" :src="generatedResult" mode="aspectFit" @click="previewImage">
						</image>
						<view class="result-actions">
							<button class="action-btn save-btn" @click="saveImage">
								<image class="action-icon" src="/static/icons/actions/download.svg" mode="aspectFit">
								</image>
								<text class="action-text">保存图片</text>
							</button>
							<button class="action-btn retry-btn" @click="retryGenerate">
								<image class="action-icon" src="/static/icons/actions/pencil_active.svg"
									mode="aspectFit"></image>
								<text class="action-text">重新生成</text>
							</button>
						</view>
						<button class="collect-btn" @click="collectDesign" :disabled="isCollecting || !generatedHistoryId">
							<image v-if="!isCollecting" class="collect-icon-img" src="/static/icons/actions/爱心_active.svg"
								mode="aspectFit"></image>
							<text v-else class="collect-icon-emoji">⏳</text>
							<text class="collect-text">{{
								isCollecting ? '收藏中...' :
								!generatedHistoryId ? '无法收藏' :
								'收藏设计'
							}}</text>
						</button>
						<!-- 提示文字 -->
						<view class="warning-text">
							<text v-if="!generatedHistoryId" class="error-hint">⚠️ 记录保存失败，无法收藏。请使用"保存图片"功能。</text>
							<text v-else class="expiry-notice">生成图像有效期为30天，请及时保存</text>
						</view>
					</view>

					<!-- 生成签占位符 -->
					<view v-else class="result-placeholder">
						<view class="placeholder-image">
							<view class="clothing-icon">
								<image src="/static/icons/actions/tshirt.svg" mode="aspectFit"></image>
							</view>
							<text class="placeholder-text">生成的服装设计将显示在这里</text>
							<!-- 银色光影扫描效果 -->
							<view class="shimmer-effect"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from '../../components/CustomNavBar/CustomNavBar.vue'
	import {
		post
	} from '../../utils/request.js'

	export default {
		name: 'Sheji',
		components: {
			CustomNavBar
		},
		mounted() {
			// 检查是否需要冷启动提示
			this.checkColdStart()
		},
		data() {
			return {
				designDescription: '',
				selectedBrand: 'ralph-lauren',
				generatedResult: null,
				generatedHistoryId: null, // 保存historyId
				isGenerating: false,
				isCollecting: false, // 新增：收藏状态
				selectingBrand: false, // 防止快速点击
				isSavingRecord: false, // 新增：正在保存记录状态
				recordSaveTimer: null, // 记录保存定时器
				needColdStartTip: true, // 是否需要显示冷启动提示
				showColdStartTip: false, // 是否正在显示冷启动提示
				COLD_START_THRESHOLD: 5 * 60 * 1000, // 5分钟冷启动阈值
				coldStartTipTimer: null, // 冷启动提示自动隐藏定时器
				// 品牌名称到缩写的映射
				brandMapping: {
					'ralph-lauren': 'rl',
					'house-of-cb': 'hoc',
					'lululemon': 'lulu',
					'zara': 'zara',
					'cos': 'cos'
				}
			}
		},
		methods: {
			// 检查是否需要冷启动提示
			checkColdStart() {
				const lastGenerateTime = uni.getStorageSync('lastGenerateTime')
				if (lastGenerateTime) {
					const timeDiff = Date.now() - lastGenerateTime
					// 如果距离上次生成不到5分钟，不需要提示
					if (timeDiff < this.COLD_START_THRESHOLD) {
						this.needColdStartTip = false
					}
				}
			},

			// 更新最后生成时间
			updateLastGenerateTime() {
				uni.setStorageSync('lastGenerateTime', Date.now())
			},

			// 选择品牌
			selectBrand(brand) {
				// 防止快速点击
				if (this.selectingBrand) {
					return
				}

				this.selectingBrand = true
				this.selectedBrand = brand
				console.log('选择品牌:', brand)

				// 使用 nextTick 确保 DOM 更新完成后再解除锁定
				this.$nextTick(() => {
					setTimeout(() => {
						this.selectingBrand = false
					}, 200) // 200ms 后允许再次点击
				})
			},

			// 生成设计
			async generateDesign() {
				// 验证输入
				if (!this.designDescription.trim()) {
					uni.showToast({
						title: '请输入设计描述',
						icon: 'none'
					})
					return
				}

				this.isGenerating = true

				// 检查是否需要显示冷启动提示
				if (this.needColdStartTip) {
					this.showColdStartTip = true

					// 5秒后自动隐藏提示
					if (this.coldStartTipTimer) {
						clearTimeout(this.coldStartTipTimer)
					}
					this.coldStartTipTimer = setTimeout(() => {
						this.showColdStartTip = false
					}, 5000)
				}

				try {
					// 获取品牌缩写
					const brandAbbr = this.brandMapping[this.selectedBrand]

					// 发送POST请求
					const result = await post('https://fashionai.top/api/image/generate', {
						prompt: this.designDescription,
						brand: brandAbbr,
						height: 1024, // 可以设置默认高度
						width: 1024 // 可以设置默认宽度
					})

					console.log('生成结果:', result)
					console.log('result.code:', result?.code)
					console.log('result.data:', result?.data)
					console.log('imageUrl:', result?.data?.imageUrl)

					// 检查Result的code字段，成功是"0"
					if (result && result.code === "0" && result.data && result.data.imageUrl) {
						this.generatedResult = result.data.imageUrl
						this.generatedHistoryId = result.data.historyId // 保存historyId
						this.updateLastGenerateTime() // 更新最后生成时间
						this.needColdStartTip = false // 生成成功后，短时间内不需要再提示
						this.showColdStartTip = false // 隐藏提示

						console.log('✅ 已设置 generatedResult:', this.generatedResult)
						console.log('✅ generatedResult 类型:', typeof this.generatedResult)

						// 清除定时器
						if (this.coldStartTipTimer) {
							clearTimeout(this.coldStartTipTimer)
							this.coldStartTipTimer = null
						}

						console.log('图片生成成功，完整响应数据:', result.data)
						console.log('图片生成成功，historyId:', this.generatedHistoryId)
						console.log('historyId 类型:', typeof this.generatedHistoryId)
						console.log('请求ID:', result.requestId)

						// 检查 historyId 是否有效
						if (!this.generatedHistoryId) {
							console.warn('警告：historyId 为空，可能无法收藏')
							uni.showModal({
								title: '生成成功但无法收藏',
								content: '图像已成功生成，但由于记录保存失败，无法收藏到收藏夹。请尽快保存图片到本地。',
								showCancel: false
							})
						} else {
							// 静默保存记录，不显示提示
							this.isSavingRecord = true
							console.log('正在后台保存记录...')

							// 2秒后允许操作，给后端足够时间保存记录
							this.recordSaveTimer = setTimeout(() => {
								this.isSavingRecord = false
								console.log('记录保存完成，可以正常操作')
							}, 2000)
						}
					} else if (result && result.code === "C000101") {
						// 特殊处理：图像生成成功但保存失败的情况
						uni.showModal({
							title: '部分成功',
							content: '图像已生成成功，但保存记录失败。是否仍要显示生成的图像？',
							success: (res) => {
								if (res.confirm) {
									// 用户选择显示图像，这里需要从其他地方获取图像URL
									// 或者让后端在错误响应中仍返回图像URL
									uni.showToast({
										title: '请联系开发者获取图像',
										icon: 'none'
									})
								}
							}
						})
					} else {
						throw new Error('生成结果格式异常: ' + (result ? result.message : '响应为空'))
					}

				} catch (error) {
					console.error('生成失败:', error)

					// 504错误特殊处理
					if (error.message && error.message.includes('504')) {
						uni.showToast({
							title: '模型加载中，稍后再试',
							icon: 'none',
							duration: 2000
						})
					} else {
						uni.showToast({
							title: '生成失败: ' + (error.message || '请重试'),
							icon: 'none'
						})
					}
				} finally {
					this.isGenerating = false
					// 隐藏提示
					this.showColdStartTip = false
					if (this.coldStartTipTimer) {
						clearTimeout(this.coldStartTipTimer)
						this.coldStartTipTimer = null
					}
				}
			},

			// 预览图片
			previewImage() {
				if (!this.generatedResult) return

				uni.previewImage({
					urls: [this.generatedResult],
					current: this.generatedResult
				})
			},

			// 保存图片
			saveImage() {
				if (!this.generatedResult) return

				// 检查是否正在保存记录
				if (this.isSavingRecord) {
					uni.showToast({
						title: '正在保存记录,请稍候...',
						icon: 'none',
						duration: 2000
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
					url: this.generatedResult,
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
									if (err.errMsg.includes('auth')) {
										uni.showModal({
											title: '需要授权',
											content: '保存图片需要授权访问相册',
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
					link.href = this.generatedResult
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

			// 收藏设计
			async collectDesign() {
				// 检查是否有historyId
				console.log('检查收藏条件 - generatedHistoryId:', this.generatedHistoryId)
				console.log('检查收藏条件 - generatedResult:', this.generatedResult)
				console.log('historyId 类型:', typeof this.generatedHistoryId)

				if (!this.generatedHistoryId) {
					uni.showModal({
						title: '无法收藏',
						content: '由于生成图片时记录保存失败，无法收藏此设计。请使用"保存图片"功能将图片保存到本地。',
						showCancel: false
					})
					return
				}

				// 检查是否正在保存记录
				if (this.isSavingRecord) {
					uni.showToast({
						title: '正在保存记录,请稍候...',
						icon: 'none',
						duration: 2000
					})
					return
				}

				this.isCollecting = true

				try {
					console.log('开始收藏设计，historyId:', this.generatedHistoryId)
					console.log('完整的收藏URL:', `https://fashionai.top/api/design-collection/collect/${this.generatedHistoryId}`)

					// 发送POST请求到收藏接口
					const result = await post(
						`https://fashionai.top/api/design-collection/collect/${this.generatedHistoryId}`)

					console.log('收藏结果:', result)
					console.log('收藏结果 code:', result?.code)
					console.log('收藏结果 message:', result?.message)

					// 检查收藏结果
					if (result && result.code === "0") {
						uni.showToast({
							title: '收藏成功',
							icon: 'success'
						})
					} else if (result && result.code === "A000302") {
						// 特殊处理：无法查询到历史记录
						throw new Error('历史记录不存在或已被删除，无法收藏')
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

			// 重新生成
			retryGenerate() {
				this.generatedResult = null
				this.generatedHistoryId = null // 清空historyId
				this.generateDesign()
			},

		// 刷新页面
			refreshPage() {
				// 清除定时器
				if (this.recordSaveTimer) {
					clearTimeout(this.recordSaveTimer)
					this.recordSaveTimer = null
				}

				// 重置所有页面状态到初始状态
				this.designDescription = ''
				this.selectedBrand = 'ralph-lauren'
				this.generatedResult = null
				this.generatedHistoryId = null
				this.isGenerating = false
				this.isCollecting = false
				this.isSavingRecord = false

				uni.showToast({
					title: '页面已刷新',
					icon: 'success'
				})

				console.log('页面已重置到初始状态')
			}
		}
	}
</script>

<style scoped>
	/* 页面容器 */
	.page-container {
		background-color: #FFF8F0;
		/* 与收藏页面统一的浅米色背景 */
		min-height: 100vh;
	}

	/* 内容包装器 - 为导航栏留出空间 */
	.content-wrapper {
		padding-top: 200rpx;
		/* 为自定义导航栏留出空间，与收藏页面保持一致 */
		padding-bottom: 60px;
		padding-left: 30rpx;
		padding-right: 30rpx;
	}

	/* 模块标题栏（服装设计） */
	.section-header {
		margin: 20rpx 0 40rpx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.title-right {
		padding: 8rpx;
		border-radius: 8rpx;
		transition: all 0.3s ease;
	}

	.title-right:active {
		background-color: rgba(30, 58, 138, 0.1);
	}

	.refresh-icon {
		width: 36rpx;
		height: 36rpx;
		/* 将图标颜色转换为深蓝色 */
		filter: brightness(0) saturate(100%) invert(9%) sepia(39%) saturate(3894%) hue-rotate(227deg) brightness(99%) contrast(96%);
	}

	.header-icon {
		font-size: 36rpx;
		color: #1E3A8A;
	}

	.header-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #1E3A8A;
	}

	/* 橙色铅笔图标 - 纯橙色滤镜 */
	.orange-pencil {
		filter: hue-rotate(0deg) saturate(100%) brightness(1.2);
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

	/* 容器标题 - 使用CSS渐变背景 */
	.container-title {
		color: #fff;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	/* 渐变背景1 - 深蓝到浅紫（偏紫） */
	.gradient-1 {
		background: linear-gradient(to right, #1A237E 0%, #4A235A 50%, #9C27B0 100%);
	}

	/* 渐变背景2 - 纯蓝色系（偏蓝） */
	.gradient-2 {
		background: linear-gradient(to right, #00008B 0%, #0064C8 50%, #64B4FF 100%);
	}

	.title-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0; /* 防止图标被拉伸 */
	}

	/* 标题栏图标颜色 */
	.section-header .title-icon {
		filter: brightness(0) saturate(100%) invert(9%) sepia(39%) saturate(3894%) hue-rotate(227deg) brightness(99%) contrast(96%);
		/* 这个滤镜会将颜色转换为 #1E3A8A 深蓝色 */
	}

	.title-text {
		font-size: 32rpx;
		font-weight: 500;
	}

	/* 容器内容 */
	.container-content {
		padding: 30rpx;
	}

	/* AI生成提示 */
	.ai-notice {
		margin-bottom: 20rpx;
	}

	.ai-notice-text {
		font-size: 24rpx;
		color: #1E3A8A;
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
		margin-bottom: 30rpx;
		display: block;
	}

	/* #ifdef H5 */
	.desc-input {
		display: block !important;
		width: 100% !important;
		padding: 12px 15px !important;
		min-height: 80px !important;
		height: 80px !important;
		border: 1px solid #eee !important;
		border-radius: 6px !important;
		font-size: 14px !important;
		background-color: #fafafa !important;
		box-sizing: border-box !important;
		margin-bottom: 15px !important;
		position: relative !important;
		z-index: 1 !important;
		cursor: text !important; /* 强制显示文本输入光标 */
		resize: none !important; /* 禁止拖拽调整大小 */
		outline: none !important; /* 去掉聚焦时的蓝框 */
	}

	.desc-input:hover {
		cursor: text !important;
	}

	.desc-input:focus {
		cursor: text !important;
		border-color: #5B9BD5 !important;
		outline: none !important;
	}

	.container-content {
		position: relative !important;
	}

	.brand-hint {
		position: relative !important;
	}
	/* #endif */

	.placeholder-text {
		color: #999999;
		font-size: 28rpx;
	}

	/* 品牌选择区域 */
	.brand-section {
		margin-top: 20rpx;
	}

	.brand-hint {
		font-size: 36rpx;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
		font-weight: bold;
	}

	.brand-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	/* ============= 品牌按钮颜色方案选择 ============= */
	/* 方案1：纯深蓝色 #1E3A8A */
	/* .brand-item {
		background: linear-gradient(135deg, #1E3A8A 0%, #1E3A8A 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #0f1f4d 0%, #1a3a7a 100%);
	} */

	/* 方案2：浅蓝到深蓝渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #2563EB 0%, #0f1f4d 100%);
	} */

	/* 方案3：蓝紫渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #1A237E 0%, #4A235A 50%, #9C27B0 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #0d1445 0%, #2a1540 50%, #6a1b7a 100%);
	} */

	/* 方案1：纯深蓝色 #1E3A8A */
	/* .brand-item {
		background: #1E3A8A;
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: #0f1f4d;
		border: 3rpx solid #fff;
	} */

	/* 方案2：浅蓝到深蓝渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #2563EB 0%, #0f1f4d 100%);
		border: 4rpx solid #fff;
	} */

	/* 方案3：蓝紫渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #5B6CD8 0%, #7B4B94 50%, #BA68C8 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #1A237E 0%, #4A235A 50%, #6A1B9A 100%);
		border: 4rpx solid #fff;
	} */

	/* 方案4：天蓝到深蓝渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #64B4FF 0%, #0064C8 50%, #00008B 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #3b9dff 0%, #0040a0 50%, #000066 100%);
		border: 4rpx solid #fff;
	} */

	/* 方案1：纯深蓝色 #1E3A8A（当前使用） */
	.brand-item {
		border: none;
		border-radius: 12rpx;
		padding: 20rpx 6rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		min-width: calc(20% - 16rpx);
		/* 5个按钮平均分布，每个占20% */
		max-width: calc(20% - 16rpx);
		/* 限制最大宽度 */
		box-sizing: border-box;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	/* 粉红色 - Ralph Lauren (降低饱和度) */
	.brand-item-pink {
		background: #E6A8D7;
		/* 原色 #FF69B4 → 降低饱和度和亮度 */
	}

	.brand-item-pink.active {
		background: #D485B9;
		/* 激活状态进一步加深 */
		border: 4rpx solid #fff;
		box-shadow: 0 6rpx 20rpx rgba(212, 133, 185, 0.5);
		transform: scale(1.02);
	}

	/* 湖蓝色 - CHANEL (降低饱和度) */
	.brand-item-cyan {
		background: #5FBEBE;
		/* 原色 #00CED1 → 降低饱和度 */
	}

	.brand-item-cyan.active {
		background: #4A9E9E;
		/* 激活状态进一步加深 */
		border: 4rpx solid #fff;
		box-shadow: 0 6rpx 20rpx rgba(74, 158, 158, 0.5);
		transform: scale(1.02);
	}

	/* 翠绿色 - Lululemon (降低饱和度) */
	.brand-item-green {
		background: #6DB3A8;
		/* 原色 #20B2AA → 降低饱和度 */
	}

	.brand-item-green.active {
		background: #4E8F87;
		/* 激活状态进一步加深 */
		border: 4rpx solid #fff;
		box-shadow: 0 6rpx 20rpx rgba(78, 143, 135, 0.5);
		transform: scale(1.02);
	}

	/* 紫色 - ZARA (降低饱和度) */
	.brand-item-purple {
		background: #A794C7;
		/* 原色 #9370DB → 降低饱和度 */
	}

	.brand-item-purple.active {
		background: #8A74B0;
		/* 激活状态进一步加深 */
		border: 4rpx solid #fff;
		box-shadow: 0 6rpx 20rpx rgba(138, 116, 176, 0.5);
		transform: scale(1.02);
	}

	/* 橙色 - Louis Vuitton (降低饱和度) */
	.brand-item-orange {
		background: #E89F5C;
		/* 原色 #FF8C00 → 降低饱和度 */
	}

	.brand-item-orange.active {
		background: #D17F3C;
		/* 激活状态进一步加深 */
		border: 4rpx solid #fff;
		box-shadow: 0 6rpx 20rpx rgba(209, 127, 60, 0.5);
		transform: scale(1.02);
	}

	/* 为所有品牌项添加伪元素作为遮罩层 */
	.brand-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: inherit;
		z-index: 0;
		pointer-events: none;
	}

	.item-icon {
		width: 40rpx;
		height: 40rpx;
		position: relative;
		z-index: 1;
		filter: brightness(0) saturate(100%) invert(100%);
		/* 白色图标 */
		will-change: filter;
	}

	/* LV图标特殊调整 - 向下偏移 */
	.item-icon-lv {
		transform: translateY(6rpx);
	}

	.item-name {
		font-size: 20rpx;
		text-align: center;
		color: #fff;
		position: relative;
		z-index: 1;
		white-space: normal;
		/* 允许换行 */
		word-break: keep-all;
		/* 保持单词完整，不在单词中间断开 */
		overflow-wrap: break-word;
		/* 必要时允许单词间换行 */
		font-weight: 500;
		line-height: 1.3;
		/* 行高，稍微增大改善可读性 */
		width: 100%;
		/* 确保文字占满整个宽度 */
		display: flex;
		/* 使用flex布局 */
		align-items: center;
		/* 垂直居中 */
		justify-content: center;
		/* 水平居中 */
		min-height: 52rpx;
		/* 固定最小高度,容纳2行文字 (20rpx × 1.3 × 2 = 52rpx) */
	}

	/* 方案4：天蓝到深蓝渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #64B4FF 0%, #0064C8 50%, #00008B 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #3b9dff 0%, #0040a0 50%, #000066 100%);
	} */

	/* 方案5：三色蓝渐变 */
	/* .brand-item {
		background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #5B9BD5 100%);
		border: none;
	}
	.item-icon {
		filter: brightness(0) saturate(100%) invert(100%);
	}
	.item-name {
		color: #fff;
	}
	.brand-item.active {
		background: linear-gradient(135deg, #0f1f4d 0%, #2563EB 50%, #3b8acc 100%);
	} */

	/* ============= 结束颜色方案选择 ============= */

	/* 生成按钮 - 扁平风格 */
	.generate-btn {
		width: 100%;
		margin: 30rpx 0;
		background: #3B82F6;
		color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		font-size: 32rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		font-weight: 600;
		box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.25);
		transition: all 0.2s ease;
	}

	.generate-btn:active {
		background: #2563EB;
		transform: scale(0.98);
	}

	/* 生成按钮 - 图片图标样式 */
	.btn-icon-img {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		/* 防止图标被压缩 */
		/* 将图标颜色转换为白色 */
		filter: brightness(0) saturate(100%) invert(100%);
	}

	/* 生成按钮 - emoji 图标样式 */
	.btn-icon-emoji {
		font-size: 28rpx;
		line-height: 1;
		/* 移除额外的行高，确保垂直居中 */
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-text {
		font-size: 32rpx;
		line-height: 1;
		/* 移除额外的行高，确保与图标对齐 */
		display: inline-flex;
		align-items: center;
	}

	/* 生成结果占位符 */
	.result-placeholder {
		border: 2rpx dashed #5B9BD5;
		border-radius: 12rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx;
		/* 改成正方形 */
		width: 100%;
		height: 0;
		padding-bottom: 100%;
		box-sizing: border-box;
		position: relative;
	}

	.placeholder-image {
		width: 90%;
		height: 90%;
		background: linear-gradient(135deg, #F0F4FF, #E6EEFF);
		/* 浅蓝紫色渐变 */
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		/* 居中显示 */
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.clothing-icon {
		width: 128rpx;
		height: 128rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clothing-icon image {
		width: 100%;
		height: 100%;
		filter: grayscale(100%);
	}

	.placeholder-text {
		color: #888888;
		font-size: 28rpx;
		font-weight: normal;
		text-align: center;
		position: relative;
		z-index: 2;
		max-width: 85%;
	}

	/* 光影扫描效果 - 左下到右上 */
	.shimmer-effect {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			135deg,
			transparent 40%,
			rgba(91, 155, 213, 0.15) 50%,
			transparent 60%
		);
		animation: shimmer 2.5s ease-in-out infinite;
		z-index: 1;
	}

	/* 光影扫描动画 */
	@keyframes shimmer {
		0% {
			transform: translate(0, 0) rotate(0deg);
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		100% {
			transform: translate(30%, 30%) rotate(45deg);
			opacity: 0;
		}
	}

	/* 生成结果图片容器 */
	.result-image-container {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.result-image {
		width: 100%;
		border-radius: 12rpx;
		border: 2rpx dashed #5B9BD5;
		background-color: #fff;
		/* 使用固定高度确保图片正确显示 */
		height: 600rpx;
		box-sizing: border-box;
		display: block;
		overflow: hidden;
	}

	.result-image image {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
		display: block;
	}

	.result-actions {
		display: flex;
		gap: 20rpx;
	}

	/* 统一按钮样式 - 扁平风格 */
	.action-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 12rpx;
		border: none;
		background: #1E40AF;
		font-size: 32rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2rpx 6rpx rgba(30, 64, 175, 0.25);
	}

	.action-btn:active {
		background: #1E3A8A;
		transform: scale(0.98);
	}

	/* 收藏按钮样式 - 带紫色的蓝色 */
	.collect-btn {
		width: 100%;
		height: 80rpx;
		border-radius: 12rpx;
		border: none;
		background: #4A5DB8;
		color: #fff;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		margin-top: 8rpx;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2rpx 6rpx rgba(74, 93, 184, 0.25);
	}

	.collect-btn:active {
		background: #3D4A9F;
		transform: scale(0.98);
	}

	/* 收藏按钮 - 图片图标样式 */
	.collect-icon-img {
		width: 28rpx;
		height: 28rpx;
		flex-shrink: 0;
		/* 防止图标被压缩 */
		/* 将图标颜色转换为白色 */
		filter: brightness(0) saturate(100%) invert(100%);
	}

	/* 收藏按钮 - emoji 图标样式 */
	.collect-icon-emoji {
		font-size: 24rpx;
		line-height: 1;
		/* 移除额外的行高，确保垂直居中 */
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.collect-text {
		font-size: 28rpx;
		line-height: 1;
		/* 移除额外的行高，确保与图标对齐 */
		display: inline-flex;
		align-items: center;
	}

	/* 警告提示文字样式 */
	.warning-text {
		text-align: left;
		margin-top: 16rpx;
	}

	.warning-text text {
		font-size: 24rpx;
		color: #999999;
	}

	/* 有效期提示样式 - 深蓝色 */
	.expiry-notice {
		color: #1E3A8A !important;
	}

	/* 错误提示样式 - 深蓝色 */
	.error-hint {
		color: #1E3A8A !important;
		font-weight: 500;
	}

	.action-icon {
		width: 28rpx;
		height: 28rpx;
		/* 将图标颜色转换为白色 */
		filter: brightness(0) saturate(100%) invert(100%);
	}

	.action-text {
		font-size: 28rpx;
	}

	/* 按钮悬停效果已整合到各自的样式中 */

	/* 生成按钮禁用状态 */
	.generate-btn:disabled {
		background: #cccccc;
		box-shadow: none;
	}

	/* 收藏按钮禁用状态 */
	.collect-btn:disabled {
		background: #cccccc;
		color: #999999;
	}

	/* 品牌项激活状态优化 */
	.brand-item:active {
		transform: scale(0.95);
		/* 添加缩放效果，而不是改变背景色，避免闪烁 */
	}

	/* 冷启动提示 - 简洁版 */
	.cold-start-tip {
		margin: 20rpx 0;
		padding: 16rpx 20rpx;
		background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		border-left: 4rpx solid #FF9800;
		box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.15);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tip-icon {
		font-size: 32rpx;
		line-height: 1;
		flex-shrink: 0;
	}

	.tip-text {
		font-size: 24rpx;
		color: #E65100;
		line-height: 1.4;
		flex: 1;
	}
</style>