// server/api/messages/view.post.ts
// 增加留言浏览量（使用 D1 数据库）
import { readBody } from 'h3'
import { incrementMessageViews } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id } = body || {}

  if (!id) {
    throw createError({ statusCode: 400, message: '留言 ID 是必需的' })
  }

  const success = await incrementMessageViews(id)

  if (!success) {
    throw createError({ statusCode: 404, message: '留言不存在' })
  }

  return { success: true }
})
