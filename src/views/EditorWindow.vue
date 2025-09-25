<template>
  <div class="editor-window">
    <div class="editor-header">
      <span class="block-type">{{ getBlockTypeLabel(blockData.type) }}</span>
      <span v-if="blockData.title" class="block-title">: {{ blockData.title }}</span>
    </div>
    <textarea
      ref="contentEditor"
      v-model="content"
      @blur="handleBlur"
      @keydown.escape="closeWindow"
      :placeholder="getPlaceholder(blockData.type)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { saveBlockToWorkspace } from '../utils/dataSync'
import { closeCurrentWindow, getBlockTypeLabel, getPlaceholder, type Command } from '../utils/windowManager'

const route = useRoute()
const content = ref('')
const contentEditor = ref<HTMLTextAreaElement>()

// 从路由参数获取命令数据
const blockData = ref<Command>({
  type: 'todo'
})

try {
  if (route.query.data) {
    blockData.value = JSON.parse(decodeURIComponent(route.query.data as string))
  }
} catch (error) {
  console.error('Failed to parse block data:', error)
}

const handleBlur = async () => {
  if (content.value.trim()) {
    try {
      await saveBlockToWorkspace(blockData.value, content.value)
    } catch (error) {
      console.error('Failed to save block:', error)
    }
  }
  closeCurrentWindow()
}

const closeWindow = () => {
  closeCurrentWindow()
}

onMounted(() => {
  // 如果有标题，预填充到内容中
  if (blockData.value.title) {
    content.value = blockData.value.title + '\n'
  }
  
  // 自动聚焦到编辑器
  setTimeout(() => {
    contentEditor.value?.focus()
    
    // 如果有预填充内容，将光标移到末尾
    if (content.value) {
      const length = content.value.length
      contentEditor.value?.setSelectionRange(length, length)
    }
  }, 100)
})
</script>

<style scoped>
.editor-window {
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.editor-header {
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.block-type {
  color: #409eff;
}

.block-title {
  color: #333;
}

.editor-window textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
}

.editor-window textarea::placeholder {
  color: #999;
}
</style>