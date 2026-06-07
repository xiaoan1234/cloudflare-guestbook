import { drizzle } from 'drizzle-orm/d1'
import { messages } from '../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const d1 = event.context.cloudflare?.env?.DB
  
  if (!d1) throw createError({ statusCode: 500, message: 'D1 数据库未绑定' })
  if (!body.name || !body.text) throw createError({ statusCode: 400, message: '参数缺失' })

  const db = drizzle(d1)
  await db.insert(messages).values({
    name: body.name,
    text: body.text
  })
  return { success: true }
})