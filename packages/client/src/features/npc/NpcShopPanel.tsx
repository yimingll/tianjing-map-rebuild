/**
 * NPC商店面板组件
 */

import { useState, useEffect } from 'react';
import { useNpcStore } from './npcStore';
import { tradeWithNpc } from './npcApi';
import { useAuthStore } from '@/features/auth/authStore';
import { WindowTemplate } from '@/components/WindowTemplate';
import './NpcShopPanel.css';

interface NpcShopPanelProps {
  onClose?: () => void;
}

export function NpcShopPanel({ onClose }: NpcShopPanelProps) {
  const { user } = useAuthStore();
  const {
    currentNpc,
    merchantItems,
    setMerchantItems,
    closeShop,
    setError,
    isShopOpen,
  } = useNpcStore();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const playerId = user?.id || '';

  // 加载商品列表
  useEffect(() => {
    if (currentNpc && currentNpc.canTrade) {
      loadMerchantItems();
    }
  }, [currentNpc]);

  const loadMerchantItems = async () => {
    if (!currentNpc) return;

    try {
      const response = await tradeWithNpc({
        npcId: currentNpc.id,
        playerId,
        action: 'view',
      });

      if (response.success && response.items) {
        setMerchantItems(response.items);
      }
    } catch (error) {
      console.error('加载商品列表失败:', error);
      setError('加载商品列表失败');
    }
  };

  const handleBuy = async () => {
    if (!currentNpc || !selectedItemId) return;

    try {
      const response = await tradeWithNpc({
        npcId: currentNpc.id,
        playerId,
        action: 'buy',
        itemId: selectedItemId,
        quantity: buyQuantity,
      });

      alert(response.message);
      if (response.success) {
        loadMerchantItems();
      }
    } catch (error) {
      console.error('购买失败:', error);
      alert('购买失败');
    }
  };

  const handleClose = () => {
    closeShop();
    if (onClose) onClose();
  };

  // 只在商店打开时显示
  if (!isShopOpen || !currentNpc) return null;

  const selectedItem = merchantItems.find(item => item.itemId === selectedItemId);

  return (
    <WindowTemplate
      title={`【${currentNpc.name}的商店】`}
      subtitle="商品交易"
      onClose={handleClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="选择商品购买"
      footerIconLeft="🛒"
      footerIconRight="💡"
    >
      <div className="npc-shop-panel">
        {/* 商品列表 */}
        <div className="shop-items-list">
          <h3 className="list-title">📦 商品列表</h3>
          <div className="items-grid">
            {merchantItems.length === 0 ? (
              <div className="no-items">暂无商品</div>
            ) : (
              merchantItems.map((item) => (
                <div
                  key={item.itemId}
                  className={`shop-item ${selectedItemId === item.itemId ? 'selected' : ''}`}
                  onClick={() => setSelectedItemId(item.itemId)}
                >
                  <div className="item-icon">📦</div>
                  <div className="item-info">
                    <div className="item-name">{item.itemName || item.itemId}</div>
                    <div className="item-price">💰 {item.price} 灵石</div>
                    <div className="item-stock">库存: {item.quantity}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 购买区域 */}
        <div className="shop-purchase-area">
          <h3 className="list-title">🛍️ 购买详情</h3>
          {selectedItem ? (
            <div className="purchase-details">
              <div className="detail-row">
                <span className="detail-label">商品名称:</span>
                <span className="detail-value">{selectedItem.itemName || selectedItem.itemId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">单价:</span>
                <span className="detail-value">{selectedItem.price} 灵石</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">购买数量:</span>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    value={buyQuantity}
                    min={1}
                    max={selectedItem.quantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setBuyQuantity(Math.min(selectedItem.quantity, buyQuantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="detail-row total">
                <span className="detail-label">总价:</span>
                <span className="detail-value highlight">{selectedItem.price * buyQuantity} 灵石</span>
              </div>
              <button className="buy-btn" onClick={handleBuy}>
                💰 购买
              </button>
            </div>
          ) : (
            <div className="no-selection">请选择要购买的商品</div>
          )}
        </div>
      </div>
    </WindowTemplate>
  );
}
