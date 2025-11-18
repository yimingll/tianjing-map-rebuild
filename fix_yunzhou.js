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

// 1. 修复单向连接
console.log('=== 修复单向连接 ===');

// 府衙广场 -> 军营大门
const govSquare = findRoom(data, 'yz_government_square');
if (!govSquare.exits.some(e => e.targetRoomId === 'yz_barracks_gate')) {
  govSquare.exits.push({
    direction: 'north',
    targetRoomId: 'yz_barracks_gate',
    description: '北面是军营'
  });
  console.log('✅ 添加: 府衙广场 -> 军营大门');
}

// 主街中段 -> 书院大门 (添加north指向书院)
const mainStreetCenter = findRoom(data, 'yz_main_street_center');
// 移除原有的north指向天宝楼，改为书院在西北方向
mainStreetCenter.exits = mainStreetCenter.exits.filter(e => !(e.direction === 'north' && e.targetRoomId === 'yz_tianbao_tower'));
// 天宝楼现在从主街中段通过east进入
if (!mainStreetCenter.exits.some(e => e.targetRoomId === 'yz_academy_gate')) {
  mainStreetCenter.exits.push({
    direction: 'north',
    targetRoomId: 'yz_academy_gate',
    description: '北面是书院'
  });
  console.log('✅ 添加: 主街中段 -> 书院大门');
}

// 重新调整天宝楼位置，从主街东段进入
const tianbaoTower = findRoom(data, 'yz_tianbao_tower');
tianbaoTower.exits = tianbaoTower.exits.filter(e => e.direction !== 'south');
tianbaoTower.exits.push({
  direction: 'west',
  targetRoomId: 'yz_main_street_east',
  description: '西面是主街'
});

const mainStreetEast = findRoom(data, 'yz_main_street_east');
if (!mainStreetEast.exits.some(e => e.targetRoomId === 'yz_tianbao_tower')) {
  mainStreetEast.exits.push({
    direction: 'east',
    targetRoomId: 'yz_tianbao_tower',
    description: '东面是天宝楼'
  });
  console.log('✅ 调整: 主街东段 <-> 天宝楼');
}

// 集市中心 -> 北城居民区
const marketCenter = findRoom(data, 'yz_market_center');
if (!marketCenter.exits.some(e => e.targetRoomId === 'yz_residential_north')) {
  marketCenter.exits.push({
    direction: 'west',
    targetRoomId: 'yz_residential_north',
    description: '西面是居民区'
  });
  console.log('✅ 添加: 集市中心 -> 北城居民区');
}

// 修复北城居民区的south出口方向为east
const residentialNorth = findRoom(data, 'yz_residential_north');
residentialNorth.exits = residentialNorth.exits.filter(e => !(e.direction === 'south' && e.targetRoomId === 'yz_market_center'));
residentialNorth.exits.push({
  direction: 'east',
  targetRoomId: 'yz_market_center',
  description: '东面是集市'
});

// 2. 添加9个新房间达到50个
console.log('\n=== 添加新房间 ===');

// 在商业区添加更多商铺
const commercialDistrict = data.districts.find(d => d.id === 'commercial_district');
const shopsLocation = commercialDistrict.locations.find(l => l.id === 'shops');

const newShops = [
  {
    id: 'yz_tea_house',
    name: '茶馆',
    type: 'teahouse',
    description: '一家清净雅致的茶馆，常有文人雅士在此品茗论道。',
    exits: [
      {direction: 'east', targetRoomId: 'yz_main_street_west', description: '东面是主街'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_pawn_shop',
    name: '当铺',
    type: 'shop',
    description: '一家大型当铺，可以典当各种物品。',
    exits: [
      {direction: 'north', targetRoomId: 'yz_merchant_guild', description: '北面是商会'},
      {direction: 'south', targetRoomId: 'yz_silk_shop', description: '南面是绸缎庄'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_silk_shop',
    name: '绸缎庄',
    type: 'shop',
    description: '专门售卖丝绸布匹的店铺，各种精美绸缎琳琅满目。',
    exits: [
      {direction: 'north', targetRoomId: 'yz_pawn_shop', description: '北面是当铺'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_jewelry_shop',
    name: '珠宝行',
    type: 'shop',
    description: '出售各种珠宝首饰的店铺，玉器金银应有尽有。',
    exits: [
      {direction: 'south', targetRoomId: 'yz_weapon_shop', description: '南面是兵器铺'},
      {direction: 'west', targetRoomId: 'yz_antique_shop', description: '西面是古玩店'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_antique_shop',
    name: '古玩店',
    type: 'shop',
    description: '收购和出售古玩字画的店铺。',
    exits: [
      {direction: 'east', targetRoomId: 'yz_jewelry_shop', description: '东面是珠宝行'}
    ],
    safeZone: true,
    pvpAllowed: false
  }
];

shopsLocation.rooms.push(...newShops);

// 更新商会的exits，添加向当铺的连接
const merchantGuild = findRoom(data, 'yz_merchant_guild');
if (!merchantGuild.exits.some(e => e.targetRoomId === 'yz_pawn_shop')) {
  merchantGuild.exits.push({
    direction: 'south',
    targetRoomId: 'yz_pawn_shop',
    description: '南面是当铺'
  });
}

// 移除原有的warehouse连接，warehouse已经存在
merchantGuild.exits = merchantGuild.exits.filter(e => !(e.direction === 'south' && e.targetRoomId === 'yz_warehouse'));

// 主街西段添加茶馆连接
const mainStreetWest = findRoom(data, 'yz_main_street_west');
if (!mainStreetWest.exits.some(e => e.targetRoomId === 'yz_tea_house')) {
  mainStreetWest.exits.push({
    direction: 'west',
    targetRoomId: 'yz_tea_house',
    description: '西面是茶馆'
  });
}

// 兵器铺添加珠宝行连接
const weaponShop = findRoom(data, 'yz_weapon_shop');
if (!weaponShop.exits.some(e => e.targetRoomId === 'yz_jewelry_shop')) {
  weaponShop.exits.push({
    direction: 'north',
    targetRoomId: 'yz_jewelry_shop',
    description: '北面是珠宝行'
  });
}

// 移除原有的main_street_center连接
weaponShop.exits = weaponShop.exits.filter(e => !(e.direction === 'north' && e.targetRoomId === 'yz_main_street_center'));

// 在居民区添加更多房间
const residentialDistrict = data.districts.find(d => d.id === 'residential_district');
const residentialLocation = residentialDistrict.locations.find(l => l.id === 'residential_area');

const newResidential = [
  {
    id: 'yz_well',
    name: '公共水井',
    type: 'utility',
    description: '城内的公共水井，居民们在此打水。',
    exits: [
      {direction: 'south', targetRoomId: 'yz_residential_north', description: '南面是北城居民区'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_community_hall',
    name: '社区会堂',
    type: 'hall',
    description: '居民聚会的会堂，常有各种活动在此举办。',
    exits: [
      {direction: 'west', targetRoomId: 'yz_residential_east', description: '西面是东城居民区'},
      {direction: 'south', targetRoomId: 'yz_park', description: '南面是小公园'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_park',
    name: '城东小公园',
    type: 'park',
    description: '一个小型公园，有几棵古树和石凳，是居民休闲的好去处。',
    exits: [
      {direction: 'north', targetRoomId: 'yz_community_hall', description: '北面是会堂'}
    ],
    safeZone: true,
    pvpAllowed: false
  },
  {
    id: 'yz_noodle_shop',
    name: '面馆',
    type: 'restaurant',
    description: '一家小面馆，售卖各种面食，价格实惠。',
    exits: [
      {direction: 'north', targetRoomId: 'yz_residential_north', description: '北面是北城居民区'}
    ],
    safeZone: true,
    pvpAllowed: false
  }
];

residentialLocation.rooms.push(...newResidential);

// 更新居民区房间的连接
residentialNorth.exits.push({
  direction: 'north',
  targetRoomId: 'yz_well',
  description: '北面是水井'
});

residentialNorth.exits.push({
  direction: 'south',
  targetRoomId: 'yz_noodle_shop',
  description: '南面是面馆'
});

const residentialEast = findRoom(data, 'yz_residential_east');
residentialEast.exits.push({
  direction: 'east',
  targetRoomId: 'yz_community_hall',
  description: '东面是会堂'
});

// 更新metadata
data.metadata.roomCount = 50;

// 保存
fs.writeFileSync('D:/mud/ceshi3/packages/server/data/maps/dazhou/yunzhou_fu/yunzhou_cheng.json', JSON.stringify(data, null, 2));
console.log('\n✅ 修复完成，已保存!');
console.log(`总房间数: 50`);
