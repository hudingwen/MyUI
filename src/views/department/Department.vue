<script setup>
import { onMounted, ref, watch } from 'vue'
import { getDepartmentList, removeDepartment, editDepartment, addDepartment, getDepartmentTree, getTreeTable } from '@/api/dep.js'

import { ElMessageBox, ElMessage } from 'element-plus'
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
const GetDepartmentTreeTable = () => {
  HandleClearTable()
  getTreeTable(filters.value).then(res => {
    tableData.value = res.data.response 
  })
}
const GetDepartmentTreeTableForSelect = () => { 
  getDepartmentTree().then((res) => {
    menuTrees.value = [res.data.response];
  });
}
onMounted(() => {
  HandleSearch()

  
})

const menuTrees = ref([])
//新增&编辑操作
const dialogVisible = ref(false)
const formData = ref({})
const refForm = ref()
const ruleForm = {
  Name: [
    { required: true, message: '部门名称不能为空', trigger: 'change' },
  ]
}
//新增
const HandleAdd = () => {
  formData.value = { Pid: '0', CodeRelationship: '0', Enabled: true, OrderSort: 0 }
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
      removeDepartment({ id: row.Id }).then((res) => {
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
          editDepartment(formData.value).then((res) => {
            HandleSearch()
            dialogVisible.value = false
            ElMessage.success(res.data.msg || '添加成功')
          })
        } else {
          //新增
          addDepartment(formData.value).then((res) => {
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

  GetDepartmentTreeTable()
  GetDepartmentTreeTableForSelect()
}

</script>
<template>
  <!-- 搜索 -->
  <el-row>
    <el-col>
      <el-form @submit.prevent :inline="true" :model="filters" class="flexBox">
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
        <!-- <el-form-item class="flexItem">
          <el-button type="danger" plain @click="HandleBatchDel(selectRows)">批量删除</el-button>
        </el-form-item> -->
      </el-form>

    </el-col>
  </el-row>
  <!-- 内容 -->  
  <el-table :default-expand-all="true" ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
    @row-click="HandleClickRow" border row-key="Id" height="calc(100vh - 250px)">
    <el-table-column type="selection" width="50"></el-table-column>
    <el-table-column prop="Name" label="部门名称" min-width="250"></el-table-column>
    <el-table-column prop="Leader" label="负责人" min-width="120"></el-table-column>
    <el-table-column prop="PidName" label="父级部门" min-width="250"></el-table-column>
    <el-table-column prop="OrderSort" label="排序" min-width="60"></el-table-column>
    <el-table-column prop="Enabled" label="是否有效" min-width="90" align="center">
      <template #default="{ row }">
        <el-tag :type="row.Enabled ? 'success' : 'danger'" disable-transitions>{{ !row.Enabled ? "否" : "是"
        }}</el-tag>
      </template>
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
  <!-- <el-row>
    <el-col class="flexBox">
      <el-pagination class="flexItem" small background layout="total, prev, pager, next, sizes, jumper"
        :total="tableTotal" v-model:current-page="filters.page" v-model:page-size="filters.size" />
    </el-col>
  </el-row> -->
  <!-- 弹窗 -->
  <el-dialog v-model="dialogVisible" :title="formData.Id ? '编辑' : '添加'" width="450px" :before-close="handleClose">
    <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="80px" status-icon
      label-position="top">

      <el-form-item label="部门名称" prop="Name">
        <el-input v-model="formData.Name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="父级部门" prop="Name">
        <el-tree-select :default-expand-all="true" v-model="formData.Pid" :data="menuTrees" filterable clearable :check-strictly="true" /> 
      </el-form-item>
      <el-form-item label="负责人" prop="Leader">
        <el-input v-model="formData.Leader" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="OrderSort">
        <el-input-number v-model="formData.OrderSort"></el-input-number>
      </el-form-item>
      <el-form-item label="是否有效" prop="Enabled" width sortable>
        <el-switch v-model="formData.Enabled"></el-switch>
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