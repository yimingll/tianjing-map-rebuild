#!/usr/bin/env node
/**
 * 修复天京城地图连接问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复天京城地图连接问题...\n');

// 读取优化后的地图文件
const part1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json'), 'utf8'));
const part2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json'), 'utf8'));
const part3 = JSON.parse(fs.readFileSync(path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json'), 'utf8'));

// 获取所有房间的映射
const allRooms = new Map();
const allDistricts = [...part1.districts, ...part2.districts, ...part3.districts];

allDistricts.forEach(district => {
  district.locations.forEach(location => {
    location.rooms.forEach(room => {
      allRooms.set(room.id, {
        ...room,
        districtId: district.id,
        districtName: district.name,
        locationId: location.id,
        locationName: location.name
      });
    });
  });
});

console.log(`📊 当前统计:`);
console.log(`   • 总房间数: ${allRooms.size}`);
console.log(`   • 总区域数: ${allDistricts.length}`);

// === 修复不对称连接 ===

// 修复1: 在六部广场添加返回宫前广场的连接
const ministryPlaza = allRooms.get('tj_ministry_plaza');
if (ministryPlaza) {
  const hasReturn = ministryPlaza.exits?.some(exit =>
    exit.targetRoomId === 'tj_palace_square' && exit.direction === 'southwest'
  );

  if (!hasReturn) {
    if (!ministryPlaza.exits) ministryPlaza.exits = [];
    ministryPlaza.exits.push({
      direction: 'southwest',
      targetRoomId: 'tj_palace_square',
      description: '西南是宫前广场'
    });
    console.log(`✅ 修复1: 在六部广场添加返回宫前广场的连接`);
  } else {
    console.log(`ℹ️  修复1: 六部广场已有返回连接，无需修复`);
  }
}

// 修复2: 在宫前广场添加返回北门内广场的连接
const palaceSquare = allRooms.get('tj_palace_square');
if (palaceSquare) {
  const hasReturn = palaceSquare.exits?.some(exit =>
    exit.targetRoomId === 'tj_gate_north_inside' && exit.direction === 'north'
  );

  if (!hasReturn) {
    if (!palaceSquare.exits) palaceSquare.exits = [];
    palaceSquare.exits.push({
      direction: 'north',
      targetRoomId: 'tj_gate_north_inside',
      description: '北面是北门内广场'
    });
    console.log(`✅ 修复2: 在宫前广场添加返回北门内广场的连接`);
  } else {
    console.log(`ℹ️  修复2: 宫前广场已有返回连接，无需修复`);
  }
}

// === 验证连接对称性 ===
console.log(`\n🔍 验证连接对称性:`);

const asymmetricConnections = [];
const allConnections = new Set();

// 收集所有连接
allRooms.forEach(room => {
  if (room.exits) {
    room.exits.forEach(exit => {
      allConnections.add(`${room.id} -> ${exit.targetRoomId} (${exit.direction})`);
    });
  }
});

// 检查对称性
allConnections.forEach(connection => {
  const [from, to] = connection.split(' -> ');
  const match = connection.match(/\(([^)]+)\)/);
  const direction = match ? match[1] : '';

  const toRoom = allRooms.get(to);
  if (toRoom && toRoom.exits) {
    const hasReturn = toRoom.exits.some(exit => exit.targetRoomId === from);

    if (!hasReturn) {
      asymmetricConnections.push({
        from,
        to,
        direction,
        fromName: allRooms.get(from)?.name || 'Unknown',
        toName: allRooms.get(to)?.name || 'Unknown'
      });
    }
  }
});

if (asymmetricConnections.length === 0) {
  console.log(`✅ 所有连接都是对称的!`);
} else {
  console.log(`⚠️  发现 ${asymmetricConnections.length} 个不对称连接:`);
  asymmetricConnections.forEach((conn, index) => {
    console.log(`   ${index + 1}. ${conn.fromName} (${conn.direction}) → ${conn.toName}`);
  });
}

// === 检查连通性 ===
console.log(`\n🌐 检查连通性:`);

// 使用BFS检查所有房间是否连通
function checkConnectivity() {
  const startRoom = allRooms.get('tj_palace_square'); // 从宫前广场开始
  if (!startRoom) {
    console.log(`❌ 找不到起始房间`);
    return { connected: 0, total: 0, isolated: [] };
  }

  const visited = new Set();
  const queue = [startRoom.id];
  visited.add(startRoom.id);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentRoom = allRooms.get(currentId);

    if (currentRoom && currentRoom.exits) {
      currentRoom.exits.forEach(exit => {
        if (!visited.has(exit.targetRoomId)) {
          visited.add(exit.targetRoomId);
          queue.push(exit.targetRoomId);
        }
      });
    }
  }

  const connected = visited.size;
  const total = allRooms.size;
  const isolated = Array.from(allRooms.keys()).filter(id => !visited.has(id));

  return { connected, total, isolated };
}

const connectivityResult = checkConnectivity();
console.log(`   • 已连通房间: ${connectivityResult.connected}/${connectivityResult.total}`);
console.log(`   • 连通率: ${((connectivityResult.connected / connectivityResult.total) * 100).toFixed(1)}%`);

if (connectivityResult.isolated.length === 0) {
  console.log(`   ✅ 所有房间都是连通的!`);
} else {
  console.log(`   ⚠️  发现 ${connectivityResult.isolated.length} 个孤立房间:`);
  connectivityResult.isolated.forEach((roomId, index) => {
    const room = allRooms.get(roomId);
    console.log(`      ${index + 1}. ${room?.name || roomId}`);
  });
}

// === 更新文件 ===
console.log(`\n💾 更新地图文件...`);

const fixedPart1 = {
  city: part1.city,
  districts: part1.districts
};

const fixedPart2 = {
  city: part2.city,
  districts: part2.districts
};

const fixedPart3 = {
  city: part3.city,
  districts: part3.districts
};

// 写入修复后的文件
fs.writeFileSync(
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json'),
  JSON.stringify(fixedPart1, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json'),
  JSON.stringify(fixedPart2, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json'),
  JSON.stringify(fixedPart3, null, 2),
  'utf8'
);

// 创建合并版本
const fixedComplete = {
  city: part1.city,
  districts: allDistricts
};

fs.writeFileSync(
  path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_fixed_complete.json'),
  JSON.stringify(fixedComplete, null, 2),
  'utf8'
);

console.log(`✅ 文件更新完成!`);
console.log(`📁 生成的文件:`);
console.log(`   • tianjing_cheng_part1.json - 修复版`);
console.log(`   • tianjing_cheng_part2.json - 修复版`);
console.log(`   • tianjing_cheng_part3.json - 修复版`);
console.log(`   • tianjing_cheng_fixed_complete.json - 完整合并版`);

console.log(`\n🎉 连接修复完成!`);
console.log(`📊 最终统计:`);
console.log(`   • 总房间数: ${connectivityResult.total}`);
console.log(`   • 连通房间数: ${connectivityResult.connected}`);
console.log(`   • 连通率: ${((connectivityResult.connected / connectivityResult.total) * 100).toFixed(1)}%`);
console.log(`   • 不对称连接: ${asymmetricConnections.length}`);

if (connectivityResult.connected === connectivityResult.total && asymmetricConnections.length === 0) {
  console.log(`\n🏆 完美! 天京城地图现在拥有100%的连通性!`);
} else {
  console.log(`\n⚠️  还有一些问题需要进一步检查。`);
}