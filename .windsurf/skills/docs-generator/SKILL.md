---
name: docs-generator
description: 自动生成项目文档，包含 API 文档、使用指南和示例代码
---

# 文档生成器

自动生成项目文档，支持多种文档格式，包含 API 文档、使用指南、示例代码和教程。

## 步骤

1. **分析项目结构**：
   - 扫描源代码文件
   - 提取类型定义和接口
   - 识别公共 API 和导出
   - 分析依赖关系

2. **提取文档信息**：
   - 解析 JSDoc 注释
   - 提取函数签名和参数
   - 识别类和方法定义
   - 收集使用示例

3. **生成文档内容**：
   - API 参考文档
   - 快速开始指南
   - 使用示例和教程
   - 配置说明

4. **生成文档文件**：
   - Markdown 文档
   - HTML 静态站点
   - PDF 文档（可选）
   - 在线文档站点

## 支持的文档格式

### Markdown
- GitHub 风格的 Markdown
- 代码高亮和语法标记
- 表格和列表支持
- 链接和图片引用

### HTML 静态站点
- 响应式设计
- 搜索功能
- 导航菜单
- 主题定制

### VuePress/Docusaurus
- 现代文档框架
- 组件化页面
- 插件生态
- SEO 优化

## 生成的文档结构

```
docs/
├── README.md               # 项目主文档
├── getting-started.md      # 快速开始
├── api/                    # API 文档
│   ├── core.md            # Core 包 API
│   ├── client.md          # Client 包 API
│   └── agents.md          # Agents 包 API
├── guides/                 # 使用指南
│   ├── installation.md    # 安装指南
│   ├── configuration.md   # 配置说明
│   └── best-practices.md  # 最佳实践
├── examples/               # 示例代码
│   ├── basic-usage.md     # 基础用法
│   ├── advanced-features.md # 高级功能
│   └── integrations.md    # 集成示例
└── tutorials/              # 教程
    ├── getting-started.md # 入门教程
    ├── building-clients.md # 客户端构建
    └── testing.md         # 测试指南
```

## 使用示例

### 基础文档生成
```
目标包: @zhj-sdk/core
文档格式: Markdown
包含内容: API 文档 + 使用指南
输出目录: docs/
```

### 完整文档站点
```
目标包: 所有包
文档格式: VuePress
包含内容: API + 指南 + 示例 + 教程
主题: 默认主题
部署: GitHub Pages
```

### API 专项文档
```
目标包: @zhj-sdk/client
文档格式: HTML
包含内容: 仅 API 文档
样式: 技术文档风格
搜索: 启用
```

## 生成的文档类型

### API 参考文档
```markdown
# @zhj-sdk/core API 参考

## 函数

### deepMerge<T>(target, ...sources)

深度合并多个对象。

**参数**
- `target: T` - 目标对象
- `...sources: Partial<Record<string, unknown>>[]` - 源对象列表

**返回值**
- `T` - 合并后的目标对象

**示例**
```typescript
const result = deepMerge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 }, e: 4 }
);
// 结果: { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

### sleep(ms)

异步延时函数。

**参数**
- `ms: number` - 延时毫秒数

**返回值**
- `Promise<void>` - 延时完成的 Promise

**示例**
```typescript
async function fetchData() {
  console.log('开始请求');
  await sleep(1000);
  console.log('1秒后执行');
}
```
```

### 快速开始指南
```markdown
# 快速开始

## 安装

使用 npm、yarn 或 pnpm 安装：

```bash
npm install @zhj-sdk/core
# 或
yarn add @zhj-sdk/core
# 或
pnpm add @zhj-sdk/core
```

## 基础用法

```typescript
import { deepMerge, sleep, generateId } from '@zhj-sdk/core';

// 深度合并对象
const config = deepMerge(
  { api: { timeout: 5000 } },
  { api: { retries: 3 } }
);

// 生成随机 ID
const id = generateId();

// 异步延时
await sleep(1000);
```

## 下一步

- 查看 [API 参考](./api/core.md) 了解所有可用功能
- 阅读 [使用指南](./guides/configuration.md) 进行高级配置
- 浏览 [示例代码](./examples/) 获取更多用法
```

### 使用指南
```markdown
# 配置指南

## HttpClient 配置

### 基础配置

```typescript
import { createHttpClient } from '@zhj-sdk/client';

const httpClient = createHttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
});
```

### 缓存配置

```typescript
const httpClient = createHttpClient({
  baseUrl: 'https://api.example.com',
  cacheConfig: {
    enabled: true,
    ttl: 60000, // 1分钟缓存
    maxEntries: 100,
  },
});
```

## 最佳实践

1. **环境变量管理**
   ```typescript
   const httpClient = createHttpClient({
     baseUrl: process.env.API_BASE_URL,
     timeout: parseInt(process.env.API_TIMEOUT || '10000'),
   });
   ```

2. **错误处理**
   ```typescript
   try {
     const response = await httpClient.get('/users');
     console.log(response.data);
   } catch (error) {
     console.error('请求失败:', error.message);
   }
   ```

3. **请求拦截器**
   ```typescript
   httpClient.addRequestInterceptor((config) => {
     config.headers.Authorization = `Bearer ${getToken()}`;
     return config;
   });
   ```
```

## 文档生成配置

### 基础配置
```typescript
{
  "input": "packages/*/src",
  "output": "docs",
  "format": "markdown",
  "includePrivate": false,
  "includeInternal": false,
  "examples": true,
  "toc": true
}
```

### 高级配置
```typescript
{
  "input": ["packages/core/src", "packages/client/src"],
  "output": "docs",
  "format": "vuepress",
  "theme": "default",
  "plugins": [
    "search",
    "edit-link",
    "code-copy"
  ],
  "sidebar": "auto",
  "repo": "https://github.com/your-org/your-repo",
  "editLinkText": "在 GitHub 上编辑此页"
}
```

## JSDoc 注释规范

为了生成高质量的文档，请遵循 JSDoc 注释规范：

### 函数注释
```typescript
/**
 * 深度合并多个对象
 * 
 * 递归地将源对象的属性合并到目标对象中，相同属性时后面的对象会覆盖前面的
 * 
 * @template T - 目标对象类型
 * @param target - 目标对象
 * @param sources - 源对象列表
 * @returns 合并后的目标对象
 * 
 * @example
 * ```typescript
 * const result = deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * );
 * // 结果: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<Record<string, unknown>>[]
): T
```

### 类注释
```typescript
/**
 * HTTP 客户端类
 * 
 * 提供统一的 HTTP 请求接口，支持请求拦截、响应处理、错误重试等功能
 * 
 * @example
 * ```typescript
 * const client = new HttpClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 10000
 * });
 * 
 * const response = await client.get('/users');
 * ```
 */
export class HttpClient {
  // ...
}
```

## 自动化集成

### CI/CD 集成
```yaml
# .github/workflows/docs.yml
name: Generate Docs

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Generate documentation
        run: pnpm docs:generate
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/dist
```

### Git Hooks 集成
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && pnpm docs:check",
      "pre-push": "pnpm docs:generate"
    }
  },
  "lint-staged": {
   "*.{ts,js}": ["eslint --fix", "git add"]
  }
}
```

## 文档主题定制

### 自定义样式
```css
/* docs/styles/custom.css */
:root {
  --primary-color: #4f46e5;
  --secondary-color: #7c3aed;
  --text-color: #1f2937;
  --bg-color: #ffffff;
}

.api-docs {
  font-family: 'Inter', sans-serif;
}

.code-block {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 组件扩展
```vue
<!-- docs/components/ApiExample.vue -->
<template>
  <div class="api-example">
    <h4>{{ title }}</h4>
    <div class="example-content">
      <slot></slot>
    </div>
    <div class="example-result">
      <slot name="result"></slot>
    </div>
  </div>
</template>
```

## 最佳实践

1. **保持文档同步** - 代码变更时及时更新文档
2. **提供真实示例** - 使用可运行的示例代码
3. **结构化内容** - 使用清晰的层次结构
4. **多格式支持** - 同时支持在线和离线阅读
5. **版本管理** - 为不同版本提供独立文档

## 集成步骤

1. **配置生成器** - 设置输入源和输出格式
2. **运行生成** - 执行文档生成命令
3. **调整样式** - 根据需要定制主题
4. **部署发布** - 配置自动化部署
5. **维护更新** - 建立文档更新流程
