// server/utils/db.ts
// 数据库工具函数 - 使用 NuxtHub D1

import { drizzle } from 'drizzle-orm/d1'
import { users, userProfiles, messages, replies } from '../database/schema'
import { eq } from 'drizzle-orm'

// 全局数据库实例（延迟初始化）
let _db: any = null

// 获取数据库实例
export function getDb() {
  if (_db) return _db

  try {
    // 在 Nitro 插件和 API 路由中，useCloudflare 可能不可用
    // 所以我们延迟初始化，在首次使用时才创建
    if (typeof useCloudflare === 'function') {
      const cf = useCloudflare()
      if (cf?.env?.DB) {
        _db = drizzle(cf.env.DB)
        return _db
      }
    }

    // 如果 useCloudflare 不可用，抛出更友好的错误
    throw new Error('数据库连接不可用。请确保在 Nitro API 路由中使用此函数。')
  } catch (error) {
    console.error('[db] 数据库连接失败:', error)
    throw error
  }
}

// ========== 用户相关操作 ==========

// 查找用户
export async function findUser(username: string) {
  const db = getDb()
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1)
  return result[0] || null
}

// 创建用户
export async function createUser(username: string, password: string, role: string = 'user') {
  const db = getDb()
  const result = await db.insert(users).values({
    username,
    password,
    role
  }).returning()
  return result[0]
}

// ========== 用户个人信息操作 ==========

// 获取用户个人信息
export async function getUserProfile(username: string) {
  const db = getDb()
  const result = await db.select().from(userProfiles).where(eq(userProfiles.username, username)).limit(1)
  return result[0] || null
}

// 创建或更新用户个人信息
export async function upsertUserProfile(username: string, profile: {
  age?: number | null
  gender?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
}) {
  const db = getDb()

  // 检查是否已存在
  const existing = await getUserProfile(username)

  if (existing) {
    // 更新
    const result = await db.update(userProfiles)
      .set({
        ...profile,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.username, username))
      .returning()
    return result[0]
  } else {
    // 创建
    const result = await db.insert(userProfiles)
      .values({
        username,
        ...profile
      })
      .returning()
    return result[0]
  }
}

// ========== 留言相关操作 ==========

// 获取所有留言（带回复）
export async function getAllMessages() {
  const db = getDb()

  // 获取所有留言
  const allMessages = await db.select().from(messages).orderBy(messages.createdAt)

  // 获取每个留言的回复
  const messagesWithReplies = await Promise.all(
    allMessages.map(async (msg) => {
      const msgReplies = await db.select().from(replies)
        .where(eq(replies.messageId, msg.id))
        .orderBy(replies.createdAt)

      return {
        ...msg,
        replies: msgReplies
      }
    })
  )

  return messagesWithReplies
}

// 创建留言
export async function createMessage(user: string, text: string) {
  const db = getDb()
  const result = await db.insert(messages)
    .values({
      user,
      text,
      views: 0
    })
    .returning()
  return result[0]
}

// 增加浏览量
export async function incrementMessageViews(messageId: number) {
  const db = getDb()

  // 获取当前浏览量
  const msg = await db.select().from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)

  if (!msg[0]) return false

  // 更新浏览量
  await db.update(messages)
    .set({
      views: (msg[0].views || 0) + 1
    })
    .where(eq(messages.id, messageId))

  return true
}

// 获取热门留言排行
export async function getTopMessages(limit: number = 10) {
  const db = getDb()
  const result = await db.select().from(messages)
    .orderBy(messages.views)
    .limit(limit)

  return result.reverse()  // 按浏览量降序
}

// 删除留言
export async function deleteMessage(messageId: number) {
  const db = getDb()

  // 先删除所有回复
  await db.delete(replies).where(eq(replies.messageId, messageId))

  // 再删除留言
  await db.delete(messages).where(eq(messages.id, messageId))

  return true
}

// ========== 回复相关操作 ==========

// 创建回复
export async function createReply(messageId: number, user: string, text: string) {
  const db = getDb()
  const result = await db.insert(replies)
    .values({
      messageId,
      user,
      text
    })
    .returning()
  return result[0]
}

// 删除回复
export async function deleteReply(messageId: number, replyId: number) {
  const db = getDb()
  await db.delete(replies)
    .where(eq(replies.id, replyId))
  return true
}

// ========== 初始化数据 ==========

// 初始化默认管理员账号
export async function initializeAdmin() {
  try {
    const db = getDb()

    // 检查是否已有管理员
    const admin = await findUser('管理员')

    if (!admin) {
      // 创建默认管理员
      await createUser('管理员', '1314520', 'admin')
      console.log('[db] 创建默认管理员账号')
    }
  } catch (error) {
    // 如果数据库未就绪，记录警告但不阻止应用启动
    console.warn('[db] 管理员初始化跳过（数据库可能未就绪）:', error)
  }
}
