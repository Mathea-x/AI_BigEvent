<template>
  <div class="tiptap-editor">
    <!-- 编辑器菜单栏 -->
    <div v-if="editor" class="editor-menu">
      <!-- 文本格式 -->
      <div class="menu-group">
        <el-button-group>
          <el-button size="small" :type="editor.isActive('bold') ? 'primary' : ''"
            @click="editor.chain().focus().toggleBold().run()">
            <strong>粗体</strong>
          </el-button>
          <el-button size="small" :type="editor.isActive('italic') ? 'primary' : ''"
            @click="editor.chain().focus().toggleItalic().run()">
            <em>斜体</em>
          </el-button>
          <el-button size="small" :type="editor.isActive('strike') ? 'primary' : ''"
            @click="editor.chain().focus().toggleStrike().run()">
            <s>删除线</s>
          </el-button>
        </el-button-group>
      </div>

      <!-- 标题和段落 -->
      <div class="menu-group">
        <el-select v-model="currentHeading" size="small" placeholder="段落" style="width: 120px"
          @change="handleHeadingChange">
          <el-option label="正文" value="paragraph" />
          <el-option label="标题 1" value="h1" />
          <el-option label="标题 2" value="h2" />
          <el-option label="标题 3" value="h3" />
        </el-select>
      </div>

      <!-- 列表 -->
      <div class="menu-group">
        <el-button-group>
          <el-button size="small" :type="editor.isActive('bulletList') ? 'primary' : ''"
            @click="editor.chain().focus().toggleBulletList().run()">
            无序列表
          </el-button>
          <el-button size="small" :type="editor.isActive('orderedList') ? 'primary' : ''"
            @click="editor.chain().focus().toggleOrderedList().run()">
            有序列表
          </el-button>
        </el-button-group>
      </div>

      <!-- 代码和引用 -->
      <div class="menu-group">
        <el-button-group>
          <el-button size="small" :type="editor.isActive('codeBlock') ? 'primary' : ''"
            @click="editor.chain().focus().toggleCodeBlock().run()">
            代码块
          </el-button>
          <el-button size="small" :type="editor.isActive('blockquote') ? 'primary' : ''"
            @click="editor.chain().focus().toggleBlockquote().run()">
            引用
          </el-button>
        </el-button-group>
      </div>

      <!-- 插入功能 -->
      <div class="menu-group">
        <el-button-group>
          <el-button size="small" @click="addTable">
            插入表格
          </el-button>
          <el-button size="small" @click="addImage">
            插入图片
          </el-button>
          <el-button size="small" @click="insertTemplate">
            插入模板
          </el-button>
        </el-button-group>
      </div>

      <!-- 操作按钮 -->
      <div class="menu-group">
        <el-button-group>
          <el-button size="small" @click="editor.chain().focus().undo().run()">
            撤销
          </el-button>
          <el-button size="small" @click="editor.chain().focus().redo().run()">
            重做
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 编辑器内容区域 -->
    <editor-content :editor="editor" class="editor-content" :style="{ minHeight: editorHeight + 'px' }" />

    <!-- 上传状态提示 -->
    <div v-if="uploading" class="upload-status">
      <el-alert title="图片上传中..." type="info" :closable="false" show-icon />
    </div>

    <!-- 字数统计 -->
    <div class="editor-footer">
      <div class="word-count">
        字数统计:
        <span class="count">{{ characterCount }}</span> 字符 |
        <span class="count">{{ wordCount }}</span> 单词
      </div>
      <div class="editor-tips">
        💡 提示: 支持 Markdown 快捷输入，输入 / 查看可用命令
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { Image } from '@tiptap/extension-image'
  import { Table } from '@tiptap/extension-table'
  import { TableRow } from '@tiptap/extension-table-row'
  import { TableHeader } from '@tiptap/extension-table-header'
  import { TableCell } from '@tiptap/extension-table-cell'
  import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
  import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { createLowlight } from 'lowlight'
  import css from 'highlight.js/lib/languages/css'
  import javascript from 'highlight.js/lib/languages/javascript'
  import typescript from 'highlight.js/lib/languages/typescript'
  import xml from 'highlight.js/lib/languages/xml'

  // 创建 lowlight 实例并注册语言
  const lowlight = createLowlight()
  lowlight.register('css', css)
  lowlight.register('javascript', javascript)
  lowlight.register('typescript', typescript)
  lowlight.register('html', xml)

  interface Props {
    modelValue: string
    height?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    height: 400
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'change': [value: string]
  }>()

  // 响应式数据
  const uploading = ref(false)
  const currentHeading = ref('paragraph')
  const editorHeight = ref(props.height)

  // 编辑器初始化
  const editor = useEditor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
          style: 'max-width: 100%; height: auto; border-radius: 4px;'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block'
        }
      }),
    ],
    onUpdate: () => {
      if (editor.value) {
        const html = editor.value.getHTML()
        emit('update:modelValue', html)
        emit('change', html)
        updateCurrentHeading()
      }
    },
    onCreate: () => {
      updateCurrentHeading()
    },
  })

  // 计算属性
  const characterCount = computed(() => {
    if (!editor.value) return 0
    return editor.value.storage.characterCount?.characters() || 0
  })

  const wordCount = computed(() => {
    if (!editor.value) return 0
    const text = editor.value.getText()
    return text.trim() ? text.trim().split(/\s+/).length : 0
  })

  // 类型安全检查的方法
  const updateCurrentHeading = () => {
    if (!editor.value) return

    if (editor.value.isActive('heading', { level: 1 })) {
      currentHeading.value = 'h1'
    } else if (editor.value.isActive('heading', { level: 2 })) {
      currentHeading.value = 'h2'
    } else if (editor.value.isActive('heading', { level: 3 })) {
      currentHeading.value = 'h3'
    } else {
      currentHeading.value = 'paragraph'
    }
  }

  const handleHeadingChange = (value: string) => {
    if (!editor.value) return

    switch (value) {
      case 'h1':
        editor.value.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        editor.value.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.value.chain().focus().toggleHeading({ level: 3 }).run()
        break
      default:
        editor.value.chain().focus().setParagraph().run()
        break
    }
  }

  const addTable = () => {
    if (editor.value) {
      editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  const addImage = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file && editor.value) {
          if (file.size > 5 * 1024 * 1024) {
            ElMessage.error('图片大小不能超过 5MB')
            return
          }

          uploading.value = true
          try {
            const base64 = await fileToBase64(file)
            editor.value.chain().focus().setImage({ src: base64 }).run()
            ElMessage.success('图片插入成功')
          } catch (error) {
            console.error('图片上传失败:', error)
            ElMessage.error('图片上传失败')
          } finally {
            uploading.value = false
          }
        }
      }

      input.click()
    } catch (error) {
      console.error('图片选择错误:', error)
      ElMessage.error('图片选择失败')
    }
  }

  const insertTemplate = () => {
    const template = `<h2>文章标题</h2>
<p>这里是文章的开头部分...</p>

<h3>章节一</h3>
<p>详细内容描述...</p>

<h3>章节二</h3>
<ul>
  <li>要点一</li>
  <li>要点二</li>
  <li>要点三</li>
</ul>

<blockquote>
  <p>重要提示或引用内容</p>
</blockquote>

<pre><code class="language-javascript">// 代码示例
function example() {
  console.log('Hello World!');
}</code></pre>`

    if (editor.value) {
      editor.value.chain().focus().insertContent(template).run()
      ElMessage.info('已插入内容模板')
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // 监听外部数据变化
  watch(() => props.modelValue, (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
      editor.value.commands.setContent(newValue, { emitUpdate: false })
    }
  })

  // 组件销毁时清理
  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy()
    }
  })

  // 添加默认导出
  defineExpose({})
</script>

<style scoped lang="scss">
  .tiptap-editor {
    @apply border border-gray-200 rounded-lg overflow-hidden;
  }

  .editor-menu {
    @apply flex flex-wrap gap-3 p-4 border-b border-gray-200 bg-gray-50;
  }

  .menu-group {
    @apply flex items-center;
  }

  .editor-content {
    @apply p-6 overflow-y-auto bg-white;

    :deep(.ProseMirror) {
      @apply outline-none min-h-[300px];

      // 标题样式
      h1 {
        @apply text-3xl font-bold mb-4 text-gray-900;
      }

      h2 {
        @apply text-2xl font-bold mb-3 text-gray-800;
      }

      h3 {
        @apply text-xl font-bold mb-2 text-gray-700;
      }

      // 段落样式
      p {
        @apply mb-4 text-gray-700 leading-relaxed;
      }

      // 列表样式
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

      // 代码样式
      code {
        @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-600;
      }

      pre {
        @apply bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto;

        code {
          @apply bg-transparent text-inherit p-0 text-sm;
        }
      }

      // 引用样式
      blockquote {
        @apply border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700;
      }

      // 表格样式
      table {
        @apply w-full border-collapse mb-4;

        th,
        td {
          @apply border border-gray-300 p-3 text-left;
        }

        th {
          @apply bg-gray-100 font-semibold;
        }
      }

      // 图片样式
      img {
        @apply max-w-full h-auto rounded-lg shadow-sm my-4;
      }

      // 选中状态
      &.ProseMirror-focused {
        // 可以添加焦点样式
      }
    }
  }

  .upload-status {
    @apply px-4 py-2 border-t border-gray-200;
  }

  .editor-footer {
    @apply flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm;
  }

  .word-count {
    @apply text-gray-600;

    .count {
      @apply font-mono font-semibold text-blue-600;
    }
  }

  .editor-tips {
    @apply text-gray-500 text-xs;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .editor-menu {
      @apply flex-col items-stretch gap-2;
    }

    .menu-group {
      @apply justify-center;
    }

    .editor-footer {
      @apply flex-col gap-2 items-stretch;
    }
  }
</style>

<script lang="ts">
  // 添加命名导出支持
  export default {
    name: 'TiptapEditor'
  }
</script>