<script setup>
const { data: list, refresh } = await useFetch('/api/messages')
const name = ref('')
const text = ref('')

const submit = async () => {
  if (!name.value || !text.value) return
  await $fetch('/api/messages', {
    method: 'POST',
    body: { name: name.value, text: text.value }
  })
  name.value = ''
  text.value = ''
  refresh() // 刷新列表
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; font-family: sans-serif; padding: 0 20px;">
    <h2>📝 实时留言板</h2>

    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
      <input v-model="name" placeholder="您的昵称" style="padding: 8px;" />
      <textarea v-model="text" placeholder="说点什么吧..." style="padding: 8px; height: 80px;"></textarea>
      <button @click="submit" style="padding: 10px; background: #2563eb; color: white; border: none; cursor: pointer;">提交留言</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div v-for="item in list" :key="item.id" style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 4px;">
        <strong style="color: #1f2937;">{{ item.name }}</strong>
        <p style="margin: 5px 0; color: #4b5563;">{{ item.text }}</p>
        <small style="color: #9ca3af;">{{ new Date(item.createdAt).toLocaleString() }}</small>
      </div>
      <div v-if="!list || list.length === 0" style="color: #9ca3af; text-align: center;">暂无留言</div>
    </div>
  </div>
</template>