import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Command } from './commandParser'

export async function createEditorWindow(command: Command) {
    try {
        await invoke('create_editor_from_command', {
            block_type: command.type,
            title: 'title' in command ? command.title : ''
        })
    } catch (error) {
        console.error('Failed to create editor window:', error)
        throw error
    }
}

export async function closeCurrentWindow() {
    try {
        const currentWindow = getCurrentWindow()
        await currentWindow.close()
    } catch (error) {
        console.error('Failed to close current window:', error)
    }
}