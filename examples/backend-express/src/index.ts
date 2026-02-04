import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger, errorHandler } from './middleware/logger.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet()); // 安全头
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API 路由
app.use('/api/users', usersRouter);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'ZHJ SDK Example Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      users: 'GET /api/users',
      user: 'GET /api/users/:id',
      create: 'POST /api/users',
      update: 'PUT /api/users/:id',
      delete: 'DELETE /api/users/:id',
      testError: 'GET /api/users/test/error?type=timeout|500|404|network',
    },
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    data: null,
    status: 404,
    statusText: 'Not Found',
    success: false,
    timestamp: new Date().toISOString(),
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 ZHJ SDK Example Backend Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`\n📝 Available endpoints:`);
  console.log(`   GET    /api/users              - Get all users`);
  console.log(`   GET    /api/users/:id          - Get user by ID`);
  console.log(`   POST   /api/users              - Create new user`);
  console.log(`   PUT    /api/users/:id          - Update user`);
  console.log(`   DELETE /api/users/:id          - Delete user`);
  console.log(`   GET    /api/users/test/error   - Test error scenarios`);
  console.log(`\n💡 Tips:`);
  console.log(`   - Use the test error endpoint to test retry mechanisms`);
  console.log(`   - Random failures are built-in for testing purposes`);
  console.log(`   - Check the console for detailed request logs`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
