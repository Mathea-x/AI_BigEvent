/// <reference types="vite/client" />

/**
 * Vite 环境变量类型定义
 * 这里定义了所有在 .env 文件中使用的环境变量的类型
 */

// 扩展 ImportMetaEnv 接口，添加自定义环境变量
interface ImportMetaEnv {
    // API 基础地址
    readonly VITE_API_BASE_URL: string,
    // 应用标题
    readonly VITE_APP_TITLE: string
    // 应用版本
    readonly VITE_APP_VERSION: string
    // 是否开发模式
    readonly VITE_DEV_MODE: string
}

// 扩展 ImportMeta 接口
interface ImportMeta {
    readonly env: ImportMetaEnv
}