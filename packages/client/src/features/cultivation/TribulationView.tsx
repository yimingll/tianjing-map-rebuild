import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LightningEffect } from './LightningEffect';
import './cultivation.css';

export interface Tribulation {
  id: number;
  character_id: number;
  type: 'nascent_soul' | 'spirit_division' | 'ascension';
  total_strikes: number;
  current_strike: number;
  survived_strikes: number;
  total_damage: number;
  success: boolean;
  active: boolean;
}

export interface TribulationStrike {
  strike_num: number;
  damage: number;
  timestamp: string;
}

export interface TribulationViewProps {
  tribulation: Tribulation;
  currentHP: number;
  maxHP: number;
  onUseItem?: (itemType: string) => void;
  onComplete?: (success: boolean) => void;
}

export const TribulationView: React.FC<TribulationViewProps> = ({
  tribulation,
  currentHP,
  maxHP,
  onUseItem,
  onComplete,
}) => {
  const [strikes, setStrikes] = useState<TribulationStrike[]>([]);
  const [latestStrike, setLatestStrike] = useState<TribulationStrike | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightningRef = useRef<{ triggerLightning: () => void }>(null);

  const getTribulationTypeText = (type: Tribulation['type']): string => {
    const typeMap = {
      nascent_soul: '元婴天劫',
      spirit_division: '化神天劫',
      ascension: '飞升天劫',
    };
    return typeMap[type];
  };

  // 监听天劫事件（WebSocket）
  useEffect(() => {
    // TODO: 实际项目中应从 WebSocket 接收雷劫事件
    // gameClient.on('tribulation_strike', handleTribulationStrike);

    // 模拟雷劫（开发测试用）
    // const interval = setInterval(() => {
    //   if (tribulation.active && tribulation.current_strike < tribulation.total_strikes) {
    //     const newStrike: TribulationStrike = {
    //       strike_num: tribulation.current_strike + 1,
    //       damage: Math.floor(Math.random() * 5000) + 1000,
    //       timestamp: new Date().toISOString(),
    //     };
    //     handleTribulationStrike(newStrike);
    //   }
    // }, 5000);

    // return () => {
    //   clearInterval(interval);
    //   // gameClient.off('tribulation_strike', handleTribulationStrike);
    // };
  }, [tribulation]);

  const handleTribulationStrike = useCallback((strike: TribulationStrike) => {
    setStrikes((prev) => [...prev, strike]);
    setLatestStrike(strike);

    // 触发闪电动画
    triggerLightningEffect();

    // 播放音效（可选）
    // playThunderSound();
  }, []);

  const triggerLightningEffect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 生成闪电
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#FFF';

    const startX = width / 2 + (Math.random() - 0.5) * 200;
    const startY = 0;
    const endX = width / 2 + (Math.random() - 0.5) * 150;
    const endY = height;

    ctx.moveTo(startX, startY);
    for (let i = 0; i < 10; i++) {
      const x = startX + (endX - startX) * (i / 10) + (Math.random() - 0.5) * 80;
      const y = (endY / 10) * (i + 1);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 添加发光核心
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;

    ctx.moveTo(startX, startY);
    for (let i = 0; i < 10; i++) {
      const x = startX + (endX - startX) * (i / 10) + (Math.random() - 0.5) * 80;
      const y = (endY / 10) * (i + 1);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 闪电消失动画
    setTimeout(() => {
      ctx.clearRect(0, 0, width, height);
    }, 200);

    // 屏幕闪白效果
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9998';
    document.body.appendChild(flash);

    setTimeout(() => {
      document.body.removeChild(flash);
    }, 100);
  }, []);

  const handleUseItem = (itemType: string) => {
    if (onUseItem) {
      onUseItem(itemType);
    }
  };

  const hpPercentage = (currentHP / maxHP) * 100;
  const progressPercentage = (tribulation.current_strike / tribulation.total_strikes) * 100;

  return (
    <div className="tribulation-overlay">
      <div className="tribulation-container">
        {/* Canvas 闪电效果 */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="tribulation-canvas"
        />

        {/* 天劫信息 */}
        <div className="tribulation-header">
          <h2 className="tribulation-title">{getTribulationTypeText(tribulation.type)}</h2>
          <div className="tribulation-counter">
            <span className="strike-current">{tribulation.current_strike}</span>
            <span className="strike-separator">/</span>
            <span className="strike-total">{tribulation.total_strikes}</span>
            <span className="strike-label">道雷劫</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="tribulation-progress">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill tribulation-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
            <span className="progress-text">{Math.floor(progressPercentage)}%</span>
          </div>
        </div>

        {/* 生命值显示 */}
        <div className="tribulation-hp">
          <div className="hp-label">生命值</div>
          <div className="hp-bar-container">
            <div
              className={`hp-bar-fill ${hpPercentage <= 20 ? 'hp-critical' : ''}`}
              style={{ width: `${hpPercentage}%` }}
            />
            <span className="hp-text">
              {currentHP.toLocaleString()} / {maxHP.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 最新雷劫伤害 */}
        {latestStrike && (
          <div className="latest-strike-damage">
            <span className="damage-label">第{latestStrike.strike_num}道雷劫</span>
            <span className="damage-value">-{latestStrike.damage.toLocaleString()}</span>
          </div>
        )}

        {/* 道具快捷栏 */}
        <div className="tribulation-items">
          <div className="items-label">道具</div>
          <div className="items-grid">
            <button
              className="item-button"
              onClick={() => handleUseItem('破劫丹')}
              title="减少下一道雷劫伤害50%"
            >
              <div className="item-icon">破</div>
              <div className="item-name">破劫丹</div>
            </button>
            <button
              className="item-button"
              onClick={() => handleUseItem('回元丹')}
              title="恢复30%生命值"
            >
              <div className="item-icon">回</div>
              <div className="item-name">回元丹</div>
            </button>
            <button
              className="item-button"
              onClick={() => handleUseItem('护体符')}
              title="抵挡一次雷劫伤害"
            >
              <div className="item-icon">护</div>
              <div className="item-name">护体符</div>
            </button>
          </div>
        </div>

        {/* 雷劫历史记录 */}
        <div className="tribulation-history">
          <div className="history-title">雷劫记录</div>
          <div className="history-list">
            {strikes.slice(-5).reverse().map((strike, index) => (
              <div key={index} className="history-item">
                <span className="history-strike-num">第{strike.strike_num}道</span>
                <span className="history-damage">-{strike.damage.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="tribulation-tips">
          <p>每5秒降临一道雷劫，使用道具抵御伤害！</p>
        </div>
      </div>
    </div>
  );
};

// 天劫结果组件
export interface TribulationResultViewProps {
  success: boolean;
  survivedStrikes: number;
  totalStrikes: number;
  totalDamage: number;
  duration: number;
  onClose: () => void;
}

export const TribulationResultView: React.FC<TribulationResultViewProps> = ({
  success,
  survivedStrikes,
  totalStrikes,
  totalDamage,
  duration,
  onClose,
}) => {
  return (
    <div className="tribulation-overlay">
      <div className="tribulation-result">
        <div className={`result-header ${success ? 'result-success' : 'result-failure'}`}>
          <h2>{success ? '渡劫成功' : '渡劫失败'}</h2>
        </div>

        <div className="result-content">
          <div className="result-stats">
            <div className="result-stat">
              <span className="stat-label">渡过雷劫：</span>
              <span className="stat-value">
                {survivedStrikes} / {totalStrikes}
              </span>
            </div>

            <div className="result-stat">
              <span className="stat-label">总承受伤害：</span>
              <span className="stat-value text-failure">{totalDamage.toLocaleString()}</span>
            </div>

            <div className="result-stat">
              <span className="stat-label">渡劫用时：</span>
              <span className="stat-value">{Math.floor(duration / 60)}分{duration % 60}秒</span>
            </div>
          </div>

          {success ? (
            <p className="result-message success-message">
              恭喜！你成功渡过天劫，境界得到提升！
            </p>
          ) : (
            <p className="result-message failure-message">
              很遗憾，你未能渡过天劫。请继续修炼，提升实力后再次尝试。
            </p>
          )}
        </div>

        <button className="result-close-button" onClick={onClose}>
          {success ? '继续修炼' : '重新开始'}
        </button>
      </div>
    </div>
  );
};
