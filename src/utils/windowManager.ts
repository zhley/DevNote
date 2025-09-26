import { getCurrentWindow } from '@tauri-apps/api/window'

export async function closeCurrentWindow() {
    try {
        const currentWindow = getCurrentWindow()
        await currentWindow.close()
    } catch (error) {
        console.error('Failed to close current window:', error)
    }
}