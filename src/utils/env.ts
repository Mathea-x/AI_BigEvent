/**
 * 环境变量工具函数
 * 提供类型安全的环境变量访问方式
 */

/**
 * 获取环境变量值
 * @param key 环境变量键名
 * @param defaultValue 默认值（可选）
 * @returns 环境变量值
 */
export function getEnv(key: keyof ImportMetaEnv, defaultValue?: string): string {
    const value = import.meta.env[key]

    if (value === undefined || value === null) {
        if (defaultValue !== undefined) {
            console.warn(`⚠️  环境变量 ${key} 未设置，使用默认值: ${defaultValue}`)
            return defaultValue
        }
        throw new Error(`❌ 环境变量 ${key} 未设置且无默认值`)
    }

    return value as string
}

/**
 * 获取数字类型的环境变量
 * @param key 环境变量键名
 * @param defaultValue 默认值（可选）
 * @returns 数字值
 */
export function getEnvNumber(key: keyof ImportMetaEnv, defaultValue?: number): number {
    const value = getEnv(key, defaultValue?.toString())
    const numValue = Number(value)

    if (isNaN(numValue)) {
        throw new Error(`❌ 环境变量 ${key} 不是有效的数字: ${value}`)
    }

    return numValue
}

/**
 * 获取布尔类型的环境变量
 * @param key 环境变量键名
 * @param defaultValue 默认值（可选）
 * @returns 布尔值
 */
export function getEnvBoolean(key: keyof ImportMetaEnv, defaultValue?: boolean): boolean {
    const value = getEnv(key, defaultValue?.toString())

    // 将字符串转换为布尔值
    return value === 'true' || value === '1'
}

/**
 * 检查当前是否开发环境
 * @returns 是否是开发环境
 */
export function isDev(): boolean {
    return getEnvBoolean('VITE_DEV_MODE', import.meta.env.DEV)
}

/**
 * 检查当前是否生产环境
 * @returns 是否是生产环境
 */
export function isProd(): boolean {
    return import.meta.env.PROD
}

// 导出常用的环境变量
export const APP_CONFIG = {
    title: getEnv('VITE_APP_TITLE', '大事件管理系统'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    apiBaseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:3001'),
    isDev: isDev(),
    isProd: isProd()
} as const

// 在开发环境下打印配置信息
if (isDev()) {
    console.log('🔧 应用配置:', APP_CONFIG)
}