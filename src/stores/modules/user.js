import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'
// 用户信息持久化

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const token_type = ref('')
    const menu = ref([])
    const uid = ref('')



    // 菜单缓存
    // 首页
    const firstPage = {
      path: '/',
      title: '首页',
      active: true
    }
    //上页
    const prePage = ref({})
    // 当前页
    const curPage = ref({})
    // 列表
    const tagsList = ref([firstPage])

    // 设置一个激活导航
    const setOneActiveTag = (newTag) => {

      // console.info("tagsList", tagsList)
      // console.info("newTag", newTag)
      //点了自己
      if (newTag.path === curPage.value.path) return;

      let isRealNew = false
      for (let index = 0; index < tagsList.value.length; index++) {
        const element = tagsList.value[index];
        if (element.path === newTag.path) {
          //已添加过了,无需重复添加
          isRealNew = true
          newTag = element
        }

        if (element.active) prePage.value = element

        element.active = false
      }
      newTag.active = true;

      if (!isRealNew) tagsList.value.push(newTag)

      router.push(newTag.path)
      curPage.value = newTag

    }

    // 删除一个导航
    const removeOneTag = (tag) => {

      //不允许删除首页
      if (tag.path === '/') return;

      //删除
      tagsList.value.splice(tagsList.value.findIndex(t => t === tag), 1)

      //如果是激活就跳转到上一个路由
      if (tag.active) {
        prePage.value.active = true

        if (prePage.value.path) {
          setOneActiveTag(prePage.value)
        } else {
          setOneActiveTag(firstPage)
        }
        prePage.value = {}
      }
    }

    // 关闭其他页面
    const closeOtherPage = () => {
      if (firstPage.path === curPage.value.path) {
        firstPage.active = true
        tagsList.value = [firstPage]
      } else {
        firstPage.active = false
        tagsList.value = [firstPage, curPage.value]
        setOneActiveTag(curPage.value)
      }

    }

    // 关闭所有页面
    const closeAllPage = () => {
      tagsList.value = [firstPage]
      setOneActiveTag(firstPage)
    }


    // 设置token
    const setToken = (newToken) => {
      token.value = newToken
    }
    // 设置token类型
    const setTokenType = (newTokenType) => {
      token_type.value = newTokenType
    }
    // 设置菜单
    const setMenu = (newMenu) => {
      menu.value = newMenu
    }
    // 设置用户id
    const setUid = (newUid) => {
      uid.value = newUid
    }


    // 退出登录
    const logout = () => {
      token.value = ''
      token_type.value = ''
      menu.value = []
      uid.value = ''
      firstPage.active = true
      tagsList.value = [firstPage]
      prePage.value = {}
      curPage.value = {}

    }



    const isRemember = ref(false)
    const name = ref('')
    const pass = ref('')

    const setName = (newName) => {
      name.value = newName
    }
    const setPass = (newPass) => {
      pass.value = newPass
    }

    return {
      token,
      token_type,
      name,
      pass,
      menu,
      uid,
      isRemember,
      tagsList,
      prePage,
      curPage,
      setName,
      setPass,
      setToken,
      setTokenType,
      setMenu,
      setUid,
      logout,
      setOneActiveTag,
      removeOneTag,
      closeOtherPage,
      closeAllPage
    }
  },
  {
    persist: true //持久化
  }
)