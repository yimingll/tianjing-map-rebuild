# 区域地图 JSON Schema 定义

## 概述

基于任务 #2 的区域划分方案，定义4个区域的 JSON Schema 结构。每个区域独立存储，通过区域间连接机制保持整体连通性。

## 区域结构

### 1. 皇城区 (Imperial District)
- **文件命名**: `tianjing_imperial_district.json`
- **房间数量**: 38个
- **包含区域**: 皇城区 + 官府区
- **核心功能**: 政治中心、文化教育、科技研究

### 2. 商业区 (Commercial District)
- **文件命名**: `tianjing_commercial_district.json`
- **房间数量**: 27个
- **包含区域**: 商业区 + 南门区
- **核心功能**: 商业贸易、金融流通、交通枢纽

### 3. 居民区 (Residential District)
- **文件命名**: `tianjing_residential_district.json`
- **房间数量**: 46个
- **包含区域**: 东城区 + 西城区 + 贫民区
- **核心功能**: 居住生活、手工业、社会服务

### 4. 特殊功能区 (Special Functions District)
- **文件命名**: `tianjing_special_functions_district.json`
- **房间数量**: 29个
- **包含区域**: 各门区、城墙区、城郊区
- **核心功能**: 城门出入、城市防御、交通连接

## JSON Schema 定义

### 根区域 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "天京城区域地图",
  "description": "天京城独立区域地图数据结构",
  "type": "object",
  "required": [
    "region",
    "cityInfo",
    "metadata",
    "locations"
  ],
  "properties": {
    "region": {
      "$ref": "#/definitions/RegionInfo"
    },
    "cityInfo": {
      "$ref": "#/definitions/CityInfo"
    },
    "metadata": {
      "$ref": "#/definitions/RegionMetadata"
    },
    "locations": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Location"
      }
    }
  },
  "definitions": {
    "RegionInfo": {
      "type": "object",
      "required": [
        "id",
        "name",
        "type",
        "description"
      ],
      "properties": {
        "id": {
          "type": "string",
          "description": "区域唯一标识符",
          "pattern": "^[a-z_]+$"
        },
        "name": {
          "type": "string",
          "description": "区域名称"
        },
        "type": {
          "type": "string",
          "enum": [
            "imperial",
            "commercial",
            "residential",
            "special_functions"
          ]
        },
        "description": {
          "type": "string",
          "description": "区域描述"
        },
        "roomCount": {
          "type": "integer",
          "minimum": 0,
          "description": "区域内房间总数"
        },
        "safeZone": {
          "type": "boolean",
          "description": "是否为安全区域"
        },
        "pvpAllowed": {
          "type": "boolean",
          "description": "是否允许PVP"
        },
        "coordinates": {
          "$ref": "#/definitions/Coordinates"
        }
      }
    },
    "CityInfo": {
      "type": "object",
      "required": [
        "cityId",
        "cityName",
        "provinceId",
        "provinceName"
      ],
      "properties": {
        "cityId": {
          "type": "string",
          "description": "城市ID"
        },
        "cityName": {
          "type": "string",
          "description": "城市名称"
        },
        "fullName": {
          "type": "string",
          "description": "城市全称"
        },
        "provinceId": {
          "type": "string",
          "description": "省份ID"
        },
        "provinceName": {
          "type": "string",
          "description": "省份名称"
        },
        "type": {
          "type": "string",
          "description": "城市类型"
        },
        "level": {
          "type": "integer",
          "minimum": 1,
          "description": "城市等级"
        }
      }
    },
    "RegionMetadata": {
      "type": "object",
      "required": [
        "version",
        "created",
        "updated"
      ],
      "properties": {
        "version": {
          "type": "string",
          "description": "数据版本号",
          "pattern": "^v\\d+\\.\\d+\\.\\d+$"
        },
        "created": {
          "type": "string",
          "format": "date-time",
          "description": "创建时间"
        },
        "updated": {
          "type": "string",
          "format": "date-time",
          "description": "更新时间"
        },
        "totalRooms": {
          "type": "integer",
          "minimum": 0,
          "description": "区域总房间数"
        },
        "connectedRegions": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "连接的其他区域ID列表"
        },
        "specialBuildings": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "区域内的特殊建筑列表"
        }
      }
    },
    "Location": {
      "type": "object",
      "required": [
        "id",
        "name",
        "type",
        "rooms"
      ],
      "properties": {
        "id": {
          "type": "string",
          "description": "位置唯一标识符"
        },
        "name": {
          "type": "string",
          "description": "位置名称"
        },
        "type": {
          "type": "string",
          "description": "位置类型"
        },
        "description": {
          "type": "string",
          "description": "位置描述"
        },
        "rooms": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Room"
          }
        }
      }
    },
    "Room": {
      "type": "object",
      "required": [
        "id",
        "name",
        "type",
        "description",
        "exits",
        "properties",
        "coordinates"
      ],
      "properties": {
        "id": {
          "type": "string",
          "description": "房间唯一标识符",
          "pattern": "^tj_[a-z0-9_]+$"
        },
        "name": {
          "type": "string",
          "description": "房间名称"
        },
        "type": {
          "type": "string",
          "description": "房间类型"
        },
        "description": {
          "type": "string",
          "description": "房间描述"
        },
        "exits": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Exit"
          },
          "minItems": 1,
          "description": "房间出口列表"
        },
        "npcs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/NPC"
          },
          "description": "房间NPC列表"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Item"
          },
          "description": "房间物品列表"
        },
        "properties": {
          "$ref": "#/definitions/RoomProperties"
        },
        "coordinates": {
          "$ref": "#/definitions/Coordinates"
        }
      }
    },
    "Exit": {
      "type": "object",
      "required": [
        "direction",
        "targetRoomId"
      ],
      "properties": {
        "direction": {
          "type": "string",
          "enum": [
            "north", "south", "east", "west",
            "northeast", "northwest", "southeast", "southwest",
            "up", "down", "in", "out"
          ],
          "description": "出口方向"
        },
        "targetRoomId": {
          "type": "string",
          "description": "目标房间ID，可以是本区域房间或跨区域房间"
        },
        "targetRegion": {
          "type": "string",
          "description": "跨区域时的目标区域ID，本区域房间可省略"
        },
        "description": {
          "type": "string",
          "description": "出口描述"
        },
        "exitType": {
          "type": "string",
          "enum": [
            "normal", "gate", "door", "portal", "teleport"
          ],
          "default": "normal",
          "description": "出口类型"
        },
        "locked": {
          "type": "boolean",
          "default": false,
          "description": "是否锁定"
        },
        "keyRequired": {
          "type": "string",
          "description": "需要的钥匙ID"
        }
      }
    },
    "NPC": {
      "type": "object",
      "required": [
        "npcId",
        "position",
        "spawnChance",
        "maxCount",
        "respawnTime"
      ],
      "properties": {
        "npcId": {
          "type": "string",
          "description": "NPC模板ID"
        },
        "position": {
          "type": "string",
          "description": "NPC位置/状态"
        },
        "spawnChance": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100,
          "description": "生成概率(0-100)"
        },
        "maxCount": {
          "type": "integer",
          "minimum": 0,
          "description": "最大数量"
        },
        "respawnTime": {
          "type": "integer",
          "minimum": 0,
          "description": "重生时间(秒)"
        }
      }
    },
    "Item": {
      "type": "object",
      "required": [
        "itemId",
        "name",
        "type"
      ],
      "properties": {
        "itemId": {
          "type": "string",
          "description": "物品ID"
        },
        "name": {
          "type": "string",
          "description": "物品名称"
        },
        "type": {
          "type": "string",
          "description": "物品类型"
        },
        "description": {
          "type": "string",
          "description": "物品描述"
        },
        "canPickup": {
          "type": "boolean",
          "default": true,
          "description": "是否可以拾取"
        },
        "canInteract": {
          "type": "boolean",
          "default": false,
          "description": "是否可以交互"
        },
        "quantity": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "数量"
        }
      }
    },
    "RoomProperties": {
      "type": "object",
      "required": [
        "safeZone",
        "pvpAllowed",
        "canTeleport"
      ],
      "properties": {
        "safeZone": {
          "type": "boolean",
          "description": "是否为安全区域"
        },
        "pvpAllowed": {
          "type": "boolean",
          "description": "是否允许PVP"
        },
        "canTeleport": {
          "type": "boolean",
          "description": "是否允许传送"
        },
        "lightLevel": {
          "type": "string",
          "enum": [
            "dark", "dim", "normal", "bright"
          ],
          "default": "normal",
          "description": "光照级别"
        },
        "weatherAffected": {
          "type": "boolean",
          "default": false,
          "description": "是否受天气影响"
        },
        "temperature": {
          "type": "string",
          "description": "温度描述"
        }
      }
    },
    "Coordinates": {
      "type": "object",
      "required": [
        "x",
        "y",
        "z"
      ],
      "properties": {
        "x": {
          "type": "integer",
          "description": "X坐标"
        },
        "y": {
          "type": "integer",
          "description": "Y坐标"
        },
        "z": {
          "type": "integer",
          "description": "Z坐标(楼层)"
        }
      }
    }
  }
}
```

## 跨区域连接机制

### 连接类型

1. **直接连接** (Direct Connection)
   - 相邻区域的直接边界连接
   - 通过 `targetRegion` 字段指定目标区域

2. **枢纽连接** (Hub Connection)
   - 通过特殊枢纽房间连接多个区域
   - 枢纽房间属于某个区域但可通往其他区域

3. **传送连接** (Teleport Connection)
   - 通过传送阵、马车等方式的区域连接
   - 使用 `exitType: "teleport"` 标识

### 连接标识符格式

```json
{
  "direction": "north",
  "targetRoomId": "tj_gate_south_inside",
  "targetRegion": "commercial",
  "description": "北面进入商业区南门",
  "exitType": "gate"
}
```

### 区域ID映射

- `imperial`: 皇城区
- `commercial`: 商业区
- `residential`: 居民区
- `special_functions`: 特殊功能区

## 数据验证规则

### 房间ID唯一性
- 每个房间ID在全局范围内必须唯一
- 格式: `tj_[location_code]_[room_number]`

### 连接完整性
- 所有跨区域连接必须有对应的目标房间
- 区域连接必须对称（如果A区能到B区，B区也必须能到A区）

### 坐标系统
- 使用统一的3D坐标系统
- 相同区域的房间坐标应该相对集中
- 跨区域连接应该考虑实际距离合理性

## 扩展性考虑

### 版本控制
- Schema版本号采用语义化版本控制
- 向后兼容的修改不影响现有数据

### 国际化支持
- 支持多语言名称和描述
- 字符串字段预留国际化扩展空间

### 插件机制
- 预留自定义属性扩展点
- 支持区域特定的自定义字段