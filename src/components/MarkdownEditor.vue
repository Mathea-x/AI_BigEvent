<template>
  <div class="markdown-editor">
    <!-- 编辑器模式切换 -->
    <div class="editor-header">
      <div class="mode-tabs">
        <el-radio-group v-model="editorMode" size="small" @change="handleModeChange">
          <el-radio-button label="wysiwyg">富文本模式</el-radio-button>
          <el-radio-button label="markdown">Markdown 模式</el-radio-button>
        </el-radio-group>
      </div>

      <div class="editor-actions">
        <el-tooltip content="格式化内容" placement="top">
          <el-button size="small" @click="formatContent">
            <el-icon>
              <Sort />
            </el-icon>
            格式化
          </el-button>
        </el-tooltip>

        <el-tooltip content="插入模板" placement="top">
          <el-button size="small" @click="insertTemplate">
            <el-icon>
              <DocumentAdd />
            </el-icon>
            模板
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 编辑器内容区域 -->
    <div class="editor-content" :class="{ 'split-view': splitView }">
      <!-- Markdown 编辑模式 -->
      <div v-if="editorMode === 'markdown'" class="markdown-container">
        <!-- 分屏视图 -->
        <div v-if="splitView" class="split-panel">
          <div class="editor-panel">
            <div class="panel-header">
              <span>编辑</span>
              <el-tag size="small" type="info">Markdown</el-tag>
            </div>
            <textarea ref="markdownTextarea" v-model="markdownContent" class="markdown-textarea"
              placeholder="开始使用 Markdown 编写您的内容..." @input="handleMarkdownInput" @keydown="handleKeydown"></textarea>
          </div>

          <div class="divider" @mousedown="startResize">
            <div class="divider-handle"></div>
          </div>

          <div class="preview-panel">
            <div class="panel-header">
              <span>预览</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
            <div class="preview-content markdown-body" v-html="renderedHtml"></div>
          </div>
        </div>

        <!-- 全屏编辑模式 -->
        <div v-else class="full-panel">
          <div class="panel-header">
            <el-radio-group v-model="splitView" size="small">
              <el-radio-button :label="false">全屏编辑</el-radio-button>
              <el-radio-button :label="true">分屏预览</el-radio-button>
            </el-radio-group>
          </div>
          <textarea ref="markdownTextarea" v-model="markdownContent" class="markdown-textarea full-textarea"
            placeholder="开始使用 Markdown 编写您的内容..." @input="handleMarkdownInput" @keydown="handleKeydown"></textarea>
        </div>
      </div>

      <!-- 富文本模式 -->
      <div v-else class="wysiwyg-container">
        <TiptapEditor v-model="htmlContent" :height="editorHeight" @change="handleHtmlChange" />
      </div>
    </div>

    <!-- 编辑器状态栏 -->
    <div class="editor-footer">
      <div class="footer-left">
        <span class="word-count">
          {{ getWordCount }} 字
        </span>
        <span class="char-count">
          {{ getCharCount }} 字符
        </span>
        <span v-if="editorMode === 'markdown'" class="mode-info">
          Markdown 语法支持
        </span>
      </div>

      <div class="footer-right">
        <el-button-group size="small">
          <el-tooltip content="自动保存" placement="top">
            <el-button :type="autoSaveEnabled ? 'primary' : ''" @click="toggleAutoSave">
              <el-icon>
                <Check />
              </el-icon>
              自动保存
            </el-button>
          </el-tooltip>

          <el-tooltip content="帮助文档" placement="top">
            <el-button @click="showHelp">
              <el-icon>
                <QuestionFilled />
              </el-icon>
              帮助
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Sort,
    DocumentAdd,
    Check,
    QuestionFilled
  } from '@element-plus/icons-vue'

  import TiptapEditor from '@/components/TiptapEditor.vue'

  // ========== Props 和 Emits ==========
  interface Props {
    modelValue: string
    height?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 500
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'change': [value: string]
    'modeChange': [mode: string]
  }>()

  // ========== 响应式数据 ==========
  const editorMode = ref<'wysiwyg' | 'markdown'>('wysiwyg')
  const splitView = ref(true)
  const markdownContent = ref('')
  const htmlContent = ref('')
  const markdownTextarea = ref<HTMLTextAreaElement>()
  const editorHeight = ref(props.height)
  const autoSaveEnabled = ref(true)
  const isResizing = ref(false)

  // ========== 简化的 Markdown 解析函数 ==========
  const parseMarkdown = (text: string): string => {
    if (!text) return '<p>输入 Markdown 内容即可看到实时预览...</p>'

    let html = text

    // 处理标题
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')

    // 处理粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

    // 处理代码块
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>')

    // 处理引用
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // 处理水平线
    html = html.replace(/^---$/gim, '<hr>')

    // 处理链接
    html = html.replace(/\[([^\[]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')

    // 处理图片
    html = html.replace(/!\[([^\[]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')

    // 处理无序列表
    html = html.replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>')
    html = html.replace(/^\s*\- (.*$)/gim, '<ul><li>$1</li></ul>')
    html = html.replace(/<\/ul>\s*<ul>/gim, '')

    // 处理有序列表
    html = html.replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
    html = html.replace(/<\/ol>\s*<ol>/gim, '')

    // 处理换行 - 两个空格或反斜杠
    html = html.replace(/ {2,}\n/gim, '<br>')
    html = html.replace(/\\\n/gim, '<br>')

    // 处理段落 - 将连续的空行转换为段落
    const lines = html.split('\n')
    let inParagraph = false
    let result = ''

    for (const line of lines) {
      const trimmedLine = line.trim()

      // 如果是空行，结束当前段落
      if (!trimmedLine) {
        if (inParagraph) {
          result += '</p>'
          inParagraph = false
        }
        result += '\n'
        continue
      }

      // 如果已经是 HTML 标签，直接添加
      if (trimmedLine.startsWith('<') && (trimmedLine.endsWith('>') || trimmedLine.includes('</'))) {
        if (inParagraph) {
          result += '</p>'
          inParagraph = false
        }
        result += line + '\n'
        continue
      }

      // 如果是普通文本，包装在段落中
      if (!inParagraph) {
        result += '<p>'
        inParagraph = true
      }
      result += line + '\n'
    }

    // 关闭最后一个段落
    if (inParagraph) {
      result += '</p>'
    }

    // 清理多余的段落标签
    result = result.replace(/<p>\s*<(h[1-6]|blockquote|ul|ol|pre|hr)>/g, '<$1>')
    result = result.replace(/<\/(h[1-6]|blockquote|ul|ol|pre|hr)>\s*<\/p>/g, '</$1>')

    return result
  }

  // ========== 计算属性 ==========
  const renderedHtml = computed(() => {
    try {
      return parseMarkdown(markdownContent.value)
    } catch (error) {
      console.error('Markdown 解析错误:', error)
      return '<p style="color: red;">Markdown 解析错误，请检查语法</p>'
    }
  })

  const getWordCount = computed(() => {
    const content = editorMode.value === 'markdown' ? markdownContent.value : htmlContent.value
    // 简单的字数统计：去除 HTML 标签后计算中文字符和单词
    const text = content.replace(/<[^>]*>/g, '')
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(word => word.length > 0)
    return chineseChars.length + englishWords.length
  })

  const getCharCount = computed(() => {
    const content = editorMode.value === 'markdown' ? markdownContent.value : htmlContent.value
    return content.length
  })

  // ========== 生命周期 ==========
  onMounted(() => {
    // 初始化内容
    if (props.modelValue) {
      htmlContent.value = props.modelValue
      // 如果已有 HTML 内容，转换为 Markdown
      convertHtmlToMarkdown(props.modelValue)
    }

    // 设置自动保存
    if (autoSaveEnabled.value) {
      setupAutoSave()
    }
  })

  // ========== 监听器 ==========
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== htmlContent.value) {
      htmlContent.value = newValue
      if (editorMode.value === 'markdown') {
        convertHtmlToMarkdown(newValue)
      }
    }
  })

  // ========== 方法函数 ==========
  /**
   * 处理 Markdown 输入
   */
  const handleMarkdownInput = () => {
    // 延迟转换，避免频繁操作
    setTimeout(() => {
      convertMarkdownToHtml(markdownContent.value)
    }, 300)
  }

  /**
   * 处理 HTML 内容变化
   */
  const handleHtmlChange = (content: string) => {
    htmlContent.value = content
    emit('update:modelValue', content)
    emit('change', content)
  }

  /**
   * 将 Markdown 转换为 HTML
   */
  const convertMarkdownToHtml = (markdown: string) => {
    try {
      const newHtml = parseMarkdown(markdown)

      if (newHtml !== htmlContent.value) {
        htmlContent.value = newHtml
        emit('update:modelValue', newHtml)
        emit('change', newHtml)
      }
    } catch (error) {
      console.error('Markdown 转换错误:', error)
      ElMessage.error('Markdown 转换失败')
    }
  }

  /**
   * 将 HTML 转换为 Markdown
   * 注意：这是一个简化的转换，实际项目中应该使用专门的库如 turndown
   */
  const convertHtmlToMarkdown = (html: string) => {
    // 简化版的 HTML 转 Markdown
    let markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<hr[^>]*>/gi, '---\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, p1) => {
        return p1.replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n') + '\n'
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, p1) => {
        let count = 1
        return p1.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${count++}. $1\n`) + '\n'
      })
      .replace(/<[^>]*>/g, '') // 移除其他 HTML 标签
      .replace(/\n{3,}/g, '\n\n') // 合并多个空行
      .trim()

    markdownContent.value = markdown
  }

  /**
   * 处理编辑器模式切换
   */
  const handleModeChange = (mode: 'wysiwyg' | 'markdown') => {
    if (mode === 'markdown' && htmlContent.value) {
      // 切换到 Markdown 模式时转换内容
      convertHtmlToMarkdown(htmlContent.value)
    } else if (mode === 'wysiwyg' && markdownContent.value) {
      // 切换到富文本模式时转换内容
      convertMarkdownToHtml(markdownContent.value)
    }

    emit('modeChange', mode)
  }

  /**
   * 格式化内容
   */
  const formatContent = () => {
    if (editorMode.value === 'markdown') {
      // Markdown 格式化逻辑
      markdownContent.value = markdownContent.value
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^#\s+/gm, '# ')
        .replace(/^##\s+/gm, '## ')
        .replace(/^###\s+/gm, '### ')
        .trim()

      ElMessage.success('Markdown 已格式化')
    } else {
      ElMessage.info('富文本模式下请使用编辑器工具栏进行格式化')
    }
  }

  /**
   * 插入 Markdown 模板
   */
  const insertTemplate = () => {
    const template = `# 文章标题

## 章节一

这里是文章的主要内容...

### 子章节

- 要点一
- 要点二
- 要点三

## 章节二

更多内容...

\`\`\`javascript
// 代码示例
function hello() {
  console.log('Hello, World!')
}
\`\`\`

> 引用内容：这是重要的说明

**加粗文本** 和 *斜体文本*

---

*最后更新于 ${new Date().toLocaleDateString()}*`

    if (editorMode.value === 'markdown') {
      const textarea = markdownTextarea.value
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = markdownContent.value.substring(0, start)
        const after = markdownContent.value.substring(end)

        markdownContent.value = before + template + after

        // 恢复光标位置
        nextTick(() => {
          textarea.focus()
          textarea.setSelectionRange(start, start + template.length)
        })
      }
    } else {
      ElMessage.info('请在 Markdown 模式下使用模板功能')
    }
  }

  /**
   * 处理键盘快捷键
   */
  const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + S: 保存
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      ElMessage.info('内容已自动保存')
    }

    // Tab 键处理
    if (event.key === 'Tab' && editorMode.value === 'markdown') {
      event.preventDefault()
      const textarea = markdownTextarea.value
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        markdownContent.value = markdownContent.value.substring(0, start) + '  ' + markdownContent.value.substring(end)

        nextTick(() => {
          textarea.setSelectionRange(start + 2, start + 2)
        })
      }
    }
  }

  /**
   * 开始调整分屏大小
   */
  const startResize = (event: MouseEvent) => {
    isResizing.value = true
    const container = document.querySelector('.split-panel') as HTMLElement

    const doResize = (e: MouseEvent) => {
      if (!isResizing.value) return

      const containerRect = container.getBoundingClientRect()
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100
      container.style.setProperty('--editor-ratio', `${Math.max(30, Math.min(70, percentage))}%`)
    }

    const stopResize = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', doResize)
      document.removeEventListener('mouseup', stopResize)
    }

    document.addEventListener('mousemove', doResize)
    document.addEventListener('mouseup', stopResize)
  }

  /**
   * 设置自动保存
   */
  const setupAutoSave = () => {
    // 每30秒自动保存（实际项目中应该连接到后端）
    setInterval(() => {
      if (autoSaveEnabled.value) {
        console.log('自动保存内容...')
        // 这里可以添加实际的保存逻辑
      }
    }, 30000)
  }

  /**
   * 切换自动保存
   */
  const toggleAutoSave = () => {
    autoSaveEnabled.value = !autoSaveEnabled.value
    ElMessage.success(`自动保存 ${autoSaveEnabled.value ? '已开启' : '已关闭'}`)
  }

  /**
   * 显示帮助文档
   */
  const showHelp = () => {
    ElMessage.info('Markdown 语法帮助文档即将推出...')
  }


  // 添加默认导出
  defineExpose({})
</script>

<script lang="ts">
  // 添加命名导出支持
  export default {
    name: 'TiptapEditor'
  }
</script>

<style scoped lang="scss">
  .markdown-editor {
    @apply border border-gray-200 rounded-lg overflow-hidden;
    background: white;

    .editor-header {
      @apply flex justify-between items-center p-3 border-b border-gray-100 bg-gray-50;

      .editor-actions {
        @apply flex gap-2;
      }
    }

    .editor-content {
      @apply relative;
      height: v-bind(editorHeight + 'px');

      .markdown-container {
        @apply h-full;

        .split-panel {
          @apply flex h-full;
          --editor-ratio: 70%;

          .editor-panel {
            @apply flex-1 flex flex-col;
            width: var(--editor-ratio);

            .panel-header {
              @apply flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50 text-sm font-medium text-gray-700;
            }

            .markdown-textarea {
              @apply flex-1 w-full p-4 border-0 resize-none outline-none font-mono text-base;
              background: #fafafa;
              line-height: 1.6;
              min-height: 100%;

              &:focus {
                background: white;
              }
            }
          }

          .divider {
            @apply w-2 bg-gray-100 cursor-col-resize relative;

            &:hover {
              background: #8FAADC;
            }

            .divider-handle {
              @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full;
              background: #cbd5e1;
            }
          }

          .preview-panel {
            @apply flex-1 flex flex-col overflow-hidden;
            width: calc(100% - var(--editor-ratio));

            .panel-header {
              @apply flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50 text-sm font-medium text-gray-700;
            }

            .preview-content {
              @apply flex-1 p-4 overflow-auto;
              background: white;
            }
          }
        }

        .full-panel {
          @apply h-full flex flex-col;

          .panel-header {
            @apply px-4 py-2 border-b border-gray-100 bg-gray-50;
          }

          .full-textarea {
            @apply h-full resize-none text-base;
            min-height: 100%;
          }
        }
      }

      .wysiwyg-container {
        @apply h-full;

        /* 确保 Tiptap 编辑器填满整个容器 */
        :deep(.tiptap-editor) {
          @apply h-full;

          /* 确保编辑器内容区域填满 */
          :deep(.ProseMirror) {
            @apply h-full min-h-full;
          }
        }
      }
    }

    .editor-footer {
      @apply flex justify-between items-center px-4 py-2 border-t border-gray-100 bg-gray-50 text-sm text-gray-500;

      .footer-left {
        @apply flex gap-4;

        .word-count,
        .char-count,
        .mode-info {
          @apply font-medium;
        }
      }
    }
  }

  /* 确保整个编辑器组件在父容器中正确显示 */
  :global(.article-edit-page .editor-container) {
    @apply w-full;

    .markdown-editor {
      @apply w-full;
    }
  }

  /* Markdown 预览样式 */
  .markdown-body {
    @apply text-gray-800;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      @apply font-bold mt-6 mb-4;

      &:first-child {
        margin-top: 0;
      }
    }

    h1 {
      @apply text-2xl border-b pb-2;
      border-color: #e5e7eb;
    }

    h2 {
      @apply text-xl;
    }

    h3 {
      @apply text-lg;
    }

    p {
      @apply mb-4 leading-relaxed;
    }

    ul,
    ol {
      @apply mb-4 pl-6;
    }

    ul {
      @apply list-disc;
    }

    ol {
      @apply list-decimal;
    }

    li {
      @apply mb-1;
    }

    blockquote {
      @apply border-l-4 border-blue-200 pl-4 py-1 my-4 bg-blue-50 italic text-gray-700;
    }

    code {
      @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-600;
    }

    pre {
      @apply bg-gray-900 text-gray-100 rounded p-4 mb-4 overflow-x-auto;

      code {
        @apply bg-transparent text-inherit p-0;
      }
    }

    table {
      @apply w-full border-collapse mb-4;

      th,
      td {
        @apply border border-gray-300 p-2 text-left;
      }

      th {
        @apply bg-gray-100 font-semibold;
      }
    }

    img {
      @apply max-w-full h-auto rounded shadow-sm my-4;
    }

    a {
      @apply text-blue-600 hover:text-blue-800 underline;
    }

    hr {
      @apply my-6 border-t border-gray-300;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .markdown-editor {
      .editor-header {
        @apply flex-col gap-3 items-stretch;
      }

      .split-panel {
        @apply flex-col;

        .editor-panel,
        .preview-panel {
          width: 100% !important;
          height: 50%;
        }

        .divider {
          @apply w-full h-2 cursor-row-resize;

          .divider-handle {
            @apply w-8 h-1 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
          }
        }
      }
    }
  }
</style>