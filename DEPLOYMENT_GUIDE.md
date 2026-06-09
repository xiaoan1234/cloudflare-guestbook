# Cloudflare 部署指南

## 问题说明

**为什么本地数据不持久化？**
- 本地开发使用内存存储
- 服务器重启后内存被清空
- 这是正常的本地开发行为

**解决方案：**
- 部署到 Cloudflare Workers
- 使用 D1 数据库
- 数据会永久保存
- 不需要重新部署

## 部署步骤

### 第1步：登录 Cloudflare

```powershell
cd E:\cangku\cloudflare-guestbook

# 登录 Cloudflare 账户
npx wrangler login
```

**会打开浏览器让你登录**

### 第2步：创建 D1 数据库

```powershell
# 创建数据库
npx wrangler d1 create cloudflare-guestbook

# 记下输出的 database_id（类似：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
```

### 第3步：配置 wrangler.toml

创建或编辑 `wrangler.toml` 文件：

```toml
name = "cloudflare-guestbook"
main = ".output/server/index.mjs"
compatibility_date = "2024-11-01"

# D1 数据库配置
[[d1_databases]]
binding = "DB"
database_name = "cloudflare-guestbook"
database_id = "你的数据库ID"
```

### 第4步：生成数据库表

```powershell
# 生成迁移文件
npx drizzle-kit generate

# 应用迁移
npx wrangler d1 migrations apply cloudflare-guestbook
```

### 第5步：构建和部署

```powershell
# 构建项目
npm run build

# 部署到 Cloudflare
npx wrangler deploy
```

### 第6步：验证部署

1. 部署成功后，会显示一个 URL（类似：https://your-project.workers.dev）
2. 访问这个 URL
3. 测试所有功能

## 完整的部署流程

```powershell
# 1. 进入项目目录
cd E:\cangku\cloudflare-guestbook

# 2. 登录 Cloudflare
npx wrangler login

# 3. 创建数据库
npx wrangler d1 create cloudflare-guestbook
# ⚠️ 记下输出的 database_id

# 4. 编辑 wrangler.toml
# 添加数据库配置

# 5. 生成并应用迁移
npx drizzle-kit generate
npx wrangler d1 migrations apply cloudflare-guestbook

# 6. 构建和部署
npm run build
npx wrangler deploy

# 7. 测试
# 访问显示的 URL
```

## 部署后的行为

### ✅ 数据持久化
- 用户注册 → 永久保存
- 留言内容 → 永久保存
- 浏览量 → 永久保存
- 用户信息 → 永久保存

### ✅ 服务器重启后
- 所有数据保留
- 用户可以正常登录
- 留言板功能正常
- 排行榜正常显示

### ✅ 多用户访问
- 任意用户可注册
- 任意用户可登录
- 数据在云端统一存储

## 常见问题

### Q1：忘记 database_id？

```powershell
# 查看已创建的数据库
npx wrangler d1 list
```

### Q2：部署失败？

检查：
- Cloudflare 账户是否已登录
- wrangler.toml 配置是否正确
- database_id 是否正确

### Q3：数据库迁移失败？

```powershell
# 查看数据库表
npx wrangler d1 execute cloudflare-guestbook --command "SELECT * FROM sqlite_master"

# 手动执行迁移
npx wrangler d1 execute cloudflare-guestbook --file=./server/database/migrations/0000.sql
```

## 部署后的验证

**测试清单：**
- [ ] 访问部署的 URL
- [ ] 看到登录页面
- [ ] 注册新用户
- [ ] 登录
- [ ] 关闭浏览器
- [ ] 重新打开并登录
- [ ] ✅ 用户数据保留

## 部署到生产环境的好处

1. ✅ 数据永久保存
2. ✅ 不需要重新部署
3. ✅ 多用户可同时访问
4. ✅ 全球 CDN 加速
5. ✅ 自动备份

## 下一步

1. 现在就部署到 Cloudflare
2. 测试所有功能
3. 分享给其他人使用
4. 不用担心数据丢失

**部署后你就可以：**
- 让其他用户注册
- 所有数据自动保存
- 不需要重新部署
- 真正的多用户系统
