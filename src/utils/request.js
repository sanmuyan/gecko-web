import axios from 'axios'
import store from '@/store'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers.token = `${store.getters.token}`
    }
    return config
  },
  error => {
    ElMessage.error(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const {
      success,
      code,
      message,
      data
    } = response.data
    if (success) {
      return data
    } else {
      if (code === 1401) {
        ElMessage.error('需要登录')
        router.push('/login').catch()
      }
      console.log(message)
      return Promise.reject(new Error(message))
    }
  },
  error => {
    ElMessage.error(error)
    return Promise.reject(error)
  }
)

export default service
