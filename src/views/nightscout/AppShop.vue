<script setup>
import { onMounted, ref, watch } from 'vue'
import {
    getAppShop,
    delAppShop,
    addAppShop,
    updateAppShop,
} from '@/api/shop.js'
import {
    GetDicData
} from '@/api/dic.js'
import {
    upload
} from '@/api/customer.js'
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
            delAppShop({ id: row.Id }).then((res) => {
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
            delAppShop(ids).then((res) => {
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
                    updateAppShop(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        ElMessage.success(res.data.msg || '添加成功')
                    })
                } else {
                    //新增
                    addAppShop(formData.value).then((res) => {
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

    getAppShop(filters.value).then(res => {
        tableData.value = res.data.response.data;
        tableTotal.value = res.data.response.dataCount;
    });
}

// 其他
onMounted(() => {
    initData()
})
// 文件上传信息
const uploadInfo = ref([])
const initData = () => {
    GetDicData({ code: 'uploadInfo' }).then((res) => {
        uploadInfo.value = res.data.response
    })
}
// 图片选择
const handleChange = data => {
    option.value.img = URL.createObjectURL(data.raw)
}


const handleUploadAppIcon = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".jpg,.jpeg,.png,.gif";
    input.onchange = (event) => {

        let form = new FormData()
        form.append('file', event.target.files[0])

        var uploadUrl = uploadInfo.value.find(t => t.code == 'uploadUrl')
        var uploadName = uploadInfo.value.find(t => t.code == 'uploadName')
        var uploadPass = uploadInfo.value.find(t => t.code == 'uploadPass')

        var url = uploadUrl.content;

        // uploadName.content = "admin"
        // uploadPass.content = "admin"
        upload(url + "/api/Upload/up?uploadName=" + encodeURIComponent(uploadName.content) + "&uploadPass=" + encodeURIComponent(uploadPass.content), form).then((res) => {
            console.info("res", res)
            if (res.data.success) {
                formData.value.appIcon = res.data.response
            }
        })
    };
    input.click();
}

const handleUploadAppUrl = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".apk";
    input.onchange = (event) => {

        let form = new FormData()
        form.append('file', event.target.files[0])

        var uploadUrl = uploadInfo.value.find(t => t.code == 'uploadUrl')
        var uploadName = uploadInfo.value.find(t => t.code == 'uploadName')
        var uploadPass = uploadInfo.value.find(t => t.code == 'uploadPass')

        var url = uploadUrl.content;

        // uploadName.content = "admin"
        // uploadPass.content = "admin"
        upload(url + "/api/Upload/up?uploadName=" + encodeURIComponent(uploadName.content) + "&uploadPass=" + encodeURIComponent(uploadPass.content), form).then((res) => {
            console.info("res", res)
            if (res.data.success) {
                formData.value.appUrl = res.data.response
            }
        })
    };
    input.click();
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
        <el-table-column prop="appName" label="app名称" width="250"></el-table-column>
        <el-table-column prop="appDescription" label="app描述" width="250"></el-table-column>
        <el-table-column prop="appVersion" label="app版本" width="150"></el-table-column>
        <el-table-column prop="appPackage" label="app包路径" width="250"></el-table-column>
        <el-table-column prop="appSort" label="app排序" width="250"></el-table-column>
        <el-table-column prop="appIcon" label="app图标地址" width="250">
            <template #default="{ row }">
                <el-image style="width: 40px; height: 40px;margin-top: 5px;border: 1px solid silver;" :src="row.appIcon"
                    :preview-src-list="[row.appIcon]">
                    <template #error>
                        <div class="image-slot">
                            还未上传
                        </div>
                    </template>
                </el-image>
                {{ row.appIcon }}
            </template>
        </el-table-column>

        <el-table-column prop="appUrl" label="app下载地址" width="250"></el-table-column>




        <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip></el-table-column>

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

            <el-form-item label="app名称" prop="appName">
                <el-input v-model="formData.appName" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="app描述" prop="appDescription">
                <el-input type="textarea" v-model="formData.appDescription" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="app版本" prop="appVersion">
                <el-input type="textarea" v-model="formData.appVersion" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="app包路径" prop="appPackage">
                <el-input type="textarea" v-model="formData.appPackage" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="app排序" prop="appSort">
                <el-input-number v-model="formData.appSort" :min="0" :step="10"  auto-complete="off"/> 
            </el-form-item>
            <el-form-item label="app图标地址" prop="logo">
                <el-input v-model="formData.appIcon" auto-complete="off"></el-input>
                <el-row :gutter="5">
                    <el-col :span="1.5" class="flexBox">
                        <el-button size="small" class="flexItem" type="primary"
                            @click="handleUploadAppIcon">上传头像</el-button>
                    </el-col>
                </el-row>
                <el-image style="width: 200px; height: 200px;margin-top: 5px;border: 1px solid silver;"
                    :src="formData.appIcon" :preview-src-list="[formData.appIcon]">
                    <template #error>
                        <div class="image-slot">
                            还未上传
                        </div>
                    </template>
                </el-image>
            </el-form-item>
            <el-form-item label="app下载地址" prop="logo">
                <el-input v-model="formData.appUrl" auto-complete="off"></el-input>
                <el-row :gutter="5">
                    <el-col :span="1.5" class="flexBox">
                        <el-button size="small" class="flexItem" type="primary"
                            @click="handleUploadAppUrl">上传app</el-button>
                    </el-col>
                </el-row>
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