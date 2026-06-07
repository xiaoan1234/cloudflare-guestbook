// server/api/admin/delete.post.ts
import { readBody } from 'h3'
import { messages } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id } = body
  
  const idx = messages.findIndex(m => m.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  
  messages.splice(idx, 1)
  return { ok: true }
})