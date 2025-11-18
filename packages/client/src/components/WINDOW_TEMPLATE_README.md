# 通用窗口模板系统使用指南

## 📖 概述

通用窗口模板 (`WindowTemplate`) 提供了一个1:1复刻设置窗口的完整布局和视觉风格的模板系统。

**核心特点：**
- ✅ 完整的古典卷轴风格UI
- ✅ 包含顶部装饰、左右装饰列、底部装饰
- ✅ 支持自定义标题、内容、尺寸
- ✅ 每个窗口独立，修改模板不影响已创建的窗口
- ✅ 新窗口自动使用最新模板

---

## 🎯 设计理念

### 独立性
- 每个窗口基于模板**复制创建**，各自独立发展
- 修改模板只影响**新创建**的窗口
- 已创建的窗口不受模板修改影响

### 灵活性
- 可以完全使用模板（包含装饰列）
- 可以禁用装饰列（纯净内容区）
- 可以自定义标题、底部提示等

---

## 🚀 快速开始

### 最简单的使用

```tsx
import { WindowTemplate } from './components/WindowTemplate'

function MyWindow({ onClose }) {
  return (
    <WindowTemplate
      title="【我的窗口标题】"
      onClose={onClose}
    >
      <div>
        {/* 你的内容 */}
        <p>这里是窗口内容</p>
      </div>
    </WindowTemplate>
  )
}
```

### 完整配置示例

```tsx
import { WindowTemplate } from './components/WindowTemplate'

function MyWindow({ onClose }) {
  return (
    <WindowTemplate
      title="【玄鉴仙录·背包系统】"
      subtitle="储物管理"
      onClose={onClose}
      footerHintLeft="ESC 或 点击空白处关闭"
      footerHintRight="点击物品查看详情"
      footerIconLeft="💡"
      footerIconRight="🎒"
      showDecorations={true}
      className="custom-window"
    >
      <div className="my-content">
        {/* 你的内容 */}
      </div>
    </WindowTemplate>
  )
}
```

---

## 📋 Props API

### WindowTemplateProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | **必填** | 窗口主标题 |
| `subtitle` | `string` | `undefined` | 窗口副标题（可选） |
| `onClose` | `() => void` | **必填** | 关闭回调函数 |
| `children` | `ReactNode` | **必填** | 窗口内容 |
| `footerHintLeft` | `string` | `'ESC 或 点击空白处关闭'` | 底部左侧提示文字 |
| `footerHintRight` | `string` | `'按需修改此提示文字'` | 底部右侧提示文字 |
| `footerIconLeft` | `string` | `'💡'` | 底部左侧图标 |
| `footerIconRight` | `string` | `'📝'` | 底部右侧图标 |
| `showDecorations` | `boolean` | `true` | 是否显示左右装饰列 |
| `className` | `string` | `''` | 自定义类名 |

---

## 🎨 窗口布局结构

```
┌─────────────────────────────────────┐
│      顶部装饰带（标题区）              │
├───┬─────────────────────────────┬───┤
│ 左 │                            │ 右 │
│ 侧 │      内容区域（children）    │ 侧 │
│ 装 │                            │ 装 │
│ 饰 │                            │ 饰 │
│ 列 │                            │ 列 │
├───┴─────────────────────────────┴───┤
│      底部装饰带（提示信息）            │
└─────────────────────────────────────┘
```

### 各区域说明

1. **顶部装饰带** - 包含标题、副标题、左右装饰符号
2. **左右装饰列** - 垂直排列的古典符号（可选显示）
3. **内容区域** - 你的自定义内容，支持滚动
4. **底部装饰带** - 包含提示信息、图标、装饰符号

---

## 💡 使用示例

### 示例1：简单文本窗口

```tsx
<WindowTemplate
  title="【游戏公告】"
  onClose={handleClose}
>
  <div style={{ padding: '20px', fontSize: '14px' }}>
    <h3>更新内容</h3>
    <ul>
      <li>新增背包系统</li>
      <li>优化界面显示</li>
      <li>修复已知问题</li>
    </ul>
  </div>
</WindowTemplate>
```

### 示例2：复杂交互窗口

参考 `src/components/examples/InventoryWindow.tsx`

```tsx
<WindowTemplate
  title="【玄鉴仙录·储物袋】"
  subtitle="背包管理"
  onClose={onClose}
  footerHintRight="点击物品查看详情"
  footerIconRight="🎒"
>
  <div className="inventory-content">
    <div className="inventory-header">
      {/* 统计信息 */}
    </div>
    <div className="inventory-grid">
      {/* 物品网格 */}
    </div>
    <div className="inventory-footer">
      {/* 操作按钮 */}
    </div>
  </div>
</WindowTemplate>
```

### 示例3：无装饰列的纯净窗口

```tsx
<WindowTemplate
  title="【角色属性】"
  onClose={handleClose}
  showDecorations={false}
>
  <div>
    {/* 内容会占据更大空间 */}
  </div>
</WindowTemplate>
```

---

## 🎨 自定义样式

### 方法1：通过className添加自定义样式

```tsx
<WindowTemplate
  title="【我的窗口】"
  onClose={handleClose}
  className="my-custom-window"
>
  <div className="my-content">...</div>
</WindowTemplate>
```

```css
/* 自定义样式 */
.my-custom-window {
  /* 覆盖窗口样式 */
}

.my-content {
  /* 内容区样式 */
}
```

### 方法2：修改模板本身

1. 复制 `WindowTemplate.tsx` 和 `WindowTemplate.css`
2. 重命名为你的窗口组件（如 `MyWindow.tsx`）
3. 修改其中的样式和结构
4. 使用你的自定义窗口组件

**注意：** 这样创建的窗口不会受到原模板修改的影响。

---

## 🔧 高级用法

### 自定义窗口尺寸

在你的自定义CSS中覆盖尺寸：

```css
.my-custom-window.window-template-container {
  width: 60vw;
  height: 80vh;
  max-width: 800px;
  max-height: 900px;
}
```

### 动态控制装饰列

```tsx
const [showDeco, setShowDeco] = useState(true)

<WindowTemplate
  title="【设置】"
  onClose={handleClose}
  showDecorations={showDeco}
>
  <button onClick={() => setShowDeco(!showDeco)}>
    切换装饰列
  </button>
</WindowTemplate>
```

### 自定义关闭逻辑

```tsx
const handleClose = () => {
  // 保存数据
  saveData()
  // 弹出确认
  if (confirm('确定要关闭吗？')) {
    onClose()
  }
}

<WindowTemplate
  title="【编辑器】"
  onClose={handleClose}
>
  ...
</WindowTemplate>
```

---

## 📦 文件结构

```
qianduan/src/components/
├── WindowTemplate.tsx          # 窗口模板组件
├── WindowTemplate.css          # 窗口模板样式
├── WINDOW_TEMPLATE_README.md   # 本文档
└── examples/                   # 示例窗口
    ├── InventoryWindow.tsx     # 背包窗口示例
    └── InventoryWindow.css     # 背包窗口样式
```

---

## 🎯 创建新窗口的步骤

### 步骤1：创建组件文件

```bash
# 创建你的窗口组件
touch src/components/MyWindow.tsx
touch src/components/MyWindow.css
```

### 步骤2：编写组件代码

```tsx
// MyWindow.tsx
import { WindowTemplate } from './WindowTemplate'
import './MyWindow.css'

interface MyWindowProps {
  onClose: () => void
}

export function MyWindow({ onClose }: MyWindowProps) {
  return (
    <WindowTemplate
      title="【我的窗口】"
      subtitle="副标题"
      onClose={onClose}
    >
      <div className="my-window-content">
        {/* 你的内容 */}
      </div>
    </WindowTemplate>
  )
}
```

### 步骤3：编写样式

```css
/* MyWindow.css */
.my-window-content {
  width: 100%;
  padding: 20px;
  /* 你的样式 */
}
```

### 步骤4：在App中使用

```tsx
// App.tsx
import { MyWindow } from './components/MyWindow'

function App() {
  const [showMyWindow, setShowMyWindow] = useState(false)

  return (
    <>
      <button onClick={() => setShowMyWindow(true)}>
        打开我的窗口
      </button>

      {showMyWindow && (
        <MyWindow onClose={() => setShowMyWindow(false)} />
      )}
    </>
  )
}
```

---

## ✨ 内置特性

### 自动功能
- ✅ **ESC键关闭** - 按ESC自动关闭窗口
- ✅ **点击遮罩关闭** - 点击窗口外黑色区域关闭
- ✅ **点击窗口内不关闭** - 防止误操作
- ✅ **关闭动画** - 平滑的淡出动画
- ✅ **滚动支持** - 内容超出自动滚动
- ✅ **响应式** - 移动端自适应

### 主题适配
- ✅ 自动跟随主题（水墨丹青 / 暗夜水墨）
- ✅ 底部文字在暗夜主题下增强可见性
- ✅ 所有颜色使用CSS变量，易于定制

---

## 🔄 模板更新策略

### 更新模板后的影响

**已创建的窗口：** ❌ 不受影响（各自独立）
**新创建的窗口：** ✅ 自动使用新模板

### 如何更新现有窗口

如果你想让某个已创建的窗口使用新模板：

1. 手动对比模板的改动
2. 在你的窗口组件中应用这些改动
3. 或者重新基于新模板创建窗口

---

## ❓ 常见问题

### Q: 如何让窗口更大/更小？
A: 在自定义CSS中覆盖 `.window-template-container` 的尺寸。

### Q: 能否去掉左右装饰列？
A: 设置 `showDecorations={false}`。

### Q: 如何改变窗口标题样式？
A: 修改 `.seal-main-title` 的CSS样式。

### Q: 内容区如何居中？
A: 在内容wrapper上设置flex布局和居中。

### Q: 如何禁用ESC关闭？
A: 需要修改模板组件，移除ESC监听逻辑。

---

## 🎉 总结

通用窗口模板系统提供了：
1. **统一的视觉风格** - 保持游戏UI一致性
2. **快速开发** - 几分钟创建一个新窗口
3. **高度灵活** - 支持各种定制需求
4. **独立演化** - 每个窗口可以独立修改

**开始创建你的窗口吧！** 🚀

参考示例：`src/components/examples/InventoryWindow.tsx`
