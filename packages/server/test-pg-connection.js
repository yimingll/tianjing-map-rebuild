const { Client } = require('pg');

async function testConnection() {
  console.log('========================================');
  console.log('PostgreSQL 连接测试');
  console.log('========================================\n');

  const config = {
    host: 'localhost',
    port: 5432,
    user: 'xiuxian',
    password: 'xiuxian123',
    database: 'xiuxian_mud'
  };

  const client = new Client(config);

  try {
    console.log('正在尝试连接...');
    console.log(`用户: ${config.user}`);
    console.log(`数据库: ${config.database}`);
    console.log();

    await client.connect();

    console.log('✅ 成功连接到 PostgreSQL!');
    console.log();

    // 测试查询
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL 版本:');
    console.log(result.rows[0].version);
    console.log();

    // 检查数据库
    const dbCheck = await client.query(`
      SELECT datname FROM pg_database WHERE datname = 'xiuxian_mud'
    `);

    if (dbCheck.rows.length > 0) {
      console.log('✅ 数据库 xiuxian_mud 已存在');
    } else {
      console.log('❌ 数据库 xiuxian_mud 不存在');
    }

  } catch (error) {
    console.log('❌ 连接失败:');
    console.log(error.message);
  } finally {
    await client.end();
  }

  console.log('\n========================================');
}

testConnection();
