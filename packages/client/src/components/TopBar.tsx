import { useTheme } from '../contexts/ThemeContext'
import { useAuthStore } from '@features/auth/authStore'
import './TopBar.css'

interface TopBarProps {
  已连接: boolean
  服务器地址: string
  连接服务器: () => void
  断开连接: () => void
  显示登录界面?: () => void
  显示设置界面?: () => void
}

function TopBar({ 已连接, 服务器地址, 连接服务器, 断开连接, 显示登录界面, 显示设置界面 }: TopBarProps) {
  const { theme, nextTheme, availableThemes } = useTheme()
  const { isAuthenticated, userInfo, 登出 } = useAuthStore()

  const handleLogout = () => {
    // 只清除自动登录状态，保留记住的密码
    try {
      const saved = localStorage.getItem('saved_credentials')
      if (saved) {
        const decoded = atob(saved)
        const credentials = JSON.parse(decoded)

        // 如果原本有记住密码，保留用户名和密码，但取消自动登录
        if (credentials.username && credentials.password) {
          const newCredentials = {
            username: credentials.username,
            password: credentials.password,
            autoLogin: false  // 取消自动登录
          }
          const encoded = btoa(JSON.stringify(newCredentials))
          localStorage.setItem('saved_credentials', encoded)
        } else {
          // 如果没有记住密码，直接清除
          localStorage.removeItem('saved_credentials')
        }
      }
    } catch (error) {
      console.error('处理登出凭证失败:', error)
      localStorage.removeItem('saved_credentials')
    }

    // 执行登出
    登出()

    // 断开服务器连接
    if (已连接) {
      断开连接()
    }
  }

  return (
    <div className="top-bar">
      {/* 左侧：连接状态和服务器信息 */}
      <div className="server-info-left">
        <span className={`status-dot ${已连接 ? 'connected' : 'disconnected'}`}></span>
        <span className="status-text">
          {已连接 ? '已连接' : '未连接'}
        </span>
        <span className="server-label">服务器:</span>
        <span className="server-url">{服务器地址 || 'localhost:3000'}</span>
      </div>

      {/* 中间：玩家信息 */}
      <div className="player-info-center">
        <span className="player-label">玩家:</span>
        <span className="player-name">
          {isAuthenticated && userInfo
            ? `${userInfo.displayName} (${userInfo.username})`
            : '账号未登录'}
        </span>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="top-bar-actions">
        {!isAuthenticated && 显示登录界面 && (
          <button
            className="login-button"
            onClick={显示登录界面}
            title="账号登录"
          >
            [账号登录]
          </button>
        )}
        <button
          className="theme-button"
          onClick={nextTheme}
          title={`切换主题 (共${availableThemes.length}个)`}
        >
          {theme.name}
        </button>
        {显示设置界面 && (
          <button
            className="settings-button"
            onClick={显示设置界面}
            title="系统设置"
          >
            [设置]
          </button>
        )}
        <button
          className="disconnect-button"
          onClick={已连接 ? 断开连接 : 连接服务器}
        >
          {已连接 ? '[断开连接]' : '[连接服务器]'}
        </button>
        {isAuthenticated && (
          <button
            className="logout-button"
            onClick={handleLogout}
            title="登出账号"
          >
            [登出]
          </button>
        )}
      </div>
    </div>
  )
}

export default TopBar
