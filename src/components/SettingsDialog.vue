<template>
    <el-dialog
        v-model="visible"
        title="设置"
        width="600px"
        :before-close="handleClose"
        center
    >
        <div class="settings-content">
            <div class="settings-section">
                <h3>快捷键设置</h3>
                <div class="setting-item">
                    <label>快速创建命令窗口:</label>
                    <el-input 
                        v-model="settings.shortcuts.quickCreate" 
                        placeholder="Alt+`"
                        @blur="saveSettings"
                        size="small"
                        style="width: 200px;"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="openSettingsFile">打开配置文件</el-button>
                <el-button type="primary" @click="handleClose">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { loadSettings, saveSettingsToFile, openSettingsFileInSystem } from '../api/settings'

const visible = ref(false)
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
.settings-content {
    padding: 10px 0;
}

.settings-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.settings-section h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #374151;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.setting-item label {
    min-width: 160px;
    font-size: 14px;
    color: #4b5563;
    font-weight: 500;
}

.setting-item:last-child {
    margin-bottom: 0;
}

.dialog-footer {
    text-align: center;
}
</style>