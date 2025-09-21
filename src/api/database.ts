import Database from '@tauri-apps/plugin-sql'
import { getCurrentProjectPath } from './project'
import type { Todo, Bug, Idea, Note, Progress, Block } from '../types'

let db: Database | null = null

// 初始化数据库连接
export async function initDatabase() {
  try {
    const projectPath = getCurrentProjectPath()
    if (!projectPath) {
      throw new Error('No project file selected. Please ensure initProject() is called first.')
    }
    
    // 连接到当前项目的数据库文件
    db = await Database.load(`sqlite:${projectPath}`)
    await createTables()
    await cleanOldBlocks() // 清理旧的blocks数据
    
    console.log('=== Database initialized successfully ===')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// 获取数据库实例
export async function getDatabase() {
  if (!db) {
    await initDatabase()
  }
  return db!
}

// 创建数据表
async function createTables() {
  if (!db) throw new Error('Database not initialized')

  // 创建todos表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      priority INTEGER DEFAULT 2,
      finished BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      idea_id INTEGER
    )
  `)

  // 创建bugs表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      fixed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      additional_info TEXT
    )
  `)

  // 创建ideas表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建notes表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建progresses表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS progresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建blocks表（只保存当天数据）
  await db.execute(`
    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT DEFAULT '',
      related_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// 清理旧的blocks数据（只保留今天的）
async function cleanOldBlocks() {
  if (!db) return
  
  const today = new Date().toISOString().split('T')[0]
  await db.execute(
    'DELETE FROM blocks WHERE DATE(created_at) < ?',
    [today]
  )
}

// Todo CRUD操作
export class TodoAPI {
  static async getAll(): Promise<Todo[]> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM todos ORDER BY created_at DESC')
    return results as Todo[]
  }
  
  static async create(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const database = await getDatabase()
    const result = await database.execute(
      'INSERT INTO todos (title, content, priority, finished, idea_id) VALUES (?, ?, ?, ?, ?)',
      [todo.title, todo.content || '', todo.priority || 2, todo.finished ? 1 : 0, todo.idea_id]
    )
    const id = result.lastInsertId
    if (id === undefined) {
      throw new Error('Failed to create todo: no ID returned')
    }
    return { ...todo, id: id as number }
  }
  
  static async update(id: number, todo: Partial<Todo>): Promise<void> {
    const database = await getDatabase()
    const fields = []
    const values = []
    
    if (todo.title !== undefined) { fields.push('title = ?'); values.push(todo.title) }
    if (todo.content !== undefined) { fields.push('content = ?'); values.push(todo.content) }
    if (todo.priority !== undefined) { fields.push('priority = ?'); values.push(todo.priority) }
    if (todo.finished !== undefined) { fields.push('finished = ?'); values.push(todo.finished ? 1 : 0) }
    if (todo.completed_at !== undefined) { fields.push('completed_at = ?'); values.push(todo.completed_at) }
    
    if (fields.length > 0) {
      values.push(id)
      await database.execute(
        `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }
  
  static async delete(id: number): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM todos WHERE id = ?', [id])
  }
}

// Bug CRUD操作
export class BugAPI {
  static async getAll(): Promise<Bug[]> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM bugs ORDER BY created_at DESC')
    return results as Bug[]
  }
  
  static async create(bug: Omit<Bug, 'id'>): Promise<Bug> {
    const database = await getDatabase()
    const result = await database.execute(
      'INSERT INTO bugs (title, description, fixed, additional_info) VALUES (?, ?, ?, ?)',
      [bug.title, bug.description || '', bug.fixed ? 1 : 0, bug.additional_info]
    )
    const id = result.lastInsertId
    if (id === undefined) {
      throw new Error('Failed to create bug: no ID returned')
    }
    return { ...bug, id: id as number }
  }
  
  static async update(id: number, bug: Partial<Bug>): Promise<void> {
    const database = await getDatabase()
    const fields = []
    const values = []
    
    if (bug.title !== undefined) { fields.push('title = ?'); values.push(bug.title) }
    if (bug.description !== undefined) { fields.push('description = ?'); values.push(bug.description) }
    if (bug.fixed !== undefined) { fields.push('fixed = ?'); values.push(bug.fixed ? 1 : 0) }
    if (bug.completed_at !== undefined) { fields.push('completed_at = ?'); values.push(bug.completed_at) }
    if (bug.additional_info !== undefined) { fields.push('additional_info = ?'); values.push(bug.additional_info) }
    
    if (fields.length > 0) {
      values.push(id)
      await database.execute(
        `UPDATE bugs SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }
  
  static async delete(id: number): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM bugs WHERE id = ?', [id])
  }
}

// Idea CRUD操作
export class IdeaAPI {
  static async getAll(): Promise<Idea[]> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM ideas ORDER BY created_at DESC')
    return results as Idea[]
  }
  
  static async create(idea: Omit<Idea, 'id'>): Promise<Idea> {
    const database = await getDatabase()
    const result = await database.execute(
      'INSERT INTO ideas (title, content, status) VALUES (?, ?, ?)',
      [idea.title, idea.content || '', idea.status || 'pending']
    )
    const id = result.lastInsertId
    if (id === undefined) {
      throw new Error('Failed to create idea: no ID returned')
    }
    return { ...idea, id: id as number }
  }
  
  static async update(id: number, idea: Partial<Idea>): Promise<void> {
    const database = await getDatabase()
    const fields = []
    const values = []
    
    if (idea.title !== undefined) { fields.push('title = ?'); values.push(idea.title) }
    if (idea.content !== undefined) { fields.push('content = ?'); values.push(idea.content) }
    if (idea.status !== undefined) { fields.push('status = ?'); values.push(idea.status) }
    
    if (fields.length > 0) {
      values.push(id)
      await database.execute(
        `UPDATE ideas SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }
  
  static async delete(id: number): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM ideas WHERE id = ?', [id])
  }
}

// Note CRUD操作
export class NoteAPI {
  static async getAll(): Promise<Note[]> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM notes ORDER BY last_modified DESC')
    return results as Note[]
  }
  
  static async create(note: Omit<Note, 'id'>): Promise<Note> {
    const database = await getDatabase()
    const result = await database.execute(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [note.title, note.content || '']
    )
    const id = result.lastInsertId
    if (id === undefined) {
      throw new Error('Failed to create note: no ID returned')
    }
    return { ...note, id: id as number }
  }
  
  static async update(id: number, note: Partial<Note>): Promise<void> {
    const database = await getDatabase()
    const fields = []
    const values = []
    
    if (note.title !== undefined) { fields.push('title = ?'); values.push(note.title) }
    if (note.content !== undefined) { 
      fields.push('content = ?', 'last_modified = CURRENT_TIMESTAMP')
      values.push(note.content)
    }
    
    if (fields.length > 0) {
      values.push(id)
      await database.execute(
        `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }
  
  static async delete(id: number): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM notes WHERE id = ?', [id])
  }
}

// Progress CRUD操作
export class ProgressAPI {
  static async getAll(): Promise<Progress[]> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM progresses ORDER BY date DESC') as any[]
    return results.map(progress => ({
      ...progress,
      content: JSON.parse(progress.content),
      date: new Date(progress.date),
      createdAt: new Date(progress.created_at)
    }))
  }
  
  static async createOrUpdate(progressData: { date: Date, content: string[] }): Promise<Progress> {
    const database = await getDatabase()
    const dateStr = progressData.date.toISOString().split('T')[0]
    const contentStr = JSON.stringify(progressData.content)
    
    await database.execute(
      'INSERT OR REPLACE INTO progresses (date, content) VALUES (?, ?)',
      [dateStr, contentStr]
    )
    
    // 返回创建/更新的进度
    const result = await this.getByDate(dateStr)
    if (!result) {
      throw new Error('Failed to create/update progress')
    }
    return result
  }
  
  static async getByDate(date: string): Promise<Progress | null> {
    const database = await getDatabase()
    const results = await database.select('SELECT * FROM progresses WHERE date = ?', [date]) as any[]
    if (results.length === 0) return null
    
    const progress = results[0]
    return {
      ...progress,
      content: JSON.parse(progress.content),
      date: new Date(progress.date),
      createdAt: new Date(progress.created_at)
    }
  }
  
  static async delete(id: number): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM progresses WHERE id = ?', [id])
  }
}

// Block CRUD操作（只保存当天数据）
export class BlockAPI {
  static async getAll(): Promise<Block[]> {
    const database = await getDatabase()
    const today = new Date().toISOString().split('T')[0]
    const results = await database.select(
      'SELECT * FROM blocks WHERE DATE(created_at) = ? ORDER BY created_at ASC',
      [today]
    )
    return results as Block[]
  }
  
  static async create(block: Block): Promise<Block> {
    const database = await getDatabase()
    await database.execute(
      'INSERT INTO blocks (id, type, content, related_id) VALUES (?, ?, ?, ?)',
      [block.id, block.type, block.content, block.related_id]
    )
    return block
  }
  
  static async update(id: string, blockData: Partial<Block>): Promise<void> {
    const database = await getDatabase()
    const fields = []
    const values = []
    
    if (blockData.content !== undefined) { fields.push('content = ?'); values.push(blockData.content) }
    if (blockData.related_id !== undefined) { fields.push('related_id = ?'); values.push(blockData.related_id) }
    
    if (fields.length > 0) {
      values.push(id)
      await database.execute(
        `UPDATE blocks SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }
  
  static async delete(id: string): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM blocks WHERE id = ?', [id])
  }
  
  static async deleteAll(): Promise<void> {
    const database = await getDatabase()
    await database.execute('DELETE FROM blocks')
  }
}

// 启动时清理旧数据的工具函数
export async function dailyCleanup() {
  await cleanOldBlocks()
}