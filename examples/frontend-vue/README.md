# ZHJ SDK Vue Frontend Example

这是一个使用 ZHJ SDK 的 Vue 3 前端示例应用，展示了 SDK 的各种功能和最佳实践。

## 🚀 功能特性

### HTTP 客户端功能
- ✅ **类型安全的 HTTP 请求** - 完整的 TypeScript 泛型支持
- ✅ **智能缓存** - 自动缓存 GET 请求，减少网络开销
- ✅ **请求去重** - 防止重复的并发请求
- ✅ **自动重试** - 指数退避重试机制
- ✅ **请求取消** - 支持 AbortController
- ✅ **响应验证** - 自动验证响应数据格式
- ✅ **指标收集** - 实时监控请求性能
- ✅ **拦截器** - 请求/响应/错误拦截器

### UI 功能
- 用户管理（创建、查看、删除）
- 实时请求指标显示
- 缓存和拦截器管理
- 错误处理和状态显示

## 🛠️ 技术栈

- **Vue 3** - 用户界面框架（Composition API）
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **ZHJ SDK** - HTTP 客户端库

## 📦 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build:example

# 预览生产版本
pnpm preview
```

应用将在 http://localhost:3000 启动

## 🏗️ 项目结构

```
src/
├── main.ts           # 应用入口
├── App.vue           # 主应用组件
├── style.css         # 全局样式
└── vite-env.d.ts     # Vite 类型声明
```

## 💡 使用示例

### 基本用法

```vue
<script setup lang="ts">
import { createHttpClient } from '@zhj-sdk/client'

// 创建 HTTP 客户端
const httpClient = createHttpClient({
  baseUrl: '/api',
  timeout: 10000,
  cacheConfig: {
    enabled: true,
    ttl: 60000,
  },
})

// 类型安全的请求
interface User {
  id: number
  name: string
  email: string
}

const users = await httpClient.get<User[]>('/users')
</script>
```

### 高级功能

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createHttpClient, type Metrics } from '@zhj-sdk/client'

const metrics = ref<Metrics[]>([])

// 设置指标收集
httpClient.setMetricsCollector((metric: Metrics) => {
  metrics.value = [...metrics.value.slice(-9), metric]
})

// 添加响应验证器
httpClient.addResponseValidator<User[]>((data) => {
  return Array.isArray(data)
})

// 请求去重
const response = await httpClient.get('/users', undefined, {
  deduplicate: true,
})
</script>
```

## 🧪 测试功能

### 1. 基本操作
- 创建新用户
- 查看用户列表
- 删除用户

### 2. 性能监控
- 查看请求耗时
- 监控成功率和重试次数
- 观察缓存命中情况

### 3. 功能测试
- 清除缓存
- 清除拦截器
- 测试错误处理

## 📊 界面说明

### 指标面板
显示最近 10 个请求的详细信息：
- 请求耗时
- HTTP 状态码
- 成功/失败状态
- 重试次数

### 用户管理
- **创建用户**: 输入姓名和邮箱创建新用户
- **用户列表**: 显示所有用户，支持删除操作
- **刷新**: 重新获取用户列表

### 管理功能
- **清除缓存**: 清空所有缓存数据
- **清除拦截器**: 移除所有拦截器
- **状态信息**: 显示缓存大小、拦截器数量等

## 🔧 开发提示

### 环境变量
创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 代理配置
Vite 配置了代理，将 `/api` 请求转发到后端服务器：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### 类型定义
应用使用了完整的 TypeScript 类型定义：

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserRequest {
  name: string
  email: string
}

interface CreateUserResponse {
  id: number
  name: string
  email: string
  createdAt: string
}
```

## 🎨 Vue 3 特性

### Composition API
使用 Vue 3 的 Composition API 和 `<script setup>` 语法：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const users = ref<User[]>([])
const loading = ref(false)

// 生命周期钩子
onMounted(() => {
  fetchUsers()
})
</script>
```

### 响应式绑定
使用 Vue 的响应式系统自动更新 UI：

```vue
<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">
      {{ user.name }} ({{ user.email }})
    </li>
  </ul>
</template>
```

## 🚨 注意事项

- 确保后端服务在 http://localhost:3001 运行
- 示例应用使用内存存储，刷新页面数据会丢失
- 某些请求可能会随机失败（用于测试重试机制）
- 缓存数据会在 1 分钟后过期

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例应用！
