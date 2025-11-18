// 检查地图连通性的脚本
const fs = require('fs');
const path = require('path');

// 读取三个part文件
const part1 = require('./packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json');
const part2 = require('./packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json');
const part3 = require('./packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json');

// 收集所有房间
const allRooms = new Map();

// 从district中提取所有房间
function extractRooms(districts) {
  const rooms = [];
  for (const district of districts) {
    for (const location of district.locations) {
      rooms.push(...location.rooms);
    }
  }
  return rooms;
}

const rooms1 = extractRooms(part1.districts);
const rooms2 = extractRooms(part2.districts);
const rooms3 = extractRooms(part3.districts);

const allRoomsList = [...rooms1, ...rooms2, ...rooms3];

// 构建房间映射
for (const room of allRoomsList) {
  allRooms.set(room.id, room);
}

console.log(`总共有 ${allRooms.size} 个房间`);

// 检查出口的双向性和连通性
const issues = [];

for (const [roomId, room] of allRooms.entries()) {
  for (const exit of room.exits) {
    const targetRoomId = exit.targetRoomId;
    const targetRoom = allRooms.get(targetRoomId);

    if (!targetRoom) {
      issues.push(`房间 ${roomId} (${room.name}) 的 ${exit.direction} 出口指向不存在的房间 ${targetRoomId}`);
      continue;
    }

    // 检查是否有反向出口
    const oppositeDirections = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east',
      'northeast': 'southwest',
      'southwest': 'northeast',
      'northwest': 'southeast',
      'southeast': 'northwest',
      'up': 'down',
      'down': 'up'
    };

    const expectedOpposite = oppositeDirections[exit.direction];
    if (expectedOpposite) {
      const hasReverse = targetRoom.exits.some(e =>
        e.direction === expectedOpposite && e.targetRoomId === roomId
      );

      if (!hasReverse) {
        issues.push(`单向连接: ${roomId} (${room.name}) --${exit.direction}--> ${targetRoomId} (${targetRoom.name}), 但没有反向 ${expectedOpposite} 出口`);
      }
    }
  }
}

console.log(`\n发现 ${issues.length} 个连通性问题:\n`);
issues.slice(0, 50).forEach(issue => console.log(issue));

if (issues.length > 50) {
  console.log(`\n... 还有 ${issues.length - 50} 个问题`);
}
