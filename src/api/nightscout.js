import request from '@/utils/request.js'


//获取血糖实例
export const getNightscout = params => {
    return request.get('/api/Nightscout/Get', { params: params });
};
//删除血糖实例
export const delNightscout = params => {
    return request.delete('/api/Nightscout/Delete', { params: params });
};
//修改血糖实例
export const updateNightscout = params => {
    return request.put('/api/Nightscout/Put', params);
};
//添加血糖实例
export const addNightscout = params => {
    return request.post('/api/Nightscout/Post', params);
};
// 刷新实例
export const RefreshNightscout = params => {
    return request.get('/api/Nightscout/Refresh', { params: params });
};
// 获取微信公众号绑定
export const GetWeChatCode = params => {
    return request.get('/api/Nightscout/GetWeChatCode', { params: params });
};
// 获取小程序绑定
export const GetWeChatMiniCode = params => {
    return request.get('/api/Nightscout/GetBindQR', { params: params });
};
// 获取小程序修复绑定
export const GetWeChatMiniCodeFix = params => {
    return request.get('/api/Nightscout/GetFixQR', { params: params });
};
// 解除公众号绑定
export const UnbindWeChat = params => {
    return request.get('/api/Nightscout/UnbindWeChat', { params: params });
};
// 解除小程序绑定
export const UnbindWeChatMini = params => {
    return request.get('/api/Nightscout/UnBindQR', { params: params });
};
// 获取实例日志
export const GetLog = params => {
    return request.get('/api/Nightscout/GetLog', { params: params });
};
// 重置数据
export const Reset = params => {
    return request.get('/api/Nightscout/Reset', { params: params });
};
// 重置数据
export const Stop = params => {
    return request.get('/api/Nightscout/Stop', { params: params });
};
// 获取统计
export const GetSummary = params => {
    return request.get('/api/Nightscout/GetSummary', { params: params });
};
// 获取插件
export const GetPlugins = params => {
    return request.get('/api/Nightscout/GetPlugins', { params: params });
};

//获取ns服务器
export const getNsServer = params => {
    return request.get('/api/Nightscout/getNsServer', { params: params });
};
export const getAllNsServer = params => {
    return request.get('/api/Nightscout/getAllNsServer', { params: params });
};
//获取CDN
export const GetCDNList = params => {
    return request.get('/api/Nightscout/GetCDNList', { params: params });
};

//删除ns服务器
export const delNsServer = params => {
    return request.delete('/api/Nightscout/delNsServer', { params: params });
};
//批量删除服务器
export const delBatchNsServer = params => {
    return request.post('/api/Nightscout/delBatchNsServer', params);
};
//更新ns服务器
export const updateNsServer = params => {
    return request.put('/api/Nightscout/updateNsServer', params);
};
//添加ns服务器
export const addNsServer = params => {
    return request.post('/api/Nightscout/addNsServer', params);
};


//获取ns广告
export const getNsBanner = params => {
    return request.get('/api/Nightscout/getNsBanner', { params: params });
};
//删除ns广告 
export const delNsBanner = params => {
    return request.delete('/api/Nightscout/delNsBanner', { params: params });
};
//删除ns广告 
export const delBatchNsBanner = params => {
    return request.post('/api/Nightscout/delBatchNsBanner', params);
};
//更新ns广告
export const updateNsBanner = params => {
    return request.put('/api/Nightscout/updateNsBanner', params);
};
//添加ns广告
export const addNsBanner = params => {
    return request.post('/api/Nightscout/addNsBanner', params);
};
//开启所有ns广告
export const enableAllBanner = params => {
    return request.post('/api/Nightscout/enableAllBanner', params);
};
//禁用所有ns广告
export const disableAllBanner = params => {
    return request.post('/api/Nightscout/disableAllBanner', params);
};

//切换解析
export const ChangeCDN = params => {
    return request.get('/api/Nightscout/ChangeCDN', { params: params });
};


//获取ns客户
export const getNsCustomer = params => {
    return request.get('/api/Nightscout/getNsCustomer', { params: params });
};
//删除ns客户 
export const delNsCustomer = params => {
    return request.delete('/api/Nightscout/delNsCustomer', { params: params });
};
//删除ns客户
export const delBatchNsCustomer = params => {
    return request.post('/api/Nightscout/delBatchNsCustomer', params);
};
//更新ns客户
export const updateNsCustomer = params => {
    return request.put('/api/Nightscout/updateNsCustomer', params);
};
//添加ns客户
export const addNsCustomer = params => {
    return request.post('/api/Nightscout/addNsCustomer', params);
};


//获取监护账号列表
export const getGuardAccountList = params => {
    return request.get('/api2/Guard/getGuardAccountList', { params: params });
};
//添加监护账号
export const addGuardAccount = params => {
    return request.post('/api2/Guard/addGuardAccount', params);
};
//编辑监护账号
export const editGuardAccount = params => {
    return request.post('/api2/Guard/editGuardAccount', params);
};
//删除监护账户 
export const delGuardAccount = params => {
    return request.delete('/api2/Guard/delGuardAccount', { params: params });
};

//获取监护用户
export const getGuardUserList = params => {
    return request.get('/api2/Guard/getGuardUserList', { params: params });
};
//添加监护用户
export const addGuardUser = params => {
    return request.post('/api2/Guard/addGuardUser', params);
};
//编辑监护用户
export const editGuardUser = params => {
    return request.post('/api2/Guard/editGuardUser', params);
};
//删除监护用户
export const delGuardUser = params => {
    return request.delete('/api2/Guard/delGuardUser', { params: params });
};



//获取所有nightscout用户
export const getAllNsUser = params => {
    return request.get('/api2/Guard/getAllNsUser', { params: params });
};
//获取所有监护账号
export const getAllNsGuardAccount = params => {
    return request.get('/api2/Guard/getAllNsGuardAccount', { params: params });
};
//获取所有监护用户
export const getAllNsGuardUser = params => {
    return request.get('/api2/Guard/getAllNsGuardUser', { params: params });
};

//刷新监护账户token
export const refreshGuardAccount = params => {
    return request.get('/api2/Guard/refreshGuardAccount', { params: params });
};
//获取监护账户类型
export const getGuardAccountType = params => {
    return request.get('/api2/Guard/getGuardAccountType', { params: params });
};
//发送三诺验证码
export const sendSannuoSms = params => {
    return request.get('/api2/Guard/sendSannuoSms', { params: params });
};
//验证三诺验证码
export const validSannuoSms = params => {
    return request.get('/api2/Guard/validSannuoSms', { params: params });
};
//用户监护用户实时血糖
export const getUserNowBloodList = params => {
    return request.get('/api2/Guard/getUserNowBloodList', { params: params });
};

//初始化ns api token
export const InitNsApiToken = params => {
    return request.get('/api/Nightscout/InitNsApiToken', { params: params });
};



