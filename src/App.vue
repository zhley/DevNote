<template>
    <div class="app-container">
        <MenuBar />
        <Workspace class="main-content"/>
    </div>
</template>

<script setup lang="ts">
import Workspace from "./components/Workspace.vue";
import MenuBar from "./components/MenuBar.vue";
import { ref, provide } from 'vue'
import { initProject } from './api/project'
import { initDatabase, dailyCleanup } from './api/database'

// 创建初始化状态
const isInitialized = ref(false)
const initializationError = ref<string | null>(null)

// 提供给子组件
provide('isInitialized', isInitialized)
provide('initializationError', initializationError)

// 立即开始初始化（不等待mounted）
const initializeApp = async () => {
    try {
        console.log('Starting app initialization...')
        await initProject()
        console.log('Project initialized')
        
        await initDatabase()
        console.log('Database initialized')
        
        await dailyCleanup()
        console.log('Daily cleanup completed')
        
        isInitialized.value = true
        console.log('App initialization completed successfully')
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