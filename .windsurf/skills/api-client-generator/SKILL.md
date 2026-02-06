---
name: api-client-generator
description: 基于 OpenAPI 规范自动生成 API 客户端代码和类型定义
---

# API 客户端生成器

基于 OpenAPI 规范自动生成 API 客户端代码，包含类型定义、接口方法和完整的错误处理。

## 步骤

1. **获取 OpenAPI 规范**：
   - 支持 JSON/YAML 格式的 OpenAPI 3.0 规范文件
   - 可以是本地文件或远程 URL
   - 验证规范格式的有效性

2. **分析 API 结构**：
   - 解析路径、方法、参数
   - 提取数据模型和类型定义
   - 识别认证方式和安全配置

3. **生成客户端代码**：
   - 创建符合项目结构的客户端类
   - 生成 TypeScript 类型定义
   - 实现所有 API 端点方法
   - 添加请求/响应拦截器

4. **生成辅助文件**：
   - 创建配置文件
   - 生成示例代码
   - 添加单元测试模板
   - 创建使用文档

## 生成的文件结构

```
packages/client/src/generated/
├── api/
│   ├── index.ts              # 主入口
│   ├── client.ts             # API 客户端类
│   ├── config.ts             # 配置接口
│   └── types/                # 类型定义
│       ├── index.ts
│       ├── common.ts         # 通用类型
│       ├── requests.ts       # 请求类型
│       └── responses.ts      # 响应类型
├── endpoints/                # API 端点分组
│   ├── auth.ts
│   ├── users.ts
│   └── ...
└── tests/                    # 测试文件
    ├── client.test.ts
    └── endpoints.test.ts
```

## 使用示例

### 基础生成
```
OpenAPI 规范: https://api.example.com/openapi.json
包名: api-client
客户端类名: ExampleApiClient
```

### 带认证的生成
```
OpenAPI 规范: ./specs/api.yaml
包名: auth-client
认证方式: Bearer Token
基础 URL: https://auth.example.com
```

## 生成的代码特性

### 客户端类
- 基于 `@zhj-sdk/client` 构建
- 支持多种认证方式（Bearer Token, API Key, OAuth）
- 自动错误处理和重试机制
- 请求/响应拦截器支持

### 类型定义
- 完整的 TypeScript 类型支持
- 请求参数和响应数据类型
- 枚举和联合类型
- JSDoc 注释和示例

### API 方法
- 每个端点对应一个方法
- 参数验证和类型检查
- 可选参数和默认值
- 异步/等待支持

## 配置选项

### 基础配置
- **客户端名称** - 生成的客户端类名
- **基础 URL** - API 服务器地址
- **超时设置** - 请求超时时间
- **重试配置** - 失败重试策略

### 高级配置
- **认证方式** - Bearer Token, API Key, Basic Auth
- **拦截器** - 请求/响应处理逻辑
- **缓存策略** - 响应缓存配置
- **日志级别** - 调试信息输出

## 生成的代码示例

### 客户端类
```typescript
export class ExampleApiClient {
  constructor(config: ApiClientConfig) {
    this.httpClient = createHttpClient({
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      // ... 其他配置
    });
  }

  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    return this.httpClient.get('/users', { params });
  }

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return this.httpClient.post('/users', data);
  }
}
```

### 类型定义
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}
```

## 集成步骤

1. **生成代码** - 运行 skill 生成客户端代码
2. **安装依赖** - `pnpm install` 安装所需依赖
3. **配置客户端** - 根据需要调整配置
4. **编写测试** - 运行生成的测试模板
5. **使用客户端** - 在项目中导入使用

## 支持的 OpenAPI 特性

- ✅ 路径参数和查询参数
- ✅ 请求体和响应体
- ✅ 多种数据类型
- ✅ 认证和安全配置
- ✅ 分页和过滤
- ✅ 错误响应定义
- ⚠️ WebSocket 支持（计划中）
- ⚠️ 文件上传（计划中）

## 最佳实践

- 为不同的 API 服务创建独立的客户端
- 使用环境变量管理配置信息
- 定期更新客户端以匹配 API 变更
- 编写完整的单元测试覆盖
