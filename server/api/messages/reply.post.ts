// server/api/messages/reply.post.ts
// 创建回复（使用 D1 数据库）
import { readBody } from 'h3'
import { createReply, getAllMessages } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id, text, user } = body

  // 验证留言是否存在
  const messages = await getAllMessages()
  const msg = messages.find(m => m.id === id)

  if (!msg) {
    throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  }

  // 创建回复
  const reply = await createReply(id, user || '匿名', text || '')

  return { success: true, reply }
})
