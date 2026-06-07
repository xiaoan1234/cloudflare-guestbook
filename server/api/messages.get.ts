// 返回所有消息
// @ts-ignore
import { readFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const file = new URL('../../data/messages.json', import.meta.url)
  const data = await readFile(file, 'utf-8')
  return JSON.parse(data)
})