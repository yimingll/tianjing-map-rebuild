/**
 * 设置模态框组件
 * 提供字体大小和动画时长设置
 */

import { useState, useEffect } from 'react';
import { ModalTemplate } from './ModalTemplate';
import './SettingsModal.css';

interface SettingsModalProps {
  onClose: () => void;
}

// 设置接口
interface Settings {
  fontSize: number;
  animationDuration: number;
}

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  fontSize: 14,
  animationDuration: 100,
};

// 从 localStorage 读取设置
const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
  return DEFAULT_SETTINGS;
};

// 保存设置到 localStorage
const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

// 应用字体大小到页面
const applyFontSize = (size: number) => {
  document.documentElement.style.setProperty('--base-font-size', `${size}px`);
};

// 应用动画时长到页面
const applyAnimationDuration = (duration: number) => {
  document.documentElement.style.setProperty('--animation-duration', `${duration}ms`);
};

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [isClosing, setIsClosing] = useState(false);

  // 初始化时应用设置
  useEffect(() => {
    applyFontSize(settings.fontSize);
    applyAnimationDuration(settings.animationDuration);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // 从CSS变量读取动画时长
    const duration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--animation-duration')) || 100;
    setTimeout(() => {
      onClose();
    }, duration);
  };

  const handleFontSizeChange = (size: number) => {
    const newSettings = { ...settings, fontSize: size };
    setSettings(newSettings);
    saveSettings(newSettings);
    applyFontSize(size);
  };

  const handleAnimationDurationChange = (duration: number) => {
    const newSettings = { ...settings, animationDuration: duration };
    setSettings(newSettings);
    saveSettings(newSettings);
    applyAnimationDuration(duration);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    applyFontSize(DEFAULT_SETTINGS.fontSize);
    applyAnimationDuration(DEFAULT_SETTINGS.animationDuration);
  };

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ModalTemplate
      title="【系统设置·偏好配置】"
      subtitle="调整游戏界面参数"
      onClose={handleClose}
      isClosing={isClosing}
      width="900px"
      maxWidth="90vw"
      showSideDecorations={true}
      footer={
        <>
          <button className="reset-button" onClick={handleReset}>
            <span className="button-icon">↺</span>
            恢复默认
          </button>
          <button className="confirm-button" onClick={handleClose}>
            <span className="button-icon">✓</span>
            点击保存
          </button>
        </>
      }
    >
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
          预览文字效果:修仙MUD游戏
        </div>
      </div>

      <div className="setting-divider"></div>

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
            min="50"
            max="300"
            step="50"
            value={settings.animationDuration}
            onChange={(e) => handleAnimationDurationChange(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-marks">
            <span>快</span>
            <span>中</span>
            <span>慢</span>
          </div>
        </div>
        <div className="setting-hint">
          窗口打开/关闭动画的持续时间
        </div>
      </div>

      <div className="setting-divider"></div>

      {/* 快捷设置预设 */}
      <div className="setting-group">
        <div className="setting-label">
          <span className="label-icon">✨</span>
          <span className="label-text">快速预设</span>
        </div>
        <div className="preset-buttons">
          <button
            className="preset-button"
            onClick={() => {
              handleFontSizeChange(12);
              handleAnimationDurationChange(50);
            }}
          >
            精简模式
          </button>
          <button
            className="preset-button"
            onClick={() => {
              handleFontSizeChange(14);
              handleAnimationDurationChange(100);
            }}
          >
            标准模式
          </button>
          <button
            className="preset-button"
            onClick={() => {
              handleFontSizeChange(16);
              handleAnimationDurationChange(200);
            }}
          >
            舒适模式
          </button>
        </div>
      </div>
    </ModalTemplate>
  );
}

// 导出用于其他组件使用的工具函数
export const loadGameSettings = loadSettings;
export const applyGameSettings = (settings: Settings) => {
  applyFontSize(settings.fontSize);
  applyAnimationDuration(settings.animationDuration);
};
