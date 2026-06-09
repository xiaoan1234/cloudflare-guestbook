// server/api/admin/delete-reply.post.ts
// 删除回复（使用 D1 数据库）
import { readBody } from 'h3'
import { deleteReply, getAllMessages } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { messageId, replyId } = body

  // 验证留言和回复是否存在
  const messages = await getAllMessages()
  const msg = messages.find(m => m.id === messageId)

  if (!msg) {
    throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  }

  const reply = msg.replies?.find((r: any) => r.id === replyId)
  if (!reply) {
    throw createError({ statusCode: 404, statusMessage: '未找到回复' })
  }

  // 删除回复
  await deleteReply(messageId, replyId)

  return { success: true }
})
