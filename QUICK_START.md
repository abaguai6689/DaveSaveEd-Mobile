# 快速开始指南

## 5 分钟快速部署

### 第一步：创建 GitHub 仓库（1分钟）

1. 打开 [github.com/new](https://github.com/new)
2. 输入仓库名：`DaveSaveEd-Mobile`
3. 选择 `Public`
4. 点击 **Create repository**

### 第二步：上传代码（2分钟）

**方式1 - 命令行：**
```bash
# 解压下载的项目文件
cd DaveSaveEd-Mobile

# 初始化并推送
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/DaveSaveEd-Mobile.git
git push -u origin main
```

**方式2 - 网页上传：**
1. 在新仓库页面点击 **uploading an existing file**
2. 拖拽所有文件到上传区域
3. 点击 **Commit changes**

### 第三步：启用 GitHub Actions（1分钟）

1. 进入仓库，点击 **Actions** 标签
2. 点击 **I understand my workflows, go ahead and enable them**

### 第四步：触发构建（1分钟）

1. 点击 **Actions** → **Build Android APK**
2. 点击 **Run workflow** → **Run workflow**
3. 等待 10-15 分钟

### 第五步：下载 APK（随时）

1. 构建完成后，点击最新的工作流记录
2. 在 **Artifacts** 部分下载 `android-debug-apk`
3. 解压得到 `app-debug.apk`

---

## 如果之前构建失败了

### 问题
```
Dependencies lock file is not found...
```

### 解决方案

1. 更新工作流文件（已修复）
2. 重新推送代码：
```bash
cd DaveSaveEd-Mobile
git add .
git commit -m "Fix: use npm install instead of npm ci"
git push origin main
```
3. 重新触发构建

---

## 发布正式版本

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动构建 Release APK 并发布到 Releases 页面。

---

## 常见问题

### Q: 构建失败怎么办？

A: 检查以下几点：
- 所有文件是否已上传
- `package.json` 是否在根目录
- 查看 Actions 日志获取详细错误

### Q: 如何修改应用名称？

A: 编辑 `capacitor.config.ts`：
```typescript
appName: '你的应用名称'
```

### Q: 如何配置签名？

A: 查看 `SETUP_GUIDE.md` 第 4.2 节

### Q: iOS 支持吗？

A: 工作流会导出 iOS 项目，但需要 Mac + Xcode 才能构建 IPA

---

## 下一步

- 阅读 `SETUP_GUIDE.md` 了解详细配置
- 阅读 `PROJECT_STRUCTURE.md` 了解项目结构
- 阅读 `README.md` 了解功能说明

---

**遇到问题？** 查看详细文档或提交 Issue
