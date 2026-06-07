import { drizzle } from 'drizzle-orm/d1'
import { desc } from 'drizzle-orm'
import { messages } from '../database/schema'

export default defineEventHandler(async (event) => {
  // 从 Cloudflare 上下文获取 D1 绑定
  const d1 = event.context.cloudflare?.env?.DB
  if (!d1) {
    // 本地开发备用
    throw createError({ statusCode: 500, message: 'D1 数据库未绑定' })
  }
  const db = drizzle(d1)
  return await db.select().from(messages).orderBy(desc(messages.createdAt))
})