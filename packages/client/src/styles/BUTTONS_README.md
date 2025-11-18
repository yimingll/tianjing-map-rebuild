# 统一按钮系统使用指南

## 📖 概述

本项目实现了统一的按钮风格系统，所有按钮样式通过 `themes.ts` 中的CSS变量控制。

**核心优势：**
- ✅ 只需修改 `themes.ts` 就能改变全局按钮样式
- ✅ 自动跟随主题切换（水墨丹青 / 暗夜水墨）
- ✅ 保持现有UI不变，1:1复刻原有按钮风格
- ✅ 支持CSS类和React组件两种使用方式

---

## 🎨 如何修改全局按钮样式

### 1. 打开 `src/themes.ts`

找到对应主题的按钮配置部分：

```typescript
export const themes = {
  inkPainting: {
    // ... 其他配置 ...

    // ==================== 按钮系统 ====================
    btnBorderWidth: '2px',        // 边框粗细
    btnBorderRadius: '8px',       // 圆角大小
    btnFontSize: '13px',          // 字体大小
    btnFontWeight: 'bold',        // 字体粗细
    btnPaddingY: '8px',           // 上下内边距
    btnPaddingX: '16px',          // 左右内边距
    btnMinWidth: '85px',          // 最小宽度
    btnLetterSpacing: '2px',      // 字间距

    // 按钮颜色 - 默认状态
    btnBg: 'rgba(245, 245, 220, 0.95)',
    btnBorder: '#8b4513',
    btnText: '#8b4513',
    // ...
  }
}
```

### 2. 修改你想改变的值

例如，想让所有按钮更圆润：
```typescript
btnBorderRadius: '12px',  // 改为12px
```

想让所有按钮更大：
```typescript
btnFontSize: '16px',      // 字体改大
btnPaddingY: '12px',      // 内边距增加
btnPaddingX: '20px',
```

### 3. 保存文件

所有使用按钮系统的按钮会自动更新样式！

---

## 💻 使用方法

### 方式1：使用CSS类（推荐用于简单场景）

```tsx
// 普通按钮
<button className="mud-btn">恢复默认</button>

// 带图标的按钮
<button className="mud-btn">
  <span className="mud-btn-icon">✓</span>
  保存设置
</button>

// 小按钮（24×24）
<button className="mud-btn mud-btn-sm">-</button>

// 圆形按钮（32×32）
<button className="mud-btn mud-btn-circle">↺</button>

// 危险按钮（红色）
<button className="mud-btn mud-btn-danger">删除</button>
```

### 方式2：使用React组件（推荐用于复杂场景）

```tsx
import { Button, ButtonGroup } from '@/components/Button'

// 普通按钮
<Button>恢复默认</Button>

// 带图标的主要按钮
<Button variant="primary" icon="✓">
  保存设置
</Button>

// 圆形按钮
<Button size="circle">↺</Button>

// 小按钮
<Button size="sm">-</Button>

// 危险按钮
<Button variant="danger" icon="🗑">删除</Button>

// 按钮组
<ButtonGroup>
  <Button>取消</Button>
  <Button variant="primary">确定</Button>
</ButtonGroup>
```

---

## 🎯 可用的按钮变体

### 尺寸变体
- `default` - 默认大小（布局式按钮）
- `sm` - 小按钮（24×24，zoom-btn样式）
- `circle` - 圆形按钮（32×32，zoom-reset-btn样式）

### 语义化变体
- `default` - 默认样式
- `primary` - 主要操作（如保存）
- `danger` - 危险操作（如删除）红色
- `warning` - 警告操作 黄色
- `info` - 信息操作 蓝色

---

## 📦 文件结构

```
qianduan/src/
├── styles/
│   ├── buttons.css           # 按钮CSS类定义
│   └── BUTTONS_README.md     # 本文档
├── components/
│   └── Button.tsx            # React按钮组件
├── themes.ts                 # 主题配置（包含按钮变量）
└── index.css                 # 全局样式（导入按钮系统）
```

---

## 🔄 迁移现有按钮

### 现有按钮保持不变

为了保持向后兼容，现有的按钮类名会自动映射到新系统：
- `.setting-btn` → 等同于 `.mud-btn`
- `.zoom-btn` → 等同于 `.mud-btn-sm`
- `.zoom-reset-btn` → 等同于 `.mud-btn-circle`

### 逐步迁移建议

1. **新代码**：直接使用 `.mud-btn` 或 `<Button>`
2. **旧代码**：保持不变，系统会自动适配
3. **重构时**：可以选择性地迁移到新类名

---

## 🎨 主题适配

按钮会自动跟随主题切换：

### 水墨丹青主题
- 浅色背景 `rgba(245, 245, 220, 0.95)`
- 棕色边框和文字 `#8b4513`
- Hover时棕色背景

### 暗夜水墨主题
- 深色背景 `rgba(42, 42, 42, 0.95)`
- 金色边框和文字 `#d4a574`
- Hover时金色背景

---

## ⚙️ 高级定制

### 添加新的按钮变体

1. 在 `themes.ts` 中添加新变量（可选）
2. 在 `buttons.css` 中添加新的CSS类
3. 在 `Button.tsx` 中添加新的variant类型

例如，添加一个"成功"按钮：

```css
/* buttons.css */
.mud-btn-success {
  border-color: var(--success);
  color: var(--success);
}

.mud-btn-success:hover {
  background: var(--success);
  color: var(--background);
}
```

```typescript
// Button.tsx
export interface ButtonProps {
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'info' | 'success'
  // ...
}
```

---

## 📝 示例代码

完整示例可以在以下文件中找到：
- `src/components/MapStyleSettings.tsx` - 设置按钮使用示例
- `src/组件/RegionMap.tsx` - 地图按钮使用示例

---

## ❓ 常见问题

### Q: 修改themes.ts后没有生效？
A: 确保应用了主题。主题在 `App.tsx` 的 `ThemeProvider` 中自动加载。

### Q: 能否为单个按钮定制样式？
A: 可以，通过传递 `className` 覆盖特定样式，或使用内联样式。

### Q: 如何确保按钮在所有主题下都好看？
A: 使用CSS变量（如 `var(--primary)`）而不是硬编码颜色值。

---

## 🎉 总结

统一按钮系统让你能够：
1. **集中管理** - 一处修改，全局生效
2. **主题一致** - 自动跟随主题
3. **易于维护** - 清晰的结构和文档
4. **灵活使用** - CSS类或React组件，任君选择

**开始使用吧！** 🚀
