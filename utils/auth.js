/**
 * 简化的认证工具
 * 只处理token保存和基本登录逻辑
 */

// H5初始化：启动时自动设置固定token
// #ifdef H5
(function initH5Token() {
  const H5_FIXED_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTc3MDI4MTgzN30.BztZ41BxkuqgpE3loYZXqyuLM7C3g_lnj-9MHfoSEGc'

  // 检查是否已有token
  const existingToken = getToken()

  if (!existingToken) {
    // 首次启动，设置固定token
    saveToken(H5_FIXED_TOKEN)
    console.log('🎯 H5初始化 - 已自动设置固定token')
  } else {
    console.log('🎯 H5初始化 - 已存在token，无需重复设置')
  }
})()
// #endif

// 保存token
function saveToken(token) {
  try {
    uni.setStorageSync('token', token)
    console.log('token保存成功')
  } catch (e) {
    console.error('token保存失败:', e)
  }
}

// 获取token
function getToken() {
  try {
    return uni.getStorageSync('token')
  } catch (e) {
    console.error('获取token失败:', e)
    return null
  }
}

// 清除token
function clearToken() {
  try {
    uni.removeStorageSync('token')
    console.log('token清除成功')
  } catch (e) {
    console.error('token清除失败:', e)
  }
}

// 发送登录请求
function loginRequest(code, userInfo) {
  return new Promise((resolve, reject) => {
    const requestData = {
      code: code,
      name: userInfo.nickName,
      avatar: userInfo.avatarUrl
    }

    console.log('=== 登录请求数据 ===')
    console.log('请求URL: https://fashionai.top/api/user/login')
    console.log('请求方法: POST')
    console.log('发送的数据:', requestData)
    console.log('用户昵称:', userInfo.nickName)
    console.log('用户头像URL:', userInfo.avatarUrl)

    uni.request({
      url: 'https://fashionai.top/api/user/login',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: (res) => {
        console.log('=== 登录响应数据 ===')
        console.log('HTTP状态码:', res.statusCode)
        console.log('响应数据:', res.data)

        if (res.statusCode === 200) {
          // 从响应数据获取token
          if (res.data && res.data.data && res.data.data.token) {
            const token = res.data.data.token
            console.log('找到token，开始保存:', token ? '有效token' : '空token')
            saveToken(token)
            console.log('登录成功，token已保存')
            resolve(res.data.data)
          } else {
            console.error('登录响应中没有找到token')
            console.log('响应数据结构:', JSON.stringify(res.data, null, 2))
            reject(new Error('登录响应中没有找到token'))
          }
        } else {
          console.error('登录失败，状态码不是200:', res.statusCode)
          reject(new Error(res.data?.message || '登录失败'))
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err)
        reject(new Error('网络请求失败'))
      }
    })
  })
}

// 登录处理
function handleLogin() {
  console.log('开始登录处理流程')

  // 提示用户未登录
  uni.showToast({
    title: '用户未登录，请先登录',
    icon: 'none',
    duration: 1500
  })

  // 显示登录确认弹窗
  setTimeout(() => {
    uni.showModal({
      title: '登录提示',
      content: '检测到您未登录，是否现在登录？',
      confirmText: '立即登录',
      cancelText: '稍后再说',
      success: (modalRes) => {
        console.log('用户选择登录:', modalRes.confirm)
        if (modalRes.confirm) {
          // 用户点击了立即登录，此时可以调用getUserProfile
          performUserProfileLogin()
        }
      }
    })
  }, 500)
}

// 执行用户信息授权登录
function performUserProfileLogin() {
  console.log('开始执行登录获取用户信息')

  // #ifdef MP-WEIXIN
  // ========== 微信小程序登录逻辑 ==========
  console.log('使用微信小程序登录方式')

  uni.getUserProfile({
    desc: '用户登录',
    success: (profileRes) => {
      console.log('getUserProfile成功，获取用户信息:', profileRes.userInfo)

      const userInfo = profileRes.userInfo
      console.log('用户昵称:', userInfo.nickName)
      console.log('用户头像:', userInfo.avatarUrl)

      // 获取微信登录code
      console.log('开始获取微信登录code')
      uni.login({
        success: (loginRes) => {
          if (loginRes.code) {
            console.log('获取登录凭证成功，code:', loginRes.code)

            // 发送登录请求
            console.log('发送登录请求到后端，携带用户信息')
            loginRequest(loginRes.code, userInfo)
              .then((result) => {
                console.log('登录请求成功:', result)
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                })
                // 登录成功后刷新页面数据
                setTimeout(() => {
                  // 获取当前页面实例
                  if (typeof getCurrentPages !== 'undefined' && getCurrentPages().length > 0) {
                    const currentPage = getCurrentPages()[getCurrentPages().length - 1]
                    console.log('登录成功，当前页面:', currentPage.route)

                    if (currentPage && typeof currentPage.fetchUserInfo === 'function') {
                      console.log('调用fetchUserInfo刷新用户信息')
                      // 调用fetchUserInfo并传入登录刷新标识
                      currentPage.fetchUserInfo(true)
                    } else if (currentPage) {
                      console.log('当前页面没有fetchUserInfo方法，使用onShow刷新')
                      // 如果没有fetchUserInfo方法，尝试调用onShow
                      if (typeof currentPage.onShow === 'function') {
                        currentPage.onShow()
                      }
                    }
                  }
                }, 1500)
              })
              .catch((error) => {
                console.error('登录请求失败:', error)
                uni.showToast({
                  title: '登录失败: ' + error.message,
                  icon: 'error'
                })
              })
          } else {
            console.error('获取登录凭证失败，code为空')
            uni.showToast({
              title: '获取登录凭证失败',
              icon: 'error'
            })
          }
        },
        fail: (err) => {
          console.error('uni.login失败:', err)
          uni.showToast({
            title: '微信登录失败',
            icon: 'error'
          })
        }
      })
    },
    fail: (err) => {
      console.error('getUserProfile失败，用户拒绝授权:', err)
      uni.showModal({
        title: '授权失败',
        content: '需要获取用户信息才能使用完整功能，请重试授权',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            console.log('用户选择重试授权')
            performUserProfileLogin()
          }
        }
      })
    }
  })
  // #endif

  // #ifdef H5
  // ========== H5网页登录逻辑（使用小程序固定token，有效期7天） ==========
  console.log('H5模式 - 使用小程序固定token')

  // 固定token：从小程序中获取的真实token
  // ⚠️ 注意：每次小程序重新登录后，需要更新这里的token值
  // ⚠️ Token有效期：7天，过期后需要重新获取
  // 📅 最后更新时间：2025-01-29
  const H5_FIXED_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTc3MDI4MTgzN30.BztZ41BxkuqgpE3loYZXqyuLM7C3g_lnj-9MHfoSEGc'

  // 直接设置固定token，无需确认
  saveToken(H5_FIXED_TOKEN)
  console.log('H5模式 - 已设置固定token（7天有效）')

  uni.showToast({
    title: '已登录',
    icon: 'success',
    duration: 1500
  })

  // 延迟后刷新页面数据
  setTimeout(() => {
    if (typeof getCurrentPages !== 'undefined' && getCurrentPages().length > 0) {
      const currentPage = getCurrentPages()[getCurrentPages().length - 1]
      if (currentPage && typeof currentPage.fetchUserInfo === 'function') {
        currentPage.fetchUserInfo(true)
      } else if (currentPage && typeof currentPage.onShow === 'function') {
        currentPage.onShow()
      }
    }
  }, 1000)
  // #endif
}

export {
  saveToken,
  getToken,
  clearToken,
  handleLogin,
  performUserProfileLogin
}