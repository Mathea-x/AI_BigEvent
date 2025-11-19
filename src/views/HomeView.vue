<template>
  <div class="space-y-6">
    <!-- 欢迎卡片 -->
    <el-card class="welcom-card">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><Promotion /></el-icon>
          <span class="text-lg font-semibold">欢迎来到大事件管理系统</span>
        </div>
      </template>
      <div class="text-gray-600">
        <p>这是一个现代化的文章管理系统，支持 AI 智能创作、实时协作、数据可视化等高级功能。</p>
      </div>
    </el-card>

    <!--  数据统计  -->
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