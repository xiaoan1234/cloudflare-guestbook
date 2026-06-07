// 留言板页面：显示留言、发布留言和回复
<template>
  <div class="container">
    <h1>留言板</h1>
    <div>当前用户：{{ user }} <button @click="logout">退出</button></div>

    <form @submit.prevent="postMessage">
      <textarea v-model="newMessage" placeholder="写下你的留言"></textarea>
      <button type="submit">发布留言</button>
    </form>

    <div v-for="msg in messages" :key="msg.id" class="msg">
      <strong>{{ msg.user }}</strong>：{{ msg.text }}
      <div class="replies">
        <div v-for="rep in msg.replies" :key="rep.id" class="reply">回复：<strong>{{ rep.user }}</strong> {{ rep.text }}</div>
      </div>
      <div>
        <input v-model="replyText[msg.id]" placeholder="回复..." />
        <button @click="reply(msg.id)">回复</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const user = ref('')
const token = ref('')
const messages = ref<any[]>([])
const newMessage = ref('')
const replyText = reactive<Record<string,string>>({})

onMounted(async ()=>{
  user.value = localStorage.getItem('guestbook_user') || ''
  token.value = localStorage.getItem('guestbook_token') || ''
  if (!token.value) { await router.push('/') }
  await load()
})

const load = async ()=>{
  messages.value = await $fetch('/api/messages')
}

const postMessage = async ()=>{
  if (!newMessage.value.trim()) return
  await $fetch('/api/messages', { method: 'POST', body: { text: newMessage.value, user: user.value } })
  newMessage.value = ''
  await load()
}

const reply = async (id: number)=>{
  const text = replyText[id]
  if (!text || !text.trim()) return
  await $fetch('/api/messages/reply', { method: 'POST', body: { id, text, user: user.value } })
  replyText[id] = ''
  await load()
}

const logout = ()=>{
  localStorage.removeItem('guestbook_token')
  localStorage.removeItem('guestbook_user')
  localStorage.removeItem('guestbook_role')
  router.push('/')
}
</script>

<style scoped>
.container { max-width:720px; margin:40px auto }
.msg { border-bottom:1px solid #eee; padding:12px 0 }
textarea { width:100%; height:80px }
.reply { margin-left:12px; color:#555 }
</style>
