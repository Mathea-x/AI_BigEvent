import api from './api'
import type { ApiResponse, Category, CategoryFormData, ListResponse } from '@/types'

// 分类服务 - 提供分类相关的 API 调用
export const categoryService = {

  // 获取分类列表
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get('/categories')
      return {
        code: 200,
        data: response.data,
        message: '获取分类列表成功',
        success: true
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return {
        code: 500,
        data: [],
        message: error instanceof Error ? error.message : '获取分类列表失败',
        success: false
      }
    }
  },

  // 根据ID获取分类
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await api.get(`/categories/${id}`)
      return {
        code: 200,
        data: response.data,
        message: '获取分类成功',
        success: true
      }

    } catch (error) {
      console.error('获取分类失败:', error)
      return {
        code: 500,
        data: null as any,
        message: error instanceof Error ? error.message : '获取分类失败',
        success: false
      }
    }
  },

  // 创建分类
  async createCategory(categoryData: CategoryFormData): Promise<ApiResponse<Category>> {
    try {
      const completeData = {
        ...categoryData,
        articleCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await api.post('/categories', completeData)

      return {
        code: 201,
        data: response.data,
        message: '创建分类成功',
        success: true
      }
    } catch (error) {
      console.error('创建分类失败:', error)
      return {
        code: 500,
        data: null as any,
        message: error instanceof Error ? error.message : '创建分类失败',
        success: false
      }
    }
  },

  // 更新分类
  async updateCategory(id: string, categoryData: Partial<CategoryFormData>): Promise<ApiResponse<Category>> {
    try {
      const updateData = {
        ...categoryData,
        updatedAt: new Date().toISOString()
      }

      const response = await api.patch(`/categories/${id}`, updateData)
      return {
        code: 200,
        data: response.data,
        message: '更新分类成功',
        success: true
      }
    } catch (error) {
      console.error('更新分类失败:', error)
      return {
        code: 500,
        data: null as any,
        message: error instanceof Error ? error.message : '更新分类失败',
        success: false
      }
    }
  },

  // 删除分类
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/categories/${id}`)
      return {
        code: 200,
        data: null,
        message: '删除分类成功',
        success: true
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      return {
        code: 500,
        data: null,
        message: error instanceof Error ? error.message : '删除分类失败',
        success: false
      }
    }
  },

  // 批量删除分类
  async batchDeleteCategories(ids: string[]): Promise<ApiResponse<null>> {
    try {
      // JSON Server 不支持批量删除，这里模拟实现
      const promises = ids.map(id => api.delete(`/categories/${id}`))
      await Promise.all(promises)

      return {
        code: 200,
        data: null,
        message: `成功删除 ${ids.length} 个分类`,
        success: true
      }
    } catch (error) {
      console.error('批量删除分类失败:', error)
      return {
        code: 500,
        data: null,
        message: error instanceof Error ? error.message : '批量删除分类失败',
        success: false
      }
    }
  }

}
