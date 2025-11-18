const { Client } = require('pg');

async function createNewDatabase() {
  // 连接到 PostgreSQL 默认数据库
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'xiuxian',
    password: 'xiuxian123',
    database: 'postgres', // 连接到默认数据库
  });

  try {
    await client.connect();
    console.log('✅ 已连接到 PostgreSQL');

    // 检查数据库是否存在
    const checkDb = await client.query(`
      SELECT datname FROM pg_database WHERE datname = 'xiuxian_mud_new'
    `);

    if (checkDb.rows.length > 0) {
      console.log('⚠️  数据库 xiuxian_mud_new 已存在，正在删除...');

      // 断开所有连接
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'xiuxian_mud_new'
        AND pid <> pg_backend_pid()
      `);

      // 删除数据库
      await client.query('DROP DATABASE xiuxian_mud_new');
      console.log('✅ 旧数据库已删除');
    }

    // 创建新数据库
    await client.query('CREATE DATABASE xiuxian_mud_new');
    console.log('✅ 新数据库 xiuxian_mud_new 创建成功！');

    console.log('\n========================================');
    console.log('📋 下一步操作:');
    console.log('========================================');
    console.log('1. 更新 .env 文件中的数据库名称:');
    console.log('   DB_DATABASE=xiuxian_mud_new');
    console.log('');
    console.log('2. 重启服务器，TypeORM 会自动创建表结构');
    console.log('   npm run start:dev');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

createNewDatabase();
