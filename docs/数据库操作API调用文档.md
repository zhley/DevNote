# DevNote 数据库操作API调用清单

## 概述
此文档列出了 Workspace.vue 组件中所有对数据库API的调用，包括调用位置、操作类型和用途。

## API导入
**位置**: 第485行
```javascript
import {
    TodoAPI, BugAPI, IdeaAPI, NoteAPI, ProgressAPI, BlockAPI,
    initDatabase
} from '../api/database'
```

## 1. 数据加载操作 (READ)

### 1.1 批量数据加载 - loadAllData函数
**位置**: 第820-826行
**函数**: `loadAllData()`
**操作**: 并行加载所有数据类型

```javascript
const [todosData, bugsData, ideasData, notesData, progressesData, blocksData] = await Promise.all([
    TodoAPI.getAll(),        // 获取所有待办事项
    BugAPI.getAll(),         // 获取所有Bug记录
    IdeaAPI.getAll(),        // 获取所有想法记录
    NoteAPI.getAll(),        // 获取所有笔记
    ProgressAPI.getAll(),    // 获取所有进度记录
    BlockAPI.getAll()        // 获取所有时间块
])
```

**用途**: 应用初始化时加载所有数据到前端状态

## 2. 创建操作 (CREATE)

### 2.1 创建时间块
**位置**: 第1518行
**函数**: `addTimeBlock()`
**API**: `BlockAPI.create()`

```javascript
await BlockAPI.create(newBlock)
```

**用途**: 添加新的时间块记录

## 3. 更新操作 (UPDATE)

### 3.1 更新Bug状态
**位置**: 第1230行
**函数**: `updateBugStatus()`
**API**: `BugAPI.update()`

```javascript
await BugAPI.update(bug.id, bug)
```

**用途**: 更新Bug的状态信息

### 3.2 更新想法状态为已实现
**位置**: 第1250行
**函数**: `markIdeaImplemented()`
**API**: `IdeaAPI.update()`

```javascript
await IdeaAPI.update(ideas[ideaIndex].id, { status: 'implemented' })
```

**用途**: 将想法标记为已实现

### 3.3 更新想法状态为进行中
**位置**: 第1262行
**函数**: `markIdeaInProgress()`
**API**: `IdeaAPI.update()`

```javascript
await IdeaAPI.update(ideas[ideaIndex].id, { status: 'in-progress' })
```

**用途**: 将想法标记为进行中

### 3.4 更新待办事项
**位置**: 第1268-1271行
**函数**: `updateTodoStatus()`
**API**: `TodoAPI.update()`

```javascript
await TodoAPI.update(todo.id, {
    completed: !todo.completed,
    completedAt: !todo.completed ? new Date() : null
})
```

**用途**: 切换待办事项的完成状态

### 3.5 更新时间块内容
**位置**: 第1597行
**函数**: `updateBlockContent()`
**API**: `BlockAPI.update()`

```javascript
await BlockAPI.update(block.id, block)
```

**用途**: 更新时间块的内容

### 3.6 更新时间块(时间修改)
**位置**: 第1668行
**函数**: `updateBlockTime()`
**API**: `BlockAPI.update()`

```javascript
await BlockAPI.update(block.id, block)
```

**用途**: 更新时间块的时间信息

### 3.7 创建或更新项目进度
**位置**: 第1063行
**函数**: `updateTodayProgress()`
**API**: `ProgressAPI.createOrUpdate()`

```javascript
const savedProgress = await ProgressAPI.createOrUpdate(progressData)
```

**用途**: 保存当日的项目进度数据

## 4. 删除操作 (DELETE)

### 4.1 删除项目进度
**位置**: 第1029行
**函数**: `updateTodayProgress()`
**API**: `ProgressAPI.delete()`

```javascript
await ProgressAPI.delete(todayProgress.value.id)
```

**用途**: 当没有进度块时删除当日的进度记录

### 4.2 删除待办事项
**位置**: 第1719行
**函数**: 拖拽操作处理
**API**: `TodoAPI.delete()`

```javascript
await TodoAPI.delete(todo.id)
```

**用途**: 删除待办事项记录

## 5. 特殊操作

### 5.1 创建或更新操作
**API**: `ProgressAPI.createOrUpdate()`
**特点**: 这是一个智能API，会根据数据是否存在来决定创建还是更新

### 5.2 更新想法数据
**位置**: 第1712行
**函数**: 拖拽操作处理
**API**: `IdeaAPI.update()`

```javascript
await IdeaAPI.update(ideas[ideaIndex].id, ideas[ideaIndex])
```

**用途**: 在拖拽操作中更新想法的完整数据

## API调用统计

| API类型 | 调用次数 | 操作类型 |
|---------|----------|----------|
| TodoAPI | 3 | getAll, update, delete |
| BugAPI | 2 | getAll, update |
| IdeaAPI | 4 | getAll, update(×3) |
| NoteAPI | 1 | getAll |
| ProgressAPI | 3 | getAll, delete, createOrUpdate |
| BlockAPI | 4 | getAll, create, update(×2) |

## 数据流向

1. **初始化阶段**: 通过 `loadAllData()` 加载所有数据
2. **用户交互阶段**: 根据用户操作进行增删改查
3. **实时更新**: 操作完成后立即更新本地状态，保持UI同步

## 错误处理

大部分API调用都包含在 try-catch 块中，确保数据库操作失败时不会崩溃应用。

## 性能优化

- 使用 `Promise.all()` 并行加载数据
- 操作后立即更新本地状态，避免重新查询
- 使用响应式数据结构保持UI实时更新

## 注意事项

1. 所有异步操作都使用 `await` 关键字
2. 数据库返回的日期字段需要转换为 Date 对象
3. JSON 字段需要进行解析和序列化
4. 删除操作需要同时更新本地状态数组

## 完整API调用列表

按出现顺序排列：

1. **第821行**: `TodoAPI.getAll()` - 加载所有待办事项
2. **第822行**: `BugAPI.getAll()` - 加载所有Bug记录
3. **第823行**: `IdeaAPI.getAll()` - 加载所有想法
4. **第824行**: `NoteAPI.getAll()` - 加载所有笔记
5. **第825行**: `ProgressAPI.getAll()` - 加载所有进度记录
6. **第826行**: `BlockAPI.getAll()` - 加载所有时间块
7. **第1029行**: `ProgressAPI.delete()` - 删除进度记录
8. **第1063行**: `ProgressAPI.createOrUpdate()` - 创建或更新进度
9. **第1230行**: `BugAPI.update()` - 更新Bug状态
10. **第1250行**: `IdeaAPI.update()` - 标记想法为已实现
11. **第1262行**: `IdeaAPI.update()` - 标记想法为进行中
12. **第1268行**: `TodoAPI.update()` - 更新待办事项状态
13. **第1518行**: `BlockAPI.create()` - 创建新时间块
14. **第1597行**: `BlockAPI.update()` - 更新时间块内容
15. **第1668行**: `BlockAPI.update()` - 更新时间块时间
16. **第1712行**: `IdeaAPI.update()` - 拖拽中更新想法
17. **第1719行**: `TodoAPI.delete()` - 删除待办事项

## 总计统计

- **总API调用数**: 17次
- **涉及的API类**: 6个 (TodoAPI, BugAPI, IdeaAPI, NoteAPI, ProgressAPI, BlockAPI)
- **操作类型**: 5种 (getAll, create, update, delete, createOrUpdate)

## 数据库操作模式

1. **批量加载模式**: 应用启动时一次性加载所有数据
2. **即时更新模式**: 用户操作后立即更新数据库和本地状态
3. **智能操作模式**: 使用createOrUpdate等智能API简化业务逻辑

---

*此文档生成时间: 2025年9月20日*  
*对应文件: src/components/Workspace.vue*