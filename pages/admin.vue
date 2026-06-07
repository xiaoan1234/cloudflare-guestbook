<script setup lang="ts">
import { ref, onMounted } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')
const authed = ref(false)
const messages = ref<any[]>([])

// 预设管理员账号
const ADMIN_USERNAME = '管理员'
const ADMIN_PASSWORD = '1314520'

onMounted(() => {
  // 检查是否已经登录
  const savedAuth = localStorage.getItem('admin_authed')
  if (savedAuth === 'true') {
    authed.value = true
    load()
  }
})

const login = async () => {
  if (username.value === ADMIN_USERNAME && password.value === ADMIN_PASSWORD) {
    authed.value = true
    localStorage.setItem('admin_authed', 'true')
    await load()
  } else {
    error.value = '账号或密码错误'
  }
}

const load = async () => {
  messages.value = await $fetch('/api/messages')
}

const remove = async (id: number) => {
  if (confirm('确定要删除这条留言吗？')) {
    await $fetch('/api/admin/delete', {
      method: 'POST',
      body: { id }
    })
    await load()
  }
}

const deleteReply = async (messageId: number, replyId: number) => {
  if (confirm('确定要删除这条回复吗？')) {
    await $fetch('/api/admin/delete-reply', {
      method: 'POST',
      body: { messageId, replyId }
    })
    await load()
  }
}

const logout = () => {
  authed.value = false
  localStorage.removeItem('admin_authed')
}
</script>

<template>
  <div class="container">
    <h1>🔐 管理员后台</h1>
    
    <!-- 登录表单 -->
    <div v-if="!authed" class="login-form">
      <form @submit.prevent="login">
        <div>
          <label>用户名</label>
          <input v-model="username" placeholder="请输入管理员用户名" />
        </div>
        <div>
          <label>密码</label>
          <input type="password" v-model="password" placeholder="请输入密码" />
        </div>
        <div v-if="error" style="color: #dc2626; margin: 10px 0;">{{ error }}</div>
        <button type="submit">登录</button>
      </form>
    </div>

    <!-- 管理面板 -->
    <div v-else>
      <div class="admin-header">
        <span>✅ 已登录为管理员</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>

      <div class="stats">
        <span>共 {{ messages.length }} 条留言</span>
      </div>

      <!-- 留言列表 -->
      <div v-for="msg in messages" :key="msg.id" class="message-item">
        <div class="message-header">
          <strong>{{ msg.user }}</strong>
          <span class="time">{{ new Date(msg.createdAt).toLocaleString() }}</span>
        </div>
        <p class="message-text">{{ msg.text }}</p>
        
        <div class="admin-actions">
          <button @click="remove(msg.id)" class="delete-btn">🗑️ 删除留言</button>
        </div>

        <!-- 回复列表 -->
        <div v-if="msg.replies && msg.replies.length > 0" class="replies">
          <div v-for="rep in msg.replies" :key="rep.id" class="reply-item">
            <strong>{{ rep.user }}</strong>：{{ rep.text }}
            <button @click="deleteReply(msg.id, rep.id)" class="delete-reply-btn">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!messages || messages.length === 0" class="empty">
        暂无留言
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
h1 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 30px;
}
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background: #f9fafb;
  border-radius: 8px;
}
.login-form div {
  margin-bottom: 15px;
}
.login-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}
.login-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.login-form button {
  width: 100%;
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #dcfce7;
  border-radius: 8px;
}
.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.stats {
  margin-bottom: 20px;
  color: #6b7280;
}
.message-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.time {
  color: #9ca3af;
  font-size: 12px;
}
.message-text {
  color: #374151;
  line-height: 1.6;
  margin: 10px 0;
}
.admin-actions {
  margin-top: 10px;
}
.delete-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 3px solid #e5e7eb;
}
.reply-item {
  padding: 8px 0;
  color: #4b5563;
  font-size: 14px;
}
.delete-reply-btn {
  background: transparent;
  color: #dc2626;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}
</style>
