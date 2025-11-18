# Sarasa Term SC Nerd 字体集成文档

## 📦 字体文件位置

字体文件位于：
```
packages/client/public/fonts/
├── SarasaTermSCNerd-Regular.ttf  (29.66 MB)
└── SarasaTermSCNerd-Bold.ttf      (29.48 MB)
```

## ✅ 字体配置（已完成）

### 1. @font-face 声明

在 `packages/client/src/index.css` 中已经正确配置：

```css
@font-face {
  font-family: 'Sarasa Term SC Nerd';
  src: url('/fonts/SarasaTermSCNerd-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Sarasa Term SC Nerd';
  src: url('/fonts/SarasaTermSCNerd-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 2. CSS 变量配置

```css
:root {
  --font-family: 'Sarasa Term SC Nerd', monospace;
  --font-family-fallback: 'Consolas', 'Monaco', 'Courier New', monospace;
}

body {
  font-family: var(--font-family);
}
```

## 🎨 字体特性

### Sarasa Term SC Nerd 字体特点：

1. **等宽字体**：
   - 英文字符：1 个字符宽度
   - 中文字符：2 个字符宽度
   - 完美适合终端和代码编辑器

2. **Nerd Font 图标支持**：
   - 包含大量图标字符
   - 支持开发工具图标
   - 完美显示特殊符号

3. **中文优化**：
   - 简体中文字符清晰
   - 标点符号完整
   - 适合中文 MUD 游戏

## 🔍 验证字体是否加载

### 方法 1: 浏览器开发者工具

1. 打开浏览器开发者工具（F12）
2. 进入 Network 标签
3. 刷新页面
4. 搜索 `SarasaTerm` 或查看 `fonts` 类型的请求
5. 确认字体文件状态为 `200 OK`

### 方法 2: 使用 Chrome DevTools

1. 打开开发者工具
2. 进入 Elements 标签
3. 选中任意文本元素
4. 在 Computed 标签中查看 `font-family`
5. 应该显示 `Sarasa Term SC Nerd`

### 方法 3: Console 检查

在浏览器控制台输入：
```javascript
document.fonts.check('1em "Sarasa Term SC Nerd"')
```
返回 `true` 表示字体已加载。

## 🐛 故障排除

### 问题 1: 字体未加载

**症状**：页面使用了后备字体（Consolas, Monaco 等）

**解决方案**：
1. 检查字体文件路径是否正确
2. 确认字体文件存在于 `public/fonts/` 目录
3. 清除浏览器缓存并刷新页面
4. 检查网络请求是否成功（F12 -> Network）

### 问题 2: 字体加载很慢

**症状**：页面初次加载时出现字体闪烁

**解决方案**：
- 已使用 `font-display: swap` 优化加载体验
- 考虑使用字体子集化减小文件大小（如果需要）

### 问题 3: 对齐问题

**症状**：ASCII 艺术或表格对齐不正确

**解决方案**：
- 确认使用的是等宽字体
- 检查是否有其他 CSS 覆盖了字体设置
- 验证 `font-family` 继承链是否正确

## 📝 使用示例

### 在组件中使用字体

所有组件会自动继承全局字体设置：

```css
/* 默认继承 */
.my-component {
  /* 自动使用 var(--font-family) */
}

/* 显式指定 */
.specific-element {
  font-family: var(--font-family);
}

/* 使用后备字体 */
.fallback-element {
  font-family: var(--font-family-fallback);
}
```

### 字重变化

```css
.regular-text {
  font-weight: 400; /* 使用 Regular 字体 */
}

.bold-text {
  font-weight: 700; /* 使用 Bold 字体 */
}
```

## 🚀 性能优化

### 当前优化措施：

1. **font-display: swap**
   - 立即显示后备字体
   - 字体加载完成后替换
   - 避免文本不可见（FOIT）

2. **资源预加载**（可选）

   可以在 `index.html` 中添加预加载：
   ```html
   <link rel="preload" href="/fonts/SarasaTermSCNerd-Regular.ttf" as="font" type="font/ttf" crossorigin>
   ```

3. **字体子集化**（可选）
   - 如果只需要部分字符，可以创建字体子集
   - 显著减小文件大小
   - 加快加载速度

## 📊 字体文件信息

| 文件名 | 大小 | 字重 | 用途 |
|--------|------|------|------|
| SarasaTermSCNerd-Regular.ttf | 29.66 MB | 400 | 常规文本 |
| SarasaTermSCNerd-Bold.ttf | 29.48 MB | 700 | 粗体文本 |

## 🎯 最佳实践

1. **保持字体继承**
   - 使用 `font-family: inherit` 让子元素继承父元素字体
   - 避免重复指定字体

2. **使用 CSS 变量**
   - 统一使用 `var(--font-family)`
   - 便于全局修改

3. **等宽布局**
   - 利用等宽特性创建对齐的文本界面
   - 适合 ASCII 艺术和表格

4. **性能考虑**
   - 字体文件较大，注意加载性能
   - 考虑使用 CDN（如果有）
   - 实施适当的缓存策略

## ✨ 字体展示测试

你可以在游戏界面中看到字体效果：

1. **欢迎界面**：精美的 ASCII 艺术边框
2. **聊天窗口**：清晰的中英文混排
3. **游戏地图**：完美对齐的地图符号
4. **状态面板**：整齐的数据展示

## 🔗 相关资源

- [Sarasa Gothic 官方仓库](https://github.com/be5invis/Sarasa-Gothic)
- [Nerd Fonts 官网](https://www.nerdfonts.com/)
- [字体加载最佳实践](https://web.dev/font-best-practices/)

---

**状态**：✅ 字体已正确集成并在使用中
**最后更新**：2025-11-18
