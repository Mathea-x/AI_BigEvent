// 配置TypeScript类型定义，定义了整个应用中使用的数据结构和接口

// 文章状态类型：draft：草稿，published：已发布，archived：已归档
export type ArticleStatus = 'draft' | 'published' | 'archived'

// 基础类型定义：
// 文章接口，定义文章数据的完整结构
export interface Article {
    id: string
    title: string
    content: string
    summary?: string
    tags: string[]
    category: string
    status: 'draft' | 'published' | 'archived'
    createdAt: string
    updatedAt: string
    views: number
    likes: number
}
// 分类接口
export interface Category {
    id: string
    name: string
    color: string
    count: number
}
// 标签接口
export interface Tag {
    id: string
    name: string
    color: string
}

// API响应格式，@template T 数据类型
export interface ApiResponse<T = any> {
    code: number
    data: T
    message: string
    success: boolean
}
// 分页参数
export interface PaginationParams {
    page: number
    pageSize: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}


// 列表响应数据，@template T 列表项类型
export interface ListResponse<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

// 搜索参数
export interface SearchParams {
    keyword?: string
    category?: string
    tags?: string[]
    status?: ArticleStatus
}

// 文章表单数据（用于创建和编辑）
export type ArticleFormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>