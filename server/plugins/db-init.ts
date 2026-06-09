// server/plugins/db-init.ts
// 数据库初始化插件 - 仅记录日志，不强制初始化

export default defineNitroPlugin(async () => {
  // 仅记录数据库配置信息
  console.log('[db] 数据库配置已加载')
  console.log('[db] 管理员将在首次登录时自动初始化')
  console.log('[db] 用户名：管理员，密码：1314520')
})
