<template>
    <el-dialog
        v-model="visible"
        title=""
        width="700px"
        :before-close="handleClose"
        :show-close="true"
        center
        class="settings-dialog"
    >
        <div class="settings-container">
            <!-- 左侧导航 -->
            <div class="settings-sidebar">
                <div class="nav-item active">
                    <span class="nav-text">快捷键</span>
                </div>
                <div class="settings-actions">
                    <el-button size="small" text @click="openSettingsFile">
                        📁 配置文件
                    </el-button>
                </div>
            </div>
            
            <!-- 右侧内容 -->
            <div class="settings-main">
                <div class="main-header">
                    <h3>快捷键</h3>
                </div>
                <div class="settings-content">
                    <div class="setting-row">
                        <div class="setting-info">
                            <span class="setting-name">快速创建命令窗口</span>
                        </div>
                        <div class="setting-control">
                            <el-input 
                                v-model="settings.shortcuts.quickCreate" 
                                placeholder="Alt+`"
                                @blur="saveSettings"
                                size="small"
                                class="hotkey-input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
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
    }
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
.settings-container {
    display: flex;
    height: 320px;
    border: 1px solid #e1e5e9;
    border-radius: 4px;
    overflow: hidden;
}

/* 左侧导航 */
.settings-sidebar {
    width: 100px;
    background: #f5f5f5;
    border-right: 1px solid #e1e5e9;
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.nav-item {
    padding: 6px 8px;
    background: #409eff;
    color: white;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 8px;
}

.nav-text {
    display: block;
}

.settings-actions {
    margin-top: auto;
}

/* 右侧内容 */
.settings-main {
    flex: 1;
    background: white;
    display: flex;
    flex-direction: column;
}

.main-header {
    padding: 16px 20px 12px 20px;
    border-bottom: 1px solid #f0f0f0;
}

.main-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.settings-content {
    flex: 1;
    padding: 16px 20px;
}

.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
}

.setting-row:last-child {
    border-bottom: none;
}

.setting-info {
    flex: 1;
    margin-right: 20px;
}

.setting-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
}

.setting-control {
    flex-shrink: 0;
}

.hotkey-input {
    width: 140px;
}

/* Element Plus 对话框样式覆盖 */
:deep(.settings-dialog .el-dialog) {
    border-radius: 6px;
}

:deep(.settings-dialog .el-dialog__header) {
    display: none;
}

:deep(.settings-dialog .el-dialog__body) {
    padding: 0;
}

:deep(.settings-dialog .el-dialog__footer) {
    display: none;
}
</style>