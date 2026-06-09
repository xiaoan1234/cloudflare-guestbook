// server/database/init.ts
// 数据库初始化脚本

import { initializeAdmin } from '../utils/db'

// 这个函数会在应用启动时调用
export async function initDatabase() {
  try {
    console.log('[db] 开始初始化数据库...')
    await initializeAdmin()
    console.log('[db] 数据库初始化完成')
  } catch (error) {
    console.error('[db] 数据库初始化失败:', error)
  }
}
