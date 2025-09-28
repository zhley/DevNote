<template>
    <div class="menu-bar">
        <div class="menu-items">
            <!-- 项目菜单 -->
            <div class="menu-item" 
                 @click="toggleDropdown('file')" 
                 @mouseenter="handleMouseEnter('file')" 
                 :class="{ active: activeDropdown === 'file' }">
                <span>项目</span>
                <div v-if="activeDropdown === 'file'" class="dropdown-menu">
                    <div class="dropdown-item" @click.stop="handleNewProject">新建项目文件</div>
                    <div class="dropdown-item" @click.stop="handleOpenProject">打开项目文件</div>
                    <div class="dropdown-item" @click.stop="closeDropdown">导出</div>
                    <div class="dropdown-item" @click.stop="closeDropdown">属性</div>
                    <div class="dropdown-item" @click.stop="openSettings">设置</div>
                </div>
            </div>
            
            <!-- 视图菜单 -->
            <div class="menu-item" 
                 @click="toggleDropdown('view')" 
                 @mouseenter="handleMouseEnter('view')" 
                 :class="{ active: activeDropdown === 'view' }">
                <span>视图</span>
                <div v-if="activeDropdown === 'view'" class="dropdown-menu">
                    <div class="dropdown-item" @click.stop="toggleSidebar">
                        <span class="menu-check" v-if="sidebarVisible">✓</span>
                        <span class="menu-check-placeholder" v-else></span>
                        侧边栏
                    </div>
                </div>
            </div>
            
            <div class="menu-item" 
                 @click="toggleDropdown('help')" 
                 @mouseenter="handleMouseEnter('help')" 
                 :class="{ active: activeDropdown === 'help' }">
                <span>帮助</span>
                <div v-if="activeDropdown === 'help'" class="dropdown-menu">
                    <div class="dropdown-item" @click.stop="closeDropdown">文档</div>
                    <div class="dropdown-item" @click.stop="closeDropdown">检查更新</div>
                    <div class="dropdown-item" @click.stop="showAboutDialog">关于</div>
                </div>
            </div>
        </div>
        
        <!-- 关于对话框 -->
        <AboutDialog ref="aboutDialogRef" />
        <!-- 设置对话框 -->
        <SettingsDialog ref="settingsDialogRef" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { newProject, openProject, getCurrentProjectPath } from '../api/project'
import AboutDialog from './AboutDialog.vue'
import SettingsDialog from './SettingsDialog.vue'

// 注入 workspace 引用
const workspaceRef = inject('workspaceRef', null)

const activeDropdown = ref(null)
const aboutDialogRef = ref(null)
const settingsDialogRef = ref(null)

// 侧边栏状态计算属性
const sidebarVisible = computed(() => {
    return workspaceRef?.value?.activeTab !== ''
})

// 切换侧边栏
const toggleSidebar = () => {
    if (workspaceRef?.value?.toggleSidebar) {
        workspaceRef.value.toggleSidebar()
    }
    // 点击菜单项后关闭下拉菜单
    closeDropdown()
}

const toggleDropdown = (menuName) => {
    if (activeDropdown.value === menuName) {
        activeDropdown.value = null
    } else {
        activeDropdown.value = menuName
    }
}

// 处理鼠标悬停事件
const handleMouseEnter = (menuName) => {
    // 如果已经有菜单展开，直接切换到当前菜单
    if (activeDropdown.value && activeDropdown.value !== menuName) {
        activeDropdown.value = menuName
    }
}

const closeDropdown = () => {
    activeDropdown.value = null
}

const handleGlobalClick = (event) => {
    if (!event.target.closest('.menu-bar')) {
        closeDropdown()
    }
}

onMounted(() => {
    document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
    document.removeEventListener('click', handleGlobalClick)
})

const handleNewProject = async () => {
    closeDropdown()
    const path = await newProject()
    if (path) {
        ElMessage.success(`已创建项目: ${path}`)
    }
}

const handleOpenProject = async () => {
    closeDropdown()
    const path = await openProject()
    if (path) {
        ElMessage.success(`已打开项目: ${path}`)
    }
}

// 显示关于对话框
const showAboutDialog = () => {
    closeDropdown()
    aboutDialogRef.value?.show()
}

// 显示设置对话框
const openSettings = () => {
    closeDropdown()
    // 设置窗口尚不完善，所以注释
    // settingsDialogRef.value?.show()
}
</script>

<style scoped>
.menu-bar {
    background: #ffffff;
    border-bottom: 1px solid #e1e1e1;
    height: 24px;
    display: flex;
    align-items: center;
    font-size: 13px;
    user-select: none;
    position: relative;
    z-index: 1000;
}

.menu-items {
    display: flex;
    align-items: center;
    height: 100%;
}

.menu-item {
    position: relative;
    padding: 0 10px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #333;
    transition: background-color 0.1s ease;
}

.menu-item:hover,
.menu-item.active {
    background: #e1e1e1;
}

.menu-item span {
    font-weight: 400;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 160px;
    z-index: 1001;
    padding: 4px 0;
}

.dropdown-item {
    padding: 5px 14px;
    color: #333;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.1s ease;
}

.dropdown-item:hover {
    background: #f0f0f0;
}

.menu-check {
    display: inline-block;
    width: 16px;
    margin-right: 8px;
    text-align: center;
    font-weight: bold;
}

.menu-check-placeholder {
    display: inline-block;
    width: 16px;
    margin-right: 8px;
}

.dropdown-divider {
    height: 1px;
    background: #e1e1e1;
    margin: 4px 0;
}

/* Windows 风格适配 */
@media (platform: windows) {
    .menu-bar {
        background: #f0f0f0;
        border-bottom: 1px solid #d1d1d1;
    }
}
</style>
