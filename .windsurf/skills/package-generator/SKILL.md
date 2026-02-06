---
name: package-generator
description: 在 monorepo 中创建新包，包含标准结构和配置文件
---

# 包生成器

在 monorepo 中创建新包，包含标准结构、配置文件和正确的工作区设置。

## 步骤

1. **确定包信息**：
   - 包名（将自动添加 `@zhj-sdk/` 前缀）
   - 包描述
   - 包目录名（不包含 @zhj-sdk/ 前缀）

2. **创建包目录** 在 `packages/[package-name]/`

3. **创建 package.json** 包含：
   - 正确的包名（`@zhj-sdk/[package-name]`）
   - 版本 0.1.0
   - 包描述
   - 主入口点（`dist/index.js`）
   - 模块入口点（`dist/index.mjs`）
   - 类型定义入口点（`dist/index.d.ts`）
   - 脚本命令（build, dev, test, lint）
   - 根据需要添加 `@zhj-sdk/core` 依赖
   - TypeScript 和构建工具的开发依赖(根目录已有 typeScript 和构建工具依赖，无需重复添加)

4. **创建 tsconfig.json** 扩展基础配置

5. **创建 tsup.config.ts** 用于构建，包含正确的导出设置

6. **创建 src/index.ts** 作为入口点，包含基本导出

7. **创建 src/index.test.ts** 包含基本测试结构

8. **更新工作区**：
   - 包将被 pnpm workspace 自动链接
   - 无需手动更新 pnpm-workspace.yaml

## 包结构

创建的包将遵循以下结构：

```
packages/[package-name]/
├── src/
│   ├── index.ts          # 入口文件
│   └── index.test.ts     # 基础测试
├── package.json          # 包配置
├── tsconfig.json         # TypeScript 配置
├── tsup.config.ts        # 构建配置
└── README.md             # 包文档
```

## 使用示例

### 基础包
```
包名: utils
描述: 常用操作的工具函数
```

### 依赖 core 的包
```
包名: validator
描述: 数据验证工具
依赖: @zhj-sdk/core
```

## 生成的文件模板

### package.json
- 标准字段：name, version, description, main, module, types
- 构建脚本：build, dev, test, lint
- ESM/CJS 导出配置
- 正确的依赖设置

### tsconfig.json
- 扩展 `../../tsconfig.base.json`
- 正确的包含/排除模式
- 声明文件和输出目录设置

### tsup.config.ts
- 双 CJS/ESM 构建
- TypeScript 声明文件
- 生产环境压缩
- 正确的入口点

### src/index.ts
- 基本导出结构
- 示例函数/类型
- JSDoc 注释

## 集成

创建完成后：
1. 运行 `pnpm install` 链接新包
2. 包已准备好进行开发
3. 可以作为 `@zhj-sdk/[package-name]` 导入
4. 在包目录下使用 `pnpm build` 构建
5. 在包目录下使用 `pnpm test` 测试

## 依赖

- 如果包需要核心工具，自动添加 `@zhj-sdk/core` 作为 peer dependency
- 包含 TypeScript 和构建工具的必要开发依赖
- 为现代打包器配置正确的导出映射
