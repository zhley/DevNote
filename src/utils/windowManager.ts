import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Command } from './commandParser'

export async function createEditorWindow(blockData: Command) {
  try {
    await invoke('create_editor_from_command', {
      commandData: JSON.stringify(blockData)
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