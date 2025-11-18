/**
 * 装备面板组件 - 分栏布局设计
 */

import { useState, useEffect } from 'react';
import { useEquipmentStore } from './equipmentStore';
import { loadEquipment, unequipItem } from './equipmentActions';
import { useAuthStore } from '@/features/auth/authStore';
import { WindowTemplate } from '@/components/WindowTemplate';
import './EquipmentPanel.css';

interface EquipmentPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// 装备槽位定义
const EQUIPMENT_SLOTS = {
  weapon: '武器',
  helmet: '头盔',
  armor: '护甲',
  leggings: '护腿',
  boots: '靴子',
  necklace: '项链',
  ring1: '戒指1',
  ring2: '戒指2',
  belt: '腰带',
} as const;

type SlotType = keyof typeof EQUIPMENT_SLOTS;

export function EquipmentPanel({ onClose }: EquipmentPanelProps) {
  const { slots, isLoading, error } = useEquipmentStore();
  const { user } = useAuthStore();
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);

  const playerId = user?.id || '';

  // 加载装备数据
  useEffect(() => {
    if (playerId) {
      loadEquipment(playerId);
    }
  }, [playerId]);

  // 卸下装备
  const handleUnequip = async (slot: SlotType) => {
    const result = await unequipItem(playerId, slot);
    if (result.success) {
      alert(result.message);
      setSelectedSlot(null);
    } else {
      alert('卸下失败: ' + result.message);
    }
  };

  // 计算总属性
  const getTotalAttributes = () => {
    const total: Record<string, number> = {};

    Object.values(slots).forEach(slot => {
      if (slot && slot.attributes) {
        Object.entries(slot.attributes).forEach(([attr, value]) => {
          total[attr] = (total[attr] || 0) + (value as number);
        });
      }
    });

    return total;
  };

  const totalAttrs = getTotalAttributes();

  // 获取装备品质颜色
  const getQualityColor = (quality?: string) => {
    const colors: Record<string, string> = {
      common: '#aaaaaa',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
    };
    return quality ? colors[quality] || colors.common : colors.common;
  };

  // 按分类分组属性
  const getGroupedStats = () => {
    const groups = {
      attack: {} as Record<string, number>,
      defense: {} as Record<string, number>,
      basic: {} as Record<string, number>,
    };

    Object.entries(totalAttrs).forEach(([key, value]) => {
      if (['attack', 'physical_attack', 'magic_attack', 'critical_rate', 'critical_damage', 'hit_rate'].includes(key)) {
        groups.attack[key] = value;
      } else if (['defense', 'physical_defense', 'magic_defense', 'dodge_rate'].includes(key)) {
        groups.defense[key] = value;
      } else {
        groups.basic[key] = value;
      }
    });

    return groups;
  };

  const groupedStats = getGroupedStats();

  return (
    <WindowTemplate
      title="【装备栏】"
      subtitle="装备管理"
      onClose={onClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="点击查看详情"
      footerIconLeft="⚔️"
      footerIconRight="💡"
    >
      <div className="equipment-panel-new">
        {/* 错误提示 */}
        {error && (
          <div className="equipment-error-new">
            ⚠️ {error}
          </div>
        )}

        {/* 主内容区域：左右分栏 */}
        <div className="equipment-main-new">
          {/* 左侧：装备槽列表 */}
          <div className="equipment-slots-new">
            <div className="slots-header">装备槽位</div>
            {isLoading ? (
              <div className="loading-message-new">加载中...</div>
            ) : (
              <div className="slots-list">
                {Object.entries(EQUIPMENT_SLOTS).map(([slot, slotName]) => {
                  const slotKey = slot as SlotType;
                  const equippedItem = slots[slotKey];
                  const isSelected = selectedSlot === slotKey;

                  return (
                    <div
                      key={slot}
                      className={`slot-item ${equippedItem ? 'equipped' : 'empty'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slotKey)}
                    >
                      <div className="slot-icon">{getSlotIcon(slotKey)}</div>
                      <div className="slot-info">
                        <div className="slot-label">{slotName}:</div>
                        {equippedItem ? (
                          <div
                            className="slot-item-name"
                            style={{ color: getQualityColor(equippedItem.item_data?.quality) }}
                          >
                            {equippedItem.item_name}
                          </div>
                        ) : (
                          <div className="slot-empty-text">[空槽]</div>
                        )}
                      </div>
                      {equippedItem && (
                        <button
                          className="slot-unequip-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnequip(slotKey);
                          }}
                          title="卸下"
                        >
                          卸下
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧：属性统计 */}
          <div className="equipment-stats-new">
            <div className="stats-header">装备属性统计</div>

            <div className="stats-content">
              {Object.keys(totalAttrs).length === 0 ? (
                <div className="no-stats-new">未穿戴任何装备</div>
              ) : (
                <>
                  {/* 攻击属性 */}
                  {Object.keys(groupedStats.attack).length > 0 && (
                    <div className="stat-group">
                      <div className="stat-group-title">═══ 攻击属性 ═══</div>
                      {Object.entries(groupedStats.attack).map(([stat, value]) => (
                        <div key={stat} className="stat-row">
                          <span className="stat-label">{translateStat(stat)}:</span>
                          <span className="stat-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 防御属性 */}
                  {Object.keys(groupedStats.defense).length > 0 && (
                    <div className="stat-group">
                      <div className="stat-group-title">═══ 防御属性 ═══</div>
                      {Object.entries(groupedStats.defense).map(([stat, value]) => (
                        <div key={stat} className="stat-row">
                          <span className="stat-label">{translateStat(stat)}:</span>
                          <span className="stat-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 基础属性 */}
                  {Object.keys(groupedStats.basic).length > 0 && (
                    <div className="stat-group">
                      <div className="stat-group-title">═══ 基础属性 ═══</div>
                      {Object.entries(groupedStats.basic).map(([stat, value]) => (
                        <div key={stat} className="stat-row">
                          <span className="stat-label">{translateStat(stat)}:</span>
                          <span className="stat-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* 选中装备的详细信息 */}
              {selectedSlot && slots[selectedSlot] && (
                <div className="selected-detail">
                  <div className="detail-divider"></div>
                  <div className="detail-title">当前选中装备</div>
                  <div className="detail-name" style={{
                    color: getQualityColor(slots[selectedSlot]?.item_data?.quality)
                  }}>
                    {slots[selectedSlot]?.item_name}
                  </div>
                  <div className="detail-type">
                    [{translateQuality(slots[selectedSlot]?.item_data?.quality || 'common')}]
                  </div>
                  {slots[selectedSlot]?.item_data?.description && (
                    <div className="detail-description">
                      {slots[selectedSlot]?.item_data?.description}
                    </div>
                  )}
                  {slots[selectedSlot]?.attributes && Object.keys(slots[selectedSlot]!.attributes).length > 0 && (
                    <div className="detail-attrs">
                      <div className="detail-attrs-title">装备属性:</div>
                      {Object.entries(slots[selectedSlot]!.attributes).map(([stat, value]) => (
                        <div key={stat} className="detail-attr-row">
                          <span>{translateStat(stat)}:</span>
                          <span className="detail-attr-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="equipment-footer-new">
          <button
            className="footer-btn"
            onClick={() => loadEquipment(playerId)}
            disabled={isLoading}
          >
            🔄 刷新
          </button>
          <span className="footer-hint">点击装备槽查看详情</span>
        </div>
      </div>
    </WindowTemplate>
  );
}

// 辅助函数：获取槽位图标
function getSlotIcon(slot: SlotType): string {
  const icons: Record<SlotType, string> = {
    weapon: '⚔️',
    helmet: '⛑️',
    armor: '🛡️',
    leggings: '👖',
    boots: '👢',
    necklace: '📿',
    ring1: '💍',
    ring2: '💍',
    belt: '🎗️',
  };
  return icons[slot] || '📦';
}

// 辅助函数：翻译属性名称
function translateStat(stat: string): string {
  const translations: Record<string, string> = {
    attack: '攻击力',
    defense: '防御力',
    health: '生命值',
    mana: '法力值',
    critical: '暴击',
    strength: '力量',
    dexterity: '敏捷',
    constitution: '体质',
    intelligence: '智力',
    wisdom: '智慧',
    charisma: '魅力',
    speed: '速度',
    manaRegen: '法力回复',
    physical_attack: '物理攻击',
    physical_defense: '物理防御',
    magic_attack: '法术攻击',
    magic_defense: '法术防御',
    max_hp: '生命上限',
    max_mp: '真元上限',
    critical_rate: '暴击率',
    critical_damage: '暴击伤害',
    dodge_rate: '闪避率',
    hit_rate: '命中率',
  };
  return translations[stat] || stat;
}

// 辅助函数：翻译品质
function translateQuality(quality: string): string {
  const translations: Record<string, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };
  return translations[quality] || '普通';
}
