/**
 * 通用窗口模板组件
 * 1:1复刻设置窗口的完整布局和视觉风格
 *
 * 使用方法：
 * <WindowTemplate
 *   title="窗口标题"
 *   subtitle="副标题"
 *   onClose={handleClose}
 * >
 *   {/* 你的内容 *\/}
 * </WindowTemplate>
 */

import { useState, useEffect, ReactNode } from 'react'
import './WindowTemplate.css'

export interface WindowTemplateProps {
  /** 窗口主标题 */
  title: string
  /** 窗口副标题（可选） */
  subtitle?: string
  /** 关闭回调 */
  onClose: () => void
  /** 窗口内容 */
  children: ReactNode
  /** 底部提示信息（左侧） */
  footerHintLeft?: string
  /** 底部提示信息（右侧） */
  footerHintRight?: string
  /** 底部提示图标（左侧） */
  footerIconLeft?: string
  /** 底部提示图标（右侧） */
  footerIconRight?: string
  /** 是否显示左右装饰列（默认true） */
  showDecorations?: boolean
  /** 自定义类名 */
  className?: string
}

export function WindowTemplate({
  title,
  subtitle,
  onClose,
  children,
  footerHintLeft = 'ESC 或 点击空白处关闭',
  footerHintRight = '按需修改此提示文字',
  footerIconLeft = '💡',
  footerIconRight = '📝',
  showDecorations = true,
  className = ''
}: WindowTemplateProps) {
  const [正在关闭, 设置正在关闭] = useState(false)

  // 处理关闭动画
  const 执行关闭 = () => {
    设置正在关闭(true)
    setTimeout(() => {
      onClose()
    }, 100)
  }

  // ESC键关闭窗口
  useEffect(() => {
    const 处理按键 = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        执行关闭()
      }
    }
    window.addEventListener('keydown', 处理按键)
    return () => {
      window.removeEventListener('keydown', 处理按键)
    }
  }, [])

  // 处理遮罩点击
  const 处理遮罩点击 = () => {
    执行关闭()
  }

  return (
    <div className={`window-template-overlay ${正在关闭 ? 'closing' : ''}`} onClick={处理遮罩点击}>
      <div
        className={`window-template-container seal-border-style ${正在关闭 ? 'closing' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========== 顶部装饰带 ========== */}
        <div className="seal-header-band">
          <div className="header-decoration-left">
            <span className="deco-line">━━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━</span>
          </div>
          <div className="seal-title-center">
            <h2 className="seal-main-title">{title}</h2>
            {subtitle && (
              <p className="seal-subtitle">
                <span className="location-label">{subtitle}</span>
              </p>
            )}
          </div>
          <div className="header-decoration-right">
            <span className="deco-line">━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━━</span>
          </div>
        </div>

        {/* ========== 中间主体区域 ========== */}
        <div className="seal-main-body">
          {/* 左侧装饰列 */}
          {showDecorations && (
            <div className="seal-left-column">
              <div className="column-ornament">☁</div>
              <div className="column-ornament">❋</div>
              <div className="column-ornament">✿</div>
              <div className="column-ornament">❂</div>
              <div className="column-ornament">✾</div>
              <div className="column-ornament">❀</div>
              <div className="column-ornament">✺</div>
              <div className="column-ornament">❃</div>
              <div className="column-ornament">☯</div>
            </div>
          )}

          {/* 中间内容容器 */}
          <div className="seal-map-container">
            <div className="seal-map-content window-content">
              {children}
            </div>
          </div>

          {/* 右侧装饰列 */}
          {showDecorations && (
            <div className="seal-right-column">
              <div className="column-ornament">☁</div>
              <div className="column-ornament">❋</div>
              <div className="column-ornament">✿</div>
              <div className="column-ornament">❂</div>
              <div className="column-ornament">✾</div>
              <div className="column-ornament">❀</div>
              <div className="column-ornament">✺</div>
              <div className="column-ornament">❃</div>
              <div className="column-ornament">☯</div>
            </div>
          )}
        </div>

        {/* ========== 底部装饰带 ========== */}
        <div className="seal-footer-band">
          <div className="footer-ornament-left">
            <span className="ornament-symbol">◢</span>
            <span className="ornament-symbol">◣</span>
          </div>
          <div className="seal-info-center">
            <div className="info-item hint-item">
              <span className="info-icon">{footerIconLeft}</span>
              <span className="info-text">{footerHintLeft}</span>
            </div>
            <div className="info-divider">|</div>
            <div className="info-item hint-item">
              <span className="info-icon">{footerIconRight}</span>
              <span className="info-text">{footerHintRight}</span>
            </div>
          </div>
          <div className="footer-ornament-right">
            <span className="ornament-symbol">◢</span>
            <span className="ornament-symbol">◣</span>
          </div>
        </div>
      </div>
    </div>
  )
}
