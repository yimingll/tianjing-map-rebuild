/**
 * 通用窗口模板组件
 * 提供统一的古典卷轴风格UI布局
 * 所有游戏窗口都应使用此模板以保持视觉一致性
 */

import { ReactNode } from 'react';
import './ModalTemplate.css';

interface ModalTemplateProps {
  /** 窗口标题（例如：【系统设置·偏好配置】） */
  title: string;
  /** 副标题（可选） */
  subtitle?: string;
  /** 窗口内容 */
  children: ReactNode;
  /** 底部按钮区域（可选） */
  footer?: ReactNode;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否正在关闭（用于动画） */
  isClosing?: boolean;
  /** 窗口宽度 */
  width?: string;
  /** 窗口最大宽度 */
  maxWidth?: string;
  /** 是否显示左右装饰图案 */
  showSideDecorations?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function ModalTemplate({
  title,
  subtitle,
  children,
  footer,
  showCloseButton = true,
  onClose,
  isClosing = false,
  width = '900px',
  maxWidth = '90vw',
  showSideDecorations = true,
  className = '',
}: ModalTemplateProps) {

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      (e.currentTarget as any).dataset.mousedownOnOverlay = 'true';
    } else {
      (e.currentTarget as any).dataset.mousedownOnOverlay = 'false';
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const mousedownOnOverlay = (e.currentTarget as any).dataset.mousedownOnOverlay === 'true';
    const mouseupOnOverlay = e.target === e.currentTarget;

    if (mousedownOnOverlay && mouseupOnOverlay && onClose) {
      onClose();
    }

    delete (e.currentTarget as any).dataset.mousedownOnOverlay;
  };

  return (
    <div
      className={`modal-template-overlay ${isClosing ? 'closing' : ''}`}
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className={`modal-template ${isClosing ? 'closing' : ''} ${className}`}
        style={{ width, maxWidth }}
      >
        {/* 关闭按钮 */}
        {showCloseButton && onClose && (
          <button
            className="modal-template-close"
            onClick={onClose}
            title="关闭 (ESC)"
            type="button"
          >
            ✕
          </button>
        )}

        {/* 标题区 */}
        <div className="modal-template-header">
          <h2>{title}</h2>
          {subtitle && <p className="modal-template-subtitle">{subtitle}</p>}
        </div>

        {/* 内容区（带左右装饰） */}
        <div className={`modal-template-content-wrapper ${showSideDecorations ? 'with-decorations' : ''}`}>
          <div className="modal-template-content">
            {children}
          </div>
        </div>

        {/* 底部区 */}
        {footer && (
          <div className="modal-template-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
