<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
    getNightscout,
    delNightscout,
    addNightscout,
    updateNightscout,
    RefreshNightscout,
    GetWeChatCode,
    GetWeChatMiniCode,
    GetWeChatMiniCodeFix,
    UnbindWeChat,
    UnbindWeChatMini,
    GetLog,
    Reset,
    Stop,
    GetSummary,
    GetPlugins,
    getAllNsServer,
    GetCDNList,
    ChangeCDN,
    getNsCustomer,
    InitNsApiToken
} from '@/api/nightscout.js'
import {
    GetDic,
    GetDicData
} from '@/api/dic.js'
import { formatDate } from '@/utils/format.js'
import {
    ArrowDown,
    Plus,
    MuteNotification,
    Refresh,
    CircleCloseFilled,
    BrushFilled,
    List,
    DeleteFilled,
    CopyDocument
} from '@element-plus/icons-vue'

import QrcodeVue from 'qrcode.vue'

import { pcaTextArr } from 'element-china-area-data'

// 表格初始化
const tableData = ref([])
const tableTotal = ref(0)
const refTable = ref()
const currentRow = ref({})
const selectRows = ref([])
const filters = ref({ page: 1, size: 10, key: '', isShowExpire: false, isShowSoonExpire: false })

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
//到期
watch(() => filters.value.isShowExpire, (newValue, oldValue) => {
    if (newValue) {
        filters.value.isShowSoonExpire = false
    }
})
//即将到期
watch(() => filters.value.isShowSoonExpire, (newValue, oldValue) => {
    if (newValue) {
        filters.value.isShowExpire = false
    }
})


//加载数据
onMounted(() => {
    HandleSearch()
})


//新增&编辑操作
const dialogVisible = ref(false)
const formData = ref(
    { cdn: '', position_arr: [], plugins_arr: [], Enabled: true, money: 0, startTime: '', endTime: '', isRefresh: false, isConnection: true, isKeepPush: false, status: '', resource: '' }
)
const refForm = ref()
const ruleForm = {
    // name: [
    //     { required: true, message: "名称不能为空", trigger: "change" }
    // ],
    // url: [
    //     { required: true, message: "访问地址不能为空", trigger: "change" }
    // ],
    startTime: [
        { required: true, message: "开始日期不能为空", trigger: "change" }
    ],
    endTime: [
        { required: true, message: "结束日期不能为空", trigger: "change" }
    ],
    // passwd: [
    //     { required: true, message: "密码不能为空", trigger: "change" }
    // ],
    status: [
        { required: true, message: "状态不能为空", trigger: "change" }
    ],
    plugins_arr: [
        { required: true, message: "至少要选择一个组件", trigger: "change" }
    ],
    serverId: [
        { required: true, message: "部署服务器不能为空", trigger: "change" }
    ],
    cdn: [
        { required: true, message: "服务网络不能为空", trigger: "change" }
    ],
    position_arr: [
        { required: true, message: "请填写用户所在区域", trigger: "change" },
    ]




}
//新增
const HandleAdd = () => {
    let startTime = formatDate(new Date());
    let endTime = formatDate(new Date(), 365);
    formData.value = { isNeedPassword: false, customerId: "0", nsMemory: defaultNsMemory.value, nsVersion: defaultNsVersion.value, cdn: defaultCDN.value, position_arr: ['北京市'], plugins_arr: JSON.parse(JSON.stringify(plugins.value.map(t => t.key))), Enabled: true, money: 150, startTime: startTime, endTime: endTime, isRefresh: false, isConnection: true, isKeepPush: false, status: '未启用', resource: '介绍' }
    dialogVisible.value = true
}
//编辑
const HandleEdit = (row) => {
    if (!row) {
        ElMessage.error('请选择要操作的数据!')
        return;
    }
    formData.value = JSON.parse(JSON.stringify(row))
    // 位置转换
    if (formData.value.position) {
        formData.value.position_arr = JSON.parse(formData.value.position)
    } else {
        formData.value.position_arr = []
    }
    // 插件转换
    if (formData.value.plugins) {
        formData.value.plugins_arr = JSON.parse(formData.value.plugins)
    } else {
        formData.value.plugins_arr = []
    }
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
            delNightscout({ id: row.Id }).then((res) => {
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

                formData.value.plugins = JSON.stringify(formData.value.plugins_arr)
                formData.value.position = JSON.stringify(formData.value.position_arr)

                if (formData.value.Id) {
                    //编辑
                    updateNightscout(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        HandleAllNsServer()
                        ElMessage.success(res.data.msg || '添加成功')
                    })
                } else {
                    //新增
                    addNightscout(formData.value).then((res) => {
                        HandleSearch()
                        dialogVisible.value = false
                        HandleAllNsServer()
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

    getNightscout(filters.value).then(res => {
        tableData.value = res.data.response.data;
        tableTotal.value = res.data.response.dataCount;
    });
}

// 其他
onMounted(() => {
    HandleAllNsServer()
    HandlePlugins()
    HandleCDNList()
    handleSummary()
    GetDicList()
    GetNsList()
})

const GetDicList = () => {
    GetDic({ code: 'defaultCDN' }).then((res) => {
        defaultCDN.value = res.data.response.content
    })
    GetDic({ code: 'defaultNsVersion' }).then((res) => {
        defaultNsVersion.value = res.data.response.content
    })
    GetDic({ code: 'defaultNsMemory' }).then((res) => {
        defaultNsMemory.value = res.data.response.content
    })
    GetDicData({ code: 'NsVersionList' }).then((res) => {
        nsVersion.value = res.data.response
    })


}
//服务器列表
const nsServer = ref([])
//cdn列表
const cdnList = ref([])
//默认cdn
const defaultCDN = ref('')
//Nightscout默认版本
const defaultNsVersion = ref('')
//Nightscout默认内存/单位/M
const defaultNsMemory = ref('')
//Nightscout可用版本列表
const nsVersion = ref([])
//插件列表
const plugins = ref([])
//汇总统计
const summary = ref({
    status: [],
    resource: [],
    customer: []
})
// 公众号绑定显示
const showBind = ref(false)
const bindUrl = ref('')
// 小程序绑定显示
const showMini = ref(false)
const miniUrl = ref('')
// 小程序绑定修复显示
const showMiniFix = ref(false)
const miniUrlFix = ref('')
// 操作日志
const logForm = ref({ page: 1, size: 10, total: 0 })
const showLog = ref(false)
const tableLog = ref([])
//获取所有服务器列表
const HandleAllNsServer = () => {
    getAllNsServer().then(res => {
        nsServer.value = res.data.response
    })
}
//获取插件列表
const HandlePlugins = () => {
    GetPlugins().then(res => {
        plugins.value = res.data.response
    })
}
//获取cdn列表
const HandleCDNList = () => {
    GetCDNList().then(res => {
        cdnList.value = res.data.response.CDNList
        defaultCDN.value = res.data.response.defaultCDN
    })
}
//获取ns的服务器名称
const getServerName = (row) => {
    let findRow = nsServer.value.find(t => t.Id === row.serverId)
    let tag = row.serverId;
    if (findRow) {
        tag = findRow.serverName
        if (row.exposedPort > 0) {
            tag += "(" + row.exposedPort + ")";
        }
    }
    return tag;
}
//获取ns的所属客户名称
const getCustomerName = (row) => {
    let findRow = customerList.value.find(t => t.Id === row.customerId)
    let tag = "";
    if (findRow) {
        tag = findRow.name
    }
    return tag;
}
//获取ns的cdn名称
const getCDNName = (row) => {
    let findRow = cdnList.value.find(t => t.key === row.cdn)
    let tag = row.cdn;
    if (findRow) {
        tag = findRow.name
    }
    return tag;
}
//状态筛选
const HandleTag = (key) => {
    filters.value.key = key;
    filters.value.customerId = null;
    filters.value.serverId = null;
    filters.value.cdn = null
    HandleSearch(1);
}
// 筛选所属客户
const HandleCustomer = (customerId) => {
    filters.value.key = null;
    filters.value.customerId = customerId;
    filters.value.serverId = null;
    filters.value.cdn = null
    HandleSearch(1);
}
// 获取公众号绑定二维码
const handleBind = (row) => {
    GetWeChatCode({ id: row.Id }).then(res => {
        showBind.value = true
        bindUrl.value = res.data.response.usersData.url
    })
}
// 小程序绑定二维码
const handleBindMini = (row) => {
    GetWeChatMiniCode({ nsid: row.Id }).then(res => {
        showMini.value = true
        miniUrl.value = res.data.response
    })
}
// 小程序绑定二维码修复
const handleFixMini = (row) => {
    GetWeChatMiniCodeFix({ nsid: row.Id }).then(res => {
        showMiniFix.value = true
        miniUrlFix.value = res.data.response
    })

}
// 取消公众号绑定
const handleUnbind = (row) => {
    ElMessageBox.confirm("确定解除[" + row.name + "]的公众号绑定吗？")
        .then(() => {
            UnbindWeChat({ id: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '解除成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
// 取消小程序绑定
const handleUnbindMini = (row) => {
    ElMessageBox.confirm("确定解除[" + row.name + "]的小程序绑定吗？")
        .then(() => {
            UnbindWeChatMini({ nsid: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '解除成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}

// 添加api token
const handleToken = (row, tokenForceRefresh, title) => {
    ElMessageBox.confirm("确定为[" + row.name + "]" + title + "吗？")
        .then(() => {
            InitNsApiToken({ id: row.Id, tokenForceRefresh: tokenForceRefresh }).then(res => {
                ElMessage.success(res.data.msg || '成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}


// 重启实例
const handleRefresh = (row) => {
    ElMessageBox.confirm("确认重启刷新[" + row.name + "]的NS服务？")
        .then(() => {
            RefreshNightscout({ id: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '刷新成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
// 停止实例
const handleStop = (row) => {
    ElMessageBox.confirm("确认停止[" + row.name + "]的NS服务？")
        .then(() => {
            Stop({ id: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '停止成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
// 重置数据
const handleReset = (row) => {
    ElMessageBox.confirm("确定重置[" + row.name + "]的数据吗？")
        .then(() => {
            Reset({ id: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '重置成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
// 操作日志
const handleLog = (row, page) => {
    if (row) currentRow.value = row
    if (page) logForm.value.page = page
    GetLog({
        id: currentRow.value.Id
        , size: logForm.value.size
        , page: logForm.value.page
    }).then(res => {
        showLog.value = true
        tableLog.value = res.data.response.data
        logForm.value.total = res.data.response.dataCount
    })
}
// 日志翻页
watch(() => logForm.value.page, () => {
    handleLog()
})
watch(() => logForm.value.size, () => {
    logForm.value.page = 1
    handleLog()
})
// 删除
const handleDel = (row) => {
    ElMessageBox.confirm("确认删除[" + row.name + "]的NS服务吗？")
        .then(() => {
            delNightscout({ id: row.Id }).then(res => {
                ElMessage.success(res.data.msg || '删除成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })
}
// 复制
const copy = (data) => {
    let elInput = document.createElement('textarea')
    elInput.value = data
    document.body.appendChild(elInput)
    // 选择对象
    elInput.select()
    // 执行浏览器复制命令
    document.execCommand("Copy")
    elInput.remove()
    ElMessage.success('复制成功')
}
// 获取统计
const handleSummary = () => {
    summary.value.status = []
    summary.value.resource = []
    summary.value.customer = []
    GetSummary().then(res => {
        summary.value = res.data.response
    })
}
// 切换整体网络
const handleCDN = () => {
    if (!filters.value.cdn) {
        ElMessage.error('请选择要切换的CDN服务网络!')
        return;
    }
    var findRow = cdnList.value.find(t => t.key == filters.value.cdn)

    ElMessageBox.confirm("确定把所有默认的CDN网络切换至[" + findRow.name + "]吗?")
        .then(() => {
            ChangeCDN({ cdnCode: filters.value.cdn }).then(res => {
                ElMessage.success(res.data.msg || '切换成功')
                HandleSearch();
            })
        })
        .catch((err) => {
            console.info(err)
        })

}

// ns客户列表
const customerList = ref([])
const GetNsList = () => {
    getNsCustomer({ size: 9999 }).then(res => {
        customerList.value = res.data.response.data;
    });
}

</script>
<template>
    <!-- 搜索 -->
    <el-row>
        <el-col>
            <el-form @submit.prevent :inline="true" :model="filters" class="flexBox">
                <el-form-item label="关键词" class="flexItem" label-width="90">
                    <el-input @keyup.enter="HandleSearch(1)" class="flexContent" v-model.trim="filters.key"
                        placeholder="请输入搜索关键词" clearable />
                </el-form-item>
                <el-form-item label="服务器" class="flexItem" label-width="90">
                    <el-select class="flexContent" clearable v-model="filters.serverId" placeholder="请选择要搜索的服务器">
                        <el-option v-for="item in nsServer" :key="item.Id"
                            :label="item.serverName + '(' + item.countStop + '/' + item.countStart + '/' + item.count + '/' + item.holdCount + ')'"
                            :value="item.Id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="服务网络" class="flexItem" label-width="90">
                    <el-select class="flexContent" clearable v-model="filters.cdn" placeholder="请选择要搜索的服务网络类型">
                        <el-option v-for="item in cdnList" :key="item.cdn" :label="item.name" :value="item.key">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属客户" class="flexItem" label-width="90">
                    <el-select class="flexContent" clearable v-model="filters.customerId" placeholder="请选择要搜索的所属客户">
                        <el-option v-for="item in customerList" :key="item.cdn" :label="item.name" :value="item.Id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="运行状态" class="flexItem" label-width="90">
                    <el-select class="flexContent" clearable v-model="filters.isStop" placeholder="请选择要搜索的运行状态">
                        <el-option label="运行" :value="false"></el-option>
                        <el-option label="停止" :value="true"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="" class="flexItem" label-width="120">
                    <el-checkbox v-model="filters.isShowExpire" label="查看到期用户" size="small" />
                </el-form-item>
                <el-form-item label="" class="flexItem" label-width="120">
                    <el-checkbox v-model="filters.isShowSoonExpire" label="查看即将到期用户" size="small" />
                </el-form-item>

                <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleSearch(1)">查询</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleAdd">添加</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="danger" plain @click="handleCDN">切换整体网络</el-button>
                </el-form-item>
                <!-- <el-form-item class="flexItem">
                    <el-button type="primary" plain @click="HandleEdit(currentRow)">修改</el-button>
                </el-form-item>
                <el-form-item class="flexItem">
                    <el-button type="danger" plain @click="HandleDel(currentRow)">删除</el-button>
                </el-form-item> -->
                <el-form-item label="状态" class="flexItem" label-width="90">

                    <el-row :gutter="30">
                        <el-col :span="1.5" :key="item.name" v-for="(item, index) in summary.status">
                            <el-badge :max="999999999" :value="item.count">
                                <el-tag @click="HandleTag(item.name)"
                                    style="cursor:pointer;width: 60px;text-align: center;">{{
                (item.name ? item.name : '未确认') }}</el-tag>
                            </el-badge>
                        </el-col>
                    </el-row>

                </el-form-item>

                <el-form-item label="来源" class="flexItem" label-width="90">
                    <el-row :gutter="30">
                        <el-col :span="1.5" :key="item.name" v-for="(item, index) in summary.resource">
                            <el-badge :max="999999999" :value="item.count">
                                <el-tag @click="HandleTag(item.name)"
                                    style="cursor:pointer;width: 60px;text-align: center;" type="info">{{ (item.name ?
                item.name : '未确认')
                                    }}</el-tag>
                            </el-badge>
                        </el-col>
                    </el-row>

                </el-form-item>

                <el-form-item label="客户" class="flexItem" label-width="90">
                    <el-row :gutter="30">

                        <el-col :span="1.5" :key="item.customerId" v-for="(item, index) in summary.customer">
                            <el-badge :max="999999999" :value="item.count">
                                <el-tag @click="HandleCustomer(item.customerId)"
                                    style="cursor:pointer;width: auto;text-align: center;" type="info">{{
                (getCustomerName({ customerId: item.customerId }))
            }}</el-tag>
                            </el-badge>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>

        </el-col>
    </el-row>
    <!-- 内容 -->
    <el-table ref="refTable" :data="tableData" highlight-current-row @selection-change="HandleSelectChange"
        @row-click="HandleClickRow" border height="calc(100vh - 350px)">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column show-overflow-tooltip prop="name" label="名称" width="180"></el-table-column>
        <el-table-column show-overflow-tooltip prop="url" label="访问地址" width="250">
            <template #default="{ row }">
                {{ (row.url ? 'https://' : '') }}{{ row.url }}
            </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="passwd" label="密码" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column show-overflow-tooltip prop="endTime" label="结束时间" width="180"></el-table-column>
        <el-table-column show-overflow-tooltip prop="instanceIP" label="实例IP" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="serviceName" label="服务名称" width="200"></el-table-column>
        <el-table-column show-overflow-tooltip prop="serverId" label="服务器" width="250">
            <template #default="{ row }">{{ getServerName(row) }}</template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="cdn" label="服务网络" width="150">
            <template #default="{ row }">{{ getCDNName(row) }}</template>
        </el-table-column>
        <el-table-column prop="isRefresh" label="实例状态" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isStop ? 'warning' : 'success'">{{ row.isStop ? '停止' : '运行' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isRefresh" label="自动重启" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isRefresh ? 'warning' : 'primary'">{{ row.isRefresh ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isConnection" label="高低报警" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isConnection ? 'success' : 'primary'">{{ row.isConnection ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isKeepPush" label="持续推送" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isKeepPush ? 'success' : 'primary'">{{ row.isKeepPush ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isNeedPassword" label="是否登录查看血糖" width="150">
            <template #default="{ row }">
                <el-tag :type="row.isNeedPassword ? 'success' : 'primary'">{{ row.isNeedPassword ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isBindWeChat" label="绑定公众号" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isBindWeChat ? 'success' : 'primary'">{{ row.isBindWeChat ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="isBindMini" label="绑定小程序" width="100">
            <template #default="{ row }">
                <el-tag :type="row.isBindMini ? 'success' : 'primary'">{{ row.isBindMini ? '是' : '否' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="status" label="状态" width="90"></el-table-column>
        <el-table-column show-overflow-tooltip prop="resource" label="来源" width="90"></el-table-column>
        <el-table-column show-overflow-tooltip prop="money" label="费用/元" width="90"></el-table-column>
        <el-table-column show-overflow-tooltip prop="position" label="用户所在区域" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="backupurl" label="备用访问" width="350">
            <template #default="{ row }">
                {{ (row.backupurl ? 'https://' : '') }}{{ row.backupurl }}
            </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="remark" label="备注" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="tel" label="电话" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="nsVersion" label="ns版本号" width="120"></el-table-column>

        <el-table-column show-overflow-tooltip prop="customerId" label="所属客户" width="200">
            <template #default="{ row }">{{ getCustomerName(row) }}</template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="nsMemory" label="ns预设内存/单位/M" width="120"></el-table-column>


        <el-table-column prop="sslCerName" label="证书cer地址" width="180">
        </el-table-column>
        <el-table-column prop="sslKeyName" label="证书key地址" width="180">
        </el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="180">
        </el-table-column>
        <el-table-column prop="ModifyTime" label="更新时间" width="180">
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">

                <el-button size="small" type="primary" plain @click="HandleEdit(row)">编辑</el-button>
                <el-dropdown trigger="click">
                    <span class="el-dropdown-link">
                        <el-link type="primary">更多操作<el-icon class="el-icon--right"><arrow-down /></el-icon></el-link>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :icon="Plus" @click="handleBind(row)">获取公众号绑定二维码</el-dropdown-item>
                            <el-dropdown-item :icon="MuteNotification"
                                @click="handleUnbind(row)">解除公众号绑定</el-dropdown-item>
                            <el-dropdown-item :icon="Plus" @click="handleBindMini(row)">获取小程序绑定二维码</el-dropdown-item>
                            <el-dropdown-item :icon="MuteNotification"
                                @click="handleUnbindMini(row)">解除小程序绑定</el-dropdown-item>
                            <el-dropdown-item :icon="Refresh" @click="handleRefresh(row)">重启实例</el-dropdown-item>
                            <el-dropdown-item :icon="CircleCloseFilled" @click="handleStop(row)">停止实例</el-dropdown-item>
                            <el-dropdown-item :icon="BrushFilled" @click="handleReset(row)">重置数据</el-dropdown-item>
                            <el-dropdown-item :icon="List" @click="handleLog(row)">操作日志</el-dropdown-item>
                            <el-dropdown-item :icon="DeleteFilled" @click="handleDel(row)">删除</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument" @click="copy(row.Id)">复制用户ID</el-dropdown-item>
                            <el-dropdown-item v-if="row.miniUrl" :icon="CopyDocument"
                                @click="copy(row.miniUrl)">复制小程序访问地址</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument"
                                @click="copy('https://' + row.url)">复制url地址</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument" @click="copy(row.passwd)">复制密码</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument"
                                @click="copy('https://' + row.passwd + '@' + row.url + '/api/v1')">复制api地址</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument"
                                @click="copy('https://' + row.url + '/api/v1/entries')">复制entries地址</el-dropdown-item>
                            <el-dropdown-item :icon="CopyDocument"
                                @click="copy('https://' + row.url + ' ' + row.passwd + '\n' + 'https://' + row.passwd + '@' + row.url + '/api/v1')">复制url+passwd+api</el-dropdown-item>


                            <el-dropdown-item v-if="!row.nsToken" :icon="Plus"
                                @click="handleToken(row, false, '添加api')">添加api token</el-dropdown-item>

                            <el-dropdown-item v-if="row.nsToken" :icon="Plus"
                                @click="handleToken(row, false, '刷新api')">刷新api token</el-dropdown-item>

                            <el-dropdown-item v-if="row.nsToken" :icon="Plus"
                                @click="handleToken(row, true, '重置api')">重置api token</el-dropdown-item>

                            <el-dropdown-item :icon="CopyDocument" v-if="row.nsToken" @click="copy(row.nsToken)">复制api
                                token</el-dropdown-item>

                            <el-dropdown-item v-if="row.miniUrl" :icon="Plus"
                                @click="handleFixMini(row)">获取小程序访问修复二维码</el-dropdown-item>
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
    <el-dialog v-model="dialogVisible" :title="formData.Id ? '编辑' : '添加'" :before-close="handleClose">
        <el-form @submit.prevent ref="refForm" :model="formData" :rules="ruleForm" label-width="200px" status-icon
            label-position="top">

            <el-tooltip class="item" content="如不填写,则自动生成" placement="top">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="formData.name" placeholder="如不填写,则自动生成" auto-complete="off"></el-input>
                </el-form-item>
            </el-tooltip>

            <el-tooltip class="item" content="不需要额外添加https否则会出问题,修改后需要重启ns实例" placement="top">
                <el-form-item label="访问地址" prop="url">
                    <el-input v-model="formData.url" placeholder="如不填写,则自动生成">
                        <template #prepend>https://</template>
                    </el-input>
                </el-form-item>
            </el-tooltip>

            <el-form-item label="开始日期" prop="startTime">
                <el-date-picker type="date" placeholder="选择日期" v-model="formData.startTime" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>

            <el-form-item label="结束日期" prop="endTime">
                <el-date-picker type="date" placeholder="选择日期" v-model="formData.endTime" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
            <el-tooltip class="item" content="修改密码后需要重启ns实例" placement="top">
                <el-form-item label="密码" prop="passwd">
                    <el-input v-model="formData.passwd" placeholder="如不填写,则自动生成" auto-complete="off"></el-input>
                </el-form-item>
            </el-tooltip>
            <el-form-item label="电话" prop="tel">
                <el-input v-model="formData.tel" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" auto-complete="off"></el-input>
            </el-form-item>
            <el-tooltip content="修改后自动迁移实例并重启" placement="top">
                <el-form-item label="部署服务器" prop="serverId">
                    <el-select v-model="formData.serverId" placeholder="请选择">
                        <el-option v-for="item in nsServer" :key="item.Id"
                            :label="item.serverName + '(' + item.countStop + '/' + item.countStart + '/' + item.count + '/' + item.holdCount + ')'"
                            :value="item.Id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="修改后不需要重启" placement="top">
                <el-form-item label="服务网络" prop="cdn">
                    <el-select v-model="formData.cdn" placeholder="请选择">
                        <el-option v-for="item in cdnList" :key="item.key" :label="item.name" :value="item.key">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="一般情况下不要乱动" placement="top">
                <el-form-item label="实例IP" prop="instanceIP">
                    <el-input :disabled="true" v-model="formData.instanceIP" auto-complete="off"
                        placeholder="自动生成"></el-input>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="一般情况下不要乱动" placement="top">
                <el-form-item label="服务名称" prop="serviceName">
                    <el-input :disabled="true" v-model="formData.serviceName" auto-complete="off"
                        placeholder="自动生成"></el-input>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置后每次编辑都会重启NS服务" placement="top">
                <el-form-item label="自动重启" prop="isRefresh">
                    <el-radio v-model="formData.isRefresh" :label="true">是</el-radio>
                    <el-radio v-model="formData.isRefresh" :label="false">否</el-radio>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置后绑定微信后就可以推送了,需要重启ns实例一次" placement="top">
                <el-form-item label="高低报警" prop="isConnection">
                    <el-radio v-model="formData.isConnection" :label="true">是</el-radio>
                    <el-radio v-model="formData.isConnection" :label="false">否</el-radio>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置持续推送后,需要重启ns实例一次" placement="top">
                <el-form-item label="持续推送" prop="isKeepPush">
                    <el-radio v-model="formData.isKeepPush" :label="true">是</el-radio>
                    <el-radio v-model="formData.isKeepPush" :label="false">否</el-radio>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置持续推送后,需要重启ns实例一次" placement="top">
                <el-form-item label="是否登录查看血糖" prop="isNeedPassword">
                    <el-radio v-model="formData.isNeedPassword" :label="true">是</el-radio>
                    <el-radio v-model="formData.isNeedPassword" :label="false">否</el-radio>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="不需要额外添加https否则会出问题" placement="top">
                <el-form-item label="备用访问" prop="backupurl">
                    <el-input v-model="formData.backupurl">
                        <template #prepend>https://</template>
                    </el-input>
                </el-form-item>
            </el-tooltip>
            <el-form-item label="状态" prop="status">
                <el-select v-model="formData.status" placeholder="请选择状态">
                    <el-option label="未启用" value="未启用"></el-option>
                    <el-option label="试用中" value="试用中"></el-option>
                    <el-option label="已付费" value="已付费"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="来源" prop="resource">
                <el-select v-model="formData.resource" placeholder="请选择来源">
                    <el-option label="自来" value="自来"></el-option>
                    <el-option label="推广" value="推广"></el-option>
                    <el-option label="介绍" value="介绍"></el-option>
                    <el-option label="分成" value="分成"></el-option>
                    <el-option label="未确认" value="未确认"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="费用/元" prop="money">
                <el-select v-model.number="formData.money" filterable allow-create placeholder="请选择金额">
                    <el-option label="0" value="0"></el-option>
                    <el-option label="100" value="100"></el-option>
                    <el-option label="120" value="120"></el-option>
                    <el-option label="130" value="130"></el-option>
                    <el-option label="150" value="150"></el-option>
                    <el-option label="180" value="180"></el-option>
                    <el-option label="200" value="200"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="用户所在地区" :prop="(formData.Id ? 'position_arr' : '')">
                <el-cascader :props="{ checkStrictly: true }" clearable filterable :options="pcaTextArr"
                    v-model="formData.position_arr">
                </el-cascader>
            </el-form-item>
            <el-tooltip content="设置版本号后,需要重启ns实例一次" placement="top">
                <el-form-item label="ns版本号" prop="nsVersion">
                    <el-select v-model="formData.nsVersion" filterable clearable placeholder="请选择版本号">
                        <el-option v-for="item in nsVersion" :label="item.name" :value="item.content">
                            <span>{{ item.content }}</span>(<span>{{ item.name }}</span>)
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置所属客户后,需要重启ns实例一次" placement="top">
                <el-form-item label="所属客户" prop="customerId">
                    <el-select v-model="formData.customerId" filterable placeholder="请选择客户">
                        <el-option v-for="item in customerList" :label="item.name" :value="item.Id">
                            <span>{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-tooltip>
            <el-tooltip content="设置内存后,需要重启ns实例一次" placement="top">
                <el-form-item label="ns预设内存/单位/M" prop="nsMemory">
                    <el-input v-model.number="formData.nsMemory"></el-input>
                </el-form-item>
            </el-tooltip>
            <el-form-item label="证书cer地址" prop="sslCerName">
                <el-input v-model="formData.sslCerName"></el-input>
            </el-form-item>
            <el-form-item label="证书key地址" prop="sslKeyName">
                <el-input v-model="formData.sslKeyName"></el-input>
            </el-form-item>
            <el-form-item label="启用组件" prop="plugins_arr">
                <el-select filterable style="width: 100%;" clearable multiple v-model="formData.plugins_arr"
                    placeholder="请选择要启用的组件">
                    <el-option :key="item.key" v-for="item in plugins" :label="item.name + '-' + item.key"
                        :value="item.key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="德康账号" prop="bridgeUserName">
                <el-input v-model="formData.bridgeUserName"></el-input>
            </el-form-item>
            <el-form-item label="德康密码" prop="bridgePassword">
                <el-input v-model="formData.bridgePassword"></el-input>
            </el-form-item>
            <el-form-item label="德康服务地区 US-美国 EU-美国以外" prop="bridgeServer">
                <el-input v-model="formData.bridgeServer"></el-input>
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
    <!-- 微信绑定二维码 -->
    <el-dialog title="微信绑定二维码" v-model="showBind" width="300px" :before-close="handleClose">
        <qrcode-vue :value="bindUrl" :size="250" level="H" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="showBind = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 小程序绑定二维码 -->
    <el-dialog title="小程序绑定二维码" v-model="showMini" width="300px" :before-close="handleClose">
        <el-image style="width: 250px; height: 250px" :src="'data:image/png;base64,' + miniUrl">
        </el-image>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="showMini = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 小程序修复二维码 -->
    <el-dialog title="小程序修复二维码" v-model="showMiniFix" width="300px" :before-close="handleClose">
        <el-image style="width: 250px; height: 250px" :src="'data:image/png;base64,' + miniUrlFix">
        </el-image>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="showMiniFix = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 操作日志 -->
    <el-dialog title="操作日志" v-model="showLog" width="600px" :before-close="handleClose">
        <el-table :data="tableLog" highlight-current-row border>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column show-overflow-tooltip prop="CreateTime" label="创建时间" width="180"></el-table-column>
            <el-table-column show-overflow-tooltip prop="content" label="日志" min-width="350"></el-table-column>
            <el-table-column show-overflow-tooltip prop="success" label="状态" width="90">
                <template #default="{ row }">
                    <el-tag :type="(row.success ? 'primary' : 'danger')"> {{ (row.success ? '成功' : '失败') }}
                    </el-tag>
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
                    :total="logForm.total" v-model:current-page="logForm.page" v-model:page-size="logForm.size" />
            </el-col>
        </el-row>




        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="showLog = false">关闭</el-button>
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