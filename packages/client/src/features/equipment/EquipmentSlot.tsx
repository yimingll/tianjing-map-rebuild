// qianduan/src/features/equipment/EquipmentSlot.tsx
import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useEquipmentStore } from "./equipmentStore";
import { EquipmentTooltip } from "./EquipmentTooltip";
import { SlotType, SLOT_NAMES } from "@/types/equipment";
import "./EquipmentSlot.css";

interface EquipmentSlotProps {
  slotType: SlotType;
}

export const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ slotType }) => {
  const { getEquippedItem, unequipItem, equipItem } = useEquipmentStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const equippedItem = getEquippedItem(slotType);

  // 拖拽源(卸下装备)
  const [{ isDragging }, drag] = useDrag({
    type: "EQUIPPED_ITEM",
    item: () => {
      if (!equippedItem) return null;
      return {
        slot_type: slotType,
        item_instance_id: equippedItem.item_instance_id,
      };
    },
    canDrag: () => !!equippedItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 拖拽目标(穿戴装备)
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "INVENTORY_ITEM",
    canDrop: (item: any) => {
      // 检查是否为装备类型且匹配槽位
      return item.item_type === "equipment" && item.slot_type === slotType;
    },
    drop: (item: any) => {
      equipItem(item.instance_id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // 组合drag和drop的ref
  const combinedRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (equippedItem) {
      unequipItem(slotType);
    }
  };

  const slotClassName = [
    "equipment-slot",
    equippedItem ? "equipped" : "empty",
    isOver && canDrop ? "drag-over" : "",
    isDragging ? "dragging" : "",
    equippedItem?.quality || "",
  ].join(" ");

  return (
    <div
      ref={combinedRef}
      className={slotClassName}
      onContextMenu={handleRightClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={`${SLOT_NAMES[slotType]}槽位`}
    >
      {equippedItem ? (
        <>
          <div className="slot-icon">
            {/* 装备图标（暂时使用文字） */}
            <span className="slot-name">{SLOT_NAMES[slotType]}</span>
          </div>
          <div className="item-name">{equippedItem.item_name}</div>
          {showTooltip && <EquipmentTooltip item={equippedItem} />}
        </>
      ) : (
        <div className="slot-placeholder">
          <span className="slot-name">{SLOT_NAMES[slotType]}</span>
        </div>
      )}
    </div>
  );
};
