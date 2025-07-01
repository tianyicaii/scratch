# TypeScript Full Stack Application 🚀

一个现代化的全栈应用模板，包含 React + TypeScript 前端、Node.js + Express + TypeScript 后端，以及 Electron + TypeScript + React 桌面应用。

## 项目结构

```
├── backend/            # 后端 API 服务器
│   ├── src/
│   │   └── index.ts   # Express 服务器入口
│   ├── package.json   # 后端依赖配置
│   └── tsconfig.json  # 后端 TypeScript 配置
├── frontend/          # React 前端应用
│   ├── src/
│   │   ├── App.tsx    # 主应用组件
│   │   ├── App.css    # 应用样式
│   │   └── main.tsx   # React 入口文件
│   ├── package.json   # 前端依赖配置
│   └── tsconfig.json  # 前端 TypeScript 配置
├── desktop/           # Electron 桌面应用
│   ├── src/
│   │   ├── main/      # Electron 主进程
│   │   ├── renderer/  # React 渲染进程
│   │   └── preload/   # Preload 脚本
│   ├── package.json   # 桌面应用依赖配置
│   ├── tsconfig.json  # 桌面应用 TypeScript 配置
│   └── vite.config.ts # Vite 构建配置
├── package.json       # 根项目配置和脚本
├── tsconfig.json      # TypeScript 项目引用配置
├── .prettierrc        # Prettier 配置
├── .eslintrc.js       # ESLint 配置
└── README.md          # 项目说明
```

## 🚀 快速开始

### 安装所有依赖

```bash
npm run install:all
```

### 开发模式（同时启动前后端）

```bash
npm run dev
```

这将同时启动：

- 后端服务器: http://localhost:3001
- 前端应用: http://localhost:5173

### 启动所有应用（包括桌面应用）

```bash
npm run dev:all
```

这将同时启动：

- 后端服务器: http://localhost:3001
- 前端应用: http://localhost:5173
- 桌面应用: Electron 窗口

### 分别启动各个应用

```bash
# 仅启动后端
npm run dev:backend

# 仅启动前端
npm run dev:frontend

# 仅启动桌面应用
npm run dev:desktop
```

## 📋 可用脚本

### 🔧 开发和构建

- `npm run dev` - 同时启动前后端开发服务器
- `npm run dev:all` - 同时启动前后端和桌面应用
- `npm run dev:backend` - 启动后端开发服务器
- `npm run dev:frontend` - 启动前端开发服务器
- `npm run dev:desktop` - 启动桌面应用
- `npm run build` - 构建所有应用的生产版本
- `npm run start` - 启动生产版本（需先构建）

### 🎨 代码格式化和检查

- `npm run format` - 格式化所有代码
- `npm run format:check` - 检查代码格式
- `npm run lint` - 检查前后端代码质量
- `npm run type-check` - 进行 TypeScript 类型检查

### 🧹 清理

- `npm run clean` - 清理所有构建输出

## 🛠️ 技术栈

### 前端

- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具和开发服务器
- **现代 CSS** - 渐变背景和毛玻璃效果

### 后端

- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **TypeScript** - 类型安全的服务器端代码
- **CORS** - 跨域资源共享支持

### 桌面应用

- **Electron** - 跨平台桌面应用框架
- **React** - 与前端相同的 UI 库
- **TypeScript** - 类型安全的桌面应用开发
- **Vite** - 渲染进程构建工具

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **ts-node** - 直接运行 TypeScript
- **concurrently** - 同时运行多个命令

## 🌟 功能特性

- ✅ 前后端完全分离的架构
- ✅ TypeScript 全栈类型安全（包括桌面应用）
- ✅ 热重载开发体验（Web + 桌面）
- ✅ 现代化的 UI 设计（Web + 桌面）
- ✅ API 通信示例（支持跨平台）
- ✅ 统一的代码格式化和质量检查
- ✅ 生产就绪的构建配置
- ✅ Electron 桌面应用支持（Windows/macOS/Linux）
- ✅ Monorepo 工作区管理

## 🎯 开始开发

1. 项目已经包含了一个基本的 Welcome API 示例
2. 前端和桌面应用都会自动调用后端 API 并显示欢迎信息
3. 桌面应用具有与 Web 前端相同的功能，但运行在 Electron 环境中
4. 您可以基于此开始开发您的业务功能（支持 Web + 桌面双端）

## 📡 API 端点

- `GET /api/welcome` - 获取欢迎信息
- `GET /api/health` - 健康检查

祝您编程愉快！ 🎉✨
