import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

export interface Command {
  type: 'todo' | 'idea' | 'bug' | 'note' | 'progress'
  title?: string
  priority?: number
}

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

export function getBlockTypeLabel(type: string): string {
  const labels = {
    'todo': '待办',
    'idea': '灵感', 
    'bug': 'Bug',
    'note': '笔记',
    'progress': '进度'
  }
  return labels[type as keyof typeof labels] || '未知'
}

export function getPlaceholder(type: string): string {
  const placeholders = {
    'todo': '输入待办事项内容...',
    'idea': '记录你的灵感...',
    'bug': '描述Bug详情...',
    'note': '写下你的笔记...',
    'progress': '记录进度信息...'
  }
  return placeholders[type as keyof typeof placeholders] || '输入内容...'
}