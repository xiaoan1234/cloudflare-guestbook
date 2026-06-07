// server/api/messages.reply.post.ts
import { readBody } from 'h3'
import { messages } from '../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id, text, user } = body
  
  const msg = messages.find(m => m.id === id)
  if (!msg) throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  
  const rid = (msg.replies[msg.replies.length - 1]?.id || 0) + 1
  msg.replies.push({ id: rid, user: user || '匿名', text: text || '', createdAt: new Date().toISOString() })
  
  return { ok: true }
})