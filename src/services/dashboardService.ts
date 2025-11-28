import api from './api'
import type { ApiResponse, DashboardStats, RecentArticle, WritingTrend } from '@/types'

// 首页数据服务 - 提供仪表板相关的数据计算和聚合
export const dashboardService = {
  // 获取首页统计数据
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      console.log('📊 开始获取首页统计数据...')

      // 并行获取所有需要的数据
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        api.get('/articles'),
        api.get('/categories'),
        api.get('/tags')
      ])

      const articles = articlesRes.data
      const categories = categoriesRes.data
      const tags = tagsRes.data

      // 计算统计数据
      const stats: DashboardStats = {
        totalArticles: articles.length,
        totalCategories: categories.length,
        totalTags: tags.length,
        publishedArticles: articles.filter((article: any) => article.status === 'published').length,
        draftArticles: articles.filter((article: any) => article.status === 'draft').length,
        totalViews: articles.reduce((sum: number, article: any) => sum + article.views, 0),
        totalLikes: articles.reduce((sum: number, article: any) => sum + article.likes, 0)
      }

      console.log('✅ 首页统计数据计算完成:', stats)

      return {
        code: 200,
        data: stats,
        message: '获取首页统计数据成功',
        success: true
      }
    } catch (error) {
      console.error('❌ 获取首页统计数据失败:', error)
      return {
        code: 500,
        data: {
          totalArticles: 0,
          totalCategories: 0,
          totalTags: 0,
          publishedArticles: 0,
          draftArticles: 0,
          totalViews: 0,
          totalLikes: 0
        },
        message: error instanceof Error ? error.message : '获取首页统计数据失败',
        success: false
      }
    }
  },

  // 获取最近更新的文章列表
  async getRecentArticles(limit: number = 5): Promise<ApiResponse<RecentArticle[]>> {
    try {
      console.log('🔄 获取最近文章列表...')

      const response = await api.get('/articles?_sort=updatedAt&_order=desc')
      const articles = response.data

      // 转换数据格式并限制数量
      const recentArticles: RecentArticle[] = articles
        .slice(0, limit)
        .map((article: any) => ({
          id: article.id,
          title: article.title,
          category: article.category,
          status: article.status,
          updatedAt: article.updatedAt,
          views: article.views,
          likes: article.likes
        }))

      console.log(`✅ 获取到 ${recentArticles.length} 篇最近文章`)

      return {
        code: 200,
        data: recentArticles,
        message: '获取最近文章成功',
        success: true
      }
    } catch (error) {
      console.error('❌ 获取最近文章失败:', error)
      return {
        code: 500,
        data: [],
        message: error instanceof Error ? error.message : '获取最近文章失败',
        success: false
      }
    }
  },

  // 获取写作趋势数据（最近7天）
  // 由于JSON Server功能有限，这里模拟一些趋势数据
  async getWritingTrends(): Promise<ApiResponse<WritingTrend[]>> {
    try {
      console.log('📈 获取写作趋势数据...')

      // 获取所有文章
      const response = await api.get('/articles')
      const articles = response.data

      // 计算最近7天的日期范围
      const today = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        return date.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
      }).reverse()

      console.log('📅 最近7天日期范围:', last7Days)

      // 统计每天的文章数量
      const trends: WritingTrend[] = last7Days.map(date => {
        // 统计该日期创建的文章数量
        const count = articles.filter((article: any) => {
          const articleDate = new Date(article.createdAt).toISOString().split('T')[0]
          return articleDate === date
        }).length

        // 格式化为 MM-DD 显示
        const [year, month, day] = date.split('-')
        return {
          date: `${month}-${day}`,
          count
        }
      })

      console.log('✅ 写作趋势数据准备完成', trends)

      return {
        code: 200,
        data: trends,
        message: '获取写作趋势成功',
        success: true
      }
    } catch (error) {
      console.error('❌ 获取写作趋势失败:', error)
      return {
        code: 500,
        data: [],
        message: error instanceof Error ? error.message : '获取写作趋势失败',
        success: false
      }
    }
  }
}