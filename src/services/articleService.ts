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

            // 注意：这里不再重复设置时间戳，因为 Store 已经设置了
            const response = await api.post('/articles', article)
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

            // 注意：这里不再重复设置更新时间，因为 Store 已经设置了
            const response = await api.patch(`/articles/${id}`, article)
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

    /**
     * 增加文章阅读量
     * @param id 文章ID */
    async incrementViewCount(id: string): Promise<ApiResponse<Article>> {
        try {
            console.log(`📊 增加文章阅读量: ${id}`)

            // 首先获取当前文章
            const currentArticleResponse = await api.get(`/articles/${id}`)
            if (!currentArticleResponse.data) {
                throw new Error('文章不存在')
            }

            const currentArticle = currentArticleResponse.data
            const updatedViews = (currentArticle.views || 0) + 1

            // 更新文章阅读量
            const response = await api.patch(`/articles/${id}`, {
                views: updatedViews
            })

            console.log(`✅ 阅读量更新成功: ${updatedViews}`)

            return {
                code: 200,
                data: response.data,
                message: '阅读量更新成功',
                success: true
            }
        } catch (error) {
            console.error('❌ 更新阅读量失败:', error)
            return {
                code: 500,
                data: null as any,
                message: error instanceof Error ? error.message : '更新阅读量失败',
                success: false
            }
        }
    }

    /**
     * 点赞文章
     * @param id 文章ID */
    async likeArticle(id: string): Promise<ApiResponse<Article>> {
        try {
            console.log(`❤️ 点赞文章: ${id}`)

            // 首先获取当前文章
            const currentArticleResponse = await api.get(`/articles/${id}`)
            if (!currentArticleResponse.data) {
                throw new Error('文章不存在')
            }

            const currentArticle = currentArticleResponse.data
            const updatedLikes = (currentArticle.likes || 0) + 1

            // 更新文章点赞数
            const response = await api.patch(`/articles/${id}`, {
                likes: updatedLikes
            })

            console.log(`✅ 点赞成功: ${updatedLikes}`)

            return {
                code: 200,
                data: response.data,
                message: '点赞成功',
                success: true
            }
        } catch (error) {
            console.error('❌ 点赞失败:', error)
            return {
                code: 500,
                data: null as any,
                message: error instanceof Error ? error.message : '点赞失败',
                success: false
            }
        }
    }

    /**
     * 取消点赞文章
     * @param id 文章ID */
    async unlikeArticle(id: string): Promise<ApiResponse<Article>> {
        try {
            console.log(`💔 取消点赞文章: ${id}`)

            // 首先获取当前文章
            const currentArticleResponse = await api.get(`/articles/${id}`)
            if (!currentArticleResponse.data) {
                throw new Error('文章不存在')
            }

            const currentArticle = currentArticleResponse.data
            const updatedLikes = Math.max(0, (currentArticle.likes || 1) - 1)

            // 更新文章点赞数
            const response = await api.patch(`/articles/${id}`, {
                likes: updatedLikes
            })

            console.log(`✅ 取消点赞成功: ${updatedLikes}`)

            return {
                code: 200,
                data: response.data,
                message: '取消点赞成功',
                success: true
            }
        } catch (error) {
            console.error('❌ 取消点赞失败:', error)
            return {
                code: 500,
                data: null as any,
                message: error instanceof Error ? error.message : '取消点赞失败',
                success: false
            }
        }
    }
}

// 导出单例实例
export const articleService = new ArticleService()