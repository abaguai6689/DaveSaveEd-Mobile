# DaveSaveEd Mobile

《潜水员戴夫》(Dave the Diver) 游戏存档修改器的移动端版本。

## 功能特性

- 修改游戏货币（金币、贝币、工匠之火、粉丝数）
- 最大化食材数量
- 完整的存档加密/解密支持
- 移动端友好的用户界面
- 支持 Android 和 iOS

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **移动框架**: Capacitor
- **构建工具**: Vite
- **CI/CD**: GitHub Actions

## 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/DaveSaveEd-Mobile.git
cd DaveSaveEd-Mobile

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建 Android APK

```bash
# 构建 Web 应用
npm run build

# 同步 Capacitor
npm run sync

# 构建 Android
npm run android:build
```

## GitHub Actions 自动构建

本项目配置了 GitHub Actions 工作流，可以自动构建 Android APK。

### 触发方式

1. **推送到 main 分支**: 自动构建 Debug APK
2. **创建标签**: 推送到 `v*` 标签（如 `v1.0.0`）时，会构建并发布 Release APK
3. **手动触发**: 在 Actions 页面手动运行工作流

### 发布 Release

要发布正式版本：

```bash
# 创建新标签
git tag v1.0.0

# 推送到远程
git push origin v1.0.0
```

GitHub Actions 会自动构建签名 APK 并创建 Release。

### 配置签名密钥（可选）

要构建签名的 Release APK，需要在仓库设置中添加以下 Secrets：

1. 生成签名密钥：
```bash
keytool -genkey -v -keystore davesaveed.keystore -alias davesaveed -keyalg RSA -keysize 2048 -validity 10000
```

2. Base64 编码密钥文件：
```bash
base64 -i davesaveed.keystore
```

3. 在 GitHub 仓库设置中添加 Secrets：
   - `SIGNING_KEY`: Base64 编码的密钥文件内容
   - `ALIAS`: 密钥别名
   - `KEY_STORE_PASSWORD`: 密钥库密码
   - `KEY_PASSWORD`: 密钥密码

## 使用说明

### Android

1. 下载 APK 文件
2. 允许安装未知来源应用
3. 安装并打开应用
4. 选择 .sav 存档文件
5. 修改数值
6. 保存并覆盖原存档

### 存档位置

**Steam 版（PC）**：
```
%LOCALAPPDATA%Low\nexon\DAVE THE DIVER\SteamSData\[SteamID]\
```

**Android 模拟器**：
存档位置取决于模拟器配置，通常在：
```
/Android/data/[游戏包名]/files/
```

## 已知问题与修复

### 问题：GitHub Actions 构建失败

**错误信息：**
```
Dependencies lock file is not found...
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**修复方法：**
工作流已更新，使用 `npm install` 代替 `npm ci`，不再需要 `package-lock.json`。

如果你使用的是旧版本，请更新 `.github/workflows/build-android.yml` 文件。

## 项目结构

```
DaveSaveEd-Mobile/
├── .github/workflows/     # GitHub Actions 配置
├── android/               # Android 原生项目（自动生成）
├── ios/                   # iOS 原生项目（自动生成）
├── src/
│   ├── core/             # 核心加密解密逻辑
│   │   └── saveEditor.ts
│   ├── components/       # React 组件
│   │   ├── SaveEditor.tsx
│   │   └── FileUploader.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── capacitor.config.ts
├── vite.config.ts
└── README.md
```

## 核心算法

存档使用 XOR 加密，密钥为 `"GameData"`。特殊字段（如 FarmAnimal）会导致密钥失步，需要特殊处理。

详细实现见 `src/core/saveEditor.ts`。

## 文档索引

| 文档 | 说明 |
|------|------|
| `QUICK_START.md` | 5分钟快速开始 |
| `SETUP_GUIDE.md` | 详细设置说明 |
| `PROJECT_STRUCTURE.md` | 项目结构说明 |
| `FIX_GUIDE.md` | 问题修复指南 |

## 免责声明

- 本工具为第三方独立开发，与 Mintrocket、Nexon 或游戏官方无关
- 使用本工具修改存档可能导致游戏不稳定或存档损坏
- 建议在修改前备份原存档
- 使用风险自负

## 许可证

本项目采用与原版相同的许可证。

## 致谢

- 原版项目：[FNGarvin/DaveSaveEd](https://github.com/FNGarvin/DaveSaveEd)
- [Capacitor](https://capacitorjs.com/)
- [React](https://react.dev/)
