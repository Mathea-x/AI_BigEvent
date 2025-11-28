import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardStats, RecentArticle, WritingTrend } from '@/types'
import { dashboardService } from '@/services/dashboardService'

// 首页状态管理 Store
export const useDashboardStore = defineStore('dashboard', () => {
  // ========== State ==========
  const stats = ref<DashboardStats>({
    totalArticles: 0,
    totalCategories: 0,
    totalTags: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0
  })

  const recentArticles = ref<RecentArticle[]>([])
  const writingTrends = ref<WritingTrend[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Getters ==========
  const articleCompletionRate = computed(() => {
    const total = stats.value.totalArticles
    const published = stats.value.publishedArticles
    return total > 0 ? Math.round((published / total) * 100) : 0
  })

  const averageViews = computed(() => {
    const total = stats.value.totalArticles
    const views = stats.value.totalViews
    return total > 0 ? Math.round(views / total) : 0
  })

  const averageLikes = computed(() => {
    const total = stats.value.totalArticles
    const likes = stats.value.totalLikes
    return total > 0 ? Math.round(likes / total) : 0
  })

  // ========== Actions ==========
  /**
   * 获取首页所有数据
   */
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 Store: 开始获取首页数据...')

      // 并行获取所有数据
      const [statsRes, recentRes, trendsRes] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentArticles(),
        dashboardService.getWritingTrends()
      ])

      // 处理统计数据
      if (statsRes.success) {
        stats.value = statsRes.data
        console.log('✅ Store: 统计数据加载完成')
      } else {
        throw new Error(statsRes.message)
      }

      // 处理最近文章
      if (recentRes.success) {
        recentArticles.value = recentRes.data
        console.log(`✅ Store: 最近文章加载完成，共 ${recentArticles.value.length} 篇`)
      } else {
        throw new Error(recentRes.message)
      }

      // 处理写作趋势
      if (trendsRes.success) {
        writingTrends.value = trendsRes.data
        console.log('✅ Store: 写作趋势数据加载完成')
      } else {
        throw new Error(trendsRes.message)
      }

      console.log('🎉 Store: 首页所有数据加载完成')

    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取首页数据失败'
      console.error('❌ Store: 获取首页数据失败:', err)
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
   * 刷新首页数据
   */
  const refreshData = () => {
    console.log('🔄 Store: 手动刷新首页数据')
    fetchDashboardData()
  }

  return {
    // State
    stats,
    recentArticles,
    writingTrends,
    loading,
    error,

    // Getters
    articleCompletionRate,
    averageViews,
    averageLikes,

    // Actions
    fetchDashboardData,
    clearError,
    refreshData
  }
})