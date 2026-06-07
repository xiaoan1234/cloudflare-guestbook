// 发布留言：把新留言追加到 data/messages.json
// @ts-ignore
import { readFile, writeFile } from 'fs/promises'
import { drizzle } from 'drizzle-orm/d1'
import { messages } from '../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const file = new URL('../../data/messages.json', import.meta.url)
  const data = JSON.parse(await readFile(file, 'utf-8')) as any[]
  const id = (data[data.length - 1]?.id || 0) + 1
  data.push({ id, user: body.user || '匿名', text: body.text || '', replies: [] })
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')

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