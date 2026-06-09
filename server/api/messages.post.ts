// server/api/messages.post.ts
// 创建留言（使用 D1 数据库）
import { readBody } from 'h3'
import { createMessage } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  if (!body || !body.text) {
    throw createError({ statusCode: 400, statusMessage: '参数缺失' })
  }

  const message = await createMessage(body.user || '匿名', body.text)
  return { success: true, message }
})
