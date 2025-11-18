/**
 * 认证API客户端
 * 处理用户注册、登录和Token管理
 */

const API_BASE_URL = 'http://localhost:3000/api/auth';

// 请求和响应类型定义
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user_id?: number;
  username?: string;
  display_name?: string;
}

export interface UserInfo {
  userId: number;
  username: string;
  displayName: string;
  token: string;
}

export interface SavedCredentials {
  username: string;
  password: string;
}

/**
 * 认证客户端类
 */
export class 认证客户端 {
  private token: string | null = null;
  private userInfo: UserInfo | null = null;

  constructor() {
    // 从localStorage恢复Token和用户信息
    this.恢复会话();
  }

  /**
   * 用户注册
   */
  async 注册(username: string, password: string, email?: string, displayName?: string): Promise<AuthResponse> {
    try {
      console.log('发送注册请求到:', `${API_BASE_URL}/register`);
      console.log('请求数据:', { username, password: '***', email, display_name: displayName });

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, display_name: displayName }),
      });

      console.log('响应状态:', response.status, response.statusText);

      // 检查响应是否为JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('响应不是JSON格式:', contentType);
        const text = await response.text();
        console.error('响应内容:', text);
        return {
          success: false,
          message: '服务器响应格式错误',
        };
      }

      const data: AuthResponse = await response.json();
      console.log('注册响应:', data);

      if (data.success && data.token) {
        // 保存Token和用户信息
        this.保存会话({
          userId: data.user_id!,
          username: data.username!,
          displayName: data.display_name || data.username!,
          token: data.token,
        });
      }

      return data;
    } catch (error) {
      console.error('注册请求失败 - 详细错误:', error);
      console.error('错误类型:', error instanceof TypeError ? 'TypeError (网络错误)' : typeof error);
      console.error('错误信息:', error instanceof Error ? error.message : String(error));
      console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');

      return {
        success: false,
        message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 用户登录
   */
  async 登录(username: string, password: string, rememberPassword: boolean = false): Promise<AuthResponse> {
    try {
      console.log('发送登录请求到:', `${API_BASE_URL}/login`);
      console.log('请求数据:', { username, password: '***' });

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('响应状态:', response.status, response.statusText);

      // 检查响应是否为JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('响应不是JSON格式:', contentType);
        const text = await response.text();
        console.error('响应内容:', text);
        return {
          success: false,
          message: '服务器响应格式错误',
        };
      }

      const data: AuthResponse = await response.json();
      console.log('登录响应:', data);

      if (data.success && data.token) {
        // 保存Token和用户信息
        this.保存会话({
          userId: data.user_id!,
          username: data.username!,
          displayName: data.display_name || data.username!,
          token: data.token,
        });

        // 记住密码
        if (rememberPassword) {
          this.保存密码(username, password);
        }
        // 注意：不再在 rememberPassword=false 时清除密码
        // 只有在用户明确取消勾选"记住密码"时才应该清除
        // 自动登录等场景不应该影响已保存的凭据
      }

      return data;
    } catch (error) {
      console.error('登录请求失败 - 详细错误:', error);
      console.error('错误类型:', error instanceof TypeError ? 'TypeError (网络错误)' : typeof error);
      console.error('错误信息:', error instanceof Error ? error.message : String(error));
      console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');

      return {
        success: false,
        message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 登出
   */
  登出(): void {
    this.token = null;
    this.userInfo = null;
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');

    // 设置手动登出标记（使用 sessionStorage，仅在当前会话有效）
    // 这样刷新页面后标记会清除，允许自动登录
    // 但在当前会话中，手动登出后不会自动登录
    sessionStorage.setItem('manual_logout', 'true');
  }

  /**
   * 检查是否已登录
   */
  是否已登录(): boolean {
    return this.token !== null && this.userInfo !== null;
  }

  /**
   * 获取当前Token
   */
  获取Token(): string | null {
    return this.token;
  }

  /**
   * 获取用户信息
   */
  获取用户信息(): UserInfo | null {
    return this.userInfo;
  }

  /**
   * 保存会话到 sessionStorage（关闭页面后自动清除）
   * 注意：这里使用 sessionStorage 而不是 localStorage
   * 这样关闭网页后，如果没有勾选"自动登录"，会话会自动失效
   * 如果勾选了"自动登录"，会通过 saved_credentials 中的信息重新登录
   */
  private 保存会话(userInfo: UserInfo): void {
    this.token = userInfo.token;
    this.userInfo = userInfo;

    sessionStorage.setItem('auth_token', userInfo.token);
    sessionStorage.setItem('user_info', JSON.stringify({
      userId: userInfo.userId,
      username: userInfo.username,
      displayName: userInfo.displayName,
    }));
  }

  /**
   * 从 sessionStorage 恢复会话
   */
  private 恢复会话(): void {
    const token = sessionStorage.getItem('auth_token');
    const userInfoStr = sessionStorage.getItem('user_info');

    if (token && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.token = token;
        this.userInfo = {
          ...userInfo,
          token,
        };
      } catch (error) {
        console.error('恢复会话失败:', error);
        this.登出();
      }
    }
  }

  /**
   * 保存密码到localStorage（Base64简单编码，非安全加密）
   */
  保存密码(username: string, password: string): void {
    try {
      const credentials: SavedCredentials = { username, password };
      const encoded = btoa(JSON.stringify(credentials));
      localStorage.setItem('saved_credentials', encoded);
    } catch (error) {
      console.error('保存密码失败:', error);
    }
  }

}

// 导出单例实例
export const 认证客户端实例 = new 认证客户端();
