/**
 * 用户测试数据
 */

export const mockUsers = [
  {
    email: 'test1@example.com',
    name: '测试用户1',
    age: 25
  },
  {
    email: 'test2@example.com',
    name: '测试用户2',
    age: 30
  },
  {
    email: 'test3@example.com',
    name: '测试用户3'
    // age 为可选字段
  }
]

export const invalidUsers = [
  {
    email: 'invalid-email',
    name: '无效邮箱用户',
    age: 25
  },
  {
    email: 'test@example.com',
    name: '', // 空名称
    age: 25
  },
  {
    // 缺少必填字段
    age: 25
  }
]

export const updateUserData = {
  name: '更新后的用户名',
  age: 35
}

/**
 * 生成随机测试用户
 */
export function generateRandomUser() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  const uniqueId = `${timestamp}-${random}`
  
  return {
    email: `test-${uniqueId}@example.com`,
    name: `测试用户-${uniqueId}`,
    age: Math.floor(Math.random() * 50) + 18
  }
} 