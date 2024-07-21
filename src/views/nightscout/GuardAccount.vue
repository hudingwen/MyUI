<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import {
    getGuardAccountList,
    addGuardAccount,
    editGuardAccount,
    delGuardAccount,
    refreshGuardAccount,
    getGuardAccountType,
    sendSannuoSms,
    validSannuoSms
} from '@/api/nightscout.js'


// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 10, key: '' })
const guardList = ref([])
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
    GetGuardTypeList()
    HandleSearch()
})


//新增&编辑操作
const dialogVisible = ref(false)
const formData = ref({})
const refForm = ref()
const ruleForm = {
    name: [
        { required: true, message: '名称不能为空', trigger: 'change' },
    ],
    loginName: [
        { required: true, message: '登录账号不能为空', trigger: 'change' },
    ],
    loginPass: [
        { required: true, message: '登录密码不能为空', trigger: 'change' },
    ],
    guardType: [
        { required: true, message: '账号类型不能为空', trigger: 'change' },
    ]
}
//查看用户列表
const HandleShowUsers =(row)=>{
    if (!row) {
        ElMessage.error('请选择要操作的数据!')
        return;
    }

}
//新增
const HandleAdd = () => {
    formData.value = { Enabled: true, createCount: 1, createType: 0 }
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
            delGuardAccount({ id: row.Id }).then((res) => {
                HandleSearch()
                ElMessage.success('删除成功')
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
//刷新token
const HandleRefresh = (row) => {
    if (!row) {
        ElMessage.error('请选择要操作的数据!')
        return;
    }
    ElMessageBox.confirm('确定刷新么?')
        .then(() => {
            refreshGuardAccount({ id: row.Id }).then((res) => {
                HandleSearch()
                ElMessage.success('刷新成功')
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
const GetGuardTypeList= ()=>{
    getGuardAccountType().then(res=>{
        guardList.value = res.data.response
    })
}
const SendSannuoSms = ()=>{
    sendSannuoSms({phone:formData.value.loginName}).then(res=>{
        ElMessage.success('发送成功')
    })
}
const ValidSannuoSms = ()=>{
    validSannuoSms({phone:formData.value.loginName,code:formData.value.phoneCode}).then(res=>{
        formData.value.tokenExpire = res.data.response.tokenExpire
        formData.value.token = res.data.response.access_token
        ElMessage.success('验证成功,请提交保存账号!')
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
            delGuardAccount(ids).then((res) => {
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
                    editGuardAccount(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        ElMessage.success(res.data.msg || '添加成功')
                    })
                } else {
                    //新增
                    addGuardAccount(formData.value).then((res) => {
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

    getGuardAccountList(filters.value).then(res => {
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
                    <el-button type="primary" plain @click="HandleRefresh(currentRow)">刷新toekn</el-button>
                </el-form-item>
                <!-- <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleShowUsers">查看用户</el-button>
                </el-form-item> -->
                <!-- <el-form-item class="flexItem">
                    <el-button type="danger" plain @click="HandleBatchDel(selectRows)">批量删除</el-button>
                </el-form-item> -->
            </el-form>

        </el-col>
    </el-row>
    <!-- 内容 -->
    <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
        @row-click="HandleClickRow" border height="calc(100vh - 300px)">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="名称" width="250"></el-table-column> 
        <el-table-column prop="loginName" label="登录账号" width="180"></el-table-column>
        <el-table-column prop="loginPass" label="登录密码" width="180"></el-table-column>
        <el-table-column prop="guardType" label="账号类型" width="120">
            <template #default="{ row }">
                <el-tag type="primary" v-for="item in guardList" v-show="row.guardType === item.code">{{ item.name }}</el-tag> 
            </template>
        </el-table-column>
        <el-table-column prop="guardType" label="账号状态" width="120">
            <template #default="{ row }">
                <el-tag type="success" v-if="row.isEffect">有效</el-tag>
                <el-tag type="danger" v-else>失效</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="token" label="token" width="350" show-overflow-tooltip></el-table-column>
        <el-table-column prop="tokenExpire" label="token过期时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="130"></el-table-column>

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
            <el-form-item label="名称" prop="name">
                <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="登录账号/手机号" prop="loginName">
                <el-input v-model="formData.loginName" />
            </el-form-item>
            <el-form-item label="登录密码(不需要密码的可随便填写)" prop="loginPass">
                <el-input v-model="formData.loginPass" />
            </el-form-item>
            <el-form-item label="账号类型" prop="guardType">  
                <el-select v-model="formData.guardType">
                    <el-option :label="item.name" v-for="item in guardList" :value="item.code"  /> 
                </el-select>
            </el-form-item>
            <el-form-item label="三诺验证码(第一次或失效时用)" prop="phoneCode" v-show="formData.guardType === '200'">
                <el-input v-model="formData.phoneCode"  style="margin-bottom: 5px;"/>   
                <el-button type="primary" plain @click="SendSannuoSms()">发送</el-button> 
                <el-button type="primary" plain @click="ValidSannuoSms()">验证</el-button>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" />
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