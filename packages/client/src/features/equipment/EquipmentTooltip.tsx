// qianduan/src/features/equipment/EquipmentTooltip.tsx
import React from "react";
import { EquippedItem } from "@/types/equipment";
import "./EquipmentTooltip.css";

interface EquipmentTooltipProps {
  item: EquippedItem;
}

export const EquipmentTooltip: React.FC<EquipmentTooltipProps> = ({ item }) => {
  const qualityColors: Record<string, string> = {
    common: "#9ca3af",
    uncommon: "#10b981",
    rare: "#3b82f6",
    epic: "#8b5cf6",
    legendary: "#f59e0b",
  };

  return (
    <div className="equipment-tooltip">
      <div
        className="tooltip-header"
        style={{ borderColor: qualityColors[item.quality] }}
      >
        <h4 style={{ color: qualityColors[item.quality] }}>
          {item.item_name}
        </h4>
        <span className="quality-text">{formatQuality(item.quality)}</span>
      </div>

      <div className="tooltip-body">
        <div className="attributes">
          {Object.entries(item.attributes).map(([attr, value]) => (
            <div key={attr} className="attribute-line">
              <span>{formatAttributeName(attr)}</span>
              <span className="value">+{value}</span>
            </div>
          ))}
        </div>

        <div className="tooltip-footer">
          <p className="hint">右键卸下装备</p>
        </div>
      </div>
    </div>
  );
};

function formatQuality(quality: string): string {
  const qualityMap: Record<string, string> = {
    common: "普通",
    uncommon: "优秀",
    rare: "稀有",
    epic: "史诗",
    legendary: "传说",
  };
  return qualityMap[quality] || quality;
}

function formatAttributeName(attr: string): string {
  const nameMap: Record<string, string> = {
    physical_attack: "物理攻击",
    physical_defense: "物理防御",
    magic_attack: "法术攻击",
    magic_defense: "法术防御",
    max_hp: "生命上限",
    max_mp: "真元上限",
    critical_rate: "暴击率",
    critical_damage: "暴击伤害",
    dodge_rate: "闪避率",
    hit_rate: "命中率",
  };
  return nameMap[attr] || attr;
}
