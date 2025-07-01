# Supabase 多环境项目

这个项目使用 Supabase 作为后端服务，支持多环境部署（开发、测试、生产）。

## 环境配置

项目支持以下环境：
- `development` - 开发环境
- `staging` - 测试环境  
- `production` - 生产环境

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 安装 Supabase CLI
```bash
npm install -g supabase
```

3. 登录 Supabase
```bash
supabase login
```

4. 初始化项目
```bash
supabase init
```

5. 链接到 Supabase 项目
```bash
# 开发环境
supabase link --project-ref YOUR_DEV_PROJECT_REF

# 测试环境
supabase link --project-ref YOUR_STAGING_PROJECT_REF

# 生产环境
supabase link --project-ref YOUR_PROD_PROJECT_REF
```

## 环境变量配置

复制 `.env.example` 到 `.env` 并配置相应的环境变量：

```bash
cp .env.example .env
```

## 数据库操作

### 创建迁移
```bash
supabase migration new migration_name
```

### 应用迁移
```bash
supabase db push
```

### 重置数据库
```bash
supabase db reset
```

## Edge Functions

### 本地开发
```bash
supabase functions serve
```

### 部署函数
```bash
supabase functions deploy function_name
```

## 项目结构

```
├── supabase/
│   ├── config.toml          # Supabase 配置
│   ├── migrations/          # 数据库迁移文件
│   ├── functions/           # Edge Functions
│   └── seed.sql            # 种子数据
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
└── README.md              # 项目文档
```
