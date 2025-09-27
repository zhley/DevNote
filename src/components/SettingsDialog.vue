<template>
    <div v-if="visible" class="settings-overlay" @click="handleOverlayClick">
        <div class="settings-window" @click.stop>
            <!-- 窗口标题栏 -->
            <div class="window-header">
                <div class="window-title">设置</div>
                <button class="close-btn" @click="handleClose">×</button>
            </div>
            
            <div class="settings-container">
                <!-- 左侧导航 -->
                <div class="settings-sidebar">
                    <div class="sidebar-section">
                        <div class="nav-item" :class="{ active: activeTab === 'hotkeys' }" @click="activeTab = 'hotkeys'">
                            <span class="nav-text">快捷键</span>
                        </div>
                        <div class="nav-item" :class="{ active: activeTab === 'appearance' }" @click="activeTab = 'appearance'">
                            <span class="nav-text">外观</span>
                        </div>
                    </div>
                    
                    <div class="sidebar-footer">
                        <button class="config-btn" @click="openSettingsFile">
                            <span class="btn-text">打开配置文件</span>
                        </button>
                    </div>
                </div>
                
                <!-- 右侧内容 -->
                <div class="settings-main">
                    <div class="settings-content">
                        <!-- 快捷键设置 -->
                        <div v-if="activeTab === 'hotkeys'" class="setting-group">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-label">快速创建命令窗口</div>
                                </div>
                                <div class="setting-control">
                                    <input 
                                        v-model="settings.shortcuts.quickCreate" 
                                        placeholder="Alt+`"
                                        @blur="saveSettings"
                                        class="hotkey-input"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <!-- 外观设置 -->
                        <div v-if="activeTab === 'appearance'" class="setting-group">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-label">主题</div>
                                </div>
                                <div class="setting-control">
                                    <select v-model="settings.theme" @change="saveSettings" class="theme-select">
                                        <option value="light">浅色</option>
                                        <option value="dark">深色</option>
                                        <option value="auto">跟随系统</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { loadSettings, saveSettingsToFile, openSettingsFileInSystem } from '../api/settings'

const visible = ref(false)
const activeTab = ref('hotkeys')
const settings = ref({
    shortcuts: {
        quickCreate: 'Alt+`'
    },
    theme: 'light'
})

const show = async () => {
    visible.value = true
    try {
        const loadedSettings = await loadSettings()
        settings.value = { ...settings.value, ...loadedSettings }
    } catch (error) {
        console.error('Failed to load settings:', error)
        ElMessage.error('加载设置失败')
    }
}

const handleClose = () => {
    visible.value = false
}

const handleOverlayClick = () => {
    visible.value = false
}

const saveSettings = async () => {
    try {
        await saveSettingsToFile(settings.value)
        ElMessage.success('设置已保存')
    } catch (error) {
        console.error('Failed to save settings:', error)
        ElMessage.error('保存设置失败')
    }
}

const openSettingsFile = async () => {
    try {
        await openSettingsFileInSystem()
    } catch (error) {
        console.error('Failed to open settings file:', error)
        ElMessage.error('打开配置文件失败')
    }
}

// 暴露给父组件的方法
defineExpose({
    show
})
</script>

<style scoped>
/* 遮罩层 */
.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

/* 设置窗口 */
.settings-window {
    width: 720px;
    height: 480px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 窗口标题栏 */
.window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #e0e0e0;
}

.window-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #dbeafe;
    color: #1e40af;
}

/* 主容器 */
.settings-container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* 左侧导航 */
.settings-sidebar {
    width: 200px;
    background: #f5f5f7;
    border-right: 1px solid #d1d5db;
    display: flex;
    flex-direction: column;
}

.sidebar-section {
    padding: 12px 8px;
    flex: 1;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #374151;
    font-size: 13px;
    font-weight: 500;
    height: 24px;
    margin-bottom: 2px;
}

.nav-item.active {
    background: #3b82f6;
    color: white;
}

.nav-item:hover:not(.active) {
    background: #dbeafe;
}

.nav-text {
    flex: 1;
}

.sidebar-footer {
    padding: 12px;
    border-top: 1px solid #bfdbfe;
}

.config-btn {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    transition: all 0.2s ease;
}

.config-btn:hover {
    background: #dbeafe;
    color: #1e40af;
}

.btn-icon {
    margin-right: 6px;
    font-size: 12px;
}

.btn-text {
    flex: 1;
    text-align: left;
}

/* 右侧内容 */
.settings-main {
    flex: 1;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.settings-content {
    flex: 1;
    padding: 24px;
}

.setting-group {
    margin-bottom: 32px;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f9fafb;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info {
    flex: 1;
    margin-right: 24px;
}

.setting-label {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
}

.setting-control {
    flex-shrink: 0;
}

.hotkey-input {
    width: 160px;
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    font-family: 'Consolas', 'Monaco', monospace;
    background: #ffffff;
    color: #374151;
    transition: all 0.2s ease;
}

.hotkey-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hotkey-input:hover {
    border-color: #60a5fa;
}

.theme-select {
    width: 160px;
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: #ffffff;
    color: #374151;
    transition: all 0.2s ease;
    cursor: pointer;
}
</style>