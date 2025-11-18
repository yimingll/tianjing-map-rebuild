/**
 * 背包面板组件 - 显示和管理玩家背包
 */

import { useState, useEffect } from 'react';
import { useInventoryStore } from '@/features/inventory/inventoryStore';
import { loadInventory, useInventoryItem, removeItemFromInventory } from '@/features/inventory/inventoryActions';
import { useAuthStore } from '@/features/auth/authStore';
import { WindowTemplate } from '../WindowTemplate';
import './InventoryPanel.css';

interface InventoryPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const { items, capacity, isLoading, error } = useInventoryStore();
  const { user } = useAuthStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const playerId = user?.id || '';

  // 加载背包数据
  useEffect(() => {
    if (playerId) {
      loadInventory(playerId);
    }
  }, [playerId]);

  // 获取选中的物品详情
  const selectedItem = items.find(item => item.item_id === selectedItemId);

  // 使用物品
  const handleUseItem = async () => {
    if (!selectedItemId) return;

    const result = await useInventoryItem(playerId, selectedItemId);
    if (result.success) {
      alert(result.message);
      if (result.effects) {
        console.log('物品效果:', result.effects);
      }
    } else {
      alert('使用失败: ' + result.message);
    }
  };

  // 丢弃物品
  const handleDiscardItem = async () => {
    if (!selectedItemId) return;

    const confirmDiscard = window.confirm('确定要丢弃这个物品吗？');
    if (!confirmDiscard) return;

    const result = await removeItemFromInventory(playerId, selectedItemId, 1);
    if (result.success) {
      alert(result.message);
      setSelectedItemId(null);
    } else {
      alert('丢弃失败: ' + result.message);
    }
  };

  // 获取物品品质颜色
  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
    };
    return colors[quality] || colors.common;
  };

  return (
    <WindowTemplate
      title="【储物袋】"
      subtitle="背包管理"
      onClose={onClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="点击物品选择"
      footerIconLeft="🎒"
      footerIconRight="💡"
    >
      <div className="inventory-panel">
        {/* 状态栏 */}
        <div className="inventory-header">
          <div className="inventory-stats">
            <span className="stat-item">
              <span className="stat-label">物品数:</span>
              <span className="stat-value">{items.length} / {capacity}</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item">
              <span className="stat-label">总数量:</span>
              <span className="stat-value">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </span>
          </div>

          {error && (
            <div className="inventory-error">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 主内容区域 */}
        <div className="inventory-main">
          {/* 物品网格 */}
          <div className="inventory-grid">
            {isLoading ? (
              <div className="loading-message">加载中...</div>
            ) : items.length === 0 ? (
              <div className="empty-message">背包是空的</div>
            ) : (
              items.map((item) => (
                <div
                  key={item.item_id}
                  className={`inventory-item ${selectedItemId === item.item_id ? 'selected' : ''}`}
                  onClick={() => setSelectedItemId(item.item_id)}
                  title={item.item_data?.description || item.item_name}
                >
                  <div className="item-icon"  style={{
                    borderColor: getQualityColor(item.item_data?.quality || 'common')
                  }}>
                    {getItemIcon(item.item_type)}
                  </div>
                  <div className="item-info">
                    <div
                      className="item-name"
                      style={{ color: getQualityColor(item.item_data?.quality || 'common') }}
                    >
                      {item.item_name}
                    </div>
                    {item.quantity > 1 && (
                      <div className="item-count">x{item.quantity}</div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* 填充空槽位 */}
            {!isLoading && Array.from({ length: Math.max(0, 12 - items.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="inventory-item empty">
                <div className="empty-slot">+</div>
              </div>
            ))}
          </div>

          {/* 物品详情面板 */}
          {selectedItem && selectedItem.item_data && (
            <div className="item-detail">
              <div className="item-detail-header">
                <h3 style={{ color: getQualityColor(selectedItem.item_data.quality) }}>
                  {selectedItem.item_name}
                </h3>
                <div className="item-quality">{translateQuality(selectedItem.item_data.quality)}</div>
              </div>

              <div className="item-detail-body">
                <div className="item-description">{selectedItem.item_data.description}</div>

                <div className="item-properties">
                  <div className="property-row">
                    <span className="property-label">类型:</span>
                    <span className="property-value">{translateType(selectedItem.item_data.type)}</span>
                  </div>

                  {selectedItem.item_data.level && (
                    <div className="property-row">
                      <span className="property-label">等级:</span>
                      <span className="property-value">{selectedItem.item_data.level}</span>
                    </div>
                  )}

                  {selectedItem.item_data.stats && Object.keys(selectedItem.item_data.stats).length > 0 && (
                    <>
                      <div className="stats-divider">--- 属性 ---</div>
                      {Object.entries(selectedItem.item_data.stats).map(([stat, value]) => (
                        <div key={stat} className="property-row stat-row">
                          <span className="property-label">{translateStat(stat)}:</span>
                          <span className="property-value stat-value">+{value}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {selectedItem.item_data.price && (
                    <div className="property-row">
                      <span className="property-label">价值:</span>
                      <span className="property-value">{selectedItem.item_data.price} 灵石</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="inventory-footer">
          <button
            className="mud-btn"
            onClick={() => loadInventory(playerId)}
            disabled={isLoading}
          >
            🔄 刷新
          </button>

          <button
            className="mud-btn mud-btn-primary"
            onClick={handleUseItem}
            disabled={!selectedItemId || isLoading}
          >
            ✨ 使用
          </button>

          <button
            className="mud-btn mud-btn-danger"
            onClick={handleDiscardItem}
            disabled={!selectedItemId || isLoading}
          >
            🗑️ 丢弃
          </button>
        </div>
      </div>
    </WindowTemplate>
  );
}

// 辅助函数：获取物品图标
function getItemIcon(itemType: string): string {
  const icons: Record<string, string> = {
    weapon: '⚔️',
    armor: '🛡️',
    accessory: '💍',
    consumable: '💊',
    material: '📦',
    treasure: '💎',
    currency: '💰',
    misc: '📜',
  };
  return icons[itemType] || '📦';
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

// 辅助函数：翻译类型
function translateType(type: string): string {
  const translations: Record<string, string> = {
    weapon: '武器',
    armor: '防具',
    accessory: '饰品',
    consumable: '消耗品',
    material: '材料',
    treasure: '宝物',
    currency: '货币',
    misc: '杂物',
  };
  return translations[type] || type;
}

// 辅助函数：翻译属性
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
  };
  return translations[stat] || stat;
}
