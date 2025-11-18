import React, { useState, useEffect } from 'react';
import './cultivation.css';

export interface HeartDemon {
  type: 'obsession' | 'fear' | 'desire' | 'family';
  description: string;
  choice1: string;
  choice2: string;
  choice3: string;
  difficulty: number;
}

export interface HeartDemonViewProps {
  demon: HeartDemon;
  onChoice: (choice: number) => void;
  onTimeout?: () => void;
}

const HEART_DEMON_TIMEOUT = 30; // 30秒倒计时

export const HeartDemonView: React.FC<HeartDemonViewProps> = ({
  demon,
  onChoice,
  onTimeout
}) => {
  const [timeLeft, setTimeLeft] = useState(HEART_DEMON_TIMEOUT);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeout) {
            onTimeout();
          } else {
            onChoice(0); // 超时视为失败
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onChoice, onTimeout]);

  const handleChoice = (choice: number) => {
    if (selectedChoice !== null) return; // 防止重复选择
    setSelectedChoice(choice);
    setTimeout(() => {
      onChoice(choice);
    }, 300); // 延迟300ms显示选择效果
  };

  const getDemonTypeText = (type: HeartDemon['type']): string => {
    const typeMap = {
      obsession: '执念心魔',
      fear: '恐惧心魔',
      desire: '欲望心魔',
      family: '情缘心魔',
    };
    return typeMap[type];
  };

  return (
    <div className="heart-demon-overlay">
      <div className="heart-demon-container">
        {/* 黑白色调场景 */}
        <div className="demon-scene grayscale">
          <div className="demon-header">
            <h2 className="demon-title">心魔劫</h2>
            <span className="demon-type">{getDemonTypeText(demon.type)}</span>
          </div>

          {/* 心魔描述 */}
          <div className="demon-description-box">
            <p className="demon-description">{demon.description}</p>
          </div>

          {/* 倒计时 */}
          <div className={`countdown ${timeLeft <= 10 ? 'countdown-warning' : ''}`}>
            <div className="countdown-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#333"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={timeLeft <= 10 ? '#ff4444' : '#888'}
                  strokeWidth="8"
                  strokeDasharray={`${(timeLeft / HEART_DEMON_TIMEOUT) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <span className="countdown-text">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* 选项区域 */}
        <div className="choices-container">
          <h3 className="choices-title">请选择你的决定</h3>
          <div className="choices">
            {[
              { num: 1, text: demon.choice1 },
              { num: 2, text: demon.choice2 },
              { num: 3, text: demon.choice3 },
            ].map((choice) => (
              <button
                key={choice.num}
                onClick={() => handleChoice(choice.num)}
                disabled={selectedChoice !== null}
                className={`choice-button ${
                  selectedChoice === choice.num ? 'choice-selected' : ''
                } ${selectedChoice !== null && selectedChoice !== choice.num ? 'choice-disabled' : ''}`}
              >
                <span className="choice-number">{choice.num}</span>
                <span className="choice-text">{choice.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 难度指示器 */}
        <div className="difficulty-indicator">
          <span>难度：</span>
          <div className="difficulty-bars">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`difficulty-bar ${
                  level <= Math.ceil(demon.difficulty / 20) ? 'active' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 心魔劫结果显示组件
export interface HeartDemonResultViewProps {
  success: boolean;
  daoHeartChange: number;
  newDaoHeart: number;
  message: string;
  correctChoice: number;
  playerChoice: number;
  onClose: () => void;
}

export const HeartDemonResultView: React.FC<HeartDemonResultViewProps> = ({
  success,
  daoHeartChange,
  newDaoHeart,
  message,
  correctChoice,
  playerChoice,
  onClose,
}) => {
  return (
    <div className="heart-demon-overlay">
      <div className="heart-demon-result">
        <div className={`result-header ${success ? 'result-success' : 'result-failure'}`}>
          <h2>{success ? '渡劫成功' : '心魔未破'}</h2>
        </div>

        <div className="result-content">
          <p className="result-message">{message}</p>

          <div className="result-stats">
            <div className="result-stat">
              <span className="stat-label">你的选择：</span>
              <span className={`stat-value ${success ? 'text-success' : 'text-failure'}`}>
                选项 {playerChoice}
              </span>
            </div>

            {!success && (
              <div className="result-stat">
                <span className="stat-label">正确选择：</span>
                <span className="stat-value text-success">选项 {correctChoice}</span>
              </div>
            )}

            <div className="result-stat">
              <span className="stat-label">道心变化：</span>
              <span className={`stat-value ${daoHeartChange > 0 ? 'text-success' : 'text-failure'}`}>
                {daoHeartChange > 0 ? '+' : ''}{daoHeartChange}
              </span>
            </div>

            <div className="result-stat">
              <span className="stat-label">当前道心：</span>
              <span className="stat-value">{newDaoHeart}</span>
            </div>
          </div>
        </div>

        <button className="result-close-button" onClick={onClose}>
          继续修炼
        </button>
      </div>
    </div>
  );
};
