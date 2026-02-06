/**
 * ZHJ SDK Utils - 工具函数库
 * 
 * 提供常用的工具函数，包括：
 * - 类型检查和对象操作
 * - 深度合并和配置管理
 * - 异步控制和延时函数
 * - ID 生成和随机数
 * - 函数防抖和节流
 * 
 * @author ZHJ SDK Team
 * @version 1.0.0
 */

/**
 * 检查值是否为对象类型
 * 
 * 排除 null 和数组，只接受纯对象
 * 
 * @param value - 要检查的值
 * @returns 是否为对象类型
 * 
 * @example
 * ```typescript
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 * isObject('string') // false
 * ```
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        // 如果目标对象没有该属性，初始化为空对象
        if (!target[key]) Object.assign(target, { [key]: {} });
        // 递归合并嵌套对象
        deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      } else {
        // 直接赋值基本类型和数组
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 异步延时函数
 * 
 * 用于在异步操作中添加延时，常用于重试、动画、节流等场景
 * 
 * @param ms - 延时毫秒数
 * @returns Promise<void> - 延时完成的 Promise
 * 
 * @example
 * ```typescript
 * async function fetchData() {
 *   console.log('开始请求');
 *   await sleep(1000); // 等待 1 秒
 *   console.log('1秒后执行');
 * }
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成随机 ID
 * 
 * 使用 Math.random() 生成 9 位随机字符串，适用于临时 ID、键名等场景
 * 
 * @returns string - 随机 ID 字符串
 * 
 * @example
 * ```typescript
 * const id = generateId(); // "a1b2c3d4e"
 * const tempKey = `temp_${generateId()}`;
 * ```
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * 函数防抖
 * 
 * 在指定时间内多次调用只执行最后一次，适用于搜索输入、窗口调整等场景
 * 
 * @template T - 函数类型
 * @param fn - 要防抖的函数
 * @param delay - 防抖延时（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('搜索:', query);
 * }, 300);
 * 
 * // 快速输入多次，只执行最后一次
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // 只有这次会执行
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId); // 清除之前的定时器
    timeoutId = setTimeout(() => fn(...args), delay); // 设置新的定时器
  };
}

/**
 * 函数节流
 * 
 * 在指定时间内只执行一次，适用于滚动事件、鼠标移动等高频事件
 * 
 * @template T - 函数类型
 * @param fn - 要节流的函数
 * @param limit - 节流时间间隔（毫秒）
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('滚动位置:', window.scrollY);
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * // 快速滚动时，每 100ms 最多执行一次
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args); // 执行函数
      inThrottle = true; // 标记为节流中
      setTimeout(() => (inThrottle = false), limit); // 指定时间后解除节流
    }
  };
}
