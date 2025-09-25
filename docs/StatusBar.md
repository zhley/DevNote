# 状态栏使用指南

## 概述
底部状态栏用于显示应用的实时状态信息，包括操作进度、系统状态和当前时间等。

## 布局结构
```
┌─────────────────────────────────────────────────────────┐
│                     MenuBar (固定高度)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   Workspace (自适应)                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   StatusBar (固定高度24px) - 状态信息（左对齐）               │
└─────────────────────────────────────────────────────────┘
```

## 使用方法

### 1. 导入状态栏工具
```javascript
import { statusBar } from '../utils/statusBar'
```

### 2. 基本方法

#### 设置状态信息
```javascript
// 显示消息
statusBar.setStatus('正在保存...', 3000)  // 3秒后自动清除
statusBar.setStatus('操作完成')           // 持续显示直到被覆盖

// 清除状态
statusBar.clearStatus()                  // 清除状态，恢复为"就绪"

// 临时状态（3秒后自动清除）
statusBar.setTempStatus('保存成功')
```

### 3. 预定义快捷方法

```javascript
// 显示加载状态
statusBar.showLoading('加载数据中...')

// 显示成功消息
statusBar.showSuccess('操作成功')

// 显示错误消息
statusBar.showError('操作失败')

// 显示信息
statusBar.showInfo('提示信息')

// 显示就绪状态
statusBar.showReady()

// 清除所有状态
statusBar.clear()
```

### 4. 状态栏说明

状态栏采用简洁的单一显示区域设计：
- **统一显示区域**：所有状态信息都在同一区域显示，左对齐
- **默认状态**：显示"就绪"
- **信息覆盖**：新的状态信息会覆盖之前的内容
- **自动清理**：临时状态会在指定时间后自动恢复为"就绪"

### 5. 使用示例

```javascript
// 在数据加载时
const loadData = async () => {
    try {
        statusBar.showLoading('正在加载数据...')
        
        const data = await fetchData()
        
        statusBar.showReady()
        statusBar.showSuccess('数据加载完成')
    } catch (error) {
        statusBar.showError('数据加载失败')
    }
}

// 在操作完成时
const saveDocument = async () => {
    try {
        statusBar.setStatus('保存中...')
        
        await save()
        
        statusBar.showReady()
        statusBar.showSuccess('文档已保存')
    } catch (error) {
        statusBar.showError('保存失败')
    }
}
```

## 技术实现

### 全局状态管理
状态栏通过以下方式提供全局访问：

1. **Vue Provide/Inject**：在组件间传递状态管理实例
2. **全局工具函数**：通过 `utils/statusBar.ts` 提供独立的工具函数
3. **实例注册**：StatusBar 组件启动时自动注册到全局工具中

### 自动清理
- 临时状态默认3秒后自动清除
- 可以设置自定义持续时间
- 页面切换时会保持状态栏状态

### 样式特性
- 深色主题自适应
- 固定高度24px
- 响应式布局
- 文本溢出处理

这样设计确保了状态栏既易于使用，又能提供良好的用户体验反馈。