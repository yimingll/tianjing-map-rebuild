/**
 * 地图风格设置窗口
 * 完全1:1复刻地图窗口的视觉样式，提供字体大小和动画时长设置
 */

import { useState, useEffect } from 'react'
import './MapStyleSettings.css'

interface MapStyleSettingsProps {
  关闭: () => void
}

// 设置接口
interface Settings {
  fontSize: number
  animationDuration: number
}

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  fontSize: 14,
  animationDuration: 100,
}

// 从 localStorage 读取设置
const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem('gameSettings')
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
  return DEFAULT_SETTINGS
}

// 保存设置到 localStorage
const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem('gameSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 应用字体大小到页面
const applyFontSize = (size: number) => {
  document.documentElement.style.setProperty('--base-font-size', `${size}px`)
}

// 应用动画时长到页面
const applyAnimationDuration = (duration: number) => {
  document.documentElement.style.setProperty('--animation-duration', `${duration}ms`)
}

export function MapStyleSettings({ 关闭 }: MapStyleSettingsProps) {
  const [正在关闭, 设置正在关闭] = useState(false)
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // 处理关闭动画
  const 执行关闭 = () => {
    设置正在关闭(true)
    setTimeout(() => {
      关闭()
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

  // 字体大小改变 - 只更新state，不立即应用
  const handleFontSizeChange = (size: number) => {
    const newSettings = { ...settings, fontSize: size }
    setSettings(newSettings)
  }

  // 动画时长改变 - 只更新state，不立即应用
  const handleAnimationDurationChange = (duration: number) => {
    const newSettings = { ...settings, animationDuration: duration }
    setSettings(newSettings)
  }

  // 恢复默认 - 只更新state，不立即应用
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  // 保存设置 - 保存时才应用设置
  const handleSave = () => {
    saveSettings(settings)
    applyFontSize(settings.fontSize)
    applyAnimationDuration(settings.animationDuration)
    执行关闭()
  }

  return (
    <div className={`region-map-overlay ${正在关闭 ? 'closing' : ''}`} onClick={处理遮罩点击}>
      <div className={`region-map-container seal-border-style ${正在关闭 ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* 顶部装饰带 - 印章风格 */}
        <div className="seal-header-band">
          <div className="header-decoration-left">
            <span className="deco-line">━━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━</span>
          </div>
          <div className="seal-title-center">
            <h2 className="seal-main-title">【玄鉴仙录·系统设置】</h2>
            <p className="seal-subtitle">
              <span className="location-label">配置中心</span>
              <span className="location-divider">●</span>
              <span className="location-name">参数调整</span>
            </p>
          </div>
          <div className="header-decoration-right">
            <span className="deco-line">━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━━</span>
          </div>
        </div>

        {/* 中间主体区域 - 左装饰列 + 内容 + 右装饰列 */}
        <div className="seal-main-body">
          {/* 左侧装饰列 */}
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

          {/* 中间内容容器 */}
          <div className="seal-map-container">
            {/* 内容区域 */}
            <div className="seal-map-content layout-style">
              <div className="settings-content-wrapper">
                {/* 字体大小设置 */}
                <div className="setting-group">
                  <div className="setting-label">
                    <span className="label-icon">🔤</span>
                    <span className="label-text">字体大小</span>
                    <span className="label-value">{settings.fontSize}px</span>
                  </div>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="12"
                      max="20"
                      step="1"
                      value={settings.fontSize}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-marks">
                      <span>小</span>
                      <span>中</span>
                      <span>大</span>
                    </div>
                  </div>
                  <div className="setting-preview" style={{ fontSize: `${settings.fontSize}px` }}>
                    预览文字效果: 修仙MUD游戏
                  </div>
                </div>

                {/* 动画时长设置 */}
                <div className="setting-group">
                  <div className="setting-label">
                    <span className="label-icon">⚡</span>
                    <span className="label-text">动画速度</span>
                    <span className="label-value">{settings.animationDuration}ms</span>
                  </div>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="100"
                      max="300"
                      step="50"
                      value={settings.animationDuration}
                      onChange={(e) => handleAnimationDurationChange(Number(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-marks">
                      <span>快</span>
                      <span>标准</span>
                      <span>慢</span>
                    </div>
                  </div>
                  <div className="setting-hint">
                    窗口打开/关闭动画的持续时间
                  </div>
                </div>

                {/* 按钮区 */}
                <div className="setting-actions">
                  <button className="setting-btn reset-btn" onClick={handleReset} title="恢复默认设置">
                    <span className="btn-icon">↺</span>
                    恢复默认
                  </button>
                  <button className="setting-btn save-btn" onClick={handleSave} title="保存当前设置">
                    <span className="btn-icon">✓</span>
                    保存设置
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧装饰列 - 镜像对称 */}
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
        </div>

        {/* 底部装饰带 */}
        <div className="seal-footer-band">
          <div className="footer-ornament-left">
            <span className="ornament-symbol">◢</span>
            <span className="ornament-symbol">◣</span>
          </div>
          <div className="seal-info-center">
            <div className="info-item hint-item">
              <span className="info-icon">💡</span>
              <span className="info-text">ESC 或 点击空白处关闭</span>
            </div>
            <div className="info-divider">|</div>
            <div className="info-item hint-item">
              <span className="info-icon">📝</span>
              <span className="info-text">修改后需点击保存按钮</span>
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
