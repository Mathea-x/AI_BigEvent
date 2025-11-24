<template>
  <!-- 根页面 -->
  <div class="tags-page">

    <!-- 页面标题区域 -->
    <div class="page-header">
      <h2 class="page-title">标签管理</h2>
      <p class="page-description">管理系统文章标签，支持创建、编辑、删除和搜索</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-action-section">
      <el-card shadow="never" class="search-card">
        <div class="search-container">

          <!-- 搜索输入组 -->
          <div class="search-input-group">

            <el-input v-model="searchKeyword" placeholder="搜索标签名称" clearable @clear="handleSearch"
              @keyup.enter="handleSearch">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>

            <el-button type="primary" @click="handleSearch" :loading="store.loading">
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </el-button>
          </div>
        </div>

        <!-- 当前筛选状态显示 -->
        <div class="current-filters" v-if="searchKeyword">
          <div class="filter-tags">
            <span class="filter-label">当前筛选：</span>
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

    <!-- 标签列表区域 - 与分类管理页面相同的列表样式 -->
    <el-card shadow="never" class="tags-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <span class="card-title">标签列表</span>
          <div class="card-actions">
            <el-button type="primary" @click="handleCreateTag" :loading="store.loading">
              <el-icon>
                <Plus />
              </el-icon>
              新建标签
            </el-button>
            <el-button :loading="store.loading" @click="refreshTags">
              <el-icon>
                <Refresh />
              </el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 各种状态显示 - 与分类管理页面相同 -->
      <div class="loading-container" v-if="store.loading">
        <el-skeleton :rows="5" animated />
      </div>

      <div class="error-container" v-else-if="store.error">
        <el-alert :title="`加载失败：${store.error}`" type="error" show-icon closable @close="store.clearError()" />
        <div class="error-actions">
          <el-button type="primary" @click="refreshTags">
            重试
          </el-button>
        </div>
      </div>

      <div class="empty-container" v-else-if="store.tags.length === 0">
        <el-empty description="暂无标签" />
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateTag">
            创建第一个标签
          </el-button>
        </div>
      </div>

      <!-- 标签列表内容 -->
      <div class="tags-list" v-else>
        <div class="tags-stats">
          共找到 {{ filteredTags.length }} 个标签
        </div>

        <!-- 标签项 - 使用与分类管理相同的列表样式 -->
        <div v-for="tag in paginatedTags" :key="tag.id" class="tag-item">
          <div class="tag-content">
            <!-- 标签头部：名称和颜色标识 -->
            <div class="tag-header">
              <h3 class="tag-title">
                <!-- 使用颜色圆点作为视觉标识 -->
                <span class="color-dot" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </h3>
              <!-- 文章数量标签 -->
              <el-tag type="info" size="small">
                {{ tag.articleCount }} 篇文章
              </el-tag>
            </div>

            <!-- 标签创建时间 -->
            <div class="tag-meta">
              <div class="meta-left">
                <!-- 创建时间 -->
                <span class="meta-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  创建: {{ formatDate(tag.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 - 与分类管理页面相同的按钮样式 -->
          <div class="tag-actions">
            <!-- 编辑 -->
            <el-button type="primary" link @click="handleEditTag(tag)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>

            <!-- 删除 -->
            <el-button type="danger" link @click="handleDeleteTag(tag)" :disabled="tag.articleCount > 0">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页组件 - 与分类管理页面相同 -->
      <div class="pagination-container" v-if="filteredTags.length > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
          :total="filteredTags.length" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false">
      <el-form :model="tagForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="tagForm.color" />
          <span class="color-preview-text">预览颜色</span>
          <div class="color-preview" :style="{ backgroundColor: tagForm.color }"></div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTag" :loading="submitLoading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  // ========== 导入部分 ==========
  import { computed, ref, onMounted, reactive } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import { Search, Plus, Refresh, Edit, Delete, Clock } from '@element-plus/icons-vue'

  import { useTagStore } from '@/stores/tagStore'
  import type { Tag, TagFormData } from '@/types'

  // ========== Store初始化 ==========
  const store = useTagStore()

  // ========== 响应式数据定义 ==========
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const editingTag = ref<Tag | null>(null)
  const formRef = ref<FormInstance>()

  // 标签表单数据
  const tagForm = reactive<TagFormData>({
    name: '',
    color: '#409EFF'
  })

  // 表单验证规则
  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入标签名称', trigger: 'blur' },
      { min: 1, max: 20, message: '标签名称长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    color: [
      { required: true, message: '请选择标签颜色', trigger: 'change' }
    ]
  }


  // ========== 计算属性 ==========
  const dialogTitle = computed(() =>
    editingTag.value ? '编辑标签' : '新建标签'
  )

  // 过滤后的标签列表
  const filteredTags = computed(() => {
    if (!searchKeyword.value.trim()) {
      return store.sortedTags
    }

    const keyword = searchKeyword.value.toLowerCase()
    return store.sortedTags.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
    )
  })

  // 分页后的标签列表
  const paginatedTags = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredTags.value.slice(start, end)
  })

  // 分页索引信息
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() =>
    Math.min(currentPage.value * pageSize.value, filteredTags.value.length)
  )

  // ========== 生命周期钩子 ==========
  onMounted(() => {
    console.log('🏷️ 标签管理页面已挂载，开始加载标签数据...')
    loadTags()
  })

  // ========== 核心方法函数 ==========
  /**
   * 加载标签列表
   */
  const loadTags = async () => {
    try {
      console.log('🔄 开始加载标签列表...')
      await store.fetchTags()
      console.log('✅ 标签列表加载完成，总数:', store.tags.length)
    } catch (error) {
      console.error('❌ 加载标签列表失败:', error)
    }
  }

  /**
   * 处理搜索操作
   */
  const handleSearch = () => {
    console.log('🔍 执行搜索，关键词:', searchKeyword.value)
    // 搜索时重置到第一页
    currentPage.value = 1
  }

  /**
   * 清除搜索条件
   */
  const clearSearch = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  /**
   * 清除所有筛选条件
   */
  const clearAllFilters = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  /**
   * 刷新标签列表
   */
  const refreshTags = () => {
    console.log('🔄 手动刷新标签列表')
    loadTags()
  }

  /**
   * 打开创建标签对话框
   */
  const handleCreateTag = () => {
    console.log('📝 打开创建标签对话框')
    editingTag.value = null
    resetForm()
    dialogVisible.value = true
  }

  /**
   * 打开编辑标签对话框
   */
  const handleEditTag = (tag: Tag) => {
    console.log('✏️ 编辑标签:', tag.name)
    editingTag.value = tag
    Object.assign(tagForm, {
      name: tag.name,
      color: tag.color
    })
    dialogVisible.value = true
  }

  /**
   * 提交标签表单
   */
  const handleSubmitTag = async () => {
    if (!formRef.value) return

    try {
      // 执行表单验证
      await formRef.value.validate()
      submitLoading.value = true

      if (editingTag.value) {
        // 更新标签逻辑
        console.log('🔄 更新标签:', editingTag.value.id)
        await store.updateTag(editingTag.value.id, tagForm)
        ElMessage.success('标签更新成功！')
      } else {
        // 创建标签逻辑
        console.log('🔄 创建新标签')
        const result = await store.createTag(tagForm)
        if (result) {
          ElMessage.success('标签创建成功！')
        }
      }

      // 关闭对话框并重置表单
      dialogVisible.value = false
      resetForm()

    } catch (error) {
      // 错误处理：验证失败或API错误
      if (error instanceof Error) {
        console.error('❌ 提交标签表单失败:', error)
      }
    } finally {
      // 无论成功失败，都关闭加载状态
      submitLoading.value = false
    }
  }

  /**
   * 删除标签
   */
  const handleDeleteTag = async (tag: Tag) => {
    try {
      console.log('🗑️ 删除标签:', tag.name)

      // 删除保护：如果标签下有关联文章，不允许删除
      if (tag.articleCount > 0) {
        ElMessage.warning('该标签下有关联文章，无法删除')
        return
      }

      // 确认删除对话框
      await ElMessageBox.confirm(
        `确定要删除标签「${tag.name}」吗？此操作不可恢复。`,
        '删除确认',
        {
          type: 'error',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger'
        }
      )

      // 执行删除操作
      await store.deleteTag(tag.id)
      ElMessage.success('标签删除成功！')

    } catch (error) {
      // 用户取消删除不报错
      if (error !== 'cancel') {
        console.error('❌ 删除标签失败:', error)
        ElMessage.error('删除失败，请重试')
      }
    }
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    Object.assign(tagForm, {
      name: '',
      color: '#409EFF'
    })
    // 清除表单验证状态
    formRef.value?.clearValidate()
  }

  /**
   * 处理每页显示数量变化
   */
  const handleSizeChange = (newSize: number) => {
    console.log(`📊 每页显示数量变更为: ${newSize}`)
    pageSize.value = newSize
    currentPage.value = 1 // 切换每页大小时回到第一页
  }

  /**
   * 处理当前页码变化
   */
  const handleCurrentChange = (newPage: number) => {
    console.log(`📄 页码变更为: ${newPage}`)
    currentPage.value = newPage
  }

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('日期格式化错误:', error)
      return '无效日期'
    }
  }
</script>

<style scoped lang="scss">

  // 使用与分类管理页面相同的样式结构
  .tags-page {
    @apply space-y-6;

    /* 页面标题样式 - 与分类管理页面相同 */
    .page-header {
      @apply space-y-2;

      .page-title {
        @apply text-2xl font-bold text-gray-900;
      }

      .page-description {
        @apply text-gray-500 text-sm;
      }
    }

    /* 搜索操作区域样式 - 与分类管理页面相同 */
    .search-action-section {
      .search-card {
        @apply border border-gray-200;

        .search-container {
          @apply flex justify-between items-center gap-4;

          .search-input-group {
            @apply flex gap-3 flex-1;

            .el-input {
              @apply flex-1;
              max-width: 300px;
            }
          }

          .action-buttons {
            @apply flex gap-2;
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

    /* 标签列表卡片样式 - 与分类管理页面相同 */
    .tags-card {
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

      /* 状态容器通用样式 - 与分类管理页面相同 */
      .loading-container,
      .error-container,
      .empty-container {
        @apply py-8 text-center;

        .error-actions,
        .empty-actions {
          @apply mt-4;
        }
      }

      .tags-list {
        @apply space-y-4;

        .tags-stats {
          @apply text-sm text-gray-500 mb-4;
        }

        /* 标签项 - 使用与分类管理相同的样式 */
        .tag-item {
          /* 与分类项相同的布局和样式 */
          @apply flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors;

          .tag-content {
            @apply flex-1 space-y-3;

            /* 标签头部 - 类似分类头部 */
            .tag-header {
              @apply flex items-center gap-3;

              .tag-title {
                @apply m-0 flex items-center gap-2;

                /* 颜色圆点 - 替代标签颜色标识 */
                .color-dot {
                  @apply w-3 h-3 rounded-full inline-block;
                }
              }
            }

            /* 标签元信息 - 类似分类元信息 */
            .tag-meta {
              @apply flex justify-between items-center flex-wrap gap-2;

              .meta-left {
                @apply flex items-center gap-4 flex-wrap;

                .meta-item {
                  @apply flex items-center gap-1 text-xs text-gray-500;
                }
              }
            }
          }

          /* 操作按钮 - 与分类管理页面相同 */
          .tag-actions {
            @apply flex gap-1 ml-4;
          }
        }
      }

      /* 分页容器样式 - 与分类管理页面相同 */
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

  /* CSS 媒体查询：响应式设计 - 与分类管理页面相同 */
  @media (max-width: 768px) {
    .tags-page {
      .tag-item {
        @apply flex-col items-stretch;

        .tag-actions {
          @apply ml-0 mt-3 justify-end;
        }
      }

      .search-action-section {
        .search-card {
          .search-container {
            @apply flex-col items-stretch;

            .search-input-group {
              @apply w-full;

              .el-input {
                max-width: none;
              }
            }

            .action-buttons {
              @apply justify-end;
            }
          }
        }
      }
    }
  }
</style>