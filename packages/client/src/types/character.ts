/**
 * 角色属性类型定义
 *
 * 对应后端 CharacterData 结构
 */

export interface CharacterAttributes {
  // 核心资源
  hp: number
  max_hp: number
  mp: number
  max_mp: number

  // 境界
  realm: string
  realm_layer: number
  experience: number

  // 六维属性
  constitution: number   // 体质
  strength: number       // 力量
  agility: number        // 敏捷
  spirit_root: number    // 灵根
  comprehension: number  // 悟性
  luck: number           // 气运

  // 修仙属性
  dao_heart: number          // 道心
  karma: number              // 因果
  spirit_sense: number       // 神识
  cultivation_speed: number  // 修炼速度

  // 战斗属性
  physical_attack: number   // 物理攻击
  magic_attack: number      // 法术攻击
  physical_defense: number  // 物理防御
  magic_defense: number     // 法术防御
  critical_rate: number     // 暴击率
  evasion_rate: number      // 闪避率

  // 灵根
  spirit_roots: string  // JSON格式的灵根数组

  // 属性点
  attribute_points: number  // 可用属性点
}

/**
 * 角色属性 UI 显示数据
 *
 * 用于组件渲染，包含计算后的百分比等显示数据
 */
export interface CharacterAttributesDisplay extends CharacterAttributes {
  // 计算后的显示数据
  hpPercentage: number    // 生命值百分比
  mpPercentage: number    // 灵力值百分比
  spiritRootsList: string[]  // 解析后的灵根数组
}

/**
 * 角色属性更新消息
 *
 * WebSocket 接收的 character_update 消息格式
 */
export interface CharacterUpdateMessage {
  type: 'character_update'
  content: string  // JSON 字符串，包含 CharacterAttributes
}
