<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref('')
const token = ref('')
const role = ref('')
const messages = ref<any[]>([])
const newMessage = ref('')
const replyText = reactive<Record<string, string>>({})
const showReplyInput = reactive<Record<string, boolean>>({})

onMounted(async () => {
  user.value = localStorage.getItem('guestbook_user') || ''
  token.value = localStorage.getItem('guestbook_token') || ''
  role.value = localStorage.getItem('guestbook_role') || ''
  if (!token.value) {
    await router.push('/')
  }
  await load()
})

const load = async () => {
  messages.value = await $fetch('/api/messages')
}

const postMessage = async () => {
  if (!newMessage.value.trim()) return
  await $fetch('/api/messages', {
    method: 'POST',
    body: { text: newMessage.value, user: user.value }
  })
  newMessage.value = ''
  await load()
}

const reply = async (id: number) => {
  const text = replyText[id]
  if (!text || !text.trim()) return
  await $fetch('/api/messages/reply', {
    method: 'POST',
    body: { id, text, user: user.value }
  })
  replyText[id] = ''
  showReplyInput[id] = false
  await load()
}

const toggleReplyInput = (id: number) => {
  showReplyInput[id] = !showReplyInput[id]
}

const deleteMessage = async (id: number) => {
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
  localStorage.removeItem('guestbook_token')
  localStorage.removeItem('guestbook_user')
  localStorage.removeItem('guestbook_role')
  router.push('/')
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>📝 留言板</h1>
      <div class="user-info">
        <span>当前用户：<strong>{{ user }}</strong></span>
        <span v-if="role === 'admin'" class="admin-badge">管理员</span>
        <button @click="logout" class="logout-btn">退出</button>
      </div>
    </div>

    <!-- 发布留言 -->
    <div class="post-form">
      <textarea v-model="newMessage" placeholder="写下你的留言..." rows="3"></textarea>
      <button @click="postMessage">发布留言</button>
    </div>

    <!-- 留言列表 -->
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message-item">
        <div class="message-header">
          <strong>{{ msg.user }}</strong>
          <span class="time">{{ new Date(msg.createdAt).toLocaleString() }}</span>
        </div>
        <p class="message-text">{{ msg.text }}</p>
        
        <!-- 管理员删除留言按钮 -->
        <div v-if="role === 'admin'" class="admin-actions">
          <button @click="deleteMessage(msg.id)" class="delete-btn">删除留言</button>
        </div>

        <!-- 回复列表 -->
        <div v-if="msg.replies && msg.replies.length > 0" class="replies">
          <div v-for="rep in msg.replies" :key="rep.id" class="reply-item">
            <strong>{{ rep.user }}</strong>：{{ rep.text }}
            <!-- 管理员删除回复按钮 -->
            <button v-if="role === 'admin'" @click="deleteReply(msg.id, rep.id)" class="delete-reply-btn">删除</button>
          </div>
        </div>

        <!-- 回复按钮 -->
        <button @click="toggleReplyInput(msg.id)" class="reply-btn">回复</button>
        
        <!-- 回复输入框 -->
        <div v-if="showReplyInput[msg.id]" class="reply-form">
          <input v-model="replyText[msg.id]" placeholder="输入回复..." />
          <button @click="reply(msg.id)">发送回复</button>
        </div>
      </div>

      <div v-if="!messages || messages.length === 0" class="empty">
        暂无留言，快来发布第一条吧！
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}
h1 {
  margin: 0;
  color: #1f2937;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-badge {
  background: #dc2626;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.post-form {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}
.post-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 10px;
  font-size: 14px;
}
.post-form button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
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
.message-header strong {
  color: #1f2937;
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
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
.reply-btn {
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
}
.reply-form {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.reply-form input {
  flex: 1;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.reply-form button {
  background: #059669;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}
</style>
