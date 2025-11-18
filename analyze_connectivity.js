/**
 * 房间连通性分析脚本
 * 检查所有房间是否连通,找出孤立的房间
 */

const fs = require('fs');
const path = require('path');

// 读取三个part文件
const part1 = JSON.parse(fs.readFileSync(
  'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json',
  'utf8'
));
const part2 = JSON.parse(fs.readFileSync(
  'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part2.json',
  'utf8'
));
const part3 = JSON.parse(fs.readFileSync(
  'D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part3.json',
  'utf8'
));

// 合并所有房间
const allRooms = new Map();
const roomGraph = new Map(); // 房间连接图

function collectRooms(data, partNum) {
  for (const district of data.districts) {
    for (const location of district.locations) {
      for (const room of location.rooms) {
        allRooms.set(room.id, {
          ...room,
          districtName: district.name,
          locationName: location.name,
          partNum
        });
      }
    }
  }
}

collectRooms(part1, 1);
collectRooms(part2, 2);
collectRooms(part3, 3);

console.log(`总房间数: ${allRooms.size}`);
console.log('');

// 构建连接图
for (const [roomId, room] of allRooms) {
  const neighbors = new Set();
  if (room.exits) {
    for (const exit of room.exits) {
      neighbors.add(exit.targetRoomId);
    }
  }
  roomGraph.set(roomId, neighbors);
}

// BFS检查连通性
function findConnectedComponents() {
  const visited = new Set();
  const components = [];

  for (const [roomId] of allRooms) {
    if (!visited.has(roomId)) {
      const component = [];
      const queue = [roomId];

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;

        visited.add(current);
        component.push(current);

        const neighbors = roomGraph.get(current) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && allRooms.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }

      components.push(component);
    }
  }

  return components;
}

// 查找所有引用了不存在房间的出口
function findBrokenExits() {
  const broken = [];

  for (const [roomId, room] of allRooms) {
    if (room.exits) {
      for (const exit of room.exits) {
        if (!allRooms.has(exit.targetRoomId)) {
          broken.push({
            fromRoom: roomId,
            fromName: room.name,
            toRoom: exit.targetRoomId,
            direction: exit.direction,
            districtName: room.districtName,
            locationName: room.locationName,
            partNum: room.partNum
          });
        }
      }
    }
  }

  return broken;
}

// 检查双向连接
function findUnidirectionalConnections() {
  const unidirectional = [];

  for (const [roomId, room] of allRooms) {
    if (room.exits) {
      for (const exit of room.exits) {
        const targetRoom = allRooms.get(exit.targetRoomId);
        if (!targetRoom) continue;

        // 检查目标房间是否有返回的路径
        const hasReturnPath = targetRoom.exits?.some(e => e.targetRoomId === roomId);

        if (!hasReturnPath) {
          unidirectional.push({
            fromRoom: roomId,
            fromName: room.name,
            toRoom: exit.targetRoomId,
            toName: targetRoom.name,
            direction: exit.direction,
            partNum: room.partNum
          });
        }
      }
    }
  }

  return unidirectional;
}

// 执行分析
console.log('=== 1. 连通性分析 ===');
const components = findConnectedComponents();
console.log(`连通分量数量: ${components.length}`);

if (components.length > 1) {
  console.log('\n❌ 发现多个孤立的连通分量!');
  components.forEach((component, index) => {
    console.log(`\n连通分量 ${index + 1}: ${component.length} 个房间`);
    if (component.length <= 10) {
      component.forEach(roomId => {
        const room = allRooms.get(roomId);
        console.log(`  - ${room.name} (${roomId}) [${room.districtName}]`);
      });
    } else {
      console.log(`  (房间太多,仅显示前10个)`);
      component.slice(0, 10).forEach(roomId => {
        const room = allRooms.get(roomId);
        console.log(`  - ${room.name} (${roomId}) [${room.districtName}]`);
      });
      console.log(`  ... 还有 ${component.length - 10} 个房间`);
    }
  });
} else {
  console.log('✅ 所有房间都在同一个连通分量中!');
}

console.log('\n=== 2. 断裂的出口 (指向不存在的房间) ===');
const brokenExits = findBrokenExits();
if (brokenExits.length > 0) {
  console.log(`❌ 发现 ${brokenExits.length} 个断裂的出口:\n`);
  brokenExits.forEach(broken => {
    console.log(`[Part${broken.partNum}] ${broken.fromName} (${broken.fromRoom})`);
    console.log(`  → ${broken.direction}: ${broken.toRoom} (不存在!)`);
    console.log(`  位置: ${broken.districtName} > ${broken.locationName}\n`);
  });
} else {
  console.log('✅ 没有断裂的出口');
}

console.log('\n=== 3. 单向连接 (没有返回路径) ===');
const unidirectional = findUnidirectionalConnections();
if (unidirectional.length > 0) {
  console.log(`⚠️  发现 ${unidirectional.length} 个单向连接:\n`);
  unidirectional.forEach(uni => {
    console.log(`[Part${uni.partNum}] ${uni.fromName} → ${uni.direction} → ${uni.toName}`);
    console.log(`  ${uni.fromRoom} → ${uni.toRoom} (缺少返回路径)\n`);
  });
} else {
  console.log('✅ 所有连接都是双向的');
}

// 统计信息
console.log('\n=== 4. 统计信息 ===');
const roomsWithNoExits = [];
const roomsWithOneExit = [];
for (const [roomId, room] of allRooms) {
  const exitCount = room.exits?.length || 0;
  if (exitCount === 0) {
    roomsWithNoExits.push({ id: roomId, name: room.name });
  } else if (exitCount === 1) {
    roomsWithOneExit.push({ id: roomId, name: room.name });
  }
}

console.log(`没有出口的房间: ${roomsWithNoExits.length}`);
if (roomsWithNoExits.length > 0) {
  roomsWithNoExits.forEach(r => {
    console.log(`  - ${r.name} (${r.id})`);
  });
}

console.log(`\n只有一个出口的房间: ${roomsWithOneExit.length}`);
if (roomsWithOneExit.length > 0 && roomsWithOneExit.length <= 20) {
  roomsWithOneExit.forEach(r => {
    console.log(`  - ${r.name} (${r.id})`);
  });
}

// 生成修复建议
console.log('\n=== 5. 修复建议 ===');
if (brokenExits.length > 0) {
  console.log('需要修复的断裂出口:');
  brokenExits.forEach(broken => {
    console.log(`\n在 ${broken.fromRoom} 中删除或修正指向 ${broken.toRoom} 的 ${broken.direction} 出口`);
  });
}

if (components.length > 1) {
  console.log('\n需要连接孤立的连通分量:');
  console.log('找到各个连通分量的边界房间,添加连接');
}

// 输出JSON报告
const report = {
  totalRooms: allRooms.size,
  connectedComponents: components.length,
  isFullyConnected: components.length === 1,
  brokenExits: brokenExits.length,
  unidirectionalConnections: unidirectional.length,
  roomsWithNoExits: roomsWithNoExits.length,
  components: components.map((comp, idx) => ({
    id: idx + 1,
    size: comp.length,
    rooms: comp.slice(0, 5) // 只保存前5个房间ID
  })),
  brokenExitsList: brokenExits,
  unidirectionalList: unidirectional
};

fs.writeFileSync(
  'D:/mud/ceshi3/connectivity_report.json',
  JSON.stringify(report, null, 2),
  'utf8'
);

console.log('\n报告已保存到: connectivity_report.json');
