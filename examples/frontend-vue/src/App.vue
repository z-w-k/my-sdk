<template>
  <div class="container">
    <h1>ZHJ SDK Vue Example</h1>
    
    <!-- 指标显示 -->
    <div class="card">
      <h2>Request Metrics</h2>
      <div class="metrics">
        <div v-if="metrics.length === 0">
          <p>No metrics yet</p>
        </div>
        <div v-else>
          <div v-for="(metric, index) in metrics" :key="index" style="margin-bottom: 0.5em; color: #000;">
            <strong>Request #{{ index + 1 }}:</strong> {{ metric.requestDuration }}ms, 
            Status: {{ metric.statusCode }}, 
            Success: {{ metric.success ? '✅' : '❌' }},
            Retries: {{ metric.retryCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- 创建用户表单 -->
    <div class="card">
      <h2>Create User</h2>
      <form @submit="createUser">
        <div style="margin-bottom: 1em;">
          <input
            v-model="newUser.name"
            type="text"
            placeholder="Name"
            style="margin-right: 1em; padding: 0.5em;"
          />
          <input
            v-model="newUser.email"
            type="email"
            placeholder="Email"
            style="margin-right: 1em; padding: 0.5em;"
          />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 用户列表 -->
    <div class="card">
      <h2>Users ({{ users.length }})</h2>
      <button @click="fetchUsers" :disabled="loading" style="margin-bottom: 1em;">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
      
      <div v-if="users.length === 0">
        <p>No users found</p>
      </div>
      <ul v-else style="list-style: none; padding: 0;">
        <li 
          v-for="user in users" 
          :key="user.id" 
          style="display: flex; justify-content: space-between; align-items: center; padding: 0.5em; border-bottom: 1px solid #eee;"
        >
          <div>
            <strong>{{ user.name }}</strong> ({{ user.email }})
          </div>
          <button 
            @click="deleteUser(user.id)"
            :disabled="loading"
            style="background-color: #dc3545;"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>

    <!-- 管理功能 -->
    <div class="card">
      <h2>Management</h2>
      <button @click="clearCache" style="margin-right: 1em;">
        Clear Cache
      </button>
      <button @click="clearInterceptors">
        Clear Interceptors
      </button>
      <div style="margin-top: 1em;">
        <small>
          Cache Size: {{ httpClient.getCacheSize?.() || 'Unknown' }} | 
          Interceptors: {{ JSON.stringify(httpClient.getInterceptorCounts?.() || {}) }} |
          Validators: {{ httpClient.getValidatorCount?.() || 'Unknown' }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createHttpClient, type Metrics } from '@zhj-sdk/client'

// 定义类型
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

// 响应式数据
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const metrics = ref<Metrics[]>([])
const newUser = ref({ name: '', email: '' })

// 创建 HTTP 客户端
const httpClient = createHttpClient({
  baseUrl: '/api',
  timeout: 10000,
  cacheConfig: {
    enabled: true,
    ttl: 60000, // 1分钟缓存
    maxEntries: 100,
  },
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
})

// 设置指标收集器
httpClient.setMetricsCollector((metric: Metrics) => {
  metrics.value = [...metrics.value.slice(-9), metric] // 保留最近10条
})

// HttpClient 现在自动处理后端的 ApiResponse 格式，无需额外拦截器
httpClient.addResponseInterceptor(response=>{
  return response
})

// 添加响应验证器
// httpClient.addResponseValidator<User[]>((data) => {
//   debugger
//   return Array.isArray(data)
// })

// httpClient.addResponseValidator<CreateUserResponse>((data) => {
//   debugger
//   return data && typeof data.id === 'number' && typeof data.name === 'string'
// })

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await httpClient.get<User[]>('/users', undefined, {
      deduplicate: true,
    })
    users.value = response.data
  } catch (err) {
    debugger
    error.value = err instanceof Error ? err.message : 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// 创建新用户
const createUser = async (e: Event) => {
  e.preventDefault()
  if (!newUser.value.name || !newUser.value.email) return

  loading.value = true
  error.value = null

  try {
    await httpClient.post<CreateUserResponse, CreateUserRequest>(
      '/users',
      newUser.value
    )
    
    // 刷新用户列表
    await fetchUsers()
    newUser.value = { name: '', email: '' }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create user'
  } finally {
    loading.value = false
  }
}

// 删除用户
const deleteUser = async (id: number) => {
  loading.value = true
  error.value = null

  try {
    await httpClient.delete(`/users/${id}`)
    await fetchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete user'
  } finally {
    loading.value = false
  }
}

// 清除缓存
const clearCache = () => {
  httpClient.clearCache()
  metrics.value = []
}

// 清除拦截器
const clearInterceptors = () => {
  httpClient.clearInterceptors()
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
})
</script>
