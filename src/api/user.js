import request  from '@/utils/request.js'

// 用户登录
export const userLogin = (params) => {
  return request.get('/api/Login/JWTToken3.0', { params: params })
}
