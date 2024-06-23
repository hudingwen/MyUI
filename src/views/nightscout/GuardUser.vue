<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import {
    getGuardUserList,
    addGuardUser,
    editGuardUser,
    delGuardUser,
    getAllNsUser,
    getAllNsGuardAccount,
    getAllNsGuardUser
} from '@/api/nightscout.js'
import {
    Search
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format.js'
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

//监护
// ns用户
const dialogVisibleNsUser = ref(false)
const nsUserFilter = ref({ page: 1, size: 10, total: 0 })
const nsUserData = ref([])
const handleAllNsUser = (isSearch) => {
    if (isSearch) nsUserFilter.value.page = 1
    getAllNsUser(nsUserFilter.value).then((res) => {
        dialogVisibleNsUser.value = true
        nsUserData.value = res.data.response.data;
        nsUserFilter.value.total = res.data.response.dataCount;
    })
}
const submitNsUser = (row) => {
    formData.value.nid = row.id
    formData.value.nidName = row.name
    formData.value.nidUrl = row.url
    dialogVisibleNsUser.value = false
}
watch(() => nsUserFilter.value.page, () => {
    handleAllNsUser()
})
watch(() => nsUserFilter.value.size, () => {
    nsUserFilter.value.page = 1
    handleAllNsUser()
})

// 监护账户
const dialogVisibleNsGuardAccount = ref(false)
const nsGuardAccountFilter = ref({ page: 1, size: 10, total: 0 })
const nsGuardAccountData = ref([])
const handleAllNsGuardAccount = (isSearch) => {
    if (isSearch) nsGuardAccountFilter.value.page = 1
    getAllNsGuardAccount().then((res) => {
        dialogVisibleNsGuardAccount.value = true
        nsGuardAccountData.value = res.data.response.data;
        nsGuardAccountFilter.value.total = res.data.response.dataCount;
    })
}
const submitNsGuardAccount = (row) => {
    formData.value.gid = row.id
    formData.value.gidName = row.name

    formData.value.uid = ''
    formData.value.uidName = ''
    dialogVisibleNsGuardAccount.value = false
}
watch(() => nsGuardAccountFilter.value.page, () => {
    handleAllNsGuardAccount()
})
watch(() => nsGuardAccountFilter.value.size, () => {
    nsGuardAccountFilter.value.page = 1
    handleAllNsGuardAccount()
})
// 监护用户
const dialogVisibleNsGuardUser = ref(false)
const nsGuardUserFilter = ref({ page: 1, size: 10, total: 0 })
const nsGuardUserData = ref([])
const handleAllNsGuardUser = (isSearch) => {
    if (isSearch) nsGuardUserFilter.value.page = 1
    getAllNsGuardUser({ gid: formData.value.gid, page: nsGuardUserFilter.value.page, size: nsGuardUserFilter.value.size }).then((res) => {
        dialogVisibleNsGuardUser.value = true
        nsGuardUserData.value = res.data.response.data;
        nsGuardUserFilter.value.total = res.data.response.dataCount;
    })
}

const submitNsGuardUser = (row) => {
    formData.value.uid = row.id
    formData.value.uidName = row.name
    dialogVisibleNsGuardUser.value = false
}

watch(() => nsGuardUserFilter.value.page, () => {
    handleAllNsGuardUser()
})
watch(() => nsGuardUserFilter.value.size, () => {
    nsGuardUserFilter.value.page = 1
    handleAllNsGuardUser()
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
    name: [
        { required: true, message: '名称不能为空', trigger: 'change' },
    ],
    nid: [
        { required: true, message: '绑定的ns不能为空', trigger: 'change' },
    ],
    gid: [
        { required: true, message: '绑定的监护账号不能为空', trigger: 'change' },
    ],
    uid: [
        { required: true, message: '绑定的监护用户不能为空', trigger: 'change' },
    ],
    startTime: [
        { required: true, message: '开始时间不能为空', trigger: 'change' },
    ],
    endTime: [
        { required: true, message: '结束时间不能为空', trigger: 'change' },
    ]
}
//查看用户列表
const HandleShowUsers = (row) => {
    if (!row) {
        ElMessage.error('请选择要操作的数据!')
        return;
    }

}
//新增
const HandleAdd = () => {
    let startTime = formatDate(new Date());
    let endTime = formatDate(new Date(), 365);
    formData.value = { Enabled: true, startTime: startTime, endTime: endTime }
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
            delGuardUser({ id: row.Id }).then((res) => {
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
            delGuardUser(ids).then((res) => {
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
                    editGuardUser(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        ElMessage.success(res.data.msg || '添加成功')
                    })
                } else {
                    //新增
                    addGuardUser(formData.value).then((res) => {
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

    getGuardUserList(filters.value).then(res => {
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
        @row-click="HandleClickRow" border>
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="名称" width="250"></el-table-column>
        <el-table-column prop="nidName" label="绑定的ns" width="280">
            <template #default="{ row }">
                {{ row.nidName }} ({{ row.nidUrl }})
            </template>
        </el-table-column>
        <el-table-column prop="gidName" label="绑定的监护账号" width="180"></el-table-column>
        <el-table-column prop="uidName" label="绑定的监护用户" width="280"></el-table-column>
        <el-table-column prop="refreshTime" label="最近一次血糖时间" width="180"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
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
            <el-form-item label="绑定的ns" prop="nid">
                <el-input v-model="formData.nid" :disabled="true">
                    <template #append>
                        <el-button :icon="Search" @click="handleAllNsUser()" :disabled="formData.Id ? true : false" />
                    </template>
                </el-input>
                <el-text type="primary">{{ formData.nidName }}({{ formData.nidUrl }})</el-text>
            </el-form-item>
            <el-form-item label="绑定的监护账号" prop="gid">
                <el-input v-model="formData.gid" :disabled="true">
                    <template #append>
                        <el-button :icon="Search" @click="handleAllNsGuardAccount()" />
                    </template>
                </el-input>
                <el-text type="primary">{{ formData.gidName }}</el-text>
            </el-form-item>
            <el-form-item label="绑定的监护用户" prop="uid">
                <el-input v-model="formData.uid" :disabled="true">
                    <template #append>
                        <el-button :icon="Search" @click="handleAllNsGuardUser()" :disabled="formData.gid ? false : true" />
                    </template>
                </el-input>
                <el-text type="primary">{{ formData.uidName }}</el-text>
            </el-form-item>
            <el-form-item label="开始时间" prop="startTime">
                <el-date-picker type="date" placeholder="选择日期" v-model="formData.startTime" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
                <el-date-picker type="date" placeholder="选择日期" v-model="formData.endTime" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"></el-date-picker>
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


    <!-- 弹窗-ns用户 -->
    <el-dialog v-model="dialogVisibleNsUser" title="请选择ns用户" width="450px" :before-close="handleClose">
        <!-- 内容 -->
        <el-row :gutter="10" style="margin-bottom: 10px;">
            <el-col :span="18">
                <el-input class="flexContent" v-model.trim="nsUserFilter.key" placeholder="请输入搜索关键词" clearable />
            </el-col>
            <el-col :span="6">
                <el-button type="primary" plain @click="handleAllNsUser(true)">查询</el-button>
            </el-col>
        </el-row>

        <el-table :data="nsUserData" highlight-current-row border>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="名称" min-width="250">
                <template #default="{ row }">
                    {{ row.name }} ({{ row.url }})
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
                <template #default="{ row }">
                    <el-button type="primary" plain @click="submitNsUser(row)">选择</el-button>
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
                    :total="nsUserFilter.total" v-model:current-page="nsUserFilter.page"
                    v-model:page-size="nsUserFilter.size" />
            </el-col>
        </el-row>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisibleNsUser = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 弹窗-监护账户 -->
    <el-dialog v-model="dialogVisibleNsGuardAccount" title="请选择监护账户" width="450px" :before-close="handleClose">


        <!-- 内容 -->
        <el-table :data="nsGuardAccountData" highlight-current-row border>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="名称" width="250"></el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
                <template #default="{ row }">
                    <el-button type="primary" plain @click="submitNsGuardAccount(row)">选择</el-button>
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
                    :total="nsGuardAccountFilter.total" v-model:current-page="nsGuardAccountFilter.page"
                    v-model:page-size="nsGuardAccountFilter.size" />
            </el-col>
        </el-row>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisibleNsGuardAccount = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 弹窗-监护用户 -->
    <el-dialog v-model="dialogVisibleNsGuardUser" title="请选择监护用户" width="450px" :before-close="handleClose">


        <!-- 内容 -->
        <el-table :data="nsGuardUserData" highlight-current-row border>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="名称" width="250"></el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
                <template #default="{ row }">
                    <el-button type="primary" plain @click="submitNsGuardUser(row)">选择</el-button>
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
                    :total="nsGuardUserFilter.total" v-model:current-page="nsGuardUserFilter.page"
                    v-model:page-size="nsGuardUserFilter.size" />
            </el-col>
        </el-row>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisibleNsGuardUser = false">取消</el-button>
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