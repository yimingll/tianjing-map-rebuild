/**
 * 角色面板组件 - 显示和管理角色属性
 */

import { useCharacterStore } from './characterStore';
import { WindowTemplate } from '@/components/WindowTemplate';
import './CharacterPanel.css';

interface CharacterPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CharacterPanel({ onClose }: CharacterPanelProps) {
  const { getDisplayAttributes } = useCharacterStore();
  const attrs = getDisplayAttributes();

  // 如果没有角色数据，显示提示
  if (!attrs) {
    return (
      <WindowTemplate
        title="【角色属性】"
        subtitle="人物信息"
        onClose={onClose}
        footerHintLeft="ESC 关闭"
        footerHintRight="查看角色详情"
        footerIconLeft="👤"
        footerIconRight="💡"
      >
        <div className="character-panel">
          <div className="no-data-message">
            <div className="no-data-icon">📜</div>
            <div className="no-data-text">暂无角色数据</div>
          </div>
        </div>
      </WindowTemplate>
    );
  }

  return (
    <WindowTemplate
      title="【角色属性】"
      subtitle="人物信息"
      onClose={onClose}
      footerHintLeft="ESC 关闭"
      footerHintRight="查看角色详情"
      footerIconLeft="👤"
      footerIconRight="💡"
    >
      <div className="character-panel">
        {/* 左侧：基础信息和资源 */}
        <div className="character-left">
          {/* 境界信息 */}
          <div className="info-section realm-section">
            <h3 className="section-title">
              <span className="title-icon">⚡</span>
              修炼境界
            </h3>
            <div className="realm-display">
              <div className="realm-name">{attrs.realm}</div>
              <div className="realm-layer">第 {attrs.realm_layer} 层</div>
            </div>
            <div className="experience-bar">
              <div className="exp-label">
                <span>修为</span>
                <span className="exp-value">{attrs.experience}</span>
              </div>
              <div className="exp-bar-container">
                <div className="exp-bar-bg">
                  <div
                    className="exp-bar-fill"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 生命和灵力 */}
          <div className="info-section resources-section">
            <h3 className="section-title">
              <span className="title-icon">❤️</span>
              核心资源
            </h3>

            {/* 生命值 */}
            <div className="resource-item hp-item">
              <div className="resource-header">
                <span className="resource-label">生命值</span>
                <span className="resource-value">
                  {attrs.hp} / {attrs.max_hp}
                </span>
              </div>
              <div className="resource-bar-container">
                <div className="resource-bar hp-bar">
                  <div
                    className="resource-bar-fill hp-fill"
                    style={{ width: `${attrs.hpPercentage}%` }}
                  />
                </div>
                <div className="resource-percentage">{attrs.hpPercentage.toFixed(0)}%</div>
              </div>
            </div>

            {/* 灵力值 */}
            <div className="resource-item mp-item">
              <div className="resource-header">
                <span className="resource-label">灵力值</span>
                <span className="resource-value">
                  {attrs.mp} / {attrs.max_mp}
                </span>
              </div>
              <div className="resource-bar-container">
                <div className="resource-bar mp-bar">
                  <div
                    className="resource-bar-fill mp-fill"
                    style={{ width: `${attrs.mpPercentage}%` }}
                  />
                </div>
                <div className="resource-percentage">{attrs.mpPercentage.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* 灵根信息 */}
          <div className="info-section spirit-roots-section">
            <h3 className="section-title">
              <span className="title-icon">🌿</span>
              灵根属性
            </h3>
            <div className="spirit-roots-display">
              {attrs.spiritRootsList.length > 0 ? (
                <div className="spirit-roots-list">
                  {attrs.spiritRootsList.map((root, index) => (
                    <div key={index} className="spirit-root-tag">
                      {root}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-spirit-roots">未检测到灵根</div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：属性详情 */}
        <div className="character-right">
          {/* 六维属性 */}
          <div className="info-section attributes-section">
            <h3 className="section-title">
              <span className="title-icon">📊</span>
              基础属性
              {attrs.attribute_points > 0 && (
                <span className="available-points">可用点数: {attrs.attribute_points}</span>
              )}
            </h3>
            <div className="attributes-grid">
              <div className="attr-item">
                <span className="attr-label">体质</span>
                <span className="attr-value">{attrs.constitution}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">力量</span>
                <span className="attr-value">{attrs.strength}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">敏捷</span>
                <span className="attr-value">{attrs.agility}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">灵根</span>
                <span className="attr-value">{attrs.spirit_root}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">悟性</span>
                <span className="attr-value">{attrs.comprehension}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">气运</span>
                <span className="attr-value">{attrs.luck}</span>
              </div>
            </div>
          </div>

          {/* 修仙属性 */}
          <div className="info-section cultivation-section">
            <h3 className="section-title">
              <span className="title-icon">✨</span>
              修仙属性
            </h3>
            <div className="attributes-grid">
              <div className="attr-item">
                <span className="attr-label">道心</span>
                <span className="attr-value">{attrs.dao_heart}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">因果</span>
                <span className="attr-value">{attrs.karma}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">神识</span>
                <span className="attr-value">{attrs.spirit_sense}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">修炼速度</span>
                <span className="attr-value">{attrs.cultivation_speed}%</span>
              </div>
            </div>
          </div>

          {/* 战斗属性 */}
          <div className="info-section combat-section">
            <h3 className="section-title">
              <span className="title-icon">⚔️</span>
              战斗属性
            </h3>
            <div className="attributes-grid">
              <div className="attr-item">
                <span className="attr-label">物理攻击</span>
                <span className="attr-value">{attrs.physical_attack}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">法术攻击</span>
                <span className="attr-value">{attrs.magic_attack}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">物理防御</span>
                <span className="attr-value">{attrs.physical_defense}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">法术防御</span>
                <span className="attr-value">{attrs.magic_defense}</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">暴击率</span>
                <span className="attr-value">{attrs.critical_rate}%</span>
              </div>
              <div className="attr-item">
                <span className="attr-label">闪避率</span>
                <span className="attr-value">{attrs.evasion_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowTemplate>
  );
}
