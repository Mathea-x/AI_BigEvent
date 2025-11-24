import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag, TagFormData } from '@/types'
import { tagService } from '@/services/tagService'

// 标签状态管理 Store
export const useTagStore = defineStore('tag', () => {
  // ========== State ==========
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Getters ==========
  const sortedTags = computed(() => {
    return [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const tagOptions = computed(() => {
    return tags.value.map(tag => ({
      label: tag.name,
      value: tag.name,
      color: tag.color
    }))
  })

  // ========== Actions ==========
  // 获取标签列表
  const fetchTags = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 开始获取标签列表...')
      const response = await tagService.getTags()

      if (response.success) {
        tags.value = response.data
        console.log(`✅ 成功获取 ${tags.value.length} 个标签`)
      } else {
        throw new Error(response.message || '获取标签列表失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 获取标签列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建标签
  const createTag = async (tagData: TagFormData): Promise<Tag | null> => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 开始创建标签...', tagData)
      const response = await tagService.createTag(tagData)

      if (response.success) {
        tags.value.push(response.data)
        console.log(`✅ 成功创建标签: ${response.data.name}`)
        return response.data
      } else {
        throw new Error(response.message || '创建标签失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 创建标签失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新标签
  const updateTag = async (id: string, tagData: Partial<TagFormData>) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始更新标签 (ID: ${id})...`, tagData)
      const response = await tagService.updateTag(id, tagData)

      if (response.success) {
        const index = tags.value.findIndex(tag => tag.id === id)
        if (index !== -1) {
          tags.value[index] = { ...tags.value[index], ...response.data }
        }
        console.log(`✅ 成功更新标签: ${response.data.name}`)
      } else {
        throw new Error(response.message || '更新标签失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 更新标签失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  // 删除标签
  const deleteTag = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始删除标签 (ID: ${id})...`)
      const response = await tagService.deleteTag(id)

      if (response.success) {
        tags.value = tags.value.filter(tag => tag.id !== id)
        console.log(`✅ 成功删除标签 (ID: ${id})`)
      } else {
        throw new Error(response.message || '删除标签失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 删除标签失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  // 批量删除标签
  const batchDeleteTags = async (ids: string[]) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始批量删除标签...`, ids)
      const response = await tagService.batchDeleteTags(ids)

      if (response.success) {
        tags.value = tags.value.filter(tag => !ids.includes(tag.id))
        console.log(`✅ 成功批量删除 ${ids.length} 个标签`)
      } else {
        throw new Error(response.message || '批量删除标签失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 批量删除标签失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    tags,
    loading,
    error,

    // Getters
    sortedTags,
    tagOptions,

    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    batchDeleteTags,
    clearError
  }
})