// 文章状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, PaginationParams } from '@/types'
import { articleService } from '@/services/articleService'

/**
 * 文章状态管理 Store
 * 使用 Pinia 管理全局的文章状态，包括列表、加载状态、分页等
 */
export const useArticleStore = defineStore('article', () => {
    // ========== State（状态） ==========

    /** 文章列表 */
    const articles = ref<Article[]>([])

    /** 当前正在编辑或查看的文章 */
    const currentArticle = ref<Article | null>(null)

    /** 加载状态 */
    const loading = ref(false)

    /** 错误信息 */
    const error = ref<string | null>(null)

    /** 分页信息 */
    const pagination = ref({
        page: 1,
        pageSize: 10,
        total: 0
    })

    // ========== Getters（计算属性） ==========

    /** 获取已发布的文章 */
    const publishedArticles = computed(() =>
        articles.value.filter(article => article.status === 'published')
    )

    /** 获取草稿文章 */
    const draftArticles = computed(() =>
        articles.value.filter(article => article.status === 'draft')
    )

    /** 总页数 */
    const totalPages = computed(() =>
        Math.ceil(pagination.value.total / pagination.value.pageSize)
    )

    // ========== Actions（动作/方法） ==========

    /**
     * 获取文章列表
     * @param params 分页和查询参数
     */
    const fetchArticles = async (params?: PaginationParams & { keyword?: string; status?: string; category?: string }) => {
        loading.value = true
        error.value = null

        try {
            console.log('🔄 Store: 开始获取文章列表...')
            console.log('📋 Store: 完整请求参数:', JSON.stringify(params, null, 2))

            // 合并分页参数
            const queryParams = {
                page: params?.page || pagination.value.page,
                pageSize: params?.pageSize || pagination.value.pageSize,
                keyword: params?.keyword,
                status: params?.status,  // 👈 确保传递状态参数
                category: params?.category // 👈 确保传递分类参数
            }

            console.log('📤 Store: 发送给服务的参数:', JSON.stringify(queryParams, null, 2))

            const response = await articleService.getArticles(queryParams)
            console.log('📦 Store: 收到响应:', response)

            if (response.success) {
                // 更新状态
                articles.value = response.data.list
                pagination.value = {
                    page: response.data.page,
                    pageSize: response.data.pageSize,
                    total: response.data.total
                }

                console.log(`✅ Store: 成功获取 ${articles.value.length} 篇文章`)
                console.log('📊 Store: 最终分页信息:', JSON.stringify(pagination.value, null, 2))
                console.log('📝 Store: 文章状态分布:',
                    `已发布: ${articles.value.filter(a => a.status === 'published').length}, ` +
                    `草稿: ${articles.value.filter(a => a.status === 'draft').length}, ` +
                    `已归档: ${articles.value.filter(a => a.status === 'archived').length}`
                )
                console.log('📂 Store: 文章分类分布:',
                    Array.from(new Set(articles.value.map(a => a.category))).join(', ')
                )
            } else {
                throw new Error(response.message || '获取文章列表失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            console.error('❌ 获取文章列表失败:', err)
            
            // 添加更详细的错误信息
            if (err instanceof Error) {
                console.error('错误详情:', err.stack)
            }
        } finally {
            loading.value = false
        }
    }

    /**
     * 根据 ID 获取文章详情
     * @param id 文章 ID
     */
    const fetchArticleById = async (id: string) => {
        loading.value = true
        error.value = null

        try {
            console.log(`🔄 开始获取文章详情 (ID: ${id})...`)

            const response = await articleService.getArticleById(id)

            if (response.success) {
                currentArticle.value = response.data
                console.log(`✅ 成功获取文章详情: ${response.data.title}`)
            } else {
                throw new Error(response.message || '获取文章详情失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            console.error(`❌ 获取文章详情失败 (ID: ${id}):`, err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 创建新文章
     * @param articleData 文章数据
     * @returns 创建的文章 ID
     */
    const createArticle = async (articleData: Omit<Article, 'id'>): Promise<string | null> => {
        loading.value = true
        error.value = null

        try {
            console.log('🔄 开始创建文章...')

            const response = await articleService.createArticle(articleData)

            if (response.success) {
                // 将新文章添加到列表开头
                articles.value.unshift(response.data)
                console.log(`✅ 成功创建文章: ${response.data.title}`)
                return response.data.id
            } else {
                throw new Error(response.message || '创建文章失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            console.error('❌ 创建文章失败:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 更新文章
     * @param id 文章 ID
     * @param articleData 要更新的文章数据
     */
    const updateArticle = async (id: string, articleData: Partial<Article>) => {
        loading.value = true
        error.value = null

        try {
            console.log(`🔄 开始更新文章 (ID: ${id})...`)

            const response = await articleService.updateArticle(id, articleData)

            if (response.success) {
                // 更新列表中的文章
                const index = articles.value.findIndex(article => article.id === id)
                if (index !== -1) {
                    articles.value[index] = { ...articles.value[index], ...response.data }
                }

                // 更新当前文章
                if (currentArticle.value && currentArticle.value.id === id) {
                    currentArticle.value = { ...currentArticle.value, ...response.data }
                }
                console.log(`✅ 成功更新文章: ${response.data.title}`)
            } else {
                throw new Error(response.message || '更新文章失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            console.error(`❌ 更新文章失败 (ID: ${id}):`, err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 删除文章
     * @param id 文章 ID
     */
    const deleteArticle = async (id: string) => {
        loading.value = true
        error.value = null

        try {
            console.log(`🔄 开始删除文章 (ID: ${id})...`)

            const response = await articleService.deleteArticle(id)

            if (response.success) {
                // 从列表中移除文章
                articles.value = articles.value.filter(article => article.id !== id)
                console.log(`✅ 成功删除文章 (ID: ${id})`)
            } else {
                throw new Error(response.message || '删除文章失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            console.error(`❌ 删除文章失败 (ID: ${id}):`, err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 搜索文章
     * @param keyword 搜索关键词
     */
    const searchArticles = async (keyword: string) => {
        if (!keyword.trim()) {
            // 如果关键词为空，则获取所有文章
            await fetchArticles()
            return
        }

        loading.value = true
        error.value = null

        try {
            console.log(`🔍 开始搜索文章: ${keyword}`)

            const response = await articleService.searchArticles(keyword)

            if (response.success) {
                articles.value = response.data
                pagination.value.total = response.data.length
                pagination.value.page = 1 // 搜索时重置到第一页
                console.log(`✅ 搜索完成，找到 ${response.data.length} 篇文章`)
            } else {
                throw new Error(response.message || '搜索文章失败')
            }
        } catch (err) {
            // 提供更具体的错误信息
            if (err.message && err.message.includes('toLowerCase')) {
                error.value = '搜索过程中出现数据格式错误，请检查文章数据完整性'
            } else {
                error.value = err instanceof Error ? err.message : '搜索文章失败'
            }
            console.error('❌ 搜索文章失败:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 清除错误信息
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * 重置当前文章
     */
    const clearCurrentArticle = () => {
        currentArticle.value = null
    }

    // 导出所有状态和方法
    return {
        // State
        articles,
        currentArticle,
        loading,
        error,
        pagination,

        // Getters
        publishedArticles,
        draftArticles,
        totalPages,

        // Actions
        fetchArticles,
        fetchArticleById,
        createArticle,
        updateArticle,
        deleteArticle,
        searchArticles,
        clearError,
        clearCurrentArticle
    }
})