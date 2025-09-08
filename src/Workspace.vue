<template>
    <div class="workspace">
        <!-- 待办清单区域 -->
        <div class="todo-list">
            <div class="section-header">
                <h3>待办清单</h3>
            </div>
            <div class="todo-items">
                <div 
                    v-for="(todo, index) in todos" 
                    :key="index"
                    class="todo-item"
                    :class="{ 'finished': todo.finished }"
                >
                    <el-checkbox 
                        v-model="todo.finished" 
                        @change="toggleTodo(index)"
                    />
                    <div class="todo-content">
                        <span class="todo-text">{{ todo.content }}</span>
                        <div class="todo-meta">
                            <el-tag 
                                :type="getPriorityType(todo.priority)" 
                                size="small"
                            >
                                {{ getPriorityText(todo.priority) }}
                            </el-tag>
                        </div>
                    </div>
                    <el-button 
                        type="danger" 
                        size="small" 
                        text
                        @click="deleteTodo(index)"
                    >
                        <el-icon><Delete /></el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 主编辑器区域 -->
        <div class="main-editor">
            <div class="editor-header">
                <h3>工作区</h3>
                <div class="editor-actions">
                    <el-button size="small" @click="clearAllBlocks">清空所有</el-button>
                    <el-button type="primary" size="small" @click="saveContent">保存</el-button>
                </div>
            </div>
            
            <!-- 可编辑区域列表 -->
            <div class="blocks-container">
                <div 
                    v-for="(block, index) in blocks" 
                    :key="block.id"
                    class="block-item"
                    :class="`block-${block.type}`"
                >
                    <div class="block-header">
                        <div class="block-type-label">{{ getBlockTypeLabel(block.type) }}</div>
                        <el-button 
                            type="danger" 
                            size="small" 
                            text
                            @click="deleteBlock(index)"
                        >
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </div>
                    <!-- 编辑模式 -->
                    <div 
                        v-if="isBlockEditing(block.id)"
                        class="block-content editing"
                        :contenteditable="true"
                        :ref="(el) => setBlockRef(el, block.id)"
                        @blur="handleBlockBlur(index, block.id, $event)"
                        @paste="handleBlockPaste"
                        @keydown="handleBlockKeydown($event, index)"
                        v-text="block.content"
                    ></div>
                    
                    <!-- 预览模式 -->
                    <div 
                        v-else
                        class="block-content preview"
                        @click="handleBlockFocus(block.id)"
                        v-html="renderMarkdown(block.content)"
                    ></div>
                </div>
                <div class="command-input">
                    <el-input
                        ref="commandInputRef"
                        v-model="commandInput"
                        placeholder="输入 /p(进度), /t(待办), /b(缺陷), /i(灵感), /n(笔记) 来创建对应区域"
                        @keydown.enter="handleCommand"
                        clearable
                    />
                </div>
            </div>
        </div>

        <!-- 灵感池区域 -->
        <div class="idea-pool">
            <div class="section-header">
                <h3>灵感池</h3>
            </div>
            <div class="idea-items">
                <div 
                    v-for="(idea, index) in ideas" 
                    :key="index"
                    class="idea-item"
                    @click="selectIdea(idea)"
                >
                    <div class="idea-header">
                        <h4>{{ idea.title }}</h4>
                        <el-button 
                            type="danger" 
                            size="small" 
                            text
                            @click.stop="deleteIdea(index)"
                        >
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </div>
                    <p class="idea-content">{{ idea.content }}</p>
                    <div class="idea-footer">
                        <span class="idea-date">{{ formatDate(idea.createdAt) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

// 创建Markdown解析器
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true  // 启用换行符转换
})

const input = ref('')
const commandInput = ref('')
const commandInputRef = ref(null)

// 工作区块数据
const blocks = reactive([])

// 当前正在编辑的区域ID
const editingBlockId = ref(null)

// 存储区域引用
const blockRefs = new Map()

// 设置区域引用
const setBlockRef = (el, blockId) => {
    if (el) {
        blockRefs.set(blockId, el)
    }
}

// 渲染Markdown内容
const renderMarkdown = (content) => {
    if (!content || content.trim() === '') return ''
    
    // 将所有换行符转换为两个空格+换行，这是Markdown的硬换行语法
    const processedContent = content.replace(/\n/g, '  \n')
    
    return md.render(processedContent)
}

// 判断区域是否正在编辑
const isBlockEditing = (blockId) => {
    return editingBlockId.value === blockId
}

// 生成唯一ID
const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9)
}

// 待办事项数据
const todos = reactive([
    {
        content: "完成项目文档编写",
        priority: 3,
        finished: false,
        createdAt: new Date()
    },
    {
        content: "优化代码性能",
        priority: 2,
        finished: false,
        createdAt: new Date()
    },
    {
        content: "学习新技术框架",
        priority: 1,
        finished: true,
        createdAt: new Date()
    }
])

// 灵感数据
const ideas = reactive([
    {
        title: "移动端适配方案",
        content: "考虑使用 CSS Grid 和 Flexbox 结合的方式来实现响应式布局，可以更好地适配不同屏幕尺寸。",
        createdAt: new Date('2024-01-15')
    },
    {
        title: "用户体验优化",
        content: "添加骨架屏加载效果，减少用户等待时的焦虑感，同时考虑添加懒加载来提升页面性能。",
        createdAt: new Date('2024-01-14')
    },
    {
        title: "数据可视化",
        content: "使用 ECharts 或 D3.js 来创建交互式图表，让数据展示更加直观和美观。",
        createdAt: new Date('2024-01-13')
    }
])

// 切换待办事项完成状态
const toggleTodo = (index) => {
    const todo = todos[index]
    ElMessage.success(todo.finished ? '任务已完成！' : '任务已标记为未完成')
}

// 删除待办事项
const deleteTodo = (index) => {
    todos.splice(index, 1)
    ElMessage.success('待办事项已删除')
}

// 获取优先级类型
const getPriorityType = (priority) => {
    const typeMap = {
        3: 'danger',
        2: 'warning',
        1: 'info'
    }
    return typeMap[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority) => {
    const textMap = {
        3: '高',
        2: '中',
        1: '低'
    }
    return textMap[priority] || '中'
}

// 删除灵感
const deleteIdea = (index) => {
    ideas.splice(index, 1)
    ElMessage.success('灵感已删除')
}

// 选择灵感（将灵感内容添加到编辑器）
const selectIdea = (idea) => {
    // 创建一个新的idea区域，使用纯文本格式
    const newBlock = {
        id: generateId(),
        type: 'idea',
        content: `${idea.title}\n\n${idea.content}`,
        createdAt: new Date()
    }
    blocks.push(newBlock)
    ElMessage.success('灵感已添加到工作区')
}

// 获取区域类型标签
const getBlockTypeLabel = (type) => {
    const labels = {
        progress: '进度',
        todo: '待办',
        bug: '缺陷',
        idea: '灵感', 
        note: '笔记'
    }
    return labels[type] || type
}

// 处理命令输入
const handleCommand = () => {
    const command = commandInput.value.trim().toLowerCase()
    const validCommands = ['/p', '/t', '/b', '/i', '/n']
    
    if (validCommands.includes(command)) {
        const typeMap = {
            '/p': 'progress',
            '/t': 'todo',
            '/b': 'bug',
            '/i': 'idea',
            '/n': 'note'
        }
        const type = typeMap[command]
        createBlock(type)
        commandInput.value = ''
    } else if (command.startsWith('/')) {
        ElMessage.warning('无效命令，请使用 /p, /t, /b, /i, /n')
    }
}

// 创建新区域
const createBlock = async (type) => {
    const newBlock = {
        id: generateId(),
        type: type,
        content: '',
        createdAt: new Date()
    }
    blocks.push(newBlock)
    
    // 设置为编辑模式
    editingBlockId.value = newBlock.id
    
    // 等待DOM更新后聚焦到新区域
    await nextTick()
    
    // 使用 setTimeout 确保DOM完全渲染
    setTimeout(() => {
        const blockElement = blockRefs.get(newBlock.id)
        if (blockElement) {
            // 确保内容为空
            blockElement.textContent = ''
            blockElement.focus()
            
            // 设置光标到开始位置
            const range = document.createRange()
            const selection = window.getSelection()
            range.setStart(blockElement, 0)
            range.setEnd(blockElement, 0)
            selection.removeAllRanges()
            selection.addRange(range)
        }
    }, 10)
    
    ElMessage.success(`${getBlockTypeLabel(type)}区域已创建`)
}

// 处理区域获得焦点
const handleBlockFocus = (blockId) => {
    editingBlockId.value = blockId
    
    // 等待DOM更新后聚焦
    nextTick(() => {
        const blockElement = blockRefs.get(blockId)
        if (blockElement) {
            // 找到对应的block数据
            const block = blocks.find(b => b.id === blockId)
            if (block) {
                // 设置原始文本内容，保持换行符
                blockElement.textContent = block.content
            }
            
            blockElement.focus()
            
            // 设置光标到末尾
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(blockElement)
            range.collapse(false) // 折叠到末尾
            selection.removeAllRanges()
            selection.addRange(range)
        }
    })
}

// 处理区域失去焦点
const handleBlockBlur = (index, blockId, event) => {
    // 保存原始内容，保持换行符
    const content = event.target.innerText || event.target.textContent || ''
    blocks[index].content = content
    editingBlockId.value = null
}

// 处理粘贴事件，确保粘贴纯文本
const handleBlockPaste = (event) => {
    event.preventDefault()
    const text = (event.clipboardData || window.clipboardData).getData('text/plain')
    document.execCommand('insertText', false, text)
}

// 全局键盘事件处理
const handleGlobalKeydown = (event) => {
    // 检查是否按下了"/"键
    if (event.key === '/') {
        // 检查当前焦点是否在输入框或可编辑元素上
        const activeElement = document.activeElement
        const isInInput = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true' ||
            activeElement.isContentEditable
        )
        
        // 如果不在输入框或可编辑元素中，且没有区域正在编辑
        if (!isInInput && !editingBlockId.value) {
            event.preventDefault()
            
            // 聚焦到命令输入框并设置值为"/"
            nextTick(() => {
                if (commandInputRef.value) {
                    commandInput.value = '/'
                    commandInputRef.value.focus()
                    // 将光标定位到末尾
                    const input = commandInputRef.value.$refs.input || commandInputRef.value.input
                    if (input) {
                        input.setSelectionRange(1, 1)
                    }
                }
            })
        }
    }
}

// 处理区域内按键事件
const handleBlockKeydown = (event, index) => {
    
}

// 删除区域
const deleteBlock = (index) => {
    const blockType = getBlockTypeLabel(blocks[index].type)
    blocks.splice(index, 1)
    ElMessage.success(`${blockType}区域已删除`)
}

// 清空所有区域
const clearAllBlocks = () => {
    blocks.splice(0, blocks.length)
    // 同时清理localStorage
    localStorage.removeItem('workspace-blocks')
    ElMessage.success('所有区域已清空')
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
}

// 清空编辑器
const clearEditor = () => {
    blocks.splice(0, blocks.length)
    ElMessage.success('工作区已清空')
}

// 保存内容
const saveContent = () => {
    if (blocks.length === 0) {
        ElMessage.warning('没有内容需要保存')
        return
    }
    
    // 保存所有区域数据
    localStorage.setItem('workspace-blocks', JSON.stringify(blocks))
    ElMessage.success('内容已保存')
}

// 组件挂载时恢复内容
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
    // 恢复工作区块数据
    const savedBlocks = localStorage.getItem('workspace-blocks')
    if (savedBlocks) {
        try {
            const parsedBlocks = JSON.parse(savedBlocks)
            blocks.splice(0, blocks.length, ...parsedBlocks)
        } catch (error) {
            console.warn('恢复工作区数据失败:', error)
        }
    }
    
    // 添加全局键盘监听
    document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
    // 移除全局键盘监听
    document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.workspace {
    display: grid;
    grid-template-columns: 260px 1fr 280px;
    height: 100vh;
    gap: 0;
    padding: 0;
    background: #f8f9fa;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

/* 通用区域样式 */
.todo-list,
.idea-pool {
    background: #ffffff;
    border-right: 1px solid #e1e4e8;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.main-editor {
    background: #ffffff;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 区域头部样式 */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1e4e8;
}

.section-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1e4e8;
}

.editor-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.editor-actions {
    display: flex;
    gap: 6px;
}

/* 待办事项样式 */
.todo-items {
    flex: 1;
    overflow-y: auto;
}

.todo-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px;
    margin-bottom: 4px;
    border: none;
    border-radius: 4px;
    transition: background-color 0.15s ease;
    cursor: pointer;
    font-size: 13px;
}

.todo-item:hover {
    background-color: #f6f8fa;
}

.todo-item.finished {
    opacity: 0.6;
    background: #f0f9ff;
}

.todo-item.finished .todo-text {
    text-decoration: line-through;
    color: #656d76;
}

.todo-content {
    flex: 1;
    min-width: 0;
}

.todo-text {
    display: block;
    font-size: 13px;
    line-height: 1.4;
    color: #24292f;
    margin-bottom: 2px;
    word-wrap: break-word;
}

.todo-meta {
    display: flex;
    justify-content: flex-start;
}

/* 灵感池样式 */
.idea-items {
    flex: 1;
    overflow-y: auto;
}

.idea-item {
    padding: 10px;
    margin-bottom: 6px;
    border: none;
    border-radius: 4px;
    transition: background-color 0.15s ease;
    cursor: pointer;
    font-size: 13px;
}

.idea-item:hover {
    background-color: #f6f8fa;
}

.idea-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.idea-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
}

.idea-content {
    font-size: 12px;
    color: #656d76;
    line-height: 1.4;
    margin: 4px 0 6px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.idea-footer {
    display: flex;
    justify-content: flex-end;
}

.idea-date {
    font-size: 12px;
    color: #c0c4cc;
}

/* 主编辑器样式 */

.blocks-container {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
}

.block-item {
    margin-bottom: 12px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    background: #ffffff;
    transition: border-color 0.15s ease;
}

.block-item:hover {
    border-color: #8b949e;
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: #f6f8fa;
    border-bottom: 1px solid #d1d9e0;
    border-radius: 5px 5px 0 0;
}

.block-type-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.block-content {
    min-height: 20px;
    padding: 12px;
    font-size: 13px;
    outline: none;
    cursor: text;
    transition: background-color 0.15s ease;
    line-height: 1.5;
}

.block-content.editing {
    background: #f6f8fa;
    border: 1px solid #0969da;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.block-content.preview {
    cursor: pointer;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.block-content.preview:hover {
    background: #f6f8fa;
}

/* Markdown渲染样式 */
.block-content :deep(h1),
.block-content :deep(h2),
.block-content :deep(h3),
.block-content :deep(h4),
.block-content :deep(h5),
.block-content :deep(h6) {
    margin: 0.1em 0;
    font-weight: 600;
    line-height: 1.0;
}

.block-content :deep(h1) { font-size: 1.5em; }
.block-content :deep(h2) { font-size: 1.3em; }
.block-content :deep(h3) { font-size: 1.2em; }
.block-content :deep(h4) { font-size: 1.1em; }
.block-content :deep(h5) { font-size: 1em; }
.block-content :deep(h6) { font-size: 0.9em; }

.block-content :deep(p) {
    margin: 0;
    line-height: 1.0;
}

.block-content :deep(ul),
.block-content :deep(ol) {
    margin: 0;
    padding-left: 1.5em;
}

.block-content :deep(li) {
    margin: 0;
    line-height: 1.0;
}

.block-content :deep(blockquote) {
    margin: 0.1em 0;
    padding: 0.2em 0.4em;
    border-left: 4px solid #dfe2e5;
    background: #f8f9fa;
    color: #6a737d;
    line-height: 1.0;
}

.block-content :deep(code) {
    background: #f3f4f6;
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: 'Courier New', monospace;
    line-height: 1.0;
}

.block-content :deep(pre) {
    background: #f6f8fa;
    padding: 0.2em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.1em 0;
    line-height: 1.0;
}

.block-content :deep(pre code) {
    background: none;
    padding: 0;
}

.block-content :deep(a) {
    color: #0366d6;
    text-decoration: none;
}

.block-content :deep(a:hover) {
    text-decoration: underline;
}

.block-content :deep(strong) {
    font-weight: 600;
}

.block-content :deep(em) {
    font-style: italic;
}

.block-content :deep(hr) {
    border: none;
    border-top: 1px solid #e1e4e8;
    margin: 0.1em 0;
}

.block-content :deep(table) {
    border-collapse: collapse;
    margin: 0.1em 0;
    width: 100%;
}

.block-content :deep(th),
.block-content :deep(td) {
    border: 1px solid #d0d7de;
    padding: 0.2em;
    text-align: left;
    line-height: 1.0;
}

.block-content :deep(th) {
    background: #f6f8fa;
    font-weight: 600;
}

.command-input {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #d1d9e0;
}

/* 不同类型区域的颜色主题 - 使用GitHub风格的颜色 */
.block-progress {
    border-color: #1f883d;
}

.block-progress .block-type-label {
    color: #1f883d;
}

.block-todo {
    border-color: #bf8700;
}

.block-todo .block-type-label {
    color: #bf8700;
}

.block-bug {
    border-color: #d1242f;
}

.block-bug .block-type-label {
    color: #d1242f;
}

.block-idea {
    border-color: #8250df;
}

.block-idea .block-type-label {
    color: #8250df;
}

.block-note {
    border-color: #656d76;
}

.block-note .block-type-label {
    color: #656d76;
}

/* 滚动条样式 - 桌面应用风格 */
.todo-items::-webkit-scrollbar,
.idea-items::-webkit-scrollbar,
.blocks-container::-webkit-scrollbar {
    width: 8px;
}

.todo-items::-webkit-scrollbar-track,
.idea-items::-webkit-scrollbar-track,
.blocks-container::-webkit-scrollbar-track {
    background: transparent;
}

.todo-items::-webkit-scrollbar-thumb,
.idea-items::-webkit-scrollbar-thumb,
.blocks-container::-webkit-scrollbar-thumb {
    background: #d1d9e0;
    border-radius: 4px;
}

.todo-items::-webkit-scrollbar-thumb:hover,
.idea-items::-webkit-scrollbar-thumb:hover,
.blocks-container::-webkit-scrollbar-thumb:hover {
    background: #8b949e;
}

/* 响应式设计 - 简化桌面应用版本 */
@media (max-width: 1024px) {
    .workspace {
        grid-template-columns: 240px 1fr 260px;
        gap: 0;
    }
}

@media (max-width: 768px) {
    .workspace {
        grid-template-columns: 1fr;
        grid-template-rows: 200px 200px 1fr;
        height: 100vh;
    }
    
    .todo-list,
    .idea-pool {
        border-right: none;
        border-bottom: 1px solid #e1e4e8;
    }
    
    .main-editor {
        border: none;
    }
}

/* 移除动画效果，桌面应用更注重性能 */

/* Element Plus 组件样式优化 - 桌面应用风格 */
:deep(.el-button) {
    border-radius: 4px;
    font-size: 12px;
    height: 28px;
    padding: 4px 8px;
}

:deep(.el-button--small) {
    height: 24px;
    padding: 2px 6px;
    font-size: 11px;
}

:deep(.el-input__wrapper) {
    border-radius: 4px;
    font-size: 13px;
}

:deep(.el-tag) {
    border-radius: 3px;
    font-size: 11px;
    height: 20px;
    line-height: 18px;
}

:deep(.el-checkbox) {
    font-size: 13px;
}

/* 对话框样式优化 - 移除，桌面应用通常不需要复杂对话框 */
</style>