const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json', 'utf8'));

function findRoom(data, roomId) {
  for (const d of data.districts) {
    for (const l of d.locations) {
      for (const r of l.rooms) {
        if (r.id === roomId) return r;
      }
    }
  }
}

const garden = findRoom(data, 'tj_palace_garden');
const mainHall = findRoom(data, 'tj_palace_main_hall');

// 太和殿: 删除指向御花园的south
const filtered = [];
for (const exit of mainHall.exits) {
  if (exit.direction === 'south' && exit.targetRoomId === 'tj_palace_garden') {
    continue; // 跳过这个出口
  }
  filtered.push(exit);
}
mainHall.exits = filtered;

// 御花园: 添加north指向内廷
garden.exits.push({
  direction: 'north',
  targetRoomId: 'tj_palace_inner_court',
  description: '北面是内廷'
});

console.log('修复后太和殿出口:');
mainHall.exits.forEach(e => console.log('  ', e.direction, '->', e.targetRoomId));

console.log('\n修复后御花园出口:');
garden.exits.forEach(e => console.log('  ', e.direction, '->', e.targetRoomId));

fs.writeFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json', JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ 已保存');
