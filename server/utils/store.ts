// server/utils/store.ts
// 内存存储（备用，主要使用数据库）

// 共享内存存储（备用）
export const users: Record<string, { password: string; role: string }> = {
  '管理员': { password: '1314520', role: 'admin' }
}

// 留言存储（备用）
export let messages: any[] = [
  {
    id: 1,
    user: '系统',
    text: '欢迎使用留言板！',
    replies: [],
    createdAt: new Date().toISOString(),
    views: 0
  }
]

// 获取下一个留言 ID（备用）
export function getNextMessageId() {
  return messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1
}
