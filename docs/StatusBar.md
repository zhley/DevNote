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
│      StatusBar (固定高度24px)      │        时间          │
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
// 在指定位置显示消息
statusBar.setStatus('left', '正在保存...', 3000)  // 3秒后自动清除
statusBar.setStatus('center', '操作完成')
statusBar.setStatus('right', '连接中')

// 清除状态
statusBar.clearStatus('left')    // 清除左侧状态
statusBar.clearStatus('center')  // 清除中间状态
statusBar.clearStatus('right')   // 清除右侧状态
statusBar.clearStatus('all')     // 清除所有状态

// 临时状态（3秒后自动清除）
statusBar.setTempStatus('center', '保存成功')
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

### 4. 状态栏区域说明

- **左侧区域 (left)**：通常显示应用状态，如"就绪"、"加载中"等
- **中间区域 (center)**：显示操作反馈，如成功、失败消息
- **右侧区域 (right)**：显示系统信息，右端固定显示当前时间

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
        statusBar.setStatus('left', '保存中...')
        
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