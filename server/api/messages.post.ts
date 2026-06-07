// 发布留言：把新留言追加到 data/messages.json
// @ts-ignore
import { readFile, writeFile } from 'fs/promises'
import { readBody } from 'h3'
export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  if (!body || !body.text) throw createError({ statusCode: 400, statusMessage: '参数缺失' })
  const file = new URL('../../data/messages.json', import.meta.url)
  const data = JSON.parse(await readFile(file, 'utf-8')) as any[]
  const id = (data[data.length - 1]?.id || 0) + 1
  data.push({ id, user: body.user || '匿名', text: body.text || '', replies: [] })
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  return { success: true }
})