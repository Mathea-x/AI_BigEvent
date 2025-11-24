import api from './api'
import type { ApiResponse, Tag, TagFormData } from '@/types'

// 标签服务 - 提供标签相关的 API 调用
export const tagService = {
  //获取标签列表
  async getTags(): Promise<ApiResponse<Tag[]>> {
    try {
      const response = await api.get('/tags')
      return {
        code: 200,
        data: response.data,
        message: '获取标签列表成功',
        success: true
      }
    } catch (error) {
      console.error('获取标签列表失败:', error)
      return {
        code: 500,
        data: [],
        message: error instanceof Error ? error.message : '获取标签列表失败',
        success: false
      }
    }
  },

  // 创建标签
  async createTag(tagData: TagFormData): Promise<ApiResponse<Tag>> {
    try {
      const completeData = {
        ...tagData,
        articleCount: 0,
        createdAt: new Date().toISOString()
      }

      const response = await api.post('/tags', completeData)
      return {
        code: 201,
        data: response.data,
        message: '创建标签成功',
        success: true
      }
    } catch (error) {
      console.error('创建标签失败:', error)
      return {
        code: 500,
        data: null as any,
        message: error instanceof Error ? error.message : '创建标签失败',
        success: false
      }
    }
  },

  // 更新标签
  async updateTag(id: string, tagData: Partial<TagFormData>): Promise<ApiResponse<Tag>> {
    try {
      const response = await api.patch(`/tags/${id}`, tagData)
      return {
        code: 200,
        data: response.data,
        message: '更新标签成功',
        success: true
      }
    } catch (error) {
      console.error('更新标签失败:', error)
      return {
        code: 500,
        data: null as any,
        message: error instanceof Error ? error.message : '更新标签失败',
        success: false
      }
    }
  },

  // 删除标签
  async deleteTag(id: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/tags/${id}`)
      return {
        code: 200,
        data: null,
        message: '删除标签成功',
        success: true
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      return {
        code: 500,
        data: null,
        message: error instanceof Error ? error.message : '删除标签失败',
        success: false
      }
    }
  },

  // 批量删除标签
  async batchDeleteTags(ids: string[]): Promise<ApiResponse<null>> {
    try {
      const promises = ids.map(id => api.delete(`/tags/${id}`))
      await Promise.all(promises)

      return {
        code: 200,
        data: null,
        message: `成功删除 ${ids.length} 个标签`,
        success: true
      }
    } catch (error) {
      console.error('批量删除标签失败:', error)
      return {
        code: 500,
        data: null,
        message: error instanceof Error ? error.message : '批量删除标签失败',
        success: false
      }
    }
  }
}