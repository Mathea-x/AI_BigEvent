<template>
  <!-- 整个根页面 -->
  <div class="article-edit-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">{{ isEditMode ? '编辑文章' : '创建文章' }}</h2>
      <p class="page-description">
        {{ isEditMode ? '修改您的文章内容' : '创建新的文章内容' }}
      </p>
    </div>

    <!-- 编辑表单 -->
    <el-card class="edit-form-card" shadow="never">
      <el-form class="article-form" label-width="100px" ref="formRef" :model="formData" :rules="formRules">
        <!-- 文章标题 -->
        <el-form-item label="文章标题" prop="title">
          <el-input placeholder="请输入文章标题" maxlength="100" show-word-limit clearable v-model="formData.title"
            :id="fieldIds.title" />
        </el-form-item>

        <!-- 文章分类 -->
        <el-form-item label="文章分类" prop="category">
          <el-select placeholder="请选择文章分类" style="width: 100%" v-model="formData.category">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.name"
              :id="fieldIds.category" />
          </el-select>
        </el-form-item>

        <!-- 文章标签 -->
        <el-form-item label="文章标签" prop="tags">
          <el-select placeholder="请选择或输入文章标签" multiple filterable allow-create default-first-option style="width: 100%"
            v-model="formData.tags" :id="fieldIds.tags">
            <el-option v-for="tag in availableTags" :key="tag.id" :label="tag.name" :value="tag.name" />
          </el-select>
        </el-form-item>

        <!-- 文章摘要 -->
        <el-form-item label="文章摘要" prop="summary">
          <el-input type="textarea" :rows="3" placeholder="请输入文章摘要（可选）" maxlength="200" show-word-limit
            v-model="formData.summary" :id="fieldIds.summary" />
        </el-form-item>

        <!-- 文章内容 -->
        <el-form-item label="文章内容" prop="content">
          <div class="editor-container">
            <!-- 使用新的 Markdown 编辑器 -->
            <MarkdownEditor v-model="formData.content" :height="500" @change="handleContentChange"
              @modeChange="handleEditorModeChange" />
          </div>
        </el-form-item>

        <!-- 文章状态 -->
        <el-form-item label="文章状态" prop="status">
          <!-- 单选框组 -->
          <el-radio-group v-model="formData.status" :id="fieldIds.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <!-- 主要操作按钮 -->
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEditMode ? '更新文章' : '创建文章' }}
          </el-button>

          <!-- 草稿保存按钮（编辑模式） -->
          <el-button :loading="loading" @click="handleSaveDraft" v-if="isEditMode">
            保存草稿
          </el-button>

          <!-- 取消按钮 -->
          <el-button @click="handleCancel">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI 助手面板 -->
    <el-card class="ai-assistant-card" shadow="never">
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <el-icon>
            <Star />
          </el-icon>
          <span>AI 写作助手</span>
        </div>
      </template>

      <!-- AI功能 -->
      <div class="ai-actions">
        <!-- 总结摘要 -->
        <el-button type="text" @click="generateSummary">
          <el-icon>
            <ChatLineRound />
          </el-icon>
          生成摘要
        </el-button>

        <!-- 标签推荐 -->
        <el-button type="text" @click="suggestTags">
          <el-icon>
            <PriceTag />
          </el-icon>
          推荐标签
        </el-button>

        <el-button type="text" @click="improveWriting">
          <el-icon>
            <EditPen />
          </el-icon>
          优化写作
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useArticleStore } from '@/stores/articleStore'
import { Article, ArticleFormData } from '@/types'
import { DocumentAdd, Star, ChatLineRound, PriceTag, EditPen } from '@element-plus/icons-vue'
import { ElMessage, type FormRules, type FormInstance, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TiptapEditor from '@/components/TiptapEditor.vue'

import MarkdownEditor from '@/components/MarkdownEditor.vue'


// ========== 路由和Store初始化 ==========
const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

// ========== 动态 ID 生成 ==========
// 生成ID：使用时间戳确保在同一页面的多个实例中 ID 唯一
const formIdPrefix = `article-form-${Date.now()}-`
  const fieldIds = {
    title: `${formIdPrefix}title`,
    category: `${formIdPrefix}category`,
    tags: `${formIdPrefix}tags`,
    summary: `${formIdPrefix}summary`,
    content: `${formIdPrefix}content`,
    status: `${formIdPrefix}status`
  }

// ========== 响应式数据 ==========
// 加载状态
const loading = ref(false)

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<ArticleFormData>({
  title: '',
  content: '',
  summary: '',
  tags: [],
  category: '',
  status: 'draft'
})

// 表单验证
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    {
      required: true,
      message: '请输入文章内容',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入文章内容'))
          return
        }

        // 去除HTML标签计算纯文本长度
        const text = value.replace(/<[^>]*>/g, '')
        const cleanText = text.replace(/\s/g, '') // 去除所有空白字符

        if (cleanText.length < 10) {
          callback(new Error('内容至少需要10个有效字符'))
        } else {
          callback()
        }
      }
    }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  tags: [
    { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
  ]
}

// 文章分类
const categories = ref([
  { id: '1', name: '技术' },
  { id: '2', name: '生活' },
  { id: '3', name: '学习' },
  { id: '4', name: '系统' }
])

// 文章标签
const availableTags = ref([
  { id: '1', name: 'Vue' },
  { id: '2', name: 'TypeScript' },
  { id: '3', name: '前端' },
  { id: '4', name: 'JavaScript' },
  { id: '5', name: 'React' },
  { id: '6', name: 'Node.js' },
  { id: '7', name: 'CSS' },
  { id: '8', name: '学习' },
  { id: '9', name: '效率' },
  { id: '10', name: '健康' }
])

// ========== 计算属性 ==========
const isEditMode = computed(() => route.name === 'ArticleEdit')
const articleId = computed(() => route.params.id as string)

// ========== 生命周期 ==========
onMounted(() => {
  console.log('📝 文章编辑页面已加载，模式:', isEditMode.value)
  if (isEditMode.value) {
    // 编辑模式
    loadArticleData()
  } else {
    // 创建模式：默认值
    formData.category = '技术'
    formData.tags = ['技术']
  }
})

// ========== 方法函数 ==========

/** 加载文章数据（编辑模式）,将数据填充到表单 **/
const loadArticleData = async () => {
  // 验证文章ID的有效性
  if (!articleId.value) {
    ElMessage.error('文章ID无效')
    router.push('/articles')
    return
  }
  // 加载
  loading.value = true
  try {
    console.log(`📥 加载文章数据，ID: ${articleId.value}`)
    // 获取文章详情
    await articleStore.fetchArticleById(articleId.value)

    // 检查是否成功获取文章数据
    if (articleStore.currentArticle) {

      const article = articleStore.currentArticle

      console.log(`📥 获取文章数据: ${article}`)
      console.log(`📥 获取文章标题: ${article.title}`)

      Object.assign(formData, {
        title: article.title,
        content: article.content,
        // 处理可能的undefined值
        summary: article.summary || '',  
        tags: article.tags,
        category: article.category,
        status: article.status
      })
      console.log('✅ 文章数据加载成功')
    } else {
      throw new Error('文章不存在')
    }
  } catch (error) {
    console.error('❌ 加载文章数据失败:', error)
    ElMessage.error('加载文章失败')
    // 出错时跳转回列表
    router.push('/articles')  
  } finally {
    // 无论成功失败，都结束加载状态
    loading.value = false
  }
}

// 更新内容变化处理
const handleContentChange = (content: string) => {
  console.log('内容已更新，HTML字符数:', content.length)
  // 这里可以添加自动保存草稿的逻辑
}

// 添加编辑器模式变化处理
const handleEditorModeChange = (mode: string) => {
  console.log(`编辑器模式切换为: ${mode}`)
  // 这里可以添加模式切换时的特殊处理
}

// 插入内容模板
const insertTemplate = () => {
  const template = `# 文章标题

## 章节一

这里是文章内容...

## 章节二

更多内容...

### 小结

- 要点一
- 要点二
- 要点三

---
*最后更新于 ${new Date().toLocaleDateString()}*`
  // 如何插入模板
  formData.content = formData.content ? formData.content + '\n\n' + template : template
  ElMessage.info('已插入内容模板')
}

// 格式化内容
const formatContent = () => {
  // 格式化逻辑：合并多个连续空行为两个空行，去除首尾空白字符
  formData.content = formData.content
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  ElMessage.info('内容已格式化')
}

/** 表单提交：表单验证，调用API，处理结果 **/ 
const handleSubmit = async () => {
  if (!formRef.value) return

  // 1、表单验证
  try {
    await formRef.value.validate()
    console.log('✅ 表单验证通过')
  } catch (error) {
    console.log('❌ 表单验证失败')
    ElMessage.warning('请完善表单信息')
    return  // 验证失败，停止执行
  } 
  
  // 2、提交数据
  loading.value = true

  try {
    if (isEditMode.value) {
      // 编辑模式
      console.log('🔄 更新文章:', formData)
      await articleStore.updateArticle(articleId.value, formData)
      ElMessage.success('文章更新成功')
    } else {
      // 创建模式
      console.log('🔄 创建文章:', formData)
      const articleId = await articleStore.createArticle(formData)
      if (articleId) {
        ElMessage.success('文章创建成功')
      }
    }
    // 3、成功处理 - 跳转回文章列表
    router.push('/articles')
  } catch (error) {
    // 错误处理：显示用户友好的错误信息
    console.error('❌ 保存文章失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    // 清理工作：无论成功失败，都结束加载状态
    loading.value = false
  }
}

/* 保存草稿（编辑模式） */
const handleSaveDraft = async () => {
  if (!formRef.value) return

  // 基本验证
  if (!formData.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!formData.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  loading.value = true

  try {
    console.log('💾 保存草稿:', formData)
    await articleStore.updateArticle(articleId.value, {
      ...formData,
      status: 'draft'
    })
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('❌ 保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    loading.value = false
  }
}

/* 取消编辑/创建 */
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要离开吗？未保存的更改将会丢失。',  // 提示信息
      '确认离开',                             // 标题
      {
        type: 'warning',                      // 警告类型
        confirmButtonText: '确定离开',         // 确认按钮文本
        cancelButtonText: '继续编辑'           // 取消按钮文本
      }
    )
    // 用户确认离开，跳转回文章列表
    router.push('/articles')
  } catch (error) {
    // 用户点击取消或关闭对话框，不做任何操作
    console.log('用户取消离开')
  }
}

// ========== AI 功能占位符（后续实现） ==========

// 生成文章摘要
const generateSummary = () => {
  ElMessage.info('AI摘要生成功能待实现')
}

// 推荐标签
const suggestTags = () => {
  ElMessage.info('AI标签推荐功能待实现')
}

// 优化写作
const improveWriting = () => {
  ElMessage.info('AI写作优化功能待实现')
}

</script>

<style scoped lang="scss">
  .article-edit-page {
    @apply space-y-6;
  }

  .page-header {
    @apply space-y-2;
    /* Tailwind CSS：子元素垂直间距 */

    .page-title {
      @apply text-2xl font-bold text-gray-900;
      /* Tailwind CSS：文本样式 */
    }

    .page-description {
      @apply text-gray-500 text-sm;
      /* Tailwind CSS：次要文本样式 */
    }
  }

  .edit-form-card,
  .ai-assistant-card {
    @apply border border-gray-200;
    /* Tailwind CSS：边框样式 */
  }

  .article-form {
    @apply max-w-4xl;
    /* Tailwind CSS：最大宽度，避免表单过宽 */
  }

  .editor-container {
    @apply space-y-3;
    /* Tailwind CSS：内部元素间距 */
  }

  .editor-toolbar {
    /* 
   * 编辑器工具栏样式
   * 使用 Flex 布局实现左右对齐
   */
    @apply flex justify-between items-center py-2 px-3 bg-gray-50 rounded border;

    .toolbar-left {
      @apply flex gap-2;
      /* Tailwind CSS：Flex 布局和间距 */
    }

    .toolbar-right {
      @apply text-sm text-gray-500;
      /* Tailwind CSS：次要文本样式 */
    }
  }

  .word-count {
    @apply font-mono;
    /* Tailwind CSS：等宽字体，适合显示数字 */
  }

  .form-actions {
    /*
   * 表单操作区域样式
   * 顶部边框和内边距，与表单内容区分
   */
    @apply pt-6 border-t border-gray-100;
  }

  .ai-assistant-card {
    .card-header {
      /* AI助手卡片头部样式 */
      @apply flex items-center gap-2 text-purple-600;
      /* Tailwind CSS：Flex 对齐和颜色 */
    }

    .ai-actions {
      /* AI操作按钮布局 */
      @apply flex gap-4 justify-center;
    }
  }

  /* CSS 媒体查询：响应式设计 */
  @media (max-width: 768px) {
    .editor-toolbar {
      /*
     * 移动端：工具栏改为垂直布局
     */
      @apply flex-col gap-2 items-stretch;
    }

    .ai-actions {
      /*
     * 移动端：AI操作按钮改为垂直布局
     */
      @apply flex-col;
    }
  }
</style>