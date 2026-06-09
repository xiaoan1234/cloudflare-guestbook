// server/api/user/profile.get.ts
// 获取用户个人信息（使用 D1 数据库）
import { readBody } from 'h3'
import { getUserProfile } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { username } = body || {}

  if (!username) {
    throw createError({ statusCode: 400, message: '用户名是必需的' })
  }

  const profile = await getUserProfile(username)

  if (!profile) {
    // 返回默认空档案
    return {
      username,
      age: null,
      gender: null,
      email: null,
      phone: null,
      bio: null,
      createdAt: new Date().toISOString()
    }
  }

  return profile
})
