<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  GetMy2FA,
  ValidMy2FA,
  GetMyInfo,
  CancelMy2FA
} from '@/api/user.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores';
const userStore = useUserStore()
import QrcodeVue from 'qrcode.vue'

//双因子

const authInfo = ref({})
const userInfo = ref(null)
const cancelInfo = ref({})

onMounted(() => {
  RefreshInfo()
})

const GetOne2fa = () => {
  GetMy2FA().then(res => {
    authInfo.value = res.data.response
    authDialogVisible.value = true
  })
}
const RefreshInfo = () => {
  GetMyInfo().then(res => {
    userInfo.value = res.data.response
  })
}

// 验证
const authFormData = ref({})
const authDialogVisible = ref(false)
const authForm = ref()
const authFormRule = {
  authCode: [
    { required: true, message: 'PIN密码不能为空', trigger: 'change' },
  ]
}
const SubmitAuth = () => {
  authForm.value.validate((valid, fields) => {
    if (!valid && fields) {
      for (let key in fields)
        ElMessage.error(fields[key][0].message)
      return;
    }

    ElMessageBox.confirm('确定开启双因子验证?')
      .then(() => {
        ValidMy2FA({ authId: authInfo.value.Id, authCode: authFormData.value.authCode }).then(res => {
          authDialogVisible.value = false
          RefreshInfo()
        })
      })


  })
}

// 取消
const cancelFormData = ref({})
const cancelDialogVisible = ref(false)
const cancelForm = ref()
const cancelFormRule = {
  authCode: [
    { required: true, message: 'PIN密码不能为空', trigger: 'change' },
  ]
}
const SubmitCancel = () => {
  cancelForm.value.validate((valid, fields) => {
    if (!valid && fields) {
      for (let key in fields)
        ElMessage.error(fields[key][0].message)
      return;
    }

    ElMessageBox.confirm('确定取消双因子验证?')
      .then(() => {
        CancelMy2FA({ authCode: cancelFormData.value.authCode }).then(res => {
          cancelDialogVisible.value = false
          RefreshInfo()
        })
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
</script>
<template>


  <el-result v-if="userInfo && userInfo.auth2faEnable" icon="success" title="已开启双因子(2FA)验证" sub-title="如需取消请点击下方按钮">
    <template #extra>
      <el-button type="primary" @click="cancelDialogVisible = true">去关闭</el-button>
    </template>
  </el-result>

  <el-result v-if="userInfo && !userInfo.auth2faEnable" icon="warning" title="还未开启双因子(2FA)验证" sub-title="如需开启请点击下方按钮">
    <template #extra>
      <el-button type="primary" @click="GetOne2fa">去开启</el-button>
    </template>
  </el-result>

  <!-- 验证 -->
  <el-dialog v-model="authDialogVisible" title="开启2FA" :before-close="handleClose" style="width: 350px;">

    <el-form class="mobile-box" @submit.prevent ref="authForm" :model="authFormData" :rules="authFormRule"
      label-width="80px" status-icon label-position="top">
      <el-form-item label="手机扫描二维码">
        <div style="width: 100%;text-align: center;">
          <qrcode-vue :value="authInfo.provisionUrl" :size="250" level="H" />
          <el-alert title="也可以手动输入下方秘钥" type="success" :closable="false" />
          
          <el-text type="success">{{ authInfo.keyBase32 }}</el-text>
        </div>
      </el-form-item>
      <el-form-item label="PIN密码" prop="authCode">
        <el-input v-model="authFormData.authCode" auto-complete="off" clearable placeholder="请输入PIN密码"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="authDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="SubmitAuth">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 取消 -->
  <el-dialog v-model="cancelDialogVisible" title="关闭2FA" :before-close="handleClose" style="width: 350px;">

    <el-form class="mobile-box" @submit.prevent ref="cancelForm" :model="cancelFormData" :rules="cancelFormRule"
      label-width="80px" status-icon label-position="top">
      <el-form-item label="PIN密码" prop="authCode">
        <el-input v-model="cancelFormData.authCode" auto-complete="off" clearable placeholder="请输入PIN密码"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="SubmitCancel">确定</el-button>
      </div>
    </template>
  </el-dialog>


</template>
