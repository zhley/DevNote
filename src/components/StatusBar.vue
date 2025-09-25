<template>
    <div class="status-bar">
        <span class="status-item">{{ statusMessage }}</span>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { setStatusBarInstance } from '../utils/statusBar'

// 注入全局状态管理
const statusBarState = inject('statusBarState')

// 状态显示
const statusMessage = ref('就绪')

// 设置状态信息的方法（简化为只接受消息内容）
const setStatus = (position, message, duration = 0) => {
    statusMessage.value = message
    
    // 如果设置了持续时间，自动清除
    if (duration > 0) {
        setTimeout(() => {
            statusMessage.value = '就绪'
        }, duration)
    }
}

// 清除状态信息
const clearStatus = (position) => {
    statusMessage.value = '就绪'
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
