#!/bin/bash
# 重新部署Cloudflare Worker的脚本
# 确保所有修改都被应用

set -e

echo "========================================="
echo "Cloudflare 留言簿 - 重新部署脚本"
echo "========================================="
echo ""

# 1. 检查Node.js和npm
echo "📦 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ Node.js 和 npm 已安装"
echo ""

# 2. 清理并重新构建
echo "🔨 清理并重新构建..."
cd /e/cangku/cloudflare-guestbook

# 清理旧的构建文件
rm -rf .output
rm -rf .nuxt
echo "✅ 清理完成"

# 安装依赖
echo "📦 安装依赖..."
npm install
echo "✅ 依赖安装完成"

# 构建项目
echo "🔨 构建项目..."
npm run build
echo "✅ 构建完成"
echo ""

# 3. 验证构建输出
echo "📁 验证构建输出..."
if [ ! -d ".output/server" ]; then
    echo "❌ .output/server 目录不存在，构建失败"
    exit 1
fi
echo "✅ 构建输出验证成功"
echo ""

# 4. 部署到Cloudflare
echo "🚀 部署到Cloudflare..."
npx wrangler deploy

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "接下来的步骤："
echo "1. 访问 https://xiaoaan520.xyz"
echo "2. 尝试注册新用户"
echo "3. 退出并重新登录"
echo "4. 检查Worker日志："
echo "   - Cloudflare Dashboard > Workers & Pages > 留言簿 > 可观测性"
echo ""
echo "如果仍有问题，请检查："
echo "- Worker日志中的错误信息"
echo "- D1数据库控制台中的表结构"
echo "- 环境变量绑定"
