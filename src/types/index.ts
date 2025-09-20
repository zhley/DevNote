// TypeScript类型定义
export interface Todo {
  id?: number
  title: string
  content: string
  priority: number // 1-3
  finished: boolean
  created_at: string
  completed_at?: string
  block_id?: string
  idea_id?: string
  idea_content?: string
}

export interface Bug {
  id?: number
  title: string
  description: string
  severity: number // 1-3
  fixed: boolean
  created_at: string
  completed_at?: string
  additional_info?: string
}

export interface Idea {
  id?: number
  title: string
  content: string
  status: 'active' | 'in-progress' | 'completed' | 'discarded'
  created_at: string
}

export interface Note {
  id?: number
  title: string
  content: string
  created_at: string
  last_modified: string
}

export interface Progress {
  id?: number
  date: string
  content: string // JSON数组存储
  created_at: string
}

export interface Block {
  id: string
  type: 'todo' | 'bug' | 'idea' | 'note' | 'progress'
  content: string
  priority?: number
  created_at: string
}