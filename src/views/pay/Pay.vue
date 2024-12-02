<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  GetOrderList
} from '@/api/pay.js'

import { ElMessageBox, ElMessage } from 'element-plus'
// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 10, key: '', payStatus: 2 })

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
  content: [
    { required: true, message: '内容不能为空', trigger: 'change' },
  ],
  Enabled: [
    { required: true, message: '状态不能为空', trigger: 'change' },
  ]
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

  GetOrderList(filters.value).then(res => {
    tableData.value = res.data.response.data;
    tableTotal.value = res.data.response.dataCount;
  });
}

// 其他
onMounted(() => {

})


</script>
<template>
  <!-- 搜索 -->
  <el-row>
    <el-col>
      <el-form @submit.prevent :inline="true" :model="filters" class="flexBox">
        <el-form-item label="关键词" class="flexItem" label-width="90">
          <el-input class="flexContent" v-model.trim="filters.key" placeholder="请输入搜索关键词" clearable />
        </el-form-item>

        <el-form-item label="支付状态" class="flexItem" label-width="90">
          <el-select class="flexContent" clearable v-model="filters.payStatus" placeholder="请选择支付状态">
            <el-option label="待支付" :value="1"></el-option>
            <el-option label="已支付" :value="2"></el-option>
            <el-option label="失败" :value="3"></el-option>
          </el-select>
        </el-form-item>


        <el-form-item class="flexItem">
          <el-button type="primary" plain @click="HandleSearch(1)">查询</el-button>
        </el-form-item>
      </el-form>

    </el-col>
  </el-row>
  <!-- 内容 -->
  <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
    @row-click="HandleClickRow" border height="calc(100vh - 300px)">
    <el-table-column type="selection" width="50"></el-table-column>
    <el-table-column type="index" width="60"></el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>

    <el-table-column prop="payStatus" label="状态" width="100">
      <template #default="{ row }">
        <el-tag v-if="row.payStatus == 1 || row.payStatus == 0" type="info"> 待支付 </el-tag>
        <el-tag v-if="row.payStatus == 2" type="success"> 已支付 </el-tag>
        <el-tag v-if="row.payStatus == 3" type="success"> 失败 </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="payTime" label="支付时间" width="180"></el-table-column>
    <el-table-column prop="cost" label="费用" width="150">
      <template #default="{ row }">
        {{ row.cost / 100 }} 元 - {{ row.years }} 年
      </template>
    </el-table-column>

    <el-table-column prop="payType" label="支付渠道" width="150">
      <template #default="{ row }">
        <el-tag v-if="row.payType === 1" type="primary"> 微信 </el-tag>
        <el-tag v-if="row.payType === 2" type="primary"> 支付宝 </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="payType" label="支付方式" width="150">
      <template #default="{ row }">
        <el-tag v-if="row.tradeType === 1" type="primary"> 刷卡支付 - 1</el-tag>
        <el-tag v-if="row.tradeType === 2" type="primary"> 扫码支付 - 2</el-tag>
        <el-tag v-if="row.tradeType === 3" type="primary"> 公众号支付 - 3</el-tag>
        <el-tag v-if="row.tradeType === 4" type="primary"> App 支付 - 4</el-tag>
        <el-tag v-if="row.tradeType === 5" type="primary"> 5 </el-tag>
        <el-tag v-if="row.tradeType === 6" type="primary"> 手机网站支付 - 6</el-tag>
        <el-tag v-if="row.tradeType === 7" type="primary"> 7 </el-tag>
        <el-tag v-if="row.tradeType === 8" type="primary"> 合码付 - 8</el-tag>
        <el-tag v-if="row.tradeType === 9" type="primary"> 小程序支付 - 9</el-tag>
      </template>
    </el-table-column>



    <el-table-column prop="orderDescription" label="订单描述" min-width="350"></el-table-column>


    <el-table-column prop="id" label="用户单号" width="300"></el-table-column>

    <el-table-column prop="tradeNo" label="平台单号" width="280"></el-table-column>

    <el-table-column prop="transactionId" label="支付平台单号" width="280"></el-table-column>

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

      <el-form-item label="标题/备注" prop="title">
        <el-input v-model="formData.title" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="formData.content" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="Enabled">
        <el-switch v-model="formData.Enabled" active-text="启用" inactive-text="禁用">
        </el-switch>
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