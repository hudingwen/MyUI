import request from '@/utils/request.js'

//Trojan-获取用户
export const getTrojanUser = params => {
  return request.get('/api/Trojan/GetUser', { params: params });
};
//Trojan-下拉
export const GetAllTrojanUser = params => {
  return request.get('/api/Trojan/GetAllTrojanUser', { params: params });
};
//Server-下拉
export const GetAllServers = params => {
  return request.get('/api/Trojan/GetAllServers', { params: params });
};
//Trojan-添加用户
export const addTrojanUser = params => {
  return request.post('/api/Trojan/AddUser', params);
};
//Trojan-更新用户
export const updateTrojanUser = params => {
  return request.put('/api/Trojan/UpdateUser', params);
};
//Trojan-删除用户
export const delTrojanUser = params => {
  return request.delete('/api/Trojan/DelUser', { params: params });
};
//Trojan-删除用户(批量)
export const delBatcTrojanUser = params => {
  return request.post('/api/Trojan/DelUsers', params);
};
//Trojan-重置流量
export const resetTrojanFlow = params => {
  return request.put('/api/Trojan/ResetFlow', params);
};
//Trojan-重置密码
export const resetTrojanPass = params => {
  return request.put('/api/Trojan/ResetPass', params);
};
//Trojan-获取Trojan服务器
export const getTrojanServer = params => {
  return request.get('/api/Trojan/GetServers', { params: params });
};
//Trojan-获取Trojan服务器-带拼接
export const getSpliceServer = params => {
  return request.get('/api/Trojan/GetSpliceServers', { params: params });
};
//Trojan-删除Trojan服务器
export const delTrojanServer = params => {
  return request.delete('/api/Trojan/DelServer', { params: params });
};
//Trojan-删除Trojan服务器
export const delBatchTrojanServer = params => {
  return request.post('/api/Trojan/DelServers', params);
};
//Trojan-更新Trojan服务器
export const updateTrojanServer = params => {
  return request.put('/api/Trojan/UpdateServers', params);
};
//Trojan-添加Trojan服务器
export const addTrojanServer = params => {
  return request.post('/api/Trojan/AddServers', params);
};


//Trojan-获取cus服务器
export const getTrojanCusServer = params => {
  return request.get('/api/Trojan/GetCusServers', { params: params });
};
//Trojan-删除cus服服务器
export const delTrojanCusServer = params => {
  return request.delete('/api/Trojan/DelCusServer', { params: params });
};
//Trojan-删除cus服服务器
export const delBatchTrojanCusServer = params => {
  return request.post('/api/Trojan/DelCusServers', params);
};
//Trojan-更新cus服服务器
export const updateTrojanCusServer = params => {
  return request.put('/api/Trojan/UpdateCusServers', params);
};
//Trojan-添加cus服服务器
export const addTrojanCusServer = params => {
  return request.post('/api/Trojan/AddCusServers', params);
};



//Trojan-获取url服务器
export const getTrojanUrlServer = params => {
  return request.get('/api/Trojan/GetUrlServers', { params: params });
};
//Trojan-删除url服服务器
export const delTrojanUrlServer = params => {
  return request.delete('/api/Trojan/DelUrlServer', { params: params });
};
//Trojan-删除url服服务器
export const delBatchTrojanUrlServer = params => {
  return request.post('/api/Trojan/DelUrlServers', params);
};
//Trojan-更新url服服务器
export const updateTrojanUrlServer = params => {
  return request.put('/api/Trojan/UpdateUrlServers', params);
};
//Trojan-添加url服服务器
export const addTrojanUrlServer = params => {
  return request.post('/api/Trojan/AddUrlServers', params);
};