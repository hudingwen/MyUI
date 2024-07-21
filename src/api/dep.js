import request from '@/utils/request.js'
 
// 部门列表
export const getDepartmentList = params => {
  return request.get('/api/department/get', { params: params });
};
// 删除
export const removeDepartment = params => {
  return request.delete('/api/department/delete', { params: params });
}; 
// 编辑
export const editDepartment = params => {
  return request.put('/api/department/put', params);
};
// 添加
export const addDepartment = params => {
  return request.post('/api/department/post', params);
};

// 部门树
export const getDepartmentTree = params => {
  return request.get('/api/department/getDepartmentTree', { params: params });
};
// 部门树
export const getTreeTable = params => {
  return request.get('/api/department/GetTreeTable', { params: params });
};


