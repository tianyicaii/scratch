# 🏗️ Monorepo 架构说明

## 🎯 项目概述

这是一个使用 **npm workspaces** 管理的 TypeScript 全栈 Monorepo，包含：

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **共享配置**: ESLint, Prettier, TypeScript

## 📁 项目结构

```
typescript-fullstack-monorepo/
├── package.json              # 根工作区配置
├── tsconfig.json             # TypeScript 项目引用根配置
├── .eslintrc.js              # 共享 ESLint 配置
├── .prettierrc               # 共享 Prettier 配置
├── .vscode/                  # 共享 VS Code 配置
├── backend/                  # 后端工作区
│   ├── src/
│   │   └── index.ts         # Express 服务器
│   ├── package.json         # 后端依赖和脚本
│   └── tsconfig.json        # 后端 TypeScript 配置
└── frontend/                 # 前端工作区
    ├── src/
    │   ├── App.tsx          # React 主组件
    │   └── main.tsx         # React 入口
    ├── package.json         # 前端依赖和脚本
    └── tsconfig.json        # 前端 TypeScript 配置
```

## 🚀 快速开始

### 安装依赖（一次性安装所有工作区）

```bash
npm install
```

### 开发模式（同时启动前后端）

```bash
npm run dev
```

## 📋 Monorepo 命令

### 🔧 开发和构建

```bash
# 同时启动前后端开发服务器（推荐）
npm run dev

# 分别启动
npm run dev:backend      # 启动后端 (http://localhost:3001)
npm run dev:frontend     # 启动前端 (http://localhost:5173)

# 构建所有工作区
npm run build

# 构建特定工作区
npm run build:backend
npm run build:frontend
```

### 🎨 代码质量

```bash
# 格式化所有代码
npm run format

# 检查所有工作区的代码质量
npm run lint

# 自动修复 lint 问题
npm run lint:fix

# TypeScript 类型检查
npm run type-check

# 监听模式的类型检查
npm run type-check:watch
```

### 🧪 测试

```bash
# 运行所有工作区的测试（如果存在）
npm run test
```

### 🔧 依赖管理

```bash
# 更新所有工作区依赖
npm run deps:update

# 安全审计所有工作区
npm run deps:audit

# 清理所有构建产物和缓存
npm run clean
```

### 🎯 工作区特定操作

```bash
# 在特定工作区运行命令
npm run <script> --workspace=<workspace-name>

# 例如：
npm run dev --workspace=backend
npm run build --workspace=frontend
npm install <package> --workspace=backend
```

## 🌟 Monorepo 优势

### ✅ 统一管理

- **依赖管理**: 共享依赖，减少重复安装
- **配置统一**: ESLint, Prettier, TypeScript 配置共享
- **脚本统一**: 一套命令管理所有子项目

### ✅ 开发效率

- **一键启动**: `npm run dev` 启动完整开发环境
- **热重载**: 前后端代码修改立即生效
- **类型安全**: 全栈 TypeScript 支持

### ✅ 代码质量

- **统一标准**: 所有项目使用相同的代码规范
- **自动格式化**: 保存时自动格式化
- **类型检查**: 构建时自动进行类型检查

### ✅ 部署便利

- **统一构建**: 一个命令构建所有项目
- **版本管理**: 统一的版本控制
- **CI/CD 友好**: 更容易配置持续集成

## 🔧 自定义配置

### 添加新的工作区

1. 创建新目录，如 `shared/`
2. 在根 `package.json` 的 `workspaces` 数组中添加 `"shared"`
3. 在新目录创建 `package.json`
4. 运行 `npm install` 重新链接依赖

### 工作区间共享代码

```bash
# 从一个工作区引用另一个工作区的包
npm install <workspace-name> --workspace=<target-workspace>
```

## 🎯 最佳实践

1. **依赖管理**: 尽量在根目录安装共享依赖
2. **配置文件**: 共享配置放在根目录
3. **脚本命名**: 保持工作区间脚本命名一致
4. **类型定义**: 可考虑创建 `@types` 工作区共享类型
5. **环境变量**: 使用 `.env` 文件管理不同环境配置

这个 Monorepo 为您的全栈开发提供了一个强大、高效的工作环境！🚀
