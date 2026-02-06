---
name: test-generator
description: 为现有代码自动生成单元测试，支持多种测试框架和断言库
---

# 测试生成器

为现有代码自动生成单元测试，支持多种测试框架，包含测试用例、模拟数据和断言验证。

## 步骤

1. **分析目标代码**：
   - 识别函数、类、模块的结构
   - 分析输入参数和返回值
   - 检测依赖关系和副作用
   - 确定测试覆盖范围

2. **选择测试策略**：
   - 单元测试 - 独立测试单个函数/类
   - 集成测试 - 测试模块间交互
   - 边界测试 - 测试极限情况
   - 错误处理测试 - 测试异常情况

3. **生成测试代码**：
   - 创建测试文件结构
   - 编写测试用例
   - 设置模拟数据
   - 添加断言验证

4. **生成辅助文件**：
   - 测试配置文件
   - 模拟数据文件
   - 测试工具函数
   - 覆盖率报告配置

## 支持的测试框架

### Jest
- 完整的测试运行器
- 内置模拟和断言
- 覆盖率报告
- 快照测试

### Vitest
- 现代、快速的测试运行器
- 与 Vite 深度集成
- ES 模块原生支持
- 兼容 Jest API

### Mocha + Chai
- 灵活的测试框架组合
- 丰富的断言库
- 可插拔架构
- 广泛的生态支持

## 生成的文件结构

```
src/
├── __tests__/              # 测试文件目录
│   ├── utils.test.ts       # 工具函数测试
│   ├── client.test.ts      # 客户端测试
│   └── types.test.ts       # 类型测试
├── __mocks__/              # 模拟数据
│   ├── fixtures.ts         # 测试数据
│   └── handlers.ts         # 模拟处理器
└── test-utils/             # 测试工具
    ├── setup.ts            # 测试设置
    ├── helpers.ts          # 辅助函数
    └── constants.ts        # 测试常量
```

## 使用示例

### 基础函数测试
```
目标文件: packages/core/src/utils.ts
测试框架: Jest
覆盖类型: 单元测试 + 边界测试
```

### 类组件测试
```
目标文件: packages/client/src/http-client.ts
测试框架: Vitest
覆盖类型: 单元测试 + 集成测试
模拟依赖: HTTP 请求
```

### 异步函数测试
```
目标文件: packages/core/src/async-utils.ts
测试框架: Mocha + Chai
覆盖类型: 异步测试 + 错误处理
超时设置: 5000ms
```

## 生成的测试类型

### 函数测试
```typescript
describe('deepMerge', () => {
  it('应该正确合并两个对象', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    
    const result = deepMerge(target, source);
    
    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4
    });
  });

  it('应该处理空对象', () => {
    expect(deepMerge({}, {})).toEqual({});
  });

  it('应该处理 null 值', () => {
    const target = { a: 1 };
    const source = null;
    
    expect(deepMerge(target, source)).toEqual({ a: 1 });
  });
});
```

### 类测试
```typescript
describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    httpClient = new HttpClient({ baseUrl: 'https://api.test.com' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确发送 GET 请求', async () => {
    const mockResponse = { data: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await httpClient.get('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/test',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockResponse);
  });
});
```

### 异步函数测试
```typescript
describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('应该在指定时间后解析', async () => {
    const promise = sleep(1000);
    
    // 快进时间
    jest.advanceTimersByTime(1000);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('应该支持 0 延时', async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});
```

## 测试覆盖策略

### 语句覆盖
- 每行代码至少执行一次
- 条件分支的所有路径
- 异常处理代码块

### 分支覆盖
- if/else 语句的所有分支
- switch 语句的所有 case
- 三元运算符的所有条件

### 边界值测试
- 数组边界（空数组、单元素）
- 数值边界（0、最大值、最小值）
- 字符串边界（空字符串、最大长度）

### 错误处理测试
- 网络请求失败
- 无效输入参数
- 权限不足异常
- 超时处理

## 模拟和存根

### HTTP 请求模拟
```typescript
// 使用 MSW 模拟 API
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'Test User' }]));
  })
);
```

### 函数模拟
```typescript
// Jest 模拟
jest.mock('./utils', () => ({
  generateId: jest.fn(() => 'mock-id'),
  deepMerge: jest.fn((a, b) => ({ ...a, ...b })),
}));
```

### 模块模拟
```typescript
// Vitest 模拟
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

## 配置文件生成

### Jest 配置
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Vitest 配置
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 最佳实践

1. **测试命名** - 使用描述性的测试名称
2. **AAA 模式** - Arrange（准备）、Act（执行）、Assert（验证）
3. **独立性** - 每个测试应该独立运行
4. **可重复性** - 测试结果应该一致
5. **快速执行** - 避免慢速测试和外部依赖

## 集成步骤

1. **选择目标** - 指定要测试的文件或目录
2. **配置框架** - 选择测试框架和配置
3. **生成测试** - 运行 skill 生成测试代码
4. **安装依赖** - 安装测试框架和工具
5. **运行测试** - 执行测试并查看覆盖率
6. **完善测试** - 根据需要调整测试用例
