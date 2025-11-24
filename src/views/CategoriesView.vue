<template>
  <!-- 整个页面容器 -->
  <div class="categories-page">

    <!-- ========== 页面标题区域 ========== -->
    <div class="page-header">
      <h2 class="page-title">分类管理</h2>
      <p class="page-description">管理系统文章分类，支持创建、编辑、删除和搜索</p>
    </div>

    <!-- ========== 搜索和操作区域 ========== -->
    <div class="search-filter-section">
      <el-card class="search-card" shadow="never">
        <!-- 搜索 -->
        <div class="search-container">

          <!-- 搜索输入 -->
          <div class="search-input-group">
            <!-- 输入框 -->
            <el-input v-model="searchKeyword" placeholder="搜索分类名称或描述" clearable @clear="handleSearch"
              @keyup.enter="handleSearch">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>

            <!-- 按钮 -->
            <el-button type="primary" @click="handleSearch" :loading="store.loading">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </div>
        </div>

        <!-- 筛选 -->
        <div class="current-fiters" v-if="searchKeyword">
          <div class="filter-tags">

            <span class="filter-label">当前筛选:</span>

            <el-tag class="filter-tag" v-if="searchKeyword" closable @close="clearSearch">
              搜索: {{ searchKeyword }}
            </el-tag>

            <el-button class="clear-all-btn" link type="primary" @click="clearAllFilters">
              清除所有筛选
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- ========== 分类列表区域 ========== -->
    <el-card class="categories-card" shadow="never">

      <!-- 分类头部 -->
      <template #header>
        <div class="card-header">
          <span class="card-title">分类列表</span>
          <div class="card-actions">
            <el-button type="primary" @click="handleCreateCategory" :loading="store.loading">
              <el-icon>
                <Plus />
              </el-icon>
              新建分类
            </el-button>
            <el-button :loading="store.loading" @click="refreshCategories">
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
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 错误状态 -->
      <div class="error-container" v-else-if="store.error">
        <el-alert :title="`加载失败：${store.error}`" type="error" show-icon closable @close="store.clearError()" />
        <div class="error-actions">
          <el-button type="primary" @click="refreshCategories">
            重试
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-container" v-else-if="paginatedCategories.length === 0">
        <el-empty description="暂无分类" />
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateCategory">
            创建第一个分类
          </el-button>
        </div>
      </div>

      <!-- 分类列表内容 -->
      <div class="categories-list" v-else>

        <!-- 分类统计信息 -->
        <div class="categories-stats">
          共找到 {{ filteredCategories.length }} 个分类
        </div>

        <!-- 分类项 -->
        <div v-for="category in paginatedCategories" :key="category.id" class="category-item">

          <div class="category-content">
            <!-- 头部 -->
            <div class="category-header">
              <h3 class="category-title">
                <!-- 使用颜色圆点替代文字标签 -->
                <span class="color-dot" :style="{ backgroundColor: category.color }"></span>
                {{ category.name }}
              </h3>
              <!-- 文章数量标签 -->
              <el-tag type="info" size="small">
                {{ category.articleCount }} 篇文章
              </el-tag>
            </div>

            <!-- 分类描述 -->
            <p class="category-summary">
              {{ category.description || '暂无描述' }}
            </p>

            <!-- 分类元信息 -->
            <div class="category-meta">
              <div class="meta-left">
                <!-- 创建时间 -->
                <span class="meta-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  创建: {{ formatDate(category.createdAt) }}
                </span>
                <!-- 更新时间 -->
                <span class="meta-item">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                  更新: {{ formatDate(category.updatedAt) }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="category-actions">
              <!-- 编辑 -->
              <el-button type="primary" link @click="handleEditCategory(category)">
                <el-icon>
                  <Edit />
                </el-icon>
                编辑
              </el-button>

              <!-- 删除 -->
              <el-button type="danger" link @click="handleDeleteCategory(category)"
                :disabled="category.articleCount > 0">
                <el-icon>
                  <Delete />
                </el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="filteredCategories.length > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[6, 12, 24, 48]"
          :total="filteredCategories.length" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- ========== 创建/编辑分类对话框 ========== -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false">

      <!-- 输入表单 -->
      <el-form :model="categoryForm" :rules="formRules" ref="formRef" label-width="80px">
        <!-- 分类名称表单项 -->
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>

        <!-- 颜色选择表单项 -->
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="categoryForm.color" />
          <span class="color-preview-text">预览颜色</span>
          <div class="color-preview" :style="{ backgroundColor: categoryForm.color }"></div>
        </el-form-item>

        <!-- 分类描述表单项 -->
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="请输入分类描述（可选）"
            maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>

      <!-- 对话框底部操作 -->
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCategory" :loading="submitLoading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">

  import { useCategoryStore } from '@/stores/categoryStore'
  import { CategoryFormData, type Category } from '@/types'
  import { Clock, Delete, Document, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { type FormRules, type FormInstance, ElMessage, ElMessageBox } from 'element-plus'
  import { computed, onMounted, reactive, ref } from 'vue'

  // ========== Store初始化 ==========
  const store = useCategoryStore()

  // ========== 响应式数据定义 ==========
  // 搜索关键词
  const searchKeyword = ref('')

  // 分页数据
  const currentPage = ref(1)
  const pageSize = ref(6)

  // 对话框显示/隐藏
  const dialogVisible = ref(false)

  // 提交加载状态
  const submitLoading = ref(false)

  // 当前正在编辑的分类
  const editingCategory = ref<Category | null>(null)

  // 表单
  const formRef = ref<FormInstance>()

  // 分类表单
  const categoryForm = reactive<CategoryFormData>({
    name: '',
    color: '#409EFF', // 默认颜色为Element Plus主色
    description: ''
  })

  // 表单验证规则
  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    color: [
      { required: true, message: '请选择分类颜色', trigger: 'change' }
    ]
  }

  // ========== 计算属性 ==========

  // 过滤后的分类列表
  const filteredCategories = computed(() => {
    if (!searchKeyword.value.trim()) {
      return store.sortedCategories
    }

    const keyword = searchKeyword.value.toLowerCase()
    return store.sortedCategories.filter(category =>
      category.name.toLowerCase().includes(keyword) ||
      (category.description && category.description.toLowerCase().includes(keyword))
    )
  })

  // 分页后的分类列表
  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredCategories.value.slice(start, end)
  })

  // 分页索引
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() =>
    Math.min(currentPage.value * pageSize.value,filteredCategories.value.length)
  )

  // 对话框标题
  const dialogTitle = computed(() =>
    editingCategory.value ? '编辑分类' : '新建分类'
  )

  // ========== 生命周期钩子 ==========
  onMounted(() => {
    console.log('📂 分类管理页面已挂载，开始加载分类数据...')
    loadCategories()
  })

  // ========== 核心方法函数 ==========

  // 加载分类列表
  const loadCategories = async () => {
    try {
      console.log('🔄 开始加载分类列表...')
      await store.fetchCategories()
      console.log('✅ 分类列表加载完成，总数:', store.categories.length)
    } catch (error) {
      console.error('❌ 加载分类列表失败:', error)
    }
  }

  // 搜索
  const handleSearch = () => {
    console.log('🔍 执行搜索，关键词:', searchKeyword.value)
    // 搜索时重置到第一页，确保用户从第一页开始查看结果
    currentPage.value = 1
  }

  // 创建分类
  const handleCreateCategory = () => {
    console.log('📝 打开创建分类对话框')
    editingCategory.value = null
    resetForm()
    dialogVisible.value = true
  }

  // 编辑分类
  const handleEditCategory = (category: Category) => {
    console.log('✏️ 编辑分类:', category.name)
    editingCategory.value = category
    // 使用Object.assign填充表单数据
    Object.assign(categoryForm, {
      name: category.name,
      color: category.color,
      description: category.description || ''
    })
    dialogVisible.value = true
  }

  // 删除分类
  const handleDeleteCategory = async (category: Category) => {
    try {
      console.log('🗑️ 删除分类:', category.name)

      // 删除保护：如果分类下有文章，不允许删除
      if (category.articleCount > 0) {
        ElMessage.warning('该分类下有关联文章，无法删除')
        return
      }

      // 确认删除对话框
      await ElMessageBox.confirm(
        `确定要删除分类「${category.name}」吗？此操作不可恢复。`,
        '删除确认',
        {
          type: 'error',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger'
        }
      )

      // 执行删除操作
      await store.deleteCategory(category.id)
      ElMessage.success('分类删除成功！')

    } catch (error) {
      // 用户取消删除不报错
      if (error !== 'cancel') {
        console.error('❌ 删除分类失败:', error)
        ElMessage.error('删除失败，请重试')
      }
    }
  }

  // 提交分类表单
  const handleSubmitCategory = async () => {
    // 表单引用验证
    if (!formRef.value) return

    try {
      // 执行表单验证
      await formRef.value.validate()
      submitLoading.value = true

      if (editingCategory.value) {
        // 更新分类逻辑
        console.log('🔄 更新分类:', editingCategory.value.id)
        await store.updateCategory(editingCategory.value.id, categoryForm)
        ElMessage.success('分类更新成功！')
      } else {
        // 创建分类逻辑
        console.log('🔄 创建新分类')
        const result = await store.createCategory(categoryForm)
        if (result) {
          ElMessage.success('分类创建成功！')
        }
      }

      // 关闭对话框并重置表单
      dialogVisible.value = false
      resetForm()

    } catch (error) {
      // 错误处理：验证失败或API错误
      if (error instanceof Error) {
        console.error('❌ 提交分类表单失败:', error)
      }
    } finally {
      // 无论成功失败，都关闭加载状态
      submitLoading.value = false
    }
  }

  // 刷新
  const refreshCategories = () => {
    console.log('🔄 手动刷新分类列表')
    loadCategories()
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(categoryForm, {
      name: '',
      color: '#409EFF',
      description: ''
    })
    // 清除表单验证状态
    formRef.value?.clearValidate()
  }

  // 清除搜索条件
  const clearSearch = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  // 清除所有筛选条件
  const clearAllFilters = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  // 格式化日期
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

  // 处理每页显示数量变化
  const handleSizeChange = (newSize: number) => {
    console.log(`📊 每页显示数量变更为: ${newSize}`)
    pageSize.value = newSize
    currentPage.value = 1 // 切换每页大小时回到第一页
  }

  // 处理当前页码变化
  const handleCurrentChange = (newPage: number) => {
    console.log(`📄 页码变更为: ${newPage}`)
    currentPage.value = newPage
  }

</script>

<style scoped lang="scss">

  .categories-page {
    @apply space-y-6;

    /* 页面标题样式 */
    .page-header {
      @apply space-y-2;

      .page-title {
        @apply text-2xl font-bold text-gray-900;
      }

      .page-description {
        @apply text-gray-500 text-sm;
      }
    }

    /* 搜索筛选区域样式 */
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
        }

        .current-filters {
          @apply mt-4 pt-4 border-t border-gray-100;

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
    }

    /* 分类列表卡片样式 */
    .categories-card {
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

      /* 状态容器通用样式 */
      .loading-container,
      .error-container,
      .empty-container {
        @apply py-8 text-center;

        .error-actions,
        .empty-actions {
          @apply mt-4;
        }
      }

      .categories-list {
        @apply space-y-4;

        .categories-stats {
          @apply text-sm text-gray-500 mb-4;
        }

        /* 🎯 关键修改：分类项使用与文章项相同的样式 */
        .category-item {
          /* 与文章项相同的布局和样式 */
          @apply flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors;

          .category-content {
            @apply flex-1 space-y-3;

            /* 分类头部 - 类似文章头部 */
            .category-header {
              @apply flex items-center gap-3;

              .category-title {
                @apply m-0 flex items-center gap-2;

                /* 颜色圆点 - 替代分类颜色标识 */
                .color-dot {
                  @apply w-3 h-3 rounded-full inline-block;
                }
              }
            }

            /* 分类描述 - 类似文章摘要 */
            .category-summary {
              @apply text-gray-600 text-sm line-clamp-2;
            }

            /* 分类元信息 - 类似文章元信息 */
            .category-meta {
              @apply flex justify-between items-center flex-wrap gap-2;

              .meta-left {
                @apply flex items-center gap-4 flex-wrap;

                .meta-item {
                  @apply flex items-center gap-1 text-xs text-gray-500;
                }
              }
            }
          }

          /* 操作按钮 */
          .category-actions {
            @apply flex gap-1 ml-4;
          }
        }
      }

      /* 分页容器样式 */
      .pagination-container {
        @apply mt-6 flex justify-center;
      }
    }

    /* 颜色预览样式 */
    .color-preview-text {
      @apply ml-2 text-sm text-gray-500;
    }

    .color-preview {
      @apply inline-block w-6 h-6 rounded ml-2 border border-gray-300;
    }
  }

  /* CSS 媒体查询：响应式设计 */
  @media (max-width: 768px) {
    .categories-page {
      .category-item {
        @apply flex-col items-stretch;

        .category-actions {
          @apply ml-0 mt-3 justify-end;
        }
      }

      .search-container {
        .search-input-group {
          @apply flex-col;
        }
      }
    }
  }
</style>