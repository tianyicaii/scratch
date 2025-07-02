import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../../lib/config'

/**
 * 测试用的 Supabase 客户端工具
 */
export class SupabaseTestClient {
  private static instance: SupabaseClient | null = null

  /**
   * 获取测试用的 Supabase 客户端实例
   */
  static getClient(): SupabaseClient {
    if (!this.instance) {
      // 使用当前环境作为测试环境
      this.instance = config.createSupabaseClient()
    }

    return this.instance
  }

  /**
   * 获取带有 Service Role 权限的客户端（用于测试数据清理等）
   */
  static getServiceClient(): SupabaseClient {
    // 使用当前环境的 service role 客户端
    return config.createSupabaseServiceClient()
  }

  /**
   * 清理测试数据
   */
  static async cleanupTestData() {
    const client = this.getServiceClient()
    
    try {
      // 清理测试用户（邮箱包含 'test' 的用户）
      await client
        .from('users')
        .delete()
        .ilike('email', '%test%')

      console.log('Test data cleaned up successfully')
    } catch (error) {
      console.error('Error cleaning up test data:', error)
      throw error
    }
  }

  /**
   * 重置客户端实例（用于测试间的清理）
   */
  static reset() {
    this.instance = null
  }
}

/**
 * 创建测试用户的辅助函数
 */
export async function createTestUser(userData: {
  email: string
  name: string
  age?: number
}) {
  const client = SupabaseTestClient.getServiceClient()
  
  const { data, error } = await client
    .from('users')
    .insert([userData])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * 删除测试用户的辅助函数
 */
export async function deleteTestUser(userId: string) {
  const client = SupabaseTestClient.getServiceClient()
  
  const { error } = await client
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    throw error
  }
} 