# 数据库迁移说明

## 生成迁移文件

在项目根目录运行以下命令：

```bash
npx drizzle-kit generate
```

## 应用迁移

迁移文件会在 `server/database/migrations/` 目录中生成。

NuxtHub 会在部署时自动应用这些迁移。

## 本地开发

在本地开发时，NuxtHub 会自动创建和管理 D1 数据库。

## 数据库表结构

### users 表
- id: 主键（自增）
- username: 用户名（唯一）
- password: 密码
- role: 角色（admin/user）
- created_at: 创建时间

### user_profiles 表
- id: 主键（自增）
- username: 用户名（唯一）
- age: 年龄（可选）
- gender: 性别（可选）
- email: 邮箱（可选）
- phone: 电话（可选）
- bio: 简介（可选）
- created_at: 创建时间
- updated_at: 更新时间

### messages 表
- id: 主键（自增）
- user: 用户名
- text: 留言内容
- views: 浏览量
- created_at: 创建时间

### replies 表
- id: 主键（自增）
- message_id: 留言 ID
- user: 用户名
- text: 回复内容
- created_at: 创建时间
