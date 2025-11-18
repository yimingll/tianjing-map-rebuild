const fs = require('fs');

// 读取云州城地图
const data = JSON.parse(fs.readFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/yunzhou_fu/yunzhou_cheng.json', 'utf8'));

// 收集所有房间
const allRooms = new Map();
const roomGraph = new Map();

data.districts.forEach(district => {
  district.locations.forEach(location => {
    location.rooms.forEach(room => {
      allRooms.set(room.id, room);

      // 构建邻接表
      if (room.exits) {
        const neighbors = new Set();
        room.exits.forEach(exit => {
          neighbors.add(exit.targetRoomId);
        });
        roomGraph.set(room.id, neighbors);
      }
    });
  });
});

console.log(`总房间数: ${allRooms.size}`);

// BFS查找连通分量
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

// 检查断裂的出口
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
            direction: exit.direction
          });
        }
      }
    }
  }
  return broken;
}

// 检查单向连接
function findUnidirectionalConnections() {
  const unidirectional = [];
  for (const [roomId, room] of allRooms) {
    if (room.exits) {
      for (const exit of room.exits) {
        const targetRoom = allRooms.get(exit.targetRoomId);
        if (targetRoom) {
          // 检查目标房间是否有返回的出口
          const hasReturn = targetRoom.exits?.some(e => e.targetRoomId === roomId);
          if (!hasReturn) {
            unidirectional.push({
              from: roomId,
              fromName: room.name,
              to: exit.targetRoomId,
              toName: targetRoom.name,
              direction: exit.direction
            });
          }
        }
      }
    }
  }
  return unidirectional;
}

console.log('\n=== 1. 连通性分析 ===');
const components = findConnectedComponents();
console.log(`连通分量数量: ${components.length}`);
if (components.length === 1) {
  console.log('✅ 所有房间都在同一个连通分量中!');
} else {
  console.log('❌ 发现多个孤立的连通分量!');
  components.forEach((comp, idx) => {
    console.log(`\n分量 ${idx + 1} (${comp.length} 个房间):`);
    console.log(comp.slice(0, 5).join(', ') + (comp.length > 5 ? '...' : ''));
  });
}

console.log('\n=== 2. 断裂的出口 (指向不存在的房间) ===');
const brokenExits = findBrokenExits();
if (brokenExits.length === 0) {
  console.log('✅ 没有断裂的出口');
} else {
  console.log(`❌ 发现 ${brokenExits.length} 个断裂的出口:`);
  brokenExits.forEach(b => {
    console.log(`  ${b.fromName}(${b.fromRoom}) --${b.direction}--> ${b.toRoom} (不存在)`);
  });
}

console.log('\n=== 3. 单向连接 (没有返回路径) ===');
const unidirectional = findUnidirectionalConnections();
if (unidirectional.length === 0) {
  console.log('✅ 所有连接都是双向的');
} else {
  console.log(`⚠️ 发现 ${unidirectional.length} 个单向连接:`);
  unidirectional.forEach(u => {
    console.log(`  ${u.fromName}(${u.from}) --${u.direction}--> ${u.toName}(${u.to})`);
  });
}

console.log('\n=== 4. 统计信息 ===');
const roomsWithNoExits = Array.from(allRooms.values()).filter(r => !r.exits || r.exits.length === 0);
console.log(`没有出口的房间: ${roomsWithNoExits.length}`);
if (roomsWithNoExits.length > 0) {
  roomsWithNoExits.forEach(r => console.log(`  - ${r.name}(${r.id})`));
}

const roomsWithOneExit = Array.from(allRooms.values()).filter(r => r.exits && r.exits.length === 1);
console.log(`\n只有一个出口的房间: ${roomsWithOneExit.length}`);

// 生成报告
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
    rooms: comp.slice(0, 5)
  })),
  brokenExitsList: brokenExits,
  unidirectionalList: unidirectional
};

fs.writeFileSync('yunzhou_connectivity_report.json', JSON.stringify(report, null, 2));
console.log('\n报告已保存到: yunzhou_connectivity_report.json');
