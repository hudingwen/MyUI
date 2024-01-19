<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  getTrojanUser,
  addTrojanUser,
  updateTrojanUser,
  delTrojanUser,
  delBatcTrojanUser,
  resetTrojanFlow,
  resetTrojanPass,
  getSpliceServer
} from '@/api/trojan.js'
import { ArrowDown } from '@element-plus/icons-vue'

import { ElMessageBox, ElMessage } from 'element-plus'
// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 20, key: '', isuse: true })

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
  username: [
    { required: true, message: '用户名不能为空', trigger: 'change' },
  ],
  quota: [
    { required: true, message: '流量不能为空', trigger: 'change' },
  ]
}
//新增
const HandleAdd = () => {
  optionsValue.value = "GB";
  formData.value = { Pid: 0, CodeRelationship: '0', Status: true }
  dialogVisible.value = true
}
//编辑
const HandleEdit = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }

  formData.value = JSON.parse(JSON.stringify(row))
  ChangeSize(formData.value)
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
      delTrojanUser({ id: row.id }).then((res) => {
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
      delBatcTrojanUser(ids).then((res) => {
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
    let midData = JSON.parse(JSON.stringify(formData.value))
    console.info("midData", midData)
    if (midData.quota <= 0) {

    } else if (optionsValue.value == "GB") {
      midData.quota = midData.quota * 1024 * 1024 * 1024;
    } else if (optionsValue.value == "MB") {
      midData.quota = midData.quota * 1024 * 1024;
    } else if (optionsValue.value == "KB") {
      midData.quota = midData.quota * 1024;
    }
    ElMessageBox.confirm('确定提交么?')
      .then(() => {
        if (midData.id) {
          //编辑
          updateTrojanUser(midData).then((res) => {
            HandleSearch()
            dialogVisible.value = false
            ElMessage.success(res.data.msg || '添加成功')
          })
        } else {
          //新增
          addTrojanUser(midData).then((res) => {
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

  getTrojanUser(filters.value).then(res => {
    tableData.value = res.data.response.data;
    tableTotal.value = res.data.response.dataCount;


  });
}
// 其他
const GetFlow = (quota) => {
  if (quota / 1024 / 1024 / 1024 >= 1) {
    return (quota / 1024 / 1024 / 1024).toFixed(3) + "GB";
  }
  if (quota / 1024 / 1024 >= 1) {
    return (quota / 1024 / 1024).toFixed(3) + "MB";
  }
  return (quota / 1024).toFixed(3) + "KB";
}
const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }
    const values = data.map(item => Number(item[column.property]));
    if ((column.property === 'upload'
      || column.property === 'download' || column.property === 'up'
      || column.property === 'down' || column.property === 'total')) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!isNaN(value)) {
          return prev + curr;
        } else {
          return prev;
        }
      }, 0);
      sums[index] = GetFlow(sums[index]);
    } else {
      sums[index] = '';
    }
  });
  return sums;
}
const options = [{ txt: "KB" }, { txt: "MB" }, { txt: "GB" }]
const optionsValue = ref('GB')

const ChangeSize = (row) => {
  if (row.quota / 1024 / 1024 / 1024 >= 1) {
    row.quota = row.quota / 1024 / 1024 / 1024;
    optionsValue.value = "GB";
  } else if (row.quota / 1024 / 1024 >= 1) {
    row.quota = row.quota / 1024 / 1024;
    optionsValue.value = "MB";
  } else if (row.quota / 1024 >= 1) {
    row.quota = row.quota / 1024;
    optionsValue.value = "KB";
  } else {
    row.quota = row.quota;
  }
}

const HandleResetFlow = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  ElMessageBox.confirm('确定要重置流量么?')
    .then(() => {
      let users = [row.id]
      resetTrojanFlow(users).then(res => {
        HandleSearch()
      });
    })
    .catch((err) => {
      console.info(err)
    })

}
const HandleResetPass = (row) => {
  if (!row) {
    ElMessage.error('请选择要操作的数据!')
    return;
  }
  ElMessageBox.confirm('确定要重置密码么?')
    .then(() => {
      let users = [row.id]
      resetTrojanPass(users).then(res => {
        HandleSearch()
      });
    })
    .catch((err) => {
      console.info(err)
    })
}
const visibleBook = ref(false)
const linkData = ref({})
const HandleLink = (row) => {
  linkData.value = {}
  getSpliceServer({ id: row.id }).then(res => {
    linkData.value.normalApi = res.data.response.normalApi + row.passwordshow;
    linkData.value.clashApi = res.data.response.clashApi + linkData.value.normalApi;
    linkData.value.clashApiBackup = res.data.response.clashApiBackup + linkData.value.normalApi;
    linkData.value.servers = res.data.response.list;
    visibleBook.value = true
  });
}

</script>
<template>
  <!-- 搜索 -->
  <el-row>
    <el-col>
      <el-form :inline="true" :model="filters" class="flexBox">
        <el-form-item label="关键词" class="flexItem" label-width="90">
          <el-input class="flexContent" v-model="filters.key" placeholder="请输入搜索关键词" clearable />
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
          <el-checkbox v-model="filters.isuse">流量使用</el-checkbox>
        </el-form-item>
      </el-form>

    </el-col>
  </el-row>
  <!-- 内容 -->
  <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
    @row-click="HandleClickRow" border :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
    <el-table-column type="selection" width="50"></el-table-column>

    <el-table-column prop="username" label="用户名" width="200"></el-table-column>
    <el-table-column prop="quota" label="流量" min-width="150">
      <template #default="{ row }">
        <el-tag>{{ row.quota < 0 ? "无限流量" : GetFlow(row.quota) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="total" label="本月累计" min-width="150">
      <template #default="{ row }">
        <el-tag>{{ GetFlow(row.download + row.upload) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="upload" label="本月上传" min-width="150">
      <template #default="{ row }">
        <el-tag>{{ GetFlow(row.upload) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="download" label="本月下载" min-width="150">
      <template #default="{ row }">
        <el-tag>{{ GetFlow(row.download) }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="历史统计" min-width="100">
      <template #default="{ row }">
        <el-popover trigger="hover" placement="left" width="350px">
          <el-row>
            <el-col>用户名: <el-link type="primary"> {{ row.username }} </el-link></el-col>

          </el-row>
          <el-row>
            <el-col>起止时间:<el-link type="success">{{ (row.useList.length > 0 ?
              row.useList[row.useList.length - 1].moth : '')
            }}-</el-link><el-link type="success">{{ (row.useList.length > 1 ? row.useList[0].moth :
  '') }}</el-link></el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-table height="360" :data="row.useList" show-summary :summary-method="getSummaries">
                <el-table-column prop="moth" label="月度" width="80">
                </el-table-column>
                <el-table-column prop="up" label="上传" width="120">
                  <template #default="{ row }">
                    <el-tag>{{ GetFlow(row.up) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="down" label="下载" width="120">
                  <template #default="{ row }">
                    <el-tag>{{ GetFlow(row.down) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="total" label="累计" width="120">
                  <template #default="{ row }">
                    <el-tag>{{ GetFlow(row.total) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <template #reference>
            <el-tag size="small">查看</el-tag>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column prop="CreateTime" label="创建时间" width="180">
    </el-table-column>
    <el-table-column prop="ModifyTime" label="更新时间" width="180">
    </el-table-column>
    <el-table-column prop="passwordshow" label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <el-link type="primary">操作<el-icon class="el-icon--right"><arrow-down /></el-icon></el-link>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="HandleResetFlow(row)">重置流量</el-dropdown-item>
              <el-dropdown-item @click="HandleResetPass(row)">重置密码</el-dropdown-item>
              <el-dropdown-item @click="HandleLink(row)">获取链接</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
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
  <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑' : '添加'" width="450px" :before-close="handleClose">
    <el-form ref="refForm" :model="formData" :rules="ruleForm" label-width="80px" status-icon label-position="top">

      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="流量" prop="quota">
        <el-tooltip class="item" effect="dark" content="-1为无限流量" placement="top-start">
          <el-input-number v-model="formData.quota" :min="-1" :max="99999" auto-complete="off"></el-input-number>

        </el-tooltip>
      </el-form-item>
      <el-form-item label="单位">
        <el-select v-model="optionsValue" placeholder="请选择">
          <el-option v-for="item in options" :key="item.txt" :label="item.txt" :value="item.txt"></el-option>
        </el-select>
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
  <!-- 弹窗-订阅信息 -->
  <el-dialog v-model="visibleBook" title="订阅信息" width="550px" :before-close="handleClose">
    <el-form label-position="top">
      <el-form-item label="Clash订阅选择">
        <p>主用</p>
        <el-link type="success">{{ linkData.clashApi }}</el-link>
        <p>备用</p>
        <el-link type="primary">{{ linkData.clashApiBackup }}</el-link>
      </el-form-item>
      <el-form-item label="普通订阅选择">
        <el-link type="success">{{ linkData.normalApi }}</el-link>
      </el-form-item>
      <el-form-item label="单节点选择">
        <el-form-item>
          <el-select v-model="linkData.selectServerId" placeholder="请选择要链接的服务器" filterable clearable>
            <el-option v-for="item in linkData.servers ? linkData.servers : []" :key="item.name" :label="item.name"
              :value="item.value">
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form-item>
      <el-form-item label="单个链接" v-if="linkData.selectServerId">
        <el-link type="success">{{ linkData.selectServerId }}</el-link>
      </el-form-item>

    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visibleBook = false">关闭</el-button>
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