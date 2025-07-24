# My Dashboard App - Project Structure

## 项目概述

这是一个使用 Next.js 15 开发的交互式学习平台，支持 Python 和 JavaScript 的学习。项目采用现代化的技术栈，包括 React 19、Tailwind CSS v4、shadcn/ui 组件库以及 Zustand 状态管理。

## 技术架构

### 前端框架
- **Next.js 15**: 使用 App Router 构建，支持 React Server Components
- **React 19**: 最新的 React 版本，提供更好的性能和新特性
- **TypeScript**: 提供静态类型检查，增强代码质量

### UI 框架和组件库
- **Tailwind CSS v4**: 使用最新的 Tailwind CSS 实现响应式设计和样式
- **shadcn/ui**: 基于 Radix UI 和 Tailwind CSS 构建的可访问组件库
- **Lucide React**: 图标库

### 状态管理
- **Zustand**: 轻量级状态管理库，用于全局状态管理

### 代码编辑器
- **CodeMirror**: 用于代码编辑和语法高亮
- **@uiw/react-codemirror**: React 封装的 CodeMirror 组件

### 其他重要依赖
- **Pyodide**: 在浏览器中运行 Python 代码
- **react-hook-form**: 表单处理
- **zod**: 数据验证
- **react-markdown**: Markdown 渲染
- **remark-gfm & rehype-katex**: Markdown 扩展和数学公式支持

## UI 层级结构

```
App (Root)
├── PageLayout
│   ├── Header (非学习页面)
│   └── main (容器)
│       └── children (页面内容)
│
├── LearnLayout (学习页面)
│   ├── LearnNavBar (顶部导航栏)
│   └── main (三栏布局容器)
│       ├── NavigationSidebar (左侧导航)
│       ├── ContentDisplay (中间内容区)
│       └── AIChatSidebar (右侧AI聊天)
│
└── Pages
    ├── DashboardPage (主页)
    └── LearnPage (学习页面)
```

### 页面层级

1. **主页 (/)**
   - 展示项目概览
   - 提供到学习平台的链接
   - 显示项目统计信息

2. **学习平台 (/learn)**
   - 三栏式布局设计
   - 左侧: 章节导航
   - 中间: 内容展示
   - 右侧: AI 助手聊天

## 设计风格

### 颜色系统
使用 Tailwind CSS 的颜色变量系统，支持浅色和深色模式:
- 主色调: 橙色系
- 辅助色: 黄色系
- 中性色: 灰色系

### 组件设计
- 使用 shadcn/ui 组件库，遵循现代化设计原则
- 卡片式布局，清晰的信息层次
- 圆角设计，柔和的视觉效果
- 合理的间距和排版

### 响应式设计
- 桌面端: 三栏布局
- 移动端: 单栏布局，内容优先展示

## 渲染和加载方式

### 页面渲染
- 使用 Next.js 的服务端渲染(SSR)和静态生成(SSG)
- 客户端组件使用 "use client" 指令标识
- 动态导入和代码分割优化加载性能

### 数据加载
- 使用 Zustand 管理全局状态
- 异步加载学习路径和章节内容
- 使用本地存储持久化用户数据

### 代码执行
- JavaScript: 使用浏览器原生的 Function 构造函数执行
- Python: 使用 Pyodide 在浏览器中执行 Python 代码

### 资源加载
- 使用 Next.js 的字体优化功能加载 Google Fonts
- 代码编辑器动态加载语言包
- 图标使用 Lucide React 组件

## 目录结构

```
my-dashboard-app/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── (learn)/          # 学习平台布局和页面
│   │   ├── settings/         # 设置页面
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 主页
│   ├── components/           # React 组件
│   │   ├── ui/               # shadcn/ui 组件
│   │   └── ...               # 自定义组件
│   ├── hooks/                # 自定义 React Hooks
│   ├── lib/                  # 工具函数和库
│   ├── services/             # 服务层
│   ├── store/                # Zustand 状态管理
│   └── types/                # TypeScript 类型定义
├── public/                   # 静态资源
├── package.json              # 项目依赖和脚本
└── tailwind.config.ts        # Tailwind 配置
```

## 开发和构建

### 开发环境
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 代码检查
```bash
npm run lint
```