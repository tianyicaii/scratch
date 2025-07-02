# Supabase 多环境项目

这个项目使用 Supabase 作为后端服务，支持多环境部署（开发、测试、生产），包含用户管理 API、数据库迁移、Edge Functions 和完整的测试框架。

## 🌟 特性

- ✅ **多环境支持** - 开发、测试、生产环境配置
- ✅ **Edge Functions** - 用户 CRUD API
- ✅ **数据库迁移** - 版本化的数据库架构
- ✅ **自动化脚本** - 部署、测试、环境配置
- ✅ **测试框架** - 单元测试和集成测试
- ✅ **TypeScript 支持** - 完整的类型定义

## 🚀 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone <your-repo-url>
cd supabase-multi-env-project
npm install
```

### 2. 安装 Supabase CLI

```bash
# macOS (推荐使用 Homebrew)
brew install supabase/tap/supabase

# 或者使用 npm
npm install -g supabase
```

### 3. 登录 Supabase

```bash
supabase login
```

### 4. 初始化环境配置

```bash
# 创建环境变量文件
./scripts/setup-env.sh init
```

这会创建一个 `.env` 文件模板，包含所有必要的环境变量。

### 5. 配置 Supabase 项目

#### 选项 A: 使用现有项目（推荐）

如果你有 Supabase 项目，配置测试环境：

```bash
# 配置测试环境密钥
./scripts/setup-env.sh staging
```

脚本会提示你输入：
- Supabase anon public key
- Supabase service_role secret key

#### 选项 B: 创建新项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 从项目设置 → API 获取密钥
4. 运行配置脚本：
   ```bash
   ./scripts/setup-env.sh staging
   ```

### 6. 初始化和部署项目

```bash
# 初始化 Supabase 项目
./scripts/deploy.sh staging init

# 链接到远程项目
./scripts/deploy.sh staging link

# 部署数据库和函数
./scripts/deploy.sh staging deploy
```

### 7. 验证部署

```bash
# 验证环境配置
./scripts/setup-env.sh validate

# 测试 API
./scripts/test-api.sh staging users

# 或者运行测试套件
npm run test:example
```

## 📋 环境配置

项目支持以下环境：

| 环境 | 描述 | 用途 |
|------|------|------|
| `development` | 本地开发环境 | 本地开发和测试 |
| `staging` | 测试环境 | 集成测试和预发布 |
| `production` | 生产环境 | 正式生产部署 |

## 🛠️ 开发工作流

### 本地开发

```bash
# 启动本地 Supabase (如需要)
supabase start

# 运行本地函数
supabase functions serve

# 运行测试
npm test
npm run test:example
```

### 部署到测试环境

```bash
# 部署数据库迁移
./scripts/deploy.sh staging db

# 部署 Edge Functions
./scripts/deploy.sh staging functions

# 或者一次性部署所有
./scripts/deploy.sh staging deploy
```

### 测试 API

```bash
# 测试所有用户 API 端点
./scripts/test-api.sh staging users

# 运行集成测试
npm run test:integration
```

## 🗂️ 项目结构

```
├── lib/                    # 共享库和配置
│   └── config.ts          # 多环境配置管理
├── scripts/               # 自动化脚本
│   ├── deploy.sh         # 部署脚本
│   ├── setup-env.sh      # 环境配置脚本
│   └── test-api.sh       # API 测试脚本
├── supabase/             # Supabase 项目文件
│   ├── config.toml       # Supabase 配置
│   ├── migrations/       # 数据库迁移文件
│   └── functions/        # Edge Functions
│       └── users/        # 用户管理 API
├── test/                 # 测试文件
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   ├── fixtures/        # 测试数据
│   └── utils/           # 测试工具
├── .env                 # 环境变量 (自动生成)
├── package.json         # 项目依赖和脚本
└── README.md           # 项目文档
```

## 🛢️ 数据库操作

### 创建新迁移

```bash
# 使用 Supabase CLI
supabase migration new create_new_table

# 或使用部署脚本
./scripts/deploy.sh staging db
```

### 管理数据库

```bash
# 应用迁移
./scripts/deploy.sh staging db

# 重置数据库 (谨慎使用!)
./scripts/deploy.sh staging reset

# 运行种子数据
./scripts/deploy.sh staging seed
```

## ⚡ Edge Functions

### 可用的函数

| 函数名 | 端点 | 功能 |
|--------|------|------|
| `users` | `/functions/v1/users` | 用户 CRUD 操作 |

### 用户 API 端点

```bash
# 获取所有用户
GET /functions/v1/users

# 获取单个用户
GET /functions/v1/users/{id}

# 创建用户
POST /functions/v1/users
{
  "email": "user@example.com",
  "name": "User Name",
  "age": 25
}

# 更新用户
PUT /functions/v1/users/{id}
{
  "name": "Updated Name",
  "age": 26
}

# 删除用户
DELETE /functions/v1/users/{id}
```

### 函数开发

```bash
# 本地开发
supabase functions serve

# 部署单个函数
./scripts/deploy.sh staging functions

# 测试函数
./scripts/test-api.sh staging users
```

## 🧪 测试

### 可用的测试命令

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行测试示例 (不需要 Jest)
npm run test:example

# 生成测试覆盖率
npm run test:coverage
```

### 测试配置

- **单元测试**: 测试单个函数和组件
- **集成测试**: 测试数据库交互和 API
- **测试数据**: 自动生成和清理
- **环境隔离**: 使用独立的测试环境

## 🚨 故障排除

### 常见问题

#### 1. "fetch failed" 错误

```bash
# 检查环境变量配置
./scripts/setup-env.sh validate

# 确认网络连接
curl https://your-project.supabase.co/rest/v1/
```

#### 2. 权限错误

```bash
# 检查 service_role 密钥配置
grep SUPABASE_STAGING_SERVICE_ROLE_KEY .env

# 重新配置环境
./scripts/setup-env.sh staging
```

#### 3. 部署失败

```bash
# 检查 Supabase CLI 登录状态
supabase login

# 验证项目链接
supabase projects list
```

#### 4. 测试失败

```bash
# 检查数据库连接
npm run test:example

# 清理测试数据
# 测试会自动清理，或手动删除包含 'test' 的用户
```

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Edge Functions 指南](https://supabase.com/docs/guides/functions)
- [数据库迁移](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [认证和授权](https://supabase.com/docs/guides/auth)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
