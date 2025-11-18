const fs = require('fs');
const part1 = JSON.parse(fs.readFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json', 'utf8'));

function findRoom(data, roomId) {
  for (const d of data.districts) {
    for (const l of d.locations) {
      for (const r of l.rooms) {
        if (r.id === roomId) return r;
      }
    }
  }
}

// 御花园已经有north指向内廷,不需要修改

// 太和殿已经有north指向内廷,检查是否存在
const mainHall = findRoom(part1, 'tj_palace_main_hall');
const hasNorth = mainHall.exits.some(e => e.direction === 'north' && e.targetRoomId === 'tj_palace_inner_court');

if (!hasNorth) {
  mainHall.exits.push({
    direction: 'north',
    targetRoomId: 'tj_palace_inner_court',
    description: '北面是内廷'
  });
  console.log('✅ 添加: 太和殿 → 内廷');
}

const innerCourt = findRoom(part1, 'tj_palace_inner_court');
const hasSouth = innerCourt.exits.some(e => e.direction === 'south' && e.targetRoomId === 'tj_palace_main_hall');

if (!hasSouth) {
  console.log('✅ 内廷已有south指向太和殿');
}

fs.writeFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_part1.json', JSON.stringify(part1, null, 2), 'utf8');
console.log('✅ 保存完成');
