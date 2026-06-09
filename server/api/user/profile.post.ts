// server/api/user/profile.post.ts
// 更新用户个人信息（使用 D1 数据库）
import { readBody } from 'h3'
import { upsertUserProfile } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { username, profile } = body || {}

  if (!username) {
    throw createError({ statusCode: 400, message: '用户名是必需的' })
  }

  // 验证可选字段
  if (profile.age !== undefined && profile.age !== null) {
    if (typeof profile.age !== 'number' || profile.age < 0 || profile.age > 150) {
      throw createError({ statusCode: 400, message: '年龄必须是0-150之间的数字' })
    }
  }

  if (profile.email !== undefined && profile.email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      throw createError({ statusCode: 400, message: '请输入有效的邮箱地址' })
    }
  }

  if (profile.phone !== undefined && profile.phone !== null) {
    const phoneRegex = /^[\d\-+\s()]{7,15}$/
    if (!phoneRegex.test(profile.phone)) {
      throw createError({ statusCode: 400, message: '请输入有效的电话号码' })
    }
  }

  // 更新或创建用户档案
  const updatedProfile = await upsertUserProfile(username, {
    age: profile.age || null,
    gender: profile.gender || null,
    email: profile.email || null,
    phone: profile.phone || null,
    bio: profile.bio || null
  })

  console.log('[profile] 更新用户信息：', username)
  return { success: true, profile: updatedProfile }
})
