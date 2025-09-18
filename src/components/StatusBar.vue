<template>
    <div class="status-bar">
        <div class="status-left">
            <!-- 左侧状态信息 -->
        </div>
        
        <div class="status-right">
            <!-- 右侧状态信息 -->
        </div>
    </div>
</template>

<script setup>
// 目前为空，待后续添加功能
</script>

<style scoped>
.status-bar {
    background: #007acc;
    color: #ffffff;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 12px;
    user-select: none;
    border-top: 1px solid #005a9e;
}

.status-left,
.status-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 2px;
    cursor: pointer;
    transition: background-color 0.1s ease;
}

.status-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.status-item.clickable {
    cursor: pointer;
}

.status-item.clickable:hover {
    background: rgba(255, 255, 255, 0.15);
}

/* 错误状态 */
.status-bar.error {
    background: #d32f2f;
    border-top-color: #b71c1c;
}

/* 警告状态 */
.status-bar.warning {
    background: #f57f17;
    border-top-color: #e65100;
}

/* 成功状态 */
.status-bar.success {
    background: #388e3c;
    border-top-color: #2e7d32;
}
</style>
