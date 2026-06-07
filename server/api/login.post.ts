// 登录 API：接受中文用户名和数字密码；管理员特殊处理
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body as any
  if (!/^[\u4e00-\u9fa5]+$/.test(username)) {
    throw createError({ statusCode: 400, statusMessage: '用户名必须为中文' })
  }
  if (!/^\d{6,}$/.test(password)) {
    throw createError({ statusCode: 400, statusMessage: '密码必须为至少6位数字' })
  }
  if (username === '管理员' && password === '123456') {
    return { token: 'admin-token', role: 'admin' }
  }
  // 普通用户仅返回 token
  return { token: 'user-token', role: 'user' }
})
