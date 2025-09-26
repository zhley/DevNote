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
        ></textarea>
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
                type: blockType.value,
                content: content.value
            })
        } catch (error) {
            console.error('Failed to save block:', error)
        }
    }
    closeCurrentWindow()
}

onMounted(async () => {
    console.log('EditorWindow mounted')
    
    // 设置默认值，防止组件无响应
    blockType.value = 'note'
    
    // 先设置监听器
    await listen('init-editor', (event) => {
        const data = event.payload as EditorInitData
        console.log('Received init-editor event:', data)
        blockType.value = data.block_type
        title.value = data.title
        
        // 如果有标题，预填充到内容中
        if(title.value){
            content.value = title.value + "\n"
        }
    })
    
    // 无论是否收到事件，都要聚焦编辑器
    setTimeout(() => {
        console.log('Setting focus to editor')
        contentEditor.value?.focus()
        
        // 如果有预填充内容，将光标移到末尾
        if (content.value) {
            const length = content.value.length
            contentEditor.value?.setSelectionRange(length, length)
        }
    }, 200)
    
    console.log('EditorWindow setup complete')
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
    height: 100vh;  /* 使用视口高度确保可见 */
    min-height: 300px;  /* 最小高度 */
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