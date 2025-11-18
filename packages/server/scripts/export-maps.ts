/**
 * 将硬编码的地图数据导出为JSON文件
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// 地图数据按区域分组
const maps = {
  // 山林区域
  area_forest: {
    id: 'area_forest',
    name: '青云山-山林',
    description: '青云山的山林区域',
    level: 3,
    rooms: [
      {
        id: 'room_009',
        name: '青云山-山林入口',
        description: '进入青云山的山林,树木渐渐茂密起来。空气中弥漫着草木的清香,偶尔传来鸟鸣声。',
        exits: [
          { direction: 'north', targetRoomId: 'room_008', isLocked: false, description: '北面回到官道' },
          { direction: 'east', targetRoomId: 'room_010', isLocked: false, description: '东面深入山林' },
          { direction: 'west', targetRoomId: 'room_011', isLocked: false, description: '西面是竹林' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'forest'
        }
      },
      {
        id: 'room_010',
        name: '青云山-密林深处',
        description: '这里已是山林深处,参天古树遮天蔽日。地面上长满了各种灵草,似乎有妖兽出没的痕迹。',
        exits: [
          { direction: 'west', targetRoomId: 'room_009', isLocked: false, description: '西面回到山林入口' },
          { direction: 'south', targetRoomId: 'room_012', isLocked: false, description: '南面是山谷' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'forest'
        }
      },
      {
        id: 'room_011',
        name: '青云山-翠竹林',
        description: '一片幽静的竹林,竹叶沙沙作响。空气清新,是修炼的好地方。',
        exits: [
          { direction: 'east', targetRoomId: 'room_009', isLocked: false, description: '东面回到山林入口' },
          { direction: 'south', targetRoomId: 'room_013', isLocked: false, description: '南面是溪涧' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'forest'
        }
      },
      {
        id: 'room_012',
        name: '青云山-幽谷',
        description: '一处幽深的山谷,谷中雾气缭绕。据说谷中有强大的妖兽盘踞。',
        exits: [
          { direction: 'north', targetRoomId: 'room_010', isLocked: false, description: '北面回到密林' },
          { direction: 'south', targetRoomId: 'room_014', isLocked: false, description: '南面是山洞入口' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_013',
        name: '青云山-清溪涧',
        description: '一条清澈的溪流从山上流下,溪水冰凉甘甜。溪边生长着一些珍贵的水生灵草。',
        exits: [
          { direction: 'north', targetRoomId: 'room_011', isLocked: false, description: '北面回到竹林' },
          { direction: 'east', targetRoomId: 'room_012', isLocked: false, description: '东面是幽谷' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'water'
        }
      },
      {
        id: 'room_014',
        name: '青云山-神秘洞府',
        description: '一个隐秘的山洞,洞口被藤蔓遮掩。洞内传出阵阵寒气,似乎是某位前辈的洞府。',
        exits: [
          { direction: 'north', targetRoomId: 'room_012', isLocked: false, description: '北面回到幽谷' },
          { direction: 'down', targetRoomId: 'room_015', isLocked: false, description: '向下深入洞府' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      }
    ]
  },

  // 洞府区域
  area_cave: {
    id: 'area_cave',
    name: '洞府',
    description: '前辈留下的神秘洞府',
    level: 4,
    rooms: [
      {
        id: 'room_015',
        name: '洞府-前厅',
        description: '洞府的前厅,墙壁上刻满了符文。地面干净整洁,显然有人经常打理。',
        exits: [
          { direction: 'up', targetRoomId: 'room_014', isLocked: false, description: '向上回到洞口' },
          { direction: 'south', targetRoomId: 'room_016', isLocked: false, description: '南面是练功房' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_016',
        name: '洞府-练功房',
        description: '一个宽敞的石室,地面铺着蒲团。墙上刻着各种功法口诀,灵气充沛。',
        exits: [
          { direction: 'north', targetRoomId: 'room_015', isLocked: false, description: '北面回到前厅' },
          { direction: 'east', targetRoomId: 'room_017', isLocked: false, description: '东面是藏经阁' },
          { direction: 'west', targetRoomId: 'room_018', isLocked: false, description: '西面是丹房' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_017',
        name: '洞府-藏经阁',
        description: '洞府的藏经阁,书架上摆满了古籍。这里收藏着前辈留下的功法秘笈。',
        exits: [
          { direction: 'west', targetRoomId: 'room_016', isLocked: false, description: '西面回到练功房' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_018',
        name: '洞府-炼丹房',
        description: '炼丹房内丹炉静立,墙上挂着各种炼丹工具。空气中残留着丹香。',
        exits: [
          { direction: 'east', targetRoomId: 'room_016', isLocked: false, description: '东面回到练功房' },
          { direction: 'south', targetRoomId: 'room_019', isLocked: false, description: '南面是密室' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_019',
        name: '洞府-密室',
        description: '一个隐秘的密室,四周布满禁制。据说这里藏着洞府主人最珍贵的宝物。',
        exits: [
          { direction: 'north', targetRoomId: 'room_018', isLocked: false, description: '北面回到丹房' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_020',
        name: '洞府-灵泉',
        description: '洞府深处的一眼灵泉,泉水清澈见底,蕴含浓郁的灵气。在此修炼事半功倍。',
        exits: [
          { direction: 'north', targetRoomId: 'room_016', isLocked: false, description: '北面回到练功房' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'water'
        }
      }
    ]
  },

  // 山峰区域
  area_mountain: {
    id: 'area_mountain',
    name: '青云山-山峰',
    description: '青云山的高峰区域',
    level: 5,
    rooms: [
      {
        id: 'room_021',
        name: '青云山-山脚',
        description: '青云山的山脚,一条石阶向上延伸。抬头可见山峰耸入云霄。',
        exits: [
          { direction: 'west', targetRoomId: 'room_009', isLocked: false, description: '西面回到山林' },
          { direction: 'up', targetRoomId: 'room_022', isLocked: false, description: '沿石阶向上' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_022',
        name: '青云山-半山腰',
        description: '爬到半山腰,这里视野开阔,可以俯瞰整个青云镇。山风凛冽。',
        exits: [
          { direction: 'down', targetRoomId: 'room_021', isLocked: false, description: '向下回到山脚' },
          { direction: 'up', targetRoomId: 'room_023', isLocked: false, description: '继续向上' },
          { direction: 'east', targetRoomId: 'room_025', isLocked: false, description: '东面是悬崖' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_023',
        name: '青云山-山顶',
        description: '青云山的山顶,云雾缭绕。这里灵气浓郁,是修炼的绝佳之地。',
        exits: [
          { direction: 'down', targetRoomId: 'room_022', isLocked: false, description: '向下回到半山腰' },
          { direction: 'north', targetRoomId: 'room_024', isLocked: false, description: '北面是观星台' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_024',
        name: '青云山-观星台',
        description: '山顶的观星台,由青石筑成。据说在此可以观星悟道,领悟天地至理。',
        exits: [
          { direction: 'south', targetRoomId: 'room_023', isLocked: false, description: '南面回到山顶' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: false,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_025',
        name: '青云山-断崖',
        description: '一处险峻的断崖,下面是万丈深渊。崖壁上生长着一些稀有灵草。',
        exits: [
          { direction: 'west', targetRoomId: 'room_022', isLocked: false, description: '西面回到半山腰' },
          { direction: 'down', targetRoomId: 'room_026', isLocked: false, description: '小心攀爬下去' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      },
      {
        id: 'room_026',
        name: '断崖-崖底',
        description: '断崖的崖底,四周环绕着崖壁。这里人迹罕至,灵气却异常浓郁。',
        exits: [
          { direction: 'up', targetRoomId: 'room_025', isLocked: false, description: '攀爬回到断崖' },
          { direction: 'south', targetRoomId: 'room_027', isLocked: false, description: '南面是地下河' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      }
    ]
  },

  // 地下秘境
  area_underground: {
    id: 'area_underground',
    name: '地下秘境',
    description: '隐藏在地下的神秘区域',
    level: 6,
    rooms: [
      {
        id: 'room_027',
        name: '地下河',
        description: '一条地下暗河,河水冰冷刺骨。河水中隐约有灵光闪烁,似乎有宝物。',
        exits: [
          { direction: 'north', targetRoomId: 'room_026', isLocked: false, description: '北面回到崖底' },
          { direction: 'east', targetRoomId: 'room_028', isLocked: false, description: '东面是地下洞窟' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'water'
        }
      },
      {
        id: 'room_028',
        name: '地下洞窟',
        description: '一个巨大的地下洞窟,钟乳石倒悬。洞内回音阵阵,深不可测。',
        exits: [
          { direction: 'west', targetRoomId: 'room_027', isLocked: false, description: '西面回到地下河' },
          { direction: 'south', targetRoomId: 'room_029', isLocked: false, description: '南面是古老祭坛' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      },
      {
        id: 'room_029',
        name: '远古祭坛',
        description: '一座远古时期的祭坛,布满了神秘符文。祭坛中央有一个传送阵,似乎通往某个秘境。',
        exits: [
          { direction: 'north', targetRoomId: 'room_028', isLocked: false, description: '北面回到洞窟' },
          { direction: 'south', targetRoomId: 'room_030', isLocked: false, description: '激活传送阵' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'cave'
        }
      }
    ]
  },

  // 虚空秘境
  area_secret: {
    id: 'area_secret',
    name: '虚空秘境',
    description: '远古大能留下的试炼之地',
    level: 10,
    rooms: [
      {
        id: 'room_030',
        name: '虚空秘境',
        description: '一个神秘的虚空秘境,四周星光点点。这里时空扭曲,充满了未知的机遇和危险。据说是远古大能留下的试炼之地。',
        exits: [
          { direction: 'north', targetRoomId: 'room_029', isLocked: false, description: '回到祭坛' }
        ],
        npcs: [],
        items: [],
        properties: {
          isDark: true,
          isSafe: false,
          allowsPvP: true,
          allowsTeleport: false,
          terrain: 'mountain'
        }
      }
    ]
  }
};

// 创建输出目录
const dataDir = join(process.cwd(), 'data', 'maps');
mkdirSync(dataDir, { recursive: true });

// 导出所有地图
for (const [filename, mapData] of Object.entries(maps)) {
  const filepath = join(dataDir, `${filename}.json`);
  writeFileSync(filepath, JSON.stringify(mapData, null, 2), 'utf-8');
  console.log(`Created: ${filepath}`);
}

console.log(`\nSuccessfully exported ${Object.keys(maps).length} maps!`);
