import request from '@/utils/request.js'


//获取日志列表
export const getNginxLogs = params => {
    return request.get('/api/Nginx/Get', { params: params });
};