/**
 * 自动修复房间连通性
 */

const fs = require('fs');
const path = require('path');

// 读取三个part文件
const part1Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json';
const part2Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json';
const part3Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json';

const part1 = JSON.parse(fs.readFileSync(part1Path, 'utf8'));
const part2 = JSON.parse(fs.readFileSync(part2Path, 'utf8'));
const part3 = JSON.parse(fs.readFileSync(part3Path, 'utf8'));

console.log('=== 开始修复连通性问题 ===\n');

// 辅助函数:查找房间
function findRoom(data, roomId) {
  for (const district of data.districts) {
    for (const location of district.locations) {
      for (const room of location.rooms) {
        if (room.id === roomId) {
          return room;
        }
      }
    }
  }
  return null;
}

// 1. 创建缺失的街道连接房间
console.log('1. 创建缺失的街道房间...\n');

// 在part1的商业区添加东长安街和西长安街
const imperialDistrict = part1.districts.find(d => d.id === 'imperial_district');
if (imperialDistrict) {
  const palaceLocation = imperialDistrict.locations.find(l => l.id === 'palace_complex');
  if (palaceLocation) {
    // 添加东长安街和西长安街到新的location
    imperialDistrict.locations.push({
      "id": "palace_streets",
      "name": "皇宫周边街道",
      "type": "street",
      "description": "皇宫东西两侧的主要街道",
      "rooms": [
        {
          "id": "tj_street_east_palace",
          "name": "东长安街",
          "type": "street",
          "description": "皇宫东侧的主要街道,连接宫前广场与东城区。街道宽阔整洁,两旁是国子监等重要建筑。",
          "exits": [
            {"direction": "west", "targetRoomId": "tj_palace_square", "description": "西面是宫前广场"},
            {"direction": "north", "targetRoomId": "tj_guozijian_gate", "description": "北面是国子监"},
            {"direction": "east", "targetRoomId": "tj_street_east_mansion", "description": "东面是大宅街"},
            {"direction": "south", "targetRoomId": "tj_barracks_main", "description": "南面是城卫营"}
          ],
          "npcs": [{"npcId": "patrol_guard", "position": "patrolling", "spawnChance": 100, "maxCount": 2, "respawnTime": 0}],
          "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
          "coordinates": {"x": 520, "y": 530, "z": 0}
        },
        {
          "id": "tj_street_west_palace",
          "name": "西长安街",
          "type": "street",
          "description": "皇宫西侧的主要街道,连接宫前广场与西城区和六部衙门。街道两旁是钦天监等机构。",
          "exits": [
            {"direction": "east", "targetRoomId": "tj_palace_square", "description": "东面是宫前广场"},
            {"direction": "north", "targetRoomId": "tj_qintianjian_gate", "description": "北面是钦天监"},
            {"direction": "west", "targetRoomId": "tj_street_west_main", "description": "西面是西大街"},
            {"direction": "south", "targetRoomId": "tj_ministry_plaza", "description": "南面是六部广场"}
          ],
          "npcs": [{"npcId": "patrol_guard", "position": "patrolling", "spawnChance": 100, "maxCount": 2, "respawnTime": 0}],
          "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": true, "lightLevel": "bright"},
          "coordinates": {"x": 480, "y": 530, "z": 0}
        }
      ]
    });
    console.log('✅ 添加了东长安街和西长安街');
  }
}

// 2. 移除所有断裂的出口
console.log('\n2. 移除断裂的出口...\n');

const brokenExits = [
  // Part1
  {data: part1, roomId: 'tj_gate_south_inside', directions: ['east', 'west']},
  {data: part1, roomId: 'tj_gate_south_wall_east', directions: ['east']},
  {data: part1, roomId: 'tj_gate_south_wall_west', directions: ['west']},
  {data: part1, roomId: 'tj_palace_main_hall', directions: ['north']},
  {data: part1, roomId: 'tj_palace_garden', directions: ['south', 'east', 'west']},
  {data: part1, roomId: 'tj_guozijian_courtyard', directions: ['east', 'west']},
  {data: part1, roomId: 'tj_qintianjian_courtyard', directions: ['east']},
  {data: part1, roomId: 'tj_auction_house', directions: ['up']},
  // Part2
  {data: part2, roomId: 'tj_street_east_market', directions: ['west']},
  {data: part2, roomId: 'tj_market_east_main', directions: ['east', 'west']},
  {data: part2, roomId: 'tj_west_market', directions: ['west']},
  // Part3
  {data: part3, roomId: 'tj_gate_north_inside', directions: ['south']},
  {data: part3, roomId: 'tj_gate_north_tower', directions: ['east', 'west']},
  {data: part3, roomId: 'tj_wall_northeast_corner', directions: ['west']},
  {data: part3, roomId: 'tj_wall_northwest_corner', directions: ['east']},
  {data: part3, roomId: 'tj_wall_southeast_corner', directions: ['west']},
  {data: part3, roomId: 'tj_wall_southwest_corner', directions: ['east']},
];

brokenExits.forEach(({data, roomId, directions}) => {
  const room = findRoom(data, roomId);
  if (room && room.exits) {
    const originalLength = room.exits.length;
    room.exits = room.exits.filter(exit => !directions.includes(exit.direction));
    if (room.exits.length < originalLength) {
      console.log(`✅ 从 ${room.name} 移除了 ${originalLength - room.exits.length} 个断裂出口`);
    }
  }
});

// 3. 连接主要区域
console.log('\n3. 连接主要连通分量...\n');

// 神兵阁 → 御街的双向连接
const weaponShop = findRoom(part1, 'tj_shop_weapons');
const royalStreetSouth = findRoom(part1, 'tj_street_royal_south_01');
if (weaponShop && royalStreetSouth) {
  // 御街 → 神兵阁
  if (!royalStreetSouth.exits.some(e => e.targetRoomId === 'tj_shop_weapons')) {
    royalStreetSouth.exits.push({
      "direction": "east",
      "targetRoomId": "tj_shop_weapons",
      "description": "东面是神兵阁"
    });
    console.log('✅ 添加: 御街-南段 → 神兵阁');
  }
}

// 西门内 → 西大街的双向连接
const westGateInside = findRoom(part3, 'tj_gate_west_inside');
const westMainStreet = findRoom(part2, 'tj_street_west_main');
if (westGateInside && westMainStreet) {
  // 西大街 → 西门内
  if (!westMainStreet.exits.some(e => e.targetRoomId === 'tj_gate_west_inside')) {
    westMainStreet.exits.push({
      "direction": "west",
      "targetRoomId": "tj_gate_west_inside",
      "description": "西面是西门内广场"
    });
    console.log('✅ 添加: 西大街 → 西门内广场');
  }
}

// 贫民区 → 西大街的双向连接
const slumEntrance = findRoom(part3, 'tj_slum_entrance');
if (slumEntrance && westMainStreet) {
  // 西大街 → 贫民区
  if (!westMainStreet.exits.some(e => e.targetRoomId === 'tj_slum_entrance')) {
    westMainStreet.exits.push({
      "direction": "south",
      "targetRoomId": "tj_slum_entrance",
      "description": "南面是贫民区"
    });
    console.log('✅ 添加: 西大街 → 贫民区入口');
  }
}

// 东门内 → 大宅街连接
const eastGateInside = findRoom(part3, 'tj_gate_east_inside');
const mansionStreet = findRoom(part2, 'tj_street_east_mansion');
if (eastGateInside && mansionStreet) {
  eastGateInside.exits = eastGateInside.exits.filter(e => e.direction !== 'west');
  eastGateInside.exits.push({
    "direction": "west",
    "targetRoomId": "tj_street_east_mansion",
    "description": "西面是大宅街"
  });

  if (!mansionStreet.exits.some(e => e.targetRoomId === 'tj_gate_east_inside')) {
    mansionStreet.exits.push({
      "direction": "east",
      "targetRoomId": "tj_gate_east_inside",
      "description": "东面是东门内广场"
    });
  }
  console.log('✅ 连接: 东门内广场 ↔ 大宅街');
}

// 城墙连接到南城墙
const southWallEast = findRoom(part1, 'tj_gate_south_wall_east');
const southWallWest = findRoom(part1, 'tj_gate_south_wall_west');
const seCorner = findRoom(part3, 'tj_wall_southeast_corner');
const swCorner = findRoom(part3, 'tj_wall_southwest_corner');

if (southWallEast && seCorner) {
  southWallEast.exits.push({
    "direction": "east",
    "targetRoomId": "tj_wall_southeast_corner",
    "description": "东面是东南角楼"
  });

  const seExit = seCorner.exits.find(e => e.direction === 'west');
  if (seExit) {
    seExit.targetRoomId = 'tj_gate_south_wall_east';
  }
  console.log('✅ 连接: 南城墙东段 ↔ 东南角楼');
}

if (southWallWest && swCorner) {
  southWallWest.exits.push({
    "direction": "west",
    "targetRoomId": "tj_wall_southwest_corner",
    "description": "西面是西南角楼"
  });

  const swExit = swCorner.exits.find(e => e.direction === 'east');
  if (swExit) {
    swExit.targetRoomId = 'tj_gate_south_wall_west';
  }
  console.log('✅ 连接: 南城墙西段 ↔ 西南角楼');
}

// 连接北城墙
const northTower = findRoom(part3, 'tj_gate_north_tower');
const neCorner = findRoom(part3, 'tj_wall_northeast_corner');
const nwCorner = findRoom(part3, 'tj_wall_northwest_corner');

if (northTower && neCorner && nwCorner) {
  // 创建北城墙东西段
  const northGateDistrict = part3.districts.find(d => d.id === 'north_gate_district');
  if (northGateDistrict) {
    const gateComplex = northGateDistrict.locations.find(l => l.id === 'north_gate_complex');
    if (gateComplex) {
      gateComplex.rooms.push(
        {
          "id": "tj_wall_north_east",
          "name": "北城墙-东段",
          "type": "wall",
          "description": "北城墙的东段,连接北门城楼和东北角楼。",
          "exits": [
            {"direction": "west", "targetRoomId": "tj_gate_north_tower", "description": "西面是北门城楼"},
            {"direction": "east", "targetRoomId": "tj_wall_northeast_corner", "description": "东面是东北角楼"}
          ],
          "npcs": [{"npcId": "wall_patrol", "position": "patrolling", "spawnChance": 100, "maxCount": 3, "respawnTime": 0}],
          "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
          "coordinates": {"x": 520, "y": 540, "z": 15}
        },
        {
          "id": "tj_wall_north_west",
          "name": "北城墙-西段",
          "type": "wall",
          "description": "北城墙的西段,连接北门城楼和西北角楼。",
          "exits": [
            {"direction": "east", "targetRoomId": "tj_gate_north_tower", "description": "东面是北门城楼"},
            {"direction": "west", "targetRoomId": "tj_wall_northwest_corner", "description": "西面是西北角楼"}
          ],
          "npcs": [{"npcId": "wall_patrol", "position": "patrolling", "spawnChance": 100, "maxCount": 3, "respawnTime": 0}],
          "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
          "coordinates": {"x": 480, "y": 540, "z": 15}
        }
      );

      // 更新北门城楼的出口
      const eastExit = northTower.exits.find(e => e.direction === 'east');
      if (eastExit) eastExit.targetRoomId = 'tj_wall_north_east';

      const westExit = northTower.exits.find(e => e.direction === 'west');
      if (westExit) westExit.targetRoomId = 'tj_wall_north_west';

      // 更新角楼出口
      const neWestExit = neCorner.exits.find(e => e.direction === 'west');
      if (neWestExit) neWestExit.targetRoomId = 'tj_wall_north_east';

      const nwEastExit = nwCorner.exits.find(e => e.direction === 'east');
      if (nwEastExit) nwEastExit.targetRoomId = 'tj_wall_north_west';

      console.log('✅ 创建并连接北城墙东西段');
    }
  }
}

// 创建南城墙角楼连接
const cityWallDistrict = part3.districts.find(d => d.id === 'city_wall_district');
if (cityWallDistrict) {
  const wallLocation = cityWallDistrict.locations.find(l => l.id === 'city_walls');
  if (wallLocation) {
    wallLocation.rooms.push(
      {
        "id": "tj_wall_south_east_corner",
        "name": "南城墙-东段连接",
        "type": "wall",
        "description": "南城墙东段,连接南门和东南角楼。",
        "exits": [
          {"direction": "west", "targetRoomId": "tj_gate_south_wall_east", "description": "西面是南城墙东段"},
          {"direction": "east", "targetRoomId": "tj_wall_southeast_corner", "description": "东面是东南角楼"}
        ],
        "npcs": [{"npcId": "wall_patrol", "position": "patrolling", "spawnChance": 100, "maxCount": 3, "respawnTime": 0}],
        "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
        "coordinates": {"x": 520, "y": 460, "z": 10}
      },
      {
        "id": "tj_wall_south_west_corner",
        "name": "南城墙-西段连接",
        "type": "wall",
        "description": "南城墙西段,连接南门和西南角楼。",
        "exits": [
          {"direction": "east", "targetRoomId": "tj_gate_south_wall_west", "description": "东面是南城墙西段"},
          {"direction": "west", "targetRoomId": "tj_wall_southwest_corner", "description": "西面是西南角楼"}
        ],
        "npcs": [{"npcId": "wall_patrol", "position": "patrolling", "spawnChance": 100, "maxCount": 3, "respawnTime": 0}],
        "properties": {"safeZone": true, "pvpAllowed": false, "canTeleport": false, "lightLevel": "bright"},
        "coordinates": {"x": 480, "y": 460, "z": 10}
      }
    );
    console.log('✅ 创建南城墙角楼连接房间');
  }
}

// 4. 保存修复后的文件
console.log('\n4. 保存修复后的文件...\n');

// 更新房间计数
part1.metadata.roomCount = 0;
part1.districts.forEach(d => {
  d.locations.forEach(l => {
    part1.metadata.roomCount += l.rooms.length;
  });
});

part3.metadata.roomCount = 0;
part3.districts.forEach(d => {
  d.locations.forEach(l => {
    part3.metadata.roomCount += l.rooms.length;
  });
});

fs.writeFileSync(part1Path, JSON.stringify(part1, null, 2), 'utf8');
fs.writeFileSync(part2Path, JSON.stringify(part2, null, 2), 'utf8');
fs.writeFileSync(part3Path, JSON.stringify(part3, null, 2), 'utf8');

console.log('✅ Part1 已保存 (' + part1.metadata.roomCount + ' 个房间)');
console.log('✅ Part2 已保存 (50 个房间)');
console.log('✅ Part3 已保存 (' + part3.metadata.roomCount + ' 个房间)');

console.log('\n=== 修复完成! ===');
console.log('建议运行 analyze_connectivity.js 再次检查连通性');
