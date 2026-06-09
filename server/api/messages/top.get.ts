// server/api/messages/top.get.ts
// 获取热门留言排行（使用 D1 数据库）
import { getTopMessages } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  const topMessages = await getTopMessages(Math.min(limit, 50))

  return {
    success: true,
    messages: topMessages.map(msg => ({
      id: msg.id,
      user: msg.user,
      text: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
      views: msg.views || 0,
      createdAt: msg.createdAt
    }))
  }
})
