import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CategoryFormData } from '@/types'
import { categoryService } from '@/services/categoryService'

// 分类状态管理 Store
export const useCategoryStore = defineStore('category', () => {
  // ========== State ==========
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Getters ==========
  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const categoryOptions = computed(() => {
    return categories.value.map(category => ({
      label: category.name,
      value: category.name,
      color: category.color
    }))
  })

  // ========== Actions ==========
  // 获取分类列表
  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 开始获取分类列表...')
      const response = await categoryService.getCategories()

      if (response.success) {
        categories.value = response.data
        console.log(`✅ 成功获取 ${categories.value.length} 个分类`)
      } else {
        throw new Error(response.message || '获取分类列表失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 获取分类列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建分类
  const createCategory = async (categoryData: CategoryFormData): Promise<Category | null> => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 开始创建分类...', categoryData)
      const response = await categoryService.createCategory(categoryData)

      if (response.success) {
        categories.value.push(response.data)
        console.log(`✅ 成功创建分类: ${response.data.name}`)
        return response.data
      } else {
        throw new Error(response.message || '创建分类失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 创建分类失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新分类
  const updateCategory = async (id: string, categoryData: Partial<CategoryFormData>) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始更新分类 (ID: ${id})...`, categoryData)
      const response = await categoryService.updateCategory(id, categoryData)

      if (response.success) {
        const index = categories.value.findIndex(category => category.id === id)
        if (index !== -1) {
          categories.value[index] = { ...categories.value[index], ...response.data }
        }
        console.log(`✅ 成功更新分类: ${response.data.name}`)
      } else {
        throw new Error(response.message || '更新分类失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 更新分类失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  // 删除分类
  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始删除分类 (ID: ${id})...`)
      const response = await categoryService.deleteCategory(id)

      if (response.success) {
        categories.value = categories.value.filter(category => category.id !== id)
        console.log(`✅ 成功删除分类 (ID: ${id})`)
      } else {
        throw new Error(response.message || '删除分类失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error(`❌ 删除分类失败 (ID: ${id}):`, err)
    } finally {
      loading.value = false
    }
  }

  // 批量删除分类
  const batchDeleteCategories = async (ids: string[]) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 开始批量删除分类...`, ids)
      const response = await categoryService.batchDeleteCategories(ids)

      if (response.success) {
        categories.value = categories.value.filter(category => !ids.includes(category.id))
        console.log(`✅ 成功批量删除 ${ids.length} 个分类`)
      } else {
        throw new Error(response.message || '批量删除分类失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('❌ 批量删除分类失败:', err)
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
    categories,
    loading,
    error,

    // Getters
    sortedCategories,
    categoryOptions,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    batchDeleteCategories,
    clearError
  }
})