<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  getTrojanServer,
  delTrojanServer,
  delBatchTrojanServer,
  addTrojanServer,
  updateTrojanServer,
  GetAllTrojanUser
} from '@/api/trojan.js'
import { ElMessageBox, ElMessage } from 'element-plus'

// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 9999, key: '' })

const HandleSelectChange = (selection) => {
  selectRows.value = selection
}
const HandleClickRow = (val) => {
  currentRow.value = val
}
const HandleClearTable = () => {
  //当前表格数据
  // tableData.value = []
  //统计总数(不要手动重置 否则会出现翻页问题 找了好半天)
  // tableTotal.value = 0
  //当前选中行
  currentRow.value = null
  //当前选择多行
  selectRows.value = []
}
// 翻页
watch(() => filters.value.page, () => {
  HandleSearch()
})
watch(() => filters.value.size, () => {
  filters.value.page = 1
  HandleSearch()
})



//加载数据
onMounted(() => {
  HandleSearch()
})


//新增&编辑操作
const dialogVisible = ref(false)
const formData = ref({})
const refForm = ref()
const ruleForm = {
  servername: [
    { required: true, message: '服务器名称不能为空', trigger: 'change' },
  ],
  serveraddress: [
    { required: true, message: '服务器地址不能为空', trigger: 'change' },
  ],
  serverport: [
    { required: true, message: '服务器端口不能为空', trigger: 'change' },
  ]
}
//新增
const HandleAdd = () => {
  formData.value = { Enabled: true, excludeUsers: [], bindUsers: [] }
  dialogVisible.value = true
}
//编辑
const HandleEdit = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  formData.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}
//删除
const HandleDel = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  ElMessageBox.confirm('确定删除么?')
    .then(() => {
      delTrojanServer({ id: row.id }).then((res) => {
        HandleSearch()
        ElMessage.success('删除成功')
      })
    })
    .catch((err) => {
      console.info(err)
    })



}
//批量删除
const HandleBatchDel = (rows) => {
  if (!rows || rows.length == 0) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  ElMessageBox.confirm('确定删除么?')
    .then(() => {
      let ids = rows.map(t => t.id)
      delBatchTrojanServer(ids).then((res) => {
        HandleSearch()
        ElMessage.success('删除成功')
      })
    })
    .catch((err) => {
      console.info(err)
    })

}
//提交
const HandleSubmit = () => {
  refForm.value.validate((valid, fields) => {
    if (!valid && fields) {
      for (let key in fields)
        ElMessage.error(fields[key][0].message)
      return;
    }
    ElMessageBox.confirm('确定提交么?')
      .then(() => {
        if (formData.value.id) {
          //编辑
          updateTrojanServer(formData.value).then((res) => {
            HandleSearch()
            dialogVisible.value = false
            ElMessage.success(res.data.msg || '添加成功')
          })
        } else {
          //新增
          addTrojanServer(formData.value).then((res) => {
            HandleSearch()
            dialogVisible.value = false
            ElMessage.success(res.data.msg || '编辑成功')
          })
        }
      })
      .catch((err) => {
        console.info(err)
      })

  })

}
//窗口关闭
const handleClose = (done) => {
  ElMessageBox.confirm('确定关闭么?')
    .then(() => {
      done()
    })
    .catch((err) => {
      console.info(err)
    })
}
//搜索
const HandleSearch = (page) => {

  if (page) filters.value.page = page

  HandleClearTable()

  getTrojanServer(filters.value).then(res => {
    tableData.value = res.data.response;
    tableTotal.value = res.data.response.length;
  });
}

// 其他
onMounted(() => {
  GetSelectUsers()
})
const trojanUsers = ref([])
const GetSelectUsers = () => {
  GetAllTrojanUser().then(res => {
    // res.data.response.unshift({
    //   id: 0,
    //   username: '所有用户'
    // });
    trojanUsers.value = res.data.response;
  });
}
//获取用户名称
const getUserName = (uid) => {
  let user = trojanUsers.value.find(t => t.id == uid)
  if (user) {
    return user.username
  }
  return uid;
}

</script>
<template>
  <!-- 搜索 -->
  <el-row>
    <el-col>
      <el-form @submit.prevent :inline="true" :model="filters" class="flexBox">
        <el-form-item label="关键词" class="flexItem" label-width="90">
          <el-input class="flexContent" v-model.trim="filters.key" placeholder="请输入搜索关键词" clearable />
        </el-form-item>
        <el-form-item class="flexItem">
          <el-button type="primary" plain @click="HandleSearch(1)">查询</el-button>
        </el-form-item>
        <el-form-item class="flexItem">
          <el-button type="primary" plain @click="HandleAdd">添加</el-button>
        </el-form-item>
        <el-form-item class="flexItem">
          <el-button type="primary" plain @click="HandleEdit(currentRow)">修改</el-button>
        </el-form-item>
        <el-form-item class="flexItem">
          <el-button type="danger" plain @click="HandleDel(currentRow)">删除</el-button>
        </el-form-item>
        <el-form-item class="flexItem">
          <el-button type="danger" plain @click="HandleBatchDel(selectRows)">批量删除</el-button>
        </el-form-item>
      </el-form>

    </el-col>
  </el-row>
  <!-- 内容 -->
  <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
    @row-click="HandleClickRow" border height="calc(100vh - 300px)">
    <el-table-column type="selection" width="50"></el-table-column>
    <el-table-column prop="servername" label="服务器名称" width="250"></el-table-column>
    <el-table-column prop="serveraddress" label="服务器地址" width="250"></el-table-column>
    <el-table-column prop="serverport" label="服务器端口" width="120"></el-table-column>
    <el-table-column prop="serverpeer" label="服务器peer(SNI)" width="250"></el-table-column>
    <el-table-column prop="servertype" label="服务器类型" width="120">
      <template #default="{ row }">
        <el-tag v-if="row.servertype == '0'">普通HTTP</el-tag>
        <el-tag v-if="row.servertype == '1'">WebSocket</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="serverpath" label="服务器路径" width="120"></el-table-column>
    <el-table-column prop="serverenable" label="是否启用" width="120">
      <template #default="{ row }">
        <el-tag v-if="row.serverenable" type="success">启用</el-tag>
        <el-tag v-else type="danger">禁用</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="isAllUser" label="是否面向所有用户" width="150">
      <template #default="{ row }">
        <el-tag v-if="row.isAllUser" type="success">是</el-tag>
        <el-tag v-else type="danger">否</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="bindUsers" label="绑定用户" width="250">
      <template #default="{ row }">
        <el-row :gutter="2">
          <el-col :span="1.5" v-for="uid in row.bindUsers"><el-tag>{{ getUserName(uid) }}</el-tag> </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column prop="excludeUsers" label="排除用户" width="250">
      <template #default="{ row }">
        <el-row :gutter="2">
          <el-col :span="1.5" v-for="uid in row.excludeUsers"><el-tag>{{ getUserName(uid) }}</el-tag> </el-col>
        </el-row>
      </template>
    </el-table-column>

    <el-table-column prop="serverremark" label="备注" min-width="100"></el-table-column>

    <el-table-column prop="CreateTime" label="创建时间" width="180">
    </el-table-column>
    <el-table-column prop="ModifyTime" label="更新时间" width="180">
    </el-table-column>
    <template #empty>
      <el-empty description="没有数据"></el-empty>
    </template>
  </el-table>
  <!-- 分页 -->
  <el-row>
    <el-col class="flexBox">
      <el-pagination class="flexItem" small background layout="total, prev, pager, next, sizes, jumper"
        :total="tableTotal" v-model:current-page="filters.page" v-model:page-size="filters.size" />
    </el-col>
  </el-row>
  <!-- 弹窗 -->
  <el-dialog :draggable="true" v-model="dialogVisible" :title="formData.id ? '编辑' : '添加'" width="450px" :before-close="handleClose">
    <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="120px" status-icon
      label-position="top">

      <el-form-item label="服务器名称" prop="servername">
        <el-input v-model="formData.servername" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器地址" prop="serveraddress">
        <el-input v-model="formData.serveraddress" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器端口" prop="serverport">
        <el-input v-model="formData.serverport" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器peer(SNI)" prop="serverpeer">
        <el-input v-model="formData.serverpeer" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器类型" prop="servertype">
        <el-select v-model="formData.servertype" placeholder="请选择服务器类型">
          <el-option key="0" label="普通HTTP" value="0">
          </el-option>
          <el-option key="1" label="WebSocket" value="1">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.servertype === '1'" label="服务器路径" prop="serverpath">
        <el-input v-model="formData.serverpath" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="是否启用" prop="serverenable">
        <el-switch v-model="formData.serverenable" auto-complete="off"></el-switch>
      </el-form-item>
      <el-form-item label="是否面向所有用户" prop="isAllUser">
        <el-switch v-model="formData.isAllUser" auto-complete="off"></el-switch>
      </el-form-item>
      <el-form-item label="绑定用户" prop="bindUsers" v-if="!formData.isAllUser">
        <el-select filterable multiple v-model="formData.bindUsers" placeholder="请选择绑定用户">
          <el-option v-for="item in trojanUsers" :key="item.id" :label="item.username" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排除用户" prop="excludeUsers" v-if="formData.isAllUser">
        <el-select filterable multiple v-model="formData.excludeUsers" placeholder="请选择排除用户">
          <el-option v-for="item in trojanUsers" :key="item.id" :label="item.username" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="说明" prop="serverremark">
        <el-input v-model="formData.serverremark" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="HandleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.flexBox {
  display: flex;
  flex-wrap: wrap;

  .flexItem {
    color: #fff;
    font-size: 25px;
    margin-top: 8px;
    margin-right: 5px;
    cursor: pointer;
    flex-wrap: wrap;
  }

  .flexContent {
    width: 200px;
  }
}
</style>