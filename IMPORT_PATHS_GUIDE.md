# API 导入路径指南

## 目录结构

```
server/
├── api/
│   ├── login.post.ts          → ../utils/db
│   ├── messages.get.ts        → ../utils/db
│   ├── messages.post.ts       → ../utils/db
│   ├── messages/
│   │   ├── view.post.ts       → ../../utils/db
│   │   ├── top.get.ts         → ../../utils/db
│   │   └── reply.post.ts      → ../../utils/db
│   ├── admin/
│   │   ├── delete.post.ts     → ../../utils/db
│   │   └── delete-reply.post.ts → ../../utils/db
│   └── user/
│       ├── profile.get.ts     → ../../utils/db
│       └── profile.post.ts    → ../../utils/db
├── utils/
│   └── db.ts                  ← 所有 API 都导入这里
└── plugins/
    └── db-init.ts
```

## 路径规则

### 1️⃣ 直接在 `server/api/` 目录下的文件
**文件：** `login.post.ts`, `messages.get.ts`, `messages.post.ts`

**正确路径：** `../utils/db`

**解析：**
```
server/api/login.post.ts
server/utils/db.ts
从 api/ 向上一级到 server/，再到 utils/
```

### 2️⃣ 在 `server/api/messages/` 目录下的文件
**文件：** `view.post.ts`, `top.get.ts`, `reply.post.ts`

**正确路径：** `../../utils/db`

**解析：**
```
server/api/messages/view.post.ts
server/utils/db.ts
从 messages/ 向上两级到 server/，再到 utils/
```

### 3️⃣ 在 `server/api/admin/` 目录下的文件
**文件：** `delete.post.ts`, `delete-reply.post.ts`

**正确路径：** `../../utils/db`

**解析：**
```
server/api/admin/delete.post.ts
server/utils/db.ts
从 admin/ 向上两级到 server/，再到 utils/
```

### 4️⃣ 在 `server/api/user/` 目录下的文件
**文件：** `profile.get.ts`, `profile.post.ts`

**正确路径：** `../../utils/db`

**解析：**
```
server/api/user/profile.get.ts
server/utils/db.ts
从 user/ 向上两级到 server/，再到 utils/
```

## 已修复的文件清单 ✅

| 文件路径 | 导入路径 | 状态 |
|---------|---------|------|
| `server/api/login.post.ts` | `../utils/db` | ✅ |
| `server/api/messages.get.ts` | `../utils/db` | ✅ |
| `server/api/messages.post.ts` | `../utils/db` | ✅ |
| `server/api/messages/view.post.ts` | `../../utils/db` | ✅ |
| `server/api/messages/top.get.ts` | `../../utils/db` | ✅ |
| `server/api/messages/reply.post.ts` | `../../utils/db` | ✅ |
| `server/api/admin/delete.post.ts` | `../../utils/db` | ✅ |
| `server/api/admin/delete-reply.post.ts` | `../../utils/db` | ✅ |
| `server/api/user/profile.get.ts` | `../../utils/db` | ✅ |
| `server/api/user/profile.post.ts` | `../../utils/db` | ✅ |

## 快速检查表

✅ `server/api/*.ts`（直接层级）→ `../utils/db`
✅ `server/api/**/*.ts`（子目录层级）→ `../../utils/db`
✅ `server/utils/db.ts`（导出所有数据库操作函数）
✅ `server/plugins/db-init.ts`（初始化插件）

## 现在测试

1. 生成迁移：`npx drizzle-kit generate`
2. 重启服务器：`npm run dev`
3. 所有导入路径应该都能正确解析
