<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getNsServer,
  delNsServer,
  delBatchNsServer,
  addNsServer,
  updateNsServer,
  getAllNsServer
} from '@/api/nightscout.js'


// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 10, key: '' })

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
  serverIp: [
    { required: true, message: '服务器地址不能为空', trigger: 'change' },
  ],
  serverPort: [
    { required: true, message: '服务器端口不能为空', trigger: 'change' },
  ]
}
//新增
const HandleAdd = () => {
  formData.value = { Enabled: true }
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
      delNsServer({ id: row.Id }).then((res) => {
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
      let ids = rows.map(t => t.Id)
      delBatchNsServer(ids).then((res) => {
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
        if (formData.value.Id) {
          //编辑
          updateNsServer(formData.value).then((res) => {
            HandleSearch()
            dialogVisible.value = false
            ElMessage.success(res.data.msg || '添加成功')
          })
        } else {
          //新增
          addNsServer(formData.value).then((res) => {
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

  getNsServer(filters.value).then(res => {
    tableData.value = res.data.response.data;
    tableTotal.value = res.data.response.dataCount;
  });
}

// 其他
onMounted(() => {
  HandleAllNsServer()
})
//服务器列表
const nsServer = ref([])
//获取所有服务器列表
const HandleAllNsServer = () => {
  getAllNsServer().then(res => {
    nsServer.value = res.data.response
  })
}
//获取ns的服务器名称
const getServerName = (serverId) => {
  let findRow = nsServer.value.find(t => t.Id === serverId)
  let tag = "";
  if (findRow) {
    tag += findRow.serverName
  } else {
    tag = serverId
  }
  return tag;
}
// 复制
const copy = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  let elInput = document.createElement('textarea')
  elInput.value = row.Id
  document.body.appendChild(elInput)
  // 选择对象
  elInput.select()
  // 执行浏览器复制命令
  document.execCommand("Copy")
  elInput.remove()
  ElMessage.success('复制成功')
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
        <el-form-item class="flexItem">
          <el-button type="primary" plain @click="copy(currentRow)">复制服务器ID</el-button>
        </el-form-item>
      </el-form>

    </el-col>
  </el-row>
  <!-- 内容 -->
  <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
    @row-click="HandleClickRow" border height="calc(100vh - 300px)">
    <el-table-column type="selection" width="50"></el-table-column>
    <el-table-column prop="serverName" label="服务器名称" width="250">
      <template #default="{ row }">
        <el-badge :value="'内存占用:'+row.memory +'%'" :offset="[10, 10]">
          {{ row.serverName }}
        </el-badge>

      </template>
    </el-table-column>
    <el-table-column prop="serverIp" label="服务器ip" width="150"></el-table-column>
    <el-table-column prop="serverHost" label="服务器host" width="150"></el-table-column>
    <el-table-column prop="serverLoginName" label="服务器账号" width="100"></el-table-column>
    <el-table-column prop="serverLoginPassword" label="服务器密码" width="150"></el-table-column>
    <el-table-column prop="serverPort" label="服务器端口" width="100"></el-table-column>
    <el-table-column prop="curInstanceIp" label="实例IP" width="130"></el-table-column>
    <el-table-column prop="curInstanceIpSerial" label="实例IP序列" width="110"></el-table-column>
    <el-table-column prop="instanceIpTemplate" label="实例ip模板" width="130"></el-table-column>
    <el-table-column prop="curExposedPort" label="当前端口" width="100"></el-table-column>
    <el-table-column prop="mongoIp" label="数据库地址" width="130"></el-table-column>
    <el-table-column prop="mongoLoginName" label="数据库账号" width="100"></el-table-column>
    <el-table-column prop="mongoLoginPassword" label="数据库密码" width="150"></el-table-column>
    <el-table-column prop="mongoPort" label="数据库端口" width="100"></el-table-column>
    <el-table-column prop="holdCount" label="理论实例数量" width="120"></el-table-column>
    <el-table-column prop="remark" label="备注" width="200"></el-table-column>
    <el-table-column prop="isMongo" label="是否Mongo" width="120">
      <template #default="{ row }">
        <el-tag :type="row.isMongo ? 'success' : 'primary'">{{ row.isMongo ? '是' : '否' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="isNginx" label="是否Nginx" width="120">
      <template #default="{ row }">
        <el-tag :type="row.isNginx ? 'success' : 'primary'">{{ row.isNginx ? '是' : '否' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="mongoServerId" label="关联ssh服务-数据库" width="250">
      <template #default="{ row }">{{ getServerName(row.mongoServerId) }}</template>
    </el-table-column>
    <el-table-column prop="nginxServerId" label="关联ssh服务-网关" width="250">
      <template #default="{ row }">{{ getServerName(row.nginxServerId) }}</template>
    </el-table-column>

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
  <el-dialog v-model="dialogVisible" :title="formData.Id ? '编辑' : '添加'" width="450px" :before-close="handleClose">
    <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="120px" status-icon
      label-position="top">

      <el-form-item label="服务器名称" prop="serverName">
        <el-input v-model="formData.serverName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器ip" prop="serverIp">
        <el-input v-model="formData.serverIp" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器host" prop="serverIp">
        <el-input v-model="formData.serverHost" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器登录账号" prop="serverLoginName">
        <el-input v-model="formData.serverLoginName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器登录密码" prop="serverLoginPassword">
        <el-input v-model="formData.serverLoginPassword" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务器端口" prop="serverPort">
        <el-input v-model="formData.serverPort" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="当前实例IP" prop="curInstanceIp">
        <el-input v-model="formData.curInstanceIp" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="当前实例IP序列" prop="curInstanceIpSerial">
        <el-input v-model="formData.curInstanceIpSerial" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="实例ip模板" prop="instanceIpTemplate">
        <el-input v-model="formData.instanceIpTemplate" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="当前暴露端口" prop="curExposedPort">
        <el-input v-model="formData.curExposedPort" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="数据库地址" prop="mongoIp">
        <el-input v-model="formData.mongoIp" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="数据库端口" prop="mongoPort">
        <el-input v-model="formData.mongoPort" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="数据库账号" prop="mongoLoginName">
        <el-input v-model="formData.mongoLoginName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="数据库密码" prop="mongoLoginPassword">
        <el-input v-model="formData.mongoLoginPassword" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="关联ssh服务-数据库" prop="mongoLoginPassword">
        <el-select class="flexContent" clearable v-model="formData.mongoServerId" placeholder="请选择服务器">
          <el-option v-for="item in nsServer" :key="item.Id"
            :label="item.serverName + '(' + item.countStop + '/' + item.countStart + '/' + item.count + '/' + item.holdCount + ')'"
            :value="item.Id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联ssh服务-网关" prop="mongoLoginPassword">
        <el-select class="flexContent" clearable v-model="formData.nginxServerId" placeholder="请选择服务器">
          <el-option v-for="item in nsServer" :key="item.Id"
            :label="item.serverName + '(' + item.countStop + '/' + item.countStart + '/' + item.count + '/' + item.holdCount + ')'"
            :value="item.Id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="理论实例数量" prop="holdCount">
        <el-input v-model="formData.holdCount" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="是否Mongo" prop="isMongo">
        <el-switch v-model="formData.isMongo" size="small" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="是否Nginx" prop="isNginx">
        <el-switch v-model="formData.isNginx" size="small" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="说明" prop="remark">
        <el-input v-model="formData.remark" auto-complete="off"></el-input>
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