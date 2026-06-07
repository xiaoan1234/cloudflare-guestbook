// server/utils/store.ts

// 共享内存存储
export const users: Record<string, { password: string; role: string }> = {
  '管理员': { password: '1314520', role: 'admin' }
}

export let messages: any[] = [
  {
    id: 1,
    user: '系统',
    text: '欢迎使用留言板！',
    replies: [],
    createdAt: new Date().toISOString()
  }
]

export function getNextMessageId() {
  return messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1
}