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
            <div 
                class="toolbar-item"
                :class="{ active: activeTab === 'bug' }"
                @click="setActiveTab('bug')"
                title="Bug列表"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 12h-4v-2h4m6 7h-2v-2h2m0-4h-2V9.5h2m-2-1V8c0-.6-.4-1-1-1h-1V5c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1v2H7c-.6 0-1 .4-1 1v.5H4v2h2V13H4v2h2v2c0 .6.4 1 1 1h1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-2h1c.6 0 1-.4 1-1v-2z"/>
                </svg>
            </div>
            <div 
                class="toolbar-item"
                :class="{ active: activeTab === 'progress' }"
                @click="setActiveTab('progress')"
                title="项目进度"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19C8.13,19 5,15.87 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.95,2.55 2,6.82 2,12C2,17.52 6.48,22 12,22C13.45,22 14.83,21.68 16.07,21.12L14.54,18.5C13.75,18.82 12.9,19 12,19M12,6A6,6 0 0,0 6,12C6,15.31 8.69,18 12,18C12.75,18 13.47,17.85 14.14,17.58L12,15.45V6Z"/>
                </svg>
            </div>
            <div 
                class="toolbar-item"
                :class="{ active: activeTab === 'notes' }"
                @click="setActiveTab('notes')"
                title="笔记"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </div>
            
        </div>

        <!-- 左侧内容区域 -->
        <div class="sidebar-content">
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
                            style="width: 20px; height: 18px;"
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
                        v-for="(todo, index) in sortedTodos" 
                        :key="todo.title + todo.createdAt"
                        class="todo-item"
                        :class="{ 'finished': todo.finished }"
                    >
                        <div class="todo-content">
                            <div class="todo-header" @click="toggleTodoExpansion(todo)">
                                <span class="todo-title">{{ todo.title }}</span>
                            </div>
                            <div 
                                v-if="expandedTodos.has(todo.title + todo.createdAt)" 
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
                                <!-- 灵感链接 -->
                                <div 
                                    v-if="todo.idea_id" 
                                    class="idea-link"
                                    @click="toggleIdeaTooltip(todo.idea_id)"
                                    @mouseenter="handleIdeaMouseEnter(todo.idea_id)"
                                    @mouseleave="handleIdeaMouseLeave(todo.idea_id)"
                                    tabindex="0"
                                    @blur="hideIdeaTooltip(todo.idea_id)"
                                >
                                    <el-icon class="idea-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
                                        </svg>
                                    </el-icon>
                                    <span class="idea-text">来自灵感</span>
                                    
                                    <!-- 悬浮卡片 -->
                                    <div 
                                        v-if="activeIdeaTooltip === todo.idea_id" 
                                        class="idea-tooltip"
                                        @click.stop
                                    >
                                        <div class="tooltip-header">
                                            <h5>{{ getIdeaTitleById(todo.idea_id) }}</h5>
                                        </div>
                                        <div class="tooltip-content">
                                            {{ todo.ideaContent }}
                                        </div>
                                    </div>
                                </div>
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
                            @change="toggleTodo(todo)"
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
                            <div class="idea-actions">
                                <el-button 
                                    v-if="idea.status === 'pending'"
                                    size="small" 
                                    text
                                    @click.stop="addToTodo(index)"
                                    title="加入待办"
                                >
                                    <el-icon>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                    </el-icon>
                                </el-button>
                                <el-button 
                                    type="danger" 
                                    size="small" 
                                    text
                                    @click.stop="discardIdea(index)"
                                    title="废弃"
                                >
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </div>
                        </div>
                        <p 
                            class="idea-content"
                            :class="{ 'expanded': expandedIdeas.has(index) }"
                            @click="toggleIdeaExpansion(index)"
                        >
                            {{ idea.content }}
                        </p>
                        <div class="idea-footer">
                            <el-tag 
                                :type="getStatusType(idea.status)" 
                                size="small"
                            >
                                {{ getStatusText(idea.status) }}
                            </el-tag>
                            <span class="idea-date">{{ formatDate(idea.createdAt) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bug列表区域 -->
            <div v-if="activeTab === 'bug'" class="bug-list">
                <div class="section-header">
                    <h3>Bug列表</h3>
                </div>
                <div class="bug-items">
                    <div 
                        v-for="(bug, index) in sortedBugs" 
                        :key="index"
                        class="bug-item"
                        :class="{ 'finished': bug.fixed }"
                        @click="showBugDetail(bug, index, $event)"
                    >
                        <div class="bug-header">
                            <h4 class="bug-title">{{ bug.title }}</h4>
                            <el-checkbox 
                                v-model="bug.fixed"
                                @click.stop
                                @change="toggleBugStatus(index)"
                                size="small"
                            />
                        </div>
                        <p class="bug-description">{{ bug.description }}</p>
                        <div class="bug-footer">
                            <span class="bug-dates">
                                <span class="created-date">{{ formatDateTime(bug.createdAt) }}</span>
                                <span v-if="bug.fixed && bug.completedAt" class="completed-date">
                                    -{{ formatDateTime(bug.completedAt) }}
                                </span>
                            </span>
                            <button 
                                class="edit-bug-btn"
                                @click.stop="editBug(bug, index)"
                                title="编辑Bug"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 项目进度区域 -->
            <div v-if="activeTab === 'progress'" class="progress-list">
                <div class="section-header">
                    <h3>项目进度</h3>
                </div>
                <div class="progress-items">
                    <div 
                        v-for="(progress, index) in sortedProgresses" 
                        :key="progress.id || index"
                        class="progress-item"
                    >
                        <div class="progress-header">
                            <div class="progress-date">{{ formatDate(progress.date) }}</div>
                            <div class="progress-count">{{ progress.content.length }} 项</div>
                        </div>
                        <div class="progress-content">
                            <div 
                                v-for="(item, itemIndex) in progress.content" 
                                :key="itemIndex"
                                class="progress-task"
                            >
                                <div class="task-indicator"></div>
                                <span class="task-text">{{ item }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 笔记列表区域 -->
            <div v-if="activeTab === 'notes'" class="notes-list">
                <div class="section-header">
                    <h3>笔记</h3>
                </div>
                <div class="note-items">
                    <div 
                        v-for="(note, index) in notes" 
                        :key="index"
                        class="note-item"
                        :class="{ 'selected': selectedNote === note }"
                        @click="selectNoteTemp(note)"
                        @dblclick="selectNotePermanent(note)"
                    >
                        <span class="note-title">{{ note.title }}</span>
                        <span class="note-date">{{ formatDate(note.lastModified) }}</span>
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
        <div class="main-editor">
            <!-- 日志模式 - 当不在笔记模式时显示 -->
            <div v-if="!isInNoteMode" class="log-editor">
                <div class="editor-header">
                    <div class="date-selector" @click="showDatePicker = true">
                        <span class="current-date">{{ formatCurrentDate() }}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="calendar-icon">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
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
                    :data-block-id="block.id"
                >
                    <!-- 编辑模式 - 使用textarea和v-model实现双向绑定 -->
                    <textarea 
                        v-if="isBlockEditing(block.id)"
                        class="block-content editing"
                        v-model="block.content"
                        :ref="(el) => setBlockRef(el, block.id)"
                        @blur="handleBlockBlur(index, block.id, $event)"
                        @paste="handleBlockPaste"
                        @keydown="handleBlockKeydown($event, index)"
                        rows="1"
                    ></textarea>
                    
                    <!-- 预览模式 - 只读，渲染content内容 -->
                    <div 
                        v-else
                        class="block-content preview"
                        @click="handlePreviewClick(block.id, $event)"
                        v-html="renderMarkdown(block.content)"
                    ></div>
                </div>
                <div class="command-input">
                    <el-input
                        ref="commandInputRef"
                        v-model="commandInput"
                        placeholder="输入 /t 标题 -p 1-3 创建待办，/b /i /n /p 标题 创建其他区域"
                        @keydown.enter="handleCommand"
                        clearable
                    />
                </div>
            </div>
            </div>
            
            <!-- 笔记展示模式 - 类似VSCode标签页 -->
            <div v-if="isInNoteMode" class="note-viewer">
                <!-- 标签页栏 -->
                <div v-if="openNoteTabs.length > 0 || temporaryTab" class="note-tabs">
                    <!-- 永久标签 -->
                    <div 
                        v-for="note in openNoteTabs" 
                        :key="note.title"
                        class="note-tab permanent"
                        :class="{ 'active': activeNoteTab?.title === note.title }"
                        @click="switchNoteTab(note)"
                    >
                        <span class="note-tab-title">{{ note.title }}</span>
                        <button 
                            class="note-tab-close"
                            @click.stop="closeNoteTab(note)"
                            title="关闭"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- 临时标签 -->
                    <div 
                        v-if="temporaryTab"
                        class="note-tab temporary"
                        :class="{ 'active': activeNoteTab?.title === temporaryTab.title }"
                        @click="switchNoteTab(temporaryTab)"
                    >
                        <span class="note-tab-title">{{ temporaryTab.title }}</span>
                        <button 
                            class="note-tab-close"
                            @click.stop="closeTemporaryTab()"
                            title="关闭"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- 当前激活标签的内容 -->
                <div v-if="activeNoteTab" class="note-tab-content">
                    <div class="note-viewer-content">
                        <!-- mavon-editor 编辑器 -->
                        <mavon-editor
                            v-model="activeNoteTab.content"
                            :toolbars="editorToolbars"
                            :ishljs="true"
                            language="zh-CN"
                            placeholder="开始编写你的笔记..."
                            fontSize="16px"
                            @save="handleNoteContentSave"
                            class="mavon-editor-wrapper"
                        />
                    </div>
                </div>
                
                <!-- 没有打开笔记标签时显示空白区域 -->
                <div v-if="openNoteTabs.length === 0 && !temporaryTab" class="empty-note-area">
                    <div class="empty-note-message">
                        <p>选择一个笔记开始编辑</p>
                    </div>
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

        <!-- Bug详情悬浮卡片 -->
        <div 
            v-if="showBugDetailCard"
            class="bug-detail-card"
            :style="bugDetailCardStyle"
            @click.stop
            @mousedown="startDrag"
        >
            <div class="bug-detail-header" @mousedown="startDrag">
                <h4 :class="{ 'completed': selectedBug?.fixed }">{{ selectedBug?.title }}</h4>
            </div>
            <div class="bug-detail-content">
                <p class="bug-detail-description">{{ selectedBug?.description }}</p>
                <p class="bug-detail-additional">{{ selectedBug?.additionalInfo }}</p>
                <div class="bug-detail-date">
                    {{ formatDate(selectedBug?.createdAt) }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, nextTick, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { Delete, ArrowUp, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import { open } from '@tauri-apps/plugin-shell'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// 导入数据库 API
import { 
    TodoAPI, BugAPI, IdeaAPI, NoteAPI, ProgressAPI, BlockAPI,
    getDatabase, dailyCleanup 
} from '../api/database'

// 注入初始化状态
const isInitialized = inject('isInitialized')
const initializationError = inject('initializationError')

// 注册mavon-editor组件
const components = {
    mavonEditor
}

// 创建Markdown解析器
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
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

// 当前选中的笔记
const selectedNote = ref(null)

// 打开的笔记标签
const openNoteTabs = reactive([])

// 当前激活的笔记标签
const activeNoteTab = ref(null)

// 临时标签（单击产生，双击或点击其他项会被替换）
const temporaryTab = ref(null)

// mavon-editor 工具栏配置
const editorToolbars = {
    link: true, // 链接
    imagelink: true, // 图片链接
    table: true, // 表格
    fullscreen: true, // 全屏编辑
    help: true, // 帮助
    undo: true, // 上一步
    redo: true, // 下一步
    save: true, // 保存（触发events中的save事件）
    subfield: true, // 单双栏模式
    preview: true, // 预览
}

// 是否在笔记模式（用户主动选择的）
const isInNoteMode = ref(false)

// 日期相关状态
const currentDate = ref(new Date())
const showDatePicker = ref(false)

// 计算workspace样式
const workspaceStyle = computed(() => ({
    '--left-width': `${leftWidth.value}px`
}))

// 设置活动标签
const setActiveTab = (tab) => {
    activeTab.value = tab
    
    if (tab === 'notes') {
        // 点击笔记工具栏时，进入笔记模式
        isInNoteMode.value = true
        // 不自动选择任何笔记，让用户手动选择
    } else {
        // 点击其他工具栏项时，退出笔记模式，进入日志模式
        isInNoteMode.value = false
    }
}

// 单击选择笔记（临时标签）
const selectNoteTemp = (note) => {
    // 如果已经是永久标签，直接切换
    const existingTab = openNoteTabs.find(tab => tab.title === note.title)
    if (existingTab) {
        activeNoteTab.value = note
        selectedNote.value = note
        return
    }
    
    // 如果有临时标签且不是当前笔记，替换临时标签
    if (temporaryTab.value && temporaryTab.value.title !== note.title) {
        temporaryTab.value = note
    } else if (!temporaryTab.value) {
        // 创建新的临时标签
        temporaryTab.value = note
    }
    
    // 设置为当前激活的标签
    activeNoteTab.value = note
    selectedNote.value = note
}

// 双击选择笔记（永久标签）
const selectNotePermanent = (note) => {
    // 如果是临时标签，转换为永久标签
    if (temporaryTab.value && temporaryTab.value.title === note.title) {
        temporaryTab.value = null
        openNoteTabs.push(note)
    } else {
        // 检查是否已经是永久标签
        const existingTab = openNoteTabs.find(tab => tab.title === note.title)
        if (!existingTab) {
            // 清除临时标签并添加永久标签
            temporaryTab.value = null
            openNoteTabs.push(note)
        }
    }
    
    // 设置为当前激活的标签
    activeNoteTab.value = note
    selectedNote.value = note
}

// 选择笔记（保留原函数用于其他地方调用）
const selectNote = (note) => {
    selectNotePermanent(note)
}

// 关闭笔记标签
const closeNoteTab = (note) => {
    const index = openNoteTabs.findIndex(tab => tab.title === note.title)
    if (index !== -1) {
        openNoteTabs.splice(index, 1)
        
        // 如果关闭的是当前激活的标签
        if (activeNoteTab.value?.title === note.title) {
            if (openNoteTabs.length > 0) {
                // 切换到下一个标签，或者上一个标签
                const newActiveIndex = index < openNoteTabs.length ? index : openNoteTabs.length - 1
                activeNoteTab.value = openNoteTabs[newActiveIndex]
                selectedNote.value = openNoteTabs[newActiveIndex]
            } else if (temporaryTab.value) {
                // 如果没有永久标签但有临时标签，切换到临时标签
                activeNoteTab.value = temporaryTab.value
                selectedNote.value = temporaryTab.value
            } else {
                // 没有其他标签了，保持在笔记模式但显示空白
                activeNoteTab.value = null
                selectedNote.value = null
                // 不修改 isInNoteMode，保持在笔记模式
            }
        }
    }
}

// 切换笔记标签
const switchNoteTab = (note) => {
    activeNoteTab.value = note
    selectedNote.value = note
}

// 关闭临时标签
const closeTemporaryTab = () => {
    if (temporaryTab.value) {
        // 如果关闭的是当前激活的临时标签
        if (activeNoteTab.value?.title === temporaryTab.value.title) {
            // 切换到其他标签或清空
            if (openNoteTabs.length > 0) {
                activeNoteTab.value = openNoteTabs[0]
                selectedNote.value = openNoteTabs[0]
            } else {
                activeNoteTab.value = null
                selectedNote.value = null
            }
        }
        temporaryTab.value = null
    }
}

// 处理笔记内容变化
const handleNoteContentSave = async (value, render) => {
    if (activeNoteTab.value) {
        try {
            // 更新当前活动标签的内容
            activeNoteTab.value.content = value
            activeNoteTab.value.lastModified = new Date()
            
            // 同步更新到notes数组中
            const noteInArray = notes.find(note => note.title === activeNoteTab.value.title)
            if (noteInArray) {
                noteInArray.content = value
                noteInArray.lastModified = new Date()
                
                // 同步到数据库
                await NoteAPI.update(noteInArray.id, {
                    title: noteInArray.title,
                    content: value
                })
                
                // 查找关联的block（通过related_id关联）
                const relatedBlock = blocks.find(block => 
                    block.type === 'note' && block.related_id === noteInArray.id
                )
                
                if (relatedBlock) {
                    // 如果有关联的block，同步更新block内容
                    // 将笔记内容转换为block格式：第一行为标题，第二行开始为内容
                    const blockContent = `${noteInArray.title}\n${value}`
                    relatedBlock.content = blockContent
                    
                    // 同步block到数据库
                    await BlockAPI.update(relatedBlock.id, { content: blockContent })
                }
                
                ElMessage.success('笔记已保存')
            }
            
            // 同步更新到临时标签中（如果当前是临时标签）
            if (temporaryTab.value && temporaryTab.value.title === activeNoteTab.value.title) {
                temporaryTab.value.content = value
                temporaryTab.value.lastModified = new Date()
            }
        } catch (error) {
            console.error('保存笔记失败:', error)
            ElMessage.error('保存笔记失败')
        }
    }
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
}

// 设置区域引用
const setBlockRef = (el, blockId) => {
    if (el) {
        blockRefs.set(blockId, el)
        
        // 如果是textarea，添加自动调整高度功能
        if (el.tagName === 'TEXTAREA') {
            const adjustHeight = () => {
                el.style.height = 'auto'
                el.style.height = Math.max(40, el.scrollHeight) + 'px'
            }
            
            // 初始调整
            nextTick(() => {
                adjustHeight()
            })
            
            // 监听输入事件
            el.addEventListener('input', adjustHeight)
        }
    }
}

// 渲染Markdown内容
const renderMarkdown = (content) => {
    return md.render(content)
}

// 处理markdown中的链接点击事件
const handleLinkClick = (event) => {
    // 检查是否点击的是链接
    if (event.target.tagName === 'A' && event.target.href) {
        event.preventDefault() // 阻止默认行为
        
        const url = event.target.href
        
        // 使用Tauri API在系统默认浏览器中打开链接
        open(url).catch((error) => {
            console.error('Failed to open link:', error)
            ElMessage.error('无法打开链接')
        })
    }
}

// 处理预览区域点击事件
const handlePreviewClick = (blockId, event) => {
    // 如果点击的是链接，先处理链接点击
    if (event.target.tagName === 'A' && event.target.href) {
        handleLinkClick(event)
        return // 不执行后续的聚焦逻辑
    }
    
    // 否则正常处理block聚焦
    handleBlockFocus(blockId)
}

// 判断区域是否正在编辑
const isBlockEditing = (blockId) => {
    return editingBlockId.value === blockId
}

// 生成唯一ID
const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9)
}

// 数据存储
const todos = reactive([])
const bugs = reactive([])
const ideas = reactive([])
const notes = reactive([])
const progresses = reactive([])

// 今日进度指针（指向progresses中今天的进度那一项）
const todayProgress = ref(null)

// 加载所有数据
const loadAllData = async () => {
    try {
        const [todosData, bugsData, ideasData, notesData, progressesData, blocksData] = await Promise.all([
            TodoAPI.getAll(),
            BugAPI.getAll(),
            IdeaAPI.getAll(),
            NoteAPI.getAll(),
            ProgressAPI.getAll(),
            BlockAPI.getAll()
        ])
        
        // 清空并重新填充
        todos.splice(0, todos.length, ...todosData.map(todo => ({
            ...todo,
            finished: Boolean(todo.finished),
            createdAt: new Date(todo.created_at),
            completedAt: todo.completed_at ? new Date(todo.completed_at) : null
        })))
        
        bugs.splice(0, bugs.length, ...bugsData.map(bug => ({
            ...bug,
            fixed: Boolean(bug.fixed),
            createdAt: new Date(bug.created_at),
            completedAt: bug.completed_at ? new Date(bug.completed_at) : null
        })))
        
        ideas.splice(0, ideas.length, ...ideasData.map(idea => ({
            ...idea,
            createdAt: new Date(idea.created_at)
        })))
        
        notes.splice(0, notes.length, ...notesData.map(note => ({
            ...note,
            createdAt: new Date(note.created_at),
            lastModified: new Date(note.last_modified)
        })))
        
        progresses.splice(0, progresses.length, ...progressesData)
        
        blocks.splice(0, blocks.length, ...blocksData.map(block => ({
            ...block,
            createdAt: new Date(block.created_at)
        })))
        
        console.log('Data loaded successfully')
    } catch (error) {
        console.error('Failed to load data:', error)
        ElMessage.error('加载数据失败')
    }
}

// 在组件挂载时加载数据
onMounted(async () => {
    try {
        console.log('Workspace mounted, waiting for app initialization...')
        
        // 等待应用初始化完成
        while (!isInitialized.value && !initializationError.value) {
            await new Promise(resolve => setTimeout(resolve, 50)) // 等待50ms后重试
        }
        
        if (initializationError.value) {
            console.error('App initialization failed:', initializationError.value)
            ElMessage.error('应用初始化失败: ' + initializationError.value)
            return
        }
        
        console.log('App initialized, loading workspace data...')
        // 加载所有数据（数据库已在App.vue中初始化）
        await loadAllData()
        console.log('Workspace data loaded successfully')
    } catch (error) {
        console.error('Failed to load workspace data:', error)
        ElMessage.error('加载工作区数据失败: ' + error.message)
    }
})

// 待办事项排序计算属性：未完成在前，按优先级从高到低，时间倒序
const sortedTodos = computed(() => {
    return [...todos].sort((a, b) => {
        // 首先按完成状态排序：未完成(false)在前，已完成(true)在后
        if (a.finished !== b.finished) {
            return a.finished - b.finished
        }
        
        // 相同完成状态下按优先级排序：优先级高(3)在前，低(1)在后
        if (a.priority !== b.priority) {
            return b.priority - a.priority
        }
        
        // 相同优先级下按创建时间倒序（较新的在前）
        return new Date(b.createdAt) - new Date(a.createdAt)
    })
})

// 待办事项展开状态管理
const expandedTodos = reactive(new Set())
const allTodosExpanded = ref(false)

// 灵感悬浮提示状态
const showIdeaTooltip = ref(null)
const activeIdeaTooltip = ref(null)
const tooltipTimer = ref(null)

// 处理灵感悬浮提示
const handleIdeaMouseEnter = (ideaId) => {
    if (tooltipTimer.value) {
        clearTimeout(tooltipTimer.value)
        tooltipTimer.value = null
    }
    if (!activeIdeaTooltip.value) {
        showIdeaTooltip.value = ideaId
        nextTick(() => positionTooltip())
    }
}

const handleIdeaMouseLeave = (ideaId) => {
    if (activeIdeaTooltip.value === ideaId) return // 如果是点击激活的，不隐藏
    
    tooltipTimer.value = setTimeout(() => {
        if (showIdeaTooltip.value === ideaId) {
            showIdeaTooltip.value = null
        }
    }, 200)
}

const toggleIdeaTooltip = (ideaId) => {
    if (activeIdeaTooltip.value === ideaId) {
        activeIdeaTooltip.value = null
    } else {
        activeIdeaTooltip.value = ideaId
        showIdeaTooltip.value = null // 清除hover状态
        nextTick(() => positionTooltip())
    }
}

const hideIdeaTooltip = (ideaId) => {
    if (activeIdeaTooltip.value === ideaId) {
        activeIdeaTooltip.value = null
    }
}

// 动态定位悬浮卡片
const positionTooltip = () => {
    const tooltip = document.querySelector('.idea-tooltip')
    const activeLink = document.querySelector('.idea-link:focus, .idea-link:hover')
    
    if (tooltip && activeLink) {
        const linkRect = activeLink.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()
        
        // 计算位置
        let top = linkRect.top - tooltipRect.height - 8
        let left = linkRect.left + (linkRect.width / 2) - (tooltipRect.width / 2)
        
        // 防止超出视窗边界
        if (top < 10) {
            top = linkRect.bottom + 8 // 如果上方空间不足，显示在下方
        }
        if (left < 10) {
            left = 10
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10
        }
        
        tooltip.style.top = `${top}px`
        tooltip.style.left = `${left}px`
    }
}

// 灵感展开状态管理
const expandedIdeas = reactive(new Set())

// Bug排序计算属性：未修复的在前，按时间倒序
const sortedBugs = computed(() => {
    return [...bugs].sort((a, b) => {
        // 首先按修复状态排序：未修复(false)在前，已修复(true)在后
        if (a.fixed !== b.fixed) {
            return a.fixed - b.fixed
        }
        // 相同状态下按创建时间倒序（较新的在前）
        return new Date(b.createdAt) - new Date(a.createdAt)
    })
})

// 项目进度排序计算属性：按日期倒序排列（最新的在前）
const sortedProgresses = computed(() => {
    return [...progresses].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date)
        const dateB = b.date instanceof Date ? b.date : new Date(b.date)
        return dateB - dateA
    })
})

// Bug悬浮卡片状态管理
const showBugDetailCard = ref(false)
const selectedBug = ref(null)
const selectedBugIndex = ref(-1)
const bugDetailCardStyle = ref({})

// 拖动相关状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const cardStartX = ref(0)
const cardStartY = ref(0)

// Bug悬浮卡片显示
const showBugDetail = (bug, index, event) => {
    selectedBug.value = bug
    selectedBugIndex.value = index
    showBugDetailCard.value = true
    
    // 将卡片左上角定位在点击位置
    const clickX = event.clientX
    const clickY = event.clientY
    
    bugDetailCardStyle.value = {
        left: clickX + 'px',
        top: clickY + 'px',
        transform: 'translate(0, 0)'
    }
}

// 开始拖动
const startDrag = (event) => {
    if (event.target.closest('.bug-detail-header')) {
        isDragging.value = true
        dragStartX.value = event.clientX
        dragStartY.value = event.clientY
        
        const currentLeft = parseInt(bugDetailCardStyle.value.left) || 0
        const currentTop = parseInt(bugDetailCardStyle.value.top) || 0
        cardStartX.value = currentLeft
        cardStartY.value = currentTop
        
        document.addEventListener('mousemove', handleDrag, { passive: true })
        document.addEventListener('mouseup', stopDrag)
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'none'
        
        event.preventDefault()
    }
}

// 处理拖动 - 使用 requestAnimationFrame 优化性能
let rafId = null
const handleDrag = (event) => {
    if (!isDragging.value) return
    
    if (rafId) {
        cancelAnimationFrame(rafId)
    }
    
    rafId = requestAnimationFrame(() => {
        const deltaX = event.clientX - dragStartX.value
        const deltaY = event.clientY - dragStartY.value
        
        // 取消区域限制，允许拖动到屏幕外
        bugDetailCardStyle.value = {
            left: cardStartX.value + 'px',
            top: cardStartY.value + 'px',
            transform: `translate(${deltaX}px, ${deltaY}px)`
        }
    })
}

// 停止拖动
const stopDrag = () => {
    if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
    
    if (isDragging.value) {
        // 最终位置确定后，更新实际的 left/top 值，清除 transform
        const currentTransform = bugDetailCardStyle.value.transform
        if (currentTransform && currentTransform !== 'translate(0, 0)') {
            const matches = currentTransform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
            if (matches) {
                const deltaX = parseFloat(matches[1])
                const deltaY = parseFloat(matches[2])
                
                const newLeft = cardStartX.value + deltaX
                const newTop = cardStartY.value + deltaY
                
                // 取消区域限制，允许在任意位置
                bugDetailCardStyle.value = {
                    left: newLeft + 'px',
                    top: newTop + 'px',
                    transform: 'translate(0, 0)'
                }
            }
        }
    }
    
    isDragging.value = false
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
}

// 关闭Bug详情卡片
const closeBugDetail = () => {
    showBugDetailCard.value = false
    selectedBug.value = null
    selectedBugIndex.value = -1
}

// 处理全局点击事件
const handleGlobalClick = (event) => {
    if (showBugDetailCard.value) {
        // 检查点击是否在卡片内部
        const bugCard = event.target.closest('.bug-detail-card')
        const bugItem = event.target.closest('.bug-item')
        
        // 如果点击不在卡片内部且不在Bug列表项上，则关闭卡片
        if (!bugCard && !bugItem) {
            closeBugDetail()
        }
    }
}

// 切换Bug状态
const toggleBugStatus = async (index) => {
    try {
        const bug = bugs[index]
        bug.fixed = !bug.fixed
        
        if (bug.fixed) {
            bug.completedAt = new Date()
            ElMessage.success('Bug已标记为修复！')
        } else {
            bug.completedAt = null
            ElMessage.success('Bug已标记为未修复')
        }
        
        // 保存到数据库
        if (bug.id) {
            await BugAPI.update(bug.id, bug)
        }
    } catch (error) {
        console.error('更新Bug状态失败:', error)
        ElMessage.error('更新Bug状态失败')
    }
}

// 切换待办事项完成状态
const toggleTodo = async (todo) => {
    try {
        if (todo.finished) {
            todo.completedAt = new Date()
            ElMessage.success('任务已完成！')
            
            // 如果有关联的灵感，将灵感状态改为已实施
            if (todo.idea_id) {
                const ideaIndex = ideas.findIndex(idea => idea.id === todo.idea_id)
                if (ideaIndex !== -1) {
                    ideas[ideaIndex].status = 'implemented'
                    await IdeaAPI.update(ideas[ideaIndex].id, { status: 'implemented' })
                }
            }
        } else {
            todo.completedAt = null
            ElMessage.success('任务已标记为未完成')
            
            // 如果有关联的灵感，将灵感状态改为待办中
            if (todo.idea_id) {
                const ideaIndex = ideas.findIndex(idea => idea.id === todo.idea_id)
                if (ideaIndex !== -1) {
                    ideas[ideaIndex].status = 'in-progress'
                    await IdeaAPI.update(ideas[ideaIndex].id, { status: 'in-progress' })
                }
            }
        }
        
        // 更新数据库
        await TodoAPI.update(todo.id, {
            finished: todo.finished,
            completed_at: todo.completedAt?.toISOString()
        })
    } catch (error) {
        console.error('Failed to update todo:', error)
        ElMessage.error('更新失败')
    }
}

// 切换待办事项详情展开状态
const toggleTodoExpansion = (todo) => {
    const todoKey = todo.title + todo.createdAt
    if (expandedTodos.has(todoKey)) {
        expandedTodos.delete(todoKey)
    } else {
        expandedTodos.add(todoKey)
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
        todos.forEach((todo) => {
            const todoKey = todo.title + todo.createdAt
            expandedTodos.add(todoKey)
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

// 根据灵感ID获取灵感标题
const getIdeaTitleById = (ideaId) => {
    const idea = ideas.find(idea => idea.id === ideaId)
    return idea ? idea.title : '未知灵感'
}

// 废弃灵感
const discardIdea = (index) => {
    ideas[index].status = 'discarded'
    ElMessage.success('灵感已废弃')
}

// 切换灵感内容展开状态
const toggleIdeaExpansion = (index) => {
    if (expandedIdeas.has(index)) {
        expandedIdeas.delete(index)
    } else {
        expandedIdeas.add(index)
    }
}

// 加入待办
const addToTodo = (index) => {
    const idea = ideas[index]
    idea.status = 'in-progress'
    
    // 创建新的工作区块 - 按照用户思路重构
    const newBlock = {
        id: generateId(),
        type: 'todo',
        content: `**${idea.title}**\n`
    }
    
    // 创建对应的待办事项
    const newTodo = {
        title: idea.title,
        content: '', // 初始为空，等待工作区块编辑
        priority: 2,
        finished: false,
        createdAt: new Date(),
        completedAt: null,
        idea_id: idea.id, // 关联灵感ID，用于状态同步
    }
    
    // 添加到数组
    blocks.push(newBlock)
    todos.unshift(newTodo)
    
    // 设置为编辑模式并聚焦
    editingBlockId.value = newBlock.id
    
    // 等待DOM更新后聚焦到新区域
    nextTick(() => {
        setTimeout(() => {
            const blockElement = blockRefs.get(newBlock.id)
            if (blockElement) {
                blockElement.textContent = newBlock.content
                blockElement.focus()
                
                // 设置光标到末尾
                const range = document.createRange()
                const selection = window.getSelection()
                range.selectNodeContents(blockElement)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }, 10)
    })
    
    ElMessage.success('已加入待办清单并创建工作区块')
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待验证',
        'in-progress': '待办中', 
        'implemented': '已实施',
        'discarded': '已废弃'
    }
    return statusMap[status] || '待验证'
}

// 获取状态类型
const getStatusType = (status) => {
    const typeMap = {
        'pending': 'info',
        'in-progress': 'warning',
        'implemented': 'success', 
        'discarded': 'info'
    }
    return typeMap[status] || 'info'
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
    const input = commandInput.value.trim()
    
    // 解析命令和参数
    const parts = input.split(' ')
    const command = parts[0].toLowerCase()
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
        
        // 解析标题参数（所有命令都支持）
        let title = ''
        const titleIndex = parts.findIndex(part => !part.startsWith('-') && part !== command)
        if (titleIndex !== -1) {
            // 提取标题，可能包含多个单词
            const titleParts = []
            for (let i = titleIndex; i < parts.length; i++) {
                if (parts[i].startsWith('-')) break
                titleParts.push(parts[i])
            }
            title = titleParts.join(' ')
        }
        
        createBlock(type, title)
        commandInput.value = ''
    } else if (input.startsWith('/')) {
        ElMessage.warning('无效命令，请使用 /p, /t, /b, /i, /n')
    }
}

// 创建新区域
const createBlock = async (type, title = '') => {
    try {
        let content = ''
        if (title) {
            if (type === 'progress') {
                content = `${title}`
            } else {
                content = `**${title}**`
            }
        }
        
        // 按照用户思路重构block数据结构
        const newBlock = {
            id: generateId(),
            type: type,
            content: content,
            created_at: new Date().toISOString()
        }
        
        // 保存到数据库
        await BlockAPI.create(newBlock)
        
        // 添加到本地数组
        blocks.push(newBlock)
        
        // 设置为编辑模式
        editingBlockId.value = newBlock.id
        
        // 等待DOM更新后聚焦到新区域
        await nextTick()
        
        // 使用 setTimeout 确保DOM完全渲染
        setTimeout(() => {
            const blockElement = blockRefs.get(newBlock.id)
            if (blockElement) {
                blockElement.focus()
                
                // 如果有标题，将光标放到内容末尾
                if (title && blockElement.tagName === 'TEXTAREA') {
                    const textLength = blockElement.value.length
                    blockElement.setSelectionRange(textLength, textLength)
                }
            }
        }, 100)
        
        // 构建提示消息
        let message = `${getBlockTypeLabel(type)}区域已创建`
        if (title) {
            message += `：${title}`
        }
        
        ElMessage.success(message)
    } catch (error) {
        console.error('Failed to create block:', error)
        ElMessage.error('创建失败')
    }
}

// 处理区域获得焦点
const handleBlockFocus = (blockId) => {
    focusToBlock(blockId)
}

// 处理区域失去焦点
const handleBlockBlur = async (index, blockId, event) => {
    try {
        // 使用v-model后，content已自动同步，无需手动获取
        const block = blocks[index]
        editingBlockId.value = null
        
        // 保存块内容到数据库
        if (block.id) {
            await BlockAPI.update(block.id, block)
        }
        
        // 如果是待办、灵感或Bug类型的块，且有内容，则同步到对应的列表
        if (block.content.trim()) {
            if (block.type === 'todo') {
                await syncBlockToTodo(block, index)
            } else if (block.type === 'idea') {
                await syncBlockToIdea(block, index)
            } else if (block.type === 'bug') {
                await syncBlockToBug(block, index)
            } else if (block.type === 'note') {
                await syncBlockToNote(block, index)
            } else if (block.type === 'progress') {
                await syncBlockToProgress(block, index)
            }
        }
    } catch (error) {
        console.error('保存块内容失败:', error)
    }
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
const handleBlockKeydown = async (event, index) => {
    // 检查是否按下了ESC键
    if (event.key === 'Escape') {
        event.preventDefault()
        
        // 退出编辑模式 - v-model已自动同步内容
        const block = blocks[index]
        editingBlockId.value = null
        
        // 移除焦点
        event.target.blur()
        return
    }
    
    // 检查是否按下了退格键或删除键
    if (event.key === 'Backspace' || event.key === 'Delete') {
        const block = blocks[index]
        
        // 只有在内容为空时才删除block
        if (block.content.trim() === '') {
            event.preventDefault()
            
            try {
                // 获取block信息用于提示
                const blockType = getBlockTypeLabel(block.type)
                
                // 删除关联的待办事项、灵感或Bug（工作区 → 列表同步）
                if (block.type === 'todo' && block.related_id) {
                    // 通过related_id找到对应的todo
                    const todoIndex = todos.findIndex(todo => todo.id === block.related_id)
                    if (todoIndex !== -1) {
                        const todo = todos[todoIndex]
                        
                        // 如果待办项关联了灵感，将灵感状态改为待验证
                        if (todo.idea_id) {
                            const ideaIndex = ideas.findIndex(idea => idea.id === todo.idea_id)
                            if (ideaIndex !== -1) {
                                ideas[ideaIndex].status = 'pending'
                                if (ideas[ideaIndex].id) {
                                    await IdeaAPI.update(ideas[ideaIndex].id, ideas[ideaIndex])
                                }
                            }
                        }
                        
                        // 从数据库删除todo
                        await TodoAPI.delete(todo.id)
                        todos.splice(todoIndex, 1)
                    }
                } else if (block.type === 'idea' && block.related_id) {
                    // 通过related_id找到对应的idea
                    const ideaIndex = ideas.findIndex(idea => idea.id === block.related_id)
                    if (ideaIndex !== -1) {
                        const idea = ideas[ideaIndex]
                        await IdeaAPI.delete(idea.id)
                        ideas.splice(ideaIndex, 1)
                    }
                } else if (block.type === 'bug' && block.related_id) {
                    // 通过related_id找到对应的bug
                    const bugIndex = bugs.findIndex(bug => bug.id === block.related_id)
                    if (bugIndex !== -1) {
                        const bug = bugs[bugIndex]
                        await BugAPI.delete(bug.id)
                        bugs.splice(bugIndex, 1)
                    }
                }
                
                // 从数据库删除block
                if (block.id) {
                    await BlockAPI.delete(block.id)
                }
                
                // 删除block
                blocks.splice(index, 1)
                editingBlockId.value = null
                
                ElMessage.success(`${blockType}区域已删除`)
            } catch (error) {
                console.error('删除块失败:', error)
                ElMessage.error('删除失败')
            }
        }
    }
}

// 同步块内容到待办清单
const syncBlockToTodo = async (block, blockIndex) => {
    try {
        const lines = block.content.split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        // 第一行解析标题和优先级，格式为"标题 数字"
        let title = lines[0].trim()
        let priority = 2 // 默认优先级
        
        // 去掉可能的#前缀或**包裹
        if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '').trim()
        } else if (title.startsWith('**') && title.endsWith('**')) {
            title = title.replace(/^\*\*|\*\*$/g, '').trim()
        }
        
        // 解析优先级：查找最后一个空格后的数字
        const lastSpaceIndex = title.lastIndexOf(' ')
        if (lastSpaceIndex !== -1) {
            const possiblePriority = title.substring(lastSpaceIndex + 1).trim()
            const priorityNum = parseInt(possiblePriority)
            if (!isNaN(priorityNum)) {
                // 是数字，就近取值到1-3范围
                if (priorityNum < 1) {
                    priority = 1
                } else if (priorityNum > 3) {
                    priority = 3
                } else {
                    priority = priorityNum
                }
                // 从标题中移除优先级数字
                title = title.substring(0, lastSpaceIndex).trim()
            }
        }
        
        // 第二行开始作为详细内容
        const content = lines.slice(1).join('\n').trim()
        
        // 检查该block是否已经有关联的待办事项
        if (block.related_id) {
            // 更新existing todo
            const existingIndex = todos.findIndex(todo => todo.id === block.related_id)
            if (existingIndex !== -1) {
                const existingTodo = todos[existingIndex]
                existingTodo.title = title
                existingTodo.content = content
                existingTodo.priority = priority // 更新优先级
                
                // 保存到数据库
                await TodoAPI.update(existingTodo.id, existingTodo)
                ElMessage.success('待办事项已更新')
            }
        } else {
            // 创建新的待办事项
            const newTodo = {
                title: title,
                content: content,
                priority: priority, // 使用解析出的优先级
                finished: false,
                created_at: new Date().toISOString()
            }
            
            // 保存到数据库
            const savedTodo = await TodoAPI.create(newTodo)
            todos.unshift(savedTodo)
            
            // 更新block的related_id
            block.related_id = savedTodo.id
            await BlockAPI.update(block.id, { related_id: savedTodo.id })
            
            ElMessage.success('已添加到待办清单')
        }
    } catch (error) {
        console.error('同步待办事项失败:', error)
        ElMessage.error('同步待办事项失败')
    }
}

// 同步块内容到灵感池
const syncBlockToIdea = async (block, blockIndex) => {
    try {
        const lines = block.content.split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        // 第一行作为标题，去掉可能的#前缀
        let title = lines[0].trim()
        if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '').trim()
        } else if (title.startsWith('**') && title.endsWith('**')) {
            title = title.replace(/^\*\*|\*\*$/g, '').trim()
        }
        
        // 第二行开始作为详细内容
        const content = lines.slice(1).join('\n').trim()
        
        // 检查该block是否已经有关联的灵感
        if (block.related_id) {
            // 更新existing idea
            const existingIndex = ideas.findIndex(idea => idea.id === block.related_id)
            if (existingIndex !== -1) {
                ideas[existingIndex].title = title
                ideas[existingIndex].content = content
                
                // 保存到数据库
                await IdeaAPI.update(ideas[existingIndex].id, ideas[existingIndex])
                ElMessage.success('灵感已更新')
            }
        } else {
            // 创建新的灵感
            const newIdea = {
                title: title,
                content: content,
                status: 'pending',
                created_at: new Date().toISOString()
            }
            
            // 保存到数据库
            const savedIdea = await IdeaAPI.create(newIdea)
            ideas.unshift(savedIdea)
            
            // 更新block的related_id
            block.related_id = savedIdea.id
            await BlockAPI.update(block.id, { related_id: savedIdea.id })
            
            ElMessage.success('已添加到灵感池')
        }
    } catch (error) {
        console.error('同步灵感失败:', error)
        ElMessage.error('同步灵感失败')
    }
}

// 同步块内容到Bug列表
const syncBlockToBug = async (block, blockIndex) => {
    try {
        const lines = block.content.split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        // 第一行作为标题，去掉可能的#前缀
        let title = lines[0].trim()
        if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '').trim()
        } else if (title.startsWith('**') && title.endsWith('**')) {
            title = title.replace(/^\*\*|\*\*$/g, '').trim()
        }
        
        // 第二行作为描述
        const description = lines.length > 1 ? lines[1].trim() : ''
        
        // 第三行开始作为追加信息
        const additionalInfo = lines.length > 2 ? lines.slice(2).join('\n').trim() : ''
        
        // 检查该block是否已经有关联的Bug
        if (block.related_id) {
            // 更新existing bug
            const existingIndex = bugs.findIndex(bug => bug.id === block.related_id)
            if (existingIndex !== -1) {
                const existingBug = bugs[existingIndex]
                existingBug.title = title
                existingBug.description = description
                existingBug.additional_info = additionalInfo
                
                // 保存到数据库
                await BugAPI.update(existingBug.id, existingBug)
                ElMessage.success('Bug信息已更新')
            }
        } else {
            // 创建新的Bug
            const newBug = {
                title: title,
                description: description,
                additional_info: additionalInfo,
                fixed: false,
                created_at: new Date().toISOString()
            }
            
            // 保存到数据库
            const savedBug = await BugAPI.create(newBug)
            bugs.unshift(savedBug)
            
            // 更新block的related_id
            block.related_id = savedBug.id
            await BlockAPI.update(block.id, { related_id: savedBug.id })
            
            ElMessage.success('已添加到Bug列表')
        }
    } catch (error) {
        console.error('同步Bug失败:', error)
        ElMessage.error('同步Bug失败')
    }
}

const syncBlockToNote = async (block, blockIndex) => {
    try {
        const lines = block.content.split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        // 第一行作为标题，去掉可能的#前缀
        let title = lines[0].trim()
        if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '').trim()
        } else if (title.startsWith('**') && title.endsWith('**')) {
            title = title.replace(/^\*\*|\*\*$/g, '').trim()
        }
        
        // 第二行开始作为详细内容
        const content = lines.slice(1).join('\n').trim()
        
        // 检查该block是否已经有关联的笔记
        if (block.related_id) {
            // 更新existing note
            const existingIndex = notes.findIndex(note => note.id === block.related_id)
            if (existingIndex !== -1) {
                const existingNote = notes[existingIndex]
                existingNote.title = title
                existingNote.content = content
                existingNote.last_modified = new Date().toISOString()
                
                // 保存到数据库
                await NoteAPI.update(existingNote.id, {
                    title: title,
                    content: content
                })
                ElMessage.success('笔记已更新')
            }
        } else {
            // 创建新的笔记
            const newNote = {
                title: title,
                content: content,
                created_at: new Date().toISOString(),
                last_modified: new Date().toISOString()
            }
            
            // 保存到数据库
            const savedNote = await NoteAPI.create(newNote)
            notes.unshift(savedNote)
            
            // 更新block的related_id
            block.related_id = savedNote.id
            await BlockAPI.update(block.id, { related_id: savedNote.id })
            
            ElMessage.success('已添加到笔记')
        }
    } catch (error) {
        console.error('同步笔记失败:', error)
        ElMessage.error('同步笔记失败')
    }
}

const syncBlockToProgress = async (block, blockIndex) => {
    try {
        // 查找所有项目进度类型的块
        const progressBlocks = blocks.filter(block => block.type === 'progress')
        
        // 如果没有progress块，删除今日进度项
        if (progressBlocks.length === 0) {
            if (todayProgress.value) {
                // 从数据库删除今日进度项
                if (todayProgress.value.id) {
                    await ProgressAPI.delete(todayProgress.value.id)
                }
                // 从本地数组中删除今日进度项
                const todayIndex = progresses.findIndex(progress => {
                    const progressDate = progress.date instanceof Date ? progress.date : new Date(progress.date)
                    const todayDate = todayProgress.value.date instanceof Date ? todayProgress.value.date : new Date(todayProgress.value.date)
                    return progressDate.toDateString() === todayDate.toDateString()
                })
                if (todayIndex !== -1) {
                    progresses.splice(todayIndex, 1)
                }
                // 清空今日进度指针
                todayProgress.value = null
            }
            return
        }
        
        // 简单解析：一行对应一项
        const newContent = []
        progressBlocks.forEach(block => {
            const content = block.content.trim()
            if (!content) return
            
            const lines = content.split('\n').filter(line => line.trim())
            newContent.push(...lines)
        })
        
        const today = new Date()
        const progressData = {
            date: today,
            content: newContent
        }
        
        // 在保存之前，检查是否已经存在今天的进度项
        if (!todayProgress.value) {
            const todayString = today.toDateString()
            const existingTodayProgress = progresses.find(progress => {
                const progressDate = progress.date instanceof Date ? progress.date : new Date(progress.date)
                return progressDate.toDateString() === todayString
            })
            if (existingTodayProgress) {
                todayProgress.value = existingTodayProgress
            }
        }
        
        // 使用数据库保存或更新今日进度
        const savedProgress = await ProgressAPI.createOrUpdate(progressData)
        
        // 更新本地状态
        if (!todayProgress.value) {
            // 如果没有今日进度指针，创建并添加到数组开头
            progresses.unshift(savedProgress)
            todayProgress.value = savedProgress
        } else {
            // 更新现有的今日进度项
            todayProgress.value.content = savedProgress.content
            todayProgress.value.date = savedProgress.date
            const existingIndex = progresses.findIndex(p => p.id === savedProgress.id)
            if (existingIndex !== -1) {
                progresses[existingIndex] = savedProgress
            }
        }
        
    } catch (error) {
        console.error('更新今日进度失败:', error)
    }
}

// 编辑Bug函数
const editBug = (bug, bugIndex) => {
    // 检查是否存在关联的工作区块（通过related_id关联）
    const associatedBlock = blocks.find(block => 
        block.type === 'bug' && block.related_id === bug.id
    )
    
    if (associatedBlock) {
        // 如果存在关联块，定位到该块
        focusToBlock(associatedBlock.id)
    } else {
        // 如果不存在关联块，创建新的bug块
        createBugBlockForBug(bug, bugIndex)
    }
}

// 定位到指定的块
const focusToBlock = (blockId) => {
    // 先设置编辑状态
    editingBlockId.value = blockId
    
    nextTick(() => {
        // 等待DOM更新后，再次使用nextTick确保textarea已经渲染
        nextTick(() => {
            // 直接通过querySelector查找textarea元素，更可靠
            const textarea = document.querySelector(`[data-block-id="${blockId}"] textarea`)
            if (textarea) {
                // 聚焦到textarea
                textarea.focus()
                
                // 设置光标到文本末尾
                const textLength = textarea.value.length
                textarea.setSelectionRange(textLength, textLength)
                
                // 滚动到视窗
                const blockContainer = document.querySelector(`[data-block-id="${blockId}"]`)
                if (blockContainer) {
                    blockContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            } else {
                console.warn('Textarea not found for block:', blockId)
            }
        })
    })
}

// 为现有Bug创建关联的工作区块
const createBugBlockForBug = async (bug, bugIndex) => {
    try {
        // 构造块内容
        let content = bug.title
        if (bug.description) {
            content += '\n' + bug.description
        }
        if (bug.additional_info) {
            content += '\n' + bug.additional_info
        }
        
        // 创建新块
        const newBlock = {
            id: generateId(),
            type: 'bug',
            content: content,
            related_id: bug.id, // 设置关联ID
            created_at: new Date().toISOString()
        }
        
        // 保存到数据库
        await BlockAPI.create(newBlock)
        
        // 添加到工作区
        blocks.unshift(newBlock)
        
        // 定位到新创建的块
        nextTick(() => {
            focusToBlock(newBlock.id)
        })
        
        ElMessage.success('已创建关联的Bug块')
    } catch (error) {
        console.error('创建Bug块失败:', error)
        ElMessage.error('创建Bug块失败')
    }
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
    ElMessage.success(`日期已切换到 ${formatCurrentDate()}`)
}

// 组件挂载时初始化
onMounted(() => {
    // 添加全局键盘监听
    document.addEventListener('keydown', handleGlobalKeydown)
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleWindowResize)
    
    // 添加全局点击监听，用于关闭Bug详情卡片
    document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
    // 移除全局键盘监听
    document.removeEventListener('keydown', handleGlobalKeydown)
    window.removeEventListener('resize', handleWindowResize)
    
    // 移除全局点击监听
    document.removeEventListener('click', handleGlobalClick)
    
    // 清理拖拽事件
    if (isResizing.value) {
        stopResize()
    }
    
    // 清理悬浮提示定时器
    if (tooltipTimer.value) {
        clearTimeout(tooltipTimer.value)
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
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
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
    flex-shrink: 0; /* 防止收缩 */
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
    width: var(--left-width);
    flex-shrink: 0; /* 防止收缩 */
}

/* 分隔线样式 */
.resizer {
    width: 1px;
    background: #d1d9e0;
    cursor: col-resize;
    position: relative;
    transition: background-color 0.15s ease;
    z-index: 10;
    flex-shrink: 0; /* 防止收缩 */
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
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    flex: 1; /* 自动占据剩余空间 */
}

.log-editor{
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
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



/* 待办事项样式 */
.todo-items {
    flex: 1;
    overflow-y: auto;
    margin-right: -16px;
    padding-right: 16px;
    position: relative; /* 为悬浮卡片提供定位上下文 */
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
    position: relative; /* 为悬浮卡片提供定位上下文 */
    overflow: visible; /* 确保悬浮卡片不被裁剪 */
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
    flex-wrap: wrap;
}

.idea-link {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    font-size: 11px;
    color: #0369a1;
    outline: none; /* 移除默认焦点轮廓 */
}

.idea-link:hover {
    background: #e0f2fe;
    border-color: #7dd3fc;
}

.idea-link:focus {
    background: #e0f2fe;
    border-color: #0369a1;
    box-shadow: 0 0 0 2px rgba(3, 105, 161, 0.2);
}

.idea-icon {
    font-size: 12px;
    color: #0369a1;
}

.idea-text {
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
}

.idea-tooltip {
    position: fixed; /* 改为fixed定位，避免被父容器裁剪 */
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    width: 240px;
    z-index: 9999; /* 确保在最顶层 */
    font-size: 12px;
    line-height: 1.4;
    max-height: 150px;
    overflow-y: auto;
    animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tooltip-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
}

.tooltip-header h5 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.tooltip-content {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
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

/* Bug列表样式 */
.bug-list {
    background: #ffffff;
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
}

.bug-items {
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

.idea-actions {
    display: flex;
    gap: 4px;
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
    cursor: pointer;
    transition: all 0.15s ease;
}

.idea-content.expanded {
    display: block;
    -webkit-line-clamp: none;
    line-clamp: none;
    overflow: visible;
}

.idea-content:hover {
    background-color: rgba(246, 248, 250, 0.5);
}

.idea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.idea-date {
    font-size: 12px;
    color: #c0c4cc;
}

.bug-item {
    padding: 10px;
    margin-bottom: 6px;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    transition: all 0.15s ease;
    font-size: 13px;
    background: #ffffff;
    cursor: pointer;
    position: relative;
}

.bug-item:hover {
    background-color: #f6f8fa;
    border-color: #d0d7de;
}

.bug-item.finished {
    opacity: 0.6;
    background: #f0f9ff;
    border-color: #c7d2fe;
}

.bug-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.bug-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
    flex: 1;
    line-height: 1.2;
    margin-right: 8px;
}

.bug-item.finished .bug-title {
    text-decoration: line-through;
    color: #656d76;
}

.bug-description {
    font-size: 12px;
    color: #656d76;
    line-height: 1.4;
    margin: 4px 0 6px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bug-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.edit-bug-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #909399;
    border-radius: 2px;
    opacity: 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bug-item:hover .edit-bug-btn {
    opacity: 1;
}

.edit-bug-btn:hover {
    background: #f5f5f5;
    color: #409eff;
}

.bug-dates {
    font-size: 12px;
    color: #c0c4cc;
    display: flex;
    align-items: center;
    gap: 2px;
}

.created-date {
    color: #c0c4cc;
}

.completed-date {
    color: #059669;
    font-weight: 500;
}

/* Bug详情悬浮卡片样式 */
.bug-detail-card {
    position: fixed;
    width: 350px;
    background: #ffffff;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    overflow: hidden;
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
}

.bug-detail-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e1e4e8;
    background: #f6f8fa;
    cursor: default;
    user-select: none;
    position: relative;
}

.bug-detail-header:hover {
    background: #f0f3f6;
}

.bug-detail-header::before {
    content: '';
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background-image: 
        radial-gradient(circle, #8b949e 1px, transparent 1px),
        radial-gradient(circle, #8b949e 1px, transparent 1px);
    background-size: 4px 4px;
    background-position: 0 0, 2px 2px;
    opacity: 0.6;
}

.bug-detail-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #24292f;
    line-height: 1.3;
}

.bug-detail-header h4.completed {
    text-decoration: line-through;
    color: #8b949e;
}

.bug-detail-content {
    padding: 12px 16px;
}

.bug-detail-description {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #24292f;
    line-height: 1.5;
    word-wrap: break-word;
}

.bug-detail-additional {
    margin: 0 0 12px 0;
    font-size: 12px;
    color: #656d76;
    line-height: 1.5;
    word-wrap: break-word;
}

.bug-detail-date {
    font-size: 11px;
    color: #8b949e;
    text-align: right;
    border-top: 1px solid #e1e4e8;
    padding-top: 8px;
    margin-top: 8px;
}

/* 笔记列表样式 */
.notes-list {
    background: #ffffff;
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
}

.note-items {
    flex: 1;
    overflow-y: auto;
    margin-right: -16px;
    padding-right: 16px;
}

.note-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    transition: all 0.15s ease;
    font-size: 13px;
    background: #ffffff;
    cursor: pointer;
    border-radius: 2px;
}

.note-item:hover {
    background-color: #f1f3f4;
}

.note-item.selected {
    background-color: #e3f2fd;
    color: #1976d2;
}

.note-title {
    font-size: 13px;
    font-weight: 400;
    color: #24292f;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
}

.note-item.selected .note-title {
    color: #1976d2;
}

.note-date {
    font-size: 12px;
    color: #8e8e93;
    flex-shrink: 0;
    opacity: 0.8;
}

.note-item.selected .note-date {
    color: #1976d2;
    opacity: 0.7;
}

.note-meta {
    font-size: 12px;
    color: #656d76;
}

/* 项目进度列表样式 */
.progress-list {
    background: #ffffff;
    padding: 16px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
}

.progress-items {
    flex: 1;
    overflow-y: auto;
    margin-right: -16px;
    padding-right: 16px;
}

.progress-item {
    margin-bottom: 16px;
    border-radius: 6px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 12px;
    transition: all 0.15s ease;
}

.progress-item:hover {
    border-color: #d0d7de;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e9ecef;
}

.progress-date {
    font-size: 14px;
    font-weight: 500;
    color: #24292f;
}

.progress-count {
    font-size: 12px;
    color: #656d76;
    background: #ffffff;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.progress-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.progress-task {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    line-height: 1.4;
}

.task-indicator {
    width: 6px;
    height: 6px;
    background: #0969da;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
}

.task-text {
    color: #24292f;
    flex: 1;
}

/* 笔记展示区样式 */
.note-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 笔记标签页样式 - 类似VSCode */
.note-tabs {
    display: flex;
    background: #f8f8f8;
    border-bottom: 1px solid #e1e4e8;
    overflow-x: auto;
    flex-shrink: 0;
}

.note-tab {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8f8f8;
    border-right: 1px solid #e1e4e8;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    min-width: 120px;
    max-width: 200px;
}

.note-tab:hover {
    background: #e6f3ff;
}

.note-tab.active {
    background: #ffffff;
    border-bottom: 1px solid #ffffff;
    position: relative;
}

.note-tab.active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #0969da;
}

.note-tab-title {
    flex: 1;
    font-size: 13px;
    color: #24292f;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
}

/* 临时标签的斜体样式 */
.note-tab.temporary .note-tab-title {
    font-style: italic;
}

.note-tab-close {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: all 0.15s ease;
}

.note-tab-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
}

.note-tab-close svg {
    width: 12px;
    height: 12px;
}

/* 标签页内容区域 */
.note-tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.note-viewer-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #24292f;
}

/* mavon-editor 样式自定义 */
.mavon-editor-wrapper {
    flex: 1;
    min-height: 0;
}

:deep(.v-note-wrapper) {
    height: 100%;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

:deep(.v-note-wrapper .v-note-panel) {
    height: 100%;
}

:deep(.v-note-wrapper .v-note-edit) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: 14px;
    line-height: 1.6;
}

:deep(.v-note-wrapper .v-note-show) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: 14px;
    line-height: 1.6;
}

/* 工具栏样式优化 */
:deep(.v-note-wrapper .v-note-op) {
    background: #f8f9fa;
    border-bottom: 1px solid #e1e4e8;
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

/* Block内容区域样式 - GitHub风格紧凑版 */
.block-content {
    min-height: 20px;
    padding: 8px 12px;
    font-size: 15px;
    line-height: 1.2;
    color: #333333;
    outline: none;
    cursor: text;
    transition: all 0.15s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.block-content.editing {
    line-height: 1.5;
    background: #f6f8fa;
    border: 1px solid #0969da;
    border-radius: 3px;
    white-space: pre-wrap;
    word-wrap: break-word;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
}

/* 专门为textarea优化的样式 */
textarea.block-content.editing {
    resize: none;
    outline: none;
    overflow: hidden;
    width: 100%;
    min-height: 40px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 12px 16px; /* 增加内边距，让文字离边缘更远 */
    margin: 0;
    border: none; /* 去掉边框 */
    background: inherit; /* 继承背景色 */
    border-radius: inherit; /* 继承圆角 */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

.block-content.preview {
    cursor: pointer;
    white-space: pre-wrap;
    word-wrap: break-word;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.block-content.preview:hover {
    background: #f6f8fa;
}

/* GitHub风格Markdown渲染 - 紧凑版 */
.block-content :deep(h1),
.block-content :deep(h2),
.block-content :deep(h3),
.block-content :deep(h4),
.block-content :deep(h5),
.block-content :deep(h6) {
    margin-top: 8px;
    margin-bottom: 4px;
    font-weight: 600;
    line-height: 1.25;
    color: #24292f;
}

.block-content :deep(h1:first-child),
.block-content :deep(h2:first-child),
.block-content :deep(h3:first-child),
.block-content :deep(h4:first-child),
.block-content :deep(h5:first-child),
.block-content :deep(h6:first-child) {
    margin-top: 0;
}

.block-content :deep(h1) { 
    font-size: 1.75em; 
    border-bottom: 1px solid #d0d7de;
    padding-bottom: 4px;
}

.block-content :deep(h2) { 
    font-size: 1.5em; 
    border-bottom: 1px solid #d0d7de;
    padding-bottom: 4px;
}

.block-content :deep(h3) { font-size: 1.25em; }
.block-content :deep(h4) { font-size: 1em; }
.block-content :deep(h5) { font-size: 0.875em; }
.block-content :deep(h6) { 
    font-size: 0.85em; 
    color: #656d76;
}

.block-content :deep(p) {
    margin-top: 0;
    margin-bottom: 1px;
    line-height: 1.5;
}

.block-content :deep(p:last-child) {
    margin-bottom: 0;
}

/* 硬换行样式优化 */
.block-content :deep(br) {
    line-height: 1.1;
}

.block-content :deep(ul),
.block-content :deep(ol) {
    margin-top: 0;
    margin-bottom: 8px;
    padding-left: 1.5em;
}

.block-content :deep(ul:last-child),
.block-content :deep(ol:last-child) {
    margin-bottom: 0;
}

.block-content :deep(li) {
    margin: 2px 0;
    line-height: 1.45;
}

.block-content :deep(li > p) {
    margin-bottom: 4px;
}

.block-content :deep(li + li) {
    margin-top: 2px;
}

.block-content :deep(blockquote) {
    margin: 8px 0;
    padding: 0 12px;
    border-left: 4px solid #d0d7de;
    color: #656d76;
    background: transparent;
}

.block-content :deep(blockquote:last-child) {
    margin-bottom: 0;
}

.block-content :deep(blockquote > p:first-child) {
    margin-top: 0;
}

.block-content :deep(blockquote > p:last-child) {
    margin-bottom: 0;
}

.block-content :deep(code) {
    background: #f6f8fa;
    border-radius: 3px;
    padding: 1px 1px;
    font-size: 1em;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    color: #24292f;
}

.block-content :deep(pre) {
    background: #f6f8fa;
    border-radius: 6px;
    padding: 8px;
    margin: 8px 0;
    overflow-x: auto;
    font-size: 0.85em;
    line-height: 1.45;
    border: 1px solid #d0d7de;
}

.block-content :deep(pre:last-child) {
    margin-bottom: 0;
}

.block-content :deep(pre code) {
    background: transparent;
    border-radius: 0;
    padding: 0;
    color: #24292f;
}

.block-content :deep(a) {
    color: #0969da;
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

.block-content :deep(del) {
    text-decoration: line-through;
}

.block-content :deep(hr) {
    border: none;
    border-top: 1px solid #d0d7de;
    margin: 16px 0;
    height: 0;
}

.block-content :deep(table) {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 8px 0;
    display: table; /* 修复：使用table而不是block */
    overflow: auto;
    font-size: 0.85em;
}

.block-content :deep(table:last-child) {
    margin-bottom: 0;
}

.block-content :deep(thead) {
    display: table-header-group;
}

.block-content :deep(tbody) {
    display: table-row-group;
}

.block-content :deep(tr) {
    background: #ffffff;
    border-top: 1px solid #d0d7de;
    display: table-row; /* 确保行正确显示 */
}

.block-content :deep(tr:nth-child(2n)) {
    background: #f6f8fa;
}

.block-content :deep(th),
.block-content :deep(td) {
    border: 1px solid #d0d7de;
    padding: 4px 8px;
    text-align: left;
    display: table-cell; /* 确保单元格正确显示 */
}

.block-content :deep(th) {
    background: #f6f8fa;
    font-weight: 600;
}

.block-content :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 4px 0;
}

.block-content :deep(kbd) {
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 0.75em;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    color: #24292f;
    box-shadow: inset 0 -1px 0 #d0d7de;
}

.block-content :deep(mark) {
    background: #fff8c5;
    color: #24292f;
    padding: 1px 2px;
    border-radius: 2px;
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
.idea-items::-webkit-scrollbar,
.bug-items::-webkit-scrollbar,
.note-items::-webkit-scrollbar,
.progress-items::-webkit-scrollbar {
    width: 4px;
}

.blocks-container::-webkit-scrollbar {
    width: 4px;
}

.todo-items::-webkit-scrollbar-track,
.idea-items::-webkit-scrollbar-track,
.bug-items::-webkit-scrollbar-track,
.note-items::-webkit-scrollbar-track,
.progress-items::-webkit-scrollbar-track,
.blocks-container::-webkit-scrollbar-track {
    background: transparent;
}

.todo-items::-webkit-scrollbar-thumb,
.idea-items::-webkit-scrollbar-thumb,
.bug-items::-webkit-scrollbar-thumb,
.note-items::-webkit-scrollbar-thumb,
.progress-items::-webkit-scrollbar-thumb,
.blocks-container::-webkit-scrollbar-thumb {
    background: #d1d9e0;
    border-radius: 2px;
}

.todo-items::-webkit-scrollbar-thumb:hover,
.idea-items::-webkit-scrollbar-thumb:hover,
.bug-items::-webkit-scrollbar-thumb:hover,
.note-items::-webkit-scrollbar-thumb:hover,
.progress-items::-webkit-scrollbar-thumb:hover,
.blocks-container::-webkit-scrollbar-thumb:hover {
    background: #8b949e;
}

/* 响应式设计 - 简化桌面应用版本 */
@media (max-width: 1024px) {
    .workspace {
        --left-width: 240px;
    }
}

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

/* 空白笔记区域样式 */
.empty-note-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: #656d76;
    background: #ffffff;
}

.empty-note-message p {
    font-size: 14px;
    margin: 0;
    opacity: 0.7;
}

</style>