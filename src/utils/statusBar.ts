// 状态栏实例接口定义
interface StatusBarInstance {
    setStatus: (position: string, message: string, duration?: number) => void
    clearStatus: (position: string) => void
    setTempStatus: (position: string, message: string) => void
}

// 状态栏全局工具
let statusBarInstance: StatusBarInstance | null = null

// 设置状态栏实例
export const setStatusBarInstance = (instance: StatusBarInstance) => {
    statusBarInstance = instance
}

// 设置状态信息
export const setStatus = (message: string, duration = 0) => {
    if (statusBarInstance && statusBarInstance.setStatus) {
        statusBarInstance.setStatus('', message, duration)
    }
}

// 清除状态信息
export const clearStatus = () => {
    if (statusBarInstance && statusBarInstance.clearStatus) {
        statusBarInstance.clearStatus('')
    }
}

// 设置临时状态（3秒后自动清除）
export const setTempStatus = (message: string) => {
    if (statusBarInstance && statusBarInstance.setTempStatus) {
        statusBarInstance.setTempStatus('', message)
    }
}

// 错误通知函数（需要在组件中设置）
let showErrorNotification: ((message: string, title?: string) => void) | null = null

// 设置错误通知函数
export const setErrorNotificationHandler = (handler: (message: string, title?: string) => void) => {
    showErrorNotification = handler
}

// 显示错误通知
export const showError = (message: string, title = '错误') => {
    if (showErrorNotification) {
        showErrorNotification(message, title)
    }
}

// 预定义的快捷方法
export const statusBar = {
    // 显示加载状态
    showLoading: (message = '加载中...') => setStatus(message),
    
    // 显示成功状态
    showSuccess: (message = '操作成功') => setTempStatus(message),
    
    // 显示错误状态
    showError: (message = '操作失败') => setTempStatus(message),
    
    // 显示信息
    showInfo: (message: string) => setTempStatus(message),
    
    // 显示就绪状态
    showReady: () => setStatus('就绪'),
    
    // 清除所有状态
    clear: () => clearStatus(),
    
    // 直接调用方法
    setStatus,
    clearStatus,
    setTempStatus,
    
    // 错误通知
    showErrorNotification: showError
}

export default statusBar