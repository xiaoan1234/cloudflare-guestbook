// server/api/admin/delete-reply.post.ts
import { readBody } from 'h3'
import { messages } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { messageId, replyId } = body
  
  const msg = messages.find(m => m.id === messageId)
  if (!msg) throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  
  const replyIdx = msg.replies.findIndex((r: any) => r.id === replyId)
  if (replyIdx === -1) throw createError({ statusCode: 404, statusMessage: '未找到回复' })
  
  msg.replies.splice(replyIdx, 1)
  return { ok: true }
})