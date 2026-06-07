// 登录页面：添加中文用户名和数字密码校验，调用 /api/login 并存储 token 后跳转到留言板
<template>
  <div class="container">
    <h1>欢迎 - 请登录</h1>
    <form @submit.prevent="submit">
      <div>
        <label>用户名（中文）</label>
        <input v-model="username" placeholder="请输入中文用户名" />
      </div>
      <div>
        <label>密码（至少6位数字）</label>
        <input v-model="password" type="password" placeholder="请输入数字密码" />
      </div>
      <div style="color:red">{{ error }}</div>
      <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const validate = () => {
  if (!/^[\u4e00-\u9fa5]+$/.test(username.value)) {
    error.value = '用户名必须为中文'
    return false
  }
  if (!/^\d{6,}$/.test(password.value)) {
    error.value = '密码必须为至少6位数字'
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
      body: { username: username.value, password: password.value }
    })
    localStorage.setItem('guestbook_token', res.token)
    localStorage.setItem('guestbook_user', username.value)
    localStorage.setItem('guestbook_role', res.role)
    await router.push('/guestbook')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container { max-width:480px; margin:40px auto; padding:20px; border:1px solid #ddd; border-radius:8px }
input { width:100%; padding:8px; margin:6px 0 }
button { padding:8px 12px }
</style>
