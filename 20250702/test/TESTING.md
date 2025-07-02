# 测试指南

本文档介绍如何在 Supabase 项目中运行和编写测试。

## 🚀 快速开始

### 1. 安装测试依赖

```bash
npm install
```

### 2. 配置环境变量

确保 `.env` 文件中包含开发环境的 Supabase 配置：

```env
SUPABASE_DEV_URL=your_supabase_url
SUPABASE_DEV_ANON_KEY=your_anon_key
SUPABASE_DEV_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 运行测试

```bash
# 运行简单的测试示例
npm run test:example

# 运行所有测试（需要先安装 Jest）
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 📁 测试结构

```
test/
├── unit/           # 单元测试
├── integration/    # 集成测试
├── e2e/           # 端到端测试
├── fixtures/      # 测试数据
├── utils/         # 测试工具
├── setup.ts       # 测试环境设置
├── jest.config.js # Jest 配置
└── README.md      # 测试文档
```

## 🧪 测试类型

### 单元测试
测试单个函数或组件：
```bash
npm run test:unit
```

### 集成测试
测试组件间的交互：
```bash
npm run test:integration
```

### 端到端测试
测试完整的用户流程：
```bash
npm run test:e2e
```

## 📝 编写测试

### 测试文件命名
- 单元测试: `*.test.ts` 或 `*.spec.ts`
- 集成测试: `*.integration.test.ts`
- 端到端测试: `*.e2e.test.ts`

### 测试示例

```typescript
import { SupabaseTestClient } from '../utils/supabase-test-client'
import { generateRandomUser } from '../fixtures/users'

describe('用户操作', () => {
  it('应该能够创建用户', async () => {
    const userData = generateRandomUser()
    const client = SupabaseTestClient.getServiceClient()
    
    const { data, error } = await client
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.email).toBe(userData.email)
  })
})
```

## 🛠️ 测试工具

### SupabaseTestClient
提供测试用的 Supabase 客户端：

```typescript
import { SupabaseTestClient } from '../utils/supabase-test-client'

// 获取普通客户端
const client = SupabaseTestClient.getClient()

// 获取服务角色客户端
const serviceClient = SupabaseTestClient.getServiceClient()

// 清理测试数据
await SupabaseTestClient.cleanupTestData()
```

### 测试数据 Fixtures
使用预定义的测试数据：

```typescript
import { mockUsers, generateRandomUser } from '../fixtures/users'

// 使用预定义数据
const user = mockUsers[0]

// 生成随机测试数据
const randomUser = generateRandomUser()
```

## 🔧 测试配置

### Jest 配置
测试配置位于 `test/jest.config.js`：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000
}
```

### 环境设置
全局测试设置位于 `test/setup.ts`：

```typescript
// 加载环境变量
dotenv.config({ path: '.env' })

// 设置测试环境
process.env.NODE_ENV = 'development'
```

## 📊 测试覆盖率

生成测试覆盖率报告：

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录中。

## 🚨 注意事项

1. **数据清理**: 测试会自动清理带有 'test' 字样的测试数据
2. **环境隔离**: 使用开发环境进行测试，避免影响生产数据
3. **异步操作**: 所有数据库操作都是异步的，记得使用 `await`
4. **错误处理**: 测试中要考虑错误情况和边界条件

## 🔗 相关链接

- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Supabase 测试指南](https://supabase.com/docs/guides/getting-started/testing)
- [TypeScript 测试最佳实践](https://typescript-eslint.io/docs/) 