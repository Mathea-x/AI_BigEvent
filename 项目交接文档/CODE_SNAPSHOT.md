# 关键代码模式

## API 服务模式
```typescript
// 安全的搜索实现
const safeSearch = (articles: Article[], keyword: string) => {
  return articles.filter(article => {
    const title = article.title?.toLowerCase() || ''
    const content = article.content?.toLowerCase() || ''
    return title.includes(keyword) || content.includes(keyword)
  })
}
```

## 状态管理模式
```typescript
// Pinia Store 结构
export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  
  const fetchArticles = async (params) => {
    // 实现逻辑
  }
  
  return { articles, loading, fetchArticles }
})
```

## 组件通信模式
```typescript
// 保持筛选状态的分页
const handlePageChange = (newPage: number) => {
  const params = {
    page: newPage,
    status: filterStatus.value,     // 保持状态
    category: filterCategory.value  // 保持分类
  }
  loadArticles(params)
}
```