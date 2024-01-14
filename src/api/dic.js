import request from '@/utils/request.js'


// 获取字典类型
export const GetDic = (params) => {
    return request.get('/api/Dic/GetDic', { params: params })
}

// 获取字典列表
export const GetDicData = (params) => {
    return request.get('/api/Dic/GetDicData', { params: params })
}