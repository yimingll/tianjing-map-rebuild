#!/usr/bin/env node
/**
 * 天京城完整地图生成脚本 - 一次性生成所有140个房间
 * 基于重构设计文档，实现完整的地图重构
 */

const fs = require('fs');
const path = require('path');

// ==================== 完整140房间数据定义 ====================

const TianjingMapData = {
  city: {
    id: 'tianjing_cheng',
    name: '天京城',
    fullName: '大周王朝天京府天京城',
    type: 'capital',
    level: 1,
    province: 'tianjing_fu',
    provinceName: '天京府',
    description: '大周王朝国都，经过重构优化，实现中心辐射式、环形、网格式、层级式四种连通方式，区域划分更加合理，游戏体验显著提升。',
    population: { mortal: 3000000, cultivator: 5000 },
    coordinates: { x: 500, y: 500 },
    climate: '温和',
    specialFeatures: ['皇宫', '国子监', '钦天监', '六部衙门', '白家老宅', '完整区域连通性'],
    version: 'refactored_v1.0'
  },

  districts: [
    // ===== 皇城区 (25房间) =====
    {
      id: 'imperial_district',
      name: '皇城区',
      type: 'imperial',
      description: '大周王朝权力核心，皇宫所在',
      safeZone: true,
      pvpAllowed: false,
      locations: [
        {
          id: 'palace_plaza',
          name: '宫殿广场区',
          rooms: [
            {
              id: 'tj_palace_square',
              name: '宫前广场',
              type: 'plaza',
              description: '皇宫前广场，天京城核心枢纽。宽阔的青石广场，正北方是高大的皇宫正门，门楣上悬挂着"天京皇宫"四个金色大字。东西两侧各有一座石碑，上刻历代帝王功绩。这里是整个城市的交通中心，连接各大区域的关键节点。',
              coordinates: { x: 500, y: 575, z: 0 },
              exits: [
                { direction: 'north', targetRoomId: 'tj_palace_gate', description: '北面是皇宫正门' },
                { direction: 'south', targetRoomId: 'tj_imperial_street_north', description: '南面是御街北段' },
                { direction: 'east', targetRoomId: 'tj_east_palace_plaza', description: '东面是东宫广场' },
                { direction: 'west', targetRoomId: 'tj_west_palace_plaza', description: '西面是西宫广场' },
                { direction: 'northeast', targetRoomId: 'tj_ministry_plaza', description: '东北是六部广场' },
                { direction: 'northwest', targetRoomId: 'tj_observatory_gate', description: '西北是钦天监' }
              ],
              npcs: [{ npcId: 'imperial_guard_001', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, canTeleport: true, lightLevel: 'bright' }
            },
            {
              id: 'tj_palace_gate',
              name: '皇宫正门',
              type: 'gate',
              description: '巨大的宫门矗立在你面前，高达三丈，通体涂成朱红色，门上铺着铜钉，熠熠生辉。门前站立着身穿金甲的禁军，目光警惕。门楣上悬挂着九龙吐珠的匾额，气势恢宏。',
              coordinates: { x: 500, y: 600, z: 0 },
              exits: [
                { direction: 'north', targetRoomId: 'tj_throne_hall', description: '北面是金銮殿' },
                { direction: 'south', targetRoomId: 'tj_palace_square', description: '南面是宫前广场' }
              ],
              npcs: [{ npcId: 'imperial_guard_002', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_east_palace_plaza',
              name: '东宫广场',
              type: 'plaza',
              description: '皇宫东侧的小广场，相对宫前广场要安静许多。东面可通往国子监，是文人学子常来之地。广场上种植着几棵古松，环境清幽。',
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
              description: '皇宫西侧的小广场。西面通往钦天监，时常能看到身穿道袍的钦天监官员往来。广场中央有一个小型花园，种植着奇花异草。',
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
              description: '皇宫广场东侧的高台，用于举行重大典礼。台高一丈，四周雕刻着龙凤图案，庄严肃穆。皇帝登基、册封皇后等国家大典都在此举行。',
              coordinates: { x: 530, y: 590, z: 5 },
              exits: [
                { direction: 'down', targetRoomId: 'tj_east_palace_plaza', description: '下面是东宫广场' }
              ],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_imperial_garden_entrance',
              name: '御花园入口',
              type: 'entrance',
              description: '一座精致的月洞门，上书"御花园"三字。门内隐约可见亭台楼阁，花木扶疏。四季花开不断，是皇室休闲的重要场所。',
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
              description: '大周王朝最高权力殿堂，皇帝处理朝政之地。殿内金碧辉煌，正中高台上摆放着九龙宝座，上方悬挂"正大光明"匾额。两侧列有文武百官的品位牌位，威严肃穆。',
              coordinates: { x: 500, y: 625, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_palace_gate', description: '南面是宫门' },
                { direction: 'east', targetRoomId: 'tj_emperor_study', description: '东面是御书房' },
                { direction: 'west', targetRoomId: 'tj_inner_court', description: '西面是内廷' }
              ],
              npcs: [{ npcId: 'imperial_official_001', position: 'standing', spawnChance: 100, maxCount: 10, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_emperor_study',
              name: '御书房',
              type: 'study',
              description: '皇帝批阅奏章、读书修身之所。房间布置简洁雅致，书架上摆满经史子集，书案上笔墨纸砚齐全。墙上挂着名家字画，书香墨香阵阵。',
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
              description: '皇室宝库，存放着无数珍宝。库房戒备森严，禁军把守，闲人不得入内。里面收藏着历代皇帝珍爱的宝物、奇珍异宝。',
              coordinates: { x: 510, y: 635, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_emperor_study', description: '南面是御书房' }
              ],
              npcs: [{ npcId: 'treasury_guard_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'dim' }
            },
            {
              id: 'tj_imperial_armory',
              name: '武器库',
              type: 'armory',
              description: '皇家武器库，收藏着历代名将使用的兵器。墙上挂满刀枪剑戟，寒光闪烁，每一件都是价值连城的宝物。',
              coordinates: { x: 490, y: 635, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_throne_hall', description: '南面是金銮殿' }
              ],
              npcs: [{ npcId: 'armory_guard_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_imperial_library',
              name: '皇家藏书楼',
              type: 'library',
              description: '皇室私藏的珍贵典籍都存放于此。楼高三层，藏书数万卷，包含许多孤本秘籍。这里的书籍记录着大周王朝的历史和智慧。',
              coordinates: { x: 530, y: 635, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_emperor_study', description: '南面是御书房' }
              ],
              npcs: [{ npcId: 'librarian_001', position: 'standing', spawnChance: 100, maxCount: 2, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_inner_court',
              name: '内廷',
              type: 'court',
              description: '皇宫内廷，后宫所在。庭院幽深，廊腰缦回，雕梁画栋。这里是皇帝和后妃们的生活区域，环境优雅私密。',
              coordinates: { x: 480, y: 625, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_throne_hall', description: '东面是金銮殿' },
                { direction: 'south', targetRoomId: 'tj_imperial_garden_entrance', description: '南面是御花园入口' },
                { direction: 'north', targetRoomId: 'tj_empress_palace', description: '北面是皇后寝宫' }
              ],
              npcs: [{ npcId: 'palace_servant_001', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_empress_palace',
              name: '皇后寝宫',
              type: 'palace',
              description: '皇后居住的宫殿，布置雍容华贵。殿内熏香缭绕，摆设精美的瓷器和玉器。这里是皇后处理后宫事务的地方。',
              coordinates: { x: 480, y: 640, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_inner_court', description: '南面是内廷' }
              ],
              npcs: [{ npcId: 'empress_servant_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
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
              npcs: [{ npcId: 'royal_chef_001', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
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
              description: '国子监正门，门楣上挂着"国子监"金字大匾。这里是大周王朝最高学府，培养官员和学士之地。门前常有学子往来。',
              coordinates: { x: 560, y: 600, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_east_palace_plaza', description: '南面是东宫广场' },
                { direction: 'southwest', targetRoomId: 'tj_palace_square', description: '西南是宫前广场' },
                { direction: 'north', targetRoomId: 'tj_academy_main_hall', description: '北面是国子监大堂' }
              ],
              npcs: [{ npcId: 'scholar_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_academy_main_hall',
              name: '国子监大堂',
              type: 'hall',
              description: '国子监主堂，用于举行入学仪式和重大考试。堂内设有孔子牌位，两侧悬挂历代名儒画像。这里是学子们向往的圣地。',
              coordinates: { x: 560, y: 615, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_imperial_academy_gate', description: '南面是大门' },
                { direction: 'east', targetRoomId: 'tj_academy_library', description: '东面是藏书阁' },
                { direction: 'west', targetRoomId: 'tj_academy_courtyard', description: '西面是庭院' }
              ],
              npcs: [{ npcId: 'teacher_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_academy_library',
              name: '国子监藏书阁',
              type: 'library',
              description: '国子监藏书之所，收藏各类经史典籍。学子们可在此借阅学习。书香浓郁，环境安静，是求学问道的绝佳场所。',
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
              description: '国子监的讲学之所。堂内设有讲台和座位，墙上挂着"学而时习之"的字幅。时常有学子在此聆听名师教诲。',
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
              description: '另一间讲学堂，布置与东学堂相似。这里主要讲授诗词歌赋，培养文人才子。墙上挂着诗词名句。',
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
              description: '国子监的后庭院，种植着松柏竹梅。学子们课余时常在此散步讨论学问，环境清幽，是思辨学问的好地方。',
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
              description: '钦天监入口，门上挂着太极八卦图。这里是大周王朝负责观测天象、制定历法的机构。时常能看到道袍官员出入。',
              coordinates: { x: 440, y: 600, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_west_palace_plaza', description: '南面是西宫广场' },
                { direction: 'southeast', targetRoomId: 'tj_palace_square', description: '东南是宫前广场' },
                { direction: 'north', targetRoomId: 'tj_observatory_main', description: '北面是观星台' }
              ],
              npcs: [{ npcId: 'astrologer_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_observatory_main',
              name: '观星台',
              type: 'observatory',
              description: '钦天监的主要建筑，高台之上架设着浑天仪等观测仪器。夜晚可在此观测星象，是研究天文的重要场所。',
              coordinates: { x: 440, y: 615, z: 8 },
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
              description: '钦天监占星之所。墙上绘着星图，桌上摆放着各种占卜工具。钦天监官员在此推演天象吉凶，预测国运。',
              coordinates: { x: 440, y: 615, z: 0 },
              exits: [
                { direction: 'up', targetRoomId: 'tj_observatory_main', description: '上面是观星台' },
                { direction: 'east', targetRoomId: 'tj_calendar_bureau', description: '东面是历法司' }
              ],
              npcs: [{ npcId: 'astrologer_002', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'dim' }
            },
            {
              id: 'tj_calendar_bureau',
              name: '历法司',
              type: 'bureau',
              description: '负责制定历法的部门。官员们在此根据天象运行规律编制历书，供全国使用。墙上挂着日月运行图。',
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
              description: '存放观测仪器的房间。各种精密的天文仪器整齐摆放，有浑天仪、简仪、圭表等，都是价值连城的宝物。',
              coordinates: { x: 455, y: 625, z: 0 },
              exits: [
                { direction: 'south', targetRoomId: 'tj_calendar_bureau', description: '南面是历法司' }
              ],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            }
          ]
        }
      ]
    },

    // ===== 商业区 (15房间) =====
    {
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
              description: '御街北段，连接皇宫与商业区的繁华街道。街道宽阔，两旁商铺林立，青石板路被打磨得光亮如镜。商贾云集，叫卖声此起彼伏。',
              coordinates: { x: 500, y: 490, z: 0 },
              exits: [
                { direction: 'north', targetRoomId: 'tj_palace_square', description: '北面是宫前广场' },
                { direction: 'south', targetRoomId: 'tj_imperial_street_mid', description: '南面是御街中段' },
                { direction: 'east', targetRoomId: 'tj_jewelry_shop', description: '东面是珍宝阁' },
                { direction: 'west', targetRoomId: 'tj_weapon_shop', description: '西面是神兵阁' }
              ],
              npcs: [{ npcId: 'merchant_001', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_imperial_street_mid',
              name: '御街中段',
              type: 'street',
              description: '御街中段，整个天京城最繁华的地段。街道两旁商铺鳞次栉比，招牌林立。这里是商业活动的中心枢纽，人潮如织。',
              coordinates: { x: 500, y: 400, z: 0 },
              exits: [
                { direction: 'north', targetRoomId: 'tj_imperial_street_north', description: '北面是御街北段' },
                { direction: 'south', targetRoomId: 'tj_imperial_street_south', description: '南面是御街南段' },
                { direction: 'east', targetRoomId: 'tj_silk_shop', description: '东面是锦绣坊' },
                { direction: 'west', targetRoomId: 'tj_medicine_shop', description: '西面是济世堂' },
                { direction: 'northeast', targetRoomId: 'tj_commercial_crossroad', description: '东北是商业十字路口' }
              ],
              npcs: [{ npcId: 'merchant_002', position: 'standing', spawnChance: 100, maxCount: 10, respawnTime: 0 }],
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
              npcs: [{ npcId: 'merchant_003', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
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
              npcs: [{ npcId: 'vendor_001', position: 'standing', spawnChance: 100, maxCount: 5, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_commercial_crossroad',
              name: '商业十字路口',
              type: 'intersection',
              description: '商业区的十字路口，东西南北四通八达。这里是连接各大商业街区的重要枢纽，人流车马川流不息，热闹非凡。',
              coordinates: { x: 550, y: 400, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_imperial_street_mid', description: '西面是御街中段' },
                { direction: 'east', targetRoomId: 'tj_mansion_street', description: '东面是大宅街' },
                { direction: 'north', targetRoomId: 'tj_east_market_plaza', description: '北面是东市广场' },
                { direction: 'south', targetRoomId: 'tj_workshop_street', description: '南面是作坊街' }
              ],
              npcs: [{ npcId: 'pedestrian_001', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
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
              description: '城中最大的珠宝首饰店，金银首饰、珠宝玉器琳琅满目。店内灯火通明，柜台后坐着精明的掌柜，估价眼光独到。',
              coordinates: { x: 530, y: 490, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_imperial_street_north', description: '西面是御街北段' }
              ],
              npcs: [{ npcId: 'jeweler_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
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
              npcs: [{ npcId: 'silk_merchant_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_tea_house',
              name: '品茗轩',
              type: 'shop',
              description: '雅致的茶楼，清幽的环境适合品茶论道。茶香袅袅，古色古香，是文人雅士聚集之地，常有诗词唱和。',
              coordinates: { x: 530, y: 310, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_imperial_street_south', description: '西面是御街南段' }
              ],
              npcs: [{ npcId: 'tea_master_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_bookstore',
              name: '文华书局',
              type: 'shop',
              description: '城中最大的书店，四书五经、诗词小说无所不包。常有学子在此挑灯夜读，墨香四溢，是求知者的天堂。',
              coordinates: { x: 520, y: 420, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_commercial_crossroad', description: '西面是商业十字路口' }
              ],
              npcs: [{ npcId: 'bookseller_001', position: 'standing', spawnChance: 100, maxCount: 2, respawnTime: 0 }],
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
              npcs: [{ npcId: 'antique_dealer_001', position: 'standing', spawnChance: 100, maxCount: 2, respawnTime: 0 }],
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
              npcs: [{ npcId: 'weapon_smith_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_medicine_shop',
              name: '济世堂',
              type: 'shop',
              description: '城中最大的药店，各种珍稀药材齐全。坐堂医术高超，常有人排队求医，药香弥漫。',
              coordinates: { x: 470, y: 400, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_imperial_street_mid', description: '东面是御街中段' }
              ],
              npcs: [{ npcId: 'physician_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_restaurant',
              name: '聚贤楼',
              type: 'shop',
              description: '天京城最有名的酒楼，山珍海味、各色菜肴应有尽有。常有文武百官在此宴请宾客，热闹非凡。',
              coordinates: { x: 470, y: 310, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_imperial_street_south', description: '东面是御街南段' }
              ],
              npcs: [{ npcId: 'waiter_001', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_inn',
              name: '天香客栈',
              type: 'shop',
              description: '规模最大的客栈，客房舒适，服务周到。南来北往的商旅多在此下榻，是商贾们交流信息的重要场所。',
              coordinates: { x: 460, y: 420, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_commercial_crossroad', description: '东面是商业十字路口' }
              ],
              npcs: [{ npcId: 'innkeeper_001', position: 'standing', spawnChance: 100, maxCount: 3, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            },
            {
              id: 'tj_bank',
              name: '钱庄',
              type: 'shop',
              description: '城中最大的钱庄，办理银钱兑换、存贷业务。信誉卓著，是商贾们的首选，金库坚固。',
              coordinates: { x: 450, y: 420, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_commercial_crossroad', description: '东面是商业十字路口' }
              ],
              npcs: [{ npcId: 'banker_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            }
          ]
        }
      ]
    },

    // ===== 南门区 (13房间) =====
    {
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
              npcs: [{ npcId: 'city_guard_001', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
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
              npcs: [{ npcId: 'city_guard_002', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
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
              npcs: [{ npcId: 'city_guard_003', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
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
              npcs: [{ npcId: 'traveler_001', position: 'standing', spawnChance: 100, maxCount: 10, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_south_gate_tower',
              name: '南门城楼',
              type: 'tower',
              description: '南门城楼上，可以俯瞰整个南门区和城外。城楼高耸入云，是南门防御的核心要塞，视野开阔。',
              coordinates: { x: 500, y: 150, z: 12 },
              exits: [
                { direction: 'down', targetRoomId: 'tj_south_gate_plaza', description: '下面是南门广场' }
              ],
              npcs: [{ npcId: 'city_guard_004', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
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
              description: '南门广场东侧，连接城墙和东南方向。这里聚集了各种小商贩，叫卖声不绝于耳，充满市井气息。',
              coordinates: { x: 540, y: 150, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_south_gate_plaza', description: '西面是南门广场' },
                { direction: 'northeast', targetRoomId: 'tj_southeast_corner_tower', description: '东北是东南角楼' }
              ],
              npcs: [{ npcId: 'vendor_002', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
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
              npcs: [{ npcId: 'pedestrian_002', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_carriage_station',
              name: '马车站',
              type: 'station',
              description: '南门外的马车站，是长途旅行的出发点。这里马车云集，车夫吆喝声此起彼伏，热闹非凡。',
              coordinates: { x: 500, y: 60, z: 0 },
              exits: [
                { direction: 'north', targetRoomId: 'tj_south_gate_outside', description: '北面是南门外' }
              ],
              npcs: [{ npcId: 'coachman_001', position: 'standing', spawnChance: 100, maxCount: 8, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_south_market',
              name: '南门集市',
              type: 'market',
              description: '南门集市，各种农产品、手工艺品应有尽有。每天都有大批市民来此购物，是平民百姓的重要市集。',
              coordinates: { x: 530, y: 180, z: 0 },
              exits: [
                { direction: 'west', targetRoomId: 'tj_south_gate_plaza', description: '西面是南门广场' }
              ],
              npcs: [{ npcId: 'market_vendor_001', position: 'standing', spawnChance: 100, maxCount: 10, respawnTime: 0 }],
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
              npcs: [{ npcId: 'city_guard_005', position: 'standing', spawnChance: 100, maxCount: 6, respawnTime: 0 }],
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
              npcs: [{ npcId: 'city_guard_006', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'bright' }
            },
            {
              id: 'tj_city_notice_board',
              name: '布告栏',
              type: 'notice_board',
              description: '城市布告栏，张贴着各种官方公告和民间告示。时常有市民在此驻足观看，了解城中大事。',
              coordinates: { x: 490, y: 170, z: 0 },
              exits: [
                { direction: 'east', targetRoomId: 'tj_south_gate_plaza', description: '东面是南门广场' }
              ],
              npcs: [{ npcId: 'scholar_002', position: 'standing', spawnChance: 100, maxCount: 2, respawnTime: 0 }],
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
              npcs: [{ npcId: 'warehouse_guard_001', position: 'standing', spawnChance: 100, maxCount: 4, respawnTime: 0 }],
              properties: { safeZone: true, pvpAllowed: false, lightLevel: 'medium' }
            }
          ]
        }
      ]
    }

    // 这里继续添加其他8个区域的定义...
    // 由于文件长度限制，我需要继续生成其余区域

  ]
};

// 由于这是一个超大规模的文件，我需要分批完成
console.log('正在生成天京城完整重构地图 - 第一部分...');
console.log('已生成: 皇城区(25) + 商业区(15) + 南门区(13) = 53房间');
console.log('还需继续生成: 东城区(18) + 西城区(15) + 官府区(14) + 北门区(10) + 贫民区(12) + 城墙区(10) + 东门区(4) + 西门区(4) = 87房间');

// 生成第一部分
fs.writeFileSync(
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1_new.json'),
  JSON.stringify(TianjingMapData, null, 2),
  'utf8'
);

console.log('\n✅ 第一部分生成完成!');
console.log('📁 文件位置: packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1_new.json');
console.log('📊 房间统计: 53个房间已生成');
console.log('📈 完成度: 37.9% (53/140)');