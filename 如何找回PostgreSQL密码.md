# 如何找回 PostgreSQL 密码

## 当前情况

PostgreSQL 正在运行，但密码验证失败。需要找到或重置密码。

## 最快的解决方法

### 方法 1: 使用 pgAdmin（推荐）

1. **打开 pgAdmin**（开始菜单搜索 "pgAdmin"）

2. **查看已保存的连接**
   - 左侧会显示 "PostgreSQL" 服务器
   - 如果能直接连接（不要求密码），说明密码已保存

3. **查看密码**
   - 右键服务器 → Properties → Connection
   - 查看保存的密码

### 方法 2: 临时允许无密码登录

**步骤：**

1. **找到 pg_hba.conf 文件**
   ```
   C:\Program Files\PostgreSQL\{版本号}\data\pg_hba.conf
   ```
   或者搜索 `pg_hba.conf`

2. **用记事本（管理员身份）打开**

3. **找到这几行：**
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   # IPv6 local connections:
   host    all             all             ::1/128                 scram-sha-256
   ```

4. **临时改成：**
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   # IPv6 local connections:
   host    all             all             ::1/128                 trust
   ```

5. **重启 PostgreSQL**
   - 按 `Win + R`
   - 输入 `services.msc`
   - 找到 `postgresql-x64-{版本号}`
   - 右键 → 重新启动

6. **现在可以无密码连接了**
   ```bash
   cd D:\mud\ceshi3\packages\server
   node test-db.js
   ```

7. **设置新密码**（可选）
   - 打开 pgAdmin 或命令行
   - 执行：
     ```sql
     ALTER USER postgres WITH PASSWORD 'mudgame123';
     ```

8. **改回安全设置**
   - 将 `trust` 改回 `scram-sha-256`
   - 重启 PostgreSQL

### 方法 3: 检查数据库是否已存在

也许数据库 `xiuxian_mud` 已经存在并且有不同的用户？

**检查命令：**
```bash
# 用 psql 查看（如果能连接的话）
psql -U postgres -l
```

## 推荐：简化配置

如果你只是想快速开始开发，建议：

1. **创建新的专用用户**（无密码或简单密码）
2. **创建专用数据库**
3. **授予权限**

**SQL 命令：**
```sql
-- 创建用户（如果无法连接 postgres 用户）
CREATE USER mudgame WITH PASSWORD 'mudgame123';

-- 创建数据库
CREATE DATABASE xiuxian_mud OWNER mudgame;

-- 授予所有权限
GRANT ALL PRIVILEGES ON DATABASE xiuxian_mud TO mudgame;
```

然后更新 `.env`:
```
DB_USERNAME=mudgame
DB_PASSWORD=mudgame123
DB_DATABASE=xiuxian_mud
```

## 还是不行？

如果以上方法都不行，请告诉我：

1. 你能打开 pgAdmin 吗？
2. pgAdmin 能连接到数据库吗？
3. PostgreSQL 是什么时候安装的？

我会提供更详细的帮助！
