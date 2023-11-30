import axios from 'axios'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '../router'

const baseURL = ''

const instance = axios.create({
  //基地址
  baseURL,
  timeout: 30000
})

//请求拦截
instance.interceptors.request.use(
  (config) => {
    //携带token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

//响应拦截
instance.interceptors.response.use(
  (res) => {
    //业务拦截
    if (res.data.success) {
      return res
    }
    //处理失败,给错误提示
    ElMessage.error(res.data.msg || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    //响应出错
    //处理401错误
    if (err.response?.status === 401) {
      router.push('/login')
    }
    //错误默认情况
    ElMessage.error(err.response.data.msg || '服务异常')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
