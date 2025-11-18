// 自动修复双向连接问题的脚本
const fs = require('fs');
const path = require('path');

// 读取三个part文件
const part1Path = './packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json';
const part2Path = './packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json';
const part3Path = './packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json';

const part1 = require(part1Path);
const part2 = require(part2Path);
const part3 = require(part3Path);

// 方向的反向映射
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

// 收集所有房间
const allRooms = new Map();
const roomToPart = new Map(); // 记录每个房间属于哪个part

function extractRooms(districts, partNum) {
  const rooms = [];
  for (const district of districts) {
    for (const location of district.locations) {
      for (const room of location.rooms) {
        rooms.push(room);
        roomToPart.set(room.id, partNum);
      }
    }
  }
  return rooms;
}

const rooms1 = extractRooms(part1.districts, 1);
const rooms2 = extractRooms(part2.districts, 2);
const rooms3 = extractRooms(part3.districts, 3);

const allRoomsList = [...rooms1, ...rooms2, ...rooms3];

// 构建房间映射
for (const room of allRoomsList) {
  allRooms.set(room.id, room);
}

console.log(`总共有 ${allRooms.size} 个房间`);

let fixedCount = 0;

// 修复双向连接
for (const [roomId, room] of allRooms.entries()) {
  for (const exit of room.exits) {
    const targetRoomId = exit.targetRoomId;
    const targetRoom = allRooms.get(targetRoomId);

    if (!targetRoom) continue;

    const expectedOpposite = oppositeDirections[exit.direction];
    if (!expectedOpposite) continue;

    // 检查是否有反向出口
    const reverseExit = targetRoom.exits.find(e => e.targetRoomId === roomId);

    if (reverseExit && reverseExit.direction !== expectedOpposite) {
      console.log(`修复: ${targetRoomId} (${targetRoom.name}) 的出口方向从 ${reverseExit.direction} 改为 ${expectedOpposite} (回到 ${roomId})`);
      reverseExit.direction = expectedOpposite;
      fixedCount++;
    }
  }
}

console.log(`\n共修复了 ${fixedCount} 个双向连接问题`);

// 写回文件
fs.writeFileSync(part1Path, JSON.stringify(part1, null, 2), 'utf-8');
fs.writeFileSync(part2Path, JSON.stringify(part2, null, 2), 'utf-8');
fs.writeFileSync(part3Path, JSON.stringify(part3, null, 2), 'utf-8');

console.log('\n文件已更新');
