// 文章相关的API服务
import api from './api'
import type { Article, ApiResponse, PaginationParams, ListResponse } from '@/types'

// 文章服务类 —— 封装所有文章相关的 API 调用
class ArticleService {
    /* 获取文章列表
    *  @param params 分页和查询参数
    *  @returns 文章列表和分页信息 */
    async getArticles(params?: PaginationParams & { keyword?: string; status?: string; category?: string }): Promise<ApiResponse<ListResponse<Article>>> {
        try {
            console.log('🔍 发送文章列表请求，参数:', params)

            const allResponse = await api.get('/articles')
            let allArticles = allResponse.data
            console.log('📥 获取到的所有文章:', allArticles.length, '篇')

            // 客户端搜索（因为 JSON Server 的 q 参数搜索不够准确）
            if (params?.keyword && params.keyword.trim()) {
                const keyword = params.keyword.toLowerCase().trim()
                allArticles = allArticles.filter((article: Article) => {
                    // 安全地访问可能为 undefined 的字段
                    const title = article.title ? article.title.toLowerCase() : ''
                    const content = article.content ? article.content.toLowerCase() : ''
                    const summary = article.summary ? article.summary.toLowerCase() : ''
                    const tags = article.tags || []

                    return (
                        title.includes(keyword) ||
                        content.includes(keyword) ||
                        summary.includes(keyword) ||
                        tags.some(tag => tag.toLowerCase().includes(keyword))
                    )
                })
                console.log(`🔍 客户端搜索完成，找到 ${allArticles.length} 篇文章`)
            }

            // 客户端状态筛选
            if (params?.status && params.status.trim()) {
                allArticles = allArticles.filter((article: Article) => article.status === params.status)
                console.log(`📊 状态筛选 [${params.status}] 完成，找到 ${allArticles.length} 篇文章`)
            }

            // 客户端分类筛选
            if (params?.category && params.category.trim()) {
                allArticles = allArticles.filter((article: Article) => article.category === params.category)
                console.log(`📂 分类筛选 [${params.category}] 完成，找到 ${allArticles.length} 篇文章`)
            }

            // 客户端分页
            const total = allArticles.length
            const page = params?.page || 1
            const pageSize = params?.pageSize || 10
            const startIndex = (page - 1) * pageSize
            const endIndex = startIndex + pageSize
            const paginatedArticles = allArticles.slice(startIndex, endIndex)

            console.log(`📊 分页结果: 第 ${page} 页，每页 ${pageSize} 条，总共 ${total} 条`)
            console.log('✅ 分页后文章:', paginatedArticles)

            return {
                code: 200,
                data: {
                    list: paginatedArticles,
                    total: total,
                    page: page,
                    pageSize: pageSize
                },
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error('获取文章列表失败：', error)

            // 提供更详细的错误信息
            if (error.response) {
                console.error('响应错误:', error.response.status, error.response.data)
            } else if (error.request) {
                console.error('请求错误: 无法连接到服务器')
            } else {
                console.error('错误:', error.message)
            }

            throw error
        }
    }

    /* 根据 ID 获取单个文章详情
    *  @param id 文章 ID
    *  @returns 文章详情 */
    async getArticleById(id: string): Promise<ApiResponse<Article>> {
        try {
            console.log(`🔍 发送文章详情请求，ID: ${id}`)
            const response = await api.get(`/articles/${id}`)
            console.log('✅ 文章详情响应:', response.data)

            return {
                code: 200,
                data: response.data,
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error(`获取文章详情失败（ID：${id}）：`, error)
            throw error
        }
    }

    /* 创建新文章
    *  @param article 文章数据（不包含 id）
    *  @returns 创建后的文章数据 */
    async createArticle(article: Omit<Article, 'id'>): Promise<ApiResponse<Article>> {
        try {
            console.log('📝 发送创建文章请求:', article)
            
            // 生成随机 ID（JSON Server 会自动生成，但我们也可以自己设置）
            const id = Date.now().toString()

            // 为新建的文章添加时间戳
            const articleWithTimestamps = {
                ...article,
                id: id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                likes: 0
            }

            const response = await api.post('articles', articleWithTimestamps)
            console.log('✅ 创建文章响应:', response.data)

            return {
                code: 200,
                data: response.data,
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error('创建文章失败：', error)
            throw error
        }
    }

    /* 更新文章
    *  @param id 文章 ID
    *  @param article 要更新的文章数据
    *  @returns 更新后的文章数据 */
    async updateArticle(id: string, article: Partial<Article>): Promise<ApiResponse<Article>> {
        try {
            console.log(`✏️ 发送更新文章请求，ID: ${id}`, article)

            // 更新时只更新 updatedAt 字段
            const articleWithUpdateTime = {
                ...article,
                updatedAt: new Date().toISOString()
            }

            const response = await api.put(`/articles/${id}`, articleWithUpdateTime)
            console.log('✅ 更新文章响应:', response.data)

            return {
                code: 200,
                data: response.data,
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error(`更新文章失败（ID：${id}）：`, error)
            throw error
        }
    }

    /* 删除文章
    *  @param id 文章 ID
    *  @returns 删除操作结果 */
    async deleteArticle(id: string): Promise<ApiResponse<void>> {
        try {
            console.log(`🗑️ 发送删除文章请求，ID: ${id}`)
            await api.delete(`/articles/${id}`)
            console.log('✅ 删除文章成功')

            return {
                code: 200,
                data: undefined,
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error(`删除文章失败（ID：${id}）：`, error)
            throw error
        }
    }

    /* 搜索文章
    *  @param keyword 搜索关键词
    *  @returns 匹配的文章列表 */
    async searchArticles(keyword: string): Promise<ApiResponse<Article[]>> {
        try {
            console.log(`🔍 发送搜索文章请求，关键词: ${keyword}`)

            // 获取所有文章
            const response = await api.get('/articles')
            let allArticles = response.data

            // 客户端搜索
            if (keyword.trim()) {
                const searchTerm = keyword.toLowerCase().trim()
                allArticles = allArticles.filter((article: Article) => {
                    // 安全地访问可能为 undefined 的字段
                    const title = article.title ? article.title.toLowerCase() : ''
                    const content = article.content ? article.content.toLowerCase() : ''
                    const summary = article.summary ? article.summary.toLowerCase() : ''
                    const tags = article.tags || []

                    return (
                        title.includes(searchTerm) ||
                        content.includes(searchTerm) ||
                        summary.includes(searchTerm) ||
                        tags.some(tag => tag.toLowerCase().includes(searchTerm))
                    )
                })
            }

            console.log(`✅ 搜索完成，找到 ${allArticles.length} 篇文章`)

            return {
                code: 200,
                data: allArticles,
                message: 'success',
                success: true
            }
        } catch (error: any) {
            console.error(`搜索文章失败（关键词：${keyword}）：`, error)
            throw error
        }
    }
}

// 导出单例实例
export const articleService = new ArticleService()