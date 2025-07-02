/**
 * Jest 测试环境设置
 */

import dotenv from 'dotenv'

// 加载测试环境变量
dotenv.config({ path: '.env' })

// 设置测试环境
process.env.NODE_ENV = 'development'

// 设置测试超时时间
jest.setTimeout(30000)

// 全局测试前设置
beforeAll(async () => {
  console.log('🧪 测试环境初始化...')
})

// 全局测试后清理
afterAll(async () => {
  console.log('🧹 测试环境清理完成')
}) 