const { Client } = require('pg');

async function resetDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'xiuxian',
    password: 'xiuxian123',
    database: 'xiuxian_mud',
  });

  try {
    await client.connect();
    console.log('✅ 已连接到数据库 xiuxian_mud');

    // 获取所有表
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    if (tables.rows.length === 0) {
      console.log('ℹ️  数据库已经是空的');
      return;
    }

    console.log(`📋 发现 ${tables.rows.length} 个表，正在删除...`);

    // 删除所有表
    for (const row of tables.rows) {
      await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
      console.log(`  ✓ 已删除表: ${row.tablename}`);
    }

    console.log('\n✅ 所有表已清空！');
    console.log('\n========================================');
    console.log('📋 下一步操作:');
    console.log('========================================');
    console.log('1. 重启服务器，TypeORM会自动创建新的表结构');
    console.log('   按 Ctrl+C 停止当前服务器');
    console.log('   然后运行: npm run start:dev');
    console.log('');
    console.log('2. 或者设置 TypeORM synchronize: true 自动同步');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

resetDatabase();
