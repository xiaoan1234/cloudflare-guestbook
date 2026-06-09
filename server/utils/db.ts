// server/utils/db.ts
// 数据库工具函数 - 支持本地开发和 Cloudflare 生产环境

import { users as storeUsers, messages as storeMessages, getNextMessageId } from './store'

// 内存存储（本地开发环境）
let memoryUsers: Record<string, { password: string; role: string }> = { ...storeUsers }
let memoryUserProfiles: Record<string, any> = {}
let memoryMessages: any[] = [...storeMessages]
let memoryReplies: any[] = []

// 全局数据库实例（生产环境）
let _db: any = null
let _isCloudflareEnv: boolean | null = null

// 检测是否在 Cloudflare 环境中
function isCloudflareEnvironment(): boolean {
  if (_isCloudflareEnv !== null) return _isCloudflareEnv

  try {
    if (typeof useCloudflare === 'function') {
      const cf = useCloudflare()
      _isCloudflareEnv = cf?.env?.DB !== undefined
    } else {
      _isCloudflareEnv = false
    }
  } catch {
    _isCloudflareEnv = false
  }

  return _isCloudflareEnv
}

// 获取数据库实例（生产环境）
function getDb() {
  if (_db) return _db

  if (!isCloudflareEnvironment()) {
    throw new Error('数据库不可用，使用内存存储')
  }

  try {
    const cf = useCloudflare()
    if (cf?.env?.DB) {
      const { drizzle } = require('drizzle-orm/d1')
      _db = drizzle(cf.env.DB)
      return _db
    }
  } catch (error) {
    console.error('[db] 数据库连接失败:', error)
  }

  throw new Error('数据库连接失败')
}

// ========== 用户相关操作 ==========

// 查找用户
export async function findUser(username: string) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { users } = require('../database/schema')
      const { eq } = require('drizzle-orm')
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1)
      return result[0] || null
    } catch (error) {
      console.warn('[db] 数据库查询失败，使用内存存储')
    }
  }

  // 内存存储
  const user = memoryUsers[username]
  return user ? { username, ...user } : null
}

// 创建用户
export async function createUser(username: string, password: string, role: string = 'user') {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { users } = require('../database/schema')
      const result = await db.insert(users).values({ username, password, role }).returning()
      return result[0]
    } catch (error) {
      console.warn('[db] 数据库插入失败，使用内存存储')
    }
  }

  // 内存存储
  memoryUsers[username] = { password, role }
  return { username, password, role }
}

// ========== 用户个人信息操作 ==========

// 获取用户个人信息
export async function getUserProfile(username: string) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { userProfiles } = require('../database/schema')
      const { eq } = require('drizzle-orm')
      const result = await db.select().from(userProfiles).where(eq(userProfiles.username, username)).limit(1)
      return result[0] || null
    } catch (error) {
      console.warn('[db] 数据库查询失败，使用内存存储')
    }
  }

  // 内存存储
  return memoryUserProfiles[username] || null
}

// 创建或更新用户个人信息
export async function upsertUserProfile(username: string, profile: {
  age?: number | null
  gender?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
}) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { userProfiles } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      const existing = await getUserProfile(username)

      if (existing) {
        const result = await db.update(userProfiles)
          .set({ ...profile, updatedAt: new Date() })
          .where(eq(userProfiles.username, username))
          .returning()
        return result[0]
      } else {
        const result = await db.insert(userProfiles)
          .values({ username, ...profile })
          .returning()
        return result[0]
      }
    } catch (error) {
      console.warn('[db] 数据库操作失败，使用内存存储')
    }
  }

  // 内存存储
  memoryUserProfiles[username] = {
    username,
    ...profile,
    createdAt: memoryUserProfiles[username]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  return memoryUserProfiles[username]
}

// ========== 留言相关操作 ==========

// 获取所有留言（带回复）
export async function getAllMessages() {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages, replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      const allMessages = await db.select().from(messages).orderBy(messages.createdAt)

      const messagesWithReplies = await Promise.all(
        allMessages.map(async (msg: any) => {
          const msgReplies = await db.select().from(replies)
            .where(eq(replies.messageId, msg.id))
            .orderBy(replies.createdAt)
          return { ...msg, replies: msgReplies }
        })
      )

      return messagesWithReplies
    } catch (error) {
      console.warn('[db] 数据库查询失败，使用内存存储')
    }
  }

  // 内存存储
  return memoryMessages.map(msg => ({
    ...msg,
    replies: memoryReplies.filter(r => r.messageId === msg.id)
  }))
}

// 创建留言
export async function createMessage(user: string, text: string) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages } = require('../database/schema')
      const result = await db.insert(messages).values({ user, text, views: 0 }).returning()
      return result[0]
    } catch (error) {
      console.warn('[db] 数据库插入失败，使用内存存储')
    }
  }

  // 内存存储
  const id = getNextMessageId()
  const message = {
    id,
    user,
    text,
    views: 0,
    createdAt: new Date().toISOString()
  }
  memoryMessages.push(message)
  return message
}

// 增加浏览量
export async function incrementMessageViews(messageId: number) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      const msg = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1)
      if (!msg[0]) return false

      await db.update(messages)
        .set({ views: (msg[0].views || 0) + 1 })
        .where(eq(messages.id, messageId))

      return true
    } catch (error) {
      console.warn('[db] 数据库更新失败，使用内存存储')
    }
  }

  // 内存存储
  const msg = memoryMessages.find(m => m.id === messageId)
  if (msg) {
    msg.views = (msg.views || 0) + 1
    return true
  }
  return false
}

// 获取热门留言排行
export async function getTopMessages(limit: number = 10) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages } = require('../database/schema')

      const result = await db.select().from(messages).orderBy(messages.views).limit(limit)
      return result.reverse()
    } catch (error) {
      console.warn('[db] 数据库查询失败，使用内存存储')
    }
  }

  // 内存存储
  return [...memoryMessages]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
}

// 删除留言
export async function deleteMessage(messageId: number) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages, replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      await db.delete(replies).where(eq(replies.messageId, messageId))
      await db.delete(messages).where(eq(messages.id, messageId))
      return true
    } catch (error) {
      console.warn('[db] 数据库删除失败，使用内存存储')
    }
  }

  // 内存存储
  memoryMessages = memoryMessages.filter(m => m.id !== messageId)
  memoryReplies = memoryReplies.filter(r => r.messageId !== messageId)
  return true
}

// ========== 回复相关操作 ==========

// 创建回复
export async function createReply(messageId: number, user: string, text: string) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { replies } = require('../database/schema')
      const result = await db.insert(replies).values({ messageId, user, text }).returning()
      return result[0]
    } catch (error) {
      console.warn('[db] 数据库插入失败，使用内存存储')
    }
  }

  // 内存存储
  const id = memoryReplies.length > 0 ? Math.max(...memoryReplies.map(r => r.id || 0)) + 1 : 1
  const reply = {
    id,
    messageId,
    user,
    text,
    createdAt: new Date().toISOString()
  }
  memoryReplies.push(reply)
  return reply
}

// 删除回复
export async function deleteReply(messageId: number, replyId: number) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      await db.delete(replies).where(eq(replies.id, replyId))
      return true
    } catch (error) {
      console.warn('[db] 数据库删除失败，使用内存存储')
    }
  }

  // 内存存储
  memoryReplies = memoryReplies.filter(r => !(r.messageId === messageId && r.id === replyId))
  return true
}

// ========== 初始化数据 ==========

// 初始化默认管理员账号
export async function initializeAdmin() {
  try {
    const admin = await findUser('管理员')
    if (!admin) {
      await createUser('管理员', '1314520', 'admin')
      console.log('[db] 创建默认管理员账号')
    }
  } catch (error) {
    console.warn('[db] 管理员初始化跳过:', error)
  }
}
