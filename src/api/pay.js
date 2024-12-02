import request from '@/utils/request.js'

// 获取订单列表
export const GetOrderList = params => {
  return request.get('/api/Pay/GetOrderList', { params: params });
}; 