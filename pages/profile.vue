<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref('')
const token = ref('')
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const profile = ref({
  username: '',
  age: null as number | null,
  gender: '',
  email: '',
  phone: '',
  bio: ''
})

onMounted(async () => {
  user.value = localStorage.getItem('guestbook_user') || ''
  token.value = localStorage.getItem('guestbook_token') || ''

  if (!token.value) {
    await router.push('/')
    return
  }

  await loadProfile()
})

const loadProfile = async () => {
  loading.value = true
  try {
    const res: any = await $fetch('/api/user/profile', {
      method: 'POST',
      body: { username: user.value }
    })
    if (res) {
      profile.value = {
        username: res.username || user.value,
        age: res.age || null,
        gender: res.gender || '',
        email: res.email || '',
        phone: res.phone || '',
        bio: res.bio || ''
      }
    }
  } catch (e: any) {
    showMessage('加载个人信息失败', 'error')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  message.value = ''

  try {
    // 验证
    if (profile.value.age !== null && (profile.value.age < 0 || profile.value.age > 150)) {
      showMessage('年龄必须在 0-150 之间', 'error')
      return
    }

    if (profile.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.value.email)) {
      showMessage('请输入有效的邮箱地址', 'error')
      return
    }

    const res: any = await $fetch('/api/user/profile', {
      method: 'POST',
      body: {
        username: user.value,
        profile: {
          age: profile.value.age,
          gender: profile.value.gender,
          email: profile.value.email,
          phone: profile.value.phone,
          bio: profile.value.bio
        }
      }
    })

    if (res.success) {
      showMessage('个人信息保存成功！', 'success')
    } else {
      showMessage('保存失败，请重试', 'error')
    }
  } catch (e: any) {
    showMessage(e?.data?.message || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const logout = () => {
  localStorage.removeItem('guestbook_token')
  localStorage.removeItem('guestbook_user')
  localStorage.removeItem('guestbook_role')
  router.push('/')
}

const goToGuestbook = () => {
  router.push('/guestbook')
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1>👤 个人中心</h1>
      <div class="header-actions">
        <button @click="goToGuestbook" class="back-btn">返回留言板</button>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="profile-content">
      <!-- 消息提示 -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar">
            {{ user.charAt(0).toUpperCase() }}
          </div>
          <div class="user-name">{{ user }}</div>
        </div>

        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label>用户名</label>
            <input :value="user" disabled class="disabled-input" />
            <span class="hint">用户名不可修改</span>
          </div>

          <div class="form-group">
            <label>年龄</label>
            <input
              v-model.number="profile.age"
              type="number"
              min="0"
              max="150"
              placeholder="请输入年龄（可选）"
            />
          </div>

          <div class="form-group">
            <label>性别</label>
            <select v-model="profile.gender">
              <option value="">未设置</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="profile.email"
              type="email"
              placeholder="请输入邮箱（可选）"
            />
          </div>

          <div class="form-group">
            <label>电话</label>
            <input
              v-model="profile.phone"
              type="tel"
              placeholder="请输入电话号码（可选）"
            />
          </div>

          <div class="form-group">
            <label>个人简介</label>
            <textarea
              v-model="profile.bio"
              rows="4"
              placeholder="介绍一下自己吧（可选）"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? '保存中...' : '保存信息' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 其他人查看此用户信息的预览 -->
      <div class="preview-section">
        <h2>📋 他人视角预览</h2>
        <div class="preview-card">
          <div class="preview-avatar">{{ user.charAt(0).toUpperCase() }}</div>
          <h3>{{ user }}</h3>
          <div class="preview-info">
            <p v-if="profile.age"><strong>年龄：</strong>{{ profile.age }}岁</p>
            <p v-if="profile.gender"><strong>性别：</strong>{{ profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他' }}</p>
            <p v-if="profile.email"><strong>邮箱：</strong>{{ profile.email }}</p>
            <p v-if="profile.phone"><strong>电话：</strong>{{ profile.phone }}</p>
            <p v-if="profile.bio"><strong>简介：</strong>{{ profile.bio }}</p>
            <p v-if="!profile.age && !profile.gender && !profile.email && !profile.phone && !profile.bio" class="empty">暂无个人信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.profile-header {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.back-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: #6b7280;
  padding: 40px;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.profile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin: 0 auto 15px;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.disabled-input {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.save-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.preview-section {
  margin-top: 40px;
}

.preview-section h2 {
  color: #1f2937;
  margin-bottom: 20px;
}

.preview-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  margin: 0 auto 15px;
}

.preview-card h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
}

.preview-info {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.preview-info p {
  margin: 10px 0;
  color: #4b5563;
}

.preview-info strong {
  color: #1f2937;
}

.preview-info .empty {
  color: #9ca3af;
  font-style: italic;
}
</style>
