#!/bin/bash
# 一键部署到 Cloudflare 脚本
# 用法: bash deploy.sh

echo "🚀 开始部署到 Cloudflare..."
echo ""

# 1. 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目目录运行此脚本"
    exit 1
fi

# 2. 登录 Cloudflare
echo "📋 步骤 1/5: 登录 Cloudflare..."
echo "会打开浏览器让你登录，请完成登录"
npx wrangler login

if [ $? -ne 0 ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"
echo ""

# 3. 创建数据库
echo "📋 步骤 2/5: 创建 D1 数据库..."
echo "请输入数据库名称（直接按回车使用默认名称）:"
read -r db_name
db_name=${db_name:-cloudflare-guestbook}

npx wrangler d1 create $db_name
echo ""
echo "⚠️  请复制上面的 database_id 并粘贴到下面"
echo "数据库 ID:"
read -r db_id

if [ -z "$db_id" ]; then
    echo "❌ 数据库 ID 不能为空"
    exit 1
fi
echo "✅ 数据库创建成功"
echo ""

# 4. 更新 wrangler.toml
echo "📋 步骤 3/5: 更新配置文件..."
cat > wrangler.toml << EOF
name = "cloudflare-guestbook"
main = ".output/server/index.mjs"
compatibility_date = "2024-11-01"

[[d1_databases]]
binding = "DB"
database_name = "$db_name"
database_id = "$db_id"
EOF
echo "✅ 配置文件已更新"
echo ""

# 5. 生成和应用迁移
echo "📋 步骤 4/5: 生成数据库表..."
npx drizzle-kit generate
npx wrangler d1 migrations apply $db_name
echo "✅ 数据库表创建成功"
echo ""

# 6. 构建和部署
echo "📋 步骤 5/5: 构建和部署..."
npm run build
npx wrangler deploy

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi
echo ""
echo "🎉 部署成功！"
echo ""
echo "你的网站已部署到 Cloudflare"
echo "所有数据现在都会永久保存"
echo ""
echo "测试步骤："
echo "1. 访问上面显示的 URL"
echo "2. 注册新用户"
echo "3. 关闭浏览器"
echo "4. 重新打开并登录"
echo "5. ✅ 用户数据应该保留"
