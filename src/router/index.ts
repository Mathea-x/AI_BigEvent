import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('@/views/HomeView.vue'),
            meta: { title: '首页' }
        },
        {
            path: '/articles',
            name: 'Articles',
            component: () => import('@/views/ArticlesView.vue'),
            meta: { title: '文章管理' }
        },
        {
            path: '/articles/create',
            name: 'ArticleCreate',
            component: () => import('@/views/ArticleEditView.vue'),
            meta: { title: '创建文章' }
        },
        {
            path: '/articles/edit/:id',
            name: 'ArticleEdit',
            component: () => import('@/views/ArticleEditView.vue'),
            meta: { title: '编辑文章' }
        },
        {
            path: '/categories',
            name: 'Categories',
            component: () => import('@/views/CategoriesView.vue'),
            meta: { title: '分类管理' }
        }
    ]
})

// 路由守卫：更新页面标题
router.beforeEach((to) => {
    const title = to.meta.title as string
    if (title) {
        document.title = `${title} - 大事件管理系统`
    }
})

export default router