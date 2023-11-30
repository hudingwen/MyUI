// pinia独立维护
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(persist)
export default pinia

// 仓库导出
// import { useUserStore } from './modules/user'
// export { useUserStore }
// 简介写法
export * from './modules/user'
