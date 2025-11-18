/**
 * 战斗面板组件 - 经典对战布局
 */

import { useEffect, useState } from 'react';
import { WindowTemplate } from '@/components/WindowTemplate';
import { useCombatStore } from './combatStore';
import { executeCombatAction, fleeCombat } from './combatApi';
import { CombatActionType, ParticipantType } from './types';
import './CombatPanel.css';

interface CombatPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CombatPanel({ onClose }: CombatPanelProps) {
  const { currentCombat, combatLog, addCombatLog, closeCombatPanel } = useCombatStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取玩家和敌人
  const player = currentCombat?.participants.find(p => p.type === ParticipantType.PLAYER);
  const enemy = currentCombat?.participants.find(p => p.type === ParticipantType.MONSTER);

  // 如果没有战斗数据，显示提示
  if (!currentCombat || !player || !enemy) {
    return (
      <WindowTemplate
        title="【战斗】"
        subtitle="战斗系统"
        onClose={onClose || closeCombatPanel}
        footerHintLeft="ESC 关闭"
        footerHintRight="等待战斗"
        footerIconLeft="⚔️"
        footerIconRight="💡"
      >
        <div className="combat-panel-new">
          <div className="no-combat-message">
            <div className="no-combat-icon">⚔️</div>
            <div className="no-combat-text">当前没有战斗</div>
          </div>
        </div>
      </WindowTemplate>
    );
  }

  // 计算血条百分比
  const playerHpPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100));
  const playerMpPercent = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
  const enemyMpPercent = Math.max(0, Math.min(100, (enemy.mana / enemy.maxMana) * 100));

  // 生成ASCII进度条
  const generateProgressBar = (percent: number, length: number = 10): string => {
    const filled = Math.floor((percent / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  // 处理攻击行动
  const handleAttack = async () => {
    if (!currentCombat || isProcessing) return;

    setIsProcessing(true);
    try {
      const action = {
        actorId: player.id,
        targetId: enemy.id,
        type: CombatActionType.ATTACK,
        timestamp: new Date(),
      };

      const response = await executeCombatAction(
        currentCombat.combatId,
        player.id,
        action
      );

      if (response.success) {
        addCombatLog(`你对 ${enemy.name} 发起攻击！`);

        if (response.roundResults) {
          response.roundResults.forEach(result => {
            addCombatLog(result.message);
          });
        }

        if (response.combatEnded) {
          if (response.victory) {
            addCombatLog('战斗胜利！');
            if (response.reward) {
              addCombatLog(`获得经验: ${response.reward.experience}`);
              addCombatLog(`获得金币: ${response.reward.money}`);
            }
          } else {
            addCombatLog('战斗失败...');
          }
          setTimeout(() => {
            closeCombatPanel();
          }, 3000);
        }

        // 更新战斗状态
        if (response.combat) {
          useCombatStore.getState().setCurrentCombat(response.combat);
        }
      } else {
        addCombatLog(`攻击失败: ${response.message}`);
      }
    } catch (error) {
      console.error('攻击失败:', error);
      addCombatLog('攻击失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理防御行动
  const handleDefend = async () => {
    if (!currentCombat || isProcessing) return;

    setIsProcessing(true);
    try {
      const action = {
        actorId: player.id,
        targetId: player.id,
        type: CombatActionType.DEFEND,
        timestamp: new Date(),
      };

      const response = await executeCombatAction(
        currentCombat.combatId,
        player.id,
        action
      );

      if (response.success) {
        addCombatLog('你进入防御姿态！');

        if (response.roundResults) {
          response.roundResults.forEach(result => {
            addCombatLog(result.message);
          });
        }

        if (response.combat) {
          useCombatStore.getState().setCurrentCombat(response.combat);
        }
      }
    } catch (error) {
      console.error('防御失败:', error);
      addCombatLog('防御失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理逃跑
  const handleFlee = async () => {
    if (!currentCombat || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fleeCombat(currentCombat.combatId, player.id);

      if (response.success) {
        if (response.fleeSuccessful) {
          addCombatLog('成功逃离战斗！');
          setTimeout(() => {
            closeCombatPanel();
          }, 1500);
        } else {
          addCombatLog('逃跑失败！');
        }
      } else {
        addCombatLog(`逃跑失败: ${response.message}`);
      }
    } catch (error) {
      console.error('逃跑失败:', error);
      addCombatLog('逃跑失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <WindowTemplate
      title="【战斗】"
      subtitle={`第 ${currentCombat.currentTurn} 回合`}
      onClose={onClose || closeCombatPanel}
      footerHintLeft="ESC 关闭"
      footerHintRight="选择行动"
      footerIconLeft="⚔️"
      footerIconRight="💡"
    >
      <div className="combat-panel-new">
        {/* 顶部回合信息 */}
        <div className="combat-header-new">
          <div className="combat-round-info">
            回合 {currentCombat.currentTurn}
          </div>
        </div>

        {/* 对战区域 */}
        <div className="combat-battlefield">
          <div className="combat-participants-new">
            {/* 玩家卡片 */}
            <div className="participant-card-new">
              <div className="participant-name-row">
                <span className="participant-tag">[你]</span>
                <span className="participant-name-new">{player.name}</span>
                <span className="participant-level-new">Lv.{player.level}</span>
              </div>

              <div className="participant-divider"></div>

              {/* 生命值 */}
              <div className="resource-bar-new hp-bar-new">
                <div className="resource-label-new">
                  <span className="resource-name">❤️ 生命</span>
                  <span className="resource-value-new">
                    {player.health} / {player.maxHealth}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${playerHpPercent}%` }}
                  />
                </div>
              </div>

              {/* 灵力值 */}
              <div className="resource-bar-new mp-bar-new">
                <div className="resource-label-new">
                  <span className="resource-name">💙 真元</span>
                  <span className="resource-value-new">
                    {player.mana} / {player.maxMana}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${playerMpPercent}%` }}
                  />
                </div>
              </div>

              {/* 属性 */}
              <div className="participant-stats-new">
                <div className="stat-item-new">
                  <span className="stat-label">攻</span>
                  <span className="stat-value">{player.stats.attack}</span>
                </div>
                <div className="stat-item-new">
                  <span className="stat-label">防</span>
                  <span className="stat-value">{player.stats.defense}</span>
                </div>
                <div className="stat-item-new">
                  <span className="stat-label">速</span>
                  <span className="stat-value">{player.stats.speed}</span>
                </div>
              </div>
            </div>

            {/* VS 标识 */}
            <div className="vs-indicator-new">
              <div className="vs-text-new">VS</div>
              <div className="vs-swords-new">⚔️</div>
            </div>

            {/* 敌人卡片 */}
            <div className="participant-card-new">
              <div className="participant-name-row">
                <span className="participant-level-new">Lv.{enemy.level}</span>
                <span className="participant-name-new">{enemy.name}</span>
                <span className="participant-tag">[敌]</span>
              </div>

              <div className="participant-divider"></div>

              {/* 生命值 */}
              <div className="resource-bar-new hp-bar-new">
                <div className="resource-label-new">
                  <span className="resource-name">❤️ 生命</span>
                  <span className="resource-value-new">
                    {enemy.health} / {enemy.maxHealth}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${enemyHpPercent}%` }}
                  />
                </div>
              </div>

              {/* 灵力值 */}
              <div className="resource-bar-new mp-bar-new">
                <div className="resource-label-new">
                  <span className="resource-name">💙 真元</span>
                  <span className="resource-value-new">
                    {enemy.mana} / {enemy.maxMana}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${enemyMpPercent}%` }}
                  />
                </div>
              </div>

              {/* 属性 */}
              <div className="participant-stats-new">
                <div className="stat-item-new">
                  <span className="stat-label">攻</span>
                  <span className="stat-value">{enemy.stats.attack}</span>
                </div>
                <div className="stat-item-new">
                  <span className="stat-label">防</span>
                  <span className="stat-value">{enemy.stats.defense}</span>
                </div>
                <div className="stat-item-new">
                  <span className="stat-label">速</span>
                  <span className="stat-value">{enemy.stats.speed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 战斗日志 */}
        <div className="combat-log-section-new">
          <div className="log-title-new">战斗记录</div>
          <div className="combat-log-new">
            {combatLog.length === 0 ? (
              <div className="log-empty-new">战斗开始！</div>
            ) : (
              combatLog.map((log, index) => (
                <div key={index} className="log-entry-new">
                  <span className="log-bullet-new">▸</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="combat-actions-new">
          <button
            className="action-btn-new attack-btn-new"
            onClick={handleAttack}
            disabled={isProcessing || !player.isAlive}
          >
            ⚔️ 攻击
          </button>
          <button
            className="action-btn-new defend-btn-new"
            onClick={handleDefend}
            disabled={isProcessing || !player.isAlive}
          >
            🛡️ 防御
          </button>
          <button
            className="action-btn-new flee-btn-new"
            onClick={handleFlee}
            disabled={isProcessing || !player.isAlive}
          >
            🏃 逃跑
          </button>
        </div>
      </div>
    </WindowTemplate>
  );
}
