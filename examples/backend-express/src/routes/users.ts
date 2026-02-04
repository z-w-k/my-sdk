import { Router, Request, Response } from 'express';
import { createApiResponse, createErrorResponse, delay, shouldFail } from '../utils.js';
import { createUser, deleteUser, getAllUsers, getUserById } from '../data.js';
import { CreateUserRequest } from '../types.js';

const router = Router();

// GET /api/users - 获取所有用户
router.get('/', async (req: Request, res: Response) => {
  try {
    // 模拟网络延迟
    await delay(Math.random() * 500 + 100);
    
    // 模拟随机失败（5% 概率）
    if (shouldFail(0.05)) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const users = getAllUsers();
    // 直接返回数据，不封装 ApiResponse
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - 获取特定用户
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await delay(Math.random() * 300 + 50);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 直接返回用户数据
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - 创建新用户
router.post('/', async (req: Request, res: Response) => {
  try {
    await delay(Math.random() * 400 + 100);
    
    const { name, email } = req.body as CreateUserRequest;
    
    // 验证请求数据
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    if (typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: 'Invalid data types' });
    }
    
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // 模拟随机失败（10% 概率，用于测试重试机制）
    if (shouldFail(0.1)) {
      return res.status(500).json({ error: 'Database write failed' });
    }
    
    const newUser = createUser(name, email);
    // 直接返回新用户数据，使用 201 状态码
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - 更新用户
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await delay(Math.random() * 300 + 100);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { name, email } = req.body;
    
    // 这里简化实现，实际应该从 data.ts 导入 updateUser 函数
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await delay(Math.random() * 200 + 50);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // 模拟随机失败（5% 概率）
    if (shouldFail(0.05)) {
      return res.status(500).json({ error: 'Database delete failed' });
    }
    
    const deleted = deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 直接返回成功消息
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 测试端点 - 用于测试各种错误情况
router.get('/test/error', (req: Request, res: Response) => {
  const errorType = req.query.type as string;
  
  switch (errorType) {
    case 'timeout':
      // 模拟超时
      setTimeout(() => {
        res.json(createApiResponse({ message: 'This should timeout' }));
      }, 30000);
      break;
      
    case '500':
      res.status(500).json(createErrorResponse('Internal server error'));
      break;
      
    case '404':
      res.status(404).json(createErrorResponse('Not found'));
      break;
      
    case 'network':
      // 模拟网络错误
      res.socket?.destroy();
      break;
      
    default:
      res.status(400).json(createErrorResponse('Unknown error type'));
  }
});

export default router;
