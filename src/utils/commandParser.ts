export interface Command {
  type: 'todo' | 'idea' | 'bug' | 'note' | 'progress'
  title?: string
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