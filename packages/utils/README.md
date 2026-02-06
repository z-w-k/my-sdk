# @zhj-sdk/utils

常用操作的工具函数库，提供对象操作、异步控制、ID生成、函数防抖节流等功能。

## 安装

```bash
npm install @zhj-sdk/utils
# 或
yarn add @zhj-sdk/utils
# 或
pnpm add @zhj-sdk/utils
```

## 使用

```typescript
import { 
  isObject, 
  deepMerge, 
  sleep, 
  generateId, 
  debounce, 
  throttle 
} from '@zhj-sdk/utils';

// 对象操作
const obj = { a: 1, b: { c: 2 } };
const merged = deepMerge(obj, { b: { d: 3 }, e: 4 });

// 异步控制
await sleep(1000);

// ID 生成
const id = generateId();

// 函数防抖节流
const debouncedFn = debounce(() => console.log('搜索'), 300);
const throttledFn = throttle(() => console.log('滚动'), 100);
```

## API

### isObject(value)

检查值是否为对象类型（排除 null 和数组）。

**参数**
- `value: unknown` - 要检查的值

**返回值**
- `boolean` - 是否为对象类型

### deepMerge(target, ...sources)

深度合并多个对象。

**参数**
- `target: T` - 目标对象
- `...sources: Partial<Record<string, unknown>>[]` - 源对象列表

**返回值**
- `T` - 合并后的目标对象

### sleep(ms)

异步延时函数。

**参数**
- `ms: number` - 延时毫秒数

**返回值**
- `Promise<void>` - 延时完成的 Promise

### generateId()

生成随机 ID。

**返回值**
- `string` - 9 位随机字符串

### debounce(fn, delay)

函数防抖。

**参数**
- `fn: T` - 要防抖的函数
- `delay: number` - 防抖延时（毫秒）

**返回值**
- `(...args: Parameters<T>) => void` - 防抖后的函数

### throttle(fn, limit)

函数节流。

**参数**
- `fn: T` - 要节流的函数
- `limit: number` - 节流时间间隔（毫秒）

**返回值**
- `(...args: Parameters<T>) => void` - 节流后的函数

## 许可证

MIT
