<template>
    <div class="app-container">
        <MenuBar />
        <Workspace class="main-content"/>
        <StatusBar />
    </div>
</template>

<script setup lang="ts">
import Workspace from "./components/Workspace.vue";
import MenuBar from "./components/MenuBar.vue";
import StatusBar from "./components/StatusBar.vue";
import { ref, provide, reactive } from 'vue'
import { initProject } from './api/project'
import { initDatabase, dailyCleanup } from './api/database'

// 创建初始化状态
const isInitialized = ref(false)
const initializationError = ref<string | null>(null)

// 创建状态栏全局状态管理
const statusBarState = reactive({
    setStatus: null as ((position: string, message: string, duration?: number) => void) | null,
    clearStatus: null as ((position: string) => void) | null,
    setTempStatus: null as ((position: string, message: string) => void) | null
})

// 提供给子组件
provide('isInitialized', isInitialized)
provide('initializationError', initializationError)
provide('statusBarState', statusBarState)

// 立即开始初始化（不等待mounted）
const initializeApp = async () => {
    try {
        console.log('=== App initialization started ===')
        await initProject()
        await initDatabase()
        await dailyCleanup()
        
        isInitialized.value = true
        console.log('=== App initialization completed ===')
    } catch (error) {
        console.error('Failed to initialize app:', error)
        initializationError.value = error instanceof Error ? error.message : 'Unknown error'
    }
}

// 立即开始初始化
initializeApp()
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.main-content {
    flex: 1;
    overflow: hidden;
}
</style>