/**
 * 扩充天京城到140个房间，保持连通性
 * 当前: 108个房间
 * 目标: 140个房间
 * 需要添加: 32个房间
 */

const fs = require('fs');

const part1Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json';
const part2Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json';
const part3Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json';

const part1 = JSON.parse(fs.readFileSync(part1Path, 'utf8'));
const part2 = JSON.parse(fs.readFileSync(part2Path, 'utf8'));
const part3 = JSON.parse(fs.readFileSync(part3Path, 'utf8'));

console.log('开始扩充到140个房间...\n');

// Part1: 从38扩充到50 (需要+12个房间)
console.log('=== Part1: 添加12个房间 ===');

// 1. 在商业区添加更多商铺 (6个)
const commercialDistrict = part1.districts.find(d => d.id === 'commercial_district');
const shopsEast = commercialDistrict.locations.find(l => l.id === 'shops_east');

shopsEast.rooms.push(
  {
    "id": "tj_auction_house_vip",
    "name": "天宝阁-贵宾包厢",
    "type": "vip_room",
    "description": "天宝阁的贵宾包厢区，装修奢华。每个包厢都有独立的观拍窗口，可以俯瞰拍卖大厅。只有身份尊贵或财力雄厚的客人才能进入。包厢内有舒适的座椅、茶点和专人服务。",
    "exits": [
      {"direction": "down", "targetRoomId": "tj_auction_house", "description": "楼梯通往拍卖大厅"}
    ],
    "npcs": [
      {"npcId": "vip_attendant", "position": "standing", "spawnChance": 100, "maxCount": 2, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 510, "y": 520, "z": 5}
  },
  {
    "id": "tj_teahouse",
    "name": "品茗轩",
    "type": "teahouse",
    "description": "御街上的高档茶楼，专营各地名茶。店内雅致清幽，摆放着精美的茶具。茶师正在煮水泡茶，茶香四溢。二楼是雅座，可以品茶聊天，观赏街景。墙上挂着茶道名家的字画。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_street_royal_mid_01", "description": "西面是御街中段"},
      {"direction": "up", "targetRoomId": "tj_teahouse_2f", "description": "楼梯通往二楼"}
    ],
    "npcs": [
      {"npcId": "tea_master", "position": "sitting", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "tea_customer", "position": "drinking", "spawnChance": 80, "maxCount": 8, "respawnTime": 900}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "dim"},
    "coordinates": {"x": 510, "y": 500, "z": 0}
  },
  {
    "id": "tj_teahouse_2f",
    "name": "品茗轩-二楼雅座",
    "type": "teahouse",
    "description": "茶楼二楼的雅座区，环境更加清幽。靠窗的位置可以俯瞰繁华的御街。客人多是文人雅士或修士，在此品茶论道，谈天说地。偶尔能听到有人吟诗作对。",
    "exits": [
      {"direction": "down", "targetRoomId": "tj_teahouse", "description": "楼梯通往一楼"}
    ],
    "npcs": [
      {"npcId": "scholar", "position": "discussing", "spawnChance": 70, "maxCount": 6, "respawnTime": 1200}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 510, "y": 500, "z": 5}
  },
  {
    "id": "tj_bookstore",
    "name": "文昌书局",
    "type": "bookstore",
    "description": "御街上的大型书局，售卖各类书籍典籍。书架林立，从经史子集到修仙心得，应有尽有。店内还有抄书匠在抄录书卷。许多读书人在此翻阅选购。墙上贴着新书推荐和畅销榜。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_street_royal_mid_01", "description": "西面是御街中段"}
    ],
    "npcs": [
      {"npcId": "bookstore_owner", "position": "standing", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "book_reader", "position": "browsing", "spawnChance": 90, "maxCount": 10, "respawnTime": 600}
    ],
    "items": [
      {"itemId": "book_shelf", "name": "书架", "description": "摆满书籍的高大书架", "type": "furniture", "canPickup": false}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 510, "y": 500, "z": 0}
  },
  {
    "id": "tj_calligraphy_shop",
    "name": "墨宝斋",
    "type": "shop",
    "description": "专营文房四宝的店铺。柜台内陈列着各种名贵笔墨纸砚，有湖笔、徽墨、宣纸、端砚等。墙上挂着名家书法作品供欣赏。店主是一位儒雅的老者，精通书法，常为客人推荐合适的文具。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_street_royal_north_01", "description": "东面是御街北段"}
    ],
    "npcs": [
      {"npcId": "calligraphy_master", "position": "writing", "spawnChance": 100, "maxCount": 1, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 490, "y": 520, "z": 0}
  },
  {
    "id": "tj_music_shop",
    "name": "雅韵琴行",
    "type": "shop",
    "description": "售卖乐器的店铺。店内挂着琴、琵琶、箫、笛等各种乐器。偶尔传来试琴的音乐声，悠扬动听。店主是一位音律大师，可以为客人调试乐器，也教授音律之道。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_street_royal_north_01", "description": "东面是御街北段"}
    ],
    "npcs": [
      {"npcId": "music_master", "position": "playing", "spawnChance": 100, "maxCount": 1, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 490, "y": 520, "z": 0}
  }
);

// 更新御街中段和北段的出口
const royalMid = part1.districts.find(d => d.id === 'commercial_district')
  .locations.find(l => l.id === 'royal_street')
  .rooms.find(r => r.id === 'tj_street_royal_mid_01');

royalMid.exits.push(
  {"direction": "east", "targetRoomId": "tj_teahouse", "description": "东面是品茗轩"},
  {"direction": "east", "targetRoomId": "tj_bookstore", "description": "东面是文昌书局"}
);

const royalNorth = part1.districts.find(d => d.id === 'commercial_district')
  .locations.find(l => l.id === 'royal_street')
  .rooms.find(r => r.id === 'tj_street_royal_north_01');

royalNorth.exits.push(
  {"direction": "west", "targetRoomId": "tj_calligraphy_shop", "description": "西面是墨宝斋"},
  {"direction": "west", "targetRoomId": "tj_music_shop", "description": "西面是雅韵琴行"}
);

// 天宝阁添加上楼出口
const auctionHouse = part1.districts.find(d => d.id === 'commercial_district')
  .locations.find(l => l.id === 'shops_east')
  .rooms.find(r => r.id === 'tj_auction_house');

auctionHouse.exits.push(
  {"direction": "up", "targetRoomId": "tj_auction_house_vip", "description": "楼梯通往贵宾区"}
);

// 2. 在皇城区添加更多房间 (6个)
const imperialDistrict = part1.districts.find(d => d.id === 'imperial_district');
const palaceComplex = imperialDistrict.locations.find(l => l.id === 'palace_complex');

palaceComplex.rooms.push(
  {
    "id": "tj_palace_inner_court",
    "name": "内廷",
    "type": "courtyard",
    "description": "太和殿后方的内廷，是皇帝和皇族的生活区域。庭院幽静，种植着奇花异草。四周是后宫嫔妃的寝宫。禁卫森严，闲人不得入内。空气中弥漫着淡淡的香气。",
    "exits": [
      {"direction": "south", "targetRoomId": "tj_palace_main_hall", "description": "南面是太和殿"},
      {"direction": "north", "targetRoomId": "tj_palace_garden", "description": "北面是御花园"},
      {"direction": "east", "targetRoomId": "tj_palace_east_hall", "description": "东面是东宫"},
      {"direction": "west", "targetRoomId": "tj_palace_west_hall", "description": "西面是西宫"}
    ],
    "npcs": [
      {"npcId": "palace_eunuch", "position": "standing", "spawnChance": 100, "maxCount": 6, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 500, "y": 570, "z": 0}
  },
  {
    "id": "tj_palace_east_hall",
    "name": "东宫",
    "type": "palace",
    "description": "皇太子的宫殿。殿内陈设华贵，但不失文雅。书案上摆放着治国理政的书籍。这里是太子读书习政之所。墙上挂着历代明君的画像，以为激励。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_palace_inner_court", "description": "西面是内廷"}
    ],
    "npcs": [
      {"npcId": "crown_prince", "position": "reading", "spawnChance": 40, "maxCount": 1, "respawnTime": 0},
      {"npcId": "prince_attendant", "position": "standing", "spawnChance": 100, "maxCount": 4, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 510, "y": 570, "z": 0}
  },
  {
    "id": "tj_palace_west_hall",
    "name": "西宫",
    "type": "palace",
    "description": "皇后的寝宫。宫殿装饰精美雅致，透着女性的柔美。殿内摆放着精美的梳妆台和珠宝首饰。宫女们在此侍奉皇后。空气中有淡淡的熏香味道。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_palace_inner_court", "description": "东面是内廷"}
    ],
    "npcs": [
      {"npcId": "empress", "position": "sitting", "spawnChance": 40, "maxCount": 1, "respawnTime": 0},
      {"npcId": "palace_maid", "position": "serving", "spawnChance": 100, "maxCount": 6, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 490, "y": 570, "z": 0}
  },
  {
    "id": "tj_palace_garden_east",
    "name": "御花园-东园",
    "type": "garden",
    "description": "御花园的东侧区域，种植着各种名贵花卉。有牡丹、芍药、海棠等。一座精美的凉亭矗立在池塘边，锦鲤在水中游弋。这里是后宫嫔妃们游玩赏花的地方。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_palace_garden", "description": "西面是御花园中心"}
    ],
    "npcs": [
      {"npcId": "concubine", "position": "walking", "spawnChance": 60, "maxCount": 4, "respawnTime": 1200}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 510, "y": 580, "z": 0}
  },
  {
    "id": "tj_palace_garden_west",
    "name": "御花园-西园",
    "type": "garden",
    "description": "御花园的西侧区域，布置着假山和奇石。石径蜿蜒，通向深处的竹林。竹林中有一座小亭，是皇帝偶尔独处静思的地方。环境清幽，远离喧嚣。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_palace_garden", "description": "东面是御花园中心"}
    ],
    "npcs": [
      {"npcId": "gardener", "position": "working", "spawnChance": 100, "maxCount": 2, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 490, "y": 580, "z": 0}
  },
  {
    "id": "tj_qintianjian_library",
    "name": "星象阁",
    "type": "library",
    "description": "钦天监的藏书阁，收藏着大量关于天文、历法、占卜的典籍。阁内三层，书架上摆满了星图、历书和占卜记录。这里也存放着观星仪器的设计图纸和使用手册。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_qintianjian_courtyard", "description": "西面是钦天监庭院"}
    ],
    "npcs": [
      {"npcId": "astrology_scholar", "position": "reading", "spawnChance": 80, "maxCount": 3, "respawnTime": 600}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 480, "y": 540, "z": 0}
  }
);

// 更新御花园和太和殿的连接
const mainHall = palaceComplex.rooms.find(r => r.id === 'tj_palace_main_hall');
const garden = palaceComplex.rooms.find(r => r.id === 'tj_palace_garden');

// 太和殿north改为指向内廷
const mainHallNorthExit = mainHall.exits.find(e => e.direction === 'north');
if (mainHallNorthExit) {
  mainHallNorthExit.targetRoomId = 'tj_palace_inner_court';
  mainHallNorthExit.description = '北面是内廷';
}

// 御花园south改为指向内廷
const gardenSouthExit = garden.exits.find(e => e.direction === 'north');
if (gardenSouthExit) {
  gardenSouthExit.direction = 'south';
  gardenSouthExit.targetRoomId = 'tj_palace_inner_court';
  gardenSouthExit.description = '南面是内廷';
}

// 御花园添加东西出口
garden.exits.push(
  {"direction": "east", "targetRoomId": "tj_palace_garden_east", "description": "东面是东园"},
  {"direction": "west", "targetRoomId": "tj_palace_garden_west", "description": "西面是西园"}
);

// 更新钦天监庭院
const qintianjianCourtyard = imperialDistrict.locations.find(l => l.id === 'qintianjian')
  .rooms.find(r => r.id === 'tj_qintianjian_courtyard');

qintianjianCourtyard.exits.push(
  {"direction": "east", "targetRoomId": "tj_qintianjian_library", "description": "东面是星象阁"}
);

console.log('✅ Part1添加了12个房间');

// Part2: 从35扩充到50 (需要+15个房间)
console.log('\n=== Part2: 添加15个房间 ===');

// 在东城区添加更多房间
const eastDistrict = part2.districts.find(d => d.id === 'east_district');
const baiFamily = eastDistrict.locations.find(l => l.id === 'bai_family_complex');

// 添加白家更多房间 (3个)
baiFamily.rooms.push(
  {
    "id": "tj_bai_mansion_kitchen",
    "name": "白家老宅-厨房",
    "type": "kitchen",
    "description": "白家的厨房，虽然简陋但收拾得干净整洁。灶台上放着几口大锅，墙边堆放着柴火。厨娘正在准备饭菜，虽然食材不算丰盛，但用心烹饪。空气中飘散着饭菜的香味。",
    "exits": [
      {"direction": "north", "targetRoomId": "tj_bai_mansion_front_yard", "description": "北面是前院"}
    ],
    "npcs": [
      {"npcId": "bai_family_cook", "position": "cooking", "spawnChance": 100, "maxCount": 1, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 560, "y": 500, "z": 0}
  },
  {
    "id": "tj_bai_mansion_warehouse",
    "name": "白家老宅-仓库",
    "type": "storage",
    "description": "白家的仓库，存放着一些杂物和少量粮食。仓库空荡荡的，显示出家族的衰败。但依然有人精心打理，分门别类摆放整齐。墙角堆放着一些旧家具和废弃物品。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_bai_mansion_back_yard", "description": "东面是后院"}
    ],
    "npcs": [],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 550, "y": 520, "z": 0}
  },
  {
    "id": "tj_bai_mansion_ancestral_hall",
    "name": "白家老宅-祠堂",
    "type": "shrine",
    "description": "白家的祠堂，供奉着历代祖先的牌位。祠堂虽已破旧，但打扫得一尘不染。墙上挂着家族族谱和祖训。香案上的香火不断，显示出白家子弟对祖先的虔诚。这里承载着白家的荣耀与希望。",
    "exits": [
      {"direction": "south", "targetRoomId": "tj_bai_mansion_main_hall", "description": "南面是正堂"}
    ],
    "npcs": [],
    "items": [
      {"itemId": "ancestral_tablets", "name": "祖先牌位", "description": "白家历代祖先的牌位", "type": "shrine", "canPickup": false, "canInteract": true}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 570, "y": 500, "z": 0}
  }
);

// 更新白家前院和正堂出口
const baiFrontYard = baiFamily.rooms.find(r => r.id === 'tj_bai_mansion_front_yard');
baiFrontYard.exits.push(
  {"direction": "south", "targetRoomId": "tj_bai_mansion_kitchen", "description": "南面是厨房"}
);

const baiMainHall = baiFamily.rooms.find(r => r.id === 'tj_bai_mansion_main_hall');
baiMainHall.exits.push(
  {"direction": "north", "targetRoomId": "tj_bai_mansion_ancestral_hall", "description": "北面是祠堂"}
);

const baiBackYard = baiFamily.rooms.find(r => r.id === 'tj_bai_mansion_back_yard');
baiBackYard.exits.push(
  {"direction": "west", "targetRoomId": "tj_bai_mansion_warehouse", "description": "西面是仓库"}
);

// 添加国子监更多房间 (2个)
const guozijian = part1.districts.find(d => d.id === 'imperial_district')
  .locations.find(l => l.id === 'guozijian');

guozijian.rooms.push(
  {
    "id": "tj_guozijian_east_room",
    "name": "国子监-东学舍",
    "type": "dormitory",
    "description": "国子监的东侧学舍，是学生们居住的地方。房间简朴整洁，每间住着两三位学子。书桌上堆放着书卷，墙上贴着励志的格言。学生们在此苦读，准备科举。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_guozijian_courtyard", "description": "西面是庭院"}
    ],
    "npcs": [
      {"npcId": "academy_student", "position": "studying", "spawnChance": 90, "maxCount": 12, "respawnTime": 600}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 540, "y": 540, "z": 0}
  },
  {
    "id": "tj_guozijian_west_room",
    "name": "国子监-西学舍",
    "type": "dormitory",
    "description": "国子监的西侧学舍，与东学舍类似。这里的学生来自各地，有的刚入学，有的已准备参加科举。晚上常有学生在此背诵文章，琅琅书声不绝。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_guozijian_courtyard", "description": "东面是庭院"}
    ],
    "npcs": [
      {"npcId": "academy_student", "position": "studying", "spawnChance": 90, "maxCount": 12, "respawnTime": 600}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 520, "y": 540, "z": 0}
  }
);

// 更新国子监庭院出口
const guozijianCourtyard = guozijian.rooms.find(r => r.id === 'tj_guozijian_courtyard');
guozijianCourtyard.exits.push(
  {"direction": "east", "targetRoomId": "tj_guozijian_east_room", "description": "东面是东学舍"},
  {"direction": "west", "targetRoomId": "tj_guozijian_west_room", "description": "西面是西学舍"}
);

// 在东城区添加更多街道和店铺 (5个)
const eastStreet = eastDistrict.locations.find(l => l.id === 'east_street');

eastStreet.rooms.push(
  {
    "id": "tj_market_east_vegetable",
    "name": "东市-菜市",
    "type": "vegetable_market",
    "description": "东市的菜市，专门售卖蔬菜。摊位上摆满了新鲜的时令蔬菜，青翠欲滴。菜农们热情地招呼客人，介绍自家菜的新鲜。虽然环境简陋，但充满了市井生活的烟火气。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_street_east_market", "description": "东面是东市入口"}
    ],
    "npcs": [
      {"npcId": "vegetable_vendor", "position": "selling", "spawnChance": 100, "maxCount": 10, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 550, "y": 480, "z": 0}
  },
  {
    "id": "tj_market_east_goods",
    "name": "东市-杂货区",
    "type": "market",
    "description": "东市的杂货区，售卖各种日用品。有锅碗瓢盆、针头线脑、油盐酱醋等。小贩们吆喝着推销商品，主妇们精打细算地挑选购买。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_market_east_main", "description": "西面是东市中心"}
    ],
    "npcs": [
      {"npcId": "goods_vendor", "position": "selling", "spawnChance": 100, "maxCount": 8, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 570, "y": 470, "z": 0}
  },
  {
    "id": "tj_market_east_cloth",
    "name": "东市-布匹区",
    "type": "cloth_market",
    "description": "东市的布匹区，售卖各种布料。有棉布、麻布、丝绸等。布商们展示着不同花色的布匹，供客人挑选。裁缝在一旁为客人量体裁衣。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_market_east_main", "description": "东面是东市中心"}
    ],
    "npcs": [
      {"npcId": "cloth_merchant", "position": "selling", "spawnChance": 100, "maxCount": 6, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 550, "y": 470, "z": 0}
  },
  {
    "id": "tj_east_clinic",
    "name": "东城医馆",
    "type": "clinic",
    "description": "东城的一家医馆，为百姓治病疗伤。医馆不大，但药材齐全。老大夫医术高明，对穷人也是分文不取。墙上挂着药材图谱和医方。常有病患前来求医。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_street_east_mansion", "description": "西面是大宅街"}
    ],
    "npcs": [
      {"npcId": "doctor", "position": "treating", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "patient", "position": "waiting", "spawnChance": 80, "maxCount": 5, "respawnTime": 900}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 560, "y": 490, "z": 0}
  },
  {
    "id": "tj_east_temple",
    "name": "东城土地庙",
    "type": "temple",
    "description": "一座小小的土地庙，供奉着土地公公。庙宇简陋，但香火不断。附近的居民常来上香祈福，祈求平安。庙前有一棵古树，据说很灵验。",
    "exits": [
      {"direction": "south", "targetRoomId": "tj_street_east_mansion", "description": "南面是大宅街"}
    ],
    "npcs": [
      {"npcId": "temple_keeper", "position": "sweeping", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "worshipper", "position": "praying", "spawnChance": 70, "maxCount": 3, "respawnTime": 1200}
    ],
    "items": [
      {"itemId": "incense_burner", "name": "香炉", "description": "供奉用的香炉", "type": "furniture", "canPickup": false}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "dim"},
    "coordinates": {"x": 560, "y": 500, "z": 0}
  }
);

// 更新东市入口和东市中心的出口
const eastMarketEntrance = eastStreet.rooms.find(r => r.id === 'tj_street_east_market');
eastMarketEntrance.exits.push(
  {"direction": "west", "targetRoomId": "tj_market_east_vegetable", "description": "西面是菜市"}
);

const eastMarketMain = eastStreet.rooms.find(r => r.id === 'tj_market_east_main');
eastMarketMain.exits.push(
  {"direction": "east", "targetRoomId": "tj_market_east_goods", "description": "东面是杂货区"},
  {"direction": "west", "targetRoomId": "tj_market_east_cloth", "description": "西面是布匹区"}
);

const mansionStreet = eastStreet.rooms.find(r => r.id === 'tj_street_east_mansion');
mansionStreet.exits.push(
  {"direction": "east", "targetRoomId": "tj_east_clinic", "description": "东面是东城医馆"},
  {"direction": "north", "targetRoomId": "tj_east_temple", "description": "北面是土地庙"}
);

// 在西城区添加更多房间 (5个)
const westDistrict = part2.districts.find(d => d.id === 'west_district');
const westStreet = westDistrict.locations.find(l => l.id === 'west_street');

westStreet.rooms.push(
  {
    "id": "tj_west_market_goods",
    "name": "西市-日用品区",
    "type": "market",
    "description": "西市的日用品区域，售卖各种生活必需品。比东市更加平民化，价格也更便宜。这里是西城百姓主要的购物场所。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_west_market", "description": "东面是西市中心"}
    ],
    "npcs": [
      {"npcId": "cheap_vendor", "position": "selling", "spawnChance": 100, "maxCount": 15, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 440, "y": 490, "z": 0}
  },
  {
    "id": "tj_west_clinic",
    "name": "西城施医所",
    "type": "charity_clinic",
    "description": "一家免费为穷人看病的施医所，由慈善人士捐资开办。虽然药材有限，但大夫尽心尽力。每天都有很多穷苦百姓排队看病。这里是西城贫民的希望之所。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_street_west_main", "description": "东面是西大街"}
    ],
    "npcs": [
      {"npcId": "charity_doctor", "position": "treating", "spawnChance": 100, "maxCount": 2, "respawnTime": 0},
      {"npcId": "poor_patient", "position": "waiting", "spawnChance": 90, "maxCount": 15, "respawnTime": 600}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 440, "y": 500, "z": 0}
  },
  {
    "id": "tj_west_noodle_shop",
    "name": "老张面馆",
    "type": "restaurant",
    "description": "一家平民面馆，专卖各种面食。虽然店面简陋，但面条劲道，汤头鲜美，价格实惠。常有劳工和穷人在此用餐。老板是个憨厚的汉子，常常赊账给穷人。",
    "exits": [
      {"direction": "north", "targetRoomId": "tj_street_west_main", "description": "北面是西大街"}
    ],
    "npcs": [
      {"npcId": "noodle_shop_owner", "position": "cooking", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "diner_poor", "position": "eating", "spawnChance": 90, "maxCount": 10, "respawnTime": 900}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
    "coordinates": {"x": 450, "y": 490, "z": 0}
  },
  {
    "id": "tj_west_pawn_shop",
    "name": "当铺",
    "type": "pawn_shop",
    "description": "一家当铺，收购和典当各种物品。柜台后坐着精明的掌柜，用算盘计算着典当物的价值。穷人在此典当家当换取现钱，富人则来淘宝捡漏。墙上挂满了各种典当物。",
    "exits": [
      {"direction": "north", "targetRoomId": "tj_street_west_main", "description": "北面是西大街"}
    ],
    "npcs": [
      {"npcId": "pawnbroker", "position": "sitting", "spawnChance": 100, "maxCount": 1, "respawnTime": 0}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "dim"},
    "coordinates": {"x": 450, "y": 490, "z": 0}
  },
  {
    "id": "tj_west_well",
    "name": "公共水井",
    "type": "well",
    "description": "西城的公共水井，是附近居民的主要水源。井旁常有妇女在此打水、洗衣、聊天。井台已被绳索磨出深深的凹痕，见证了岁月的流逝。这里是西城百姓日常生活的重要场所。",
    "exits": [
      {"direction": "east", "targetRoomId": "tj_west_residential", "description": "东面是西城民居区"}
    ],
    "npcs": [
      {"npcId": "washerwoman", "position": "washing", "spawnChance": 80, "maxCount": 5, "respawnTime": 900}
    ],
    "items": [
      {"itemId": "water_well", "name": "水井", "description": "公共水井", "type": "utility", "canPickup": false, "canInteract": true}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
    "coordinates": {"x": 430, "y": 500, "z": 0}
  }
);

// 更新西市和西大街的出口
const westMarket = westStreet.rooms.find(r => r.id === 'tj_west_market');
westMarket.exits.push(
  {"direction": "west", "targetRoomId": "tj_west_market_goods", "description": "西面是日用品区"}
);

const westMainStreet = westStreet.rooms.find(r => r.id === 'tj_street_west_main');
westMainStreet.exits.push(
  {"direction": "west", "targetRoomId": "tj_west_clinic", "description": "西面是施医所"},
  {"direction": "south", "targetRoomId": "tj_west_noodle_shop", "description": "南面是老张面馆"},
  {"direction": "south", "targetRoomId": "tj_west_pawn_shop", "description": "南面是当铺"}
);

const westResidential = westStreet.rooms.find(r => r.id === 'tj_west_residential');
westResidential.exits.push(
  {"direction": "west", "targetRoomId": "tj_west_well", "description": "西面是公共水井"}
);

console.log('✅ Part2添加了15个房间');

// Part3: 从35扩充到40 (需要+5个房间)
console.log('\n=== Part3: 添加5个房间 ===');

// 在贫民区添加更多房间
const slumDistrict = part3.districts.find(d => d.id === 'slum_district');
const slumArea = slumDistrict.locations.find(l => l.id === 'slum_area');

slumArea.rooms.push(
  {
    "id": "tj_slum_drug_den",
    "name": "烟馆",
    "type": "opium_den",
    "description": "一处隐秘的烟馆，是贫民区的毒瘤。昏暗的房间里弥漫着烟雾，瘾君子们躺在烟榻上吞云吐雾。这里见证了无数家庭的破碎和人生的毁灭。",
    "exits": [
      {"direction": "north", "targetRoomId": "tj_slum_main_alley", "description": "北面是主巷道"}
    ],
    "npcs": [
      {"npcId": "opium_dealer", "position": "watching", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "addict", "position": "lying", "spawnChance": 90, "maxCount": 8, "respawnTime": 1800}
    ],
    "properties": {"safeZone": false, "pvpAllowed": true, "canTeleport": false, "lightLevel": "dark"},
    "coordinates": {"x": 430, "y": 460, "z": 0}
  },
  {
    "id": "tj_slum_black_market",
    "name": "黑市",
    "type": "black_market",
    "description": "贫民区的黑市，交易各种来路不明的物品。有偷盗的赃物，有走私的违禁品。交易者都蒙着脸，低声讨价还价。城卫军偶尔来查，但这里总有办法提前得到消息。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_slum_main_alley", "description": "西面是主巷道"}
    ],
    "npcs": [
      {"npcId": "black_market_dealer", "position": "trading", "spawnChance": 90, "maxCount": 5, "respawnTime": 1200},
      {"npcId": "fence", "position": "standing", "spawnChance": 100, "maxCount": 1, "respawnTime": 0}
    ],
    "properties": {"safeZone": false, "pvpAllowed": true, "canTeleport": false, "lightLevel": "dark"},
    "coordinates": {"x": 440, "y": 470, "z": 0}
  },
  {
    "id": "tj_slum_beggar_den",
    "name": "丐帮据点",
    "type": "hideout",
    "description": "丐帮在贫民区的一处据点。破旧的房子里聚集着一群乞丐，他们白天在城里乞讨，晚上在此休息。丐帮有自己的规矩和等级，互相帮助。这里虽然贫穷，但也有江湖义气。",
    "exits": [
      {"direction": "south", "targetRoomId": "tj_slum_main_alley", "description": "南面是主巷道"}
    ],
    "npcs": [
      {"npcId": "beggar_chief", "position": "sitting", "spawnChance": 80, "maxCount": 1, "respawnTime": 0},
      {"npcId": "beggar", "position": "resting", "spawnChance": 100, "maxCount": 12, "respawnTime": 600}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 430, "y": 480, "z": 0}
  },
  {
    "id": "tj_slum_fight_pit",
    "name": "地下斗场",
    "type": "arena",
    "description": "一处非法的地下斗场，穷人在此进行血腥的搏斗以换取微薄的赏钱。围观者下注赌博，呐喊助威。受伤甚至死亡都很常见，但为了生存，仍有人不断参与。这是贫民区最黑暗的角落之一。",
    "exits": [
      {"direction": "up", "targetRoomId": "tj_slum_main_alley", "description": "向上是主巷道"}
    ],
    "npcs": [
      {"npcId": "fight_master", "position": "watching", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "fighter", "position": "fighting", "spawnChance": 80, "maxCount": 4, "respawnTime": 1800},
      {"npcId": "spectator", "position": "watching", "spawnChance": 90, "maxCount": 20, "respawnTime": 900}
    ],
    "properties": {"safeZone": false, "pvpAllowed": true, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 430, "y": 470, "z": -3}
  },
  {
    "id": "tj_slum_charity_clinic",
    "name": "义诊点",
    "type": "clinic",
    "description": "一处简陋的义诊点，由好心的郎中开设，免费为贫民看病。药材有限，条件简陋,但对穷人来说已是救命之所。郎中常常自掏腰包买药,默默行善。",
    "exits": [
      {"direction": "west", "targetRoomId": "tj_slum_main_alley", "description": "西面是主巷道"}
    ],
    "npcs": [
      {"npcId": "charitable_physician", "position": "treating", "spawnChance": 100, "maxCount": 1, "respawnTime": 0},
      {"npcId": "sick_poor", "position": "waiting", "spawnChance": 90, "maxCount": 10, "respawnTime": 900}
    ],
    "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "dim"},
    "coordinates": {"x": 440, "y": 470, "z": 0}
  }
);

// 更新贫民区主巷的出口
const slumMainAlley = slumArea.rooms.find(r => r.id === 'tj_slum_main_alley');
slumMainAlley.exits.push(
  {"direction": "south", "targetRoomId": "tj_slum_drug_den", "description": "南面传来烟雾味", "hidden": true},
  {"direction": "east", "targetRoomId": "tj_slum_black_market", "description": "东面有交易声", "hidden": true},
  {"direction": "north", "targetRoomId": "tj_slum_beggar_den", "description": "北面是丐帮据点"},
  {"direction": "down", "targetRoomId": "tj_slum_fight_pit", "description": "向下传来喧哗声", "hidden": true},
  {"direction": "east", "targetRoomId": "tj_slum_charity_clinic", "description": "东面是义诊点"}
);

console.log('✅ Part3添加了5个房间');

// 更新metadata
function updateMetadata(data) {
  let roomCount = 0;
  data.districts.forEach(d => {
    d.locations.forEach(l => {
      roomCount += l.rooms.length;
    });
  });
  data.metadata.roomCount = roomCount;
  data.metadata.lastUpdate = '2025-11-18';
  return roomCount;
}

const p1Count = updateMetadata(part1);
const p2Count = updateMetadata(part2);
const p3Count = updateMetadata(part3);

// 保存文件
fs.writeFileSync(part1Path, JSON.stringify(part1, null, 2), 'utf8');
fs.writeFileSync(part2Path, JSON.stringify(part2, null, 2), 'utf8');
fs.writeFileSync(part3Path, JSON.stringify(part3, null, 2), 'utf8');

console.log('\n=== 扩充完成! ===');
console.log(`Part1: ${p1Count} 个房间`);
console.log(`Part2: ${p2Count} 个房间`);
console.log(`Part3: ${p3Count} 个房间`);
console.log(`总计: ${p1Count + p2Count + p3Count} 个房间`);
console.log('\n所有文件已保存,请运行 analyze_connectivity.js 验证连通性');
