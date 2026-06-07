// 登录 API：读取并写入 data/users.json，支持注册与验证
import { readBody } from 'h3'
// @ts-ignore
import { readFile, writeFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { username, password } = body || {}
  if (!username || !password) throw createError({ statusCode: 400, statusMessage: '参数缺失' })
  if (!/^[\u4e00-\u9fa5]+$/.test(username)) throw createError({ statusCode: 400, statusMessage: '用户名必须为中文' })
  if (!/^\d{6,}$/.test(password)) throw createError({ statusCode: 400, statusMessage: '密码必须为至少6位数字' })

  const usersFile = new URL('../../data/users.json', import.meta.url)
  const usersData = JSON.parse(await readFile(usersFile, 'utf-8')) as any[]

  // 管理员特殊处理（确保文件中存在正确的管理员密码）
  if (username === '管理员' && password === '123456') {
    const admin = usersData.find(u => u.username === '管理员')
    if (admin) {
      admin.password = '123456'
    } else {
      usersData.push({ username: '管理员', password: '123456', role: 'admin' })
    }
    await writeFile(usersFile, JSON.stringify(usersData, null, 2), 'utf-8')
    return { token: 'admin-token', role: 'admin' }
  }

  // 普通用户：存在则验证密码，不存在则注册
  const user = usersData.find(u => u.username === username)
  if (user) {
    if (user.password !== password) throw createError({ statusCode: 401, statusMessage: '密码错误' })
    return { token: 'user-token', role: user.role || 'user' }
  }

  // 注册新用户
  usersData.push({ username, password, role: 'user' })
  await writeFile(usersFile, JSON.stringify(usersData, null, 2), 'utf-8')
  return { token: 'user-token', role: 'user' }
})