import { emit } from '@tauri-apps/api/event'
import { Command } from './commandParser'

export async function saveBlockToWorkspace(blockData: Command, content: string) {
  // 构建命令字符串
  const commandString = blockData.title 
    ? `/${getCommandPrefix(blockData.type)} ${blockData.title}`
    : `/${getCommandPrefix(blockData.type)}`
  
  // 发送创建请求到主窗口
  await emit('create-block-request', {
    command: commandString,
    content: content
  })
}

function getCommandPrefix(type: string): string {
  const prefixMap = {
    'todo': 't',
    'idea': 'i',
    'bug': 'b',
    'note': 'n',
    'progress': 'p'
  }
  return prefixMap[type as keyof typeof prefixMap] || 't'
}