// server/api/login.post.ts
import { readBody } from 'h3'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const USERS_FILE = join(process.cwd(), 'data', 'users.json')

async function getUsers() {
  try {
    const data = await readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // 如果文件不存在，返回默认管理员
    return [{ username: '管理员', password: '1314520', role: 'admin' }]
  }
}

async function saveUsers(users: any[]) {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, isRegister } = body as any
  
  // 验证用户名
  if (!/^[\u4e00-\u9fa5]+[\u4e00-\u9fa50-9]*$/.test(username)) {
    throw createError({ statusCode: 400, statusMessage: '用户名必须为中文（可以包含数字）' })
  }
  
  // 验证密码
  if (!/^\d{6,}$/.test(password)) {
    throw createError({ statusCode: 400, statusMessage: '密码必须为至少6位数字' })
  }
  
  const users = await getUsers()
  
  // 注册逻辑
  if (isRegister) {
    const existingUser = users.find((u: any) => u.username === username)
    if (existingUser) {
      throw createError({ statusCode: 400, statusMessage: '用户名已存在' })
    }
    users.push({ username, password, role: 'user' })
    await saveUsers(users)
    return { success: true, token: `user-token-${Date.now()}`, role: 'user', message: '注册成功' }
  }
  
  // 登录逻辑
  const user = users.find((u: any) => u.username === username)
  if (!user || user.password !== password) {
    throw createError({ statusCode: 400, statusMessage: '用户名或密码错误' })
  }
  
  return { success: true, token: `${user.role}-token-${Date.now()}`, role: user.role }
})
