// 测试脚本：验证数据库修复

// 检查文件存在
const fs = require('fs')
const path = require('path')

const files = [
  'server/utils/db.ts',
  'server/plugins/db-init.ts',
  'server/api/login.post.ts',
  'server/api/messages.get.ts',
  'server/api/messages.post.ts',
  'server/api/messages/view.post.ts',
  'server/api/messages/top.get.ts',
  'server/api/messages/reply.post.ts',
  'server/api/admin/delete.post.ts',
  'server/api/admin/delete-reply.post.ts',
  'server/api/user/profile.get.ts',
  'server/api/user/profile.post.ts',
]

console.log('🔍 检查文件...')
let allFilesExist = true

for (const file of files) {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
}

// 检查导入路径
console.log('\n🔍 检查导入路径...')

const importChecks = {
  'server/api/login.post.ts': '../utils/db',
  'server/api/messages.get.ts': '../utils/db',
  'server/api/messages.post.ts': '../utils/db',
  'server/api/messages/view.post.ts': '../../utils/db',
  'server/api/messages/top.get.ts': '../../utils/db',
  'server/api/messages/reply.post.ts': '../../utils/db',
  'server/api/admin/delete.post.ts': '../../utils/db',
  'server/api/admin/delete-reply.post.ts': '../../utils/db',
  'server/api/user/profile.get.ts': '../../utils/db',
  'server/api/user/profile.post.ts': '../../utils/db',
}

let allImportsCorrect = true

for (const [file, expectedImport] of Object.entries(importChecks)) {
  const fullPath = path.join(__dirname, file)
  const content = fs.readFileSync(fullPath, 'utf8')
  const hasCorrectImport = content.includes(`from '${expectedImport}'`)

  if (hasCorrectImport) {
    console.log(`✅ ${file} - 导入路径正确`)
  } else {
    console.log(`❌ ${file} - 导入路径错误`)
    allImportsCorrect = false
  }
}

// 总结
console.log('\n📋 测试总结...')
if (allFilesExist && allImportsCorrect) {
  console.log('✅ 所有文件存在且导入路径正确')
  console.log('✅ 现在可以运行 npm run dev 测试')
} else {
  console.log('❌ 存在问题需要修复')
}

process.exit(allFilesExist && allImportsCorrect ? 0 : 1)
