import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

import './styles/index.css'
import { APP_CONFIG } from './utils/env'

// 应用启动日志
console.log(`🚀 启动 ${APP_CONFIG.title} v${APP_CONFIG.version}`)
console.log(`🌐 API 基础地址: ${APP_CONFIG.apiBaseUrl}`)
console.log(`🔧 环境: ${APP_CONFIG.isDev ? '开发' : '生产'}`)

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
