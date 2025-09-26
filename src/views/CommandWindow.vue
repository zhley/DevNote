<template>
  <div class="command-window">
    <input 
      ref="commandInput"
      v-model="command"
      @keydown.enter="executeCommand"
      @keydown.escape="closeWindow"
      @blur="handleBlur"
      placeholder="输入命令"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { parseCommand } from '../utils/commandParser'
import { createEditorWindow, closeCurrentWindow } from '../utils/windowManager'

const command = ref('')
const commandInput = ref<HTMLInputElement>()

const executeCommand = async () => {
  const parsed = parseCommand(command.value)
  if (parsed) {
    // 创建编辑窗口并传递命令信息
    try {
      await createEditorWindow(parsed)
      closeCurrentWindow()
    } catch (error) {
      console.error('Failed to create editor window:', error)
    }
  }
}

const handleBlur = () => {
  // 失焦时关闭窗口（延时一点，避免点击按钮时立即关闭）
  setTimeout(() => {
    closeCurrentWindow()
  }, 100)
}

const closeWindow = () => {
  closeCurrentWindow()
}

onMounted(() => {
  // 自动聚焦到输入框
  nextTick(() => {
    commandInput.value?.focus()
  })
})
</script>

<style scoped>
.command-window {
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 100%;
  height: 100%;
}

.command-window input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
  background: transparent;
}

.command-window input::placeholder {
  color: #999;
  font-size: 12px;
}
</style>