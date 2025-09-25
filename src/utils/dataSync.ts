import { emit } from '@tauri-apps/api/event'
import { Command } from './commandParser'

export async function saveBlockToWorkspace(blockData: Command, content: string) {
  // 发送创建请求到主窗口，只包含类型和内容
  await emit('create-block-request', {
    type: blockData.type,
    content: content
  })
}