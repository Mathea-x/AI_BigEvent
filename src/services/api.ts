// 基础 API 配置和拦截器
import axios from 'axios'
import { APP_CONFIG } from '@/utils/env'

// /* 获取配置的 API 基础地址
// *  若环境变量未设置则使用本地开发服务器 */
// const getApiBaseUrl = (): string => {
//     // 检查环境变量是否存在且有效
//     if (import.meta.env.VITE_API_BASE_URL) {
//         return import.meta.env.VITE_API_BASE_URL as string
//     }
//     console.warn('⚠️  VITE_API_BASE_URL 环境变量未设置，使用默认地址: http://localhost:3001')
//     return 'http://localhost:3001'
// }

// 创建 axios 实例
const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL,
    // baseURL: getApiBaseUrl(),
    baseURL: APP_CONFIG.apiBaseUrl,
    timeout: 10000, // 10秒超时
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 在发送请求前做一些处理
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 发送 API 请求: ${config.method?.toUpperCase()} ${config.url}`)
        // 这里可以添加认证 token 等
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    (error) => {
        console.error('❌ 请求拦截器错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器 - 在接收到响应后做一些处理
api.interceptors.response.use(
    (response) => {
        console.log(`✅ 接收 API 响应: ${response.status} ${response.config.url}`)
        return response
    },
    (error) => {
        console.error('❌ 响应拦截器错误:', error)

        // 统一错误处理
        if (error.response) {
            // 服务器返回了错误状态码
            switch (error.response.status) {
                case 401:
                    console.error('认证失败，请重新登录')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器内部错误')
                    break
                default:
                    console.error(`服务器错误: ${error.response.status}`)
            }
        } else if (error.request) {
            // 请求发送失败
            console.error('网络错误，请检查网络连接')
        } else {
            // 其他错误
            console.error('请求配置错误:', error.message)
        }

        return Promise.reject(error)
    }
)

export default api