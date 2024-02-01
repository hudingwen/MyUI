import request from '@/utils/request.js'


//获取激活码
export const getAppleKey = params => {
    return request.get('/api/AppleKey/Get', { params: params });
};
//添加激活码
export const addAppleKey = params => {
    return request.post('/api/AppleKey/Post', params);
};
//更新激活码
export const updateAppleKey = params => {
    return request.put('/api/AppleKey/Put', params);
};
//删除激活码 
export const delAppleKey = params => {
    return request.delete('/api/AppleKey/Delete', { params: params });
};
//删除激活码 
export const delBatchAppleKey = params => {
    return request.post('/api/AppleKey/Deletes', params);
};