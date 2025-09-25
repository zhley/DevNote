export interface Command {
  type: 'todo' | 'idea' | 'bug' | 'note' | 'progress'
  title?: string
  priority?: number
}

export function parseCommand(input: string): Command | null {
  const parts = input.trim().split(' ')
  const command = parts[0].toLowerCase()
  
  const typeMap: Record<string, Command['type']> = {
    '/t': 'todo',
    '/i': 'idea',
    '/b': 'bug',
    '/n': 'note',
    '/p': 'progress'
  }
  
  if (!typeMap[command]) return null
  
  // 解析标题参数
  let title = ''
  const titleIndex = parts.findIndex(part => !part.startsWith('-') && part !== command)
  if (titleIndex !== -1) {
    // 提取标题，可能包含多个单词
    const titleParts = []
    for (let i = titleIndex; i < parts.length; i++) {
      if (parts[i].startsWith('-')) break
      titleParts.push(parts[i])
    }
    title = titleParts.join(' ')
  }
  
  return {
    type: typeMap[command],
    title: title || undefined
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