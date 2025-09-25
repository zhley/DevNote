<template>
    <div class="status-bar">
        <div class="status-left">
            <span class="status-item">{{ leftStatus }}</span>
        </div>
        <div class="status-center">
            <span class="status-item">{{ centerStatus }}</span>
        </div>
        <div class="status-right">
            <span class="status-item">{{ rightStatus }}</span>
            <span class="status-item" v-if="currentTime">{{ currentTime }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { setStatusBarInstance } from '../utils/statusBar'

// 注入全局状态管理
const statusBarState = inject('statusBarState')

// 状态显示
const leftStatus = ref('就绪')
const centerStatus = ref('')
const rightStatus = ref('')
const currentTime = ref('')

// 时间更新定时器
let timeTimer = null

// 格式化时间
const formatTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}

// 更新时间显示
const updateTime = () => {
    currentTime.value = formatTime()
}

// 设置状态信息的方法
const setStatus = (position, message, duration = 0) => {
    switch (position) {
        case 'left':
            leftStatus.value = message
            break
        case 'center':
            centerStatus.value = message
            break
        case 'right':
            rightStatus.value = message
            break
    }
    
    // 如果设置了持续时间，自动清除
    if (duration > 0) {
        setTimeout(() => {
            switch (position) {
                case 'left':
                    leftStatus.value = '就绪'
                    break
                case 'center':
                    centerStatus.value = ''
                    break
                case 'right':
                    rightStatus.value = ''
                    break
            }
        }, duration)
    }
}

// 清除状态信息
const clearStatus = (position) => {
    switch (position) {
        case 'left':
            leftStatus.value = '就绪'
            break
        case 'center':
            centerStatus.value = ''
            break
        case 'right':
            rightStatus.value = ''
            break
        case 'all':
            leftStatus.value = '就绪'
            centerStatus.value = ''
            rightStatus.value = ''
            break
    }
}

// 设置临时状态（3秒后自动清除）
const setTempStatus = (position, message) => {
    setStatus(position, message, 3000)
}

// 将方法绑定到全局状态管理
if (statusBarState) {
    statusBarState.setStatus = setStatus
    statusBarState.clearStatus = clearStatus
    statusBarState.setTempStatus = setTempStatus
}

// 同时设置到全局工具中
setStatusBarInstance({
    setStatus,
    clearStatus,
    setTempStatus
})

onMounted(() => {
    // 立即更新一次时间
    updateTime()
    
    // 每秒更新时间
    timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
    if (timeTimer) {
        clearInterval(timeTimer)
        timeTimer = null
    }
})
</script>

<style scoped>
.status-bar {
    height: 24px;
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    padding: 0 12px;
    font-size: 12px;
    color: #666;
    flex-shrink: 0;
}

.status-left {
    flex: 1;
    display: flex;
    align-items: center;
}

.status-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
}

.status-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-item:empty {
    display: none;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
    .status-bar {
        background-color: #2d2d2d;
        border-top-color: #444;
        color: #ccc;
    }
}
</style>
