// 登录 API：验证用户身份或注册新用户（使用 D1 数据库）
import { readBody } from 'h3'
import { findUser, createUser, getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { username, password, isRegister } = body || {}

  if (!username || !password) {
    throw createError({ statusCode: 400, message: '参数缺失' })
  }

  // 验证用户名格式：中文（可包含数字）
  if (!/^[一-龥]+[一-龥0-9]*$/.test(username)) {
    throw createError({ statusCode: 400, message: '用户名必须为中文（可以包含数字）' })
  }

  // 验证密码格式：至少6位数字
  if (!/^\d{6,}$/.test(password)) {
    throw createError({ statusCode: 400, message: '密码必须为至少6位数字' })
  }

  try {
    // 尝试获取数据库连接（会自动延迟初始化）
    getDb()
  } catch (error) {
    console.error('[login] 数据库连接失败:', error)
    throw createError({ statusCode: 500, message: '数据库连接失败。请确保已部署到 Cloudflare 或配置了本地 D1。' })
  }

  // 查找用户
  const existingUser = await findUser(username)

  if (isRegister) {
    // 注册模式
    if (existingUser) {
      throw createError({ statusCode: 409, message: '该用户名已被注册' })
    }

    // 创建新用户
    const newUser = await createUser(username, password, 'user')
    console.log('[login] 注册新用户：', username)

    return {
      success: true,
      token: `${username}-${Date.now()}`,
      role: newUser.role
    }
  } else {
    // 登录模式
    if (!existingUser) {
      // 如果是管理员账号且不存在，自动创建
      if (username === '管理员' && password === '1314520') {
        const adminUser = await createUser('管理员', '1314520', 'admin')
        console.log('[login] 自动创建管理员账号')
        return {
          success: true,
          token: `${username}-${Date.now()}`,
          role: adminUser.role
        }
      }
      throw createError({ statusCode: 401, message: '用户不存在' })
    }

    if (existingUser.password !== password) {
      throw createError({ statusCode: 401, message: '密码错误' })
    }

    console.log('[login] 登录成功：', username)
    return {
      success: true,
      token: `${username}-${Date.now()}`,
      role: existingUser.role
    }
  }
})
