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

        <div v-if="showEditor" class="editor-section" :class="`block-${blockType}`" :data-type="blockType">
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
import { parseCommand, getPlaceholder } from '../utils/commandParser'
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

.editor-section textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    background: white;
    width: 100%;
    box-sizing: border-box;
    min-height: 0;
    padding: 12px;
    color: #24292f;
    transition: all 0.15s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    border-radius: 0 0 6px 6px;
    margin-top: 16px; /* 为左上角标签留出空间 */
}

.editor-section textarea::placeholder {
    color: #656d76;
    font-style: italic;
}

.editor-section textarea:focus {
    background: white;
    box-shadow: inset 0 1px 0 rgba(208, 215, 222, 0.2);
}

/* 完全参照workspace的block-item样式 */
.editor-section {
    position: relative;
    border-radius: 6px;
    background: #ffffff;
    margin-bottom: 12px;
    transition: all 0.15s ease;
    border: 1px solid #d0d7de; /* 默认边框颜色 */
}

.editor-section::before {
    content: attr(data-type);
    position: absolute;
    top: -8px;
    left: 8px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 500;
    background: #ffffff;
    border-radius: 4px;
    z-index: 2;
    line-height: 1.2;
}

/* 不同类型的边框和标签颜色主题 - 与workspace保持一致 */
.editor-section.block-progress {
    border-color: #28a745; /* 绿色边框 */
}

.editor-section.block-progress::before {
    color: #28a745; /* 绿色文字 */
    background: #f6f8fa; /* 与容器背景相同 */
}

.editor-section.block-todo {
    border-color: #007bff; /* 蓝色边框 */
}

.editor-section.block-todo::before {
    color: #007bff; /* 蓝色文字 */
    background: #ffffff;
}

.editor-section.block-bug {
    border-color: #dc3545; /* 红色边框 */
}

.editor-section.block-bug::before {
    color: #dc3545; /* 红色文字 */
    background: #f6f8fa;
}

.editor-section.block-idea {
    border-color: #ffc107; /* 黄色边框 */
}

.editor-section.block-idea::before {
    color: #e09900; /* 深一点的黄色文字，提高可读性 */
    background: #f6f8fa;
}

.editor-section.block-note {
    border-color: #6f42c1; /* 紫色边框 */
}

.editor-section.block-note::before {
    color: #6f42c1; /* 紫色文字 */
    background: #f6f8fa;
}
</style>