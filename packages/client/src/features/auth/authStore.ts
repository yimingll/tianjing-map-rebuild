/**
 * 认证状态管理 - Zustand Store
 * 管理用户登录状态和用户信息
 */

import { create } from 'zustand';
import { 认证客户端实例, UserInfo } from './authClient';

interface AuthState {
  // 状态
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  isLoading: boolean;

  // 操作
  登录: (username: string, password: string, rememberPassword?: boolean) => Promise<{ success: boolean; message: string }>;
  注册: (username: string, password: string, email?: string, displayName?: string) => Promise<{ success: boolean; message: string }>;
  登出: () => void;
  检查登录状态: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 初始状态
  isAuthenticated: 认证客户端实例.是否已登录(),
  userInfo: 认证客户端实例.获取用户信息(),
  isLoading: false,

  // 登录
  登录: async (username: string, password: string, rememberPassword: boolean = false) => {
    set({ isLoading: true });

    try {
      const response = await 认证客户端实例.登录(username, password, rememberPassword);

      if (response.success) {
        set({
          isAuthenticated: true,
          userInfo: 认证客户端实例.获取用户信息(),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: '登录失败，请稍后重试',
      };
    }
  },

  // 注册
  注册: async (username: string, password: string, email?: string, displayName?: string) => {
    set({ isLoading: true });

    try {
      const response = await 认证客户端实例.注册(username, password, email, displayName);

      if (response.success) {
        set({
          isAuthenticated: true,
          userInfo: 认证客户端实例.获取用户信息(),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: '注册失败，请稍后重试',
      };
    }
  },

  // 登出
  登出: () => {
    认证客户端实例.登出();
    set({
      isAuthenticated: false,
      userInfo: null,
    });
  },

  // 检查登录状态
  检查登录状态: () => {
    const isLoggedIn = 认证客户端实例.是否已登录();
    const userInfo = 认证客户端实例.获取用户信息();

    set({
      isAuthenticated: isLoggedIn,
      userInfo: userInfo,
    });
  },
}));
