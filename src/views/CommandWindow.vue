<template>
    <div 
        class="command-window" 
        :class="{ expanded: showEditor }"
        @keydown.escape="closeWindow"
    >
        <input 
            ref="commandInput" 
            v-model="command" 
            placeholder="输入命令" 
            @keydown.enter="executeCommand" 
        />

        <div v-if="showEditor" class="editor-section">
            <div class="editor-header">
                <span class="block-type">{{ getBlockTypeLabel(blockType) }}</span>
            </div>
            <textarea 
                ref="contentEditor"
                v-model="content"
                :placeholder="getPlaceholder(blockType)">
            </textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { parseCommand, getBlockTypeLabel, getPlaceholder } from '../utils/commandParser'
import { emit } from '@tauri-apps/api/event'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

const command = ref('')
const commandInput = ref<HTMLInputElement>()
const showEditor = ref(false)
const content = ref('')
const contentEditor = ref<HTMLTextAreaElement>()
const blockType = ref('')
const title = ref('')

const executeCommand = async () => {
    const parsed = parseCommand(command.value)
    if (parsed) {
        // 展开编辑区域
        showEditor.value = true
        blockType.value = parsed.type
        title.value = 'title' in parsed ? parsed.title || '' : ''

        // 如果有标题，预填充到内容中
        if (title.value) {
            content.value = title.value + "\n"
        }

        // 调整窗口大小
        try {
            const currentWindow = getCurrentWindow()
            await currentWindow.setSize(new LogicalSize(400, 300))
        } catch (error) {
            console.error('Failed to resize window:', error)
        }

        // 聚焦到编辑器
        nextTick(() => {
            contentEditor.value?.focus()
            if (content.value) {
                const length = content.value.length
                contentEditor.value?.setSelectionRange(length, length)
            }
        })
    }
}

const handleBlur = () => {
    // closeWindow()
}

const closeWindow = async () => {
    if (showEditor.value && content.value.trim()) {
        try {
            await emit('create-block-request', {
                type: blockType.value,
                content: content.value
            })
        } catch (error) {
            console.error('Failed to save block:', error)
        }
    }
    closeCurrentWindow()
}

const closeCurrentWindow = async () => {
    try {
        const currentWindow = getCurrentWindow()
        await currentWindow.close()
    } catch (error) {
        console.error('Failed to close current window:', error)
    }
}

let focusChangeListener: (() => void) | undefined

onMounted(async () => {
    // 自动聚焦到输入框
    nextTick(() => {
        commandInput.value?.focus()
    })

    const currentWindow = await getCurrentWindow()
    focusChangeListener = await currentWindow.onFocusChanged((event) => {
        const isFocused = event.payload
        if(!isFocused){
            handleBlur()
        }
    })
})

onUnmounted(() => {
    if (focusChangeListener) {
        focusChangeListener();
    }
})
</script>

<style scoped>
.command-window {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.command-window input {
    flex: 1;
    border: none;
    font-size: 14px;
    padding: 4px 0;
    background: transparent;
}

.command-window input::placeholder {
    color: #999;
    font-size: 12px;
}

.editor-section {
    margin-top: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
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

.editor-section textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    background: transparent;
}

.editor-section textarea::placeholder {
    color: #999;
}
</style>