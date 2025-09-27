<template>
    <div 
        class="command-window" 
        :class="{ expanded: showEditor }"
        @keydown.escape="closeWindow"
        @mousedown="handleMouseDown"
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
                :placeholder="getPlaceholder(blockType)"
            />
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
        if(showEditor.value){
            saveToWorkspace()
        }else{
            // 展开编辑区域
            showEditor.value = true
            // 调整窗口大小
            try {
                const currentWindow = getCurrentWindow()
                await currentWindow.setSize(new LogicalSize(400, 300))
            } catch (error) {
                console.error('Failed to resize window:', error)
            }
        }
        blockType.value = parsed.type
        title.value = 'title' in parsed ? parsed.title || '' : ''
        
        // 使用 setTimeout 延迟设置内容，避免与 DOM 更新冲突
        setTimeout(() => {
            const expectedContent = title.value || ''
            content.value = expectedContent
            
            nextTick(() => {
                if (contentEditor.value) {
                    // 直接设置 textarea 的 value，绕过 Vue 的响应式系统
                    contentEditor.value.value = expectedContent
                    contentEditor.value.focus()
                    
                    // 设置光标位置
                    if (expectedContent) {
                        const length = expectedContent.length
                        contentEditor.value.setSelectionRange(length, length)
                    } else {
                        contentEditor.value.setSelectionRange(0, 0)
                    }
                }
            })
        }, 0)
    }
}

const handleBlur = () => {
    closeWindow()
}

const closeWindow = async () => {
    if (showEditor.value) {
        saveToWorkspace()
    }
    closeCurrentWindow()
}

const saveToWorkspace = async () => {
    if(content.value.trim()){
        try {
            await emit('create-block-request', {
                type: blockType.value,
                content: content.value
            })
        } catch (error) {
            console.error('Failed to save block:', error)
        }
    }
}

const closeCurrentWindow = async () => {
    try {
        const currentWindow = getCurrentWindow()
        await currentWindow.close()
    } catch (error) {
        console.error('Failed to close current window:', error)
    }
}

// 窗口拖拽功能
const handleMouseDown = async (event: MouseEvent) => {
    // 如果点击的是输入框或文本区域，不启动拖拽
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
    }
    
    // 防止文本选择
    event.preventDefault()
    
    try {
        const currentWindow = getCurrentWindow()
        await currentWindow.startDragging()
    } catch (error) {
        console.error('Failed to start window dragging:', error)
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
    cursor: text;
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
    border-radius: 6px;
    cursor: text;
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
    transition: all 0.15s ease;
    border: 1px solid #d0d7de; /* 默认边框颜色 */
}

/* 不同类型的边框和标签颜色主题 - 与workspace保持一致 */
.editor-section.block-progress {
    border-color: #1f883d;
}

.editor-section.block-todo {
    border-color: #bf8700;
}

.editor-section.block-bug {
    border-color: #d1242f;
}

.editor-section.block-idea {
    border-color: #8250df;
}

.editor-section.block-note {
    border-color: #656d76;
}

</style>