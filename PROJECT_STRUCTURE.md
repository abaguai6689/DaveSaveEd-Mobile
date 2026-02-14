# 项目结构说明

```
DaveSaveEd-Mobile/
├── .github/
│   └── workflows/
│       └── build-android.yml      # GitHub Actions 工作流配置
│
├── public/
│   └── vite.svg                   # 网站图标
│
├── src/
│   ├── core/
│   │   └── saveEditor.ts          # 核心存档编辑逻辑（XOR加密/解密）
│   ├── components/
│   │   ├── FileUploader.tsx       # 文件上传组件
│   │   └── SaveEditor.tsx         # 存档编辑器组件
│   ├── App.tsx                    # 主应用组件
│   ├── main.tsx                   # 应用入口
│   └── index.css                  # 全局样式
│
├── .eslintrc.cjs                  # ESLint 配置
├── .gitignore                     # Git 忽略规则
├── capacitor.config.ts            # Capacitor 配置
├── index.html                     # HTML 入口
├── init-project.sh                # 项目初始化脚本
├── package.json                   # 项目依赖配置
├── postcss.config.js              # PostCSS 配置
├── tailwind.config.js             # Tailwind CSS 配置
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.node.json             # TypeScript Node 配置
├── vite.config.ts                 # Vite 构建配置
├── README.md                      # 项目说明
├── SETUP_GUIDE.md                 # 详细设置指南
└── PROJECT_STRUCTURE.md           # 本文件
```

## 核心文件说明

### saveEditor.ts

这是项目的核心文件，包含：
- `decodeSavToJson()` - 将 .sav 文件解码为 JSON
- `encodeJsonToSav()` - 将 JSON 编码为 .sav 文件
- `xorBytes()` - XOR 加密/解密函数
- 存档数据操作函数（设置金币、贝币等）

### build-android.yml

GitHub Actions 工作流配置，包含：
- Web 应用构建
- Android APK 构建（Debug 和 Release）
- 自动签名（需要配置 Secrets）
- GitHub Release 发布

### App.tsx

主应用组件，负责：
- 文件上传处理
- 存档解码/编码
- 状态管理
- UI 布局

## 依赖说明

### 生产依赖
- `react` / `react-dom` - React 框架
- `@capacitor/core` - Capacitor 核心
- `@capacitor/android` - Android 平台支持
- `@capacitor/filesystem` - 文件系统访问
- `lucide-react` - 图标库

### 开发依赖
- `vite` - 构建工具
- `typescript` - TypeScript 支持
- `tailwindcss` - CSS 框架
- `@capacitor/cli` - Capacitor CLI

## 构建流程

1. **Web 构建**
   ```
   npm run build
   ```
   输出: `dist/` 目录

2. **Capacitor 同步**
   ```
   npx cap sync
   ```
   将 Web 构建输出同步到原生项目

3. **Android 构建**
   ```
   cd android && ./gradlew assembleDebug
   ```
   输出: `android/app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions 流程

```
Push to main
    │
    ▼
┌─────────────┐
│ Build Web   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Build       │
│ Android     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Upload      │
│ Artifacts   │
└─────────────┘
```

## 扩展开发

### 添加新功能

1. 在 `saveEditor.ts` 中添加核心逻辑
2. 在 `SaveEditor.tsx` 中添加 UI 控件
3. 更新 `App.tsx` 中的状态管理

### 添加新平台

1. 安装平台包：`npm install @capacitor/ios`
2. 添加平台：`npx cap add ios`
3. 同步：`npx cap sync`

### 自定义样式

- 修改 `tailwind.config.js` 自定义主题
- 修改 `src/index.css` 添加全局样式
- 在组件中使用 Tailwind 类名
