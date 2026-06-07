// 管理员删除留言（简单实现）
// @ts-ignore
import { readFile, writeFile } from 'fs/promises'
export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { id } = body
  const file = new URL('../../../data/messages.json', import.meta.url)
  const data = JSON.parse(await readFile(file, 'utf-8')) as any[]
  const idx = data.findIndex(m => m.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: '未找到留言' })
  data.splice(idx, 1)
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  return { ok: true }
})
