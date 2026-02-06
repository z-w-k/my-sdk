// vitest.config.ts (在项目根目录)
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,          // 启用全局的 test, expect, describe 等
    environment: 'node',    // Node.js 环境
    // 移除 setupFiles 引用，因为各个包有自己的配置
    
    // 代码覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/'
      ]
    },
    
    // 别名配置（支持 Monorepo 内的包引用）
    alias: {
      '@zhj-sdk/utils': resolve(__dirname, 'packages/utils/src'),
      '@zhj-sdk/core': resolve(__dirname, 'packages/core/src'),
      '@zhj-sdk/client': resolve(__dirname, 'packages/client/src'),
      '@': resolve(__dirname, 'src')
    }
  }
});