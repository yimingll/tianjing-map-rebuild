const { Client } = require('pg');

// 尝试不同的常见配置
const configs = [
  {
    name: '默认配置（用户: postgres, 密码: postgres）',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
  {
    name: '默认配置（无密码）',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres'
  },
  {
    name: '默认配置（密码: admin）',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'postgres'
  },
  {
    name: '默认配置（密码: 123456）',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'postgres'
  }
];

async function testConnection(config) {
  const client = new Client(config);

  try {
    await client.connect();
    console.log(`✅ 成功: ${config.name}`);
    console.log(`   主机: ${config.host}:${config.port}`);
    console.log(`   用户: ${config.user}`);
    console.log(`   密码: ${config.password ? '******' : '(空)'}`);

    // 查询版本
    const res = await client.query('SELECT version()');
    console.log(`   版本: ${res.rows[0].version.split(',')[0]}`);

    await client.end();
    return config;
  } catch (error) {
    console.log(`❌ 失败: ${config.name} - ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('PostgreSQL 连接测试');
  console.log('========================================\n');

  for (const config of configs) {
    const result = await testConnection(config);
    if (result) {
      console.log('\n✅ 找到有效配置！');
      console.log('\n请更新 .env 文件中的以下内容：');
      console.log(`DB_HOST=${result.host}`);
      console.log(`DB_PORT=${result.port}`);
      console.log(`DB_USERNAME=${result.user}`);
      console.log(`DB_PASSWORD=${result.password}`);
      console.log(`DB_DATABASE=mudgame`);
      break;
    }
    console.log('');
  }

  console.log('\n========================================');
}

main();
