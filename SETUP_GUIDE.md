# DaveSaveEd Mobile 设置指南

本文档详细介绍如何设置仓库并使用 GitHub Actions 构建 Android APP。

## 目录

1. [创建 GitHub 仓库](#1-创建-github-仓库)
2. [上传代码](#2-上传代码)
3. [配置 GitHub Actions](#3-配置-github-actions)
4. [构建 APK](#4-构建-apk)
5. [发布 Release](#5-发布-release)

---

## 1. 创建 GitHub 仓库

### 步骤 1.1: 登录 GitHub

访问 [github.com](https://github.com) 并登录你的账号。

### 步骤 1.2: 创建新仓库

1. 点击右上角 **+** 按钮，选择 **New repository**
2. 填写仓库信息：
   - **Repository name**: `DaveSaveEd-Mobile`（或其他你喜欢的名字）
   - **Description**: `Dave the Diver 存档修改器 - 移动端`
   - **Visibility**: 选择 `Public`（免费）或 `Private`（需要付费才能使用 Actions）
   - **Initialize**: 不要勾选任何选项（我们会手动上传）
3. 点击 **Create repository**

---

## 2. 上传代码

### 方法 A: 使用 Git 命令行

```bash
# 1. 进入项目目录
cd DaveSaveEd-Mobile

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: DaveSaveEd Mobile v1.0.0"

# 5. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/DaveSaveEd-Mobile.git

# 6. 推送
git branch -M main
git push -u origin main
```

### 方法 B: 使用 GitHub Desktop

1. 打开 GitHub Desktop
2. 选择 **File** → **Add local repository**
3. 选择 `DaveSaveEd-Mobile` 文件夹
4. 填写提交信息，点击 **Commit to main**
5. 点击 **Publish repository**

### 方法 C: 直接上传文件

1. 在新创建的仓库页面，点击 **uploading an existing file**
2. 拖拽或选择所有项目文件
3. 填写提交信息
4. 点击 **Commit changes**

---

## 3. 配置 GitHub Actions

### 步骤 3.1: 启用 Actions

1. 进入仓库页面
2. 点击 **Actions** 标签
3. 如果看到提示，点击 **I understand my workflows, go ahead and enable them**

### 步骤 3.2: 配置签名密钥（可选但推荐）

如果你想发布签名的 Release APK，需要配置签名密钥：

#### 生成签名密钥

```bash
# 打开终端，运行以下命令
keytool -genkey -v \
  -keystore davesaveed.keystore \
  -alias davesaveed \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

按提示输入：
- 密钥库密码（记住这个密码）
- 个人信息（可以随便填）
- 确认信息

#### Base64 编码密钥文件

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("davesaveed.keystore")) | Set-Clipboard
```

**macOS/Linux:**
```bash
base64 -i davesaveed.keystore | pbcopy  # macOS
base64 -i davesaveed.keystore           # Linux，手动复制输出
```

#### 添加 Secrets

1. 在 GitHub 仓库页面，点击 **Settings** 标签
2. 左侧菜单选择 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，依次添加：

| Secret 名称 | 值 |
|------------|-----|
| `SIGNING_KEY` | Base64 编码的密钥文件内容 |
| `ALIAS` | `davesaveed`（或你设置的别名） |
| `KEY_STORE_PASSWORD` | 密钥库密码 |
| `KEY_PASSWORD` | 密钥密码（通常与密钥库密码相同） |

---

## 4. 构建 APK

### 自动构建

每次推送到 `main` 分支时，GitHub Actions 会自动构建 Debug APK。

### 手动触发构建

1. 进入仓库页面的 **Actions** 标签
2. 选择 **Build Android APK** 工作流
3. 点击 **Run workflow** → **Run workflow**

### 下载构建产物

1. 等待工作流完成（约 5-10 分钟）
2. 点击最新的工作流运行记录
3. 在 **Artifacts** 部分下载：
   - `android-debug-apk` - 调试版本
   - `android-release-apk` - 发布版本（需要配置签名密钥）

---

## 5. 发布 Release

### 自动发布

创建标签时，GitHub Actions 会自动构建并发布：

```bash
# 本地创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

或者直接在 GitHub 上创建：

1. 进入仓库页面的 **Releases** 部分
2. 点击 **Create a new release**
3. 点击 **Choose a tag**，输入 `v1.0.0`，选择 **Create new tag**
4. 填写发布信息
5. 点击 **Publish release**

GitHub Actions 会自动构建 APK 并附加到 Release。

### 手动下载 APK

1. 等待 Release 工作流完成
2. 进入 **Releases** 页面
3. 点击最新版本
4. 在 **Assets** 部分下载 APK 文件

---

## 6. 安装 APK

### Android 设备安装

1. 将 APK 文件传输到 Android 设备
2. 打开文件管理器，找到 APK
3. 点击安装
4. 如果提示"未知来源"，前往设置允许安装

### 使用 ADB 安装

```bash
# 连接设备
adb devices

# 安装 APK
adb install app-debug.apk
```

---

## 7. 故障排除

### 问题: Actions 运行失败

**检查清单：**
- [ ] 所有文件已正确上传
- [ ] `package.json` 在根目录
- [ ] `.github/workflows/build-android.yml` 存在

**查看日志：**
1. 进入 Actions 页面
2. 点击失败的工作流
3. 查看详细的错误信息

### 问题: 签名失败

**解决方案：**
- 检查 Secrets 是否正确设置
- 确保 `SIGNING_KEY` 是 Base64 编码的完整内容
- 确认 `ALIAS` 与生成密钥时使用的别名一致

### 问题: APK 安装失败

**可能原因：**
- 设备 Android 版本过低（需要 Android 5.0+）
- 已安装同名应用但签名不同
- 需要卸载旧版本后重新安装

---

## 8. 自定义配置

### 修改应用信息

编辑 `capacitor.config.ts`：

```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.davesaveed',  // 修改包名
  appName: 'DaveSaveEd',                 // 修改应用名称
  // ...
}
```

### 修改版本号

编辑 `package.json`：

```json
{
  "version": "1.1.0"  // 修改版本号
}
```

### 自定义图标

1. 准备图标文件（1024x1024 PNG）
2. 使用 [Capacitor 资源生成工具](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
3. 运行 `npx capacitor-assets generate`

---

## 9. 进阶配置

### 启用 ProGuard 混淆

编辑 `android/app/build.gradle`：

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 配置多架构支持

编辑 `android/app/build.gradle`：

```gradle
android {
    defaultConfig {
        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86_64'
        }
    }
}
```

---

## 10. 获取帮助

- [Capacitor 文档](https://capacitorjs.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Android 开发者文档](https://developer.android.com/)

---

**祝使用愉快！** 🎮🐟
