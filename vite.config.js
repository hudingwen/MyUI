import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 打包时间戳,防止打包部署后用户页面出现缓存问题
const timestamp = new Date().getTime()
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: '/', //路由前缀
  resolve: {
    // @的配置
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 反向代理
  server: {
    open: true, // 服务启动时是否自动打开浏览器
    proxy: {
      "/api/": {
        target: "https://api.aiwanyun.cn",
        // target: "http://localhost:9291", 
        changeOrigin: true,
        // 前端api路由重新,比如api去掉
        // rewrite: (path) => path.replace(/^\/api/, ""),
        rewrite: (path) => {
          return path
        }
      },
      "/api2/": {
        target: "http://localhost:9291",
        changeOrigin: true,
        // 前端api路由重新,比如api2要重写成api
        rewrite: (path) => {
          var newPath = path.replace(/^\/api2/, '/api')
          return newPath
        }
      },
      "/img/": {
        target: "http://localhost:82",
        changeOrigin: true,
        // 前端api路由重新,比如img去掉
        rewrite: (path) => path.replace(/^\/img/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 入口文件名
        entryFileNames: `assets/[name].${timestamp}.js`,
        // 块文件名
        chunkFileNames: `assets/[name]-[hash].${timestamp}.js`,
        // 资源文件名 css 图片等等
        assetFileNames: `assets/[name]-[hash].${timestamp}.[ext]`,
      },
    },
  }
})
