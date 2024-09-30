import request from '@/utils/request.js' 

//查询商店
export const getAppShop = params => {
    return request.get('/api/AppShop/Get', { params: params });
};
//添加商店
export const addAppShop = params => {
    return request.post('/api/AppShop/Post', params);
};
//更新商店
export const updateAppShop = params => {
    return request.put('/api/AppShop/Put', params);
};
//删除商店
export const delAppShop = params => {
    return request.delete('/api/AppShop/Delete', { params: params });
};
