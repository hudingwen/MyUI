<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import {
    getAppleKey,
    delAppleKey,
    delBatchAppleKey,
    addAppleKey,
    updateAppleKey,
    CreateKey,
    CreateKey2,
    CreateKey3
} from '@/api/apple.js'

import {
    GetDic,
    GetDicData
} from '@/api/dic.js'

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
    GetDicList()
})

//获取字典
const activationCode = ref([])
const GetDicList = () => {
    GetDicData({ code: 'activation_code' }).then((res) => {
        activationCode.value = res.data.response
    })


}

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
            delAppleKey({ id: row.id }).then((res) => {
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
            delBatchAppleKey(ids).then((res) => {
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
                    updateAppleKey(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        ElMessage.success(res.data.msg || '编辑成功')
                    })
                } else {
                    //新增
                    addAppleKey(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        let txt = "";
                        res.data.response.forEach(t => {
                            txt += "<div>" + t.auth_code + "</div>"
                        });

                        ElNotification({
                            title: '添加成功',
                            dangerouslyUseHTMLString: true,
                            message: txt,
                            duration: 0,
                        })
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

    getAppleKey(filters.value).then(res => {
        tableData.value = res.data.response.data;
        tableTotal.value = res.data.response.dataCount;
    });
}

// 其他
onMounted(() => {

})

// 生成key
const dialogKey = ref(false)
const formDataKey = ref({
    id: '',
    key: '',
    needTime: false,
    times: 0,
    day: 0,
    hour: 0,
    min: 0,
    sec: 0
})
const refFormKey = ref()
const ruleFormKey = {
    id: [
        { required: true, message: 'id不能为空', trigger: 'change' },
    ],
    key: [
        { required: true, message: 'key不能为空', trigger: 'change' },
    ],
    pass_type: [
        { required: true, message: '卡密类型不能为空', trigger: 'change' },
    ]

}
const handleChangePassType = (val) => {
    if (val == 'auth001') {
        formDataKey.value.key = '670489857'
    } else if (val == 'auth002') {
        formDataKey.value.key = ''
    } else {

    }
}
const getPassTypeName = (passType) => {
    let findRow = activationCode.value.find(t => t.content == passType)
    if (findRow) {
        return findRow.name
    } else {
        return passType
    }
}
const handleCacTime = () => {
    formDataKey.value.times = formDataKey.value.day * 60 * 60 * 24 * 1000 + formDataKey.value.hour * 60 * 60 * 1000 + formDataKey.value.min * 60 * 1000 + formDataKey.value.sec * 1000
}
const HandleKey = () => {
    dialogKey.value = true
}

const SubmitKey = () => {


    refFormKey.value.validate((valid, fields) => {
        if (!valid && fields) {
            for (let key in fields)
                ElMessage.error(fields[key][0].message)
            return;
        }

        if (formDataKey.value.pass_type == 'auth001') {
            CreateKey(formDataKey.value).then(res => {
                ElNotification({
                    title: '生成成功',
                    message: res.data.response.auth_code,
                    duration: 0,
                })
                dialogKey.value = false
                HandleSearch()
            })
        } else if (formDataKey.value.pass_type == 'auth002') {
            CreateKey2(formDataKey.value).then(res => {
                ElNotification({
                    title: '生成成功',
                    message: res.data.response.auth_code,
                    duration: 0,
                })
                dialogKey.value = false
                HandleSearch()
            })
        } else if (formDataKey.value.pass_type == 'auth003') {
            CreateKey3(formDataKey.value).then(res => {
                ElNotification({
                    title: '生成成功',
                    message: res.data.response.auth_code,
                    duration: 0,
                })
                dialogKey.value = false
                HandleSearch()
            })
        } else {
            ElNotification({
                title: '生成失败',
                message: '还未实现',
                duration: 0,
            })
        }


    })




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
                <!-- <el-form-item label="状态" class="flexItem" label-width="90">
                    <el-select class="flexContent" clearable v-model="filters.status" placeholder="请选择要搜索的状态">
                        <el-option label="已激活" :value="1"></el-option>
                        <el-option label="未启用" :value="0"></el-option>
                    </el-select>
                </el-form-item> -->
                <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleSearch(1)">查询</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleKey">激活码生成</el-button>
                </el-form-item>
                <!-- <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleAdd">添加</el-button>
                </el-form-item> -->
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
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="auth_code" label="授权码" min-width="250"></el-table-column>
        <el-table-column prop="pass_type" label="授权码类型" width="150">
            <template #default="{ row }">
                <el-tag>{{ getPassTypeName(row.pass_type) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="record_id" label="id" width="150"></el-table-column>
        <el-table-column prop="record_key" label="key" width="150"></el-table-column>
        <el-table-column prop="create_date" label="生成时间" width="180"></el-table-column>
        <!-- <el-table-column prop="user_time" label="激活时间" width="180"></el-table-column> -->
        <el-table-column prop="expiry_date" label="到期时间" width="180"></el-table-column>
        <el-table-column prop="create_day" label="天" width="90"></el-table-column>
        <el-table-column prop="create_hour" label="时" width="90"></el-table-column>
        <el-table-column prop="create_min" label="分" width="90"></el-table-column>
        <el-table-column prop="create_sec" label="秒" width="90"></el-table-column>
        <!-- <el-table-column prop="uuid" label="设备码" width="360"></el-table-column> -->
        <!-- <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">已激活</el-tag>
                <el-tag v-if="row.status === 0">未启用</el-tag>
            </template>
</el-table-column> -->
        <!-- <el-table-column prop="comment" label="备注" width="130"></el-table-column> -->

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
        <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="120px" status-icon
            label-position="top">
            <el-form-item label="生成激活码数量" prop="auth_code">
                <el-input-number v-model="formData.createCount" :min="1" :max="100" />
            </el-form-item>
            <el-form-item label="激活码类型" prop="auth_code">
                <el-select v-model="formData.createType">
                    <el-option label="英文" :value="0" />
                    <el-option label="汉字" :value="1" />
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

    <!-- 生成key -->
    <el-dialog v-model="dialogKey" title="激活码生成" width="450px" :before-close="handleClose">
        <el-form @submit.prevent ref="refFormKey" :model="formDataKey" :rules="ruleFormKey" label-width="120px"
            status-icon label-position="top">

            <el-form-item label="卡密类型" prop="pass_type">
                <el-select @change="handleChangePassType" filterable style="width: 100%;" clearable
                    v-model="formDataKey.pass_type" placeholder="请选择卡密类型">
                    <el-option :key="item.content" v-for="item in activationCode" :label="item.name"
                        :value="item.content"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="id" prop="id" v-if="formDataKey.pass_type">
                <el-input v-model="formDataKey.id" />
            </el-form-item>

            <el-form-item v-if="formDataKey.pass_type == 'auth001'" label="key" prop="key">
                <el-input v-model="formDataKey.key" />
            </el-form-item>


            <el-form-item v-if="formDataKey.pass_type == 'auth001'" label="">
                <el-checkbox v-model="formDataKey.needTime" label="是否需要时间" />
                <el-row :gutter="10">
                    <el-col><el-input style="width: 100px;margin-bottom: 10px;" @change="handleCacTime"
                            v-model.number="formDataKey.day" placeholder="" />天</el-col>
                    <el-col><el-input style="width: 100px;margin-bottom: 10px;" @change="handleCacTime"
                            v-model.number="formDataKey.hour" placeholder="" />时</el-col>
                    <el-col><el-input style="width: 100px;margin-bottom: 10px;" @change="handleCacTime"
                            v-model.number="formDataKey.min" placeholder="" />分</el-col>
                    <el-col><el-input style="width: 100px;margin-bottom: 10px;" @change="handleCacTime"
                            v-model.number="formDataKey.sec" placeholder="" />秒</el-col>
                </el-row>
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogKey = false">取消</el-button>
                <el-button type="primary" @click="SubmitKey">
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