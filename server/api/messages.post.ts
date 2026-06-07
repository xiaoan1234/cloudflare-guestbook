// server/api/messages.post.ts
import { readBody } from 'h3'
import { messages, getNextMessageId } from '../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  if (!body || !body.text) throw createError({ statusCode: 400, statusMessage: '参数缺失' })
  
  const id = getNextMessageId()
  messages.push({
    id,
    user: body.user || '匿名',
    text: body.text || '',
    replies: [],
    createdAt: new Date().toISOString()
  })
  
  return { success: true }
})