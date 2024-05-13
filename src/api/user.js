import request from '@/utils/request.js'

// 用户登录
export const userLogin = (params) => {
  return request.get('/api/Login/JWTToken3.0', { params: params })
}
// 2FA验证
export const Get2FAInfo = (params) => {
  return request.get('/api/Login/Get2FAInfo', { params: params })
}
// 验证码验证
export const GetCodeInfo = (params) => {
  return request.get('/api/Login/GetCodeInfo', { params: params })
}


// 获取验证码
export const getCode = (params) => {
  return request.get('/api/Login/getCode', { params: params })
}

// 获取用户信息
export const getInfoByToken = (params) => {
  return request.get('/api/user/getInfoByToken', { params: params })
}

// 获取用户菜单
export const GetNavigationBar = (params) => {
  return request.get('/api/permission/GetNavigationBar', { params: params })
}

// 获取服务器信息
export const GetServerInfo = (params) => {
  return request.get('/api/Monitor/Server', { params: params })
}



// 获取用户列表
export const getUserListPage = params => {
  return request.get('/api/user/get', { params: params });
};
// 删除用户
export const removeUser = params => {
  return request.delete('/api/user/delete', { params: params });
};
// 编辑用户
export const editUser = params => {
  return request.put('/api/user/put', params);
};
// 添加用户
export const addUser = params => {
  return request.post('/api/user/post', params);
};
// 批量删除用户
export const batchRemoveUser = params => {
  return request.post('/api/user/deletes', params);
};


// 重置密码(管理员)
export const ResetPass = params => {
  return request.put('/api/user/ResetPass', params);
};

// 重置我的密码(用户)
export const ResetMyPass = params => {
  return request.put('/api/user/ResetMyPass', params);
};
// 更新我的资料(用户)
export const PutMyInfo = params => {
  return request.put('/api/user/PutMyInfo', params);
};
// 更新我的资料(用户)
export const RefreshMyLogo = params => {
  return request.put('/api/user/RefreshMyLogo', params);
};



//双因子认证
export const GetMy2FA = (params) => {
  return request.get('/api/user/GetMy2FA', { params: params })
}
export const ValidMy2FA = (params) => {
  return request.get('/api/user/ValidMy2FA', { params: params })
}
export const CancelMy2FA = (params) => {
  return request.get('/api/user/CancelMy2FA', { params: params })
}
export const GetMyInfo = (params) => {
  return request.get('/api/user/GetMyInfo', { params: params })
}

