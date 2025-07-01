# 快速开始指南

这个指南将帮助您快速设置 Supabase 多环境项目并开始使用 Edge Functions 进行数据库操作。

## 前置要求

1. **Node.js** (版本 16 或更高)
2. **Supabase CLI** (最新版本)
3. **Git**

## 1. 安装依赖

```bash
# 安装项目依赖
npm install

# 全局安装 Supabase CLI
npm install -g supabase
```

## 2. 登录 Supabase

```bash
supabase login
```

## 3. 配置环境变量

1. 复制环境变量示例文件：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，填入您的 Supabase 项目信息：
```bash
# 开发环境
SUPABASE_DEV_URL=https://your-dev-project.supabase.co
SUPABASE_DEV_ANON_KEY=your-dev-anon-key
SUPABASE_DEV_SERVICE_ROLE_KEY=your-dev-service-role-key
SUPABASE_DEV_PROJECT_REF=your-dev-project-ref

# 测试环境
SUPABASE_STAGING_URL=https://your-staging-project.supabase.co
SUPABASE_STAGING_ANON_KEY=your-staging-anon-key
SUPABASE_STAGING_SERVICE_ROLE_KEY=your-staging-service-role-key
SUPABASE_STAGING_PROJECT_REF=your-staging-project-ref

# 生产环境
SUPABASE_PROD_URL=https://your-prod-project.supabase.co
SUPABASE_PROD_ANON_KEY=your-prod-anon-key
SUPABASE_PROD_SERVICE_ROLE_KEY=your-prod-service-role-key
SUPABASE_PROD_PROJECT_REF=your-prod-project-ref
```

## 4. 初始化项目

### 开发环境
```bash
# 初始化开发环境
./scripts/deploy.sh dev init

# 链接到开发项目
./scripts/deploy.sh dev link

# 启动本地开发服务器
supabase start
```

### 测试环境
```bash
# 链接到测试项目
./scripts/deploy.sh staging link

# 部署到测试环境
./scripts/deploy.sh staging deploy
```

### 生产环境
```bash
# 链接到生产项目
./scripts/deploy.sh prod link

# 部署到生产环境
./scripts/deploy.sh prod deploy
```

## 5. 数据库操作

### 创建新的迁移
```bash
supabase migration new create_new_table
```

### 应用迁移
```bash
# 开发环境
supabase db push

# 测试环境
./scripts/deploy.sh staging db

# 生产环境
./scripts/deploy.sh prod db
```

### 重置数据库
```bash
# 开发环境
supabase db reset

# 其他环境
./scripts/deploy.sh staging reset
./scripts/deploy.sh prod reset
```

## 6. Edge Functions

### 本地开发
```bash
# 启动函数服务器
supabase functions serve

# 在另一个终端中测试
curl -X POST http://localhost:54321/functions/v1/users \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 部署函数
```bash
# 部署所有函数
supabase functions deploy

# 部署特定函数
supabase functions deploy users

# 使用脚本部署到特定环境
./scripts/deploy.sh staging functions
./scripts/deploy.sh prod functions
```

## 7. 测试 API

### 使用测试脚本
```bash
# 测试开发环境
./scripts/test-api.sh dev users

# 测试测试环境
./scripts/test-api.sh staging users

# 测试生产环境
./scripts/test-api.sh prod users
```

### 手动测试
```bash
# 获取所有用户
curl -X GET https://your-project.supabase.co/functions/v1/users \
  -H "Authorization: Bearer your-anon-key"

# 创建用户
curl -X POST https://your-project.supabase.co/functions/v1/users \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","name":"New User","age":25}'

# 更新用户
curl -X PUT https://your-project.supabase.co/functions/v1/users/user-id \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","age":26}'

# 删除用户
curl -X DELETE https://your-project.supabase.co/functions/v1/users/user-id \
  -H "Authorization: Bearer your-anon-key"
```

## 8. 项目结构

```
├── supabase/
│   ├── config.toml              # Supabase 配置
│   ├── migrations/              # 数据库迁移文件
│   │   └── 20240101000000_create_users_table.sql
│   ├── functions/               # Edge Functions
│   │   └── users/
│   │       └── index.ts         # 用户管理函数
│   └── seed.sql                # 种子数据
├── lib/
│   └── config.ts               # 环境配置工具
├── scripts/
│   ├── deploy.sh               # 部署脚本
│   └── test-api.sh             # API 测试脚本
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── env.example                 # 环境变量示例
└── README.md                   # 项目文档
```

## 9. 常用命令

### 开发
```bash
npm run dev                    # 启动本地开发服务器
npm run functions:serve        # 启动函数服务器
npm run migration:new          # 创建新迁移
npm run migration:up           # 应用迁移
```

### 部署
```bash
npm run deploy:dev             # 部署到开发环境
npm run deploy:staging         # 部署到测试环境
npm run deploy:prod            # 部署到生产环境
```

### 测试
```bash
npm run build                  # 构建项目
./scripts/test-api.sh dev users # 测试开发环境 API
```

## 10. 故障排除

### 常见问题

1. **Supabase CLI 未安装**
   ```bash
   npm install -g supabase
   ```

2. **环境变量未设置**
   - 确保 `.env` 文件存在并包含所有必需的环境变量
   - 检查环境变量名称是否正确

3. **函数部署失败**
   - 确保已链接到正确的 Supabase 项目
   - 检查函数代码是否有语法错误
   - 验证环境变量是否正确设置

4. **数据库连接失败**
   - 检查数据库 URL 是否正确
   - 确保数据库服务正在运行
   - 验证网络连接

### 获取帮助

- 查看 [Supabase 文档](https://supabase.com/docs)
- 检查 [Supabase CLI 文档](https://supabase.com/docs/reference/cli)
- 查看项目中的 `README.md` 文件

## 下一步

1. 创建更多的数据库表
2. 添加更多的 Edge Functions
3. 实现更复杂的业务逻辑
4. 添加身份验证和授权
5. 集成前端应用 