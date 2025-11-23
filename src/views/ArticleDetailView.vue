<template>
  <!-- 根页面 -->
  <div class="article-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-container">
      <!-- 头部 -->
      <header class="article-header">
        <!-- 面包屑导航：显示当前位置，方便用户导航 -->
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/articles' }">文章列表</el-breadcrumb-item>
          <el-breadcrumb-item>文章详情</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 标题 -->
        <h1 class="article-title">{{ articleTitle }}</h1>

        <!-- 元数据 -->
        <div class="article-meta">
          <div class="meta-left">
            <!-- 分类标签 -->
            <span class="category">
              <el-tag size="small" :type="getCategoryType(articleCategory)">
                {{ articleCategory }}
              </el-tag>
            </span>

            <!-- 发布时间 -->
            <span class="publish-time">
              <el-icon>
                <Clock />
              </el-icon>
              发布于 {{ formatDate(currentArticleData?.createdAt) }}
            </span>

            <!-- 更新时间 -->
            <span class="update-time" v-if="currentArticleData?.updatedAt !== currentArticleData?.createdAt">
              <el-icon>
                <Edit />
              </el-icon>
              更新于 {{ formatDate(currentArticleData?.updatedAt) }}
            </span>
          </div>

          <!-- 统计数据 -->
          <div class="meta-right">
            <!-- 浏览 -->
            <span class="views">
              <el-icon>
                <View />
              </el-icon>
              {{ articleViews }} 阅读
            </span>

            <!-- 点赞 -->
            <span class="likes">
              <el-icon>
                <Star />
              </el-icon>
              {{ articleLikes }} 点赞
            </span>
          </div>
        </div>

        <!-- 标签 -->
        <div class="article-tags" v-if="currentArticleData?.tags && article.tags.length">
          <el-tag v-for="tag in article.tags" :key="tag" type="info" size="small" class="tag">
            {{ tag }}
          </el-tag>
        </div>

        <!-- 摘要 -->
        <div class="article-summary" v-if="currentArticleData?.summary">
          <el-alert :title="article.summary" type="info" :closable="false" />
        </div>
      </header>

      <!-- 内容 -->
      <article class="article-content">
        <div class="content-html" v-html="currentArticleData?.content" ref="contentRef"></div>
      </article>

      <!-- 操作栏 -->
      <footer class="article-actions">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button-group>
            <!-- 编辑文章 -->
            <el-button type="primary" :icon="Edit" @click="handleEdit">
              编辑文章
            </el-button>

            <!-- 使用下拉菜单提供更多分享选项 -->
            <el-dropdown @command="shareToSocialMedia">
              <el-button :icon="Share">
                分享<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="weibo">分享到微博</el-dropdown-item>
                  <el-dropdown-item command="twitter">分享到 Twitter</el-dropdown-item>
                  <el-dropdown-item divided @click="handleShare">复制链接</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 点赞 -->
            <el-button :type="isLiked ? 'danger' : ''" :icon="Star" @click="handleLike">
              {{ isLiked ? '已点赞' : '点赞' }} ({{ articleLikes }})
            </el-button>
          </el-button-group>
        </div>

        <!-- 阅读时间估算 -->
        <div class="action-info">
          <span class="reading-time">
            阅读时间约为 {{ readingTime }} 分钟
          </span>
        </div>
      </footer>

      <!-- 相关推荐 -->
      <section class="related-articles" v-if="relatedArticles.length">
        <h3 class="section-title">相关文章</h3>
        <div class="related-list">
          <el-card class="related-card" v-for="related in relatedArticles" :key="related.id" shadow="hover"
            @click="goToArticle(related.id)">
            <template #header>
              <div class="related-header">
                <h4 class="related-title">{{ related.title }}</h4>
                <el-tag type="info" size="small">{{ related.category }}</el-tag>
              </div>
            </template>

            <p class="related-summary">{{ related.summary || '暂无摘要' }}</p>

            <div class="related-meta">
              <span>{{ formatDate(related.createdAt) }}</span>
              <span>{{ related.views }} 阅读</span>
            </div>
          </el-card>
        </div>
      </section>
    </div>

    <!-- 文章不存在 -->
    <div v-else class="empty-state">
      <el-empty description="文章不存在或已被删除">
        <el-button type="primary" @click="$router.push('/articles')">
          返回文章列表lieb
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArticleStore } from '@/stores/articleStore';
import { Article } from '@/types';
import { Clock, Edit, Share, Star, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


// 初始化
const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

// 响应式数据
const loading = ref(true)
const article = ref<Article | null>(null)
const isLiked = ref(false)
const contentRef = ref<HTMLElement>()
const relatedArticles = ref<Article[]>([])
// 添加防重复点击保护
const isHandlingLike = ref(false)

// ========== 计算属性 ==========
// 计算阅读时间（基于内容长度估算）
const readingTime = computed(() => {
  if(!article.value?.content) return 0
  // 简单的阅读时间计算：按每分钟 200 字计算
  // 这里去除了 HTML 标签，只计算纯文本长度
  const text = article.value.content.replace(/<[^>]*>/g, '')
  const wordCount = text.length
  // 确保至少显示 1 分钟
  return Math.max(1, Math.ceil(wordCount / 200))
})

// 添加计算属性确保响应式
const currentArticleData = computed(() => {
  return articleStore.currentArticle
})

const articleLikes = computed(() => {
  return currentArticleData.value?.likes || 0
})

const articleViews = computed(() => {
  return currentArticleData.value?.views || 0
})

const articleTitle = computed(() => {
  return currentArticleData.value?.title || ''
})

const articleCategory = computed(() => {
  return currentArticleData.value?.category || ''
})

// ========== 生命周期 ==========
onMounted(() => {
  loadArticle()
})
// 监听路由参数变化
watch (() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    loadArticle()
  }
})

// ========== 方法定义 ==========
// 加载文章数据
const loadArticle = async () => {
  article.value = null
  isLiked.value = false

  // 从路由参数获取文章ID
  const articleId = route.params.id as string
  if (!articleId) {
    ElMessage.error('文章ID无效')
    router.push('/articles')
    return
  }

  loading.value = true

  try {
    // 获取文章详情
    await articleStore.fetchArticleById(articleId)
    article.value = articleStore.currentArticle

    // 检查是否获取到文章
    if (!article.value) {
      ElMessage.error('文章不存在')
      router.push('/articles')
      return
    }

    // 重置点赞状态（新文章应该重新开始）
    isLiked.value = false

    // 从本地存储恢复点赞状态
    isLiked.value = getLikeStatusFromStorage(articleId)

    // 增加模拟阅读量（在实际项目中这里应该调用 API）
    await simulateViewIncrease()

    // 加载相关文章
    await loadRelatedArticles()

    // 使用 nextTick 确保 DOM 已经更新，然后处理内容样式
    nextTick(() => {
      processContentStyles()
    })
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
    router.push('/articles')
  } finally {
    loading.value = false
  }
}

// 增加阅读量，实际项目中应该调用后端 API 来更新阅读计数
const simulateViewIncrease = async () => {
  if (article.value) {
    try {
      await articleStore.incrementViewCount(article.value.id)
      console.log('阅读量已更新')
    } catch (error) {
      console.error('更新阅读量失败:', error)
    }
  }
}

// 加载相关文章：基于当前文章的标签或分类来推荐相关文章
const loadRelatedArticles = async () => {
  if (!article.value) return

  try {
  // 获取相关文章【实际项目中应该调用 API】
  relatedArticles.value = [
    {
      id: '2',
      title: 'Vue 3 组合式 API 最佳实践',
      content: '',
      summary: '学习 Vue 3 组合式 API 的使用技巧和最佳实践',
      tags: ['Vue', 'JavaScript', '前端'],
      category: '技术',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 156,
      likes: 23
    },
    {
      id: '3',
      title: 'TypeScript 类型编程入门',
      content: '',
      summary: '深入了解 TypeScript 的高级类型特性',
      tags: ['TypeScript', '编程'],
      category: '技术',
      status: 'published',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      views: 89,
      likes: 15
    }
  ] as Article[]

  } catch (error) {
    console.error('加载相关文章失败:', error)
  }
}

// 处理富文本内容样式，确保从编辑器保存的 HTML 内容在详情页正确显示
const processContentStyles = async () => {
  if (!contentRef.value) return

  // 获取内容区域的 DOM 元素
  const contentElement = contentRef.value

  // 处理图片：确保图片自适应且样式美观
  const images = contentElement.querySelectorAll('img')
  images.forEach(img => {
    img.style.maxWidth = '100%'      // 确保图片不会超出容器
    img.style.height = 'auto'        // 保持图片比例
    img.style.borderRadius = '4px'   // 添加圆角
  })

  // 处理表格：为表格添加滚动容器，避免在小屏幕上显示问题
  const tables = contentElement.querySelectorAll('table')
  tables.forEach(table => {
    const wrapper = document.createElement('div')
    wrapper.style.overflowX = 'auto'  // 水平滚动
    wrapper.style.margin = '16px 0'   // 上下边距
    // 将表格包装在滚动容器中
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

// 根据分类获取对应标签类型，给不同分类的文章标签设置不同的颜色
const getCategoryType = (category?: string) => {
  if (!category) return 'info'

  const types: Record<string, any> = {
    '技术': 'primary',
    '生活': 'success',
    '学习': 'warning',
    '系统': 'info'
  }
  return types[category] || 'info'
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'

  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 编辑文章
const handleEdit = () => {
  if (article.value) {
    router.push(`/articles/edit/${article.value.id}`)
  }
}

// 分享文章，实际应该集成社交媒体分享
const handleShare = () => {
  if (!article.value) return

  try {
    // 复制文章链接到剪贴板
    const articleUrl = `${window.location.origin}/articles/${article.value.id}`
    navigator.clipboard.writeText(articleUrl)
    .then(() => {
      ElMessage.success('文章链接已复制到剪贴板')
    })
    .catch(() => {
      // 如果 clipboard API 不可用，使用传统方法
      fallbackCopyToClipboard(articleUrl)
    })
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请手动复制链接')
  }
}

// 兼容性复制方法
const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (successful) {
      ElMessage.success('文章链接已复制到剪贴板')
    } else {
      throw new Error('复制失败')
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制链接')
  }
}

// 添加社交媒体分享（可选功能）
const shareToSocialMedia = (platform: string) => {
  if (!article.value) return

  const articleUrl = encodeURIComponent(`${window.location.origin}/articles/${article.value.id}`)
  const title = encodeURIComponent(article.value.title)
  
  const shareUrls: Record<string, string> = {
    weibo: `http://service.weibo.com/share/share.php?url=${articleUrl}&title=${title}`,
    twitter: `https://twitter.com/intent/tweet?text=${title}&url=${articleUrl}`,
    // 可以添加更多社交媒体
  }

  const url = shareUrls[platform]
  if (url) {
    window.open(url, '_blank', 'width=600,height=400')
  }
}

// 点赞/取消点赞，切换点赞状态并更新点赞计数
const handleLike = async () => {
  if (!currentArticleData.value || isHandlingLike.value) return
  
  const articleId = currentArticleData.value.id
  isHandlingLike.value = true

  try {
    if (isLiked.value) {
      // 取消点赞
      await articleStore.unlikeArticle(articleId)
      ElMessage.info('已取消点赞')
    } else {
      // 点赞
      await articleStore.likeArticle(articleId)
      ElMessage.success('点赞成功！')
    }

    // 更新状态并持久化
    isLiked.value = !isLiked.value
    saveLikeStatusToStorage(articleId, isLiked.value)

  } catch(error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    isHandlingLike.value = false
  }
}

// 点赞状态持久化
const getLikeStatusFromStorage = (articleId: string): boolean => {
  try {
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}')
    return !!likedArticles[articleId]
  } catch {
    return false
  }
}
const saveLikeStatusToStorage = (articleId: string, liked: boolean) => {
  try {
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}')
    if (liked) {
      likedArticles[articleId] = true
    } else {
      delete likedArticles[articleId]
    }
    localStorage.setItem('likedArticles', JSON.stringify(likedArticles))
  } catch (error) {
    console.error('保存点赞状态失败:', error)
  }
}

// 相关文章的点击，跳转文章
const goToArticle = (articleId: string) => {
  console.log(`✏️ 跳转到相关文章详情页面，文章ID: ${articleId}`)
  router.push(`/articles/${articleId}`)
}

</script>

<style scoped lang="scss">

  // ========== 页面布局样式 ==========
  .article-detail-page {
    // 使用 Tailwind CSS 的类名设置最大宽度和居中对齐
    @apply max-w-4xl mx-auto py-6 px-4;
  }

  // ========== 加载状态样式 ==========
  .loading-container {
    @apply space-y-4;
  }

  // ========== 文章容器样式 ==========
  .article-container {
    @apply space-y-6; // 子元素之间添加垂直间距
  }

  // ========== 面包屑导航样式 ==========
  .breadcrumb {
    @apply mb-6; // 底部边距
  }

  // ========== 文章头部样式 ==========
  .article-header {
    @apply space-y-4 pb-6 border-b border-gray-200; // 垂直间距、底部内边距和边框
  }

  .article-title {
    // 标题样式：大字号、粗体、深色文字
    @apply text-3xl font-bold text-gray-900 leading-tight;
  }

  // ========== 元数据样式 ==========
  .article-meta {
    // 响应式布局：小屏幕上垂直排列，中等屏幕以上水平排列
    @apply flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-gray-500;
  }

  .meta-left,
  .meta-right {
    @apply flex items-center gap-4 flex-wrap; // Flex 布局，允许换行
  }

  // ========== 标签样式 ==========
  .article-tags {
    @apply flex gap-2 flex-wrap; // Flex 布局，标签之间间距，允许换行
  }

  .tag {
    @apply cursor-pointer hover:opacity-80; // 鼠标悬停效果
  }

  // ========== 摘要样式 ==========
  .article-summary {
    @apply mt-4; // 顶部边距
  }

  // ========== 文章内容区域样式 ==========
  .article-content {
    @apply py-6; // 垂直内边距
  }

  .content-html {
    // 使用 Tailwind Typography 插件提供优美的文本排版
    @apply prose prose-lg max-w-none;

    // 使用 :deep() 选择器穿透 scoped 样式，影响子组件样式
    :deep() {

      // 标题样式
      h1,
      h2,
      h3,
      h4 {
        @apply font-bold text-gray-900 mt-6 mb-4;
      }

      h1 {
        @apply text-2xl;
      }

      h2 {
        @apply text-xl;
      }

      h3 {
        @apply text-lg;
      }

      // 段落样式
      p {
        @apply mb-4 leading-relaxed text-gray-700;
      }

      // 列表样式
      ul,
      ol {
        @apply mb-4 pl-6; // 底部边距和左侧内边距
      }

      ul {
        @apply list-disc;
      }

      // 无序列表使用圆点
      ol {
        @apply list-decimal;
      }

      // 有序列表使用数字

      li {
        @apply mb-2; // 列表项底部边距
      }

      // 引用块样式
      blockquote {
        @apply border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700;
      }

      // 行内代码样式
      code {
        @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-600;
      }

      // 代码块样式
      pre {
        @apply bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto;

        code {
          @apply bg-transparent text-inherit p-0; // 继承父元素样式
        }
      }

      // 表格样式
      table {
        @apply w-full border-collapse mb-4;

        th,
        td {
          @apply border border-gray-300 p-3 text-left;
        }

        th {
          @apply bg-gray-100 font-semibold; // 表头背景色和字体粗细
        }
      }

      // 图片样式
      img {
        @apply max-w-full h-auto rounded-lg shadow-sm my-4;
      }
    }
  }

  // ========== 操作栏样式 ==========
  .article-actions {
    // 响应式布局
    @apply flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200;
  }

  .action-buttons {
    @apply flex gap-2; // 按钮之间的间距
  }

  .action-info {
    @apply text-sm text-gray-500; // 次要文本样式
  }

  // ========== 相关文章区域样式 ==========
  .related-articles {
    @apply pt-6 border-t border-gray-200; // 顶部内边距和边框
  }

  .section-title {
    @apply text-xl font-bold text-gray-900 mb-4; // 标题样式
  }

  .related-list {
    // 网格布局：小屏幕单列，中等屏幕双列
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
  }

  .related-card {
    // 卡片悬停效果
    @apply cursor-pointer transition-all duration-200 hover:shadow-md;

    // 穿透样式修改 Element Plus 卡片头部
    :deep(.el-card__header) {
      @apply pb-2; // 减少底部内边距
    }
  }

  .related-header {
    @apply flex justify-between items-start gap-2; // Flex 布局，两端对齐
  }

  .related-title {
    // 标题样式：限制两行显示
    @apply text-base font-semibold text-gray-900 line-clamp-2 flex-1;
  }

  .related-summary {
    // 摘要样式：限制两行显示
    @apply text-sm text-gray-600 line-clamp-2 mb-2;
  }

  .related-meta {
    @apply flex justify-between text-xs text-gray-400; // 元数据样式
  }

  // ========== 空状态样式 ==========
  .empty-state {
    @apply py-12; // 垂直内边距
  }

  // ========== 响应式设计：移动端适配 ==========
  @media (max-width: 768px) {
    .article-detail-page {
      @apply px-3; // 减少水平内边距
    }

    .article-title {
      @apply text-2xl; // 减小标题字号
    }

    .article-meta {
      @apply flex-col items-start gap-2; // 垂直排列
    }

    .meta-left,
    .meta-right {
      @apply gap-2; // 减少元素间距
    }

    .article-actions {
      @apply flex-col items-stretch; // 垂直排列
    }

    .action-buttons {
      @apply flex-col; // 按钮垂直排列
    }

    .related-list {
      @apply grid-cols-1; // 单列布局
    }
  }
</style>