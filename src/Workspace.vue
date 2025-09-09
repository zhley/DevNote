<template>
    <div class="workspace" :style="workspaceStyle">
        <!-- 左侧工具栏 -->
        <div class="sidebar-toolbar">
            <div 
                class="toolbar-item"
                :class="{ active: activeTab === 'todo' }"
                @click="setActiveTab('todo')"
                title="待办清单"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
            </div>
            <div 
                class="toolbar-item"
                :class="{ active: activeTab === 'idea' }"
                @click="setActiveTab('idea')"
                title="灵感池"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
                </svg>
            </div>
        </div>

        <!-- 左侧内容区域 -->
        <div class="sidebar-content" :style="{ width: leftWidth + 'px' }">
            <!-- 待办清单区域 -->
            <div v-if="activeTab === 'todo'" class="todo-list">
                <div class="section-header">
                    <h3>待办清单</h3>
                    <div class="header-tools">
                        <el-button 
                            size="small" 
                            text 
                            @click="toggleAllTodosExpansion"
                            :title="allTodosExpanded ? '折叠所有详情' : '展开所有详情'"
                        >
                            <el-icon>
                                <MoreFilled v-if="!allTodosExpanded" />
                                <ArrowUp v-else />
                            </el-icon>
                        </el-button>
                    </div>
                </div>
                <div class="todo-items">
                    <div 
                        v-for="(todo, index) in todos" 
                        :key="index"
                        class="todo-item"
                        :class="{ 'finished': todo.finished }"
                    >
                        <div class="todo-content">
                            <div class="todo-header" @click="toggleTodoExpansion(index)">
                                <span class="todo-title">{{ todo.title }}</span>
                            </div>
                            <div 
                                v-if="expandedTodos.has(index)" 
                                class="todo-details"
                                v-html="renderMarkdown(todo.content)"
                            >
                            </div>
                            <div class="todo-meta">
                                <el-tag 
                                    :type="getPriorityType(todo.priority)" 
                                    size="small"
                                >
                                    {{ getPriorityText(todo.priority) }}
                                </el-tag>
                                <span class="todo-dates">
                                    <span class="created-date">{{ formatDateTime(todo.createdAt) }}</span>
                                    <span v-if="todo.finished && todo.completedAt" class="completed-date">
                                        -{{ formatDateTime(todo.completedAt) }}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <el-checkbox 
                            v-model="todo.finished" 
                            @change="toggleTodo(index)"
                            @click.stop
                            class="todo-checkbox"
                        />
                    </div>
                </div>
            </div>

            <!-- 灵感池区域 -->
            <div v-if="activeTab === 'idea'" class="idea-pool">
                <div class="section-header">
                    <h3>灵感池</h3>
                </div>
                <div class="idea-items">
                    <div 
                        v-for="(idea, index) in ideas" 
                        :key="index"
                        class="idea-item"
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

        <!-- 分隔线 -->
        <div 
            class="resizer left-resizer" 
            @mousedown="startResize('left', $event)"
        ></div>

        <!-- 主编辑器区域 -->
        <div class="main-editor" :style="{ width: centerWidth + 'px' }">
            <div class="editor-header">
                <div class="date-selector" @click="showDatePicker = true">
                    <span class="current-date">{{ formatCurrentDate() }}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="calendar-icon">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                </div>
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
                    :data-type="getBlockTypeLabel(block.type)"
                >
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
        
        <!-- 日期选择器弹窗 -->
        <el-dialog 
            v-model="showDatePicker" 
            title="选择日期" 
            width="300px"
            :modal="true"
            :close-on-click-modal="true"
            :close-on-press-escape="true"
        >
            <el-date-picker
                v-model="currentDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                @change="handleDateChange"
                :clearable="false"
            />
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { Delete, ArrowUp, MoreFilled } from '@element-plus/icons-vue'
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

// 宽度调整相关状态
const leftWidth = ref(280)
const isResizing = ref(false)
const resizingType = ref('')
const startX = ref(0)
const startLeftWidth = ref(0)

// 侧边栏状态
const activeTab = ref('todo')

// 日期相关状态
const currentDate = ref(new Date())
const showDatePicker = ref(false)

// 计算中间区域宽度
const centerWidth = computed(() => {
    const totalWidth = window.innerWidth || 1200
    return totalWidth - 48 - leftWidth.value - 1 // 48px toolbar + 1px resizer
})

// 计算workspace样式
const workspaceStyle = computed(() => ({
    gridTemplateColumns: `48px ${leftWidth.value}px 1px 1fr`
}))

// 设置活动标签
const setActiveTab = (tab) => {
    activeTab.value = tab
    // 保存当前活动标签到localStorage
    localStorage.setItem('workspace-active-tab', tab)
}

// 开始调整大小
const startResize = (type, event) => {
    isResizing.value = true
    resizingType.value = type
    startX.value = event.clientX
    startLeftWidth.value = leftWidth.value
    
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    
    event.preventDefault()
}

// 处理调整大小
const handleResize = (event) => {
    if (!isResizing.value) return
    
    const deltaX = event.clientX - startX.value
    const minWidth = 200
    const maxWidth = window.innerWidth - 300 // 保留最小300px给主编辑器
    
    if (resizingType.value === 'left') {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startLeftWidth.value + deltaX))
        leftWidth.value = newWidth
    }
}

// 停止调整大小
const stopResize = () => {
    isResizing.value = false
    resizingType.value = ''
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    
    // 保存宽度设置到localStorage
    localStorage.setItem('workspace-widths', JSON.stringify({
        leftWidth: leftWidth.value
    }))
}

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
        title: "完成项目文档编写",
        content: "需要编写完整的项目文档，包括：\n- 项目介绍和功能说明\n- 安装和使用指南\n- API 文档\n- 常见问题解答",
        priority: 3,
        finished: false,
        createdAt: new Date('2024-10-11'),
        completedAt: null
    },
    {
        title: "优化代码性能",
        content: "分析当前代码性能瓶颈：\n- 数据库查询优化\n- 前端资源压缩\n- 缓存策略改进\n- 代码分割和懒加载",
        priority: 2,
        finished: false,
        createdAt: new Date('2024-10-15'),
        completedAt: null
    },
    {
        title: "学习新技术框架",
        content: "深入学习 Vue 3 新特性和相关生态：\n- Composition API 实践\n- Pinia 状态管理\n- Vue Router 4\n- TypeScript 集成",
        priority: 1,
        finished: true,
        createdAt: new Date('2024-09-20'),
        completedAt: new Date('2024-11-10')
    }
])

// 待办事项展开状态管理
const expandedTodos = reactive(new Set())
const allTodosExpanded = ref(false)

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
    if (todo.finished) {
        todo.completedAt = null
        ElMessage.success('任务已标记为未完成')
    } else {
        todo.completedAt = new Date()
        ElMessage.success('任务已完成！')
    }
}

// 切换待办事项详情展开状态
const toggleTodoExpansion = (index) => {
    if (expandedTodos.has(index)) {
        expandedTodos.delete(index)
    } else {
        expandedTodos.add(index)
    }
}

// 全部展开/收起待办事项详情
const toggleAllTodosExpansion = () => {
    if (allTodosExpanded.value) {
        // 收起全部
        expandedTodos.clear()
        allTodosExpanded.value = false
    } else {
        // 展开全部
        todos.forEach((_, index) => {
            expandedTodos.add(index)
        })
        allTodosExpanded.value = true
    }
}

// 格式化日期显示
const formatDateTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
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

// 获取区域类型标签
const getBlockTypeLabel = (type) => {
    const labels = {
        progress: 'progress',
        todo: 'todo',
        bug: 'bug',
        idea: 'idea', 
        note: 'note'
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
    // 检查是否按下了退格键或删除键
    if (event.key === 'Backspace' || event.key === 'Delete') {
        const target = event.target
        const content = target.textContent || target.innerText || ''
        
        // 如果内容为空，删除这个block
        if (content.trim() === '') {
            event.preventDefault()
            
            // 获取block信息用于提示
            const block = blocks[index]
            const blockType = getBlockTypeLabel(block.type)
            
            // 删除block
            blocks.splice(index, 1)
            editingBlockId.value = null
            
            ElMessage.success(`${blockType}区域已删除`)
        }
    }
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

// 格式化当前日期为标题格式
const formatCurrentDate = () => {
    const d = new Date(currentDate.value)
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 处理日期选择
const handleDateChange = (date) => {
    currentDate.value = date
    showDatePicker.value = false
    // 保存当前日期到localStorage
    localStorage.setItem('workspace-current-date', date.toISOString())
    // 可以在这里添加根据日期加载对应内容的逻辑
    ElMessage.success(`日期已切换到 ${formatCurrentDate()}`)
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
    // 恢复宽度设置
    const savedWidths = localStorage.getItem('workspace-widths')
    if (savedWidths) {
        try {
            const widths = JSON.parse(savedWidths)
            leftWidth.value = widths.leftWidth || 280
        } catch (error) {
            console.warn('恢复宽度设置失败:', error)
        }
    }
    
    // 恢复活动标签
    const savedActiveTab = localStorage.getItem('workspace-active-tab')
    if (savedActiveTab) {
        activeTab.value = savedActiveTab
    }
    
    // 恢复当前日期
    const savedDate = localStorage.getItem('workspace-current-date')
    if (savedDate) {
        currentDate.value = new Date(savedDate)
    }
    
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
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
    // 移除全局键盘监听
    document.removeEventListener('keydown', handleGlobalKeydown)
    window.removeEventListener('resize', handleWindowResize)
    
    // 清理拖拽事件
    if (isResizing.value) {
        stopResize()
    }
})

// 处理窗口大小变化
const handleWindowResize = () => {
    // 确保宽度在合理范围内
    const totalWidth = window.innerWidth
    const minTotalWidth = 600
    
    if (totalWidth < minTotalWidth) {
        leftWidth.value = 200
    } else {
        // 如果窗口变小，按比例调整
        const maxAllowed = totalWidth - 300 // 保留300px给主编辑器和工具栏
        
        if (leftWidth.value > maxAllowed) {
            leftWidth.value = Math.max(200, maxAllowed)
        }
    }
}
</script>

<style scoped>
.workspace {
    display: grid;
    grid-template-columns: 48px 280px 1px 1fr;
    height: 100vh;
    width: 100vw;
    gap: 0;
    padding: 0;
    margin: 0;
    background: #f8f9fa;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

/* 浅色调的侧边工具栏 */
.sidebar-toolbar {
    width: 48px;
    background: #f8f8f8;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    position: relative;
    overflow: visible;
}

.toolbar-item {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 0;
    color: #666666;
    transition: all 0.15s ease;
    position: relative;
}

.toolbar-item:hover {
    background: #e8e8e8;
    color: #333333;
}

.toolbar-item.active {
    background: #e1f5fe;
    color: #1976d2;
    position: relative;
}

.toolbar-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #1976d2;
    z-index: 10;
}

/* 侧边栏内容区域 */
.sidebar-content {
    background: #ffffff;
    border-right: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
}

/* 分隔线样式 */
.resizer {
    width: 1px;
    background: #d1d9e0;
    cursor: col-resize;
    position: relative;
    transition: background-color 0.15s ease;
    z-index: 10;
}

.resizer:hover {
    background: #8b949e;
    width: 3px;
    margin-left: -1px;
    margin-right: -1px;
}

.resizer:active {
    background: #0969da;
    width: 3px;
    margin-left: -1px;
    margin-right: -1px;
}

/* 分隔线激活状态的视觉提示 */
.resizer::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 30px;
    background: #ffffff;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.resizer:hover::before {
    opacity: 0.8;
}

/* 通用区域样式 */
.todo-list,
.idea-pool {
    background: #ffffff;
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
}

.main-editor {
    background: #ffffff;
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
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

.date-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.15s ease;
}

.date-selector:hover {
    background-color: #f6f8fa;
}

.current-date {
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
}

.calendar-icon {
    color: #656d76;
    transition: color 0.15s ease;
}

.date-selector:hover .calendar-icon {
    color: #24292f;
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
    margin-right: -16px;
    padding-right: 16px;
}

.todo-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
    margin-bottom: 6px;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    transition: all 0.15s ease;
    font-size: 13px;
    background: #ffffff;
}

.todo-item:hover {
    background-color: #f6f8fa;
    border-color: #d0d7de;
}

.todo-item.finished {
    opacity: 0.6;
    background: #f0f9ff;
    border-color: #c7d2fe;
}

.todo-item.finished .todo-title {
    text-decoration: line-through;
    color: #656d76;
}

.todo-content {
    flex: 1;
    min-width: 0;
}

.todo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 6px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    margin: -2px -4px 4px -4px;
}

.todo-header:hover {
    background-color: rgba(246, 248, 250, 0.8);
}

.todo-title {
    font-size: 14px;
    font-weight: 500;
    color: #24292f;
    flex: 1;
}

.todo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    padding-top: 4px;
    border-top: 1px solid #f1f3f4;
}

.todo-dates {
    font-size: 11px;
    color: #656d76;
    display: flex;
    align-items: center;
}

.created-date {
    color: #656d76;
}

.completed-date {
    color: #1f883d;
    font-weight: 500;
}

.todo-details {
    margin: 8px 0;
    padding: 8px 0;
    font-size: 12px;
    line-height: 1.5;
    color: #656d76;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
}

.todo-checkbox {
    margin-top: 2px;
    flex-shrink: 0;
}

.header-tools {
    display: flex;
    gap: 4px;
}

.header-tools .el-button {
    padding: 2px 4px;
    font-size: 12px;
}

/* 待办清单详情的markdown渲染样式 */
.todo-details :deep(h1),
.todo-details :deep(h2),
.todo-details :deep(h3),
.todo-details :deep(h4),
.todo-details :deep(h5),
.todo-details :deep(h6) {
    margin: 0.5em 0 0.3em 0;
    font-weight: 600;
    line-height: 1.2;
    color: #656d76;
}

.todo-details :deep(h1) { font-size: 1.1em; }
.todo-details :deep(h2) { font-size: 1.05em; }
.todo-details :deep(h3) { font-size: 1em; }
.todo-details :deep(h4) { font-size: 0.95em; }
.todo-details :deep(h5) { font-size: 0.9em; }
.todo-details :deep(h6) { font-size: 0.85em; }

.todo-details :deep(p) {
    margin: 0.3em 0;
    line-height: 1.4;
    color: #656d76;
}

.todo-details :deep(ul),
.todo-details :deep(ol) {
    margin: 0.3em 0;
    padding-left: 1.2em;
    color: #656d76;
}

.todo-details :deep(li) {
    margin: 0.1em 0;
    line-height: 1.3;
    color: #656d76;
}

.todo-details :deep(code) {
    background: #f3f4f6;
    padding: 0.1em 0.2em;
    border-radius: 2px;
    font-size: 0.9em;
    color: #586069;
}

.todo-details :deep(pre) {
    background: #f6f8fa;
    padding: 0.4em;
    border-radius: 3px;
    overflow-x: auto;
    margin: 0.3em 0;
    color: #586069;
}

.todo-details :deep(blockquote) {
    margin: 0.3em 0;
    padding: 0.2em 0.4em;
    border-left: 2px solid #d1d9e0;
    color: #8b949e;
}

/* 灵感池样式 */
.idea-items {
    flex: 1;
    overflow-y: auto;
    margin-right: -16px;
    padding-right: 16px;
}

.idea-item {
    padding: 10px;
    margin-bottom: 6px;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    transition: all 0.15s ease;
    font-size: 13px;
    background: #ffffff;
}

.idea-item:hover {
    background-color: #f6f8fa;
    border-color: #d0d7de;
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
    margin-right: -16px;
    padding-right: 16px;
}

.block-item {
    margin-bottom: 12px;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    background: #ffffff;
    transition: border-color 0.15s ease;
    position: relative;
}

.block-item:hover {
    border-color: #8b949e;
}

.block-item::before {
    content: attr(data-type);
    position: absolute;
    top: -8px;
    left: 12px;
    background: #ffffff;
    padding: 0 6px;
    font-size: 10px;
    font-weight: 500;
    text-transform: lowercase;
    letter-spacing: 0.3px;
    z-index: 1;
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

.command-input {
    margin-top: 12px;
}

.command-input :deep(.el-input__inner) {
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
}

/* 不同类型区域的颜色主题 - 使用GitHub风格的颜色 */
.block-progress {
    border-color: #1f883d;
}

.block-progress::before {
    color: #1f883d;
}

.block-todo {
    border-color: #bf8700;
}

.block-todo::before {
    color: #bf8700;
}

.block-bug {
    border-color: #d1242f;
}

.block-bug::before {
    color: #d1242f;
}

.block-idea {
    border-color: #8250df;
}

.block-idea::before {
    color: #8250df;
}

.block-note {
    border-color: #656d76;
}

.block-note::before {
    color: #656d76;
}

/* 滚动条样式 - 桌面应用风格 */
.todo-items::-webkit-scrollbar,
.idea-items::-webkit-scrollbar {
    width: 4px;
}

.blocks-container::-webkit-scrollbar {
    width: 4px;
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
    border-radius: 2px;
}

.todo-items::-webkit-scrollbar-thumb:hover,
.idea-items::-webkit-scrollbar-thumb:hover,
.blocks-container::-webkit-scrollbar-thumb:hover {
    background: #8b949e;
}

/* 响应式设计 - 简化桌面应用版本 */
@media (max-width: 1024px) {
    .workspace {
        grid-template-columns: 48px 240px 1px 1fr;
    }
}

@media (max-width: 768px) {
    .workspace {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        height: 100vh;
    }
    
    .sidebar-toolbar {
        width: 100%;
        height: 48px;
        flex-direction: row;
        justify-content: center;
        padding: 4px 0;
    }
    
    .toolbar-item {
        margin-bottom: 0;
        margin-right: 4px;
    }
    
    .toolbar-item.active::before {
        left: 0;
        right: 0;
        top: 0;
        bottom: auto;
        width: auto;
        height: 2px;
        border-radius: 0 0 1px 1px;
    }
    
    .sidebar-content {
        width: 100% !important;
    }
    
    .resizer {
        display: none;
    }
    
    .main-editor {
        width: 100% !important;
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

</style>