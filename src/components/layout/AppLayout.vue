<template>
  <div class="min-h-screen bg-gray-50">
    <!--  导航栏  -->
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

    <!--  侧边栏和主内容  -->
    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
        <nav class="p-4 space-y-2">
          <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{'bg-blue-50 text-blue-600': $route.path === item.path}">
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
  CollectionTag,
  Sort
} from '@element-plus/icons-vue'

const menuItems = [
  { path: '/', name: '首页', icon: House },
  { path: '/articles', name: '文章管理', icon: Document },
  { path: '/categories', name: '分类管理', icon: Sort },
  { path: '/tags', name: '标签管理', icon: CollectionTag }
]
</script>