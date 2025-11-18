-- 授予xiuxian用户创建数据库的权限
-- 请使用postgres超级用户运行此SQL

-- 方法1: 授予CREATEDB权限
ALTER USER xiuxian CREATEDB;

-- 查看用户权限
\du xiuxian
