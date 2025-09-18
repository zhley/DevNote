<template>
    <div class="menu-bar">
        <div class="menu-items">
            <!-- 项目菜单 -->
            <div class="menu-item" @click="toggleDropdown('file')" :class="{ active: activeDropdown === 'file' }">
                <span>项目</span>
                <div v-if="activeDropdown === 'file'" class="dropdown-menu">
                </div>
            </div>
            
            <!-- 视图菜单 -->
            <div class="menu-item" @click="toggleDropdown('view')" :class="{ active: activeDropdown === 'view' }">
                <span>视图</span>
                <div v-if="activeDropdown === 'view'" class="dropdown-menu">
                    <div class="dropdown-item">侧边栏</div>
                </div>
            </div>
            
            <!-- 设置菜单 -->
            <div class="menu-item" @click="toggleDropdown('settings')" :class="{ active: activeDropdown === 'settings' }">
                <span>设置</span>
                <div v-if="activeDropdown === 'settings'" class="dropdown-menu">
                    <div class="dropdown-item">首选项</div>
                    <div class="dropdown-item">主题</div>
                </div>
            </div>

            <div class="menu-item" @click="toggleDropdown('help')" :class="{ active: activeDropdown === 'help' }">
                <span>帮助</span>
                <div v-if="activeDropdown === 'help'" class="dropdown-menu">
                    <div class="dropdown-item">检查更新</div>
                    <div class="dropdown-item">关于</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeDropdown = ref(null)

const toggleDropdown = (menuName) => {
    if (activeDropdown.value === menuName) {
        activeDropdown.value = null
    } else {
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
