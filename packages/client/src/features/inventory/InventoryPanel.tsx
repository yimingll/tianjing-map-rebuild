/**
 * 背包面板组件 - 横向分类标签 + 悬停显示详情
 */

import { useState, useEffect } from 'react';
import { useInventoryStore } from './inventoryStore';
import { loadInventory, useInventoryItem, removeItemFromInventory } from './inventoryActions';
import { useAuthStore } from '@/features/auth/authStore';
import { WindowTemplate } from '@/components/WindowTemplate';
import './InventoryPanel.css';

interface InventoryPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type CategoryType = 'all' | 'equipment' | 'consumable' | 'material' | 'currency' | 'treasure';

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const { items, capacity, isLoading, error } = useInventoryStore();
  const { userInfo } = useAuthStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryType>('all');
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const playerId = userInfo?.userId?.toString() || '';

  // 加载背包数据
  useEffect(() => {
    if (playerId) {
      loadInventory(playerId);
    }
  }, [playerId]);

  // 分类配置
  const categories = [
    { id: 'all' as CategoryType, label: '全部', icon: '📦' },
    { id: 'equipment' as CategoryType, label: '装备', icon: '⚔️' },
    { id: 'consumable' as CategoryType, label: '消耗', icon: '💊' },
    { id: 'material' as CategoryType, label: '材料', icon: '🌿' },
    { id: 'currency' as CategoryType, label: '货币', icon: '💰' },
    { id: 'treasure' as CategoryType, label: '宝物', icon: '💎' },
  ];

  // 物品类型映射到分类
  const getItemCategory = (itemType: string): CategoryType => {
    const typeMap: Record<string, CategoryType> = {
      weapon: 'equipment',
      armor: 'equipment',
      accessory: 'equipment',
      consumable: 'consumable',
      material: 'material',
      currency: 'currency',
      treasure: 'treasure',
      quest: 'treasure',
    };
    return typeMap[itemType] || 'material';
  };

  // 过滤物品
  const filteredItems = currentCategory === 'all'
    ? items
    : items.filter(item => getItemCategory(item.item_type) === currentCategory);

  // 使用物品
  const handleUseItem = async (itemId: string) => {
    const result = await useInventoryItem(playerId, itemId);
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
  const handleDiscardItem = async (itemId: string) => {
    const confirmDiscard = window.confirm('确定要丢弃这个物品吗？');
    if (!confirmDiscard) return;

    const result = await removeItemFromInventory(playerId, itemId, 1);
    if (result.success) {
      alert(result.message);
      setSelectedItemId(null);
    } else {
      alert('丢弃失败: ' + result.message);
    }
  };

  // 处理鼠标悬停
  const handleMouseEnter = (item: any, event: React.MouseEvent) => {
    setHoveredItem(item);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // 获取物品品质颜色
  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      common: '#aaaaaa',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
    };
    return colors[quality] || colors.common;
  };

  // 获取物品图标
  const getItemIcon = (itemType: string): string => {
    const icons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      accessory: '💍',
      consumable: '💊',
      material: '📦',
      treasure: '💎',
      currency: '💰',
      quest: '📜',
      misc: '📦',
    };
    return icons[itemType] || '📦';
  };

  // 翻译品质
  const translateQuality = (quality: string): string => {
    const translations: Record<string, string> = {
      common: '普通',
      uncommon: '优秀',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说',
    };
    return translations[quality] || '普通';
  };

  // 翻译类型
  const translateType = (type: string): string => {
    const translations: Record<string, string> = {
      weapon: '武器',
      armor: '防具',
      accessory: '饰品',
      consumable: '消耗品',
      material: '材料',
      treasure: '宝物',
      currency: '货币',
      quest: '任务',
      misc: '杂物',
    };
    return translations[type] || type;
  };

  // 翻译属性
  const translateStat = (stat: string): string => {
    const translations: Record<string, string> = {
      attack: '攻击',
      defense: '防御',
      health: '生命',
      mana: '法力',
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
  };

  return (
    <WindowTemplate
      title="【储物袋】"
      subtitle="背包管理"
      onClose={onClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="悬停查看详情"
      footerIconLeft="🎒"
      footerIconRight="💡"
    >
      <div className="inventory-panel-new">
        {/* 顶部状态栏 */}
        <div className="inventory-header-new">
          <div className="inventory-stats-new">
            <span>容量: {items.length} / {capacity}</span>
            <span className="divider">|</span>
            <span>重量: {items.reduce((sum, item) => sum + (item.item_data?.weight || 0) * item.quantity, 0).toFixed(1)} 斤</span>
            <span className="divider">|</span>
            <span>灵石: 0</span>
          </div>
        </div>

        {/* 分类标签 */}
        <div className="inventory-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab-button ${currentCategory === cat.id ? 'active' : ''}`}
              onClick={() => setCurrentCategory(cat.id)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span className="tab-label">{cat.label}</span>
              {cat.id !== 'all' && (
                <span className="tab-count">
                  {items.filter(item => getItemCategory(item.item_type) === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="inventory-error-new">
            ⚠️ {error}
          </div>
        )}

        {/* 物品列表 */}
        <div className="inventory-list-container">
          {isLoading ? (
            <div className="loading-message-new">加载中...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-message-new">
              {currentCategory === 'all' ? '背包是空的' : '该分类下没有物品'}
            </div>
          ) : (
            <div className="inventory-list">
              {filteredItems.map((item, index) => (
                <div
                  key={item.item_id}
                  className={`inventory-list-item ${selectedItemId === item.item_id ? 'selected' : ''}`}
                  onClick={() => setSelectedItemId(item.item_id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="item-index">{index + 1}.</div>
                  <div className="item-icon-text">{getItemIcon(item.item_type)}</div>
                  <div className="item-main-info">
                    <div className="item-name-row">
                      <span
                        className="item-name-text"
                        style={{ color: getQualityColor(item.item_data?.quality || 'common') }}
                      >
                        {item.item_name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="item-quantity-text">x{item.quantity}</span>
                      )}
                    </div>
                    <div className="item-meta">
                      <span className="item-type-badge">
                        [{translateType(item.item_type)}·{translateQuality(item.item_data?.quality || 'common')}]
                      </span>
                      {item.item_data?.stats && Object.keys(item.item_data.stats).length > 0 && (
                        <span className="item-stats-preview">
                          {Object.entries(item.item_data.stats).slice(0, 2).map(([stat, value]) => (
                            <span key={stat} className="stat-item-small">
                              {translateStat(stat)}+{value}
                            </span>
                          ))}
                        </span>
                      )}
                      {item.item_data?.weight && (
                        <span className="item-weight">{item.item_data.weight}斤</span>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    {item.item_type === 'consumable' && (
                      <button
                        className="action-btn use-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseItem(item.item_id);
                        }}
                        title="使用"
                      >
                        使用
                      </button>
                    )}
                    {(item.item_type === 'weapon' || item.item_type === 'armor' || item.item_type === 'accessory') && (
                      <button
                        className="action-btn equip-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('装备功能开发中...');
                        }}
                        title="装备"
                      >
                        装备
                      </button>
                    )}
                    <button
                      className="action-btn discard-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDiscardItem(item.item_id);
                      }}
                      title="丢弃"
                    >
                      丢弃
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作提示 */}
        <div className="inventory-footer-new">
          <button
            className="footer-btn"
            onClick={() => loadInventory(playerId)}
            disabled={isLoading}
          >
            🔄 刷新
          </button>
          <span className="footer-hint">点击选中 | 悬停查看详情 | Tab切换分类</span>
        </div>

        {/* 悬浮提示框 */}
        {hoveredItem && hoveredItem.item_data && (
          <div
            className="item-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            <div className="tooltip-header">
              <div
                className="tooltip-name"
                style={{ color: getQualityColor(hoveredItem.item_data.quality) }}
              >
                {hoveredItem.item_name}
                {hoveredItem.quantity > 1 && ` x${hoveredItem.quantity}`}
              </div>
              <div className="tooltip-quality">
                {translateQuality(hoveredItem.item_data.quality)}
              </div>
            </div>

            <div className="tooltip-divider"></div>

            <div className="tooltip-body">
              <div className="tooltip-row">
                <span className="tooltip-label">类型:</span>
                <span className="tooltip-value">{translateType(hoveredItem.item_data.type)}</span>
              </div>

              {hoveredItem.item_data.level && (
                <div className="tooltip-row">
                  <span className="tooltip-label">等级:</span>
                  <span className="tooltip-value">{hoveredItem.item_data.level}</span>
                </div>
              )}

              {hoveredItem.item_data.stats && Object.keys(hoveredItem.item_data.stats).length > 0 && (
                <>
                  <div className="tooltip-section-title">--- 属性 ---</div>
                  {Object.entries(hoveredItem.item_data.stats).map(([stat, value]) => (
                    <div key={stat} className="tooltip-row stat-row">
                      <span className="tooltip-label">{translateStat(stat)}:</span>
                      <span className="tooltip-value stat-value">+{value as number}</span>
                    </div>
                  ))}
                </>
              )}

              {hoveredItem.item_data.effects && hoveredItem.item_data.effects.length > 0 && (
                <>
                  <div className="tooltip-section-title">--- 效果 ---</div>
                  {hoveredItem.item_data.effects.map((effect: any, idx: number) => (
                    <div key={idx} className="tooltip-effect">
                      {effect.type === 'heal' && `恢复${effect.value}点生命值`}
                      {effect.type === 'buff' && `增加${effect.stat} +${effect.value}`}
                    </div>
                  ))}
                </>
              )}

              <div className="tooltip-divider"></div>

              <div className="tooltip-description">
                {hoveredItem.item_data.description}
              </div>

              {hoveredItem.item_data.price && (
                <div className="tooltip-price">
                  价值: {hoveredItem.item_data.price} 灵石
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </WindowTemplate>
  );
}
