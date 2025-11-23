<template>
  <!-- 整个页面 -->
  <div class="articles-page">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h2 class="page-title">文章管理</h2>
      <p class="page-description">管理您的所有文章，支持创建、编辑、删除和搜索</p>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-filter-section">
      <el-card shadow="never" class="search-card">
        <!-- 搜索筛选 -->
        <div class="search-container">
          <!-- 搜索输入 -->
          <div class="search-input-group">
            <!-- 搜索输入框 -->
            <el-input v-model="searchKeyword" placeholder="搜索文章标题、内容或标签" clearable @clear="handleSearch"
              @keyup.enter="handleSearch">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>

            <!-- 搜索按钮 -->
            <el-button type="primary" @click="handleSearch" :loading="store.loading">
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </el-button>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-group">
            <!-- 选择器 -->
            <el-select v-model="filterStatus" placeholder="文章状态" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-select v-model="filterCategory" placeholder="文章分类" clearable @change="handleFilterChange">
              <el-option v-for="category in categories" :key="category.id" :label="category.name"
                :value="category.name" />
            </el-select>
          </div>
        </div>

        <!-- 状态指示 -->
        <div class="current-filters" v-if="filterStatus || filterCategory || searchKeyword">
          <div class="filter-tags">
            <span class="filter-label">当前筛选：</span>
            <el-tag v-if="filterStatus" closable @close="clearStatusFilter" class="filter-tag">
              状态: {{ getStatusText(filterStatus) }}
            </el-tag>

            <el-tag v-if="filterCategory" closable @close="clearCategoryFilter" class="filter-tag">
              分类: {{ filterCategory }}
            </el-tag>

            <el-tag v-if="searchKeyword" closable @close="clearSearch" class="filter-tag">
              搜索: {{ searchKeyword }}
            </el-tag>

            <el-button link type="primary" @click="clearAllFilters" class="clear-all-btn">
              清除所有筛选
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 文章列表区域 -->
    <el-card shadow="never" class="articles-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <span class="card-title">文章列表</span>
          <div class="card-actions">
            <!-- 新建 -->
            <el-button type="primary" @click="handleCreateArticle" :loading="store.loading">
              <el-icon>
                <Plus />
              </el-icon>
              新建文章
            </el-button>
            <!-- 刷新 -->
            <el-button :loading="store.loading" @click="refreshArticles">
              <el-icon>
                <Refresh />
              </el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div class="loading-container" v-if="store.loading">
        <!-- Skeleton 骨架屏 -->
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 错误状态 -->
      <div class="error-container" v-else-if="store.error">
        <!-- 关闭事件监听 -->
        <el-alert :title="`加载失败：${store.error}`" type="error" show-icon closable @close="store.clearError()" />
        <div class="error-actions">
          <el-button type="primary" @click="refreshArticles">
            重试
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-container" v-else-if="store.articles.length === 0">
        <el-empty description="暂无文章" />
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateArticle">
            创建第一篇文章
          </el-button>
        </div>
      </div>

      <!-- 文章列表 -->
      <div class="articles-list" v-else>
        <div class="articles-stats">
          共找到 {{ store.pagination.total }} 篇文章
        </div>
        <!-- 文章项 -->
        <div v-for="article in store.articles" :key="article.id" class="article-item">
          <!-- 文章内容 -->
          <div class="article-content">
            <!-- 文章标题和状态 -->
            <div class="article-header">
              <h3 class="article-title">
                <router-link :to="`/articles/${article.id}`" class="title-link">
                  {{ article.title }}
                </router-link>
              </h3>
              <el-tag :type="getStatusTagType(article.status)" size="small">
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
                <!-- 分类 -->
                <span class="mate-item">
                  <el-icon>
                    <Collection />
                  </el-icon>
                  {{ article.category }}
                </span>
                <!-- 更新时间 -->
                <span class="meta-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  {{ formatDate(article.updatedAt) }}
                </span>
                <!-- 阅览量 -->
                <span class="meta-item">
                  <el-icon>
                    <View />
                  </el-icon>
                  {{ article.views }} 阅读
                </span>
                <!-- 点赞量 -->
                <span class="meta-item">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ article.likes }} 点赞
                </span>
              </div>
              <!-- 文章标签 -->
              <div class="article-tags">
                <el-tag class="tag-item" v-for="tag in article.tags" :key="tag" size="small">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="article-actions">
            <!-- 查看 -->
            <el-button type="primary" link @click="handleViewArticle(article.id)">
              <el-icon>
                <Tickets />
              </el-icon>
              查看
            </el-button>

            <!-- 编辑 -->
            <el-button type="primary" link @click="handleEditArticle(article.id)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>

            <!-- 发布 -->
            <el-button type="success" link v-if="article.status !== 'published'"
              @click="handlePublishArticle(article.id)">
              <el-icon>
                <Promotion />
              </el-icon>
              发布
            </el-button>

            <!-- 取消发布 -->
            <el-button type="warning" link v-if="article.status === 'published'"
              @click="handleUnpublishArticle(article.id)">
              <el-icon>
                <Close />
              </el-icon>
              取消发布
            </el-button>

            <!-- 删除 -->
            <el-button type="danger" link @click="handleDeleteArticle(article)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="store.articles.length > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
          :total="store.pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

import { useRouter } from 'vue-router'

import { useArticleStore } from '@/stores/articleStore'

import { Article, ArticleStatus } from '@/types'
import { Search, Plus, Refresh, Edit, Delete, Promotion, Close, Collection, Clock, View, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'


// ========== 初始化 ==========
// 获取路由实例，用于编程式导航
const router = useRouter()
// 获取文章状态管理 Store
const store = useArticleStore()

// ========== 响应式数据定义 ==========
// 搜索关键词
const searchKeyword = ref('')
// 筛选条件
const filterStatus = ref<ArticleStatus | ''>('')
const filterCategory = ref('')
// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
// 分类数据
const categories = ref([
  { id: '1', name: '技术' },
  { id: '2', name: '生活' },
  { id: '3', name: '学习' },
  { id: '4', name: '系统' },
])

// ========== 计算属性 ==========
const filterParams = computed(() => {
  const params: any = {
    page: currentPage.value,
    pageSize: pageSize.value
  }

  // 搜索关键词
  if (searchKeyword.value.trim()) {
    params.keyword = searchKeyword.value.trim()
  }

  // 状态筛选
  if (filterStatus.value) {
    params.category = filterCategory.value
  }

  // 分类筛选
  if (filterCategory.value) {
    params.category = filterCategory.value
  }

  return params
})

// ========== 生命周期钩子 ==========
// onMounted：组件挂载生命周期钩子;
// 在组件挂载到 DOM 后执行，用于初始数据加载
onMounted(() => {
  console.log('📄 文章列表页面已挂载，开始加载文章数据...')
  loadArticles()
})

// ========== 监听器 ==========
// watch：响应式监听器;
// 监听分页参数变化，自动重新加载数据
watch([currentPage, pageSize], () => {
  console.log('🔄 分页参数变化，重新加载文章...')
  loadArticles()
})

// ========== 方法函数 ==========
// 加载文章列表:封装从 Store 获取文章的业务逻辑
  const loadArticles = async (customParams?: any) => {
  try {
    // 使用传入的参数或使用当前筛选状态构建参数
    const params = customParams || {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value.trim(),
      status: filterStatus.value,
      category: filterCategory.value
    }
    console.log('🔄 开始加载文章列表，参数:', params)
    await store.fetchArticles(params)
    console.log('✅ 文章列表加载完成')

    // 更新当前的分页状态（从 Store 中获取实际的分页信息）
    currentPage.value = store.pagination.page
    pageSize.value = store.pagination.pageSize

  } catch(error) {
    console.error('❌ 加载文章列表失败:', error)
    // 错误信息已经在 Store 中处理，这里不需要额外处理
  }
}

// 处理搜索操作:用户点击搜索按钮或按回车时触发
const handleSearch = () => {
  console.log('🔍 执行搜索，关键词:', searchKeyword.value)
  // 搜索时重置到第一页
  currentPage.value = 1
  
  // 构建搜索参数（包含当前筛选状态）
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value.trim(),
    status: filterStatus.value,     // 👈 保持状态筛选
    category: filterCategory.value  // 👈 保持分类筛选
  }

  console.log('🔄 发送搜索请求，参数:', params)
  loadArticles(params)
}

// 处理筛选条件变化:用户选择不同的筛选条件时触发
const handleFilterChange = () => {
  console.log('🎛️ 筛选条件变化:', {
    status: filterStatus.value,
    category: filterCategory.value
  })

  // 筛选时重置到第一页
  currentPage.value = 1

  // 构建完整的筛选参数
  const filterParams = {
    page: currentPage.value,
    pageSize: pageSize.value,
    status: filterStatus.value,
    category: filterCategory.value,
    keyword: searchKeyword.value
  }
  
  console.log('📤 发送筛选请求，参数:', filterParams)
  loadArticles(filterParams)
}

// 清除状态筛选
const clearStatusFilter = () => {
  filterStatus.value = ''
  handleFilterChange()
}

// 清除分类筛选
const clearCategoryFilter = () => {
  filterCategory.value = ''
  handleFilterChange()
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  handleSearch()
}

// 清除所有筛选
const clearAllFilters = () => {
  filterStatus.value = ''
  filterCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  loadArticles()
}

// 刷新文章列表：手动触发重新加载数据
const refreshArticles = () => {
  console.log('🔄 手动刷新文章列表')
  // 构建当前状态的参数
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value.trim(),
    status: filterStatus.value,
    category: filterCategory.value
  }

  loadArticles(params)
}

// 跳转到创建文章页面
const handleCreateArticle = () => {
  console.log('📝 跳转到创建文章页面')
  router.push('/articles/create')
}

// 跳转到文章详情页面
const handleViewArticle = (id: string) => {
  console.log(`✏️ 跳转到文章详情页面，文章ID: ${id}`)
  router.push(`/articles/${id}`)
}

// 跳转到编辑文章页面
const handleEditArticle = (id: string) => {
  console.log(`✏️ 跳转到编辑文章页面，文章ID: ${id}`)
  router.push(`/articles/edit/${id}`)
}

// 发布文章：将文章状态改为已发布
const handlePublishArticle = async (id: string) => {
  try {
    console.log(`🚀 发布文章，文章ID: ${id}`)
    // 确认框
    await ElMessageBox.confirm(
      '确定要发布这篇文章吗？发布后用户将可以看到这篇文章。',
      '发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定发布',
        cancelButtonText: '取消'
      }
    )
    // 调用 Store 更新文章状态
    await store.updateArticle(id, {status: 'published'})
    ElMessage.success('文章发布成功！')
  } catch (error) {
    // 用户点击取消，error 为'cancel'
    if (error !== 'cancel') {
      console.error('❌ 发布文章失败:', error)
      ElMessage.error('发布失败，请重试')
    }
  }
}

// 取消发布文章：将文章状态改为草稿
const handleUnpublishArticle = async (id: string) => {
  try {
    console.log(`📦 取消发布文章，文章ID: ${id}`)
    // 确认框
    await ElMessageBox.confirm(
      '确定要取消发布这篇文章吗？取消后用户将无法看到这篇文章。',
      '取消发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定取消',
        cancelButtonText: '取消'
      }
    )
    // 调用 Store 更新文章状态
    await store.updateArticle(id, { status: 'draft' })
    ElMessage.success('文章已取消发布！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('❌ 取消发布文章失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 删除文章
const handleDeleteArticle = async (article: Article) => {
  try {
    console.log(`🗑️ 删除文章，文章ID: ${article.id}`, article.title)
    // 确认框
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
    // 调用 Store 删除文章
    await store.deleteArticle(article.id)
    ElMessage.success('文章删除成功！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('❌ 删除文章失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 每页显示数量变化
const handleSizeChange = (newSize: number) => {
  console.log(`📊 每页显示数量变更为: ${newSize}`)
  pageSize.value = newSize
  currentPage.value = 1
  // 构建包含当前筛选状态的参数
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    status: filterStatus.value,     // 👈 保持状态筛选
    category: filterCategory.value, // 👈 保持分类筛选
    keyword: searchKeyword.value    // 👈 保持搜索关键词
  }
  console.log('🔄 分页大小变化，携带筛选参数:', params)
  loadArticles(params)
}

// 处理当前页码变化
const handleCurrentChange = (newPage: number) => {
  console.log(`📄 页码变更为: ${newPage}`)
  currentPage.value = newPage

  // 构建包含当前筛选状态的参数
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    status: filterStatus.value,     // 👈 保持状态筛选
    category: filterCategory.value, // 👈 保持分类筛选
    keyword: searchKeyword.value    // 👈 保持搜索关键词
  }

  console.log('🔄 页码变化，携带筛选参数:', params)
  loadArticles(params)
}

// 获取状态标签的类型，根据文章状态返回对应的 Element Plus 标签类型
  const getStatusTagType = (status: string): string => {
    // 处理空字符串的情况
    if (!status) return ''

    const typeMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取状态显示文本，将状态枚举值转换为中文显示
  const getStatusText = (status: string): string => {
  // 处理空字符串的情况
  if (!status) return ''

    const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status] || status
}

// 格式化日期，将ISO日期字符串格式转化为可读的本地日期
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

// // 跳转到文章详情页面
// const goToArticle = (articleId: string) => {
//   console.log(`✏️ 跳转到相关文章详情页面，文章ID: ${articleId}`)
//   router.push(`/articles/${articleId}`)
// }

</script>

<style scoped lang="scss">

  // 整个页面
  .articles-page {

    // 页面标题
    .page-header {
      @apply space-y-2;

      .page-title {
        @apply text-2xl font-bold text-gray-900;
        /* Tailwind CSS：文本样式 */
      }

      .page-description {
        @apply text-gray-500 text-sm;
      }
    }

    .search-filter-section {
      .search-card {
        @apply border border-gray-200;
        /* Tailwind CSS：边框样式 */

        .search-container {
          @apply space-y-4;

          .search-input-group {
            @apply flex gap-3;
            /* Tailwind CSS：Flex 布局和间距 */

            .el-input {
              @apply flex-1;
              /* Tailwind CSS：弹性布局 */
            }
          }

          .filter-group {
            @apply flex gap-3 flex-wrap;

            .el-select {
              @apply w-32;
              /* Tailwind CSS：宽度工具类 */
            }
          }
        }

        .current-filters {
          @apply mt-4 pt-4 border-t border-gray-100;
        }

        .filter-tags {
          @apply flex items-center gap-2 flex-wrap;
        }

        .filter-label {
          @apply text-sm text-gray-500 mr-2;
        }

        .filter-tag {
          @apply flex items-center gap-1;
        }

        .clear-all-btn {
          @apply ml-2 text-xs;
        }
      }
    }

    .articles-card {
      @apply border border-gray-200;

      .card-header {
        @apply flex justify-between items-center;
        /* Tailwind CSS：Flex 对齐 */

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
          /* Tailwind CSS：交互状态和过渡效果 */
          @apply flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors;

          .article-content {
            @apply flex-1 space-y-3;

            .article-header {
              @apply flex items-center gap-3;

              .article-title {
                @apply m-0;

                .title-link {
                  /* CSS：链接样式和交互效果 */
                  @apply text-blue-600 hover:text-blue-800 no-underline hover:underline;
                }
              }
            }

            .article-summary {
              /* Tailwind CSS：文本截断 */
              @apply text-gray-600 text-sm line-clamp-2;
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

  /* CSS 媒体查询：响应式设计 */
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