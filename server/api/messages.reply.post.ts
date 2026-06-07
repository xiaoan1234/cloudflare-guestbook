// 回复留言：根据 id 在对应 message 上追加 reply
// @ts-ignore
import { readFile, writeFile } from 'fs/promises'
export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id, text, user } = body
  const file = new URL('../../data/messages.json', import.meta.url)
  const data = JSON.parse(await readFile(file, 'utf-8')) as any[]
  const msg = data.find(m => m.id === id)
  if (!msg) throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  const rid = (msg.replies[msg.replies.length - 1]?.id || 0) + 1
  msg.replies.push({ id: rid, user: user || '匿名', text: text || '' })
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  return { ok: true }
})
