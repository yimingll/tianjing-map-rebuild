/**
 * 最终修复剩余的连通性问题
 */

const fs = require('fs');

const part1Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json';
const part2Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json';
const part3Path = 'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json';

const part1 = JSON.parse(fs.readFileSync(part1Path, 'utf8'));
const part2 = JSON.parse(fs.readFileSync(part2Path, 'utf8'));
const part3 = JSON.parse(fs.readFileSync(part3Path, 'utf8'));

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

console.log('=== 最终修复 ===\n');

// 1. 修复御花园 - 连接到太和殿
const garden = findRoom(part1, 'tj_palace_garden');
const mainHall = findRoom(part1, 'tj_palace_main_hall');

if (garden && mainHall) {
  garden.exits = [
    {"direction": "north", "targetRoomId": "tj_palace_main_hall", "description": "北面是太和殿"}
  ];

  // 太和殿添加返回路径
  if (!mainHall.exits.some(e => e.targetRoomId === 'tj_palace_garden')) {
    mainHall.exits.push({
      "direction": "south",
      "targetRoomId": "tj_palace_garden",
      "description": "南面是御花园"
    });
  }

  console.log('✅ 连接: 御花园 ↔ 太和殿');
}

// 2. 修复北城墙的双向连接
const northTower = findRoom(part3, 'tj_gate_north_tower');
const neCorner = findRoom(part3, 'tj_wall_northeast_corner');
const nwCorner = findRoom(part3, 'tj_wall_northwest_corner');
const northEastWall = findRoom(part3, 'tj_wall_north_east');
const northWestWall = findRoom(part3, 'tj_wall_north_west');

if (northTower && northEastWall) {
  // 北门城楼 → 东段
  const eastExit = northTower.exits.find(e => e.direction === 'east');
  if (eastExit) {
    eastExit.targetRoomId = 'tj_wall_north_east';
  } else {
    northTower.exits.push({
      "direction": "east",
      "targetRoomId": "tj_wall_north_east",
      "description": "东面是北城墙东段"
    });
  }
  console.log('✅ 修正: 北门城楼 → 北城墙东段');
}

if (northTower && northWestWall) {
  // 北门城楼 → 西段
  const westExit = northTower.exits.find(e => e.direction === 'west');
  if (westExit) {
    westExit.targetRoomId = 'tj_wall_north_west';
  } else {
    northTower.exits.push({
      "direction": "west",
      "targetRoomId": "tj_wall_north_west",
      "description": "西面是北城墙西段"
    });
  }
  console.log('✅ 修正: 北门城楼 → 北城墙西段');
}

if (neCorner && northEastWall) {
  // 东北角楼 ← 东段
  const cornerWestExit = neCorner.exits.find(e => e.direction === 'west');
  if (cornerWestExit) {
    cornerWestExit.targetRoomId = 'tj_wall_north_east';
  } else {
    neCorner.exits.push({
      "direction": "west",
      "targetRoomId": "tj_wall_north_east",
      "description": "西面是北城墙东段"
    });
  }
  console.log('✅ 修正: 东北角楼 ← 北城墙东段');
}

if (nwCorner && northWestWall) {
  // 西北角楼 ← 西段
  const cornerEastExit = nwCorner.exits.find(e => e.direction === 'east');
  if (cornerEastExit) {
    cornerEastExit.targetRoomId = 'tj_wall_north_west';
  } else {
    nwCorner.exits.push({
      "direction": "east",
      "targetRoomId": "tj_wall_north_west",
      "description": "东面是北城墙西段"
    });
  }
  console.log('✅ 修正: 西北角楼 ← 北城墙西段');
}

// 3. 修复南城墙连接
const seCornerLink = findRoom(part3, 'tj_wall_south_east_corner');
const swCornerLink = findRoom(part3, 'tj_wall_south_west_corner');
const seCorner = findRoom(part3, 'tj_wall_southeast_corner');
const swCorner = findRoom(part3, 'tj_wall_southwest_corner');
const southEastWall = findRoom(part1, 'tj_gate_south_wall_east');
const southWestWall = findRoom(part1, 'tj_gate_south_wall_west');

if (southEastWall && seCornerLink) {
  // 南城墙东段 ← 连接房间
  if (!southEastWall.exits.some(e => e.targetRoomId === 'tj_wall_south_east_corner')) {
    southEastWall.exits.push({
      "direction": "east",
      "targetRoomId": "tj_wall_south_east_corner",
      "description": "东面继续是城墙"
    });
  }
  console.log('✅ 修正: 南城墙东段 → 连接段');
}

if (southWestWall && swCornerLink) {
  // 南城墙西段 ← 连接房间
  if (!southWestWall.exits.some(e => e.targetRoomId === 'tj_wall_south_west_corner')) {
    southWestWall.exits.push({
      "direction": "west",
      "targetRoomId": "tj_wall_south_west_corner",
      "description": "西面继续是城墙"
    });
  }
  console.log('✅ 修正: 南城墙西段 → 连接段');
}

if (seCorner && seCornerLink) {
  // 东南角楼 ← 连接房间
  const seWestExit = seCorner.exits.find(e => e.direction === 'west');
  if (seWestExit) {
    seWestExit.targetRoomId = 'tj_wall_south_east_corner';
  } else {
    seCorner.exits.push({
      "direction": "west",
      "targetRoomId": "tj_wall_south_east_corner",
      "description": "西面是南城墙"
    });
  }
  console.log('✅ 修正: 东南角楼 ← 连接段');
}

if (swCorner && swCornerLink) {
  // 西南角楼 ← 连接房间
  const swEastExit = swCorner.exits.find(e => e.direction === 'east');
  if (swEastExit) {
    swEastExit.targetRoomId = 'tj_wall_south_west_corner';
  } else {
    swCorner.exits.push({
      "direction": "east",
      "targetRoomId": "tj_wall_south_west_corner",
      "description": "东面是南城墙"
    });
  }
  console.log('✅ 修正: 西南角楼 ← 连接段');
}

// 4. 连接北门到主城区
const northGateInside = findRoom(part3, 'tj_gate_north_inside');
const palaceSquare = findRoom(part1, 'tj_palace_square');

if (northGateInside && palaceSquare) {
  // 北门内 → 宫前广场
  northGateInside.exits.push({
    "direction": "south",
    "targetRoomId": "tj_palace_square",
    "description": "南面通往宫前广场"
  });

  // 宫前广场 → 北门内
  if (!palaceSquare.exits.some(e => e.targetRoomId === 'tj_gate_north_inside')) {
    palaceSquare.exits.push({
      "direction": "north",
      "targetRoomId": "tj_gate_north_inside",
      "description": "北面是北门方向"
    });
  }

  console.log('✅ 连接: 北门内广场 ↔ 宫前广场');
}

// 保存文件
fs.writeFileSync(part1Path, JSON.stringify(part1, null, 2), 'utf8');
fs.writeFileSync(part2Path, JSON.stringify(part2, null, 2), 'utf8');
fs.writeFileSync(part3Path, JSON.stringify(part3, null, 2), 'utf8');

console.log('\n✅ 所有文件已保存');
console.log('\n=== 修复完成! 请重新运行 analyze_connectivity.js 检查 ===');
