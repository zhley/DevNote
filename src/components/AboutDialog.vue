<template>
    <el-dialog
        v-model="visible"
        title="关于 DevNote"
        width="400px"
        :before-close="handleClose"
        center
    >
        <div class="about-content">
            <div class="app-header">
                <div class="app-icon">
                    <img src="/tauri.svg" alt="DevNote" width="48" height="48" />
                </div>
                <div class="app-info">
                    <h2>DevNote</h2>
                    <p class="version">版本 {{ version }}</p>
                </div>
            </div>
            
            <div class="app-description">
                现代化的开发笔记管理工具，帮助开发者高效组织项目信息。
            </div>

            <div class="info-row">
                <span class="info-label">技术栈</span>
                <span class="tech-list">Vue 3 • TypeScript • Tauri • Rust</span>
            </div>

            <div class="info-row">
                <span class="info-label">仓库地址</span>
                <a href="https://github.com/zhley/DevNote" target="_blank" class="repo-link">
                    github.com/zhley/DevNote
                </a>
            </div>

            <div class="copyright">
                © 2025 zhley • 构建时间: {{ buildTime }}
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="handleClose">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import packageJson from '../../package.json'

const visible = ref(false)

// 从 package.json 读取版本号
const version = computed(() => {
    return packageJson.version
})

// 构建时间（可以从环境变量或配置中获取）
const buildTime = computed(() => {
    return new Date().toLocaleDateString('zh-CN')
})

const show = () => {
    visible.value = true
}

const handleClose = () => {
    visible.value = false
}

// 暴露给父组件的方法
defineExpose({
    show
})
</script>

<style scoped>
.about-content {
    text-align: center;
    padding: 10px 0;
    max-height: 400px;
    overflow: hidden;
}

.app-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 16px;
}

.app-icon img {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-info {
    text-align: left;
}

.app-info h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
}

.version {
    margin: 2px 0 0 0;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.app-description {
    margin-bottom: 20px;
    line-height: 1.5;
    color: #4b5563;
    font-size: 13px;
    padding: 0 10px;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 8px 16px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #f3f4f6;
}

.info-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    min-width: 70px;
    text-align: left;
}

.tech-list {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
    text-align: right;
    flex: 1;
    margin-left: 16px;
}

.repo-link {
    font-size: 12px;
    color: #1f2937;
    text-decoration: none;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.repo-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s ease;
}

.repo-link:hover {
    color: #1e40af;
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
}

.repo-link:hover::before {
    left: 100%;
}

.repo-link:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.copyright {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #6b7280;
}

.dialog-footer {
    text-align: center;
}

/* Element Plus 对话框样式覆盖 */
:deep(.el-dialog) {
    border-radius: 12px;
}

:deep(.el-dialog__header) {
    padding: 20px 20px 0 20px;
    text-align: center;
}

:deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

:deep(.el-dialog__body) {
    padding: 10px 20px 20px 20px;
}

:deep(.el-dialog__footer) {
    padding: 0 20px 20px 20px;
}
</style>