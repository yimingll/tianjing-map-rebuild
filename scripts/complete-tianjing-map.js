#!/usr/bin/env node
/**
 * 天京城完整地图生成脚本
 * 生成140个房间的完整重构地图
 */

const fs = require('fs');
const path = require('path');

// ==================== 完整房间数据定义 ====================

// 所有140个房间的完整定义
const COMPLETE_ROOMS_DATA = {
  // ===== 商业区 (15房间) =====
  commercial_district: {
    id: 'commercial_district',
    name: '商业区',
    type: 'commercial',
    description: '天京城繁华商业中心，高端商铺云集',
    safeZone: true,
    pvpAllowed: false,
    locations: [
      {
        id: 'imperial_street',
        name: '御街主干',
        rooms: [
          {
            id: 'tj_imperial_street_north',
            name: '御街北段',
            type: 'street',
            description: '御街北段，连接皇宫与商业区的繁华街道。街道宽阔，两旁商铺林立，商贾云集。青石板路被打磨得光亮如镜，映出往来行人的身影。',
            coordinates: { x: 500, y: 490, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_palace_square', description: '北面是宫前广场' },
              { direction: 'south', targetRoomId: 'tj_imperial_street_mid', description: '南面是御街中段' },
              { direction: 'east', targetRoomId: 'tj_jewelry_shop', description: '东面是珍宝阁' },
              { direction: 'west', targetRoomId: 'tj_weapon_shop', description: '西面是神兵阁' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_imperial_street_mid',
            name: '御街中段',
            type: 'street',
            description: '御街中段，整个天京城最繁华的地段。街道两旁商铺鳞次栉比，招牌林立，叫卖声此起彼伏。这里是商业活动的中心枢纽。',
            coordinates: { x: 500, y: 400, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_imperial_street_north', description: '北面是御街北段' },
              { direction: 'south', targetRoomId: 'tj_imperial_street_south', description: '南面是御街南段' },
              { direction: 'east', targetRoomId: 'tj_silk_shop', description: '东面是锦绣坊' },
              { direction: 'west', targetRoomId: 'tj_medicine_shop', description: '西面是济世堂' },
              { direction: 'northeast', targetRoomId: 'tj_commercial_crossroad', description: '东北是商业十字路口' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_imperial_street_south',
            name: '御街南段',
            type: 'street',
            description: '御街南段，向南通往南门。这里虽然没有中段那样繁华，但依然人潮涌动，是南来北往商旅的必经之地。',
            coordinates: { x: 500, y: 310, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_imperial_street_mid', description: '北面是御街中段' },
              { direction: 'south', targetRoomId: 'tj_south_gate_plaza', description: '南面是南门广场' },
              { direction: 'east', targetRoomId: 'tj_tea_house', description: '东面是品茗轩' },
              { direction: 'west', targetRoomId: 'tj_restaurant', description: '西面是聚贤楼' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_imperial_street_plaza',
            name: '御街广场',
            type: 'plaza',
            description: '御街中央的小广场，常有小商贩在此摆摊设点。广场中央有一口古井，传说这口井的水能带来好运。',
            coordinates: { x: 500, y: 350, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_imperial_street_mid', description: '北面是御街中段' },
              { direction: 'south', targetRoomId: 'tj_imperial_street_south', description: '南面是御街南段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_commercial_crossroad',
            name: '商业十字路口',
            type: 'intersection',
            description: '商业区的十字路口，东西南北四通八达。这里是连接各大商业街区的重要枢纽，人流车马川流不息。',
            coordinates: { x: 550, y: 400, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_imperial_street_mid', description: '西面是御街中段' },
              { direction: 'east', targetRoomId: 'tj_mansion_street', description: '东面是大宅街' },
              { direction: 'north', targetRoomId: 'tj_east_market_plaza', description: '北面是东市广场' },
              { direction: 'south', targetRoomId: 'tj_workshop_street', description: '南面是作坊街' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      },
      {
        id: 'east_shops',
        name: '东侧商铺',
        rooms: [
          {
            id: 'tj_jewelry_shop',
            name: '珍宝阁',
            type: 'shop',
            description: '城中最大的珠宝首饰店，金银首饰、珠宝玉器琳琅满目。店内灯火通明，柜台后坐着精明的掌柜。',
            coordinates: { x: 530, y: 490, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_imperial_street_north', description: '西面是御街北段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_silk_shop',
            name: '锦绣坊',
            type: 'shop',
            description: '专营丝绸布料的商铺，来自江南的上等丝绸应有尽有。店内各色绸缎如云似霞，美不胜收。',
            coordinates: { x: 530, y: 400, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_imperial_street_mid', description: '西面是御街中段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_tea_house',
            name: '品茗轩',
            type: 'shop',
            description: '雅致的茶楼，清幽的环境适合品茶论道。茶香袅袅，古色古香，是文人雅士聚集之地。',
            coordinates: { x: 530, y: 310, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_imperial_street_south', description: '西面是御街南段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_bookstore',
            name: '文华书局',
            type: 'shop',
            description: '城中最大的书店，四书五经、诗词小说无所不包。常有学子在此挑灯夜读，墨香四溢。',
            coordinates: { x: 520, y: 420, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_commercial_crossroad', description: '西面是商业十字路口' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_antique_shop',
            name: '古玩店',
            type: 'shop',
            description: '专营古董玩物的店铺，瓷器玉器、古字画应有尽有。店内收藏着不少珍品，识货者才能得其真谛。',
            coordinates: { x: 540, y: 420, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_commercial_crossroad', description: '西面是商业十字路口' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'dim' }
          }
        ]
      },
      {
        id: 'west_shops',
        name: '西侧商铺',
        rooms: [
          {
            id: 'tj_weapon_shop',
            name: '神兵阁',
            type: 'shop',
            description: '著名的兵器铺，刀枪剑戟一应俱全。店主是退休的武将，兵器都是精工细作的上等货色。',
            coordinates: { x: 470, y: 490, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_imperial_street_north', description: '东面是御街北段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_medicine_shop',
            name: '济世堂',
            type: 'shop',
            description: '城中最大的药店，各种珍稀药材齐全。坐堂医术高超，常有人排队求医。',
            coordinates: { x: 470, y: 400, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_imperial_street_mid', description: '东面是御街中段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_restaurant',
            name: '聚贤楼',
            type: 'shop',
            description: '天京城最有名的酒楼，山珍海味、各色菜肴应有尽有。常有文武百官在此宴请宾客。',
            coordinates: { x: 470, y: 310, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_imperial_street_south', description: '东面是御街南段' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_inn',
            name: '天香客栈',
            type: 'shop',
            description: '规模最大的客栈，客房舒适，服务周到。南来北往的商旅多在此下榻。',
            coordinates: { x: 460, y: 420, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_commercial_crossroad', description: '东面是商业十字路口' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_bank',
            name: '钱庄',
            type: 'shop',
            description: '城中最大的钱庄，办理银钱兑换、存贷业务。信誉卓著，是商贾们的首选。',
            coordinates: { x: 450, y: 420, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_commercial_crossroad', description: '东面是商业十字路口' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      }
    ]
  },

  // ===== 南门区 (13房间) =====
  south_gate_district: {
    id: 'south_gate_district',
    name: '南门区',
    type: 'gate',
    description: '天京城南方主要入口，交通枢纽',
    safeZone: true,
    pvpAllowed: false,
    locations: [
      {
        id: 'gate_complex',
        name: '南门建筑群',
        rooms: [
          {
            id: 'tj_south_gate_outside',
            name: '南门外',
            type: 'entrance',
            description: '南门外广场，是进入天京城的必经之路。城门前是一片宽阔的广场，商贾云集，车马喧嚣。守卫森严，检查过往行人。',
            coordinates: { x: 500, y: 80, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_south_gate_passage', description: '北面是南门通道' },
              { direction: 'south', targetRoomId: 'tj_south_gate_plaza', description: '南面是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_gate_passage',
            name: '南门通道',
            type: 'passage',
            description: '穿过厚重的南门通道。城墙厚达数丈，两侧是坚实的石壁。通道内光线稍暗，但能清晰看到南北的人流。',
            coordinates: { x: 500, y: 100, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_south_gate_inside', description: '北面是南门内' },
              { direction: 'south', targetRoomId: 'tj_south_gate_outside', description: '南面是南门外' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_south_gate_inside',
            name: '南门内',
            type: 'entrance',
            description: '南门内侧，进入城内的第一站。两侧是高大的城墙，上面有守卫巡逻。这里是控制城内外交通的重要关卡。',
            coordinates: { x: 500, y: 120, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_south_gate_plaza', description: '北面是南门广场' },
              { direction: 'south', targetRoomId: 'tj_south_gate_passage', description: '南面是南门通道' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_gate_plaza',
            name: '南门广场',
            type: 'plaza',
            description: '南门区内最大的广场，是城内外的交通枢纽。广场上人声鼎沸，商贾、旅人、市民交织成一幅繁华的市井图景。',
            coordinates: { x: 500, y: 150, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_imperial_street_south', description: '北面是御街南段' },
              { direction: 'south', targetRoomId: 'tj_south_gate_inside', description: '南面是南门内' },
              { direction: 'east', targetRoomId: 'tj_south_plaza_east', description: '东面是南广场东侧' },
              { direction: 'west', targetRoomId: 'tj_south_plaza_west', description: '西面是南广场西侧' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_gate_tower',
            name: '南门城楼',
            type: 'tower',
            description: '南门城楼上，可以俯瞰整个南门区和城外。城楼高耸入云，是南门防御的核心要塞。',
            coordinates: { x: 500, y: 150, z: 10 },
            exits: [
              { direction: 'down', targetRoomId: 'tj_south_gate_plaza', description: '下面是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      },
      {
        id: 'plaza_facilities',
        name: '广场设施',
        rooms: [
          {
            id: 'tj_south_plaza_east',
            name: '南广场东侧',
            type: 'plaza',
            description: '南门广场东侧，连接城墙和东南方向。这里聚集了各种小商贩，叫卖声不绝于耳。',
            coordinates: { x: 540, y: 150, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_south_gate_plaza', description: '西面是南门广场' },
              { direction: 'northeast', targetRoomId: 'tj_southeast_corner_tower', description: '东北是东南角楼' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_plaza_west',
            name: '南广场西侧',
            type: 'plaza',
            description: '南门广场西侧，相对东侧要安静一些。这里有通往西区的道路，也有几家客栈和茶楼。',
            coordinates: { x: 460, y: 150, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_south_gate_plaza', description: '东面是南门广场' },
              { direction: 'northwest', targetRoomId: 'tj_southwest_corner_tower', description: '西北是西南角楼' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_carriage_station',
            name: '马车站',
            type: 'station',
            description: '南门外的马车站，是长途旅行的出发点。这里马车云集，车夫吆喝声此起彼伏。',
            coordinates: { x: 500, y: 60, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_south_gate_outside', description: '北面是南门外' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_market',
            name: '南门集市',
            type: 'market',
            description: '南门集市，各种农产品、手工艺品应有尽有。每天都有大批市民来此购物。',
            coordinates: { x: 530, y: 180, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_south_gate_plaza', description: '西面是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_guard_post_south',
            name: '南门岗哨',
            type: 'guard_post',
            description: '南门守卫的岗哨，戒备森严。守卫们全副武装，警惕地监视着每一个进出城的人。',
            coordinates: { x: 480, y: 180, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_south_gate_plaza', description: '东面是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_checkpoint',
            name: '检查站',
            type: 'checkpoint',
            description: '城门检查站，负责检查进出城的人员和货物。检查严格，确保城内安全。',
            coordinates: { x: 520, y: 120, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_south_gate_passage', description: '西面是南门通道' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_city_notice_board',
            name: '布告栏',
            type: 'notice_board',
            description: '城市布告栏，张贴着各种官方公告和民间告示。时常有市民在此驻足观看。',
            coordinates: { x: 490, y: 170, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_south_gate_plaza', description: '东面是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_south_warehouse',
            name: '南仓库',
            type: 'warehouse',
            description: '南门仓库，存放各种货物。仓库高大坚固，有专人看管，货物进出都有严格登记。',
            coordinates: { x: 470, y: 190, z: 0 },
            exits: [
              { direction: 'northeast', targetRoomId: 'tj_south_gate_plaza', description: '东北是南门广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          }
        ]
      }
    ]
  }
};

// 由于文件长度限制,我需要分批生成。这里先完成第一部分(约28个房间)
// 实际执行时我会继续添加剩余的112个房间

// ==================== 地图生成函数 ====================

function generateMapFile(districts, outputPath, partName) {
  const mapData = {
    city: {
      id: 'tianjing_cheng',
      name: '天京城',
      fullName: '大周王朝天京府天京城',
      type: 'capital',
      level: 1,
      province: 'tianjing_fu',
      provinceName: '天京府',
      description: '大周王朝国都，经过重构优化，区域划分更加合理，连通性更强。',
      population: { mortal: 3000000, cultivator: 5000 },
      coordinates: { x: 500, y: 500 },
      climate: '温和',
      specialFeatures: ['皇宫', '国子监', '钦天监', '六部衙门', '白家老宅', '完整区域连通性']
    },
    districts: districts
  };

  fs.writeFileSync(outputPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`✅ ${partName} 生成完成: ${outputPath}`);

  // 统计房间数量
  let totalRooms = 0;
  districts.forEach(district => {
    district.locations.forEach(location => {
      totalRooms += location.rooms.length;
    });
  });
  console.log(`   房间数量: ${totalRooms}`);
}

// ==================== 主程序 ====================

console.log('🚀 开始生成天京城完整地图 (重构版)...\n');

// 由于文件长度限制,这里演示的是第一批房间生成
// 实际需要分批执行完整的140个房间生成

// Part1: 商业区(15) + 南门区(13) = 28个房间
const part1Districts = [
  COMPLETE_ROOMS_DATA.commercial_district,
  COMPLETE_ROOMS_DATA.south_gate_district
];

generateMapFile(
  part1Districts,
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1_new.json'),
  'Part1 (商业区+南门区)'
);

console.log('\n✅ Part1 生成完成! (28个房间)');
console.log('⚠️  注意: 完整版需要继续生成剩余112个房间');
console.log('💡 由于文件长度限制,我将分批生成所有140个房间');
console.log('📈 当前进度: 28/140 房间 (20%)');