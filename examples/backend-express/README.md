# ZHJ SDK Express Backend Example

这是一个使用 Express.js 的后端示例服务，专门为演示 ZHJ SDK 的各种功能而设计。

## 🚀 功能特性

### API 功能
- ✅ **RESTful API** - 完整的用户 CRUD 操作
- ✅ **统一响应格式** - 标准化的 API 响应结构
- ✅ **数据验证** - 请求数据格式和类型验证
- ✅ **错误处理** - 统一的错误响应和日志记录
- ✅ **CORS 支持** - 支持跨域请求
- ✅ **请求日志** - 详细的请求日志和性能监控

### 测试功能
- ✅ **随机失败** - 模拟网络问题，测试客户端重试机制
- ✅ **延迟模拟** - 模拟网络延迟，测试性能监控
- ✅ **错误端点** - 专门的错误测试端点
- ✅ **健康检查** - 服务状态监控

## 🛠️ 技术栈

- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **Helmet** - 安全中间件
- **CORS** - 跨域支持
- **TSX** - TypeScript 执行器

## 📦 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

服务将在 http://localhost:3001 启动

## 🏗️ 项目结构

```
src/
├── index.ts              # 应用入口
├── types.ts              # 类型定义
├── utils.ts              # 工具函数
├── data.ts               # 数据存储（内存）
├── middleware/
│   └── logger.ts         # 日志中间件
└── routes/
    └── users.ts          # 用户路由
```

## 📋 API 端点

### 用户管理

| 方法 | 端点 | 描述 | 示例 |
|------|------|------|------|
| GET | `/api/users` | 获取所有用户 | `curl http://localhost:3001/api/users` |
| GET | `/api/users/:id` | 获取特定用户 | `curl http://localhost:3001/api/users/1` |
| POST | `/api/users` | 创建新用户 | `curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{"name":"John","email":"john@example.com"}'` |
| PUT | `/api/users/:id` | 更新用户 | `curl -X PUT http://localhost:3001/api/users/1 -H "Content-Type: application/json" -d '{"name":"John Updated"}'` |
| DELETE | `/api/users/:id` | 删除用户 | `curl -X DELETE http://localhost:3001/api/users/1` |

### 系统端点

| 方法 | 端点 | 描述 | 示例 |
|------|------|------|------|
| GET | `/health` | 健康检查 | `curl http://localhost:3001/health` |
| GET | `/` | API 文档 | `curl http://localhost:3001/` |
| GET | `/api/users/test/error` | 错误测试 | `curl http://localhost:3001/api/users/test/error?type=500` |

## 🧪 测试端点

### 错误测试

```bash
# 500 错误
curl http://localhost:3001/api/users/test/error?type=500

# 404 错误
curl http://localhost:3001/api/users/test/error?type=404

# 超时错误（30秒）
curl http://localhost:3001/api/users/test/error?type=timeout

# 网络错误
curl http://localhost:3001/api/users/test/error?type=network
```

## 📊 响应格式

### 成功响应

```json
{
  "data": { ... },
  "status": 200,
  "statusText": "OK",
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "data": null,
  "status": 500,
  "statusText": "Internal Server Error",
  "success": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 配置选项

### 环境变量

```bash
# 服务端口（默认：3001）
PORT=3001

# 运行环境（默认：development）
NODE_ENV=development
```

### 随机失败配置

在 `src/routes/users.ts` 中可以调整随机失败率：

```typescript
// 创建用户时的失败率（默认：10%）
if (shouldFail(0.1)) {
  return res.status(500).json(createErrorResponse('Database write failed'));
}

// 获取用户时的失败率（默认：5%）
if (shouldFail(0.05)) {
  return res.status(500).json(createErrorResponse('Database connection failed'));
}
```

## 📝 日志格式

服务器会输出详细的请求日志：

```
[2024-01-01T00:00:00.000Z] GET /api/users - ::1
[2024-01-01T00:00:00.000Z] GET /api/users - 200 - 150ms
```

日志包含：
- 时间戳
- HTTP 方法和路径
- 客户端 IP
- 状态码（带颜色）
- 请求耗时

## 🚨 注意事项

### 数据存储
- 使用内存存储，重启后数据会丢失
- 初始包含 3 个示例用户
- 支持完整的 CRUD 操作

### 测试功能
- 随机失败仅用于测试客户端重试机制
- 延迟模拟用于测试性能监控
- 错误端点用于测试各种错误场景

### 安全考虑
- 示例应用不包含生产环境安全配置
- 建议在生产环境中添加认证和授权
- 使用 Helmet 提供基本的安全头

## 🔍 调试技巧

### 1. 查看详细日志

```bash
# 启动时显示所有日志
pnpm dev
```

### 2. 测试重试机制

多次调用创建用户接口，观察随机失败和重试：

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/users \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User $i\",\"email\":\"user$i@example.com\"}"
  echo
done
```

### 3. 监控性能

观察日志中的请求耗时，测试不同的网络条件：

```bash
# 测试并发请求
curl http://localhost:3001/api/users & curl http://localhost:3001/api/users & wait
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例服务！
