const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'xiuxian',
    password: 'xiuxian123',
    database: 'xiuxian_mud',
  });

  try {
    await client.connect();

    // 检查所有表
    const tables = await client.query(`
      SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    console.log('========================================');
    console.log('✅ 数据库: xiuxian_mud');
    console.log('========================================');
    console.log('当前表结构:');

    if (tables.rows.length === 0) {
      console.log('  ℹ️  暂无表');
    } else {
      tables.rows.forEach(row => {
        console.log(`  ✅ ${row.tablename} (大小: ${row.size})`);
      });

      // 检查玩家数量
      const result = await client.query('SELECT COUNT(*) FROM players');
      console.log('');
      console.log('当前玩家数量:', result.rows[0].count);
    }
    console.log('========================================');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
