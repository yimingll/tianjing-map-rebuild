#!/usr/bin/env node
/**
 * 天京城地图生成脚本
 * 根据重构设计文档自动生成140个房间的完整地图
 */

const fs = require('fs');
const path = require('path');

// ==================== 房间数据定义 ====================

// 根据设计文档定义所有140个房间
const ROOMS_DATA = {
  // ===== 皇城区 (25房间) =====
  imperial_district: {
    id: 'imperial_district',
    name: '皇城区',
    type: 'imperial',
    description: '大周王朝权力核心，皇宫所在',
    locations: [
      {
        id: 'palace_plaza',
        name: '宫殿广场区',
        rooms: [
          {
            id: 'tj_palace_square',
            name: '宫前广场',
            type: 'plaza',
            description: '你站在巍峨的皇宫前广场。宽阔的广场铺着青白玉石，纹理清晰可见。正北方是高大的皇宫正门，门楣上悬挂着"天京皇宫"四个金色大字。广场东西两侧各有一座石碑，上刻历代帝王功绩。此处是整个天京城的核心枢纽，向南可达商业区，向东西可通往城区各处。',
            coordinates: { x: 500, y: 575, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_palace_gate', description: '北面是皇宫正门' },
              { direction: 'south', targetRoomId: 'tj_imperial_street_north', description: '南面是御街北段' },
              { direction: 'east', targetRoomId: 'tj_east_palace_plaza', description: '东面是东宫广场' },
              { direction: 'west', targetRoomId: 'tj_west_palace_plaza', description: '西面是西宫广场' },
              { direction: 'northeast', targetRoomId: 'tj_imperial_academy_gate', description: '东北方向是国子监' },
              { direction: 'northwest', targetRoomId: 'tj_observatory_gate', description: '西北方向是钦天监' }
            ],
            properties: { safeZone: true, pvpAllowed: false, canTeleport: true, lightLevel: 'bright' }
          },
          {
            id: 'tj_palace_gate',
            name: '皇宫正门',
            type: 'gate',
            description: '巨大的宫门矗立在你面前，高达三丈，通体涂成朱红色，门上铺着铜钉，熠熠生辉。门前站立着身穿金甲的禁军，目光警惕。门楣上悬挂着九龙吐珠的匾额。',
            coordinates: { x: 500, y: 600, z: 0 },
            exits: [
              { direction: 'north', targetRoomId: 'tj_throne_hall', description: '北面是金銮殿' },
              { direction: 'south', targetRoomId: 'tj_palace_square', description: '南面是宫前广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_east_palace_plaza',
            name: '东宫广场',
            type: 'plaza',
            description: '皇宫东侧的小广场，相对宫前广场要安静许多。东面可通往国子监，是文人学子常来之地。',
            coordinates: { x: 550, y: 575, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_palace_square', description: '西面是宫前广场' },
              { direction: 'east', targetRoomId: 'tj_east_chang_an_street', description: '东面是东长安街' },
              { direction: 'north', targetRoomId: 'tj_imperial_academy_gate', description: '北面是国子监' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_west_palace_plaza',
            name: '西宫广场',
            type: 'plaza',
            description: '皇宫西侧的小广场。西面通往钦天监，时常能看到身穿道袍的钦天监官员往来。',
            coordinates: { x: 450, y: 575, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_palace_square', description: '东面是宫前广场' },
              { direction: 'west', targetRoomId: 'tj_west_chang_an_street', description: '西面是西长安街' },
              { direction: 'north', targetRoomId: 'tj_observatory_gate', description: '北面是钦天监' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_ceremonial_platform',
            name: '典礼台',
            type: 'platform',
            description: '皇宫广场东侧的高台，用于举行重大典礼。台高一丈，四周雕刻着龙凤图案，庄严肃穆。',
            coordinates: { x: 530, y: 590, z: 0 },
            exits: [
              { direction: 'down', targetRoomId: 'tj_east_palace_plaza', description: '下面是东宫广场' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_imperial_garden_entrance',
            name: '御花园入口',
            type: 'entrance',
            description: '一座精致的月洞门，上书"御花园"三字。门内隐约可见亭台楼阁，花木扶疏。',
            coordinates: { x: 520, y: 610, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_palace_gate', description: '南面是皇宫正门' },
              { direction: 'north', targetRoomId: 'tj_inner_court', description: '北面是内廷' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      },
      {
        id: 'palace_core',
        name: '皇宫核心区',
        rooms: [
          {
            id: 'tj_throne_hall',
            name: '金銮殿',
            type: 'hall',
            description: '大周王朝最高权力殿堂。殿内金碧辉煌，正中高台上摆放着九龙宝座，上方悬挂"正大光明"匾额。两侧列有文武百官的品位牌位。',
            coordinates: { x: 500, y: 625, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_palace_gate', description: '南面是宫门' },
              { direction: 'east', targetRoomId: 'tj_emperor_study', description: '东面是御书房' },
              { direction: 'west', targetRoomId: 'tj_inner_court', description: '西面是内廷' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_emperor_study',
            name: '御书房',
            type: 'study',
            description: '皇帝批阅奏章、读书修身之所。房间布置简洁雅致，书架上摆满经史子集，书案上笔墨纸砚齐全。',
            coordinates: { x: 520, y: 625, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_throne_hall', description: '西面是金銮殿' },
              { direction: 'north', targetRoomId: 'tj_imperial_library', description: '北面是皇家藏书楼' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_imperial_treasury',
            name: '内库',
            type: 'treasury',
            description: '皇室宝库，存放着无数珍宝。库房戒备森严，禁军把守，闲人不得入内。',
            coordinates: { x: 510, y: 635, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_emperor_study', description: '南面是御书房' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'dim' }
          },
          {
            id: 'tj_imperial_armory',
            name: '武器库',
            type: 'armory',
            description: '皇家武器库，收藏着历代名将使用的兵器。墙上挂满刀枪剑戟，寒光闪烁。',
            coordinates: { x: 490, y: 635, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_throne_hall', description: '南面是金銮殿' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_imperial_library',
            name: '皇家藏书楼',
            type: 'library',
            description: '皇室私藏的珍贵典籍都存放于此。楼高三层，藏书数万卷，包含许多孤本秘籍。',
            coordinates: { x: 530, y: 635, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_emperor_study', description: '南面是御书房' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_inner_court',
            name: '内廷',
            type: 'court',
            description: '皇宫内廷，后宫所在。庭院幽深，廊腰缦回。这里是皇帝和后妃们的生活区域。',
            coordinates: { x: 480, y: 625, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_throne_hall', description: '东面是金銮殿' },
              { direction: 'south', targetRoomId: 'tj_imperial_garden_entrance', description: '南面是御花园入口' },
              { direction: 'north', targetRoomId: 'tj_empress_palace', description: '北面是皇后寝宫' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_empress_palace',
            name: '皇后寝宫',
            type: 'palace',
            description: '皇后居住的宫殿，布置雍容华贵。殿内熏香缭绕，摆设精美的瓷器和玉器。',
            coordinates: { x: 480, y: 640, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_inner_court', description: '南面是内廷' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_imperial_kitchen',
            name: '御膳房',
            type: 'kitchen',
            description: '皇宫膳食烹制之所。厨房宽敞明亮，各种珍稀食材应有尽有，御厨们在此精心烹制皇室膳食。',
            coordinates: { x: 470, y: 630, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_inner_court', description: '东面是内廷' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      },
      {
        id: 'imperial_academy',
        name: '国子监区',
        rooms: [
          {
            id: 'tj_imperial_academy_gate',
            name: '国子监大门',
            type: 'gate',
            description: '国子监正门，门楣上挂着"国子监"金字大匾。这里是大周王朝最高学府，培养官员和学士之地。',
            coordinates: { x: 560, y: 600, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_east_palace_plaza', description: '南面是东宫广场' },
              { direction: 'southwest', targetRoomId: 'tj_palace_square', description: '西南是宫前广场' },
              { direction: 'north', targetRoomId: 'tj_academy_main_hall', description: '北面是国子监大堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_academy_main_hall',
            name: '国子监大堂',
            type: 'hall',
            description: '国子监主堂，用于举行入学仪式和重大考试。堂内设有孔子牌位，两侧悬挂历代名儒画像。',
            coordinates: { x: 560, y: 615, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_imperial_academy_gate', description: '南面是大门' },
              { direction: 'east', targetRoomId: 'tj_academy_library', description: '东面是藏书阁' },
              { direction: 'west', targetRoomId: 'tj_academy_courtyard', description: '西面是庭院' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_academy_library',
            name: '国子监藏书阁',
            type: 'library',
            description: '国子监藏书之所，收藏各类经史典籍。学子们可在此借阅学习。',
            coordinates: { x: 580, y: 615, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_academy_main_hall', description: '西面是大堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_academy_classroom_east',
            name: '东学堂',
            type: 'classroom',
            description: '国子监的讲学之所。堂内设有讲台和座位，墙上挂着"学而时习之"的字幅。',
            coordinates: { x: 570, y: 625, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_academy_main_hall', description: '南面是大堂' },
              { direction: 'west', targetRoomId: 'tj_academy_classroom_west', description: '西面是西学堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_academy_classroom_west',
            name: '西学堂',
            type: 'classroom',
            description: '另一间讲学堂，布置与东学堂相似。这里主要讲授诗词歌赋。',
            coordinates: { x: 550, y: 625, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_academy_main_hall', description: '南面是大堂' },
              { direction: 'east', targetRoomId: 'tj_academy_classroom_east', description: '东面是东学堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_academy_courtyard',
            name: '国子监庭院',
            type: 'courtyard',
            description: '国子监的后庭院，种植着松柏竹梅。学子们课余时常在此散步讨论学问。',
            coordinates: { x: 540, y: 615, z: 0 },
            exits: [
              { direction: 'east', targetRoomId: 'tj_academy_main_hall', description: '东面是大堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          }
        ]
      },
      {
        id: 'observatory',
        name: '钦天监区',
        rooms: [
          {
            id: 'tj_observatory_gate',
            name: '钦天监大门',
            type: 'gate',
            description: '钦天监入口，门上挂着太极八卦图。这里是大周王朝负责观测天象、制定历法的机构。',
            coordinates: { x: 440, y: 600, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_west_palace_plaza', description: '南面是西宫广场' },
              { direction: 'southeast', targetRoomId: 'tj_palace_square', description: '东南是宫前广场' },
              { direction: 'north', targetRoomId: 'tj_observatory_main', description: '北面是观星台' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_observatory_main',
            name: '观星台',
            type: 'observatory',
            description: '钦天监的主要建筑，高台之上架设着浑天仪等观测仪器。夜晚可在此观测星象。',
            coordinates: { x: 440, y: 615, z: 5 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_observatory_gate', description: '南面是大门' },
              { direction: 'down', targetRoomId: 'tj_astrology_hall', description: '下面是占星堂' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
          },
          {
            id: 'tj_astrology_hall',
            name: '占星堂',
            type: 'hall',
            description: '钦天监占星之所。墙上绘着星图，桌上摆放着各种占卜工具。钦天监官员在此推演天象吉凶。',
            coordinates: { x: 440, y: 615, z: 0 },
            exits: [
              { direction: 'up', targetRoomId: 'tj_observatory_main', description: '上面是观星台' },
              { direction: 'east', targetRoomId: 'tj_calendar_bureau', description: '东面是历法司' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'dim' }
          },
          {
            id: 'tj_calendar_bureau',
            name: '历法司',
            type: 'bureau',
            description: '负责制定历法的部门。官员们在此根据天象运行规律编制历书，供全国使用。',
            coordinates: { x: 455, y: 615, z: 0 },
            exits: [
              { direction: 'west', targetRoomId: 'tj_astrology_hall', description: '西面是占星堂' },
              { direction: 'north', targetRoomId: 'tj_instrument_room', description: '北面是仪器室' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          },
          {
            id: 'tj_instrument_room',
            name: '仪器室',
            type: 'room',
            description: '存放观测仪器的房间。各种精密的天文仪器整齐摆放，有浑天仪、简仪、圭表等。',
            coordinates: { x: 455, y: 625, z: 0 },
            exits: [
              { direction: 'south', targetRoomId: 'tj_calendar_bureau', description: '南面是历法司' }
            ],
            properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
          }
        ]
      }
    ]
  }

  // 注意: 由于代码长度限制,这里只展示了皇城区的25个房间
  // 完整版本需要继续添加其他10个区域的115个房间
  // 我将分批生成
};

// ==================== 地图生成函数 ====================

function generateMapFile(districts, outputPath) {
  const mapData = {
    city: {
      id: 'tianjing_cheng',
      name: '天京城',
      fullName: '大周王朝天京府天京城',
      type: 'capital',
      level: 1,
      province: 'tianjing_fu',
      provinceName: '天京府',
      description: '大周王朝国都，皇城所在，繁华至极。经过重构，区域划分更加合理，连通性更强。',
      population: { mortal: 3000000, cultivator: 5000 },
      coordinates: { x: 500, y: 500 },
      climate: '温和',
      specialFeatures: ['皇宫', '国子监', '钦天监', '六部衙门', '白家老宅']
    },
    districts: districts
  };

  fs.writeFileSync(outputPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`✅ Generated: ${outputPath}`);
}

// ==================== 主程序 ====================

console.log('🚀 开始生成天京城地图...\n');

// 生成Part1 (南门区、皇城区、商业区)
const part1Districts = [
  ROOMS_DATA.imperial_district
  // 需要添加: south_gate_district, commercial_district
];

generateMapFile(
  part1Districts,
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1_new.json')
);

console.log('\n✅ Part1 生成完成!');
console.log('⚠️  注意: 这只是演示脚本框架,完整版本需要添加所有140个房间的定义');
console.log('💡 建议: 由于房间数量巨大,实际执行时需要分批完成');
