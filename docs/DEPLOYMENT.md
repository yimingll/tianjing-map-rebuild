# 部署文档

## 开发环境部署

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop (用于数据库)

### 步骤

1. **安装依赖**
```bash
npm install
npm install --workspace=shared
npm install --workspace=server
npm install --workspace=client
```

2. **启动数据库**
```bash
npm run docker:up
```

3. **配置环境变量**
```bash
cd packages/server
cp .env.example .env
# 编辑 .env 文件
```

4. **启动开发服务器**
```bash
npm run dev
```

## 生产环境部署

### 方案 1: 传统服务器部署

#### 1. 服务器要求

- Ubuntu 20.04 或更高版本
- 2 CPU 核心
- 4GB RAM
- 20GB 磁盘空间
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Nginx

#### 2. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 安装 Redis
sudo apt install redis-server -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2
```

#### 3. 配置数据库

```bash
# 创建数据库用户
sudo -u postgres psql
postgres=# CREATE USER mudgame WITH PASSWORD 'your-secure-password';
postgres=# CREATE DATABASE mudgame OWNER mudgame;
postgres=# GRANT ALL PRIVILEGES ON DATABASE mudgame TO mudgame;
postgres=# \q
```

#### 4. 部署应用

```bash
# 克隆代码
git clone https://github.com/your-repo/mud-game.git
cd mud-game

# 安装依赖
npm install

# 配置环境变量
cd packages/server
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 构建项目
cd ../..
npm run build

# 使用 PM2 启动服务器
cd packages/server
pm2 start dist/main.js --name mud-server

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 5. 配置 Nginx

```nginx
# /etc/nginx/sites-available/mud-game
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/mud-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL 证书（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 方案 2: Docker 部署

#### 1. 创建 Dockerfile

**服务器 Dockerfile** (`packages/server/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制共享包
COPY packages/shared /app/packages/shared
WORKDIR /app/packages/shared
RUN npm install && npm run build

# 复制服务器代码
WORKDIR /app
COPY packages/server/package*.json /app/packages/server/
WORKDIR /app/packages/server
RUN npm install

COPY packages/server /app/packages/server
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/packages/server/dist /app/dist
COPY --from=builder /app/packages/server/node_modules /app/node_modules
COPY --from=builder /app/packages/server/package.json /app/

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### 2. 创建 docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: mudgame
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: mudgame
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  server:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: mudgame
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 3. 部署

```bash
# 设置环境变量
echo "DB_PASSWORD=your-secure-password" > .env

# 构建并启动
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 方案 3: Kubernetes 部署

#### 1. 创建配置文件

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mud-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mud-server
  template:
    metadata:
      labels:
        app: mud-server
    spec:
      containers:
      - name: server
        image: your-registry/mud-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: mud-config
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mud-secrets
              key: db-password
---
apiVersion: v1
kind: Service
metadata:
  name: mud-server
spec:
  selector:
    app: mud-server
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Steam 客户端打包

### Windows

```bash
cd packages/client
npm run build:electron
```

生成的安装包位于 `packages/client/dist-electron/`

### 上传到 Steam

1. **安装 Steamworks SDK**

2. **配置 app_build.vdf**
```vdf
"AppBuild"
{
    "AppID" "your-app-id"
    "Desc" "MUD Game Build"
    "BuildOutput" "D:\steam_builds"
    "ContentRoot" "D:\mud\ceshi3\packages\client\dist-electron"
    "SetLive" "default"

    "Depots"
    {
        "your-depot-id"
        {
            "FileMapping"
            {
                "LocalPath" "*"
                "DepotPath" "."
                "recursive" "1"
            }
        }
    }
}
```

3. **上传构建**
```bash
steamcmd +login your-username +run_app_build app_build.vdf +quit
```

## 性能优化

### 1. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_current_room ON players(current_room_id);
CREATE INDEX idx_players_status ON players(status);

-- 启用连接池
# 在 PostgreSQL 配置中
max_connections = 100
shared_buffers = 256MB
```

### 2. Redis 配置

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Node.js 调优

```bash
# 增加内存限制
NODE_OPTIONS="--max-old-space-size=4096"
```

### 4. 负载均衡

使用 Nginx 配置多个服务器实例：

```nginx
upstream mud_backend {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://mud_backend;
    }
}
```

## 监控和日志

### 1. 日志收集

```bash
# 使用 PM2 查看日志
pm2 logs mud-server

# 或使用 Docker
docker-compose logs -f server
```

### 2. 性能监控

```bash
# PM2 监控
pm2 monit

# 或安装监控工具
pm2 install pm2-server-monit
```

### 3. 告警配置

设置邮件告警：
```bash
pm2 set pm2-server-monit:alarmEmail your-email@example.com
```

## 备份策略

### 数据库备份

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/mudgame"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
pg_dump -U mudgame mudgame | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# 保留最近 7 天的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

添加到 crontab：
```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

## 回滚策略

### 使用 PM2

```bash
# 保存当前版本
pm2 save

# 回滚到上一个版本
git checkout previous-version
npm run build
pm2 reload mud-server
```

### 使用 Docker

```bash
# 回滚到上一个镜像
docker-compose down
docker-compose up -d --force-recreate server
```

## 常见问题

### Q: WebSocket 连接失败
A: 检查防火墙设置，确保端口 3000 已开放

### Q: 数据库连接超时
A: 增加 PostgreSQL 的 max_connections 或使用连接池

### Q: 内存溢出
A: 增加 Node.js 内存限制或优化代码

### Q: 高延迟
A: 检查服务器负载，考虑增加实例数量或使用 Redis 缓存
