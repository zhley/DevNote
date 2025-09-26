<template>
    <div class="editor-window">
        <div class="editor-header">
            <span class="block-type">{{ getBlockTypeLabel(blockType) }}</span>
        </div>
        <textarea 
            ref="contentEditor" 
            v-model="content" 
            @blur="handleBlur" 
            @keydown.escape="closeWindow"
            :placeholder="getPlaceholder(blockType)" 
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { closeCurrentWindow } from '../utils/windowManager'
import { getBlockTypeLabel, getPlaceholder} from '../utils/commandParser'
import { emit, listen } from '@tauri-apps/api/event'

interface EditorInitData{
    block_type: string,
    title: string
}

const content = ref('')
const contentEditor = ref<HTMLTextAreaElement>()

const blockType = ref('')
const title = ref('')

const handleBlur = async () => {
    closeWindow()
}

const closeWindow = async () => {
    if (content.value.trim()) {
        try {
            await emit('create-block-request', {
                type: blockType,
                content: content
            })
        } catch (error) {
            console.error('Failed to save block:', error)
        }
    }
    closeCurrentWindow()
}

onMounted(async () => {
    await listen('init-editor', (event) => {
        const data = event.payload as EditorInitData
        blockType.value = data.block_type
        title.value = data.title
    })

    if(title){
        content.value += (title + "\n")
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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