const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'xiuxian',
  password: 'xiuxian123',
  database: 'xiuxian_mud'
});

async function checkDatabase() {
  try {
    await client.connect();

    // 检查数据库信息
    const dbInfo = await client.query(`
      SELECT datname, pg_catalog.pg_get_userbyid(datdba) as owner,
             pg_catalog.pg_database_size(datname) as size
      FROM pg_database
      WHERE datname = 'xiuxian_mud'
    `);

    console.log('========================================');
    console.log('数据库信息');
    console.log('========================================');
    console.log('数据库名:', dbInfo.rows[0].datname);
    console.log('所有者:', dbInfo.rows[0].owner);
    console.log('大小:', (dbInfo.rows[0].size / 1024).toFixed(2), 'KB');
    console.log('');

    // 检查表
    const tables = await client.query(`
      SELECT tablename,
             pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    console.log('========================================');
    console.log('数据表列表');
    console.log('========================================');
    if (tables.rows.length === 0) {
      console.log('❌ 暂无数据表');
    } else {
      tables.rows.forEach(row => {
        console.log(`✅ ${row.tablename} (大小: ${row.size})`);
      });
    }
    console.log('');

    // 检查 players 表的记录数
    if (tables.rows.some(t => t.tablename === 'players')) {
      const count = await client.query('SELECT COUNT(*) FROM players');
      console.log('========================================');
      console.log('玩家数据统计');
      console.log('========================================');
      console.log('当前玩家数量:', count.rows[0].count);

      // 查看最近的玩家
      const recentPlayers = await client.query(`
        SELECT username, "displayName", level, "createdAt"
        FROM players
        ORDER BY "createdAt" DESC
        LIMIT 5
      `);

      if (recentPlayers.rows.length > 0) {
        console.log('\n最近创建的玩家:');
        recentPlayers.rows.forEach(player => {
          console.log(`  - ${player.displayName} (${player.username}) - Level ${player.level}`);
        });
      }
    }

    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
