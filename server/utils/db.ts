// server/utils/db.ts
// 数据库工具函数 - 直接使用 Cloudflare D1

import { users as storeUsers, messages as storeMessages, getNextMessageId } from './store'

// 内存存储（仅用于本地开发）
let memoryUsers: Record<string, { password: string; role: string }> = { ...storeUsers }
let memoryUserProfiles: Record<string, any> = {}
let memoryMessages: any[] = [...storeMessages]
let memoryReplies: any[] = []

// 全局数据库实例
let _db: any = null
let _isCloudflareEnv: boolean | null = null

// 检测是否在 Cloudflare 环境中（简单检测）
function isCloudflareEnvironment(): boolean {
  if (_isCloudflareEnv !== null) return _isCloudflareEnv

  try {
    // 直接尝试获取Cloudflare环境
    if (typeof useCloudflare === 'function') {
      const cf = useCloudflare()
      if (cf?.env?.DB) {
        _isCloudflareEnv = true
        console.log('[db] ✅ 检测到 Cloudflare D1 数据库')
        return _isCloudflareEnv
      }
    }
    _isCloudflareEnv = false
  } catch {
    _isCloudflareEnv = false
  }

  return _isCloudflareEnv
}

// 获取数据库实例
function getDb() {
  if (_db) return _db

  try {
    const cf = useCloudflare()
    if (cf?.env?.DB) {
      const { drizzle } = require('drizzle-orm/d1')
      _db = drizzle(cf.env.DB)
      console.log('[db] ✅ 成功连接 D1 数据库')
      return _db
    }
  } catch (error) {
    console.error('[db] ❌ 获取数据库绑定失败:', error)
  }

  throw new Error('无法获取 D1 数据库绑定')
}

// ========== 用户相关操作 ==========

// 查找用户
export async function findUser(username: string) {
  console.log('[db] 🔍 查找用户:', username)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { users } = require('../database/schema')
      const { eq } = require('drizzle-orm')
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1)
      console.log('[db] 📦 从D1查询结果:', result[0] ? '找到' : '未找到')
      return result[0] || null
    } catch (error) {
      console.error('[db] ❌ D1查询失败:', error)
      throw error
    }
  }

  // 内存存储（仅开发环境）
  console.log('[db] 💾 使用内存存储')
  const user = memoryUsers[username]
  return user ? { username, ...user } : null
}

// 创建用户
export async function createUser(username: string, password: string, role: string = 'user') {
  console.log('[db] ➕ 创建用户:', username)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { users } = require('../database/schema')
      const result = await db.insert(users).values({ username, password, role }).returning()
      console.log('[db] ✅ 用户已保存到D1数据库')
      return result[0]
    } catch (error) {
      console.error('[db] ❌ D1插入失败:', error)
      throw error
    }
  }

  // 内存存储（仅开发环境）
  console.log('[db] 💾 保存到内存存储')
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
      console.log('[db] 从D1数据库查询用户个人信息:', username)
      return result[0] || null
    } catch (error) {
      console.error('[db] D1数据库查询用户个人信息失败:', error)
      throw error
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
        console.log('[db] 在D1数据库更新用户个人信息:', username)
        return result[0]
      } else {
        const result = await db.insert(userProfiles)
          .values({ username, ...profile })
          .returning()
        console.log('[db] 在D1数据库创建用户个人信息:', username)
        return result[0]
      }
    } catch (error) {
      console.error('[db] D1数据库操作用户个人信息失败:', error)
      throw error
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
  console.log('[db] 📋 获取所有留言')

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages, replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      const allMessages = await db.select().from(messages).orderBy(messages.createdAt)
      console.log('[db] 📦 从D1查询到', allMessages.length, '条留言')

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
      console.error('[db] ❌ D1查询失败:', error)
      throw error
    }
  }

  // 内存存储
  console.log('[db] 💾 从内存获取留言')
  return memoryMessages.map(msg => ({
    ...msg,
    replies: memoryReplies.filter(r => r.messageId === msg.id)
  }))
}

// 创建留言
export async function createMessage(user: string, text: string) {
  console.log('[db] ➕ 创建留言，用户:', user)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages } = require('../database/schema')
      const result = await db.insert(messages).values({ user, text, views: 0 }).returning()
      console.log('[db] ✅ 留言已保存到D1数据库')
      return result[0]
    } catch (error) {
      console.error('[db] ❌ D1插入失败:', error)
      throw error
    }
  }

  // 内存存储
  console.log('[db] 💾 保存到内存存储')
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

      console.log('[db] 👁️ 增加留言浏览量:', messageId)
      return true
    } catch (error) {
      console.error('[db] ❌ D1更新失败:', error)
      throw error
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
  console.log('[db] 🔥 获取热门留言，限制:', limit)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages } = require('../database/schema')

      const result = await db.select().from(messages).orderBy(messages.views).limit(limit)
      console.log('[db] 📦 从D1查询到', result.length, '条热门留言')
      return result.reverse()
    } catch (error) {
      console.error('[db] ❌ D1查询失败:', error)
      throw error
    }
  }

  // 内存存储
  console.log('[db] 💾 从内存获取热门留言')
  return [...memoryMessages]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
}

// 删除留言
export async function deleteMessage(messageId: number) {
  console.log('[db] 🗑️ 删除留言:', messageId)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { messages, replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      await db.delete(replies).where(eq(replies.messageId, messageId))
      await db.delete(messages).where(eq(messages.id, messageId))
      console.log('[db] ✅ 留言已从D1删除')
      return true
    } catch (error) {
      console.error('[db] ❌ D1删除失败:', error)
      throw error
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
  console.log('[db] ➕ 创建回复，用户:', user, '-> 留言:', messageId)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { replies } = require('../database/schema')
      const result = await db.insert(replies).values({ messageId, user, text }).returning()
      console.log('[db] ✅ 回复已保存到D1数据库')
      return result[0]
    } catch (error) {
      console.error('[db] ❌ D1插入失败:', error)
      throw error
    }
  }

  // 内存存储
  console.log('[db] 💾 保存到内存存储')
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
  console.log('[db] 🗑️ 删除回复:', replyId)

  if (isCloudflareEnvironment()) {
    try {
      const db = getDb()
      const { replies } = require('../database/schema')
      const { eq } = require('drizzle-orm')

      await db.delete(replies).where(eq(replies.id, replyId))
      console.log('[db] ✅ 回复已从D1删除')
      return true
    } catch (error) {
      console.error('[db] ❌ D1删除失败:', error)
      throw error
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
