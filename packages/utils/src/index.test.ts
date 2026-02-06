import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isObject, deepMerge, sleep, generateId, debounce, throttle } from './index';

describe('isObject', () => {
  it('应该正确识别对象', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('应该排除数组', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('应该排除 null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('应该排除基本类型', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('deepMerge', () => {
  it('应该深度合并两个对象', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    
    const result = deepMerge(target, source);
    
    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4
    });
  });

  it('应该处理多个源对象', () => {
    const target = { a: 1 };
    const source1 = { b: 2 };
    const source2 = { c: 3 };
    
    const result = deepMerge(target, source1, source2);
    
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('应该处理空对象', () => {
    expect(deepMerge({}, {})).toEqual({});
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    expect(deepMerge({}, { b: 2 })).toEqual({ b: 2 });
  });

  it('应该覆盖基本类型属性', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    
    const result = deepMerge(target, source);
    
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该在指定时间后解析', async () => {
    const promise = sleep(1000);
    
    // 快进时间
    vi.advanceTimersByTime(1000);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('应该支持 0 延时', async () => {
    const promise = sleep(0);
    
    // 快进时间（即使是 0 延时也需要触发）
    vi.advanceTimersByTime(0);
    
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('generateId', () => {
  it('应该生成指定长度的随机字符串', () => {
    const id = generateId();
    expect(id).toHaveLength(9);
    expect(typeof id).toBe('string');
  });

  it('每次生成的 ID 应该不同', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
  });

  it('应该只包含字母数字字符', () => {
    const id = generateId();
    expect(/^[a-z0-9]+$/i.test(id)).toBe(true);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该在延时后执行函数', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该取消之前的调用', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该传递参数', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该在限制时间内只执行一次', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn();
    throttledFn();
    throttledFn();
    
    expect(fn).toHaveBeenCalledTimes(1);
    
    vi.advanceTimersByTime(100);
    throttledFn();
    
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该在限制时间后允许再次执行', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
    
    vi.advanceTimersByTime(100);
    throttledFn();
    
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该传递参数', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn('arg1', 'arg2');
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
