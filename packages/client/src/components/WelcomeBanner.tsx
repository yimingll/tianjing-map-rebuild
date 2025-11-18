import React from 'react'
import './WelcomeBanner.css'

interface WelcomeBannerProps {
  onlinePlayers?: number
  version?: string
  serverStatus?: string
  lastUpdate?: string
}

/**
 * 欢迎界面 - 玄鉴仙录 MUD
 * 使用 HTML/CSS 渲染，完美对齐
 */
export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onlinePlayers = 0,
  version = '玄鉴初启 5.0.1',
  serverStatus = '稳定',
  lastUpdate = '炼丹系统已开放',
}) => {
  return (
    <div className="welcome-banner">
      {/* 主标题区 */}
      <div className="welcome-header">
        <div className="header-border-top"></div>

        <div className="header-content">
          <div className="title-frame">
            <div className="frame-left">
              <span className="star-icon">✦</span>
            </div>

            <div className="title-center">
              <div className="title-main">X I U X I A N    M U D</div>
              <div className="title-divider"></div>
              <div className="title-chinese">《 玄 鉴 仙 录 》</div>
              <div className="title-divider"></div>
              <div className="title-english">Xuanjian Chronicles of Immortals</div>
            </div>

            <div className="frame-right">
              <span className="star-icon">✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* 口号区 */}
      <div className="welcome-slogan">
        <div className="slogan-divider">
          <span className="flower-icon">✿</span>
          <span className="wave-line">～～～～～～～～～～～～～～～～～～～～～～</span>
          <span className="flower-icon">✿</span>
        </div>

        <div className="slogan-text">
          <div>"以玄鉴之眼，观万世沉浮"</div>
          <div>"以仙录之笔，书千秋传奇"</div>
        </div>

        <div className="slogan-divider">
          <span className="flower-icon">✿</span>
          <span className="wave-line">～～～～～～～～～～～～～～～～～～～～～～</span>
          <span className="flower-icon">✿</span>
        </div>
      </div>

      {/* 卷首语 */}
      <div className="welcome-section">
        <div className="section-box">
          <div className="section-title">【卷首语】</div>
          <div className="section-content section-content-centered">
            <p>天地初开，鸿蒙未判，上古仙人炼制玄鉴宝镜，</p>
            <p>可照真伪，辨善恶，察天机，悟大道。</p>
            <p></p>
            <p>岁月流转，灵气复苏，修真盛世再临人间。</p>
            <p>无数修士踏上求道之路，于这仙录之中留名。</p>
          </div>
        </div>
      </div>

      {/* 仙界实时 */}
      <div className="welcome-section">
        <div className="section-box">
          <div className="section-header">
            <span className="star-icon-small">✦</span>
            <span>仙界实时</span>
            <span className="star-icon-small">✦</span>
          </div>
          <div className="stats-content">
            <div className="stats-row">
              <span className="stats-label">在线修士:</span>
              <span className="stats-value">{onlinePlayers} 人</span>
              <span className="stats-label">版本:</span>
              <span className="stats-value">{version}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">灵气浓度:</span>
              <span className="stats-value">充沛</span>
              <span className="stats-label">运行状态:</span>
              <span className="stats-value">{serverStatus}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">今日天象:</span>
              <span className="stats-value">紫气东来</span>
              <span className="stats-label">更新:</span>
              <span className="stats-value">{lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部名言 */}
      <div className="welcome-quote">
        "一卷仙录，记载千秋功过；一面玄鉴，映照万世真相。"
      </div>
    </div>
  )
}

export default WelcomeBanner
