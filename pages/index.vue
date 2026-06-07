<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const validate = () => {
  // 用户名：中文（或中文+数字）
  if (!/^[\u4e00-\u9fa5]+[\u4e00-\u9fa50-9]*$/.test(username.value)) {
    error.value = '用户名必须为中文（可以包含数字）'
    return false
  }
  // 密码：不少于6位的数字
  if (!/^\d{6,}$/.test(password.value)) {
    error.value = '密码必须为至少6位数字'
    return false
  }
  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return false
  }
  error.value = ''
  return true
}

const submit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const res: any = await $fetch('/api/login', {
      method: 'POST',
      body: { 
        username: username.value, 
        password: password.value,
        isRegister: !isLogin.value
      }
    })
    if (res.success) {
      localStorage.setItem('guestbook_token', res.token)
      localStorage.setItem('guestbook_user', username.value)
      localStorage.setItem('guestbook_role', res.role)
      await router.push('/guestbook')
    } else {
      error.value = res.message || '操作失败'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '操作失败'
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}
</script>

<template>
  <div class="container">
    <h1>{{ isLogin ? '登录' : '注册' }}</h1>
    <form @submit.prevent="submit">
      <div>
        <label>用户名（中文，可包含数字）</label>
        <input v-model="username" placeholder="请输入用户名" />
      </div>
      <div>
        <label>密码（至少6位数字）</label>
        <input v-model="password" type="password" placeholder="请输入密码" />
      </div>
      <div v-if="!isLogin">
        <label>确认密码</label>
        <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
      </div>
      <div style="color:red">{{ error }}</div>
      <button type="submit" :disabled="loading">
        {{ loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册') }}
      </button>
    </form>
    <div style="margin-top: 15px;">
      <button @click="toggleMode" type="button" style="background: transparent; color: #2563eb; border: none; cursor: pointer;">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  font-family: sans-serif;
}
h1 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 30px;
}
div {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  color: #374151;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
button[type="submit"]:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
