const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/yunzhou_fu/yunzhou_cheng.json', 'utf8'));

function findRoom(data, roomId) {
  for (const d of data.districts) {
    for (const l of d.locations) {
      for (const r of l.rooms) {
        if (r.id === roomId) return r;
      }
    }
  }
}

console.log('=== 修复最后的单向连接 ===');

// 1. 兵器铺 -> 主街中段
const weaponShop = findRoom(data, 'yz_weapon_shop');
if (!weaponShop.exits.some(e => e.targetRoomId === 'yz_main_street_center')) {
  weaponShop.exits.push({
    direction: 'north',
    targetRoomId: 'yz_main_street_center',
    description: '北面是主街'
  });
  console.log('✅ 添加: 兵器铺 -> 主街中段');
}

// 2. 商会 -> 仓库 (添加返回连接)
const merchantGuild = findRoom(data, 'yz_merchant_guild');
// 商会需要有一个指向仓库的出口
if (!merchantGuild.exits.some(e => e.targetRoomId === 'yz_warehouse')) {
  merchantGuild.exits.push({
    direction: 'east',
    targetRoomId: 'yz_warehouse',
    description: '东面是仓库'
  });
  console.log('✅ 添加: 商会 -> 仓库');
}

// 保存
fs.writeFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/yunzhou_fu/yunzhou_cheng.json', JSON.stringify(data, null, 2));
console.log('\n✅ 最终修复完成!');
