#!/bin/bash

# DaveSaveEd Mobile 项目初始化脚本

echo "=========================================="
echo "  DaveSaveEd Mobile 项目初始化"
echo "=========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js 18+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "错误: Node.js 版本过低，需要 18+，当前版本: $(node -v)"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查 npm
echo "✓ npm 版本: $(npm -v)"

# 安装依赖
echo ""
echo "正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo "✓ 依赖安装完成"

# 安装 Capacitor 平台
echo ""
echo "正在安装 Capacitor 平台..."
npm install @capacitor/android @capacitor/ios

if [ $? -ne 0 ]; then
    echo "警告: Capacitor 平台安装失败，可以稍后手动安装"
fi

echo "✓ Capacitor 平台安装完成"

# 构建项目
echo ""
echo "正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "错误: 项目构建失败"
    exit 1
fi

echo "✓ 项目构建完成"

# 同步 Capacitor
echo ""
echo "正在同步 Capacitor..."
npx cap sync

echo ""
echo "=========================================="
echo "  初始化完成！"
echo "=========================================="
echo ""
echo "可用命令:"
echo "  npm run dev       - 启动开发服务器"
echo "  npm run build     - 构建生产版本"
echo "  npm run sync      - 同步 Capacitor"
echo "  npx cap open android  - 打开 Android Studio"
echo ""
echo "GitHub Actions 配置:"
echo "  1. 创建 GitHub 仓库"
echo "  2. 推送代码到仓库"
echo "  3. 在 Settings -> Secrets 中添加签名密钥（可选）"
echo "  4. 在 Actions 页面查看构建状态"
echo ""
echo "详细说明请查看 SETUP_GUIDE.md"
echo ""
