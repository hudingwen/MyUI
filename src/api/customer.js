import request from '@/utils/request.js'

// 文件上传
export const upload = (url, params) => {
    return request.post(url, params);
};