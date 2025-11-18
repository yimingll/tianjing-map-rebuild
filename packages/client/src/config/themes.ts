// ==================== 主题变量定义 ====================
// 定义所有主题必须包含的变量，用于验证和类型提示
export const themeSchema = {
  // 基础信息
  name: 'string',

  // 主色系
  primary: 'color',
  secondary: 'color',
  background: 'color',
  panel: 'color',

  // 文字颜色
  text: 'color',
  textDim: 'color',

  // 边框和装饰
  border: 'color',
  glow: 'color',

  // 功能色 - 状态栏
  hpBar: 'color',
  mpBar: 'color',
  expBar: 'color',

  // 功能色 - 语义化
  success: 'color',
  warning: 'color',
  info: 'color',
  danger: 'color',

  // 交互状态
  hover: 'color',
  active: 'color',
  disabled: 'color',
  focus: 'color',

  // 消息类型色
  msgSystem: 'color',
  msgNarrative: 'color',
  msgDescription: 'color',
  msgCommand: 'color',
  msgResponse: 'color',
  msgCombat: 'color',
  msgAction: 'color',
  msgHelp: 'color',
  msgError: 'color',

  // 布局变量
  borderRadius: 'size',
  shadowLight: 'shadow',
  shadowMedium: 'shadow',
  shadowHeavy: 'shadow',

  // 过渡动画
  transitionSpeed: 'time',
  transitionEasing: 'easing',

  // ==================== 按钮系统 ====================
  // 按钮尺寸
  btnBorderWidth: 'size',
  btnBorderRadius: 'size',
  btnFontSize: 'size',
  btnFontWeight: 'weight',
  btnPaddingY: 'size',
  btnPaddingX: 'size',
  btnMinWidth: 'size',
  btnLetterSpacing: 'size',

  // 按钮颜色 - 默认状态
  btnBg: 'color',
  btnBorder: 'color',
  btnText: 'color',
  btnTextShadow: 'shadow',
  btnBoxShadow: 'shadow',

  // 按钮颜色 - hover状态
  btnHoverBg: 'color',
  btnHoverBorder: 'color',
  btnHoverText: 'color',
  btnHoverTransform: 'transform',
  btnHoverShadow: 'shadow',

  // 按钮颜色 - active状态
  btnActiveTransform: 'transform',
  btnActiveShadow: 'shadow',

  // 按钮动画
  btnTransition: 'transition',

  // 小按钮（zoom-btn样式）
  btnSmSize: 'size',
  btnSmBorderWidth: 'size',
  btnSmBorderRadius: 'size',
  btnSmFontSize: 'size'
}

// ==================== 主题定义 ====================
export const themes = {
  inkPainting: {
    name: '水墨丹青',

    // 主色系
    primary: '#8b4513',
    secondary: '#a0522d',
    background: '#f5f5dc',
    panel: '#faf0e6',

    // 文字颜色
    text: '#2f2f2f',
    textDim: 'rgba(47, 47, 47, 0.7)',

    // 边框和装饰
    border: '#8b4513',
    glow: 'rgba(139, 69, 19, 0.4)',

    // 功能色 - 状态栏
    hpBar: '#c41e3a',
    mpBar: '#4169e1',
    expBar: '#ffd700',

    // 功能色 - 语义化
    success: '#5a7d50',
    warning: '#c89050',
    info: '#4a6d85',
    danger: '#b83838',

    // 交互状态
    hover: 'rgba(139, 69, 19, 0.15)',
    active: 'rgba(139, 69, 19, 0.3)',
    disabled: 'rgba(47, 47, 47, 0.3)',
    focus: 'rgba(139, 69, 19, 0.5)',

    // 消息类型色
    msgSystem: '#8b4513',
    msgNarrative: '#3f3f3f',
    msgDescription: '#5f5f5f',
    msgCommand: '#228b22',
    msgResponse: '#2f2f2f',
    msgCombat: '#dc143c',
    msgAction: '#ff8c00',
    msgHelp: '#4b0082',
    msgError: '#b22222',

    // 布局变量
    borderRadius: '4px',
    shadowLight: '0 2px 8px rgba(139, 69, 19, 0.2)',
    shadowMedium: '0 4px 16px rgba(139, 69, 19, 0.3)',
    shadowHeavy: '0 8px 24px rgba(139, 69, 19, 0.4)',

    // 过渡动画
    transitionSpeed: '0.3s',
    transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // ==================== 按钮系统 ====================
    // 按钮尺寸（复刻布局式按钮）
    btnBorderWidth: '2px',
    btnBorderRadius: '8px',
    btnFontSize: '13px',
    btnFontWeight: 'bold',
    btnPaddingY: '8px',
    btnPaddingX: '16px',
    btnMinWidth: '85px',
    btnLetterSpacing: '2px',

    // 按钮颜色 - 默认状态
    btnBg: 'rgba(245, 245, 220, 0.95)',
    btnBorder: '#8b4513',
    btnText: '#8b4513',
    btnTextShadow: '0 0 8px rgba(139, 69, 19, 0.4)',
    btnBoxShadow: '0 0 10px rgba(139, 69, 19, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.2)',

    // 按钮颜色 - hover状态
    btnHoverBg: '#8b4513',
    btnHoverBorder: '#a0522d',
    btnHoverText: '#f5f5dc',
    btnHoverTransform: 'translateY(-3px) scale(1.08)',
    btnHoverShadow: '0 0 20px rgba(139, 69, 19, 0.4), 0 0 40px rgba(139, 69, 19, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.3)',

    // 按钮颜色 - active状态
    btnActiveTransform: 'translateY(-1px) scale(1.02)',
    btnActiveShadow: '0 0 10px rgba(139, 69, 19, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.5)',

    // 按钮动画
    btnTransition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    // 小按钮（zoom-btn样式）
    btnSmSize: '24px',
    btnSmBorderWidth: '1.5px',
    btnSmBorderRadius: '4px',
    btnSmFontSize: '16px'
  },

  darkInk: {
    name: '暗夜水墨',

    // 主色系
    primary: '#d4a574',
    secondary: '#c9a876',
    background: '#1a1a1a',
    panel: '#2a2a2a',

    // 文字颜色
    text: '#e0e0e0',
    textDim: 'rgba(224, 224, 224, 0.6)',

    // 边框和装饰
    border: '#d4a574',
    glow: 'rgba(212, 165, 116, 0.4)',

    // 功能色 - 状态栏
    hpBar: '#ff6b6b',
    mpBar: '#6ba3ff',
    expBar: '#ffd700',

    // 功能色 - 语义化
    success: '#859900',
    warning: '#b58900',
    info: '#268bd2',
    danger: '#dc322f',

    // 交互状态
    hover: 'rgba(212, 165, 116, 0.2)',
    active: 'rgba(212, 165, 116, 0.4)',
    disabled: 'rgba(224, 224, 224, 0.3)',
    focus: 'rgba(212, 165, 116, 0.6)',

    // 消息类型色
    msgSystem: '#d4a574',
    msgNarrative: '#c0c0c0',
    msgDescription: '#a0a0a0',
    msgCommand: '#90ee90',
    msgResponse: '#e0e0e0',
    msgCombat: '#ff6b6b',
    msgAction: '#ffa500',
    msgHelp: '#ba55d3',
    msgError: '#ff4444',

    // 布局变量
    borderRadius: '4px',
    shadowLight: '0 2px 8px rgba(0, 0, 0, 0.4)',
    shadowMedium: '0 4px 16px rgba(0, 0, 0, 0.5)',
    shadowHeavy: '0 8px 24px rgba(0, 0, 0, 0.6)',

    // 过渡动画
    transitionSpeed: '0.3s',
    transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // ==================== 按钮系统 ====================
    // 按钮尺寸（与水墨丹青一致）
    btnBorderWidth: '2px',
    btnBorderRadius: '8px',
    btnFontSize: '13px',
    btnFontWeight: 'bold',
    btnPaddingY: '8px',
    btnPaddingX: '16px',
    btnMinWidth: '85px',
    btnLetterSpacing: '2px',

    // 按钮颜色 - 默认状态（适配深色背景）
    btnBg: 'rgba(42, 42, 42, 0.95)',
    btnBorder: '#d4a574',
    btnText: '#d4a574',
    btnTextShadow: '0 0 8px rgba(212, 165, 116, 0.4)',
    btnBoxShadow: '0 0 10px rgba(212, 165, 116, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.5)',

    // 按钮颜色 - hover状态
    btnHoverBg: '#d4a574',
    btnHoverBorder: '#c9a876',
    btnHoverText: '#1a1a1a',
    btnHoverTransform: 'translateY(-3px) scale(1.08)',
    btnHoverShadow: '0 0 20px rgba(212, 165, 116, 0.5), 0 0 40px rgba(212, 165, 116, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.2)',

    // 按钮颜色 - active状态
    btnActiveTransform: 'translateY(-1px) scale(1.02)',
    btnActiveShadow: '0 0 10px rgba(212, 165, 116, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.7)',

    // 按钮动画
    btnTransition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    // 小按钮（zoom-btn样式）
    btnSmSize: '24px',
    btnSmBorderWidth: '1.5px',
    btnSmBorderRadius: '4px',
    btnSmFontSize: '16px'
  }
}

// ==================== 主题验证 ====================
/**
 * 验证主题对象是否包含所有必需变量
 */
export function validateTheme(theme: any): { valid: boolean; missing: string[]; extra: string[] } {
  const schemaKeys = Object.keys(themeSchema)
  const themeKeys = Object.keys(theme)

  const missing = schemaKeys.filter(key => !themeKeys.includes(key))
  const extra = themeKeys.filter(key => !schemaKeys.includes(key))

  return {
    valid: missing.length === 0,
    missing,
    extra
  }
}

// ==================== 主题应用 ====================
/**
 * 应用主题到页面
 */
export function applyTheme(themeOrName: string | any): boolean {
  let theme: any
  let themeName: string

  // 判断参数是主题名还是主题对象
  if (typeof themeOrName === 'string') {
    themeName = themeOrName
    theme = (themes as any)[themeName] || themes.inkPainting
  } else if (typeof themeOrName === 'object') {
    theme = themeOrName
    themeName = theme.name || 'custom'

    // 验证自定义主题
    const validation = validateTheme(theme)
    if (!validation.valid) {
      console.error('自定义主题验证失败:', validation)
      console.warn('缺失变量:', validation.missing)
      return false
    }
  } else {
    return false
  }

  const root = document.documentElement

  // 设置CSS变量
  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'name') {
      root.style.setProperty(`--${key}`, value as string)
    }
  })

  // 设置body的data-theme属性，用于主题特定的CSS选择器
  document.body.setAttribute('data-theme', themeName)

  // 保存主题选择（只保存预设主题名）
  if (typeof themeOrName === 'string') {
    localStorage.setItem('mudTheme', themeName)
  }

  return true
}

/**
 * 获取当前主题名
 */
export function getCurrentTheme(): string {
  return localStorage.getItem('mudTheme') || 'inkPainting'
}

/**
 * 获取所有主题名列表
 */
export function getThemeNames(): string[] {
  return Object.keys(themes)
}
