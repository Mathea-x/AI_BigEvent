<template>
  <div class="dashboard-page">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">数据概览</h1>
          <p class="page-description">全面了解您的写作数据和内容统计</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateArticle" class="create-btn">
            <el-icon>
              <DocumentAdd />
            </el-icon>
            写新文章
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快速操作卡片 -->
    <div class="quick-actions">
      <el-card class="action-card" shadow="hover" @click="handleManageArticles">
        <div class="action-content">
          <div class="action-icon article">
            <el-icon>
              <Document />
            </el-icon>
          </div>
          <div class="action-info">
            <h3>文章管理</h3>
            <p>管理所有文章内容</p>
          </div>
        </div>
      </el-card>

      <el-card class="action-card" shadow="hover" @click="handleManageCategories">
        <div class="action-content">
          <div class="action-icon category">
            <el-icon>
              <Collection />
            </el-icon>
          </div>
          <div class="action-info">
            <h3>分类管理</h3>
            <p>组织内容分类</p>
          </div>
        </div>
      </el-card>

      <el-card class="action-card" shadow="hover" @click="handleManageTags">
        <div class="action-content">
          <div class="action-icon tag">
            <el-icon>
              <PriceTag />
            </el-icon>
          </div>
          <div class="action-info">
            <h3>标签管理</h3>
            <p>管理内容标签</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="store.loading">
      <div class="skeleton-grid">
        <el-skeleton v-for="i in 6" :key="i" animated class="skeleton-item" />
      </div>
    </div>

    <!-- 错误状态 -->
    <div class="error-container" v-else-if="store.error">
      <el-result icon="warning" title="数据加载失败" :sub-title="store.error">
        <template #extra>
          <el-button type="primary" @click="store.refreshData">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content" v-else>
      <!-- 核心数据指标 -->
      <div class="metrics-section">
        <el-card class="metric-card total-articles" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <div class="metric-data">
              <div class="metric-value">{{ store.stats.totalArticles }}</div>
              <div class="metric-label">文章总数</div>
              <div class="metric-trend">
                <span class="trend-badge published">{{ store.stats.publishedArticles }} 已发布</span>
                <span class="trend-badge draft">{{ store.stats.draftArticles }} 草稿</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card total-views" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon>
                <View />
              </el-icon>
            </div>
            <div class="metric-data">
              <div class="metric-value">{{ store.stats.totalViews }}</div>
              <div class="metric-label">总阅读量</div>
              <div class="metric-trend">
                <span class="trend-text">篇均 {{ store.averageViews }} 阅读</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card total-likes" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon>
                <Star />
              </el-icon>
            </div>
            <div class="metric-data">
              <div class="metric-value">{{ store.stats.totalLikes }}</div>
              <div class="metric-label">总点赞数</div>
              <div class="metric-trend">
                <span class="trend-text">互动率 {{ getInteractionRate }}%</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card completion-rate" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon>
                <CircleCheck />
              </el-icon>
            </div>
            <div class="metric-data">
              <div class="metric-value">{{ store.articleCompletionRate }}%</div>
              <div class="metric-label">发布完成率</div>
              <div class="progress-container">
                <el-progress :percentage="store.articleCompletionRate" :show-text="false" stroke-linecap="round"
                  class="completion-progress" />
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表和数据区域 -->
      <div class="charts-section">
        <!-- 写作趋势 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <h3>写作趋势</h3>
              <span class="chart-subtitle">最近7天文章发布情况</span>
            </div>
          </template>
          <div class="trends-chart">
            <div v-for="(trend, index) in store.writingTrends" :key="index" class="trend-item">
              <div class="trend-bar-container">
                <div class="trend-bar" :style="{ height: `${Math.max(trend.count * 20, 8)}%` }"
                  :class="{ active: isToday(trend.date) }">
                  <div class="bar-value">{{ trend.count }}</div>
                </div>
              </div>
              <div class="trend-label">
                <div class="trend-date">{{ formatTrendDate(trend.date) }}</div>
                <div class="trend-day">{{ getDayOfWeek(trend.date) }}</div>
              </div>
            </div>
          </div>
          <div class="chart-stats">
            <div class="stat-item">
              <span class="stat-label">本周发布</span>
              <span class="stat-value">{{ getWeeklyTotal }} 篇</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">日均发布</span>
              <span class="stat-value">{{ getDailyAverage }} 篇</span>
            </div>
          </div>
        </el-card>

        <!-- 内容分布 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <h3>内容分布</h3>
              <span class="chart-subtitle">文章分类统计</span>
            </div>
          </template>
          <div class="distribution-content">
            <div class="distribution-chart">
              <div class="pie-chart">
                <div class="pie-segment published" :style="{
                  background: `conic-gradient(#10b981 0% ${publishedRotation}deg, #e5e7eb ${publishedRotation}deg 360deg)`
                }">
                  <div class="pie-center">
                    <div class="pie-value">{{ store.articleCompletionRate }}%</div>
                    <div class="pie-label">发布率</div>
                  </div>
                </div>
              </div>
              <div class="distribution-legend">
                <div class="legend-item">
                  <div class="legend-color published"></div>
                  <div class="legend-text">
                    <span class="legend-label">已发布</span>
                    <span class="legend-value">{{ store.stats.publishedArticles }} 篇</span>
                  </div>
                </div>
                <div class="legend-item">
                  <div class="legend-color draft"></div>
                  <div class="legend-text">
                    <span class="legend-label">草稿</span>
                    <span class="legend-value">{{ store.stats.draftArticles }} 篇</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 最近活动和分类统计 -->
      <div class="activity-section">
        <!-- 最近更新文章 -->
        <el-card class="activity-card" shadow="never">
          <template #header>
            <div class="activity-header">
              <h3>最近更新</h3>
              <el-button type="primary" link @click="handleViewAllArticles">
                查看全部
              </el-button>
            </div>
          </template>
          <div class="recent-articles">
            <div v-for="article in store.recentArticles" :key="article.id" class="recent-article-item"
              @click="handleViewArticle(article.id)">
              <div class="article-main">
                <h4 class="article-title">{{ article.title }}</h4>
                <div class="article-meta">
                  <el-tag size="small" :type="getStatusTagType(article.status)">
                    {{ getStatusText(article.status) }}
                  </el-tag>
                  <span class="meta-item">{{ article.category }}</span>
                  <span class="meta-item">{{ formatRelativeTime(article.updatedAt) }}</span>
                </div>
              </div>
              <div class="article-stats">
                <div class="stat-item">
                  <el-icon>
                    <View />
                  </el-icon>
                  {{ article.views }}
                </div>
                <div class="stat-item">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ article.likes }}
                </div>
              </div>
            </div>
          </div>
          <div class="empty-recent" v-if="store.recentArticles.length === 0">
            <el-empty description="暂无最近更新的文章" />
          </div>
        </el-card>

        <!-- 分类统计 -->
        <el-card class="activity-card" shadow="never">
          <template #header>
            <div class="activity-header">
              <h3>分类统计</h3>
              <span class="stats-total">{{ store.stats.totalCategories }} 个分类</span>
            </div>
          </template>
          <div class="categories-stats">
            <div class="category-stat" v-for="category in getTopCategories" :key="category.name">
              <div class="category-info">
                <div class="category-name">
                  <span class="color-dot" :style="{ backgroundColor: category.color }"></span>
                  {{ category.name }}
                </div>
                <div class="category-count">{{ category.count }} 篇</div>
              </div>
              <el-progress :percentage="getCategoryPercentage(category.count)" :show-text="false"
                class="category-progress" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // ========== 导入部分 ==========
  import { onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Document,
    Collection,
    PriceTag,
    View,
    Star,
    DocumentAdd,
    CircleCheck
  } from '@element-plus/icons-vue'

  import { useDashboardStore } from '@/stores/dashboardStore'

  // ========== 初始化 ==========
  const router = useRouter()
  const store = useDashboardStore()

  // ========== 计算属性 ==========
  /**
   * 发布率饼图旋转角度
   */
  const publishedRotation = computed(() => {
    const rate = store.articleCompletionRate
    return (rate / 100) * 360
  })

  /**
   * 互动率计算
   */
  const getInteractionRate = computed(() => {
    const totalViews = store.stats.totalViews
    const totalLikes = store.stats.totalLikes
    return totalViews > 0 ? Math.round((totalLikes / totalViews) * 100) : 0
  })

  /**
   * 本周发布总数 - 基于真实数据
   */
  const getWeeklyTotal = computed(() => {
    return store.writingTrends.reduce((sum, trend) => sum + trend.count, 0)
  })

  /**
   * 日均发布数 - 基于真实数据
   */
  const getDailyAverage = computed(() => {
    const daysWithData = store.writingTrends.filter(trend => trend.count > 0).length
    return daysWithData > 0 ? (getWeeklyTotal.value / daysWithData).toFixed(1) : '0.0'
  })

  /**
   * 获取热门分类（模拟数据，实际应该从API获取）
   */
  const getTopCategories = computed(() => [
    { name: '前端开发', count: 3, color: '#409EFF' },
    { name: '技术教程', count: 2, color: '#67C23A' },
    { name: '系统设计', count: 1, color: '#E6A23C' },
    { name: '人工智能', count: 1, color: '#9254DE' }
  ])

  /**
   * 计算分类占比
   */
  const getCategoryPercentage = (count: number) => {
    const total = store.stats.totalArticles
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  // ========== 生命周期钩子 ==========
  onMounted(() => {
    console.log('🏠 首页已挂载，开始加载数据...')
    loadDashboardData()
  })

  // ========== 方法函数 ==========
  /**
   * 加载首页数据
   */
  const loadDashboardData = async () => {
    try {
      console.log('🔄 开始加载首页数据...')
      await store.fetchDashboardData()
      console.log('✅ 首页数据加载完成')
    } catch (error) {
      console.error('❌ 加载首页数据失败:', error)
    }
  }

  /**
   * 处理创建文章
   */
  const handleCreateArticle = () => {
    console.log('📝 跳转到创建文章页面')
    router.push('/articles/create')
  }

  /**
   * 管理文章
   */
  const handleManageArticles = () => {
    console.log('📄 跳转到文章管理')
    router.push('/articles')
  }

  /**
   * 管理分类
   */
  const handleManageCategories = () => {
    console.log('📂 跳转到分类管理')
    router.push('/categories')
  }

  /**
   * 管理标签
   */
  const handleManageTags = () => {
    console.log('🏷️ 跳转到标签管理')
    router.push('/tags')
  }

  /**
   * 查看所有文章
   */
  const handleViewAllArticles = () => {
    console.log('📄 跳转到文章管理')
    router.push('/articles')
  }

  /**
   * 查看文章详情
   */
  const handleViewArticle = (id: string) => {
    console.log(`👀 查看文章详情: ${id}`)
    router.push(`/articles/${id}`)
  }

  /**
   * 获取状态标签类型
   */
  const getStatusTagType = (status: string): string => {
    const typeMap: Record<string, string> = {
      draft: 'info',
      published: 'success',
      archived: 'warning'
    }
    return typeMap[status] || 'info'
  }

  /**
   * 获取状态显示文本
   */
  const getStatusText = (status: string): string => {
    const textMap: Record<string, string> = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档'
    }
    return textMap[status] || status
  }

  /**
   * 格式化相对时间
   */
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        return '刚刚'
      } else if (diffInHours < 24) {
        return `${diffInHours}小时前`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}天前`
      }
    } catch (error) {
      console.error('时间格式化错误:', error)
      return '未知时间'
    }
  }

  /**
   * 格式化趋势日期
   */
  const formatTrendDate = (dateStr: string): string => {
    const [month, day] = dateStr.split('-')
    return `${month}/${day}`
  }

  /**
   * 获取星期几
   */
  const getDayOfWeek = (dateStr: string): string => {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const [month, day] = dateStr.split('-')
    const date = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day))
    return `周${days[date.getDay()]}`
  }

  /**
   * 判断是否是今天
   */
  const isToday = (dateStr: string): boolean => {
    const today = new Date()
    const todayStr = `${today.getMonth() + 1}-${today.getDate()}`
    return dateStr === todayStr
  }
</script>

<style scoped lang="scss">
  .dashboard-page {
    @apply space-y-6 p-6;
    background: #f8fafc;
    min-height: 100vh;

    /* 页面标题区域 */
    .page-header {
      @apply mb-8;

      .header-content {
        @apply flex justify-between items-center;

        .header-text {
          .page-title {
            @apply text-3xl font-bold text-gray-900 mb-2;
          }

          .page-description {
            @apply text-gray-600 text-lg;
          }
        }

        .create-btn {
          @apply h-12 px-6 text-base;
        }
      }
    }

    /* 快速操作区域 */
    .quick-actions {
      @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-8;

      .action-card {
        @apply cursor-pointer transition-all duration-300 border-0;
        background: linear-gradient(135deg, #8FAADC 0%, #6B7F9D 100%);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(107, 127, 157, 0.15);
        }

        .action-content {
          @apply flex items-center gap-4 p-4 text-white;

          .action-icon {
            @apply w-12 h-12 rounded-2xl flex items-center justify-center text-white;
            background: rgba(255, 255, 255, 0.2);

            .el-icon {
              @apply text-2xl;
            }
          }

          .action-info {
            h3 {
              @apply text-lg font-semibold mb-1;
            }

            p {
              @apply text-white text-opacity-80 text-sm;
            }
          }
        }
      }
    }

    /* 核心数据指标 */
    .metrics-section {
      @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;

      .metric-card {
        @apply border-0 transition-all duration-300;
        background: white;
        border-radius: 12px;
        border: 1px solid #E8EDF3;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107, 127, 157, 0.1);
        }

        .metric-content {
          @apply flex items-center gap-4 p-6;

          .metric-icon {
            @apply w-14 h-14 rounded-2xl flex items-center justify-center text-white;

            .el-icon {
              @apply text-2xl;
            }
          }

          .metric-data {
            @apply flex-1;

            .metric-value {
              @apply text-3xl font-bold text-gray-900 mb-1;
            }

            .metric-label {
              @apply text-gray-600 text-sm mb-2;
            }

            .metric-trend {
              @apply flex gap-2;

              .trend-badge {
                @apply px-2 py-1 rounded-full text-xs font-medium;

                &.published {
                  background: #E3F2FD;
                  color: #1565C0;
                }

                &.draft {
                  background: #F3E5F5;
                  color: #7B1FA2;
                }
              }

              .trend-text {
                @apply text-gray-500 text-sm;
              }
            }
          }
        }

        /* 不同指标的颜色主题 - 莫兰迪蓝色系 */
        &.total-articles .metric-icon {
          background: linear-gradient(135deg, #8FAADC 0%, #6B7F9D 100%);
        }

        &.total-views .metric-icon {
          background: linear-gradient(135deg, #A5B8D0 0%, #7D93B2 100%);
        }

        &.total-likes .metric-icon {
          background: linear-gradient(135deg, #B8C9E0 0%, #8FA3C4 100%);
        }

        &.completion-rate .metric-icon {
          background: linear-gradient(135deg, #C5D4EB 0%, #9BB0D6 100%);
        }

        .progress-container {
          @apply mt-2;

          .completion-progress {
            :deep(.el-progress-bar__outer) {
              @apply rounded-full;
              background: #F0F4F8;
            }

            :deep(.el-progress-bar__inner) {
              @apply rounded-full;
              background: linear-gradient(135deg, #8FAADC 0%, #6B7F9D 100%);
            }
          }
        }
      }
    }

    /* 图表区域 */
    .charts-section {
      @apply grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8;

      .chart-card {
        @apply border-0;
        background: white;
        border-radius: 12px;
        border: 1px solid #E8EDF3;

        /* 写作趋势图表 */
        .trends-chart {
          @apply flex items-end justify-between gap-2 h-48 p-4;

          .trend-item {
            @apply flex flex-col items-center gap-3 flex-1;

            .trend-bar-container {
              @apply h-32 flex items-end w-full;
            }

            .trend-bar {
              @apply w-full rounded-t-lg transition-all duration-700 relative;
              background: linear-gradient(to top, #8FAADC, #6B7F9D);
              min-height: 8px;

              &.active {
                background: linear-gradient(to top, #A5B8D0, #7D93B2);
              }

              .bar-value {
                @apply absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700;
              }
            }

            .trend-label {
              @apply text-center;

              .trend-date {
                @apply text-sm font-medium text-gray-900;
              }

              .trend-day {
                @apply text-xs text-gray-500;
              }
            }
          }
        }

        /* 内容分布 */
        .distribution-content {
          @apply p-4;

          .distribution-chart {
            @apply flex items-center justify-between;

            .pie-chart {
              @apply relative w-32 h-32;

              .pie-segment {
                @apply w-full h-full rounded-full;
                position: relative;
                background: conic-gradient(#8FAADC 0% v-bind(publishedRotation)deg, #E8EDF3 v-bind(publishedRotation)deg 360deg);

                .pie-center {
                  @apply absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center;

                  .pie-value {
                    @apply text-xl font-bold text-gray-900;
                  }

                  .pie-label {
                    @apply text-xs text-gray-500;
                  }
                }
              }
            }

            .distribution-legend {
              @apply space-y-4;

              .legend-item {
                @apply flex items-center gap-3;

                .legend-color {
                  @apply w-4 h-4 rounded-full;

                  &.published {
                    background: #8FAADC;
                  }

                  &.draft {
                    background: #E8EDF3;
                  }
                }

                .legend-text {
                  @apply flex flex-col;

                  .legend-label {
                    @apply text-sm font-medium text-gray-900;
                  }

                  .legend-value {
                    @apply text-xs text-gray-500;
                  }
                }
              }
            }
          }
        }
      }
    }

    /* 活动区域 */
    .activity-section {
      @apply grid grid-cols-1 lg:grid-cols-2 gap-6;

      .activity-card {
        @apply border-0;
        background: white;
        border-radius: 12px;
        border: 1px solid #E8EDF3;

        /* 最近文章 */
        .recent-articles {
          @apply space-y-3;

          .recent-article-item {
            @apply flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-200;
            background: #F8FAFC;
            border: 1px solid transparent;

            &:hover {
              border-color: #8FAADC;
              background: white;
              transform: translateX(4px);
            }
          }
        }

        /* 分类统计 */
        .categories-stats {
          @apply space-y-4;

          .category-stat {
            @apply space-y-2;

            .category-progress {
              :deep(.el-progress-bar__outer) {
                @apply rounded-full;
                background: #F0F4F8;
              }

              :deep(.el-progress-bar__inner) {
                @apply rounded-full;
                background: linear-gradient(135deg, #8FAADC 0%, #6B7F9D 100%);
              }
            }
          }
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .dashboard-page {
      @apply p-4;
    }
  }

  @media (max-width: 768px) {
    .dashboard-page {
      .distribution-content {
        .distribution-chart {
          @apply flex-col items-center gap-6;
        }
      }
    }
  }
</style>