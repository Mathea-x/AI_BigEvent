# 大事件管理系统（AI辅助）

> This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.
> Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

1. 项目定位：一个现代化的个人知识库或文章管理系统，支持文章的创建、编辑、分类、搜索，并融入AI辅助创作、离线可用等高级功能。

2. 技术选型：

   - **前端框架**：Vue 3 + TypeScript
   - **构建工具**：Vite
   - **状态管理**：Pinia
   - **UI库**：Element Plus 【Ant Design Vue（根据个人喜好）】
   - **路由**：Vue Router
   - **HTTP请求**：Axios
   - **本地存储**：使用IndexedDB（通过localForage库）支持离线
   - **PWA**：使用Vite PWA插件
   - **实时协作**（可选）：Socket.io
   - **全文搜索**：FlexSearch
   - **AI集成**：调用OpenAI API（或国内大模型如DeepSeek、Kimi）

3. 核心功能：

   1. **用户认证**（登录/注册）
   2. **文章管理**（增删改查，富文本编辑器，Markdown支持）
      1. 智能创建（AI生成标题/摘要）
      2. 富文本编辑（Markdown双模式）
      3. 自动标签分类（AI分析）
      4. 高级搜索（全文检索+语义搜索）
      5. 批量操作
   3. **文章分类与标签**
      1. 智能分类建议
      2. 标签云可视化
      3. 颜色编码系统
   4. **数据可视化**（文章数量统计，分类统计等）
      1. 写作趋势分析
      2. 分类分布图表
      3. 活跃度统计
   5. **AI辅助功能**（自动生成摘要、标签，内容润色，翻译等）
      1. 一键生成摘要
      2. 内容质量分析
      3. 自动标签推荐
      4. 智能排版优化
   6. **智能提醒**
      1. 定期回顾提醒
      2. 相关内容推荐
      3. 写作习惯分析
   7. **协作功能**
      1. 实时协同编辑
      2. 评论讨论系统
      3. 变更历史追踪
   8. **离线功能**（离线查看文章，编辑后同步）
      1. PWA应用安装
      2. 离线阅读编辑
      3. 网络恢复同步
   9. **高级搜索**（全文搜索，按标签、分类筛选）
   10. **响应式设计**（移动端友好）

4. 亮点：

   - **TypeScript**：全面使用TS，展示类型编程能力。
   - **性能优化**：组件懒加载，图片懒加载，虚拟滚动（如果文章列表很长）。
   - **PWA**：可安装，离线使用。
   - **AI集成**：自动生成摘要和标签，智能问答（针对文章内容）等。
   - **实时协作**（可选）：多人同时编辑文章，显示在线用户。
   - **数据可视化**：文章数据分析

5. 项目结构：

   ```
   src/
     ├── assets/          # 静态资源
     ├── components/      # 公共组件
     ├── views/           # 页面组件
     ├── stores/          # Pinia状态管理
     ├── routers/         # 路由配置
     ├── utils/           # 工具函数
     ├── types/           # TypeScript类型定义
     ├── services/        # API请求封装
     ├── hooks/           # 自定义Composition API
     └── styles/          # 全局样式
   ```

6. 计划：

   1. **项目初始化**：用Vite创建Vue3+TS项目，配置路由、状态管理、UI库。
   2. **基础功能开发**：实现文章的CRUD，使用Mock数据或本地JSON Server模拟后端。
   3. **集成AI功能**：选择一两个AI功能（如自动摘要）集成。
   4. **高级功能开发**：离线存储、全文搜索、数据可视化等。
   5. **优化与测试**：性能优化、PWA、测试。
   6. **部署**：部署到Vercel或Netlify，并编写详细的README。

------

[TOC]



## 1. 项目初始化和工程化配置

目标：

- 项目初始化和工程化配置
- Vue 3 + TypeScript + Vite 环境
- 路由配置和基础布局
- Element Plus + Tailwind CSS 样式框架
- JSON Server 模拟后端配置
- TypeScript 类型定义
- 基础项目结构

### 1.1 创建项目并安装依赖

终端：

```bash
# 使用 Vite 创建 Vue 3 + TypeScript 项目
npm create vite@latest big-event-manager -- --template vue-ts

cd big-event-manager

# 安装基础依赖
npm install

# 安装核心依赖
npm install vue-router@4 pinia axios
npm install element-plus @element-plus/icons-vue
npm install tailwindcss postcss autoprefixer
npm install -D json-server

# 安装开发依赖
npm install -D @types/node
```

### 1.2 配置Tailwind CSS

终端：

```bash
npx tailwindcss init -p
```

`tailwind.config.js`：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

`src/styles/index.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义样式 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
}

* {
  box-sizing: border-box;
}
```

### 1.3 配置 JSON Server

`serve/db.json`：

```json
{
  "articles": [
    {
      "id": "1",
      "title": "欢迎使用大事件管理系统",
      "content": "这是一个智能化的文章管理系统，支持 AI 辅助创作、实时协作等高级功能。",
      "summary": "系统介绍和欢迎信息",
      "tags": ["欢迎", "介绍"],
      "category": "系统",
      "status": "published",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "views": 100,
      "likes": 10
    }
  ],
  "categories": [
    { "id": "1", "name": "技术", "color": "#409EFF", "count": 0 },
    { "id": "2", "name": "生活", "color": "#67C23A", "count": 0 },
    { "id": "3", "name": "学习", "color": "#E6A23C", "count": 0 }
  ],
  "tags": [
    { "id": "1", "name": "Vue", "color": "#42b883" },
    { "id": "2", "name": "TypeScript", "color": "#3178c6" },
    { "id": "3", "name": "AI", "color": "#ff6b6b" }
  ]
}
```

`package.json`：

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "json-server --watch server/db.json --port 3001",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev\"",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.4 配置环境变量

`.env.development`：

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=大事件管理系统
```

`.env.production`：

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=大事件管理系统
```

### 1.5 项目基础结构

```text
src/
├── components/          # 通用组件
│   ├── layout/         # 布局组件
│   └── common/         # 通用组件
├── views/              # 页面组件
├── stores/             # Pinia 状态管理
├── composables/        # 组合式函数
├── services/           # API 服务
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── styles/             # 样式文件
└── hooks/              # 自定义 Hooks
```

### 1.6 配置TypeScript类型自定义

`src/types/index.ts`：

```typescript
// 1.6 配置TypeScript类型定义

// 基础类型定义：
// 文章
export interface Article {
    id: string
    title: string
    content: string
    summary?: string
    tags: string[]
    category: string
    status: 'draft' | 'published' | 'archived'
    createdAt: string
    updatedAt: string
    views: number
    likes: number
}
// 种类
export interface Category {
    id: string
    name: string
    color: string
    count: number
}
// 标签
export interface Tag {
    id: string
    name: string
    color: string
}

// API响应类型
export interface ApiResponse<T = any> {
    code: number
    data: T
    message: string
    success: boolean
}
// 导航参数
export interface PaginationParams {
    page: number
    pageSize: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}
// 列表响应
export interface ListResponse<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}
```

### 1.7 配置Vue应用和路由

更新 `src/main.ts`：

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

import './styles/index.css'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
```

创建 `src/router/index.ts`：

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/articles',
      name: 'Articles',
      component: () => import('@/views/ArticlesView.vue'),
      meta: { title: '文章管理' }
    },
    {
      path: '/articles/create',
      name: 'ArticleCreate',
      component: () => import('@/views/ArticleEditView.vue'),
      meta: { title: '创建文章' }
    },
    {
      path: '/articles/edit/:id',
      name: 'ArticleEdit',
      component: () => import('@/views/ArticleEditView.vue'),
      meta: { title: '编辑文章' }
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('@/views/CategoriesView.vue'),
      meta: { title: '分类管理' }
    }
  ]
})

// 路由守卫：更新页面标题
router.beforeEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 大事件管理系统`
  }
})

export default router
```

### 1.8 创建基础布局组件

创建 `src/components/layout/AppLayout.vue`：

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              🚀 大事件管理系统
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <el-button type="primary" @click="$router.push('/articles/create')">
              <el-icon><Plus /></el-icon>
              新建文章
            </el-button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 侧边栏和主内容 -->
    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
        <nav class="p-4 space-y-2">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            :class="{
              'bg-blue-50 text-blue-600': $route.path === item.path
            }"
          >
            <el-icon class="mr-3">
              <component :is="item.icon" />
            </el-icon>
            {{ item.name }}
          </router-link>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  House,
  Document,
  CollectionTag
} from '@element-plus/icons-vue'

const menuItems = [
  { path: '/', name: '首页', icon: House },
  { path: '/articles', name: '文章管理', icon: Document },
  { path: '/categories', name: '分类管理', icon: CollectionTag }
]
</script>
```

### 1.9 更新App.vue

```vue
<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
</script>
```

### 1.10 创建基础页面视图

创建 `src/views/HomeView.vue`：

```vue
<template>
  <div class="space-y-6">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><Promotion /></el-icon>
          <span class="text-lg font-semibold">欢迎使用大事件管理系统</span>
        </div>
      </template>
      <div class="text-gray-600">
        <p>这是一个现代化的文章管理系统，支持 AI 智能创作、实时协作、数据可视化等高级功能。</p>
      </div>
    </el-card>

    <!-- 数据统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <el-card shadow="hover">
        <template #header>
          <span class="text-gray-600">文章总数</span>
        </template>
        <div class="text-3xl font-bold text-blue-600">0</div>
      </el-card>
      
      <el-card shadow="hover">
        <template #header>
          <span class="text-gray-600">分类数量</span>
        </template>
        <div class="text-3xl font-bold text-green-600">0</div>
      </el-card>
      
      <el-card shadow="hover">
        <template #header>
          <span class="text-gray-600">标签数量</span>
        </template>
        <div class="text-3xl font-bold text-orange-600">0</div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255,255,255,0.2);
  color: white;
}
</style>
```

创建其他基础视图文件：

`src/views/ArticlesView.vue`：

```vue
<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">文章管理</h2>
    <el-empty description="暂无文章" />
  </div>
</template>

<script setup lang="ts">
</script>
```

`src/views/ArticleEditView.vue`：

```vue
<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">{{ $route.name === 'ArticleCreate' ? '创建文章' : '编辑文章' }}</h2>
    <div class="text-gray-500">文章编辑功能开发中...</div>
  </div>
</template>

<script setup lang="ts">
</script>
```

`src/views/CategoriesView.vue`：

```vue
<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">分类管理</h2>
    <el-empty description="分类管理功能开发中" />
  </div>
</template>

<script setup lang="ts">
</script>
```

## 2. 文章管理 —— CRUD 功能

目标：

- 文章列表展示（带分页和搜索）
- 创建新文章
- 编辑现有文章
- 删除文章
- 文章状态管理

### 2.1 创建API服务层：创建与后端交互的服务层

创建 `src/services/api.ts`：

```typescript
// 基础 API 配置和拦截器
import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 在发送请求前做一些处理
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 发送 API 请求: ${config.method?.toUpperCase()} ${config.url}`)
    // 这里可以添加认证 token 等
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 在接收到响应后做一些处理
api.interceptors.response.use(
  (response) => {
    console.log(`✅ 接收 API 响应: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ 响应拦截器错误:', error)
    
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          console.error('认证失败，请重新登录')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`服务器错误: ${error.response.status}`)
      }
    } else if (error.request) {
      // 请求发送失败
      console.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api
```

创建 `src/services/articleService.ts`：

```typescript
// 文章相关的 API 服务
import api from './api'
import type { Article, ApiResponse, PaginationParams, ListResponse } from '@/types'

/**
 * 文章服务类 - 封装所有文章相关的 API 调用
 */
class ArticleService {
  /**
   * 获取文章列表
   * @param params 分页和查询参数
   * @returns 文章列表和分页信息
   */
  async getArticles(params?: PaginationParams & { keyword?: string }): Promise<ApiResponse<ListResponse<Article>>> {
    try {
      const response = await api.get('/articles', { params })
      return response.data
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    }
  }

  /**
   * 根据 ID 获取单个文章详情
   * @param id 文章 ID
   * @returns 文章详情
   */
  async getArticleById(id: string): Promise<ApiResponse<Article>> {
    try {
      const response = await api.get(`/articles/${id}`)
      return response.data
    } catch (error) {
      console.error(`获取文章详情失败 (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * 创建新文章
   * @param article 文章数据（不包含 id）
   * @returns 创建后的文章数据
   */
  async createArticle(article: Omit<Article, 'id'>): Promise<ApiResponse<Article>> {
    try {
      // 为新建的文章添加时间戳
      const articleWithTimestamps = {
        ...article,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0
      }
      
      const response = await api.post('/articles', articleWithTimestamps)
      return response.data
    } catch (error) {
      console.error('创建文章失败:', error)
      throw error
    }
  }

  /**
   * 更新文章
   * @param id 文章 ID
   * @param article 要更新的文章数据
   * @returns 更新后的文章数据
   */
  async updateArticle(id: string, article: Partial<Article>): Promise<ApiResponse<Article>> {
    try {
      // 更新时只更新 updatedAt 字段
      const articleWithUpdateTime = {
        ...article,
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.put(`/articles/${id}`, articleWithUpdateTime)
      return response.data
    } catch (error) {
      console.error(`更新文章失败 (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * 删除文章
   * @param id 文章 ID
   * @returns 删除操作结果
   */
  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/articles/${id}`)
      return response.data
    } catch (error) {
      console.error(`删除文章失败 (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   * @returns 匹配的文章列表
   */
  async searchArticles(keyword: string): Promise<ApiResponse<Article[]>> {
    try {
      // JSON Server 的搜索方式：使用 q 参数进行全文搜索
      const response = await api.get('/articles', {
        params: { q: keyword }
      })
      return response.data
    } catch (error) {
      console.error(`搜索文章失败 (关键词: ${keyword}):`, error)
      throw error
    }
  }
}

// 导出单例实例
export const articleService = new ArticleService()
```

### 2.2 创建 Pinia Store 管理文章状态

创建 `src/stores/articleStore.ts`：

```typescript
// 文章状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, PaginationParams } from '@/types'
import { articleService } from '@/services/articleService'

/**
 * 文章状态管理 Store
 * 使用 Pinia 管理全局的文章状态，包括列表、加载状态、分页等
 */
export const useArticleStore = defineStore('article', () => {
  // ========== State（状态） ==========
  
  /** 文章列表 */
  const articles = ref<Article[]>([])
  
  /** 当前正在编辑或查看的文章 */
  const currentArticle = ref<Article | null>(null)
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | null>(null)
  
  /** 分页信息 */
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // ========== Getters（计算属性） ==========
  
  /** 获取已发布的文章 */
  const publishedArticles = computed(() => 
    articles.value.filter(article => article.status === 'published')
  )
  
  /** 获取草稿文章 */
  const draftArticles = computed(() => 
    articles.value.filter(article => article.status === 'draft')
  )
  
  /** 总页数 */
  const totalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.pageSize)
  )

  // ========== Actions（动作/方法） ==========
  
  /**
   * 获取文章列表
   * @param params 分页和查询参数
   */
  const fetchArticles = async (params?: PaginationParams & { keyword?: string }) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 开始获取文章列表...')
      
      // 合并分页参数
      const queryParams = {
        page: params?.page || pagination.value.page,
        pageSize: params?.pageSize || pagination.value.pageSize,
        keyword: params?.keyword
      }
      
      const response = await articleService.getArticles(queryParams)
      
      if (response.success) {
        // 更新状态
        articles.value = response.data.list
        pagination.value = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total
        }
        
        console.log(`✅ 成功获取 ${articles.value.length} 篇文章`)
      } else {
        throw new Error(response.message || '获取文章列表失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 获取文章列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 获取文章详情
   * @param id 文章 ID
   */
  const fetchArticleById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      console.log(`🔄 开始获取文章详情 (ID: ${id})...`)
      
      const response = await articleService.getArticleById(id)
      
      if (response.success) {
        currentArticle.value = response.data
        console.log(`✅ 成功获取文章详情: ${response.data.title}`)
      } else {
        throw new Error(response.message || '获取文章详情失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 获取文章详情失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建新文章
   * @param articleData 文章数据
   * @returns 创建的文章 ID
   */
  const createArticle = async (articleData: Omit<Article, 'id'>): Promise<string | null> => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 开始创建文章...')
      
      const response = await articleService.createArticle(articleData)
      
      if (response.success) {
        // 将新文章添加到列表开头
        articles.value.unshift(response.data)
        console.log(`✅ 成功创建文章: ${response.data.title}`)
        return response.data.id
      } else {
        throw new Error(response.message || '创建文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 创建文章失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新文章
   * @param id 文章 ID
   * @param articleData 要更新的文章数据
   */
  const updateArticle = async (id: string, articleData: Partial<Article>) => {
    loading.value = true
    error.value = null
    
    try {
      console.log(`🔄 开始更新文章 (ID: ${id})...`)
      
      const response = await articleService.updateArticle(id, articleData)
      
      if (response.success) {
        // 更新列表中的文章
        const index = articles.value.findIndex(article => article.id === id)
        if (index !== -1) {
          articles.value[index] = { ...articles.value[index], ...response.data }
        }
        
        // 更新当前文章
        if (currentArticle.value && currentArticle.value.id === id) {
          currentArticle.value = { ...currentArticle.value, ...response.data }
        }
        
        console.log(`✅ 成功更新文章: ${response.data.title}`)
      } else {
        throw new Error(response.message || '更新文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 更新文章失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除文章
   * @param id 文章 ID
   */
  const deleteArticle = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      console.log(`🔄 开始删除文章 (ID: ${id})...`)
      
      const response = await articleService.deleteArticle(id)
      
      if (response.success) {
        // 从列表中移除文章
        articles.value = articles.value.filter(article => article.id !== id)
        console.log(`✅ 成功删除文章 (ID: ${id})`)
      } else {
        throw new Error(response.message || '删除文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 删除文章失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   */
  const searchArticles = async (keyword: string) => {
    if (!keyword.trim()) {
      // 如果关键词为空，则获取所有文章
      await fetchArticles()
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      console.log(`🔍 开始搜索文章: ${keyword}`)
      
      const response = await articleService.searchArticles(keyword)
      
      if (response.success) {
        articles.value = response.data
        pagination.value.total = response.data.length
        console.log(`✅ 搜索完成，找到 ${response.data.length} 篇文章`)
      } else {
        throw new Error(response.message || '搜索文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 搜索文章失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置当前文章
   */
  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  // 导出所有状态和方法
  return {
    // State
    articles,
    currentArticle,
    loading,
    error,
    pagination,
    
    // Getters
    publishedArticles,
    draftArticles,
    totalPages,
    
    // Actions
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    clearError,
    clearCurrentArticle
  }
})
```

### 2.3 更新 TypeScript 类型定义

更新 `src/types/index.ts`，添加更详细的类型定义：

```typescript
/**
 * 应用类型定义文件
 * 这里定义了整个应用中使用的数据结构和接口
 */

/**
 * 文章状态类型
 * - draft: 草稿
 * - published: 已发布
 * - archived: 已归档
 */
export type ArticleStatus = 'draft' | 'published' | 'archived'

/**
 * 文章接口
 * 定义文章数据的完整结构
 */
export interface Article {
  /** 文章唯一标识 */
  id: string
  /** 文章标题 */
  title: string
  /** 文章内容 */
  content: string
  /** 文章摘要 */
  summary?: string
  /** 文章标签 */
  tags: string[]
  /** 文章分类 */
  category: string
  /** 文章状态 */
  status: ArticleStatus
  /** 创建时间 */
  createdAt: string
  /** 最后更新时间 */
  updatedAt: string
  /** 浏览次数 */
  views: number
  /** 点赞数 */
  likes: number
}

/**
 * 分类接口
 */
export interface Category {
  id: string
  name: string
  color: string
  count: number
}

/**
 * 标签接口
 */
export interface Tag {
  id: string
  name: string
  color: string
}

/**
 * 统一的 API 响应格式
 * @template T 数据类型
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
  /** 请求是否成功 */
  success: boolean
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 列表响应数据
 * @template T 列表项类型
 */
export interface ListResponse<T> {
  /** 数据列表 */
  list: T[]
  /** 总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 搜索参数
 */
export interface SearchParams {
  /** 搜索关键词 */
  keyword?: string
  /** 分类筛选 */
  category?: string
  /** 标签筛选 */
  tags?: string[]
  /** 状态筛选 */
  status?: ArticleStatus
}

/**
 * 文章表单数据（用于创建和编辑）
 */
export type ArticleFormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>
```

### 2.4 完善文章列表页面

创建 `src/views/ArticlesView.vue`：

```vue
<template>
  <div class="articles-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2 class="page-title">文章管理</h2>
      <p class="page-description">管理您的所有文章，支持创建、编辑、删除和搜索</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <el-card shadow="never" class="search-card">
        <div class="search-container">
          <!-- 搜索输入框 -->
          <div class="search-input-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章标题、内容或标签..."
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              @click="handleSearch"
              :loading="store.loading"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-group">
            <el-select 
              v-model="filterStatus" 
              placeholder="文章状态" 
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>

            <el-select 
              v-model="filterCategory" 
              placeholder="文章分类" 
              clearable
              @change="handleFilterChange"
            >
              <el-option 
                v-for="category in categories" 
                :key="category.id"
                :label="category.name" 
                :value="category.name" 
              />
            </el-select>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 文章列表区域 -->
    <el-card shadow="never" class="articles-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">文章列表</span>
          <div class="card-actions">
            <el-button 
              type="primary" 
              @click="handleCreateArticle"
              :loading="store.loading"
            >
              <el-icon><Plus /></el-icon>
              新建文章
            </el-button>
            <el-button 
              :loading="store.loading"
              @click="refreshArticles"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="store.loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="store.error" class="error-container">
        <el-alert
          :title="`加载失败: ${store.error}`"
          type="error"
          show-icon
          closable
          @close="store.clearError()"
        />
        <div class="error-actions">
          <el-button type="primary" @click="refreshArticles">
            重试
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="store.articles.length === 0" class="empty-container">
        <el-empty description="暂无文章" />
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateArticle">
            创建第一篇文章
          </el-button>
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-else class="articles-list">
        <div class="articles-stats">
          共找到 {{ store.pagination.total }} 篇文章
        </div>
        
        <!-- 文章项 -->
        <div 
          v-for="article in store.articles" 
          :key="article.id"
          class="article-item"
        >
          <div class="article-content">
            <!-- 文章标题和状态 -->
            <div class="article-header">
              <h3 class="article-title">
                <router-link 
                  :to="`/articles/edit/${article.id}`"
                  class="title-link"
                >
                  {{ article.title }}
                </router-link>
              </h3>
              <el-tag 
                :type="getStatusTagType(article.status)"
                size="small"
              >
                {{ getStatusText(article.status) }}
              </el-tag>
            </div>

            <!-- 文章摘要 -->
            <p class="article-summary">
              {{ article.summary || '暂无摘要' }}
            </p>

            <!-- 文章元信息 -->
            <div class="article-meta">
              <div class="meta-left">
                <span class="meta-item">
                  <el-icon><Collection /></el-icon>
                  {{ article.category }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(article.updatedAt) }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ article.views }} 阅读
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon>
                  {{ article.likes }} 点赞
                </span>
              </div>
              
              <!-- 文章标签 -->
              <div class="article-tags">
                <el-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="article-actions">
            <el-button 
              type="primary" 
              link
              @click="handleEditArticle(article.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            
            <el-button 
              type="success" 
              link
              v-if="article.status !== 'published'"
              @click="handlePublishArticle(article.id)"
            >
              <el-icon><Promotion /></el-icon>
              发布
            </el-button>
            
            <el-button 
              type="warning" 
              link
              v-if="article.status === 'published'"
              @click="handleUnpublishArticle(article.id)"
            >
              <el-icon><Close /></el-icon>
              取消发布
            </el-button>
            
            <el-button 
              type="danger" 
              link
              @click="handleDeleteArticle(article)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="store.articles.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="store.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 文章列表页面组件
 * 
 * 这个组件负责：
 * 1. 展示文章列表
 * 2. 提供搜索和筛选功能
 * 3. 处理分页
 * 4. 提供文章操作（编辑、删除、发布等）
 * 
 * 技术要点：
 * - 使用 Composition API 组织代码
 * - 使用 Pinia Store 管理状态
 * - 使用 Element Plus 组件构建 UI
 * - 实现搜索、筛选、分页的联动
 */

import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Refresh,
  Edit,
  Delete,
  Promotion,
  Close,
  Collection,
  Clock,
  View,
  Star
} from '@element-plus/icons-vue'

// 导入 Store 和类型
import { useArticleStore } from '@/stores/articleStore'
import type { Article, ArticleStatus } from '@/types'

// 使用 Vue Router 进行页面跳转
const router = useRouter()

// 使用 Pinia Store 管理文章状态
const store = useArticleStore()

// ========== 响应式数据 ==========

// 搜索关键词
const searchKeyword = ref('')

// 筛选条件
const filterStatus = ref<ArticleStatus | ''>('')
const filterCategory = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 分类数据（这里先写死，后面会从 API 获取）
const categories = ref([
  { id: '1', name: '技术' },
  { id: '2', name: '生活' },
  { id: '3', name: '学习' }
])

// ========== 计算属性 ==========

/**
 * 计算筛选参数
 * 这个计算属性会根据当前的搜索和筛选条件生成 API 查询参数
 */
const filterParams = computed(() => {
  const params: any = {
    page: currentPage.value,
    pageSize: pageSize.value
  }

  // 如果有搜索关键词，添加到参数中
  if (searchKeyword.value.trim()) {
    params.keyword = searchKeyword.value.trim()
  }

  // 如果有状态筛选，添加到参数中
  if (filterStatus.value) {
    params.status = filterStatus.value
  }

  // 如果有分类筛选，添加到参数中
  if (filterCategory.value) {
    params.category = filterCategory.value
  }

  return params
})

// ========== 生命周期 ==========

/**
 * 组件挂载时加载文章列表
 * onMounted 是 Vue 3 的生命周期钩子，在组件挂载到 DOM 后执行
 */
onMounted(() => {
  console.log('📄 文章列表页面已挂载，开始加载文章数据...')
  loadArticles()
})

// ========== 监听器 ==========

/**
 * 监听分页参数变化，自动重新加载数据
 * watch 是 Vue 3 的响应式监听器，当依赖的数据变化时执行回调
 */
watch(
  [currentPage, pageSize],
  () => {
    console.log('🔄 分页参数变化，重新加载文章...')
    loadArticles()
  }
)

// ========== 方法函数 ==========

/**
 * 加载文章列表
 * 这个方法封装了从 Store 获取文章的逻辑
 */
const loadArticles = async () => {
  try {
    console.log('🔄 开始加载文章列表，参数:', filterParams.value)
    await store.fetchArticles(filterParams.value)
    console.log('✅ 文章列表加载完成')
  } catch (error) {
    console.error('❌ 加载文章列表失败:', error)
    // 错误信息已经在 Store 中处理，这里不需要额外处理
  }
}

/**
 * 处理搜索操作
 * 当用户点击搜索按钮或按回车时触发
 */
const handleSearch = () => {
  console.log('🔍 执行搜索，关键词:', searchKeyword.value)
  // 搜索时重置到第一页
  currentPage.value = 1
  loadArticles()
}

/**
 * 处理筛选条件变化
 * 当用户选择不同的筛选条件时触发
 */
const handleFilterChange = () => {
  console.log('🎛️ 筛选条件变化:', {
    status: filterStatus.value,
    category: filterCategory.value
  })
  // 筛选时重置到第一页
  currentPage.value = 1
  loadArticles()
}

/**
 * 刷新文章列表
 * 手动触发重新加载数据
 */
const refreshArticles = () => {
  console.log('🔄 手动刷新文章列表')
  loadArticles()
}

/**
 * 处理创建新文章
 * 跳转到文章创建页面
 */
const handleCreateArticle = () => {
  console.log('📝 跳转到创建文章页面')
  router.push('/articles/create')
}

/**
 * 处理编辑文章
 * 跳转到文章编辑页面
 * @param id 文章 ID
 */
const handleEditArticle = (id: string) => {
  console.log(`✏️ 跳转到编辑文章页面，文章ID: ${id}`)
  router.push(`/articles/edit/${id}`)
}

/**
 * 处理发布文章
 * 将文章状态改为已发布
 * @param id 文章 ID
 */
const handlePublishArticle = async (id: string) => {
  try {
    console.log(`🚀 发布文章，文章ID: ${id}`)
    await ElMessageBox.confirm(
      '确定要发布这篇文章吗？发布后用户将可以看到这篇文章。',
      '发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定发布',
        cancelButtonText: '取消'
      }
    )
    
    await store.updateArticle(id, { status: 'published' })
    ElMessage.success('文章发布成功！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('❌ 发布文章失败:', error)
      ElMessage.error('发布失败，请重试')
    }
  }
}

/**
 * 处理取消发布文章
 * 将文章状态改为草稿
 * @param id 文章 ID
 */
const handleUnpublishArticle = async (id: string) => {
  try {
    console.log(`📦 取消发布文章，文章ID: ${id}`)
    await ElMessageBox.confirm(
      '确定要取消发布这篇文章吗？取消后用户将无法看到这篇文章。',
      '取消发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定取消',
        cancelButtonText: '取消'
      }
    )
    
    await store.updateArticle(id, { status: 'draft' })
    ElMessage.success('文章已取消发布！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('❌ 取消发布文章失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }
}

/**
 * 处理删除文章
 * 删除指定的文章
 * @param article 要删除的文章对象
 */
const handleDeleteArticle = async (article: Article) => {
  try {
    console.log(`🗑️ 删除文章，文章ID: ${article.id}`, article.title)
    
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除文章《${article.title}》吗？此操作不可恢复。`,
      '删除确认',
      {
        type: 'error',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // 执行删除操作
    await store.deleteArticle(article.id)
    ElMessage.success('文章删除成功！')
    
  } catch (error) {
    // 如果用户点击取消，error 会是 'cancel'
    if (error !== 'cancel') {
      console.error('❌ 删除文章失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

/**
 * 处理每页显示数量变化
 * @param newSize 新的每页显示数量
 */
const handleSizeChange = (newSize: number) => {
  console.log(`📊 每页显示数量变更为: ${newSize}`)
  pageSize.value = newSize
  // 数量变化时重置到第一页
  currentPage.value = 1
}

/**
 * 处理当前页码变化
 * @param newPage 新的页码
 */
const handleCurrentChange = (newPage: number) => {
  console.log(`📄 页码变更为: ${newPage}`)
  currentPage.value = newPage
}

/**
 * 获取状态标签的类型
 * 根据文章状态返回对应的 Element Plus 标签类型
 * @param status 文章状态
 * @returns 标签类型
 */
const getStatusTagType = (status: ArticleStatus): string => {
  const typeMap: Record<ArticleStatus, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[status]
}

/**
 * 获取状态显示文本
 * 将状态枚举值转换为中文显示
 * @param status 文章状态
 * @returns 状态文本
 */
const getStatusText = (status: ArticleStatus): string => {
  const textMap: Record<ArticleStatus, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status]
}

/**
 * 格式化日期
 * 将 ISO 日期字符串格式化为可读的本地日期
 * @param dateString ISO 日期字符串
 * @returns 格式化后的日期字符串
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '无效日期'
  }
}
</script>

<style scoped lang="scss">
/**
 * 文章列表页面样式
 * 使用 SCSS 语法，支持嵌套和变量
 */

.articles-page {
  @apply space-y-6;
  
  .page-header {
    @apply space-y-2;
    
    .page-title {
      @apply text-2xl font-bold text-gray-900;
    }
    
    .page-description {
      @apply text-gray-500 text-sm;
    }
  }
  
  .search-filter-section {
    .search-card {
      @apply border border-gray-200;
      
      .search-container {
        @apply space-y-4;
        
        .search-input-group {
          @apply flex gap-3;
          
          .el-input {
            @apply flex-1;
          }
        }
        
        .filter-group {
          @apply flex gap-3 flex-wrap;
          
          .el-select {
            @apply w-32;
          }
        }
      }
    }
  }
  
  .articles-card {
    @apply border border-gray-200;
    
    .card-header {
      @apply flex justify-between items-center;
      
      .card-title {
        @apply text-lg font-semibold;
      }
      
      .card-actions {
        @apply flex gap-2;
      }
    }
    
    .loading-container,
    .error-container,
    .empty-container {
      @apply py-8 text-center;
      
      .error-actions,
      .empty-actions {
        @apply mt-4;
      }
    }
    
    .articles-list {
      @apply space-y-4;
      
      .articles-stats {
        @apply text-sm text-gray-500 mb-4;
      }
      
      .article-item {
        @apply flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors;
        
        .article-content {
          @apply flex-1 space-y-3;
          
          .article-header {
            @apply flex items-center gap-3;
            
            .article-title {
              @apply m-0;
              
              .title-link {
                @apply text-blue-600 hover:text-blue-800 no-underline hover:underline;
              }
            }
          }
          
          .article-summary {
            @apply text-gray-600 text-sm line-clamp-2;
            /* line-clamp-2 是 Tailwind 的类，显示两行后省略 */
          }
          
          .article-meta {
            @apply flex justify-between items-center flex-wrap gap-2;
            
            .meta-left {
              @apply flex items-center gap-4 flex-wrap;
              
              .meta-item {
                @apply flex items-center gap-1 text-xs text-gray-500;
              }
            }
            
            .article-tags {
              @apply flex gap-1 flex-wrap;
              
              .tag-item {
                @apply text-xs;
              }
            }
          }
        }
        
        .article-actions {
          @apply flex gap-1 ml-4;
        }
      }
    }
    
    .pagination-container {
      @apply mt-6 flex justify-center;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .articles-page {
    .article-item {
      @apply flex-col items-stretch;
      
      .article-actions {
        @apply ml-0 mt-3 justify-end;
      }
    }
    
    .search-container {
      .search-input-group {
        @apply flex-col;
      }
      
      .filter-group {
        @apply justify-start;
      }
    }
  }
}
</style>
```



### 2.5 创建文章编辑组件

### 2.6 添加删除确认对话框