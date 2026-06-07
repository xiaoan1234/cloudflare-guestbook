// 管理员页面：通过硬编码管理员账号登录并能查看/删除留言
<template>
  <div class="container">
    <h1>管理员后台</h1>
    <div v-if="!authed">
      <form @submit.prevent="login">
        <div><label>用户名</label><input v-model="username" /></div>
        <div><label>密码</label><input type="password" v-model="password"/></div>
        <div style="color:red">{{ error }}</div>
        <button type="submit">登录</button>
      </form>
    </div>
    <div v-else>
      <div>已登录为管理员 <button @click="logout">退出</button></div>
      <div v-for="msg in messages" :key="msg.id" class="msg">
        <strong>{{ msg.user }}</strong>：{{ msg.text }}
        <div class="replies">
          <div v-for="rep in msg.replies" :key="rep.id" class="reply">回复：<strong>{{ rep.user }}</strong> {{ rep.text }}</div>
        </div>
        <button @click="remove(msg.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const username = ref('')
const password = ref('')
const error = ref('')
const authed = ref(false)
const messages = ref<any[]>([])

onMounted(()=>{ /* nothing */ })

const login = async ()=>{
  if (username.value === '管理员' && password.value === '123456') {
    authed.value = true
    await load()
  } else {
    error.value = '账号或密码错误'
  }
}

const load = async ()=>{
  messages.value = await $fetch('/api/messages')
}

const remove = async (id:number)=>{
  await $fetch('/api/admin/delete', { method: 'POST', body: { id } })
  await load()
}

const logout = ()=>{ authed.value = false }
</script>

<style scoped>
.container { max-width:720px; margin:40px auto }
.msg { border-bottom:1px solid #eee; padding:12px 0 }
.reply { margin-left:12px; color:#555 }
</style>
