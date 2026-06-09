// server/api/messages.get.ts
// 获取所有留言（使用 D1 数据库）
import { getAllMessages } from '../utils/db'

export default defineEventHandler(async (event) => {
  const messages = await getAllMessages()
  return messages
})
