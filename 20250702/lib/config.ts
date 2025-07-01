import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export type Environment = 'development' | 'staging' | 'production'

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
  projectRef: string
}

class Config {
  private currentEnv: Environment

  constructor() {
    this.currentEnv = (process.env.NODE_ENV as Environment) || 'development'
  }

  /**
   * 获取当前环境
   */
  getCurrentEnvironment(): Environment {
    return this.currentEnv
  }

  /**
   * 根据环境获取 Supabase 配置
   */
  getSupabaseConfig(env?: Environment): SupabaseConfig {
    const targetEnv = env || this.currentEnv
    
    switch (targetEnv) {
      case 'development':
        return {
          url: process.env.SUPABASE_DEV_URL || '',
          anonKey: process.env.SUPABASE_DEV_ANON_KEY || '',
          serviceRoleKey: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY || '',
          projectRef: process.env.SUPABASE_DEV_PROJECT_REF || ''
        }
      case 'staging':
        return {
          url: process.env.SUPABASE_STAGING_URL || '',
          anonKey: process.env.SUPABASE_STAGING_ANON_KEY || '',
          serviceRoleKey: process.env.SUPABASE_STAGING_SERVICE_ROLE_KEY || '',
          projectRef: process.env.SUPABASE_STAGING_PROJECT_REF || ''
        }
      case 'production':
        return {
          url: process.env.SUPABASE_PROD_URL || '',
          anonKey: process.env.SUPABASE_PROD_ANON_KEY || '',
          serviceRoleKey: process.env.SUPABASE_PROD_SERVICE_ROLE_KEY || '',
          projectRef: process.env.SUPABASE_PROD_PROJECT_REF || ''
        }
      default:
        throw new Error(`Unknown environment: ${targetEnv}`)
    }
  }

  /**
   * 创建 Supabase 客户端（匿名）
   */
  createSupabaseClient(env?: Environment) {
    const config = this.getSupabaseConfig(env)
    
    if (!config.url || !config.anonKey) {
      throw new Error(`Missing Supabase configuration for environment: ${env || this.currentEnv}`)
    }

    return createClient(config.url, config.anonKey)
  }

  /**
   * 创建 Supabase 客户端（服务角色）
   */
  createSupabaseServiceClient(env?: Environment) {
    const config = this.getSupabaseConfig(env)
    
    if (!config.url || !config.serviceRoleKey) {
      throw new Error(`Missing Supabase service role configuration for environment: ${env || this.currentEnv}`)
    }

    return createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  /**
   * 获取数据库连接字符串
   */
  getDatabaseUrl(env?: Environment): string {
    const targetEnv = env || this.currentEnv
    
    if (targetEnv === 'development') {
      return process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:54322/postgres'
    }
    
    const config = this.getSupabaseConfig(targetEnv)
    // 对于远程环境，需要从 Supabase 项目设置中获取连接字符串
    return process.env[`DATABASE_URL_${targetEnv.toUpperCase()}`] || ''
  }

  /**
   * 验证环境配置
   */
  validateConfig(env?: Environment): boolean {
    try {
      const config = this.getSupabaseConfig(env)
      return !!(config.url && config.anonKey && config.serviceRoleKey && config.projectRef)
    } catch (error) {
      return false
    }
  }

  /**
   * 获取项目引用 ID
   */
  getProjectRef(env?: Environment): string {
    const config = this.getSupabaseConfig(env)
    return config.projectRef
  }
}

// 创建全局配置实例
export const config = new Config()

// 导出便捷函数
export const getSupabaseClient = (env?: Environment) => config.createSupabaseClient(env)
export const getSupabaseServiceClient = (env?: Environment) => config.createSupabaseServiceClient(env)
export const getCurrentEnvironment = () => config.getCurrentEnvironment()
export const getProjectRef = (env?: Environment) => config.getProjectRef(env) 