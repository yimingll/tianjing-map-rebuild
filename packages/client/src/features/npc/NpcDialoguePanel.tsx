/**
 * NPC对话面板组件
 */

import { useNpcStore } from './npcStore';
import { talkToNpc } from './npcApi';
import { useAuthStore } from '@/features/auth/authStore';
import { WindowTemplate } from '@/components/WindowTemplate';
import './NpcDialoguePanel.css';

interface NpcDialoguePanelProps {
  onClose?: () => void;
}

export function NpcDialoguePanel({ onClose }: NpcDialoguePanelProps) {
  const { user } = useAuthStore();
  const {
    currentNpc,
    currentDialogue,
    setCurrentDialogue,
    openShop,
    closeDialogue,
    setError,
    isDialogueOpen,
  } = useNpcStore();

  const playerId = user?.id || '';

  // 处理对话选项点击
  const handleOptionClick = async (optionId: string, option: any) => {
    if (!currentNpc) return;

    // 如果选项有特殊action
    if (option.action) {
      switch (option.action) {
        case 'open_trade':
          // 打开商店面板
          openShop();
          return;

        case 'accept_quest':
          // TODO: 处理接受任务
          console.log('接受任务');
          break;

        default:
          console.log('未知action:', option.action);
      }
    }

    // 如果是告别选项，关闭对话
    if (optionId === 'goodbye' && !option.nextDialogueId) {
      handleClose();
      return;
    }

    // 继续对话流程
    if (option.nextDialogueId) {
      try {
        const response = await talkToNpc({
          npcId: currentNpc.id,
          playerId,
          dialogueId: option.nextDialogueId,
          optionId,
        });

        if (response.success) {
          setCurrentDialogue(response.dialogue);
        } else {
          setError(response.message || '对话失败');
        }
      } catch (error) {
        console.error('对话请求失败:', error);
        setError('对话请求失败');
      }
    }
  };

  const handleClose = () => {
    closeDialogue();
    if (onClose) onClose();
  };

  // 只在对话面板打开时显示
  if (!isDialogueOpen || !currentNpc || !currentDialogue) {
    return null;
  }

  return (
    <WindowTemplate
      title={`【与${currentNpc.name}对话】`}
      subtitle={currentNpc.description || ''}
      onClose={handleClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="选择对话选项"
      footerIconLeft="💬"
      footerIconRight="💡"
    >
      <div className="npc-dialogue-panel">
        {/* NPC信息栏 */}
        <div className="npc-info-bar">
          <div className="npc-avatar">🧙</div>
          <div className="npc-details">
            <div className="npc-name">{currentNpc.name}</div>
            <div className="npc-title">
              {currentNpc.type === 'merchant' && '商人'}
              {currentNpc.type === 'quest_giver' && '任务发布者'}
              {currentNpc.type === 'trainer' && '导师'}
              {currentNpc.type === 'guard' && '守卫'}
              {currentNpc.level && ` · 等级${currentNpc.level}`}
            </div>
          </div>
        </div>

        {/* 对话内容区 */}
        <div className="dialogue-content">
          <div className="npc-speech-bubble">
            <div className="speech-arrow"></div>
            <div className="speech-text">{currentDialogue.npcText}</div>
          </div>
        </div>

        {/* 对话选项 */}
        <div className="dialogue-options">
          <div className="options-title">选择你的回应：</div>
          <div className="options-list">
            {currentDialogue.options.map((option, index) => (
              <button
                key={option.id}
                className="dialogue-option-btn"
                onClick={() => handleOptionClick(option.id, option)}
              >
                <span className="option-number">{index + 1}.</span>
                <span className="option-text">{option.text}</span>
                {option.action && (
                  <span className="option-indicator">
                    {option.action === 'open_trade' && '🛒'}
                    {option.action === 'accept_quest' && '📜'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </WindowTemplate>
  );
}
