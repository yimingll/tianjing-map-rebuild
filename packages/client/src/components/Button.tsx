/**
 * MUD游戏统一按钮组件
 * 基于统一按钮系统构建，样式自动跟随主题
 */

import React from 'react'
import '../styles/buttons.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'info'
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'circle'
  /** 图标（在文字前面显示） */
  icon?: React.ReactNode
  /** 子元素 */
  children?: React.ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 统一按钮组件
 *
 * @example
 * // 普通按钮
 * <Button>点击我</Button>
 *
 * @example
 * // 带图标的按钮
 * <Button icon="✓">保存</Button>
 *
 * @example
 * // 主要按钮
 * <Button variant="primary" icon="✓">保存设置</Button>
 *
 * @example
 * // 圆形按钮
 * <Button size="circle">↺</Button>
 *
 * @example
 * // 小按钮
 * <Button size="sm">-</Button>
 */
export function Button({
  variant = 'default',
  size = 'default',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  // 构建类名
  const classes = [
    'mud-btn',
    variant !== 'default' && `mud-btn-${variant}`,
    size !== 'default' && `mud-btn-${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {icon && <span className="mud-btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

// 导出按钮组 - 便于布局多个按钮
export interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`mud-btn-group ${className}`}>
      {children}
    </div>
  )
}
