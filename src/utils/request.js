import axios from 'axios'
import { saveAs } from 'file-saver';
import { useUserStore } from '@/stores'
import router from '@/router'
const baseURL = ''

import { ElLoading, ElMessageBox, ElMessage } from 'element-plus'
const instance = axios.create({
  // 基地址
  baseURL,
  timeout: 120000000
})
var loadingCount = 0
var loadingInstance = null
// 请求拦截
instance.interceptors.request.use(
  (config) => {
    if (config.ext === undefined || config.ext.loading === undefined || config.ext.loading === true) {
      loadingCount++;
      loadingInstance = ElLoading.service({
        lock: true,
        text: '系统正在加载数据中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
    // 携带token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token_type + ' ' + userStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截
instance.interceptors.response.use(
  (res) => {

    if (loadingCount > 0) {
      loadingCount--;
      if (loadingCount <= 0) {
        loadingInstance.close();
      }
    }
    const contentType = res.headers['content-type'];
    if (contentType && contentType.includes('application/octet-stream')) {
      // 如果是文件流，则处理下载

      console.info("res.headers", res.headers)
      const blob = new Blob([res.data], { type: contentType });
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'downloaded_file';

      if (contentDisposition) {
        // 使用正则表达式提取文件名
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch != null && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      // saveAs(blob, filename);

      let objectUrl = (window.URL || window.webkitURL).createObjectURL(blob)
      let downFile = document.createElement('a')
      downFile.style.display = 'none'
      downFile.href = objectUrl
      downFile.download = filename // 下载后文件名
      document.body.appendChild(downFile)
      downFile.click()
      document.body.removeChild(downFile) // 下载完成移除元素
      // window.location.href = objectUrl
      window.URL.revokeObjectURL(objectUrl)   // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须
      return Promise.resolve(res);
    } else {
      // 业务拦截
      if (res.data.success) {
        return res
      }
      // 处理失败,给错误提示
      ElMessage.error(res.data.msg || '服务繁忙')
      return Promise.reject(res.data)
    }
  },
  (err) => {
    if (loadingCount > 0) {
      loadingCount--;
      if (loadingCount <= 0) {
        loadingInstance.close();
      }
    }
    // 响应出错
    // 处理401错误
    if (err.response?.status === 401) {
      // router.push('/login')
      router.replace('/login')
    }
    // 错误默认情况
    console.info('异常错误', err)
    if (err.response && err.response.data)
      ElMessage.error(err.response.data.msg)
    else
      ElMessage.error('服务异常')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
