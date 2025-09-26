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

        <div v-if="showEditor" class="editor-section" :class="`block-${blockType}`">
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
    closeWindow()
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
    padding: 8px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.command-window input {
    border: none;
    outline: none;
    font-size: 14px;
    font-family: 'Consolas', 'Monaco', 'Courier New', 'Liberation Mono', 'Lucida Console', monospace;
    background: transparent;
    width: 100%;
    box-sizing: border-box;
}

/* 未展开时，输入框占满整个窗口高度 */
.command-window:not(.expanded) input {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0;
}

/* 展开后，输入框保持固定高度 */
.command-window.expanded input {
    height: 40px;
    padding: 8px 0;
    flex-shrink: 0;
    border-bottom: 1px solid #eee;
}

.command-window input::placeholder {
    color: #999;
    font-size: 12px;
}

.editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    min-height: 0; /* 允许 flex 子元素缩小 */
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    background: transparent;
    width: 100%;
    box-sizing: border-box;
    min-height: 0;
    padding: 8px 12px;
    color: #24292f;
    transition: all 0.15s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
}

.editor-section textarea::placeholder {
    color: #656d76;
    font-style: italic;
}

.editor-section textarea:focus {
    background: rgba(208, 215, 222, 0.1);
    border-radius: 6px;
}

/* 根据不同类型显示不同颜色的左边框 - 参考workspace的block样式 */
.editor-section {
    position: relative;
}

.editor-section::before {
    content: '';
    position: absolute;
    left: 0;
    top: 24px; /* 从header下方开始 */
    bottom: 0;
    width: 3px;
    border-radius: 0 2px 2px 0;
    z-index: 1;
}

/* 不同类型的颜色主题 - 与workspace保持一致 */
.editor-section.block-progress::before {
    background: #28a745; /* 绿色 - 进度 */
}

.editor-section.block-todo::before {
    background: #007bff; /* 蓝色 - 待办 */
}

.editor-section.block-bug::before {
    background: #dc3545; /* 红色 - Bug */
}

.editor-section.block-idea::before {
    background: #ffc107; /* 黄色 - 灵感 */
}

.editor-section.block-note::before {
    background: #6f42c1; /* 紫色 - 笔记 */
}
</style>