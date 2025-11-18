/**
 * 任务面板组件
 */

import { useState, useEffect } from 'react';
import { useQuestStore } from './questStore';
import { useAuthStore } from '@/features/auth/authStore';
import { getPlayerQuests, getAvailableQuests, acceptQuest, completeQuest, abandonQuest } from './questApi';
import { WindowTemplate } from '@/components/WindowTemplate';
import type { QuestDefinition, PlayerQuest, QuestStatus, QuestType } from './types';
import './QuestPanel.css';

interface QuestPanelProps {
  onClose?: () => void;
}

type QuestTab = 'in_progress' | 'available' | 'completed';

export function QuestPanel({ onClose }: QuestPanelProps) {
  const { user } = useAuthStore();
  const {
    playerQuests,
    availableQuests,
    selectedQuest,
    setPlayerQuests,
    setAvailableQuests,
    setSelectedQuest,
    closeQuestPanel,
    isQuestPanelOpen,
  } = useQuestStore();

  const [activeTab, setActiveTab] = useState<QuestTab>('in_progress');
  const [loading, setLoading] = useState(false);
  const playerId = user?.id || '';

  useEffect(() => {
    if (isQuestPanelOpen && playerId) {
      loadQuests();
    }
  }, [isQuestPanelOpen, playerId]);

  const loadQuests = async () => {
    setLoading(true);
    try {
      const [playerQuestsData, availableQuestsData] = await Promise.all([
        getPlayerQuests(playerId),
        getAvailableQuests(playerId, user?.level || 1),
      ]);
      setPlayerQuests(playerQuestsData);
      setAvailableQuests(availableQuestsData);
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuest = async (questId: string) => {
    try {
      const response = await acceptQuest({
        playerId,
        questId,
        npcId: selectedQuest?.questGiver.npcId || '',
      });

      if (response.success && response.quest) {
        alert(response.message);
        await loadQuests();
        setActiveTab('in_progress');
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('接受任务失败:', error);
      alert('接受任务失败');
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      const response = await completeQuest({
        playerId,
        questId,
        npcId: selectedQuest?.questGiver.npcId || '',
      });

      if (response.success) {
        alert(`${response.message}\n获得奖励：\n经验: ${response.rewards?.experience || 0}\n灵石: ${response.rewards?.money || 0}`);
        await loadQuests();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      alert('完成任务失败');
    }
  };

  const handleAbandonQuest = async (questId: string) => {
    if (!confirm('确定要放弃这个任务吗？')) return;

    try {
      const response = await abandonQuest({ playerId, questId });
      if (response.success) {
        alert(response.message);
        await loadQuests();
        setSelectedQuest(null);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('放弃任务失败:', error);
      alert('放弃任务失败');
    }
  };

  const handleClose = () => {
    closeQuestPanel();
    if (onClose) onClose();
  };

  if (!isQuestPanelOpen) return null;

  const getQuestTypeLabel = (type: QuestType): string => {
    switch (type) {
      case 'main': return '主线';
      case 'side': return '支线';
      case 'daily': return '日常';
      default: return '其他';
    }
  };

  const getDisplayQuests = () => {
    switch (activeTab) {
      case 'in_progress':
        return playerQuests.filter(pq => pq.status === 'in_progress' || pq.status === 'completed');
      case 'available':
        return availableQuests;
      case 'completed':
        return playerQuests.filter(pq => pq.status === 'turned_in');
      default:
        return [];
    }
  };

  const getSelectedPlayerQuest = (): PlayerQuest | undefined => {
    if (!selectedQuest) return undefined;
    return playerQuests.find(pq => pq.questId === selectedQuest.id);
  };

  const renderQuestList = () => {
    const quests = getDisplayQuests();

    if (quests.length === 0) {
      return <div className="no-quests">暂无任务</div>;
    }

    if (activeTab === 'available') {
      return (quests as QuestDefinition[]).map(quest => (
        <div
          key={quest.id}
          className={`quest-item ${selectedQuest?.id === quest.id ? 'selected' : ''}`}
          onClick={() => setSelectedQuest(quest)}
        >
          <div className="quest-item-header">
            <div className="quest-item-name">{quest.name}</div>
            <span className={`quest-type-badge ${quest.type}`}>
              {getQuestTypeLabel(quest.type)}
            </span>
          </div>
          <div className="quest-item-desc">{quest.description}</div>
          <div className="quest-item-progress">Lv.{quest.level} | {quest.questGiver.npcName}</div>
        </div>
      ));
    } else {
      return (quests as PlayerQuest[]).map(pq => {
        const questDef = availableQuests.find(q => q.id === pq.questId) ||
          playerQuests.find(q => q.questId === pq.questId) as any;
        if (!questDef) return null;

        const completedCount = pq.objectives.filter(obj => obj.completed).length;
        const totalCount = pq.objectives.length;

        return (
          <div
            key={pq.questId}
            className={`quest-item ${selectedQuest?.id === pq.questId ? 'selected' : ''}`}
            onClick={() => setSelectedQuest(questDef)}
          >
            <div className="quest-item-header">
              <div className="quest-item-name">{questDef.name || pq.questId}</div>
              <span className={`quest-type-badge ${questDef.type || 'side'}`}>
                {getQuestTypeLabel(questDef.type || 'side')}
              </span>
            </div>
            <div className="quest-item-desc">{questDef.description || ''}</div>
            <div className="quest-item-progress">
              进度: {completedCount}/{totalCount} | {pq.status === 'completed' ? '✅ 已完成' : '进行中'}
            </div>
          </div>
        );
      });
    }
  };

  const renderQuestDetail = () => {
    if (!selectedQuest) {
      return <div className="no-selection">请从左侧选择一个任务</div>;
    }

    const playerQuest = getSelectedPlayerQuest();
    const isInProgress = playerQuest?.status === 'in_progress';
    const isCompleted = playerQuest?.status === 'completed';
    const isTurnedIn = playerQuest?.status === 'turned_in';
    const objectives = playerQuest?.objectives || selectedQuest.objectives.map(obj => ({
      ...obj,
      current: 0,
      completed: false,
    }));

    return (
      <div className="quest-detail">
        <div className="quest-detail-header">
          <div className="quest-detail-title">{selectedQuest.name}</div>
          <div className="quest-detail-meta">
            <div className="quest-meta-item">
              <span className={`quest-type-badge ${selectedQuest.type}`}>
                {getQuestTypeLabel(selectedQuest.type)}
              </span>
            </div>
            <div className="quest-meta-item">📍 等级 {selectedQuest.level}</div>
            <div className="quest-meta-item">👤 {selectedQuest.questGiver.npcName}</div>
          </div>
        </div>

        <div className="quest-detail-desc">{selectedQuest.description}</div>

        <h3 className="quest-section-title">📋 任务目标</h3>
        <ul className="quest-objectives">
          {objectives.map((obj) => (
            <li key={obj.id} className={`quest-objective ${obj.completed ? 'completed' : ''}`}>
              <div className={`objective-checkbox ${obj.completed ? 'checked' : ''}`}>
                {obj.completed && '✓'}
              </div>
              <div className="objective-text">{obj.description}</div>
              <div className="objective-progress">
                {obj.current}/{obj.required}
              </div>
            </li>
          ))}
        </ul>

        <h3 className="quest-section-title">🎁 任务奖励</h3>
        <div className="quest-rewards">
          {selectedQuest.rewards.experience && (
            <div className="reward-item">⭐ 经验 +{selectedQuest.rewards.experience}</div>
          )}
          {selectedQuest.rewards.money && (
            <div className="reward-item">💰 灵石 +{selectedQuest.rewards.money}</div>
          )}
          {selectedQuest.rewards.cultivation && (
            <div className="reward-item">🧘 修炼点 +{selectedQuest.rewards.cultivation}</div>
          )}
          {selectedQuest.rewards.items && selectedQuest.rewards.items.length > 0 && (
            <div className="reward-item">📦 物品 x{selectedQuest.rewards.items.length}</div>
          )}
        </div>

        <div className="quest-actions">
          {!isInProgress && !isCompleted && !isTurnedIn && (
            <button className="quest-action-btn primary" onClick={() => handleAcceptQuest(selectedQuest.id)}>
              接受任务
            </button>
          )}
          {isCompleted && (
            <button className="quest-action-btn primary" onClick={() => handleCompleteQuest(selectedQuest.id)}>
              交付任务
            </button>
          )}
          {isInProgress && !isCompleted && (
            <button className="quest-action-btn secondary" onClick={() => handleAbandonQuest(selectedQuest.id)}>
              放弃任务
            </button>
          )}
          {isTurnedIn && (
            <div className="quest-action-btn secondary" style={{textAlign: 'center', cursor: 'default'}}>
              ✅ 已完成
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <WindowTemplate
      title="【任务日志】"
      subtitle="江湖路漫漫"
      onClose={handleClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="选择任务查看详情"
      footerIconLeft="📜"
      footerIconRight="💡"
    >
      <div className="quest-panel">
        <div className="quest-list-section">
          <div className="quest-tabs">
            <button
              className={`quest-tab ${activeTab === 'in_progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('in_progress')}
            >
              进行中
            </button>
            <button
              className={`quest-tab ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              可接任务
            </button>
            <button
              className={`quest-tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              已完成
            </button>
          </div>
          <div className="quest-list">
            {loading ? <div className="no-quests">加载中...</div> : renderQuestList()}
          </div>
        </div>

        <div className="quest-detail-section">
          {renderQuestDetail()}
        </div>
      </div>
    </WindowTemplate>
  );
}
