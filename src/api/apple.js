import request from '@/utils/request.js'
import requestFile from '@/utils/requestFile.js'

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



//获取苹果api账号列表
export const GetAppleApiDicList = params => {
    return request.get('/api/Apple/GetAppleApiDicList', { params: params });
};
//获取配置文件列表
export const GetProfiles = params => {
    return request.get('/api/Apple/GetProfiles', { params: params });
};
//添加一个设备配置
export const AddProfileForDevice = params => {
    return request.get('/api/Apple/AddProfileForDevice', { params: params });
};

//下载配置文件
export const DownloadProfile = params => {
    return requestFile.get('/api/Apple/DownloadProfile', { params: params });
};

//删除一个设备配置
export const DelProfile = params => {
    return request.get('/api/Apple/DelProfile', { params: params });
};

//获取设备列表
export const GetDevices = params => {
    return request.get('/api/Apple/GetDevices', { params: params });
};

//获取设备列表(审核中)
export const GetDevicesProcessing = params => {
    return request.get('/api/Apple/GetDevicesProcessing', { params: params });
};