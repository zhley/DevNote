# 快捷添加功能开发文档

## 功能概述

实现一个全局快捷键（Alt+`）触发的快速添加功能，允许用户在不切换到主窗口的情况下快速创建和编辑各种模块（待办、灵感、Bug、笔记、进度）。

## 需求分析

### 核心需求
1. **全局快捷键**: Alt+` 在应用运行时任何状态下都能触发
2. **两阶段交互**:
   - 阶段1: 命令输入框，输入创建命令
   - 阶段2: 内容编辑窗口，编辑具体内容
3. **无边框窗口**: 无标题栏，失焦自动关闭
4. **自动保存**: 编辑完成后自动同步到主工作区

### 技术挑战
- 全局快捷键注册和监听
- 无边框窗口创建和管理
- 窗口焦点状态监听
- 跨窗口数据同步
- 与现有命令系统集成

## 技术方案

### 1. 架构设计

```
┌─────────────────┐    Alt+`     ┌──────────────────┐
│   主窗口        │ ────────────→ │  命令输入窗口     │
│  (Main Window)  │              │ (Command Window) │
└─────────────────┘              └──────────────────┘
                                          │ 输入命令
                                          ▼
                                 ┌──────────────────┐
                                 │  内容编辑窗口     │
                                 │ (Editor Window)  │
                                 └──────────────────┘
                                          │ 保存内容
                                          ▼
                                 ┌──────────────────┐
                                 │   数据库存储      │
                                 │   主窗口同步      │
                                 └──────────────────┘
```

### 2. Tauri 实现方案

#### 2.1 全局快捷键注册
```rust
// src-tauri/src/main.rs
use tauri::GlobalShortcutManager;

fn setup_global_shortcuts(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let mut shortcuts = app.global_shortcut_manager();
    
    shortcuts.register("Alt+`", move || {
        // 触发命令输入窗口
        show_command_window().unwrap();
    })?;
    
    Ok(())
}
```

#### 2.2 窗口管理策略
```rust
// 窗口配置
fn create_command_window() -> WindowBuilder {
    WindowBuilder::new(app, "command", tauri::WindowUrl::App("command.html".into()))
        .title("")
        .resizable(false)
        .fullscreen(false)
        .decorations(false)  // 无标题栏
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(true)
        .center()
        .inner_size(400.0, 50.0)
}

fn create_editor_window() -> WindowBuilder {
    WindowBuilder::new(app, "editor", tauri::WindowUrl::App("editor.html".into()))
        .title("")
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(true)
        .center()
        .inner_size(500.0, 300.0)
}
```

### 3. 前端实现方案

#### 3.1 项目结构
```
src/
├── components/
│   ├── Workspace.vue          # 主工作区（已存在）
│   ├── CommandInput.vue       # 命令输入组件（提取现有逻辑）
│   └── QuickEditor.vue        # 快捷编辑器组件
├── views/
│   ├── CommandWindow.vue      # 命令输入窗口
│   └── EditorWindow.vue       # 编辑窗口
├── utils/
│   ├── commandParser.ts       # 命令解析（提取现有逻辑）
│   ├── windowManager.ts       # 窗口管理
│   └── dataSync.ts           # 数据同步
└── stores/
    └── quickAdd.ts           # 快捷添加状态管理
```

#### 3.2 命令系统重构
```typescript
// utils/commandParser.ts
export interface Command {
  type: 'todo' | 'idea' | 'bug' | 'note' | 'progress';
  title?: string;
  priority?: number;
  // 其他参数...
}

export function parseCommand(input: string): Command | null {
  // 提取现有的命令解析逻辑
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  
  const typeMap = {
    '/t': 'todo',
    '/i': 'idea',
    '/b': 'bug',
    '/n': 'note',
    '/p': 'progress'
  };
  
  if (!typeMap[command]) return null;
  
  return {
    type: typeMap[command],
    title: parts.slice(1).join(' ') || ''
  };
}
```

#### 3.3 窗口组件设计

**CommandWindow.vue** (命令输入窗口)
```vue
<template>
  <div class="command-window">
    <input 
      ref="commandInput"
      v-model="command"
      @keydown.enter="executeCommand"
      @keydown.escape="closeWindow"
      @blur="handleBlur"
      placeholder="输入命令: /t 待办事项, /i 灵感, /b Bug, /n 笔记, /p 进度"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { parseCommand } from '../utils/commandParser'
import { createEditorWindow, closeCurrentWindow } from '../utils/windowManager'

const command = ref('')
const commandInput = ref()

const executeCommand = async () => {
  const parsed = parseCommand(command.value)
  if (parsed) {
    // 创建编辑窗口并传递命令信息
    await createEditorWindow(parsed)
    closeCurrentWindow()
  }
}

onMounted(() => {
  commandInput.value?.focus()
})
</script>
```

**EditorWindow.vue** (编辑窗口)
```vue
<template>
  <div class="editor-window">
    <div class="editor-header">
      <span class="block-type">{{ getBlockTypeLabel(blockData.type) }}</span>
      <span v-if="blockData.title" class="block-title">: {{ blockData.title }}</span>
    </div>
    <textarea
      ref="contentEditor"
      v-model="content"
      @blur="handleBlur"
      @keydown.escape="closeWindow"
      :placeholder="getPlaceholder(blockData.type)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { saveBlockToWorkspace } from '../utils/dataSync'
import { closeCurrentWindow } from '../utils/windowManager'

const props = defineProps(['blockData'])
const content = ref('')
const contentEditor = ref()

const handleBlur = async () => {
  if (content.value.trim()) {
    await saveBlockToWorkspace(props.blockData, content.value)
  }
  closeCurrentWindow()
}

onMounted(() => {
  // 如果有标题，预填充到内容中
  if (props.blockData.title) {
    content.value = props.blockData.title + '\n'
  }
  contentEditor.value?.focus()
})
</script>
```

### 4. 数据同步方案

#### 4.1 工作区函数扩展
首先需要修改工作区的 `createBlock` 函数原型，添加 `content` 参数：

```typescript
// Workspace.vue 中的 createBlock 函数修改
async function createBlock(input: string, content?: string): Promise<Block> {
  const command = parseCommand(input);
  if (!command) {
    throw new Error('无效的命令格式');
  }

  const block: Block = {
    id: Date.now(),
    content: content || command.title || '',  // 使用传入的content或命令中的title
    priority: command.priority || 1,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // 原有的保存和添加逻辑
  await saveToDatabase(command.type, block);
  
  // 根据类型添加到对应数组
  switch (command.type) {
    case 'todo':
      todos.unshift(block);
      break;
    case 'idea':
      ideas.unshift(block);
      break;
    // ... 其他类型
  }

  // 显示成功消息
  statusBar.showSuccess(`${getBlockTypeLabel(command.type)}已添加`);
  return block;
}
```

#### 4.2 跨窗口通信
```typescript
// utils/dataSync.ts
import { emit, listen } from '@tauri-apps/api/event'

export async function saveBlockToWorkspace(blockData: Command, content: string) {
  // 发送创建请求到主窗口
  await emit('create-block-request', {
    command: blockData.title ? `/${getCommandPrefix(blockData.type)} ${blockData.title}` : `/${getCommandPrefix(blockData.type)}`,
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
  return prefixMap[type] || 't'
}
```

#### 4.3 主窗口监听
```typescript
// Workspace.vue 中添加
import { listen } from '@tauri-apps/api/event'

onMounted(() => {
  // 监听快捷添加的创建请求
  listen('create-block-request', async (event) => {
    const { command, content } = event.payload
    
    try {
      // 调用现有的createBlock函数
      await createBlock(command, content)
    } catch (error) {
      console.error('快捷添加失败:', error)
      statusBar.showErrorNotification('创建失败: ' + error.message)
    }
  })
})
```

### 5. 窗口管理工具

```typescript
// utils/windowManager.ts
import { WebviewWindow } from '@tauri-apps/api/window'

export async function createCommandWindow() {
  const window = new WebviewWindow('command', {
    url: '/command',
    title: '',
    resizable: false,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    width: 400,
    height: 50
  })
  
  await window.show()
  await window.setFocus()
}

export async function createEditorWindow(blockData: Command) {
  const window = new WebviewWindow('editor', {
    url: `/editor?data=${encodeURIComponent(JSON.stringify(blockData))}`,
    title: '',
    resizable: false,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    width: 500,
    height: 300
  })
  
  await window.show()
  await window.setFocus()
}

export async function closeCurrentWindow() {
  const current = WebviewWindow.getCurrent()
  await current.close()
}
```

### 6. 路由配置

路由配置的作用是为不同的 Tauri 窗口提供不同的页面入口。在 Tauri 应用中，每个窗口都可以加载不同的 URL 路径，通过 Vue Router 来决定显示哪个组件。

#### 6.1 为什么需要路由配置
1. **多窗口架构**: 快捷添加功能需要创建独立的小窗口
2. **组件隔离**: 每个窗口显示不同的组件，互不干扰
3. **URL 传参**: 可以通过 URL 参数在窗口间传递数据

#### 6.2 路由实现
```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('../App.vue')  // 主窗口，包含完整的工作区
  },
  {
    path: '/command',
    component: () => import('../views/CommandWindow.vue')  // 命令输入窗口
  },
  {
    path: '/editor',
    component: () => import('../views/EditorWindow.vue')   // 内容编辑窗口
  }
]
```

#### 6.3 窗口创建时的 URL 指定
```typescript
// 创建命令窗口时
const commandWindow = new WebviewWindow('command', {
  url: '/command',  // 对应路由中的 /command 路径
  // 其他窗口配置...
})

// 创建编辑窗口时，还可以传递参数
const editorWindow = new WebviewWindow('editor', {
  url: `/editor?data=${encodeURIComponent(JSON.stringify(blockData))}`,
  // 其他窗口配置...
})
```

#### 6.4 在组件中获取路由参数
```typescript
// EditorWindow.vue 中获取传递的数据
import { useRoute } from 'vue-router'

const route = useRoute()
const blockData = JSON.parse(decodeURIComponent(route.query.data as string))
```

### 7. 样式设计

```css
/* CommandWindow 样式 */
.command-window {
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.command-window input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
}

/* EditorWindow 样式 */
.editor-window {
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.editor-window textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}
```

## 开发计划

### 阶段1: Rust后端实现 (2-3天)
1. 注册全局快捷键
2. 实现窗口创建和管理
3. 添加窗口焦点监听
4. 测试基本窗口功能

### 阶段2: 前端重构 (3-4天)
1. 提取命令解析逻辑
2. 创建窗口组件
3. 实现路由配置
4. 添加样式

### 阶段3: 数据同步 (2-3天)
1. 实现跨窗口通信
2. 集成现有数据库API
3. 添加主窗口监听

### 阶段4: 测试和优化 (2天)
1. 功能测试
2. 性能优化
3. 用户体验调优

## 风险和注意事项

### 技术风险
1. **全局快捷键冲突**: 需要检测和处理快捷键冲突
2. **窗口焦点管理**: 不同操作系统的焦点行为可能不同
3. **跨窗口数据同步**: 确保数据一致性

### 用户体验考虑
1. **快捷键选择**: Alt+` 可能与其他软件冲突
2. **窗口位置**: 需要智能定位，避免遮挡重要内容
3. **错误处理**: 命令输入错误时的反馈

### 性能考虑
1. **窗口创建速度**: 需要快速响应用户操作
2. **内存使用**: 避免窗口泄漏
3. **CPU占用**: 全局快捷键监听的性能影响

## 总结

这个快捷添加功能将大大提升用户的工作效率，通过全局快捷键可以在任何时候快速记录想法。技术实现相对复杂，但通过合理的架构设计和分阶段开发，可以确保功能的稳定性和用户体验。

关键成功因素：
1. 稳定的全局快捷键机制
2. 流畅的窗口切换体验
3. 可靠的数据同步机制
4. 直观的用户交互设计