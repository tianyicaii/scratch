# TypeScript Project

一个基本的 TypeScript 项目模板，包含了现代化的配置和最佳实践。

## 项目结构

```
├── src/                # 源代码目录
│   └── index.ts       # 主入口文件
├── dist/              # 编译输出目录
├── package.json       # 项目配置和依赖
├── tsconfig.json      # TypeScript 配置
├── .gitignore         # Git 忽略文件
└── README.md          # 项目说明
```

## 安装依赖

```bash
npm install
```

## 可用脚本

- `npm run build` - 编译 TypeScript 代码到 `dist/` 目录
- `npm run start` - 运行编译后的 JavaScript 代码
- `npm run dev` - 使用 ts-node 直接运行 TypeScript 代码
- `npm run watch` - 监听文件变化并自动编译
- `npm run clean` - 清理编译输出目录

## 开发流程

1. 在 `src/` 目录下编写 TypeScript 代码
2. 使用 `npm run dev` 进行开发和测试
3. 使用 `npm run build` 编译生产版本
4. 使用 `npm run start` 运行编译后的代码

## TypeScript 配置特性

- 严格类型检查
- ES2020 目标版本
- CommonJS 模块系统
- 源码映射支持
- 声明文件生成
- 现代化的编译选项

## 开始开发

项目已经包含了一个简单的用户管理示例，您可以基于此开始开发您的应用程序。

祝您编程愉快！ 🎉 