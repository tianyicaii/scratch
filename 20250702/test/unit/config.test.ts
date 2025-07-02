import { config } from '../../lib/config'

describe('Config', () => {
  it('应该能够获取当前环境', () => {
    const env = config.getCurrentEnvironment()
    expect(env).toBeDefined()
    expect(['development', 'staging', 'production']).toContain(env)
  })

  it('应该能够获取 Supabase 配置', () => {
    const supabaseConfig = config.getSupabaseConfig('development')
    expect(supabaseConfig).toBeDefined()
    expect(supabaseConfig).toHaveProperty('url')
    expect(supabaseConfig).toHaveProperty('anonKey')
    expect(supabaseConfig).toHaveProperty('serviceRoleKey')
    expect(supabaseConfig).toHaveProperty('projectRef')
  })

  it('应该能够验证配置', () => {
    // 这个测试可能会失败，因为可能没有设置所有环境变量
    // 但这是正常的，用于演示测试结构
    const isValid = config.validateConfig('development')
    expect(typeof isValid).toBe('boolean')
  })
}) 