// TypeScript类型定义
export interface Todo {
  id?: number
  title: string
  content: string
  priority: number // 1-3
  finished: boolean
  created_at: string
  completed_at?: string
  idea_id?: number
}

export interface Bug {
  id?: number
  title: string
  description: string
  fixed: boolean
  created_at: string
  completed_at?: string
  additional_info?: string
}

export interface Idea {
  id?: number
  title: string
  content: string
  status: 'pending' | 'in-progress' | 'implemented' | 'discarded'
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
  related_id?: number
  created_at: string
}