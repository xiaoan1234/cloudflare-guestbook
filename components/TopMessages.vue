<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TopMessage {
  id: number
  user: string
  text: string
  views: number
  createdAt: string
}

const topMessages = ref<TopMessage[]>([])
const loading = ref(false)

const emit = defineEmits<{
  (e: 'jump-to-message', id: number): void
}>()

onMounted(async () => {
  await loadTopMessages()
})

const loadTopMessages = async () => {
  loading.value = true
  try {
    const res: any = await $fetch('/api/messages/top', {
      params: { limit: 10 }
    })
    if (res.success) {
      topMessages.value = res.messages
    }
  } catch (e) {
    console.error('加载排行榜失败:', e)
  } finally {
    loading.value = false
  }
}

const jumpToMessage = (id: number) => {
  emit('jump-to-message', id)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getRankBadge = (index: number) => {
  switch (index) {
    case 0: return '🥇'
    case 1: return '🥈'
    case 2: return '🥉'
    default: return `${index + 1}`
  }
}
</script>

<template>
  <div class="top-sidebar">
    <div class="sidebar-header">
      <h3>🔥 热门留言榜</h3>
      <button @click="loadTopMessages" class="refresh-btn">刷新</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="topMessages.length === 0" class="empty">
      暂无留言排行
    </div>

    <div v-else class="top-list">
      <div
        v-for="(msg, index) in topMessages"
        :key="msg.id"
        class="top-item"
        @click="jumpToMessage(msg.id)"
      >
        <div class="rank">{{ getRankBadge(index) }}</div>
        <div class="content">
          <div class="user">{{ msg.user }}</div>
          <div class="text">{{ msg.text }}</div>
          <div class="meta">
            <span class="views">👁 {{ msg.views }}</span>
            <span class="date">{{ formatDate(msg.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-sidebar {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.refresh-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
}

.refresh-btn:hover {
  background: #f3f4f6;
}

.loading,
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-size: 14px;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.top-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.rank {
  font-size: 20px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  flex: 1;
  min-width: 0;
}

.user {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.text {
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.views {
  color: #6b7280;
}
</style>
