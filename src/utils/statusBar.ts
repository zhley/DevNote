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
export const setStatus = (position: string, message: string, duration = 0) => {
    if (statusBarInstance && statusBarInstance.setStatus) {
        statusBarInstance.setStatus(position, message, duration)
    }
}

// 清除状态信息
export const clearStatus = (position: string) => {
    if (statusBarInstance && statusBarInstance.clearStatus) {
        statusBarInstance.clearStatus(position)
    }
}

// 设置临时状态（3秒后自动清除）
export const setTempStatus = (position: string, message: string) => {
    if (statusBarInstance && statusBarInstance.setTempStatus) {
        statusBarInstance.setTempStatus(position, message)
    }
}

// 预定义的快捷方法
export const statusBar = {
    // 显示加载状态
    showLoading: (message = '加载中...') => setStatus('left', message),
    
    // 显示成功状态
    showSuccess: (message = '操作成功') => setTempStatus('center', message),
    
    // 显示错误状态
    showError: (message = '操作失败') => setTempStatus('center', message),
    
    // 显示信息
    showInfo: (message: string) => setTempStatus('center', message),
    
    // 显示就绪状态
    showReady: () => setStatus('left', '就绪'),
    
    // 清除所有状态
    clear: () => clearStatus('all'),
    
    // 直接调用方法
    setStatus,
    clearStatus,
    setTempStatus
}

export default statusBar