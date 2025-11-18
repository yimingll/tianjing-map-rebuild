# 文件命名规范和接口标准

## 概述

制定天京城区域地图的文件命名规范、接口标准和技术规范，确保代码的一致性、可维护性和可扩展性。

## 文件命名规范

### 1. 区域地图文件命名

#### 基本格式: `{city}_{region}_{type}.json`

#### 具体文件命名
```
tianjing_imperial_district.json          # 皇城区地图数据
tianjing_commercial_district.json        # 商业区地图数据
tianjing_residential_district.json       # 居民区地图数据
tianjing_special_functions_district.json # 特殊功能区地图数据
```

#### 命名规则解释
- `tianjing`: 城市名称，使用小写字母和下划线
- `imperial/commercial/residential/special_functions`: 区域标识符
- `district`: 文件类型标识符
- `.json`: 文件扩展名

### 2. 配置文件命名

#### 区域配置文件
```
tianjing_regions_config.json           # 区域配置总文件
tianjing_region_connections.json       # 区域间连接配置
tianjing_region_boundaries.json        # 区域边界定义
tianjing_region_metadata.json          # 区域元数据
```

#### Schema文件命名
```
region_map_schema.json                 # 区域地图JSON Schema
region_connection_schema.json          # 区域连接Schema
region_validation_rules.json           # 区域验证规则
```

### 3. 资源文件命名

#### 地图资源文件
```
tianjing_region_overview_map.png       # 区域总览地图
tianjing_region_connections.svg        # 区域连接图
tianjing_region_boundaries.svg         # 区域边界图
```

#### 数据文件命名
```
tianjing_room_connections.csv         # 房间连接关系表
tianjing_cross_region_connections.csv # 跨区域连接表
tianjing_region_statistics.json       # 区域统计信息
```

### 4. 备份和版本文件命名

#### 备份文件
```
tianjing_imperial_district_backup_20251119.json
tianjing_commercial_district_v1.0.0_backup.json
```

#### 版本文件
```
tianjing_imperial_district_v1.0.0.json
tianjing_commercial_district_v1.1.0-beta.json
tianjing_residential_district_v2.0.0-release.json
```

## 目录结构规范

### 5. 地图数据目录结构

```
packages/server/data/maps/
└── dazhou/
    └── tianjing_fu/
        ├── regions/                          # 区域地图文件目录
        │   ├── tianjing_imperial_district.json
        │   ├── tianjing_commercial_district.json
        │   ├── tianjing_residential_district.json
        │   └── tianjing_special_functions_district.json
        ├── config/                           # 配置文件目录
        │   ├── tianjing_regions_config.json
        │   ├── tianjing_region_connections.json
        │   └── tianjing_region_boundaries.json
        ├── schemas/                          # Schema文件目录
        │   ├── region_map_schema.json
        │   └── region_connection_schema.json
        ├── resources/                        # 资源文件目录
        │   ├── maps/
        │   │   ├── tianjing_region_overview_map.png
        │   │   └── tianjing_region_connections.svg
        │   └── data/
        │       ├── tianjing_room_connections.csv
        │       └── tianjing_cross_region_connections.csv
        ├── backups/                          # 备份文件目录
        │   └── [backup files with date/version prefixes]
        └── legacy/                           # 遗留文件目录
            └── tianjing_cheng_fixed_complete.json
```

### 6. 开发资源目录结构

```
.claude/epics/rebuild-map/
├── updates/
│   ├── 3/                                # 任务 #3 工作目录
│   │   ├── regional_map_schemas.md
│   │   ├── cross_region_connection_mechanism.md
│   │   ├── naming_conventions_and_interface_standards.md
│   │   └── [other task files]
├── schemas/                              # 开发用Schema文件
├── tools/                                # 开发工具
└── docs/                                 # 开发文档
```

## 接口规范

### 7. 区域加载接口

#### IRegionLoader 接口定义
```typescript
interface IRegionLoader {
  /**
   * 加载指定区域的地图数据
   * @param regionId 区域标识符
   * @param options 加载选项
   * @returns Promise<RegionData> 区域数据
   */
  loadRegion(regionId: string, options?: LoadOptions): Promise<RegionData>;

  /**
   * 卸载指定区域的地图数据
   * @param regionId 区域标识符
   */
  unloadRegion(regionId: string): Promise<void>;

  /**
   * 检查区域是否已加载
   * @param regionId 区域标识符
   * @returns boolean 是否已加载
   */
  isRegionLoaded(regionId: string): boolean;

  /**
   * 获取已加载的区域列表
   * @returns string[] 已加载区域ID列表
   */
  getLoadedRegions(): string[];

  /**
   * 预加载指定区域
   * @param regionId 区域标识符
   */
  preloadRegion(regionId: string): Promise<void>;
}

interface LoadOptions {
  priority?: 'high' | 'normal' | 'low';
  preloadConnections?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative';
}
```

#### RegionLoader 实现示例
```typescript
class RegionLoader implements IRegionLoader {
  private regionCache: Map<string, RegionData> = new Map();
  private loadingPromises: Map<string, Promise<RegionData>> = new Map();
  private config: RegionLoaderConfig;

  constructor(config: RegionLoaderConfig) {
    this.config = config;
  }

  async loadRegion(regionId: string, options: LoadOptions = {}): Promise<RegionData> {
    // 检查是否已在加载中
    if (this.loadingPromises.has(regionId)) {
      return this.loadingPromises.get(regionId)!;
    }

    // 检查是否已在缓存中
    if (this.regionCache.has(regionId)) {
      return this.regionCache.get(regionId)!;
    }

    // 开始加载
    const loadPromise = this.doLoadRegion(regionId, options);
    this.loadingPromises.set(regionId, loadPromise);

    try {
      const regionData = await loadPromise;
      this.regionCache.set(regionId, regionData);
      return regionData;
    } finally {
      this.loadingPromises.delete(regionId);
    }
  }

  private async doLoadRegion(regionId: string, options: LoadOptions): Promise<RegionData> {
    const fileName = `tianjing_${regionId}_district.json`;
    const filePath = path.join(this.config.basePath, 'regions', fileName);

    const rawData = await fs.readFile(filePath, 'utf-8');
    const regionData = JSON.parse(rawData);

    // 验证数据格式
    this.validateRegionData(regionData);

    return regionData;
  }
}
```

### 8. 连接解析接口

#### IConnectionResolver 接口定义
```typescript
interface IConnectionResolver {
  /**
   * 解析房间连接
   * @param sourceRoomId 源房间ID
   * @param direction 方向
   * @returns Promise<ResolvedConnection | null> 解析后的连接信息
   */
  resolveConnection(
    sourceRoomId: string,
    direction: string
  ): Promise<ResolvedConnection | null>;

  /**
   * 获取跨区域连接列表
   * @param regionId 区域ID
   * @returns Promise<CrossRegionConnection[]> 跨区域连接列表
   */
  getCrossRegionConnections(regionId: string): Promise<CrossRegionConnection[]>;

  /**
   * 查找两个区域间的所有连接
   * @param fromRegion 源区域
   * @param toRegion 目标区域
   * @returns Promise<RegionConnection[]> 连接列表
   */
  findConnectionsBetweenRegions(
    fromRegion: string,
    toRegion: string
  ): Promise<RegionConnection[]>;
}

interface ResolvedConnection {
  connectionId: string;
  targetRoomId: string;
  targetRegion?: string;
  requiresLoading: boolean;
  loadingOptions?: LoadOptions;
  connectionType: ConnectionType;
}
```

### 9. 区域管理接口

#### IRegionManager 接口定义
```typescript
interface IRegionManager {
  /**
   * 获取区域信息
   * @param regionId 区域ID
   * @returns Promise<RegionInfo | null> 区域信息
   */
  getRegionInfo(regionId: string): Promise<RegionInfo | null>;

  /**
   * 获取所有区域列表
   * @returns Promise<RegionInfo[]> 区域信息列表
   */
  getAllRegions(): Promise<RegionInfo[]>;

  /**
   * 检查房间是否属于指定区域
   * @param roomId 房间ID
   * @param regionId 区域ID
   * @returns Promise<boolean> 是否属于该区域
   */
  isRoomInRegion(roomId: string, regionId: string): Promise<boolean>;

  /**
   * 查找房间所属区域
   * @param roomId 房间ID
   * @returns Promise<string | null> 区域ID
   */
  findRoomRegion(roomId: string): Promise<string | null>;

  /**
   * 获取区域统计信息
   * @param regionId 区域ID
   * @returns Promise<RegionStats> 区域统计信息
   */
  getRegionStats(regionId: string): Promise<RegionStats>;
}

interface RegionInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  roomCount: number;
  connectedRegions: string[];
  specialBuildings: string[];
  metadata: RegionMetadata;
}
```

## 数据格式标准

### 10. JSON 格式规范

#### 缩进和格式化
```json
{
  "region": {
    "id": "imperial",
    "name": "皇城区"
  },
  "locations": [
    {
      "id": "imperial_palace",
      "name": "皇宫",
      "rooms": [
        {
          "id": "tj_imperial_throne_room",
          "name": "金銮殿",
          "exits": [
            {
              "direction": "south",
              "targetRoomId": "tj_imperial_court_gate",
              "description": "南面是宫廷正门"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 字段命名规范
- 使用驼峰命名法 (camelCase)
- ID字段使用小写字母和下划线
- 布尔值字段使用 is/has/can 前缀

#### 数据类型规范
- 所有数字使用明确类型 (整数或浮点数)
- 布尔值必须显式指定 true/false
- 日期时间使用 ISO 8601 格式
- 地理坐标使用数字数组 [x, y, z]

### 11. 版本控制规范

#### 数据版本格式
```json
{
  "metadata": {
    "version": "1.2.0",
    "formatVersion": "2.0",
    "compatibility": {
      "minEngineVersion": "1.0.0",
      "maxEngineVersion": "2.0.0"
    },
    "changelog": [
      "新增南门商业区连接",
      "优化皇宫内部布局",
      "修复居民区房间坐标错误"
    ]
  }
}
```

#### 版本兼容性矩阵
| 地图版本 | 引擎版本 | 兼容性 |
|---------|---------|--------|
| 1.0.x | 1.0.x | 完全兼容 |
| 1.1.x | 1.0.x | 向后兼容 |
| 2.0.x | 1.0.x | 不兼容 |

## 错误处理规范

### 12. 异常处理标准

#### 标准错误类型
```typescript
enum RegionErrorType {
  REGION_NOT_FOUND = 'REGION_NOT_FOUND',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  INVALID_CONNECTION = 'INVALID_CONNECTION',
  LOADING_FAILED = 'LOADING_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

class RegionError extends Error {
  constructor(
    public type: RegionErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RegionError';
  }
}
```

#### 错误处理示例
```typescript
async function movePlayerBetweenRooms(
  playerId: string,
  sourceRoomId: string,
  direction: string
): Promise<void> {
  try {
    const connection = await connectionResolver.resolveConnection(
      sourceRoomId,
      direction
    );

    if (!connection) {
      throw new RegionError(
        RegionErrorType.INVALID_CONNECTION,
        `No connection found in direction ${direction} from room ${sourceRoomId}`
      );
    }

    if (connection.requiresLoading) {
      await regionLoader.loadRegion(connection.targetRegion!, {
        priority: 'high'
      });
    }

    // 执行移动逻辑
    await performPlayerMove(playerId, connection);

  } catch (error) {
    if (error instanceof RegionError) {
      logger.error('Region movement failed', {
        type: error.type,
        details: error.details,
        playerId,
        sourceRoomId,
        direction
      });
      throw error;
    }
    throw new RegionError(
      RegionErrorType.LOADING_FAILED,
      'Unexpected error during region movement',
      error
    );
  }
}
```

## 性能标准

### 13. 性能要求

#### 加载性能指标
- 区域加载时间: < 500ms (小区域), < 2000ms (大区域)
- 连接查找时间: < 50ms
- 内存占用: < 50MB per loaded region
- 并发加载: 支持同时加载 3 个区域

#### 缓存策略
- LRU缓存，最大缓存 4 个区域
- 连接索引缓存，命中率 > 95%
- 区域预加载，基于玩家位置预测

#### 监控指标
```typescript
interface PerformanceMetrics {
  regionLoadTime: number;      // 区域加载时间 (ms)
  connectionResolveTime: number; // 连接解析时间 (ms)
  cacheHitRate: number;        // 缓存命中率 (0-1)
  memoryUsage: number;         // 内存使用量 (MB)
  activeConnections: number;   // 活跃连接数
  errorRate: number;           // 错误率 (0-1)
}
```

## 测试规范

### 14. 单元测试标准

#### 测试文件命名
```
RegionLoader.test.ts
ConnectionResolver.test.ts
RegionManager.test.ts
```

#### 测试覆盖要求
- 接口覆盖率: 100%
- 代码行覆盖率: > 90%
- 分支覆盖率: > 85%

#### 测试数据文件命名
```
test_data/
├── regions/
│   ├── test_imperial_district.json
│   └── test_commercial_district.json
└── configs/
    └── test_regions_config.json
```

### 15. 集成测试标准

#### 端到端测试场景
1. 跨区域移动完整流程
2. 区域加载和卸载
3. 连接解析和验证
4. 错误处理和恢复
5. 性能压力测试

这些规范确保了代码质量、系统性能和团队协作效率。