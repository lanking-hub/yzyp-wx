/**
 * 简化的请求工具
 * 自动添加token，处理A000100错误码
 */
import { getToken, saveToken, handleLogin } from './auth.js'

// 统一请求函数
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = getToken()

    // 设置请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 如果有token，添加到请求头（根据配置，token名称是'token'）
    if (token) {
      headers['token'] = token
    }

    // 合并配置
    const config = {
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: 120000, // 设置超时时间为120秒（2分钟），应对函数计算冷启动
      ...options
    }

    console.log('发送请求:', config.url, config.method, token ? '有token' : '无token')

    uni.request({
      ...config,
      success: (res) => {
        console.log('请求响应:', res.statusCode, res.data)

        // 检查响应头中的新token（后端自动刷新的token，根据配置token名称是'token'）
        if (res.header && res.header['token']) {
          const newToken = res.header['token']
          console.log('检测到新token，自动保存')
          saveToken(newToken)
        }

        // 检查响应数据中的业务状态码
        if (res.data && res.data.code === 'A000100') {
          // 收到A000100错误码，触发登录流程
          handleLogin()
          reject(new Error('用户未登录'))
          return
        }

        // 处理HTTP状态码
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败，状态码: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'error'
        })
        reject(err)
      }
    })
  })
}

// GET请求
function get(url, data = {}, options = {}) {
  return request({
    ...options,
    method: 'GET',
    url,
    data
  })
}

// POST请求
function post(url, data = {}, options = {}) {
  return request({
    ...options,
    method: 'POST',
    url,
    data
  })
}

// PUT请求
function put(url, data = {}, options = {}) {
  return request({
    ...options,
    method: 'PUT',
    url,
    data
  })
}

// DELETE请求
function del(url, data = {}, options = {}) {
  return request({
    ...options,
    method: 'DELETE',
    url,
    data
  })
}

export {
  request,
  get,
  post,
  put,
  del
}