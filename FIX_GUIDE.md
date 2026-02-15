# 问题修复指南

## 问题原因

GitHub Actions 构建失败的原因是：

```
Dependencies lock file is not found...
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

工作流使用了 `npm ci` 命令，这个命令需要 `package-lock.json` 文件，但项目中没有提交这个文件。

## 解决方案

### 方案1：修改工作流（已应用）

将 `npm ci` 改为 `npm install`，这样就不需要 `package-lock.json` 了。

修改后的工作流：
```yaml
- name: Install dependencies
  run: npm install  # 原来是 npm ci
```

### 方案2：提交 package-lock.json（可选）

如果你想使用 `npm ci`（它更快更稳定），可以：

```bash
# 本地生成 package-lock.json
npm install

# 提交到仓库
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

## 更新后的使用步骤

### 第一步：更新仓库代码

将修复后的文件上传到你的 GitHub 仓库：

```bash
# 进入项目目录
cd DaveSaveEd-Mobile

# 添加所有修改
git add .

# 提交
git commit -m "Fix GitHub Actions: replace npm ci with npm install"

# 推送
git push origin main
```

### 第二步：重新触发构建

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build Android APK**
4. 点击 **Run workflow** → **Run workflow**

### 第三步：等待构建完成

构建过程大约需要 10-15 分钟：
- Build Web App: ~2 分钟
- Build Android APK: ~8-12 分钟

### 第四步：下载 APK

构建完成后：
1. 点击最新的工作流运行记录
2. 在 **Artifacts** 部分找到 `android-debug-apk`
3. 点击下载

## 常见问题

### Q: 构建仍然失败？

**检查清单：**
- [ ] `.github/workflows/build-android.yml` 已更新
- [ ] `package.json` 中没有 `@capacitor/toast`（已移除）
- [ ] 所有文件已推送到 GitHub

**查看详细日志：**
1. 进入 Actions 页面
2. 点击失败的构建
3. 查看具体失败的步骤

### Q: 如何调试构建问题？

可以在工作流中添加调试步骤：

```yaml
- name: Debug - List files
  run: |
    pwd
    ls -la
    ls -la dist/ || echo "dist folder not found"
```

### Q: 构建成功但 APK 安装失败？

- 确保设备允许安装未知来源应用
- 检查设备 Android 版本（需要 5.0+）
- 卸载旧版本后重新安装

## 验证修复

修复后的工作流应该：
1. ✅ 成功安装依赖（npm install）
2. ✅ 成功构建 Web 应用
3. ✅ 成功构建 Android Debug APK
4. ✅ 成功上传构建产物

## 下一步

构建成功后：
1. 下载 `android-debug-apk`
2. 解压得到 `app-debug.apk`
3. 安装到 Android 设备测试

---

**提示**：如果还有问题，请提供新的构建日志，我会继续帮你修复！
