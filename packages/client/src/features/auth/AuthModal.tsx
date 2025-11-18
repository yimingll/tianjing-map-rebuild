/**
 * 增强版认证模态框组件
 * 包含所有完善功能
 */

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from './authStore';
import { 认证客户端实例 } from './authClient';
import './AuthModal.css';

interface AuthModalProps {
  onSuccess: () => void;
  onClose?: () => void;
  已连接: boolean;
  连接服务器: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export function AuthModal({ onSuccess, onClose, 已连接, 连接服务器 }: AuthModalProps) {
  // 使用 Zustand store
  const { 登录, 注册 } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState(''); // 中文名字
  const [captcha, setCaptcha] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [等待连接后登录, 设置等待连接后登录] = useState(false);
  const [保存的表单数据, 设置保存的表单数据] = useState<{
    mode: AuthMode;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    displayName: string; // 中文名字
    captchaAnswer: string;
    rememberPassword?: boolean;
    autoLogin?: boolean;
  } | null>(null);

  // Refs
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // 生成简单的数学验证码
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptcha(`${num1} + ${num2} = ?`);
    setCaptchaAnswer(answer.toString());
  };

  // 加载已保存的密码和自动登录状态
  useEffect(() => {
    // 使用 setTimeout 确保在下一个事件循环中加载，避免与登出操作冲突
    const loadTimer = setTimeout(() => {
      console.log('AuthModal 挂载，开始加载保存的凭据...');
      try {
        const saved = localStorage.getItem('saved_credentials');
        console.log('saved_credentials:', saved ? '存在' : '不存在');

        if (saved) {
          const decoded = atob(saved);
          const credentials = JSON.parse(decoded);
          console.log('加载的凭据:', {
            username: credentials.username,
            hasPassword: !!credentials.password,
            autoLogin: credentials.autoLogin
          });

          // 批量更新状态
          setUsername(credentials.username || '');
          setPassword(credentials.password || '');
          setRememberPassword(true);
          // 恢复自动登录状态（如果存在）
          if (credentials.autoLogin !== undefined) {
            setAutoLogin(credentials.autoLogin);
          }
          // 如果没有 autoLogin 字段，保持默认的 true
        } else {
          console.log('没有保存的凭据，使用默认设置（默认勾选记住密码和自动登录）');
          // 没有保存的凭据时，保持默认的勾选状态（true）
          // 不需要手动设置，因为 useState 的初始值已经是 true
        }
      } catch (error) {
        console.error('加载已保存密码失败:', error);
        // 出错时清空表单，但保持默认勾选状态
        setUsername('');
        setPassword('');
        // 保持默认的 true 状态，不需要显式设置
      }
    }, 10); // 10ms 延迟，确保在下一个事件循环

    generateCaptcha();

    // 清理函数
    return () => {
      clearTimeout(loadTimer);
    };
  }, []);

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, loading]);

  // 自动聚焦
  useEffect(() => {
    setTimeout(() => {
      if (mode === 'login' || mode === 'register') {
        usernameInputRef.current?.focus();
      }
    }, 100);
  }, [mode]);

  // 监听连接状态，连接成功后自动执行登录
  useEffect(() => {
    // 只有在明确设置了等待连接后登录标志时才自动执行
    if (已连接 && 等待连接后登录 && 保存的表单数据) {
      console.log('连接成功，自动执行登录流程:', 保存的表单数据);
      设置等待连接后登录(false);
      setError('');
      setSuccess('已连接到服务器，正在登录...');

      // 延迟一小段时间让用户看到连接成功的提示
      setTimeout(() => {
        // 自动执行登录流程
        executeAuth(保存的表单数据);
      }, 300);
    }
  }, [已连接, 等待连接后登录, 保存的表单数据]);

  // 提取实际的认证逻辑
  const executeAuth = async (formData: {
    mode: AuthMode;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    displayName: string; // 中文名字
    captchaAnswer: string;
    rememberPassword?: boolean;
    autoLogin?: boolean;
  }) => {
    setLoading(true);

    try {
      let response;

      if (formData.mode === 'login') {
        // 使用传入的 rememberPassword，如果没有则使用当前状态
        const shouldRemember = formData.rememberPassword !== undefined ? formData.rememberPassword : rememberPassword;
        // 使用 store 的登录方法，会自动更新状态
        response = await 登录(formData.username, formData.password, shouldRemember);

        if (response.success) {
          // 如果用户没有勾选"记住密码"，清除已保存的凭据
          if (!shouldRemember) {
            localStorage.removeItem('saved_credentials');
            console.log('用户取消勾选"记住密码"，已清除保存的凭据');
          } else {
            // 保存自动登录标记（无论是否勾选都要保存，以便下次加载时能正确恢复状态）
            const shouldAutoLogin = formData.autoLogin !== undefined ? formData.autoLogin : autoLogin;
            try {
              const saved = localStorage.getItem('saved_credentials');
              if (saved) {
                const decoded = atob(saved);
                const credentials = JSON.parse(decoded);
                credentials.autoLogin = shouldAutoLogin;
                const encoded = btoa(JSON.stringify(credentials));
                localStorage.setItem('saved_credentials', encoded);
                console.log(`已保存自动登录标记: ${shouldAutoLogin}`);
              }
            } catch (error) {
              console.error('保存自动登录标记失败:', error);
            }
          }
        }
      } else if (formData.mode === 'register') {
        // 使用 store 的注册方法，会自动更新状态（传入中文名字）
        response = await 注册(formData.username, formData.password, formData.email, formData.displayName);

        // 注册成功后，自动保存新账号的密码信息（默认勾选记住密码和自动登录）
        if (response.success) {
          认证客户端实例.保存密码(formData.username, formData.password);

          // 保存自动登录标记（使用当前复选框状态，默认为 true）
          try {
            const saved = localStorage.getItem('saved_credentials');
            if (saved) {
              const decoded = atob(saved);
              const credentials = JSON.parse(decoded);
              credentials.autoLogin = autoLogin;
              const encoded = btoa(JSON.stringify(credentials));
              localStorage.setItem('saved_credentials', encoded);
              console.log(`注册成功后已保存自动登录标记: ${autoLogin}`);
            }
          } catch (error) {
            console.error('保存自动登录标记失败:', error);
          }
        }
      } else {
        // 忘记密码逻辑（暂时模拟）
        setSuccess('密码重置链接已发送到您的邮箱');
        setLoading(false);
        setTimeout(() => {
          setMode('login');
        }, 2000);
        return;
      }

      if (response.success) {
        setSuccess(formData.mode === 'login' ? '登录成功！' : '注册成功！');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(response.message);
        if (formData.mode === 'register') {
          generateCaptcha();
        }
      }
    } catch (err) {
      setError('操作失败，请稍后重试');
      if (formData.mode === 'register') {
        generateCaptcha();
      }
    } finally {
      setLoading(false);
      设置保存的表单数据(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 如果正在加载中，防止重复提交
    if (loading) {
      console.log('正在处理中，请稍候...');
      return;
    }

    // 如果正在等待连接后登录，不处理新的提交
    if (等待连接后登录) {
      console.log('正在等待连接，请稍候...');
      setError('正在连接服务器，请稍候...');
      return;
    }

    // 验证码检查（仅注册时）
    if (mode === 'register') {
      // 用户名格式验证
      const usernameRegex = /^[a-zA-Z0-9]{6,12}$/;
      if (!usernameRegex.test(username)) {
        setError('账号必须是6-12位英文字母和数字的组合');
        return;
      }

      const userCaptcha = (e.currentTarget as any).captcha_input?.value;
      if (userCaptcha !== captchaAnswer) {
        setError('验证码错误，请重新计算');
        generateCaptcha();
        return;
      }

      // 确认密码检查
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      // 中文名字验证
      const chineseNameRegex = /^[\u4e00-\u9fa5]{2,6}$/;
      if (!displayName) {
        setError('请输入中文名字');
        return;
      }
      if (!chineseNameRegex.test(displayName)) {
        setError('中文名字必须是2-6个纯中文字符');
        return;
      }
    }

    // 检查服务器连接状态
    if (!已连接) {
      // 保存表单数据（包括复选框状态和中文名字）
      设置保存的表单数据({
        mode,
        username,
        password,
        confirmPassword,
        email,
        displayName,
        captchaAnswer,
        rememberPassword,
        autoLogin
      });
      设置等待连接后登录(true);
      setLoading(true); // 设置加载状态，禁用按钮
      setSuccess('正在连接服务器...');
      连接服务器();
      return;
    }

    // 直接执行认证
    await executeAuth({
      mode,
      username,
      password,
      confirmPassword,
      email,
      displayName,
      captchaAnswer,
      rememberPassword,
      autoLogin
    });
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setDisplayName(''); // 清空中文名字
    if (newMode === 'register') {
      generateCaptcha();
    }
  };

  const handleClose = () => {
    if (!onClose) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.dataset.mousedownOnOverlay = 'true';
    } else {
      e.currentTarget.dataset.mousedownOnOverlay = 'false';
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const mousedownOnOverlay = e.currentTarget.dataset.mousedownOnOverlay === 'true';
    const mouseupOnOverlay = e.target === e.currentTarget;

    if (mousedownOnOverlay && mouseupOnOverlay && onClose) {
      handleClose();
    }

    delete e.currentTarget.dataset.mousedownOnOverlay;
  };

  return (
    <div
      className={`auth-modal-overlay ${isClosing ? 'closing' : ''}`}
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className={`auth-modal ${isClosing ? 'closing' : ''}`}>
        {/* 关闭按钮 */}
        {onClose && (
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
            title="关闭 (ESC)"
            type="button"
          >
            ✕
          </button>
        )}

        <div className="auth-modal-header">
          <h2>
            {mode === 'login' && '登录'}
            {mode === 'register' && '注册'}
            {mode === 'forgot-password' && '忘记密码'}
          </h2>
          <div className="auth-modal-subtitle">
            修仙MUD游戏
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* 用户名/账号 */}
          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <label htmlFor="username">{mode === 'register' ? '账号（即角色ID）' : '账号'}</label>
              <input
                ref={usernameInputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'register' ? '6-12位英文+数字' : '请输入账号'}
                maxLength={12}
                required
                disabled={loading}
                autoComplete="username"
                tabIndex={1}
              />
              {mode === 'register' && (
                <div className="form-hint">6-12位英文字母+数字，注册后将作为游戏角色ID</div>
              )}
            </div>
          )}

          {/* 邮箱（忘记密码） */}
          {mode === 'forgot-password' && (
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入注册时的邮箱"
                required
                disabled={loading}
                autoComplete="email"
                tabIndex={1}
              />
            </div>
          )}

          {/* 密码 */}
          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  minLength={6}
                  required
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  tabIndex={2}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  title={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {mode === 'register' && (
                <div className="form-hint">至少6个字符</div>
              )}
            </div>
          )}

          {/* 确认密码（注册） */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  minLength={6}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  tabIndex={3}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  title={showConfirmPassword ? '隐藏密码' : '显示密码'}
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          {/* 中文名字（注册-必填） */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="displayName">中文名字</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="请输入中文名字"
                maxLength={6}
                required
                disabled={loading}
                autoComplete="off"
                tabIndex={4}
              />
              <div className="form-hint">2-6个中文字符，将作为游戏内显示名称</div>
            </div>
          )}

          {/* 邮箱（注册-可选） */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="register-email">邮箱（可选）</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                disabled={loading}
                autoComplete="email"
                tabIndex={5}
              />
            </div>
          )}

          {/* 验证码（注册） */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="captcha">验证码</label>
              <div className="captcha-wrapper">
                <span className="captcha-question">{captcha}</span>
                <input
                  id="captcha"
                  name="captcha_input"
                  type="text"
                  placeholder="请输入答案"
                  required
                  disabled={loading}
                  autoComplete="off"
                  tabIndex={6}
                  className="captcha-input"
                />
              </div>
            </div>
          )}

          {/* 记住密码（登录） */}
          {mode === 'login' && (
            <div className="form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  disabled={loading}
                  tabIndex={3}
                />
                <span>记住密码</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  disabled={loading}
                  tabIndex={4}
                />
                <span>自动登录（7天）</span>
              </label>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="success-message">
              ✓ {success}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            className={`submit-button ${loading ? 'loading' : ''}`}
            disabled={loading}
            tabIndex={mode === 'register' ? 7 : 5}
          >
            {loading && <span className="spinner"></span>}
            {loading ? '处理中...' : (
              mode === 'login' ? '登录' :
              mode === 'register' ? '注册' : '发送重置链接'
            )}
          </button>

          {/* 切换模式 */}
          <div className="switch-mode">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="switch-mode-button"
                  disabled={loading}
                  tabIndex={7}
                >
                  还没有账号？立即注册（注册即创建角色）
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="switch-mode-button"
                  disabled={loading}
                  tabIndex={8}
                >
                  忘记密码？
                </button>
              </>
            )}
            {(mode === 'register' || mode === 'forgot-password') && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="switch-mode-button"
                disabled={loading}
                tabIndex={9}
              >
                已有账号？返回登录
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
