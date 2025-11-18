/**
 * MUD颜色标记解析工具
 * 支持类似 <red>文字</red> 的颜色标记
 * 颜色配置从 shared/colors.json 动态加载
 */

import colorsConfig from '../../../shared/colors.json'

// 从配置文件构建颜色映射表
function buildColorMap(): Record<string, string> {
  const colorMap: Record<string, string> = {}

  // 遍历所有颜色分类
  Object.values(colorsConfig.colors).forEach(category => {
    Object.values(category).forEach(color => {
      colorMap[color.code] = color.hex
    })
  })

  // 添加中文别名
  Object.entries(colorsConfig.aliases).forEach(([alias, code]) => {
    const hexColor = colorMap[code]
    if (hexColor) {
      colorMap[alias] = hexColor
    }
  })

  return colorMap
}

// 颜色映射表（自动从配置生成）
export const 颜色映射: Record<string, string> = buildColorMap()

/**
 * 解析带颜色标记的文本
 * @param text 原始文本，包含颜色标记
 * @returns 解析后的React元素数组
 */
export function 解析颜色文本(text: string): Array<{ text: string; color?: string }> {
  const result: Array<{ text: string; color?: string }> = []

  // 支持两种格式:
  // 1. <color:#RRGGBB>文本</color> - 直接指定16进制颜色
  // 2. <颜色名>文本</颜色名> - 使用预定义颜色名
  // 注意: 保留非颜色标签(如 <exit:north>)以支持点击等交互功能
  const regexInlineColor = /<color:(#[0-9A-Fa-f]{6})>(.*?)<\/color>/gs
  const regexNamedColor = /<([^:>\s]+)>(.*?)<\/\1>/gs

  // 先处理内联颜色格式 <color:#RRGGBB>
  const inlineMatches: Array<{ start: number; end: number; text: string; color: string }> = []

  let match: RegExpExecArray | null
  regexInlineColor.lastIndex = 0
  while ((match = regexInlineColor.exec(text)) !== null) {
    inlineMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[2], // 保留内部的所有内容，包括其他标签
      color: match[1]
    })
  }

  // 再处理命名颜色格式 <colorName>（只处理不在内联颜色范围内的）
  const namedMatches: Array<{ start: number; end: number; text: string; color?: string; original: string }> = []
  regexNamedColor.lastIndex = 0
  while ((match = regexNamedColor.exec(text)) !== null) {
    const colorName = match[1]
    const colorText = match[2]

    // 跳过已经被内联颜色处理的部分
    const isInInlineRange = inlineMatches.some(im =>
      match!.index >= im.start && match!.index < im.end
    )
    if (isInInlineRange) continue

    const color = 颜色映射[colorName] || 颜色映射[colorName.toLowerCase()]
    namedMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: colorText,
      color: color,
      original: match[0]
    })
  }

  // 合并所有匹配并排序
  const allMatches = [
    ...inlineMatches.map(m => ({ ...m, type: 'inline' as const })),
    ...namedMatches.map(m => ({ ...m, type: 'named' as const }))
  ].sort((a, b) => a.start - b.start)

  // 构建结果
  let lastIndex = 0
  for (const match of allMatches) {
    // 添加标记前的普通文本
    if (match.start > lastIndex) {
      result.push({
        text: text.substring(lastIndex, match.start)
      })
    }

    // 添加带颜色的文本（保留内部的非颜色标签）
    if (match.type === 'inline' || match.color) {
      result.push({
        text: match.text, // 这里的text包含了内部的所有HTML标签
        color: match.color
      })
    } else {
      // 如果是命名颜色但找不到定义，保留原始标记
      result.push({
        text: (match as any).original
      })
    }

    lastIndex = match.end
  }

  // 添加剩余的普通文本
  if (lastIndex < text.length) {
    result.push({
      text: text.substring(lastIndex)
    })
  }

  return result
}

/**
 * 检查文本是否包含颜色标记
 */
export function 包含颜色标记(text: string): boolean {
  // 检查是否包含内联颜色 <color:#RRGGBB> 或命名颜色 <colorName>
  return /<color:#[0-9A-Fa-f]{6}>/.test(text) || /<([^:>\s]+)>.*?<\/\1>/.test(text)
}

/**
 * 移除所有颜色标记，返回纯文本
 */
export function 移除颜色标记(text: string): string {
  // 移除内联颜色 <color:#RRGGBB>
  let result = text.replace(/<color:#[0-9A-Fa-f]{6}>(.*?)<\/color>/g, '$1')
  // 移除命名颜色 <colorName> (排除包含冒号的标记如 <exit:north>)
  result = result.replace(/<([^:>\s]+)>(.*?)<\/\1>/g, '$2')
  return result
}
