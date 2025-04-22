<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import {
    GetAppleApiDicList,
    GetProfiles,
    AddProfileForDevice,
    DownloadProfile,
    DelProfile,
    GetDevices,
    GetDevicesProcessing
} from '@/api/apple.js'
import { Base64 } from 'js-base64'

// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref(null)
const selectRows = ref([])
const filters = ref({ page: 1, size: 10, key: '', kid: '' })

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
    GetAppleIds()
})

//获取账号列表
const appleIds = ref([])
const GetAppleIds = () => {
    GetAppleApiDicList().then(res => {
        appleIds.value = res.data.response
    })
}

// 设备列表
const dialogDeviceVisible = ref(false)
const devices = ref([])
const devicesTotal = ref(0)
const filtersDevices = ref({ page: 1, size: 10, kid: '' })

const SearchDevices = () => {
    filtersDevices.value.kid = filters.value.kid
    GetDevices(filtersDevices.value).then(res => {
        dialogDeviceVisible.value = true
        devices.value = res.data.response.data;
        devicesTotal.value = res.data.response.meta.paging.total;
    })
}
const handleDevices = () => {
    SearchDevices()
}
watch(() => filtersDevices.value.page, () => {
    SearchDevices()
})
watch(() => filtersDevices.value.size, () => {
    filtersDevices.value.page = 1
    SearchDevices()
})
const handleAppendDevice = (row) => {
    //追加设备
    HandleAdd(row.id, row.attributes.name)
}
//审核中的设备
const dialogProcessingDeviceVisible = ref(false)
const devicesProcessing = ref([])
const devicesProcessingTotal = ref(0)
const filtersProcessingDevices = ref({ page: 1, size: 10, kid: '' })

const SearchProcessingDevices = () => {
    filtersProcessingDevices.value.kid = filters.value.kid
    GetDevicesProcessing(filtersProcessingDevices.value).then(res => {
        dialogProcessingDeviceVisible.value = true
        devicesProcessing.value = res.data.response.data;
        devicesProcessingTotal.value = res.data.response.meta.paging.total;
    })
}
const handleProcessingDevices = () => {
    SearchProcessingDevices()
}
watch(() => filtersProcessingDevices.value.page, () => {
    SearchProcessingDevices()
})
watch(() => filtersProcessingDevices.value.size, () => {
    filtersProcessingDevices.value.page = 1
    SearchProcessingDevices()
})

//新增&编辑操作
const dialogVisible = ref(false)
const formData = ref({})
const refForm = ref()
const ruleForm = {
    kid: [
        { required: true, message: '苹果账号不能为空', trigger: 'change' },
    ],
    name: [
        { required: true, message: '设备名称不能为空', trigger: 'change' },
    ],
    profileName: [
        { required: true, message: '配置名称不能为空', trigger: 'change' },
    ],
    udid: [
        { required: true, message: '设备udid不能为空', trigger: 'change' },
    ]
}
//新增
const HandleAdd = (profileId, profileName) => {
    formData.value = { kid: filters.value.kid, profileId: profileId, profileName: profileName }
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
            DelProfile({ kid: filters.value.kid, id: row.id }).then(res => {
                HandleSearch()
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

                } else {
                    //新增
                    AddProfileForDevice(formData.value).then((res) => {
                        dialogVisible.value = false
                        HandleSearch()

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

    GetProfiles(filters.value).then(res => {
        tableData.value = res.data.response.data;
        tableTotal.value = res.data.response.meta.paging.total;
    });
}

// 其他
onMounted(() => {

})

//下载配置
const downFile = (row) => {
    console.info(row)
    DownloadProfile({ kid: filters.value.kid, id: row.id }).then(res => {

        console.info(res)
    })
}

</script>
<template>
    <!-- 搜索 -->
    <el-row>
        <el-col>
            <el-form @submit.prevent :inline="true" :model="filters" class="flexBox">
                <!-- <el-form-item label="关键词" class="flexItem" label-width="90">
                    <el-input class="flexContent" v-model.trim="filters.key" placeholder="请输入搜索关键词" clearable />
                </el-form-item> -->
                <el-form-item label="选择苹果账号" class="flexItem" label-width="100">
                    <el-select class="flexContent" clearable v-model="filters.kid" placeholder="请选择要搜索的账号">
                        <el-option v-for="item in appleIds" :label="item.name" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" :disabled="!filters.kid" plain @click="HandleSearch(1)">查询</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" :disabled="!filters.kid" plain @click="HandleAdd()">添加</el-button>
                </el-form-item>
                <!-- <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleEdit(currentRow)">修改</el-button>
                </el-form-item> -->
                <el-form-item class="flexItem">
                    <el-button type="danger" :disabled="!currentRow" plain @click="HandleDel(currentRow)">删除</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" :disabled="!filters.kid" plain @click="handleDevices">查看设备</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="warning" :disabled="!filters.kid" plain
                        @click="handleProcessingDevices">查看审核中的设备</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" :disabled="!currentRow" plain
                        @click="handleAppendDevice(currentRow)">追加设备</el-button>
                </el-form-item>
                <!-- <el-form-item class="flexItem">
                    <el-button type="danger" plain @click="HandleBatchDel(selectRows)">批量删除</el-button>
                </el-form-item> -->
            </el-form>

        </el-col>
    </el-row>
    <!-- 内容 -->
    <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
        @row-click="HandleClickRow" border height="calc(100vh - 300px)">
        <!-- <el-table-column type="selection" width="50"></el-table-column> -->
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="用户名称" width="430">
            <template #default="{ row }">
                {{ row.attributes.name }}
                <el-tag v-if="row.attributes.profileState === 'ACTIVE'" type="success">配置有效</el-tag>
                <el-tag v-else type="danger">配置无效</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="udid" label="设备udid" min-width="340" show-overflow-tooltip>
            <template #default="{ row }">
                <div>设备数量:{{ row.relationships.devices.data.length }}</div>
                <div v-for="item in row.relationships.devices.data">
                    {{ item.attributes.udid }}
                    <el-tag v-if="item.attributes.status === 'ENABLED'" type="success">设备有效</el-tag>
                    <el-tag v-else type="danger">设备无效</el-tag>
                    名称: {{ item.attributes.name }}
                    设备: {{ item.attributes.model }}
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="expirationDate" label="过期时间" width="250">
            <template #default="{ row }">
                {{ row.attributes.expirationDate }}
            </template>
        </el-table-column>
        <el-table-column prop="platform" label="设备类型" width="150">
            <template #default="{ row }">
                {{ row.attributes.platform }}
            </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
                <el-button type="primary" @click="downFile(row)">下载配置</el-button>
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
        <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="120px" status-icon
            label-position="top">
            <el-form-item label="苹果账号" prop="kid">
                <el-select :disabled="true" class="flexContent" clearable v-model="formData.kid" placeholder="请选择苹果账号">
                    <el-option v-for="item in appleIds" :label="item.name" :value="item.code"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="!formData.profileId" label="配置名称" prop="profileName">
                <el-input v-model="formData.profileName" />
            </el-form-item>
            <el-form-item label="设备名称" prop="name">
                <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="设备udid" prop="udid">
                <el-input v-model="formData.udid" />
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

    <!-- 设备列表 -->
    <el-dialog v-model="dialogDeviceVisible" title="设备列表" width="85%" :before-close="handleClose">

        <el-table :data="devices" highlight-current-row border>
            <!-- <el-table-column type="selection" width="50"></el-table-column> -->
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="用户名称" width="430">
                <template #default="{ row }">
                    {{ row.attributes.name }}
                </template>
            </el-table-column>
            <el-table-column prop="udid" label="设备udid" width="250">
                <template #default="{ row }">
                    {{ row.attributes.udid }}
                </template>
            </el-table-column>
            <el-table-column prop="platform" label="平台类型" width="250">
                <template #default="{ row }">
                    {{ row.attributes.platform }}
                </template>
            </el-table-column>
            <el-table-column prop="deviceClass" label="设备类型" width="250">
                <template #default="{ row }">
                    {{ row.attributes.deviceClass }} - {{ row.attributes.model }}

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
                    :total="devicesTotal" v-model:current-page="filtersDevices.page"
                    v-model:page-size="filtersDevices.size" />
            </el-col>
        </el-row>

        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="dialogDeviceVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 设备列表 -->
    <el-dialog v-model="dialogProcessingDeviceVisible" title="设备列表(审核中)" width="85%" :before-close="handleClose">

        <el-table :data="devicesProcessing" highlight-current-row border>
            <!-- <el-table-column type="selection" width="50"></el-table-column> -->
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="udid" label="设备udid" width="250">
                <template #default="{ row }">
                    {{ row.attributes.udid }}
                </template>
            </el-table-column>
            <el-table-column prop="processingTime" label="审核时间" width="150">
                <template #default="{ row }">
                    {{ row.attributes.processingTime }} 小时
                </template>
            </el-table-column>
            <el-table-column prop="name" label="用户名称" width="430">
                <template #default="{ row }">
                    {{ row.attributes.name }}
                </template>
            </el-table-column>
            <el-table-column prop="platform" label="平台类型" width="250">
                <template #default="{ row }">
                    {{ row.attributes.platform }}
                </template>
            </el-table-column>
            <el-table-column prop="deviceClass" label="设备类型" width="250">
                <template #default="{ row }">
                    {{ row.attributes.deviceClass }} - {{ row.attributes.model }}

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
                    :total="devicesProcessingTotal" v-model:current-page="filtersProcessingDevices.page"
                    v-model:page-size="filtersProcessingDevices.size" />
            </el-col>
        </el-row>

        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="dialogProcessingDeviceVisible = false">关闭</el-button>
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